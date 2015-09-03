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
            },
            srcUrl :''
        },
        cuePoints: [],
        syncEnabled: true,
        setup: function () {
            //this.addBinding();
        },
        isSafeEnviornment: function () {
            return true;
        },
        addBinding: function () {
            var _this = this;
            this.bind("onChangeMedia", function () {

            });
            this.bind("onChangeStream", function () {
                _this.syncEnabled = false;
            });
            this.bind("onChangeStreamDone", function () {
                _this.syncEnabled = true;
            });
        },

        //Native src = http://cdnapi.kaltura.com/p/1726172/sp/172617200/playManifest/entryId/0_14ytdv7d/flavorId/0_i7jx15cw/format/url/protocol/http/a.mp4?referrer=aHR0cDovL2xvY2FsaG9zdA==&amp;playSessionId=5b361a4d-742e-8700-21f6-00d87628b56b&amp;clientTag=html5:v2.33.rc2
        //Kplayer src = http://cdnapi.kaltura.com/p/1726172/sp/172617200/playManifest/entryId/0_14ytdv7d/flavorId/0_i7jx15cw/format/url/protocol/http/a.mp4?referrer=aHR0cDovL2xvY2FsaG9zdA==&playSessionId=5b361a4d-742e-8700-21f6-00d87628b56b&clientTag=html5:v2.33.rc2
        //splayer src = http://cdnapi.kaltura.com/p/1726172/sp/172617200/playManifest/entryId/0_14ytdv7d/flavorId/0_i7jx15cw/format/url/protocol/http/a.mp4?referrer=aHR0cDovL2xvY2FsaG9zdA==&playSessionId=5b361a4d-742e-8700-21f6-00d87628b56b&clientTag=html5:v2.33.rc2

        getComponent: function () {
            if (!this.$el) {
                var _this = this;
                var player = this.getPlayer();
                switch(player.instanceOf){
                    case "Native":
                        this.$el =
                            $('<video>')
                                .attr('id', 'vidSibling_obj')
                                .attr('muted', 'true')
                                .attr('src', _this. srcUrl)
                                .addClass("videoPlayer")
                                .on("loadstart", this.sync.bind(this));
                        this.$el.get(0).setCurrentTime = function(time){ _this.$el.get(0).currentTime = time;};
                        this.$el.get(0).getCurrentTime = function(){ return _this.$el.get(0).currentTime;};
                        this.$el.get(0).supportsPlaybackrate =  true;
                        break;
                    case "Kplayer":

                        var fv = {
                            "autoMute": true,
                            "streamerType": "http",
                            "entryUrl": encodeURI(_this. srcUrl),
                            "entryDuration": 298,
                            "isMp4": true,
                            "isLive": false,
                            "stretchVideo": false
                        };
                        var vidSibling = new mw.PlayerElementFlash( "secondScreen", "vidSibling_obj", fv, null, function () {
                            _this.sync();
                            this.playerElement.play = this.play;
                            this.playerElement.pause = this.pause;
                            this.playerElement.setCurrentTime = this.seek;
                            this.load();
                        } );

                        this.$el = $("#vidSibling_obj");
                        this.$el.get(0).supportsPlaybackrate =  false;
                        break;
                    case "splayer":
                        var fv = {
                            autoplay:false,
                            isDVR:false,
                            isLive:false,
                            startvolume: 0,
                            "entryUrl": encodeURI(_this. srcUrl)

                        };
                        var vidSibling = new mw.PlayerElementSilverlight( "secondScreen", "vidSibling_obj", fv, null, function () {
                            _this.sync();
                            this.playerElement.play = this.play;
                            this.playerElement.pause = this.pause;
                            this.playerElement.setCurrentTime = this.seek;
                            this.load();
                        } );

                        this.$el = $("#vidSibling_obj");
                        this.$el.get(0).supportsPlaybackrate =  false;
                        break;
                }
            }
            return this.$el;
        },
        applyIntrinsicAspect: function () {
            // Check if a image thumbnail is present:

        },
        sync: function(){
            if (!this.videoSync) {
                this.videoSync = new mw.dualScreen.videoSync(this.getPlayer(), function () {
                }, "videoSync");
                this.videoSync.setMediaGroups([this.$el]);
            }
        }
    });
})( window.mw, window.jQuery );