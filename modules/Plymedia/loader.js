/**
* Plymedia close caption module loader
* 
* @Description of plymedia module goes here
* @author plymedia authored by
*/
( function( mw ) {	
	// List named resource paths
	mw.addResourcePaths({
		"plyMediaPlayer" : "plyMedia/Your_PlyMedia_HTML5_Lib_Could_Go_Here.js",
		"plyMedia.style" :  "plyMedia/Your_Css_File_Could_Go_Here_.css",
		"mw.plyMediaConfig" : "mw.plyMediaConfig.js"
	});
	
	mw.addModuleLoader( 'plyMedia', function(){
		// load any files needed for plyMedia player ( ie plyMediaPlayer and plyMedia.style )
		return ['mw.plyMediaConfig' ];
	});
	
	// Bind the plyMedia player where the uiconf includes the plymedia plugin
	$j( mw ).bind( 'newEmbedPlayerEvent', function( event, embedPlayer ){
		
		$j( embedPlayer ).bind( 'KalturaSupport_CheckUiConf', function( event, $uiConf , callback){
			// Check for plyMedia in kaltura uiConf
			if( kWidgetSupport.getPluginConfig( embedPlayer, $uiConf, 'plymedia', 'plugin' ) ){
				// Load the plyMeida module:
			    mw.load( 'plyMedia', function(){
			    	mw.plyMediaConfig.bindPlayer( embedPlayer );
			    });
			}
			// Don't block player display on plyMedia plugin loading ( directly issue the callback )
			callback();
		});
	});

} )( window.mw );