/**
* Msg text is inherited from embedPlayer 
*/

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
	height: 31,		
	
	// Default supported components is merged with embedPlayer set of supported types
	supportedComponets: {	
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
		'share' : true
	},	
	
	// Flag to store the current fullscreen mode
	fullscreenMode: false,
	
	// Flag to store if a warning binding has been added 
	addWarningFlag: false,
	
	// Flag to store state of overlay on player  
	displayOptionsMenuFlag: false, 
	
	/**
	* Initialization Object for the control builder
	*
	* @param {Object} embedPlayer EmbedPlayer interface
	*/ 
	init: function( embedPlayer ) {
		var _this = this;
		this.embedPlayer = embedPlayer;

		// Check for skin overrides for controlBuilder
		var skinClass =  embedPlayer.skinName[0].toUpperCase() +  embedPlayer.skinName.substr( 1 );		
		if ( mw['PlayerSkin' + skinClass  ]) {
		
			// Clone as to not override prototype with the skin config
			var _this = $j.extend( true, { }, this, mw['PlayerSkin' + skinClass ] );	
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
		return this.height;
	},
	
	/**
	* Add the controls html to palyer interface
	*/
	addControls: function() {
		// Set up local pointer to the embedPlayer
		var embedPlayer = this.embedPlayer;
		
		// Set up local controlBuilder
		var _this = this;

		// Remove any old controls & old overlays:		
		embedPlayer.$interface.find( '.control-bar,.overlay-win' ).remove();
		
		// Reset flag: 
		_this.displayOptionsMenuFlag = false;
		
		
		// Setup the controlBar container
		var $controlBar = $j('<div />')
			.addClass( 'ui-state-default ui-widget-header ui-helper-clearfix control-bar' )
			.css( 'height', this.height )			
		
		$controlBar.css( {
			'position': 'absolute',
			'bottom' : '0px',
			'left' : '0px',
			'right' : '0px'
		} )
		// Check for overlay controls: 
		if( _this.checkOverlayControls() ) {
			$controlBar.hide()
			// Make sure the interface is correct height: 
			embedPlayer.$interface.css( {
				'height' : parseInt( embedPlayer.height )
			} );
		} else {
			// Add some space to interface for the control bar ( if not overlaying controls )
			embedPlayer.$interface.css( {
				'height' : parseInt( embedPlayer.height ) + parseInt( this.height ) +2
			} );	
		}
		
		// Add the controls to the interface
		embedPlayer.$interface.append( $controlBar );
	
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
		mw.log( 'f:controlsBuilder:: opt:' + this.options );
		
		// Set up local pointer to the embedPlayer
		var embedPlayer = this.embedPlayer;
		
		//Set up local var to control container:
		var $controlBar = embedPlayer.$interface.find( '.control-bar' );  
		
		this.available_width = embedPlayer.getPlayerWidth();
		
		// Make pointer to the embedPlayer
		this.embedPlayer = embedPlayer;
				
		// Build the supportedComponets list
		this.supportedComponets = $j.extend( this.supportedComponets, embedPlayer.supports );
		
		// Check for timed text support:
		if( embedPlayer.isTimedTextSupported() ){
			this.supportedComponets['timedText'] = true;
		}		
		// Check for kalturaAttribution 	
		if( mw.getConfig( 'EmbedPlayer.KalturaAttribution' ) ){			
			this.supportedComponets[ 'kalturaAttribution' ] = true;
		}
		
		// Check global fullscreen enabled flag
		if( mw.getConfig( 'EmbedPlayer.EnableFullscreen' ) === false ){
			this.supportedComponets[ 'fullscreen'] = false; 
		}

		// Output components 
		for ( var component_id in this.components ) {			
			// Check for (component === false ) and skip  
			if( this.components[ component_id ] === false  ){
				continue;
			}
			
			// Special case with playhead skip if we have > 30px of space for it
			if ( component_id == 'playHead' && this.available_width < 30 ){
				continue;
			}			
			
			// Skip "fullscreen" button for assets or where height is 0px ( audio ) 
			if(  component_id == 'fullscreen' && this.embedPlayer.height == 0 ){
				continue;
			}		
			  
			// Make sure the given components is supported:
			if ( this.supportedComponets[ component_id ] ) {
				if ( this.available_width > this.components[ component_id ].w ) {											
					// Append the component
					$controlBar.append( 
						_this.getComponent( component_id ) 
					);
					this.available_width -= this.components[ component_id ].w;
				} else {
					mw.log( 'Not enough space for control component:' + component_id );
				}
			}
		}
	},
	
	/**
	* Get the fullscreen player css
	*/	
	getFullscreenPlayerCss: function() {
		var embedPlayer = this.embedPlayer;
		// Setup target height width based on max window size	
		var fullWidth = $j( window ).width() - 2 ;
		var fullHeight =  $j( window ).height() ;
		
		// Set target width
		var targetWidth = fullWidth;
		var targetHeight = targetWidth * ( embedPlayer.getHeight() / embedPlayer.getWidth()  ) 
		// Check if it exceeds the height constraint: 
		if( targetHeight >  fullHeight ){		
			targetHeight = fullHeight;				
			targetWidth = targetHeight * ( embedPlayer.getWidth()  / embedPlayer.getHeight()  );
		}
		var offsetTop = ( targetHeight < fullHeight )? ( fullHeight- targetHeight ) / 2 : 0;
		var offsetLeft = ( targetWidth < fullWidth )? ( fullWidth- targetWidth ) / 2 : 0;
				
		//mw.log(" targetWidth: " + targetWidth + ' fullwidth: ' + fullWidth + ' :: ' +  ( fullWidth- targetWidth ) / 2 );
		return {
			'height': targetHeight,
			'width' : targetWidth,
			'top' : offsetTop,
			'left': offsetLeft
		}
	},
	
	/**
	* Get the fullscreen play button css
	*/
	getFullscreenPlayButtonCss: function() {		
		var pos = this.getFullscreenPlayerCss();
		return {
			'left' : ( (  pos.width - this.getComponentWidth( 'playButtonLarge' ) ) / 2 ),
			'top' : ( ( pos.height - this.getComponentHeight( 'playButtonLarge' ) ) / 2 )
		}
	},
	
	/**
	* Get the fullscreen text css
	*/
	getFullscreenTextCss: function() {
		// Some arbitrary scale relative to window size
		var textSize = ( $j( window ).width() / 8 ) + 20;
		if( textSize < 95 )  textSize = 95;
		if( textSize > 250 ) textSize = 250;
		//mw.log(' win size is: ' + $j( window ).width() + ' ts: ' + textSize );
		return {
			'font-size' : textSize + '%'
		}
	},
	
	/**
	 * Toggles full screen by calling 
	 *  doFullScreenPlayer to enable fullscreen mode
	 *  restoreWindowPlayer to restore window mode
	 */
	toggleFullscreen: function() {
		if( this.fullscreenMode ){
			this.restoreWindowPlayer();				
			$j( this.embedPlayer ).trigger( 'closeFullScreenEvent' );		
		}else{
			this.doFullScreenPlayer();
			$j( this.embedPlayer ).trigger( 'openFullScreenEvent' );			
		}
	},
	
	/**
	* Do full-screen mode 
	*/ 
	doFullScreenPlayer: function() {
		mw.log(" controlBuilder :: toggle full-screen ");									
		// Setup pointer to control builder :
		var _this = this;
		
		// Setup local reference to embed player: 
		var embedPlayer = this.embedPlayer;
		
		// Setup a local reference to the player interface: 
		var $interface = embedPlayer.$interface;
		
		
		// Check fullscreen state ( if already true do nothing )
		if( this.fullscreenMode == true ){
			return ;
		}			
		this.fullscreenMode = true;		
		
		//Remove any old mw-fullscreen-overlay
		$interface.find( '.mw-fullscreen-overlay' ).remove();
		
		// Special hack for mediawiki monobook skin search box
		if( $j( '#p-search,#p-logo' ).length ) { 
			$j( '#p-search,#p-logo,#ca-nstab-project a' ).css('z-index', 1);			
		} 
		
		// Add the css fixed fullscreen black overlay as a sibling to the video element
		$interface.after( 
			$j( '<div />' )
			.addClass( 'mw-fullscreen-overlay' )
			// Set some arbitrary high z-index
			.css('z-index', mw.getConfig( 'EmbedPlayer.fullScreenZIndex' ) ) 		
			.hide()
			.fadeIn("slow")
		);			
		
		// Change the interface to absolute positioned: 
		this.windowPositionStyle = $interface.css( 'position' );
		this.windowZindex = $interface.css( 'z-index' );
		
		// Get the base offset: 
		this.windowOffset = $interface.offset();
		this.windowOffset.top = this.windowOffset.top - $j(document).scrollTop();
		this.windowOffset.left = this.windowOffset.left - $j(document).scrollLeft();
				
		// Change the z-index of the interface
		$interface.css( {
			'position' : 'fixed',
			'z-index' : mw.getConfig( 'EmbedPlayer.fullScreenZIndex' ) + 1,
			'top' : this.windowOffset.top,
			'left' : this.windowOffset.left
		} );		
		
		// Empty out the parent absolute index
		_this.parentsAbsolute = [];		
		
		// Hide the body scroll bar
		$j('body').css( 'overflow', 'hidden' );
		

		var topOffset = '0px';
		var leftOffset = '0px';
				
		//Check if we have an offsetParent
		if( $interface.offsetParent().get(0).tagName.toLowerCase() != 'body' ) {
			topOffset = -this.windowOffset.top + 'px';
			leftOffset = -this.windowOffset.left + 'px';
		}			
		
		// Resize interface container		
		$interface.animate( {			
			'top' : topOffset,
			'left' : leftOffset,
			'width' : $j( window ).width(),
			'height' :  $j( window ).height(),
			'overlow' : 'hidden'		
		}, function(){
			// Remove absolute css of the interface parents
			$interface.parents().each( function() {
				//mw.log(' parent : ' + $j( this ).attr('id' ) + ' class: ' + $j( this ).attr('class') + ' pos: ' +  $j( this ).css( 'position' ) );  
				if( $j( this ).css( 'position' ) == 'absolute' ) {				
					_this.parentsAbsolute.push( $j( this ) );				
					$j( this ).css( 'position', null );
					mw.log(' should update position: ' +  $j( this ).css( 'position' ) );
				}
			} );
		} )
		
		// Set the player height width: 
		$j( embedPlayer ).css( {
			'position' : 'relative'
		} )
		// Animate a zoom ( while keeping aspect )
		.animate( _this.getFullscreenPlayerCss() );
		
		// Resize the timed text font size per window width	
		$interface.find( '.track' ).css( _this.getFullscreenTextCss() );		
		
		// Reposition play-btn-large ( this is unfortunately not easy to position with 'margin': 'auto'
		$interface.find('.play-btn-large').animate( _this.getFullscreenPlayButtonCss() )		
		
		// Bind mouse move in interface to hide control bar
		_this.mouseMovedFlag = false;
		$interface.mousemove( function(e){
			_this.mouseMovedFlag = true;			
		});
		// Check every 2 seconds reset flag status:
		function checkMovedMouse(){			
			if( _this.fullscreenMode ){
				if( _this.mouseMovedFlag ){
					_this.mouseMovedFlag = false;
					_this.showControlBar();
					// Once we move the mouse keep displayed for 4 seconds
					setTimeout(checkMovedMouse, 4000);
				} else {
					// Check for mouse movement every 250ms
					_this.hideControlBar();
					setTimeout(checkMovedMouse, 250 );
				}				
			}
		};
		checkMovedMouse();
	
		// Bind Scroll position update
		
		// Bind resize resize window to resize window
		$j( window ).resize( function() {
			if( _this.fullscreenMode ){
				// Update interface container: 
				$interface.css( {			
					'top' : '0px',
					'left' : '0px',
					'width' : $j( window ).width(),
					'height' :  $j( window ).height()			
				} )
				// Update player size
				$j( embedPlayer ).css( _this.getFullscreenPlayerCss() );
				
				// Update play button pos
				$interface.find('.play-btn-large').css(  _this.getFullscreenPlayButtonCss() );
				
				// Update the timed text size  
				$interface.find( '.track' ).css( _this.getFullscreenTextCss() );
			}
		});
		
		// Bind escape to restore clip resolution
		$j( window ).keyup( function(event) {
			// Escape check
			if( event.keyCode == 27 ){
				_this.restoreWindowPlayer();
			}
		} );
	},		
	
	/**
	* Restore the window player
	*/
	restoreWindowPlayer: function() {		
		var _this = this;
		var embedPlayer = this.embedPlayer;
		
		// Check fullscreen state
		if( this.fullscreenMode == false ){
			return ;	
		}
		// Set fullscreen mode to false
		this.fullscreenMode = false;
		
		var $interface = embedPlayer.$interface;		
		var interfaceHeight = ( _this.checkOverlayControls() ) 
			? embedPlayer.getHeight() 
			: embedPlayer.getHeight() + _this.getHeight();
			
		mw.log( 'restoreWindowPlayer:: h:' + interfaceHeight + ' w:' + embedPlayer.getWidth());
		$j('.mw-fullscreen-overlay').fadeOut( 'slow' );
		
		// Restore interface: 		
		$interface.animate( {
			'top' : this.windowOffset.top,
			'left' : this.windowOffset.left,
			// height is embedPlayer height + controlBuilder height: 
			'height' : interfaceHeight,
			'width' : embedPlayer.getWidth()					
		},function(){			
			// Restore non-absolute layout: 
			$interface.css( {
				'position' : _this.windowPositionStyle,
				'z-index' : _this.windowZindex,
				'overlow' : 'visible',
				'top' : null,
				'left' : null 
			} );					
			
			// Restore absolute layout of parents:			
			$j.each( _this.parentsAbsolute, function( na, element  ){
				$j( element ).css( 'position', 'absolute' );
			} );
			_this.parentsAbsolute = null;
			
			// Restore the body scroll bar
			$j('body').css( 'overflow', 'auto' );
			
		} );
		mw.log( 'restore embedPlayer:: ' + embedPlayer.getWidth() + ' h: ' + embedPlayer.getHeight());
		// Restore the player: 
		$j( embedPlayer ).animate( {
			'top' : '0px',
			'left' : '0px',
			'width' : embedPlayer.getWidth(),
			'height' : embedPlayer.getHeight()
		})
		// Restore the play button
		$interface.find('.play-btn-large').animate( {
			'left' 	: ( ( embedPlayer.getPlayerWidth() - this.getComponentWidth( 'playButtonLarge' ) ) / 2 ),
			'top'	: ( ( embedPlayer.getPlayerHeight() -this.getComponentHeight( 'playButtonLarge' ) ) / 2 )
		} );
		
		// Restore text size: 
		$interface.find( '.track' ).css({
			'font-size' : '100%'
		})
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
		
		// Remove any old interface bindings
		$interface.unbind();
		
		// Add hide show bindings for control overlay (if overlay is enabled ) 
		if( ! _this.checkOverlayControls() ) {
			$interface.show();		
		} else { // hide show controls: 
			//$interface.css({'background-color': 'red'});
			// Bind a startTouch to show controls
			$interface.bind( 'touchstart', function() {
				_this.showControlBar();
				// ( once the user touched the video "don't hide" ) 
			} );			
			// Add a special absolute overlay for hover ( to keep menu displayed 
			$interface.hoverIntent({
				'sensitivity': 4,
				'timeout' : 2000,
				'over' : function(){						
					// Show controls with a set timeout ( avoid fade in fade out on short mouse over )				
					_this.showControlBar();
				},
				'out' : function(){
					_this.hideControlBar();
				}
			});
		}
				
		// Add recommend firefox if we have non-native playback:
		if ( _this.checkNativeWarning( ) ) {			
			_this.doWarningBindinng(
				'showNativePlayerWarning',
				gM( 'mwe-embedplayer-for_best_experience' ) 
			);
		}
			
		// Do png fix for ie6
		if ( $j.browser.msie  &&  $j.browser.version <= 6 ) {			
			$j('#' + embedPlayer.id + ' .play-btn-large' ).pngFix();
		}
						
		this.doVolumeBinding();
		
		// Check if we have any custom skin Bindings to run
		if ( this.addSkinControlBindings && typeof( this.addSkinControlBindings ) == 'function' ){
			this.addSkinControlBindings();
		}
		
		mw.log('tirgger::addControlBindingsEvent');
		$j( embedPlayer ).trigger( 'addControlBindingsEvent');
	},
	
	/**
	* Hide the control bar. 
	*/
	hideControlBar : function(){
		var animateDuration = 'slow';
		var _this = this;			
		
		// Do not hide control bar if overlay menu item is being displayed:
		if( _this.displayOptionsMenuFlag ||  				
			$j( '#timedTextMenu_' + this.embedPlayer.id ).is( ':visible' ) ) {
			setTimeout( function(){
				_this.hideControlBar();
			}, 200 );
			return ;
		}
		
		
		// Hide the control bar
		this.embedPlayer.$interface.find( '.control-bar')
			.fadeOut( animateDuration );
		
		// Move the timed text XXX this should go into timedText module 			
		this.embedPlayer.$interface.find( '.track' )
			.stop()
			.animate( { 
				'bottom' : 10 
			}, 'slow' );

	},
	
	/**
	* Show the control bar
	*/
	showControlBar: function(){
		var animateDuration = 'slow';	
		$j( this.embedPlayer.getPlayerElement() ).css('z-index', '1')	
		mw.log( 'showControlBar' );
		// Move up text track if present
		this.embedPlayer.$interface.find( '.track' )
			.animate( 
				{ 
					'bottom' : this.getHeight() + 10 
				}, 
				animateDuration
			); 
		
		// Show interface controls
		this.embedPlayer.$interface.find( '.control-bar')
			.fadeIn( animateDuration );			
	},
	
	/**
	* Checks if the browser supports overlays and the controlsOverlay is 
	* set to true for the player or via config
	*/
	checkOverlayControls: function(){
		//if the player "supports" overlays: 
		if( ! this.embedPlayer.supports['overlays'] ){
			return false;
		}
		
		// If disabled via the player
		if( this.embedPlayer.overlayControls === false ){
			return false;
		} 
		
		// If the config is false
		if( mw.getConfig( 'EmbedPlayer.OverlayControls' ) == false){
			return false;
		} 
				
		// don't hide controls when content "height" is 0 ( audio tags ) 		
		if( this.embedPlayer.getPlayerHeight() == 0 ){			
			return false;
		}		
		// Past alll tests OverlayControls is true: 
		return true; 
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
		
		// If the resolution is too small don't display the warning
		if( this.embedPlayer.getPlayerHeight() < 199 ){
			return false;
		}				
		
		// See if we have we have ogg support
		var supportingPlayers = mw.EmbedTypes.players.getMIMETypePlayers( 'video/ogg' );
		for ( var i = 0; i < supportingPlayers.length; i++ ) {
			if ( supportingPlayers[i].id == 'oggNative' ) {
				return false;
			}
		}
		
		// Check for h264 and or flash/flv source and playback support and dont' show wanring 
		if( 
			( mw.EmbedTypes.players.getMIMETypePlayers( 'video/h264' ).length 
			&& this.embedPlayer.mediaElement.getSources( 'video/h264' ).length )
			||
			( mw.EmbedTypes.players.getMIMETypePlayers( 'video/x-flv' ).length 
			&&  this.embedPlayer.mediaElement.getSources( 'video/x-flv' ).length )  
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
	doWarningBindinng: function( preferenceId, warningMsg ) {
		mw.log( 'controlBuilder: doWarningBindinng: ' + preferenceId +  ' wm: ' + warningMsg);
		// Set up local pointer to the embedPlayer
		var embedPlayer = this.embedPlayer;
		var _this = this;			
		
		$j( embedPlayer ).hoverIntent({
			'timeout': 2000,
			'over': function() {				
				if ( $j( '#warningOverlay_' + embedPlayer.id ).length == 0 ) {
					var toppos = ( embedPlayer.instanceOf == 'mvPlayList' ) ? 25 : 10;
					
					$j( this ).append(
						$j('<div />')
						.attr( {
							'id': "warningOverlay_" + embedPlayer.id								
						} )
						.addClass( 'ui-state-highlight ui-corner-all' )
						.css({
							'position' : 'absolute',
							'display' : 'none',
							'background' : '#FFF',
							'color' : '#111',
							'top' : toppos + 'px',
							'left' : '10px',
							'right' : '10px',
							'padding' : '4px'
						})
						.html( warningMsg  )
					)
					
					$targetWarning = $j( '#warningOverlay_' + embedPlayer.id );			
										
					$targetWarning.append( 					 
						$j('<br />')
					);						
					
					$targetWarning.append( 
						$j( '<input />' )
						.attr({
							'id' : 'ffwarn_' + embedPlayer.id,
							'type' : "checkbox",
							'name' : 'ffwarn_' + embedPlayer.id
						})							
						.click( function() {
							if ( $j( this ).is( ':checked' ) ) {
								// Set up a cookie for 7 days:
								$j.cookie( preferenceId, false, { expires: 7 } );
								// Set the current instance
								mw.setConfig( preferenceId, false );
								$j( '#warningOverlay_' + embedPlayer.id ).fadeOut( 'slow' );
								// set the local prefrence to false
								_this.addWarningFlag = false;
							} else {
								mw.setConfig( preferenceId, true );
								$j.cookie( preferenceId, true );
							}
						} )							
					);
					$targetWarning.append( 
						$j('<span />')
						.text( gM( 'mwe-embedplayer-do_not_warn_again' ) )
					)
				}								
				// Check the global config before showing the warning
				if ( mw.getConfig( preferenceId ) === true  ){
					$j( '#warningOverlay_' + embedPlayer.id ).fadeIn( 'slow' );
				}				
			},
			'out': function() {	
				$j( '#warningOverlay_' + embedPlayer.id ).fadeOut( 'slow' );
			}
		});
	},
	
	/**
	* Binds the volume controls
	*/
	doVolumeBinding: function( ) {
		var embedPlayer = this.embedPlayer;
		var _this = this;		
		embedPlayer.$interface.find( '.volume_control span' ).unbind().buttonHover().click( function() {
			mw.log( 'Volume control toggle' );
			embedPlayer.toggleMute();
		} );
		
		// Add vertical volume display hover
		if ( this.volume_layout == 'vertical' ) {
			// Default volume binding:
			var hoverOverDelay = false;
			var $targetvol = embedPlayer.$interface.find( '.vol_container' );
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
		
		// Setup play-head slider:
		var sliderConf = {
			range: "min",
			value: 80,
			min: 0,
			max: 100,
			slide: function( event, ui ) {
				var percent = ui.value / 100;
				mw.log('slide::update volume:' + percent);
				embedPlayer.setVolume( percent );
			},
			change: function( event, ui ) {
				var percent = ui.value / 100;
				if ( percent == 0 ) {
					embedPlayer.$interface.find( '.volume_control span' ).removeClass( 'ui-icon-volume-on' ).addClass( 'ui-icon-volume-off' );
				} else {
					embedPlayer.$interface.find( '.volume_control span' ).removeClass( 'ui-icon-volume-off' ).addClass( 'ui-icon-volume-on' );
				}
				mw.log('change::update volume:' + percent);				
				embedPlayer.setVolume( percent );
			}
		}
		
		if ( this.volume_layout == 'vertical' ) {
			sliderConf[ 'orientation' ] = "vertical";
		}
		
		embedPlayer.$interface.find( '.volume-slider' ).slider( sliderConf );
	},
	
	/**
	* Get the options menu ul with li menu items
	*/
	getOptionsMenu: function( ) {
		$optionsMenu = $j( '<ul />' );
		for( var i in this.optionMenuItems ){
		
			// Make sure its supported in the current controlBuilder config: 
			if( ! this.supportedMenuItems[ i ] 	) {
			 	continue;
			}
			
			$optionsMenu.append(
				this.optionMenuItems[i]( this )
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
	},
	
	/**
	* Updates the player status that displays short text msgs and the play clock 
	* @param {String} value Status string value to update
	*/
	setStatus: function( value ) {
		// update status:
		this.embedPlayer.$interface.find( '.time-disp' ).text( value );
	},
	
	/**	
	* Option menu items
	*
	* @return
	* 	'li' a li line item with click action for that menu item  
	*/
	optionMenuItems: {	
		// Player select menu item
		'playerSelect': function( ctrlObj ){
			return $j.getLineItem( 					
				gM( 'mwe-embedplayer-choose_player' ),
				'gear',
				function( ) {
					ctrlObj.displayOverlay(  
						ctrlObj.getPlayerSelect()
					);						
				}
			)
		},	
								
		// Download the file menu
		'download': function( ctrlObj ) {
			return $j.getLineItem( 					
				 gM( 'mwe-embedplayer-download' ),
				'disk',
				function( ) {
					ctrlObj.displayOverlay( gM('mwe-embedplayer-loading_txt' ) );					
					// Call show download with the target to be populated
					ctrlObj.showDownload(  		
						ctrlObj.embedPlayer.$interface.find( '.overlay-content' ) 
					);	
					$j( ctrlObj.embedPlayer ).trigger( 'showDownloadEvent' );
				}
			)
		},		
		
		// Share the video menu
		'share': function( ctrlObj ) {
			return $j.getLineItem( 					
				gM( 'mwe-embedplayer-share' ),
				'mail-closed',
				function( ) {
					ctrlObj.displayOverlay( 
						ctrlObj.getShare()
					);	
					$j( ctrlObj.embedPlayer ).trigger( 'showShareEvent' );
				}
			)
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
		mw.log(' closeMenuOverlay: ' + this.displayOptionsMenuFlag);
		
		$overlay.fadeOut( "slow", function() {
			$overlay.remove();		
		} );
		// Show the big play button: 
		embedPlayer.$interface.find( '.play-btn-large' ).fadeIn( 'slow' );
		return false; // onclick action return false
	},
	
	/** 
	* Generic function to display custom HTML overlay 
	* on video.
	* 
	* @param {String} overlayContent content to be displayed
	*/
	displayOverlay: function( overlayContent ) {
		var _this = this;
		var embedPlayer = this.embedPlayer;
		mw.log( 'displayOverlay::' );
		//	set the overlay display flag to true:
		this.displayOptionsMenuFlag = true;
		mw.log(" set displayOptionsMenuFlag:: " + this.displayOptionsMenuFlag);
		
		if ( !this.supportedComponets[ 'overlays' ] ) {
			embedPlayer.stop();
		}						  
		// Hide the big play button: 
		embedPlayer.$interface.find( '.play-btn-large' ).hide();		
		
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
			$j('<div />')
			.addClass( 'ui-widget-overlay' )
			.css( {
				'height' : '100%',
				'width' : '100%',
				'z-index' : 2
			} )
		);
		
		// Setup the close button 
		$closeButton = $j('<span />')
		.addClass( 'ui-icon ui-icon-closethick' )
		.css({
			'position': 'absolute',
			'cursor' : 'pointer',
			'top' : '2px',
			'right' : '2px'
		})
		.buttonHover()
		.click( function() {
			_this.closeMenuOverlay();
		} );
					
		var overlayMenuCss = {
			'height' : 200,
			'width' :  250,
			'position' : 'absolute',
			'left' : '10px',
			'top': '15px',
			'overflow' : 'auto',
			'padding' : '4px',
			'z-index' : 3
		};	
		$overlayMenu = $j('<div />')
			.addClass( 'overlay-win ui-state-default ui-widget-header ui-corner-all' )
			.css( overlayMenuCss )
			.append(
				$closeButton,
				$j('<div />')
					.addClass( 'overlay-content' )					
					.append( overlayContent )
			)
			
		// Clone the overlay menu css: 
		var shadowCss = jQuery.extend( true, {}, overlayMenuCss );
		shadowCss['height' ] = 210;
		shadowCss['width' ] = 260;
		shadowCss[ 'z-index' ] = 2;		
		$overlayShadow = $j( '<div />' )
			.addClass('ui-widget-shadow ui-corner-all')
			.css( shadowCss );
			
		// Append the overlay menu to the player interface			
		embedPlayer.$interface.prepend( 
			$overlayMenu,
			$overlayShadow
		)
		.find( '.overlay-win' )
		.fadeIn( "slow" );					
		
		return false; // onclick action return false
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
		var	embed_code = embedPlayer.getEmbeddingHTML();		
		var _this = this;
		
		var $shareInterface = $j('<div />');
		
		$shareList = $j( '<ul />' );
		
        $shareList
        .append(
			$j('<li />')
	        .append(
	        	$j('<a />')
	        	.attr('href', '#')
	        	.addClass( 'active' )
	        	.text(
	        		gM( 'mwe-embedplayer-embed_site_or_blog' )
	        	)
	        )
	    )
        
       $shareInterface.append(
        	$j( '<h2 />' )
        	.text( gM( 'mwe-embedplayer-share_this_video' ) )      	
        	.append(
        		$shareList
        	)
        );
        
      	$shareInterface.append(      		
			
      		$j('<span />')
      		.addClass( 'source_wrap' )
      		.html(
      			$j( '<textarea />' )
      			.html( embed_code )
      			.click( function() {
					$j( this ).select();
				})
      		),
      		
      		$j('<br />'),
      		$j('<br />'),
				
      		$j('<button />')
      		.addClass( 'ui-state-default ui-corner-all copycode' )
      		.text( gM( 'mwe-embedplayer-copy-code' ) )
      		.click(function() {
      			$shareInterface.find( 'textarea' ).focus().select();
				// Copy the text if supported:
				if ( document.selection ) {
					CopiedTxt = document.selection.createRange();
					CopiedTxt.execCommand( "Copy" );
				}
			} )
			
		);
		return $shareInterface;
	},
	
	/**
	* Shows the Player Select interface
	* 
	* @param {Object} $target jQuery target for output
	*/
	getPlayerSelect: function( ) {		
		mw.log('getPlayerSelect::');		
		
		var embedPlayer = this.embedPlayer;
		
		var _this = this;
						
		$playerSelect = $j('<div />')
		.append( 
			$j( '<h2 />' )
			.text( gM( 'mwe-embedplayer-choose_player' )  )
		);		

		$j.each( embedPlayer.mediaElement.getPlayableSources(), function( sourceId, source ) {
			
			var playable = mw.EmbedTypes.players.defaultPlayer( source.getMIMEType() );			
			var is_selected = ( source == embedPlayer.mediaElement.selectedSource );			
			
			$playerSelect.append( 
				$j( '<h2 />' )
				.text( source.getTitle() )
			);
			
			if ( playable ) {
				$playerList = $j('<ul />');
				// output the player select code:
		
				var supportingPlayers = mw.EmbedTypes.players.getMIMETypePlayers( source.getMIMEType() );

				for ( var i = 0; i < supportingPlayers.length ; i++ ) {									
									
					// Add link to select the player if not already selected )
					if( embedPlayer.selectedPlayer.id == supportingPlayers[i].id && is_selected ) {	
						// Active player ( no link )
						$playerLine = $j( '<span />' )
						.text( 
						 	supportingPlayers[i].getName()
						)
						.addClass( 'ui-state-highlight ui-corner-all' );							
					} else {
						// Non active player add link to select: 
						$playerLine = $j( '<a />')
							.attr({
								'href' : '#',
								'rel' : 'sel_source',
								'id' : 'sc_' + sourceId + '_' + supportingPlayers[i].id 
							})
							.addClass( 'ui-corner-all')
							.text( supportingPlayers[i].getName() )
							.click( function() {
								var iparts = $j( this ).attr( 'id' ).replace(/sc_/ , '' ).split( '_' );
								var sourceId = iparts[0];
								var default_player_id = iparts[1];
								mw.log( 'source id: ' +  sourceId + ' player id: ' + default_player_id );
				
								embedPlayer.controlBuilder.closeMenuOverlay();
								
								// Close fullscreen if we are in fullscreen mode
								if( _this.fullscreenMode ){
									_this.restoreWindowPlayer()
								}
								
								embedPlayer.mediaElement.selectSource( sourceId );
				
								mw.EmbedTypes.players.setPlayerPreference( 
									default_player_id,
									embedPlayer.mediaElement.sources[ sourceId ].getMIMEType() 
								);
				
								// Issue a stop
								embedPlayer.stop();				
				
								// Don't follow the # link:
								return false;
							} )
							.hover(
								function(){
									$j( this ).addClass('ui-state-active')
								},
								function(){
									$j( this ).removeClass('ui-state-active')
								}
							);
					}
					
					// Add the player line to the player list:					
					$playerList.append(
						$j( '<li />' ).append(
							$playerLine
						)
					);
				}
				
				// Append the player list: 
				$playerSelect.append( $playerList );
				
			} else {
				// No player available: 
				$playerSelect.append( gM( 'mwe-embedplayer-no-player',  source.getTitle() ) ) 
			}
		} );
		
		// Return the player select elements
		return $playerSelect;		
	},
	
	/**
	* Show the text interface library and show the text interface near the player. 	 
	*/
	showTextInterface: function() {
		var _this = this;
		var embedPlayer = this.embedPlayer;
		var loc = embedPlayer.$interface.find( '.rButton.timed-text' ).offset();
		mw.log('showTextInterface::' + embedPlayer.id + ' t' + loc.top + ' r' + loc.right);							
				
		
		var $menu = $j( '#timedTextMenu_' + embedPlayer.id );			
		//This may be unnecessary .. we just need to show a spinner somewhere
		if ( $menu.length != 0 ) {
			// Hide show the menu:		
			if( $menu.is( ':visible' ) ) {
				$menu.hide( "fast" );
			}else{			 
				// move the menu to proper location				
				$menu.show("fast");
			}	
		}else{						
			//Setup the menu: 		
			$j('body').append( 
				$j('<div>')		
					.addClass('ui-widget ui-widget-content ui-corner-all')			
					.attr( 'id', 'timedTextMenu_' + embedPlayer.id )	
					.css( {
						'position' 	: 'absolute',
						'z-index' 	: 10,
						'height'	: '180px',
						'width' 	: '180px', 	
						'font-size'	: '12px',
						'display' : 'none'					
					} )
					
			);			
			// Load text interface ( if not already loaded )
			mw.load( 'TimedText', function() {				
				$j( '#' + embedPlayer.id ).timedText( 'showMenu', '#timedTextMenu_' + embedPlayer.id );				
			});		
		}		
	},
	
	/**
	* Loads sources and calls showDownloadWithSources
	* @param {Object} $target jQuery target to output to
	*/
	showDownload: function( $target ) {
		var _this = this;
		var embedPlayer = this.embedPlayer;
		// Load the roe if available (to populate out download options:		
		// mw.log('f:showDownload '+ this.roe + ' ' + this.mediaElement.addedROEData);
		if ( embedPlayer.roe && embedPlayer.mediaElement.addedROEData == false ) {
			$target.html( gM( 'mwe-embedplayer-loading_txt' ) );
			embedPlayer.getMvJsonUrl( this.roe, function( data ) {
			   embedPlayer.mediaElement.addROE( data );
			   _this.showDownloadWithSources( $target );
			} );
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
		mw.log( 'showDownloadWithSources::' + $target.length );
		var embedPlayer = this.embedPlayer;
		// Empty the target:
		$target.empty();
		
		var $mediaList = $j( '<ul />' );
		var $textList =  $j( '<ul />' );
		$j.each( embedPlayer.mediaElement.getSources(), function( index, source ) {
			if(  source.getSrc() ) {
				mw.log("add src: "  + source.getTitle() );
				var $dl_line = $j( '<li />').append(
					$j('<a />')					
					.attr( 'href', source.getSrc() )
					.text(  source.getTitle() )
				);		
				// Add link to correct "bucket" 
							
				//Add link to time segment:
				if ( source.getSrc().indexOf( '?t=' ) !== -1 ) {
					$target.append( $dl_line );
				} else if ( this.getMIMEType() == "text/cmml" || this.getMIMEType() == "text/x-srt" ) {
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
				$j('<h2 />')
				.text( gM( 'mwe-embedplayer-download_full' ) ),
				$mediaList
			)
		}
		
		if( $textList.find('li').length != 0 ) {
			$target.append(
				$j('<h2 />')
				.html( gM( 'mwe-embedplayer-download_text' ) ),
				$textList
			)
		}		
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
			return this.components[ component_id ].h
		}
		return false;
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
			return this.components[ component_id ].w
		}
		return false;
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
			'w' : 130,
			'h' : 96,
			'o' : function( ctrlObj ) {		
						
				return $j( '<div/>' )
					.attr( {
						'title'	: gM( 'mwe-embedplayer-play_clip' ),
						'class'	: "ui-state-default play-btn-large"
					} )
					// Get dynamic position for big play button
					.css( {
						'left' 	: ( ( ctrlObj.embedPlayer.getPlayerWidth() - this.w ) / 2 ),
						'top'	: ( ( ctrlObj.embedPlayer.getPlayerHeight() - this.h ) / 2 )
					} )
					// Add play hook:
					.buttonHover().click( function() {
						 ctrlObj.embedPlayer.play();
					} );
			}			
		},
		
		/**
		* The kaltura attribution button
		*/
		'kalturaAttribution' : {
			'w' : 28,
			'o' : function( ctrlObj ){			
				return $j('<a />')
					.attr({
						'href': 'http://kaltura.com',
						'title' : gM( 'mwe-embedplayer-kaltura-platform-title' ),
						'target' : '_new'
					})
					.append(
						$j( '<div />' )
						.addClass( 'rButton' )
						.css({
							'top' : '9px',
							'left' : '2px'
						})
						.append( 
							$j('<span />')
							.addClass( 'ui-icon kaltura-icon' )
						)
					)						
			}
		},
		
		/**
		* The options button, invokes display of the options menu
		*/
		'options': {
			'w': 28,
			'o': function( ctrlObj ) {
				return $j( '<div />' )
						.attr( 'title',  gM( 'mwe-embedplayer-player_options' ) )						
						.addClass( 'ui-state-default ui-corner-all ui-icon_link rButton options-btn' )
						.append( 
							$j('<span />')
							.addClass( 'ui-icon ui-icon-wrench' )
						)	
						.buttonHover()		
						// Options binding:						
						.menu( {
							'content' : ctrlObj.getOptionsMenu(),
							'zindex' : mw.getConfig( 'EmbedPlayer.fullScreenZIndex' ) + 1, 		
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
				
				// Setup "dobuleclick" fullscreen binding to embedPlayer 
				$j( ctrlObj.embedPlayer ).unbind("dblclick").bind("dblclick", function(){
					ctrlObj.embedPlayer.fullscreen();					
				});			
				
				return $j( '<div />' )
						.attr( 'title', gM( 'mwe-embedplayer-player_fullscreen' ) )
						.addClass( "ui-state-default ui-corner-all ui-icon_link rButton fullscreen-btn" )
						.append(
							$j( '<span />' )
							.addClass( "ui-icon ui-icon-arrow-4-diag" )
						)
						// Fullscreen binding:
						.buttonHover().click( function() {
							ctrlObj.embedPlayer.fullscreen();
							$j( ctrlObj.embedPlayer ).trigger( 'openFullScreenEvent' );
						} );
			}
		},
		
		
		/**
		* The pause / play button
		*/
		'pause': {
			'w': 28,
			'o': function( ctrlObj ) {
				return $j( '<div />' )
						.attr( 'title', gM( 'mwe-embedplayer-play_clip' ) )
						.addClass ( "ui-state-default ui-corner-all ui-icon_link lButton play-btn" )
						.append( 
							$j( '<span />' )
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
		* The closed captions button
		*/
		'timedText': {
			'w': 28,
			'o': function( ctrlObj ) {
				return $j( '<div />' )
						.attr( 'title', gM( 'mwe-embedplayer-timed_text' ) )
						.addClass( "ui-state-default ui-corner-all ui-icon_link rButton timed-text" )
						.append( 
							$j( '<span />' )
							.addClass( "ui-icon ui-icon-comment" )
						)
						// Captions binding:
						.buttonHover()
						.click( function() {									
							ctrlObj.showTextInterface();
						} )						
			}
		},
		
		/** 
		* The volume control interface html
		*/
		'volumeControl': {
			'w' : 28,
			'o' : function( ctrlObj ) {
				mw.log( ' set up volume control for: ' + ctrlObj.embedPlayer.id );
				$volumeOut = $j( '<span />' );
				if ( ctrlObj.volume_layout == 'horizontal' ) {
					$volumeOut.append(  
						$j( '<div />' )
						.addClass( "ui-slider ui-slider-horizontal rButton volume-slider" )
					);
				}
				
				// Add the volume control icon
				$volumeOut.append( 	
				 	$j('<div />')
				 	.attr( 'title', gM( 'mwe-embedplayer-volume_control' ) )
				 	.addClass( "ui-state-default ui-corner-all ui-icon_link rButton volume_control" )
				 	.append( 
				 		$j( '<span />' )
				 		.addClass( "ui-icon ui-icon-volume-on" )
				 	)
				 );				
				if ( ctrlObj.volume_layout == 'vertical' ) {
					$volumeOut.find('.volume_control').append( 	
						$j( '<div />' )
						.css( {
							'position' : 'absolute',							
							'left' : '0px'
						})
						.hide()
						.addClass( "vol_container ui-corner-all" )
						.append( 
							$j( '<div />' )
							.addClass ( "volume-slider" )
						)
					);
				}							
				//Return the inner html 
				return $volumeOut.html();
			}
		},
		
		/*
		* The time display area
		*/
		'timeDisplay': {
			'w' : 100,
			'o' : function( ctrlObj ) {
				return $j( '<div />' )
						.addClass( "ui-widget time-disp" )
						.append( 
							ctrlObj.embedPlayer.getTimeRange()
						)
						
			}
		},
		
		/**
		* The playhead component
		*/
		'playHead': {
			'w':0, // special case (takes up remaining space)
			'o':function( ctrlObj ) {
				var embedPlayer = ctrlObj.embedPlayer;
				var _this = this;
				var $playHead = $j( '<div />' )
					.addClass ( "play_head" )
					.css({ 
						"position" : 'absolute',
						"left" : '33px',
						"right" :  ( ( embedPlayer.getPlayerWidth() - ctrlObj.available_width ) - 33) + 'px' 
					})					
					// Playhead binding
					.slider( {
						range: "min",
						value: 0,
						min: 0,
						max: 1000,
						start: function( event, ui ) {
							var id = ( embedPlayer.pc != null ) ? embedPlayer.pc.pp.id:embedPlayer.id;
							embedPlayer.userSlide = true;
							$j( id + ' .play-btn-large' ).fadeOut( 'fast' );
							// If playlist always start at 0
							embedPlayer.start_time_sec = ( embedPlayer.instanceOf == 'mvPlayList' ) ? 0:
											mw.npt2seconds( embedPlayer.getTimeRange().split( '/' )[0] );
						},
						slide: function( event, ui ) {
							var perc = ui.value / 1000;
							embedPlayer.jump_time = mw.seconds2npt( parseFloat( parseFloat( embedPlayer.getDuration() ) * perc ) + embedPlayer.start_time_sec );
							// mw.log('perc:' + perc + ' * ' + embedPlayer.getDuration() + ' jt:'+  this.jump_time);
							if ( _this.longTimeDisp ) {
								ctrlObj.setStatus( gM( 'mwe-embedplayer-seek_to', embedPlayer.jump_time ) );
							} else {
								ctrlObj.setStatus( embedPlayer.jump_time );
							}
							// Update the thumbnail / frame
							if ( embedPlayer.isPlaying == false ) {
								embedPlayer.updateThumbPerc( perc );
							}
						},
						change:function( event, ui ) {
							// Only run the onChange event if done by a user slide 
							// (otherwise it runs times it should not)
							if ( embedPlayer.userSlide ) {
								embedPlayer.userSlide = false;
								embedPlayer.seeking = true;
			
								var perc = ui.value / 1000;
								// set seek time (in case we have to do a url seek)
								embedPlayer.seek_time_sec = mw.npt2seconds( embedPlayer.jump_time, true );
								mw.log( 'do jump to: ' + embedPlayer.jump_time + ' perc:' + perc + ' sts:' + embedPlayer.seek_time_sec );
								ctrlObj.setStatus( gM( 'mwe-embedplayer-seeking' ) );
								embedPlayer.doSeek( perc );
							}
						}
					} );
		
				// Up the z-index of the default status indicator:
				$playHead.find( 'ui-slider-handle' ).css( 'z-index', 4 );
				$playHead.find( '.ui-slider-range' ).addClass( 'ui-corner-all' ).css( 'z-index', 2 );
		
				// Add buffer html: 
				$playHead.append( 
					$j('<div />')
					.addClass( "ui-slider-range ui-slider-range-min ui-widget-header")
					.addClass( "ui-state-highlight ui-corner-all mw_buffer")
				);
									
				return $playHead;	
			}
		}
	}
};
