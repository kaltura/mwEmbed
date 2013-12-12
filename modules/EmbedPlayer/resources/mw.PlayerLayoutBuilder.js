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
	
	// binding postfix
	bindPostfix: '.layoutBuilder',

	layoutReady: false,

	// Display importance available values
	importanceSet: ['low', 'medium', 'high'],

	/**
	* Initialization Object for the control builder
	*
	* @param {Object} embedPlayer EmbedPlayer interface
	*/
	init: function( embedPlayer ) {
		var _this = this;
		this.embedPlayer = embedPlayer;

		this.fullScreenManager = new mw.FullScreenManager( embedPlayer );

		// Return the layoutBuilder Object:
		return this;
	},

	getInterface: function() {
		if( ! this.$interface ) {

			var embedPlayer = this.embedPlayer,
				$embedPlayer = $( embedPlayer );

			// build the videoDisplay wrapper if needed
			if( $embedPlayer.parent('.videoDisplay').length == 0 ){
				$embedPlayer.wrap(
					$('<div />').addClass( 'videoDisplay' )
				);
			}

			var $videoDisplay = $embedPlayer.parent('.videoDisplay');

			// build the videoHolder wrapper if needed
			if( $videoDisplay.parent('.videoHolder').length == 0 ){
				$videoDisplay.parent('.videoDisplay').wrap(
					$('<div />').addClass( 'videoHolder' )
				);
			}			

			var $videoHolder = $videoDisplay.parent( '.videoHolder' );
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

			if( mw.isTouchDevice() ){
				this.$interface.addClass('touch');
			}

			// Add our skin name as css class
			this.$interface.addClass( embedPlayer.playerConfig.layout.skin );

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

		// Init tooltips
		if( mw.hasMouseEvents() ){
			this.initToolTips();
		}
		
		// Supports CSS3 on IE8/IE9
		if( mw.isIE8() || mw.isIE9() ){
			this.embedPlayer.bindHelper( 'layoutBuildDone', function(){
				$('.PIE').each(function(){
					PIE.attach(this);
				});
			});
		}

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
		this.embedPlayer.triggerHelper( 'addLayoutContainer' );
	},

	mapComponents: function() {
		var _this = this;
		// Allow plugins to add their own components ( old event: addControlBarComponent )
		this.embedPlayer.triggerHelper( 'addLayoutComponent', this );
		//var plugins = this.embedPlayer.playerConfig['plugins'];
		$.each(this.components, function( compId, compConfig ) {
			// If we don't have parent, continue
			if( !compConfig.parent ) return true;
			// Check if we have this kind of container
			if( _this.layoutContainers[ compConfig.parent ] ) {
				_this.layoutContainers[ compConfig.parent ].push({
					'id': compId,
					'order': compConfig.order,
					'insertMode': (compConfig.insertMode) ? compConfig.insertMode : 'lastChild'
				});
			}
		});

		$.each(this.layoutContainers, function( idx, components ) {
			_this.layoutContainers[ idx ].sort(function(comp1, comp2) {
				return ((comp1.order < comp2.order) ? -1 : ((comp1.order > comp2.order) ? 1 : 0));
			});
		});
	},

	drawLayout: function() {
		mw.log('PlayerLayoutBuilder:: drawLayout', this.layoutContainers);
		var _this = this;
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

		// Add tab-index
		var $buttons = $interface.find('.controlsContainer').find('.btn');
		var tabIndex = 0;
		var rightBtnIndex = 0;
		$buttons.each(function(i){
			if( $(this).hasClass('pull-right') || $(this).parent().hasClass('pull-right') ) {
				rightBtnIndex++;
				$( this ).attr('tabindex', ($buttons.length-rightBtnIndex));
			} else {
				tabIndex++;
				$( this ).attr('tabindex', tabIndex);
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

	updateComponentsVisibility: function(){
		var _this = this;
		// Go over containers and update their components
		$.each(this.layoutContainers, function( containerId, components ) {
			if( containerId == 'videoHolder' || containerId == 'controlBarContainer' ){
				return true;
			}
			_this.updateContainerCompsByAvailableSpace(
				_this.getInterface().find('.' + containerId )
			);
		});
	},

	updateContainerCompsByAvailableSpace: function( $container ){
		if( !$container.length ) return;
		
		var _this = this;
		var containerWidth = $container.width();

		var hideOneByImportance = function () {
			$.each(_this.importanceSet, function (i, importance) {
				var $s = $container.find('.display-' + importance + ':visible');
				if ($s.length) {
					$s.first().hide();
					// break;
					return false;
				}
			});
		};
		var showOneByImportance = function () {
			$.each(_this.importanceSet.slice(0).reverse(), function (i, importance) {
				var $s = $container.find('.display-' + importance + ':hidden');
				if ($s.length) {
					$s.first().show();
					//break;
					return false;
				}
			});
		};
		var getNextShowWidth = function () {
			var nextWidth = 0;
			$.each(_this.importanceSet.slice(0).reverse(), function (i, importance) {
				var $s = $container.find('.display-' + importance + ':hidden');
				if ($s.length) {
					// we have to draw to get true outerWidth:
					var $comp = $s.first().show();
					nextWidth = _this.getComponentWidth( $comp );
					$comp.hide();
					//break;
					return false;
				}
			});
			return nextWidth;
		};
		// add a failsafe for while loops on DOM
		var i=0;
		// Hide till fit
		if (containerWidth < this.getComponentsWidthForContainer( $container )
			&& this.canHideShowContainerComponents( $container, true ) ) {

			while ( i++ < 30 && containerWidth < this.getComponentsWidthForContainer( $container ) 
				&& this.canHideShowContainerComponents( $container, true ) ) {
				mw.log("hideOneByImportance: " + containerWidth + ' < ' + this.getComponentsWidthForContainer( $container ));
				hideOneByImportance();
			}
			// break ( only hide or show in one pass ) 
			return;
		};
		// Show till full
		while ( i++ < 30 && $container.find('.comp:hidden').length 
			&& this.canHideShowContainerComponents( $container, false )
			&& containerWidth > (this.getComponentsWidthForContainer( $container ) + getNextShowWidth())) {
			mw.log("showOneByImportance: " + containerWidth + ' > ' + (this.getComponentsWidthForContainer( $container ) + ' ' + getNextShowWidth()));
			showOneByImportance();
		}
	},

	canHideShowContainerComponents: function( $container, visible ) {
		var state = (visible) ? 'visible' : 'hidden';
		var found = false;
		$.each(this.importanceSet, function (i, importance) {
			var $s = $container.find('.display-' + importance + ':' + state);
			if ($s.length) {
				found = true;
				// break;
				return false;
			}
		});
		return found;
	},

	// Special case expandable components (i.e volumeControl)
	getComponentWidth: function( $comp ){
		return $comp.data('width') || $comp.outerWidth(true);;
	},

	getComponentsWidthForContainer: function( $container ){
		var _this = this;
		var totalWidth = 10; // add some padding
		$container.find('.comp:visible').each(function () {
			totalWidth += _this.getComponentWidth( $(this) );
		});
		return totalWidth;
	},

	getComponentsHeight: function() {
		var height = 0;
		// Go over all playerContainer direct children with .block class
		this.getInterface().find('.block').each(function() {
			height += $( this ).outerHeight( true );
		});
		return height;
	},

	initToolTips: function(){
		// exit if not enabled
		if( !this.embedPlayer.enableTooltips || kWidget.isIE8() ) {
			return;
		}
		var _this = this;
		this.embedPlayer.bindHelper( 'layoutBuildDone', function(){
			_this.getInterface().tooltip({
				items: '[data-show-tooltip]',
				  position: {
					my: "center bottom-10",
					at: "center top",
					using: function( position, feedback ) {
					  $( this ).css( position );
					  $( "<div>" )
						.addClass( "arrow" )
						.addClass( feedback.vertical )
						.addClass( feedback.horizontal )
						.appendTo( this );
					}
				  }
				});
		});
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
		var _this = this;		
		var embedPlayer = this.embedPlayer;
		var $interface = this.getInterface();
		var adPlaybackState = 'adplay-state';

		// Shoutcut for binding
		var b = function( eventName, callback ) {
			embedPlayer.bindHelper( eventName + _this.bindPostfix, callback);
		};

		// Decide which bindings to add based on device capabilities
		var addPlaybackBindings = function(){
			if( embedPlayer.getFlashvars('disableOnScreenClick') ) return ;
			if( mw.isTouchDevice() ){
				_this.addPlayerTouchBindings();
			} else {
				_this.addPlayerClickBindings();
			}
		};

		var removePlaybackBindings = function(){
			if( embedPlayer.getFlashvars('disableOnScreenClick') ) return ;
			if( mw.isTouchDevice() ){
				_this.removePlayerTouchBindings();
			} else {
				_this.removePlayerClickBindings();
			}
		};

		_this.onControlBar = false;

		// Remove any old interface bindings
		embedPlayer.unbindHelper( this.bindPostfix );

		var bindFirstPlay = false;
		_this.addRightClickBinding();

		this.updateLayoutTimeout = null;

		b('updateLayout', function(){
			// Firefox unable to get component width correctly without timeout
			clearTimeout(_this.updateLayoutTimeout);
			_this.updateLayoutTimeout = setTimeout(function(){ 
				_this.updateComponentsVisibility();				
				_this.updatePlayerSizeClass();
			},100);
		});

		// Bind into play.ctrl namespace ( so we can unbind without affecting other play bindings )
		b( 'onplay', function() { //Only bind once played
			// add right click binding again ( in case the player got swaped )
			_this.addRightClickBinding();
		});

		b( 'AdSupport_StartAdPlayback', function(){
			$interface.addClass( adPlaybackState );
		});

		b( 'AdSupport_EndAdPlayback', function(){
			$interface.removeClass( adPlaybackState );
		});

		// Bind to EnableInterfaceComponents
		b( 'onEnableInterfaceComponents', function() {
			_this.controlsDisabled = false;
			addPlaybackBindings();
		});

		// Bind to DisableInterfaceComponents
		b( 'onDisableInterfaceComponents', function() {
			_this.controlsDisabled = true;
			removePlaybackBindings();
		});

		// Add fullscreen bindings to update layout:
		b( 'onOpenFullScreen', function() {
			setTimeout(function(){
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

		// add the player click / touch bindings
		addPlaybackBindings();
		this.addControlsVisibilityBindings();

		mw.log( 'trigger::addControlBindingsEvent' );
		embedPlayer.triggerHelper( 'addControlBindingsEvent' );
	},
	addPlayerTouchBindings: function(){
		var _this = this;		
		// First remove old bindings
		this.removePlayerTouchBindings();

		// protect against scroll intent
		var touchStartPos, touchEndPos = null;
		$( _this.embedPlayer ).bind( 'touchstart' + this.bindPostfix, function(e) {
			touchStartPos = e.originalEvent.touches[0].pageY; //starting point
		})
		.bind( 'touchend' + this.bindPostfix, function(e) {
			// remove drag binding:
			if ( _this.embedPlayer.isControlsVisible || _this.embedPlayer.useNativePlayerControls()) {
                touchEndPos = e.originalEvent.changedTouches[0].pageY; //ending point
				var distance = Math.abs( touchStartPos - touchEndPos );
				if( distance < 10 ){
					mw.log('PlayerLayoutBuilder::addPlayerTouchBindings:: togglePlayback from touch event');
					_this.togglePlayback();
				}
			}
		});
	},
	removePlayerTouchBindings: function(){
		$( this.embedPlayer ).unbind( "touchstart" + this.bindPostfix );
        $( this.embedPlayer ).unbind( "touchend" + this.bindPostfix );
	},
	addControlsVisibilityBindings: function(){
		var embedPlayer = this.embedPlayer;
		var _this = this;
		var $interface = embedPlayer.getInterface();

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

		var outPlayerClass = 'player-out';

		var showPlayerControls = function(){
			clearTimeout(hideControlsTimeout);
			$interface.removeClass( outPlayerClass );
			embedPlayer.triggerHelper( 'showPlayerControls' );
		};
		var hidePlayerControls = function(){
			$interface.addClass( outPlayerClass );
			embedPlayer.triggerHelper( 'hidePlayerControls' );
		};

		// Check if we should display the interface:
		if ( mw.hasMouseEvents() ) {
			var hoverIntentConfig = {
				'sensitivity': 100,
				'timeout' : mw.getConfig('EmbedPlayer.HoverOutTimeout'),
				'over' : function(){
					showPlayerControls();
				},
				'out' : function(){
					hidePlayerControls();
				}
			};
			$interface.hoverIntent( hoverIntentConfig );
		}

		var hideControlsTimeout = null;
		
		// Bind a startTouch to show controls
		$( embedPlayer ).bind( 'touchstart', function() {
			showPlayerControls();
			hideControlsTimeout = setTimeout(function(){
				hidePlayerControls();
			}, 5000);
			return true;
		} );
	},
	// Hold the current player size class
	// The value is null so we will trigger playerSizeClassUpdate on first update
	playerSizeClass: null,
	// Adds class to the interface with the current player size and trigger event
	// Triggered by updateLayout event
	updatePlayerSizeClass: function(){
		var width = $(window).width();
		var playerSizeClass = '';
		if( width < 300 ) {
			playerSizeClass = 'tiny';
		} else if( width < 450 ) {
			playerSizeClass = 'small';
		} else if( width < 700 ) {
			playerSizeClass = 'medium';
		} else {
			playerSizeClass = 'large';
		}
		// Only update if changed
		if( this.playerSizeClass !== playerSizeClass ) {
			this.playerSizeClass = playerSizeClass;
			this.getInterface()
				.removeClass('size-tiny size-small size-medium size-large')
				.addClass('size-' + this.playerSizeClass);			
			this.embedPlayer.triggerHelper('playerSizeClassUpdate', [this.playerSizeClass] );
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

		// Remove old click bindings before adding:
		this.removePlayerClickBindings();

		var didDblClick = false;
		var dblClickTimeout = null;

		$( embedPlayer ).bind( "dblclick" + _this.bindPostfix, function() {
			didDblClick = true;
		});
		// Check for click
		$( embedPlayer ).bind( "click" + _this.bindPostfix, function() {
		    if( dblClickTimeout ) return true;
		    dblClickTimeout = setTimeout(function(){
		        if( didDblClick ) {
		            didDblClick = false;
		        } else {
		        	mw.log('PlayerLayoutBuilder::addPlayerClickBindings:: togglePlayback from click event');
		            _this.togglePlayback();
		        }
		        clearTimeout( dblClickTimeout );
		        dblClickTimeout = null;
		    }, 300);

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

	togglePlayback: function(){

		// Do not toggle playback when controls disabled or using native controls
		if( this.isControlsDisabled() ){
			return;
		}

		this.embedPlayer.togglePlayback();
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
			this.closeMenuOverlay();
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
		var _this = this;
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
					_this.closeAlert( alertObj.keepOverlay );
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
		return this.displayMenuOverlay( $container, false, true );
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
	components: {},
};

} )( window.mediaWiki, window.jQuery );