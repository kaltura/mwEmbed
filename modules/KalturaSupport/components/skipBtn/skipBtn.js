/**
 * Created by erez.bouskila on 08/12/2016.
 */
( function( mw, $ ) {"use strict";


    mw.PluginManager.add( 'saveForLater', mw.KBaseComponent.extend({

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
            var _this = this;

            this.bind( 'playerReady ' , function () {

            });

        },

        getComponent: function() {
            var _this = this;
            if( !this.$el ) {
                this.$el = $( '<button/>' )
                    .attr( 'title', this.getConfig('tooltip') )
                    .addClass( "btn icon-caret" + this.getCssClass() )
                    .click( function(){
                        _this.active = !_this.active;
                        if(_this.active){
                            _this.saveTimeStamp();
                        } else {
                            _this.deleteTimeStamp();
                        }
                        var iconColor = _this.active ? "LawnGreen" : "white";
                        $(_this.embedPlayer.getInterface().find(".icon-caret").css("color", iconColor));
                    });
            }
            return this.$el;
        }
    }));
} )( window.mw, window.jQuery );