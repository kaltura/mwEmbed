(function (mw, $) {
	"use strict";

	mw.PluginManager.add('liveCore', mw.KBasePlugin.extend({

		firstPlay: false,
		/**
		 * API requests interval for updating live stream status (Seconds).
		 * Default is 30 seconds, to match server's cache expiration
		 */
		liveStreamStatusInterval: 10,

		// Default DVR Window (Seconds)
		defaultDVRWindow: 30 * 60,

		onAirStatus: true,

		defaultConfig: {
			//time in ms to wait before displaying the offline alert
			offlineAlertOffest: 1000,
			//disable the islive check (force live to true)
			disableLiveCheck: false,
			//hide live indicators when playing offline from DVR
			hideOfflineIndicators: false
		},

		/**
		 * (only for iOS) indicates we passed the dvr window size and once we will seek backwards we should reAttach timUpdate events
		 */
		shouldReAttachTimeUpdate: false,

		playWhenOnline: false,

		/**
		 * In native HLS playback we don't get duration so we set it to maximum "currentTime" value
		 */
		maxCurrentTime: 0,

		setup: function () {
			this.addPlayerBindings();
			this.extendApi();
		},
		/**
		 * Extend JS API to match the KDP
		 */
		extendApi: function () {
			var _this = this;

			this.getPlayer().isOffline = function () {
				return !_this.onAirStatus;
			}
		},

		addPlayerBindings: function () {
			var _this = this;
			var embedPlayer = this.getPlayer();

			this.bind('checkIsLive', function (e, callback) {
				_this.getLiveStreamStatusFromAPI(callback);
			});

			this.bind('playerReady', function () {
				_this.isLiveChanged();
			});

			this.bind('onpause', function () {
				if (embedPlayer.isLive() && _this.isDVR() && _this.switchDone) {
					embedPlayer.addPlayerSpinner();
					_this.getLiveStreamStatusFromAPI(function (onAirStatus) {
						if (onAirStatus) {
							if (_this.shouldHandlePausedMonitor()) {
								_this.addPausedMonitor();
							}
						}
					});
				}
			});

			this.bind('firstPlay', function () {
				_this.firstPlay = true;
			});

			this.bind('AdSupport_PreSequenceComplete', function () {
				_this.switchDone = true;
			});

			this.bind('liveStreamStatusUpdate', function (e, onAirObj) {
				//check for pending autoPlay
				if (onAirObj.onAirStatus &&
					embedPlayer.firstPlay &&
					embedPlayer.autoplay &&
					embedPlayer.canAutoPlay() && !embedPlayer.isPlaying()) {
					embedPlayer.play();
				}

				//if we moved from live to offline  - show message
				if (_this.onAirStatus && !onAirObj.onAirStatus) {

					//simetimes offline is only for a second and the message is not needed..
					setTimeout(function () {
						if (!_this.onAirStatus) {
							//if we already played once it means stream data was loaded. We can continue playing in "VOD" mode
							if (!embedPlayer.firstPlay && _this.isDVR()) {
								embedPlayer.triggerHelper('liveEventEnded');
							} else {
								//remember last state
								_this.playWhenOnline = embedPlayer.isPlaying();
								embedPlayer.layoutBuilder.displayAlert({ title: embedPlayer.getKalturaMsg('ks-LIVE-STREAM-OFFLINE-TITLE'), message: embedPlayer.getKalturaMsg('ks-LIVE-STREAM-OFFLINE'), keepOverlay: true });
								_this.getPlayer().disablePlayControls();
							}

						}
					}, _this.getConfig('offlineAlertOffest'));

					embedPlayer.triggerHelper('liveOffline');

				} else if (!_this.onAirStatus && onAirObj.onAirStatus) {
					embedPlayer.layoutBuilder.closeAlert(); //moved from offline to online - hide the offline alert
					if (!_this.getPlayer().getError()) {
						_this.getPlayer().enablePlayControls();
					}
					if (_this.playWhenOnline) {
						embedPlayer.play();
						_this.playWhenOnline = false;
					}
					embedPlayer.triggerHelper('liveOnline');
				}

				_this.onAirStatus = onAirObj.onAirStatus;

				if (_this.isDVR()) {
					if (!onAirObj.onAirStatus) {
						embedPlayer.triggerHelper('onHideInterfaceComponents', [
							['liveBackBtn']
						]);
						if (_this.shouldHandlePausedMonitor()) {
							_this.removePausedMonitor();
						}
					} else if (_this.firstPlay) {
						embedPlayer.triggerHelper('onShowInterfaceComponents', [
							['liveBackBtn']
						]);
					}
				}
			});

			this.bind('durationChange', function (e, newDuration) {
				if (_this.switchDone && embedPlayer.isLive() && _this.isDVR() && embedPlayer.paused) {
					//refresh playhead position
					embedPlayer.triggerHelper('timeupdate', [ embedPlayer.getPlayerElementTime() ]);
					embedPlayer.triggerHelper('updatePlayHeadPercent', [ embedPlayer.getPlayerElementTime() / embedPlayer.duration ]);

				}
			});

			this.bind('liveEventEnded', function () {
				if (embedPlayer.isLive() && _this.isDVR()) {
					//change state to "VOD"
					embedPlayer.setLive(false);
					if (_this.getConfig('hideOfflineIndicators')) {
						_this.isLiveChanged();
					} else {
						//once moving back to live, set live state again
						embedPlayer.bindHelper('movingBackToLive', function () {
							embedPlayer.setLive(true);
							if (_this.isNativeHLS()) {
								embedPlayer.setDuration(_this.dvrWindow);
							}
						});
					}

					if (!_this.isNativeHLS()) {
						embedPlayer.setDuration(embedPlayer.getPlayerElement().duration);
						embedPlayer.bindHelper('ended', function () {
							embedPlayer.getPlayerElement().seek(0);
						});
					}
				}
			});
		},

		isLiveChanged: function () {
			var _this = this;
			var embedPlayer = this.getPlayer();

			//ui components to hide
			var showComponentsArr = [];
			//ui components to show
			var hideComponentsArr = [ 'liveBackBtn' ];
			_this.maxCurrentTime = 0;
			//live entry
			if (embedPlayer.isLive()) {
				_this.addLiveStreamStatusMonitor();
				//hide source selector until we support live streams switching
				hideComponentsArr.push('sourceSelector');
				embedPlayer.addPlayerSpinner();
				_this.getLiveStreamStatusFromAPI(function (onAirStatus) {
					if (!embedPlayer._checkHideSpinner) {
						embedPlayer.hideSpinner();
					}
				});
				_this.switchDone = true;
				if (embedPlayer.sequenceProxy) {
					_this.switchDone = false;
				}

				hideComponentsArr.push('durationLabel');
				//live + DVR
				if (_this.isDVR()) {
					_this.dvrWindow = embedPlayer.evaluate('{mediaProxy.entry.dvrWindow}') * 60;
					if (!_this.dvrWindow) {
						_this.dvrWindow = _this.defaultDVRWindow;
					}
					showComponentsArr.push('scrubber', 'currentTimeLabel');
				} else {  //live + no DVR
					showComponentsArr.push('liveStatus');
					hideComponentsArr.push('scrubber', 'currentTimeLabel');
				}

				if (_this.isNativeHLS()) {
					_this.bind('timeupdate', function () {
						var curTime = embedPlayer.getPlayerElementTime();

						if (_this.isDVR()) {
							if (curTime > _this.maxCurrentTime) {
								_this.maxCurrentTime = curTime;
								embedPlayer.setDuration(_this.maxCurrentTime);

							}
						}
					});
				}

				if (_this.shouldHandlePausedMonitor()) {
					_this.bind('playing', function () {
						if (_this.isDVR() && _this.switchDone) {
							//	_this.hideLiveStreamStatus();
							_this.removePausedMonitor();
						}
					});
				}
			}
			//not a live entry: restore ui, hide live ui
			else {
				hideComponentsArr.push('liveStatus');
				showComponentsArr.push('sourceSelector', 'scrubber', 'durationLabel', 'currentTimeLabel');
				_this.removeLiveStreamStatusMonitor();
				_this.unbind('timeupdate');
			}

			embedPlayer.triggerHelper('onShowInterfaceComponents', [ showComponentsArr ]);
			embedPlayer.triggerHelper('onHideInterfaceComponents', [ hideComponentsArr ]);
		},

		isDVR: function () {
			return ( this.getPlayer().evaluate('{mediaProxy.entry.dvrStatus}') && this.getPlayer().isTimeUpdateSupported() );
		},

		getCurrentTime: function () {
			return this.getPlayer().getPlayerElement().currentTime;
		},

		removeMinDVRMonitor: function () {
			this.log("removeMinDVRMonitor");
			this.minDVRMonitor = clearInterval(this.minDVRMonitor);
		},

		/**
		 * API Requests to update on/off air status
		 */
		addLiveStreamStatusMonitor: function () {
			//if player is in error state- no need for islive calls
			if (this.embedPlayer.getError()) {
				return;
			}
			this.log("addLiveStreamStatusMonitor");
			var _this = this;
			this.liveStreamStatusMonitor = setInterval(function () {
				_this.getLiveStreamStatusFromAPI();
			}, _this.liveStreamStatusInterval * 1000);
		},

		removeLiveStreamStatusMonitor: function () {
			this.log("removeLiveStreamStatusMonitor");
			this.liveStreamStatusMonitor = clearInterval(this.liveStreamStatusMonitor);
		},

		/**
		 * indicates if we should handle paused monitor.
		 */
		shouldHandlePausedMonitor: function () {
			if (this.isNativeHLS()) {
				return true;
			}
			return false;
		},

		/**
		 * Updating display time & scrubber while in paused state
		 */
		addPausedMonitor: function () {
			var _this = this;
			var embedPlayer = this.embedPlayer;
			var pauseTime = _this.maxCurrentTime;
			if (pauseTime == 0) {
				pauseTime = embedPlayer.getPlayerElementTime();
			}
			var pauseClockTime = Date.now();
			this.log("addPausedMonitor :   Monitor rate = " + mw.getConfig('EmbedPlayer.MonitorRate'));
			this.pausedMonitor = setInterval(function () {
				var timePassed = ( Date.now() - pauseClockTime ) / 1000;
				embedPlayer.setDuration(pauseTime + timePassed);
			}, 1000);
		},

		removePausedMonitor: function () {
			this.log("removePausedMonitor");
			this.pausedMonitor = clearInterval(this.pausedMonitor);
		},

		/**
		 * Get on/off air status based on the API and update locally
		 */
		getLiveStreamStatusFromAPI: function (callback) {
			var _this = this;
			var embedPlayer = this.getPlayer();

			if (embedPlayer.getFlashvars('streamerType') == 'rtmp') {
				if (callback) {
					callback(_this.onAirStatus);
				}
				return;
			}

			if (this.getConfig("disableLiveCheck")) {
				if (callback) {
					callback(true);
				}
				embedPlayer.triggerHelper('liveStreamStatusUpdate', { 'onAirStatus': true });
				return;
			}

			var service = 'liveStream';
			//type liveChannel
			if (embedPlayer.kalturaPlayerMetaData && embedPlayer.kalturaPlayerMetaData.type == 8) {
				service = 'liveChannel';
			}
			var protocol = 'hls';
			if (embedPlayer.streamerType != 'http') {
				protocol = embedPlayer.streamerType;
			}
			_this.getKalturaClient().doRequest({
				'service': service,
				'action': 'islive',
				'id': embedPlayer.kentryid,
				'protocol': protocol,
				'partnerId': embedPlayer.kpartnerid
			}, function (data) {
				var onAirStatus = false;
				if (data === true) {
					onAirStatus = true;
				}
				if (callback) {
					callback(onAirStatus);
				}
				embedPlayer.triggerHelper('liveStreamStatusUpdate', { 'onAirStatus': onAirStatus });
			}, mw.getConfig("SkipKSOnIsLiveRequest"), function () {
				mw.log("Error occur while trying to check onAir status");
				embedPlayer.triggerHelper('liveStreamStatusUpdate', { 'onAirStatus': false });
			});
		},

		getKalturaClient: function () {
			if (!this.kClient) {
				this.kClient = mw.kApiGetPartnerClient(this.embedPlayer.kwidgetid);
			}
			return this.kClient;
		},

		log: function (msg) {
			mw.log("LiveStream :: " + msg);
		},

		isNativeHLS: function () {
			if (mw.isIOS() || mw.isDesktopSafari() || mw.isAndroid()) {
				return true;
			}
			return false;
		}

	}));

})(window.mw, window.jQuery);