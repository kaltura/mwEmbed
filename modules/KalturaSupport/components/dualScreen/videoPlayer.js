(function ( mw, $ ) {
    "use strict";
    mw.dualScreen = mw.dualScreen || {};

    mw.dualScreen.videoPlayer = mw.KBaseComponent.extend({
        defaultConfig: {
            cuePointType: [{
                "main": mw.KCuePoints.TYPE.THUMB,
                "sub": [mw.KCuePoints.THUMB_SUB_TYPE.SLIDE]
            }],
            prefetch: {
                'durationPercentageUntilNextSequence': 60,
                'minimumSequenceDuration': 2
            }
        },
        cuePoints: [],
        syncEnabled: true,

        setup: function () {
            this.addBinding();
        },
        isSafeEnviornment: function () {
            return true;
        },
        addBinding: function () {
            var _this = this;
            this.bind('allPlayersReady', function(){
                _this.videoSync.setMediaGroups([_this.$el]);
            });
            this.bind("onChangeMedia", function () {

            });
            this.bind("onChangeStream", function () {
                _this.syncEnabled = false;
            });
            this.bind("onChangeStreamDone", function () {
                _this.syncEnabled = true;
            });
        },
        getComponent: function () {
            if (!this.$el) {
                this.initPlayerElement();
            }
            return this.$el;
        },
        initPlayerElement: function(url){
            mw.log("DualScreen :: second screen :: videoPlayer :: initPlayerElement");
            var _this = this;
            var player = this.getPlayer();
            switch(player.instanceOf){
                case "Native":
                    _this.initNativePlayer(url);
                    break;
                case "Kplayer":
                    _this.initKPlayer(url);
                    break;
                case "splayer":
                    _this.initSender(url);
                    break;
            }
        },
        //Native src = http://cdnapi.kaltura.com/p/1726172/sp/172617200/playManifest/entryId/0_14ytdv7d/flavorId/0_i7jx15cw/format/url/protocol/http/a.mp4?referrer=aHR0cDovL2xvY2FsaG9zdA==&amp;playSessionId=5b361a4d-742e-8700-21f6-00d87628b56b&amp;clientTag=html5:v2.33.rc2
        initNativePlayer: function(url){
            var _this = this;
            this.$el =
                $('<video>')
                    .attr('id', 'vidSibling_obj')
                    .attr('muted', 'true')
                    .attr('src', url)
                    .addClass("videoPlayer")
                    .on("loadstart", this.sync.bind(this));
            this.$el.get(0).setCurrentTime = function(time){ _this.$el.get(0).currentTime = time;};
            this.$el.get(0).getCurrentTime = function(){ return _this.$el.get(0).currentTime;};
            this.$el.get(0).supportsPlaybackrate =  true;
        },
        //Kplayer src = http://cdnapi.kaltura.com/p/1726172/sp/172617200/playManifest/entryId/0_14ytdv7d/flavorId/0_i7jx15cw/format/url/protocol/http/a.mp4?referrer=aHR0cDovL2xvY2FsaG9zdA==&playSessionId=5b361a4d-742e-8700-21f6-00d87628b56b&clientTag=html5:v2.33.rc2
        initKPlayer: function(url){
            var _this = this;
            var fv = {
                "autoMute": true,
                "streamerType": "http",
                "entryUrl": encodeURI(url),
                "entryDuration": 298,
                "isMp4": true,
                "isLive": false,
                "stretchVideo": false
            };
            var vidSibling = new mw.PlayerElementFlash( "secondScreen", "vidSibling_obj", fv, null, function () {
                _this.sync();
                _this.playerElement.play = this.play;
                _this.playerElement.pause = this.pause;
                _this.playerElement.setCurrentTime = this.seek;
                _this.load();
            } );

            this.$el = $("#vidSibling_obj");
            this.$el.get(0).supportsPlaybackrate =  false;
        },
        //splayer src = http://cdnapi.kaltura.com/p/1726172/sp/172617200/playManifest/entryId/0_14ytdv7d/flavorId/0_i7jx15cw/format/url/protocol/http/a.mp4?referrer=aHR0cDovL2xvY2FsaG9zdA==&playSessionId=5b361a4d-742e-8700-21f6-00d87628b56b&clientTag=html5:v2.33.rc2
        initSPlayer: function(url){
            var _this = this;
            var fv = {
                autoplay:false,
                isDVR:false,
                isLive:false,
                startvolume: 0,
                "entryUrl": encodeURI(url)

            };
            var vidSibling = new mw.PlayerElementSilverlight( "secondScreen", "vidSibling_obj", fv, null, function () {
                _this.sync();
                _this.playerElement.play = this.play;
                _this.playerElement.pause = this.pause;
                _this.playerElement.setCurrentTime = this.seek;
                _this.load();
            } );

            this.$el = $("#vidSibling_obj");
            this.$el.get(0).supportsPlaybackrate =  false;
        },
        applyIntrinsicAspect: function () {
            // Check if a image thumbnail is present:

        },
        sync: function(){
            if (!this.videoSync) {
                this.videoSync = new mw.dualScreen.videoSync(this.getPlayer(), function () {
                }, "videoSync");
            }
        }
    });
})( window.mw, window.jQuery );