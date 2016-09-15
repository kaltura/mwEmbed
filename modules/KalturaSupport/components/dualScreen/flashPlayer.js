(function (mw, $, kWidgetSupport, base64_encode, gM) {
    'use strict';

    mw.dualScreen = mw.dualScreen || {};

    mw.dualScreen.FlashPlayer = function FlashPlayer(stream, embedPlayer, readyCallback) {
        return $.extend($('<div/>')[0], flashPlayerPrototype)
            .init(stream, embedPlayer, readyCallback);
    };

    var flashPlayerPrototype = {
        stream: null,
        embedPlayer: null,
        playerObject: null,
        autoBitrate: false,
        isFlash: true,
        b64Referrer: null,

        firstPlay: true,
        paused: false,
        seeking: false,
        streamerType: 'http',
        ended: false,
        duration: 0,

        init: function init(stream, embedPlayer, readyCallback) {
            this.stream = stream;
            this.embedPlayer = embedPlayer;
            this.duration = this.stream.data.meta.duration || 0;
            this.b64Referrer = base64_encode(kWidgetSupport.getHostPageUrl());
            this.initPlayerElement(readyCallback);
            this.updatePoster();
            return this;
        },

        play: function play() {
            if (this.seeking) {
                this.stopAfterSeek = false;
                return;
            }

            this.playerObject.play();
        },

        pause: function pause() {
            if (this.seeking) {
                this.stopAfterSeek = true;
                return;
            }

            this.playerObject.pause();
        },

        seek: function seek(seekTime, stopAfterSeek) {
            seekTime = parseFloat(parseFloat(seekTime).toFixed(2));
            this.stopAfterSeek =
                $.type(stopAfterSeek) === 'undefined' ? stopAfterSeek : !this.isPlaying();

            if (!seekTime || seekTime < 0) {
                seekTime = 0;
            }

            var isSeekOutOfBound = this.duration && (Math.ceil(seekTime) > this.duration);
            if (isSeekOutOfBound) {
                seekTime = this.duration;
                this.stopAfterSeek = true;
            }

            this.seeking = true;
            this.trigger('seeking', [seekTime]);

            var currentTime = parseFloat(this.getCurrentTime()).toFixed(2);
            if (Math.abs(currentTime - seekTime) < mw.getConfig("EmbedPlayer.SeekTargetThreshold", 0.1)) {
                this.seeking = false;
                this.trigger('seeked', [currentTime]);
                return;
            }

            this.seekStarted = true;
            if (this.firstPlay && this.streamerType !== 'http') {
                this.playerObject.setKDPAttribute('mediaProxy', 'mediaPlayFrom', seekTime);
                this.playerObject.play();
            } else {
                this.playerObject.seek(seekTime);
            }
        },

        getCurrentTime: function getCurrentTime() {
            return this.playerObject.getCurrentTime();
        },

        setCurrentTime: function setCurrentTime(newTime) {
            this.seek(newTime);
        },

        isPlaying: function isPlaying() {
            return !this.ended && !this.paused;
        },

        isSeeking: function isSeeking() {
            return this.seeking;
        },

        isHLS: function isHLS() {
            return this.autoBitrate;
        },

        isABR: function isABR() {
            return this.autoBitrate;
        },

        switchSrc: function switchSrc(sourceIndex) {
            this.playerObject.sendNotification('doSwitch', {
                flavorIndex: sourceIndex
            });
        },

        removePoster: function removePoster() {
            $(this).find('.playerPoster').remove();
        },

        updatePoster: function updatePoster() {
            this.removePoster();

            var posterSrc = this.getPoster();
            var $poster = $('<img/>', {
                src: posterSrc || mw.getConfig('EmbedPlayer.BlackPixel'),
                'class': 'playerPoster'
            }).css(!posterSrc ? {
                position: 'absolute',
                width: '100%',
                height: '100%'
            } : {}).one('load', function () {
                $(this).attr('alt', gM('mwe-embedplayer-video-thumbnail'));
            });

            $(this).append($poster);
        },

        getPoster: function getPoster() {
            return kWidgetSupport.getKalturaThumbnailUrl({
                url: this.stream.thumbnailUrl,
                width: this.embedPlayer.getWidth(),
                height: this.embedPlayer.getHeight()
            });
        },

        onPlayerSeekEnd: function onPlayerSeekEnd() {
            if (this.seekStarted) {
                this.seekStarted = false;
                this.seeking = false;
                var currentTime = this.getCurrentTime();
                this.trigger('seeked', [currentTime > 0 ? currentTime : 0]);

                var _this = this;
                if (this.stopAfterSeek) {
                    setTimeout(function () {
                        _this.pause();
                    }, 0);
                } else if (!this.stopPlayAfterSeek) {
                    setTimeout(function () {
                        _this.play();
                    }, 0);
                }
            }
        },

        onPlaybackComplete: function onPlaybackComplete() {
            this.paused = false;
            this.ended = true;
            this.trigger('ended');
        },

        onPlayerPaused: function onPlayerPaused() {
            this.paused = true;
            this.trigger('pause');
        },

        onPlayerPlayed: function () {
            this.firstPlay && this.removePoster();
            this.firstPlay = false;
            this.paused = false;
            this.ended = false;
            this.trigger('playing');
        },

        onMediaLoaded: function onMediaLoaded() {
            this.trigger('loadedmetadata');
            this.trigger('loadeddata');
        },

        onMediaError: function onMediaError() {
            this.trigger('error');
        },

        onPlayerReady: function onPlayerReady(playerObject, readyCallback) {
            this.playerObject = playerObject;
            this.bindEvents();
            // this.playerObject.load();

            $.isFunction(readyCallback) && readyCallback();

            this.trigger('loadstart');
            this.trigger('canplay');
        },

        onUpdatePlayhead: function onUpdatePlayhead(playheadValue) {
            this.trigger('timeupdate', [playheadValue]);
        },

        bindEvents: function bindEvents() {
            var _this = this;
            var bindEventsMap = {
                mediaLoaded: 'onMediaLoaded',
                mediaError: 'onMediaError',
                playerPlayed: 'onPlayerPlayed',
                playerPaused: 'onPlayerPaused',
                playerSeekEnd: 'onPlayerSeekEnd',
                playbackComplete: 'onPlaybackComplete',
                playerUpdatePlayhead: 'onUpdatePlayhead'
            };

            $.each(bindEventsMap, function (bindName, localMethod) {
                _this.playerObject.addJsListener(bindName, localMethod);
            });
        },

        initPlayerElement: function initPlayerElement(readyCallback) {
            var seed = new Date().getTime();
            var containerId = 'kaltura_player_container_' + seed;
            var playerId = 'kaltura_player_' + seed;

            $(this)
                .attr('id', containerId)
                .css({
                    position: 'relative',
                    width: '100%',
                    height: '100%'
                });

            var flashVars = this.makeFlashVars();

            var _this = this;
            new mw.PlayerElementFlash(this, playerId, flashVars, this,
                function () {
                    _this.onPlayerReady(this.getElement(), readyCallback);
                }, null, 'secondElementJsReadyFunc');
        },

        makeFlashVars: function makeFlashVars() {
            console.info(this.stream.url);
            var flashVars = {
                autoMute: true,
                entryUrl: encodeURIComponent(this.stream.url),
                isLive: false,
                stretchVideo: false,
                entryDuration: this.duration,
                serviceUrl: mw.getConfig('Kaltura.ServiceUrl'),
                partnerId: this.embedPlayer.kpartnerid,
                widgetId: '_' + this.embedPlayer.kpartnerid,
                b64Referrer: this.b64Referrer
            };

            if (this.stream.url.indexOf('m3u8') > 0) {
                this.autoBitrate = true;
                this.streamerType = 'hls';
                $.extend(flashVars, {
                    disableAutoDynamicStreamSwitch: true,
                    streamerType: 'hls',
                    KalturaHLS: {
                        plugin: 'true',
                        asyncInit: 'true',
                        loadingPolicy: 'preInitialize',
                        // load slave video with the lowest bitrate
                        // In order to save CPU resources, slave will switch
                        // to the higher bitrate only after the main video will reach stable bitrate.
                        prefBitrate: 50
                    }
                });
            } else {
                this.streamerType = mw.getConfig('streamerType') || 'http';
                $.extend(flashVars, {
                    isMp4: true,
                    streamerType: this.streamerType,
                    flavorId: this.stream.url.split('/flavorId/')[1].split('/')[0]
                });
            }

            return flashVars;
        },

        trigger: function (eventName, params) {
            $(this).trigger(eventName, params);
        }
    };
})(window.mw, window.jQuery, window.kWidgetSupport, window.base64_encode, window.gM);