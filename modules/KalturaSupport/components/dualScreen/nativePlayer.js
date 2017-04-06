(function (mw, $, kWidgetSupport, Hls) {
    'use strict';

    mw.dualScreen = mw.dualScreen || {};

    mw.dualScreen.NativePlayer = function NativePlayer(stream, embedPlayer, readyCallback) {
        return $.extend($('<video/>')[0], nativePlayerPrototype)
            .init(stream, embedPlayer, readyCallback);
    };

    var nativePlayerPrototype = {
        stream: null,
        embedPlayer: null,
        supportsPlaybackrate: true,
        streamerType: 'http',

        init: function init(stream, embedPlayer, readyCallback) {
            this.stream = stream;
            this.embedPlayer = embedPlayer;
            this.streamerType = this.stream.url.indexOf('m3u8') > 0 ? 'hls' : 'http';
            this.initPlayerElement(readyCallback || $.noop);

            return this;
        },

        initPlayerElement: function initPlayerElement(readyCallback) {
            var $this = $(this);

            this.muted = true;

            $this.attr({
                muted: true,
                poster: this.getPoster()
            }).addClass('videoPlayer');

            if (this.streamerType === 'http' || this.supportsNativeHls()) {
                readyCallback(this);
                $this.attr('src', this.stream.url);
            } else if (this.streamerType === 'hls') {
                console.log(">>> creating HLS");
                if(!Hls){
                    debugger;
                }
                var hls = new Hls();
                var _this = this;
                hls.attachMedia(this);
                hls.on(Hls.Events.MEDIA_ATTACHED, function () {
                    hls.loadSource(_this.stream.url);
                    hls.on(Hls.Events.MANIFEST_PARSED, function (event, data) {
                        readyCallback($this[0]);
                        $this.trigger('loadstart');
                    });
                });
            }
        },

        setCurrentTime: function setCurrentTime(newTime, stopAfterSeek) {
            this.currentTime = newTime;
            $(this).off('seeked.nativePlayer').one('seeked.nativePlayer', function () {
                if (stopAfterSeek) {
                    this.pause();
                } else {
                    this.play();
                }
            });
        },

        getCurrentTime: function getCurrentTime() {
            return this.currentTime;
        },

        getPoster: function getPoster() {
            return kWidgetSupport.getKalturaThumbnailUrl({
                url: this.stream.thumbnailUrl,
                width: this.embedPlayer.getWidth(),
                height: this.embedPlayer.getHeight()
            });
        },

        isABR: function isABR() {
            return this.stream.url.indexOf('m3u8') > 0;
        },

        isSeeking: function isSeeking() {
            return this.seeking;
        },

        supportsOptimisticSeeking: function supportsOptimisticSeeking() {
            return !this.isABR();
        },

        supportsNativeHls: function supportsNativeHls() {
            return this.streamerType === 'hls' && mw.isDesktopSafari();
        }
    };
})(window.mw, window.jQuery, window.kWidgetSupport, window.Hls);