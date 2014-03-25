/**
* embedPlayer is the base class for html5 video tag javascript abstraction library
* embedPlayer include a few subclasses:
*
* mediaPlayer Media player embed system ie: java, vlc or native.
* mediaElement Represents source media elements
* mw.PlayerLayoutBuilder Handles skinning of the player controls
*/
( function( mw, $ ) {"use strict";
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
		"volume" : 1,

		// Caches the volume before a mute toggle
		"preMuteVolume" : 1,

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

		// A player error object (Includes title and message)
		// * Used to display an error instead of a play button
		// * The full player api available
		'playerError' : {},

		// A flag to hide the player gui and disable autoplay
		// * Used for empty players or a player where you want to dynamically set sources, then play.
		// * The player API remains active.
		'data-blockPlayerDisplay': null,

		// Use this to offset the presentation time
		"startOffset" : 0,

		// If the download link should be shown
		"downloadLink" : true,

		// Content type of the media
		"type" : null,

		// Should we show ads on replay?
		"adsOnReplay": false,

		// Live stream player?
		"live": false,

		// Is Audio Player (defined in kWidgetSupport)
		"isAudioPlayer": false,

		// Should tooltips be enabled by default?
		"enableTooltips": true,

		//indicates that the current sources list was set by "ReplaceSources" config
		"sourcesReplaced": false,

		"streamerType": 'http'
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


	/**
	 * Base embedPlayer object
	 *
	 * @param {Element}
	 *	  element, the element used for initialization.
	 * @constructor
	 */
	mw.EmbedPlayer = function( element ) {
		return this.init( element );
	};

	mw.EmbedPlayer.prototype = {

		// Plugins instances
		'plugins': {},

		// The mediaElement object containing all mediaSource objects
		'mediaElement' : null,

		// Object that describes the supported feature set of the underling plugin /
		// Support list is described in PlayerLayoutBuilder components
		'supports': { },

		// If the player is done loading ( does not guarantee playability )
		// for example if there is an error playerReadyFlag is still set to true once
		// no more loading is to be done
		'playerReadyFlag' : false,

		// Stores the loading errors
		'loadError' : false,

		// Thumbnail updating flag ( to avoid rewriting an thumbnail thats already
		// being updated)
		'thumbnailUpdatingFlag' : false,

		// Stopped state flag
		'stopped' : true,

		// Local variable to hold CMML meeta data about the current clip
		// for more on CMML see: http://wiki.xiph.org/CMML
		'cmmlData': null,

		// Stores the seek time request, Updated by the seek function
		'serverSeekTime' : 0,

		// If the embedPlayer is current 'seeking'
		'seeking' : false,

		// Percent of the clip buffered:
		'bufferedPercent' : 0,

		// Holds the timer interval function
		'monitorTimerId' : null,

		// Buffer flags
		'bufferStartFlag' : false,
		'bufferEndFlag' : false,

		// For supporting media fragments stores the play end time
		'pauseTime' : null,

		// On done playing
		'donePlayingCount' : 0
		,
		// if player events should be Propagated
		'_propagateEvents': true,

		// If the onDone interface should be displayed
		'onDoneInterfaceFlag': true,

		// if we should check for a loading spinner in the monitor function:
		'_checkHideSpinner' : false,

		// If pause play controls click controls should be active:
		'_playContorls' : true,

		// If player should be displayed (in some caused like audio, we don't need the player to be visible
		'displayPlayer': true,

		// Widget loaded should only fire once
		'widgetLoaded': false,

		// Holds the current player state 
		currentState: null,

		// If the player supports playbackRate ( currently available on some html5 browsers )
		playbackRate: false,

		/**
		 * embedPlayer
		 *
		 * @constructor
		 *
		 * @param {Element}
		 *	  element DOM element that we are building the player interface for.
		 */
		init: function( element ) {
			var _this = this;
			var playerAttributes = mw.getConfig( 'EmbedPlayer.Attributes' );

			// Store the rewrite element tag type
			this.rewriteElementTagName = element.tagName.toLowerCase();

			// Setup the player Interface from supported attributes:
			for ( var attr in playerAttributes ) {
				// We can't use $(element).attr( attr ) because we have to check for boolean attributes:
				if ( element.getAttribute( attr ) != null ) {
					// boolean attributes
					if( element.getAttribute( attr ) == '' ){
						this[ attr ] = true;
					} else {
						this[ attr ] = element.getAttribute( attr );
					}
				} else {
					this[attr] = playerAttributes[attr];
				}
				// string -> boolean
				if( this[ attr ] == "false" ) this[attr] = false;
				if( this[ attr ] == "true" ) this[attr] = true;
			}
			if( ! this.width ){
				this.width = $(element).width()
				$(element).attr('width', this.width)
			}
			if( ! this.height ){
				this.height = $(element).height()
				$(element).attr('height', this.height)
			}

			// Hide "controls" if using native player controls:
			if( this.useNativePlayerControls() ){
				_this.controls = true;
			}
			
			// Set the default skin if unset:
			if ( !this.skinName ) {
				this.skinName = mw.getConfig( 'EmbedPlayer.DefaultSkin' );
			}

			// Support custom monitorRate Attribute ( if not use default )
			if( !this.monitorRate ){
				this.monitorRate = mw.getConfig( 'EmbedPlayer.MonitorRate' );
			}

			// Make sure offset is in float:
			this.startOffset = parseFloat( this.startOffset );

			// Set the source duration
			if ( element.duration ) {
				_this.duration =  element.duration;
			}
			// Add durationHint property form data-durationhint:
			if( _this['data-durationhint']){
				_this.durationHint = _this['data-durationhint'];
			}
			// Update duration from provided durationHint
			if ( _this.durationHint && ! _this.duration){
				_this.duration = mw.npt2seconds( _this.durationHint );
			}

			// Make sure duration is a float:
			this.duration = parseFloat( this.duration );
			mw.log( 'EmbedPlayer::init:' + this.id + ' duration is: ' + this.duration + ', size: ' + $(element).width() + 'x' + $(element).height());

			// Set the playerElementId id
			this.pid = 'pid_' + this.id;

			// Add the mediaElement object with the elements sources:
			this.mediaElement = new mw.MediaElement( element );
		},		
		/**
		 * Bind helpers to help iOS retain bind context
		 *
		 * Yes, iOS will fail when you run $( embedPlayer ).bind()
		 * but "work" when you run embedPlayer.bind() if the script urls are from diffrent "resources"
		 */
		bindHelper: function( name, callback ){
			$( this ).bind( name, callback );
			return this;
		},
		unbindHelper: function( bindName ){
			if( bindName ) {
				$( this ).unbind( bindName );
			}
			return this;
		},
		triggerQueueCallback: function( name, callback ){
			$( this ).triggerQueueCallback( name, callback );
		},
		triggerHelper: function( name, obj ){
			try{
				$( this ).trigger( name, obj );
			} catch( e ){
				// ignore try catch calls
				mw.log( "EmbedPlayer:: possible error in trigger: " + name + " " + e.toString() );
			}
		},

		addPlayerStateChangeBindings: function(){
			var _this = this;
			var bindPostfix = '.stateManager';

			var getStatesCssClasses = function(){
				var classes = '';
				var states = [ 'start', 'load', 'play', 'pause', 'end' ];
				$.each(states, function( idx, state ){
					var space = (states.length-1 == idx) ? '' : ' ';
					classes += state +'-state' + space;
				});
				return classes;
			};

			var eventStateMap = {
				'playerReady': 'start',
				'onplay': 'load',
				'playing': 'play',
				'onPauseInterfaceUpdate': 'pause',
				'onEndedDone': 'end',
				'preSeek': 'load',
				'seeked': function(){
					return _this.isPlaying() ? 'play' : 'pause';
				}
			};

			var doChangeState = function( newState ) {
				// Only update if new
				if( newState !== _this.currentState ) {
					var oldState = _this.currentState;
					_this.currentState = newState;
					_this.getInterface().removeClass( getStatesCssClasses() ).addClass( newState + '-state' );
					$( _this ).trigger( 'onPlayerStateChange', [ newState, oldState ] );
				}
			};
			
			// Unbind events
			this.unbindHelper( bindPostfix );

			// Bind to player events
			$.each(eventStateMap, function( eventName, state ){
				_this.bindHelper( eventName + bindPostfix, function(){
					var stateString = ( typeof state === 'function' ) ? state() : state;
					doChangeState( stateString );
				});
			});

			// Set default state to load
			if(!this.currentState){
				doChangeState( 'load' );
			}
		},

		/**
		 * Stop events from Propagation and blocks interface updates and trigger events.
		 * @return
		 */
		stopEventPropagation: function(){
			mw.log("EmbedPlayer:: stopEventPropagation");
			this.stopMonitor();
			this._propagateEvents = false;
		},

		/**
		 * Restores event propagation
		 * @return
		 */
		restoreEventPropagation: function(){
			mw.log("EmbedPlayer:: restoreEventPropagation");
			this.startMonitor();
			this._propagateEvents = true;
		},

		// Plugins defined and registered in mw.PluginManager class
		getPluginInstance: function( pluginName ){
			if( !this.plugins[ pluginName ] ){
				mw.log('EmbedPlayer:: getPluginInstance: plugin "' + pluginName + '" not initialsed.');
				return;
			}
			return this.plugins[ pluginName ];
		},

		enableNativeControls: function(){
			mw.log('Error: function enableNativeControls should be implemented by embed player interface ');
			return;
		},

		/**
		 * Enables the play controls ( for example when an ad is done )
		 */
		enablePlayControls: function( excludedComponents ){
			if ( this._playContorls || this.useNativePlayerControls() ) {
				return;
			}

			mw.log("EmbedPlayer:: enablePlayControls" );
			excludedComponents = excludedComponents || [];

			this._playContorls = true;
			$( this ).trigger( 'onEnableInterfaceComponents', [ excludedComponents ]);
		},

		/**
		 * Disables play controls, for example when an ad is playing back
		 */
		disablePlayControls: function( excludedComponents ){
			if ( ! this._playContorls || this.useNativePlayerControls() ) {
				return;
			}
			mw.log("EmbedPlayer:: disablePlayControls" );
			excludedComponents = excludedComponents || [];

			this._playContorls = false;
			$( this ).trigger( 'onDisableInterfaceComponents', [ excludedComponents ] );
		},

		/**
		 * For plugin-players to update supported features
		 */
		updateFeatureSupport: function(){
			mw.log("EmbedPlayer::updateFeatureSupport trigger: updateFeatureSupportEvent");
			$( this ).trigger('updateFeatureSupportEvent', this.supports );
			return ;
		},
		/**
		* Apply Intrinsic Aspect ratio of a given image to a poster image layout
		*/
		applyIntrinsicAspect: function(){
			// Check if a image thumbnail is present:
			var $img = this.getInterface().find( '.playerPoster' );
			if( $img.length ){
				var pHeight = this.getVideoDisplay().height();
				// Check for intrinsic width and maintain aspect ratio
				var pWidth = parseInt( $img.naturalWidth() / $img.naturalHeight() * pHeight);
				var pClass = 'fill-height';
				if( pWidth > this.getVideoDisplay().width() ){
					pClass = 'fill-width';
				}
				$img.removeClass('fill-width fill-height').addClass(pClass);
				
			}
		},
		/**
		 * Set the width & height from css style attribute, element attribute, or by
		 * default value if no css or attribute is provided set a callback to
		 * resize.
		 *
		 * Updates this.width & this.height
		 *
		 * @param {Element}
		 *	element Source element to grab size from
		 */
		loadPlayerSize: function( element ) {
			// check for direct element attribute:
			this.height = element.height > 0 ? element.height + '' : $(element).css( 'height' );
			this.width = element.width > 0 ? element.width + '' : $(element).css( 'width' );

			// Special check for chrome 100% with re-mapping to 32px
			// Video embed at 32x32 will have to wait for intrinsic video size later on
			if( this.height == '32px' || this.height =='32px' ){
				this.width = '100%';
				this.height = '100%';
			}
			mw.log('EmbedPlayer::loadPlayerSize: css size:' + this.width + ' h: '  + this.height);

			// Set to parent size ( resize events will cause player size updates)
			if( this.height.indexOf('100%') != -1 || this.width.indexOf('100%') != -1 ){
				var $relativeParent = $(element).parents().filter(function() {
					 // reduce to only relative position or "body" elements
					 return $( this ).is('body') || $( this ).css('position') == 'relative';
				}).slice(0,1); // grab only the "first"
				this.width = $relativeParent.width();
				this.height = $relativeParent.height();
			}
			// Make sure height and width are a number
			this.height = parseInt( this.height );
			this.width = parseInt( this.width );

			// Set via attribute if CSS is zero or NaN and we have an attribute value:
			this.height = ( this.height==0 || isNaN( this.height )
					&& $(element).attr( 'height' ) ) ?
							parseInt( $(element).attr( 'height' ) ): this.height;
			this.width = ( this.width == 0 || isNaN( this.width )
					&& $(element).attr( 'width' ) )?
							parseInt( $(element).attr( 'width' ) ): this.width;


			// Special case for audio

			// Firefox sets audio height to "0px" while webkit uses 32px .. force zero:
			if( this.isAudio() && this.height == '32' ) {
				this.height = 20;
			}

			// Use default aspect ration to get height or width ( if rewriting a non-audio player )
			if( this.isAudio() && this.videoAspect ) {
				var aspect = this.videoAspect.split( ':' );
				if( this.height && !this.width ) {
					this.width = parseInt( this.height * ( aspect[0] / aspect[1] ) );
				}
				if( this.width && !this.height ) {
					var apectRatio = ( aspect[1] / aspect[0] );
					this.height = parseInt( this.width * ( aspect[1] / aspect[0] ) );
				}
			}

			// On load sometimes attr is temporally -1 as we don't have video metadata yet.
			// or in IE we get NaN for width height
			//
			// NOTE: browsers that do support height width should set "waitForMeta" flag in addElement
			if( ( isNaN( this.height )|| isNaN( this.width ) ) ||
				( this.height == -1 || this.width == -1 ) ||
					// Check for firefox defaults
					// Note: ideally firefox would not do random guesses at css
					// values
					( (this.height == 150 || this.height == 64 ) && this.width == 300 )
				) {
				var defaultSize = mw.getConfig( 'EmbedPlayer.DefaultSize' ).split( 'x' );
				if( isNaN( this.width ) ){
					this.width = defaultSize[0];
				}

				// Special height default for audio tag ( if not set )
				if( this.isAudio() ) {
					this.height = 20;
				}else{
					this.height = defaultSize[1];
				}
			}
		},

		/**
		 * Get the player pixel width not including controls
		 *
		 * @return {Number} pixel height of the video
		 */
		getPlayerWidth: function() {
			if( mw.getConfig('EmbedPlayer.IsIframeServer') ){
				return $(window).width();
			}
			return this.getVideoHolder().width();
		},

		/**
		 * Get the player pixel height not including controls
		 *
		 * @return {Number} pixel height of the video
		 */
		getPlayerHeight: function() {
			return this.getVideoHolder().height();
		},

		/**
		 * Check player for sources. If we need to get media sources form an
		 * external file that request is issued here
		 */
		checkPlayerSources: function() {
			mw.log( 'EmbedPlayer::checkPlayerSources: ' + this.id );
			var _this = this;
			// Allow plugins to listen to a preCheckPlayerSources ( for registering the source loading point )
			$( _this ).trigger( 'preCheckPlayerSources' );

			// Allow plugins to block on sources lookup ( cases where we just have an api key for example )
			$( _this ).triggerQueueCallback( 'checkPlayerSourcesEvent', function(){
				_this.setupSourcePlayer();
			});
		},

		/**
		 * Get text tracks from the mediaElement
		 */
		getTextTracks: function(){
			if( !this.mediaElement ){
				return [];
			}
			return this.mediaElement.getTextTracks();
		},
		/**
		 * Empty the player sources
		 */
		emptySources: function(){
			if( this.mediaElement ){
				this.mediaElement.sources = [];
				this.mediaElement.selectedSource = null;
			}
			// setup pointer to old source:
			this.prevPlayer = this.selectedPlayer;
			// don't null out the selected player on empty sources
			//this.selectedPlayer =null;
		},

		/**
		 * Switch and play a video source
		 *
		 * Checks if the target source is the same playback mode and does player switch if needed.
		 * and calls playerSwitchSource
		 */
		switchPlaySource: function( source, switchCallback, doneCallback ){
			var _this = this;
			var targetPlayer =  mw.EmbedTypes.getMediaPlayers().defaultPlayer( source.mimeType );
			if( targetPlayer.library != this.selectedPlayer.library ){
				this.selectPlayer ( targetPlayer );
				this.updatePlaybackInterface( function(){
					_this.playerSwitchSource( source, switchCallback, doneCallback );
				});
			} else {
				// Call the player switch directly:
				_this.playerSwitchSource( source, switchCallback, doneCallback );
			}
		},
		/**
		 * abstract function  player interface must support actual source switch
		 */
		playerSwitchSource: function( source, switchCallback, doneCallback  ){
			mw.log( "Error player interface must support actual source switch");
		},
		/**
		* replace current mediaElement sources with the given sources
		*/
		replaceSources: function( sources ) {
			var _this = this;
			this.emptySources();
			$.each( sources, function( inx, source ){
				_this.mediaElement.tryAddSource( source );
			});
			$( this ).trigger( 'sourcesReplaced' );
		},

		/**
		* Hide the player from the screen and disable events listeners
		**/
		disablePlayer: function(){ 
			mw.log( "Error player interface must support actual disablePlayer");
		},

		/**
		 * Set up the select source player
		 *
		 * issues autoSelectSource call
		 *
		 * Sets load error if no source is playable
		 */
		setupSourcePlayer: function() {
			var _this = this;
			mw.log("EmbedPlayer::setupSourcePlayer: " + this.id + ' sources: ' + this.mediaElement.sources.length );
			// Setup player state manager
			this.addPlayerStateChangeBindings();
			// Check for source replace configuration:
			if( mw.getConfig('EmbedPlayer.ReplaceSources' ) ){
				this.replaceSources( mw.getConfig('EmbedPlayer.ReplaceSources' ));
				this.sourcesReplaced = true;
				mw.setConfig('EmbedPlayer.ReplaceSources' ,  null ); 
			} else {
				this.sourcesReplaced = false;
			}
			// Autoseletct the media source
			this.mediaElement.autoSelectSource();

			// Auto select player based on default order
			if( this.mediaElement.selectedSource ){
				//currently only kplayer can handle other streamerTypes
				if ( !mw.getConfig( 'EmbedPlayer.IgnoreStreamerType') && this.streamerType != 'http' && mw.EmbedTypes.getMediaPlayers().isSupportedPlayer( 'kplayer' ) ) {
					this.selectPlayer( mw.EmbedTypes.getKplayer() );
				} else {
					this.selectPlayer( mw.EmbedTypes.getMediaPlayers().defaultPlayer( this.mediaElement.selectedSource.mimeType ));
				}

				// Check if we need to switch player rendering libraries:
				if ( this.selectedPlayer && ( !this.prevPlayer || this.prevPlayer.library != this.selectedPlayer.library ) ) {
					// Disable the current player
					this.disablePlayer();
					// Inherit the playback system of the selected player:
					this.updatePlaybackInterface();
					/*
					** After updatePlaybackInterface call the current player 
					** will be replaced with new one and setup method should 
					** restore the player to screen
					*/

					// updatePlaybackInterface will trigger 'playerReady'
					return ;
				}
			}

			// Check if no player is selected
			if( !this.selectedPlayer || !this.mediaElement.selectedSource ){
				var errorObj;
				//check if we had silverlight flavors and no silverlight installed - prompt to install silverlight
				if ( !mw.isMobileDevice() && !mw.EmbedTypes.getMediaPlayers().isSupportedPlayer( 'splayer' ) ) {
					$.each( this.mediaElement.sources, function( currentIndex, currentSource ) {
						if( currentSource.getFlavorId() == "ism" ){
							errorObj = _this.getKalturaMsgObject( 'mwe-embedplayer-install-silverlight' );
							return;
						}
					});
				}
				if ( !errorObj ) {
					this.showPlayerError();
				} else {
					this.showErrorMsg( errorObj );
				}
				mw.log( "EmbedPlayer:: setupSourcePlayer > player ready ( but with errors ) ");
			} else {
				// Trigger layout ready event
				$( this ).trigger( 'layoutReady' );
			}
			// We still do the playerReady sequence on errors to provide an api
			// and player error events
			this.playerReadyFlag = true;
			// Trigger the player ready event;
			$( this ).trigger( 'playerReady' );
			this.triggerWidgetLoaded();
		},

		/**
		 * Updates the player interface
		 *
		 * Loads and inherit methods from the selected player interface.
		 *
		 * @param {Function}
		 *	  callback Function to be called once playback-system has been
		 *	  inherited
		 */
		updatePlaybackInterface: function( callback ) {
			var _this = this;
			mw.log( "EmbedPlayer::updatePlaybackInterface: duration is: " + this.getDuration() + ' playerId: ' + this.id );
			// Clear out any non-base embedObj methods:
			if ( this.instanceOf ) {
				// Update the prev instance var used for swiching interfaces to know the previous instance.
				$( this ).data( 'previousInstanceOf', this.instanceOf );
				var tmpObj = mw[ 'EmbedPlayer' + this.instanceOf ];
				var attributes = mw.getConfig( 'EmbedPlayer.Attributes' );
				for ( var i in tmpObj ) {
					// don't update attributes valuse
					if( i in attributes ){
						continue;
					}
					// Restore parent into local location
					if ( typeof this[ 'parent_' + i ] != 'undefined' ) {
						this[i] = this[ 'parent_' + i];
					} else {
						this[i] = null;
					}
				}
			}
			// Set up the new embedObj
			this.selectedPlayer.load( function() {
				mw.log( 'EmbedPlayer::updatePlaybackInterface: loaded ' + _this.selectedPlayer.library  + ' duration: ' + _this.getDuration() );
				_this.updateLoadedPlayerInterface( callback );
				// Trigger PlayerLoaded event
				$( _this ).trigger( 'PlayerLoaded' );
			});

		
		},
		/**
		 * Update a loaded player interface by setting local methods to the
		 * updated player prototype methods
		 *
		 * @parma {function}
		 * 		callback function called once player has been loaded
		 */
		updateLoadedPlayerInterface: function( callback ){
			var _this = this;
			mw.log( 'EmbedPlayer::updateLoadedPlayerInterface ' + _this.selectedPlayer.library + " player loaded for: " + _this.id );
			// Get embed library player Interface
			var playerInterface = mw[ 'EmbedPlayer' + _this.selectedPlayer.library ];

			// Build the player interface ( if the interface includes an init )
			if( playerInterface.init ){
				playerInterface.init();
			}

			for ( var method in playerInterface ) {
				if ( typeof _this[method] != 'undefined' && !_this['parent_' + method] ) {
					_this['parent_' + method] = _this[method];
				}
				_this[ method ] = playerInterface[ method ];
			}

			var runPlayerStartupMethods = function(){
				// Update feature support
				_this.updateFeatureSupport();
				// Update embed sources:
				_this.embedPlayerHTML();
				// Update duration
				_this.getDuration();
				// show player inline
				_this.showPlayer();
				// Run the callback if provided
				if ( $.isFunction( callback ) ){
					callback();
				}				
			};
			if( _this.setup ){
				_this.setup( runPlayerStartupMethods );
			} else {
				runPlayerStartupMethods();
			}
		},

		/**
		 * Select a player playback system
		 *
		 * @param {Object}
		 *	  player Player playback system to be selected player playback
		 *	  system include vlc, native, java etc.
		 */
		selectPlayer: function( player ) {
			mw.log("EmbedPlayer:: selectPlayer " + player.id );
			var _this = this;
			if ( ! this.selectedPlayer || this.selectedPlayer.id != player.id ) {
				if ( this.selectedPlayer ){
					this.clean();
				}
				this.selectedPlayer = player;
			}
		},
		clean:function(){
			//override by the selected player - we'll call it when selecting a new player
		},
		/**
		 * Get the duration of the embed player
		 */
		getDuration: function() {
			if ( isNaN(this.duration)  &&  this.mediaElement && this.mediaElement.selectedSource &&
				 typeof this.mediaElement.selectedSource.durationHint != 'undefined' ){
				this.duration = this.mediaElement.selectedSource.durationHint;
			}
			return this.duration;
		},

		/**
		 * Get the player height
		 */
		getHeight: function() {
			return this.getInterface().height();
		},

		/**
		 * Get the player width
		 */
		getWidth: function(){
			return this.getInterface().width();
		},

		/**
		 * Check if the selected source is an audio element:
		 */
		isAudio: function(){
			return ( this.rewriteElementTagName == 'audio'
					||
					( this.mediaElement && this.mediaElement.selectedSource && this.mediaElement.selectedSource.mimeType.indexOf('audio/') !== -1 )
					||
					this.isAudioPlayer
			);
		},

		/**
		 * Get the plugin embed html ( should be implemented by embed player interface )
		 */
		embedPlayerHTML: function() {
			return 'Error: function embedPlayerHTML should be implemented by embed player interface ';
		},

		/**
		 * Seek function ( should be implemented by embedPlayer interface
		 * playerNative, playerKplayer etc. ) embedPlayer seek only handles URL
		 * time seeks
		 * @param {Float}
		 * 			percent of the video total length to seek to
		 * @param {bollean} 
		 * 			stopAfterSeek if the player should stop after the seek
		 */
		seek: function( percent, stopAfterSeek ) {
			var _this = this;
			this.seeking = true;
			// Trigger preSeek event for plugins that want to store pre seek conditions.
			$( this ).trigger( 'preSeek', percent );

			// Do argument checking:
			if( percent < 0 ){
				percent = 0;
			}

			if( percent > 1 ){
				percent = 1;
			}
			// set the playhead to the target position
			this.updatePlayHead( percent );

			// See if we should do a server side seek ( player independent )
			if ( this.supportsURLTimeEncoding() ) {
				mw.log( 'EmbedPlayer::seek:: updated serverSeekTime: ' + mw.seconds2npt ( this.serverSeekTime ) +
						' currentTime: ' + _this.currentTime );
				// make sure we need to seek:
				if( _this.currentTime == _this.serverSeekTime ){
					return ;
				}

				this.stop();
				this.didSeekJump = true;
				// Make sure this.serverSeekTime is up-to-date:
				this.serverSeekTime = mw.npt2seconds( this.startNpt ) + parseFloat( percent * this.getDuration() );
			}
			// Run the onSeeking interface update
			// NOTE layoutBuilder should really bind to html5 events rather
			// than explicitly calling it or inheriting stuff.
			this.layoutBuilder.onSeek();
		},

		/**
		 * Seeks to the requested time and issues a callback when ready (should be
		 * overwritten by client that supports frame serving)
		 */
		setCurrentTime: function( time, callback ) {
			mw.log( 'Error: EmbedPlayer, setCurrentTime not overriden' );
			if( $.isFunction( callback ) ){
				callback();
			}
		},
		setDuration: function( newDuration ){
			this.duration = newDuration;
			$( this ).trigger( 'durationChange', [newDuration] );
		},

		/**
		 * On clip done action. Called once a clip is done playing
		 * TODO clean up end sequence flow
		 */
		triggeredEndDone: false,
		postSequenceFlag: false,
		onClipDone: function() {
			var _this = this;
			// Don't run onclipdone if _propagateEvents is off
			if( !_this._propagateEvents ){
				return ;
			}
			mw.log( 'EmbedPlayer::onClipDone: propagate:' +  _this._propagateEvents + ' id:' +
					this.id + ' doneCount:' + this.donePlayingCount + ' stop state:' + this.isStopped() );

			// Only run stopped once:
			if( !this.isStopped() ){
				// set the "stopped" flag:
				this.stopped = true;

				// TOOD we should improve the end event flow
				// First end event for ads or current clip ended bindings
				if( ! this.onDoneInterfaceFlag ){
					this.stopEventPropagation();
				}

				mw.log("EmbedPlayer:: trigger: ended ( inteface continue pre-check: " + this.onDoneInterfaceFlag + ' )' );
				$( this ).trigger( 'ended' );
				mw.log("EmbedPlayer::onClipDone:Trigged ended, continue? " + this.onDoneInterfaceFlag);

				if( ! this.onDoneInterfaceFlag ){
					// Restore events if we are not running the interface done actions
					 this.restoreEventPropagation();
					 return ;
				}

				// A secondary end event for playlist and clip sequence endings
				if( this.onDoneInterfaceFlag ){
					// We trigger two end events to match KDP and ensure playbackComplete always comes before  playerPlayEnd
					// in content ends.
					mw.log("EmbedPlayer:: trigger: playbackComplete");
					$( this ).trigger( 'playbackComplete' );
					// now trigger postEnd for( playerPlayEnd )
					mw.log("EmbedPlayer:: trigger: postEnded");
					$( this ).trigger( 'postEnded' );
				}
				// if the ended event did not trigger more timeline actions run the actual stop:
				if( this.onDoneInterfaceFlag ){
					mw.log("EmbedPlayer::onDoneInterfaceFlag=true do interface done");

					// Update the clip done playing count ( for keeping track of replays )
					_this.donePlayingCount++;
					if( _this.loop ) {
						// Prevent the native "onPlay" event from propagating that happens when we rewind:
						this.stopEventPropagation();						
						// Rewind the player to the start:
						// NOTE: Setting to 0 causes lags on iPad when replaying, thus setting to 0.01
						var startTime = 0.01;
						if( this.startOffset ){
							startTime = this.startOffset;
						}
						this.setCurrentTime(startTime, function(){
							// Set to stopped state:
							_this.stop();

							// Restore events after we rewind the player
							mw.log("EmbedPlayer::onClipDone:Restore events after we rewind the player");
							_this.restoreEventPropagation();

                            // fix for streaming
                            if (_this.streamerType == 'hdnetwork'){
                                setTimeout(function(){
                                    _this.play();
                                },100);
                            }else{
                                _this.play();
                            }

							return;
						});
					} else {
						// make sure we are in a paused state.
						_this.stop();
						// An event for once the all ended events are done.
						mw.log("EmbedPlayer:: trigger: onEndedDone");
						if ( !_this.triggeredEndDone ){
							_this.triggeredEndDone = true;
							_this.ignoreNextNativeEvent = true;
							$( _this ).trigger( 'onEndedDone' );
						}
					}
				}
			}
            // display thumbnail upon movie end if showThumbnailOnEnd Flashvar is set to true
            if (mw.getConfig('showThumbnailOnEnd')){
                this.updatePosterHTML();
            }
		},

		replay: function(){
			var _this = this;
			var startTime = 0.01;
			// Needed to exit current scope of the player and make sure replay happend
			setTimeout(function(){
				if( _this.startOffset ){
					startTime = _this.startOffset;
				}
				_this.stopEventPropagation();
				_this.setCurrentTime(startTime, function(){
					// Restore events after we rewind the player
					mw.log("EmbedPlayer::onClipDone:Restore events after we rewind the player");
					_this.restoreEventPropagation();

					_this.play();
					return;
				});
			},10);
		},

		/**
		 * Shows the video Thumbnail, updates pause state
		 */
		showThumbnail: function() {
			var _this = this;
			mw.log( 'EmbedPlayer::showThumbnail::' + this.stopped );

			// Close Menu Overlay:
			this.layoutBuilder.closeMenuOverlay();

			// update the thumbnail html:
			this.updatePosterHTML();

			this.paused = true;
			this.stopped = true;
			// Make sure the layoutBuilder bindings are up-to-date
			this.layoutBuilder.addControlBindings();

			// Once the thumbnail is shown run the mediaReady trigger (if not using native controls)
			if( !this.useNativePlayerControls() ){
				mw.log("mediaLoaded");
				$( this ).trigger( 'mediaLoaded' );
			}
		},

		addControls: function(){
			// Add controls if enabled:
			if ( this.controls ) {
				this.layoutBuilder.addControls();
			}
		},
		/**
		 * Show the player
		 */
		showPlayer: function () {
			mw.log( 'EmbedPlayer:: showPlayer: ' + this.id + ' interace: w:' + this.width + ' h:' + this.height );
			var _this = this;
			// Remove the player loader spinner if it exists
			this.hideSpinner();
			// If a isPersistentNativePlayer ( overlay the controls )
			if( !this.useNativePlayerControls() && this.isPersistentNativePlayer() ){
				$( this ).show();
			}
			this.addControls();
			// Update Thumbnail for the "player"
			this.updatePosterHTML();

			// Do we need to show the player?
			if( this.displayPlayer === false ) {
				_this.getVideoHolder().hide();
				_this.getInterface().height( _this.layoutBuilder.getComponentsHeight() );
			}
			// Update layout
			this.doUpdateLayout();

			// Update the playerReady flag
			this.playerReadyFlag = true;
			mw.log("EmbedPlayer:: Trigger: playerReady");
			// trigger the player ready event;
			$( this ).trigger( 'playerReady' );
			this.triggerWidgetLoaded();

			// Check if we want to block the player display
			if( this['data-blockPlayerDisplay'] ){
				this.blockPlayerDisplay();
				return ;
			}

			// Check if there are any errors to be displayed:
			if( this.getError() ){
				this.showErrorMsg( this.getError() );
				return ;
			}
			// Auto play stopped ( no playerReady has already started playback ) and if not on an iPad with iOS > 3
			if ( this.isStopped() && this.autoplay && this.canAutoPlay() ) {
				mw.log( 'EmbedPlayer::showPlayer::Do autoPlay' );
				_this.play();
			}
		},

		/**
		 * Returns true if the device can auto play; else false
		 * should be overwiten by playback plugin
		 */
		canAutoPlay: function(){
			return false;
		},

		doUpdateLayout: function( skipTrigger ) {
			// Set window height if in iframe:
			var containerHeight = this.getInterface().height();
			var newHeight = containerHeight - this.layoutBuilder.getComponentsHeight();
			var currentHeight = this.getVideoHolder().height();
			var deltaHeight = Math.abs( currentHeight-newHeight );
			mw.log( 'EmbedPlayer: doUpdateLayout:: containerHeight: ' + 
					containerHeight + ', components: ' + this.layoutBuilder.getComponentsHeight() + 
					', videoHolder old height: ' + currentHeight + ', new height: ' + newHeight + 
					' hight delta: ' + deltaHeight );
			// Update videoHolder height if more than 1 px delta 
			// ( somehow we are hitting the weird iOS resize bug issues again ) 
			if( currentHeight !== newHeight && deltaHeight > 1  ) {
				this.getVideoHolder().height( newHeight );
			}
			// update image layout: (Don't update poster during ad)
			if( this.isStopped() && !( this.sequenceProxy && this.sequenceProxy.isInSequence ) ) {
				this.updatePosterHTML();
			}

			if( ! skipTrigger && deltaHeight != 1 ){
				mw.log( 'EmbedPlayer: updateLayout: trigger "updateLayout" ' );
				this.triggerHelper('updateLayout');
			}
		},
		/**
		 * Gets a reference to the main player interface, builds if not available
		 */
		getInterface: function(){
			if( !this.$interface ){
				var _this = this;
				// init the control builder
				this.layoutBuilder = new mw.PlayerLayoutBuilder( this );
				this.$interface = this.layoutBuilder.getInterface();

				// add a binding for window resize if we are in an iframe
				if( mw.getConfig('EmbedPlayer.IsIframeServer') ){
					$(window).off("debouncedresize").on("debouncedresize", function() {
						mw.log( 'debouncedresize:: call doUpdateLayout' );
						_this.doUpdateLayout();
					});
				}
			}
			return this.$interface;
		},
		/**
		 * Update the player interface size
		 */
		updateInterfaceSize: function( size ){
			var oldH = this.getInterface().height();
			var oldW = this.getInterface().width();
			if( size.width != oldW || size.height != oldH ){
				this.getInterface().css( size );
				this.doUpdateLayout( true );
			}
		},

		/**
		 * Sets an error message on the player
		 *
		 * @param {string}
		 *			errorMsg
		 */
		setError: function( errorObj ){
			var _this = this;
			if ( typeof errorObj == 'string' ) {
				this.playerError = {
					'title' : _this.getKalturaMsg( 'ks-GENERIC_ERROR_TITLE' ),
					'message' : errorObj
				}
				return ;

			}
			this.playerError = errorObj;
		},

		/**
		 * Gets the current player error
		 */
		getError: function() {
			if ( !$.isEmptyObject( this.playerError ) ) {
				return this.playerError;
			}
			return null;
		},

		/**
		 * Show an error message on the player
		 *
		 * @param {object}
		 *			errorObj
		 */
		showErrorMsg: function( errorObj ){
			// Remove a loading spinner
			this.hideSpinner();
			// clear change media flag
			this.changeMediaStarted = false;
			if( this.layoutBuilder ) {
				if( mw.getConfig("EmbedPlayer.ShowPlayerAlerts") ) {
					var alertObj = $.extend( errorObj, {
						'isModal': true,
						'keepOverlay': true,
						'noButtons': true,
						'isError': true
					} );
	 				this.layoutBuilder.displayAlert( alertObj );
				}
			}
			return ;
		},

		/**
		 * Blocks the player display by invoking an empty error msg
		 */
		blockPlayerDisplay: function(){
			//this.showErrorMsg();
			this.getInterface().find( '.error' ).hide();
		},

		/**
		 * Get missing plugin html (check for user included code)
		 *
		 * @param {String}
		 *			[misssingType] missing type mime
		 */
		showPlayerError: function( ) {
			var _this = this;
			var $this = $( this );
			mw.log("EmbedPlayer::showPlayerError");
			// Hide loader
			this.hideSpinner();

			// Error in loading media ( trigger the mediaLoadError )
			$this.trigger( 'mediaLoadError' );

			// We don't distinguish between mediaError and mediaLoadError right now
			// TODO fire mediaError only on failed to receive audio/video  data.
			$this.trigger( 'mediaError' );

			// Check if we want to block the player display ( no error displayed )
			if( this['data-blockPlayerDisplay'] ){
				this.blockPlayerDisplay();
				return ;
			}

			// Check if there is a more specific error:
			if( this.getError() ){
				this.showErrorMsg( this.getError() );
				return ;
			}

			// If no error is given assume missing sources:
			this.showNoInlinePlabackSupport();
		},

		isLinkPlayerFlag: false,
		isLinkPlayer: function(){
			return this.isLinkPlayerFlag;
		},

		/**
		 * Show player missing sources method
		 */
		showNoInlinePlabackSupport: function(){
			var _this = this;
			var $this = $( this);

			// Check if any sources are avaliable:
			if( this.mediaElement.sources.length == 0
				||
				!mw.getConfig('EmbedPlayer.NotPlayableDownloadLink') )
			{
				// Show missing sources error if we have entry id
				if( this.kentryid ) {
					this.showNoPlayableSources();
				}
				return ;
			}

			// Set the isLink player flag:
			this.isLinkPlayerFlag = true;
			// Update the poster and html:
			this.updatePosterHTML();
			// Draw controls
			this.addControls();

			// By default set the direct download url to the first source.
			var downloadUrl = this.mediaElement.sources[0].getSrc();
			// Allow plugins to update the download url ( to point to server side tools to select
			// stream based on user agent ( i.e IE8 h.264 file, blackberry 3gp file etc )
			this.triggerHelper( 'directDownloadLink', function( dlUrl ){
				if( dlUrl ){
					downloadUrl = dlUrl;
				}
			});

			$( this ).trigger( 'showInlineDownloadLink', [downloadUrl] );
		},
		/**
		 * Show no playable sources error:
		 */
		showNoPlayableSources: function(){
			var $this = $( this );
			var errorObj = this.getKalturaMsgObject( 'mwe-embedplayer-missing-source' );

			// Support no sources custom error msg:
			$this.trigger( 'NoSourcesCustomError', function( customErrorMsg ){
				if( customErrorMsg){
					errorObj.message = customErrorMsg;
				}
			});
			// set the error object:
			this.setError( errorObj );
			// Add the no sources error:
			this.showErrorMsg( errorObj );
			return ;
		},


		/**
		 * Update Thumb time with npt formated time
		 *
		 * @param {String}
		 *	  time NPT formated time to update thumbnail
		 */
		updateThumbTimeNPT: function( time ) {
			this.updateThumbTime( mw.npt2seconds( time ) - parseInt( this.startOffset ) );
		},

		/**
		 * Update the thumb with a new time
		 *
		 * @param {Float}
		 *	  floatSeconds Time to update the thumb to
		 */
		updateThumbTime:function( floatSeconds ) {
			// mw.log('updateThumbTime:'+floatSeconds);
			var _this = this;
			if ( typeof this.orgThumSrc == 'undefined' ) {
				this.orgThumSrc = this.poster;
			}
			if ( this.orgThumSrc.indexOf( 't=' ) !== -1 ) {
				this.lastThumbUrl = mw.replaceUrlParams( this.orgThumSrc,
					{
						't' : mw.seconds2npt( floatSeconds + parseInt( this.startOffset ) )
					}
				);
				if ( !this.thumbnailUpdatingFlag ) {
					this.updatePoster( this.lastThumbUrl , false );
					this.lastThumbUrl = null;
				}
			}
		},

		/**
		 * Updates the displayed thumbnail via percent of the stream
		 *
		 * @param {Float}
		 *	  percent Percent of duration to update thumb
		 */
		updateThumbPerc:function( percent ) {
			return this.updateThumbTime( ( this.getDuration() * percent ) );
		},

		/**
		 * Update the poster source
		 * @param {String}
		 * 		posterSrc Poster src url
		 */
		updatePoster: function( posterSrc, alt ){
			if( ! posterSrc ) {
				posterSrc = mw.getConfig( 'EmbedPlayer.BlackPixel' );
			}
			this.poster = posterSrc;
			this.posterAlt = alt || gM('mwe-embedplayer-video-thumbnail');
			this.updatePosterHTML();
		},

		/**
		 * Called after sources are updated, and your ready for the player to change media
		 * @return
		 */
		changeMedia: function( callback ){
			var _this = this;
			var $this = $( this );

			mw.log( 'EmbedPlayer:: changeMedia ');
			// Empty out embedPlayer object sources
			this.emptySources();
			// remove thumb during switch: 
			this.removePoster();

			// onChangeMedia triggered at the start of the change media commands
			$this.trigger( 'onChangeMedia' );

			// Reset first play to true, to count that play event
			this.firstPlay = true;
			// reset donePlaying count on change media.
			this.donePlayingCount = 0;
			this.triggeredEndDone = false;
			this.preSequenceFlag = false;
			this.postSequenceFlag = false;

			// Add a loader to the embed player:
			this.pauseLoading();

			// Stop the monitor
			this.stopMonitor();

			// reset the current time, buffering and playhead position
			this.resetPlaybackValues();

			// Clear out any player error ( both via attr and object property ):
			this.setError( null );

			//	Clear out any player display blocks
			this['data-blockPlayerDisplay'] = null
			$this.attr( 'data-blockPlayerDisplay', '');

			// Clear out the player error div:
			this.getInterface().find('.error').remove();
			this.layoutBuilder.closeAlert();
			this.layoutBuilder.closeMenuOverlay();

			//If we are change playing media add a ready binding:
			var bindName = 'playerReady.changeMedia';
			$this.unbind( bindName ).bind( bindName, function(){
				mw.log('EmbedPlayer::changeMedia playerReady callback');
				// hide the loading spinner:
				_this.hideSpinner();
				// check for an error on change media:
				if( _this.getError() ){
					// Reset changeMediaStarted flag
					_this.changeMediaStarted = false;
					if ( _this.playlist ) {
						// Allow user to move to next/previous entries
						_this.playlist.enablePrevNext();
						_this.playlist.addClipBindings();
						_this.layoutBuilder.closeAlert();
					}
					_this.showErrorMsg( _this.getError() );
					return ;
				}

				var changeMediaDoneCallback = function(){
					// Reset changeMediaStarted flag
					_this.changeMediaStarted = false;

					// reload the player
					if( _this.autoplay ){
						_this.play();
					}

					$this.trigger( 'onChangeMediaDone' );
					if( callback ) {
						callback();
					}
				};

				if( $.isFunction(_this.changeMediaCallback) ){
					_this.changeMediaCallback( changeMediaDoneCallback );
				} else {
					changeMediaDoneCallback();
				}
			});

			// Load new sources per the entry id via the checkPlayerSourcesEvent hook:
			$this.triggerQueueCallback( 'checkPlayerSourcesEvent', function(){
				mw.log( "EmbedPlayer::changeMedia:  Done with checkPlayerSourcesEvent" );
				// Start player events leading to playerReady
				_this.setupSourcePlayer();
			});
		},
		/**
		 * Checks if the current player / configuration is an image play screen:
		 */
		isImagePlayScreen:function(){
			return ( this.useNativePlayerControls() &&
				!this.isLinkPlayer() &&
				mw.isIphone() &&
				mw.getConfig( 'EmbedPlayer.iPhoneShowHTMLPlayScreen')
			);
		},
		/**
		 * Checks if the current player / configuration is an playlist screen:
		 */
		isPlaylistScreen:function(){
			return !( typeof this.playlist == "undefined" );
		},
		/**
		 * Triggers widgetLoaded event - Needs to be triggered only once, at the first time playerReady is trigerred
		 */
		triggerWidgetLoaded: function() {
			if ( !this.widgetLoaded ) {
				this.widgetLoaded = true;
				mw.log( "EmbedPlayer:: Trigger: widgetLoaded");
				this.triggerHelper( 'widgetLoaded' );
			}
		},

		/**
		 * Updates the poster HTML
		 */
		updatePosterHTML: function () {
			mw.log( 'EmbedPlayer:updatePosterHTML:' + this.id  + ' poster:' + this.poster );
			var _this = this;

            if( this.isImagePlayScreen() ){
				this.addPlayScreenWithNativeOffScreen();
				return ;
			}

			// Set by black pixel if no poster is found:
			var posterSrc = this.poster;
			var posterCss = {};
			if( !posterSrc ){
				posterSrc = mw.getConfig( 'EmbedPlayer.BlackPixel' );
				posterCss = {
					'position': 'absolute',
					'height' : '100%',
					'width' : '100%'
				};
			}

			$( this ).empty();
            // for IE8 and IE7 - add specific class
            if (mw.isIE8() || mw.isIE7()){
                $( this ).addClass("mwEmbedPlayerTransparent");
            }
			$( this ).html(
				$( '<img />' )
				.css( posterCss )
				.attr({
					'alt' : this.posterAlt,
					'src' : this.poster
				})
				.addClass( 'playerPoster' )
				.load(function(){
					_this.applyIntrinsicAspect();
				})
			).show();
		},
		/**
		 * Remove the poster
		 */
		removePoster: function(){
			$( this ).find( '.playerPoster' ).remove();
		},
		/**
		 * Abstract method, must be set by player interface
		 */
		addPlayScreenWithNativeOffScreen: function(){
			mw.log( "Error: EmbedPlayer, Must override 'addPlayScreenWithNativeOffScreen' with player inteface" );
			return ;
		},
		/**
		 * Checks if native controls should be used
		 *
		 * @returns boolean true if the mwEmbed player interface should be used
		 *	 false if the mwEmbed player interface should not be used
		 */
		useNativePlayerControls: function() {
			if( this.usenativecontrols === true ){
				return true;
			}

			if( mw.getConfig('EmbedPlayer.NativeControls') === true ) {
				return true;
			}

		   if( mw.getConfig( "EmbedPlayer.ForceNativeComponent") ){
			   return false;
		   }

			// Do some device detection devices that don't support overlays
			// and go into full screen once play is clicked:
			if( (mw.isAndroidNativeBrowser() || mw.isIphone()) ){
				return true;
			}

			// iPad can use html controls if its a persistantPlayer in the dom before loading )
			// else it needs to use native controls:
			if( mw.isIpad() ){
				if( this.isPersistentNativePlayer() && mw.getConfig('EmbedPlayer.EnableIpadHTMLControls') === true){
					return false;
				} else {
					// Set warning that your trying to do iPad controls without
					// persistent native player:
					return true;
				}
			}
			return false;
		},
		/**
		 * Checks if the native player is persistent in the dom since the intial page build out.
		 */
		isPersistentNativePlayer: function(){
			if( this.isLinkPlayer() ){
				return false;
			}
			// Since we check this early on sometimes the player
			// has not yet been updated to the pid location
			if( $('#' + this.pid ).length == 0 ){
				return $('#' + this.id ).hasClass('persistentNativePlayer');
			}
			return $('#' + this.pid ).hasClass('persistentNativePlayer');
		},

		/**
		* Checks if the browser supports overlays and the controlsOverlay is
		* set to true for the player or via config
		*/
		isOverlayControls: function(){
			// if the player "supports" overlays:
			if( ! this.supports['overlays'] ){
				return false;
			}

			// If disabled via the player
			if( this.overlaycontrols === false ){
				return false;
			}

			// Don't overlay controls if in audio mode:
			if( this.isAudio() ){
				return false;
			}

			// If the config is false
			if( mw.getConfig( 'EmbedPlayer.OverlayControls' ) === false){
				return false;
			}

			if( this.controls === false ){
				return false;
			}

			// Past all tests OverlayControls is true:
			return true;
		},		

		getVideoHolder: function() {
			return this.getInterface().find('.videoHolder');
		},

		getVideoDisplay: function(){
			return this.getInterface().find('.videoDisplay');
		},

		/**
		 * Abstract method,
		 * Get native player html ( should be set by mw.EmbedPlayerNative )
		 */
		getNativePlayerHtml: function(){
			return $('<div />' )
				.css( 'width', this.getWidth() )
				.html( 'Error: Trying to get native html5 player without native support for codec' );
		},

		/**
		 * Should be set via native embed support
		 */
		applyMediaElementBindings: function(){
			mw.log("Warning applyMediaElementBindings should be implemented by player interface" );
			return ;
		},

		/**
		 * Gets code to embed the player remotely for "share" this player links
		 */
		getSharingEmbedCode: function() {
			switch( mw.getConfig( 'EmbedPlayer.ShareEmbedMode' ) ){
				case 'iframe':
					return this.getShareIframeObject();
				break;
				case 'videojs':
					return this.getShareEmbedVideoJs();
				break;
			}
		},

		/**
		 * Get the iframe share code:
		 */
		getShareIframeObject: function(){
			// TODO move to getShareIframeSrc
			var iframeUrl = this.getIframeSourceUrl();

			// Set up embedFrame src path
			var embedCode = '&lt;iframe src=&quot;' + mw.html.escape( iframeUrl ) + '&quot; ';

			// Set width / height of embed object
			embedCode += 'width=&quot;' + this.getPlayerWidth() +'&quot; ';
			embedCode += 'height=&quot;' + this.getPlayerHeight() + '&quot; ';
			embedCode += 'allowfullscreen webkitallowfullscreen mozAllowFullScreen ';
			embedCode += 'frameborder=&quot;0&quot; ';

			// Close up the embedCode tag:
			embedCode+='&gt;&lt/iframe&gt;';

			// Return the embed code
			return embedCode;
		},
		/**
		 * Gets the iframe source url
		 */
		getIframeSourceUrl: function(){
			var iframeUrl = false;
			this.triggerHelper( 'getShareIframeSrc', function( localIframeSrc ){
				if( iframeUrl){
					mw.log("Error multiple modules binding getShareIframeSrc" );
				}
				iframeUrl = localIframeSrc;
			});
			if( iframeUrl ){
				return iframeUrl;
			}
			// old style embed:
			var iframeUrl = mw.getMwEmbedPath() + 'mwEmbedFrame.php?';
			var params = {'src[]' : []};

			// Output all the video sources:
			for( var i=0; i < this.mediaElement.sources.length; i++ ){
				var source = this.mediaElement.sources[i];
				if( source.src ) {
					params['src[]'].push(mw.absoluteUrl( source.src ));
				}
			}
			// Output the poster attr
			if( this.poster ){
				params.poster = this.poster;
			}

			// Set the skin if set to something other than default
			if( this.skinName ){
				params.skin = this.skinName;
			}

			if( this.duration ) {
				params.durationHint = parseFloat( this.duration );
			}
			iframeUrl += $.param( params );
			return iframeUrl;
		},
		/**
		 * Get the share embed Video tag html to share the embed code.
		 */
		getShareEmbedVideoJs: function(){

			// Set the embed tag type:
			var embedtag = ( this.isAudio() )? 'audio': 'video';

			// Set up the mwEmbed js include:
			var embedCode = '&lt;script type=&quot;text/javascript&quot; ' +
						'src=&quot;' +
						mw.html.escape(
							mw.absoluteUrl(
								mw.getMwEmbedSrc()
							)
						) + '&quot;&gt;&lt;/script&gt' +
						'&lt;' + embedtag + ' ';

			if( this.poster ) {
				embedCode += 'poster=&quot;' +
					mw.html.escape( mw.absoluteUrl( this.poster ) ) +
					'&quot; ';
			}

			// Set the skin if set to something other than default
			if( this.skinName ){
				embedCode += 'class=&quot;' +
					mw.html.escape( this.skinName ) +
					'&quot; ';
			}

			if( this.duration ) {
				embedCode +='durationHint=&quot;' + parseFloat( this.duration ) + '&quot; ';
			}

			if( this.width || this.height ){
				embedCode += 'style=&quot;';
				embedCode += ( this.width )? 'width:' + this.width +'px;': '';
				embedCode += ( this.height )? 'height:' + this.height +'px;': '';
				embedCode += '&quot; ';
			}

			// Close the video attr
			embedCode += '&gt;';

			// Output all the video sources:
			for( var i=0; i < this.mediaElement.sources.length; i++ ){
				var source = this.mediaElement.sources[i];
				if( source.src ) {
					embedCode +='&lt;source src=&quot;' +
						mw.absoluteUrl( source.src ) +
						'&quot; &gt;&lt;/source&gt;';
				}
			}
			// Close the video tag
			embedCode += '&lt;/video&gt;';

			return embedCode;
		},

		isInSequence: function(){
			return (this.sequenceProxy && this.sequenceProxy.isInSequence);
		},

		/**
		 * Base Embed Controls
		 */

		/**
		 * The Play Action
		 *
		 * Handles play requests, updates relevant states:
		 * seeking =false
		 * paused =false
		 *
		 * Triggers the play event
		 *
		 * Updates pause button Starts the "monitor"
		 */
		firstPlay : true,
		preSequenceFlag: false,
		inPreSequence: false,
		replayEventCount : 0,
		play: function() {
			var _this = this;
			var $this = $( this );

			// Store the absolute play time ( to track native events that should not invoke interface updates )
			mw.log( "EmbedPlayer:: play: " + this._propagateEvents + ' isStopped: ' +  _this.isStopped() );
			this.absoluteStartPlayTime =  new Date().getTime();

			// Ignore play request if player error is displayed: 
			if ( this.getError() ) {
				return false;
			}

			// Check if thumbnail is being displayed and embed html
			if ( _this.isStopped() && (_this.preSequenceFlag == false || (_this.sequenceProxy && _this.sequenceProxy.isInSequence == false) )) {
				if ( !_this.selectedPlayer ) {
					_this.showPlayerError();
					return false;
				} else {
					_this.embedPlayerHTML();
				}
			}
	
			// put a loading spiner on the player while pre-sequence or playing starts up
			this.addPlayerSpinner();
			this.hideSpinnerOncePlaying();
			
			// playing, exit stopped state:
			_this.stopped = false;

			if( !this.preSequenceFlag ) {
				this.preSequenceFlag = true;
				mw.log( "EmbedPlayer:: trigger preSequence " );
				this.triggerHelper( 'preSequence' );
				this.playInterfaceUpdate();
				// if we entered into ad loading return
				if(  _this.sequenceProxy && _this.sequenceProxy.isInSequence ){
					mw.log("EmbedPlayer:: isInSequence, do NOT play content");
					return false;
				}
			}

			// Remove any poster div ( that would overlay the player )
            if (!this.isAudioPlayer){
			    this.removePoster();
            }

			// We need first play event for analytics purpose
			if( this.firstPlay && this._propagateEvents) {
				this.firstPlay = false;
				this.triggerHelper( 'firstPlay' );
			}

			if( this.paused === true ){
				this.paused = false;
				// Check if we should Trigger the play event
				mw.log("EmbedPlayer:: trigger play event::" + !this.paused + ' events:' + this._propagateEvents );
				// trigger the actual play event:
				if(  this._propagateEvents  ) {
					this.triggerHelper( 'onplay' );
				}
			}

			// If we previously finished playing this clip run the "replay hook"
			if( this.donePlayingCount > 0 && !this.paused && this._propagateEvents ) {
				this.replayEventCount++;
				// Trigger end done on replay
				this.triggeredEndDone = false;
				if( this.replayEventCount <= this.donePlayingCount){
					mw.log("EmbedPlayer::play> trigger replayEvent");
					this.triggerHelper( 'replayEvent' );
				}
			}

			this.addStartTimeCheck();

			this.playInterfaceUpdate();
			// If play controls are enabled continue to video content element playback:
			if( _this._playContorls ){
				return true;
			} else {
				mw.log( "EmbedPlayer::play: _playContorls is false" );
				// return false ( Mock play event, or handled elsewhere )
				return false;
			}
		},

		addStartTimeCheck: function(){
			var _this = this;
			if( this.startTime ){
				$( this ).bind('playing.startTime', function(){
					$( _this ).unbind('playing.startTime');
					// If we have start time defined, start playing from that point
					if( _this.currentTime < _this.startTime ) {
						if( !mw.isIOS() ){
							_this.setCurrentTime( _this.startTime );
							_this.startTime = 0;
						} else {
							// iPad seeking on syncronus play event sucks
							setTimeout( function(){
								_this.setCurrentTime( _this.startTime, function(){
									_this.play();
								});
								_this.startTime = 0;
							}, 500 )
						}
					}
				});				
			}
		},

		/**
		 * Update the player inteface for playback
		 * TODO move to layoutBuilder
		 */
		playInterfaceUpdate: function(){
			var _this = this;
			mw.log( 'EmbedPlayer:: playInterfaceUpdate' );
			// Hide any overlay:
			if( this.layoutBuilder ){
				this.layoutBuilder.closeMenuOverlay();
			}
			// Hide any buttons or errors  if present:
			this.getInterface().find( '.error' ).remove();

			this.hideSpinnerOncePlaying();

			// trigger on play interface updates:
			$( this ).trigger( 'onComponentsHoverEnabled' );
			$( this ).trigger( 'onPlayInterfaceUpdate' );
		},
		/**
		 * Pause player, and display a loading animation
		 * @return
		 */
		pauseLoading: function(){
			this.isPauseLoading = true;
			this.pause();
			this.addPlayerSpinner();
		},
		/**
		 * Adds a loading spinner to the player.
		 * 	
		 */
		addPlayerSpinner: function(){
			var sId = 'loadingSpinner_' + this.id;
			$( this ).trigger( 'onAddPlayerSpinner' );
			// remove any old spinner
			$( '#' + sId ).remove();
			// re add an absolute positioned spinner:
			$( this ).getAbsoluteOverlaySpinner()
			.attr( 'id', sId );
		},
		hideSpinner: function(){
			// remove the spinner
			$( '#loadingSpinner_' + this.id + ',.loadingSpinner' ).remove();
		},
		/**
		 * Hides the loading spinner
		 */
		hideSpinnerAndPlayBtn: function(){
			this.isPauseLoading = false;
			this.hideSpinner();
		},
		/**
		 * Hides the loading spinner once playing.
		 */
		hideSpinnerOncePlaying: function(){
			this._checkHideSpinner = true;
		},
		/**
		 * Base embed pause Updates the play/pause button state.
		 *
		 * There is no general way to pause the video must be overwritten by embed
		 * object to support this functionality.
		 *
		 * @param {Boolean} if the event was triggered by user action or propagated by js.
		 */
		pause: function() {
			mw.log("EmbedPlayer::pause()");
			var _this = this;
			// Trigger the pause event if not already paused and using native controls:
			if( this.paused === false ){
				this.paused = true;
				if( this._propagateEvents ){
					mw.log( 'EmbedPlayer:trigger pause:' + this.paused );
					// we only trigger "onpause" to avoid event propagation to the native object method
					// i.e in jQuery ( this ).trigger('pause') also calls: this.pause();
					$( this ).trigger( 'onpause' );
				}
			}
			_this.pauseInterfaceUpdate();
		},
		/**
		 * Sets the player interface to paused mode.
		 */
		pauseInterfaceUpdate: function(){
			var _this =this;
			mw.log("EmbedPlayer::pauseInterfaceUpdate");
			// don't display a loading spinner if paused: 
			this.hideSpinner();
			// trigger on pause interface updates
			$( this ).trigger( 'onComponentsHoverDisabled' );
			$( this ).trigger( 'onPauseInterfaceUpdate' );
		},
		/**
		 * Maps the html5 load request. There is no general way to "load" clips so
		 * underling plugin-player libs should override.
		 */
		load: function() {
			// should be done by child (no base way to pre-buffer video)
			mw.log( 'Waring:: the load method should be overided by player interface' );
		},


		/**
		 * Base embed stop
		 *
		 * Updates the player to the stop state.
		 *
		 * Shows Thumbnail
		 * Resets Buffer
		 * Resets Playhead slider
		 * Resets Status
		 *
		 * Trigger the "doStop" event
		 */
		stop: function() {
			var _this = this;
			mw.log( 'EmbedPlayer::stop:' + this.id );
			// update the player to stopped state:
			this.stopped = true;

			// Rest the prequecne flag:
			if( this.adsOnReplay ) {
				this.preSequenceFlag = false;
			}

			// Trigger the stop event:
			$( this ).trigger( 'doStop' );

			// no longer seeking:
			this.didSeekJump = false;
			this.stopMonitor();

			// pause playback ( if playing )
			if( !this.paused ){
				this.pause();
			}
			this.resetPlaybackValues();
		},

		resetPlaybackValues: function(){
			// Reset current time and prev time and seek offset
			this.currentTime = this.previousTime = this.serverSeekTime = 0;
			// reset buffer status
			this.updateBufferStatus( 0 );
			this.updatePlayHead( 0 );
		},
	

		togglePlayback: function(){
			if( this.paused ){
				this.play();
			} else {
				this.pause();
			}
		},
		isMuted: function(){
			return this.muted;
		},

		/**
		 * Base Embed mute
		 *
		 * Handles interface updates for toggling mute. Plug-in / player interface
		 * must handle the actual media player action
		 */
		toggleMute: function() {
			mw.log( 'EmbedPlayer::toggleMute> (old state:) ' + this.muted );
			if ( this.muted ) {
				this.muted = false;
				var percent = this.preMuteVolume;
			} else {
				this.muted = true;
				this.preMuteVolume = this.volume;
				var percent = 0;
			}
			// Change the volume and trigger the volume change so that other plugins can listen.
			this.setVolume( percent, true );
			// trigger the onToggleMute event
			$( this ).trigger('onToggleMute', [ percent ]);
		},

		/**
		 * Update volume function ( called from interface updates )
		 *
		 * @param {float}
		 *	  percent Percent of full volume
		 * @param {triggerChange}
		 * 		boolean change if the event should be triggered
		 */
		setVolume: function( percent, triggerChange ) {
			var _this = this;
			// ignore NaN percent:
			if( isNaN( percent ) ){
				return ;
			}
			// Set the local volume attribute
			this.previousVolume = this.volume;

			// Do not trigger change if no change was made
			if( this.previousVolume == percent ) {
				triggerChange = false;
			}

			this.volume = percent;

			// Un-mute if setting positive volume
			if( percent != 0 ){
				this.muted = false;
			}

			// Update the playerElement volume
			this.setPlayerElementVolume( percent );
			//mw.log("EmbedPlayer:: setVolume:: " + percent + ' trigger volumeChanged: ' + triggerChange );
			if( triggerChange ){
				$( _this ).trigger('volumeChanged', percent );
			}
		},

		/**
		 * Abstract method Update volume Method must be override by plug-in / player interface
		 *
		 * @param {float}
		 * 		percent Percentage volume to update
		 */
		setPlayerElementVolume: function( percent ) {
			mw.log('Error player does not support volume adjustment' );
		},

		/**
		 * Abstract method get volume Method must be override by plug-in / player interface
		 * (if player does not override we return the abstract player value )
		 */
		getPlayerElementVolume: function(){
			// mw.log(' error player does not support getting volume property' );
			return this.volume;
		},

		/**
		 * Abstract method  get volume muted property must be overwritten by plug-in /
		 * player interface (if player does not override we return the abstract
		 * player value )
		 */
		getPlayerElementMuted: function(){
			// mw.log(' error player does not support getting mute property' );
			return this.muted;
		},

		/**
		 * Passes a fullscreen request to the layoutBuilder interface
		 */
		toggleFullscreen: function() {
			this.layoutBuilder.fullScreenManager.toggleFullscreen();
		},

		/**
		 * Abstract method to be run post embedding the player Generally should be
		 * overwritten by the plug-in / player
		 */
		postEmbedActions: function() {
			return ;
		},

		/**
		 * Checks the player state based on thumbnail display & paused state
		 *
		 * @return {Boolean} true if playing false if not playing
		 */
		isPlaying: function() {
			if ( this.stopped || this.paused ) {
				return false;
			}
			return true;
		},

		/**
		 * Get Stopped state
		 *
		 * @return {Boolean} true if stopped false if playing
		 */
		isStopped: function() {
			return this.stopped;
		},
		/**
		 * Stop the play state monitor
		 */
		stopMonitor: function(){
			clearInterval( this.monitorInterval );
			this.monitorInterval = 0;
		},
		/**
		 * Start the play state monitor
		 */
		startMonitor: function(){
			this.monitor();
		},

		/**
		 * Monitor playback and update interface components. underling player classes
		 *  are responsible for updating currentTime
		 */
		monitor: function() {
			var _this = this;

			// Check for current time update outside of embed player
			_this.syncCurrentTime();

//			mw.log( "monitor:: " + this.currentTime + ' propagateEvents: ' +  _this._propagateEvents );
			
			// Keep volume proprties set outside of the embed player in sync
			_this.syncVolume();

			// Make sure the monitor continues to run as long as the video is not stoped
			_this.syncMonitor()

			if( _this._propagateEvents ){

				if ( ! _this.seeking ) {
					this.updatePlayheadStatus();
				}


				// mw.log('trigger:monitor:: ' + this.currentTime );
				$( _this ).trigger( 'monitorEvent' );

				// Trigger the "progress" event per HTML5 api support
				if( _this.progressEventData ) {
					$( _this ).trigger( 'progress', _this.progressEventData );
				}
			}
		},
		/**
		 * Sync the monitor function
		 */
		syncMonitor: function(){
			var _this = this;
			// Call monitor at this.monitorRate interval.
			// ( use setInterval to avoid stacking monitor requests )
			if( ! this.isStopped() ) {
				if( !this.monitorInterval ){
					this.monitorInterval = setInterval( function(){
						if( _this.monitor )
							_this.monitor();
					}, this.monitorRate );
				}
			} else {
				// If stopped "stop" monitor:
				this.stopMonitor();
			}
		},

		/**
		 * Sync the video volume
		 */
		syncVolume: function(){
			var _this = this;
			// Update the previous volume
			_this.previousVolume = _this.volume;

			// Update the volume from the player element
			_this.volume = this.getPlayerElementVolume();

			// update the mute state from the player element
			if( _this.muted != _this.getPlayerElementMuted() && ! _this.isStopped() ){
				mw.log( "EmbedPlayer::syncVolume: muted does not mach embed player" );
				_this.toggleMute();
				// Make sure they match:
				_this.muted = _this.getPlayerElementMuted();
			}
		},

		/**
		 * Checks if the currentTime was updated outside of the getPlayerElementTime function
		 */
		syncCurrentTime: function(){
			var _this = this;

			// Hide the spinner once we have time update:
			if( _this._checkHideSpinner && _this.getPlayerElementTime() && _this.currentTime != _this.getPlayerElementTime() ){
				_this._checkHideSpinner = false;
				_this.hideSpinner();
			}

			// Check if a javascript currentTime change based seek has occurred
			if( parseInt( _this.previousTime ) != parseInt( _this.currentTime ) &&
					!this.userSlide &&
					!this.seeking &&
					!this.isStopped()
			){
				// If the time has been updated and is in range issue a seek
				if( _this.getDuration() && _this.currentTime <= _this.getDuration() ){
					var seekPercent = _this.currentTime / _this.getDuration();
					mw.log("EmbedPlayer::syncCurrentTime::" + _this.previousTime + ' != ' +
							 _this.currentTime + " javascript based currentTime update to " +
							 seekPercent + ' == ' + _this.currentTime );
					_this.previousTime = _this.currentTime;
					this.seek( seekPercent );
				}
			}

			// Update currentTime via embedPlayer
			_this.currentTime = _this.getPlayerElementTime();
			// Update any offsets from server seek
			if( _this.serverSeekTime && _this.supportsURLTimeEncoding() ){
				_this.currentTime = parseInt( _this.serverSeekTime ) + parseInt( _this.getPlayerElementTime() );
			}

			// Update the previousTime ( so we can know if the user-javascript changed currentTime )
			_this.previousTime = _this.currentTime;

			// Check for a pauseTime to stop playback in temporal media fragments
			if( _this.pauseTime && _this.currentTime >  _this.pauseTime ){
				_this.pause();
				_this.pauseTime = null;
			}
		},
		/**
		 * Updates the player time and playhead position based on currentTime
		 */
		updatePlayheadStatus: function(){
			var _this = this;

			if ( this.currentTime >= 0 && this.duration ) {
				if ( !this.userSlide && !this.seeking ) {
					var playHeadPercent = ( this.currentTime - this.startOffset ) / this.duration;
					this.updatePlayHead( playHeadPercent );
				}
				// Check if we are "done"
				var endPresentationTime = this.duration;
				if ( !this.isLive() && ( (this.currentTime - this.startOffset) >= endPresentationTime && !this.isStopped() ) ) {
					mw.log( "EmbedPlayer::updatePlayheadStatus > should run clip done :: " + this.currentTime + ' > ' + endPresentationTime );
					_this.onClipDone();
				}
			}
		},

		/**
		 * Abstract getPlayerElementTime function
		 */
		getPlayerElementTime: function(){
			mw.log("Error: getPlayerElementTime should be implemented by embed library");
		},

		/**
		 * Abstract getPlayerElementTime function
		 */
		getPlayerElement: function(){
			mw.log("Error: getPlayerElement should be implemented by embed library, or you may be calling this event too soon");
		},

		/**
		 * Update the Buffer status based on the local bufferedPercent var
		 */
		updateBufferStatus: function( percent ) {
			//mw.log('EmbedPlayer::updateBufferStatus %:' + this.bufferedPercent );
			// Update the buffer progress bar (if available )
			if ( percent > 1 ){
				this.bufferedPercent = 1;
			} else {
				this.bufferedPercent = percent;
			}
			$( this ).trigger( 'updateBufferPercent', this.bufferedPercent );

			// if we have not already run the buffer start hook
			if( this.bufferedPercent > 0 && !this.bufferStartFlag ) {
				this.bufferStartFlag = true;
				mw.log("EmbedPlayer::bufferStart");
				$( this ).trigger( 'bufferStartEvent' );
			}

			// if we have not already run the buffer end hook
			if( this.bufferedPercent == 1 && !this.bufferEndFlag ){
				this.bufferEndFlag = true;
				$( this ).trigger( 'bufferEndEvent' );
			}
		},

		/**
		 * Update the player playhead
		 *
		 * @param {Float}
		 *	  perc Value between 0 and 1 for position of playhead
		 */
		updatePlayHead: function( perc ) {
			$( this ).trigger('updatePlayHeadPercent', perc);
		},


		/**
		 * Helper Functions for selected source
		 */

		/**
		 * Get the current selected media source or first source
		 *
		 * @param {Number}
		 *			Requested time in seconds to be passed to the server if the
		 *			server supports supportsURLTimeEncoding
		 * @return src url
		 */
		getSrc: function( serverSeekTime ) {
			if( serverSeekTime ){
				this.serverSeekTime = serverSeekTime;
			}
			if( this.currentTime && !this.serverSeekTime){
				this.serverSeekTime = this.currentTime;
			}

			// No media element we can't return src
			if( !this.mediaElement ){
				return false;
			}

			// If no source selected auto select the source:
			if( !this.mediaElement.selectedSource ){
				this.mediaElement.autoSelectSource();
			};

			// Return selected source:
			if( this.mediaElement.selectedSource ){
				// See if we should pass the requested time to the source generator:
				if( this.supportsURLTimeEncoding() ){
					// get the first source:
					return this.mediaElement.selectedSource.getSrc( this.serverSeekTime );
				} else {
					return this.mediaElement.selectedSource.getSrc();
				}
			}
			// No selected source return false:
			return false;
		},
		/**
		 * Return the currently selected source
		 */
		getSource: function(){
			// update the current selected source:
			this.mediaElement.autoSelectSource();
			return this.mediaElement.selectedSource;
		},
		/**
		 * Static helper to get media sources from a set of videoFiles
		 *
		 * Uses mediaElement select logic to chose a
		 * video file among a set of sources
		 *
		 * @param videoFiles
		 * @return
		 */
		getCompatibleSource: function( videoFiles ){
			// Convert videoFiles json into HTML element:
			// TODO mediaElement should probably accept JSON
			var $media = $('<video />');
			$.each(videoFiles, function( inx, source){
				$media.append(
					$('<source />').attr(source) 
				);
				mw.log("EmbedPlayer::getCompatibleSource: add " + source.src + ' of type:' + source.type );
			});
			var myMediaElement =  new mw.MediaElement( $media[0] );
			var source = myMediaElement.autoSelectSource();
			if( source ){
				mw.log("EmbedPlayer::getCompatibleSource: " + source.getSrc());
				return source;
			}
			mw.log("Error:: could not find compatible source");
			return false;
		},
		/**
		 * If the selected src supports URL time encoding
		 *
		 * @return {Boolean} true if the src supports url time requests false if the
		 *		 src does not support url time requests
		 */
		supportsURLTimeEncoding: function() {
			var timeUrls = mw.getConfig('EmbedPlayer.EnableURLTimeEncoding') ;
			if( timeUrls == 'none' ){
				return false;
			} else if( timeUrls == 'always' ){
				return this.mediaElement.selectedSource.URLTimeEncoding;
			} else if( timeUrls == 'flash' ){
				if( this.mediaElement.selectedSource && this.mediaElement.selectedSource.URLTimeEncoding){
					// see if the current selected player is flash:
					return ( this.instanceOf == 'Kplayer' );
				}
			} else {
				mw.log("Error:: invalid config value for EmbedPlayer.EnableURLTimeEncoding:: " + mw.getConfig('EmbedPlayer.EnableURLTimeEncoding') );
			}
			return false;
		},
		/**
		 * If alertForCookies flashvar exists:
		 *		If allowCookies cookie is set - Allow cookies
		 *		Otherwise, let the user choose and update the cookie
		 * Else allow cookies (Default)
		 */
		setCookie: function( name, value, options ) {
			var _this = this;
			if( !mw.getConfig( 'alertForCookies' ) ){
				$.cookie( name, value, options );
				return ;
			}
			if( $.cookie( 'allowCookies' ) ) {
				$.cookie( name, value, options );
				return ;
			} 
			// Display alert letting the user to allow/disallow cookies
			var alertObj = {
				'title': "Cookies",
				'message': "Video player will save cookies on your computer",
				'isModal': true,
				'isExternal': false,
				'buttons': [ "Allow", "Disallow" ],
				'callbackFunction': function( eventObj ) {
					if ( eventObj.target.textContent.toLowerCase() === "allow" ) {
						$.cookie( 'allowCookies', true );
						$.cookie( name, value, options );
					}
					else {
						$.cookie( 'allowCookies', null );
						_this.disabledCookies = true;
					}
				}
			};
			if ( !this.disabledCookies ) {
				this.layoutBuilder.displayAlert( alertObj );
			}
		},
		
		setLive: function( isLive ) {
			this.live = isLive;
		},

		isLive: function() {
			return this.live;
		},
		
		isDVR: function() {
			return this.kalturaPlayerMetaData[ 'dvrStatus' ];
		},

		disableComponentsHover: function(){
			this.triggerHelper( 'onComponentsHoverDisabled' );
		},
		restoreComponentsHover: function(){
			this.triggerHelper( 'onComponentsHoverEnabled' );
		},
		/**
		 * @param value string containing comma seperated tags
		 * @oaram givenTags array of strings, representing different tags
		 * @return boolean true if at least one of the given tags exists in the given value.
		 */
		checkForTags: function ( value , givenTags ) {
			if ( typeof value === 'undefined' ) {
				return false;
			}
			var valueTags = value.split(",");
			if ( typeof valueTags === 'undefined' || typeof givenTags === 'undefined' ) {
				return false;
			}

			for ( var i = 0; i < valueTags.length ; i++ ) {
				for (var j = 0; j < givenTags.length; j++ ) {
					if ( valueTags[i] == givenTags[j] ) {
						return true;
					}
				}
			}	
			return false;
		},
		/**
		* Return the media element sources, filtered by the "flavorTags" flashvar value
		*/
		getSourcesByTags: function( flavorTags ) {
			var _this = this;
			var sources = this.mediaElement.getPlayableSources();
			var sourcesByTags = [];
			//no filter required
			if ( flavorTags === undefined ) {
				return sources;
			} else {
				var flavorTagsArr = flavorTags.split(',');
				for ( var i = 0; i < flavorTagsArr.length; i++ ) {
					$.each( sources, function( sourceIndex, source ) {
						if ( _this.checkForTags( source.getTags(), [flavorTagsArr[i]] )) {
							sourcesByTags.push ( source );
						}
					});
					//if we found at least one matching flavor, don't check the next tag
					if ( sourcesByTags.length > 0) {
						break;
					}
				}
				return sourcesByTags;
			}
		},
		switchSrc: function( source ){
			var _this = this;
			this.mediaElement.setSource( source );
			if( ! this.isStopped() ){
				// Get the exact play time from the video element ( instead of parent embed Player )
				var oldMediaTime = this.getPlayerElement().currentTime;
				var oldPaused =  this.paused;
				// Do a live switch
				this.playerSwitchSource( source, function( vid ){
					// issue a seek
					_this.setCurrentTime( oldMediaTime, function(){
						// reflect pause state
						if( oldPaused ){
							_this.pause();
						}
					} );
				});
			}
		},
		/**
		 * Used for livestream: will be called when clicking on "back to live" button
		 *
		 */
		backToLive: function () {
			mw.log('Error player does not support back to live' );
		},

		/**
		 * add storageId parameter to all "playmanifest" sources
		 * @param storageId
		 */
		setStorageId: function( storageId ) {
			this.setFlashvars( "storageId", storageId );
			if ( this.mediaElement ) {
				$.each( this.mediaElement.sources , function( sourceIndex, source ) {
					//add storageId only if its a playmanifest source
					if ( source.src.indexOf( "playManifest" ) !== -1 ) {
						if ( source.src.indexOf( "storageId" ) !== -1 ) {
							source.src = source.src.replace( /(.*storageId=)([0-9]+)/,"$1" + storageId );
						} else {
							source.src += (( source.src.indexOf( '?' ) === -1) ? '?' : '&') + "storageId=" + storageId;
						}
					}
				});
			}
		}
	};

})( window.mw, window.jQuery );
