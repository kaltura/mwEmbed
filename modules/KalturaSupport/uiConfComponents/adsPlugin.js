/**
* Supports the parsing of ads
*/

// Check for new Embed Player events: 
$j( mw ).bind( 'newEmbedPlayerEvent', function( event, embedPlayer ){

	// Check for KalturaSupport uiConf
	$j( embedPlayer ).bind( 'KalturaSupport.checkUiConf', function( event, $uiConf, callback ){
		
		// Check if the kaltura ad plugin is enabled:
		if( $uiConf.find('Plugin#vast').length ){
			
			// Load the ad plugin components
			mw.load( ["mw.KAds", "mw.MobileAdTimeline"], function(){
				
				// Add the ads to the player: 
				mw.addKalturaAds( embedPlayer,  $uiConf.find('Plugin#vast'), function(){
					
					// Wait until ads are loaded before running callback
					// ( ie we don't want to display the player until ads are ready )
					callback();
				});
			});
		} else {
			// Continue player build out for players without ads
			callback();
		}
	});
});

//Global mw.addKAd manager
mw.addKalturaAds = function( embedPlayer, $adConfig, callback ) {
	embedPlayer.ads = new mw.KAds( embedPlayer, $adConfig, callback );
}

mw.sendBeaconUrl = function( beaconUrl ){
	$j('body').append( 
		$j( '<img />' ).attr({				
			'src' : beaconUrl,
			'width' : 0,
			'height' : 0
		})
	);
}

mw.KAds = function( embedPlayer, $adConfig, callback) {
	// Create a Player Manager
	return this.init( embedPlayer, $adConfig ,callback );
};

