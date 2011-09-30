/**
* EmbedPlayer loader
*/
/**
* Default player module configuration
*/
( function( mw, $ ) {

	mw.setDefaultConfig( {
		// If the player controls should be overlaid on top of the video ( if supported by playback method)
		// can be set to false per embed player via overlayControls attribute
		'EmbedPlayer.OverlayControls' : true,

		// The preferred media format order 
		'EmbedPlayer.CodecPreference': [ 'webm', 'h264', 'mp3', 'ogg' ],
		
		// If the iPad should use html controls 
		// With html controls you can't access native fullscreen 
		// With html controls you can support html themed controls, overlays, ads etc. )
		'EmbedPlayer.EnableIpadHTMLControls': false,
		
		// If webkitSupportsFullscreen is true, this option will make the fullscreen button 
		// use the native players fullscreen ( rather than pop-up a new window with the in-browser
		// fullscreen. 
		'EmbedPlayer.EnableIpadNativeFullscreen': true,
		
		// The attribution library page
		'EmbedPlayer.LibraryPage': 'http://www.kaltura.org/project/HTML5_Video_Media_JavaScript_Library',

		// A default apiProvider ( ie where to lookup subtitles, video properties etc )
		// NOTE: Each player instance can also specify a specific provider
		"EmbedPlayer.ApiProvider" : "local",

		// What tags will be re-written to video player by default
		// Set to empty string or null to avoid automatic video tag rewrites to embedPlayer
		"EmbedPlayer.RewriteSelector" : "video,audio,playlist",

		// Default video size ( if no size provided )
		"EmbedPlayer.DefaultSize" : "400x300",

		// If the video player should attribute kaltura
		"EmbedPlayer.KalturaAttribution" : true,

		// The attribution button
		'EmbedPlayer.AttributionButton' :{
			'title' : 'Kaltura html5 video library',
		 	'href' : 'http://www.kaltura.com',
			// Style icon to be applied
			'class' : 'kaltura-icon',
			// Style to be applied to the outer attribution button container div
			'style' : {},
			// An icon image url 16x16 image url or data url )
			'iconurl' : false
		},
		
		// If the options control bar menu item should be enabled: 
		'EmbedPlayer.EnableOptionsMenu' : true,
		
		// If users can right click on the player
		'EmbedPlayer.EnableRightClick' : true,

		// Default supported menu items is merged with skin menu items
		'EmbedPlayer.EnabledOptionsMenuItems' : [
			// Player Select
			'playerSelect',

			// Download the file menu
			'download',

			// Share the video menu
			'share',

			// Player library link
			'aboutPlayerLibrary'
		],
		
		// If the player should wait for metadata like video size and duration, before trying to draw
		// the player interface. 
		'EmbedPlayer.WaitForMeta' : true,
		
		// Set the browser player warning flag displays warning for non optimal playback
		"EmbedPlayer.ShowNativeWarning" : true,

		// If a fullscreen tip to press f11 should be displayed when entering fullscreen 
		"EmbedPlayer.FullscreenTip" : true,
		
		// If fullscreen is global enabled.
		"EmbedPlayer.EnableFullscreen" : true,
		
		// If fullscreen should pop-open a new window 
		//( instead of trying to expand the video player to browser fullscreen ) 
		"EmbedPlayer.NewWindowFullscreen" : false,

		// If mwEmbed should use the Native player controls
		// this will prevent video tag rewriting and skinning
		// useful for devices such as iPad / iPod that
		// don't fully support DOM overlays or don't expose full-screen
		// functionality to javascript
		"EmbedPlayer.NativeControls" : false,

		// If mwEmbed should use native controls on mobile safari
		"EmbedPlayer.NativeControlsMobileSafari" : true,
		
		// A link to download the latest firefox:
		"EmbedPlayer.FirefoxLink" : 'http://www.mozilla.com/en-US/firefox/upgrade.html?from=mwEmbed',
		
		// The z-index given to the player interface during full screen ( high z-index )
		"EmbedPlayer.FullScreenZIndex" : 10001,

		// The default share embed mode ( can be "object" or "videojs" )
		//
		// "iframe" will provide a <iframe tag pointing to mwEmbedFrame.php
		// 		Object embedding should be much more compatible with sites that
		//		let users embed flash applets
		// "videojs" will include the source javascript and video tag to
		//	 	rewrite the player on the remote page DOM
		//		Video tag embedding is much more mash-up friendly but exposes
		//		the remote site to the mwEmbed javascript and can be a xss issue.
		"EmbedPlayer.ShareEmbedMode" : 'iframe',

		// Default player skin name
		"EmbedPlayer.SkinName" : "mvpcf",

		// Number of milliseconds between interface updates
		'EmbedPlayer.MonitorRate' : 250,
		
		// If on Android should use html5 ( even if flash is installed on the machine )
		'EmbedPlayer.UseFlashOnAndroid' : false,
		
		// If embedPlayer should support server side temporal urls for seeking options are 
		// flash|always|none default is support for flash only.
		'EmbedPlayer.EnableURLTimeEncoding' : 'flash',
		
		// The domains which can read and send events to the video player
		'EmbedPLayer.IFramePlayer.DomainWhiteList' : '*',
		
		// If the iframe should send and receive javascript events across domains via postMessage 
		'EmbedPlayer.EnableIframeApi' : true,
		
		// If set to true will output the iframe as inline contents on the same domain as page contents 
		'EmbedPlayer.PageDomainIframe' : true
	} );
	
	/**
	 * The base source attribute checks also see:
	 * http://dev.w3.org/html5/spec/Overview.html#the-source-element
	 */
	mw.mergeConfig( 'EmbedPlayer.SourceAttributes', [
		// source id
		'id',

		// media url
		'src',

		// Title string for the source asset
		'title',
		
		// The html5 spec uses label instead of 'title' for naming sources
		'label',

		// boolean if we support temporal url requests on the source media
		'URLTimeEncoding',

		// Media has a startOffset ( used for plugins that
		// display ogg page time rather than presentation time
		'startOffset',

		// A hint to the duration of the media file so that duration
		// can be displayed in the player without loading the media file
		'durationHint',

		// Media start time
		'start',

		// Media end time
		'end',

		// If the source is the default source
		'default',
		
		// Title of the source
		'title',
		
		// titleKey ( used for api lookups TODO move into mediaWiki specific support
		'titleKey'
	] );
	
	

	
	// Add class file paths
	mw.addResourcePaths( {
		"mw.EmbedPlayer"	: "mw.EmbedPlayer.js",
		
		"mw.MediaElement" : "mw.MediaElement.js",
		"mw.MediaPlayer" : "mw.MediaPlayer.js",
		"mw.MediaPlayers" : "mw.MediaPlayers.js",
		"mw.MediaSource" : "mw.MediaSource.js",
		"mw.EmbedTypes"	: "mw.EmbedTypes.js",
		
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
		"mw.style.PlayerSkinMvpcf" 	: "skins/mvpcf/mw.style.PlayerSkinMvpcf.css",

		"mw.IFramePlayerApiServer" : "mw.IFramePlayerApiServer.js",
		"mw.IFramePlayerApiClient" : "mw.IFramePlayerApiClient.js"
	} );

	/**
	* Check the current DOM for any tags in "EmbedPlayer.RewriteSelector"
	*/
	mw.documentHasPlayerTags = function() {
		var rewriteSelect = mw.getConfig( 'EmbedPlayer.RewriteSelector' );
		if( rewriteSelect && $( rewriteSelect ).length != 0 ) {
			return true;
		}
		return false;
	};

	/**
	* Add a DOM ready check for player tags
	*
	* We use mw.addSetupHook instead of mw.ready so that
	* mwEmbed player is setup before any other mw.ready calls
	*/
	mw.addSetupHook( function( callback ) {
		mw.rewritePagePlayerTags( callback );
	});

	mw.rewritePagePlayerTags = function( callback ) {
		mw.log( 'Loader::EmbedPlayer:rewritePagePlayerTags:' + mw.documentHasPlayerTags() );
		
		// Allow modules to do tag rewrites as well: 
		var doModuleTagRewrites = function(){
			$( mw ).triggerQueueCallback( 'LoadeRewritePlayerTags', callback);
		};
		
		if( mw.documentHasPlayerTags() ) {
			var rewriteElementCount = 0;

			// Set each player to loading ( as early on as possible )
			$( mw.getConfig( 'EmbedPlayer.RewriteSelector' ) ).each( function( index, element ){

				// Assign an the element an ID ( if its missing one )
				if ( $( element ).attr( "id" ) == '' ) {
					$( element ).attr( "id", 'v' + ( rewriteElementCount++ ) );
				}
				// Add an absolute positioned loader
				$( element )
					.getAbsoluteOverlaySpinner()
					.attr('id', 'loadingSpinner_' + $( element ).attr('id') )
					.addClass( 'playerLoadingSpinner' );

			});
			// Load the embedPlayer module ( then run queued hooks )
			mw.load( 'EmbedPlayer', function ( ) {
				// Rewrite the EmbedPlayer.RewriteSelector with the
				$( mw.getConfig( 'EmbedPlayer.RewriteSelector' ) ).embedPlayer( doModuleTagRewrites );
			})
		} else {
			doModuleTagRewrites();
		}
	};
	
	/**
	* Add the module loader function:
	*/
	mw.addModuleLoader( 'EmbedPlayer', function() {
		var _this = this;
		// Hide videonojs class
		$( '.videonojs' ).hide();

		// Set up the embed video player class request: (include the skin js as well)
		var dependencyRequest = [
			[
				'$j.ui',
				'$j.widget',
				'$j.ui.mouse',
				'$j.fn.menu',
				'mw.style.jquerymenu',
				'$j.ui.slider',
				'mw.Uri'
			],
			[
				'mw.EmbedPlayer',
				'mw.MediaElement',
				'mw.MediaPlayer',
				'mw.MediaPlayers',
				'mw.MediaSource',
				'mw.EmbedTypes'
			],
			[
			 	'mw.PlayerControlBuilder',
				'$j.fn.hoverIntent',
				'mw.style.EmbedPlayer',
				'$j.cookie',
				// Add JSON lib if browsers does not define "JSON" natively
				'JSON'
			]			
		];

		// Pass every tag being rewritten through the update request function
		$( mw.getConfig( 'EmbedPlayer.RewriteSelector' ) ).each( function(inx, playerElement) {
			mw.embedPlayerUpdateLibraryRequest( playerElement, dependencyRequest[ 2 ] )
		} );

		// Add PNG fix code needed:
		if ( $.browser.msie && $.browser.version < 7 ) {
			dependencyRequest[0].push( '$.fn.pngFix' );
		}

		// Do short detection, to avoid extra player library request in ~most~ cases.
		//( If browser is firefox include native, if browser is IE include java )
		if( $.browser.msie ) {
			dependencyRequest[0].push( 'mw.EmbedPlayerJava' );
		}

		// Safari gets slower load since we have to detect ogg support
		if( !!document.createElement('video').canPlayType && !$.browser.safari ) {
			dependencyRequest[0].push( 'mw.EmbedPlayerNative' )
		}
		// Check if the iFrame player api is enabled and we have a parent iframe url: 
		if ( mw.getConfig('EmbedPlayer.EnableIframeApi') 
				&& 
			mw.getConfig( 'EmbedPlayer.IframeParentUrl' ) 
		){
			dependencyRequest[0].push('mw.EmbedPlayerNative');
			dependencyRequest[0].push('$.postMessage');
			dependencyRequest[0].push('mw.IFramePlayerApiServer');
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
		var skinName = $( playerElement ).attr( 'class' );
		// Set playerClassName to default if unset or not a valid skin
		if( ! skinName || $.inArray( skinName.toLowerCase(), mw.validSkins ) == -1 ){
			skinName = mw.getConfig( 'EmbedPlayer.SkinName' );
		}
		skinName = skinName.toLowerCase();
		// Add the skin to the request
		var skinCaseName = skinName.charAt(0).toUpperCase() + skinName.substr(1);
		// The skin js:
		if( $.inArray( 'mw.PlayerSkin' + skinCaseName, dependencyRequest ) == -1 ){
			dependencyRequest.push( 'mw.PlayerSkin' + skinCaseName );
		}
		// The skin css
		if( $.inArray( 'mw.style.PlayerSkin' + skinCaseName, dependencyRequest ) == -1 ){
			dependencyRequest.push( 'mw.style.PlayerSkin' + skinCaseName );
		}

		// Allow extension to extend the request.
		$( mw ).trigger( 'LoaderEmbedPlayerUpdateRequest',
				[ playerElement, dependencyRequest ] );
	};
	
	/**
	 * Utility loader function to grab configuration for passing into an iframe as a hash target
	 */
	mw.getIframeHash = function( playerId ){
		// Append the configuration and request domain to the iframe hash: 
		var iframeMwConfig =  mw.getNonDefaultConfigObject();
		// Add the parentUrl to the iframe config: 
		iframeMwConfig['EmbedPlayer.IframeParentUrl'] = document.URL;

		return '#' + encodeURIComponent(
			JSON.stringify({
				'mwConfig' :iframeMwConfig,
				'playerId' : playerId
			})
		);
	};
	
})( mediaWiki, jQuery );
