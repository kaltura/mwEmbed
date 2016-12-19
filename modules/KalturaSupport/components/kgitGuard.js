( function( mw, $ ) {"use strict";

    mw.PluginManager.add( 'kgitGuard', mw.KBasePlugin.extend({

        defaultConfig: {
            "guardText": "Using non production player"
        },

        setup: function() {
            this.addGuardStyle();
            this.proxyPosterMEthods();
        },
        isSafeEnviornment: function(){
            var hostPageUrl = window.kWidgetSupport.getHostPageUrl();
            var loaderPath = kWidget.getPath();
            return ((hostPageUrl.indexOf("kgit.html5video.org") === -1) &&
                    (hostPageUrl.indexOf("player.kaltura.com") === -1) &&
                    (loaderPath.indexOf("kgit.html5video.org") !== -1));
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
            $(this.embedPlayer).append('<div class="guard-ribbon-wrapper"><div class="guard-ribbon">'+this.getConfig("guardText")+'</div></div>');
        },
        addGuardStyle: function(){
            var style = document.createElement('style');
            style.type = 'text/css';
            style.innerHTML =
                '.guard-ribbon-wrapper {'+
                '  width: 300px;'+
                '  height: 220px;'+
                '  overflow: hidden;'+
                '  position: absolute;'+
                '  top: 0px;'+
                '  left: 0px;'+
                '}'+
                '.guard-ribbon {'+
                '  font: bold 15px Sans-Serif;'+
                '  color: red;'+
                '  text-align: center;'+
                '  text-shadow: rgba(255,255,255,0.5) 0px 1px 0px;'+
                '  -webkit-transform: rotate(-45deg);'+
                '  -moz-transform:    rotate(-45deg);'+
                '  -ms-transform:     rotate(-45deg);'+
                '  -o-transform:      rotate(-45deg);'+
                '  position: relative;'+
                '  padding: 25px 0;'+
                '  left: -46px;'+
                '  top: 65px;'+
                '  width: 270px;'+
                '  background-color: red;'+
                '  background-image: -webkit-gradient(linear, left top, left bottom, from(#BFDC7A), to(#8EBF45)); '+
                '  background-image: -webkit-linear-gradient(top, red, red); '+
                '  background-image:    -moz-linear-gradient(top, red, red); '+
                '  background-image:     -ms-linear-gradient(top, red, red); '+
                '  background-image:      -o-linear-gradient(top, red, red); '+
                '  color: #6a6340;'+
                '  -webkit-box-shadow: 0px 0px 3px rgba(0,0,0,0.3);'+
                '  -moz-box-shadow:    0px 0px 3px rgba(0,0,0,0.3);'+
                '  box-shadow:         0px 0px 3px rgba(0,0,0,0.3);'+
                '}'+
                '.guard-ribbon:before, .guard-ribbon:after {'+
                '  content: "";'+
                '  border-top:   3px solid #6e8900;   '+
                '  border-left:  3px solid transparent;'+
                '  border-right: 3px solid transparent;'+
                '  position:absolute;'+
                '  bottom: -3px;'+
                '}'+
                '.guard-ribbon:before {'+
                '  left: 0;'+
                '}'+
                '.guard-ribbon:after {'+
                '  right: 0;'+
                '}​';
            document.getElementsByTagName('head')[0].appendChild(style);
        }
    }));

} )( window.mw, window.jQuery );