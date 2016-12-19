( function( mw, $ ) {"use strict";

    mw.PluginManager.add( 'kgitGuard', mw.KBasePlugin.extend({

        defaultConfig: {

        },

        setup: function() {
            this.addGuardStyle();
            this.proxyPosterMEthods();
        },
        isSafeEnviornment: function(){
            return (kWidget.getPath().indexOf("kgit.html5video.org") !== -1);
        },
        proxyPosterMEthods: function(){
            var _this = this;
            var orig_updatePosterHTML = this.embedPlayer.updatePosterHTML;
            this.embedPlayer.updatePosterHTML = function(){
                orig_updatePosterHTML.call(this);
                _this.addGuard();
            };

            var orig_addBlackScreen = this.embedPlayer.addBlackScreen;
            this.embedPlayer.addBlackScreen = function(){
                orig_addBlackScreen.call(this);
                _this.addGuard();
            };
        },
        addGuard: function(){
            $(this.embedPlayer).append('<div id="kgitGuard"><p id="kgitGuardBgText">kGit Test</p></div>');
        },
        addGuardStyle: function(){
            var style = document.createElement('style');
            style.type = 'text/css';
            style.innerHTML = '#kgitGuard { '+
                'position: absolute;' +
                'z-index: 0;' +
                'display:block;' +
                'min-height:50%;' +
                'min-width:50%;' +
                '}' +
                '#kgitGuardBgText { '+
                'color: #d81313;' +
                'opacity: 0.5;' +
                'font-size: 70px;' +
                'transform:rotate(325deg);' +
                '-webkit-transform: rotate(325deg);' +
                '}';
            document.getElementsByTagName('head')[0].appendChild(style);
        }
    }));

} )( window.mw, window.jQuery );