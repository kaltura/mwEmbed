
// XXX can be removed once we move to new resource loader: 
window.adPlugin = true;

// Check for new Embed Player events: 
$j( mw ).bind( 'newEmbedPlayerEvent', function( event, embedPlayer ){
	
	// Check for KalturaSupport uiConf
	$j( embedPlayer ).bind( 'KalturaSupport_CheckUiConf', function( event, $uiConf, callback ){
		var loadingAdPlugin = false;
		
		// Check if the kaltura ad plugin is enabled:
		if( embedPlayer.getKalturaConfig( 'vast', 'plugin' ) ){
			loadingAdPlugin = true;
			// Load the Kaltura Ads and AdSupport Module:
			mw.load( [ "AdSupport", "mw.KAds" ], function(){
				// Add the ads to the player: 
				mw.addKalturaAds( embedPlayer, $uiConf, function(){
					mw.log("AdPlugin ( done loading ads, run callback:");
					// Wait until ads are loaded before running callback
					// ( ie we don't want to display the player until ads are ready )
					callback();
				});
			});
		}
		
		// Check for freewheel ads
		if( embedPlayer.getKalturaConfig( 'FreeWheel',  'plugin' ) ){
			loadingAdPlugin = true;
			var fwConfig = embedPlayer.getKalturaConfig(
				'FreeWheel',
				[ 'plugin', 'preSequence', 'postSequence', 'width', 'height', 'asyncInit',
				 'adManagerUrl', 'serverUrl', 'networkId', 'videoAssetId',  'videoAssetIdType', 
				 'playerProfile', 'videoAssetNetworkId' ]
			);
			mw.load( ["FreeWheel"], function(){
				mw.addFreeWheelControler( embedPlayer, fwConfig, callback );
			});
		}
		
		if( !loadingAdPlugin ){
			// Continue player build out for players without ads
			callback();
		}
	});
});

