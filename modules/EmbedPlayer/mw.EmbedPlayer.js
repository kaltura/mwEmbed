/** 
* embedPlayer is the base class for html5 video tag javascript abstraction library
* embedPlayer include a few subclasses:
* 
*  mediaPlayer Media player embed system ie: java, vlc or native.
*  mediaElement Represents source media elements	
*  mw.PlayerControlBuilder Handles skinning of the player controls
*/

/**
 * Add the messages text: 
 */
 
mw.addMessages( {
	"mwe-embedplayer-loading_plugin" : "Loading plugin ...",
	"mwe-embedplayer-select_playback" : "Set playback preference",
	"mwe-embedplayer-link_back" : "Link back",
	"mwe-embedplayer-error_swap_vid" : "Error: mwEmbed was unable to swap the video tag for the mwEmbed interface",
	"mwe-embedplayer-add_to_end_of_sequence" : "Add to end of sequence",
	"mwe-embedplayer-missing_video_stream" : "The video file for this stream is missing",
	"mwe-embedplayer-play_clip" : "Play clip",
	"mwe-embedplayer-pause_clip" : "Pause clip",
	"mwe-embedplayer-volume_control" : "Volume control",
	"mwe-embedplayer-player_options" : "Player options",
	"mwe-embedplayer-timed_text" : "Timed text",
	"mwe-embedplayer-player_fullscreen" : "Fullscreen",
	"mwe-embedplayer-next_clip_msg" : "Play next clip",
	"mwe-embedplayer-prev_clip_msg" : "Play previous clip",
	"mwe-embedplayer-current_clip_msg" : "Continue playing this clip",
	"mwe-embedplayer-seek_to" : "Seek $1",
	"mwe-embedplayer-paused" : "paused",
	"mwe-embedplayer-download_segment" : "Download selection:",
	"mwe-embedplayer-download_full" : "Download full video file:",
	"mwe-embedplayer-download_right_click" : "To download, right click and select <i>Save link as...<\/i>",
	"mwe-embedplayer-download_clip" : "Download video",
	"mwe-embedplayer-download_text" : "Download text",
	"mwe-embedplayer-download" : "Download",
	"mwe-embedplayer-share" : "Share",
	"mwe-embedplayer-credits" : "Credits",
	"mwe-embedplayer-clip_linkback" : "Clip source page",
	"mwe-embedplayer-choose_player" : "Choose video player",
	"mwe-embedplayer-no-player" : "No player available for $1", 
	"mwe-embedplayer-share_this_video" : "Share this video",
	"mwe-embedplayer-video_credits" : "Video credits",
	"mwe-embedplayer-kaltura-platform-title" : "Kaltura open source video platform",
	"mwe-embedplayer-menu_btn" : "Menu",
	"mwe-embedplayer-close_btn" : "Close",
	"mwe-embedplayer-ogg-player-vlc-player" : "VLC player",
	"mwe-embedplayer-ogg-player-oggNative" : "HTML5 Ogg player",
	"mwe-embedplayer-ogg-player-h264Native" : "HTML5 H.264 player",
	"mwe-embedplayer-ogg-player-oggPlugin" : "Generic Ogg plugin",
	"mwe-embedplayer-ogg-player-quicktime-mozilla" : "QuickTime plugin",
	"mwe-embedplayer-ogg-player-quicktime-activex" : "QuickTime ActiveX",
	"mwe-embedplayer-ogg-player-cortado" : "Java Cortado",
	"mwe-embedplayer-ogg-player-flowplayer" : "Flowplayer",
	"mwe-embedplayer-ogg-player-kplayer" : "Kaltura player",
	"mwe-embedplayer-ogg-player-selected" : "(selected)",
	"mwe-embedplayer-generic_missing_plugin" : "You browser does not appear to support the following playback type: <b>$1<\/b><br \/>Visit the <a href=\"http:\/\/commons.wikimedia.org\/wiki\/Commons:Media_help\">Playback methods<\/a> page to download a player.<br \/>",
	"mwe-embedplayer-missing-source" : "No source video was found. Check that your embed code includes a valid source or API key",
	"mwe-embedplayer-for_best_experience" : "For a better video playback experience we recommend the <b><a href=\"http:\/\/www.mozilla.com\/en-US\/firefox\/upgrade.html?from=mwEmbed\">latest Firefox<\/a>.<\/b>",
	"mwe-embedplayer-do_not_warn_again" : "Dismiss for now.",
	"mwe-embedplayer-playerSelect" : "Players",
	"mwe-embedplayer-read_before_embed" : "<a href=\"http:\/\/mediawiki.org\/wiki\/Security_Notes_on_Remote_Embedding\" target=\"_new\">Read this<\/a> before embedding.",
	"mwe-embedplayer-embed_site_or_blog" : "Embed on a page",
	"mwe-embedplayer-related_videos" : "Related videos",
	"mwe-embedplayer-seeking" : "seeking",
	"mwe-embedplayer-buffering" : "buffering",
	"mwe-embedplayer-copy-code" : "Copy code",	
	"mwe-embedplayer-video-h264" : "H.264 video",
	"mwe-embedplayer-video-flv" : "Flash video",
	"mwe-embedplayer-video-ogg" : "Ogg video",
	"mwe-embedplayer-video-audio" : "Ogg audio"
} );

/*
* The default video attributes supported by embedPlayer
*/ 
mw.setConfig( 'embedPlayerAttributes', {
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
	* Base html5 video element attributes / states
	* also see:  http://www.whatwg.org/specs/web-apps/current-work/multipage/video.html
	*/

	// Media src URI, can be relative or absolute URI
	"src" : null,
	
	// Poster attribute for displaying a place holder image before loading or playing the video
	"poster": null, 
	
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
	"currentTime"  :0, 
	
	// Previous player set time
	// Lets javascript use $j('#videoId').get(0).currentTime = newTime;
	"previousTime" :0, 
	
	// Previous player set volume
	// Lets javascript use $j('#videoId').get(0).volume = newVolume;
	"previousVolume" : 1, 
	
	// Initial player volume: 
	"volume" : 0.75,
	
	// Caches the volume before a mute toggle
	"preMuteVolume" : 0.75, 
	
	// Media duration: Value is populated via 
	//  custom durationHint attribute or via the media file once its played
	"duration"  :null,   
	
	// Mute state
	"muted" : false,
	
	/**
	* Custom attributes for embedPlayer player:
	* (not part of the html5 video spec)  
	*/
	
	// Default video aspect ratio
	'videoAspect': '4:3',
	
	// Start time of the clip
	"start" : 0,
	
	// End time of the clip
	"end" : null,	
	
	// A apiTitleKey for looking up subtitles, credits and related videos
	"apiTitleKey" : null,
	
	// The apiProvider where to lookup the title key
	"apiProvider" : null,
	
	// If the player controls should be overlaid 
	//( Global default via config EmbedPlayer.OverlayControls in module loader.js)  
	"EmbedPlayer.OverlayControls" : true,
	
	// ROE url ( for xml based metadata )
	// also see: http://wiki.xiph.org/ROE
	"roe" : null,

	// If serving an ogg_chop segment use this to offset the presentation time
	// ( for some plugins that use ogg page time rather than presentation time ) 
	"startOffset" : 0, 
	
	// Thumbnail (same as poster) 
	"thumbnail" : null,
	
	// Source page for media asset ( used for linkbacks in remote embedding )  
	"linkback" : null,
	
	// If the download link should be shown
	"download_link" : true,
	
	// Content type of the media
	"type" : null
});

/**
 * The base source attribute checks
 * also see: http://dev.w3.org/html5/spec/Overview.html#the-source-element
 */
mw.setConfig( 'embedPlayerSourceAttributes', [
	// source id
	'id',
	
	// media url
	'src',
	
	// media codecs attribute ( if provided )	
	'codecs',
	
	// Title string for the source asset 
	'title',
	
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
	
	// Language key used for subtitle tracks
	'srclang',
	
	// titleKey ( used for api lookups )  
	'titleKey',
	
	// The provider type ( for what type of api query to make )
	'provider_type',
													
	// The api url for the provider
	'provider_url'  
] );

/**
* Adds jQuery binding for embedPlayer  
*/
( function( $ ) {
	 
	/*
	* embeds all players that match the rewrite player tags config
	* Passes off request to the embedPlayer selector: 
	* 
	* @param {Object} attributes Attributes to apply to embed players
	* @param {Function} callback Function to call once embedding is done
	*/
	$.embedPlayers = function( attributes, callback) {
		$j( mw.getConfig( 'EmbedPlayer.RewriteTags' ) ).embedPlayer( attributes, callback );
	};
	
	/**		
	* Selector based embedPlayer jQuery binding
	*
	* Rewrites all tags via a given selector
	* 
	* @param {Object} attributes [ Optional ] The embedPlayer options for the given video interface.
	*	Attributes Object can inclued any key value pair that would otherwise be
	*	an attribute in the html element. 
	*	
	*	also see: mw.getConfig( 'embedPlayerAttributes' )
	*
	* @param {Function} callback [ Optional ] Function to be called once video interfaces are ready
	*
	*/
	$.fn.embedPlayer = function( attributes, callback ) {
		var playerSelect = this.selector;	
		// Handle optional include of attributes argument:
		if( typeof attributes == 'function' ){
			callback = attributes;		
		}
		
		// If we have not detected browser plugin embed types do that now 
		if( ! mw.EmbedTypes.players ){
			mw.EmbedTypes.init();
		}		
		
		// Create the Global Embed Player Manager ( if not already created )
		if( ! mw.playerManager ) {
			mw.log( "Create the player manager:" );
			mw.playerManager = new EmbedPlayerManager();
			// Run the global hooks that mw.playerManager is ready
			mw.log( 'trigger: EmbedPlayerManagerReady');
			$j( mw ).trigger( 'EmbedPlayerManagerReady' );
		}			
		
		// Add the embedPlayer ready callback 
		if( typeof callback == 'function' ){  
			mw.playerManager.addCallback( callback );
		}		 
		// Make sure we have user preference setup ( for setting preferences on video selection ) 				
		mw.setupUserConfig( function() {			
			// Add each selected element to the player manager:		
			$j( playerSelect ).each( function( index, playerElement) {				
				// make sure the video tag was not generated by our own native player: 
				if( $j( playerElement ).hasClass( 'nativeEmbedPlayerPid' ) ){
					mw.log( '$j.embedPlayer skip native player: ' + playerElement );
				} else {
					mw.playerManager.addElement( playerElement, attributes);
				}			
			} );		
		})
	};

} )( jQuery );

