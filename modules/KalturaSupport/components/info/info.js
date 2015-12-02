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
	},
	addScreenBindings: function(){
		if (mw.isNativeApp()) {
			$(".infoScreen .panel-right").removeClass("panel-right");
		}
	},
	isSafeEnviornment: function() {
		return !mw.isIpad() || ( mw.isIpad() && mw.getConfig('EmbedPlayer.EnableIpadHTMLControls') !== false );
	},
	closeScreen: function(){
		this.hideScreen();
	}

}));

} )( window.mw, window.jQuery );