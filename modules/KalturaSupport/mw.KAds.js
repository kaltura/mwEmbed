/**
* Supports the parsing of ads
*/
( function( mw, $ ) {
//Global mw.addKAd manager
mw.addKalturaAds = function( embedPlayer, callback ) {
	embedPlayer.ads = new mw.KAds( embedPlayer, callback );
};

mw.sendBeaconUrl = function( beaconUrl ){
	$('body').append( 
		$( '<img />' ).attr({
			'src' : beaconUrl,
			'width' : 0,
			'height' : 0
		})
	);
};

mw.KAds = function( embedPlayer, $uiConf, callback) {
	// Create a Player Manager
	return this.init( embedPlayer, $uiConf ,callback );
};

mw.KAds.prototype = {
	// The ad types 
	namedAdTimelineTypes : [ 'preroll', 'postroll', 'midroll', 'overlay' ],
	// Ad attribute map 
	adAttributeMap: {
		"Interval": 'frequency',
		"StartAt": 'start'
	},
	displayedCuePoints: [],
	
	init: function( embedPlayer, callback ){
		var _this = this; 
		this.embedPlayer = embedPlayer;
		
		// setup local pointer: 
		var $uiConf = embedPlayer.$uiConf;
		this.$notice = $uiConf.find( 'label#noticeMessage' );
		this.$skipBtn = $uiConf.find( 'button#skipBtn' );

		// Build out the selection of kAds
		var configSet = ['htmlCompanions' , 'flashCompanions' ];
		$.each( this.namedAdTimelineTypes, function( inx, adType ){
			$.each( _this.adAttributeMap, function( adAttributeName,  displayConfName ){
				// Add all the ad types to the config set: 
				configSet.push( adType + adAttributeName);
			});
			// Add the ad type Url
			configSet.push( adType + 'Url');
		});

		this.adConfig = embedPlayer.getKalturaConfig(
			'vast',
			configSet
		);
		
		// Load the Ads from uiConf
		_this.loadAds( function(){
			mw.log( "KAds::All ads have been loaded" );
			callback();
		});

		// We can add this binding here, because we will always have vast in the uiConf when having cue points
		// Catch Ads from adOpportunity event
		$( this.embedPlayer ).bind('KalturaSupport_AdOpportunity', function( event, cuePoint ) {
			_this.loadAd( cuePoint );
		});
	},

	// Load the ad from cue point
	loadAd: function( cuePoint ) {
		
		var _this = this;
		var adType = _this.getAdTypeFromCuePoint( cuePoint );
		
		// Check if cue point already displayed
		if( $.inArray(cuePoint.cuePoint.id, _this.displayedCuePoints) >= 0 ) {
			return ;
		}

		// If ad type is midroll pause the video
		if( adType == 'midroll' ) {
			// Pause the video
			_this.embedPlayer.pause();
		}
		
		if( cuePoint.cuePoint.sourceUrl ) {
			mw.AdLoader.load( cuePoint.cuePoint.sourceUrl, function( adConf ){
				
				var adCuePointConf = {
					duration: ( (cuePoint.cuePoint.endTime - cuePoint.cuePoint.startTime) / 1000 ),
					start: ( cuePoint.cuePoint.startTime / 1000  )
				};

				var adsCuePointConf = {
					ads: [
						$.extend( adConf.ads[0], adCuePointConf )
					],
					skipBtn: {
						'text' : "Skip ad", // TODO i8ln 
						'css' : {
							'right': '5px',
							'bottom' : '5px'
						}
					},
					type: adType
				};

				var originalSrc = _this.embedPlayer.getSrc();
				var seekTime = ( parseFloat( cuePoint.cuePoint.startTime / 1000 ) / parseFloat( _this.embedPlayer.duration ) );
				var oldDuration = _this.embedPlayer.duration;

				// Set restore function
				var restorePlayer = function() {
					_this.embedPlayer.restoreEventPropagation();
					_this.embedPlayer.enableSeekBar();
				};

				// Set switch back function
				var doneCallback = function() {
					// Add cuePoint Id to displayed cuePoints array
					_this.displayedCuePoints.push( cuePoint.cuePoint.id );
					
					var vid = _this.embedPlayer.getPlayerElement();
					// Check if the src does not match original src if
					// so switch back and restore original bindings
					if ( originalSrc != vid.src ) {
						_this.embedPlayer.switchPlaySrc(originalSrc, function() {
							mw.log( "AdTimeline:: restored original src:" + vid.src);
							// Restore embedPlayer native bindings
							// async for iPhone issues
							setTimeout(function(){
								restorePlayer();
							}, 100 );

							// Sometimes the duration of the video is zero after switching source
							// So i'm re-setting it to it's old duration
							_this.embedPlayer.duration = oldDuration;
							if( adType == 'postroll' ) {
								// Run stop for now.
								setTimeout( function() {
									_this.embedPlayer.stop();
								}, 100);

								mw.log( "AdTimeline:: run video pause ");
								if( vid && vid.pause ){
									// Pause playback state
									vid.pause();
									// iPhone does not catch synchronous pause
									setTimeout( function(){ if( vid && vid.pause ){ vid.pause(); } }, 100 );
								}
							} else {
								// Seek to where we did the switch
								_this.embedPlayer.doSeek( seekTime );
								_this.embedPlayer.bind('seeked.ad', function() {
									_this.embedPlayer.play();
								});
							}
						});
					} else {
						restorePlayer();
					}
				};

				// If out ad is preroll/midroll/postroll, disable the player 
				if( adType == 'preroll' || adType == 'midroll' || adType == 'postroll' ){
					_this.embedPlayer.disableSeekBar();

					// Remove big play button if we have one
					if( _this.embedPlayer.$interface ){
						_this.embedPlayer.$interface.find( '.play-btn-large' ).remove();
					}
				} else {
					// in case of overlay do nothing
					doneCallback = function() {};
				}

				// Tell the player to show the Ad
				var adDuration = Math.round(cuePoint.cuePoint.duration / 1000);
				// Load adTimeline
				if (!_this.embedPlayer.adTimeline) {
					_this.embedPlayer.adTimeline = new mw.AdTimeline( _this.embedPlayer );
				}
				_this.embedPlayer.adTimeline.display( adsCuePointConf, doneCallback, adDuration );
			});
		}
	},

	// Load all the ads per the $adConfig
	loadAds: function( callback ){		
		var _this = this;
		// Get companion targets:
		var baseDisplayConf = this.getBaseDisplayConf();
		// Get ad Configuration
		this.getAdConfigSet( function( adConfigSet){
			
			// Get global timeout ( should be per adType ) 
			if( _this.adConfig.timeout ){
				baseDisplayConf[ 'timeout' ] = _this.adConfig.timeout; 
			}
			
			// Merge in the companion targets and add to player timeline: 
			for( var adType in adConfigSet ){
				// Add to timeline only if we have ads
				if( adConfigSet[ adType ].ads ) {
					mw.addAdToPlayerTimeline(
						_this.embedPlayer,
						adType,
						$.extend({}, baseDisplayConf, adConfigSet[ adType ] ) // merge in baseDisplayConf
					);
				}
			};
			// Run the callabck once all the ads have been loaded. 
			callback();
		});
	},
	
	/** 
	 * Get base display configuration:
	 */
	getBaseDisplayConf: function(){
		var config = {	
			'companionTargets' : this.getCompanionTargets()
		};
		// Add notice if present
		if( this.$notice.length ){
			config.notice = {
				'text' : this.$notice.attr('text').replace('{sequenceProxy.timeRemaining}', '$1'),
				'css' : {
					'top': '5px',
					'left' : '5px'
				}
			};
		}
		
		if( this.$skipBtn.length ){
			config.skipBtn = {
				'text' : this.$skipBtn.attr('label'),
				'css' : {
					'right': '5px',
					'bottom' : '5px'
				}
			};
		}
		return config;
	},
	/**
	 * Add ad configuration to timeline targets
	 */
	getAdConfigSet: function( callback ){
		var _this = this;
		
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
		$( this.namedAdTimelineTypes ).each( function( na, adType ){
			var adConf = {};

			$.each( _this.adAttributeMap, function( adAttributeName,  displayConfName ){
				if( _this.adConfig[ adType + adAttributeName ] ){
					adConf[ displayConfName ] =  _this.adConfig[ adType + adAttributeName ];
				}
			});

			if( _this.adConfig[ adType + 'Url' ] ){
				loadQueueCount++;				
				// Load and parse the adXML into displayConf format
				mw.AdLoader.load( _this.adConfig[ adType + 'Url' ] , function( adDisplayConf ){
					mw.log("KalturaAds loaded: " + adType );
					loadQueueCount--;
					addAdCheckLoadDone( adType,  $.extend({}, adConf, adDisplayConf ) );
				});
			} else {
				// No async request
				adConfigSet[ adType ] = adConf;
			}
		});										
		// Check if we have no async requests
		if( loadQueueCount == 0 ){
			callback( adConfigSet );
		}
	},
	// Parse the rather odd ui-conf companion format
	getCompanionTargets: function(){
		var _this = this;
		var companionTargets = [];
		var addCompanions = function( companionType, companionString ){
			var companions = companionString.split(';');
			for( var i=0;i < companions.length ; i++ ){
				if( companions[i] ){
					companionTargets.push( 
						_this.getCompanionObject( companionType, companions[i]  )
					);
				}
			}
		};
		if( this.adConfig.htmlCompanions ) {
			addCompanions( 'html',  this.adConfig.htmlCompanions );			
		} else if( this.adConfig.flashCompanions ){
			addCompanions( 'flash', this.adConfig.flashCompanions );
		}
		return companionTargets;
	},
	getCompanionObject: function( companionType, companionString  ){
		var companionParts = companionString.split(':');
		return {
			'elementid' : companionParts[0],
			'type' :  companionType,
			'width' :  companionParts[1],
			'height' :  companionParts[2]
		};
	}
};

})( mediaWiki, jQuery );