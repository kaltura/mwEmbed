( function( mw, $ ) {"use strict";

mw.PluginManager.add( 'infoScreen', mw.KBaseScreen.extend({

	defaultConfig: {
		parent: "topBarContainer",
		order: 3,
		align: "right",
		tooltip: 'Info',
		showTooltip: true,
		usePreviewPlayer: false,
		previewPlayerEnabled: false,
		title:  gM( 'mwe-embedplayer-info' ),
		templatePath: 'components/info/info.tmpl.html',
		smartContainer: 'morePlugins',
		smartContainerCloseEvent: 'hideScreen'
	},
	iconBtnClass: "icon-info",
	setup: function () {
		if (mw.isNativeApp()) {
			this.setConfig("showTooltip",false);
			this.setConfig("usePreviewPlayer",false);
		}
		this.addBindings();
	},
	addBindings: function () {
		var _this = this;
		var embedPlayer = this.getPlayer();
		this.bind('playerReady', function () {
			_this.getScreen();
		});
		this.bind('preShowScreen', function (event, screenName) {
			if ( screenName === "infoScreen" ){
				_this.getScreen().then(function(screen){
					screen.addClass('semiTransparentBkg');
					embedPlayer.disablePlayControls();
					embedPlayer.triggerHelper("infoScreenOpen");
				});
			}
		});
		this.bind('showScreen', function (event, screenName) {
			if ( screenName === "infoScreen" ){
				_this.getScreen().then(function(screen){
					$(embedPlayer.getPlayerElement()).addClass("blur");
					embedPlayer.getPlayerPoster().addClass("blur");
					embedPlayer.getInterface().find(".infoScreen .icon-close").focus();
					screen.keydown( $.proxy( _this.tabKeyBind, _this )  );
				});
			}
		});
		this.bind('preHideScreen', function (event, screenName) {
			if ( screenName === "infoScreen" ){
				embedPlayer.enablePlayControls();
				embedPlayer.triggerHelper("showLargePlayBtn");
				if (_this.getPlayer().getPlayerElement()) {
					$( "#" + _this.getPlayer().getPlayerElement().id ).removeClass( "blur" );
					_this.getPlayer().getPlayerPoster().removeClass( "blur" );
				}
			}
		});
		this.bind('onOpenFullScreen', function () {
			setTimeout(function(){
				if (embedPlayer.getVideoHolder().width() <= 640){
					embedPlayer.getVideoHolder().addClass("fullscreen-video-size-small");
				}
			},500);
		});
		this.bind('onCloseFullScreen', function () {
			embedPlayer.getVideoHolder().removeClass("fullscreen-video-size-small");
		});
		this.tabKeyBind = function(e){
			if(e.keyCode === 9){// keyCode = 9 - tab button
				setTimeout(function () {
					var currentFocusedElement = $(':focus');//when timeout will done - new element will be in focus
					if(!currentFocusedElement.parents('.infoScreen').length){
						_this.getPlayer().getInterface().find(".infoScreen .icon-close").focus();
						return;
					}
				}, 0);
			}
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