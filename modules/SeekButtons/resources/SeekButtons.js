/**
 * Created by erez.bouskila on 08/12/2016.
 */
( function( mw, $ ) {"use strict";


    mw.PluginManager.add( 'seekButtons', mw.KBaseComponent.extend({

        defaultConfig: {
            'parent': 'controlsContainer',
            'order': 72,
            'visible': true,
            'align': "right",
            'showTooltip': true,
            'tooltip': gM( 'mwe-skipBtn-tooltip' ),
            'skipForward': 30,
            'skipBack': 30
        },

        active: false,


        setup: function( embedPlayer ) {
            console.info("SeekButtons: setup:: setup started");
            var _this = this;
            this.addBindings();

        },

        addBindings: function() {
            var $button = this.getComponent();
            this.skip = this.skip.bind(this);
            $button.bind("click", this.skip);
        },

        skip: function(event) {
            console.log(event);
            var direction = $(event.target).attr("data-direction");
            if (direction === "forward") {
                var current = this.embedPlayer.currentTime;

                return this.embedPlayer.seek(current + this.getConfig("skipForward"));
            }
        },
        skipForward: function() {

        },

        getComponent: function() {
            var _this = this;
            if( !this.$el ) {
                this.$el = $( '<button/>' )
                    .attr( 'title', this.getConfig('tooltip') )
                    .attr( 'data-direction', "forward" )
                    .addClass( "seekButtons nextBtn" );
            }
            return this.$el;
        }
    }));
} )( window.mw, window.jQuery );