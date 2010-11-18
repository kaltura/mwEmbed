/**
* Supports the parsing and layout of ads format see:
* tests/VAST_Kaltura_Ad_Support.html
*/

//Global mw.addKAd manager
var mwKAdManager = {};
mw.addKalturaAds = function( embedPlayer, $adConfig ) {
	mwKAdManager[ embedPlayer.id ] = new mw.KAds( embedPlayer, $adConfig ) ;
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

mw.KAds = function( embedPlayer,   $adConfig) {
	// Create a Player Manager
	return this.init( embedPlayer, $adConfig );
};

mw.KAds.prototype = {
	
	init: function( embedPlayer, $adConfig ){
		var _this = this; 
		this.embedPlayer = embedPlayer;
		this.$adConfig = $adConfig;		
		// Load the Ads
		_this.loadAds( function(){
			mw.log("All ads have been loaded");
		})			
	},
	
	// Load all the ads per the $adConfig
	loadAds: function( callback ){		
		var _this = this;			
		var loadQueueCount = 0;
		
		// Define "global" companion targets:
		var companionTargets = []; 
		this.$adConfig.find( 'companion ad' ).each(function( inx, node ){			
			companionTargets.push({
				'elementid' : $j(node).attr('elementid'),
				'type' :  $j(node).attr('type'),
				'width' : $j(node).attr('width'),
				'height' : $j(node).attr('height')
			})
		});
		
		// Add timeline events: 
		this.$adConfig.find( 'timeline' ).children().each( function( na, node ){
			var adDisplayConfAttr = [ "nads", "frequency", "start" ];			
			if( $j(node).attr( 'enabled') == 'true' ){
				// Setup the displayConf with a pointer to this adConfig ( for general ad config )
				var displayConf = { 
					'adConfig' : _this.$adConfig,
					'companionTargets' : companionTargets
				};
				
				// Add the ad displayCon attributes to the displayConf
				for( var i =0; i < adDisplayConfAttr.length; i++){
					if( $j(node).attr( adDisplayConfAttr[i] ) ){
						displayConf[ adDisplayConfAttr[i] ] = $j(node).attr( adDisplayConfAttr[i] );
					}
				}				
				if( $j(node).attr('url') ) {
					loadQueueCount++;
					// Load and parse the adXML into displayConf format
					_this.getAdDisplayConf( $j(node).attr('url'), function( adDisplayConf ){
						var timeType = node.nodeName.toLowerCase();
						// Make sure we have a valid callback: 
						if( adDisplayConf ){
							// Add to the player timeline bindings ( hopefully before the user hits 'play' )
							mw.addAdToPlayerTimeline( 
								_this.embedPlayer, 
								timeType,							
								$j.extend( displayConf, adDisplayConf ) // merge in adDisplayConf
							);
						};
						loadQueueCount--;
						if( loadQueueCount == 0 ){
							callback();
						}
					});
				};
			}			
		})
		// Check if no ads had to be "loaded"
		if( loadQueueCount == 0 ){
			callback();
		}
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
	 * 
	 * @@FIXME we should move vast support into its own class / support module
	 */
	
	// Convert the vast ad display format into a display conf:
	getVastAdDisplayConf: function( xmlString ){
		var _this = this;
		var adConf = {};
		var $vast = $j( xmlString );
		// Get the basic set of sequences
		adConf.ads = [];
		$vast.find('ad').each( function( na, node ){	
			mw.log('kAds:: getVastAdDisplayConf: ' + node );
			var adId = $j( node ).attr('id');
			var $ad = $j( node );
			
			// Create the sequence by id ( if not already set )
			if(!adConf.ads[adId] ){
				adConf.ads[adId] = {};
			}
			
			// Set a local pointer to the current sequence: 
			var currentAd = adConf.ads[ adId ];
			
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
				// find the asset url ( image? ) 
				
			});
			
			// Set tracking events: 
			currentAd.trackingEvents = [];
			$ad.find('trackingEvents Tracking').each( function( na, trackingNode ){					
				currentAd.trackingEvents.push({
					'eventName' : $j( trackingNode ).attr('event'),  
					'beaconUrl' : _this.getURLFromNode( trackingNode )
				});
			});
			
			// Setup a bind Player callback which passes the embedPlayer 
			// into the currentAd function scope. 			
			currentAd.bindPlayerEvents = function( videoPlayer ){
				_this.bindVastTrackingEvents( currentAd.trackingEvents, videoPlayer );	
			};
						
			
			// Set the media file:
			$ad.find('MediaFiles MediaFile').each( function( na, mediaFile ){
				//@@NOTE we could check other attributes like delivery="progressive"
				//@@NOTE for now we are only interested in support for iOS / android devices
				// so only h264. ( in the future we could add ogg other delivery methods etc. ) 
				if(  $j( mediaFile ).attr('type') == 'video/h264' ){
					currentAd.videoFile = _this.getURLFromNode( mediaFile );
				}
			});
			
			// Set videoFile to default if not set: 
			if( !adConf.videoFile ){
				currentAd.videoFile = mw.getConfig( 'Kaltura.MissingFlavorVideoUrl' );
			}
			
			// Set the CompanionAds if present: 
			$ad.find('CompanionAds Companion').each( function( na, companionNode ){
				if( !currentAd.companions ) {
					currentAd.companions = [];
				}
				// Build the curentCompanion
				var companionObj = {};
				var companionAttr = [ 'width', 'height', 'id', 'expandedWidth', 'expandedHeight' ];
				$j.each( companionAttr, function(na, attr){
					if( $j( companionNode ).attr( attr ) ){
						companionObj[attr] = $j( companionNode ).attr( attr );
					}
				});
				
				// Check for companion type: 
				if( $j( companionNode ).find( 'StaticResource' ).length ) {
					if( $j( companionNode ).find( 'StaticResource' ).attr('creativeType') ) {						
						companionObj.$html = _this.getStaticResourceHtml( companionNode, companionObj )
						mw.log("kAds:: Set Companing html via StaticResource \n" + $j('<div />').append( companionObj.$html ).html() );
					}											
				}
				
				// Check for iframe type
				if( $j( companionNode ).find('IFrameResource').length ){
					mw.log("kAds:: Set Companing html via IFrameResource \n" + _this.getURLFromNode ( $j( companionNode ).find('IFrameResource') ) );
					companionObj.$html = 
						$j('<iframe />').attr({
							'src' : _this.getURLFromNode ( $j( companionNode ).find('IFrameResource') ),
							'width' : companionObj['width'],
							'height' : companionObj['height']
						});						
				}
				
				// Check for html type
				if( $j( companionNode ).find('HTMLResource').length ){				
					mw.log("kAds:: Set Companing html via HTMLResource \n" + _this.getURLFromNode ( $j( companionNode ).find('HTMLResource') ) );
					// Wrap the HTMLResource in a jQuery call: 
					companionObj.$html = $j( _this.getURLFromNode ( $j( companionNode ).find('HTMLResource') ) );
				}
				// Add the companion to the ad config: 
				currentAd.companions.push( companionObj )
			});
			
		});
		return adConf;
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
											$j( companionNode ).find('CompanionClickThrough') 
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
	 * bindVastEvent per the VAST spec the following events are supported:
	 *   
	 * start, firstQuartile, midpoint, thirdQuartile, complete
	 * pause, rewind, resume, 
	 * 
	 * VAST events not presently supported ( per iOS player limitations ) 
	 * 
	 * mute, creativeView, unmute, fullscreen, expand, collapse, 
	 * acceptInvitation, close
	 * 
	 * @param {object} embedPlayer
	 * @param {string} eventName
	 * @param {object} eventBecon 
	 */	
	bindVastTrackingEvents: function ( trackingEvents, videoPlayer ){
		var _this = this;
		// Only send events once: 
		var sentEvents = {};
		
		// Function to dispatch a beacons:
		var sendBeacon = function( eventName, force ){
			if( sentEvents[ eventName ] && !force ){
				return ;
			} 
			sentEvents[ eventName ] = 1;
			// See if we have any beacons by that name: 
			for(var i =0;i < trackingEvents.length; i++){
				if( eventName == trackingEvents[ i ].eventName ){
					mw.log("kAds:: sendBeacon: " + eventName );
					mw.sendBeaconUrl( trackingEvents[ i ].beaconUrl );
				};
			};			
		};
				
		// On end stop monitor / clear interval: 
		$j( videoPlayer ).bind('ended', function(){			
			sendBeacon( 'complete' );
			clearInterval( monitorInterval );
		})
		
		// On pause / resume: 
		$j( videoPlayer ).bind( 'pause', function(){
			sendBeacon( 'pause' );
		})
		
		// On resume: 
		$j( videoPlayer ).bind( 'play', function(){
			sendBeacon( 'resume' );
		})			
		
		var time = 0;
		// On seek backwards 
		$j( videoPlayer ).bind( 'seek', function(){
			if( videoPlayer.currentTime < time ){
				sendBeacon( 'rewind' );
			}
		});		

		// Set up a monitor for time events: 
		var monitorInterval = setInterval( function(){
			time =  videoPlayer.currentTime;
			dur = videoPlayer.duration;
			
			if( time > 0 )
				sendBeacon( 'start' );
				
			if( time > dur / 4 )
				sendBeacon( 'firstQuartile' );
			
			if( time > dur / 2 )
				sendBeacon( 'midpoint' );
			
			if( time > dur / 1.5 )
				sendBeacon( 'complete' );

		}, mw.getConfig('EmbedPlayer.MonitorRate') );		
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