/**
* EmbedPlayerManager
*
* Manages calls to embed video interfaces  
*/
var EmbedPlayerManager = function( ) {
	// Create a Player Manage
	return this.init( );
};
EmbedPlayerManager.prototype = {
	
	// Functions to run after the video interface is ready
	callbackFunctions : null,
	
	/**
	* Constructor initializes callbackFunctions and playerList  
	*/
	init: function( ) {	
		this.callbackFunctions = [];
		this.playerList = [];
	},
	
	/**
	* Adds a callback to the callbackFunctions list
	*  the callback functions are called once the players are ready.
	*
	* @param {Function} callback Function to be called once players are ready 
	*/
	addCallback: function( callback ) {
		this.callbackFunctions.push( callback );
	},
	
	/**
	* Get the list of players
	*/
	getPlayerList: function( ) {
		return this.playerList;	
	},
	
	/**
	* Adds an Element for the embedPlayer to rewrite
	*
	*  uses embedPlayer interface on audio / video elements
	*  uses mvPlayList interface on playlist elements
	*
	* Once a player interface is established the following chain of functions are called;
	* 
	*	_this.checkPlayerSources()
	*	_this.checkForTimedText()
	*	_this.setupSourcePlayer()
	*	_this.inheritEmbedPlayer()
	*	_this.selectedPlayer.load()
	*	_this.showPlayer()
	* 
	* @param {Element} playerElement DOM element to be swapped 
	* @param {Object} [Optional] attributes Extra attributes to apply to the player interface 
	*/
	addElement: function( playerElement,  attributes ) {	
		var _this = this;
			
		if ( !playerElement.id || playerElement.id == '' ) {
			// give the playerElement an id: 
			playerElement.id = 'vid' + ( this.playerList.length + 1 ); 
		}					
		mw.log('EmbedPlayerManager: addElement:: ' + playerElement.id );
				
		// Add the element id to playerList
		this.playerList.push( playerElement.id );		
		
		// Check for player attributes such as skins or plugins attributes 
		// that add to the request set	
		var playerDependencyRequest = [ ];
		
		// Update the list of dependent libraries for the player 
		// ( allows extensions to add to the dependency list )
		mw.embedPlayerUpdateLibraryRequest( playerElement, playerDependencyRequest );
		
		// Load any skins we need then swap in the interface
		mw.load( playerDependencyRequest, function() {								
			var waitForMeta = true;					
			
			// Be sure to "stop" the target ( sometimes firefox keeps playing the video even 
			// though its been removed from the DOM )					
			if( playerElement.pause ){
				playerElement.pause();
			}
						
			
			// Let extensions determine if its worthwhile to wait for metadata:
			// We pass an object to the trigger to preserve reference values		
			var eventObject = { 
				'playerElement':playerElement, 
				'waitForMeta' : waitForMeta
			}
			
			$j( mw ).trigger( 'addElementWaitForMetaEvent', eventObject );
			// update the waitForMeta 
			waitForMeta = eventObject[ 'waitForMeta' ];
			
			
			// Set the wait for meta flag if unset by extension
			if( waitForMeta ){
				waitForMeta = _this.waitForMetaCheck( playerElement );
			}
	
			var ranPlayerSwapFlag = false;					
							
			// Local callback to runPlayer swap once playerElement has metadata
			function runPlayerSwap() {			
				if( ranPlayerSwapFlag ){
					return ;	
				}
				mw.log("runPlayerSwap::" + $j( playerElement ).attr('id') );
				ranPlayerSwapFlag = true;	
				var playerInterface = new mw.EmbedPlayer( playerElement , attributes);
				
				_this.swapEmbedPlayerElement( playerElement, playerInterface );								
										
				
				// Pass the id to any hook that needs to interface prior to checkPlayerSources
				mw.log("addElement :: trigger :: newEmbedPlayerEvent");
				$j( mw ).trigger ( 'newEmbedPlayerEvent',  playerInterface.id );
				
				// Issue the checkPlayerSources call to the new player interface:
				// make sure to use the element that is in the DOM:						
				$j( '#' + playerInterface.id ).get(0).checkPlayerSources();	
			}
							
			if( waitForMeta ) {						
				mw.log('DO WaitForMeta ( video missing height (' + $j( playerElement ).attr('height') + '), width (' + $j( playerElement ).attr('width') + ') or duration' );
				playerElement.removeEventListener( "loadedmetadata", runPlayerSwap, true );
				playerElement.addEventListener( "loadedmetadata", runPlayerSwap, true );
			
				// Time-out of 5 seconds ( maybe still playable but no timely metadata ) 
				setTimeout( runPlayerSwap, 5000 );
				return ;
			} else { 
				runPlayerSwap();
				return ;
			}		   
	   });
	},
	
	/** 
	* Check for bogus resolutions of the media asset that has not loaded. 
	* @return 
	*	true if the resolution is "likely" to be updated 
	* 		by waiting for metadata
	* 	false if the resolution has been set via an attribute or is already loaded
	*/			 
	waitForMetaCheck: function( playerElement ){
		var waitForMeta = false;		
		
		// If we don't have a native player don't wait for metadata
		if( !mw.EmbedTypes.players.isSupportedPlayer( 'oggNative') &&
			!mw.EmbedTypes.players.isSupportedPlayer( 'h264Native' ) )
		{
			return false;
		}		
		
		
		var width = $j( playerElement ).css( 'width' );
		var height = $j( playerElement ).css( 'height' );
	
		// Css video defaults 
		if( $j( playerElement ).css( 'width' ) == '300px' && 
			$j( playerElement ).css( 'height' ) == '150px'
		){
			waitForMeta = true;
		} else {			
			// Check if we should wait for duration: 
			if( $j( playerElement ).attr( 'duration') || 
				$j( playerElement ).attr('durationHint')
			){
				// height, width and duration set; do not wait for meta data:
				return false;
			} else {				
				waitForMeta = true;
			}
		}
		
		//Firefox ~ sometimes ~ gives -1 for unloaded media
		if ( $j(playerElement).attr( 'width' ) == -1 || $j(playerElement).attr( 'height' ) == -1 ) {
			waitForMeta = true; 
		}
		
		// Google Chrome / safari gives 0 width height for unloaded media
		if( $j(playerElement).attr( 'width' ) === 0 || 
			$j(playerElement).attr( 'height' ) === 0 
		) {
			waitForMeta = true;
		}
		
		// Firefox default width height is ~sometimes~ 150 / 300
		if( this.height == 150 && this.width == 300 ){
			waitForMeta = true; 
		}						
		
		// Make sure we have a src attribute or source child 
		// ( i.e not a video tag to be dynamically populated or looked up from xml resource description )
		if( waitForMeta && 
			(
				$j( playerElement ).attr('src') ||
				$j( playerElement ).find("source[src]").length !== 0		 				
			)
		) {
			// Detect src type ( if no type set ) 
			return true;
		} else {		
			// playerElement is not likely to update its meta data ( no src )
			return false;
		} 
	},
	
	/**
	* swapEmbedPlayerElement
	*
	* Takes a video element as input and swaps it out with
	* an embed player interface
	*
	* @param {Element} targetElement Element to be swapped 
	* @param {Object}  playerInterface Interface to swap into the target element
	*/
	swapEmbedPlayerElement: function( targetElement, playerInterface ) {	
		mw.log( 'swapEmbedPlayerElement: ' + targetElement.id );
		// Create a new element to swap the player interface into
		var swapPlayerElement = document.createElement('div');				
				
		// get properties / methods from playerInterface
		for ( var method in playerInterface ) {			
			if ( method != 'readyState' ) { // readyState crashes IE ( don't include ) 			
				swapPlayerElement[ method ] = playerInterface[ method ];
			}
		}
		
		// Check if we are using native controls ( should keep the video embed around )
		// "wrap" the player interface
		if( playerInterface.useNativeControls() ) {
			$j( targetElement )
			.attr('id', playerInterface.pid )
			.after( 
				$j( swapPlayerElement ).css('display', 'none')
			)
		} else {
			$j( targetElement ).replaceWith( swapPlayerElement );
		}
		
		
		// Set swapPlayerElement has height / width set and set to loading:		
		$j( swapPlayerElement ).css( {			
			'width' : playerInterface.width + 'px',
			'height' : playerInterface.height + 'px'
		} );
		
		// If we don't already have a loadSpiner add one: 
		if( $j('#loadingSpinner_' + playerInterface.id ).length == 0 ){
			if( playerInterface.useNativeControls() ) {
				$j( targetElement )
					.getAbsoluteOverlaySpinner()
					.attr('id', 'loadingSpinner_' + playerInterface.id ) 
			}else{
				$j( swapPlayerElement ).append( 
					$j('<div />')
					.loadingSpinner()	
				);
			}
		}
		return true;
	},
	
	
	/**
	* Player ready will run the global callbacks 
	* once players are "ready"
	* 
	* This enables mw.ready event to expose video tag 
	* elements as if the videotag was supported natively. 
	*
	* @param {Object} player The EmbedPlayer object
	*/
	playerReady: function( player ) {
		var _this = this;
		mw.log( 'ReadyToPlay callback player:' +  player.id );
		player.readyToPlay = true;
		
		// Remove the player loader spinner:
		$j('#loadingSpinner_' + player.id ).remove();
		
		// Run the player ready trigger		
		$j( player ).trigger( 'playerReady' );
		
		var is_ready = true; 
		for ( var i = 0; i < this.playerList.length; i++ ) {
			var currentPlayer =  $j( '#' + this.playerList[i] ).get( 0 );
			if ( player ) {
				// Check if the current video is ready ( or has an error out ) 
				is_ready = ( player.readyToPlay || player.loadError ) ? is_ready : false;				
			}
		}
		if ( is_ready ) {
			// Be sure to remove any player loader spinners
			$j('.playerLoadingSpinner').remove();
			
			mw.log( "All on-page players ready run playerMannager callbacks" );
			// Run queued functions 
			if( _this.callbackFunctions ) {
				while ( _this.callbackFunctions.length ) {
					_this.callbackFunctions.shift()();
				}
			}
		}
	}
}

/**
  * mediaSource class represents a source for a media element.
  * @param {Element} element: MIME type of the source.
  * @constructor
  */
function mediaSource( element ) {
	this.init( element );
}

mediaSource.prototype = {
	// MIME type of the source.
	mimeType:null,
	
	// URI of the source.
	uri:null,
	
	// Title of the source.
	title: null,
	
	// True if the source has been marked as the default.
	markedDefault: false,
	
	// True if the source supports url specification of offset and duration 
	URLTimeEncoding:false,
	
	// Start offset of the requested segment 
	startOffset: 0,
	
	// Duration of the requested segment (0 if not known) 
	duration:0,
	
	// Is the source playable
	is_playable: null,
	
	// source id
	id: null,
	
	// Start time in npt format
	start_npt: null,
	
	// End time in npt format
	end_npt: null,
	
	// A provider "id" to identify api request type 
	provider_type : null,

	// The api url for the provider
	provider_url : null,  	
	
	/**
	* MediaSource constructor:
	*/
	init : function( element ) {		
		// mw.log('adding mediaSource: ' + element);
		this.src = $j( element ).attr( 'src' );		
		
		// Set default URLTimeEncoding if we have a time  url:
		// not ideal way to discover if content is on an oggz_chop server. 
		// should check some other way. 
		var pUrl = mw.parseUri ( this.src );
		if ( typeof pUrl[ 'queryKey' ][ 't' ] != 'undefined' ) {
			this.URLTimeEncoding = true;
		}
		
		var sourceAttr = mw.getConfig( 'embedPlayerSourceAttributes' );
		
		for ( var i = 0; i < sourceAttr.length; i++ ) { // array loop:
			var attr = sourceAttr[ i ];
			var attr_value = element.getAttribute( attr );
			if ( attr_value ) {
				this[ attr ] =  attr_value;
			}
		}
		
		
		// Set the content type: 
		if ( $j( element ).attr( 'type' ) ) {
			this.mimeType = $j( element ).attr( 'type' );
		}else if ( $j( element ).attr( 'content-type' ) ) {
			this.mimeType = $j( element ).attr( 'content-type' );
		}else if( $j( element ).get(0).tagName.toLowerCase() == 'audio' ){
			// If the element is an "audio" tag set audio format
			this.mimeType = 'audio/ogg';
		} else {
			this.mimeType = this.detectType( this.src );
		}
		
		// Conform the mime type to ogg
		if( this.mimeType == 'video/theora') {
			this.mimeType = 'video/ogg';
		}
		
		if( this.mimeType == 'audio/vorbis') {
			this.mimeType = 'audio/ogg';
		}
			
		// Check for parent elements ( supplies categories in "track" )
		if( $j( element ).parent().attr('category') ) {			
			this.category =  $j( element ).parent().attr('category');			
		}
		
		if( $j( element ).attr( 'default' ) ){
			this.markedDefault = true;
		}
						
		// Get the url duration ( if applicable )
		this.getURLDuration();
	},
	
	/**
	* Update Source title via Element
	* @param {Element} element Source element to update attributes from
	*/
	updateSource: function( element ) {
		// for now just update the title: 
		if ( $j( element ).attr( "title" ) ) {
			this.title = $j( element ).attr( "title" );
		}
	},
	
	/** 
	 * Updates the src time and start & end
	 * @param {String} start_time: in NPT format
	 * @param {String} end_time: in NPT format
	 */
	updateSrcTime: function ( start_npt, end_npt ) {
		// mw.log("f:updateSrcTime: "+ start_npt+'/'+ end_npt + ' from org: ' + this.start_npt+ '/'+this.end_npt);
		// mw.log("pre uri:" + this.src);
		// if we have time we can use:
		if ( this.URLTimeEncoding ) {
			// make sure its a valid start time / end time (else set default) 
			if ( !mw.npt2seconds( start_npt ) ) {
				start_npt = this.start_npt;
			}
			
			if ( !mw.npt2seconds( end_npt ) ) {
				end_npt = this.end_npt;
			}
										  
			this.src = mw.replaceUrlParams( this.src, { 
				't': start_npt + '/' + end_npt 
			});
			
			// update the duration
			this.getURLDuration();
		}
	},
	
	/**
	* Sets the duration and sets the end time if unset 
	* @param {Float} duration: in seconds
	*/
	setDuration: function ( duration ) {
		this.duration = duration;
		if ( !this.end_npt ) {
			this.end_npt = mw.seconds2npt( this.startOffset + duration );
		}
	},
	
	/** 
	* MIME type accessors function.
	* @return {String} the MIME type of the source.
	*/
	getMIMEType: function() {
		if( this.mimeType ) {
			return this.mimeType;
		}
		this.mimeType = this.detectType( this.src );
		return this.mimeType;
	},
	
	/** URI function.
	* @param {Number} seek_time_sec  Int: Used to adjust the URI for url based seeks) 
	* @return {String} the URI of the source.
	*/
	getSrc : function( seek_time_sec ) {
		if ( !seek_time_sec || !this.URLTimeEncoding ) {
			return this.src;
		}
		var endvar = '';
		if ( this.end_npt ) {
			endvar = '/' + this.end_npt;
		}
		return mw.replaceUrlParams( this.src,
			{
	   			't': mw.seconds2npt( seek_time_sec ) + endvar
	   		}
	   	);
	},
	
	/** 
	* Title accessor function.
	*	@return {String} Title of the source.
	*/
	getTitle : function() {		
		if( this.title ){
			return this.title;
		}
		
		// Return a Title based on mime type: 
		switch( this.getMIMEType() ) {
			case 'video/h264' :
				return gM( 'mwe-embedplayer-video-h264' );
			break;
			case 'video/x-flv' :
				return gM( 'mwe-embedplayer-video-flv' );
			break;
			case 'video/ogg' :
				return gM( 'mwe-embedplayer-video-ogg' );
			break;
			case 'audio/ogg' :
				return gM( 'mwe-embedplayer-video-audio' );
			break;
		}
		
		// Return tilte based on file name:
		var urlParts = mw.parseUri( this.getSrc() );
		if( urlParts.file ){
			return urlParts.file;
		}
		
		// Return the mime type string if not known type.
		return this.mimeType;
	},
	
	/** Index accessor function.
	*	@return {Integer} the source's index within the enclosing mediaElement container.
	*/
	getIndex : function() {
		return this.index;
	},
	
	/** 
	 * 
	 * Get Duration of the media in milliseconds from the source url.
	 *
	 * Supports media_url?t=ntp_start/ntp_end url request format
	 */
	getURLDuration : function() {
		// check if we have a URLTimeEncoding: 
		if ( this.URLTimeEncoding ) {
			var annoURL = mw.parseUri( this.src );
			if ( annoURL.queryKey.t ) {
				var times = annoURL.queryKey.t.split( '/' );
				this.start_npt = times[0];
				this.end_npt = times[1];
				this.startOffset = mw.npt2seconds( this.start_npt );
				this.duration = mw.npt2seconds( this.end_npt ) - this.startOffset;
			} else {
				// look for this info as attributes
				if ( this.startOffset ) {					
					this.start_npt = mw.seconds2npt( this.startOffset );
				}
				if ( this.duration ) {
					this.end_npt = mw.seconds2npt( parseInt( this.duration ) + parseInt( this.startOffset ) );
				}
			}
		}
	},
	
	/** 
	* Attempts to detect the type of a media file based on the URI.
	*	@param {String} uri URI of the media file.
	*	@return {String} The guessed MIME type of the file.
	*/
	detectType: function( uri ) {
		// NOTE: if media is on the same server as the javascript
		// we can issue a HEAD request and read the mime type of the media...
		// ( this will detect media mime type independently of the url name)
		// http://www.jibbering.com/2002/4/httprequest.html
		var end_inx =  ( uri.indexOf( '?' ) != -1 ) ? uri.indexOf( '?' ) : uri.length;
		var no_param_uri = uri.substr( 0, end_inx );
		switch( no_param_uri.substr( no_param_uri.lastIndexOf( '.' ), 4 ).toLowerCase() ) {
			case 'smil':
			case '.sml':
				return 'application/smil'
			break;
			case '.m4v':
			case '.mp4':
				return 'video/h264';
			break;
			case 'webm':
				return 'video/webm';
			break;
			case '.srt':
				return 'text/x-srt';
			break;
			case '.flv':
				return 'video/x-flv';
			break;
			case '.ogg':
			case '.ogv':
				return 'video/ogg';
			break;
			case '.oga':
				return 'audio/ogg';
			break;
			case '.anx':
				return 'video/ogg';
			break;
			case '.xml':
				return 'text/xml';
			break;
		}
	}
};

