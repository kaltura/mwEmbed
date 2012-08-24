( function( mw, $ ) { "use strict";
	
	mw.addResourcePaths( {
		"mw.AkamaiAnalytics" : "mw.AkamaiAnalytics.js"
	} );

	// Check if the plugin is enabled: 
	$( mw ).bind( 'newEmbedPlayerEvent', function( event, embedPlayer ) {
		embedPlayer.bindHelper( 'KalturaSupport_CheckUiConf', function( event, $uiConf, callback ) {
			// Check if plugin exists
			if( embedPlayer.isPluginEnabled( 'akamaiAnalytics' ) ) {
				mw.load( [ "mw.AkamaiAnalytics" ], function() {
					// Pass the AkamaiAnalytics plugin
					embedPlayer.akamaiAnalytics = new mw.AkamaiAnalytics( embedPlayer, callback );
				} );
			} else {
				// No AkamaiAnalytics plugin issue callback to continue player build out
				callback();
			}
		});
	});

} )( window.mw, window.jQuery );