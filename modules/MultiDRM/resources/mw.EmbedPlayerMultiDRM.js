/*
 * The "kaltura player" embedPlayer interface for multi DRM
 */
(function (mw, $) {
	"use strict";

	mw.EmbedPlayerMultiDRM = {

		//Instance Name
		instanceOf: 'MultiDRM',

		bindPostfix: '.multiDRM',

		playerPrefix: 'EmbedPlayerMultiDRM',

		// Flag to only load the video ( not play it )
		onlyLoadFlag: false,

		//Callback fired once video is "loaded"
		onLoadedCallback: null,

		// The previous "currentTime" to sniff seek actions
		// NOTE the bug where onSeeked does not seem fire consistently may no longer be applicable
		prevCurrentTime: -1,

		// Store the progress event ( updated during monitor )
		progressEventData: null,

		// If the media loaded event has been fired
		mediaLoadedFlag: null,

		// If network errors should triggered.
		triggerNetworkErrorsFlag: true,

		// A flag to keep the video tag offscreen.
		keepPlayerOffScreenFlag: null,

		// A flag to designate the first play event, as to not propagate the native event in this case
		ignoreNextNativeEvent: null,

		// A local var to store the current seek target time:
		currentSeekTargetTime: null,

		// Flag for ignoring next native error we get from the player.
		ignoreNextError: false,

		keepNativeFullScreen: false,

		// Flag for ignoring double play on iPhone
		playing: false,

		// Disable switch source callback
		disableSwitchSourceCallback: false,

		// Flag specifying if a mobile device already played. If true - mobile device can autoPlay
		mobilePlayed: false,
		// All the native events per:
		// http://www.w3.org/TR/html5/video.html#mediaevents
		nativeEvents: [
			'loadstart',
			'progress',
			'suspend',
			'abort',
			'error',
			'emptied',
			'stalled',
			'play',
			'pause',
			'loadedmetadata',
			'loadeddata',
			'waiting',
			'playing',
			'canplay',
			'canplaythrough',
			'seeking',
			'seeked',
			'timeupdate',
			'ended',
			'ratechange',
			'durationchange',
			'volumechange'
		],

		// Native player supported feature set
		supports: {
			'playHead': true,
			'pause': true,
			'fullscreen': true,
			'SourceSelector': true,
			'timeDisplay': true,
			'volumeControl': true,
			'overlays': true
		},
		setup: function (readyCallback){
			this._propagateEvents = true;
			mw.log('EmbedPlayerMultiDRM:: Setup');
			this.initDashPlayer(readyCallback);
		},
		/**
		 * Updates the supported features given the "type of player"
		 */
		updateFeatureSupport: function () {
			// The native controls function checks for overly support
			// especially the special case of iPad in-dom or not support
			if (this.useNativePlayerControls()) {
				this.supports.overlays = false;
			}
			// iOS and Mobile Chrome do not support volume control
			if (!this.supportsVolumeControl()) {
				this.supports.volumeControl = false;
			}

			// Check if we already have a video element an apply bindings ( for native interfaces )
			if (this.getPlayerElement()) {
				this.applyMediaElementBindings();
				this.playbackRate = this.getPlayerElement().playbackRate();
			}
			var _this = this;
			this.parent_updateFeatureSupport();
		},
		supportsVolumeControl: function () {
			return  !( mw.isIpad() || mw.isAndroid() || mw.isMobileChrome() || this.useNativePlayerControls() )
		},
		changeMediaCallback: function (callback) {
			// Check if we have source
			if (!this.getSource()) {
				callback();
				return;
			}
			var _this = this;
			// If switching a Persistent native player update the source:
			// ( stop and play won't refresh the source  )
			_this.switchPlaySource(this.getSource(), function () {
				if (!_this.autoplay && !mw.isMobileDevice()) {
					// pause is need to keep pause sate, while
					// switch source calls .play() that some browsers require.
					// to reflect source swiches.
					_this.ignoreNextNativeEvent = true;
					_this.pause();
					_this.updatePosterHTML();
				}
				if (!(mw.isIOS7() && mw.isIphone())) {
					_this.changeMediaCallback = null;
				}
				callback();
			});
		},
		disablePlayer: function () {
			$(this.getPlayerElement()).css('position', 'static');
		},
		/**
		 * Return the embed code
		 */
		embedPlayerHTML: function () {
			var _this = this;
			var vid = _this.getPlayerElement();
			this.ignoreNextNativeEvent = true;

			if (vid) {
				if ( vid.src() === this.getSrc( this.currentTime ) ) {
					_this.postEmbedActions();
					return;
				}

				//Hide the native video tag
				//this.hideNativePoster();

				mw.log( "EmbedPlayerNative::embedPlayerHTML > play url:" + this.getSrc( this.currentTime ) + ' startOffset: ' + this.start_ntp + ' end: ' + this.end_ntp );

				// Check if using native controls and already the "pid" is already in the DOM
				if ( this.isPersistentNativePlayer() ) {
					_this.postEmbedActions();
					return;
				}
			} else {
				// Reset some play state flags:
				_this.bufferStartFlag = false;
				_this.bufferEndFlag = false;

				$( this ).html(
					_this.getNativePlayerHtml()
				);

				this.initDashPlayer();
				this.updateDashContext();
				// Directly run postEmbedActions ( if playerElement is not available it will retry )
				this.postEmbedActions();
			}

		},
		initDashPlayer: function(callback){
			if (!this.dashPlayerInitialized) {
				var _this = this;
				this.dashPlayerInitialized = true;
				this.playerElement = mw.dash.player( this.pid, {
					autoplay: false,
					controls: false,
					height: "100%",
					width: "100%",
					plugins: {
						audiotracks: {},
						texttracks: {}
					},
					techOrder: ['dasheverywhere']
				}, function(){
					_this.playerElement = this;
					var el = $(_this.playerElement.el() );
					//Hide native player UI
					el.find(".vjs-poster, .vjs-control-bar, .vjs-big-play-button" ).css("display", "none");
					el.attr('data-src', _this.getSrc());
					//Set schedule while paused to true to allow buffering when in paused state
					_this.playerElement.mediaPlayer.setScheduleWhilePaused(true);
					_this.updateDashContext();
					callback();
				} );
				this.bindHelper('switchAudioTrack', function (e, data) {
					if (_this.getPlayerElement()) {
						_this.getPlayerElement().setActiveTrack("audio", data.index);
					}
				});
				this.bindHelper('changeEmbeddedTextTrack', function (e, data) {
					if (_this.getPlayerElement()) {
						var stats = _this.getPlayerElement().getPlaybackStatistics();
						if (stats.text.activeTrack != data.index){
							_this.getPlayerElement().setActiveTrack( "text", data.index );
						}
					}
				});
				this.bindHelper('closedCaptionsDisplayed', function () {
					_this.getPlayerElement().textTrackDisplay.show();
				});
				this.bindHelper('closedCaptionsHidden', function () {
					_this.getPlayerElement().textTrackDisplay.hide();
				});

			}
		},
		updateDashContext: function(){
			if (this.getPlayerElement() && this.getSrc()) {
				this.playerElement.loadVideo( this.getSrc(), this.getDrmConfig() );
			}
		},
		getDrmConfig: function(){
			var drmConfig = this.getKalturaConfig('multiDrm');
			var licenseBaseUrl = mw.getConfig('Kaltura.UdrmServerURL');
			if (!licenseBaseUrl) {
				this.log('Error:: failed to retrieve UDRM license URL ');
			}

			//TODO: error handling in case of error
			var assetId = this.mediaElement.selectedSource.getAssetId();
			var licenseData = this.getLicenseData(assetId);
			drmConfig.widevineLicenseServerURL = licenseBaseUrl + "?" + licenseData;
			drmConfig.assetId = this.kentryid;
			drmConfig.variantId = assetId;
			var config = {};

			if (this.shouldGeneratePssh()) {
				config.widevineHeader = {
					"provider": "castlabs",
					"contentId": this.getAuthenticationToken( assetId ),
					"policy": ""
				};
			}

			var sourceMimeType = this.mediaElement.selectedSource && this.mediaElement.selectedSource.mimeType;
			if (sourceMimeType === "video/ism" || sourceMimeType === "video/playreadySmooth"){
				config.isSmoothStreaming = true;
				config.enableSmoothStreamingCompatibility = true;
			}

			//Extend the drmConfig with new configuration
			$.extend(true, drmConfig, config);

			//Give chance to other plugins to review DRM config
			this.triggerHelper('updateDashContextData', {contextData: drmConfig});

			return drmConfig;
		},
		shouldGeneratePssh: function(){
			var source = this.getSource();
			var res;
			if (source){
				res = ( source.mimeType === "video/ism" || source.mimeType === "video/playreadySmooth" );
			} else {
				res = false;
			}
			return res;
		},
		getLicenseData: function(assetId){
			var flavorCustomData = this.kalturaContextData.flavorCustomData[assetId];
			var licenseData = flavorCustomData.license;
			var licenseDataString = "";
			if (licenseData) {
				$.each( licenseData, function ( key, val ) {
					licenseDataString += key + "=" + val + "&";
				} );
			}
			return licenseDataString;
		},
		getAuthenticationToken: function(assetId){
			var flavorCustomData = this.kalturaContextData.flavorCustomData[assetId];
			return flavorCustomData.contentId;
		},
		/**
		 * Get the native player embed code.
		 *
		 * @param {object} playerAttribtues Attributes to be override in function call
		 * @return {object} cssSet css to apply to the player
		 */
		getNativePlayerHtml: function (playerAttribtues, cssSet) {
			if (!playerAttribtues) {
				playerAttribtues = {};
			}
			// Update required attributes
			if (!playerAttribtues['id']) {
				playerAttribtues['id'] = this.pid;
			}
			if (!playerAttribtues['src']) {
				playerAttribtues['src'] = this.getSrc(this.currentTime);
			}

			// If autoplay pass along to attribute ( needed for iPad / iPod no js autoplay support
			if (this.autoplay) {
				playerAttribtues['autoplay'] = 'true';
			}

			if (!cssSet) {
				cssSet = {};
			}

			// Set default width height to 100% of parent container
			if (!cssSet['width']) cssSet['width'] = '100%';
			if (!cssSet['height']) cssSet['height'] = '100%';

			// Also need to set the loop param directly for iPad / iPod
			if (this.loop) {
				playerAttribtues['loop'] = 'true';
			}

			var tagName = this.isAudio() ? 'audio' : 'video';

			return    $('<' + tagName + ' />')
				// Add the special nativeEmbedPlayer to avoid any rewrites of of this video tag.
				.addClass('nativeEmbedPlayerPid')
				.attr(playerAttribtues)
				.css(cssSet);
		},

		/**
		 * Get /update the playerElement value
		 */
		getPlayerElement: function () {
			return this.playerElement;
		},

		/**
		 * Hide the native video tag
		 */
		hideNativePoster: function () {
			var videoTagObj = $($('#' + this.pid).get(0));
			if (videoTagObj) {
				videoTagObj.css('visibility', 'hidden');
			}
		},

		/**
		 * returns true if device can auto play
		 */
		canAutoPlay: function () {
			return !mw.isAndroid() && !mw.isMobileChrome() && !mw.isIOS();
		},

		/**
		 * Post element javascript, binds event listeners and starts monitor
		 */
		postEmbedActions: function () {
			var _this = this;

			// Setup local pointer:
			var vid = this.getPlayerElement();
			if (!vid) {
				return;
			}
//			// Update the player source ( if needed )
//			if (vid.src() != this.getSrc(this.currentTime)) {
//				vid.src(this.getSrc(this.currentTime));
//			}

			if (this.muted) {
				vid.muted(true);
			}

			// Update the EmbedPlayer.WebKitAllowAirplay option:
//			if (mw.getConfig('EmbedPlayer.WebKitAllowAirplay')) {
//				$(vid).attr('x-webkit-airplay', "allow");
//			}
			// make sure to display native controls if enabled:
			if (this.useNativePlayerControls()) {
				vid.controls(true);
			}
			// make sure the video is show ( both display and visibility attributes )
			//$( vid ).show().css('visibility', '');

			// Apply media element bindings:
			_this.applyMediaElementBindings();

			// Make sure we start playing in the correct place:
			if (this.currentTime != vid.currentTime()) {
				var waitReadyStateCount = 0;
				var checkReadyState = function () {
					if (vid.readyState > 0) {
						vid.currentTime(this.currentTime);
						return;
					}
					if (waitReadyStateCount > 1000) {
						mw.log("Error: EmbedPlayerNative: could not run native seek");
						return;
					}
					waitReadyStateCount++;
					setTimeout(function () {
						checkReadyState();
					}, 10);
				};
			}

			// Some mobile devices ( iOS need a load call before play will work )
			// support is only for iOS5 and upper, this fix is relevant only for iPad iOS5
			// other mobile devices ( android 4, break if we call load at play time )
			if (!_this.loop &&
				( mw.isIphone() || ( mw.isIpad() && mw.isIOS5() ) )) {
				mw.log("EmbedPlayerNative::postEmbedActions: issue .load() call");
				vid.load();
			}
		},
		/**
		 * Apply media element bindings
		 */
		applyMediaElementBindings: function () {
			var _this = this;
			mw.log("EmbedPlayerNative::MediaElementBindings");
			var vid = this.getPlayerElement();
			if (!vid) {
				mw.log(" Error: applyMediaElementBindings without player elemnet");
				return;
			}

			_this.boundedEventHandler = _this.boundedEventHandler || _this.nativeEventsHandler.bind(this);
			$.each(_this.nativeEvents, function (inx, eventName) {
				if (mw.isIOS8() && mw.isIphone() && eventName === "seeking") {
					return;
				}

				vid.off(eventName, _this.boundedEventHandler).on(eventName, _this.boundedEventHandler);
			});
		},
		nativeEventsHandler: function (e) {
			// make sure we propagating events, and the current instance is in the correct closure.
			if (this._propagateEvents && this.instanceOf === this.instanceOf) {
				var argArray = $.makeArray(arguments);
				//if (eventName!=="timeupdate" && eventName!=="progress") console.info(eventName);
				// Check if there is local handler:
				if (this[ '_on' + e.type ]) {
					this[ '_on' + e.type ].apply(this, argArray);
				} else {
					// No local handler directly propagate the event to the abstract object:
					$(this).trigger(e.type, argArray);
				}
			}
		},
		// basic monitor function to update buffer
		monitor: function () {
			var _this = this;
			var vid = _this.getPlayerElement();
			// Update the bufferedPercent
			if (vid && vid.buffered() && vid.duration()) {
				try {
					this.updateBufferStatus(vid.bufferedPercent());
				} catch (e) {
					// opera does not have buffered.end zero index support ?
				}
			}
			_this.parent_monitor();
		},
		/**
		 * Issue a seeking request.
		 *
		 * @param {Float} percent
		 * @param {bollean} stopAfterSeek if the player should stop after the seek
		 */
		doSeek: function (seekTime) {
			var _this = this;

			if (mw.isIOS()) {
				this.hidePlayerOffScreen();
			}

			if ( seekTime === 0 && this.isLive() && mw.isIpad() && !mw.isIOS8() ) {
				//seek to 0 doesn't work well on live on iOS < 8
				seekTime = 0.01;
				this.log( "doSeek: fix seekTime to 0.01" );
			}

			this.unbindHelper("seeked.doSeek").bindOnceHelper("seeked.doSeek", function(){
				// restore iPad video position:
				_this.restorePlayerOnScreen();
			});
			this.setCurrentTime(seekTime);
		},
		canSeek: function(deferred, callbackCount){
			var vid = this.getPlayerElement();
			var checkVideoStateDeferred = deferred || $.Deferred();
			var _this = this;
			if( !callbackCount ){
				callbackCount = 0;
			}

			if (this.currentState === "end" && mw.isIphone()) {
				vid.play();
				this.playing = true;
			}

			// some initial calls to prime the seek:
			if (vid.currentTime() === 0 && callbackCount === 0) {
				// when seeking turn off preload none and issue a load call.
				vid.preload('auto');
//				vid.load();
			}

			var vidObj = $(vid.contentEl() ).find("video")[0];

			if ( (vidObj && vidObj.readyState < 3) || (this.getDuration() === 0)) {
				// if on the first call ( and video not ready issue load, play
				if (callbackCount == 0 && vid.paused()) {
					this.stopEventPropagation();

					var eventName = mw.isIOS() ? "canplaythrough.seekPrePlay" : "canplay.seekPrePlay";
					$(vidObj).off(eventName).one(eventName, function () {
						_this.restoreEventPropagation();
						if (vid.duration() > 0) {
							_this.log("player can seek");
							clearTimeout( _this.canSeekTimeout );
							this.canSeekTimeout = null;
							setTimeout( function () {
								return checkVideoStateDeferred.resolve();
							}, 10 );
						} else {
							_this.log("player can't seek - video duration not available, wait for video duration update");
						}
					});
					this.log("player can't seek - try to init video element ready state");
					vid.play();
				}
				// Try to seek for 15 seconds:
				if (callbackCount >= 15) {
					this.log("Error:: with seek request, media never in ready state");
					return checkVideoStateDeferred.resolve();
				}
				this.log("player can't seek - wait video element ready state");
				this.canSeekTimeout = setTimeout(function () {
					this.canSeekTimeout = null;
					_this.canSeek(checkVideoStateDeferred, callbackCount + 1);
				}, 1000);
			} else {
				setTimeout(function(){
					_this.log("player can seek");
					return checkVideoStateDeferred.resolve();
				}, 10);
			}
			return checkVideoStateDeferred;
		},
		/**
		 * Set the current time with a callback
		 *
		 * @param {Float} position
		 * 		Seconds to set the time to
		 * @param {Function} callback
		 * 		Function called once time has been set.
		 */
		setCurrentTime: function( seekTime ) {
			this.log("setCurrentTime seekTime:" + seekTime );
			// Try to update the playerElement time:
			try {
				var vid = this.getPlayerElement();
				vid.currentTime(this.currentSeekTargetTime);
			} catch (e) {
				this.log("Error: Could not set video tag seekTime");
				this.triggerHelper("seeked");
			}
		},
		/**
		 * Get the embed player time
		 */
		getPlayerElementTime: function () {
			// update currentTime
			return this.getPlayerElement().currentTime();
		},
		playerSwitchSource: function (source, switchCallback, doneCallback) {
			var _this = this;
			var src = source.getSrc();
			var vid = this.getPlayerElement();
			var switchBindPostfix = '.playerSwitchSource';
			this.isPauseLoading = false;

			// Make sure the switch source is different:
			if (!src || src == vid.src() || $(vid.el() ).attr('data-src') === src) {
				if ($.isFunction(switchCallback)) {
					switchCallback(vid);
				}
				// Delay done callback to allow any non-blocking switch callback code to fully execute
				if ($.isFunction(doneCallback)) {
					_this.ignoreNextError = false;
					doneCallback();
				}
				return;
			}

			// remove preload=none
			vid.preload('auto');

			// only display switch msg if actually switching:
			this.log('playerSwitchSource: ' + src + ' native time: ' + vid.currentTime);

			// set the first embed play flag to true, avoid duplicate onPlay event:
			this.ignoreNextNativeEvent = true;

			// Update some parent embedPlayer vars:
			this.currentTime = 0;
			this.previousTime = 0;
			if (vid) {
				try {
					// Remove all old switch player bindings
					$(vid).unbind(switchBindPostfix);

					// pause before switching source
					vid.pause();

					var originalControlsState = vid.controls;
					// Hide controls ( to not display native play button while switching sources )
					vid.removeAttribute('controls');

					// dissable seeking ( if we were in a seeking state before the switch )
					if (_this.isFlavorSwitching) {
						_this.seeking = true;
					} else {
						_this.seeking = false;
					}

					// Workaround for 'changeMedia' on Android & iOS
					// When changing media and not playing entry before spinner is stuck on black screen
					if (!_this.firstPlay) {
						// add a loading indicator:
						_this.addPlayerSpinner();
						//workaround bug where thumbnail appears for a second, add black layer on top of the player
						_this.addBlackScreen();
					}
					// hide the player offscreen while we switch
					_this.hidePlayerOffScreen();

					// restore position once we have metadata
					$(vid).bind('loadedmetadata' + switchBindPostfix, function () {
						$(vid).unbind('loadedmetadata' + switchBindPostfix);
						_this.log(" playerSwitchSource> loadedmetadata callback for:" + src);
						// ( do not update the duration )
						// Android and iOS <5 gives bogus duration, depend on external metadata

						// keep going towards playback! if  switchCallback has not been called yet
						// we need the "playing" event to trigger the switch callback
						if (!mw.isIOS71() && $.isFunction(switchCallback) && !_this.isVideoSiblingEnabled()) {
							vid.play();
						} else {
							_this.removeBlackScreen();
						}
					});

					$(vid).bind('pause' + switchBindPostfix, function () {
						_this.log("playerSwitchSource> received pause during switching, issue play to continue source switching!")
						$(vid).unbind('pause' + switchBindPostfix);
						vid.play();
					});

					var handleSwitchCallback = function () {
						//Clear pause binding on switch exit in case it wasn't triggered.
						$(vid).unbind('pause' + switchBindPostfix);
						// restore video position ( now that we are playing with metadata size  )
						_this.restorePlayerOnScreen();
						// play hide loading spinner:
						_this.hideSpinner();
						// Restore
						vid.controls = originalControlsState;
						_this.ignoreNextError = false;
						_this.ignoreNextNativeEvent = false;
						// check if we have a switch callback and issue it now:
						if ($.isFunction(switchCallback)) {
							_this.log(" playerSwitchSource> call switchCallback");
							// restore event propagation:
							switchCallback(vid);
							switchCallback = null;
						}
					};

					// once playing issue callbacks:
					$(vid).bind('playing' + switchBindPostfix, function () {
						$(vid).unbind('playing' + switchBindPostfix);
						_this.log(" playerSwitchSource> playing callback: " + vid.currentTime);
						handleSwitchCallback();
						setTimeout(function () {
							_this.removeBlackScreen();
						}, 100);

					});

					// Add the end binding if we have a post event:
					if ($.isFunction(doneCallback)) {
						var sentDoneCallback = false;
						$(vid).bind('ended' + switchBindPostfix, function (event) {
							if (_this.disableSwitchSourceCallback) {
								return;
							}
							// Check if Timeout was activated, if true clear
							if (_this.mobileChromeTimeoutID) {
								clearTimeout(_this.mobileChromeTimeoutID);
								_this.mobileChromeTimeoutID = null;
							}
							sentDoneCallback = true;
							// remove end binding:
							$(vid).unbind(switchBindPostfix);
							// issue the doneCallback
							doneCallback();

							// Support loop for older iOS
							// Temporarily disabled pending more testing or refactor into a better place.
							//if ( _this.loop ) {
							//	vid.play();
							//}
							return false;
						});

						// Check if ended event was fired on chrome (android devices), if not fix by time difference approximation
						if (mw.isMobileChrome()) {
							$(vid).bind('timeupdate' + switchBindPostfix, function (e) {
								var _this = this;
								var timeDiff = this.duration - this.currentTime;

								if (timeDiff < 0.5 && this.duration != 0) {
									_this.mobileChromeTimeoutID = setTimeout(function () {
										_this.mobileChromeTimeoutID = null;
										// Check if timeDiff was changed in the last 2 seconds
										if (timeDiff <= (_this.duration - _this.currentTime)) {
											_this.log('playerSwitchSource> error in getting ended event, issue doneCallback directly.');
											if (!sentDoneCallback) {
												$(vid).unbind(switchBindPostfix);
												sentDoneCallback = true;
												doneCallback();
											}
										}
									}, 2000);
								}
							});
						}
					}

					//Update dash player context
					this.updateDashContext();
					// issue the play request:
					vid.play();
					if (mw.isIOS()) {
						setTimeout(function () {
							handleSwitchCallback();
						}, 100);
					}
					// check if ready state is loading or doing anything ( iOS play restriction )
					// give iOS 5 seconds to ~start~ loading media
					setTimeout(function () {
						// Check that the player got out of readyState 0
						if (vid.readyState === 0 && $.isFunction(switchCallback) && !_this.canAutoPlay()) {
							_this.log(" Error: possible play without user click gesture, issue callback");
							// hand off to the swtich callback method.
							handleSwitchCallback();
							// make sure we are in a pause state ( failed to change and play media );
							_this.pause();
						}
					}, 10000);


				} catch (e) {
					this.log("Error: switching source playback failed");
				}
			}
		},
		/**
		 * play method calls parent_play to update the interface
		 */
		play: function () {
			var duration = parseInt(this.duration, 10).toFixed(2);
			var curTime = parseInt(this.getPlayerElementTime(), 10).toFixed(2);
			if (( this.currentState === "end" ) ||
				( this.currentState === "pause" && duration === curTime && this.getPlayerElementTime() > 0 )) {
				this.seek(0.01, false);
			} else {
				if ( this.parent_play() ) {
					var _this = this;
					setTimeout( function () {
						_this.getPlayerElement().play();
						_this.monitor();
					}, (this.mediaLoadedFlag ? 100 : 2000) );
				} else {
					mw.log( "EmbedPlayerMultiDRM:: parent play returned false, don't issue play on player element" );
				}
			}
		},

		/**
		 * pause method calls parent_pause to update the interface
		 */
		pause: function () {
			try {
				this.getPlayerElement().pause();
			} catch (e) {
				mw.log("EmbedPlayerMultiDRM:: doPause failed");
			}
			this.parent_pause();
		},


		/**
		 * Handle the native paused event
		 */
		onPause: function () {
			var _this = this;
			this.playing = false;
			if (this.ignoreNextNativeEvent) {
				this.ignoreNextNativeEvent = false;
				return;
			}
			var timeSincePlay = Math.abs(this.absoluteStartPlayTime - new Date().getTime());
			this.log(" OnPaused:: propagate:" + this._propagateEvents +
			' time since play: ' + timeSincePlay + ' duringSeek:' + this.seeking);
			// Only trigger parent pause if more than MonitorRate time has gone by.
			// Some browsers trigger native pause events when they "play" or after a src switch
			if (!this.seeking && !this.userSlide
				&&
				timeSincePlay > mw.getConfig('EmbedPlayer.MonitorRate')
			) {
				_this.parent_pause();
				// in iphone when we're back from the native payer we need to show the image with the play button
				if (mw.isIphone()) {
					_this.updatePosterHTML();
				}
			} else {
				// try to continue playback:
				this.getPlayerElement().play();
			}
		},

		/**
		 * onPlay function callback from the kaltura flash player directly call the
		 * parent_play
		 */
		onPlay: function () {
			this.log(" OnPlay:: propogate:" + this._propagateEvents + ' paused: ' + this.paused);
			// if using native controls make sure the inteface does not block the native controls interface:
			if (this.useNativePlayerControls() && $(this).find('video ').length == 0) {
				$(this).hide();
			}

			// Update the interface ( if paused )
			if (!this.ignoreNextNativeEvent && this._propagateEvents && this.paused && ( mw.getConfig('EmbedPlayer.EnableIpadHTMLControls') === true )) {
				this.parent_play();
			} else {
				// make sure the interface reflects the current play state if not calling parent_play()
				this.playInterfaceUpdate();
				this.absoluteStartPlayTime = new Date().getTime();
			}
			// Set firstEmbedPlay state to false to avoid initial play invocation :
			this.ignoreNextNativeEvent = false;
		},
		_ondurationchange: function (event, data) {
			this.setDuration(this.getPlayerElement().duration());
		},
		/**
		 * Local method for metadata ready
		 * fired when metadata becomes available
		 *
		 * Used to update the media duration to
		 * accurately reflect the src duration
		 */
		_onloadedmetadata: function () {
			var player = this.getPlayerElement();
			var duration = player.duration();

			// Update if there's no duration or actual media duration is not the same as the metadata duration
			if ((!this.duration || (this.duration !== duration))
				&&
				player
				&& !isNaN(duration)
				&&
				isFinite(duration)
			) {
				this.log('onloadedmetadata metadata ready Update duration:' + duration + ' old dur: ' + this.getDuration());
				this.setDuration(this.playerElement.duration());
			}

			var subtitleTracks = player.subtitleTracks();
			if (subtitleTracks && subtitleTracks.length){
				var textTrackData = {languages: []};
				$.each(subtitleTracks, function(index, subtitleTrack){
					textTrackData.languages.push({
						'kind'		: 'subtitle',
						'language'	: subtitleTrack.lang,
						'srclang' 	: subtitleTrack.lang,
						'label'		: subtitleTrack.trackName,
						'id'		: subtitleTrack.id,
						'index'		: textTrackData.languages.length,
						'title'		: subtitleTrack.trackName
					});
				});
				this.onTextTracksReceived(textTrackData);
			}

			var audioTracks = player.audioTracks();
			if (audioTracks && audioTracks.length){
				var audioTrackData = {languages: []};
				$.each(audioTracks, function(index, audioTrack){
					audioTrackData.languages.push({
						'kind'		: 'audioTrack',
						'language'	: audioTrack,
						'srclang' 	: audioTrack,
						'label'		: audioTrack,
						'id'		: audioTrack,
						'index'		: audioTrackData.languages.length,
						'title'		: audioTrack
					});
				});
				this.onAudioTracksReceived(audioTrackData);
			}

			var _this = this;
			var update = function(){
				//Get Playback statistics
				var stats = player.getPlaybackStatistics();

				if (stats.audio.activeTrack){
					_this.onAudioTrackSelected({index: stats.audio.activeTrack.id});
				}
				if (stats.text.activeTrack){
				}
			};
			update();

			setInterval(function(){update();}, 5000);

			// Check if in "playing" state and we are _propagateEvents events and continue to playback:
			if (!this.paused && this._propagateEvents) {
				this.getPlayerElement().play();
			}

			//Fire "onLoaded" flags if set
			if (typeof this.onLoadedCallback == 'function') {
				this.onLoadedCallback();
			}

			// Trigger "media loaded"
			if (!this.mediaLoadedFlag) {
				$(this).trigger('mediaLoaded');
				this.mediaLoadedFlag = true;
			}
		},

		onAudioTracksReceived: function (data) {
			this.triggerHelper('audioTracksReceived', data);
		},

		onAudioTrackSelected: function (data) {
			this.triggerHelper('audioTrackIndexChanged', data);
		},

		onTextTracksReceived: function (data) {
			this.triggerHelper('textTracksReceived', data);
		},

		/**
		 * Local method for progress event
		 * fired as the video is downloaded / buffered
		 *
		 * Used to update the bufferedPercent
		 *
		 * Note: this way of updating buffer was only supported in Firefox 3.x and
		 * not supported in Firefox 4.x
		 */
		_onprogress: function (event) {
			var e = event.originalEvent;
			if (e && e.loaded && e.total) {
				this.updateBufferStatus(e.loaded / e.total);
				this.progressEventData = e.loaded;
			}
		},
		/**
		 * buffer under-run
		 * @private
		 */
		_onwaiting: function () {
			//vod buffer events are being handled by EmbedPlayer.js
			if (this.isLive()) {
				this.bufferStart();
			}
		},

		_oncanplay: function () {
			if (this.isLive() && this.buffering) {
				this.bufferEnd();
			}
		},
		/**
		 * Local method for end of media event
		 */
		_onended: function () {
			if (this.getPlayerElement()) {
				this.log('onended:' + this.playerElement.currentTime() + ' real dur:' + this.getDuration() + ' ended ' + this._propagateEvents);
				if (this._propagateEvents && !this.isLive()) {
					this.onClipDone();
				}
			}
		},
		/**
		 * playback error
		 */
		_onerror: function ( event ) {
			if( this.ignoreNextError ) {
				return;
			}
			var _this = this;
			// this time out is to give $( window ).unload method a chance to be called before showing page unload network errors.
			// we want to keep this value low to avoid delay in "access control" network errors.
			setTimeout(function(){
				if( _this.triggerNetworkErrorsFlag ){
					var error = {};
					var player = _this.getPlayerElement();
					if ( event && player && player.error ) {
						error.code = player.error().code;
						error.subtype = player.error().subtype;
						_this.log( '_onerror: MediaError code: ' + error.code + ', MediaError message: ' + error.subtype);
					}
				}
			}, 100);
		},
		/**
		 * Local method for seeking event
		 * fired when "seeking"
		 */
		_onseeking: function () {
			// don't handle seek event on Android native browser
			var nua = navigator.userAgent;
			var is_native_android_browser = ((nua.indexOf('Mozilla/5.0') > -1 &&
			nua.indexOf('Android ') > -1 &&
			nua.indexOf('AppleWebKit') > -1) && !(nua.indexOf('Chrome') > -1));

			if (is_native_android_browser) {
				return;
			}
			this.log("onSeeking " + this.seeking + ' new time: ' + this.getPlayerElement().currentTime());
			if (this.seeking && Math.round(this.getPlayerElement().currentTime - this.currentSeekTargetTime) > 2) {
				this.log("Error: Seek time mismatch: target:" + this.getPlayerElement().currentTime +
				' actual ' + this.currentSeekTargetTime + ', note apple HLS can only seek to 10 second targets');
			}
			// Trigger the html5 seeking event
			//( if not already set from interface )
			if (!this.seeking) {
				this.currentSeekTargetTime = this.getPlayerElement().currentTime();
				this.seeking = true;
				// Run the onSeeking interface update
				this.layoutBuilder.onSeek();

				// Trigger the html5 "seeking" trigger
				this.log("seeking:trigger:: " + this.seeking);
				if (this._propagateEvents) {
					this.triggerHelper('seeking');
				}
			}
		},
		/**
		 * Local method for seeked event
		 * fired when done seeking
		 */
		_onseeked: function () {
			this.log("onSeeked " + this.seeking + ' ct:' + this.playerElement.currentTime());

			// Trigger the html5 action on the parent
			if (this.seeking) {
				var _this = this;
				this.waitForSeekTarget().then(function(){
					_this.seeking = false;
					_this.isFlavorSwitching = false;
					if (_this._propagateEvents) {
						_this.log(" trigger: seeked");
						_this.triggerHelper('seeked', [_this.currentTime]);
					}
					_this.hideSpinner();
				});
			}
		},

		waitForSeekTarget: function(deferred, callbackCount){
			this.log("wait for seek target verification");
			var _this = this;
			var vid = this.getPlayerElement();
			var waitForSeekTargetDeferred = deferred || $.Deferred();

			// HLS safari triggers onseek when its not even close to the target time,
			// we don't want to trigger the seek event for these "fake" onseeked triggers
			if ((this.mediaElement.selectedSource.getMIMEType() === 'application/vnd.apple.mpegurl') &&
				( ( Math.abs(this.currentSeekTargetTime - this.getPlayerElement().currentTime) > 2) ||
				( this.currentSeekTargetTime > 0.01 && ( mw.isIpad() && !mw.isIOS8() ) ) ) ) {

				this.log( "Error: seeked triggred with time mismatch: target:" +
				this.currentSeekTargetTime + ' actual:' + this.getPlayerElement().currentTime );

				if( !callbackCount ){
					callbackCount = 0;
				}

				var canPlayBind = 'canplaythrough.nativePlayBind';
				vid.off(canPlayBind).one(canPlayBind, function () {
					if (vid.paused()){
						_this.log( "seek target verified" );
						return waitForSeekTargetDeferred.resolve();
					} else {
						var timeupdateCallback = function ( callbackCount ) {
							if ( (Math.abs( _this.currentSeekTargetTime - _this.getPlayerElement().currentTime() ) > 2) &&
								callbackCount <= 15 ) {
								setTimeout( function () {
									timeupdateCallback( callbackCount++ );
								}, 100 );
							} else {
								if ( callbackCount > 15 ) {
									_this.log( "Error: seek target failed" );
								} else {
									_this.log( "seek target verified" );
								}
								return waitForSeekTargetDeferred.resolve();
							}
						};

						var timeupdateBind = 'timeupdate.nativePlayBind';
						vid.off( timeupdateBind ).one( timeupdateBind, function () {
							timeupdateCallback( 0 );
						} );
					}
				});
				return waitForSeekTargetDeferred;
			} else {
				this.log("seek target verified");
				return waitForSeekTargetDeferred.resolve();
			}
		},
		/**
		 * Update Volume
		 *
		 * @param {Float} percent Value between 0 and 1 to set audio volume
		 */
		setPlayerElementVolume: function (percent) {
			if (this.getPlayerElement()) {
				// Disable mute if positive volume
				if (percent != 0 ) {
					this.getPlayerElement().muted(false);
				}
				this.getPlayerElement().volume(percent);
			}
		},

		/**
		 * get Volume
		 *
		 * @return {Float}
		 *    Audio volume between 0 and 1.
		 */
		getPlayerElementVolume: function () {
			if (this.getPlayerElement()) {
				return this.getPlayerElement().volume();
			}
		}
	};
})(mediaWiki, jQuery);