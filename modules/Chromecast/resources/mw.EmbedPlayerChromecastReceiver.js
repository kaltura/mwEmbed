
( function( mw, $ ) { "use strict";
	// Add chromecast player:
	$( mw ).bind('EmbedPlayerUpdateMediaPlayers', function( event, mediaPlayers ){
		var chromecastSupportedProtocols = ['video/h264', 'video/mp4'];
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
			this.applyMediaElementBindings();
			mw.log('EmbedPlayerChromecastReceiver:: Setup. Video element: '+this.getPlayerElement().toString());
			$(this).trigger("chromecastReceiverLoaded",[this.getPlayerElement()]);
			var _this = this;
			this._propagateEvents = true;
			$(this.getPlayerElement()).css('position', 'absolute');
			if (this.monitorInterval !== null){
				clearInterval(this.monitorInterval);
			}
			this.monitorInterval = setInterval(function(){_this.monitor();},1000);
			readyCallback();
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
			this.paused = true;
			this.layoutBuilder.showPlayerControls();
			$(this).trigger('onPlayerStateChange', [ "pause", "play" ]);
			this.parent_pause();
		},

		/**
		 * Handle the native play event
		 */
		_onplay: function () {
			this.paused = false;
			this.stopped = false;
			this.layoutBuilder.hidePlayerControls();
			$(this).trigger('onPlayerStateChange', [ "play", "pause" ]);
			//this.parent_play();
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

		getPlayerElement: function () {
			this.playerElement = $('#' + this.pid).get(0);
			return this.playerElement;
		},

		getPlayerElementTime: function(){
			return this.vid.currentTime;
		},

		isVideoSiblingEnabled: function() {
			return false;
		}
	};
	} )( mediaWiki, jQuery );
