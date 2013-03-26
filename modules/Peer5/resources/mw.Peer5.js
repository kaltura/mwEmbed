(function (mw, $) {
    "use strict";

    mw.Peer5 = function (embedPlayer, callback) {
        return this.init(embedPlayer, callback);
    };

    mw.Peer5.prototype = {
        bindPostfix:'.Peer5',

        init:function (embedPlayer, callback) {
            var _this = this;
            this.embedPlayer = embedPlayer;
            // Load Peer5
            kWidget.appendScriptUrl(_this.getConfig('peer5libUrl'), function () {
                // bind player
                _this.bindPlayer();
                // continue player build out:
                callback();
            }, document);
        },
        bindPlayer:function (event, embedPlayer) {
            // checkPlayerSourcesEvent ( add peer5 mediaStream source )

            $(this.embedPlayer).bind('playerReady', function (event, callback) {
                var vid = document.querySelector('video');
                peer5.create(vid, 'http://commondatastorage.googleapis.com/peer5_vod/wind2.mp4', 'video/mp4; codecs="avc1.64001f,mp4a.40.2"',
                    {overlayUI:{
                        chunks_area_style:'position: absolute; top: 399px;left: 40px;width: 563px;'
                    }});

                this.mediaElement.selectedSource.src = vid.src;
                $(this.getInterface()).find('.ui-widget.source-switch').text('Peer5 Demo for Chrome');
            });
        },
        getConfig:function (propId) {
            // return the attribute value
            return this.embedPlayer.getKalturaConfig('peer5', propId);
        }
    }

})(window.mw, window.jQuery);