mw.KAds.prototype = {
	
	init: function( embedPlayer, $adConfig, callback ){
		var _this = this; 
		this.embedPlayer = embedPlayer;
		this.$adConfig = $adConfig;		
		// Load the Ads
		_this.loadAds( function(){
			mw.log("All ads have been loaded");
			callback();
		})			
	},
	
	// Load all the ads per the $adConfig
	loadAds: function( callback ){		
		var _this = this;
		// Get companion targets:
		var companionTargets = this._getCompanionTargets();
				
		// Get ad Configuration
		this._getAdConfigSet( function( adConfigSet){
			var baseDisplayConf = {
				'adConfig' : _this.$adConfig,
				'companionTargets' : companionTargets
			};
			
			// Get global timeout ( should be per adType ) 
			if( _this.$adConfig.attr('timeout') ){
				baseDisplayConf[ 'timeout' ] = _this.$adConfig.attr( 'timeout' ); 
			}
			
			// Merge in the companion targets and add to player timeline: 
			for( var adType in adConfigSet ){
				mw.addAdToPlayerTimeline(
					_this.embedPlayer, 
					adType,
					$j.extend( baseDisplayConf, adConfigSet[ adType ] ) // merge in baseDisplayConf
				);
			};
			// run the callabck once all the ads have been loaded. 
			callback();
		});
	},
	/**
	 * Add ad configuration to timeline targets
	 */
	_getAdConfigSet: function( callback ){
		var _this = this;
		var namedAdTimelineTypes = [ 'preroll', 'postroll', 'postroll', 'overlay' ];
		// Maps ui-conf ads to named types
		var adAttributeMap = {
				"Interval": 'frequency',
				"StartAt": 'start'
		};
		var adConfigSet = {};
		var loadQueueCount = 0;
		// Add the ad to the ad set and check if loading is done
		var addAdCheckLoadDone = function( adType, adConf ){
			adConfigSet[ adType ] = adConf;
			if( loadQueueCount == 0 ){
				callback( adConfigSet );
			}
		};
		// Add timeline events: 	
		$j(namedAdTimelineTypes).each( function( na, adTypePrefix ){		
			var adConf = {};

			$j.each(adAttributeMap, function( adAttributeName,  displayConfName ){
				if( _this.$adConfig.attr( adTypePrefix + adAttributeName ) ){
					adConf[ displayConfName ] = _this.$adConfig.attr( adTypePrefix + adAttributeName );
				}
			});
			
			if( _this.$adConfig.attr( adTypePrefix + 'Url' ) ){
				loadQueueCount++;
				// Load and parse the adXML into displayConf format
				_this.getAdDisplayConf( _this.$adConfig.attr( adTypePrefix + 'Url' ) , function( adDisplayConf ){
					// Make sure we have a valid callback: 
					if( !adDisplayConf ){
						adDisplayConf = {};
					};
					loadQueueCount--;
					addAdCheckLoadDone( adTypePrefix,  $j.extend( adConf, adDisplayConf ) );
				});
			} else {
				// No async request
				addAdCheckLoadDone( adTypePrefix, adConf )
			}
		});										
		// Check if no ads had to be loaded ( no ads in _this.$adConfig )
		if( loadQueueCount == 0 ){
			callback();
		}
	},
	// Parse the rather odd ui-conf companion format
	_getCompanionTargets: function(){
		var _this = this;
		var companionTargets = [];
		var addCompanions = function( companionType, companionString ){
			var companions = companionString.split(';');
			for( var i=0;i < companions.length ; i++ ){
				companionTargets.push( 
					_this._getCompanionObject( companionType, companions[i]  )
				);
			}
		}
		if( this.$adConfig.attr( 'htmlCompanions' ) ) {
			addCompanions( 'html',  this.$adConfig.attr( 'htmlCompanions' ) );			
		} else if( this.$adConfig.attr( 'flashCompanions' ) ){
			addCompanions( 'flash', this.$adConfig.attr( 'flashCompanions' ) )
		}
		return companionTargets;
	},
	_getCompanionObject: function( companionType, companionString  ){
		var companionParts = companionString.split(':');
		return {
			'elementid' : companionParts[0],
			'type' :  companionType,
			'width' :  companionParts[1],
			'height' :  companionParts[2]
		};
	},
	
	/**
	 * Get ad display configuration object from a url
	 * 
	 * @param {string} adUrl
	 * 		The url which contains the xml ad payload
	 * @param {function} callback
	 * 		Function called with ad payload once ad content is loaded. 
	 */
	getAdDisplayConf: function( adUrl, callback ){
		var _this = this;
		// We use a xml proxy ( passing on the clients ip for geo lookup ) 
		// since the ad server is almost never on the same domain as the api.
		// @@todo also we should explore html5 based cross domain request to avoid the proxy
		var proxyUrl = mw.getConfig( 'Kaltura.XmlProxyUrl' );
		if( !proxyUrl){
			mw.log("Error: mw.KAds : missing kaltura proxy url ( can't load ad ) ");
			return ; 
		}
		$j.getJSON( proxyUrl + '?url=' + encodeURIComponent( adUrl ) + '&callback=?', function( result ){
			var adDisplayConf = {};
			if( result['http_code'] == 'ERROR' || result['http_code'] == 0 ){
				mw.log("Error: loadAdXml error with http response");
				callback(false);
				return ;
			}
			var adFormat = 'unknown'
				
			// Check result['contents']  for "<vast> </vast> tag
			var lowerCaseXml = result['contents'].toLowerCase();
			if( lowerCaseXml.indexOf('<vast') != -1 &&
				lowerCaseXml.indexOf('</vast>')	){
				adFormat = 'vast';
			}
			switch( adFormat ){
				case 'vast':
					callback( _this.getVastAdDisplayConf( result['contents'] ) );
					return ;
				break;
			}					
			mw.log("Error: could not parse adFormat from add content: \n" + result['contents']);
			callback( {} );
		})
	},
	
	/**
	 * VAST support
	 * Convert the vast ad display format into a display conf:
	 */	
	getVastAdDisplayConf: function( xmlString ){
		var _this = this;
		var adConf = {};
		var $vast = $j( xmlString );
		// Get the basic set of sequences
		adConf.ads = [];
		$vast.find( 'ad' ).each( function( inx, node ){
			mw.log('kAds:: getVastAdDisplayConf: ' + node );
			var $ad = $j( node );
			
			// Set a local pointer to the current sequence: 
			var currentAd = {'id' : $j( node ).attr('id') };
			
			// Set duration 
			if( $ad.find('duration') ){
				currentAd.duration = mw.npt2seconds( $ad.find('duration').text() );
			}
			
			// Set impression urls
			currentAd.impressions = [];
			$ad.find( 'Impression' ).each( function(na, node){
				// Check if there is lots of impressions or just one: 
				if( $j(node).find('URL').length ){
					$ad.find('URL').each( function(na, urlNode){
						currentAd.impressions.push({
							'beaconUrl' : _this.getURLFromNode( urlNode ),
							'idtype' : $j( urlNode ).attr('id')
						})
					})
				} else {
					currentAd.impressions.push({
						'beaconUrl' : _this.getURLFromNode( node )
					})
				}
			});
			
			// Set Non Linear Ads
			currentAd.nonLinear = [];
			$ad.find( 'NonLinearAds NonLinear' ).each( function( na, nonLinearNode ){
				var staticResource = _this.getResourceObject( nonLinearNode );				
				if( staticResource ){
					// Add the staticResource to the ad config: 
					currentAd.nonLinear.push( staticResource );
				}
			});			
			
			// Set tracking events: 
			currentAd.trackingEvents = [];
			$ad.find('trackingEvents Tracking').each( function( na, trackingNode ){					
				currentAd.trackingEvents.push({
					'eventName' : $j( trackingNode ).attr('event'),  
					'beaconUrl' : _this.getURLFromNode( trackingNode )
				});
			});					
						
			
			// Set the media file:
			$ad.find('MediaFiles MediaFile').each( function( na, mediaFile ){
				// NOTE we could check other attributes like delivery="progressive"
				// NOTE for now we are only interested in support for iOS / android devices
				// so only h264. ( in the future we could add ogg other delivery methods etc. ) 
				if(  $j( mediaFile ).attr('type') == 'video/h264' ){
					currentAd.videoFile = _this.getURLFromNode( mediaFile );
				}
			});
			
			// Set videoFile to default if not set: 
			if( ! adConf.videoFile ){
				currentAd.videoFile = mw.getConfig( 'Kaltura.MissingFlavorVideoUrl' );
			}
			
			// Set the CompanionAds if present: 
			currentAd.companions = [];
			$ad.find('CompanionAds Companion').each( function( na, companionNode ){				
				var staticResource = _this.getResourceObject( companionNode );				
				if( staticResource ){
					// Add the staticResourceto the ad config: 
					currentAd.companions.push( staticResource )
				}
			});
			
			adConf.ads.push( currentAd );
			
		});
		return adConf;
	},
	
	// Return a static resource object
	getResourceObject: function( resourceNode ){
		var _this = this;
		// Build the curentCompanion
		var resourceObj = {};
		var companionAttr = [ 'width', 'height', 'id', 'expandedWidth', 'expandedHeight' ];
		$j.each( companionAttr, function(na, attr){
			if( $j( resourceNode ).attr( attr ) ){
				resourceObj[ attr ] = $j( resourceNode ).attr( attr );
			}
		});
		
		// Check for companion type: 
		if( $j( resourceNode ).find( 'StaticResource' ).length ) {
			if( $j( resourceNode ).find( 'StaticResource' ).attr('creativeType') ) {						
				resourceObj.$html = _this.getStaticResourceHtml( resourceNode, resourceObj )
				mw.log("kAds::getResourceObject: StaticResource \n" + $j('<div />').append( resourceObj.$html ).html() );
			}											
		}
		
		// Check for iframe type
		if( $j( resourceNode ).find('IFrameResource').length ){
			mw.log("kAds::getResourceObject: IFrameResource \n" + _this.getURLFromNode ( $j( resourceNode ).find('IFrameResource') ) );
			resourceObj.$html = 
				$j('<iframe />').attr({
					'src' : _this.getURLFromNode ( $j( resourceNode ).find('IFrameResource') ),
					'width' : resourceObj['width'],
					'height' : resourceObj['height'],
					'border' : '0px'
				});						
		}
		
		// Check for html type
		if( $j( resourceNode ).find('HTMLResource').length ){				
			mw.log("kAds::getResourceObject:  HTMLResource \n" + _this.getURLFromNode ( $j( resourceNode ).find('HTMLResource') ) );
			// Wrap the HTMLResource in a jQuery call: 
			resourceObj.$html = $j( _this.getURLFromNode ( $j( resourceNode ).find('HTMLResource') ) );
		}
		// if no resource html was built out return false
		if( !resourceObj.$html){
			return false;
		}
		// Export the html to static representation: 
		resourceObj.html = $j('<div />').html( resourceObj.$html ).html();
		
		return resourceObj;
	},
	/**
	 * Get html for a static resource 
	 * @param {Object} 
	 * 		companionNode the xml node to grab companion info from
	 * @param {Object} 
	 * 		companionObj the object which stores parsed companion data 
	 */
	getStaticResourceHtml: function( companionNode, companionObj ){
		var _this = this;
		companionObj['contentType'] = $j( companionNode ).find( 'StaticResource' ).attr('creativeType');
		companionObj['resourceUri'] = _this.getURLFromNode( 
			$j( companionNode ).find( 'StaticResource' ) 
		);		
		
		// Build companionObj html
		$companionHtml = $j('<div />'); 
		switch( companionObj['contentType'] ){
			case 'image/gif':
			case 'image/jpeg':
			case 'image/png':
				var $img = $j('<img />').attr({
					'src' : companionObj['resourceUri']
				})
				.css({
					'width' : companionObj['width'] + 'px', 
					'height' : companionObj['height'] + 'px'
				});
				
				if( $j( companionNode ).find('AltText').html() != '' ){	
					$img.attr('alt', _this.getURLFromNode( 
							 $j( companionNode ).find('AltText')
						)
					);
				}
				// Add the image to the $companionHtml
				if( $j( companionNode ).find('CompanionClickThrough').html() != '' ){
					$companionHtml = $j('<a />')
						.attr({
							'href' : _this.getURLFromNode(
								$j( companionNode ).find('CompanionClickThrough,NonLinearClickThrough').get(0)
							)
						}).append( $img );
				} else {
					$companionHtml = $img;
				}
			break;
			case 'application/x-shockwave-flash':
				var flashObjectId = $j( companionNode ).attr('id') + '_flash';				
				// @@FIXME we have to A) load this via a proxy 
				// and B) use smokescreen.js or equivalent to "try" and render on iPad			
				$companionHtml =  $j('<OBJECT />').attr({
						'classid' : "clsid:D27CDB6E-AE6D-11cf-96B8-444553540000",
						'codebase' : "http://download.macromedia.com/pub/shockwave/cabs/flash/swflash.cab#version=6,0,40,0",
						'WIDTH' : companionObj['width'] ,
						"HEIGHT" :  companionObj['height'],
						"id" : flashObjectId
					})
					.append(
						$j('<PARAM />').attr({
							'NAME' : 'movie',
							'VALUE' : companionObj['resourceUri']
						}),
						$j('<PARAM />').attr({
							'NAME' : 'quality',
							'VALUE' : 'high'
						}),
						$j('<PARAM />').attr({
							'NAME' : 'bgcolor',
							'VALUE' : '#FFFFFF'
						}),
						$j('<EMBED />').attr({
							'href' : companionObj['resourceUri'],
							'quality' : 'high',
							'bgcolor' :  '#FFFFFF',
							'WIDTH' : companionObj['width'],
							'HEIGHT' : companionObj['height'],
							'NAME' : flashObjectId,
							'TYPE' : "application/x-shockwave-flash",
							'PLUGINSPAGE' : "http://www.macromedia.com/go/getflashplayer"
						})
					);
			break;
		}
		return $companionHtml;
	},		
	/**
	 * There does no seem to be a clean way to get CDATA node text via jquery or 
	 * via native browser functions. So here we just strip the CDATA tags and 
	 * return the text value
	 */
	getURLFromNode: function ( node ){
		if( $j( node ).find('URL').length ){
			// use the first url we find: 
			node = $j( node ).find( 'URL' ).get(0);
		}	
		return $j.trim( decodeURIComponent( $j( node ).html() )  )
			.replace( /^\<\!\-?\-?\[CDATA\[/, '' )
			.replace(/\]\]\-?\-?\>/, '');		
	}
}
