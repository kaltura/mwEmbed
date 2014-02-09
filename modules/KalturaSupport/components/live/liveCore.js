( function( mw, $ ) {"use strict";

	mw.PluginManager.add( 'liveCore', mw.KBasePlugin.extend({

		firstPlay : false,
		/**
		 * API requests interval for updating live stream status (Seconds).
		 * Default is 30 seconds, to match server's cache expiration
		 */
		liveStreamStatusInterval : 30,

		// Default DVR Window (Seconds)
		defaultDVRWindow : 30 * 60,

		onAirStatus: true,

		dvrTimePassed: 0,

		defaultConfig: {
			//whether to start backwards timer on pause in iOS
			updateIOSPauseTime: false,
			//time in ms to wait before displaying the offline alert
			offlineAlertOffest: 1000,
			//disable the islive check (force live to true)
			disableLiveCheck: false
		},

		/**
		 * indicates the last "current time" displayed. (will be used in iOS - where we sometimes override the current time)
		 */
		lastShownTime: 0,

		/**
		 * (only for iOS) indicates we passed the dvr window size and once we will seek backwards we should reAttach timUpdate events
		 */
		shouldReAttachTimeUpdate: false,

		setup: function() {
			this.addPlayerBindings();
			this.extendApi();
		},
		/**
		 * Extend JS API to match the KDP
		 */
		extendApi: function() {
			var _this = this;

			this.getPlayer().isOffline = function() {
				return !_this.onAirStatus;
			}
		},

		addPlayerBindings: function() {
			var _this = this;
			var embedPlayer = this.getPlayer();

			this.bind( 'playerReady', function() {
				//ui components to hide
				var showComponentsArr = [];
				//ui components to show
				var hideComponentsArr = [];
				hideComponentsArr.push( 'liveBackBtn' );
				_this.dvrTimePassed = 0;
				_this.lastShownTime = 0;

				//live entry
				if ( embedPlayer.isLive() ) {
					_this.addLiveStreamStatusMonitor();
					//hide source selector until we support live streams switching
					hideComponentsArr.push( 'sourceSelector' );
					embedPlayer.disablePlayControls();
					embedPlayer.addPlayerSpinner();
					_this.getLiveStreamStatusFromAPI( function( onAirStatus ) {
						embedPlayer.hideSpinner();
					} );
					_this.switchDone = true;
					if ( embedPlayer.sequenceProxy ) {
						_this.switchDone = false;
					}
					//live + DVR
					if ( _this.isDVR() ) {
						_this.dvrWindow = embedPlayer.evaluate( '{mediaProxy.entry.dvrWindow}' ) * 60;
						if ( !_this.dvrWindow ) {
							_this.dvrWindow = this.defaultDVRWindow;
						}
						if ( kWidget.isIOS() ) {
							embedPlayer.setDuration( _this.dvrWindow );
						}
						if ( embedPlayer.kalturaPlayerMetaData.repeat === true ) {
							hideComponentsArr.push( 'durationLabel' );
						} else {
							showComponentsArr.push( 'durationLabel' );
						}
						showComponentsArr.push( 'scrubber', 'currentTimeLabel' );
					} else {  //live + no DVR
						showComponentsArr.push( 'liveStatus' );
						hideComponentsArr.push( 'scrubber', 'durationLabel', 'currentTimeLabel' );
					}
				}
				//not a live etnry: restore ui, hide live ui
				else {
					hideComponentsArr.push( 'liveStatus' );
					showComponentsArr.push( 'sourceSelector', 'scrubber', 'durationLabel', 'currentTimeLabel' );
					_this.removeLiveStreamStatusMonitor();
				}

				embedPlayer.triggerHelper('onShowInterfaceComponents', [ showComponentsArr ] );
				embedPlayer.triggerHelper('onHideInterfaceComponents', [ hideComponentsArr ] );
			} );

			this.bind( 'onpause', function() {
				if ( _this.isDVR() && _this.switchDone ) {
					embedPlayer.addPlayerSpinner();
					_this.getLiveStreamStatusFromAPI( function( onAirStatus ) {
						if ( onAirStatus ) {
							if ( _this.shouldHandlePausedMonitor() ) {
								_this.addPausedMonitor();
							}
						}
					} );
				}
			} );

			this.bind( 'firstPlay', function() {
				_this.firstPlay = true;
			} );

			this.bind( 'AdSupport_PreSequenceComplete', function() {
				_this.switchDone = true;
			} );

			this.bind( 'liveStreamStatusUpdate', function( e, onAirObj ) {
				//if we moved from live to offline  - show message
				if ( _this.onAirStatus && !onAirObj.onAirStatus ) {
					//simetimes offline is only for a second and the message is not needed..
					setTimeout( function() {
						if ( !_this.onAirStatus ) {
							embedPlayer.layoutBuilder.displayAlert( { title: embedPlayer.getKalturaMsg( 'ks-LIVE-STREAM-OFFLINE-TITLE' ), message: embedPlayer.getKalturaMsg( 'ks-LIVE-STREAM-OFFLINE' ), keepOverlay: true } );
						}
					}, _this.getConfig( 'offlineAlertOffest' ) );

				}  else if ( !_this.onAirStatus && onAirObj.onAirStatus ) {
					embedPlayer.layoutBuilder.closeAlert(); //moved from offline to online - hide the offline alert
				}
				_this.onAirStatus = onAirObj.onAirStatus;
				_this.toggleControls( onAirObj.onAirStatus );

				if ( _this.isDVR() ) {
					if ( !onAirObj.onAirStatus ) {
						embedPlayer.triggerHelper('onHideInterfaceComponents', [['liveBackBtn']] );
						if ( _this.shouldHandlePausedMonitor() ) {
							_this.removePausedMonitor();
						}
					} else if ( _this.firstPlay ) {  //show "back to live" button only after first play
						embedPlayer.triggerHelper('onShowInterfaceComponents', [['liveBackBtn']] );
					}
				}
			} );

			this.bind( 'durationChange', function( e, newDuration) {
				if ( _this.switchDone && embedPlayer.isLive() && _this.isDVR() ) {
					//duration should be at least dvrWindow size (with 10% tolerance)
					if ( newDuration < 0.9 * (_this.dvrWindow) ) {
						embedPlayer.setDuration( _this.dvrWindow );
					}
				}
			});

			if ( kWidget.isIOS() ) {
				this.bind( 'timeupdate' , function() {
					var curTime = embedPlayer.getPlayerElementTime();

					// handle timeupdate if pausedTimer was turned on
					if ( _this.dvrTimePassed != 0 ) {
						var lastShownTime = _this.lastShownTime;
						if ( lastShownTime == 0 ) {
							lastShownTime = curTime;
						}
						var accurateTime =  lastShownTime - _this.dvrTimePassed;
						if ( accurateTime < 0 ) {
							accurateTime = 0
						}
						if ( accurateTime > embedPlayer.duration ) {
							accurateTime = embedPlayer.duration;
						}
						_this.updateTimeAndScrubber( accurateTime );

					}
					//handle bug in iOS: currenttime exceeds duration
					else if ( curTime > embedPlayer.duration ) {
						embedPlayer.triggerHelper( 'detachTimeUpdate' );
						embedPlayer.triggerHelper( 'externalTimeUpdate', [ embedPlayer.duration ] );
						_this.lastShownTime =  embedPlayer.duration;
						_this.shouldReAttachTimeUpdate = true;
					}
					else if ( _this.dvrTimePassed == 0 && _this.shouldReAttachTimeUpdate) {
					   _this.sendReAttacheTimeUpdate();
					}
				});
			}

			if ( this.shouldHandlePausedMonitor() ) {

				this.bind( 'onplay', function() {
					if ( _this.isDVR() && _this.switchDone ) {
						//	_this.hideLiveStreamStatus();
						_this.removePausedMonitor();
					}
				} );

				this.bind( 'seeking movingBackToLive', function() {
					//if we are keeping track of the passed time from a previous pause - reset it
					if ( _this.dvrTimePassed != 0 ) {
						_this.dvrTimePassed = 0;
						_this.sendReAttacheTimeUpdate();
					}
				});
			}
		},

		sendReAttacheTimeUpdate: function() {
			this.getPlayer().triggerHelper( 'reattachTimeUpdate' );
			this.lastShownTime = 0;
			this.shouldReAttachTimeUpdate = false
		},

		updateTimeAndScrubber: function( val ) {
			var embedPlayer = this.getPlayer();
			embedPlayer.triggerHelper( 'externalTimeUpdate', [ val ] );
			var playHeadPercent = ( val - embedPlayer.startOffset ) / embedPlayer.duration;
			embedPlayer.triggerHelper( 'externalUpdatePlayHeadPercent', [ playHeadPercent ] );
		},

		isDVR: function(){
			return this.getPlayer().evaluate( '{mediaProxy.entry.dvrStatus}' );
		},

		toggleControls: function( onAirStatus ) {
			if ( onAirStatus && !this.getPlayer().getError()) {
				this.getPlayer().enablePlayControls();
			}  else {
				this.getPlayer().disablePlayControls();
			}
		},

		getCurrentTime: function() {
			return this.getPlayer().getPlayerElement().currentTime;
		},

		removeMinDVRMonitor: function() {
			this.log( "removeMinDVRMonitor" );
			this.minDVRMonitor = clearInterval( this.minDVRMonitor );
		},

		/**
		 * API Requests to update on/off air status
		 */
		addLiveStreamStatusMonitor: function() {
			this.log( "addLiveStreamStatusMonitor" );
			var _this = this;
			this.liveStreamStatusMonitor = setInterval( function() {
				_this.getLiveStreamStatusFromAPI();
			}, _this.liveStreamStatusInterval * 1000 );
		},

		removeLiveStreamStatusMonitor: function() {
			this.log( "removeLiveStreamStatusMonitor" );
			this.liveStreamStatusMonitor = clearInterval( this.liveStreamStatusMonitor );
		},

		/**
		 * indicates if we should handle paused monitor.
		 * relevant only on iOS and if updateIOSPauseTime flag is true
		 */
		shouldHandlePausedMonitor: function() {
			if ( kWidget.isIOS() && this.getConfig('updateIOSPauseTime') ) {
				return true;
			}
			return false;
		},

		/**
		 * Updating display time & scrubber while in paused state
		 */
		addPausedMonitor: function() {
			var _this = this;
			var embedPlayer = this.embedPlayer;
			var vid = embedPlayer.getPlayerElement();
			var pauseTime = _this.lastShownTime;
			if ( pauseTime == 0 ) {
				pauseTime = vid.currentTime;
			}
			var pauseClockTime = Date.now();
			//ignore timeupdate native events, we will calculate the accurate time value and update the timers
			embedPlayer.triggerHelper( 'detachTimeUpdate' );
			this.log( "addPausedMonitor :   Monitor rate = " + mw.getConfig( 'EmbedPlayer.MonitorRate' ) );
			this.pausedMonitor = setInterval( function() {
				var timePassed = ( Date.now() - pauseClockTime ) / 1000;
				var newTime = pauseTime - timePassed;
				if ( newTime >= 0 ) {
					_this.dvrTimePassed = timePassed;
					_this.updateTimeAndScrubber( newTime );
				}
			}, 1000 );
		},

		removePausedMonitor: function() {
			this.log( "removePausedMonitor" );
			this.pausedMonitor = clearInterval( this.pausedMonitor );
		},

		/**
		 * Get on/off air status based on the API and update locally
		 */
		getLiveStreamStatusFromAPI: function( callback ) {
			var _this = this;
			var embedPlayer = this.getPlayer();

			if ( embedPlayer.getFlashvars( 'streamerType') == 'rtmp' ) {
				if ( callback ) {
					callback( _this.onAirStatus );
				}
				return;
			}

			if (this.getConfig("disableLiveCheck")){
				if ( callback ) {
					callback( true );
				}
				embedPlayer.triggerHelper( 'liveStreamStatusUpdate', { 'onAirStatus' : true } );
				return;
			}

			_this.getKalturaClient().doRequest( {
				'service' : 'liveStream',
				'action' : 'islive',
				'id' : embedPlayer.kentryid,
				'protocol' : 'hls',
				'partnerId': embedPlayer.kpartnerid,
				'timestamp' : Date.now()
			}, function( data ) {
				var onAirStatus = false;
				if ( data === true ) {
					onAirStatus = true;
				}
				if ( callback ) {
					callback( onAirStatus );
				}
				embedPlayer.triggerHelper( 'liveStreamStatusUpdate', { 'onAirStatus' : onAirStatus } );
			},mw.getConfig("SkipKSOnIsLiveRequest") );
		},

		getKalturaClient: function() {
			if( ! this.kClient ) {
				this.kClient = mw.kApiGetPartnerClient( this.embedPlayer.kwidgetid );
			}
			return this.kClient;
		},

		log: function( msg ) {
			mw.log( "LiveStream :: " + msg);
		}

	}));

} )( window.mw, window.jQuery );