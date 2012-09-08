/**
* embedPlayer is the base class for html5 video tag javascript abstraction library
* embedPlayer include a few subclasses:
*
* mediaPlayer Media player embed system ie: java, vlc or native.
* mediaElement Represents source media elements
* mw.PlayerControlBuilder Handles skinning of the player controls
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

		// A player error object (Includes title and message)
		// * Used to display an error instead of a play button
		// * The full player api available
		'playerError' : {},

		// A flag to hide the player gui and disable autoplay
		// * Used for empty players or a player where you want to dynamically set sources, then play.
		// * The player API remains active.
		'data-blockPlayerDisplay': null,

		// If serving an ogg_chop segment use this to offset the presentation time
		// ( for some plugins that use ogg page time rather than presentation time )
		"startOffset" : 0,

		// If the download link should be shown
		"downloadLink" : true,

		// Content type of the media
		"type" : null,

		// Should we show ads on replay?
		"adsOnReplay": false

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
	 *      element, the element used for initialization.
	 * @constructor
	 */
	mw.EmbedPlayer = function( element ) {
		return this.init( element );
	};

	mw.EmbedPlayer.prototype = {

		// The mediaElement object containing all mediaSource objects
		'mediaElement' : null,

		// Object that describes the supported feature set of the underling plugin /
		// Support list is described in PlayerControlBuilder components
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

		/**
		 * embedPlayer
		 *
		 * @constructor
		 *
		 * @param {Element}
		 *      element DOM element that we are building the player interface for.
		 */
		init: function( element ) {
			var _this = this;
			mw.log('EmbedPlayer: initEmbedPlayer: ' + $(element).width() + 'x' + $(element).height() );

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
			// Set the skin name from the class
			var	sn = $(element).attr( 'class' );

			if ( sn && sn != '' ) {
				var skinList = mw.getConfig('EmbedPlayer.SkinList');
				for ( var n = 0; n < skinList.length; n++ ) {
					if ( sn.indexOf( skinList[n].toLowerCase() ) !== -1 ) {
						this.skinName = skinList[ n ];
					}
				}
			}
			// Set the default skin if unset:
			if ( !this.skinName ) {
				this.skinName = mw.getConfig( 'EmbedPlayer.DefaultSkin' );
			}

			// Support custom monitorRate Attribute ( if not use default )
			if( !this.monitorRate ){
				this.monitorRate = mw.getConfig( 'EmbedPlayer.MonitorRate' );
			}

			// Make sure startOffset is cast as an float:
			if ( this.startOffset && this.startOffset.split( ':' ).length >= 2 ) {
				this.startOffset = parseFloat( mw.npt2seconds( this.startOffset ) );
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
			mw.log( 'EmbedPlayer::init:' + this.id + " duration is: " + this.duration );

			// Set the playerElementId id
			this.pid = 'pid_' + this.id;

			// Add the mediaElement object with the elements sources:
			this.mediaElement = new mw.MediaElement( element );

			this.bindHelper( 'updateLayout', function() {
				_this.doUpdateLayout();
			});
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
				// mw.log( "EmbedPlayer:: possible error in trgger: " + name + " " + e.toString() );
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
			this._propagateEvents = true;
			this.startMonitor();
		},

		/**
		 * Enables the play controls ( for example when an ad is done )
		 */
		enablePlayControls: function(){
			mw.log("EmbedPlayer:: enablePlayControls" );
			if( this.useNativePlayerControls() ){
				return ;
			}
			this._playContorls = true;
			// re-enable hover:
			this.getInterface().find( '.play-btn' )
				.buttonHover()
				.css('cursor', 'pointer' );

			this.controlBuilder.enableSeekBar();
			/*
			 * We should pass an array with enabled components, and the controlBuilder will listen
			 * to this event and handle the layout changes. we should not call to this.controlBuilder inside embedPlayer.
			 * [ 'playButton', 'seekBar' ]
			 */
			$( this ).trigger( 'onEnableInterfaceComponents');
		},

		/**
		 * Disables play controls, for example when an ad is playing back
		 */
		disablePlayControls: function(){
			if( this.useNativePlayerControls() ){
				return ;
			}
			this._playContorls = false;
			// turn off hover:
			this.getInterface().find( '.play-btn' )
				.unbind('mouseenter mouseleave')
				.css('cursor', 'default' );

			this.controlBuilder.disableSeekBar();
			/**
			 * We should pass an array with disabled components, and the controlBuilder will listen
			 * to this event and handle the layout changes. we should not call to this.controlBuilder inside embedPlayer.
			 * [ 'playButton', 'seekBar' ]
			 */
			$( this ).trigger( 'onDisableInterfaceComponents');
		},

		/**
		 * For plugin-players to update supported features
		 */
		updateFeatureSupport: function(){
			$( this ).trigger('updateFeatureSupportEvent', this.supports );
			return ;
		},
		/**
		* Apply Intrinsic Aspect ratio of a given image to a poster image layout
		*/
		applyIntrinsicAspect: function(){
			var $this = $( this );
			// Check if a image thumbnail is present:
			if(  this.getInterface().find('.playerPoster' ).length ){
				var img = this.getInterface().find( '.playerPoster' )[0];
				var pHeight = this.getVideoHolder().height();
				// Check for intrinsic width and maintain aspect ratio
				if( img.naturalWidth && img.naturalHeight ){
					var pWidth = parseInt(  img.naturalWidth / img.naturalHeight * pHeight);
					if( pWidth > $this.width() ){
						pWidth = $this.width();
						pHeight =  parseInt( img.naturalHeight / img.naturalWidth * pWidth );
					}
					$( img ).css({
						'height' : pHeight + 'px',
						'width':  pWidth + 'px',
						'left': ( ( $this.width() - pWidth ) * .5 ) + 'px',
						'top': ( ( $this.height() - pHeight ) * .5 ) + 'px',
						'position' : 'absolute'
					});
				}
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
		 *      element Source element to grab size from
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
	        if ( $.browser.mozilla && parseFloat( $.browser.version ) < 2 ) {
	            return ( $( this ).parent().parent().width() );
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
				this.selectedPlayer = targetPlayer;
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
		 * Set up the select source player
		 *
		 * issues autoSelectSource call
		 *
		 * Sets load error if no source is playable
		 */
		setupSourcePlayer: function() {
			var _this = this;
			mw.log("EmbedPlayer::setupSourcePlayer: " + this.id + ' sources: ' + this.mediaElement.sources.length );

			// Check for source replace configuration:
			if( mw.getConfig('EmbedPlayer.ReplaceSources' ) ){
				this.emptySources();
				$.each( mw.getConfig('EmbedPlayer.ReplaceSources' ), function( inx, source ){
					_this.mediaElement.tryAddSource( source );
				});
			}

			// Autoseletct the media source
			this.mediaElement.autoSelectSource();

			// Auto select player based on default order
			if( this.mediaElement.selectedSource ){
				this.selectedPlayer = mw.EmbedTypes.getMediaPlayers().defaultPlayer( this.mediaElement.selectedSource.mimeType );
				// Check if we need to switch player rendering libraries:
				if ( this.selectedPlayer && ( !this.prevPlayer || this.prevPlayer.library != this.selectedPlayer.library ) ) {
					// Inherit the playback system of the selected player:
					this.updatePlaybackInterface();
					return ;
				}
			}

			// Check if no player is selected
			if( !this.selectedPlayer || !this.mediaElement.selectedSource ){
				this.showPlayerError();
				mw.log( "EmbedPlayer:: setupSourcePlayer > player ready ( but with errors ) ");
			} else {
				// Trigger layout ready event
				$( this ).trigger( 'layoutReady' );
				// Show the interface:
				this.getInterface().find( '.control-bar').show();
				this.addLargePlayBtn();
			}
			// We still do the playerReady sequence on errors to provide an api
			// and player error events
			this.playerReadyFlag = true;
			// trigger the player ready event;
			$( this ).trigger( 'playerReady' );
			this.triggerWidgetLoaded();
		},

		/**
		 * Updates the player interface
		 *
		 * Loads and inherit methods from the selected player interface.
		 *
		 * @param {Function}
		 *      callback Function to be called once playback-system has been
		 *      inherited
		 */
		updatePlaybackInterface: function( callback ) {
			var _this = this;
			mw.log( "EmbedPlayer::updatePlaybackInterface: duration is: " + this.getDuration() + ' playerId: ' + this.id );
			// Clear out any non-base embedObj methods:
			if ( this.instanceOf ) {
				// Update the prev instance var used for swiching interfaces to know the previous instance.
				$( this ).data( 'previousInstanceOf', this.instanceOf );
				var tmpObj = mw[ 'EmbedPlayer' + this.instanceOf ];
				for ( var i in tmpObj ) {
					// Restore parent into local location
					if ( typeof this[ 'parent_' + i ] != 'undefined' ) {
						this[i] = this[ 'parent_' + i];
					} else {
						this[i] = null;
					}
				}
			}
			// Set up the new embedObj
			mw.log( 'EmbedPlayer::updatePlaybackInterface: embedding with ' + this.selectedPlayer.library );
			this.selectedPlayer.load( function() {
				_this.updateLoadedPlayerInterface( callback );
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
			mw.log( 'EmbedPlayer::updateLoadedPlayerInterface ' + _this.selectedPlayer.library + " player loaded for " + _this.id );

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
			// Update feature support
			_this.updateFeatureSupport();
			// Update duration
			_this.getDuration();
			// show player inline
			_this.showPlayer();
			// Run the callback if provided
			if ( $.isFunction( callback ) ){
				callback();
			}
		},

		/**
		 * Select a player playback system
		 *
		 * @param {Object}
		 *      player Player playback system to be selected player playback
		 *      system include vlc, native, java etc.
		 */
		selectPlayer: function( player ) {
			mw.log("EmbedPlayer:: selectPlayer " + player.id );
			var _this = this;
			if ( this.selectedPlayer.id != player.id ) {
				this.selectedPlayer = player;
				this.updatePlaybackInterface( function(){
					// Hide / remove track container
					_this.getInterface().find( '.track' ).remove();
					// We have to re-bind hoverIntent ( has to happen in this scope )
					if( !_this.useNativePlayerControls() && _this.controls && _this.controlBuilder.isOverlayControls() ){
						_this.controlBuilder.showControlBar();
						_this.getInterface().hoverIntent({
							'sensitivity': 4,
							'timeout' : 2000,
							'over' : function(){
								_this.controlBuilder.showControlBar();
							},
							'out' : function(){
								_this.controlBuilder.hideControlBar();
							}
						});
					}
				});
			}
		},

		/**
		 * Get a time range from the media start and end time
		 *
		 * @return startNpt and endNpt time if present
		 */
		getTimeRange: function() {
			var end_time = ( this.controlBuilder.longTimeDisp )? '/' + mw.seconds2npt( this.getDuration() ) : '';
			var defaultTimeRange = '0:00' + end_time;
			if ( !this.mediaElement ){
				return defaultTimeRange;
			}
			if ( !this.mediaElement.selectedSource ){
				return defaultTimeRange;
			}
			if ( !this.mediaElement.selectedSource.endNpt ){
				return defaultTimeRange;
			}
			return this.mediaElement.selectedSource.startNpt + this.mediaElement.selectedSource.endNpt;
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
		 */
		seek: function( percent ) {
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
			// NOTE controlBuilder should really bind to html5 events rather
			// than explicitly calling it or inheriting stuff.
			this.controlBuilder.onSeek();
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
			// TODO move this to an event and have the control bar listen to it.
			this.updatePlayheadStatus();
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
			mw.log( 'EmbedPlayer::onClipDone: propagate:' +  _this._propagateEvents + ' id:' + this.id + ' doneCount:' + this.donePlayingCount + ' stop state:' +this.isStopped() );
			// Only run stopped once:
			if( !this.isStopped() ){
				// set the "stopped" flag:
				this.stopped = true;

				// Show the control bar:
				this.controlBuilder.showControlBar();

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
					// Prevent the native "onPlay" event from propagating that happens when we rewind:
					this.stopEventPropagation();

					// Update the clip done playing count ( for keeping track of replays )
					_this.donePlayingCount ++;

					// Rewind the player to the start:
					// NOTE: Setting to 0 causes lags on iPad when replaying, thus setting to 0.01
					this.setCurrentTime(0.01, function(){

						// Set to stopped state:
						_this.stop();

						// Restore events after we rewind the player
						mw.log("EmbedPlayer::onClipDone:Restore events after we rewind the player");
						_this.restoreEventPropagation();

						// Check if we have the "loop" property set
						if( _this.loop ) {
							 _this.stopped = false;
							_this.play();
							return;
						} else {
							// make sure we are in a paused state.
							_this.pause();
						}
						// Check if have a force display of the large play button
						if( mw.getConfig('EmbedPlayer.ForceLargeReplayButton') === true ){
							_this.addLargePlayBtn();
						} else{
							// Check if we should hide the large play button on end:
							if( $( _this ).data( 'hideEndPlayButton' ) || !_this.useLargePlayBtn() ){
								_this.hideLargePlayBtn();
							} else {
								_this.addLargePlayBtn();
							}
						}
						// An event for once the all ended events are done.
						mw.log("EmbedPlayer:: trigger: onEndedDone");
						if ( !_this.triggeredEndDone ){
							_this.triggeredEndDone = true;
							$( _this ).trigger( 'onEndedDone' );
						}
					})
				}
			}
		},


		/**
		 * Shows the video Thumbnail, updates pause state
		 */
		showThumbnail: function() {
			var _this = this;
			mw.log( 'EmbedPlayer::showThumbnail::' + this.stopped );

			// Close Menu Overlay:
			this.controlBuilder.closeMenuOverlay();

			// update the thumbnail html:
			this.updatePosterHTML();

			this.paused = true;
			this.stopped = true;
			// Make sure the controlBuilder bindings are up-to-date
			this.controlBuilder.addControlBindings();

			// Once the thumbnail is shown run the mediaReady trigger (if not using native controls)
			if( !this.useNativePlayerControls() ){
				mw.log("mediaLoaded");
				$( this ).trigger( 'mediaLoaded' );
			}
		},

		/**
		 * Show the player
		 */
		showPlayer: function () {
			mw.log( 'EmbedPlayer:: showPlayer: ' + this.id + ' interace: w:' + this.width + ' h:' + this.height );
			var _this = this;
			// Remove the player loader spinner if it exists
			this.hideSpinnerAndPlayBtn();
			// If a isPersistentNativePlayer ( overlay the controls )
			if( !this.useNativePlayerControls() && this.isPersistentNativePlayer() ){
				$( this ).show();
			}
			// Add controls if enabled:
			if ( this.controls ) {
				if( this.useNativePlayerControls() ){
					if( this.getPlayerElement() ){
						$(  this.getPlayerElement() ).attr('controls', "true");
					}
				} else {
					this.controlBuilder.addControls();
				}
			}

			// Update Thumbnail for the "player"
			this.updatePosterHTML();

			// Update temporal url if present
			this.updateTemporalUrl();

			// Do we need to show the player?
			if( this.displayPlayer === false ) {
				_this.getVideoHolder().hide();
				_this.getInterface().height( _this.getComponentsHeight() );
			}
			// Update layout
			this.doUpdateLayout();

			// Make sure we have a play btn:
			this.addLargePlayBtn();

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

		getComponentsHeight: function() {
			var height = 0;

			// Go over all playerContainer direct children with .block class
			this.getInterface().find('.block').each(function() {
				height += $( this ).outerHeight( true );
			});
			var offset = (mw.isIOS()) ? 5 : 0;

			return height + offset;
		},
		doUpdateLayout: function() {
			// Set window height if in iframe:
			var containerHeight = this.getInterface().height();
			var newHeight = containerHeight - this.getComponentsHeight();
			var currentHeight = this.getVideoHolder().height();
			// Always update videoHolder height
			if( currentHeight !== newHeight ) {
				mw.log( 'EmbedPlayer: updateLayout:: containerHeight: ' + containerHeight + ', components: ' + this.getComponentsHeight() + ', videoHolder old height: ' + currentHeight + ', new height: ' + newHeight );
				this.getVideoHolder().height( newHeight );
			}
			// update image layout:
			this.applyIntrinsicAspect();
			
			mw.log( 'EmbedPlayer: updateLayout: trigger "updateLayout" ' );
			this.triggerHelper('updateLayout');
		},
		/**
		 * Gets a refrence to the main player interface, builds if not avaliable
		 */
		getInterface: function(){
			if( !this.$interface ){
				var _this = this;
				// init the control builder
				this.controlBuilder = new mw.PlayerControlBuilder( this );
				// build the videoHolder wrapper if needed
				if( $( this).parent('.videoHolder').length == 0 ){
					$( this ).wrap( 
						$('<div />').addClass( 'videoHolder' ) 
					);
				}
				var $videoHolder = $( this ).parent( '.videoHolder' );
				if( $videoHolder.parent( '.mwPlayerContainer' ).length == 0 ){
					this.$interface = $videoHolder.wrap(
							$('<div />')
							.addClass( 'mwPlayerContainer' )
						).parent()
						
					// merge in any inherited style if adedd
					if( this.style.cssText ){
						this.$interface[0].style.cssText += this.style.cssText;
					}
				} else {
					this.$interface = $videoHolder.parent( '.mwPlayerContainer' )
				}
				// add the control builder player class: 
				this.$interface.addClass( this.controlBuilder.playerClass )

				// clear out base style
				this.style.cssText = '';

				// if not displaying a play button, ( pass through to native player )
				if( ! this.useLargePlayBtn() ){
					this.$interface.css('pointer-events', 'none');
				}
				
				// add a binding for window resize if we are in an iframe 
				if( mw.getConfig('EmbedPlayer.IsIframeServer') ){
					$(window).off("debouncedresize").on("debouncedresize", function() {
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
				this.doUpdateLayout();
			}
		},
		/**
		 * Media fragments handler based on:
		 * http://www.w3.org/2008/WebVideo/Fragments/WD-media-fragments-spec/#fragment-dimensions
		 *
		 * We support seconds and npt ( normal play time )
		 *
		 * Updates the player per fragment url info if present
		 *
		 */
		updateTemporalUrl: function(){
			var sourceHash = /[^\#]+$/.exec( this.getSrc() ).toString();
			if( sourceHash.indexOf('t=') === 0 ){
				// parse the times
				var times = sourceHash.substr(2).split(',');
				if( times[0] ){
					// update the current time
					this.currentTime = mw.npt2seconds( times[0].toString() );
				}
				if( times[1] ){
					this.pauseTime = mw.npt2seconds( times[1].toString() );
					// ignore invalid ranges:
					if( this.pauseTime < this.currentTime ){
						this.pauseTime = null;
					}
				}
				// Update the play head
				this.updatePlayHead( this.currentTime / this.duration );
				// Update status:
				this.controlBuilder.setStatus( mw.seconds2npt( this.currentTime ) );
			}
		},
		
		/**
		 * Sets an error message on the player
		 *
		 * @param {string}
		 *            errorMsg
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
		 *            errorObj
		 */
		showErrorMsg: function( errorObj ){
			// Remove a loading spinner
			this.hideSpinnerAndPlayBtn();
			if( this.controlBuilder ) {
				if( mw.getConfig("EmbedPlayer.ShowPlayerAlerts") ) {
					var alertObj = $.extend( errorObj, {
						'isModal': true,
						'keepOverlay': true,
						'noButtons': true,
						'isError': true
					} );
	 				this.controlBuilder.displayAlert( alertObj );
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
		 *            [misssingType] missing type mime
		 */
		showPlayerError: function( ) {
			var _this = this;
			var $this = $( this );
			mw.log("EmbedPlayer::showPlayerError");
			// Hide loader
			this.hideSpinnerAndPlayBtn();

			// Error in loading media ( trigger the mediaLoadError )
			$this.trigger( 'mediaLoadError' );

			// We don't distiguish between mediaError and mediaLoadError right now
			// TODO fire mediaError only on failed to recive audio/video  data.
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
			this.isLinkPlayer= true;
			// Update the poster and html:
			this.updatePosterHTML();

			// Make sure we have a play btn:
			this.addLargePlayBtn();

			// By default set the direct download url to the first source.
			var downloadUrl = this.mediaElement.sources[0].getSrc();
			// Allow plugins to update the download url ( to point to server side tools to select
			// stream based on user agent ( i.e IE8 h.264 file, blackberry 3gp file etc )
			this.triggerHelper( 'directDownloadLink', function( dlUrl ){
				if( dlUrl ){
					downloadUrl = dlUrl;
				}
			});
			// Set the play button to the first available source:
			var $pBtn = this.getInterface().find('.play-btn-large')
				.attr( 'title', gM('mwe-embedplayer-play_clip') )
				.show()
				.unbind( 'click' )
				.click( function() {
					_this.triggerHelper( 'firstPlay' ); // To send stats event for play
					_this.triggerHelper( 'playing' );
					return true;
				});
			if( !$pBtn.parent('a').length ){
				$pBtn.wrap( $( '<a />' ).attr("target", "_blank" ) );
			}
			$pBtn.parent('a').attr( "href", downloadUrl );
			
			$( this ).trigger( 'showInlineDownloadLink' );
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

			// Add the no sources error:
			this.showErrorMsg( errorObj );
			this.hideLargePlayBtn();
			return ;
		},
		/**
		 * Update the video time request via a time request string
		 *
		 * @param {String}
		 *      timeRequest video time to be updated
		 */
		updateVideoTimeReq: function( timeRequest ) {
			mw.log( 'EmbedPlayer::updateVideoTimeReq:' + timeRequest );
			var timeParts = timeRequest.split( '/' );
			this.updateVideoTime( timeParts[0], timeParts[1] );
		},

		/**
		 * Update Video time from provided startNpt and endNpt values
		 *
		 * @param {String}
		 *      startNpt the new start time in npt format ( hh:mm:ss.ms )
		 * @param {String}
		 * 		endNpt the new end time in npt format ( hh:mm:ss.ms )
		 */
		updateVideoTime: function( startNpt, endNpt ) {
			// update media
			this.mediaElement.updateSourceTimes( startNpt, endNpt );

			// update time
			this.controlBuilder.setStatus( startNpt + '/' + endNpt );

			// reset slider
			this.updatePlayHead( 0 );

			// Reset the serverSeekTime if urlTimeEncoding is enabled
			if ( this.supportsURLTimeEncoding() ) {
				this.serverSeekTime = 0;
			} else {
				this.serverSeekTime = mw.npt2seconds( startNpt );
			}
		},


		/**
		 * Update Thumb time with npt formated time
		 *
		 * @param {String}
		 *      time NPT formated time to update thumbnail
		 */
		updateThumbTimeNPT: function( time ) {
			this.updateThumbTime( mw.npt2seconds( time ) - parseInt( this.startOffset ) );
		},

		/**
		 * Update the thumb with a new time
		 *
		 * @param {Float}
		 *      floatSeconds Time to update the thumb to
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
		 *      percent Percent of duration to update thumb
		 */
		updateThumbPerc:function( percent ) {
			return this.updateThumbTime( ( this.getDuration() * percent ) );
		},

		/**
		 * Update the poster source
		 * @param {String}
		 * 		posterSrc Poster src url
		 */
		updatePosterSrc: function( posterSrc ){
			if( ! posterSrc ) {
				posterSrc = mw.getConfig( 'EmbedPlayer.BlackPixel' );
			}
			this.poster = posterSrc;
			this.updatePosterHTML();
			this.applyIntrinsicAspect();
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

			// onChangeMedia triggered at the start of the change media commands
			$this.trigger( 'onChangeMedia' );

			// Reset first play to true, to count that play event
			this.firstPlay = true;
			// reset donePlaying count on change media.
			this.donePlayingCount = 0;
			this.triggeredEndDone = false;
			this.preSequenceFlag = false;
			this.postSequenceFlag = false;

			//this.setCurrentTime( 0.01 );
			// reset the current time ( without a direct seek )
			this.crrentTime = 0;
			
			// Reset the playhead
			this.updatePlayHead( 0 );
			// update the status:
			this.controlBuilder.setStatus( this.getTimeRange() );

			// Add a loader to the embed player:
			this.pauseLoading();

			// Clear out any player error ( both via attr and object property ):
			this.setError( null );

			//	Clear out any player display blocks
			this['data-blockPlayerDisplay'] = null
			$this.attr( 'data-blockPlayerDisplay', '');

			// Clear out the player error div:
			this.getInterface().find('.error').remove();
			this.controlBuilder.closeAlert();
			this.controlBuilder.closeMenuOverlay();

			// Restore the control bar:
			this.getInterface().find('.control-bar').show();
			// Hide the play btn
			this.hideLargePlayBtn();

			//If we are change playing media add a ready binding:
			var bindName = 'playerReady.changeMedia';
			$this.unbind( bindName ).bind( bindName, function(){
				mw.log('EmbedPlayer::changeMedia playerReady callback');
				// hide the loading spinner:
				_this.hideSpinnerAndPlayBtn();
				// check for an erro on change media:
				if( _this.getError() ){
					_this.showErrorMsg( _this.getError() );
					return ;
				}
				// Always show the control bar on switch:
				if( _this.controlBuilder ){
					_this.controlBuilder.showControlBar();
				}
				// Make sure the play button reflects the original play state
				if(  _this.autoplay ){
					_this.hideLargePlayBtn();
				} else {
					_this.addLargePlayBtn();
				}
				var source = _this.getSource();
				
				if( $( this ).data( 'previousInstanceOf' ) == 'ImageOverlay' ){
					_this.updatePosterHTML();
					// trigger onchange media after state sync. 
					$this.trigger( 'onChangeMediaDone' );
					if( callback ){
						callback();
					}
				} else if( (_this.isPersistentNativePlayer() || _this.useNativePlayerControls()) && source ){
					// If switching a Persistent native player update the source:
					// ( stop and play won't refresh the source  )
					_this.switchPlaySource( source, function(){
						_this.changeMediaStarted = false;
						if( _this.autoplay ){
							_this.play();
						} else {
							// pause is need to keep pause sate, while
							// switch source calls .play() that some browsers require.
							// to reflect source swiches.
							_this.ignoreNextNativeEvent = true;
							_this.pause();
							_this.addLargePlayBtn();
							_this.updatePosterHTML();
						}
						// trigger onchange media after state sync. 
						$this.trigger( 'onChangeMediaDone' );
						if( callback ){
							callback();
						}
					});
					// We are handling trigger and callback asynchronously return here.
					return ;
				}

				// Reset changeMediaStarted flag
				_this.changeMediaStarted = false;

				// Stop should unload the native player
				_this.stop();

				// reload the player
				if( _this.autoplay ){
					_this.play();
				} else {
					_this.addLargePlayBtn();
				}

				$this.trigger( 'onChangeMediaDone' );
				if( callback ) {
					callback();
				}
			});

			// Load new sources per the entry id via the checkPlayerSourcesEvent hook:
			$this.triggerQueueCallback( 'checkPlayerSourcesEvent', function(){
				// Start player events leading to playerReady
				_this.setupSourcePlayer();
			});
		},
		/**
		 * Checks if the current player / configuration is an image play screen:
		 */
		isImagePlayScreen:function(){
			return ( this.useNativePlayerControls() &&
				!this.isLinkPlayer &&
				mw.isIphone() &&
				mw.getConfig( 'EmbedPlayer.iPhoneShowHTMLPlayScreen')
			);
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
			mw.log( 'EmbedPlayer:updatePosterHTML::' + this.id );
			
			var _this = this;
			var thumb_html = '';
			var class_atr = '';
			var style_atr = '';

			if( this.isImagePlayScreen() ){
				this.addPlayScreenWithNativeOffScreen();
				return ;
			}

			// Set by default thumb value if not found
			var posterSrc = ( this.poster ) ? this.poster :
							mw.getConfig( 'EmbedPlayer.BlackPixel' );

			
			// Update PersistentNativePlayer poster:
			// hide the pid if present:
			$( '#' + this.pid ).hide();
			// Poster support is not very consistent in browsers use a jpg poster image:
			$( this )
				.html(
				$( '<img />' )
				.css({
					'position': 'absolute',
				})
				.attr({
					'src' : posterSrc
				})
				.addClass( 'playerPoster' )
				.load(function(){
					_this.applyIntrinsicAspect();
				})
			).show();
			if ( this.useLargePlayBtn()  && this.controlBuilder
					&&
				this.height > this.controlBuilder.getComponentHeight( 'playButtonLarge' )
			) {
				this.addLargePlayBtn();
			}
		},
		/**
		 * Abstract method, must be set by player inteface
		 */
		addPlayScreenWithNativeOffScreen: function(){
			mw.log( "Error: EmbedPlayer, Must override 'addPlayScreenWithNativeOffScreen' with player inteface" );
			return ;
		},
		/**
		 * Checks if a large play button should be displayed on the
		 * otherwise native player
		 */
		useLargePlayBtn: function(){
			if( this.isPersistantPlayBtn() ){
				return true;
			}
			// If we are using native controls return false:
			return !this.useNativePlayerControls();
		},
		/**
		 * Checks if the play button should stay on screen during playback,
		 * cases where a native player is dipalyed such as iPhone.
		 */
		isPersistantPlayBtn: function(){
			return mw.isAndroid2() ||
					( mw.isIphone() && mw.getConfig( 'EmbedPlayer.iPhoneShowHTMLPlayScreen' ) );
		},
		/**
		 * Checks if native controls should be used
		 *
		 * @returns boolean true if the mwEmbed player interface should be used
		 *     false if the mwEmbed player interface should not be used
		 */
		useNativePlayerControls: function() {
			if( this.usenativecontrols === true ){
				return true;
			}

			if( mw.getConfig('EmbedPlayer.NativeControls') === true ) {
				return true;
			}

			// Check for special webkit property that allows inline iPhone playback:
	 		if( mw.getConfig('EmbedPlayer.WebKitPlaysInline') === true && mw.isIphone() ) {
	 			return false;
	 		}

			// Do some device detection devices that don't support overlays
			// and go into full screen once play is clicked:
			if( mw.isAndroid2() || ( mw.isAndroid40() && !mw.isMobileChrome() ) || mw.isIpod()  || mw.isIphone() ){
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
			if( this.isLinkPlayer ){
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
		 * Hides the large play button
		 * TODO move to player controls
		 */
		hideLargePlayBtn: function(){
			if( this.getInterface() ){
				this.getInterface().find( '.play-btn-large' ).hide();
			}
		},
		/**
		 * Add a play button (if not already there )
		 */
		addLargePlayBtn: function(){
			// check if we are pauseLoading ( i.e switching media, seeking, etc. and don't display play btn:
			if( this.isPauseLoading ){
				mw.log("EmbedPlayer:: addLargePlayBtn ( skip play button, during load )");
				return;
			}
			// if using native controls make sure we can click the big play button by restoring
			// interface click events:
			if( this.useNativePlayerControls() ){
				this.getInterface().css('pointer-events', 'auto');
			}

			// iPhone in WebKitPlaysInline mode does not support clickable overlays as of iOS 5.0
			if( mw.getConfig( 'EmbedPlayer.WebKitPlaysInline') && mw.isIphone() ) {
				return ;
			}
			if( this.getInterface().find( '.play-btn-large' ).length ){
				this.getInterface().find( '.play-btn-large' ).show();
			} else {
				this.getVideoHolder().append(
					this.controlBuilder.getComponent( 'playButtonLarge' )
				);
			}
		},

		getVideoHolder: function() {
			return this.getInterface().find('.videoHolder');
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
			mw.log( "EmbedPlayer:: play: " + this._propagateEvents + ' poster: ' +  this.stopped );
			this.absoluteStartPlayTime =  new Date().getTime();

			// Check if thumbnail is being displayed and embed html
			if ( _this.isStopped() && (_this.preSequenceFlag == false || (_this.sequenceProxy && _this.sequenceProxy.isInSequence == false) )) {
				if ( !_this.selectedPlayer ) {
					_this.showPlayerError();
					return false;
				} else {
					_this.embedPlayerHTML();
				}
			}
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

			// If we have start time defined, start playing from that point
			if( this.currentTime < this.startTime ) {
				$this.bind('playing.startTime', function(){
					$this.unbind('playing.startTime');
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
					_this.startTime = 0;
				});
			}

			this.playInterfaceUpdate();
			// If play controls are enabled continue to video content element playback:
			if( _this._playContorls ){
				return true;
			} else {
				mw.log( "EmbedPlayer::player: _playContorls false" );
				// return false ( Mock play event, or handled elsewhere )
				return false;
			}
		},
		/**
		 * Update the player inteface for playback
		 * TODO move to controlBuilder
		 */
		playInterfaceUpdate: function(){
			var _this = this;
			mw.log( 'EmbedPlayer:: playInterfaceUpdate' );
			// Hide any overlay:
			if( this.controlBuilder ){
				this.controlBuilder.closeMenuOverlay();
			}
			// Hide any buttons or errors  if present:
			this.getInterface().find( '.error' ).remove();
			this.hideLargePlayBtn();

			this.getInterface().find('.play-btn span')
			.removeClass( 'ui-icon-play' )
			.addClass( 'ui-icon-pause' );

			this.hideSpinnerOncePlaying();

			this.getInterface().find( '.play-btn' )
			.unbind('click')
			.click( function( ) {
				if( _this._playContorls ){
					_this.pause();
				}
			 } )
			.attr( 'title', gM( 'mwe-embedplayer-pause_clip' ) );
		},
		/**
		 * Pause player, and display a loading animation
		 * @return
		 */
		pauseLoading: function(){
			this.pause();
			this.addPlayerSpinner();
			this.isPauseLoading = true;
		},
		/**
		 * Adds a loading spinner to the player.
		 */
		addPlayerSpinner: function(){
			var sId = 'loadingSpinner_' + this.id;
			// remove any old spinner
			$( '#' + sId ).remove();
			// hide the play btn if present
			this.hideLargePlayBtn();
			// re add an absolute positioned spinner:
			$( this ).show().getAbsoluteOverlaySpinner()
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
			// hide the play btn
			this.hideLargePlayBtn();
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
			// Update the ctrl "paused state"
			this.getInterface().find('.play-btn span' )
			.removeClass( 'ui-icon-pause' )
			.addClass( 'ui-icon-play' );

			this.getInterface().find( '.play-btn' )
			.unbind('click')
			.click( function() {
				if( _this._playContorls ){
					_this.play();
				}
			} )
			.attr( 'title', gM( 'mwe-embedplayer-play_clip' ) );
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

			// Reset current time and prev time and seek offset
			this.currentTime = this.previousTime = this.serverSeekTime = 0;

			this.stopMonitor();

			// pause playback ( if playing )
			if( !this.paused ){
				this.pause();
			}
			// Restore the play button ( if not native controls or is android )
			if( this.useLargePlayBtn() ){
				this.addLargePlayBtn();
				this.pauseInterfaceUpdate();
			}

			// Native player controls:
			if( !this.isPersistentNativePlayer() ){
				// Rewrite the html to thumbnail disp
				this.showThumbnail();
				this.bufferedPercent = 0; // reset buffer state
				this.controlBuilder.setStatus( this.getTimeRange() );
			}
			// Reset the playhead
			this.updatePlayHead( 0 );
			// update the status:
			this.controlBuilder.setStatus( this.getTimeRange() );
		},

		/**
		 * Base Embed mute
		 *
		 * Handles interface updates for toggling mute. Plug-in / player interface
		 * must handle the actual media player action
		 */
		toggleMute: function( userAction ) {
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
			// Update the interface
			this.setInterfaceVolume( percent );
			// trigger the onToggleMute event
			$( this ).trigger('onToggleMute');
		},

		/**
		 * Update volume function ( called from interface updates )
		 *
		 * @param {float}
		 *      percent Percent of full volume
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
		 * Updates the interface volume
		 *
		 * TODO should move to controlBuilder
		 *
		 * @param {float}
		 *      percent Percentage volume to update interface
		 */
		setInterfaceVolume: function( percent ) {
			if( this.supports[ 'volumeControl' ] &&
				this.getInterface().find( '.volume-slider' ).length
			) {
				this.getInterface().find( '.volume-slider' ).slider( 'value', percent * 100 );
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
		 * Passes a fullscreen request to the controlBuilder interface
		 */
		fullscreen: function() {
			this.controlBuilder.toggleFullscreen();
		},

		/**
		 * Abstract method to be run post embedding the player Generally should be
		 * overwritten by the plug-in / player
		 */
		postEmbedActions:function() {
			return ;
		},

		/**
		 * Checks the player state based on thumbnail display & paused state
		 *
		 * @return {Boolean} true if playing false if not playing
		 */
		isPlaying : function() {
			if ( this.stopped ) {
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

			// mw.log( "monitor:: " + this.currentTime + ' propagateEvents: ' +  _this._propagateEvents );

			// Keep volume proprties set outside of the embed player in sync
			_this.syncVolume();

			// Make sure the monitor continues to run as long as the video is not stoped
			_this.syncMonitor()

			if( _this._propagateEvents ){

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
			// Check if volume was set outside of embed player function
			// mw.log( ' this.volume: ' + _this.volume + ' prev Volume:: ' + _this.previousVolume );
			if( Math.round( _this.volume * 100 ) != Math.round( _this.previousVolume * 100 ) ) {
				_this.setInterfaceVolume( _this.volume );
			}
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
			if( _this._checkHideSpinner && _this.currentTime != _this.getPlayerElementTime() ){
				_this._checkHideSpinner = false;
				_this.hideSpinnerAndPlayBtn();

				if( _this.isPersistantPlayBtn() ){
					// add the play button likely iphone or native player that needs the play button on
					// non-event "exit native html5 player"
					_this.addLargePlayBtn();
				} else{
					// also hide the play button ( in case it was there somehow )
					_this.hideLargePlayBtn();
				}
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
					if ( parseInt( this.startOffset ) != 0 ) {
						this.updatePlayHead( ( this.currentTime - this.startOffset ) / this.duration );
						var et = ( this.controlBuilder.longTimeDisp ) ? '/' + mw.seconds2npt( parseFloat( this.startOffset ) + parseFloat( this.duration ) ) : '';
						this.controlBuilder.setStatus( mw.seconds2npt( this.currentTime ) + et );
					} else {
						// use raw currentTIme for playhead updates
						var ct = ( this.getPlayerElement() ) ? this.getPlayerElement().currentTime || this.currentTime: this.currentTime;
						this.updatePlayHead( ct / this.duration );
						// Only include the end time if longTimeDisp is enabled:
						var et = ( this.controlBuilder.longTimeDisp ) ? '/' + mw.seconds2npt( this.duration ) : '';
						this.controlBuilder.setStatus( mw.seconds2npt( this.currentTime ) + et );
					}
				}
				// Check if we are "done"
				var endPresentationTime = ( this.startOffset ) ? ( this.startOffset + this.duration ) : this.duration;
				if ( this.currentTime >= endPresentationTime && !this.isStopped()  ) {
					mw.log( "EmbedPlayer::updatePlayheadStatus > should run clip done :: " + this.currentTime + ' > ' + endPresentationTime );
					this.onClipDone();
				}
			} else {
				// Media lacks duration just show end time
				if ( this.isStopped() ) {
					this.controlBuilder.setStatus( this.getTimeRange() );
				} else if ( this.paused ) {
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
		updateBufferStatus: function() {
			// Get the buffer target based for playlist vs clip
			var $buffer = this.getInterface().find( '.mw_buffer' );

			// mw.log(' set bufferd %:' + this.bufferedPercent );
			// Update the buffer progress bar (if available )
			if ( this.bufferedPercent != 0 ) {
				// mw.log('Update buffer css: ' + ( this.bufferedPercent * 100 ) +
				// '% ' + $buffer.length );
				if ( this.bufferedPercent > 1 ){
					this.bufferedPercent = 1;
				}
				$buffer.css({
					"width" : ( this.bufferedPercent * 100 ) + '%'
				});
				$( this ).trigger( 'updateBufferPercent', this.bufferedPercent );
			} else {
				$buffer.css( "width", '0px' );
			}

			// if we have not already run the buffer start hook
			if( this.bufferedPercent > 0 && !this.bufferStartFlag ) {
				this.bufferStartFlag = true;
				mw.log("EmbedPlayer::bufferStart");
				$( this ).trigger( 'bufferStartEvent' );
			}

			// if we have not already run the buffer end hook
			if( this.bufferedPercent == 1 && !this.bufferEndFlag){
				this.bufferEndFlag = true;
				$( this ).trigger( 'bufferEndEvent' );
			}
		},

		/**
		 * Update the player playhead
		 *
		 * @param {Float}
		 *      perc Value between 0 and 1 for position of playhead
		 */
		updatePlayHead: function( perc ) {
			//mw.log( 'EmbedPlayer: updatePlayHead: '+ perc);
			if( this.getInterface() ){
				var $playHead = this.getInterface().find( '.play_head' );
				if ( !this.useNativePlayerControls() && $playHead.length != 0 ) {
					var val = parseInt( perc * 1000 );
					$playHead.slider( 'value', val );
				}
			}
			$( this ).trigger('updatePlayHeadPercent', perc);
		},


		/**
		 * Helper Functions for selected source
		 */

		/**
		 * Get the current selected media source or first source
		 *
		 * @param {Number}
		 *            Requested time in seconds to be passed to the server if the
		 *            server supports supportsURLTimeEncoding
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
				$media.append( $('<source />').attr({
					'src' : source.src,
					'type' : source.type
				}));
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
		 *         src does not support url time requests
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
		}
	};

})( window.mw, window.jQuery );
