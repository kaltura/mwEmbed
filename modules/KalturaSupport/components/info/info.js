( function( mw, $ ) {"use strict";

mw.PluginManager.add( 'infoScreen', mw.KBaseScreen.extend({

	defaultConfig: {
		parent: "topBarContainer",
		order: 3,
		align: "right",
		tooltip: 'Info',
		showTooltip: true,
		usePreviewPlayer: true,
		previewPlayerEnabled: true,
		templatePath: 'components/info/info.tmpl.html'
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
	}

}));

} )( window.mw, window.jQuery );