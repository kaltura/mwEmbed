// Scope everything in "mw" ( keeps the global namespace clean ) 
( function( mw ) {
	
	mw.addResourcePaths({
		"mw.MobileAdTimeline" : "mw.MobileAdTimeline.js",
		"mw.KAds" : "mw.KAds.js"
	});
	
	// Check for new Embed Player events: 
	$j( mw ).bind( 'newEmbedPlayerEvent', function( event, embedPlayer ){
		
		// Check for KalturaSupport uiConf
		$j( embedPlayer ).bind( 'KalturaSupport.checkUiConf', function( event, $uiConf, callback ){
			
			// Check if the kaltura ad plugin is enabled:
			if( $uiConf.find('Plugin#vast').length ){
				
				// Load the ad plugin components
				mw.load( ["mw.KAds", "mw.MobileAdTimeline"], function(){
					
					// Add the ads to the player: 
					mw.addKalturaAds( embedPlayer,  $uiConf.find('Plugin#vast'), function(){
						
						// Wait until ads are loaded before running callback
						// ( ie we don't want to display the player until ads are ready )
						callback();
					});
				});
			} else {
				// Continue player build out for players without ads
				callback();
			}
		});
	});
	
	// Ads have to communicate with parent iframe to support companion ads.
	// ( we have to add them for all players since checkUiConf is done on the other side of the
	// iframe proxy )
	$j( mw ).bind( 'AddIframeExportedBindings', function( event, exportedBindings){
		// Add the updateCompanionTarget binding to bridge iframe
		exportedBindings.push( 'updateCompanionTarget' );
	});
	
	// Add the updateCompanion binding to new iframeEmbedPlayers
	$j( mw ).bind( 'newIframeEmbedPlayerEvent', function( event, embedPlayer ){
		$j( embedPlayer ).bind( 'updateCompanionTarget', function( event, companionObject) {
			// NOTE: security wise we should try and "scrub" the html for script tags
			$j('#' + companionObject.elementid ).html( 
					companionObject.html
			)
		});
	});

} )( window.mw );