/**
* Plymedia close caption module loader
* 
* @Description of plymedia module goes here
* @author plymedia authored by
*/
( function( mw ) {
	
	// List named resource paths
	mw.addResourcePaths({
		// Your core plyMedia html5 library 
		"plyMeida" : "plyMeida/plyMeida.js",
		// Any other plyMedia resources ( css multiple js classes? ) 
		"plyMeida.style" :  "plyMeida/plyMeida.css",
		
		// The configuration file bridges the mwEmbed api with plyMedia interface api
		"mw.plyMediaConfig" : "mw.plyMediaConfig.js"
	});
	
	// Bind the plyMedia player where the uiconf includes the plymedia plugin
	$j( mw ).bind( 'newEmbedPlayerEvent', function( event, embedPlayer ){
		
		$j( embedPlayer ).bind( 'KalturaSupport.checkUiConf', function( $uiConf , callback){
			
			// Check for plyMedia in kaltura uiConf
			var $plyPlug = $uiConf.find("uiVars var[key='plymedia.plugin']");
			if( $plyPlug.length ){
				
				// Load the plyMeida module ( note in production plyMedia would be
				// pre-loaded by the iframe uiconf ) 
			    mw.load( 'plyMeida', function(){
			    	mw.PyMediaSubsConfig.bindPlayer( embedPlayer );
			    	
			    	// Issue the ui conf callback once pyMedia has been setup. 
			    	// ( note any asynchronous calls will delay player display ) 
			    	callback();
			    });
			}
		})
	})

} )( window.mw );