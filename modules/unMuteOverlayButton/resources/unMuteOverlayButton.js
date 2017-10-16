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
                return ((mw.isMobileDevice() || mw.isIpad()) && mw.getConfig('mobileAutoPlay')) ||
                    (mw.isDesktopSafari() && (mw.getConfig('autoPlay') || this.getPlayer().getRawKalturaConfig('playlistAPI', 'autoPlay')));
            },

            addBindings: function () {
                this.bind('playerReady', function () {
                    if (!this.isDisabled) {
                        this.show();
                    }
                }.bind(this));

                this.bind('volumeChanged', function () {
                    if (this.getPlayer().getPlayerElementVolume() > 0) {
                        this.destroy();
                    }
                }.bind(this));
            },

            show: function () {
                var playerHeight = this.getPlayer().getPlayerHeight() / 2;
                var compHeight = this.getComponent().height() / 2;
                this.getComponent().css('margin-top', playerHeight - compHeight);
                this.getComponent().fadeIn('slow');
            },

            hide: function () {
                this.getComponent().fadeOut('slow');
            },

            destroy: function () {
                this.isDisabled = true;
                this.hide();
                this.unbind('playerReady');
                this.unbind('volumeChanged');
            },

            getComponent: function () {
                if (!this.$el) {
                    this.$el = $('<img />')
                        .addClass(this.getCssClass())
                        .attr({
                            'src': this.getConfig('icon')
                        })
                        .click(function () {
                            this.getPlayer().setVolume(this.playerVolume);
                        }.bind(this))
                        .hide()
                }
                return this.$el;
            }
        })
    );

})(window.mw, window.jQuery);
