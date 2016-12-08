( function( mw, $ ) {"use strict";

	mw.PluginManager.add( 'qualitySettings', mw.KBaseSmartContainer.extend({

		defaultConfig: {
			'parent': 'topBarContainer',
			'order': 2,
			'showTooltip': true,
			"displayImportance": "high",
			"align": "right",
			"cssClass": "icon-cog"
		},

		title: gM( 'mwe-embedplayer-quality_settings' ),
		registeredPlugins: [],
		shouldResumePlay: false,
		pluginsScreenOpened: false,
		isDisabled: false
	}));

} )( window.mw, window.jQuery );
