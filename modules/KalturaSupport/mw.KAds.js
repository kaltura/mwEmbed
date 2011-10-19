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

mw.KAds = function( embedPlayer, callback) {
	// Create a Player Manager
	return this.init( embedPlayer, callback );
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

	bindPostfix: '.KAds',
	
	init: function( embedPlayer, callback ){
		var _this = this; 

		// Inherit BaseAdPlugin
		mw.inherit( this, new mw.BaseAdPlugin( embedPlayer, callback ) );
		
		_this.embedPlayer = embedPlayer;
		
		$( embedPlayer ).bind( 'onChangeMedia' + _this.bindPostfix, function(){
			_this.destroy();
		});
		_this.destroy();
		
		// setup local pointer: 
		var $uiConf = embedPlayer.$uiConf;
		this.$notice = $uiConf.find( 'label#noticeMessage' );
		this.$skipBtn = $uiConf.find( 'button#skipBtn' );

		// Load the Ads from uiConf
		_this.loadAds( function(){
			mw.log( "KAds::All ads have been loaded" );
			callback();
		});
		
		// We can add this binding here, because we will always have vast in the uiConf when having cue points
		// Catch Ads from adOpportunity event
		$( embedPlayer ).bind('KalturaSupport_AdOpportunity' + _this.bindPostfix, function( event, cuePointWrapper ) {
			_this.loadAd( cuePointWrapper );
		});

	},
	/**
	 * Get ad config
	 * @param name
	 * @return
	 */
	getConfig: function( name ){
		var _this = this;
		if( ! this.config ){
			// Build out the selection of kAds
			var configSet = [ 'preSequence', 'postSequence', 'htmlCompanions' , 'flashCompanions', 'timeout' ];
			$.each( this.namedAdTimelineTypes, function( inx, adType ){
				$.each( _this.adAttributeMap, function( adAttributeName,  displayConfName ){
					// Add all the ad types to the config set: 
					configSet.push( adType + adAttributeName);
				});
				// Add the ad type Url
				configSet.push( adType + 'Url');
			});
			
			this.config = this.embedPlayer.getKalturaConfig( 'vast', configSet );
		}
		return this.config[ name ];
	},
	// Load the ad from cue point
	loadAd: function( cuePointWrapper ) {
		var _this = this;
		var embedPlayer = this.embedPlayer;
		var cuePoint = cuePointWrapper.cuePoint;
		var adType = this.embedPlayer.kCuePoints.getAdSlotType( cuePointWrapper );
		var adDuration = Math.round( cuePoint.duration / 1000);
		// Check if cue point already displayed
		if( $.inArray( cuePoint.id, _this.displayedCuePoints) >= 0 ) {
			return ;
		}
		
		mw.log('kAds::loadAd:: load ' + adType + ', duration: ' + adDuration, cuePoint);

		// Load adTimeline
		if (!_this.embedPlayer.adTimeline) {
			_this.embedPlayer.adTimeline = new mw.AdTimeline( _this.embedPlayer );
		}

		// If ad type is midroll pause the video
		if( adType == 'midroll' ) {
			_this.embedPlayer.pauseLoading();
		}
		
		if( cuePoint.sourceUrl ) {
			mw.AdLoader.load( cuePoint.sourceUrl, function( adConf ){

				var adCuePointConf = {
					duration: ( (cuePoint.endTime - cuePoint.startTime) / 1000 ),
					start: ( cuePoint.startTime / 1000  )
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

				var originalSrc = embedPlayer.getSrc();
				var seekTime = ( parseFloat( cuePoint.startTime / 1000 ) / parseFloat( embedPlayer.duration ) );
				var oldDuration = embedPlayer.duration;

				// Set switch back function
				var doneCallback = function() {
					// continue playback ( if not already playing ) 
					embedPlayer.play();
					// Add cuePoint Id to displayed cuePoints array
					_this.displayedCuePoints.push( cuePoint.id );
					
					var vid = embedPlayer.getPlayerElement();
					// Check if the src does not match original src if
					// so switch back and restore original bindings
					if ( originalSrc != vid.src ) {
						embedPlayer.switchPlaySrc( originalSrc, function() {
							mw.log( "AdTimeline:: restored original src:" + vid.src);
							// Restore embedPlayer native bindings
							// async for iPhone issues
							setTimeout(function(){
								embedPlayer.adTimeline.restorePlayer();
							}, 100 );

							// Sometimes the duration of the video is zero after switching source
							// So i'm re-setting it to it's old duration
							embedPlayer.duration = oldDuration;
							if( adType == 'postroll' ) {
								// Run stop for now.
								setTimeout( function() {
									embedPlayer.stop();
								}, 100);

								mw.log( "AdTimeline:: run video pause ");
								if( vid && vid.pause ){
									// Pause playback state
									vid.pause();
									// iPhone does not catch synchronous pause
									setTimeout( function(){ if( vid && vid.pause ){ vid.pause(); } }, 100 );
								}
							} else {
								$( embedPlayer ).bind('seeked' + _this.bindPostfix, function() {
									embedPlayer.play();
									setTimeout( function() {
										embedPlayer.play();
									}, 250);
								});

								// Seek to where we did the switch
								embedPlayer.doSeek( seekTime );
							}
						});
					} else {
						embedPlayer.adTimeline.restorePlayer();
					}
				};

				// If out ad is preroll/midroll/postroll, disable the player 
				if( adType == 'preroll' || adType == 'midroll' || adType == 'postroll' ){
					_this.embedPlayer.$interface.find( '.play-btn-large' ).remove();
				} else {
					// in case of overlay do nothing
					doneCallback = function() {};
				}

				// Tell the player to show the Ad
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
			if( _this.getConfig( 'timeout' ) ){
				baseDisplayConf[ 'timeout' ] = _this.getConfig('timeout'); 
			}
			// add in a binding for the adType
			for( var adType in adConfigSet ){
				// Add to timeline only if we have ads
				if( adConfigSet[ adType ].ads ) {
					if( adType == 'midroll' ||  adType == 'postroll' || adType =='preroll' ){
						_this.addSequenceProxyBinding( adType, adConfigSet );
					}
					if( adType == 'overlay' ){
						_this.addOverlayBinding( adConfigSet[ adType ] );
					}
				}
			}
			// Run the callabck once all the ads have been loaded. 
			callback();
		});
	},
	addSequenceProxyBinding: function( adType, adConfigSet ){
		var _this = this;
		var baseDisplayConf = this.getBaseDisplayConf();
		$( _this.embedPlayer ).bind( 'AdSupport_' + adType + _this.bindPostfix, function( event, sequenceProxy ){
			// add to sequenceProxy:
			sequenceProxy[ _this.getSequenceIndex( adType ) ] = function( doneCallback ){		
				var adConfig = $.extend( {}, baseDisplayConf, adConfigSet[ adType ] );
				adConfig.type = adType;
				_this.embedPlayer.adTimeline.display( adConfig, function(){
					// Done playing Ad issue sequenceProxy callback: 
					doneCallback();
				});
			};
		});
	},
	addOverlayBinding: function( overlayConfig ){
		var _this = this;
		var embedPlayer = this.embedPlayer;
		var startOvelrayDisplayed = false;
		var lastDisplay = 0;
		var timeout = this.embedPlayer.getKalturaConfig( 'vast', 'timeout' );
		
		// Set overlay to 5 seconds if we can't get overlay info: 
		if( ! timeout )
			timeout = 5;
		overlayConfig.type = 'overlay';
		// Display the overlay 
		var displayOverlay = function(){
			_this.embedPlayer.adTimeline.display( 
				overlayConfig, 
				function(){
					mw.log("KAds::overlay done");
				},
				timeout
			)
		}
		$( embedPlayer ).bind( 'monitorEvent', function(){
			if( embedPlayer.currentTime > overlayConfig.start && !startOvelrayDisplayed){
				lastDisplay = embedPlayer.currentTime;
				startOvelrayDisplayed = true;
				mw.log("KAds::displayOverlay::startOvelrayDisplayed " + startOvelrayDisplayed)
				displayOverlay();
			}
			if( startOvelrayDisplayed && embedPlayer.currentTime > ( lastDisplay + parseInt( overlayConfig.frequency ) )  ){
				// reset the lastDisplay time: 
				mw.log("KAds::displayOverlay::overlayConfig.frequency ct:" +embedPlayer.currentTime + ' > ' + ( lastDisplay + parseInt( overlayConfig.frequency) ) )
				displayOverlay();
				lastDisplay =  embedPlayer.currentTime;
			}
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
				if( _this.getConfig( adType + adAttributeName ) ){
					adConf[ displayConfName ] = _this.getConfig( adType + adAttributeName );
				}
			});

			if( _this.getConfig( adType + 'Url' ) ){
				loadQueueCount++;				
				// Load and parse the adXML into displayConf format
				mw.AdLoader.load( _this.getConfig( adType + 'Url' ) , function( adDisplayConf ){
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
		if( this.getConfig( 'htmlCompanions' ) ){
			addCompanions( 'html',  this.getConfig( 'htmlCompanions' ) );			
		} else if( this.getConfig( 'flashCompanions') ){
			addCompanions( 'flash', this.getConfig( 'flashCompanions') );
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

	destroy: function(){
		$( this.embedPlayer ).unbind( this.bindPostfix );
	}
};

})( window.mw, window.jQuery );