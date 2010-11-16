/**
* Supports the parsing and layout of ads format see:
* tests/VAST_Kaltura_Ad_Support.html
*/

//Global mw.addKAd manager
var mwKAdManager = {};
mw.addKalturaAds = function( embedPlayer, $adConfig ) {
	mwKAdManager[ embedPlayer.id ] = new mw.KAds( embedPlayer, $adConfig ) ;
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
		// Add timeline events: 
		this.$adConfig.find( 'timeline' ).children().each( function( na, node ){
			var adDisplayConfAttr = [ "nads", "frequency", "start" ];			
			if( $j(node).attr( 'enabled') == 'true' ){
				// Setup the displayConf with a pointer to this adConfig ( for general ad config )
				var displayConf = { 
					'adConfig' : _this.$adConfig  
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
							)
						};
						loadQueueCount--;
						if( loadQueueCount == 0 ){
							callback();
						}
					});
				} else {
					//@@TODO need to add support for mw.addToPlayerTimeline for non VAST ads^					
				}
			}			
		})
		// Check if no ads had to be "loaded"
		if( loadQueueCount == 0 ){
			callback();
		}
	},
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
		adConf.sequences = [];
		$vast.find('creative').each( function(na, node){
			mw.log('kAds:: getVastAdDisplayConf: ' + node );
			var seqId = $j( node ).attr('sequence');
			var $creative = $j( node );
			// Create the sequence by id ( if not already set )
			if(!adConf.sequences[seqId] ){
				adConf.sequences[seqId] = {};
			}
			// Set a local pointer to the current sequence: 
			var currentSeq = adConf.sequences[ seqId ];
			// Set duration 
			if( $creative.find('duration') ){
				currentSeq.duration = mw.npt2seconds(  $creative.find('duration').text() );
			}
			
			// Set tracking events: 
			$creative.find('trackingEvents Tracking').each(function(na, trackingNode){
				if( ! currentSeq.bindEvents ){
					currentSeq.bindEvents = [];
				}
				currentSeq.bindEvents.push( function( embedPlayer ){		
					_this.bindVastEvent( 
						embedPlayer, 
						$j( trackingNode ).attr('event'),  
						_this.getCdataFromNode( trackingNode ) 
					); 
				});				
			});
			
			// Set the media file:
			$creative.find('MediaFiles MediaFile').each( function( na, mediaFile ){
				//@@NOTE we could check other attributes like delivery="progressive"
				//@@NOTE for now we are only interested in support for iOS / android devices
				// so only h264. ( in the future we could add ogg other delivery methods etc. ) 
				if(  $j( mediaFile ).attr('type') == 'video/h264' ){
					currentSeq.videoFile = _this.getCdataFromNode( mediaFile );
				}
			});
			
			// Set videoFile to default if not set: 
			if( !adConf.videoFile ){
				currentSeq.videoFile = mw.getConfig( 'Kaltura.MissingFlavorVideoUrl' );
			}
			
			// Set the CompanionAds if present: 
			$creative.find('CompanionAds Companion').each( function( na, companionNode ){
				if( !currentSeq.companions ) {
					currentSeq.companions = [];
				}
				// Build the curentCompanion
				var companionObj = {};
				var companionAttr = ['width', 'height', 'id', 'expandedWidth', 'expandedHeight'];
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
					mw.log("kAds:: Set Companing html via IFrameResource \n" + _this.getCdataFromNode ( $j( companionNode ).find('IFrameResource') ) );
					companionObj.$html = 
						$j('<iframe />').attr({
							'src' : _this.getCdataFromNode ( $j( companionNode ).find('IFrameResource') ),
							'width' : companionObj['width'],
							'height' : companionObj['height']
						});						
				}
				// Check for html type
				if( $j( companionNode ).find('HTMLResource').length ){				
					mw.log("kAds:: Set Companing html via HTMLResource \n" + _this.getCdataFromNode ( $j( companionNode ).find('HTMLResource') ) );
					// Wrap the HTMLResource in a jQuery call: 
					companionObj.$html = $j( _this.getCdataFromNode ( $j( companionNode ).find('HTMLResource') ) );
				}
				// Add the companion to the ad config: 
				currentSeq.companions.push( companionObj )
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
		companionObj['resourceUri'] = _this.getCdataFromNode( 
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
					$img.attr('alt', _this.getCdataFromNode( 
							 $j( companionNode ).find('AltText')
						)
					);
				}
				// Add the image to the $companionHtml
				if( $j( companionNode ).find('CompanionClickThrough').html() != '' ){
					$companionHtml = $j('<a />')
						.attr({
							'href' : _this.getCdataFromNode(
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
	 * bindVastEvent
	 * @param {object} embedPlayer
	 * @param {string} eventName
	 * @param {object} eventBecon 
	 */
	bindVastEvent: function( embedPlayer, eventName, eventBecon ) {
		mw.log('kAds :: bindVastEvent :' + eventName + ' becon:' + eventBecon );
		debugger;
		if( eventName == 'start' ){
			
		}
	},
	/**
	 * There does no seem to be a clean way to get CDATA node text via jquery or 
	 * via native browser functions. So here we just strip the CDATA tags and 
	 * return the text value
	 */
	getCdataFromNode: function ( node ){		
		return $j.trim( decodeURIComponent( $j( node ).html() )  )
			.replace( /^\<\!\-?\-?\[CDATA\[/, '' )
			.replace(/\]\]\-?\-?\>/, '');		
	}
}
