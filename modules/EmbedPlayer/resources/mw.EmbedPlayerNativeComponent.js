/**
 * Native embed library:
 *
 * Enables embedPlayer support for native iOS/Android webView playback system
 */

(function (mw, $) {
	"use strict";
	//make the player transparent to see the native iOS/Android player
	if (mw.getConfig("EmbedPlayer.ForceNativeComponent")) {
		$('body,.videoHolder').css('background-color', 'transparent');
	}

	mw.EmbedPlayerNativeComponent = {
		//Instance Name
		instanceOf: 'NativeComponent',

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

		// A flag to keep the video tag offscreen.
		keepPlayerOffScreenFlag: null,

		// A flag to designate the first play event, as to not propagate the native event in this case
		ignoreNextNativeEvent: null,

		// A local var to store the current seek target time:
		currentSeekTargetTime: null,

		// Disable switch source callback
		disableSwitchSourceCallback: false,

		// All the native events per:
		// http://www.w3.org/TR/html5/video.html#mediaevents
		nativeEvents: [
			'stop',
			'play',
			'pause',
			'canplay',
			'seeking',
			'seeked',
			'ended',
			'error',
			'stalled',
			'loadedmetadata',
			'timeupdate',
			'progress',
			'enterfullscreen',
			'exitfullscreen',
			'durationchange',
			'chromecastDeviceConnected',
			'chromecastDeviceDisConnected'
		],

		nativeActions: [
			'share',
			'openHomePage'
		],
		// Native player supported feature set
		supports: {
			'playHead': true,
			'pause': true,
			'fullscreen': true,
			'SourceSelector': false,
			'timeDisplay': true,
			'volumeControl': false,
			'overlays': true
		},

		setup: function (readyCallback) {
			var _this = this;
			mw.log("NativeComponent:: setup");
			// remove any existing pid ( if present )
			$('#' + this.pid).remove();

			var divElement = document.createElement("div");
			divElement.setAttribute('id', 'proxy');
			document.body.appendChild(divElement);

			this.proxyElement = divElement;
			try {
				if (NativeBridge.videoPlayer) {
					NativeBridge.videoPlayer.registePlayer(this.getPlayerElement());
					NativeBridge.videoPlayer.registerEmbedPlayer(this);
				}
			}
			catch (e) {
				alert(e);
			}

			this.applyMediaElementBindings();

			this.bindHelper("SourceChange", function () {
				_this.getPlayerElement().attr('src', this.getSrc());
			});
			this.bindHelper("layoutBuildDone ended", function () {
				_this.getPlayerElement().notifyLayoutReady();
			});
			this.bindHelper("showChromecastDeviceList", function () {
				mw.log("EmbedPlayerNativeComponent:: showChromecastDeviceList::");
				_this.getPlayerElement().showChromecastDeviceList();
			});
			this.resolveSrcURL(this.getSrc()).then(
				function (resolvedSrc) {
					mw.log("EmbedPlayerNativeComponent::resolveSrcURL get succeeded");
					_this.getPlayerElement().attr('src', resolvedSrc);
					readyCallback();
				},
				function () {
					mw.log("EmbedPlayerNativeComponent::resolveSrcURL get failed");
					_this.getPlayerElement().attr('src', _this.getSrc());
					readyCallback();
				}
			);
		},

		embedPlayerHTML: function () {
		},

		playerSwitchSource: function (source, switchCallback, doneCallback) {
			mw.log("NativeComponent:: playerSwitchSource");
			var _this = this;
			var vid = this.getPlayerElement();
			var switchBindPostfix = '.playerSwitchSource';

			// remove old binding:
			$(vid).unbind(switchBindPostfix);

			// add a loading indicator:
			_this.addPlayerSpinner();

			// empty out any existing sources:
			$(vid).empty();

			if (this.getSrc() != source.getSrc()) {
				vid.attr('src', source.getSrc());
			} else {
				vid.attr('src', this.getSrc());
			}

			this.isPauseLoading = false;
			_this.hideSpinner();
			if ($.isFunction(switchCallback)) {
				switchCallback(vid);
				var isPlayingAdsContext = this.adsOnReplay || !(this.adTimeline.displayedSlotCount > 0);
				if ( isPlayingAdsContext || this.loop ){
					setTimeout(function () {
						vid.play();
					}, 100);
				}
			}


			// Add the end binding if we have a post event:
			if ($.isFunction(doneCallback)) {
				$(vid).bind('ended' + switchBindPostfix, function (event) {
					if (_this.disableSwitchSourceCallback) {
						return;
					}
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
			}
		},

		/**
		 * Apply media element bindings
		 */
		applyMediaElementBindings: function () {
			var _this = this;
			mw.log("EmbedPlayerNative::MediaElementBindings");

			$.each(_this.nativeEvents, function (inx, eventName) {
				$(_this.getPlayerElement()).unbind(eventName).bind(eventName, function () {
					// make sure we propagating events, and the current instance is in the correct closure.
					if (_this._propagateEvents && _this.instanceOf == 'NativeComponent') {
						var argArray = $.makeArray(arguments);
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
		 * Get the embed player time
		 */
		getPlayerElementTime: function () {
			var _this = this;
			// Make sure we have .vid obj

			if (!this.getPlayerElement()) {
				mw.log('EmbedPlayerNative::getPlayerElementTime: ' + this.id + ' not in dom ( stop monitor)');
				this.stop();
				return false;
			}
			var ct = this.getPlayerElement().attr('currentTime');
			// Return 0 or a positive number:
			if (!ct || isNaN(ct) || ct < 0 || !isFinite(ct)) {
				return 0;
			}
			// Return the playerElement currentTime
			return  ct;
		},

		/**
		 * Get /update the playerElement value
		 */
		getPlayerElement: function () {
			return this.proxyElement;
		},

		/**
		 * Stop the player ( end all listeners )
		 */
		stop: function(){
			var _this = this;
			if( this.playerElement && this.playerElement.currentTime){
				this.playerElement.pause();
			}
			this.parent_stop();
		},

		/**
		 * Play back the video stream
		 * calls parent_play to update the interface
		 */

		play: function () {
			mw.log("EmbedPlayerNativeComponent:: play::");

			this.removePoster();

			if (this.parent_play()) {
				if (this.getPlayerElement()) { // update player
					this.getPlayerElement().play();
				}
				this.monitor();
			}
		},

		/**
		 * Pause the video playback
		 * calls parent_pause to update the interface
		 */
		pause: function () {
			mw.log("EmbedPlayerNativeComponent:: pause::");
			this.parent_pause(); // update interface
			if (this.getPlayerElement()) { // update player
				this.getPlayerElement().pause();
			}
		},

		seek: function (percentage) {
			mw.log("EmbedPlayerNativeComponent:: seek::");
			var seekTime = percentage * this.getDuration();
			this.getPlayerElement().attr('currentTime', seekTime);
			this.parent_seek(percentage);
		},

		doNativeAction: function (actionParams) {
			mw.log("EmbedPlayerNativeComponent:: doNativeAction::");
			this.getPlayerElement().attr('nativeAction', actionParams);
			this.getPlayerElement().doNativeAction();
		},

		nativeActionType: function (actionName) {
			return $.inArray(actionName, this.nativeActions);
		},

		isNativeApp: function () {
			return mw.getConfig("EmbedPlayer.ForceNativeComponent");
		},

		/**
		 * returns true if device can auto play
		 */
		canAutoPlay: function () {
			return true;
		},

		/**
		 * Handle the native play event
		 */
		_onplay: function () {
			mw.log("EmbedPlayerNativeComponent:: OnPlay::");

			$(this).trigger("playing");
			this.removePoster();
			
			if (this.paused && this.parent_play()) {
				this.monitor();
			}
		},

		/**
		 * Handle the native paused event
		 */
		/**
		 * Handle the native paused event
		 */
		_onpause: function () {
			mw.log("EmbedPlayerNativeComponent:: OnPause::");
			this.parent_pause();
		},

		/**
		 * Local method for seeking event
		 * fired when "seeking"
		 */
		_onseeking: function () {
			mw.log("EmbedPlayerNative::onSeeking ");
			if (!this.seeking) {
				this.seeking = true;
				// Run the onSeeking interface update
				this.layoutBuilder.onSeek();

				if (this._propagateEvents) {
					// Trigger the html5 "seeking" trigger
					mw.log("EmbedPlayerNative::seeking:trigger:: ");
					this.triggerHelper('seeking');
				}
			}
		},

		/**
		 * Local method for seeked event
		 * fired when done seeking
		 */
		_onseeked: function () {
			mw.log("EmbedPlayerNativeComponent::onSeeked ");
			if (this.seeking) {
				this.seeking = false;

				if (this._propagateEvents) {
					mw.log("EmbedPlayerNativeComponent:: trigger: seeked");
					this.triggerHelper('seeked');
				}

				this.hideSpinner();
				this.updatePlayheadStatus();
				this.monitor();
			}
		},

		/**
		 * Local method for metadata ready
		 * fired when metadata becomes available
		 *
		 * Used to update the media duration to
		 * accurately reflect the src duration
		 */
		_onloadedmetadata: function () {
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
		 * Local method for end of media event
		 */
		_onended: function (event) {
			if (this.getPlayerElement()) {
				mw.log('EmbedPlayer:native: onended:');
				if (this._propagateEvents) {
					this.onClipDone();
				}
			}
		},

		/**
		 * Local onClip done function for native player.
		 */
		onClipDone: function () {
			mw.log('EmbedPlayer:native: oneClipDone:');
			this.parent_onClipDone();
		},

		/**
		 * playback error
		 */
		_onerror: function (event, data) {
			this.triggerHelper('embedPlayerError', [ data ]);
		},

		/**
		 * buffer progress
		 * @param event
		 * @param progress
		 * @private
		 */
		_onprogress: function (event, progress) {
			if (typeof progress !== 'undefined') {
				this.updateBufferStatus(progress);
			}
		},

		/*
		 * Write the Embed html to the target
		 */
		getVideoElementPosition: function () {
			var videoElementDiv = parent.document.getElementById(this.id);
			var videoElementRect = videoElementDiv.getBoundingClientRect();

			return videoElementRect;
		},

		showNativePlayer: function () {
			this.getPlayerElement().showNativePlayer();
		},

		hideNativePlayer: function () {
			this.getPlayerElement().hideNativePlayer();
		},

		useNativePlayerControls: function () {
			return false;
		},

		/**
		 * Passes a fullscreen request to the layoutBuilder interface
		 */
		toggleFullscreen: function () {
			this.getPlayerElement().toggleFullscreen();
		},

		doneFSBtnPressed: function () {
			this.getPlayerElement().doneFSBtnPressed();
		},

		addNativeAirPlayButton: function () {
			this.getPlayerElement().addNativeAirPlayButton();
		},

		showNativeAirPlayButton: function (airPlayBtnPosition) {
			var x = airPlayBtnPosition.left;
			var y = airPlayBtnPosition.top;
			var w = airPlayBtnPosition.right - airPlayBtnPosition.left;
			var h = airPlayBtnPosition.bottom - airPlayBtnPosition.top;

			this.getPlayerElement().showNativeAirPlayButton([x, y, w, h]);
		},

		hideNativeAirPlayButton: function () {
			this.getPlayerElement().hideNativeAirPlayButton();
		},

		isVideoSiblingEnabled: function () {
			return false;
		}
	};
})(mediaWiki, jQuery);