/** 
* A media element corresponding to a <video> element.
*
* It is implemented as a collection of mediaSource objects.  The media sources
*	will be initialized from the <video> element, its child <source> elements,
*	and/or the ROE file referenced by the <video> element.
*	@param {element} videoElement <video> element used for initialization.
*	@constructor
*/
function mediaElement( element ) {
	this.init( element );
}

mediaElement.prototype = {
	
	// The array of mediaSource elements.
	sources: null,
	
	// flag for ROE data being added.
	addedROEData: false,
	
	// Selected mediaSource element. 
	selectedSource: null,
	
	// Media element thumbnail
	thumbnail: null,
	
	// Media element linkback 
	linkback: null,

	/**
	* Media Element constructor
	*
	* Sets up a  mediaElement from a provided top level "video" element
	*  adds any child sources that are found
	*
	* @param {Element} videoElement Element that has src attribute or has children source elements 
	*/
	init: function( videoElement ) {
		var _this = this;		
		mw.log( "mediaElement::init:" + videoElement.id  );
		this.sources = new Array();			
										
		// Process the videoElement as a source element:
		if ( $j( videoElement ).attr( "src" ) ) {
			_this.tryAddSource( videoElement );
		}
		// Process elements source children
		$j( videoElement ).find( 'source,track' ).each( function( ) {			
			_this.tryAddSource( this );
		} );			
	},
	
	/** 
	* Updates the time request for all sources that have 
	* a standard time request argument (ie &t=start_time/end_time)
	*
	* @param {String} start_npt Start time in npt format
	* @param {String} end_npt End time in npt format
	*/
	updateSourceTimes: function( start_npt, end_npt ) {
		var _this = this;
		$j.each( this.sources, function( inx, mediaSource ) {
			mediaSource.updateSrcTime( start_npt, end_npt );
		} );
	},
	
	/**
	* Check for Timed Text tracks
	* @return {Boolean} True if text tracks exist, false if no text tracks are found
	*/
	textSourceExists: function() {
		for ( var i = 0; i < this.sources.length; i++ ) {
			mw.log( this.sources[i].mimeType );
			if ( this.sources[i].mimeType == 'text/cmml' || 
				 this.sources[i].mimeType == 'text/x-srt' ) 
			{
					return true;
			}
		};
		return false;
	},
	
	/** 
	* Returns the array of mediaSources of this element.
	* 
	* @param {String} [mimeFilter] Filter criteria for set of mediaSources to return
	* @return {Array} mediaSource elements.
	*/
	getSources: function( mimeFilter ) {
		if ( !mimeFilter ) {
			return this.sources;
		}
		// Apply mime filter: 
		var source_set = new Array();
		for ( var i = 0; i < this.sources.length ; i++ ) {
			if ( this.sources[i].mimeType &&
				 this.sources[i].mimeType.indexOf( mimeFilter ) != -1 ) 
			{
				source_set.push( this.sources[i] );
			}
		}
		return source_set;
	},
	
	/**
	* Selects a source by id
	* @param {String} source_id Id of the source to select. 
	* @return {MediaSource} The selected mediaSource or null if not found  
	*/
	getSourceById:function( source_id ) {
		for ( var i = 0; i < this.sources.length ; i++ ) {
			if ( this.sources[i].id ==  source_id ) {
				return this.sources[i];
			}
		}
		return null;
	},
	
	/** 
	* Selects a particular source for playback updating the "selectedSource" 
	*
	* @param {Number} index Index of source element to set as selectedSource
	*/
	selectSource:function( index ) {
		mw.log( 'f:selectSource:' + index );
		var playableSources = this.getPlayableSources();
		for ( var i = 0; i < playableSources.length; i++ ) {
			if ( i == index ) {
				this.selectedSource = playableSources[i];
				// Update the user selected format: 
				mw.EmbedTypes.players.setFormatPreference( playableSources[i].mimeType );
				break;
			}
		}
	},
	
	/** 
	* Selects the default source via cookie preference, default marked, or by id order
	*/
	autoSelectSource: function() {
		mw.log( 'f:autoSelectSource:' );
		// Select the default source
		var playableSources = this.getPlayableSources();
		var flash_flag = ogg_flag = false;
				
		// Set via user-preference
		for ( var source = 0; source < playableSources.length; source++ ) {
			var mimeType = playableSources[source].mimeType;					
			if ( mw.EmbedTypes.players.preference[ 'format_preference' ] == mimeType ) {
				 mw.log( 'set via preference: ' + playableSources[source].mimeType );
				 this.selectedSource = playableSources[source];
				 return true;
			}
		}
		
		// Set via marked default: 
		for ( var source = 0; source < playableSources.length; source++ ) {
			if ( playableSources[ source ].markedDefault ) {
				mw.log( 'set via marked default: ' + playableSources[source].markedDefault );
				this.selectedSource = playableSources[source];
				return true;
			}
		}
		
		// Set native client for flash
		for ( var source = 0; source < playableSources.length; source++ ) {
			var mimeType = playableSources[source].mimeType;
			var player =  mw.EmbedTypes.players.defaultPlayer( mimeType );
			mw.log( 'f:autoSelectSource:' +  mimeType );
			if ( this.isOgg( mimeType )	&& player && player.library == 'Native'	) {
				this.selectedSource = playableSources[ source ];
				return true;
			}			
		}
		
		// Set h264 via native or flash fallback
		for ( var source = 0; source < playableSources.length; source++ ) {
			var mimeType = playableSources[source].mimeType;
			var player =  mw.EmbedTypes.players.defaultPlayer( mimeType );	
			if ( mimeType == 'video/h264' 
				&& player 
				&& ( 
					player.library == 'Native' 
					||
					player.library == 'Kplayer'
				)
			) {				
				this.selectedSource = playableSources[ source ];
				return true;
			}
		};
		
		// Else just select first source		
		if ( !this.selectedSource ) {
			mw.log( 'set via first source:' + playableSources[0] );
			this.selectedSource = playableSources[0];
			return true;
		}
		// No Source found so no source selected
		return false;
	},
	
	/**
	* check if the mime is ogg 
	*/ 
	isOgg: function( mimeType ){
		if ( mimeType == 'video/ogg' 
			|| mimeType == 'ogg/video' 
			|| mimeType == 'video/annodex' 
			|| mimeType == 'application/ogg'
		) {
			return true;
		}
		return false;
	},
	
	/** 
	* Returns the thumbnail URL for the media element.
	* @returns {String} thumbnail URL
	*/
	getPosterSrc: function( ) {
		return this.poster;
	},
	
	/** 
	* Checks whether there is a stream of a specified MIME type.
	* @param {String} mimeType MIME type to check.
	* @return {Boolean} true if sources include MIME false if not.
	*/
	hasStreamOfMIMEType: function( mimeType )
	{
		for ( source in this.sources )
		{
			if ( this.sources[source].getMIMEType() == mimeType ){
				return true;
			}
		}
		return false;
	},
	
	/**
	* Checks if media is a playable type
	*/
	isPlayableType: function( mimeType ) {	
		if ( mw.EmbedTypes.players.defaultPlayer( mimeType ) ) {
			return true;
		} else {
			return false;
		}
	},
	
	/** 
	* Adds a single mediaSource using the provided element if
	*	the element has a 'src' attribute.		
	*	@param {Element} element <video>, <source> or <mediaSource> <text> element.
	*/
	tryAddSource: function( element ) {
		//mw.log( 'f:tryAddSource:' + $j( element ).attr( "src" ) );
		var newSrc = $j( element ).attr( 'src' );
		if ( newSrc ) {			
			// make sure an existing element with the same src does not already exist:		 
			for ( var i = 0; i < this.sources.length; i++ ) {
				if ( this.sources[i].src == newSrc ) {
					// Source already exists  update any new attr:  
					this.sources[i].updateSource( element );
					return this.sources[i];
				}
			}
		}
		// Create a new source
		var source = new mediaSource( element );
		
		this.sources.push( source );	
		//mw.log( 'tryAddSource: added source ::' + source + 'sl:' + this.sources.length );	
		return source;
	},
	
	/**
	* Get playable sources
	*
	* @returns {Array} of playable sources
	*/
	getPlayableSources: function() {
		 var playableSources = [];		 
		 for ( var i = 0; i < this.sources.length; i++ ) {
			 if ( this.isPlayableType( this.sources[i].mimeType ) ) {
				 playableSources.push( this.sources[i] );
			 } else {
				 //mw.log( "type " + this.sources[i].mimeType + 'is not playable' );
			 }
		 };
		 return playableSources;
	},
	
	/**
	* Imports media sources from ROE data.
	*   @param roe_data ROE data.
	*/
	addROE: function( roe_data ) {
		mw.log( 'f:addROE' );
		this.addedROEData = true;
		var _this = this;		
		if ( roe_data ) {
			var $roeParsed = $j( roe_data.pay_load );	
					
			// Add media sources:
			$roeParsed.find("mediaSource").each( function( inx, source ) {				
				_this.tryAddSource( source );
			} );
			
			// Set the thumbnail:
			$roeParsed.find( 'img' ).each( function( inx, n ) {
				if ( $j( n ).attr( "id" ) == "stream_thumb" ) {
					mw.log( 'roe:set thumb to ' + $j( n ).attr( "src" ) );
					_this.poster = $j( n ).attr( "src" );
				}
			} );
			
			// Set the linkback:
			$roeParsed.find( 'link' ).each( function( inx, n ) {
				if ( $j( n ).attr( 'id' ) == 'html_linkback' ) {
					mw.log( 'roe:set linkback to ' + $j( n ).attr( "href" ) );
					_this.linkback = $j( n ).attr( 'href' );
				}
			} );
		} else {
			mw.log( 'ROE data empty.' );
		}
	}
};


/** 
* Base embedPlayer object
* @param {Element} element, the element used for initialization.
* @param {Object} customAttributes Attributes for the video interface 
*					that are not already element attributes
* @constructor
*/
mw.EmbedPlayer = function( element, customAttributes ) {
	return this.init( element, customAttributes );
};

