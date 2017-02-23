(function ( mw, $ ) {
    "use strict";
    mw.dualScreen = mw.dualScreen || {};

    mw.dualScreen.videoPlayer = mw.KBaseComponent.extend({
        stream: null,
        playerElement: null,

        isSafeEnviornment: function () {
            return true;
        },

        canRender: function () {
            return true;
        },

        applyIntrinsicAspect: function () {
            // NOP
        },

        setStream: function (stream) {
            this.stream = stream;

            this.destroyVideoSync();

            if (this.$el) {
                var $prevEl = this.$el;
                $prevEl.empty();
                this.initPlayerElement();
                $prevEl.replaceWith(this.$el);
            }
        },

        getComponent: function () {
            if (!this.$el) {
                this.initPlayerElement();
            }
            return this.$el;
        },

        initPlayerElement: function () {
            mw.log("DualScreen :: second screen :: videoPlayer :: initPlayerElement");
            var player = this.getPlayer();
            var playerConstructor;
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

            this.playerElement = new playerConstructor(this.stream, this.getPlayer());
            this.$el = $(this.playerElement).one('loadstart', this.sync.bind(this));
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
})( window.mw, window.jQuery );