/*
 * The "kaltura player" embedPlayer interface for fallback h.264 and flv video format support
 */
( function( mw, $ ) { "use strict";

	mw.EmbedPlayerChromecast = {
		// Instance name:
		instanceOf : 'Chromecast',
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
		vid: {'readyState': 1},
		receiverName: '',

		setup: function( readyCallback ) {
			mw.log('EmbedPlayerChromecast:: Setup');
			var _this = this;
			$.extend(this.vid,{
				'pause': function(){
					_this.pause();
				},
				'play': function(){
					_this.play();
				}
			});
		},

		// override these functions so embedPlayer won't try to sync time
		syncCurrentTime: function(){},
		monitor: function(){},
		isInSequence: function(){return false;},

		updatePlayhead: function (currentTime, duration) {
			this.currentTime = currentTime;
			this.vid.currentTime = currentTime;
			if ( !this.seeking && !this.userSlide) {
				$(this).trigger("updatePlayHeadPercent",[ currentTime / duration ]);
				$( this ).trigger( 'timeupdate' );
			}
			$(this).trigger( 'monitorEvent' );
		},

		getPlayerElementTime: function(){
			return this.currentTime;
		},

		clipDone: function() {
			mw.log("Chromecast::clip done");
			if (this.vid.mediaFinishedCallback){
				this.vid.mediaFinishedCallback();
				this.vid.mediaFinishedCallback = null;
			}
			$(this.vid).trigger("ended");
			this.onClipDone();
		},

		play: function() {
			$(this).trigger("chromecastPlay");
			$(this.vid).trigger("onplay");
			this.parent_play();
			$(this).trigger("playing");
			this.hideSpinner();
		},

		pause: function() {
			$(this).trigger("chromecastPause");
			$(this.vid).trigger("onpause");
			this.parent_pause();
		},

		changeMediaCallback: function (callback) {
			var _this = this;
			// Check if we have source
			if (!this.getSource()) {
				callback();
				return;
			}
			this.switchPlaySource(this.getSource(), function () {
				_this.updatePosterHTML();
				callback();
			});
		},
		switchPlaySource: function( source, switchCallback ){
			$(this).trigger("chromecastSwitchMedia", [source.src, source.mimeType]);
			this.vid.mediaLoadedCallback = switchCallback;
		},

		mediaLoaded: function(mediaSession){
			var _this = this;
			this.vid.currentTime = mediaSession.currentTime;
			this.updateDuration(mediaSession.media.duration);
			if (this.vid.mediaLoadedCallback){
				this.vid.mediaLoadedCallback(this.vid);
				this.vid.mediaLoadedCallback = null;
			}
		},

		updateDuration: function(duration){
			this.vid.duration = duration;
			this.duration = duration;
			$( this ).trigger( 'durationChange',[duration] );
		},

		getPlayerElement: function(){
			return this.vid;
		},

		seek: function(position) {
			mw.log("seek to "+position);
			this.seeking = true;
			$(this).trigger("chromecastSeek", [position / this.vid.duration * 100]);
			$(this.vid).trigger("seek");
		},

		setPlayerElementVolume: function(percentage) {
			$(this).trigger("chromecastSetVolume",[percentage]);
		},

		onPlayerSeekEnd: function () {
			$( this ).trigger( 'seeked' );
			this.seeking = false;
		},

		isVideoSiblingEnabled: function() {
			return false;
		}
	};
	} )( mediaWiki, jQuery );
