(function ( mw, $ ) {
	"use strict";
	mw.PluginManager.add( 'dualScreen', mw.KBaseComponent.extend( {

			defaultConfig: {
				"parent": "videoHolder",
				"order": 1,
				"showTooltip": false,
				"displayImportance": "high",
				"cuePointType": [{
					"main": mw.KCuePoints.TYPE.THUMB,
					"sub": [mw.KCuePoints.THUMB_SUB_TYPE.SLIDE]
				}],
				"prefetch": {
					"durationPercentageUntilNextSequence": 60,
					"minimumSequenceDuration": 2
				},
				"secondScreen": {
					"sizeRatio": "25",
					"widthHeightRatio": ( 3 / 4 ),
					"startLocation": "right bottom"
				},
				"resizable": {
					"handles": "ne, se, sw, nw",
					"maxWidth": 50,
					"aspectRatio": true,
					"minWidth": 100,
					"containment": "parent"
				},
				"draggable": {
					"cursor": "move",
					"containment": "parent"
				},
				"menuFadeout": 5000,
				"resizeHandlesFadeout": 5000,
				"mainViewDisplay": 2, // 1 - Main stream, 2 - Presentation
				"fullScreenDisplayOnly": false,
				"minDisplayWidth": 0,
				"minDisplayHeight": 0,
				"enableKeyboardShortcuts": true,
				"keyboardShortcutsMap": {
					"nextState": 81,   // Add q Sign for next state
					"switchView": 87   // Add w Sigh for switch views
				}
			},
			display: {},
			displayInitialized: false,
			render: true,
			auxScreenMinimized: false,
			fsmState: [],
			screenShown: false,
			currentScreenNameShown: "",

			setup: function ( ) {
				this.initConfig();
				this.initFSM();
				this.addBindings();
				this.initDisplays();
			},
			isSafeEnviornment: function () {
				this.initSecondPlayer();
				return this.secondPlayer.isSafeEnviornment();
			},
			addBindings: function () {
				var _this = this;
				this.bind( 'playerReady', function (  ) {
					_this.checkRenderConditions();
					_this.initView();
					_this.initControlBar();
					if (!_this.render) {
						_this.getPrimary().obj.css( {'top': '', 'left': '', 'width': '', 'height': ''} ).removeClass( 'firstScreen' );
						_this.hideDisplay();
					}
				} );

				this.bind( 'postDualScreenTransition', function () {
					//TODO: move to imagePlayer
					_this.screenObj.applyIntrinsicAspect();
				});

				//Handle layout changes due to layout update(resize and orientation change)
				this.bind( 'updateLayout', function(e){
					_this.updateSecondScreenLayout(e);
				});
				// Android fires orientationchange too soon, i.e width and height are wrong
				var eventName = mw.isAndroid() ? 'resize' : 'orientationchange';
				eventName += this.bindPostFix;
				var isIframe = (mw.getConfig('EmbedPlayer.IsIframeServer' ) && mw.getConfig('EmbedPlayer.IsFriendlyIframe'));
				var context = isIframe ? window.parent : window;
				// Bind orientation change to resize player
				$( context ).bind( eventName, function(e){
					_this.updateSecondScreenLayout(e);
				});

				//Disable/enable plugin view on screen plugins actions
				this.bind( "preShowScreen", function (e, screenName) {
					_this.screenShown = true;
					if (_this.render) {
						_this.currentScreenNameShown = screenName;
						_this.controlBar.enable();
						_this.controlBar.hide();
						_this.controlBar.disable();
						_this.minimizeSecondDisplay();
					}
				} );
				this.bind( "preHideScreen", function (e, screenName) {
					_this.screenShown = false;
					if (_this.render && _this.currentScreenNameShown === screenName) {
						_this.currentScreenNameShown = "";
						_this.maximizeSecondDisplay();
						//Use setTimeout to verify that screens are hidden and not that this is a part of
						// screens transition --> when going from one screen to another we first emit preHideScreen and
						//only then preShowScreen
						setTimeout(function(){
							if (!_this.screenShown) {
								_this.controlBar.enable();
								_this.controlBar.show();
							}
						}, 100);
					}
				} );

				//Consume view state events
				this.bind( 'dualScreenStateChange', function(e, state){
					_this.fsm.consumeEvent( state );
				});

				//Listen to events which affect controls view state
				this.bind( 'showPlayerControls' , function(){
					_this.controlBar.show();
				});
				this.bind( 'onplay', function () {
					_this.controlBar.enable();
				} );
				this.bind( 'onpause ended playerReady', function () {
					_this.controlBar.show();
					_this.controlBar.disable();
				} );
				var wasDisabled = false;
				this.bind( 'startDisplayInteraction', function(){
					_this.controlBar.hide();
					if (_this.controlBar){
						wasDisabled = _this.controlBar.disabled;
					}
					_this.controlBar.disable();
					_this.getPlayer().disablePlayControls();
				});
				this.bind( 'stopDisplayInteraction', function() {
					//Only enable and show if controlBar was enabled before transition
					if ( !wasDisabled ) {
						_this.controlBar.enable();
						_this.controlBar.show();
					}
					_this.getPlayer().enablePlayControls();
				});

				if (this.getConfig('enableKeyboardShortcuts')) {
					this.bind('addKeyBindCallback', function (e, addKeyCallback) {
						_this.addKeyboardShortcuts(addKeyCallback);
					});
				}
			},
			addKeyboardShortcuts: function (addKeyCallback) {
				var _this = this;
				// Add q Sign for next state
				addKeyCallback(this.getConfig("keyboardShortcutsMap").nextState, function () {
					var action;
					switch(_this.fsm.getStatus())
					{
						case "PiP":
							action = "hide";
							break;
						case "hide":
							action = "SbS";
							break;
						case "SbS":
							action = "PiP";
							break;
					}
					_this.getPlayer().triggerHelper('dualScreenStateChange', action);
				});
				// Add w Sigh for switch view
				addKeyCallback(this.getConfig("keyboardShortcutsMap").switchView, function () {
					_this.getPlayer().triggerHelper('dualScreenStateChange', "switchView");
				});
			},

			initConfig: function () {
				var maxWidthPercentage = this.getConfig( 'resizable' ).maxWidth;
				var playerWidth = this.getPlayer().getWidth();
				var maxWidth = ( ( playerWidth * this.getConfig( 'resizable' ).maxWidthPercentage ) / 100 );
				var minWidth = ( ( playerWidth * this.getConfig( 'secondScreen' ).sizeRatio ) / 100 );
				var resizable = $.extend(
					{},
					this.getConfig( 'resizable' ),
					{
						maxWidthPercentage: maxWidthPercentage,
						maxWidth: maxWidth,
						minWidth: minWidth
					}
				);
				this.setConfig( {resizable: resizable} );
			},
			initFSM: function () {
				var _this = this;

				var fsmTransitionHandlers = function (transitionFrom, transitionTo) {
					var transitionHandlerSet = true;
					_this.getPlayer().triggerHelper('preDualScreenTransition', [[transitionFrom, transitionTo]]);

					_this.controlBar.hide();

					_this.bind("displayTransitionEnded", function ( ) {
						if ( transitionHandlerSet ) {
							transitionHandlerSet = false;
							_this.controlBar.show();
							_this.disableTransitions();
							_this.getPlayer().triggerHelper('postDualScreenTransition', [[transitionFrom, transitionTo]]);
						}
					});
					_this.enableTransitions();
				};

				var selectedStatesMap = mw.isNativeApp() ? mw.dualScreen.nativeAppStates : mw.dualScreen.states;

				this.fsm = new mw.dualScreen.StateMachine( selectedStatesMap, this, fsmTransitionHandlers );
			},
			initDisplays: function () {
				var _this = this;
				$.each( mw.dualScreen.display.TYPE, function ( key, val ) {
					_this.display[val] = new mw.dualScreen.display(_this.getPlayer(), function(){
						this.setConfig({
							isMain: (val === mw.dualScreen.display.TYPE.PRIMARY),
							resizeHandlesFadeout: _this.getConfig( 'resizeHandlesFadeout' ),
							resizable: _this.getConfig( 'resizable' ),
							draggable: _this.getConfig( 'draggable' )
						});
					}, val + "Display");
				} );
				this.display.main = this.display.primary;
				this.display.aux = this.display.secondary;
			},
			initControlBar: function(){
				if ( !this.controlBar && !this.getPlayer().isAudio()) {
					var _this = this;
					this.controlBar = new mw.dualScreen.dualScreenControlBar(_this.getPlayer(), function(){
						this.setConfig('menuFadeout', _this.getConfig('menuFadeout'));
					}, 'dualScreenControlBar');
					this.embedPlayer.getInterface().append( this.controlBar.getComponent() );
				}
			},
			initView: function(){
				var _this = this;
				if (!this.displayInitialized) {
					this.displayInitialized = true;
					this.previousPlayerWidth = this.getPlayer().getWidth();
					this.previousPlayerHeight = this.getPlayer().getHeight();

					var primaryScreenEl = this.getPlayer().getVideoDisplay();
					var secondaryScreenEl = this.getComponent();
					var primaryScreen = this.display[mw.dualScreen.display.TYPE.PRIMARY];
					var secondaryScreen = this.display[mw.dualScreen.display.TYPE.SECONDARY];
					primaryScreen.attachView(primaryScreenEl);
					secondaryScreen.attachView(secondaryScreenEl);

					secondaryScreenEl.append( this.screenObj.getComponent());

					var pointerEvents = "click dblclick touchstart touchend";
					secondaryScreenEl
				        .off(pointerEvents)
				        .on( pointerEvents, function ( e ) {
							//Verify that second screen is not in the middle of user interaction before delegating events
							if(!_this.getSecondary().isUserInteracting()){
								_this.embedPlayer.triggerHelper( e );
							}
						} );

					primaryScreen.disableUserActions();
					secondaryScreen.enableUserActions();

					this.positionSecondScreen();

					var showLoadingSlide = function () {
						if ( !_this.secondDisplayReady && _this.render && mw.getConfig( "EmbedPlayer.LiveCuepoints" ) ) {
							//TODO: add information slide for no current slide available
						}
					};

					if ( this.getConfig( "mainViewDisplay" ) === 2 && !mw.isNativeApp() ||
					     this.getPlayer().isAudio()) {
						this.bind( 'postDualScreenTransition.spinnerPostFix', function () {
							_this.unbind( 'postDualScreenTransition.spinnerPostFix' );
							showLoadingSlide();
						} );
						setTimeout( function () {
							_this.fsm.consumeEvent( "switchView" );
							if (_this.getPlayer().isAudio()){
								_this.fsm.consumeEvent( "hide" );
							}
						}, 1000 );
					} else {
						showLoadingSlide();
					}

					//dualScreen components are set on z-index 1-3, so set all other components to zIndex 4 or above
					this.zIndexObjs = [];
					$.each( this.embedPlayer.getVideoHolder().children(), function ( index, childNode ) {
						var obj = $( childNode );
						var classList = obj.attr( 'class' ) ? obj.attr( 'class' ).split( /\s+/ ) : [];
						if ( $.inArray( "dualScreen", classList ) === -1 ) {
							if ( isNaN( obj.css( 'z-index' ) ) ) {
								obj.css( 'z-index', 4 );
							} else {
								var zIndex = parseInt(obj.css( 'z-index' ), 10);
								obj.css( 'z-index', zIndex + 4 );
							}
							_this.zIndexObjs.push( obj );
						}
					} );
				}
			},

			//Manage display helpers
			disableView: function(){
				this.getAuxDisplay().obj.css("visibility", "hidden");
				this.controlBar.hide();
				this.controlBar.disable();
			},
			enableView: function(){
				this.getMainDisplay().obj.css("visibility", "");
				this.getAuxDisplay().obj.css("visibility", "");
				this.controlBar.enable();
				this.controlBar.show();
			},
			minimizeSecondDisplay: function(){
			    if (!this.auxScreenMinimized) {
					this.auxScreenMinimized = true;
				    var primaryIsMain = (this.getPrimary() === this.getMainDisplay());
					if (!(primaryIsMain && this.fsm.getStatus() === "hide")) {
						this.fsmState.push( this.fsm.getStatus() );
						if ( !primaryIsMain ) {
							this.fsmState.push( 'switchView' );
							this.fsm.consumeEvent( 'switchView' );
						}
						if ( this.fsm.getStatus() !== "PiP" ) {
							this.fsm.consumeEvent( 'PiP' );
						}

						this.fsm.consumeEvent( 'hide' );
					}
					this.getPrimary().obj.css( {'top': '', 'left': '', 'width': '', 'height': ''} ).removeClass( 'firstScreen' );
					$.each( this.zIndexObjs, function ( i, obj ) {
						var zIndex = $( obj ).css( 'z-index' );
						$( obj ).css( "z-index", zIndex - 4 );
					} );
				}
			},
	        maximizeSecondDisplay: function(){
				var _this = this;
		        if (this.auxScreenMinimized) {
					this.auxScreenMinimized = false;
					this.getPrimary().obj.addClass( 'firstScreen' );
					$.each(this.fsmState, function(i, state){
						_this.fsm.consumeEvent( state );
					});
			        this.fsmState = [];
					$.each(_this.zIndexObjs, function(i, obj){
						var zIndex = $(obj).css('z-index');
						$(obj ).css("z-index", zIndex + 4);
					});
				}
			},
			updateSecondScreenLayout: function (event) {
				var _this = this;
				var eventName = mw.isAndroid() ? 'resize' : 'orientationchange';
				if (this.displayInitialized &&
					!(
					this.getAuxDisplay().isUserInteracting() ||
					this.screenShown ||
					( eventName === event.type && !this.getPlayer().layoutBuilder.isInFullScreen() )
					)
				){
					this.checkRenderConditions();
					//Hide display and control bar during resizing
					this.disableView();
					//Avoid debouncing of screen resize timeout handler
					if ( this.updateSecondScreenLayoutTimeout ) {
						clearTimeout( this.updateSecondScreenLayoutTimeout );
						this.updateSecondScreenLayoutTimeout = null;
					}
					this.updateSecondScreenLayoutTimeout = setTimeout( function () {
						_this.updateSecondScreenLayoutTimeout = null;
						//Calculate new screen ratios
						var secondScreenProps = _this.getAuxDisplay().getProperties();
						var playerWidth = _this.getPlayer().getWidth();
						var playerHeight = _this.getPlayer().getHeight();
						var widthRatio = (playerWidth / _this.previousPlayerWidth);
						var heightRatio = (playerHeight / _this.previousPlayerHeight);
						//Save current dimensions for next differential calculation
						_this.previousPlayerWidth = playerWidth;
						_this.previousPlayerHeight = playerHeight;
			
						//Calculate and apply new screen properties
						var screenWidth = secondScreenProps.width.replace( 'px', '' );
						var screenWidthHeightRatio = _this.getConfig( 'secondScreen' ).widthHeightRatio;
						var screenTop = secondScreenProps.top.replace( 'px', '' );
						var screenLeft = secondScreenProps.left.replace( 'px', '' );
						var newWidth = _this.roundPercisionFloat((screenWidth * widthRatio), -2);
						var newHeight = _this.roundPercisionFloat(screenWidthHeightRatio * newWidth, -2);
						var topOffset = _this.roundPercisionFloat((screenTop * heightRatio), -2);
						var leftOffset = _this.roundPercisionFloat((screenLeft * widthRatio), -2);
						var screenProps = {
							height: newHeight + "px",
							width: newWidth + "px",
							top: topOffset + "px",
							left: leftOffset + "px"
						};
						if ( newHeight + topOffset > playerHeight ) {
							screenProps.top = (playerHeight - newHeight) + "px";
						}
						if ( newWidth + leftOffset > playerWidth ) {
							screenProps.left = (playerWidth - newWidth) + "px";
						}
			
						var secondScreen = _this.getAuxDisplay();
						secondScreen.repaint( screenProps );
						//TODO: move to image player
						_this.screenObj.applyIntrinsicAspect();
						if ( _this.render ) {
							//Show display and control bar after resizing
							_this.enableView();
							_this.maximizeSecondDisplay();
						} else {
							_this.getPrimary().obj.css("visibility", "");
							_this.minimizeSecondDisplay();
						}
			
						//Calculate screen resize max width
						var maxWidth = ( ( playerWidth * _this.getConfig( 'resizable' ).maxWidthPercentage ) / 100 );
						var minWidth = ( ( playerWidth * _this.getConfig( 'secondScreen' ).sizeRatio ) / 100 );

						secondScreen.setResizeLimits( {
							maxWidth: maxWidth,
							minWidth: minWidth
						} );
					}, 0 );
				}
			},
			checkRenderConditions: function(){
				this.render = (
					!this.getAuxDisplay().isUserInteracting() &&
					(
						this.getPlayer().layoutBuilder.isInFullScreen() ||
						(
							!this.getConfig("fullScreenDisplayOnly") &&
							this.getConfig( "minDisplayWidth" ) <= this.getPlayer().getWidth() &&
							this.getConfig( "minDisplayHeight" ) <= this.getPlayer().getHeight()
						)
					)
				);
			},
			//Utils
			roundPercisionFloat: function(value, exp){
				// If the exp is undefined or zero...
				if (typeof exp === 'undefined' || +exp === 0) {
					return Math.round(value);
				}
				value = +value;
				exp = +exp;
				// If the value is not a number or the exp is not an integer...
				if (isNaN(value) || !(typeof exp === 'number' && exp % 1 === 0)) {
					return NaN;
				}
				// Shift
				value = value.toString().split('e');
				value = Math.round(+(value[0] + 'e' + (value[1] ? (+value[1] - exp) : -exp)));
				// Shift back
				value = value.toString().split('e');
				return +(value[0] + 'e' + (value[1] ? (+value[1] + exp) : exp));
			},

			//Second Screen controller
			initSecondPlayer: function(){
				var _this = this;
				if (true) {
					this.secondPlayer = new mw.dualScreen.imagePlayer(this.getPlayer(), function () {
						this.setConfig({
							"prefetch": _this.getConfig("prefetch"),
							"cuePointType": _this.getConfig("cuePointType")
						});
					}, "imagePlayer");
				} else {
					this.secondPlayer = new mw.dualScreen.videoPlayer(this.getPlayer(), function(){}, "videoPlayer");
				}
			},
			//Display
			getComponent: function () {
				if ( !this.$el ) {
					var width = this.getPlayer().getWidth() * this.getConfig( 'secondScreen' ).sizeRatio / 100;
					var height = width * this.getConfig('secondScreen').widthHeightRatio;
					this.$el = $( '<div />' )
						.css( {height: height + 'px', width: width + 'px', "background": "black"} )
						.addClass( this.getCssClass() )
						.attr("id", "secondScreen");
				}
				return this.$el;
			},
			getPrimary: function(){
				return this.display[mw.dualScreen.display.TYPE.PRIMARY];
			},
			getSecondary: function(){
				return this.display[mw.dualScreen.display.TYPE.SECONDARY];
			},
			getMainDisplay: function () {
				return this.display.main;
			},
			getAuxDisplay: function () {
				return this.display.aux;
			},
			positionSecondScreen: function(){
				var location = this.getConfig( 'secondScreen' ).startLocation.toLowerCase().split(" ");
				switch(location[0]){
					case "right":
						location[0] = location[0]+"-25 ";
						break;
					case "left":
						location[0] = location[0]+"+25 ";
						break;
				}
				switch(location[1]){
					case "top":
						location[1] = location[1]+"+"+(10+this.getPlayer().layoutBuilder.getHeight());
						break;
					case "bottom":
						location[1] = location[1]+"-"+(10+this.getPlayer().layoutBuilder.getHeight());
						break;
				}
				this.getAuxDisplay().position({
					my: this.getConfig( 'secondScreen' ).startLocation.toLowerCase(),
					at: location[0]+location[1],
					of: $( this.getPlayer().getInterface() )
				});
			},

			//Screen view state handlers
			toggleMainDisplay: function () {
				var curMain = this.getMainDisplay();
				var curAux =this.getAuxDisplay();

				var resizeLimits = curAux.getResizeLimits();
				this.display.aux.setResizeLimits(resizeLimits);
				var props = curAux.getProperties();

				curMain.toggleMain(props);
				curAux.toggleMain();

				this.display.main = curAux;
				this.display.aux = curMain;
			},
			enableSideBySideView: function () {
				this.getMainDisplay().enableSideBySideView();
				this.getAuxDisplay().enableSideBySideView();
			},
			toggleSideBySideView: function () {
				this.getMainDisplay().toggleSideBySideView();
				this.getAuxDisplay().toggleSideBySideView();
			},
			disableSideBySideView: function () {
				this.getMainDisplay().disableSideBySideView();
				this.getAuxDisplay().disableSideBySideView();
			},
			hideDisplay: function ( ) {
				this.getAuxDisplay().hide();
			},
			showDisplay: function ( ) {
				this.getAuxDisplay().show();
			},

			//Screen interaction handlers(drag/resize)
			enableUserActions: function ( ) {
				this.getAuxDisplay().enableUserActions();
			},
			disableUserActions: function ( ) {
				this.getAuxDisplay().disableUserActions();
			},

			//Screen animation controller
			enableTransitions: function () {
				this.getMainDisplay().enableTransition();
				this.getAuxDisplay().enableTransition();
			},
			disableTransitions: function () {
				this.getMainDisplay().disableTransition();
				this.getAuxDisplay().disableTransition();
			}
		} )
	);
}

)( window.mw, window.jQuery );
