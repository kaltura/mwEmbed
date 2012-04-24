( function( mw, $ ) { "use strict";
	
	mw.addResourcePaths( {
		"mw.GoogleAnalytics" : "mw.GoogleAnalytics.js"
	} );

	// Check if the plugin is enabled: 
	$( mw ).bind( 'newEmbedPlayerEvent', function( event, embedPlayer ) {
		embedPlayer.bindHelper( 'KalturaSupport_CheckUiConf', function( event, $uiConf, callback ) {
			// Check if plugin exists
			if( embedPlayer.isPluginEnabled( 'googleAnalytics' ) ) {
				mw.load( [ "mw.GoogleAnalytics" ], function() {
					// Pass the GoogleAnalytics plugin
					embedPlayer.googleAnalytics = new mw.GoogleAnalytics( embedPlayer, callback );
				} );
			} else {
				// No GoogleAnalytics plugin issue callback to continue player build out
				callback();
			}
		});
	});

} )( window.mw, window.jQuery );