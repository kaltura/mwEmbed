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
            this.vid.currentTime = mediaSession.currentTime;
            this.updateDuration(mediaSession.media.duration);
            if (this.vid.mediaLoadedCallback){
                this.vid.mediaLoadedCallback(this.vid);
            }
            $(this).html(this.getPlayingScreen());
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
            var title = $(".titleLabel").html() != undefined ? $(".titleLabel").html() : "Untitled movie";
            return '<div style="background-color: #6298f5; width: 100%; height: 100%; padding-top: 40px; padding-left: 15px; font-family: Arial">' +
                '<p style="color: white; font-size: 18px">Kaltura Chromecast Player</p>' +
                '<p style="color: white; font-size: 14px">Currently playing: ' + title + '</p>' +
                '<img style="width:40%; height: 40%" src="' + this.poster + '"></img>' +
                '<p><a style="color: black; font-size: 13px" href="#" onclick="$(this).trigger(\'stopCasting\')">stop casting</a></p></div>';
        }

	}
} )( mediaWiki, jQuery );