mw.EmbedPlayer.prototype = {
	
	// The mediaElement object containing all mediaSource objects
	'mediaElement' : null,
	
	// Object that describes the supported feature set of the underling plugin / player
	'supports': { },
	
	// Preview mode flag,
	// some plugins don't seek accurately but in preview mode we need 
	// accurate seeks so we do tricks like hide the image until its ready
	'preview_mode' : false,
	
	// Ready to play 
	// NOTE: we should switch over to setting the html5 video ready state
	'readyToPlay' : false, 
	
	// Stores the loading errors
	'loadError' : false, 
	
	// Thumbnail updating flag ( to avoid rewriting an thumbnail thats already being updated)
	'thumbnail_updating' : false,
	
	// Thumbnail display flag
	'thumbnail_disp' : true,
				
	// Local variable to hold CMML meeta data about the current clip
	// for more on CMML see: http://wiki.xiph.org/CMML 
	'cmmlData': null,
	
	// Stores the seek time request, Updated by the doSeek function
	'seek_time_sec' : 0,
		
	// If the embedPlayer is current 'seeking'  	
	'seeking' : false,
	
	// Percent of the clip buffered:	
	'bufferedPercent' : 0,	
	
	// Holds the timer interval function
	'monitorTimerId' : null,
	
	// Buffer flags
	'bufferStartFlag' : false,
	'bufferEndFlag' : false,
	
	// On done playing
	'donePlayingCount' : 0,
	
	/**
	* embedPlayer constructor 
	*
	* @param {Element} element DOM element that we are building the player interface for.
	* @param {Object} customAttributes Attributes supplied via argument (rather than applied to the element) 
	*/
	init: function( element, customAttributes ) {	
		var _this = this;		
		// Set customAttributes if unset: 
		if ( !customAttributes ) {
			customAttributes = { };
		}		
		
		var playerAttributes = mw.getConfig( 'embedPlayerAttributes' ); 
		
		// Setup the player Interface from supported attributes:
		for ( var attr in playerAttributes ) {
			if ( customAttributes[ attr ] || customAttributes[ attr ] === false ) {
				this[ attr ] = customAttributes[ attr ];
			} else if ( element.getAttribute( attr ) ) {
				this[ attr ] = element.getAttribute( attr );
			} else {
				this[attr] = playerAttributes[attr];
			}
			// string -> boolean
			if( this[ attr ] == "false" ) this[attr] = false;
			if( this[ attr ] == "true" ) this[attr] = true;
		}
		
		if( this.apiTitleKey ){
			this.apiTitleKey = unescape( this.apiTitleKey );
		}
				
		// Hide "controls" if using native player controls: 
		if( this.useNativeControls() ){
			_this.controls = false;
		}
		
		// Set the poster:
		if ( $j( element ).attr( 'thumbnail' ) ) {
			_this.poster = $j( element ).attr( 'thumbnail' );
		}			
		if ( $j( element ).attr( 'poster' ) ) {
			_this.poster = $j( element ).attr( 'poster' );
		}	
				
		// Set the skin name from the class  
		var	sn = $j(element).attr( 'class' );
				
		if ( sn && sn != '' ) {
			for ( var n = 0; n < mw.validSkins.length; n++ ) {
				if ( sn.indexOf( mw.validSkins[n].toLowerCase() ) !== -1 ) {
					this.skinName = mw.validSkins[ n ];
				}
			}
		}
		
		// Set the default skin if unset: 
		if ( !this.skinName ) {
			this.skinName = mw.getConfig( 'EmbedPlayer.SkinName' );
		}
		
		if( !this.monitorRate ){
			this.monitorRate = mw.getConfig( 'EmbedPlayer.MonitorRate' );
		}
		
		// Make sure startOffset is cast as an float:		   
		if ( this.startOffset && this.startOffset.split( ':' ).length >= 2 ) {
			this.startOffset = parseFloat( mw.npt2seconds( this.startOffset ) );
		}
			
		// Make sure offset is in float: 
		this.startOffset = parseFloat( this.startOffset );
		
		// Set the source duration ( if provided in the element metaData or durationHint )
		if ( $j( element ).attr( 'duration' ) ) {
			_this.duration = $j( element ).attr( 'duration' );
		}
				
		if ( !_this.duration && $j( element ).attr( 'durationHint' ) ) {
			_this.durationHint = $j( element ).attr( 'durationHint' );
			// Convert duration hint if needed:
			_this.duration = mw.npt2seconds(  _this.durationHint );
		}				 
		
		// Make sure duration is a float:  
		this.duration = parseFloat( this.duration );
		mw.log( this.id + " duration is: " +  this.duration );
		
		// Set the player size attributes based loaded video element:  
		this.setPlayerSize( element ); 			
			 			 		
		// Set the plugin id
		this.pid = 'pid_' + this.id;

		// Grab any innerHTML and set it to missing_plugin_html
		// NOTE: we should strip "source" tags instead of checking and skipping
		if ( element.innerHTML != '' && element.getElementsByTagName( 'source' ).length == 0 ) {
			//mw.log( 'innerHTML: ' + element.innerHTML );
			this.user_missing_plugin_html = element.innerHTML;
		}
		
		// Add the mediaElement object with the elements sources:  
		this.mediaElement = new mediaElement( element );
		  
		// Process attribute "sources" for dynamic embedding
		if( customAttributes.sources && customAttributes.sources.length ){
			for( var i =0; i < customAttributes.sources.length ; i ++ ){
				var customSource =  customAttributes.sources[i];
				if( customSource.src ){
					var $source = $j('<source />')
						.attr( 'src', customSource.src );	
					// xxx todo pull list of valid source attributes from mediaSource prototype
					if( customSource.type ){
						$source.attr('type', customSource.type )
					}
					if( customSource.title ){
						$source.attr('title', customSource.title );
					}
					this.mediaElement.tryAddSource( $source.get(0) );
				}
			}
		}
	},
	
	/**
	 * for plugin-players to update supported features 
	 */
	updateFeatureSupport: function(){
		return ;
	},
	
	/**
	* Set the width & height from css style attribute, element attribute, or by default value
	*	if no css or attribute is provided set a callback to resize.
	* 
	* Updates this.width & this.height
	* 
	* @param {Element} element Source element to grab size from 
	*/
	setPlayerSize: function( element ) {					
		
		this['height'] = parseInt( $j(element).css( 'height' ) );
		this['width'] = parseInt( $j(element).css( 'width' ) );		
		
		if( !this['height']  && !this['width'] ) {
			this['height'] = parseInt( $j(element).attr( 'height' ) );
			this['width'] = parseInt( $j(element).attr( 'width' ) );
		}			
				
		// Special case for audio 
		// Firefox sets audio height to "0px" while webkit uses 32px .. force zero:  
		if(  element.tagName.toLowerCase() == 'audio' && this['height'] == '32') {
			this['height'] = 0;
		}		
		
		// Use default aspect ration to get height or width ( if rewriting a non-audio player )
		if(  element.tagName.toLowerCase() != 'audio' ) {
			if( this['height']  &&  !this['width'] && this.videoAspect  ) {
				var aspect = this.videoAspect.split( ':' );
				this['width'] = parseInt( this.height * ( aspect[0] / aspect[1] ) );
			}
			
			if( this['width']  &&  !this['height'] && this.videoAspect  ) {
				var aspect = this.videoAspect.split( ':' );
				this['height'] = parseInt( this.width * ( aspect[1] / aspect[0] ) );
			}
		}
		
		// On load sometimes attr is temporally -1 as we don't have video metadata yet.	
		// or in IE we get NaN for width height
		// 	 
		// NOTE: browsers that do support height width should set "waitForMeta" flag in addElement 		
		if( ( isNaN( this['height'] ) && isNaN( this['width'] ) ) ||
			( this['height'] == -1 || this['width'] == -1 )   ||
				// Check for firefox defaults
				// Note: ideally firefox would not do random guesses at css values 	
				( (this.height == 150 || this.height == 64 ) && this.width == 300 )
			) {			
			var defaultSize = mw.getConfig( 'EmbedPlayer.DefaultSize' ).split( 'x' );
			this['width'] = defaultSize[0];
			
			// Special height default for audio tag ( if not set )  
			if( element.tagName.toLowerCase() == 'audio' ) {
				this['height'] = 0;
			}else{
				this['height'] = defaultSize[1];
			}
		}	
		
	},
	
	/**
	* Get the player pixel width not including controls
	*
	* @return {Number} pixel height of the video
	*/	
	getPlayerWidth: function() {
		return parseInt( this.width );
	},
	
	/**
	* Get the player pixel height not including controls
	*
	* @return {Number} pixel height of the video
	*/
	getPlayerHeight: function() {		
		return parseInt( this.height );
	},

	/**
	* Check player for sources.  
	* If we need to get media sources form an external file 
	* 	that request is issued here 
	*/
	checkPlayerSources: function() {
		mw.log( 'f:checkPlayerSources: ' + this.id );
		var _this = this;
		
		// Scope the end of check for player sources so it can be called in a callback  
		var finishCheckPlayerSources = function(){
			// Run embedPlayer sources hook		
			mw.runTriggersCallback( _this, 'checkPlayerSourcesEvent', function(){							
				_this.checkForTimedText();
			})			
		}
		
		// NOTE: Should could be moved to mediaWiki Api support module		
		if ( _this.apiTitleKey ) {
			// Load media from external data
			mw.log( 'checkPlayerSources: loading apiTitleKey data' );		
			_this.loadSourceFromApi( function(){				
				finishCheckPlayerSources();
			} );
			return ;
		} else { 
			finishCheckPlayerSources();
		}
	},
	
	/**
	* Load Source video info from mediaWiki Api title key (  this.apiTitleKey )
	* @param {Function} callback Function called once loading is complete
	*/
	loadSourceFromApi: function( callback ){
		var _this = this;
		if( !_this.apiTitleKey ){
			mw.log( 'Error no apiTitleKey');
			return false;
		}
		
		// Set local apiProvider via config if not defined
		if( !_this.apiProvider ) {
			_this.apiProvider = mw.getConfig( 'EmbedPlayer.ApiProvider' );
		}	
		
		// Setup the request
		var request = {
			'prop': 'imageinfo',
			// In case the user added File: or Image: to the apiKey: 
			'titles': 'File:' + this.apiTitleKey.replace( /^(File:|Image:)/ , '' ),
			'iiprop': 'url|size|dimensions|metadata',
			'iiurlwidth': _this.width,
			'redirects' : true // automatically resolve redirects
		} 
	
		// Run the request:
		mw.getJSON( mw.getApiProviderURL( this.apiProvider ), request, function( data ){
			if ( data.query.pages ) {
				for ( var i in data.query.pages ) {
					if( i == '-1' ) {
						callback( false );
						return ;
					}
					var page = data.query.pages[i];
				}
			}	else {				
				callback( false );
				return ;
			}
			// Make sure we have imageinfo: 
			if( ! page.imageinfo || !page.imageinfo[0] ){
				callback( false );
				return ;
			}
			var imageinfo = page.imageinfo[0];
						
			// Set the poster
			_this.poster = imageinfo.thumburl;
			
			// Add the media src
			_this.mediaElement.tryAddSource(
				$j('<source />')
				.attr( 'src', imageinfo.url )
				.get( 0 )
			);
			
			// Set the duration
			if( imageinfo.metadata[2]['name'] == 'length' ) {
				_this.duration = imageinfo.metadata[2]['value'];
			}
			
			// Set the width height 
			// Make sure we have an accurate aspect ratio
			if( imageinfo.height != 0 &&  imageinfo.width != 0 ) {
				_this.height = parseInt( _this.width * ( imageinfo.height / imageinfo.width ) );
			}
			
			// Update the css for the player interface
			$j( _this ).css( 'height', _this.height);
			
			callback();
		});
	},
	
	/**
	* Check if we should load the timedText interface or not.
	* 
	* Note we check for text sources outside of
	*/
	isTimedTextSupported: function() {
		// Check for timed text sources or api/ roe url		
		if ( ( this.roe || this.apiTitleKey ||				
			this.mediaElement.textSourceExists() ) ) {			
			return true;
		} else {
			return false;
		}
	},
	
	/**
	* Check for timed Text support 
	* and load necessary libraries
	* 
	*/
	checkForTimedText: function( ) {
		var _this = this;
		mw.log( 'checkForTimedText: ' + _this.id + " height: " + this.height );
		// Check for timedText support
		if( this.isTimedTextSupported() ) {			
			mw.load( 'TimedText', function() {
				$j( '#' + _this.id ).timedText();
				_this.setupSourcePlayer();
			});			
			return ;
		}
		_this.setupSourcePlayer();
	},	
	
	/**
	* Set up the select source player
	*
	* issues autoSelectSource call  
	*
	* Sets load error if no source is playable 
	*/	
	setupSourcePlayer: function() {
		mw.log("setupSourcePlayer: " + this.id );
		// Autoseletct the media source		
		this.mediaElement.autoSelectSource();
		
		// Auto select player based on default order
		if ( !this.mediaElement.selectedSource ) {
			// check for parent clip: 
			if ( typeof this.pc != 'undefined' ) {
				mw.log( 'no sources, type:' + this.type + ' check for html' );						
				// do load player if just displaying innerHTML: 
				if ( this.pc.type == 'text/html' ) {
					this.selectedPlayer = mw.EmbedTypes.players.defaultPlayer( 'text/html' );
					mw.log( 'set selected player:' + this.selectedPlayer.mimeType );
				}
			}
		} else {
			this.selectedPlayer = mw.EmbedTypes.players.defaultPlayer( this.mediaElement.selectedSource.mimeType );
		}
		
		if ( this.selectedPlayer ) {
			mw.log( "Playback system: " + this.selectedPlayer.library );					
						
			// Inherit the playback system of the selected player:			
			this.inheritEmbedPlayer();
		} else {
			// No source's playable
			var missingType = '';
			var or = '';
			for ( var i = 0; i < this.mediaElement.sources.length; i++ ) {
				missingType += or + this.mediaElement.sources[i].mimeType;
				or = ' or ';
			}
			// Get from parent playlist if set: 		
			if ( this.pc ){
				missingType = this.pc.type;
			}
														
			mw.log( 'No player found for given source type ' + missingType );
			this.showPluginMissingHTML( missingType );
		}
	},
	
	/**
	* Load and inherit methods from the selected player interface
	*
	* @param {Function} callback Function to be called once playback-system has been inherited
	*/
	inheritEmbedPlayer: function( callback ) {
		mw.log( "inheritEmbedPlayer:duration is: " +  this.getDuration()  + ' p: ' + this.id );		
		
		// Clear out any non-base embedObj methods:
		if ( this.instanceOf ) {
			eval( 'var tmpObj = mw.EmbedPlayer' + this.instanceOf );
			for ( var i in tmpObj ) { // for in loop oky for object  
				if ( this[ 'parent_' + i ] ) {
					this[i] = this[ 'parent_' + i];
				} else {
					this[i] = null;
				}
			}
		}
		
		// Set up the new embedObj
		mw.log( 'EmbedPlayer::inheritEmbedPlayer: embedding with ' + this.selectedPlayer.library );
		var _this = this;
		
		// Load the selected player		
		this.selectedPlayer.load( function() {
			mw.log( 'EmbedPlayer::inheritEmbedPlayer ' + _this.selectedPlayer.library + " player loaded for " + _this.id );
			
			// Get embed library player Interface
			var playerInterface = mw[ 'EmbedPlayer' + _this.selectedPlayer.library  ];			
			
			for ( var method in playerInterface ) {  
				if ( _this[method] && !_this['parent_' + method] ) {
					_this['parent_' + method] = _this[method];
				}
				_this[ method ] = playerInterface[method];
			}				
										
			// Update feature support 
			_this.updateFeatureSupport();
			
			_this.getDuration();
			
			_this.showPlayer();
			// Call the global player manager to inform this video interface is ready: 
			mw.playerManager.playerReady( _this );
			
			// Run the callback if provided
			if ( typeof callback == 'function' ){
				callback();
			}
		} );
	},
	
	/**
	* Select a player playback system
	*
	* @param {Object} player Player playback system to be selected
	* 	player playback system include vlc, native, java etc. 
	*/
	selectPlayer: function( player ) {		
		var _this = this;
		if ( this.selectedPlayer.id != player.id ) {
			this.selectedPlayer = player;
			this.inheritEmbedPlayer( function(){
				// Hide / remove track container
				_this.$interface.find( '.track' ).remove();  
				// We have to re-bind hoverIntent ( has to happen in this scope )
				if( _this.controls && _this.controlBuilder.checkOverlayControls() ){
					_this.controlBuilder.showControlBar();				
					_this.$interface.hoverIntent({
						'sensitivity': 4,
						'timeout' : 2000,
						'over' : function(){										
							_this.controlBuilder.showControlBar();
						},
						'out' : function(){
							_this.controlBuilder.hideControlBar();
						}
					})
				}		
			});			
		}
	},		
	
	/**
	* Get a time range from the media start and end time 
	*
	* @return start_npt and end_npt time if present
	*/	
	getTimeRange: function() {
		var end_time = (this.controlBuilder.longTimeDisp)? '/' + mw.seconds2npt( this.getDuration() ) : '';
		var default_time_range = '0:00:00' + end_time;		
		if ( !this.mediaElement )
			return default_time_range;
		if ( !this.mediaElement.selectedSource )
			return default_time_range;
		if ( !this.mediaElement.selectedSource.end_npt )
			return default_time_range;		
		return this.mediaElement.selectedSource.start_npt + this.mediaElement.selectedSource.end_npt;
	},
	
	/**
	* Get the duration of the embed player
	*/	
	getDuration: function() {
		return this.duration;
	},	
	
	/**
	* Get the player height
	*/
	getHeight: function() {
		return this.height;
	},
	
	/**
	* Get the player width
	*/
	getWidth: function(){
		return this.width;
	},
	
	/**
	* Check if the selected source is an audio element: 
	*/
	isAudio: function(){
		return ( this.mediaElement.selectedSource.mimeType.indexOf('audio/') !== -1 );
	},
	
	/**
	* Get the plugin embed html ( should be implemented by embed player interface )
	*/
	doEmbedHTML: function() {
		return 'Error: function doEmbedHTML should be implemented by embed player interface ';
	},
	
	/**
	* Seek function (should be implemented by embed player interface )
	*/ 
	doSeek: function( percent ) {
		var _this = this;
		
		this.seeking = true;
		// Run the seeking hook
		$j( this.embedPlayer ).trigger( 'onSeek' );
		
		// See if we should do a server side seek ( player independent ) 
		if ( this.supportsURLTimeEncoding() ) {
			// Make sure this.seek_time_sec is up-to-date:
			this.seek_time_sec = mw.npt2seconds( this.start_npt ) + parseFloat( percent * this.getDuration() );
			mw.log( 'updated seek_time_sec: ' + mw.seconds2npt ( this.seek_time_sec ) );
			this.stop();
			this.didSeekJump = true;
			// Update the slider
			this.updatePlayHead( percent );
		}
		// Do play request in 100ms ( give the dom time to swap out the embed player ) 
		setTimeout( function() {
			_this.play()
		}, 100 );
		
		// Run the onSeeking interface update
		// NOTE controlBuilder should really bind to html5 events rather 
		// than explicitly calling it or inheriting stuff. 
		this.controlBuilder.onSeek(); 
	},	
	
	/**
	 * Seeks to the requested time and issues a callback when ready 
	 * (should be overwritten by client that supports frame serving)
	 */
	setCurrentTime: function( time, callback ) {
		mw.log( 'Error: base embed setCurrentTime can not frame serve (override via plugin)' );
	},
	
	/**
	* Setup the embed player 
	* issues a loading request
	*/
	doEmbedPlayer: function() {
		mw.log( 'EmbedPlayer :: doEmbedPlayer::' + this.selectedPlayer.id );
		//mw.log( 'thum disp:' + this.thumbnail_disp );
		var _this = this;
		
		var doEmbedPlayerLocal = function(){
			// Set "loading" here ( if displaying controls )
			if( ! _this.useNativeControls() ){ 
				$j( _this ).html( 
					$j( '<div />' )
					.css({
						'color' : 'black',
						'width' : _this.width + 'px',
						'height' : _this.height + 'px'
					})					
				);
			}
			
			// Reset some play state flags: 
			_this.bufferStartFlag = false;
			_this.bufferEndFlag = false;
			
			// Make sure the player is		
			mw.log( 'performing embed for ' + _this.id );
		};
				
		// If no binded events, run the local doEmbedPlayer function directly:  
		if( $j( this ).data('events').length == 0 ){
			doEmbedPlayerLocal();
		} else {
			// Trigger the doEmbedPlayer event / hook with callback  
			$j( this ).trigger( 'doEmbedPlayerEvent', function(){
				//done
				doEmbedPlayerLocal();
			});
		} 
		
		// mw.log('should embed:' + embed_code);		
		_this.doEmbedHTML() 		
	},
	
	
	
	/**
	* On clip done action. Called once a clip is done playing
	*/
	onClipDone: function() {
		mw.log( 'base:onClipDone ::' + this.id + ' doneCount:' + this.donePlayingCount );						
		var _this = this;				
				
		
		// Only run stopped once: 
		if( !this.isStopped() ){
			// Stop the monitor: 
			this.stopMonitor();
			
			// Update the clip done playing count:
			this.donePlayingCount ++;
		
			// Fire the html5 ended binding
			mw.log( "ended" );
			var onDoneActionObject = {
				'runBaseControlDone' : true
			}				
			
			// run the ended trigger ( allow the ended object to prevent default actions ) 				
			$j( this ).trigger( 'ended', onDoneActionObject );
			
			if( onDoneActionObject.runBaseControlDone ){
			
				// Check if we have the "loop" property set
				if( this.loop ) {
					this.play();
					return; 
				}
			
				// Stop the clip (load the thumbnail etc) 
				this.stop();
				this.seek_time_sec = 0;
				this.updatePlayHead( 0 );
				
				// Make sure we are not in preview mode( no end clip actions in preview mode) 
				if ( this.preview_mode ) {
					return ;
				}	
			
				// Do the controlBuilder onClip done interface
				this.controlBuilder.onClipDone();
			}
		}
				
	},
	
	
	/**
	* Shows the video Thumbnail, updates pause state
	*/
	showThumbnail: function() {
		var _this = this;
		mw.log( 'f:showThumbnail' + this.thumbnail_disp );
		
		// Close Menu Overlay:
		this.controlBuilder.closeMenuOverlay();
		
		// update the thumbnail html: 
		this.updatePosterHTML();
		
		this.paused = true;
		this.thumbnail_disp = true;
		// Make sure the controlBuilder bindings are up-to-date 
		this.controlBuilder.addControlBindings();
		
		// Once the thumbnail is shown run the mediaReady trigger (if not using native controls)
		if( !this.useNativeControls() ){
			mw.log("mediaLoaded");
			$j( this ).trigger( 'mediaLoaded' );
		}
	},
	
	/**
	* Show the player
	*/
	showPlayer : function () {	
		mw.log( 'EmbedPlayer:: Show player: ' + this.id );	
		var _this = this;
		// Set-up the local controlBuilder instance: 
		this.controlBuilder = new mw.PlayerControlBuilder( this );		
		var _this = this;
		// Make sure we have interface_wrap
		if( $j( this ).parent( '.interface_wrap' ).length == 0 ) {
			// Select "player"				
			$j( this )			
			.wrap( 
				$j('<div>')
				.addClass( 'interface_wrap ' + this.controlBuilder.playerClass )
				.css({				
					'width' : parseInt( this.width ) + 'px',
					'height' : parseInt( this.height ) + 'px',
					'position' : 'relative'
				})
			)
		}
				
		//Set up local jQuery object reference to "interface_wrap" 
		this.$interface = $j( this ).parent( '.interface_wrap' );				
		
		// Update Thumbnail for the "player" 
		this.updatePosterHTML();		
		
		// Add controls if enabled:
		if ( this.controls ) {			
			this.controlBuilder.addControls();
		} else {
			// Need to think about this some more... 
			// Interface is hidden if controls are "off" 
			this.$interface.hide();	
		}
				
		if ( this.autoplay ) {			
			mw.log( 'showPlayer::activating autoplay' );
			// Issue a non-blocking play request 
			setTimeout(function(){
				_this.play();
			},0)					
		}
		
	},
	
	/**
	* Get missing plugin html (check for user included code)
	* @param {String} [misssingType] missing type mime
	*/
	showPluginMissingHTML: function( misssingType ) {
		// Remove the loading spinner if present: 
		$j('.playerLoadingSpinner').remove();
		
		// If the native video is already displayed hide it: 
		if( $j( '#' + this.pid ).length != 0 ){
			$j('#loadingSpinner_' + this.id ).remove();
			$j( '#' + this.pid ).hide()
		}
		if( this.mediaElement.sources.length == 0 ){
			$j( this ).html(
				$j('<span />').text( 
					gM('mwe-embedplayer-missing-source')
				)
			);
			return ;
		}
		var source = this.mediaElement.sources[0];		
		// Check if we have user defined missing html msg: 		
		if ( this.user_missing_plugin_html ) {
		  $j( this ).html(  this.user_missing_plugin_html );
		} else {
		  if ( !misssingType ){
			  misssingType = '';
		  }		   		 
		  $j( this ).html(
		  	$j('<div />').append(
		  		gM( 'mwe-embedplayer-generic_missing_plugin', misssingType ),
		  		$j( '<br />' ),
		  		$j( '<a />' )
		  		.attr( {
		  			'title' : gM( 'mwe-embedplayer-download_clip' ),
		  			'href' : source.src
		  		})
		  		.text( gM( 'mwe-embedplayer-download_clip' ) )
		  	)
		  )
		}
		// hide
	},
	
	/**
	* Update the video time request via a time request string
	* @param {String} time_req
	*/
	updateVideoTimeReq: function( time_req ) {
		mw.log( 'f:updateVideoTimeReq' );
		var time_parts = time_req.split( '/' );
		this.updateVideoTime( time_parts[0], time_parts[1] );
	},
	
	/** 
	* Update Video time from provided start_npt and end_npt values
	*
	* @param {String} start_npt the new start time in npt format
	* @pamra {String} end_npt the new end time in npt format 
	*/
	updateVideoTime: function( start_npt, end_npt ) {
		// update media
		this.mediaElement.updateSourceTimes( start_npt, end_npt );
		
		// update mv_time
		this.controlBuilder.setStatus( start_npt + '/' + end_npt );
		
		// reset slider
		this.updatePlayHead( 0 );
		
		// reset seek_offset:
		if ( this.mediaElement.selectedSource.URLTimeEncoding ) {
			this.seek_time_sec = 0;
		} else {
			this.seek_time_sec = mw.npt2seconds( start_npt );
		}
	},
	
	/**
	* Render a thumbnail at a given time
	* NOTE: Should overwrite by embed library if we can render frames natively
	*
	* @param {Object} options Options for rendered timeline thumb 
	*/ 
	renderTimelineThumbnail: function( options ) {
		var my_thumb_src = this.mediaElement.getPosterSrc();
		// check if our thumbnail has a time attribute: 
		if ( my_thumb_src.indexOf( 't=' ) !== -1 ) {
			var time_ntp =  mw.seconds2npt ( options.time + parseInt( this.startOffset ) );
			my_thumb_src = mw.replaceUrlParams( my_thumb_src, { 
				't' : time_ntp, 
				'size' : options.size 
			});
		}
		var thumb_class = ( typeof options['thumb_class'] != 'undefined' ) ? options['thumb_class'] : '';
		return '<div class="ui-corner-all ' + thumb_class + '" src="' + my_thumb_src + '" ' +
				'style="height:' + options.height + 'px;' +
				'width:' + options.width + 'px" >' +
					 '<img src="' + my_thumb_src + '" ' +
						'style="height:' + options.height + 'px;' +
						'width:' + options.width + 'px">' +
				'</div>';
	},
	
	/**
	* Update Thumb time with npt formated time
	* @param {String} time NPT formated time to update thumbnail
	*/	
	updateThumbTimeNPT: function( time ) {
		this.updateThumbTime( mw.npt2seconds( time ) - parseInt( this.startOffset ) );
	},
	
	/**
	* Update the thumb with a new time 
	* @param {Float} floatSeconds Time to update the thumb to
	*/	
	updateThumbTime:function( floatSeconds ) {
		// mw.log('updateThumbTime:'+floatSeconds);
		var _this = this;
		if ( typeof this.org_thum_src == 'undefined' ) {
			this.org_thum_src = this.poster;
		}
		if ( this.org_thum_src.indexOf( 't=' ) !== -1 ) {
			this.last_thumb_url = mw.replaceUrlParams( this.org_thum_src,
				{ 
					't' : mw.seconds2npt( floatSeconds + parseInt( this.startOffset ) ) 
				}
			);
			if ( !this.thumbnail_updating ) {
				this.updatePoster( this.last_thumb_url , false );
				this.last_thumb_url = null;
			}
		}
	},
	
	/** 
	* Updates the displayed thumbnail via percent of the stream
	* @param {Float} percent Percent of duration to update thumb
	*/
	updateThumbPerc:function( percent ) {
		return this.updateThumbTime( ( this.getDuration() * percent ) );
	},
	
	/**
	* Updates the thumbnail if the thumbnail is being displayed
	* 
	* @param {String} src New src of thumbnail
	* @param {Boolean} quick_switch 
	* 	true switch happens instantly
	* 	false / undefined animated cross fade
	*/
	updatePosterSrc: function( src, quick_switch ) {
		// make sure we don't go to the same url if we are not already updating: 
		if ( !this.thumbnail_updating && $j( '#img_thumb_' + this.id ).attr( 'src' ) == src )
			return false;
		// if we are already updating don't issue a new update: 
		if ( this.thumbnail_updating && $j( '#new_img_thumb_' + this.id ).attr( 'src' ) == src )
			return false;
		
		mw.log( 'update thumb: ' + src );
		
		if ( quick_switch ) {
			$j( '#img_thumb_' + this.id ).attr( 'src', src );
		} else {
			var _this = this;
			// if still animating remove new_img_thumb_
			if ( this.thumbnail_updating == true )
				$j( '#new_img_thumb_' + this.id ).stop().remove();
					
			if ( this.thumbnail_disp ) {
				mw.log( 'set to thumb:' + src );
				this.thumbnail_updating = true;
				$j( this ).append( 
					$j('<img />')
					.attr({
						'src' : src,
						'id' : 'new_img_thumb_' + this.id,
						'width' : this.width,
						'height': this.height
					})
					.css( {
						'display' : 'none',
						'position' : 'absolute',
						'zindex' : 2,
						'top' : '0px',
						'left' : '0px'
					})
				);
				// mw.log('appended: new_img_thumb_');		
				$j( '#new_img_thumb_' + this.id ).fadeIn( "slow", function() {
						// once faded in remove org and rename new:
						$j( '#img_thumb_' + _this.id ).remove();
						$j( '#new_img_thumb_' + _this.id ).attr( 'id', 'img_thumb_' + _this.id );
						$j( '#img_thumb_' + _this.id ).css( 'zindex', '1' );
						_this.thumbnail_updating = false;
						// mw.log("done fadding in "+ $j('#img_thumb_'+_this.id).attr("src"));

						// if we have a thumb queued update to that
						if ( _this.last_thumb_url ) {
							var src_url = _this.last_thumb_url;
							_this.last_thumb_url = null;
							_this.updatePosterSrc( src_url );
						}
				} );
			}
		}
	},
	
	/** 
	* Returns the HTML code for the video when it is in thumbnail mode.
	* playing, configuring the player, inline cmml display, HTML linkback,
	* download, and embed code.
	*/
	updatePosterHTML: function () {
		mw.log( 'embedPlayer:updatePosterHTML::' + this.id );
		var thumb_html = '';
		var class_atr = '';
		var style_atr = '';
		
		
		if( this.useNativeControls() ){
			this.showNativePlayer();
			return ;
		}		
		
		// Set by default thumb value if not found
		var posterSrc = ( this.poster ) ? this.poster : 
						mw.getConfig( 'imagesPath' ) + 'vid_default_thumb.jpg';				
		
		// Poster support is not very consistent in browsers
		// use a jpg poster image:  
		$j( this ).html(
			$j( '<img />' )
			.css({
				'position' : 'relative',				
				'width' : '100%',
				'height' : '100%'
			})
			.attr({
				'id' : 'img_thumb_' + this.id,
				'src' : posterSrc
			})
			.addClass( 'playerPoster' )
		);
				
		if ( this.controls 
			&& this.height > this.controlBuilder.getComponentHeight( 'playButtonLarge' ) 
		) {
			$j( this ).append(
				this.controlBuilder.getComponent( 'playButtonLarge' )
			);
		}		
	},
	
	/**
	 * Checks if native controls should be used  
	 *
	 * @param [player] Object Optional player object to check controls attribute 
	 * @returns boolean true if the mwEmbed player interface should be used
	 * 					false if the mwEmbed player interface should not be used
	 */
	useNativeControls: function() {
		if( mw.getConfig('EmbedPlayer.NativeControls') === true ) {
			return true;
		}
		if( mw.getConfig('EmbedPlayer.NativeControlsMobileSafari' ) &&
		 	mw.isMobileSafari()
		){
			return true;
		} 
		return false;
	},
	
	
	/**
	 * Show the native player embed code 
	 *
	 * This is for cases where the main library needs to "get out of the way" 
	 * since the device only supports a limited subset of the html5 and 
	 * won't work with an html javascirpt interface
	 */
	showNativePlayer: function(){
		var _this = this;
		// Empty the player
		$j(this).empty();
		
		// Remove the player loader spinner if it exists
		$j('#loadingSpinner_' + this.id ).remove();
		
		// Check if we need to refresh mobile safari
		/*var mobileSafairNeedsRefresh = false;
		if( $j( '#' + this.pid ).attr('controls') === false ){
			mobileSafairNeedsRefresh = true;
		}*/		
		
		// For now always refersh ( buggy display control behavior in iPad ) 
		mobileSafairNeedsRefresh = true;
		
		// Unhide the original video element
		$j( '#' + this.pid )
		.css( {
			'position' : 'absolute'
		} )
		.show()
		.attr('controls', 'true');
		
		// iPad does not handle video tag update for attributes like "controls" 
		// so we have to do a full replace ( if controls are not included initially ) 		
		if( mw.isMobileSafari() && mobileSafairNeedsRefresh ) {
			var source = this.mediaElement.getSources( 'video/h264' )[0];
			if( ! source.src ){
				mw.log( 'Error: should have caught no playable sources for mobile safari earlier' );
			}		
					
			var videoAttribues = {
				'id' : _this.pid,
				'poster': _this.poster,
				'src' : source.src,
				'controls' : 'true'
			}
			if( this.loop ){
				videoAttribues[ 'loop' ] = 'true';
			}
			var cssStyle = {
				'width' : _this.width,
				'height' : _this.height
			};			
			$j( '#' + this.pid ).replaceWith( 
				_this.getNativePlayerHtml( videoAttribues, cssStyle )									
			)
			// Bind native events:
			this.applyMediaElementBindings();
		}
		return ;
	},
	/**
	* Should be set via native embed support  
	*/
	getNativePlayerHtml: function(){
		return $j('<div />' ).html( 'Error: Trying to get native html5 player without native support for codec' );
	},
	/**
	* Should be set via native embed support  
	*/
	applyMediaElementBindings: function(){
		return ;
	},
	
	/**
	* Gets code to embed the player remotely for "share" this player links
	*/	
	getEmbeddingHTML: function() {
		switch( mw.getConfig( 'EmbedPlayer.ShareEmbedMode' ) ){
			case 'object':
				return this.getShareEmbedObject()
			break;
			case 'videojs':
				return this.getShareEmbedVideoJs();
			break;
		}
	},
	
	/**
	* Get the share embed object code
	* 
	* NOTE this could probably share a bit more code with getShareEmbedVideoJs
	*/ 
	getShareEmbedObject: function(){		
		var iframeUrl = mw.getMwEmbedPath() + 'mwEmbedFrame.php?';
		
		if ( this.roe ) {
			iframeUrl += 'roe=' + escape( this.roe ) + '&';
		} else if( this.apiTitleKey ) {			
			iframeUrl += 'apiTitleKey=' + escape( this.apiTitleKey ) + '&';
			if ( this.apiProvider ) {
				iframeUrl += 'apiProvider=' + escape( this.apiProvider ) + '&';
			}
		} else {			
			// Output all the video sources:
			for( var i=0; i < this.mediaElement.sources.length; i++ ){
				var source = this.mediaElement.sources[i];
				if( source.src ) {
					iframeUrl += 'src[]=' + escape( mw.absoluteUrl( source.src ) ) + '&';
				}
			}
			// Output the poster attr
			if( this.poster ){
				iframeUrl += 'poster=' + escape( this.poster ) + '&';
			}
		}
		
		// Set the skin if set to something other than default
		if( this.skinName ){
			iframeUrl += 'skin=' + escape( this.skinName ) + '&';
		}
		
		if( this.duration ) {
			iframeUrl +='durationHint=' + escape( parseFloat( this.duration ) ) + '&';
		}
		// Set width / height of iframe embed ( child iframe / object can't read parent frame size )
		if( this.width || this.height ){
			iframeUrl += ( this.width )? 'width=' + parseInt( this.width ) + '&' : '';
			iframeUrl += ( this.height )? 'height=' +parseInt( this.height ) + '&' : '';
		}
		
		// Set up embedFrame src path
		var embedCode = '&lt;object data=&quot;' + mw.escapeQuotesHTML( iframeUrl ) + '&quot; ';
		
		// Set width / height of embed object ( give extra space for controls ) 
		if( this.width || this.height ){
			embedCode += ( this.width )? 'width=&quot;' + this.width +'&quot; ': '';
			embedCode += ( this.height )? 'height=&quot;' + 
				parseInt( this.height + this.controlBuilder.getHeight() + 2 ) + 
				'&quot; ': '';
		}
		//Make sure overflow is hidden: 
		embedCode += 'style=&quot;overflow:hidden&quot; ';
		
		// Close up the embedCode tag: 
		embedCode+='&gt;&lt/object&gt;';
		
		// Return the embed code
		return embedCode;
	},
	
	/**
	* Get the share embed Video tag code
	*/ 
	getShareEmbedVideoJs: function(){
		
		// Set the embed tag type: 
		var embedtag = ( this.isAudio() )? 'audio': 'video';
		
		// Set up the mwEmbed js include: 
		var embedCode = '&lt;script type=&quot;text/javascript&quot; ' +
					'src=&quot;' +  
					mw.escapeQuotesHTML( 
						mw.absoluteUrl( 
							mw.getMwEmbedSrc() 
						)
					) + '&quot;&gt;&lt;/script&gt' +
					'&lt;' + embedtag + ' ';

		if( this.poster ) {
			embedCode += 'poster=&quot;' +
				mw.escapeQuotesHTML(  mw.absoluteUrl( this.poster ) ) + 
				'&quot; ';
		}
	
		// Set the skin if set to something other than default
		if( this.skinName ){
			embedCode += 'class=&quot;' +
				mw.escapeQuotesHTML( this.skinName ) + 
				'&quot; ';
		}
		
		if( this.duration ) {
			embedCode +='durationHint=&quot;' + parseFloat( this.duration ) + '&quot; ';
		}
		
		if( this.width || this.height ){
			embedCode +='style=&quot;';
			embedCode += ( this.width )? 'width:' + this.width +'px;': '';
			embedCode += ( this.height )? 'height:' + this.height +'px;': '';
			embedCode += '&quot; ';
		}
		
					
		if ( this.roe ) {
			embedCode += 'roe=&quot;' + mw.escapeQuotesHTML( this.roe ) + '&quot; ';
		} else if( this.apiTitleKey ) {			
			embedCode += 'apiTitleKey=&quot;' + mw.escapeQuotesHTML( this.apiTitleKey ) + '&quot; ';
			if ( this.apiProvider ) {
				embedCode += 'apiProvider=&quot;' + mw.escapeQuotesHTML( this.apiProvider ) + '&quot; ';
			}
			// close the video tag
			embedCode += '&gt;&lt;/video&gt;';
			
		} else {
			//Close the video attr
			embedCode += '&gt;';
			
			// Output all the video sources:
			for( var i=0; i < this.mediaElement.sources.length; i++ ){
				var source = this.mediaElement.sources[i];
				if( source.src ) {
					embedCode +='&lt;source src=&quot;' + 
						mw.absoluteUrl( source.src ) + 
						'&quot; &lt;&gt;/source&gt;';
				}
			}							
			// Close the video tag
			embedCode += '&lt;/video&gt;';				
		}						
		
		return embedCode;
	},
	
	/**
	* Follows a linkback. Loads the ROE xml if no linkback is found 
	*/
	doLinkBack: function() {
		if ( ! this.linkback && this.roe && this.mediaElement.addedROEData == false ) {
			var _this = this;
			this.displayOverlay( gM( 'mwe-embedplayer-loading_txt' ) );
			this.getMvJsonUrl( this.roe, function( data ) {
				_this.mediaElement.addROE( data );
				_this.doLinkBack();
			} );
		} else {
			if ( this.linkback ) {
				window.location = this.linkback;
			} else if ( this.mediaElement.linkback ) {
				window.location = this.mediaElement.linkback;
			} else {
				this.displayOverlay( gM( 'mwe-embedplayer-could_not_find_linkback' ) );
			}
		}
	},		
		
	/**
	*  Base Embed Controls
	*/
	
	/**
	* The Play Action
	*
	* Handles play requests, updates relevant states:
	*  seeking =false
	*  paused = false
	* Updates pause button
	* Starts the "monitor" 
	*/
	play: function() {
		var _this = this;
		mw.log( "EmbedPlayer:: play" );
		// Hide any overlay:
		this.controlBuilder.closeMenuOverlay();
		
		// Check if thumbnail is being displayed and embed html
		if ( this.thumbnail_disp ) {
			if ( !this.selectedPlayer ) {
				mw.log( 'no selectedPlayer' );					
				this.showPluginMissingHTML();
			} else {
				this.thumbnail_disp = false;
				this.paused = false;
				this.doEmbedPlayer();				
			}
		} else {
			// the plugin is already being displayed			
			this.paused = false; // make sure we are not "paused"
			this.seeking = false;
		}
		
		this.$interface.find('.play-btn span')
		.removeClass( 'ui-icon-play' )
		.addClass( 'ui-icon-pause' );
			
		this.$interface.find( '.play-btn' )
		.unbind()		
		.buttonHover()
		.click( function( ) {
		 	_this.pause();
	   	 } )
	   	 .attr( 'title', gM( 'mwe-embedplayer-pause_clip' ) );
	   	 
	   	 
	   	 //Run play hook: 
	   	 mw.log("playEvent");
	   	 $j( this ).trigger( 'playEvent' );
	   	
	   	  // If we previously finished playing this clip run the "replay hook"
	   	 if( this.donePlayingCount > 0 ) {
	   	 	mw.log("replayEvent");
	   	 	$j( this ).trigger( 'replayEvent' );
	   	 }
	},
	
	/**
	 * Maps the html5 load request. There is no general way to "load" clips so
	 * underling plugin-player libs should override.
	 */
	load: function() {
		// should be done by child (no base way to pre-buffer video)
		mw.log( 'baseEmbed:load call' );
	},	
	
	/**
	* Base embed pause
	* Updates the play/pause button state.
	*
	*	There is no general way to pause the video
	*  must be overwritten by embed object to support this functionality.
	*/
	pause: function() {
		var _this = this;		
		// mw.log('mwEmbed:do pause');		
		// (playing) do pause		
		this.paused = true;
				
		// update the ctrl "paused state"				
		this.$interface.find('.play-btn span' )
		.removeClass( 'ui-icon-pause' )
		.addClass( 'ui-icon-play' );
		
		this.$interface.find('.play-btn' )
		.unbind()
		.buttonHover()
		.click( function() {
			_this.play();
		} )
		.attr( 'title', gM( 'mwe-embedplayer-play_clip' ) );
	},
	
	/**
	* Base embed stop 
	* 
	* Updates the player to the stop state 
	* 	shows Thumbnail
	* 	resets Buffer
	*	resets Playhead slider
	* 	resets Status
	*/
	stop: function() {
		var _this = this;
		mw.log( 'mvEmbed:stop:' + this.id );		
		// no longer seeking:
		this.didSeekJump = false;
		
		// reset current time and prev time
		this.currentTime = this.previousTime = 0; 
		
		// Previous player set time		
		
		// First issue pause to update interface (only call this parent) 
		if ( this['parent_pause'] ) {
			this.parent_pause();
		} else {
			this.pause();
		}
		
		// Reset the currentTime: 
		this.currentTime = 0;
		
		// Check if thumbnail is being displayed in which case do nothing
		if ( this.thumbnail_disp ) {
			// already in stooped state
			mw.log( 'already in stopped state' );
		} else {
			// rewrite the html to thumbnail disp
			this.showThumbnail();
			this.bufferedPercent = 0; // reset buffer state
			this.updatePlayHead( 0 );
			this.controlBuilder.setStatus( this.getTimeRange() );
		}
		
		//Bind play-btn-large play 
		this.$interface.find( '.play-btn-large' )
		.unbind( 'click' )
		.click( function() {
			_this.play();
		} );		
	},
	
	/**
	* Base Embed mute
	* 
	* Handles interface updates for toggling mute.
	*  Plug-in / player interface must handle the actual media player update
	*/
	toggleMute: function() {
		mw.log( 'f:toggleMute:: (old state:) ' + this.muted );		
		if ( this.muted ) {
			this.muted = false;				
			var percent = this.preMuteVolume;			
		} else {
			this.muted = true;
			this.preMuteVolume = this.volume;			
			var percent = 0;
		}	
		this.setVolume( percent );				
		// Update the interface
		this.setInterfaceVolume( percent );
	},
	
	/**
	* Update volume function ( called from interface updates )
	* @param {float} percent Percent of full volume
	*/
	setVolume: function( percent ) {
		// ignore NaN percent:
		if( isNaN( percent ) ){
			return ;
		}
		// Set the local volume attribute				
		this.previousVolume = this.volume = percent;
		
		// Un-mute if setting positive volume
		if( percent != 0 ){
			this.muted = false;			
		}
		
		// Update the playerElement volume	
		this.setPlayerElementVolume( percent );
		
		//mw.log(" setVolume:: " + percent + ' this.volume is: ' + this.volume);		
	},
	
	/**
	* Updates the interface volume
	* TODO should move to controlBuilder
	* @param {float} percent Percentage volume to update interface
	*/
	setInterfaceVolume: function( percent ) {
		if( this.supports[ 'volumeControl' ] && 
			this.$interface.find( '.volume-slider' ).length 
		) {
			this.$interface.find( '.volume-slider' ).slider( 'value', percent * 100 );
		}
	},	
	
	/**
	* Abstract Update volume Method must be override by plug-in / player interface
	*/
	setPlayerElementVolume: function( percent ) {
		mw.log('Error player does not support volume adjustment' );
	},
	
	/**
	* Abstract get volume Method must be override by plug-in / player interface
	* (if player does not override we return the abstract player value )	
	*/
	getPlayerElementVolume: function(){
		//mw.log(' error player does not support getting volume property' );
		return this.volume;		
	},
	
	/**
	* Abstract get volume muted property  must be overwritten by plug-in / player interface
	* (if player does not override we return the abstract player value )	
	*/
	getPlayerElementMuted: function(){
		//mw.log(' error player does not support getting mute property' );
		return this.muted;
	},
	
	/**
	* Passes a fullscreen request to the controlBuilder interface
	*/
	fullscreen: function() {
		this.controlBuilder.toggleFullscreen();		
	},
	
	/**
	* Abstract method to be run post embedding the player 
	* Generally should be overwritten by the plug-in / player 
	*/
	postEmbedJS:function() {
		return ;
	},
	
	/**
	* Checks the player state based on thumbnail display & paused state
	* @return {Boolean} 
	*	true if playing
	* 	false if not playing
	*/
	isPlaying : function() {
		if ( this.thumbnail_disp ) {
			// in stopped state
			return false;
		} else if ( this.paused ) {
			// paused state
			return false;
		} else {
			return true;
		}
	},
	
	/**
	* Get paused state
	* @return {Boolean} 
	*	true if playing
	* 	false if not playing
	*/
	isPaused: function() {
		return this.paused;
	},
	
	/**
	* Get Stopped state
	* @return {Boolean} 
	*	true if stopped
	* 	false if playing
	*/
	isStopped: function() {
		return this.thumbnail_disp;
	},	
	
	// xxx temporary hack we need a better stop monitor system
	stopMonitor: function(){
		this.thumbnail_disp = true;
	},
	
	/**
	 * Checks if the currentTime was updated outside of 
	 * the getPlayerElementTime function
	 */
	checkForCurrentTimeSeek: function(){
		var _this = this;
		// Check if a javascript currentTime change based seek has occurred
		if( _this.previousTime != _this.currentTime && !this.userSlide && !this.seeking){
			// If the time has been updated and is in range issue a seek
			if( _this.getDuration() && _this.currentTime <= _this.getDuration() ){
				var seekPercent =  _this.currentTime / _this.getDuration();
				mw.log("monitor::" + _this.previousTime + ' != ' +
						 _this.currentTime + " javascript based currentTime update to " + seekPercent);
				this.doSeek( seekPercent );				
			}
		}	
	},
	
	/**
	* Monitor playback and update interface components.
	* underling plugin objects are responsible for updating currentTime
	*/
	monitor: function() {
		var _this = this;
		
		// Check for current time update outside of embed player 
		this.checkForCurrentTimeSeek();			
		
		// Update currentTime via embedPlayer
		_this.currentTime  = _this.getPlayerElementTime();
				
		// Update the previousTime ( so we can know if the user-javascript changed currentTime )
		_this.previousTime = _this.currentTime;
		
		
		// Check if volume was set outside of embed player function
		//mw.log( ' this.volume: ' + _this.volume + '  prev Volume:: ' + _this.previousVolume );
		if( _this.volume != _this.previousVolume ) {			
			_this.setInterfaceVolume( _this.volume );
		}
		
		// Update the previous volume 
		_this.previousVolume = _this.volume;	
			
		// Update the volume from the player element
		_this.volume = this.getPlayerElementVolume();
		
		// update the mute state from the player element
		if( _this.muted != _this.getPlayerElementMuted() ){
			mw.log("monitor:: muted does not mach embed player" );
			this.toggleMute();
		}
		
		//mw.log( 'Monitor:: ' + this.currentTime + ' duration: ' + ( parseInt( this.getDuration() ) + 1 )  + ' is seek: ' + this.seeking );		
		if ( this.currentTime >= 0  && this.duration ) {			
			if ( !this.userSlide && !this.seeking ) {
				if ( parseInt( this.startOffset ) != 0 ) {				
					// If start offset include that calculation 
					this.updatePlayHead( ( this.currentTime - this.startOffset ) / this.duration );
					var et = ( this.controlBuilder.longTimeDisp ) ? '/' + mw.seconds2npt( parseFloat( this.startOffset ) + parseFloat( this.duration ) ) : '';
					this.controlBuilder.setStatus( mw.seconds2npt( this.currentTime ) + et );
				} else {					
					this.updatePlayHead( this.currentTime / this.duration );					
					// Only include the end time if longTimeDisp is enabled:
					var et = ( this.controlBuilder.longTimeDisp ) ? '/' + mw.seconds2npt( this.duration ) : '';
					this.controlBuilder.setStatus( mw.seconds2npt( this.currentTime ) + et );
				}
			}
			// Check if we are "done"
			var endPresentationTime = ( this.startOffset ) ? ( this.startOffset + this.duration ) : this.duration;
			if ( this.currentTime >= endPresentationTime ) {
				mw.log( "should run clip done :: " + this.currentTime + ' > ' +  endPresentationTime  );
				this.onClipDone();
			}
		} else {
			// Media lacks duration just show end time			
			if ( this.isStopped() ) {
				this.controlBuilder.setStatus( this.getTimeRange() );
			} else if ( this.isPaused() ) {
				this.controlBuilder.setStatus( gM( 'mwe-embedplayer-paused' ) );
			} else if ( this.isPlaying() ) {
				if ( this.currentTime && ! this.duration )
					this.controlBuilder.setStatus( mw.seconds2npt( this.currentTime ) + ' /' );
				else
					this.controlBuilder.setStatus( " - - - " );
			} else {
				this.controlBuilder.setStatus( this.getTimeRange() );
			}
		}
		
		// Update buffer information 
		this.updateBufferStatus();
		
		// run the "native" progress event on the virtual html5 object if set
		if( this.progressEventData ) {
			//mw.log("trigger:progress event on html5 proxy");
			$j( this ).trigger( 'progress', this.progressEventData );
		}
				
		// Call monitor at 250ms interval. ( use  setInterval to avoid stacking monitor requests ) 
		if( ! this.isStopped() ) {
			if( !this.monitorInterval ){
				this.monitorInterval = setInterval( function(){
					_this.monitor();
				}, this.monitorRate )
			}
		} else {
			// If stopped "stop" monitor: 
			clearInterval( this.monitorInterval );
		}
		
		//mw.log('trigger:monitor:: ' + this.currentTime );		
		$j( this ).trigger( 'monitorEvent' );
	},	
	
	/**
	 * Abstract getPlayerElementTime function 
	 */
	getPlayerElementTime: function(){
		mw.log("Error: getPlayerElementTime should be implemented by embed library");
	},
	
	/**
	* Update the Buffer status based on the local bufferedPercent var
	*/
	updateBufferStatus: function() {
		
		// Get the buffer target based for playlist vs clip 
		$buffer = this.$interface.find( '.mw_buffer' );		
		// Update the buffer progress bar (if available )
		if ( this.bufferedPercent != 0 ) {
			//mw.log('Update buffer css: ' + ( this.bufferedPercent * 100 ) + '% ' + $buffer.length );			
			if ( this.bufferedPercent > 1 ){
				this.bufferedPercent = 1;
			}
			
			$buffer.css({
				"width" : ( this.bufferedPercent * 100 ) + '%'
			});
		} else {
			$buffer.css( "width", '0px' );
		}
		
		// if we have not already run the buffer start hook
		if(  this.bufferedPercent > 0 && !this.bufferStartFlag ) {
			this.bufferStartFlag = true;
			mw.log("bufferStart");
			$j( this ).trigger( 'bufferStartEvent' );
		}		
		
		// if we have not already run the buffer end hook
		if( this.bufferedPercent == 1 && !this.bufferEndFlag){
			this.bufferEndFlag = true;			
			$j( this ).trigger( 'bufferEndEvent' );
		}
	},
	
	/**
	* Update the player playhead
	*
	* @param {Float} perc Value between 0 and 1 for position of playhead
	*/
	updatePlayHead: function( perc ) {
		$play_head = this.$interface.find( '.play_head' );
		if ( this.controls &&  $play_head.length != 0 ) {
			var val = parseInt( perc * 1000 );
			$play_head.slider( 'value', val );
		}		
	},
	
	/**
	* Highlight a section of video on the playhead	
	*
	* @param {Object} options Provides "start" time & "end" time to highlight
	*/	
	highlightPlaySection:function( options ) {
		mw.log( 'highlightPlaySection' );
		var eid = ( this.pc ) ? this.pc.pp.id:this.id;
		var dur = this.getDuration();
		// set the left percet and update the slider: 
		rel_start_sec = mw.npt2seconds( options['start'] );
		// remove the startOffset if relevent: 
		if ( this.startOffset )
			rel_start_sec = rel_start_sec - this.startOffset
		
		var slider_perc = 0;
		if ( rel_start_sec <= 0 ) {
			left_perc = 0;
			options['start'] = mw.seconds2npt( this.startOffset );
			rel_start_sec = 0;
			this.updatePlayHead( 0 );
		} else {
			left_perc = parseInt( ( rel_start_sec / dur ) * 100 ) ;
			slider_perc = ( left_perc / 100 );
		}
		
		mw.log( "slider perc:" + slider_perc );
		if ( ! this.isPlaying() ) {
			this.updatePlayHead( slider_perc );
		}
		
		width_perc = parseInt( ( ( mw.npt2seconds( options['end'] ) - mw.npt2seconds( options['start'] ) ) / dur ) * 100 ) ;
		if ( ( width_perc + left_perc ) > 100 ) {
			width_perc = 100 - left_perc;
		}
		// mw.log('should hl: '+rel_start_sec+ '/' + dur + ' re:' + rel_end_sec+' lp:'  + left_perc + ' width: ' + width_perc);	
		$j( '#mv_seeker_' + eid + ' .mv_highlight' ).css( {
			'left' : left_perc + '%',
			'width' : width_perc + '%'
		} ).show();
		
		this.jump_time =  options['start'];
		this.seek_time_sec = mw.npt2seconds( options['start'] );
		// trim output to 
		this.controlBuilder.setStatus( gM( 'mwe-embedplayer-seek_to', mw.seconds2npt( this.seek_time_sec ) ) );
		mw.log( 'DO update: ' +  this.jump_time );
		this.updateThumbTime( rel_start_sec );
	},
	
	/**
	* Hides the playhead highlight
	*/	
	hideHighlight: function() {
		var eid = ( this.pc ) ? this.pc.pp.id:this.id;
		$j( '#mv_seeker_' + eid + ' .mv_highlight' ).hide();
		this.controlBuilder.setStatus( this.getTimeRange() );		
	},		
	
	
	/**
	* Helper Functions for selected source 
	*/
	
	/**
	* Get the current selected media source
	*
	* @return src url	
	*/
	getSrc: function() {
		if( this.mediaElement.selectedSource ){
			return this.mediaElement.selectedSource.getSrc( this.seek_time_sec );
		}
		return false;
	},
	
	/**
	* If the selected src supports URL time encoding
	*
	* @return {Boolean}
	*	ture if the src supports url time requests
	* 	false if the src does not support url time requests
	*/
	supportsURLTimeEncoding: function() {
		// do head request if on the same domain
		return this.mediaElement.selectedSource.URLTimeEncoding;
	}
}



