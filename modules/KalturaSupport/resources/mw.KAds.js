/**
* Supports the parsing of ads
*/
( function( mw, $ ) { "use strict";

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
	confPrefix: 'vast',
	config:{},

	init: function( embedPlayer, callback ){
		var _this = this;
		// Inherit BaseAdPlugin
		mw.inherit( this, new mw.BaseAdPlugin( embedPlayer, callback ) );

		_this.embedPlayer = embedPlayer;

		// Setup the ad player:
		_this.adPlayer = new mw.KAdPlayer( embedPlayer );

		// Clear any existing bindings:
		_this.destroy();

		$( embedPlayer ).bind( 'onChangeMedia' + _this.bindPostfix, function(){
			_this.destroy();
		});

		if( ! _this.getConfig( 'preSequence' ) ) {
			_this.config[ 'preSequence' ] = 0;
		}
		if( ! _this.getConfig( 'postSequence' ) ) {
			_this.config[ 'postSequence' ] = 0;
		}

		// We can add this binding here, because we will always have vast in the uiConf when having cue points
		// Catch Ads from adOpportunity event
		if( embedPlayer.getKalturaConfig('vast', 'trackCuePoints') === true ) {
			$( embedPlayer ).bind('KalturaSupport_AdOpportunity' + _this.bindPostfix, function( event, cuePointWrapper ) {
				// Check for  protocolType == 1 ( type = vast )
				if( cuePointWrapper.cuePoint.protocolType == 1 ){
					_this.handleAdOpportunity( cuePointWrapper );
				}
			});

			$( embedPlayer ).bind('midSequenceComplete' + _this.bindPostfix, function() {
				embedPlayer.play();
			});
		}

		// Reset displayedCuePoints array if adsOnReplay is true
		if( embedPlayer.getFlashvars( 'adsOnReplay' ) === true ) {
			embedPlayer.bindHelper('ended' + _this.bindPostfix, function() {
				_this.displayedCuePoints = [];
			});
		}

		// Load the Ads from uiConf
		_this.loadAds( function(){
			mw.log( "KAds::All ads have been loaded" );
			callback();
		});
	},

	/**
	 * Get ad config
	 * @param name
	 * @return
	 */
	getConfig: function( attr ){
		return this.embedPlayer.getKalturaConfig( 'vast', attr );
	},

	handleAdOpportunity: function( cuePointWrapper ) {
		var _this = this;
		switch( _this.embedPlayer.kCuePoints.getAdSlotType( cuePointWrapper ) ) {
			case 'preroll':
			case 'postroll':
				_this.loadAndAddToSequence( cuePointWrapper );
				break;

			case 'midroll':
			case 'overlay':
				_this.loadAndDisplayAd( cuePointWrapper );
				break;
		}
	},

	loadAndAddToSequence: function( cuePointWrapper ) {
		var _this = this;
		var cuePoint = cuePointWrapper.cuePoint;
		var adType = _this.embedPlayer.kCuePoints.getAdSlotType( cuePointWrapper );

		// Check for empty ad:
		if( !cuePoint.sourceUrl || $.trim( cuePoint.sourceUrl ) === '' ) {
			return ;
		}
		// Load Ad
		mw.AdLoader.load( cuePoint.sourceUrl, function( adConf ){
			if( ! adConf ) {
				return ;
			}

			if( adType == 'preroll' ) {
				_this.config[ 'preSequence' ]++;
			}
			if( adType == 'postroll' ) {
				_this.config[ 'postSequence' ]++;
			}

			var adConfigWrapper = {};
			adConfigWrapper[ adType ] = {
				ads: adConf.ads, 
				type: adType
			};

			_this.addSequenceProxyBinding( adType, adConfigWrapper, _this.getSequenceIndex( adType ) );
		});
	},
	/**
	 * load and display an ad
	 * cuePointWrapper
	 */
	loadAndDisplayAd: function( cuePointWrapper ) {
		var _this = this;
		var embedPlayer = this.embedPlayer;
		var cuePoint = cuePointWrapper.cuePoint;
		var adType = this.embedPlayer.kCuePoints.getAdSlotType( cuePointWrapper );
		var adDuration = Math.round( cuePoint.duration / 1000);

		// Check if cue point already displayed
		if( $.inArray( cuePoint.id, _this.displayedCuePoints) >= 0 ) {
			return ;
		}
		// Add cuePoint Id to displayed cuePoints array
		_this.displayedCuePoints.push( cuePoint.id );

		// Trigger midSequenceStart event (TODO: should moved to AdTimeline)
		$( embedPlayer ).trigger('midSequenceStart');

		mw.log('kAds::loadAndDisplayAd:: load ' + adType + ', duration: ' + adDuration, cuePoint);

		// Load adTimeline
		if (!_this.embedPlayer.adTimeline) {
			_this.embedPlayer.adTimeline = new mw.AdTimeline( _this.embedPlayer );
		}

		// Check for empty ad:
		if( !cuePoint.sourceUrl || $.trim( cuePoint.sourceUrl ) === '' ) {
			return ;
		}

		// If ad type is midroll pause the video
		if( adType == 'midroll' ) {
			_this.embedPlayer.pauseLoading();
		}

		// Disable play controls while loading the ad:
		if( adType !== 'overlay' ) {
			_this.embedPlayer.disablePlayControls();
		}

		var baseDisplayConf = this.getBaseDisplayConf();

		mw.AdLoader.load( cuePoint.sourceUrl, function( adConf ){
			// No Ad configuration, continue playback
			if( ! adConf ){
				// Ad skip re-enable play controls:
				_this.embedPlayer.enablePlayControls();
				// Resume content playback
				setTimeout( function() {
					_this.embedPlayer.play();
				}, 1);
				return ;
			}

			var adsCuePointConf = {
				ads: adConf.ads,
				type: adType
			};

			$.extend( adsCuePointConf, baseDisplayConf );

			var originalSource = embedPlayer.getSource();
			var seekPerc = ( parseFloat( cuePoint.startTime / 1000 ) / parseFloat( embedPlayer.duration ) );
			var oldDuration = embedPlayer.duration;
			var vidDuration = embedPlayer.getPlayerElement().duration;

			// Set switch back function
			var doneCallback = function() {
				var vid = embedPlayer.getPlayerElement();
				// Check if the src does not match original src if
				// so switch back and restore original bindings
				if ( originalSource.getSrc() != vid.src ) {
					embedPlayer.switchPlaySource( originalSource, function() {
						mw.log( "AdTimeline:: restored original src:" + vid.src);
						// Restore embedPlayer native bindings
						embedPlayer.adTimeline.restorePlayer( 'midroll', true );

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
								setTimeout( function(){
									if( vid && vid.pause ){
										vid.pause();
									}
								}, 100 );
							}
						} else if(  adType == 'midroll' ){
							embedPlayer.hidePlayerOffScreen();
							embedPlayer.addPlayerSpinner();
							
							embedPlayer.setCurrentTime( seekPerc * embedPlayer.getDuration(), function(){
								embedPlayer.play();
								embedPlayer.restorePlayerOnScreen();
								embedPlayer.hideSpinnerAndPlayBtn();
							} );
						}
					});
				} else {
					embedPlayer.adTimeline.restorePlayer( 'midroll', true );
					//continue playback ( if not already playing )
					embedPlayer.play();
				}

				// Trigger midSequenceComplete event (TODO: should moved to AdTimeline)
				$( embedPlayer ).trigger('midSequenceComplete');
			};

			// If out ad is preroll/midroll/postroll, disable the player
			if( adType == 'preroll' || adType == 'midroll' || adType == 'postroll' ){
				_this.embedPlayer.hideLargePlayBtn();
			} else {
				// in case of overlay do nothing
				doneCallback = function() {};
			}

			// Tell the player to show the Ad
			if( cuePoint.adType == 1 ) {
				_this.embedPlayer.adTimeline.updateUiForAdPlayback( adType );
			}
			_this.adPlayer.display( adsCuePointConf, doneCallback, adDuration );

		});
	},

	// Load all the ads per the $adConfig
	loadAds: function( callback ){
		var _this = this;
		// Get companion targets:
		var baseDisplayConf = this.getBaseDisplayConf();
		// Get ad Configuration
		this.getAdConfigSet( function( adConfigSet ){
			// Get global timeout ( should be per adType )
			if( _this.getConfig( 'timeout' ) ){
				baseDisplayConf[ 'timeout' ] = _this.getConfig('timeout');
			}
			// add in a binding for the adType
			for( var adType in adConfigSet ){
				// Add to timeline only if we have ads
				if( adConfigSet[ adType ].ads ) {
					if( adType == 'midroll' ||  adType == 'postroll' || adType =='preroll' ){
						var seqInx =  parseInt( _this.getSequenceIndex( adType ) );
						if( seqInx ){
							_this.addSequenceProxyBinding( adType, adConfigSet, _this.getSequenceIndex( adType ) );
						}
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
	/*
	 * Utility functions for getting setting persistent config:
	 * TODO unify as embedPlayer utility. ( timedText uses this as well )
	 */
	setPersistentConfig: function( key, value ) {
		if ( !this.embedPlayer[ this.confPrefix ] ) {
			this.embedPlayer[ this.confPrefix ] = {};
		}
		if ( typeof key == "object" ) {
			$.extend( this.embedPlayer[ this.confPrefix ], key );
		} else {
			this.embedPlayer[ this.confPrefix ][ key ] = value;
		}
	},
	getPersistentConfig: function( attr ) {
		if ( !this.embedPlayer[ this.confPrefix ] ) {
			return null;
		}
		if ( !attr ) {
			return this.embedPlayer[ this.confPrefix ];
		}
		return this.embedPlayer[ this.confPrefix ][ attr ];
	},
	addSequenceProxyBinding: function( adType, adConfigSet, sequenceIndex ){
		var _this = this;
		var baseDisplayConf = this.getBaseDisplayConf();
		sequenceIndex = sequenceIndex || _this.getSequenceIndex( adType );
		$( _this.embedPlayer ).bind( 'AdSupport_' + adType + _this.bindPostfix, function( event, sequenceProxy ){
			var interval = _this.getConfig( adType.toLowerCase() + 'Interval' ) || 1;
			var startWith =_this.getConfig( adType.toLowerCase() + 'StartWith' ) || 1;
			var requiredRemaining = startWith % interval;

			// Check if we should add to sequence proxy::
			if( !_this.getPersistentConfig( 'contentIndex') ){
				_this.setPersistentConfig( 'contentIndex', 0);
			}
			// always increment contentIndex ( starts on 1 ): 
			_this.setPersistentConfig( 'contentIndex', _this.getPersistentConfig( 'contentIndex') + 1 );
			// check if we should play an ad: 
			if( _this.getPersistentConfig( 'contentIndex') >= startWith
					&& 
				( _this.getPersistentConfig( 'contentIndex') % interval == requiredRemaining 
					|| 
					_this.getPersistentConfig( 'contentIndex') == 1 // always play the first startWith for interval sets 
				)
			){
				// Disable UI while playing ad
				_this.embedPlayer.adTimeline.updateUiForAdPlayback( adType );
				
				// add to sequenceProxy:
				sequenceProxy[ sequenceIndex ] = function( doneCallback ){
					var adConfig = $.extend( {}, baseDisplayConf, adConfigSet[ adType ] );
					adConfig.type = adType;
					_this.displayAdNumAds( 0, adType, adConfig, doneCallback );
				};
			}
		});
	},
	// display a number of ads based on numAds config
	displayAdNumAds: function( displayCount, adType, adConfig, callback ){
		var _this =this;
		var numAds = _this.getConfig( 'num' + adType.charAt(0).toUpperCase() + adType.substr(1) );
		displayCount++;
		if( displayCount <= numAds ){
			// if not on the first ad get new ad config: 
			if( displayCount != 1 ){
				// Disable UI while playing ad
				_this.embedPlayer.adTimeline.updateUiForAdPlayback( adType );
				
				mw.AdLoader.load( _this.getConfig( adType + 'Url' ) , function( adDisplayConf ){
					var adConfig = $.extend({}, _this.getBaseAdConf( adType ), adDisplayConf );
					_this.adPlayer.display( adConfig, function(){
						_this.displayAdNumAds( displayCount, adType, adConfig,  callback);
					});
				});
			}else {
				_this.adPlayer.display( adConfig, function(){
					_this.displayAdNumAds( displayCount, adType, adConfig,  callback);
				});
			}
			
		} else {
			// done with ad sequence run callback: 
			callback();
		}
	},
	addOverlayBinding: function( overlayConfig ){
		var _this = this;
		var embedPlayer = this.embedPlayer;
		var startOvelrayDisplayed = false;
		var lastDisplay = 0;
		var timeout = this.embedPlayer.getKalturaConfig( 'vast', 'timeout' );

		// turn start time from string to number
		timeout = parseInt( timeout );
		overlayConfig.start = parseInt( overlayConfig.start );
		overlayConfig.end = ( overlayConfig.start + timeout );

		// Set overlay to 5 seconds if we can't get overlay info:
		if( ! timeout )
			timeout = 5;
		overlayConfig.type = 'overlay';
		// Display the overlay
		var displayOverlay = function(){
			_this.adPlayer.display(
				overlayConfig,
				function(){
					mw.log("KAds::overlay done");
				},
				timeout
			)
		};

		$( embedPlayer ).bind( 'monitorEvent', function(){
			if( (embedPlayer.currentTime > overlayConfig.start) && (embedPlayer.currentTime < overlayConfig.end) && !startOvelrayDisplayed && !embedPlayer.evaluate('{sequenceProxy.isInSequence}') ){
				lastDisplay = embedPlayer.currentTime;
				startOvelrayDisplayed = true;
				mw.log("KAds::displayOverlay::startOvelrayDisplayed " + startOvelrayDisplayed)
				displayOverlay();
			}
			if( startOvelrayDisplayed && embedPlayer.currentTime > ( lastDisplay + parseInt( overlayConfig.frequency ) ) && !embedPlayer.evaluate('{sequenceProxy.isInSequence}') ){
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
		var embedPlayer = this.embedPlayer;
		var config = {
			'companionTargets' : this.getCompanionTargets()
		};

		// Setup local pointer:
		var notice = embedPlayer.getRawKalturaConfig('noticeMessage');
		var skipBtn = embedPlayer.getRawKalturaConfig('skipBtn');
		var skipNotice = embedPlayer.getRawKalturaConfig('skipNotice');

		// Add notice if present
		if( notice ){
			config.notice = {
				'evalText' : notice['text'],
				'css' : {
					'top': '0',
					'left' : '5px'
				}
			};
		}
		if( ! $.isEmptyObject( skipBtn ) ){
			config.skipBtn = {
				'text' : ( skipBtn['label'] )? skipBtn['label']: 'skip ad', // TODO i8ln
				'css' : {
					'right': '5px',
					'bottom' : '5px'
				}
			};
		}
		// Add skipoffset notice if present
		if( skipNotice ){
			config.skipNotice = {
				'evalText' : skipNotice['text'] || skipNotice['label'],
				'css' : {
					'right': '5px',
					'bottom' : '5px'
				}
			};
		}
		return config;
	},
	getBaseAdConf: function( adType ){
		var _this = this;
		var adConf = {};
		$.each( _this.adAttributeMap, function( adAttributeName,  displayConfName ){
			if( _this.getConfig( adType + adAttributeName ) ){
				adConf[ displayConfName ] = _this.getConfig( adType + adAttributeName );
			}
		});
		return adConf;
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
			if( _this.getConfig( adType + 'Url' ) ){
				loadQueueCount++;
				// Load and parse the adXML into displayConf format
				mw.AdLoader.load( _this.getConfig( adType + 'Url' ) , function( adDisplayConf ){
					mw.log("KalturaAds loaded: " + adType );
					loadQueueCount--;
					addAdCheckLoadDone( adType,  $.extend({}, _this.getBaseAdConf( adType ), adDisplayConf ) );
				});
			} else {
				// No async request
				adConfigSet[ adType ] = _this.getBaseAdConf( adType );
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
