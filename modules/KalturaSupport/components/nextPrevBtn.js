(function (mw, $) {
    "use strict";

    mw.PluginManager.add('nextPrevBtn', mw.KBaseComponent.extend({

            defaultConfig: {
                'parent': 'controlsContainer',
                'accessibleControls': false,
                'layout': "horizontal",
                'order': 5,
                'showTooltip': true,
                "displayImportance": "medium"
            },

            isDisabled: false,

            nextIconClass: 'icon-next',
            prevIconClass: 'icon-prev',

            nextTitle: gM('mwe-embedplayer-next_clip'),
            prevTitle: gM('mwe-embedplayer-prev_clip'),

            isSafeEnviornment: function () {
                return !mw.isChromeCast();
            },

            setup: function () {
                if (this.embedPlayer.isMobileSkin()) {
                    this.setConfig('parent', 'videoHolder');
                    this.addMobileBindings();
                }
                this.addBindings();
            },

            addMobileBindings: function () {
                var _this = this;
                this.bind('onChangeMediaDone playerReady onpause onEndedDone onRemovePlayerSpinner showPlayerControls hideScreen', function () {
                    if (!_this.embedPlayer.isPlaying() && !_this.embedPlayer.isInSequence() && !_this.embedPlayer.changeMediaStarted) {
                        _this.show();
                    }
                });

                this.bind('onShowControlBar', function () {
                    if (_this.embedPlayer.isPlaying() && !_this.embedPlayer.isInSequence()) {
                        _this.show();
                    }
                });
                this.bind('playing AdSupport_StartAdPlayback onAddPlayerSpinner onHideControlBar showScreen', function () {
                    _this.hide();
                });
                this.bind('onPlayerStateChange', function (e, newState, oldState) {
                    if (newState == 'load') {
                        _this.hide();
                    }
                    if (newState == 'pause' && _this.embedPlayer.isPauseLoading) {
                        _this.hide();
                    }
                });
                this.bind('hideScreen', function () {
                    if (_this.embedPlayer.paused) {
                        _this.show();
                    }
                });
            },

            addBindings: function () {
                var _this = this;
                this.bind('playlistFirstEntry playlistLastEntry playlistMiddleEntry', function (e) {
                    if (e.type === "playlistFirstEntry") {
                        _this.getComponent().find(".icon-prev").addClass("disabled");
                    }
                    else {
                        _this.getComponent().find(".icon-prev").removeClass("disabled");
                    }
                    if (e.type === "playlistLastEntry") {
                        _this.getComponent().find(".icon-next").addClass("disabled");
                    }
                    else {
                        _this.getComponent().find(".icon-next").removeClass("disabled");
                    }
                });
            },

            show: function () {
                if (!this.isDisabled && !this.embedPlayer.layoutBuilder.displayOptionsMenuFlag) {
                    if (this.embedPlayer.isMobileSkin() && (this.embedPlayer.changeMediaStarted || this.embedPlayer.buffering)) {
                        return; // prevent
                    }
                    this.getComponent().fadeIn('fast');
                }
            },

            hide: function (force) {
                this.getComponent().hide();
            },

            getComponent: function () {
                var _this = this;
                var eventName = 'click';
                if (mw.isMobileDevice()) {
                    eventName = 'touchstart';
                }
                if (!this.$el) {
                    var $nextBtn = $('<button />')
                        .attr('title', this.nextTitle)
                        .addClass("btn btnNarrow icon-next")
                        .on(eventName, function (e) {
                            e.stopPropagation();
                            e.preventDefault();
                            $(_this.embedPlayer).trigger('playNextClip');
                        });
                    var $prevBtn = $('<button />')
                        .attr('title', this.prevTitle)
                        .addClass("btn btnNarrow icon-prev disabled")
                        .on(eventName, function (e) {
                            e.stopPropagation();
                            e.preventDefault();
                            $(_this.embedPlayer).trigger('playPreviousClip');
                        });
                    this.setAccessibility($nextBtn,this.nextTitle);
                    this.setAccessibility($prevBtn,this.prevTitle);

                    var layoutClass = ' ' + this.getConfig('layout');
                    this.$el = $('<div />')
                        .addClass(this.getCssClass() + layoutClass)
                        .append($prevBtn, $nextBtn);
                }
                return this.$el;
            },

            getBtn: function () {
                return this.getComponent().find('.btn');
            },

            onDisable: function () {
                //Only disable if ad is being displayed
                if (this.getPlayer().isInSequence()) {
                    this._super();
                }
            }
        })
    );

})(window.mw, window.jQuery);