/**
  * mediaPlayer represents a media player plugin.
  *
  * @param {String} id id used for the plugin.
  * @param {Array} supported_types an array of supported MIME types.
  * @param {String} library external script containing the plugin interface code. 
  * @constructor
  */
function mediaPlayer( id, supported_types, library )
{
	this.id = id;
	this.supported_types = supported_types;
	this.library = library;
	this.loaded = false;
	this.loading_callbacks = new Array();
	return this;
}
mediaPlayer.prototype = {
	// Id of the mediaPlayer
	id:null,
	
	// Mime types supported by this player
	supported_types:null,
	
	// Player library ie: native, vlc, java etc. 
	library:null,
	
	// Flag stores the mediaPlayer load state
	loaded:false,
		
	/**
	* Checks support for a given MIME type
	*
	* @param {String} type Mime type to check against supported_types
	* @return {Boolean}
	*	true if mime type is supported
	*	false if mime type is unsupported
	*/ 
	supportsMIMEType: function( type ) {
		for ( var i = 0; i < this.supported_types.length; i++ ) {
			if ( this.supported_types[i] == type )
				return true;
		}
		return false;
	},
	
	/**
	* Get the "name" of the player from a predictable msg key
	*/
	getName: function() {
		return gM( 'mwe-embedplayer-ogg-player-' + this.id );
	},
	
	/**
	* Loads the player library & player skin config ( if needed ) and then calls the callback.
	*
	* @param {Function} callback Function to be called once player library is loaded.
	*/	
	load: function( callback ) {			
		//Load player library ( upper case the first letter of the library )
		mw.load( [
			'mw.EmbedPlayer' + this.library[0].toUpperCase() + this.library.substr(1)
		], function() {
			callback();
		} );
	}
}

