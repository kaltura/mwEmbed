// Scope everything in "mw" ( keeps the global namespace clean ) 
( function( mw ) {
	
	mw.addResourcePaths({
		"mw.MobileAdTimeline" : "mw.MobileAdTimeline.js",
		"mw.KAds" : "mw.KAds.js"
	});
	
	// Bind the KalturaWatermark where the uiconf includes the Kaltura Watermark 
	$j( mw ).bind( 'newEmbedPlayerEvent', function( event, embedPlayer ){
		$j( embedPlayer ).bind( 'KalturaSupport.checkUiConf', function( event, $uiConf, callback ){
			// Check if the ad plugin is enabled:
			if( $uiConf.find('Plugin#vast').length ){
				mw.load( ["mw.KAds", "mw.MobileAdTimeline"], function(){
					mw.addKalturaAds( embedPlayer,  $uiConf.find('Plugin#vast'), function(){
						// Wait until ads are loaded before running callback
						// ( ie we don't want to display the player until ads are ready ) 
						callback();
					});
				});
			} else {
				// Continue trigger event regardless of if ui-conf is found or not
				callback();
			}
		});
	});
	
} )( window.mw );