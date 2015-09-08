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
			'volumeControl' : true
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
//		getPlayerElementTime: function(){
//			return this.currentTime;
//		},
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
