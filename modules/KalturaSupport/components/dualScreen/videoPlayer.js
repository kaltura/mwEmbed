(function ( mw, $ , Hls) {
    "use strict";
    mw.dualScreen = mw.dualScreen || {};

    mw.dualScreen.videoPlayer = mw.KBaseComponent.extend({
        stream: null,
        aa: Hls,
        playerElement: null,

        isSafeEnviornment: function () {
            this.cc = Hls;
            return true;
        },

        canRender: function () {
            return true;
        },

        applyIntrinsicAspect: function () {
            // NOP
        },

        setStream: function (stream) {
            debugger;
            console.log(">>> setStream",stream);
            this.stream = stream;

            this.destroyVideoSync();

            if (this.$el) {
                var $prevEl = this.$el;
                $prevEl.empty();
                this.initPlayerElement(Hls);
                $prevEl.replaceWith(this.$el);
            }
        },

        getComponent: function () {
            if (!this.$el) {
                console.log(">>> getComponent");
                this.initPlayerElement(Hls);
            }
            return this.$el;
        },

        initPlayerElement: function (Hls) {
            mw.log("DualScreen :: second screen :: videoPlayer :: initPlayerElement");
            var player = this.getPlayer();
            var playerConstructor;
            console.log(">>> player.instanceOf",player.instanceOf);
            try{
                switch(player.instanceOf){
                    case "Native":
                        playerConstructor = mw.dualScreen.NativePlayer;
                        break;
                    case "Kplayer":
                        playerConstructor = mw.dualScreen.FlashPlayer;
                        break;
                    default:
                        throw "Player of type '" + player.instanceOf + "'' is not supported!";
                }
            } catch (e){
                console.log(">>> catch - player.instanceOf",player.instanceOf);
            }
            this.playerElement = new playerConstructor(this.stream, this.getPlayer(), function (player) {
                $(player).one('loadstart', this.sync.bind(this));
            }.bind(this),Hls);
            this.$el = $(this.playerElement);
        },

        sync: function () {
            if (!this.videoSync) {
                this.videoSync = new mw.dualScreen.videoSync(this.getPlayer(), function () {
                }, "videoSync");
                this.videoSync.setMediaGroup([this.$el[0]]);
            }
        },

        destroyVideoSync: function () {
            if (this.videoSync) {
                this.videoSync.destroy();
                this.videoSync = null;
            }
        },

        destroy: function ( ) {
            this.destroyVideoSync();
            this.getComponent().remove();
            this._super();
        }
    });
})( window.mw, window.jQuery, window.Hls );