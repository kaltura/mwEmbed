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
			monitor: {},
			displayInitialized: false,
			render: true,
			screenShown: false,
			currentScreenNameShown: "",

			setup: function ( ) {
				this.initConfig();
				this.initFSM();
				this.addBindings();
				this.initMonitors();
			},
			isSafeEnviornment: function () {
				var _this = this;
				this.screenObj = new mw.dualScreen.imagePlayer(this.getPlayer(), function(){
					this.setConfig({
						"prefetch": _this.getConfig("prefetch"),
						"cuePointType": _this.getConfig("cuePointType")
					});
					}, "imagePlayer");
				return this.screenObj.isSafeEnviornment();
			},
			addBindings: function () {
				var _this = this;
				this.bind( 'playerReady', function (  ) {
					_this.checkRenderConditions();
					_this.initDisplay();
					_this.initControlBar();
					if (!_this.render) {
						_this.getPrimary().obj.css( {'top': '', 'left': '', 'width': '', 'height': ''} ).removeClass( 'firstScreen' );
						_this.hideDisplay();
					}
				} );

				var updateSecondScreenLayout = function (event) {
					var eventName = mw.isAndroid() ? 'resize' : 'orientationchange';
					if (_this.displayInitialized &&
						!(
						_this.getAuxMonitor().isUserInteracting() ||
						_this.screenShown ||
						( eventName === event.type && !_this.getPlayer().layoutBuilder.isInFullScreen() )
						)
					){
						_this.checkRenderConditions();
						//Hide monitor and control bar during resizing
						_this.hideDisplay();
						//Avoid debouncing of screen resize timeout handler
						if ( _this.updateSecondScreenLayoutTimeout ) {
							clearTimeout( _this.updateSecondScreenLayoutTimeout );
							_this.updateSecondScreenLayoutTimeout = null;
						}
						_this.updateSecondScreenLayoutTimeout = setTimeout( function () {
							_this.updateSecondScreenLayoutTimeout = null;
							//Calculate new screen ratios
							var secondScreenProps = _this.getAuxMonitor().prop;
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

							var firstScreen = _this.getMainMonitor().obj;
							var secondScreen = _this.getAuxMonitor().obj;
							secondScreen.css( screenProps );
							//TODO: move to image player
							_this.screenObj.applyIntrinsicAspect();
							//Store props for transitions
							_this.getAuxMonitor().prop = screenProps;
							if ( _this.render ) {
								//Show monitor and control bar after resizing
								_this.showDisplay();
								maximizeSecondDisplay();
							} else {
								_this.getPrimary().obj.css("visibility", "");
								minimizeSecondDisplay();
							}

							//Calculate screen resize max width
							var maxWidth = ( ( _this.getPlayer().getWidth() * _this.getConfig( 'resizable' ).maxWidthPercentage ) / 100 );
							var minWidth = ( ( _this.getPlayer().getWidth() * _this.getConfig( 'secondScreen' ).sizeRatio ) / 100 );
							firstScreen.resizable( {
								maxWidth: maxWidth,
								minWidth: minWidth
							} );
							secondScreen.resizable( {
								maxWidth: maxWidth,
								minWidth: minWidth
							} );
						}, 0 );
					}
				};
				this.bind( 'updateLayout', updateSecondScreenLayout);
				// Android fires orientationchange too soon, i.e width and height are wrong
				var eventName = mw.isAndroid() ? 'resize' : 'orientationchange';
				eventName += this.bindPostFix;
				var isIframe = (mw.getConfig('EmbedPlayer.IsIframeServer' ) && mw.getConfig('EmbedPlayer.IsFriendlyIframe'));
				var context = isIframe ? window.parent : window;
				// Bind orientation change to resize player
				$( context ).bind( eventName, updateSecondScreenLayout);

				var fsmState = [];
				var secondDisplayMinimized = false;
				var minimizeSecondDisplay = function(){
					if (!secondDisplayMinimized) {
						secondDisplayMinimized = true;
						if (!(_this.getPrimary().isMain && _this.fsm.getStatus() === "hide")) {
							fsmState.push( _this.fsm.getStatus() );
							if ( !_this.getPrimary().isMain ) {
								fsmState.push( 'switchView' );
								_this.fsm.consumeEvent( 'switchView' );
							}
							if ( _this.fsm.getStatus() !== "PiP" ) {
								_this.fsm.consumeEvent( 'PiP' );
							}

							_this.fsm.consumeEvent( 'hide' );
						}
						_this.getPrimary().obj.css( {'top': '', 'left': '', 'width': '', 'height': ''} ).removeClass( 'firstScreen' );
						$.each( _this.zIndexObjs, function ( i, obj ) {
							var zIndex = $( obj ).css( 'z-index' );
							$( obj ).css( "z-index", zIndex - 4 );
						} );
					}
				};
				var maximizeSecondDisplay = function(){
					if (secondDisplayMinimized) {
						secondDisplayMinimized = false;
						_this.getPrimary().obj.addClass( 'firstScreen' );
						$.each(fsmState, function(i, state){
							_this.fsm.consumeEvent( state );
						});
						fsmState = [];
						$.each(_this.zIndexObjs, function(i, obj){
							var zIndex = $(obj).css('z-index');
							$(obj ).css("z-index", zIndex + 4);
						});
					}
				};
				this.bind( "preShowScreen", function (e, screenName) {
					_this.screenShown = true;
					if (_this.render) {
						_this.currentScreenNameShown = screenName;
						_this.controlBar.enable();
						_this.controlBar.hide();
						_this.controlBar.disable();
						minimizeSecondDisplay();
					}
				} );
				this.bind( "preHideScreen", function (e, screenName) {
					_this.screenShown = false;
					if (_this.render && _this.currentScreenNameShown === screenName) {
						_this.currentScreenNameShown = "";
						maximizeSecondDisplay();
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

				this.bind( 'postDualScreenTransition', function () {
					//TODO: move to imagePlayer
					_this.screenObj.applyIntrinsicAspect();
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
				this.bind( 'startMonitorInteraction', function(){
					_this.controlBar.hide();
					if (_this.controlBar){
						wasDisabled = _this.controlBar.disabled;
					}
					_this.controlBar.disable();
					_this.getPlayer().disablePlayControls();
				});
				this.bind( 'stopMonitorInteraction', function() {
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

					_this.bind("monitorTransitionEnded", function ( ) {
						if ( transitionHandlerSet ) {
							transitionHandlerSet = false;
							_this.controlBar.show();
							_this.disableMonitorTransition();
							_this.getPlayer().triggerHelper('postDualScreenTransition', [[transitionFrom, transitionTo]]);
						}
					});
					_this.enableMonitorTransition();
				};

				var selectedStatesMap = mw.isNativeApp() ? mw.dualScreen.nativeAppStates : mw.dualScreen.states;

				this.fsm = new mw.dualScreen.StateMachine( selectedStatesMap, this, fsmTransitionHandlers );
			},
			initMonitors: function () {
				var _this = this;
				$.each( mw.dualScreen.monitor.TYPE, function ( key, val ) {
					_this.monitor[val] = new mw.dualScreen.monitor(_this.getPlayer(), function(){
						this.setConfig({
							isMain: (val === mw.dualScreen.monitor.TYPE.PRIMARY),
							resizeHandlesFadeout: _this.getConfig( 'resizeHandlesFadeout' ),
							resizable: _this.getConfig( 'resizable' ),
							draggable: _this.getConfig( 'draggable' )
						});
					}, val + "Monitor");
				} );
				this.monitor.main = this.monitor.primary;
				this.monitor.aux = this.monitor.secondary;
			},
			initControlBar: function(){
				if ( !this.getPlayer().isAudio()) {
					var _this = this;
					this.controlBar = new mw.dualScreen.dualScreenControlBar(_this.getPlayer(), function(){
						this.setConfig('menuFadeout', _this.getConfig('menuFadeout'));
					}, 'dualScreenControlBar');
					this.embedPlayer.getInterface().append( this.controlBar.getComponent() );
				}
			},
			initDisplay: function(){
				var _this = this;
				if (!this.displayInitialized) {
					this.displayInitialized = true;
					this.previousPlayerWidth = this.getPlayer().getWidth();
					this.previousPlayerHeight = this.getPlayer().getHeight();

					var primaryScreenEl = this.getPlayer().getVideoDisplay();
					var secondaryScreenEl = this.getComponent();
					var primaryScreen = this.monitor[mw.dualScreen.monitor.TYPE.PRIMARY];
					var secondaryScreen = this.monitor[mw.dualScreen.monitor.TYPE.SECONDARY];
					primaryScreen.attachView(primaryScreenEl);
					secondaryScreen.attachView(secondaryScreenEl);

					var pointerEvents = "click dblclick touchstart touchend";
					secondaryScreenEl
				        .off(pointerEvents)
				        .on( pointerEvents, function ( e ) {
				                    _this.embedPlayer.triggerHelper( e );
				            } );

					primaryScreen.disableFeatures();
					secondaryScreen.enableFeatures();

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
								var zIndex = parseInt(obj.css( 'z-index' ));
								obj.css( 'z-index', zIndex + 4 );
							}
							_this.zIndexObjs.push( obj );
						}
					} );
				}
			},

			hideDisplay: function(){
				this.getAuxMonitor().obj.css("visibility", "hidden");
				this.controlBar.hide();
				this.controlBar.disable();
			},
			showDisplay: function(){
				this.getMainMonitor().obj.css("visibility", "");
				this.getAuxMonitor().obj.css("visibility", "");
				this.controlBar.enable();
				this.controlBar.show();
			},
			checkRenderConditions: function(){
				if ( !this.getAuxMonitor().isUserInteracting() &&
					(this.getPlayer().layoutBuilder.isInFullScreen() ||
					((!this.getConfig("fullScreenDisplayOnly") &&
					this.getConfig( "minDisplayWidth" ) <= this.getPlayer().getWidth() &&
					this.getConfig( "minDisplayHeight" ) <= this.getPlayer().getHeight()) ) ) ) {
					this.render = true;
				} else {
					this.render = false;
				}
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

			//Monitor
			getComponent: function () {
				if ( !this.$el ) {
					var width = this.getPlayer().getWidth() * this.getConfig( 'secondScreen' ).sizeRatio / 100;
					var height = width * this.getConfig('secondScreen').widthHeightRatio;
					this.$el = $( '<div />' )
						.css( {height: height + 'px', width: width + 'px', "background": "black"} )
						.addClass( this.getCssClass() );

					this.$el.append( this.screenObj.getComponent());
				}
				return this.$el;
			},
			getPrimary: function(){
				return this.monitor[mw.dualScreen.monitor.TYPE.PRIMARY];
			},
			getSecondary: function(){
				return this.monitor[mw.dualScreen.monitor.TYPE.SECONDARY];
			},
			getMainMonitor: function () {
				return this.monitor.main;
			},
			getAuxMonitor: function () {
				return this.monitor.aux;
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
				this.getAuxMonitor().position({
					my: this.getConfig( 'secondScreen' ).startLocation.toLowerCase(),
					at: location[0]+location[1],
					of: $( this.getPlayer().getInterface() )
				});
			},

			//Screen view state handlers
			toggleMainMonitor: function () {
				var props = this.getAuxMonitor().prop;
				var curMain = this.getMainMonitor();
				var curAux =this.getAuxMonitor();
				curMain.toggleMain(props);
				curAux.toggleMain();
				this.monitor.main = curAux;
				this.monitor.aux = curMain;
			},
			enableSideBySideView: function () {
				this.getMainMonitor().enableSideBySideView();
				this.getAuxMonitor().enableSideBySideView();
			},
			toggleSideBySideView: function () {
				this.getMainMonitor().toggleSideBySideView();
				this.getAuxMonitor().toggleSideBySideView();
			},
			disableSideBySideView: function () {
				this.getMainMonitor().disableSideBySideView();
				this.getAuxMonitor().disableSideBySideView();
			},
			hideMonitor: function ( ) {
				this.getAuxMonitor().hide();
			},
			showMonitor: function ( ) {
				this.getAuxMonitor().show();
			},

			//Screen interaction handlers(drag/resize)
			enableMonitorFeatures: function ( ) {
				this.getAuxMonitor().enableFeatures();
			},
			disableMonitorFeatures: function ( ) {
				this.getAuxMonitor().disableFeatures();
			},

			//Screen animation controller
			enableMonitorTransition: function () {
				this.getMainMonitor().enableTransition();
				this.getAuxMonitor().enableTransition();
			},
			disableMonitorTransition: function () {
				this.getMainMonitor().disableTransition();
				this.getAuxMonitor().disableTransition();
			}
		} )
	);
}

)( window.mw, window.jQuery );
