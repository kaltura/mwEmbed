/*
 * The "kaltura player" embedPlayer interface for multi DRM
 */
(function (mw, $) {
	"use strict";

	mw.EmbedPlayerMultiDRM = {

		//Instance Name
		instanceOf: 'MultiDRM',

		bindPostfix: '.multiDRM',

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
debugger;
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
			var config = {};
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
				_this.playerObject = _this.dashPlayer.getPlayer().contentEl();
				_this.applyMediaElementBindings();
				_this.dashPlayer.loadVideo(srcToPlay);
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
				$(vid).unbind(eventName + _this.bindPostfix).bind(eventName + _this.bindPostfix, function () {
					// make sure we propagating events, and the current instance is in the correct closure.
					if (_this._propagateEvents && _this.instanceOf === _this.instanceOf) {
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
		}
	};
})(mediaWiki, jQuery);