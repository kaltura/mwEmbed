/*
 * The "kaltura player" embedPlayer interface for fallback h.264 and flv video format support
 */
( function( mw, $ ) { "use strict";

	mw.EmbedPlayerChromecastReceiver = {
		// Instance name:
		instanceOf : 'ChromecastReceiver',
		bindPostfix: '.ccPlayer',
		// List of supported features:
		supports : {
			'playHead' : true,
			'pause' : true,
			'stop' : true,
			'volumeControl' : true,
			'overlays': true
		},
		seeking: false,
		startOffset: 0,
		currentTime: 0,
		duration: 0,
		userSlide: false,
		volume: 1,
		vid: null,
		monitorInterval: null,
		receiverName: '',
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

		setup: function( readyCallback ) {
			this.vid = this.getPlayerElement();
			mw.log('EmbedPlayerChromecastReceiver:: Setup. Video element: '+this.getPlayerElement().toString());
			$(this).trigger("chromecastReceiverLoaded",[this.getPlayerElement()]);
			var _this = this;
			this._propagateEvents = true;
			$(this.getPlayerElement()).css('position', 'absolute');
			if (this.inline) {
				$(this.getPlayerElement()).attr('webkit-playsinline', '');
			}
			if (this.monitorInterval !== null){
				clearInterval(this.monitorInterval);
			}
			this.monitorInterval = setInterval(function(){_this.monitor();},1000);
			readyCallback();
		},

		updateFeatureSupport: function () {
			// Check if we already have a video element an apply bindings ( for native interfaces )
			if (this.getPlayerElement()) {
				this.applyMediaElementBindings();
			}
		},
		/**
		 * Apply media element bindings
		 */
		applyMediaElementBindings: function () {
			var _this = this;
			this.log("MediaElementBindings");
			var vid = this.getPlayerElement();
			if (!vid) {
				this.log(" Error: applyMediaElementBindings without player elemnet");
				return;
			}
			$.each(_this.nativeEvents, function (inx, eventName) {
				if (mw.isIOS8_9() && mw.isIphone() && eventName === "seeking") {
					return;
				}
				$(vid).unbind(eventName + '.embedPlayerChromecastReceiver').bind(eventName + '.embedPlayerChromecastReceiver', function () {
					// make sure we propagating events, and the current instance is in the correct closure.
					if (_this._propagateEvents && _this.instanceOf == 'ChromecastReceiver') {
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
		 * Handle the native paused event
		 */
		_onpause: function () {
			this.paused = true;
			$(this).trigger("onpause");
			this.layoutBuilder.showPlayerControls();
			this.parent_pause();
		},

		/**
		 * Handle the native play event
		 */
		_onplay: function () {
			this.paused = false;
			this.stopped = false;
			$(this).trigger("playing");
			this.layoutBuilder.hidePlayerControls();
			this.parent_play();
		},
		// override these functions so embedPlayer won't try to sync time
		syncCurrentTime: function(){},

		isInSequence: function(){return false;},

		monitor: function(){
			if ( this.vid && this.vid.currentTime !== null && this.vid.duration !== null) {
				$(this).trigger("updatePlayHeadPercent",[ this.vid.currentTime / this.vid.duration ]);
				$( this ).trigger( 'externalTimeUpdate', [this.vid.currentTime]);
			}
			$(this).trigger( 'monitorEvent' );
		},

//		updatePlayhead: function (currentTime, duration) {
//			this.currentTime = currentTime;
//			this.vid.currentTime = currentTime;
//			if ( !this.seeking && !this.userSlide) {
//				$(this).trigger("updatePlayHeadPercent",[ currentTime / duration ]);
//				$( this ).trigger( 'timeupdate' );
//			}
//			$(this).trigger( 'monitorEvent' );
//		},
//
		getPlayerElementTime: function(){
			return this.getPlayerElement().currentTime;
		},
//
//		clipDone: function() {
//			mw.log("Chromecast::clip done");
//			if (this.vid.mediaFinishedCallback){
//				this.vid.mediaFinishedCallback();
//			}
//			$(this.vid).trigger("ended");
//			this.onClipDone();
//		},
//
//		play: function() {
//			$(this).trigger("chromecastPlay");
//			$(this.vid).trigger("onplay");
//			this.parent_play();
//			$(this).trigger("playing");
//			this.hideSpinner();
//		},
//
//		pause: function() {
//			$(this).trigger("chromecastPause");
//			$(this.vid).trigger("onpause");
//			this.parent_pause();
//		},
//
//		switchPlaySource: function( source, switchCallback, doneCallback ){
//			$(this).trigger("chromecastSwitchMedia", [source.src, source.mimeType]);
//			if (switchCallback){
//				this.vid.mediaLoadedCallback = switchCallback;
//			}
//			if (doneCallback){
//				this.vid.mediaFinishedCallback = doneCallback;
//			}
//		},
//
//		mediaLoaded: function(mediaSession){
//			var _this = this;
//			this.vid.currentTime = mediaSession.currentTime;
//			this.updateDuration(mediaSession.media.duration);
//			if (this.vid.mediaLoadedCallback){
//				this.vid.mediaLoadedCallback(this.vid);
//			}
//		},
//
//		updateDuration: function(duration){
//			this.vid.duration = duration;
//			this.duration = duration;
//			$( this ).trigger( 'durationChange',[duration] );
//		},
//
		getPlayerElement: function () {
			this.playerElement = $('#' + this.pid).get(0);
			return this.playerElement;
		},
//
//		seek: function(position) {
//			mw.log("seek to "+position);
//			this.seeking = true;
//			$(this).trigger("chromecastSeek", [position / this.vid.duration * 100]);
//			$(this.vid).trigger("seek");
//		},
//
//		setPlayerElementVolume: function(percentage) {
//			$(this).trigger("chromecastSetVolume",[percentage]);
//		},
//
//		onPlayerSeekEnd: function () {
//			$( this ).trigger( 'seeked' );
//			this.seeking = false;
//		},

		isVideoSiblingEnabled: function() {
			return false;
		}
	};
	} )( mediaWiki, jQuery );