/** 
* players and supported mime types 
* In an ideal world we would query the  plugin to get what mime
*  types it supports in practice not always reliable/available
* 
* We can't cleanly store these values per library since player library is loaded post player detection
* 
*/

//Flash based players: 

var kplayer = new mediaPlayer('kplayer', ['video/x-flv', 'video/h264'], 'Kplayer');

// Java based player
var cortadoPlayer = new mediaPlayer( 'cortado', ['video/ogg', 'audio/ogg', 'application/ogg'], 'Java' );

// Native html5 players
var oggNativePlayer = new mediaPlayer( 'oggNative', ['video/ogg', 'audio/ogg', 'application/ogg' ], 'Native' );
var h264NativePlayer = new mediaPlayer( 'h264Native', ['video/h264'], 'Native' );
var webmNativePlayer = new mediaPlayer( 'webmNative', ['video/webm'], 'Native' );

// VLC player
var vlcMineList = ['video/ogg', 'audio/ogg', 'application/ogg', 'video/x-flv', 'video/mp4',  'video/h264'];
var vlcPlayer = new mediaPlayer( 'vlc-player', vlcMineList, 'Vlc' );

// Generic plugin
var oggPluginPlayer = new mediaPlayer( 'oggPlugin', ['video/ogg', 'application/ogg'], 'Generic' );

