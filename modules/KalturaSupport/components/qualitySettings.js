( function( mw, $ ) {"use strict";

	mw.PluginManager.add( 'qualitySettings', mw.KBaseSmartContainer.extend({

		defaultConfig: {
			'parent': 'topBarContainer',
			'order': 1,
			'showTooltip': true,
			"displayImportance": "high",
			"align": "right",
			"cssClass": "icon-cog"
		},

		title: gM( 'mwe-embedplayer-quality_settings' ),
		closingEvents: 'onAddPlayerSpinner onplay updatedPlaybackRate changedClosedCaptions'
	}));

} )( window.mw, window.jQuery );
