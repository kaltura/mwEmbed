/**
* Plymedia close caption module loader
* 
* @Description of plymedia module goes here
* @author plymedia authored by
*/
( function( mw ) {	
	// List named resource paths
	mw.addResourcePaths({
		"plyMeidaPlayer" : "plyMeida/plyMeidaPlayer.js",		
		"plyMeida.style" :  "plyMeida/plyMeida.css",		
		"mw.plyMediaConfig" : "mw.plyMediaConfig.js"
	});
	
	mw.addModuleLoader( 'plyMeida', function(){
		// load any files needed for plyMedia player:
		return ['mw.plyMediaConfig'];
	});
	
	// Bind the plyMedia player where the uiconf includes the plymedia plugin
	$j( mw ).bind( 'newEmbedPlayerEvent', function( event, embedPlayer ){
		
		$j( embedPlayer ).bind( 'KalturaSupport.checkUiConf', function( event, $uiConf , callback){
			// Check for plyMedia in kaltura uiConf
			if( $uiConf.find("plugin#plymedia").length ){
				
				// Load the plyMeida module 
				// NOTE in production plyMedia would be pre-loaded by the iframe uiconf
				
			    mw.load( 'plyMeida', function(){
			    	mw.plyMediaConfig.bindPlayer( embedPlayer );			    	
			    	// Issue the ui conf callback once pyMedia has been setup. 
			    	// ( note any asynchronous calls will delay player display ) 
			    	callback();
			    });
			}
		})
	})

} )( window.mw );