// HTML player for timed display of html content 
var htmlPlayer = new mediaPlayer( 'html', ['text/html', 'image/jpeg', 'image/png', 'image/svg'], 'Html' );


/**
 * mediaPlayers is a collection of mediaPlayer objects supported by the client.
 * @constructor
 */
function mediaPlayers()
{
	this.init();
}

mediaPlayers.prototype =
{
	// The list of players supported
	players : null,
	
	// Store per mime-type prefrences for players
	preference : { },
	
	// Stores the default set of players for a given mime type
	defaultPlayers : { },	
	
	/**
	* Initializartion function sets the default order for players for
	* a given mime type
	*/
	init: function() {
		this.players = new Array();
		this.loadPreferences();
		
		// set up default players order for each library type		
		this.defaultPlayers['video/x-flv'] = ['Kplayer', 'Vlc'];
		this.defaultPlayers['video/h264'] = ['Native', 'Kplayer', 'Vlc'];
		
		this.defaultPlayers['video/ogg'] = ['Native', 'Vlc', 'Java', 'Generic'];
		this.defaultPlayers['application/ogg'] = ['Native', 'Vlc', 'Java', 'Generic'];
		this.defaultPlayers['audio/ogg'] = ['Native', 'Vlc', 'Java' ];
		this.defaultPlayers['video/mp4'] = ['Vlc'];
		
		this.defaultPlayers['text/html'] = ['Html'];
		this.defaultPlayers['image/jpeg'] = ['Html'];
		this.defaultPlayers['image/png'] = ['Html'];
		this.defaultPlayers['image/svg'] = ['Html'];			
					
	},
	
	/**
	* Adds a Player to the player list
	*
	* @param {Object} player Player object to be added	
	*/
	addPlayer: function( player ) {
		for ( var i = 0; i < this.players.length; i++ ) {
			if ( this.players[i].id == player.id ) {
				// Player already found
				return ;
			}
		}
		
		
		// Add the player:
		this.players.push( player );
	},
	
	/**
	 * Checks if a player is supported by id
	 */
	isSupportedPlayer: function( playerId ){
		for( var i=0; i < this.players.length; i++ ){
			if( this.players[i].id == playerId ){
				return true;
			}
		}
		return false;
	},
	
	/**
	* get players that support a given mimeType
	*
	* @param {String} mimeType Mime type of player set
	* @return {Array} 
	*	Array of players that support a the requested mime type
	*/
	getMIMETypePlayers: function( mimeType ) {
		var mimePlayers = new Array();
		var _this = this;		
		if ( this.defaultPlayers[mimeType] ) {
			$j.each( this.defaultPlayers[ mimeType ], function( d, lib ) {
				var library = _this.defaultPlayers[ mimeType ][ d ];
				for ( var i = 0; i < _this.players.length; i++ ) {
					if ( _this.players[i].library == library && _this.players[i].supportsMIMEType( mimeType ) ) {
						mimePlayers.push( _this.players[i] );
					}
				}
			} );
		}
		return mimePlayers;
	},
	
	/**
	* Default player for a given mime type
	*
	* @param {String} mimeType Mime type of the requested player
	* @return 
	*	Player for mime type
	* 	null if no player found
	*/
	defaultPlayer : function( mimeType ) {	
		//mw.log( "get defaultPlayer for " + mimeType );
		var mimePlayers = this.getMIMETypePlayers( mimeType );
		if ( mimePlayers.length > 0 )
		{
			// Check for prior preference for this mime type
			for ( var i = 0; i < mimePlayers.length; i++ ) {
				if ( mimePlayers[i].id == this.preference[mimeType] )
					return mimePlayers[i];
			}
			// Otherwise just return the first compatible player
			// (it will be chosen according to the defaultPlayers list
			return mimePlayers[0];
		}
		//mw.log( 'No default player found for ' + mimeType );
		return null;
	},
	
	/**
	* Sets the format preference.
	*
	* @param {String} mimeFormat Prefered format	 
	*/
	setFormatPreference : function ( mimeFormat ) {
		 this.preference['format_preference'] = mimeFormat;
		 mw.setUserConfig( 'playerPref', this.preference);		 
	},
	
	/**
	* Sets the player preference
	*
	* @param {String} playerId Prefered player id
	* @param {String} mimeType Mime type for the associated player stream
	*/
	setPlayerPreference : function( playerId, mimeType ) {	
		var selectedPlayer = null;		
		for ( var i = 0; i < this.players.length; i++ ) {
			if ( this.players[i].id == playerId ) {
				selectedPlayer = this.players[i];
				mw.log( 'choosing ' + playerId + ' for ' + mimeType );
				this.preference[ mimeType ] = playerId;		
				mw.setUserConfig( 'playerPref', this.preference );
				break;
			}
		}
		// Update All the player instances:		
		if ( selectedPlayer ) {
			var playerList = mw.playerManager.getPlayerList();			 
			for ( var i = 0; i < playerList.length; i++ ) {
				var embed = $j( '#' + playerList[i] ).get( 0 );
				if ( embed.mediaElement.selectedSource && ( embed.mediaElement.selectedSource.mimeType == mimeType ) )
				{
					embed.selectPlayer( selectedPlayer );
					mw.log( 'using ' + embed.selectedPlayer.getName() + ' for ' + embed.mediaElement.selectedSource.getTitle() );
				}
			}
		}
	},
	
	/**
	* Loads the user preference settings from a cookie
	*/	
	loadPreferences : function ( ) { 
		this.preference = { };
		// see if we have a cookie set to a clientSupported type:
		preferenceConfig = mw.getUserConfig( 'playerPref' );
		if( typeof preferenceConfig == 'object' ) {
			this.preference = preferenceConfig;
		}
	}	
};

