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
		},

		// override these functions so embedPlayer won't try to sync time
		syncCurrentTime: function(){},
		monitor: function(){},
		isInSequence: function(){return false},

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
			console.log("clip done");
			if (this.vid.mediaFinishedCallback){
				this.vid.mediaFinishedCallback();
			}
			$(this.vid).trigger("ended");
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

		switchPlaySource: function( source, switchCallback, doneCallback ){
			$(this).trigger("chromecastSwitchMedia", [source.src, source.mimeType]);
			if (switchCallback){
				this.vid.mediaLoadedCallback = switchCallback;
			}
			if (doneCallback){
				this.vid.mediaFinishedCallback = doneCallback;
			}
		},

		mediaLoaded: function(mediaSession){
			var _this = this;
			this.vid.currentTime = mediaSession.currentTime;
			this.updateDuration(mediaSession.media.duration);
			if (this.vid.mediaLoadedCallback){
				this.vid.mediaLoadedCallback(this.vid);
			}
			$(this).html(this.getPlayingScreen());
			$(".chromecastThumb").load(function(){
				setTimeout(function(){
					_this.setPlayingScreen();
				},0)
			})
		},

		updateDuration: function(duration){
			this.vid.duration = duration;
			this.duration = duration;
			$( this ).trigger( 'durationChange',[duration] );
		},

		getPlayerElement: function(){
			return this.vid;
		},

		seek: function(percentage) {
			console.log("seek "+percentage);
			this.seeking = true;
			$(this).trigger("chromecastSeek", [percentage * 100]);
			$(this.vid).trigger("seek");
		},

		setPlayerElementVolume: function(percentage) {
			$(this).trigger("chromecastSetVolume",[percentage]);
		},

		onPlayerSeekEnd: function () {
			$( this ).trigger( 'seeked' );
			this.seeking = false;
		},

		getPlayingScreen: function(){
			var _this = this;
			return '<div style="background-color: #000000; opacity: 0.7; width: 100%; height: 100%; font-family: Arial; position: absolute">' +
				'<div class="chromecastPlayback">' +
				'<div class="chromecastThumbBorder">' +
				'<img class="chromecastThumb" src="' + this.poster + '"></img></div> ' +
				'<span class="chromecastTitle"></span>' +
				'<div class="chromecastPlayingIcon"><i class="icon-chromecast"></i></div>' +
				'<span id="chromecastPlaying" class="chromecastPlaying">Now Playing on Chromecast</span>'+
				'<span id="chromecastReceiverName" class="chromecastPlaying">Now Playing on Chromecast</span>'+
				'</div></div>';
		},

		setPlayingScreen: function(){
			var factor = $(".chromecastPlayback").height() / $(".chromecastThumb").naturalHeight();
			$(".chromecastThumb").height($(".chromecastPlayback").height());
			$(".chromecastThumbBorder").height($(".chromecastPlayback").height());
			$(".chromecastThumb").width($(".chromecastThumb").naturalWidth() * factor);
			$(".chromecastThumbBorder").width($(".chromecastThumb").naturalWidth() * factor);
			var title = $(".titleLabel").html() != undefined ? $(".titleLabel").html() : "Untitled movie";
			$(".chromecastTitle").text(title).css("margin-left",$(".chromecastThumbBorder").width()+14+'px');
			$(".chromecastPlayingIcon").css("margin-left",$(".chromecastThumbBorder").width()+14+'px').css("margin-top",24+'px');
			$("#chromecastPlaying").css("margin-left",$(".chromecastThumbBorder").width()+60+'px').css("margin-top",26+'px');
			$("#chromecastReceiverName").text(this.receiverName);
			$("#chromecastReceiverName").css("margin-left",$(".chromecastThumbBorder").width()+60+'px').css("margin-top",42+'px');
		}

	}
} )( mediaWiki, jQuery );
