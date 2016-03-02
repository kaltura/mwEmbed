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

		bindPostfix: '.EmbedPlayerNativeComponent',

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

		playbackDone: false,

		playingSource: undefined,

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
			'durationchange',
			'timeupdate',
			'progress',
			'bufferchange',
			'enterfullscreen',
			'exitfullscreen',
			'chromecastDeviceConnected',
			'chromecastDeviceDisConnected',
			'textTracksReceived',
			'loadEmbeddedCaptions',
			'flavorsListChanged',
			'sourceSwitchingStarted',
			'sourceSwitchingEnd'
		],

		// Native player supported feature set
		supports: {
			'playHead': true,
			'pause': true,
			'fullscreen': true,
			'SourceSelector': true,
			'timeDisplay': true,
			'volumeControl': false,
			'overlays': true
		},

		canPlay: function(readyCallback){
			var deferred =  $.Deferred();
			this.bindHelper("canplay", function () {
				readyCallback();
				return deferred.resolve();
			});

			return deferred;
		},

		setup: function (readyCallback) {
			var _this = this;
			mw.log("NativeComponent:: setup");
			// remove any existing pid ( if present )
			$('#' + this.pid).remove();

			var divElement = document.createElement("div");
			divElement.setAttribute('id', 'proxy');
			divElement['paused'] = true;
			document.body.appendChild(divElement);

			this.proxyElement = divElement;
			try {
				if (NativeBridge.videoPlayer) {
					NativeBridge.videoPlayer.registerPlayer(this.getPlayerElement());
					NativeBridge.videoPlayer.registerEmbedPlayer(this);
				}
			}
			catch (e) {
				alert(e);
			}

			this.canPlayPromise = this.canPlay(readyCallback);

			this.applyMediaElementBindings();

			this.bindHelper("layoutBuildDone ended", function () {
				_this.getPlayerElement().notifyLayoutReady();
			});
			this.bindHelper("showChromecastDeviceList", function () {
				mw.log("EmbedPlayerNativeComponent:: showChromecastDeviceList::");
				_this.getPlayerElement().showChromecastDeviceList();
			});
			this.bindHelper("onEndedDone", function () {
				_this.playbackDone = true;
			});

			this.resolveSrcURL(this.getSrc()).then(
				function (resolvedSrc) {
					mw.log("EmbedPlayerNativeComponent::resolveSrcURL get succeeded");
					_this.setSrcAttribute( resolvedSrc );
				},
				function () {
					mw.log("EmbedPlayerNativeComponent::resolveSrcURL get failed");
					_this.setSrcAttribute( _this.getSrc() );
					readyCallback();
				}
			);
		},

		embedPlayerHTML: function () {
		},

		// Build the licenseUri (if needed) and send it to the native component as the "licenseUri" attribute.
		pushLicenseUri: function () {
			var licenseServer = mw.getConfig('Kaltura.UdrmServerURL');
			var licenseParams = this.mediaElement.getLicenseUriComponent();

			if (licenseServer && licenseParams) {
				var licenseUri;
				// Build licenseUri by mimeType.
				var sourceMimeType = this.mediaElement.selectedSource && this.mediaElement.selectedSource.mimeType;
				switch (sourceMimeType) {
					case "video/wvm":
						// widevine classic
						licenseUri = licenseServer + "/widevine/license?" + licenseParams;
						break;
					case "application/dash+xml":
						// widevine modular, because we don't have any other dash DRM right now.
						licenseUri = licenseServer + "/cenc/widevine/license?" + licenseParams;
						break;
					default:
						break;
				}
				if (licenseUri) {
					this.getPlayerElement().attr('licenseUri', licenseUri);
				}
			}
		},

		setSrcAttribute: function( source ) {
			this.getPlayerElement().attr('src', source);
			this.playingSource =  source;
			this.pushLicenseUri();
		},

		playerSwitchSource: function (source, switchCallback, doneCallback) {
			mw.log("NativeComponent:: playerSwitchSource");
			var _this = this;
			this.canPlayPromise = this.canPlay(switchCallback);
			var vid = this.getPlayerElement();
			var src = source.getSrc();
			var switchBindPostfix = '.playerSwitchSource';

			// Make sure the switch source is different:
			if ( !src || src == this.playingSource ) {
				if ($.isFunction(switchCallback)) {
					switchCallback(vid);
				}
				// Delay done callback to allow any non-blocking switch callback code to fully execute
				if ($.isFunction(doneCallback)) {
					doneCallback();
				}
				return;
			}


			// remove old binding:
			$(vid).unbind(switchBindPostfix);

			// add a loading indicator:
			_this.addPlayerSpinner();

			// empty out any existing sources:
			$(vid).empty();
			this.setSrcAttribute( src );

			this.isPauseLoading = false;
			// Update some parent embedPlayer vars:
			this.currentTime = 0;
			this.previousTime = 0;


			if ($.isFunction(switchCallback)) {
				$(vid).bind('durationchange' + switchBindPostfix, function () {
					$( vid ).unbind( 'durationchange' + switchBindPostfix );
					switchCallback( vid );
				} );
			}

			// Add the end binding if we have a post event:
			if ($.isFunction(doneCallback)) {
				$(vid).bind('ended' + switchBindPostfix, function (event) {
					_this.currentTime = 0;
					_this.previousTime = 0;
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

		changeMediaCallback: function (callback) {
			var _this = this;
			// If switching a Persistent native player update the source:
			// ( stop and play won't refresh the source  )
			_this.switchPlaySource(this.getSource(), function () {
				if (!_this.autoplay  || ( _this.autoplay && mw.isMobileDevice()) ) {
					// pause is need to keep pause state, while
					// switch source calls .play() that some browsers require.
					// to reflect source switches. Playlists handle pause state so no need to pause in playlist
					_this.ignoreNextNativeEvent = true;
					if ( !_this.playlist ){
						_this.pause();
					}
					_this.updatePosterHTML();
				}
				callback();
			});
		},

		applyMediaElementBindings: function () {
			var _this = this;
			mw.log("EmbedPlayerNative::MediaElementBindings");
			var bindPostfix = '.embedPlayerNativeComponent';

			$.each(_this.nativeEvents, function (inx, eventName) {
				$( _this.getPlayerElement() ).unbind( eventName + bindPostfix ).bind( eventName + bindPostfix, function () {
					// make sure we propagating events, and the current instance is in the correct closure.
					if ( _this._propagateEvents && _this.instanceOf == 'NativeComponent' ) {
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
			var _this = this;
			mw.log("EmbedPlayerNativeComponent:: play::");
			this.playbackDone = false;

			this.unbindHelper('replayEvent').bindHelper('replayEvent',function(){
				this.getPlayerElement().replay();
			});

			var doPlay = function(){
				if (_this.parent_play()) {
					if (_this.getPlayerElement()) { // update player
						_this.getPlayerElement().play();
					}
					_this.monitor();
				}
				_this.removePoster();
			}

			this.canPlayPromise.then(function() {
				doPlay();
			});
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

		doSeek: function (seekTime) {
			mw.log("EmbedPlayerNativeComponent:: seek::");
			this.getPlayerElement().attr('currentTime', seekTime);
		},

		/**
		 * Set the current time with a callback
		 *
		 * @param {Float} position
		 * 		Seconds to set the time to
		 * @param {Function} callback
		 * 		Function called once time has been set.
		 */
		setCurrentTime: function( seekTime , callback ) {
			seekTime = parseFloat( seekTime );
			mw.log( "EmbedPlayerNativeComponent:: setCurrentTime to " + seekTime );
			this.getPlayerElement().attr('currentTime', seekTime);
			if ($.isFunction(callback)) {
				callback();
			}
		},

		backToLive: function () {
			this.triggerHelper('movingBackToLive');
			this.getPlayerElement().attr('goLive', 'true');
		},

		doNativeAction: function (actionParams) {
			mw.log("EmbedPlayerNativeComponent:: doNativeAction::");
			this.getPlayerElement().attr('nativeAction', actionParams);
			this.getPlayerElement().doNativeAction();
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

		_onflavorsListChanged: function(event, data) {
//			mw.log("_onFlavorsListChanged", event, data);

			// Build an array with this format:
			// [{"assetid":0,"bandwidth":517120,"type":"video/mp4","height":0},{"assetid":1,"bandwidth":727040,"type":"video/mp4","height":0},{"assetid":2,"bandwidth":1041408,"type":"video/mp4","height":0}]
			//

			var flavorsList = [];
			$.each(data.tracks, function(idx, obj) {
				var flavor = {
					assetid: obj.originalIndex,
					originalIndex: obj.originalIndex,
					bandwidth: obj.bitrate,
					height: obj.height,
					width: obj.width,
					type: "video/mp4" // not sure about that
				};
				flavorsList.push(flavor);
			});

			this.onFlavorsListChanged(flavorsList);
		},

		_onsourceSwitchingStarted: function(event, data) {
			$(this).trigger('sourceSwitchingStarted', data);
		},

		_onsourceSwitchingEnd: function(event, data) {
            $(this).trigger('sourceSwitchingEnd', data);
		},

		_onloadEmbeddedCaptions: function (event, data) {

			this.triggerHelper('onTextData', data);

			var caption = {
				source: {
					srclang: data.language
				},
				capId: data.trackid,
				caption: {
					content: data.text
				}
			};
			this.triggerHelper('onEmbeddedData', caption);
		},

		_ondurationchange: function () {
			mw.log( "EmbedPlayerNativeComponent:: onDurationChange::" + this.getPlayerElement().duration )
			this.playerElement = this.getPlayerElement();
			if (this.playerElement && !isNaN(this.playerElement.duration) && isFinite(this.playerElement.duration)) {
				this.setDuration(this.getPlayerElement().duration);
			}
		},

		/**
		 * Handle the native play event
		 */
		_onplay: function () {
			mw.log("EmbedPlayerNativeComponent:: OnPlay::");

			this.removePoster();
			this.hideSpinner();
			$( this ).trigger("playing");

			if ( this.paused && this.parent_play() ) {
				this.monitor();
			} else {
				this.playInterfaceUpdate();
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
			if (this.seeking) {
				if (this._propagateEvents) {
					mw.log("EmbedPlayerNativeComponent:: trigger: seeked");
					this.triggerHelper('seeked');
				}
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
				mw.log( 'EmbedPlayer:nativeComponent: onended:' );
				if ( this._propagateEvents && !this.isLive() ) {
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
			this.triggerHelper('embedPlayerError', data);
		},

		_onbufferchange: function (event , isBuffering) {
			if (isBuffering === "true") {
				this.bufferStart();
			} else {
				this.bufferEnd();
			}
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
				if (!this.seeking) {
					this.updatePlayHead(progress);
				}
				if(progress < 0.9){
					if(!this.showProgressSpinner) {
						this.addPlayerSpinner();
						this.showProgressSpinner = true;
					}
				}else{
					this.showProgressSpinner = false;
					this.hideSpinner();
				}

			}
		},

		_ontextTracksReceived: function (event, data) {
			this.unbindHelper('changedClosedCaptions').bindHelper('changedClosedCaptions',function(event, selection){
				this.getPlayerElement().attr('textTrackSelected', selection);
			});
			this.triggerHelper('textTracksReceived', data);
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

		togglePictureInPicture: function() {
			this.getPlayerElement().togglePictureInPicture();
		},

		hideNativeAirPlayButton: function () {
			this.getPlayerElement().hideNativeAirPlayButton();
		},

		isVideoSiblingEnabled: function () {
			return true;
		},

		isPlaying: function () {
			if ( this.stopped || this.paused || this.getPlayerElement().paused ) {
				return false;
			}
			return true;
		},

		switchSrc: function (source) {
			var sourceIndex = (source === -1) ? -1 : source.assetid;
			this.getPlayerElement().switchFlavor(sourceIndex);
		}

	};
})(mediaWiki, jQuery);


