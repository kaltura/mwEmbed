(function (mw, $) {

    "use strict";

    mw.PluginManager.add('unMuteOverlayButton', mw.KBaseComponent.extend({
            defaultConfig: {
                'parent': 'videoHolder',
                'order': 1,
                'align': 'left'
            },

            playerVolume: null,
            isDisabled: false,

            setup: function () {
                this.playerVolume = this.getPlayer().getPlayerElementVolume();
                this.addBindings();
            },

            isSafeEnviornment: function () {
                var _this = this;
                var browserSupportMutedAutoplay = function() {
                    return !!(mw.isDesktopSafariVersionGreaterThan(11) || mw.isChromeVersionGreaterThan(66) || mw.isEdgeVersionGreaterThan(18));
                };
                var isAutoplayConfigured = function() {
                    return !!(mw.getConfig('autoPlay') || _this.getPlayer().getRawKalturaConfig('playlistAPI', 'autoPlay'));
                };
                if (mw.getConfig('thumbEmbedOrigin') || mw.getConfig('autoMute')) {
                    return false;
                }
                if (mw.isMobileDevice()) {
                    return !!mw.getConfig('mobileAutoPlay');
                } else {
                    return browserSupportMutedAutoplay() && isAutoplayConfigured();
                }
            },

            addBindings: function () {
                this.bind('playerReady', function () {
                        this.show();

                }.bind(this));

                this.bind('volumeChanged', function () {
                    if ((this.getPlayer().getPlayerElementVolume() > 0) && !this.getPlayer().isMuted()) {
                        this.destroy();
                    }
                }.bind(this));
            },

            show: function () {
                this.getComponent().fadeIn('slow');
            },

            hide: function () {
                this.getComponent().fadeOut('slow');
            },

            destroy: function () {
                this.hide();
                this.unbind('playerReady');
                this.unbind('volumeChanged');
            },

            getComponent: function () {
                if (!this.$el) {
                    this.$el = $('<button/>')
                        .addClass('icon-volume-mute ' + this.getCssClass())
                        .html('<span>' + gM("mwe-embedplayer-unmute-label") + '</span>')
                        .click(function () {
                            this.getPlayer().setVolume(this.playerVolume, null, mw.isIOS());
                        }.bind(this))
                        .hide()
                }
                return this.$el;
            }
        })
    );

})(window.mw, window.jQuery);
