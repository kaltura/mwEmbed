/**
* Plymedia close caption module loader
* 
* @The module fetches subtitles from Subply by kaltura's entryId
* @author Elizabeth Marr
*/
( function( mw, $ ) {	
	// List named resource paths
	mw.addResourcePaths({
		"plymedia.style" :  "styles/plymediaStyles.css",
		"mw.Subply" : "mw.Subply.js"
	});

	mw.addModuleLoader( 'plymedia', function(){
		// load any files needed for plyMedia player ( ie plyMediaPlayer and plyMedia.style )
		return [ 'mw.Subply', 'plymedia.style' ];
	});
	
	// Bind the plyMedia player where the uiconf includes the plymedia plugin
	$( mw ).bind( 'newEmbedPlayerEvent', function( event, embedPlayer ){
		$( embedPlayer ).bind( 'KalturaSupport_CheckUiConf', function( event, $uiConf , callback){
			if( embedPlayer.getKalturaConfig( 'plymedia', 'plugin' ) ){
				mw.load( 'plymedia', function(){
					mw.Subply.bindPlayer( embedPlayer );
					callback();
			    });
			} else {
				callback();
			}
		});
	});

} )( window.mw, jQuery );