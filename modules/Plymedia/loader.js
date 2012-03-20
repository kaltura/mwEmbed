/**
* Plymedia close caption module loader
* 
* @The module fetches subtitles from Subply by kaltura's entryId
* @author Elizabeth Marr
*/
( function( mw, $ ) { "use strict";	
	// List named resource paths
	mw.addResourcePaths({
		"plymedia.style" :  "styles/plymediaStyles.css",
		"mw.Subply" : "mw.Subply.js"
	});
	
	mw.setDefaultConfig( {
		// 1 - 100. 1 being highest (captions at the top of the video), 100 being lowest (captions at the default bottom which is 40 px)
		"Plymedia.subpos" : 100,
		
		// default language - language code or 'none' for no default language
		'Plymedia.deflang' : 'off',
		
		// whether captions have background or not
		'Plymedia.showbackground' : true
	} );	
	
	mw.addModuleLoader( 'plymedia', function(){
		// load any files needed for plyMedia player ( ie plyMediaPlayer and plyMedia.style )
		return [ 'mw.Subply', 'plymedia.style' ];
	});
	
	// Bind the plyMedia player where the uiconf includes the plymedia plugin
	$( mw ).bind( 'newEmbedPlayerEvent', function( event, embedPlayer ){
		$( embedPlayer ).bind( 'KalturaSupport_CheckUiConf', function( event, $uiConf , callback){
			if( embedPlayer.isPluginEnabled( 'plymedia' ) ){
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