/**
* Miro Sub module
*/

// Wrap in mw to not pollute global namespace
( function( mw ) {
	mw.addMessages( {
		"mwe-mirosubs-add-universal-subtitles" :   "Universal subtitles editor",
		"mwe-mirosubs-loading-universal-subtitles" : "Loading <i>universal subtitles</i> editor"
	});
	// add as loader dependency  'mw.style.mirosubsMenu' 
	
	mw.addResourcePaths( {
		"goog" : "mirosubs/base.min.js",
		"mirosubs" : "mirosubs/mirosubs-api.min.js",
		"mw.MiroSubsConfig" : "mw.MiroSubsConfig.js",
		"mw.style.mirosubsMenu" : "css/mw.style.mirosubsMenu.css"
	});
	
	mw.setDefaultConfig( {
		'MiroSubs.EnableUniversalSubsEditor': false
	})
	
	mw.addModuleLoader( 'MiroSubs', function(){
		var resourceList = [ "mirosubs", "mw.MiroSubsConfig" ];
		return resourceList;
	});
	
	$j( mw ).bind( 'newEmbedPlayerEvent', function( event, embedPlayer ){	
		// Check if the Miro Editor is enabled and the player has an apiTitleKey  
		if( mw.getConfig( 'MiroSubs.EnableUniversalSubsEditor' ) 
			&& 
			embedPlayer.apiTitleKey
		){
			$j( embedPlayer ).bind( 'TimedText.BuildCCMenu', function( event, langMenu ){
				// load the miro subs menu style ( will be part of the loader dependency later on) 
				mw.load(  'mw.style.mirosubsMenu' );
				$j( langMenu ).append( 
					$j.getLineItem( gM( 'mwe-mirosubs-add-universal-subtitles'), 'mirosubs', function() {					
						// Show loader
						mw.addLoaderDialog( gM('mwe-mirosubs-loading-universal-subtitles') );
						
						// Load miro subs:
						mw.load( 'MiroSubs', function(){				
							mw.MiroSubsConfig.getConfig( embedPlayer , function( config ){							
								// xxx NOTE there are some weird async display issues
								// that only seem to be resolvable with timeouts for DOM actions							
								setTimeout(function(){
									mw.closeLoaderDialog();																		
								}, 500);
								// Show the dialog	
								setTimeout(function(){
									mirosubs.api.openDialog( config );
								}, 800);
							});					
						});
						return false;
					})
				);
			});
		};
	});
		
	
} )( window.mw );