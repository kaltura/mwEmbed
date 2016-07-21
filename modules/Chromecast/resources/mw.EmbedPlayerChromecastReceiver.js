
( function( mw, $ ) { "use strict";
	// Add chromecast player:
	$( mw ).bind('EmbedPlayerUpdateMediaPlayers', function( event, mediaPlayers ){
		var chromecastSupportedProtocols = ['video/h264', 'video/mp4', 'application/vnd.apple.mpegurl'];
		var chromecastReceiverPlayer = new mw.MediaPlayer('chromecastReceiver', chromecastSupportedProtocols, 'ChromecastReceiver');
		mediaPlayers.addPlayer(chromecastReceiverPlayer);
	});

	mw.EmbedPlayerChromecastReceiver = {
		// Instance name:
		instanceOf : 'ChromecastReceiver',
		bindPostfix: '.embedPlayerChromecastReceiver',
		// List of supported features:
		supports : {
			'playHead' : true,
			'pause' : true,
			'stop' : true,
			'volumeControl' : true,
			'overlays': true
		},
		seeking: false,
		triggerReplayEvent: false, // since native replay is not supported in the Receiver, we use this flag to send a replay event to Analytics
		currentTime: 0,
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
			$(this).bind('layoutBuildDone', function(){
				this.getVideoHolder().find('video').remove();
			});
			this.setPlayerElement(parent.document.getElementById('receiverVideoElement'));
			this.addBindings();
			this.applyMediaElementBindings();
			mw.log('EmbedPlayerChromecastReceiver:: Setup. Video element: '+this.getPlayerElement().toString());
			this.getPlayerElement().src = '';
			$(this).trigger("chromecastReceiverLoaded");
			this._propagateEvents = true;
			$(this.getPlayerElement()).css('position', 'absolute');
			this.stopped = false;
			readyCallback();
		},
		/**
		 * Apply player bindings for getting events from mpl.js
		 */
		addBindings: function(){
			var _this = this;
			this.bindHelper("layoutBuildDone", function(){
				_this.getVideoHolder().css("backgroundColor","transparent");
				$("body").css("backgroundColor","transparent");

			});
			this.bindHelper("replay", function(){
				_this.triggerReplayEvent = true;
				_this.triggerHelper("playerReady"); // since we reload the media for replay, trigger playerReady to reset Analytics
			});
			this.bindHelper("postEnded", function(){
				_this.currentTime = _this.getPlayerElement().duration;
				_this.updatePlayheadStatus();
			});
			this.bindHelper("onAdOpen", function(event, id, system, type){
				_this.triggerHelper("broadcastToSender", ["chromecastReceiverAdOpen"]);
			});
			this.bindHelper("AdSupport_AdUpdateDuration", function(event, duration){
				_this.triggerHelper("broadcastToSender", ["chromecastReceiverAdDuration|" + duration]);
			});
			this.bindHelper("onAdComplete", function(){
				_this.triggerHelper("broadcastToSender", ["chromecastReceiverAdComplete"]);
				_this.triggerHelper("cancelAllAds");
			});
			this.bindHelper("ccSelectClosedCaptions sourceSelectedByLangKey", function(e, label){
				_this.triggerHelper("propertyChangedEvent", {"plugin": "closedCaptions", "property":"captions", "value": typeof label === "string" ? label : label[0]});
				$(parent.document.getElementById('captionsOverlay')).empty();
			});
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
				$(vid).unbind(eventName + _this.bindPostfix).bind(eventName + _this.bindPostfix, function () {
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
			this.pause();
			$(this).trigger('onPlayerStateChange', [ "pause", "play" ]);

		},
		_onplaying:function(){
			this.hideSpinner();
			this.triggerHelper("playing");
			this.triggerHelper( 'hidePlayerControls' );
		},
		/**
		 * Handle the native play event
		 */
		_onplay: function () {
			this.restoreEventPropagation();
			if (this.currentState === "pause"){
				this.play();
				this.triggerHelper('onPlayerStateChange', [ "play", "pause" ]);
			}
			if (this.triggerReplayEvent){
				this.triggerHelper('replayEvent');
				this.triggerReplayEvent = false;
			}
			this.triggerHelper( 'hidePlayerControls' );

		},
		replay: function(){
			var _this = this;
			this.restoreEventPropagation();
			this.restoreComponentsHover();
		},

		_onseeking: function () {
			this.triggerHelper( 'hidePlayerControls' );
			if (!this.seeking) {
				this.seeking = true;
				if ( this._propagateEvents && !this.isLive() ) {
					this.triggerHelper('seeking');
				}
			}
		},

		_onseeked: function () {
			if (this.seeking) {
				this.seeking = false;
				if (this._propagateEvents && !this.isLive()) {
					this.triggerHelper('seeked', [this.getPlayerElementTime()]);
					this.syncCurrentTime();
					this.updatePlayheadStatus();
				}
			}
		},

		// override these functions so embedPlayer won't try to sync time
		syncCurrentTime: function(){
			this.currentTime = this.getPlayerElementTime();
		},

		isInSequence: function(){return false;},
		_ondurationchange: function (event, data) {
			if ( this.playerElement && !isNaN(this.playerElement.duration) && isFinite(this.playerElement.duration) ) {
				this.setDuration(this.getPlayerElement().duration);
				return;
			}
		},

		setPlayerElement: function (mediaElement) {
			this.playerElement = mediaElement;
		},
		getPlayerElement: function () {
			return this.playerElement;
		},

		getPlayerElementTime: function(){
			return this.getPlayerElement().currentTime;
		},

		isVideoSiblingEnabled: function() {
			return false;
		}
	};
	} )( mediaWiki, jQuery );
