mw.addResourcePaths({
	"freeWheelAdMannager": "freeWheelAdMannager.js",
	"mw.freeWheelController": "mw.freeWheelController.js"
});

// Check for new Embed Player events: 
$j( mw ).bind( 'newEmbedPlayerEvent', function( event, embedPlayer ){

	// Check for KalturaSupport uiConf
	$j( embedPlayer ).bind( 'KalturaSupport_CheckUiConf', function( event, $uiConf, callback ){

		if( mw.getConfig('TEMP.ForceFreeWheelXML') ){
			mw.load( [ "AdSupport", "mw.freeWheelController", "freeWheelAdMannager" ], function(){
				mw.addFreeWheelControler(embedPlayer, $j( mw.getConfig('TEMP.ForceFreeWheelXML') ), callback );
			});
		} else {
			callback();
		}
		// Check if the kaltura ad plugin is enabled:
		/*if( $uiConf.find('Plugin#freewheel').length ){
			adPlugin( embedPlayer,  $uiConf, callback );
		} else {
			// Continue player build out for players without ads
			callback();
		}*/
	});
});