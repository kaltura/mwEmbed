/**
* Msg text is inherited from embedPlayer
*/

( function( mw, $ ) {"use strict";
/**
* mw.PlayerControlBuilder object
*	@param the embedPlayer element we are targeting
*/
mw.PlayerControlBuilder = function( embedPlayer, options ) {
	return this.init( embedPlayer, options );
};

/**
 * ControlsBuilder prototype:
 */
mw.PlayerControlBuilder.prototype = {
	//Default Local values:

	// Parent css Class name
	playerClass : 'mv-player',

	// Long string display of time value
	longTimeDisp: true,

	// Default volume layout is "vertical"
	volume_layout : 'vertical',

	// Default control bar height
	height: mw.getConfig( 'EmbedPlayer.ControlsHeight' ),

	// Default supported components is merged with embedPlayer set of supported types
	supportedComponents: {
		// All playback types support options
		'options': true
	},

	// Default supported menu items is merged with skin menu items
	supportedMenuItems: {
		// Player Select
		'playerSelect' : true,

		// Download the file menu
		'download' : true,

		// Share the video menu
		'share' : true,

		// Player library link
		'aboutPlayerLibrary': true
	},

	// Flag to store the current fullscreen mode
	inFullScreen: false,
	
	// Flag for full window size players
	isWindowSizePlayer: false,

	// Flag to store if a warning binding has been added
	addWarningFlag: false,

	// Flag to store state of overlay on player
	displayOptionsMenuFlag: false,

	// Local storage of ControlBar Callback
	hideControlBarCallback: false,

	// Flag to store controls status (disabled/enabled)
	controlsDisabled: false,

	// binding postfix
	bindPostfix: '.controlBuilder',
	
	/**
	* Initialization Object for the control builder
	*
	* @param {Object} embedPlayer EmbedPlayer interface
	*/
	init: function( embedPlayer ) {
		var _this = this;
		this.embedPlayer = embedPlayer;

		// Check for skin overrides for controlBuilder
		var skinClass = embedPlayer.skinName.substr(0,1).toUpperCase() + embedPlayer.skinName.substr( 1 );
		if ( mw['PlayerSkin' + skinClass ] ) {

			// Clone as to not override prototype with the skin config
			var _this = $.extend( true, { }, this, mw['PlayerSkin' + skinClass ] );
			return _this;
		}
		// Return the controlBuilder Object:
		return this;
	},

	/**
	* Get the control bar height
	* @return {Number} control bar height
	*/
	getHeight: function(){
		// Check if the configuration was updated
		// Probably will break things to set control bar height config late 
		// but try to support it anyway
		if( mw.getConfig( 'EmbedPlayer.ControlsHeight' ) != this.height ){
			this.height = mw.getConfig( 'EmbedPlayer.ControlsHeight' ) ;
		}
		return this.height;
	},


	/**
	* Add the controls html to player interface
	*/
	addControls: function() {
		// Set up local pointer to the embedPlayer
		var embedPlayer = this.embedPlayer;
        
		// Set up local controlBuilder
		var _this = this;
        
        var originalHeight = $( embedPlayer ).parent().parent().height();

		// Remove any old controls & old overlays:
		embedPlayer.$interface.find( '.control-bar,.overlay-win' ).remove();

		// Reset flags:
		_this.displayOptionsMenuFlag = false;

		// Setup the controlBar container ( starts hidden ) 
		var $controlBar = $('<div />')
			.addClass( 'ui-state-default ui-widget-header ui-helper-clearfix control-bar' )
			.css( 'height', this.height );

		// Controls are hidden by default if overlaying controls: 
		if( _this.isOverlayControls() ){
			$controlBar.hide();
		} else {
				embedPlayer.height =  embedPlayer.$interface.height() - this.getHeight();
				if ( $.browser.mozilla && parseFloat( $.browser.version ) < 2 ) {
	            	embedPlayer.height =  originalHeight - this.getHeight();
				}
				var updatedLayout = { 
						'height' : embedPlayer.height +'px',
						'top' : '0px'
				}
				$( embedPlayer ).css( updatedLayout );
				// update native element height:
				$('#' + embedPlayer.pid ).css( updatedLayout );
		}

		$controlBar.css( {
			'position': 'absolute',
			'bottom' : '0px',
			'left' : '0px',
			'right' : '0px'
		} );

		// Make room for audio controls in the interface: 
		if( embedPlayer.isAudio() && embedPlayer.$interface.height() == 0 ){
			embedPlayer.$interface.css( {
				'height' : this.height
			} );
		}

		// Add the controls to the interface
		embedPlayer.$interface.append( $controlBar );
        
        if ( $.browser.mozilla && parseFloat( $.browser.version ) < 2 ) {
			embedPlayer.triggerHelper( 'resizeIframeContainer', [ {'height' : embedPlayer.height + $controlBar.height() - 1} ] );
        }

		// Add the Controls Component
		this.addControlComponents();

		// Add top level Controls bindings
		this.addControlBindings();
	},

	/**
	* Add control components as defined per this.components
	*/
	addControlComponents: function( ) {
		var _this = this;

		// Set up local pointer to the embedPlayer
		var embedPlayer = this.embedPlayer;

		//Set up local var to control container:
		var $controlBar = embedPlayer.$interface.find( '.control-bar' );

		this.available_width = embedPlayer.getPlayerWidth();

		mw.log( 'PlayerControlsBuilder:: addControlComponents into:' + this.available_width );
		// Build the supportedComponents list
		this.supportedComponents = $.extend( this.supportedComponents, embedPlayer.supports );

		// Check for Attribution button
		if( mw.getConfig( 'EmbedPlayer.AttributionButton' ) && embedPlayer.attributionbutton ){
			this.supportedComponents[ 'attributionButton' ] = true;
		}

		// Check global fullscreen enabled flag
		if( mw.getConfig( 'EmbedPlayer.EnableFullscreen' ) === false ){
			this.supportedComponents[ 'fullscreen'] = false;
		}
		// Check if the options item is available  
		if( mw.getConfig( 'EmbedPlayer.EnableOptionsMenu' ) === false ){
			this.supportedComponents[ 'options'] = false;
		}

		// Check if we have multiple playable sources ( if only one source don't display source switch )
		if( embedPlayer.mediaElement.getPlayableSources().length == 1 ){
			this.supportedComponents[ 'sourceSwitch'] = false;
		}
		
		$( embedPlayer ).trigger( 'addControlBarComponent', this);
		
		var addComponent = function( component_id ){
			if ( _this.supportedComponents[ component_id ] ) {
				if ( _this.available_width > _this.components[ component_id ].w ) {
					// Append the component
					$controlBar.append(
						_this.getComponent( component_id )
					);
					_this.available_width -= _this.components[ component_id ].w;
				} else {
					mw.log( 'PlayerControlBuilder:: Not enough space for control component:' + component_id );
				}
			}
		};

		// Change volumeControl width base on layout
		if( this.volume_layout == 'horizontal' ) {
			this.components.volumeControl.w = 70;
		}
		
		// Output components
		for ( var component_id in this.components ) {
			// Check for (component === false ) and skip
			if( this.components[ component_id ] === false ){
				continue;
			}

			// Special case with playhead and time ( to make sure they are to the left of everything else )
			if ( component_id == 'playHead' || component_id == 'timeDisplay'){
				continue;
			}

			// Skip "fullscreen" button for assets or where height is 0px ( audio )
			if( component_id == 'fullscreen' && this.embedPlayer.isAudio() ){
				continue;
			}
			addComponent( component_id );
		}
		// Add special case remaining components: 
		addComponent( 'timeDisplay' );
		if( this.available_width > 30 ){
			addComponent( 'playHead' );	
		}
		$(embedPlayer).trigger( 'controlBarBuildDone' );
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
		if( !_this.isOverlayControls() ){
			//targetHeight =  targetHeight - this.height;
			windowSize.height = windowSize.height - this.height;
		}
		
		// Set target width
		var targetWidth = windowSize.width;
		var targetHeight = targetWidth * ( 1 / _this.getIntrinsicAspect() );
		// Check if it exceeds the height constraint:
		if( targetHeight > windowSize.height ){
			targetHeight = windowSize.height;
			targetWidth = parseInt( targetHeight * _this.getIntrinsicAspect() );
		}
		var offsetTop = 0;
		//  Move the video down 1/2 of the difference of window height
		offsetTop+= ( targetHeight < windowSize.height )? ( windowSize.height- targetHeight ) / 2 : 0;
		// if the video is very tall in a short window adjust the size:
		var offsetLeft = ( targetWidth < windowSize.width )? parseInt( windowSize.width- targetWidth ) / 2 : 0;

		var position = (mw.isIOS4()) ? 'static' : 'absolute';
		mw.log( 'PlayerControlBuilder::getAspectPlayerWindowCss: ' + ' h:' + targetHeight + ' w:' + targetWidth + ' t:' + offsetTop + ' l:' + offsetLeft );
		return {
			'position' : position,
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
		var img = this.embedPlayer.$interface.find('.playerPoster')[0];
		if( img && img.naturalWidth && img.naturalHeight){
			return img.naturalWidth /  img.naturalHeight
		}
		
		// if all else fails use embedPlayer.getWidth()
		return this.embedPlayer.getWidth() / this.embedPlayer.getHeight()
	},
	
	/**
	* Get the play button css
	*/
	getPlayButtonPosition: function() {
		var _this = this;
		return {
			'position' : 'absolute',
			'left' : '50%',
			'top' : '50%',
			'margin-left' : - .5 * this.getComponentWidth( 'playButtonLarge' ),
			'margin-top' : - .5 * this.getComponentHeight( 'playButtonLarge' )
		};
	},

	/**
	 * Toggles full screen by calling
	 *  doFullScreenPlayer to enable fullscreen mode
	 *  restoreWindowPlayer to restore window mode
	 */
	toggleFullscreen: function( forceClose ) {
		var _this = this;
		// Do normal in-page fullscreen handling: 
		if( this.inFullScreen ){			
			this.restoreWindowPlayer();
		}else {
			this.doFullScreenPlayer();
		}
	},

	/**
	* Do full-screen mode
	*/
	doFullScreenPlayer: function( callback ) {		
		mw.log("PlayerControlBuilder:: doFullScreenPlayer" );
		// Setup pointer to control builder :
		var _this = this;

		// Setup local reference to embed player:
		var embedPlayer = this.embedPlayer;

		// Setup a local reference to the player interface:
		var $interface = embedPlayer.$interface;

		// Check fullscreen state ( if already true do nothing )
		if( this.inFullScreen == true ){
			return ;
		}
		this.inFullScreen = true;
		var triggerOnOpenFullScreen = true;
		
		// if overlaying controls add hide show player binding. 
		if( _this.isOverlayControls() ){
			_this.addFullscreenMouseMoveHideShowControls();
		}
		
		// Store the current scroll location on the iframe: 
		$( embedPlayer ).trigger( 'fullScreenStoreVerticalScroll' );
		
		// Check for native support for fullscreen and we are in an iframe server
		if ( window.fullScreenApi.supportsFullScreen && mw.getConfig('EmbedPlayer.IsIframeServer' ) ) {
			var parentWindow = window.parent; 
			var parentTarget = parentWindow.document.getElementById( this.embedPlayer.id );
			// Add a binding to catch "escape" fullscreen
			parentTarget.addEventListener( fullScreenApi.fullScreenEventName, function( event ) {
				if ( ! parentWindow.fullScreenApi.isFullScreen() ) {
					_this.restoreWindowPlayer();
				}
			});
			// Make the iframe fullscreen:
			parentWindow.fullScreenApi.requestFullScreen( parentTarget );
			
			// There is a bug with mozfullscreenchange event in all versions of firefox with supportsFullScreen 
			// https://bugzilla.mozilla.org/show_bug.cgi?id=724816
			// so we have to have an extra binding to check for size change and then restore. 
			if( $.browser.mozilla ){
				// put in a timeout to give the browser time to ~enter~ fullscreen initially. 
				setTimeout( function(){
					$( window ).bind('resize.postFullScreenResize', function(){
						$(window).unbind( '.postFullScreenResize' );
						_this.restoreWindowPlayer();
					})
				}, 250 );
			}
		}
		
		if( !mw.getConfig('EmbedPlayer.IsIframeServer' ) ){
			var vid = this.embedPlayer.getPlayerElement();
			if( mw.getConfig('EmbedPlayer.EnableIpadNativeFullscreen')
					&&
				vid && vid.webkitSupportsFullscreen 
			){
				this.embedPlayer.getPlayerElement().webkitEnterFullscreen();
				triggerOnOpenFullScreen = false;
			} else {
				this.doFullScreenPlayerDom();
			}
		}
		// Pass on touch move event to parent
		$( document ).bind( 'touchend.fullscreen', function(e){
			$( embedPlayer ).trigger( 'onTouchEnd' );
		});
		if( triggerOnOpenFullScreen ) {
			$( embedPlayer ).trigger( 'onOpenFullScreen' );
		}
		
		// Bind escape to restore in page clip
		$( window ).keyup( function( event ) {
			// Escape check
			if( event.keyCode == 27 ){
				_this.restoreWindowPlayer();
			}
		} );		
		
		// Add a secondary fallback resize ( sometimes iOS loses the $( window ).resize ) binding )
		setTimeout( function(){ _this.syncPlayerSize() }, 50);
		setTimeout( function(){ _this.syncPlayerSize() }, 200);
	},
	syncPlayerSize: function(){
		var embedPlayer = this.embedPlayer;
		mw.log( "PlayerControlBuilder::syncPlayerSize: window:" +  $(window).width() + ' player: ' + $( embedPlayer ).width() );
		// resize to the playlist  container
		// TODO  change this to an event so player with interface around it ( ppt widget etc ) can
		// set the player to the right size. 
		if( embedPlayer.playlist && ! this.inFullScreen ){
			embedPlayer.playlist.syncPlayerSize();
		} else {
			embedPlayer.resizePlayer( this.getWindowSize() );
		}
	},
	getWindowSize: function(){
		return {
			'width' : $(window).width(),
			'height' : $(window).height()
		};
	},
	doFullScreenPlayerDom: function(){
		var _this = this;
		var embedPlayer = this.embedPlayer;
		var $interface = embedPlayer.$interface;
		
		// Remove any old mw-fullscreen-overlay
		$( '.mw-fullscreen-overlay' ).remove();

		// Special hack for mediawiki monobook skin search box
		if( $( '#p-search,#p-logo' ).length ) {
			$( '#p-search,#p-logo,#ca-nstab-project a' ).css('z-index', 1);
		}

		// Add the css fixed fullscreen black overlay as a sibling to the video element
		$interface.after(
			$( '<div />' )
			.addClass( 'mw-fullscreen-overlay' )
			// Set some arbitrary high z-index
			.css('z-index', mw.getConfig( 'EmbedPlayer.FullScreenZIndex' ) )
			.hide()
			.fadeIn("slow")
		);
		
		// get the original interface to absolute positioned:
		if( ! this.windowPositionStyle  ){
			this.windowPositionStyle = $interface.css( 'position' );
		}
		if( !this.windowZindex ){
			this.windowZindex = $interface.css( 'z-index' );
		}
		// Get the base offset:
		this.windowOffset = this.getWindowOffset();
		
		// Change the z-index of the interface
		$interface.css( {
			'position' : 'fixed',
			'z-index' : mw.getConfig( 'EmbedPlayer.FullScreenZIndex' ) + 1,
			'top' : this.windowOffset.top,
			'left' : this.windowOffset.left
		} );
		
		// If native persistent native player update z-index:
		if( embedPlayer.isPersistentNativePlayer() ){
			$( embedPlayer.getPlayerElement() ).css( {
				'z-index': mw.getConfig( 'EmbedPlayer.FullScreenZIndex' ) + 1,
				'position': 'absolute'
			});
		}

		// Empty out the parent absolute index
		_this.parentsAbsolute = [];

		// Hide the body scroll bar
		$('body').css( 'overflow', 'hidden' );

		var topOffset = '0px';
		var leftOffset = '0px';

		// Check if we have an offsetParent
		if( $interface.offsetParent()[0].tagName 
				&& 
			$interface.offsetParent()[0].tagName.toLowerCase() != 'body' ) 
		{
			topOffset = -this.windowOffset.top + 'px';
			leftOffset = -this.windowOffset.left + 'px';
		}


		// Set the player height width:
		$( embedPlayer ).css( {
			'position' : 'relative'
		} );

		// Overflow hidden in fullscreen:
		$interface.css( 'overlow', 'hidden' );
		
		// only animate if we are not inside an iframe
		var aninmate = !mw.getConfig( 'EmbedPlayer.IsIframeServer' );
		
		// Resize the player keeping aspect and with the widow scroll offset:
		embedPlayer.resizePlayer({
			'top' : topOffset,
			'left' : leftOffset,
			'width' : $( window ).width(),
			'height' : $( window ).height()
		}, aninmate, function(){
			_this.displayFullscreenTip();
		});

		// Remove absolute css of the interface parents
		$interface.parents().each( function() {
			//mw.log(' parent : ' + $( this ).attr('id' ) + ' class: ' + $( this ).attr('class') + ' pos: ' + $( this ).css( 'position' ) );
			if( $( this ).css( 'position' ) == 'absolute' ) {
				_this.parentsAbsolute.push( $( this ) );
				$( this ).css( 'position', null );
				mw.log( 'PlayerControlBuilder::  should update position: ' + $( this ).css( 'position' ) );
			}
		});

		// Bind resize resize window to resize window
		$( window ).resize( function() {
			if( _this.inFullScreen ){
				// don't resize bellow original size: 
				var targetSize = {
					'width' : $( window ).width(),
					'height' : $( window ).height()
				};
				if( targetSize.width < embedPlayer.getWidth() ){
					targetSize.width = embedPlayer.getWidth();
				}
				if( targetSize.height < embedPlayer.getHeight() ){
					targetSize.height =  embedPlayer.getHeight();
				}
				embedPlayer.resizePlayer( targetSize );
			}
		});

		// Bind escape to restore in page clip
		$( window ).keyup( function( event ) {
			// Escape check
			if( event.keyCode == 27 ){
				_this.restoreWindowPlayer();
			}
		} );
	},
	addFullscreenMouseMoveHideShowControls:function(){
		var _this = this;
		// Bind mouse move in interface to hide control bar
		_this.mouseMovedFlag = false;
		_this.embedPlayer.$interface.mousemove( function(e){
			_this.mouseMovedFlag = true;
		});
		
		// Check every 2 seconds reset flag status if controls are overlay
		var checkMovedMouse = function(){
			if( _this.inFullScreen ){
				if( _this.mouseMovedFlag ){
					_this.mouseMovedFlag = false;
					_this.showControlBar();
					// Once we move the mouse keep displayed for 3 seconds
					setTimeout(checkMovedMouse, 3000);
				} else {
					// Check for mouse movement every 250ms
					_this.hideControlBar();
					setTimeout(checkMovedMouse, 250 );
				}
				return;
			}
		};
		// always initially show the control bar: 
		_this.showControlBar();
		// start monitoring for moving mouse
		checkMovedMouse();
	},
	getWindowOffset: function(){
		var windowOffset = this.embedPlayer.$interface.offset();
		windowOffset.top = windowOffset.top - $(document).scrollTop();
		windowOffset.left = windowOffset.left - $(document).scrollLeft();
		this.windowOffset = windowOffset;
		return this.windowOffset;
	},
	// Display a fullscreen tip if configured to do and the browser supports it. 
	displayFullscreenTip: function(){
		var _this = this;
		// Mobile devices don't have f11 key 
		if( mw.isMobileDevice() ){
			return ;
		}
		// Safari does not have a DOM fullscreen ( no subtitles, no controls )
		if( $.browser.safari && ! /chrome/.test( navigator.userAgent.toLowerCase() ) ){
			return ;
		}
		
		// mobile chrome also has no f11 key ( and does not yet support true fullscreen ) 
		if( mw.isMobileChrome() ){
			return ;
		}
		
		// OSX has a different short cut than windows and liux
		var toolTipMsg = ( navigator.userAgent.indexOf('Mac OS X') != -1 )?
				gM( 'mwe-embedplayer-fullscreen-tip-osx') : 
				gM( 'mwe-embedplayer-fullscreen-tip');
		
		var $targetTip = this.addWarningBinding( 'EmbedPlayer.FullscreenTip', 
			$('<h3/>').html( 
				toolTipMsg
			)
		);
		
		// Display the target warning: 
		$targetTip.show(); 
		
		var hideTip = function(){ 
			mw.setConfig('EmbedPlayer.FullscreenTip', false );
			$targetTip.fadeOut('fast'); 
		};
		
		// Hide fullscreen tip if:
		// We leave fullscreen, 
		$( this.embedPlayer ).bind( 'onCloseFullScreen', hideTip );
		// After 5 seconds,
		setTimeout( hideTip, 5000 );
		// Or if we catch an f11 button press
		$( document ).keyup( function( event ){
			if( event.keyCode == 122 ){
				hideTip();
			}
			return true;
		});
	},

	/**
	* Restore the window player
	*/
	restoreWindowPlayer: function() {
		var _this = this;
		mw.log("PlayerControlBuilder :: restoreWindowPlayer" );
		var embedPlayer = this.embedPlayer;
		embedPlayer.$interface.css({'position':'relative'});
	  
		// Check if fullscreen mode is already restored: 
		if( this.inFullScreen === false ){
			return ;
		}
		// Set fullscreen mode to false
		this.inFullScreen = false;

		// Check for native support for fullscreen and support native fullscreen restore
		if ( window.fullScreenApi.supportsFullScreen && mw.getConfig('EmbedPlayer.IsIframeServer' ) ) {
			var parentWindow = window.parent; 
			var parentTarget = parentWindow.document.getElementById( this.embedPlayer.id );
			parentWindow.fullScreenApi.cancelFullScreen( parentTarget );
		}

		// Check if iFrame mode ( fullscreen is handled by the iframe parent dom )
		if( !mw.getConfig('EmbedPlayer.IsIframeServer' ) ){
			this.restoreWindowPlayerDom();
		} else {
			// if an iframe server make sure the player size is in sync with the iframe window size: 
			// ( iPad sometimes does not fire resize events ) 
			if( this.isWindowSizePlayer ){
				setTimeout( function(){_this.syncPlayerSize()}, 50);
				setTimeout( function(){_this.syncPlayerSize()}, 200);
			}
		}
		// Restore scrolling on iPad
		$( document ).unbind( 'touchend.fullscreen' );
		// Trigger the onCloseFullscreen event: 
		$( embedPlayer ).trigger( 'onCloseFullScreen' );
	},
	restoreWindowPlayerDom:function(){
		var _this = this;
		// local ref to embedPlayer: 
		var embedPlayer = this.embedPlayer; 
		
		var $interface = embedPlayer.$interface;
		var interfaceHeight = ( _this.isOverlayControls() )
			? embedPlayer.getHeight()
			: embedPlayer.getHeight() + _this.getHeight();
	
		// only animate if we are not inside an iframe
		var aninmate = !mw.getConfig( 'EmbedPlayer.IsIframeServer' );
			
		mw.log( 'restoreWindowPlayer:: h:' + interfaceHeight + ' w:' + embedPlayer.getWidth());
		$('.mw-fullscreen-overlay').fadeOut( 'slow' );
	
		mw.log( 'restore embedPlayer:: ' + embedPlayer.getWidth() + ' h: ' + embedPlayer.getHeight() );
		
		// Restore the player:
		embedPlayer.resizePlayer( {
			'top' : _this.windowOffset.top + 'px',
			'left' : _this.windowOffset.left + 'px',
			'width' : embedPlayer.getWidth(),
			'height' : embedPlayer.getHeight()
		}, aninmate, function(){
			var topPos = {
				'position' : _this.windowPositionStyle,
				'z-index' : _this.windowZindex,
				'overlow' : 'visible',
				'top' : '0px',
				'left' : '0px'
			};
			// Restore non-absolute layout:
			$( [ $interface, $interface.find('.playerPoster'), embedPlayer ] ).css( topPos );
			if( embedPlayer.getPlayerElement() ){
				$( embedPlayer.getPlayerElement() )
					.css( topPos )
			}
			// Restore the body scroll bar
			$('body').css( 'overflow', 'auto' );
			
			// If native player restore z-index:
			if( embedPlayer.isPersistentNativePlayer() ){
				$( embedPlayer.getPlayerElement() ).css( {
					'z-index': 'auto'
				});
			}
		});
	},
	/**
	 * Resize the player to a target size keeping aspect ratio
	 */
	resizePlayer: function( size, animate, resizePlayercallback ){
		var embedPlayer = this.embedPlayer;
		var _this = this;
		mw.log( "ControlBuilder:: resizePlayer: w:" +  size.width + ' h:' + size.height );
		// trigger the resize event: 
		$( embedPlayer ).trigger( 'onResizePlayer', [size, animate] );
		// proxy the callback to send a onResizePlayerDone event: 
		var callback = function(){
			if( $.isFunction( resizePlayercallback ) ){
				resizePlayercallback();	
			}
			$( embedPlayer ).trigger( 'onResizePlayerDone', [size, animate] );
		}
		
		
		// Don't resize / re position the player if we have a keep off screen flag
		if( embedPlayer.keepPlayerOffScreenFlag ){
			callback();
			return ;
		}
		
		// Check if we are native display then resize the playerElement directly
		if( embedPlayer.useNativePlayerControls() ){
			if( animate ){
				$( embedPlayer.getPlayerElement() ).animate( size , callback);
			} else {
				$( embedPlayer.getPlayerElement() ).css( size );
				callback();
			}
			return ;
		}
		
		// Update interface container:
		var interfaceCss = {
			'top' : ( size.top ) ? size.top : '0px',
			'left' : ( size.left ) ? size.left : '0px',
			'width' : size.width,
			'height' : size.height
		};
		// Set up local pointer to interface:
		var embedPlayer = this.embedPlayer;
		var $interface = embedPlayer.$interface;
		var targetAspectSize = _this.getAspectPlayerWindowCss( size );
		
		// Setup button scale to not reflect controls offset  
		var buttonScale = $.extend( {}, interfaceCss);
		if( !_this.isOverlayControls() ){
			buttonScale['height'] =  buttonScale['height'] - this.getHeight();
		}
		
		if( animate ){
			$interface.animate( interfaceCss );
			
			$interface.find('.playerPoster' ).animate( targetAspectSize  );
			
			// Update play button pos
			$interface.find('.play-btn-large' ).animate(  _this.getPlayButtonPosition() );
			
			if( embedPlayer.getPlayerElement() ){
				$( embedPlayer.getPlayerElement() ).animate( interfaceCss );
			}
			
			// Update player container size:
			$( embedPlayer ).animate(  interfaceCss, function(){
				// if a spinner is displayed re-add to center: 
				if( $( '#loadingSpinner_' + embedPlayer.id ).length ){
					embedPlayer.addPlayerSpinner();
				}
				callback();
			});
		} else {
			$interface.css( interfaceCss );
			// Update player size
			$( embedPlayer ).css( targetAspectSize );
			
			if( embedPlayer.getPlayerElement() ){
				// on android size is screwed up
				if( !mw.isAndroid40() ){
					$( embedPlayer.getPlayerElement() ).css( targetAspectSize );
				}
			}
			// Update play button pos
			$interface.find('.play-btn-large' ).css(  _this.getPlayButtonPosition() );
			
			// if a spinner is displayed re-add to center: 
			if( $( '#loadingSpinner_' + embedPlayer.id ).length ){
				embedPlayer.addPlayerSpinner();
			}
			callback();
		}
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
		var _this = this;
		var $interface = embedPlayer.$interface;

		_this.onControlBar = false;

		// Remove any old interface bindings
		$( embedPlayer ).unbind( this.bindPostfix );

		var bindFirstPlay = false;		
		_this.addRightClickBinding();

		// check if the player takes up the full window size: 
		if( $( embedPlayer ).width() == $(window).width() ){
			this.isWindowSizePlayer = true;
		}
		
		// add the player click bindings
		_this.addPlayerClickBindings();
		
		// Bind into play.ctrl namespace ( so we can unbind without affecting other play bindings )
		$(embedPlayer).bind('onplay' + this.bindPostfix, function() { //Only bind once played
			// add right click binding again ( in case the player got swaped )
			_this.addRightClickBinding();
		});
		
		// Bind to EnableInterfaceComponents
		$( embedPlayer ).bind( 'onEnableInterfaceComponents' + this.bindPostfix, function() {
			_this.controlsDisabled = false;
			_this.addPlayerClickBindings();
		});

		// Bind to DisableInterfaceComponents
		$( embedPlayer ).bind( 'onDisableInterfaceComponents' + this.bindPostfix, function() {
			_this.controlsDisabled = true;
			_this.removePlayerClickBindings();
		});
		
		
		var bindSpaceUp = function(){
			$(window).bind('keyup' + _this.bindPostfix, function(e) {
				if( e.keyCode == 32 ) {
					if(embedPlayer.paused) {
						embedPlayer.play();
					} else {
						embedPlayer.pause();
					}
					return false;
				}
			});
		};
		
		var bindSpaceDown = function() {
			$(window).unbind( 'keyup' + _this.bindPostfix );
		};
		// Add hide show bindings for control overlay (if overlay is enabled )
		if( ! _this.isOverlayControls() ) {
			$interface
				.show()
				.hover( bindSpaceUp, bindSpaceDown );
			
			// include touch start pause binding
			$( embedPlayer).bind( 'touchstart' + this.bindPostfix, function() {
				mw.log( "PlayerControlBuilder:: touchstart:"  + ' isPause:' + embedPlayer.paused);
				if( embedPlayer.paused ) {
					embedPlayer.play();
				} else {
					embedPlayer.pause();
				}
			});
		} else { // hide show controls:
			
			// Bind a startTouch to show controls
			$( embedPlayer).bind( 'touchstart' + this.bindPostfix, function() {
				if ( embedPlayer.$interface.find( '.control-bar' ).is( ':visible' ) ) {
					if( embedPlayer.paused ) {
						embedPlayer.play();
					} else {
						embedPlayer.pause();
					}
				} else {
					_this.showControlBar();
                }
				clearTimeout( _this.hideControlBarCallback );
				_this.hideControlBarCallback = setTimeout( function() {
					_this.hideControlBar()
				}, 5000 );
				// ( Once the user touched the video "don't hide" )
				return true;
			} );

			var hoverIntentConfig = {
					'sensitivity': 100,
					'timeout' : 1000,
					'over' : function(e){
						// Clear timeout on IE9
						if( mw.isIE9() ) {
							clearTimeout(_this.hideControlBarCallback);
							_this.hideControlBarCallback = false;
						}
						// Show controls with a set timeout ( avoid fade in fade out on short mouse over )
						_this.showControlBar();
						bindSpaceUp();
					},
					'out' : function(e){
						_this.hideControlBar();
						bindSpaceDown();
					}
				};
			
			// Check if we should display the interface: 
			// special check for IE9 ( does not count hover on non-visiable inerface div
			if( mw.isIE9() ){
				$( embedPlayer.getPlayerElement() ).hoverIntent( hoverIntentConfig );

				// Add hover binding to control bar
				embedPlayer.$interface.find( '.control-bar' ).hover( function(e) {
					_this.onControlBar = true;
					embedPlayer.$interface.find( '.control-bar' ).show();
				}, function( e ) {
					if (!_this.hideControlBarCallback) {
						_this.hideControlBarCallback = setTimeout(function(){
							_this.hideControlBar();
						},1000);
					}
					_this.onControlBar = false;
				});
				
			} else {
				// add hover binding if not mobile chrome or iPad ( other mobile devices
				// use the native player ) 
				if ( !mw.isIpad() && !mw.isMobileChrome() ) {
					$interface.hoverIntent( hoverIntentConfig );
				}
			}
			
		}

		// Add recommend firefox if we have non-native playback:
		if ( _this.checkNativeWarning( ) ) {
			_this.addWarningBinding(
				'EmbedPlayer.ShowNativeWarning',
				gM( 'mwe-embedplayer-for_best_experience' )
			);
		}

		// Do png fix for ie6
		if ( $.browser.msie && $.browser.version <= 6 ) {
			$( '#' + embedPlayer.id + ' .play-btn-large' ).pngFix();
		}

		this.doVolumeBinding();

		// Check if we have any custom skin Bindings to run
		if ( this.addSkinControlBindings && typeof( this.addSkinControlBindings ) == 'function' ){
			this.addSkinControlBindings();
		}

		mw.log( 'trigger::addControlBindingsEvent' );
		$( embedPlayer ).trigger( 'addControlBindingsEvent' );
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
			if( _this.inFullScreen ){
				e.preventDefault();
			}
		};
		// Remove old click bindings before adding: 
		this.removePlayerClickBindings();
		
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
			mw.log( "PlayerControlBuilder:: click:"  + ' isPause:' + embedPlayer.paused);
			// Don't do anything if native controls displayed:
			if( embedPlayer.useNativePlayerControls() || _this.isControlsDisabled() || mw.isIpad() || mw.isMobileChrome() ) {
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
	/**
	* Hide the control bar.
	*/
	hideControlBar : function(){
		var animateDuration = 'fast';
		var _this = this;

		// Do not hide control bar if overlay menu item is being displayed:
		if( _this.displayOptionsMenuFlag || _this.keepControlBarOnScreen ) {
			setTimeout( function(){
				_this.hideControlBar();
			}, 200 );
			return ;
		}

		// IE9: If the user mouse is on the control bar, don't hide it
		if( this.onControlBar === true ) {
			return ;
		}
		
		// Hide the control bar
		this.embedPlayer.$interface.find( '.control-bar')
			.fadeOut( animateDuration );
		//mw.log('about to trigger hide control bar')
		// Allow interface items to update: 
		$( this.embedPlayer ).trigger('onHideControlBar', {'bottom' : 15} );

	},
	restoreControlsHover:function(){
		if( this.isOverlayControls() ){
			this.keepControlBarOnScreen = false;
		}
	},
	/**
	* Show the control bar
	*/
	showControlBar: function( keepOnScreen ){
		var animateDuration = 'fast';
		if(! this.embedPlayer )
			return ;
		
		if( this.embedPlayer.getPlayerElement && ! this.embedPlayer.isPersistentNativePlayer() ){
			$( this.embedPlayer.getPlayerElement() ).css( 'z-index', '1' );
		}
		mw.log( 'PlayerControlBuilder:: ShowControlBar,  keep on screen: ' + keepOnScreen );
		
		// Show interface controls
		this.embedPlayer.$interface.find( '.control-bar' )
			.fadeIn( animateDuration );
		
		if( keepOnScreen ){
			this.keepControlBarOnScreen = true;
		}
		
		// Trigger the screen overlay with layout info: 
		$( this.embedPlayer ).trigger( 'onShowControlBar', {'bottom' : this.getHeight() + 15} );		
	},

	/**
	* Checks if the browser supports overlays and the controlsOverlay is
	* set to true for the player or via config
	*/
	isOverlayControls: function(){
		//if the player "supports" overlays:
		if( ! this.embedPlayer.supports['overlays'] ){
			return false;
		}

		// If disabled via the player
		if( this.embedPlayer.overlaycontrols === false ){
			return false;
		}
		
		// Don't overlay controls if in audio mode: 
		if( this.embedPlayer.isAudio() ){
			return false;
		}


		// If the config is false
		if( mw.getConfig( 'EmbedPlayer.OverlayControls' ) === false){
			return false;
		}

		if( this.embedPlayer.controls === false ){
			return false;
		}
		
		// Past all tests OverlayControls is true:
		return true;
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
	checkNativeWarning: function( ) {
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
			( mw.EmbedTypes.getMediaPlayers().getMIMETypePlayers( 'video/h264' ).length
			&& this.embedPlayer.mediaElement.getSources( 'video/h264' ).length )
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
	*
	*/
	addWarningBinding: function( preferenceId, warningMsg ) {
		mw.log( 'mw.PlayerControlBuilder: addWarningBinding: ' + preferenceId + ' wm: ' + warningMsg);
		// Set up local pointer to the embedPlayer
		var embedPlayer = this.embedPlayer;
		var _this = this;
		// make sure the player is large enough 
		if( embedPlayer.getWidth() < 200 ){
			return false;
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
			'display' : 'none',
			'background' : '#FFF',
			'color' : '#111',
			'top' : '10px',
			'left' : '10px',
			'right' : '10px',
			'padding' : '4px',
			'z-index' : 2
		})
		.html( warningMsg );
	
		$( embedPlayer ).append(
			$targetWarning 
		);
	
		$targetWarning.append(
			$('<br />')
		);
	
		$targetWarning.append(
			$( '<input type="checkbox" />' )
			.attr({
				'id' : 'ffwarn_' + embedPlayer.id,
				'name' : 'ffwarn_' + embedPlayer.id
			})
			.click( function() {
				mw.log("WarningBindinng:: set " + preferenceId + ' to hidewarning ' );
				// Set up a cookie for 30 days:
				$.cookie( preferenceId, 'hidewarning', {expires: 30} );
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
		$targetWarning.hide();
		
		$( embedPlayer ).hoverIntent({
			'timeout': 2000,
			'over': function() {
				// don't do the overlay if already playing
				if( embedPlayer.isPlaying() ){
					return ;
				}
				
				// Check the global config before showing the warning
				if ( mw.getConfig( preferenceId ) === true && $.cookie( preferenceId ) != 'hidewarning' ){
					mw.log("WarningBindinng:: show warning " + mw.getConfig( preferenceId ) + ' cookie: '+ $.cookie( preferenceId ) + 'typeof:' + typeof $.cookie( preferenceId ));
					$targetWarning.fadeIn( 'slow' );
				};
			},
			'out': function() {
				$targetWarning.fadeOut( 'slow' );
			}
		});
		return $targetWarning;
	},

	/**
	* Binds the volume controls
	*/
	doVolumeBinding: function( ) {
		var embedPlayer = this.embedPlayer;
		var _this = this;
		embedPlayer.$interface.find( '.volume_control' ).unbind().buttonHover().click( function() {
			mw.log( 'Volume control toggle' );
			embedPlayer.toggleMute();
		} );

		// Add vertical volume display hover
		if ( this.volume_layout == 'vertical' ) {
			// Default volume binding:
			var hoverOverDelay = false;
			var $targetvol = embedPlayer.$interface.find( '.vol_container' ).hide();
			embedPlayer.$interface.find( '.volume_control' ).hover(
				function() {
					$targetvol.addClass( 'vol_container_top' );
					// Set to "below" if playing and embedType != native
					if ( embedPlayer && embedPlayer.isPlaying && embedPlayer.isPlaying() && !embedPlayer.supports['overlays'] ) {
						$targetvol.removeClass( 'vol_container_top' ).addClass( 'vol_container_below' );
					}
					$targetvol.fadeIn( 'fast' );
					hoverOverDelay = true;
				},
				function() {
					hoverOverDelay = false;
					setTimeout( function() {
						if ( !hoverOverDelay ) {
							$targetvol.fadeOut( 'fast' );
						}
					}, 500 );
				}
			);
		}
		var userSlide=false;
		// Setup volume slider:
		var sliderConf = {
			range: "min",
			value: 80,
			min: 0,
			max: 100,
			slide: function( event, ui ) {
				var percent = ui.value / 100;
				mw.log('PlayerControlBuilder::slide:update volume:' + percent);
				embedPlayer.setVolume( percent );
				userSlide = true;
			},
			change: function( event, ui ) {
				var percent = ui.value / 100;
				if ( percent == 0 ) {
					embedPlayer.$interface.find( '.volume_control span' ).removeClass( 'ui-icon-volume-on' ).addClass( 'ui-icon-volume-off' );
				} else {
					embedPlayer.$interface.find( '.volume_control span' ).removeClass( 'ui-icon-volume-off' ).addClass( 'ui-icon-volume-on' );
				}
				mw.log('PlayerControlBuilder::change:update volume:' + percent);
				embedPlayer.setVolume( percent, userSlide );
				userSlide = false;
			}
		};

		if ( this.volume_layout == 'vertical' ) {
			sliderConf[ 'orientation' ] = "vertical";
		}

		embedPlayer.$interface.find( '.volume-slider' ).slider( sliderConf );
	},

	/**
	* Get the options menu ul with li menu items
	*/
	getOptionsMenu: function( ) {
		var $optionsMenu = $( '<ul />' );
		for( var menuItemKey in this.optionMenuItems ){

			// Make sure its supported in the current controlBuilder config:
			if( $.inArray( menuItemKey, mw.getConfig( 'EmbedPlayer.EnabledOptionsMenuItems' ) ) === -1 ) {
			 	continue;
			}

			$optionsMenu.append(
				this.optionMenuItems[ menuItemKey ]( this )
			);
		}
		return $optionsMenu;
	},

	/**
	* Allow the controlBuilder to do interface actions onDone
	*/
	onClipDone: function(){
		// Related videos could be shown here
	},

	/**
	 * The ctrl builder updates the interface on seeking
	 */
	onSeek: function(){
		//mw.log( "controlBuilder:: onSeek" );
		// Update the interface:
		this.setStatus( gM( 'mwe-embedplayer-seeking' ) );
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
		if( this.embedPlayer.$interface ){
			this.embedPlayer.$interface.find( '.time-disp' ).text( value );
		}
	},

	/**
	* Option menu items
	*
	* @return
	* 	'li' a li line item with click action for that menu item
	*/
	optionMenuItems: {
		
		/*
		 * Commented out, replaced by flavor selector
		 * TODO: need to remove all switch player related code
		// Player select menu item
		'playerSelect': function( ctrlObj ){
			if( mw.isIpad() ){
				return [];
			}
			return $.getLineItem(
				gM( 'mwe-embedplayer-choose_player' ),
				'gear',
				function( ) {
					ctrlObj.displayMenuOverlay(
						ctrlObj.getPlayerSelect()
					);
				}
			);
		},
		*/
	    /*
		 * Commented out, replaced by 'download button' configured by uiConf
		 * TODO: need to remove all related code
		// Download the file menu
		'download': function( ctrlObj ) {
			if( mw.isIpad() ) return false;
			return $.getLineItem(
				 gM( 'mwe-embedplayer-download' ),
				'disk',
				function( ) {
					ctrlObj.displayMenuOverlay( gM('mwe-loading_txt' ) );
					// Call show download with the target to be populated
					ctrlObj.showDownload(
						ctrlObj.embedPlayer.$interface.find( '.overlay-content' )
					);
					$( ctrlObj.embedPlayer ).trigger( 'showDownloadEvent' );
				}
			);
		},
		*/
		// Share the video menu
		'share': function( ctrlObj ) {
			return $.getLineItem(
				gM( 'mwe-embedplayer-share' ),
				'mail-closed',
				function( ) {
					ctrlObj.displayMenuOverlay(
						ctrlObj.getShare()
					);
					$( ctrlObj.embedPlayer ).trigger( 'showShareEvent' );
				}
			);
		},

		'aboutPlayerLibrary' : function( ctrlObj ){
			return $.getLineItem(
					gM( 'mwe-embedplayer-about-library' ),
					'info',
					function( ) {
						ctrlObj.displayMenuOverlay(
							ctrlObj.aboutPlayerLibrary()
						);
						$( ctrlObj.embedPlayer ).trigger( 'aboutPlayerLibrary' );
					}
				);
		}
	},

	/**
	* Close a menu overlay
	*/
	closeMenuOverlay: function(){
		var _this = this;
		var embedPlayer = this.embedPlayer;
		var $overlay = embedPlayer.$interface.find( '.overlay-win,.ui-widget-overlay,.ui-widget-shadow' );

		this.displayOptionsMenuFlag = false;
		//mw.log(' closeMenuOverlay: ' + this.displayOptionsMenuFlag);

		$overlay.fadeOut( "slow", function() {
			$overlay.remove();
		} );
		
		// Show the big play button: ( if not in an ad .. TODO clean up ) 
		if( embedPlayer.isStopped() && 
				( 
					embedPlayer.sequenceProxy && 
					embedPlayer.sequenceProxy.isInSequence == false
				)
		){
			embedPlayer.$interface.find( '.play-btn-large' ).fadeIn( 'slow' );
		}

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
		mw.log( 'mw.PlayerControlBuilder:: displayMenuOverlay' );
		//	set the overlay display flag to true:
		this.displayOptionsMenuFlag = true;

		if ( !this.supportedComponents[ 'overlays' ] ) {
			embedPlayer.stop();
		}


		// Hide the big play button:
		embedPlayer.hideLargePlayBtn();

		// Check if overlay window is already present:
		if ( embedPlayer.$interface.find( '.overlay-win' ).length != 0 ) {
			//Update the content
			embedPlayer.$interface.find( '.overlay-content' ).html(
				overlayContent
			);
			return ;
		}

		// Add an overlay
		embedPlayer.$interface.append(
			$('<div />')
			.addClass( 'ui-widget-overlay' )
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
            .addClass( 'ui-state-default ui-corner-all ui-icon_link rButton')
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
		    
		var controlBar_height = embedPlayer.$interface.find( '.control-bar' ).height();
		var overlay_width = (embedPlayer.getWidth() - 30);
		var overlay_height = (embedPlayer.getHeight() - (controlBar_height + 30));
		var overlay_top = (( (embedPlayer.$interface.height() - controlBar_height) - overlay_height) / 2);
		var overlay_left = ((embedPlayer.$interface.width() - overlay_width) / 2);
		
		var overlayMenuCss = {
			'height' : overlay_height + 'px',
			'width' : overlay_width + 'px',
			'position' : 'absolute',
			'top' : overlay_top + 'px',
			'left': overlay_left + 'px',
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

		// Clone the overlay menu css:
		var shadowCss = jQuery.extend( true, {}, overlayMenuCss );
		shadowCss['height' ] = 210;
		shadowCss['width' ] = 260;
		shadowCss[ 'z-index' ] = 2;
		var $overlayShadow = $( '<div />' )
			.addClass('ui-widget-shadow ui-corner-all')
			.css( shadowCss );

		// Append the overlay menu to the player interface
		embedPlayer.$interface.prepend(
			$overlayMenu
			//,$overlayShadow
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
    closeAlert: function() {
		var embedPlayer = this.embedPlayer;
        var $alert = $( '#alertContainer' );
        
        mw.log( 'mw.PlayerControlBuilder::closeAlert' );
        embedPlayer.controlBuilder.closeMenuOverlay();
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
    *   
    */
    displayAlert: function( alertObj ) {
		var embedPlayer = this.embedPlayer;
        var callback;
		mw.log( 'mw.PlayerControlBuilder::displayAlert:: ' + alertObj.title );
        // Check if callback is external or internal (Internal by default)

        // Check if overlay window is already present:
		if ( embedPlayer.$interface.find( '.overlay-win' ).length != 0 ) {
            return;
        }
        if( typeof alertObj.callbackFunction == 'string' ) {
            if ( alertObj.isExternal ) {
                // TODO better support of running external JS functions, instead of window.parent
                callback = window.parent[ alertObj.callbackFunction ];
            }
            else {
                callback = window[ alertObj.callbackFunction ];
            }
        } else if( typeof alertObj.callbackFunction == 'function' ) {
            // Make life easier for internal usage of the listener mapping by supporting
            // passing a callback by function ref
            callback = alertObj.callbackFunction;
        } else {
            mw.log( "mw.PlayerControlBuilder::Error : bad callback type" );
            return ;
        }
        
        var $container = $( '<div />' ).attr( 'id', 'alertContainer' ).addClass( 'alert-container' );
        var $title = $( '<div />' ).text( alertObj.title ).addClass( 'alert-title alert-text' );
        if ( alertObj.props && alertObj.props.titleTextColor ) {
            $title.removeClass( 'alert-text' );
            $title.css( 'color', mw.getHexColor( alertObj.props.titleTextColor ) );
        }
        var $message = $( '<div />' ).text( alertObj.message ).addClass( 'alert-message alert-text' );
        if ( alertObj.props && alertObj.props.textColor ) {
            $message.removeClass( 'alert-text' );
            $message.css( 'color', mw.getHexColor( alertObj.props.textColor ) );
        }
        var $buttonsContainer = $( '<div />' ).addClass( 'alert-buttons-container' );
        if ( alertObj.props && alertObj.props.buttonRowSpacing ) {
            $buttonsContainer.css( 'margin-top', alertObj.props.buttonRowSpacing );
        }
        var $buttonSet = alertObj.buttons;
        
        // If no button was passed display just OK button
        var buttonsNum = $buttonSet.length;
        if ( buttonsNum == 0 ) {
            $buttonSet = ["OK"];
            buttonsNum++;
        }
        
        $.each( $buttonSet, function(i) {
            var label = this.toString();
            var $currentButton = $( '<button />' )
                .css( {'padding' : '5px', 'font-size' : '12px'} )
                .text( label )
                .click( function( eventObject ) {
                    callback( eventObject );
                    embedPlayer.controlBuilder.closeAlert();
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
        } )
        $container.append( $title, $message, $buttonsContainer );
        return embedPlayer.controlBuilder.displayMenuOverlay( $container, false, true );
    },
    
	aboutPlayerLibrary: function(){
		return $( '<div />' )
			.append(
				$( '<h2 />' )
					.text(
						gM('mwe-embedplayer-about-library')
					)
				,
				$( '<span />')
					.append(
						gM('mwe-embedplayer-about-library-desc',
							$('<a />').attr({
								'href' : mw.getConfig( 'EmbedPlayer.LibraryPage' ),
								'target' : '_new'
							})
						)
					)
			);
	},
	/**
	* Get the "share" interface
	*
	* TODO share should be enabled via <embed> tag usage to be compatible
	* with sites social networking sites that allow <embed> tags but not js
	*
	* @param {Object} $target Target jQuery object to set share html
	*/
	getShare: function( ) {
		var embedPlayer = this.embedPlayer;
		var	embed_code = embedPlayer.getSharingEmbedCode();
		var _this = this;

		var $shareInterface = $('<div />');

		var $shareList = $( '<ul />' );

		$shareList
		.append(
			$('<li />').text(
				gM( 'mwe-embedplayer-embed_site_or_blog' )
			)
			/*
			.append(
				$('<a />')
				.attr('href', '#')
				.addClass( 'active' )
				.text(
					gM( 'mwe-embedplayer-embed_site_or_blog' )
				)
			)
			*/
		);

		$shareInterface.append(
			$( '<h2 />' )
			.text( gM( 'mwe-embedplayer-share_this_video' ) )
		);

		$shareInterface.append(
			$shareList
		);		    

		var $shareButton = false;
		if( ! mw.isIpad() ) {
			$shareButton = $('<button />')
			.addClass( 'ui-state-default ui-corner-all copycode' )
			.text( gM( 'mwe-embedplayer-copy-code' ) )
			.click(function() {
				$shareInterface.find( 'textarea' ).focus().select();
				// Copy the text if supported:
				if ( document.selection ) {
					CopiedTxt = document.selection.createRange();
					CopiedTxt.execCommand( "Copy" );
				}
			} );
		}
		$shareInterface.append(

			$( '<textarea />' )
			.attr( 'rows', 4 )
			.html( embed_code )
			.click( function() {
				$( this ).select();
			}),

			$('<br />'),
			$('<br />'),
			$shareButton
		);
		return $shareInterface;
	},

	/**
	* Shows the Player Select interface
	*
	* @param {Object} $target jQuery target for output
	*/
	getPlayerSelect: function( ) {
		mw.log('PlayerControlBuilder::getPlayerSelect: source:' +
				this.embedPlayer.mediaElement.selectedSource.getSrc() +
				' player: ' + this.embedPlayer.selectedPlayer.id );

		var embedPlayer = this.embedPlayer;

		var _this = this;

		var $playerSelect = $('<div />')
		.append(
			$( '<h2 />' )
			.text( gM( 'mwe-embedplayer-choose_player' ) )
		);

		$.each( embedPlayer.mediaElement.getPlayableSources(), function( sourceId, source ) {

			var isPlayable = (typeof mw.EmbedTypes.getMediaPlayers().defaultPlayer( source.getMIMEType() ) == 'object' );
			var isSelected = ( source.getSrc() == embedPlayer.mediaElement.selectedSource.getSrc() );

			$playerSelect.append(
				$( '<h3 />' )
				.text( source.getTitle() )
			);

			if ( isPlayable ) {
				var $playerList = $('<ul />');
				// output the player select code:

				var supportingPlayers = mw.EmbedTypes.getMediaPlayers().getMIMETypePlayers( source.getMIMEType() );

				for ( var i = 0; i < supportingPlayers.length ; i++ ) {
					// Add link to select the player if not already selected )
					if( embedPlayer.selectedPlayer.id == supportingPlayers[i].id && isSelected ) {
						// Active player ( no link )
						var $playerLine = $( '<span />' )
						.append(
							$('<a />')
							.attr({
								'href' : '#'					
							})
							.addClass( 'active')
							.text( 
								supportingPlayers[i].getName()
						 	)
						).click( function(){
							embedPlayer.controlBuilder.closeMenuOverlay();
						});
						//.addClass( 'ui-state-highlight ui-corner-all' ); removed by ran
					} else {
						// Non active player add link to select:
						$playerLine = $( '<a />')
							.attr({
								'href' : '#',
								'id' : 'sc_' + sourceId + '_' + supportingPlayers[i].id
							})
							.addClass( 'ui-corner-all')
							.text( supportingPlayers[i].getName() )
							.click( function() {
								var iparts = $( this ).attr( 'id' ).replace(/sc_/ , '' ).split( '_' );
								var sourceId = iparts[0];
								var player_id = iparts[1];
								mw.log( 'PlayerControlBuilder:: source id: ' + sourceId + ' player id: ' + player_id );

								embedPlayer.controlBuilder.closeMenuOverlay();

								// Close fullscreen if we are in fullscreen mode
								if( _this.inFullScreen ){
									_this.restoreWindowPlayer();
								}

								embedPlayer.mediaElement.setSourceByIndex( sourceId );
								var playableSources = embedPlayer.mediaElement.getPlayableSources();

								mw.EmbedTypes.getMediaPlayers().setPlayerPreference(
									player_id,
									playableSources[ sourceId ].getMIMEType()
								);

								// Issue a stop
								embedPlayer.stop();

								// Don't follow the # link:
								return false;
							} )
							.hover(
								function(){
									$( this ).addClass('active');
								},
								function(){
									$( this ).removeClass('active');
								}
							);
					}

					// Add the player line to the player list:
					$playerList.append(
						$( '<li />' ).append(
							$playerLine
						)
					);
				}

				// Append the player list:
				$playerSelect.append( $playerList );

			} else {
				// No player available:
				$playerSelect.append( gM( 'mwe-embedplayer-no-player', source.getTitle() ) );
			}
		} );

		// Return the player select elements
		return $playerSelect;
	},
	
	/**
	* Loads sources and calls showDownloadWithSources
	* @param {Object} $target jQuery target to output to
	*/
	showDownload: function( $target ) {
		var _this = this;
		var embedPlayer = this.embedPlayer;
		
		// Load additional text sources via apiTitleKey:
		// TODO we should move this to timedText bindings
		if( embedPlayer.apiTitleKey ) {
			// Load text interface ( if not already loaded )
			mw.load( 'TimedText', function() {
				embedPlayer.timedText.setupTextSources(function(){
					_this.showDownloadWithSources( $target );
				});
			});
		} else {
			_this.showDownloadWithSources( $target );
		}
	},

	/**
	* Shows the download interface with sources loaded
	* @param {Object} $target jQuery target to output to
	*/
	showDownloadWithSources : function( $target ) {
		var _this = this;
		mw.log( 'PlayerControlBuilder:: showDownloadWithSources::' + $target.length );
		var embedPlayer = this.embedPlayer;
		// Empty the target:
		$target.empty();
		$target.append( $('<div />') );
		$target = $target.find('div');

		var $mediaList = $( '<ul />' );
		var $textList =  $( '<ul />' );
		$.each( embedPlayer.mediaElement.getSources(), function( index, source ) {
			if( source.getSrc() ) {
				mw.log("showDownloadWithSources:: Add src: " + source.getTitle() );
				var $dl_line = $( '<li />').append(
					$('<a />')
					.attr( 'href', source.getSrc() )
					.text( source.getTitle() )
				);
				// Add link to correct "bucket"

				//Add link to time segment:
				if ( source.getSrc().indexOf( '?t=' ) !== -1 ) {
					$target.append( $dl_line );
				} else if ( this.getMIMEType().indexOf('text') === 0 ) {
					// Add link to text list
					$textList.append( $dl_line );
				} else {
					// Add link to media list
					$mediaList.append( $dl_line );
				}

			}
		} );
		if( $mediaList.find('li').length != 0 ) {
			$target.append(
				$('<h2 />')
				.text( gM( 'mwe-embedplayer-download_full' ) ),
				$mediaList
			);
		}

		if( $textList.find('li').length != 0 ) {
			$target.append(
				$('<h2 />')
				.html( gM( 'mwe-embedplayer-download_text' ) ),
				$textList
			);
		}
	},
	getSwitchSourceMenu: function(){
		var _this = this;
		var embedPlayer = this.embedPlayer;
		// for each source with "native playback" 			
		var $sourceMenu = $('<ul />');
		
		// Local function to closure the "source" variable scope: 
		function addToSourceMenu( source ){			
			// Check if source is selected: 
			var icon = ( source.getSrc() == embedPlayer.mediaElement.selectedSource.getSrc() ) ? 'bullet' : 'radio-on';
			$sourceMenu.append(
				$.getLineItem( source.getShortTitle() , icon, function(){
					mw.log( 'PlayerControlBuilder::SwitchSourceMenu: ' + source.getSrc() );
					// update menu selecting parent li siblings
					$( this ).parent().siblings().find('span.ui-icon').removeClass( 'ui-icon-bullet').addClass( 'ui-icon-radio-on' );
					$( this ).find('span.ui-icon').removeClass( 'ui-icon-radio-on').addClass( 'ui-icon-bullet' );
					// update control bar text 
					embedPlayer.$interface.find( '.source-switch' ).text( source.getShortTitle() );
					
					
					// TODO this logic should be in mw.EmbedPlayer
					embedPlayer.mediaElement.setSource( source );					
					if( ! _this.embedPlayer.isStopped() ){
						// Get the exact play time from the video element ( instead of parent embed Player ) 
						var oldMediaTime = _this.embedPlayer.getPlayerElement().currentTime;
						var oldPaused =  _this.embedPlayer.paused;
						// Do a live switch
						embedPlayer.switchPlaySrc(source.getSrc(), function( vid ){
							// issue a seek
							embedPlayer.setCurrentTime( oldMediaTime );
							// reflect pause state
							if( oldPaused ){
								embedPlayer.pause();
							}
						});
					}
				})
			);
		}
		$.each( this.embedPlayer.mediaElement.getPlayableSources(), function( sourceIndex, source ) {
			// Output the player select code:
			var supportingPlayers = mw.EmbedTypes.getMediaPlayers().getMIMETypePlayers( source.getMIMEType() );
			for ( var i = 0; i < supportingPlayers.length ; i++ ) {
				if( supportingPlayers[i].library == 'Native' ){
					addToSourceMenu( source );
				}
			}
		});
		return $sourceMenu;
	},

	/**
	* Get component
	*
	* @param {String} component_id Component key to grab html output
	*/
	getComponent: function( component_id ) {
		if ( this.components[ component_id ] ) {
			return this.components[ component_id ].o( this );
		} else {
			return false;
		}
	},

	/**
	 * Get a component height
	 *
	 * @param {String} component_id Component key to grab height
	 * @return height or false if not set
	 */
	getComponentHeight: function( component_id ) {
		if ( this.components[ component_id ]
			&& this.components[ component_id ].h )
		{
			return this.components[ component_id ].h;
		}
		return 0;
	},

	/**
	* Get a component width
	* @param {String} component_id Component key to grab width
	* @return width or false if not set
	*/
	getComponentWidth: function( component_id ){
		if ( this.components[ component_id ]
			&& this.components[ component_id ].w )
		{
			return this.components[ component_id ].w;
		}
		return 0;
	},
	
	// Set up the disable playhead function: 
	// TODO this will move into the disableSeekBar binding in the new theme framework
	disableSeekBar : function(){
		var $playHead = this.embedPlayer.$interface.find( ".play_head" );
		if( $playHead.length ){
			$playHead.slider( "option", "disabled", true );
		}
	},
	enableSeekBar : function(){
		var $playHead = this.embedPlayer.$interface.find( ".play_head" );
		if( $playHead.length ){
			$playHead.slider( "option", "disabled", false);
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
		* The large play button in center of the player
		*/
		'playButtonLarge': {
			'w' : 70,
			'h' : 53,
			'o' : function( ctrlObj ) {
				return $( '<div />' )
					.attr( {
						'title'	: gM( 'mwe-embedplayer-play_clip' ),
						'class'	: "play-btn-large"
					} )
					// Get dynamic position for big play button
					.css( ctrlObj.getPlayButtonPosition() )
					// Add play hook:
					.click( function() {
						ctrlObj.embedPlayer.play();
						return false; // Event Stop Propagation
					} );
			}
		},

		/**
		* The Attribution button ( by default this is kaltura-icon
		*/
		'attributionButton' : {
			'w' : 28,
			'o' : function( ctrlObj ){
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
				
				return $('<a />')
					.attr({
						'href': buttonConfig.href,
						'title' : buttonConfig.title,
						'target' : '_new'
					})
					.append(
						$( '<div />' )
						.addClass( 'rButton' )
						.css({
							'top' : '1px',
							'left' : '2px'
						})
						// Allow button config style to override
						.css( buttonConfig.style )
						.append(
							$icon
						)
					);
			}
		},

		/**
		* The options button, invokes display of the options menu
		*/
		'options': {
			'w': 28,
			'o': function( ctrlObj ) {
				return $( '<div />' )
						.attr( 'title', gM( 'mwe-embedplayer-player_options' ) )
						.addClass( 'ui-state-default ui-corner-all ui-icon_link rButton options-btn' )
						.append(
							$('<span />')
							.addClass( 'ui-icon ui-icon-wrench' )
						)
						.buttonHover()
						// Options binding:
						.menu( {
							'content' : ctrlObj.getOptionsMenu(),
							'zindex' : mw.getConfig( 'EmbedPlayer.FullScreenZIndex' ) + 1,
							'positionOpts': {
								'directionV' : 'up',
								'offsetY' : 30,
								'directionH' : 'left',
								'offsetX' : -28
							}
						} );
			}
		},

		/**
		* The fullscreen button for displaying the video fullscreen
		*/
		'fullscreen': {
			'w': 28,
			'o': function( ctrlObj ) {
				var $btn = $( '<div />' )
						.attr( 'title', gM( 'mwe-embedplayer-player_fullscreen' ) )
						.addClass( "ui-state-default ui-corner-all ui-icon_link rButton fullscreen-btn" )
						.append(
							$( '<span />' )
							.addClass( "ui-icon ui-icon-arrow-4-diag" )
						)
						// Fullscreen binding:
						.buttonHover();
				// Link out to another window if iPad 3x ( broken iframe resize ) 
				if( (
						mw.getConfig('EmbedPlayer.IsIframeServer') 
						&& 
						mw.isIpad3() 
					)
						||
					  mw.getConfig( "EmbedPlayer.NewWindowFullscreen" ) 
					  	||
					( mw.getConfig('EmbedPlayer.IsIframeServer')  && mw.getConfig('EmbedPlayer.EnableIframeApi') === false )
				){
					// Get the iframe url: 
					var url = ctrlObj.embedPlayer.getIframeSourceUrl();
					// Change button into new window ( of the same url as the iframe ) : 
					return	$('<a />').attr({
							'href': url,
							'target' : '_new'
						})
						.click(function(){
							// Update the url: 			
							var url = $(this).attr('href');
							mw.setConfig('EmbedPlayer.IsFullscreenIframe', true);
							// add a seek offset:
							mw.setConfig('EmbedPlayer.IframeCurrentTime',  ctrlObj.embedPlayer.currentTime );
							// add play state:
							mw.setConfig('EmbedPlayer.IframeIsPlaying',  ctrlObj.embedPlayer.isPlaying() );
							
							url += mw.getIframeHash();
							ctrlObj.embedPlayer.pause();
							// try and do a browser popup:
							var newwin = window.open(
								 url, 
								 ctrlObj.embedPlayer.id, 
								 // Fullscreen window params: 
								'width=' + screen.width + 
								', height=' + ( screen.height - 90 ) +
								', top=0, left=0' + 
								', fullscreen=yes'
							);						
							// if for some reason we could not open the window run the href link:
							if( newwin === null){
								return true;
							}
							if ( window.focus ) {
								newwin.focus();
							}
							// Else do not follow the href link
							return false;
						})
						.append($btn);
				} else {
					return $btn.click( function() {
						ctrlObj.embedPlayer.fullscreen();
					} );
				}
			}
		},


		/**
		* The pause / play button
		*/
		'pause': {
			'w': 28,
			'o': function( ctrlObj ) {
				return $( '<div />' )
						.attr( 'title', gM( 'mwe-embedplayer-play_clip' ) )
						.addClass ( "ui-state-default ui-corner-all ui-icon_link lButton play-btn" )
						.append(
							$( '<span />' )
							.addClass( "ui-icon ui-icon-play" )
						)
						// Play / pause binding
						.buttonHover()
						.click( function() {
							ctrlObj.embedPlayer.play();
						});
			}
		},


		/**
		* The volume control interface html
		*/
		'volumeControl': {
			'w' : 28,
			'o' : function( ctrlObj ) {
				mw.log( 'PlayerControlBuilder::Set up volume control for: ' + ctrlObj.embedPlayer.id );
				var $volumeOut = $( '<span />' );
				if ( ctrlObj.volume_layout == 'horizontal' ) {
					$volumeOut.append(
						$( '<div />' )
						.addClass( "ui-slider ui-slider-horizontal rButton volume-slider" )
					);
				}

				// Add the volume control icon
				$volumeOut.append(
				 	$('<div />')
				 	.attr( 'title', gM( 'mwe-embedplayer-volume_control' ) )
				 	.addClass( "ui-state-default ui-corner-all ui-icon_link rButton volume_control" )
				 	.append(
				 		$( '<span />' )
				 		.addClass( "ui-icon ui-icon-volume-on" )
				 	)
				 );
				if ( ctrlObj.volume_layout == 'vertical' ) {
					$volumeOut.find('.volume_control').append(
						$( '<div />' )
						.hide()
						.addClass( "vol_container ui-corner-all" )
						.append(
							$( '<div />' )
							.addClass ( "volume-slider" )
						)
					);
				}
				//Return the inner html
				return $volumeOut.html();
			}
		},
		
		'sourceSwitch' : {
			'w' : 70,
			'o' : function( ctrlObj ){
				// Stream switching widget ( display the current selected stream text )
				return $( '<div />' )
					.addClass('ui-widget source-switch')
					.append(
						ctrlObj.embedPlayer.mediaElement.selectedSource.getShortTitle()
					).menu( {
						'content' : ctrlObj.getSwitchSourceMenu(),
						'zindex' : mw.getConfig( 'EmbedPlayer.FullScreenZIndex' ) + 2,
						'width' : 115,
						'positionOpts' : {
							'posY' : 'top',
							'directionV' : 'up',
							'offsetY' : 23
						},
						'createMenuCallback' : function(){
							ctrlObj.showControlBar( true );
						},
						'closeMenuCallback' : function(){
							ctrlObj.keepControlBarOnScreen = false;
						}
					} );
			}
		},
		/*
		* The time display area
		*/
		'timeDisplay': {
			'w' : mw.getConfig( 'EmbedPlayer.TimeDisplayWidth' ),
			'o' : function( ctrlObj ) {
				return $( '<div />' )
				.addClass( "ui-widget time-disp" )
				.append(
					ctrlObj.embedPlayer.getTimeRange()
				);
			}
		},

		/**
		* The playhead component
		*/
		'playHead': {
			'w':0, // special case (takes up remaining space)
			'o':function( ctrlObj ) {
			
				var sliderConfig = {
						range: "min",
						value: 0,
						min: 0,
						max: 1000,
						start: function( event, ui ) {
							var id = ( embedPlayer.pc != null ) ? embedPlayer.pc.pp.id:embedPlayer.id;
							embedPlayer.userSlide = true;
							$( id + ' .play-btn-large' ).fadeOut( 'fast' );
							// If playlist always start at 0
							embedPlayer.startTimeSec = ( embedPlayer.instanceOf == 'mvPlayList' ) ? 0:
											mw.npt2seconds( embedPlayer.getTimeRange().split( '/' )[0] );
						},
						slide: function( event, ui ) {
							var perc = ui.value / 1000;
							embedPlayer.jumpTime = mw.seconds2npt( parseFloat( parseFloat( embedPlayer.getDuration() ) * perc ) + embedPlayer.startTimeSec );
							// mw.log('perc:' + perc + ' * ' + embedPlayer.getDuration() + ' jt:'+ this.jumpTime);
							if ( _this.longTimeDisp ) {
								ctrlObj.setStatus( gM( 'mwe-embedplayer-seek_to', embedPlayer.jumpTime ) );
							} else {
								ctrlObj.setStatus( embedPlayer.jumpTime );
							}
							// Update the thumbnail / frame
							if ( embedPlayer.isPlaying == false ) {
								embedPlayer.updateThumbPerc( perc );
							}
						},
						change: function( event, ui ) {
							// Only run the onChange event if done by a user slide
							// (otherwise it runs times it should not)
							if ( embedPlayer.userSlide ) {
								embedPlayer.userSlide = false;
								embedPlayer.seeking = true;

								var perc = ui.value / 1000;
								// set seek time (in case we have to do a url seek)
								embedPlayer.seekTimeSec = mw.npt2seconds( embedPlayer.jumpTime, true );
								mw.log( 'PlayerControlBuilder:: seek to: ' + embedPlayer.jumpTime + ' perc:' + perc + ' sts:' + embedPlayer.seekTimeSec );
								ctrlObj.setStatus( gM( 'mwe-embedplayer-seeking' ) );
								if( embedPlayer.isStopped() ){
									embedPlayer.play();
								}
								embedPlayer.seek( perc );
							}
						}
					};
			
				var embedPlayer = ctrlObj.embedPlayer;
				var _this = this;
				var $playHead = $( '<div />' )
					.addClass ( "play_head" )
					.css({
						"position" : 'absolute',
						"left" : '33px',
						"right" : ( ( embedPlayer.getPlayerWidth() - ctrlObj.available_width ) ) + 'px'
					})
					// Playhead binding
					.slider( sliderConfig );

				// Up the z-index of the default status indicator:
				$playHead.find( '.ui-slider-handle' ).css( 'z-index', 4 );
				$playHead.find( '.ui-slider-range' ).addClass( 'ui-corner-all' ).css( 'z-index', 2 );

				// Add buffer html:
				$playHead.append(
					$('<div />')
					.addClass( "ui-slider-range ui-slider-range-min ui-widget-header")
					.addClass( "ui-state-highlight ui-corner-all mw_buffer")
				);

				return $playHead;
			}
		}
	}
};


} )( window.mw, jQuery );
