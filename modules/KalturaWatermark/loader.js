// Scope everything in "mw" ( keeps the global namespace clean ) 

( function( mw ) {
	
	mw.addResourcePaths({
		"mw.KalturaWatermark" : "mw.KalturaWatermark.js" 
	});
	
	// Bind the KalturaWatermark where the uiconf includes the Kaltura Watermark 
	$j( mw ).bind( 'newEmbedPlayerEvent', function( event, embedPlayer ){		
		$j( embedPlayer ).bind( 'KalturaSupport.checkUiConf', function(event, $uiConf , $uiConfFile, callback){
			mw.log( $j( $uiConfFile ).html() );
			if( $uiConfFile.find( 'watermark' ).length ){
				$j( embedPlayer ).bind( 'playerReady', function(){
					mw.load( 'mw.KalturaWatermark', function(){
						mw.KalturaWatermark.draw( $uiConfFile.find( 'watermark' ), embedPlayer );
					})
				})
			}
		});
	});
	
} )( window.mw );