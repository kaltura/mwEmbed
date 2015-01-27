/*
 * The "kaltura player" embedPlayer interface for multi DRM
 */
(function (mw, $) {
	"use strict";

	mw.EmbedPlayerMultiDRM = {

		//Instance Name
		instanceOf: 'MultiDRM',

		bindPostfix: '.multiDRM',

		waitForPositiveCurrentTimeCount: 0,

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
			mw.log('EmbedPlayerKplayer:: Setup');

			// Check if we created the kPlayer container
			var $container = this.getPlayerContainer();

			// If container exists, show the player and exit
			if ($container.length) {
				$container.css('visibility', 'visible');
				readyCallback();
				return;
			}

			//Hide the native video tag
			this.hideNativePoster();

			// Create the container
			this.getVideoDisplay().prepend(
				$('<div />')
					.attr('id', this.playerContainerId)
					.addClass('maximize')
					.append($('<div />')
						.attr('id', "dasheverywhere"))
			);

			var _this = this;
			var config = this.config;
			this.getEntryUrl().then(function (srcToPlay) {
				//update config if needed

			var defaultConfig = {
				"drm": "auto",
				"keyId": "AAAAAAAA-BBBB-CCCC-DDDD-EEEEEEEEEEEE ",
				"customData":{
					"userId": "user1", "sessionId": "123", "merchant": "merchantid"
				},
				"assetId": "asset_001",
				"variantId": "",
				"authenticationToken": "xxx",
				"sendCustomData": true,
				"playReadyLicenseServerURL": "https://lic.staging.drmtoday.com/license-proxy- headerauth/drmtoday/RightsManager.asmx",
				"widevineLicenseServerURL": "https://lic.staging.drmtoday.com/license-proxy-widevine/cenc/",
				"accessLicenseServerURL": "https://lic. staging.drmtoday.com/flashaccess/LicenseTrigger/v1",
				"generatePSSH": true,
				"widevineHeader": {
					"provider": "test_provider",
					"contentId": "123",
					"trackType": "",
					"policy": ""
				},
				"playreadyHeader": {
					"laUrl": "http://lic.staging.drmtoday.com/license-proxy- headerauth/drmtoday/RightsManager.asmx",
					"luiUrl": "https://example.com"
				},
				"autoplay": true,
				"debug": true,
				"flashFile": 'dashas/dashas.swf',
				"width" : "640px",
				"height" : "320px",
				"techs" : ["dashas","dashjs","silverlight"],
				"enableSmoothStreamingCompatibility" : true
			};

				_this.dashPlayer = new castLabs.DashEverywhere(config);

				_this.dashPlayer.loadVideo(srcToPlay);
				_this.playerObject = _this.dashPlayer.getPlayer();
				_this.applyMediaElementBindings();
				readyCallback();
			});
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
			// Check if we already have a selected source and a player in the page,
			if (this.getPlayerElement() && this.getSrc()) {
				$(this.getPlayerElement()).attr('src', this.getSrc());
			}
			// Check if we already have a video element an apply bindings ( for native interfaces )
			if (this.getPlayerElement()) {
				this.applyMediaElementBindings();
				this.playbackRate = this.getPlayerElement().playbackRate;
			}

			this.parent_updateFeatureSupport();
		},
		supportsVolumeControl: function () {
			return  !( mw.isIpad() || mw.isAndroid() || mw.isMobileChrome() || this.useNativePlayerControls() )
		},
		/**
		 * Get the embed player time
		 */
		getPlayerElementTime: function () {
			// update currentTime
			return this.getPlayerElement().currentTime();
		},
		/**
		 * Get the embed flash object player Element
		 */
		getPlayerElement: function () {
			return this.playerObject;
		},

		getPlayerContainer: function () {
			if (!this.playerContainerId) {
				this.playerContainerId = 'multiDRM_' + this.id;
			}
			return $('#' + this.playerContainerId);
		},
		/**
		 * Get the URL to pass to KDP according to the current streamerType
		 */
		getEntryUrl: function () {
			var deferred = $.Deferred();
			var originalSrc = this.mediaElement.selectedSource.getSrc();
			var refObj = {src: originalSrc};
			this.triggerHelper('SourceSelected', refObj);
			deferred.resolve(refObj.src);
			return deferred;
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
		 * Return the embed code
		 */
		embedPlayerHTML: function () {

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
			// Update the player source ( if needed )
			if ($(vid).attr('src') != this.getSrc(this.currentTime)) {
				$(vid).attr('src', this.getSrc(this.currentTime));
			}

			if (this.muted) {
				vid.muted = true;
			}

			// Update the EmbedPlayer.WebKitAllowAirplay option:
			if (mw.getConfig('EmbedPlayer.WebKitAllowAirplay')) {
				$(vid).attr('x-webkit-airplay', "allow");
			}
			// make sure to display native controls if enabled:
			if (this.useNativePlayerControls()) {
				$(vid).attr('controls', "true");
			}
			// make sure the video is show ( both display and visibility attributes )
			$( vid ).show().css('visibility', '');

			// Apply media element bindings:
			_this.applyMediaElementBindings();

			// Make sure we start playing in the correct place:
			if (this.currentTime != vid.currentTime) {
				var waitReadyStateCount = 0;
				var checkReadyState = function () {
					if (vid.readyState > 0) {
						vid.currentTime = this.currentTime;
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
			$.each(_this.nativeEvents, function (inx, eventName) {
				if (mw.isIOS8() && mw.isIphone() && eventName === "seeking") {
					return;
				}
				vid.off(eventName).on(eventName, function () {
					// make sure we propagating events, and the current instance is in the correct closure.
					if (_this._propagateEvents && _this.instanceOf === _this.instanceOf) {
						var argArray = $.makeArray(arguments);
						console.info(eventName);
						// Check if there is local handler:
						if (_this[ '_on' + eventName ]) {
							_this[ '_on' + eventName ].apply(_this, argArray);
						} else {
							// No local handler directly propagate the event to the abstract object:
							$(_this).trigger(eventName, argArray);
						}
					}
				});
			});
		},
		/**
		 * play method calls parent_play to update the interface
		 */
		play: function () {
			if (this.parent_play()) {

				this.playerObject.play();
				this.monitor();
			} else {
				mw.log("EmbedPlayerMultiDRM:: parent play returned false, don't issue play on kplayer element");
			}
		},

		/**
		 * pause method calls parent_pause to update the interface
		 */
		pause: function () {
			try {
				this.playerObject.pause();
			} catch (e) {
				mw.log("EmbedPlayerMultiDRM:: doPause failed");
			}
			this.parent_pause();
		},

		/**
		 * Issue a seeking request.
		 *
		 * @param {Float} percent
		 * @param {bollean} stopAfterSeek if the player should stop after the seek
		 */
		seek: function (percent, stopAfterSeek) {
			var _this = this;
			// bounds check
			if (percent < 0) {
				percent = 0;
			}

			if (percent > 1) {
				percent = 1;
			}
			mw.log('EmbedPlayerNative::seek p: ' + percent + ' : ' + this.supportsURLTimeEncoding() + ' dur: ' + this.getDuration() + ' sts:' + this.seekTimeSec);

			// Save currentTime
			this.kPreSeekTime = _this.currentTime;

			// Trigger preSeek event for plugins that want to store pre seek conditions.
			var stopSeek = {value: false};
			this.triggerHelper('preSeek', [percent, stopAfterSeek, stopSeek]);
			if (stopSeek.value) {
				return;
			}

			this.seeking = true;
			// Update the current time ( local property )
			this.currentTime = ( percent * this.duration ).toFixed(2);

			// trigger the seeking event:
			mw.log('EmbedPlayerNative::seek:trigger');
			this.triggerHelper('seeking');

			// Run the onSeeking interface update
			this.layoutBuilder.onSeek();

			// @@todo check if the clip is loaded here (if so we can do a local seek)
			// Try to do a play then seek:
			this.doNativeSeek(percent, function () {
				if (stopAfterSeek) {
					_this.hideSpinner();
					// pause in a non-blocking call to avoid synchronous playing event
					setTimeout(function () {
						_this.pause();
						_this.updatePlayheadStatus();
					}, 0);
				} else {
					// continue to playback ( in a non-blocking call to avoid synchronous pause event )
					setTimeout(function () {
						if (!_this.stopPlayAfterSeek) {
							mw.log("EmbedPlayerNative::sPlay after seek");
							_this.play();
							_this.stopPlayAfterSeek = false;
						}
					}, 0);
				}
			});
		},
		/**
		 * Do a native seek by updating the currentTime
		 * @param {float} percent
		 *        Percent to seek to of full time
		 */
		doNativeSeek: function (percent, callback) {

			// If player already seeking, exit
			var _this = this;
			// chrome crashes with multiple seeks:
			if ((navigator.userAgent.indexOf('Chrome') === -1) && _this.playerElement.seeking) {
				return;
			}

			mw.log('EmbedPlayerNative::doNativeSeek::' + percent);
			this.seeking = true;

			this.seekTimeSec = 0;

			// Hide iPad video off screen ( iOS shows quicktime logo during seek )
			if (mw.isIOS()) {
				this.hidePlayerOffScreen();
			}

			var targetTime = percent * this.getDuration();

			// adjust seek target per startOffset
			if (this.startOffset) {
				targetTime += parseFloat(this.startOffset);
			}

			this.setCurrentTime(targetTime, function () {
				// Update the current time ( so that there is not a monitor delay in reflecting "seeked time" )
				_this.currentTime = _this.getPlayerElement().currentTime;
				// Done seeking ( should be a fallback trigger event ) :
				if (_this.seeking) {
					_this.seeking = false;
					$(_this).trigger('seeked');
				}
				// restore iPad video position:
				_this.restorePlayerOnScreen();
				_this.monitor();
				// issue the callback:
				if( callback ){
					callback();
				}
			});
		},
		/**
		 * Set the current time with a callback
		 *
		 * @param {Float} position
		 * 		Seconds to set the time to
		 * @param {Function} callback
		 * 		Function called once time has been set.
		 */
		setCurrentTime: function( seekTime , callback, callbackCount ) {
			var _this = this;
			if( !callbackCount ){
				callbackCount = 0;
			}
			seekTime = parseFloat( seekTime );
			mw.log( "EmbedPlayerNative:: setCurrentTime seekTime:" + seekTime + ' count:' + callbackCount );
			if ( seekTime == 0 && this.isLive() && mw.isIpad() && !mw.isIOS8() ) {
				//seek to 0 doesn't work well on live on iOS < 8
				seekTime = 0.01;
				mw.log( "EmbedPlayerNative:: setCurrentTime fix seekTime to 0.01" );
			}
			var vid = this.getPlayerElement();

			if (this.currentState == "end" && mw.isIphone()) {
				vid.play();
				this.playing = true;
			}

			// some initial calls to prime the seek:
			if (callbackCount == 0 && vid.currentTime() == 0) {
				// when seeking turn off preload none and issue a load call.
				$(vid.contentEl())
					.attr('preload', 'auto')
					[0].load();
			}

			// Make sure all the timeouts don't seek to an expired target:
			$(this).data('currentSeekTarget', seekTime);

			// add a callback handler to null out callback:
			var callbackHandler = function () {
				// reset the seeking flag:
				_this.seeking = false;
				//null the seek target:
				if ($.isFunction(callback)) {
					callback();
					callback = null;
				}
			};
			// Check if player is ready for seek:
			if ( $(vid.contentEl()).readyState < 1 ) {
				// if on the first call ( and video not ready issue load, play
				if (callbackCount == 0 && vid.paused) {
					this.stopEventPropagation();
					vid.on('play.seekPrePlay', function () {
						_this.restoreEventPropagation();
						vid.off('play.seekPrePlay');
						// NOTE: there is no need to "pause" here since parent caller will
						// handle if the player should continue to play at seek time or not .
					});
					vid.load();
					vid.play();
				}
				// Try to seek for 15 seconds:
				if (callbackCount >= 15) {
					mw.log("Error:: EmbedPlayerNative: with seek request, media never in ready state");
					callbackHandler();
					return;
				}
				setTimeout(function () {
					// Check that this seek did not expire:
					if ($(_this).data('currentSeekTarget') != seekTime) {
						mw.log("EmbedPlayerNative:: expired seek target");
						return;
					}
					_this.setCurrentTime(seekTime, callback, callbackCount + 1);
				}, 1000);
				return;
			}
			// Check if currentTime is already set to the seek target:
			if (vid.currentTime().toFixed(2) == seekTime.toFixed(2)) {
				mw.log("EmbedPlayerNative:: setCurrentTime: current time matches seek target: " +
					vid.currentTime().toFixed(2) + ' == ' + seekTime.toFixed(2));
				callbackHandler();
				return;
			}
			// setup a namespaced seek bind:
			var seekBind = 'seeked.nativeSeekBind';

			// Bind a seeked listener for the callback
			vid.off(seekBind).one(seekBind, function (event) {


				// Check if seeking to zero:
				if (seekTime == 0 && vid.currentTime == 0) {
					callbackHandler();
					return;
				}
				//not replay seek
				if (seekTime > 0.01 && _this.isFakeHlsSeek()) {
					var canPlayBind = 'canplay.nativePlayBind';
					vid.one(canPlayBind, function (event) {

						callbackHandler();
					});
				} else {
					// Check if we got a valid seek:
					if (vid.currentTime() > 0) {
						callbackHandler();
					} else {
						mw.log("Error:: EmbedPlayerNative: seek callback without time updated " + vid.currentTime);
					}
				}
			});
			setTimeout(function () {
				// Check that this seek did not expire:
				if ($(_this).data('currentSeekTarget') != seekTime) {
					mw.log("EmbedPlayerNative:: Expired seek target");
					return;
				}

				if ($.isFunction(callback)) {
					// if seek is within 5 seconds of the target assume success. ( key frame intervals can mess with seek accuracy )
					// this only runs where the seek callback failed ( i.e broken html5 seek ? )
					if (Math.abs(vid.currentTime - seekTime) < 5) {
						mw.log("EmbedPlayerNative:: Video time: " + vid.currentTime + " is within 5 seconds of target" + seekTime + ", sucessfull seek");
						callbackHandler();
					} else {
						mw.log("Error:: EmbedPlayerNative: Seek still has not made a callback after 5 seconds, retry");
						_this.setCurrentTime(seekTime, callback, callbackCount++);
					}
				}
			}, ( mw.isIOS8() && mw.isIpad() ) ? 100 : 5000);

			// Try to update the playerElement time:
			try {
				_this.seeking = true;
				_this.currentSeekTargetTime = seekTime.toFixed(2);
				// use toFixed ( iOS issue with float seek times )
				vid.currentTime(_this.currentSeekTargetTime);
			} catch (e) {
				mw.log("Error:: EmbedPlayerNative: Could not set video tag seekTime");
				callbackHandler();
				return;
			}

			// Check for seeking state ( some player iOS / iPad can only seek while playing )
			if (!vid.seeking() || ( ( mw.isIOS8() || mw.isIOS7() ) && vid.paused )) {
				mw.log("Error:: not entering seek state, play and wait for positive time");
				vid.play();
				setTimeout(function () {
					_this.waitForPositiveCurrentTime(function () {
						mw.log("EmbedPlayerNative:: Got possitive time:" + vid.currentTime().toFixed(2) + ", trying to seek again");
						_this.setCurrentTime(seekTime, callback, callbackCount + 1);
					});
				}, mw.getConfig('EmbedPlayer.MonitorRate'));
			}
		},
		waitForPositiveCurrentTime: function (callback) {
			var _this = this;
			var vid = this.getPlayerElement();
			this.waitForPositiveCurrentTimeCount++;
			// Wait for playback for 10 seconds
			if (vid.currentTime() > 0) {
				mw.log('EmbedPlayerNative:: waitForPositiveCurrentTime success');
				this.waitForPositiveCurrentTimeCount = 0;
				callback();
			} else if (this.waitForPositiveCurrentTimeCount > 200) {
				mw.log("Error:: waitForPositiveCurrentTime failed to reach possitve time");
				callback();
			} else {
				setTimeout(function () {
					_this.waitForPositiveCurrentTime(callback);
				}, 50);
			}
		},
		/**
		 * on Pause callback from the kaltura flash player calls parent_pause to
		 * update the interface
		 */
		onPause: function () {
			$(this).trigger("pause");
		},

		/**
		 * onPlay function callback from the kaltura flash player directly call the
		 * parent_play
		 */
		onPlay: function () {
			if (this._propagateEvents) {
				$(this).trigger("playing");
				this.hideSpinner();
				if (this.isLive()) {
					this.ignoreEnableGui = false;
					this.enablePlayControls(['sourceSelector']);
				}
				this.stopped = this.paused = false;
			}
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
			this.getPlayerElement();

			// only update duration if we don't have one: ( some browsers give bad duration )
			// like Android 4 default browser
			if (!this.duration
				&&
				this.playerElement
				&& !isNaN(this.playerElement.duration)
				&&
				isFinite(this.playerElement.duration)
				) {
				mw.log('EmbedPlayerNative :onloadedmetadata metadata ready Update duration:' + this.playerElement.duration + ' old dur: ' + this.getDuration());
				this.setDuration(this.playerElement.duration);
			}

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
		},

	};
})(mediaWiki, jQuery);