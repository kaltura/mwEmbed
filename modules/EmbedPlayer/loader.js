/**
* EmbedPlayer loader
*/

/**
* Default player module configuration 
*/
( function( mw ) {
	window['MW_EMBED_LIBRARY_PAGE'] = 'http://www.kaltura.org/project/HTML5_Video_Media_JavaScript_Library';
	
	mw.setDefaultConfig( {		
		// If the player controls should be overlaid on top of the video ( if supported by playback method)
		// can be set to false per embed player via overlayControls attribute 
		'EmbedPlayer.OverlayControls' : true,
		
		// A default apiProvider ( ie where to lookup subtitles, video properties etc )
		// NOTE: Each player instance can also specify a specific provider  
		"EmbedPlayer.ApiProvider" : "local",
		
		// What tags will be re-written to video player by default
		// Set to empty string or null to avoid automatic video tag rewrites to embedPlayer 	
		"EmbedPlayer.RewriteTags" : "video,audio,playlist",
	
		// Default video size ( if no size provided )	
		"EmbedPlayer.DefaultSize" : "400x300",
	
		// If the video player should attribute kaltura	
		"EmbedPlayer.KalturaAttribution" : true,

		// The attribution button
		'EmbedPlayer.AttributionButton' :{
			'title' : 'Kaltura html5 video library',
		    'href' :  MW_EMBED_LIBRARY_PAGE,
		    // Style icon to be applied 
		    'class' : 'kaltura-icon',
		    // An icon image url ( should be a 12x12 image or data url )  
		    'iconurl' : false
		},

		 
		// Set the browser player warning flag displays warning for non optimal playback 
		"EmbedPlayer.ShowNativeWarning" : true,
		
		// If fullscreen is global enabled. 
		"EmbedPlayer.EnableFullscreen" : true,
		
		// If mwEmbed should use the Native player controls
		// this will prevent video tag rewriting and skinning
		// useful for devices such as iPad / iPod that
		// don't fully support DOM overlays or don't expose full-screen 
		// functionality to javascript  
		"EmbedPlayer.NativeControls" : false,
		
		// If mwEmbed should use native controls on mobile safari
		"EmbedPlayer.NativeControlsMobileSafari" : true,
		
		
		// The z-index given to the player interface during full screen ( high z-index )  
		"EmbedPlayer.fullScreenZIndex" : 999998,
		
		// The default share embed mode ( can be "object" or "videojs" )
		//
		// "object" will provide a <object tag pointing to mwEmbedFrame.php
		// 		Object embedding should be much more compatible with sites that
		//		let users embed flash applets
		// "videojs" will include the source javascript and video tag to
		//	 	rewrite the player on the remote page DOM  
		//		Video tag embedding is much more mash-up friendly but exposes
		//		the remote site to the mwEmbed javascript and can be a xss issue. 
		"EmbedPlayer.ShareEmbedMode" : 'object',
		
		// Default player skin name
		"EmbedPlayer.SkinName" : "mvpcf",	
		
		// Number of milliseconds between interface updates 		
		'EmbedPlayer.MonitorRate' : 250
	} );

	// Add class file paths 
	mw.addResourcePaths( {
		"mw.EmbedPlayer"	: "mw.EmbedPlayer.js",
		
		"mw.EmbedPlayerKplayer"	: "mw.EmbedPlayerKplayer.js",
		"mw.EmbedPlayerGeneric"	: "mw.EmbedPlayerGeneric.js",
		"mw.EmbedPlayerHtml" : "mw.EmbedPlayerHtml.js",
		"mw.EmbedPlayerJava": "mw.EmbedPlayerJava.js",
		"mw.EmbedPlayerNative"	: "mw.EmbedPlayerNative.js",
		
		"mw.EmbedPlayerVlc" : "mw.EmbedPlayerVlc.js",
		
		"mw.PlayerControlBuilder" : "skins/mw.PlayerControlBuilder.js",		
	
		"mw.style.EmbedPlayer" : "skins/mw.style.EmbedPlayer.css",
		
		"mw.style.PlayerSkinKskin" 	: "skins/kskin/mw.style.PlayerSkinKskin.css",
			
		"mw.PlayerSkinKskin"		: "skins/kskin/mw.PlayerSkinKskin.js",
		
		"mw.PlayerSkinMvpcf"		: "skins/mvpcf/mw.PlayerSkinMvpcf.js",
		"mw.style.PlayerSkinMvpcf" 	: "skins/mvpcf/mw.style.PlayerSkinMvpcf.css"	
	} );

	/**
	* Check the current DOM for any tags in "EmbedPlayer.RewriteTags"
	*/
	mw.documentHasPlayerTags = function() {
		var rewriteTags = mw.getConfig( 'EmbedPlayer.RewriteTags' );			
		if( $j( rewriteTags ).length != 0 ) {			
			return true;			
		}
		
		var tagCheckObject = { 'hasTags' : false };
		$j( mw ).trigger( 'LoaderEmbedPlayerDocumentHasPlayerTags', 
				[ tagCheckObject ]);
			 
		return tagCheckObject.hasTags;
	};

	/**
	* Add a DOM ready check for player tags 
	*
	* We use mw.addSetupHook instead of mw.ready so that
	* mwEmbed player is setup before any other mw.ready calls
	*/
	mw.addSetupHook( function( callback ) {
		mw.rewritePagePlayerTags();
		// Run the setupFlag to continue setup		
		callback();
	});
	
	mw.rewritePagePlayerTags = function() {
		mw.log( 'EmbedPlayer:: Document::' + mw.documentHasPlayerTags() );
		if( mw.documentHasPlayerTags() ) {
			var  rewriteElementCount = 0;
			
			// Set each player to loading ( as early on as possible ) 
			$j( mw.getConfig( 'EmbedPlayer.RewriteTags' ) ).each( function( index, element ){
								
				// Assign an the element an ID ( if its missing one )			
				if ( $j( element ).attr( "id" ) == '' ) {
					$j( element ).attr( "id",  'v' + ( rewriteElementCount++ ) );
				}
				// Add an absolute positioned loader
				$j( element )
					.getAbsoluteOverlaySpinner()
					.attr('id', 'loadingSpinner_' + $j( element ).attr('id') )
					.addClass( 'playerLoadingSpinner' );
								
			});									
			// Load the embedPlayer module ( then run queued hooks )			
			mw.load( 'EmbedPlayer', function ( ) {		
				mw.log("EmbedPlayer:: do rewrite players:" + $j( mw.getConfig( 'EmbedPlayer.RewriteTags' ) ).length );
				// Rewrite the EmbedPlayer.RewriteTags with the 
				$j( mw.getConfig( 'EmbedPlayer.RewriteTags' ) ).embedPlayer();				
			})
		}
	}

	/**
	* Add the module loader function:
	*/
	mw.addModuleLoader( 'EmbedPlayer', function() {
		var _this = this;		
		// Hide videonojs class
		$j( '.videonojs' ).hide();
		
		// Set up the embed video player class request: (include the skin js as well)
		var dependencyRequest = [
			[
				'$j.ui',								
				'mw.EmbedPlayer',
				'mw.PlayerControlBuilder',
				'$j.fn.hoverIntent',
				'mw.style.EmbedPlayer',
				'$j.cookie',
				// Add JSON lib if browsers does not define "JSON" natively
				'JSON',
				'$j.widget'
			],
			[			 
			 	'$j.ui.mouse',
				'$j.fn.menu',			
				'mw.style.jquerymenu',
				'$j.ui.slider'
			]
			
		];

		// Pass every tag being rewritten through the update request function
		$j( mw.getConfig( 'EmbedPlayer.RewriteTags' ) ).each( function() {	
			var playerElement = this;		
			mw.embedPlayerUpdateLibraryRequest( playerElement,  dependencyRequest[ 0 ] )			
		} );
		
		// Add PNG fix code needed:
		if ( $j.browser.msie && $j.browser.version < 7 ) {
			dependencyRequest[0].push( '$j.fn.pngFix' );
		}
		
		// Do short detection, to avoid extra player library request in ~most~ cases. 
		//( If browser is firefox include native, if browser is IE include java ) 
		if( $j.browser.msie ) {
			dependencyRequest[0].push( 'mw.EmbedPlayerJava' )		
		}
				
		// Safari gets slower load since we have to detect ogg support 
		if( !!document.createElement('video').canPlayType &&  !$j.browser.safari  ) {		
			dependencyRequest[0].push( 'mw.EmbedPlayerNative' )
		}		
		
		// Return the set of libs to be loaded
		return dependencyRequest;					
	} );
	
	/**
	 * Takes a embed player element and updates a request object with any 
	 * dependent libraries per that tags attributes.
	 * 
	 * For example a player skin class name could result in adding some 
	 *  css and javascirpt to the player library request. 
	 *    
	 * @param {Object} playerElement The tag to check for library dependent request classes.
	 * @param {Array} dependencyRequest The library request array
	 */
	mw.embedPlayerUpdateLibraryRequest = function(playerElement, dependencyRequest ){
		var skinName = $j( playerElement ).attr( 'class' );					
		// Set playerClassName to default if unset or not a valid skin	
		if( ! skinName || $j.inArray( skinName.toLowerCase(), mw.validSkins ) == -1 ){
			skinName = mw.getConfig( 'EmbedPlayer.SkinName' );
		}
		skinName = skinName.toLowerCase();		
		// Add the skin to the request 		
		var skinCaseName =  skinName.charAt(0).toUpperCase() + skinName.substr(1);
		// The skin js:		
		if( $j.inArray( 'mw.PlayerSkin' + skinCaseName, dependencyRequest ) == -1 ){
			dependencyRequest.push( 'mw.PlayerSkin' + skinCaseName );
		}
		// The skin css
		if( $j.inArray( 'mw.style.PlayerSkin' + skinCaseName, dependencyRequest ) == -1 ){
			dependencyRequest.push( 'mw.style.PlayerSkin' + skinCaseName );
		}
	
		// Allow extension to extend the request. 				
		$j( mw ).trigger( 'LoaderEmbedPlayerUpdateRequest', 
				[ playerElement, dependencyRequest ] );
	}

} )( window.mw );
