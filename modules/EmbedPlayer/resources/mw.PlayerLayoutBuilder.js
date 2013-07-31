/**
* Msg text is inherited from embedPlayer
*/

( function( mw, $ ) { "use strict";
/**
* mw.PlayerLayoutBuilder object
*	@param the embedPlayer element we are targeting
*/
mw.PlayerLayoutBuilder = function( embedPlayer, options ) {
	return this.init( embedPlayer, options );
};

/**
 * ControlsBuilder prototype:
 */
mw.PlayerLayoutBuilder.prototype = {
	//Default Local values:

	// Default control bar height
	height: mw.getConfig( 'EmbedPlayer.ControlsHeight' ),

	// Default supported components is merged with embedPlayer set of supported types
	supportedComponents: {},

	// Flag to store if a warning binding has been added
	addWarningFlag: false,

	// Flag to store state of overlay on player
	displayOptionsMenuFlag: false,

	// Flag to store controls status (disabled/enabled)
	controlsDisabled: false,

	// Flag to enable / disable key space binding for play/pause
	spaceKeyBindingEnabled: true,
	
	// binding postfix
	bindPostfix: '.layoutBuilder',

	layoutReady: false,

	/**
	* Initialization Object for the control builder
	*
	* @param {Object} embedPlayer EmbedPlayer interface
	*/
	init: function( embedPlayer ) {
		var _this = this;
		this.embedPlayer = embedPlayer;

		this.fullScreenManager = new mw.FullScreenManager( embedPlayer, this );

		// Return the layoutBuilder Object:
		return this;
	},

	getInterface: function() {
		if( ! this.$interface ) {

			var embedPlayer = this.embedPlayer,
				$embedPlayer = $( embedPlayer );

			// build the videoHolder wrapper if needed
			if( $embedPlayer.parent('.videoHolder').length == 0 ){
				$embedPlayer.wrap(
					$('<div />').addClass( 'videoHolder' )
				);
			}

			var $videoHolder = $embedPlayer.parent( '.videoHolder' );
			if( $videoHolder.parent( '.mwPlayerContainer' ).length == 0 ){
				this.$interface = $videoHolder.wrap(
						$('<div />')
						.addClass( 'mwPlayerContainer' )
					).parent()

				// merge in any inherited style if added
				if( embedPlayer.style.cssText ){
					this.$interface[0].style.cssText += embedPlayer.style.cssText;
				}
			} else {
				this.$interface = $videoHolder.parent( '.mwPlayerContainer' )
			}
			// clear out base style
			embedPlayer.style.cssText = '';
		}
		return this.$interface;		
	},
	isInFullScreen: function() {
		return this.fullScreenManager.isInFullScreen();
	},
	/**
	* Get the control bar height
	* @return {Number} control bar height
	*/
	getHeight: function(){
		return this.height;
	},

	clearInterface: function() {
		this.getInterface().find( '.overlay-win' ).remove();
	},
	/**
	* Add the controls HTML to player interface
	*/
	addControls: function() {
		if( this.layoutReady ) return;
		// Set up local pointer to the embedPlayer
		var embedPlayer = this.embedPlayer;

		// Set up local layoutBuilder
		var _this = this;

		// Remove any old controls & old overlays:
		this.clearInterface();

		// Reset flags:
		_this.displayOptionsMenuFlag = false;

		// Disable components based on legacy configuration
		this.disableComponents();
		this.addContainers();		
		this.mapComponents();
		this.drawLayout();

		// Add top level Controls bindings
		this.addControlBindings();
	},

	// Our default layout container which plugins can append their components
	layoutContainers: {
		'topBarContainer': [],
		'videoHolder': [],
		'controlBarContainer': [],
		'controlsContainer': []
	},

	addContainers: function() {
		var $interface = this.getInterface();

		// Add top bar
		var $topBarContainer = $('<div />').addClass('topBarContainer');
		this.embedPlayer.getVideoHolder().before( $topBarContainer );

		this.embedPlayer.triggerHelper( 'addLayoutContainer' );
	},

	mapComponents: function() {
		var _this = this;
		var plugins = this.embedPlayer.playerConfig['plugins'];
		$.each(plugins, function( pluginId, pluginConfig ) {
			// If we don't have parent, continue
			if( !pluginConfig.parent ) return true;
			// Check if we have this kind of container
			if( _this.layoutContainers[ pluginConfig.parent ] ) {
				_this.layoutContainers[ pluginConfig.parent ].push({
					'id': pluginId,
					'order': pluginConfig.order,
					'insertMode': (pluginConfig.insertMode) ? pluginConfig.insertMode : 'lastChild'
				});
			}
		});

		$.each(this.layoutContainers, function( idx, components ) {
			_this.layoutContainers[ idx ].sort(function(comp1, comp2) {
				return ((comp1.order < comp2.order) ? -1 : ((comp1.order > comp2.order) ? 1 : 0));
			});
		});
	},

	disableComponents: function() {return;
		var embedPlayer = this.embedPlayer;
		// Build the supportedComponents list
		this.supportedComponents = $.extend( this.supportedComponents, embedPlayer.supports );

		// Check if we have multiple playable sources ( if only one source don't display source switch )
		if( mw.getConfig("EmbedPlayer.EnableFlavorSelector") === false || 
			embedPlayer.mediaElement.getPlayableSources().length == 1 ){
			this.supportedComponents[ 'SourceSelector' ] = false;
		}
		/*
		for(var compId in this.supportedComponents) {
			if( this.supportedComponents[ compId ] === false ) {
				var component = this.getComponentConfig( compId , this.layoutComponents );
				if( component ) {
					component.disabled = true;
				}
			}
		}
		*/
	},

	drawLayout: function() {
		mw.log('PlayerLayoutBuilder:: drawLayout', this.layoutContainers);
		var _this = this;
		// Allow plugins to add their own components ( old event: addControlBarComponent )
		this.embedPlayer.triggerHelper( 'addLayoutComponent', this );
		// Draw the layout from the root el / components
		var $interface = this.getInterface();
		$.each(_this.layoutContainers, function( containerId, components){
			var $parent = $interface.find( '.' + containerId );
			if( $parent.length ) {
				_this.drawComponents( $parent, components );
			} else {
				mw.log('PlayerLayoutBuilder:: drawLayout:: container "' + containerId + '" not found in DOM');
			}
		});

		// Trigger layoutBuildDone ( old event: controlBarBuildDone )
		this.layoutReady = true;
		this.embedPlayer.triggerHelper( 'layoutBuildDone' );
	},

	drawComponents: function( $parent, components ) {
		var _this = this;
		// Go over components
		$.each(components, function( idx, component ) {
			var $component = _this.getDomComponent( component.id );
			if( $component === false ) {
				mw.log('PlayerLayoutBuilder:: drawComponents: component "' + component.id + '" was not defined');
			} else {
				if( component.insertMode == 'firstChild' ) {
					$parent.prepend( $component );
				} else {
					$parent.append( $component );
				}
			}
		});
	},
	/**
	* Get a window size for the player while preserving aspect ratio:
	*
	* @@TODO This has similar logic to mw.embedPlayerNative applyIntrinsicAspect we should look
	* at merging their functionality.
	*
	* @param {object} windowSize
	* 		object that set { 'width': {width}, 'height':{height} } of target window
	* @return {object}
	* 	 css settings for fullscreen player
	*/
	getAspectPlayerWindowCss: function( windowSize ) {
		var embedPlayer = this.embedPlayer;
		var _this = this;
		// Setup target height width based on max window size
		if( !windowSize ){
			var windowSize = {
				'width' : $( window ).width(),
				'height' : $( window ).height()
			};
		}
		windowSize.width = parseInt( windowSize.width );
		windowSize.height = parseInt( windowSize.height );
		// See if we need to leave space for control bar
		if( !embedPlayer.isOverlayControls() ){
			//targetHeight =  targetHeight - this.height;
			windowSize.height = windowSize.height - this.height;
		}

		// Set target width
		var targetWidth = windowSize.width;
		var targetHeight = Math.floor( targetWidth * ( 1 / _this.getIntrinsicAspect() ) );
		// Check if it exceeds the height constraint
		// Add a buffer of 2 pixels to avoid resize when "pretty close"
		if( targetHeight + 2 > windowSize.height ){
			targetHeight = windowSize.height;
			targetWidth = parseInt( targetHeight * _this.getIntrinsicAspect() );
		}
		var offsetTop = 0;
		//  Move the video down 1/2 of the difference of window height
		offsetTop+= ( targetHeight < windowSize.height )? ( windowSize.height- targetHeight ) / 2 : 0;
		// if the video is very tall in a short window adjust the size:
		var offsetLeft = ( targetWidth < windowSize.width )? parseInt( windowSize.width- targetWidth ) / 2 : 0;

		mw.log( 'PlayerLayoutBuilder::getAspectPlayerWindowCss: ' + ' h:' + targetHeight + ' w:' + targetWidth + ' t:' + offsetTop + ' l:' + offsetLeft );
		return {
			'position' : 'absolute',
			'height': parseInt( targetHeight ),
			'width' : parseInt( targetWidth ),
			'top' : parseInt( offsetTop ),
			'left': parseInt( offsetLeft)
		};
	},

	/**
	 * Get the intrinsic aspect ratio of media  ( width / height )
	 * @return {float}
	 * 			size object with width and height
	 */
	getIntrinsicAspect: function(){
		var vid = this.embedPlayer.getPlayerElement();
		// Check for raw intrinsic media size:
		if( vid && vid.videoWidth && vid.videoHeight ){
			return vid.videoWidth / vid.videoHeight;
		}

		// See if we have source data attributes available:
		if( this.embedPlayer.mediaElement &&
			this.embedPlayer.mediaElement.selectedSource )
		{
			var ss = this.embedPlayer.mediaElement.selectedSource;
			// See if we have a hardcoded aspect to the source ( Adaptive streams don't have width / height )
			if( ss.aspect ){
				return ss.aspect;
			}

			if( ss.width && ss.height ){
				return ss.width / ss.height
			}
		}

		// check for posterImage size: ( should have Intrinsic aspect size as well )
		var img = this.embedPlayer.getInterface().find('.playerPoster')[0];
		if( img && img.naturalWidth && img.naturalHeight){
			return img.naturalWidth /  img.naturalHeight
		}

		// if all else fails use embedPlayer.getWidth()
		return this.embedPlayer.getWidth() / this.embedPlayer.getHeight()
	},
	/**
	* Get minimal width for interface overlay
	*/
	getOverlayWidth: function( ) {
		return ( this.embedPlayer.getPlayerWidth() < 300 )? 300 : this.embedPlayer.getPlayerWidth();
	},

	/**
	* Get minimal height for interface overlay
	*/
	getOverlayHeight: function( ) {
		return ( this.embedPlayer.getPlayerHeight() < 200 )? 200 : this.embedPlayer.getPlayerHeight();
	},

	/**
	* addControlBindings
	* Adds control hooks once controls are in the DOM
	*/
	addControlBindings: function( ) {
		// Set up local pointer to the embedPlayer
		var embedPlayer = this.embedPlayer;
		var $embedPlayer = $( embedPlayer );
		var _this = this;
		var $interface = embedPlayer.getInterface();
		var b = function( eventName, callback ) {
			embedPlayer.bindHelper( eventName + _this.bindPostfix, callback);
		};

		_this.onControlBar = false;

		// Remove any old interface bindings
		$( embedPlayer ).unbind( this.bindPostfix );

		var bindFirstPlay = false;
		_this.addRightClickBinding();

		// add the player click bindings
		_this.addPlayerClickBindings();

		// Bind into play.ctrl namespace ( so we can unbind without affecting other play bindings )
		b( 'onplay', function() { //Only bind once played
			// add right click binding again ( in case the player got swaped )
			embedPlayer.layoutBuilder.addRightClickBinding();
		});

		// Bind to EnableInterfaceComponents
		b( 'onEnableInterfaceComponents', function() {
			this.layoutBuilder.controlsDisabled = false;
			this.layoutBuilder.addPlayerClickBindings();
		});

		// Bind to DisableInterfaceComponents
		b( 'onDisableInterfaceComponents', function() {
			this.layoutBuilder.controlsDisabled = true;
			this.layoutBuilder.removePlayerClickBindings();
		});

		this.addPlayerTouchBindings();

		// Add fullscreen bindings to update layout:
		b( 'onOpenFullScreen', function() {
			setTimeout( function(){
				embedPlayer.doUpdateLayout();
			},100)
		});
		b( 'onCloseFullScreen', function() {
			// when going fullscreen the browser temporally maximizes in the window space,
			// then goes to true fullscreen, so we need to delay the resize event.
			setTimeout( function(){
				embedPlayer.doUpdateLayout();
			},100)
		});

		mw.log( 'trigger::addControlBindingsEvent' );
		$embedPlayer.trigger( 'addControlBindingsEvent' );
	},
	removePlayerTouchBindings: function(){
		$( this.embedPlayer ).unbind( "touchstart" + this.bindPostfix );
	},
	addPlayerTouchBindings: function(){
		var embedPlayer = this.embedPlayer;
		var _this = this;
		var $interface = embedPlayer.getInterface();

		// Bind space bar clicks to play pause:
		var bindSpaceUp = function(){
			$( window ).bind( 'keyup' + _this.bindPostfix, function( e ) {
				if( e.keyCode == 32 && _this.spaceKeyBindingEnabled ) {
					embedPlayer.togglePlayback();
					// disable internal event tracking: 
					_this.embedPlayer.stopEventPropagation();
					// after event restore: 
					setTimeout(function(){
						_this.embedPlayer.restoreEventPropagation();
					},1);
					return false;
				}
			});
		};

		var bindSpaceDown = function() {
			$( window ).unbind( 'keyup' + _this.bindPostfix );
		};

		// Add recommend firefox if we have non-native playback:
		if ( _this.checkNativeWarning( ) ) {
			_this.addWarningBinding(
				'EmbedPlayer.ShowNativeWarning',
				gM( 'mwe-embedplayer-for_best_experience',
					$('<a />')
						.attr({
							'href': 'http://www.mediawiki.org/wiki/Extension:TimedMediaHandler/Client_download',
							'target' : '_new'
						})
				)
			);
		}

		// Add hide show bindings for control overlay (if overlay is enabled )
		if( !embedPlayer.isOverlayControls() ) {
			$interface.hover( bindSpaceUp, bindSpaceDown );

			// include touch start pause binding
			$( embedPlayer ).bind( 'touchstart' + this.bindPostfix, function() {
				//embedPlayer._playContorls = true;
				if ( !mw.hasNativeTouchBindings() ) {
					embedPlayer.togglePlayback();
				}
			});
		} else { // hide show controls:
			// Bind a startTouch to show controls
			$( embedPlayer ).bind( 'touchstart' + this.bindPostfix, function() {
				//embedPlayer._playContorls = true;
				if ( embedPlayer.isControlsVisible ) {
					if ( !mw.hasNativeTouchBindings() ) {
						embedPlayer.togglePlayback();
					}
				} else {
					embedPlayer.triggerHelper( 'hoverInPlayer', [ { touch: true } ] );
				}
				return true;
			} );

			var hoverIntentConfig = {
				'sensitivity': 100,
				'timeout' : 1000,
				'over' : function(){
					embedPlayer.triggerHelper( 'hoverInPlayer' );
					bindSpaceUp();
				},
				'out' : function(){
					embedPlayer.triggerHelper( 'hoverOutPlayer' );
					bindSpaceDown();
				}
			};

			// Check if we should display the interface:
			if ( mw.hasMouseEvents() ) {
				$interface.hoverIntent( hoverIntentConfig );
			}

		}
	},
	removePlayerClickBindings: function(){
		$( this.embedPlayer )
			.unbind( "click" + this.bindPostfix )
			.unbind( "dblclick" + this.bindPostfix );
	},
	addPlayerClickBindings: function(){

		var _this = this;
		var embedPlayer = this.embedPlayer;

		// prevent scrolling when in fullscreen:
		document.ontouchmove = function( e ){
			if( _this.isInFullScreen() ){
				e.preventDefault();
			}
		};
		// Remove old click bindings before adding:
		this.removePlayerClickBindings();

		 // Allows to enable space key binding
	 	 $( embedPlayer ).bind( 'onEnableSpaceKey' + this.bindPostfix, function() {
	 		 _this.spaceKeyBindingEnabled = true;
	 	 });
	 	 // Allows to disable space key binding
	 	 $( embedPlayer ).bind( 'onDisableSpaceKey' + this.bindPostfix, function() {
	 		 _this.spaceKeyBindingEnabled = false;
	 	 });

		// Setup "dobuleclick" fullscreen binding to embedPlayer ( if enabled )
		if ( this.supportedComponents['fullscreen'] ){
			$( embedPlayer ).bind( "dblclick" + _this.bindPostfix, function(){
				embedPlayer.fullscreen();
			});
		}

		var dblClickTime = 300;
		var lastClickTime = 0;
		var didDblClick = false;

		// Check for click
		$( embedPlayer ).bind( "click" + _this.bindPostfix, function() {
			mw.log( "PlayerLayoutBuilder:: click:" + embedPlayer.id + ' isPause:' + embedPlayer.paused);
			// Don't do anything if native controls displayed:
			if( embedPlayer.useNativePlayerControls()
					||
				_this.isControlsDisabled()
					||
				mw.isIpad()  // TODO have isTouchDevice() call
					||
				mw.isAndroid40()
			) {
				return true;
			}
			var clickTime = new Date().getTime();
			if( clickTime -lastClickTime < dblClickTime ) {
				didDblClick = true;
				setTimeout( function(){
					didDblClick = false;
				},  dblClickTime + 10 );
			}
			lastClickTime = clickTime;
			setTimeout( function(){
				// check if no click has since the time we called the setTimeout
				if( !didDblClick ){
					if( embedPlayer.paused ) {
						embedPlayer.play();
					} else {
						embedPlayer.pause();
					}
				}
			}, dblClickTime );
			return true;
		});

	},
	addRightClickBinding: function(){
		var embedPlayer = this.embedPlayer;
		// check config:
		if( mw.getConfig( 'EmbedPlayer.EnableRightClick') === false ){
			document.oncontextmenu= function(e){return false;};
			$(embedPlayer).mousedown(function(e){
				if( e.button == 2 ) {
					return false;
				}
			});
		}
	},
	/* Check if the controls are disabled */

	isControlsDisabled: function() {
		return this.controlsDisabled;
	},

	/**
	* Check if a warning should be issued to non-native playback systems
	*
	* dependent on mediaElement being setup
	*/
	checkNativeWarning: function() {
		if( mw.getConfig( 'EmbedPlayer.ShowNativeWarning' ) === false ){
			return false;
		}

		// Don't show for imageOverlay player:
		if( this.embedPlayer.instanceOf == 'ImageOverlay' ){
			return false;
		}

		// If the resolution is too small don't display the warning
		if( this.embedPlayer.getPlayerHeight() < 199 ){
			return false;
		}
		// See if we have we have ogg support
		var supportingPlayers = mw.EmbedTypes.getMediaPlayers().getMIMETypePlayers( 'video/ogg' );
		for ( var i = 0; i < supportingPlayers.length; i++ ) {
			if ( supportingPlayers[i].id == 'oggNative') {
				return false;
			}
		}

		// Chrome's webM support is oky though:
		if( /chrome/.test(navigator.userAgent.toLowerCase() ) &&
			mw.EmbedTypes.getMediaPlayers().getMIMETypePlayers( 'video/webm' ).length ){
			return false;
		}

		// Check for h264 and or flash/flv source and playback support and don't show warning
		if(
			( mw.EmbedTypes.getMediaPlayers().getMIMETypePlayers( 'video/mp4' ).length
			&& this.embedPlayer.mediaElement.getSources( 'video/mp4' ).length )
			||
			( mw.EmbedTypes.getMediaPlayers().getMIMETypePlayers( 'video/x-flv' ).length
			&& this.embedPlayer.mediaElement.getSources( 'video/x-flv' ).length )
			||
			( mw.EmbedTypes.getMediaPlayers().getMIMETypePlayers( 'application/vnd.apple.mpegurl' ).length
			&& this.embedPlayer.mediaElement.getSources( 'application/vnd.apple.mpegurl' ).length )
			||
			( mw.EmbedTypes.getMediaPlayers().getMIMETypePlayers( 'audio/mpeg' ).length
			&& this.embedPlayer.mediaElement.getSources( 'audio/mpeg' ).length )
		){
			// No firefox link if a h.264 or flash/flv stream is present
			return false;
		}

		// Should issue the native warning
		return true;
	},

	/**
	* Does a native warning check binding to the player on mouse over.
	* @param {string} preferenceId The preference Id
	* @param {object} warningMsg The jQuery object warning message to be displayed.
	*
	*/
	/**
	* Display a warning message on the player
	* checks a preference Id to enable or disable it.
	* @param {string} preferenceId The preference Id
	* @param {object} warningMsg The jQuery object warning message to be displayed.
	* @param {boolean} if the hide ui should be exposed
	*
	*/
	addWarningBinding: function( preferenceId, warningMsg, hideDisableUi ) {
		mw.log( 'mw.PlayerLayoutBuilder: addWarningBinding: ' + preferenceId + ' wm: ' + warningMsg);
		// Set up local pointer to the embedPlayer
		var embedPlayer = this.embedPlayer;
		var _this = this;
		// make sure the player is large enough
		if( embedPlayer.getWidth() < 200 ){
			return false;
		}

		// Can be uncommented to reset hide prefrence
		//$.cookie( preferenceId, '' );

		// Check if a cookie has been set to hide the warning:
		if ( mw.getConfig( preferenceId ) === true && $.cookie( preferenceId ) == 'hidewarning' ){
			return ;
		}

		var warnId = "warningOverlay_" + embedPlayer.id;
		$( '#' + warnId ).remove();

		// Add the targetWarning:
		var $targetWarning = $('<div />')
		.attr( {
			'id': warnId
		} )
		.addClass( 'ui-state-highlight ui-corner-all' )
		.css({
			'position' : 'absolute',
			'background' : '#333',
			'color' : '#AAA',
			'top' : '10px',
			'left' : '10px',
			'right' : '10px',
			'padding' : '4px',
			'z-index' : 2
		})
		.html( warningMsg );

		embedPlayer.getInterface().append(
			$targetWarning
		);

		$targetWarning.append(
			$('<br />')
		);
		// check if we should show the checkbox
		if( !hideDisableUi ){
			$targetWarning.append(
				$( '<input type="checkbox" />' )
				.attr({
					'id' : 'ffwarn_' + embedPlayer.id,
					'name' : 'ffwarn_' + embedPlayer.id
				})
				.click( function() {
					mw.log("WarningBindinng:: set " + preferenceId + ' to hidewarning ' );
					// Set up a cookie for 30 days:
					embedPlayer.setCookie( preferenceId, 'hidewarning', { expires: 30 } )
					//$.cookie( preferenceId, 'hidewarning', {expires: 30} );
					// Set the current instance
					mw.setConfig( preferenceId, false );
					$( '#warningOverlay_' + embedPlayer.id ).fadeOut( 'slow' );
					// set the local preference to false
					_this.addWarningFlag = false;
				} )
			);
			$targetWarning.append(
				$('<label />')
				.text( gM( 'mwe-embedplayer-do_not_warn_again' ) )
				.attr( 'for', 'ffwarn_' + embedPlayer.id )
			);
		}
		return $targetWarning;
	},

	/**
	* Allow the layoutBuilder to do interface actions onDone
	*/
	onClipDone: function(){
		// Related videos could be shown here
	},

	/**
	 * The ctrl builder updates the interface on seeking
	 */
	onSeek: function(){
		//mw.log( "layoutBuilder:: onSeek" );
		// add a loading spinner:
		this.embedPlayer.addPlayerSpinner();
		// hide once playing again:
		this.embedPlayer.hideSpinnerOncePlaying();
	},

	/**
	* Updates the player status that displays short text msgs and the play clock
	* @param {String} value Status string value to update
	*/
	setStatus: function( value ) {
		// update status:
		if( this.embedPlayer.getInterface() ){
			//this.embedPlayer.getInterface().find( '.timers' ).html( value );
		}
	},

	/**
	* Close a menu overlay
	*/
	closeMenuOverlay: function(){
		var _this = this;
		var embedPlayer = this.embedPlayer;
		var $overlay = embedPlayer.getInterface().find( '.overlay-win,.overlay,.ui-widget-shadow' );

		// Only issue enablePlayControls if no close button is present and controls are currently disabled
		if ( $overlay.length && !embedPlayer._playContorls && !$overlay.find( '.overlayCloseButton' ).length ) {
			embedPlayer.enablePlayControls();
		}

		this.displayOptionsMenuFlag = false;
		//mw.log(' closeMenuOverlay: ' + this.displayOptionsMenuFlag);

		$overlay.fadeOut( "slow", function() {
			$overlay.remove();
		} );
		
		// Make sure overlay was removed
		$overlay.remove();

		$(embedPlayer).trigger( 'closeMenuOverlay' );

		return false; // onclick action return false
	},

	/**
	* Generic function to display custom HTML overlay on video.
	*
	* @param {String} overlayContent content to be displayed
	*/
	displayMenuOverlay: function( overlayContent, closeCallback, hideCloseButton ) {
		var _this = this;
		var embedPlayer = this.embedPlayer;
		mw.log( 'PlayerLayoutBuilder:: displayMenuOverlay' );
		//	set the overlay display flag to true:
		this.displayOptionsMenuFlag = true;

		if ( !this.supportedComponents[ 'overlays' ] ) {
			embedPlayer.stop();
		}

		// Check if overlay window is already present:
		if ( embedPlayer.getInterface().find( '.overlay-win' ).length != 0 ) {
			//Update the content
			embedPlayer.getInterface().find( '.overlay-content' ).html(
				overlayContent
			);
			return ;
		}
		// If we don't have close button present, we'll want to keep the control bar for edge case of
		// having overlay on fullscreen - No option to close the overlay
		var $overlayContainer = embedPlayer.getInterface();

		if ( hideCloseButton ) {
			$overlayContainer = embedPlayer.getVideoHolder();
			embedPlayer.disablePlayControls( [ 'playlistPrevNext' ] );
			embedPlayer.getInterface().find( '.play-btn' )
				.unbind('click')
				.click( function( ) {
					if( embedPlayer._playContorls ){
						embedPlayer.play();
					}
				 } )
		}

		// Add an overlay
		$overlayContainer.append(
			$('<div />')
			.addClass( 'overlay' )
			.css( {
				'height' : '100%',
				'width' : '100%',
				'z-index' : 2
			} )
		);

		var $closeButton = [];

		if ( !hideCloseButton ) {
			// Setup the close button
			$closeButton = $('<div />')
			.addClass( 'ui-state-default ui-corner-all ui-icon_link rButton overlayCloseButton')
			.css({
				'position': 'absolute',
				'cursor' : 'pointer',
				'top' : '2px',
				'right' : '2px'
			})
			.click( function() {
				_this.closeMenuOverlay();
				if( closeCallback ){
					closeCallback();
				}
			} )
			.append(
					$('<span />')
					.addClass( 'ui-icon ui-icon-closethick' )
			);
		}

		var overlayMenuCss = {
			'height' : '100%',
			'width' : '100%',
			'position' : 'absolute',
			'margin': '0 10px 10px 0',
			'overflow' : 'auto',
			'padding' : '4px',
			'z-index' : 3
		};
		var $overlayMenu = $('<div />')
			.addClass( 'overlay-win ui-state-default ui-widget-header ui-corner-all' )
			.css( overlayMenuCss )
			.append(
				$closeButton,
				$('<div />')
					.addClass( 'overlay-content' )
					.append( overlayContent )
			);


		// Append the overlay menu to the player interface
		$overlayContainer.prepend(
			$overlayMenu
		)
		.find( '.overlay-win' )
		.fadeIn( "slow" );

		// Trigger menu overlay display
		$( embedPlayer ).trigger( 'displayMenuOverlay' );

		return false; // onclick action return false
	},

	/**
	* Close an alert
	*/
	closeAlert: function( keepOverlay ) {
		var embedPlayer = this.embedPlayer;
		var $alert = embedPlayer.getInterface().find( '.alert-container' );

		mw.log( 'mw.PlayerLayoutBuilder::closeAlert' );
		if ( !keepOverlay || ( mw.isIpad() && this.inFullScreen ) ) {
			embedPlayer.layoutBuilder.closeMenuOverlay();
			// not sure why this was here, breaks playback on iPad :(
			/*if ( mw.isIpad() ) {
				embedPlayer.disablePlayControls();
			}*/
		}
		$alert.remove();
		return false; // onclick action return false;
	},

	/**
	* Generic function to display custom alert overlay on video.
	*
	* @param (Object) Object which includes:
	*   title Alert Title
	*   body Alert body
	*   buttonSet[label,callback] Array of buttons
	*   style CSS object
	*/
	displayAlert: function( alertObj ) {
		var embedPlayer = this.embedPlayer;
		var callback;
		mw.log( 'PlayerLayoutBuilder::displayAlert:: ' + alertObj.title );
		// Check if callback is external or internal (Internal by default)

		// Check if overlay window is already present:
		if ( embedPlayer.getInterface().find( '.overlay-win' ).length != 0 ) {
			return;
		}
		if( typeof alertObj.callbackFunction == 'string' ) {
		if ( alertObj.isExternal ) {
			try{
				callback = window.parent[ alertObj.callbackFunction ];
			} catch ( e ){
				// could not call parent method
				}
			} else {
				callback = window[ alertObj.callbackFunction ];
			}
		} else if( typeof alertObj.callbackFunction == 'function' ) {
		// Make life easier for internal usage of the listener mapping by supporting
		// passing a callback by function ref
		    callback = alertObj.callbackFunction;
		} else {
			// don't throw an error; display alert callback is optional
			// mw.log( "PlayerLayoutBuilder :: displayAlert :: Error: bad callback type" );
			callback = function() {};
		}

		var $container = $( '<div />' ).addClass( 'alert-container' );
		var $title = $( '<div />' ).text( alertObj.title ).addClass( 'alert-title alert-text' );
		if ( alertObj.props && alertObj.props.titleTextColor ) {
			$title.removeClass( 'alert-text' );
			$title.css( 'color', mw.getHexColor( alertObj.props.titleTextColor ) );
		}
		var $message = $( '<div />' ).html( alertObj.message ).addClass( 'alert-message alert-text' );
		if ( alertObj.isError ) {
			$message.addClass( 'error' );
		}
		if ( alertObj.props && alertObj.props.textColor ) {
			$message.removeClass( 'alert-text' );
			$message.css( 'color', mw.getHexColor( alertObj.props.textColor ) );
		}
		var $buttonsContainer = $( '<div />' ).addClass( 'alert-buttons-container' );
		if ( alertObj.props && alertObj.props.buttonRowSpacing ) {
			$buttonsContainer.css( 'margin-top', alertObj.props.buttonRowSpacing );
		}
		var $buttonSet = alertObj.buttons || [];

		// If no button was passed display just OK button
		var buttonsNum = $buttonSet.length;
		if ( buttonsNum == 0 && !alertObj.noButtons ) {
			$buttonSet = ["OK"];
			buttonsNum++;
		}

		$.each( $buttonSet, function(i) {
			var label = this.toString();
			var $currentButton = $( '<button />' )
			.addClass( 'alert-button' )
				.text( label )
				.click( function( eventObject ) {
					callback( eventObject );
					embedPlayer.layoutBuilder.closeAlert( alertObj.keepOverlay );
				} );
			if ( alertObj.props && alertObj.props.buttonHeight ) {
				$currentButton.css( 'height', alertObj.props.buttonHeight );
			}
			// Apply buttons spacing only when more than one is present
			if (buttonsNum > 1) {
				if (i < buttonsNum-1) {
					if ( alertObj.props && alertObj.props.buttonSpacing ) {
						$currentButton.css( 'margin-right', alertObj.props.buttonSpacing );
					}
				}
			}
			$buttonsContainer.append( $currentButton );
		} );
		$container.append( $title, $message, $buttonsContainer );
		return embedPlayer.layoutBuilder.displayMenuOverlay( $container, false, true );
	},

	/**
	* Get component jQuery element
	*
	* @param {String} componentId Component key to grab html output
	*/
	getDomComponent: function( componentId ) {
		if ( this.components[ componentId ] ) {
			return this.components[ componentId ].o( this );
		} else {
			return false;
		}
	},

	/**
	* Components Object
	* Take in the embedPlayer and return some html for the given component.
	*
	* components can be overwritten by skin javascript
	*
	* Component JSON structure is as follows:
	* 'o' Function to return a binded jQuery object ( accepts the ctrlObject as a parameter )
	* 'w' The width of the component
	* 'h' The height of the component ( if height is undefined the height of the control bar is used )
	*/
	components: {
		/**
		* The Attribution button ( by default this is kaltura-icon
		*/
		'logo2' : {
			'w' : 28,
			'o' : function( ctrlObj ){return $('<span />');
				var buttonConfig = mw.getConfig( 'EmbedPlayer.AttributionButton');
				// Check for source ( by configuration convention this is a 16x16 image
				if( buttonConfig.iconurl ){
					var $icon =  $('<img />')
						.attr('src', buttonConfig.iconurl );
				} else {
					var $icon = $('<span />')
					.addClass( 'ui-icon' );
					if( buttonConfig['class'] ){
						$icon.addClass( buttonConfig['class'] );
					}
				}
				if( typeof buttonConfig.style != 'object'){
					buttonConfig.style = {};
				}
				// update the configured size of the attribution button if we have a specific width configured
				if( buttonConfig.style.width ){
					this.w = parseInt( buttonConfig.style.width );
				} else {
					 buttonConfig.style.width = parseInt( this.w ) + 'px';
				}

				return $( '<div />' )
						.addClass( 'rButton' )
						.css({
							'top' : '1px',
							'left' : '2px'
						})
						// Allow button config style to override
						.css( buttonConfig.style )
						.append(
							$('<a />')
							.attr({
								'href': buttonConfig.href,
								'title' : buttonConfig.title,
								'target' : '_new'
							})
							.append( $icon )
				);
			}
		}
	}
};

} )( window.mediaWiki, window.jQuery );