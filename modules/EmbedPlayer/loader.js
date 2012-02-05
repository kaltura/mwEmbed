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
		
		// If the flavor selector menu option should be displayed: 
		// This will be enabled by default in some future release of the library
		'EmbedPlayer.EnableFlavorSelector' : false,
		
		// If the iPad should use html controls 
		// With html controls you can't access native fullscreen 
		// With html controls you can support html themed controls, overlays, ads etc. )
		'EmbedPlayer.EnableIpadHTMLControls': true,
		
		// If the webkit-playsinline attribute should be added to the video tag. Will cause the player
		// to play inline on iPhone
		'EmbedPlayer.WebKitPlaysInline': false,
		
		// If webkitSupportsFullscreen is true, this option will make the fullscreen button 
		// use the native players fullscreen ( rather  than pop-up a new window with the in-browser
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
		
		// Default player controls size: 
		'EmbedPlayer.ControlsHeight': 31,
		
		// Default time display size: 
		'EmbedPlayer.TimeDisplayWidth': 55,

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

		// The skin list ( should correspond to a folder in skins )
		"EmbedPlayer.SkinList" : [ 'mvpcf', 'kskin' ],
		
		// Default player skin name
		"EmbedPlayer.DefaultSkin" : "mvpcf",

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
		'EmbedPlayer.PageDomainIframe' : true,
		
		// When there is no in-browser playback mechanism provide a download link for the play button
		'EmbedPlayer.NotPlayableDownloadLink' : false,
		
		// A black pixel for source switching 
		'EmbedPlayer.BlackPixel' : "data:image/png,%89PNG%0D%0A%1A%0A%00%00%00%0DIHDR%00%00%00%01%00%00%00%01%08%02%00%00%00%90wS%DE%00%00%00%01sRGB%00%AE%CE%1C%E9%00%00%00%09pHYs%00%00%0B%13%00%00%0B%13%01%00%9A%9C%18%00%00%00%07tIME%07%DB%0B%0A%17%041%80%9B%E7%F2%00%00%00%19tEXtComment%00Created%20with%20GIMPW%81%0E%17%00%00%00%0CIDAT%08%D7c%60%60%60%00%00%00%04%00%01'4'%0A%00%00%00%00IEND%AEB%60%82",
		
		// The default duration for playing an image:
		"EmbedPlayer.DefaultImageDuration" : 2 

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
		"mw.EmbedPlayer" : "mw.EmbedPlayer.js",
		"mw.processEmbedPlayers" : "mw.processEmbedPlayers.js",
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
		"mw.EmbedPlayerImageOverlay" : "mw.EmbedPlayerImageOverlay.js", 

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
				if ( $( element ).attr( "id" ) == '' || ! $( element ).attr( "id" ) ) {
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
	 * Merge in the default video attributes supported by embedPlayer:
	 */
	mw.mergeConfig('EmbedPlayer.Attributes', {
		/*
		 * Base html element attributes:
		 */
	
		// id: Auto-populated if unset
		"id" : null,
	
		// Width: alternate to "style" to set player width
		"width" : null,
	
		// Height: alternative to "style" to set player height
		"height" : null,
	
		/*
		 * Base html5 video element attributes / states also see:
		 * http://www.whatwg.org/specs/web-apps/current-work/multipage/video.html
		 */
	
		// Media src URI, can be relative or absolute URI
		"src" : null,
	
		// Poster attribute for displaying a place holder image before loading
		// or playing the video
		"poster" : null,
	
		// Autoplay if the media should start playing
		"autoplay" : false,
	
		// Loop attribute if the media should repeat on complete
		"loop" : false,
	
		// If the player controls should be displayed
		"controls" : true,
	
		// Video starts "paused"
		"paused" : true,
	
		// ReadyState an attribute informs clients of video loading state:
		// see: http://www.whatwg.org/specs/web-apps/current-work/#readystate
		"readyState" : 0,
	
		// Loading state of the video element
		"networkState" : 0,
	
		// Current playback position
		"currentTime" : 0,
	
		// Previous player set time
		// Lets javascript use $('#videoId')[0].currentTime = newTime;
		"previousTime" : 0,
	
		// Previous player set volume
		// Lets javascript use $('#videoId')[0].volume = newVolume;
		"previousVolume" : 1,
	
		// Initial player volume:
		"volume" : 0.75,
	
		// Caches the volume before a mute toggle
		"preMuteVolume" : 0.75,
	
		// Media duration: Value is populated via
		// custom data-durationhint attribute or via the media file once its played
		"duration" : null,
	
		// A hint to the duration of the media file so that duration
		// can be displayed in the player without loading the media file
		'data-durationhint': null,
		
		// Also support direct durationHint attribute ( backwards compatibly )
		// @deprecated please use data-durationhint instead. 
		'durationHint' : null,
		
		// Mute state
		"muted" : false,
	
		/**
		 * Custom attributes for embedPlayer player: (not part of the html5
		 * video spec)
		 */
	
		// Default video aspect ratio
		'videoAspect' : '4:3',
	
		// Start time of the clip
		"start" : 0,
	
		// End time of the clip
		"end" : null,
	
		// If the player controls should be overlaid
		// ( Global default via config EmbedPlayer.OverlayControls in module
		// loader.js)
		"overlaycontrols" : true,
	
		// Attribute to use 'native' controls
		"usenativecontrols" : false,
	
		// If the player should include an attribution button:
		'attributionbutton' : true,
		
		// A player error string
		// * Used to display an error instead of a play button 
		// * The full player api available
		'data-playerError': null,
		
		// A flag to hide the player gui and disable autoplay
		// * Used for empty players or a player where you want to dynamically set sources, then play.
		// * The player API remains active. 
		'data-blockPlayerDisplay': null,
	
		// If serving an ogg_chop segment use this to offset the presentation time
		// ( for some plugins that use ogg page time rather than presentation time )
		"startOffset" : 0,
	
		// If the download link should be shown
		"download_link" : true,
	
		// Content type of the media
		"type" : null
		
	} );
	
	
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
				'mw.Uri',
				'fullScreenApi'
			],
			[
				'mw.EmbedPlayer',
				'mw.processEmbedPlayers',
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
		// Check if the iFrame server is enabled: 
		if ( mw.getConfig('EmbedPlayer.IsIframeServer' ) 
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
		if( ! skinName || $.inArray( skinName.toLowerCase(), mw.validSkins ) === -1 ){
			skinName = mw.getConfig( 'EmbedPlayer.DefaultSkin' );
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
	
	$.embedPlayers = function(){
		$( mw.getConfig( 'EmbedPlayer.RewriteSelector' ) ).embedPlayer();	
	}
	/**
	 * Selector based embedPlayer jQuery binding
	 * 
	 * Rewrites all tags via a given selector
	 * @param {Function=}
	 *            callback Optional Function to be called once video interfaces
	 *            are ready
	 * 
	 */
	$.fn.embedPlayer = function( callback ) {
		mw.log( 'EmbedPlayer:: fn.embedPlayer' );
		if( this.selector ){
			var playerSelect = this.selector;
		} else {
			var playerSelect = this;
		}
		$( playerSelect ).each( function( index, playerElement) {
			// make sure the playerElement has an id:
			if( !$( playerElement ).attr('id') ){
				$( playerElement ).attr( "id", 'mwe_vid_' + ( index ) );
			}

			// If we are dynamically embedding on a "div" check if we can
			// add a poster image behind the loader:
			if( playerElement.nodeName.toLowerCase() == 'div'
					&&  
				$(playerElement).attr( 'poster' ) )
			{
				var posterSrc = $(playerElement).attr( 'poster' );
	
				// Set image size:
				var width = $( playerElement ).width();
				var height = $( playerElement ).height();
				if( !width ){
					var width = '100%';
				}
				if( !height ){
					var height = '100%';
				}
	
				mw.log('EmbedPlayer:: set loading background: ' + posterSrc);
				$( playerElement ).append(
					$( '<img />' )
					.attr( 'src', posterSrc)
					.css({
						'position' : 'absolute',
						'width' : width,
						'height' : height
					})
				);
			}
		});
	
		// Make sure we have user preference setup ( for setting preferences on
		// video selection )
		mw.load( 'EmbedPlayer', function(){
			mw.processEmbedPlayers( playerSelect, callback );
		});
	};
	// Setup global pointer to this jquery method, Function scope bug in Chrome 15x
	window.jQueryEmbedPlayer = $.fn.embedPlayer;
	
})( mediaWiki, jQuery );
