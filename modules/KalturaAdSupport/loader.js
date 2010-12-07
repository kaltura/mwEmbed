// Scope everything in "mw" ( keeps the global namespace clean ) 
( function( mw ) {
	
	mw.addResourcePaths({
		"mw.MobileAdTimeline" : "mw.MobileAdTimeline.js",
		"mw.KAds" : "mw.KAds.js"
	});
	
	// Bind the KalturaWatermark where the uiconf includes the Kaltura Watermark 
	$j( mw ).bind( 'newEmbedPlayerEvent', function( event, embedPlayer ){
		$j( embedPlayer ).bind( 'KalturaSupport.checkUiConf', function( event, $uiConf, callback ){
			var cat = $uiConf.find('advertising');
			//debugger;
			// Check if the ad plugin is enabled:
			if( $uiConf.find('advertising').length && $uiConf.find('advertising').attr('enabled') == 'true' ){
				waitForAds = true;
				mw.addKalturaAds( embedPlayer, $uiConf.find('advertising'), function(){
					waitForAds = false;
					instanceCallback();
				});
			}
			// Continue trigger event regardless of if ui-conf is found or not
			callback();
		});
	});
	
} )( window.mw );