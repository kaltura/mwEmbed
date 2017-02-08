/**
 * Created by erez.bouskila on 08/12/2016.
 */
( function( mw, $ ) {"use strict";


    mw.PluginManager.add( 'seekButtons', mw.KBaseComponent.extend({

        defaultConfig: {
            'parent': 'controlsContainer',
            'order': 98,
            'visible': true,
            'align': "right",
            'showTooltip': true,
            'skipForward': 30,
            'skipBack': 30
        },

        active: false,

        forwardIconClass: 'icon-forward',
        backIconClass: 'icon-prev',

        forwardTitle: gM('mwe-skipBtnForward-tooltip'),
        backTitle: gM('mwe-skipBtnBack-tooltip'),


        setup: function( embedPlayer ) {
            mw.log("SeekButtons:: setup");
            this.addBindings();
        },

        addBindings: function() {
            var $buttons = this.getComponent();
            this.skipForward = this.skipForward.bind(this);
            $buttons.bind("click", this.skipForward);
            this.skipBack = this.skipBack.bind(this);
            $buttons.bind("click", this.skipBack);
        },

        skipForward: function(event) {
            var direction = $(event.target).attr("data-direction");
            if (direction === "forward") {
                var current = this.embedPlayer.currentTime;
                return this.embedPlayer.seek(current + this.getConfig("skipForward"));
            }
        },

        skipBack: function(event) {
            var direction = $(event.target).attr("data-direction");
            if (direction === "back") {
                var current = this.embedPlayer.currentTime;
                return this.embedPlayer.seek(current - this.getConfig("skipBack"));
            }
        },

        getComponent: function() {
            var _this = this;
            var eventName = 'click';
            if (!this.$el) {
                var $forwardBtn = $('<button />')
                    .attr('title', this.nextTitle)
                    .attr( 'data-direction', "forward" )
                    .addClass( "btn icon-next" )
                    .on(eventName, function () {
                        $(_this).trigger('skipForward');
                    });

                var $backBtn = $('<button />')
                    .attr('title', this.prevTitle )
                    .attr( 'data-direction', "back" )
                    .addClass( "btn icon-prev" )
                    .on(eventName, function () {
                        $(_this).trigger('skipBack');
                    });

                this.$el = $('<div />')
                    .addClass(this.getCssClass())
                    .append($backBtn, $forwardBtn);
            }
            return this.$el;
        }
    }));
} )( window.mw, window.jQuery );