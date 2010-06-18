/**
* EmbedPlayer loader
*/

/**
* Default player module configuration 
*/
( function( mw ) {
	
	mw.setDefaultConfig( {
		// If the Timed Text interface should be displayed: 
		// 'always' Displays link and call to contribute always
		// 'auto' Looks for child timed text elements or "apiTitleKey" & load interface
		// 'off' Does not display the timed text interface	
		"textInterface" : "auto",
		
		// If the player controls should be overlaid on top of the video ( if supported by playback method)
		// can be set to false per embed player via overlayControls attribute 
		'overlayControls' : true,
		
		// A default apiProvider ( ie where to lookup subtitles, video properties etc )
		// NOTE: Each player instance can also specify a specific provider  
		"apiProvider" : "commons",
		
		// What tags will be re-written to video player by default
		// Set to empty string or null to avoid automatic video tag rewrites to embedPlayer 	
		"rewritePlayerTags" : "video,audio,playlist",
	
		// Default video size ( if no size provided )	
		"videoSize" : "400x300",
	
		// If the video player should attribute kaltura	
		"kalturaAttribution" : true,
		 
		 // Set the browser player warning flag to true by default ( applies to all players so its not part of attribute defaults above ) 
		"showNativePlayerWarning" : true,
		
		// If fullscreen is global enabled. 
		"enableFullscreen" : true,
		
		// If mwEmbed should use the Native player controls
		// this will prevent video tag rewriting and skinning
		// useful for devices such as iPad / iPod that
		// don't fully support DOM overlays or don't expose full-screen 
		// functionality to javascript  
		"nativePlayerControls" : false,
		
		// If mwembed should use native controls on mobile safari
		"nativePlayerControlsMobileSafari" : true,
		
		
		// The z-index given to the player interface during full screen ( high z-index )  
		"fullScreenIndex" : 999998,
		
		// The default share embed mode ( can be "object" or "videojs" )
		//
		// "object" will provide a <object tag pointing to mwEmbedFrame.php
		// 		Object embedding should be much more compatible with sites that
		//		let users embed flash applets
		// "videojs" will include the source javascript and video tag to
		//	 	rewrite the player on the remote page DOM  
		//		Video tag embedding is much more mash-up friendly but exposes
		//		the remote site to the mwEmbed js. 
		"shareEmbedMode" : 'object',
		
		// Default player skin name
		"playerSkinName" : "mvpcf"	
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
	* Check the current DOM for any tags in "rewritePlayerTags"
	* 
	* NOTE: this function can be part of setup can run prior to jQuery being ready
	*/
	mw.documentHasPlayerTags = function() {
		var rewriteTags = mw.getConfig( 'rewritePlayerTags' );				
		if( rewriteTags ) {
			var jtags = rewriteTags.split( ',' );
			for ( var i = 0; i < jtags.length; i++ ) { 
				if( document.getElementsByTagName( jtags[i] )[0] ) {				
					return true;
				}
			}
		}
		
		var tagCheckObject = { 'hasTags' : false };
		$j( mw ).trigger( 'LoaderEmbedPlayerDocumentHasPlayerTags', 
				[ tagCheckObject ]);
			 
		return tagCheckObject.hasTags;
	};

	/**
	* Add a DOM ready check for player tags 
	*
	* We use mw.addDOMReadyHook instead of mw.ready so that
	* player interfaces are ready once mw.ready is called. 
	*/
	mw.addSetupHook( function( callback ) {
		if( mw.documentHasPlayerTags() ) {
			var  rewriteElementCount = 0;
			
			// Set each player to loading ( as early on as possible ) 
			$j( mw.getConfig( 'rewritePlayerTags' ) ).each( function( index, element ){
								
				// Assign an the element an ID (if its missing one)			
				if ( $j( element ).attr( "id" ) == '' ) {
					$j( element ).attr( "id",  'v' + ( rewriteElementCount++ ) );
				}

				// Add an absolute positioned loader
				var pos = $j( element ).offset();
				mw.log( ' l: ' + pos.left + ' t: ' + pos.top ); 
				
				var posLeft = (  $j( element ).width() ) ? 
					parseInt( pos.left + ( .4 * $j( element ).width() ) ) : 
					pos.left + 30;
					
				var posTop = (  $j( element ).height() ) ? 
					parseInt( pos.top + ( .4 * $j( element ).height() ) ) : 
					pos.top + 30;			
							
				$j('body').append(
					$j('<div />')
					.loadingSpinner()
					.attr('id', 'loadingSpinner_' + $j( element ).attr('id') )
					.addClass( 'playerLoadingSpinner' )
					.css({
						'width' : 32,
						'height' : 32,
						'position': 'absolute',
						'top' : posTop + 'px',
						'left' : posLeft + 'px'
					})						
				)
			});									
			// Load the embedPlayer module ( then run queued hooks )
			mw.load( 'EmbedPlayer', function ( ) {												
				// Rewrite the rewritePlayerTags with the 
				$j( mw.getConfig( 'rewritePlayerTags' ) ).embedPlayer();				
				// Run the setup callback now that we have setup all the players
				callback();							
			})
		} else {
			callback();
		}
	});

	/**
	* Add the module loader function:
	*/
	mw.addModuleLoader( 'EmbedPlayer', function( callback ) {
		var _this = this;		
		// Set module specific class videonojs to loading:
		$j( '.videonojs' ).html( gM( 'mwe-embedplayer-loading_txt' ) );
		
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
				'JSON'
			],
			[
				'$j.fn.menu',			
				'mw.style.jquerymenu',
				'$j.ui.slider'
			]
			
		];

		// Pass every tag being rewritten through the update request function
		$j( mw.getConfig( 'rewritePlayerTags' ) ).each( function() {	
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
		
		// Load the video libs:
		mw.load( dependencyRequest, function() {	
			// Setup userConfig 
			mw.setupUserConfig( function() {
				// Remove no video html elements:
				$j( '.videonojs' ).remove();				
				
				// Detect supported players:  
				mw.EmbedTypes.init();				
							
				// Run the callback with name of the module  
				if( typeof callback == 'function' )	{
					callback( 'EmbedPlayer' );		
				}
				
			} ); // setupUserConfig
		} );		
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
		var playerClassName = $j( playerElement ).attr( 'class' );	
		var playerSkins = {};
		
		// Set playerClassName to default	
		if( ! playerClassName ){
			playerClassName = mw.getConfig( 'playerSkinName' );
		}		
		// compre with lower case: 
		playerClassName = playerClassName.toLowerCase();
		for( var n=0; n < mw.validSkins.length ; n++ ) {
			// Get any other skins that we need to load 
			// That way skin js can be part of the single script-loader request: 
			if( playerClassName.indexOf( mw.validSkins[ n ].toLowerCase() ) !== -1) {
				// Add skin name to playerSkins
				playerSkins[ mw.validSkins[ n ].toLowerCase() ] = true;
			}
		}
	
		
		// Add the player skins css and js to the load request:	
		for( var pSkin in playerSkins ) {
			// Make sure first letter of skin is upper case to load skin class: 
			var f = pSkin.charAt(0).toUpperCase();
    		pSkin =  f + pSkin.substr(1);
    	
			// Add skin js
			dependencyRequest.push( 'mw.PlayerSkin' + pSkin );	
			// Add the skin css 
			dependencyRequest.push( 'mw.style.PlayerSkin' + pSkin );
		}	
		
		// Allow extension to extend the request. 
		//mw.log( 'LoaderEmbedPlayerUpdateRequest' );
		
		$j( mw ).trigger( 'LoaderEmbedPlayerUpdateRequest', 
				[ playerElement, dependencyRequest ] );

	}

} )( window.mw );