/**
 * mw.EmbedTypes object handles setting and getting of supported embed types:
 * closely mirrors OggHandler so that its easier to share efforts in this area:
 * http://svn.wikimedia.org/viewvc/mediawiki/trunk/extensions/OggHandler/OggPlayer.js
 */
mw.EmbedTypes = {

	 // List of players supported
	 players: null,
	 
	 // Detect flag for completion 
	 detect_done:false,
	 
	 /**
	 * Runs the detect method and update the detect_done flag
	 * @constructor 
	 */
	 init: function() {
		// detect supported types	
		this.detect();
		this.detect_done = true;
	},
	
	/**
	* If the browsers supports a given mimetype
	* 
	* @param {String} mimeType Mime type for browser plug-in check
	*/
	supportedMimeType: function( mimeType ) {
		for ( var i =0; i < navigator.plugins.length; i++ ) {
			var plugin = navigator.plugins[i];
			if ( typeof plugin[ mimeType ] != "undefined" )
			  return true;
		}
		return false;
	},
	
	/**
	* Detects what plug-ins the client supports 
	*/
	detect: function() {		
		mw.log( "embedPlayer: running detect" );		
		this.players = new mediaPlayers();			
		// every browser supports html rendering:
		this.players.addPlayer( htmlPlayer );
		// In Mozilla, navigator.javaEnabled() only tells us about preferences, we need to
		// search navigator.mimeTypes to see if it's installed	
		var javaEnabled = navigator.javaEnabled();		
		// Some browsers filter out duplicate mime types, hiding some plugins
		var uniqueMimesOnly = $j.browser.opera || $j.browser.safari;
		// Opera will switch off javaEnabled in preferences if java can't be found.
		// And it doesn't register an application/x-java-applet mime type like Mozilla does.
		if ( javaEnabled ) {
			this.players.addPlayer( cortadoPlayer );
		}
		
		// ActiveX plugins
		if ( $j.browser.msie ) {
			// check for flash		 
			if ( this.testActiveX( 'ShockwaveFlash.ShockwaveFlash' ) ) {			
				this.players.addPlayer( kplayer );
				//this.players.addPlayer( flowPlayer );
			}
			 // VLC
			 if ( this.testActiveX( 'VideoLAN.VLCPlugin.2' ) ) {
				 this.players.addPlayer( vlcPlayer );
			 }
				 
			 // Java ActiveX
			 if ( this.testActiveX( 'JavaWebStart.isInstalled' ) ) {
				 this.players.addPlayer( cortadoPlayer );
			 }
			 // quicktime (currently off) 
			 // if ( this.testActiveX( 'QuickTimeCheckObject.QuickTimeCheck.1' ) )
			 //	this.players.addPlayer(quicktimeActiveXPlayer);			 
		 }
		// <video> element
		if ( typeof HTMLVideoElement == 'object' // Firefox, Safari
				|| typeof HTMLVideoElement == 'function' ) // Opera
		{					
			// Test what codecs the native player supports: 
			try {
				var dummyvid = document.createElement( "video" );
				if( dummyvid.canPlayType ) {
					// Add the webm player
					if( dummyvid.canPlayType('video/webm; codecs="vp8, vorbis"') ){
						this.players.addPlayer( webmNativePlayer ); 
					}
										
					// Test for h264:				
					if ( dummyvid.canPlayType('video/mp4; codecs="avc1.42E01E, mp4a.40.2"' ) ) {
						this.players.addPlayer( h264NativePlayer );
					}
					
					//	 Test for ogg
					if (  dummyvid.canPlayType( "video/ogg;codecs=\"theora,vorbis\"" ) ) {
						this.players.addPlayer( oggNativePlayer );						
					// older versions of safari do not support canPlayType,
				   	// but xiph qt registers mimetype via quicktime plugin
					} else if ( this.supportedMimeType( 'video/ogg' ) ) {									
						this.players.addPlayer( oggNativePlayer );
					}
				}
			} catch ( e ) {
				mw.log( 'could not run canPlayType ' + e );
			}		
		}
		
		 // "navigator" plugins
		if ( navigator.mimeTypes && navigator.mimeTypes.length > 0 ) {
			for ( var i = 0; i < navigator.mimeTypes.length; i++ ) {
				var type = navigator.mimeTypes[i].type;
				var semicolonPos = type.indexOf( ';' );
				if ( semicolonPos > -1 ) {
					type = type.substr( 0, semicolonPos );
				}
				// mw.log('on type: '+type);
				var pluginName = navigator.mimeTypes[i].enabledPlugin ? navigator.mimeTypes[i].enabledPlugin.name : '';
				if ( !pluginName ) {
					// In case it is null or undefined
					pluginName = '';
				}
				if ( pluginName.toLowerCase() == 'vlc multimedia plugin' || pluginName.toLowerCase() == 'vlc multimedia plug-in' ) {
					this.players.addPlayer( vlcPlayer );
					continue;
				}
		
				if ( type == 'application/x-java-applet' ) {
					this.players.addPlayer( cortadoPlayer );
					continue;
				}
		
				if ( type == 'application/ogg' ) {
					if ( pluginName.toLowerCase() == 'vlc multimedia plugin' ) {
						this.players.addPlayer( vlcMozillaPlayer );
					// else if ( pluginName.indexOf( 'QuickTime' ) > -1 )
					//	this.players.addPlayer(quicktimeMozillaPlayer);
					} else {
						this.players.addPlayer( oggPluginPlayer );
					}
					continue;
				} else if ( uniqueMimesOnly ) {
					if ( type == 'application/x-vlc-player' ) {
						this.players.addPlayer( vlcMozillaPlayer );
						continue;
					} else if ( type == 'video/quicktime' ) {
						// this.players.addPlayer(quicktimeMozillaPlayer);
						continue;
					}
				}
		
				if ( type == 'application/x-shockwave-flash' ) {
				
					this.players.addPlayer( kplayer );
					//this.players.addPlayer( flowPlayer );
					
					// check version to add omtk:
					if( navigator.plugins["Shockwave Flash"] ){
						var flashDescription = navigator.plugins["Shockwave Flash"].description;
						var descArray = flashDescription.split( " " );
						var tempArrayMajor = descArray[2].split( "." );
						var versionMajor = tempArrayMajor[0];
						// mw.log("version of flash: " + versionMajor);					
					}
					continue;
				}
			}
		}
		
		// Allow extensions to detect and add their own "players" 
		mw.log("trigger::embedPlayerUpdateMediaPlayersEvent");
		$j( mw ).trigger( 'embedPlayerUpdateMediaPlayersEvent' , this.players );		
		
	},
	
	/**
	* Test IE for activeX by name
	*
	* @param {String} name Name of ActiveXObject to look for 
	*/
	testActiveX : function ( name ) {
		mw.log(" test testActiveX: " + name);
		var hasObj = true;
		try {
			// No IE, not a class called "name", it's a variable
			var obj = new ActiveXObject( '' + name );
		} catch ( e ) {
			hasObj = false;
		}
		return hasObj;
	}
};
