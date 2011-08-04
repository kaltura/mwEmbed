/**
* Supports the parsing of ads
*/

//Global mw.addKAd manager
mw.addKalturaAds = function( embedPlayer, $uiConf, callback ) {
	embedPlayer.ads = new mw.KAds( embedPlayer, $uiConf, callback );
};

mw.sendBeaconUrl = function( beaconUrl ){
	$j('body').append( 
		$j( '<img />' ).attr({
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
	
	init: function( embedPlayer, $uiConf, callback ){
		var _this = this; 
		this.embedPlayer = embedPlayer;
		this.$notice = $uiConf.find( 'label#noticeMessage' );
		this.$skipBtn = $uiConf.find( 'button#skipBtn' );

		
		var configSet = ['htmlCompanions' , 'flashCompanions' ];
		$.each(this.namedAdTimelineTypes, function( inx, adType ){
			$j.each( _this.adAttributeMap, function( adAttributeName,  displayConfName ){
				// Add all the ad types to the config set: 
				configSet.push( adType + adAttributeName);
			});
			// Add the ad type Url
			configSet.push( adType + 'Url');
		});

		this.adConfig = kWidgetSupport.getPluginConfig(
			embedPlayer,
			$uiConf, 
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
		$j( this.embedPlayer ).bind('KalturaSupport_AdOpportunity', function( event, cuePoint ) {
			_this.loadAd( cuePoint );
		});
	},

	// Load the ad from cue point
	loadAd: function( cuePoint ) {
		var _this = this;
		if( cuePoint.cuePoint.sourceUrl ) {
			mw.AdLoader.load( cuePoint.cuePoint.sourceUrl, function( adConf ){

				var adCuePointConf = {
					duration: ( (cuePoint.cuePoint.endTime - cuePoint.cuePoint.startTime) / 1000 ),
					start: ( ( cuePoint.cuePoint.startTime / 1000 ) + 5 )
				};

				var adsCuePointConf = {
					ads: [
						$j.extend( adConf.ads[0], adCuePointConf )
					],
					skipBtn: {
						'text' : "Skip ad",
						'css' : {
							'right': '5px',
							'bottom' : '5px'
						}
					}
				};

				var adType = _this.getAdTypeFromCuePoint(cuePoint);

				// Add the cue point to Ad Timeline
				mw.addAdToPlayerTimeline( 
					_this.embedPlayer,
					adType,
					adsCuePointConf
				);

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
							},100);

							// Sometimes the duration of the video is zero after switching source
							// So i'm re-setting it to it's old duration
							_this.embedPlayer.duration = oldDuration;
							// Seek to where we did the switch
							_this.embedPlayer.doSeek( seekTime );
						});
					} else {
						restorePlayer();
					}
				};

				// If out ad is preroll/midroll/postroll, disable the player 
				if( adType == 'preroll' || adType == 'midroll' || adType == 'postroll' ){
					// Disable player
					_this.embedPlayer.stopEventPropagation();
					_this.embedPlayer.disableSeekBar();
				} else {
					// in case of overlay do nothing
					doneCallback = function() {};
				}

				// Tell the player to show the Ad
				_this.embedPlayer.adTimeline.display( adType, doneCallback, (cuePoint.cuePoint.duration / 1000) );
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
						$j.extend({}, baseDisplayConf, adConfigSet[ adType ] ) // merge in baseDisplayConf
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
		$j( this.namedAdTimelineTypes ).each( function( na, adType ){
			var adConf = {};

			$j.each( _this.adAttributeMap, function( adAttributeName,  displayConfName ){
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
					addAdCheckLoadDone( adType,  $j.extend({}, adConf, adDisplayConf ) );
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
	},
	// Get Ad Type from Cue Point
	getAdTypeFromCuePoint: function( cuePoint ) {
		//['preroll', 'bumper','overlay', 'midroll', 'postroll']
		var type = null;
		switch (cuePoint.context) {
			case 'pre':
				type = 'preroll';
				break;
			case 'post':
				type = 'postroll';
				break;
			case 'mid':
				// Midroll
				if( cuePoint.cuePoint.adType == 1 ) {
					type = 'midroll';
				}
				// Overlay
				else if ( cuePoint.cuePoint.adType == 2 ) {
					type = 'overlay';
				}
				break;
		}
		return type;
	}
};