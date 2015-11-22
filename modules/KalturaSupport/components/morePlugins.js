( function( mw, $ ) {"use strict";

	mw.PluginManager.add( 'morePlugins', mw.KBaseSmartContainer.extend({

		defaultConfig: {
			'parent': 'topBarContainer',
			'order': 1,
			'showTooltip': true,
			"displayImportance": "high",
			"align": "right",
			"cssClass": "icon-more"
		},

		title: gM( 'mwe-embedplayer-more' ),
		closingEvents: 'onAddPlayerSpinner onplay preShowScreen'
	}));

} )( window.mw, window.jQuery );
