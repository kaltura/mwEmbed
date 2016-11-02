(function (mw, $, kWidgetSupport) {
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

        init: function init(stream, embedPlayer, readyCallback) {
            this.stream = stream;
            this.embedPlayer = embedPlayer;

            $(this).attr({
                muted: true,
                src: this.stream.url,
                poster: this.getPoster()
            }).addClass('videoPlayer');

            $.isFunction(readyCallback) && readyCallback();

            return this;
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
            return false;
        }
    };
})(window.mw, window.jQuery, window.kWidgetSupport);