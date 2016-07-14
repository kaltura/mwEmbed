( function( mw, $ ) {"use strict";

	mw.PluginManager.add( 'cvaa', mw.KBaseScreen.extend({

		defaultConfig: {
			parent: "topBarContainer",
			templatePath: '../Cvaa/resources/cvaa.tmpl.html',
			usePreviewPlayer: false,
			previewPlayerEnabled: false,
			optionsBtnName:  gM( 'mwe-cvaa-options' ),
			optionsEvent: "openCvaaOptions",
			cvaaBtnPosition: "first",
			cvaaUrl : "http://kaltura.com",
			cvaaUrlText: "End User License Agreement",
			checkboxText: "I agree",
			genericText: "Hello and welcome to the greatest eula plugin in the 7 kingdoms"

		},
		setup: function () {
			this.addBindings();
		},
		addBindings: function () {
			var _this = this;
			var embedPlayer = this.getPlayer();

			this.bind('openCvaaOptions', function () {
				_this.getScreen();
				setTimeout(function(){ _this.showScreen(); }, 0);
			});

			if(_this.getConfig('cvaaBtnPosition')=="first"){
				this.bind('captionsMenuEmpty', function () {
					_this.addOptionsBtn();
				});
			} else if(_this.getConfig('cvaaBtnPosition')=="last"){
				this.bind('captionsMenuReady', function () {
					_this.addOptionsBtn();
				});
			}

			this.bind('preShowScreen', function (event, screenName) {
				if ( screenName === "cvaa" ){
					_this.getScreen().then(function(screen){
						screen.addClass('semiTransparentBkg');
						embedPlayer.triggerHelper("cvaaScreenOpen");
					});
				}
			});

			this.bind('showScreen', function (event, screenName) {
				if ( screenName === "cvaa" ){
					_this.getScreen().then(function(screen){
						$(embedPlayer.getPlayerElement()).addClass("blur");
						embedPlayer.getPlayerPoster().addClass("blur");
					});
				}
			});

			this.bind('preHideScreen', function (event, screenName) {
				if ( screenName === "cvaa" ){
					if (_this.getPlayer().getPlayerElement()) {
						$( "#" + _this.getPlayer().getPlayerElement().id ).removeClass( "blur" );
						_this.getPlayer().getPlayerPoster().removeClass( "blur" );
					}
					embedPlayer.enablePlayControls();
					_this.showControls();
				}
			});
		},
		addOptionsBtn: function(){
			this.getPlayer().triggerHelper("addOptionsToCaptions",{
				"optionsLabel": this.getConfig('optionsBtnName'),
				"optionsEvent": this.getConfig('optionsEvent')
			});
		},
		getTemplateData: function () {
			return {
				'cvaa': this,
				'cvaaUrl': this.getConfig('cvaaUrl'),
				'cvaaUrlText': this.getConfig('cvaaUrlText'),
				'checkboxText': this.getConfig('checkboxText'),
				'genericText': this.getConfig('genericText')
			};
		},
		addScreenBindings: function(){
			if (mw.isNativeApp()) {
				$(".infoScreen .panel-right").removeClass("panel-right");
			}
		},
		isSafeEnviornment: function() {
			return !mw.isIpad() || ( mw.isIpad() && mw.getConfig('EmbedPlayer.EnableIpadHTMLControls') !== false );
		}

	}));

} )( window.mw, window.jQuery );