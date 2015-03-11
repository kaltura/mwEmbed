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

			readyCallback();
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
				this.playbackRate = this.getPlayerElement().playbackRate();
			}

			this.parent_updateFeatureSupport();
		},
		supportsVolumeControl: function () {
			return  !( mw.isIpad() || mw.isAndroid() || mw.isMobileChrome() || this.useNativePlayerControls() )
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

			// empty out any existing sources:
			if (vid && !mw.isIphone()) {  //if track element attached for iphone it won't be deleted
				$(vid).empty();
			}

			// Check if we created the Player container
			var $container = this.getPlayerContainer();

			// If container exists, show the player and exit
			if ($container.length) {
				$container.css('visibility', 'visible');
				_this.postEmbedActions();
				return;
			}

			if (vid && $(vid).attr('src') == this.getSrc(this.currentTime)) {
				_this.postEmbedActions();
				return;
			}

			//Hide the native video tag
			this.hideNativePoster();

			mw.log("EmbedPlayerNative::embedPlayerHTML > play url:" + this.getSrc(this.currentTime) + ' startOffset: ' + this.start_ntp + ' end: ' + this.end_ntp);

			// Check if using native controls and already the "pid" is already in the DOM
			if (this.isPersistentNativePlayer() && vid) {
				_this.postEmbedActions();
				return;
			}
			// Reset some play state flags:
			_this.bufferStartFlag = false;
			_this.bufferEndFlag = false;

			this.setPlayerHtml();
			var drmConfig = mw.getConfig("EmbedPlayer.DrmConfig");
			if (drmConfig.autoplay){
				drmConfig.autoplay = false;
				this.autoplay = true;
			}

			var licenseBaseUrl = mw.getConfig('Kaltura.UdrmServerURL');
			if (!licenseBaseUrl) {
				this.log('Error:: failed to retrieve UDRM license URL ');
			}

			//TODO: error handling in case of error

			var assetId = this.mediaElement.selectedSource.getAssetId();
			var licenseData = this.getLicenseData(assetId);

			drmConfig.widevineLicenseServerURL = licenseBaseUrl + licenseData;
			drmConfig.assetId = this.kentryid;
			drmConfig.variantId = assetId;

			var eventObj = {
				customString: drmConfig
			};

			this.triggerHelper('challengeCustomData', eventObj);

			drmConfig = eventObj.customString;

			this.dashPlayer = new castLabs.DashEverywhere(drmConfig);

			this.dashPlayer.loadVideo(this.getSrc(this.currentTime));
			this.playerObject = _this.dashPlayer.getPlayer();

			// Directly run postEmbedActions ( if playerElement is not available it will retry )
			_this.postEmbedActions();
		},
		getLicenseData: function(assetId){
			return "";
		},
		/**
		 * Get the native player embed code.
		 *
		 * @param {object} playerAttribtues Attributes to be override in function call
		 * @return {object} cssSet css to apply to the player
		 */
		setPlayerHtml: function (playerAttribtues, cssSet) {
			if (!playerAttribtues) {
				playerAttribtues = {};
			}
			// Update required attributes
			if (!playerAttribtues['id']) {
				playerAttribtues['id'] = this.playerContainerId;
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

			this.getVideoDisplay().prepend(
				$('<div />')
					.attr(playerAttribtues)
					.css(cssSet)
					.addClass('maximize')
					.append($('<div />')
						.attr('id', "dasheverywhere"))
			);
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
//			if (vid.currentSrc() != this.getSrc(this.currentTime)) {
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
			$( vid.contentEl() ).show().css('visibility', '');

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
			$.each(_this.nativeEvents, function (inx, eventName) {
				if (mw.isIOS8() && mw.isIphone() && eventName === "seeking") {
					return;
				}
				vid.off(eventName).on(eventName, function () {
					// make sure we propagating events, and the current instance is in the correct closure.
					if (_this._propagateEvents && _this.instanceOf === _this.instanceOf) {
						var argArray = $.makeArray(arguments);
						if (eventName!=="timeupdate" && eventName!=="progress")console.info(eventName);
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

			if ( (vidObj && vidObj.readyState < 1) || (this.getDuration() === 0)) {
				// if on the first call ( and video not ready issue load, play
				if (callbackCount == 0 && vid.paused()) {
					this.stopEventPropagation();

					var eventName = mw.isIOS() ? "canplaythrough.seekPrePlay" : "canplay.seekPrePlay";
					vid.off(eventName).one(eventName, function () {
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
//					vid.load();
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
		}

	};
})(mediaWiki, jQuery);