(function ( mw, $ ) {
	"use strict";
	mw.PluginManager.add( 'dualScreen', mw.KBaseComponent.extend( {

			defaultConfig: {
				'parent': 'videoHolder',
				'order': 1,
				'showTooltip': false,
				"displayImportance": 'high',
				'templatePath': 'components/dualScreen/dualScreenControlBar.tmpl.html',
				'secondScreen': {
					'size': '25',
					'widthHeightRatio': ( 3 / 4 ),
					'startLocation': 'right bottom'
				},
				'resizable': {
					'handles': 'ne, se, sw, nw',
					'maxWidth': 50,
					'aspectRatio': true,
					'minWidth': 100,
					'containment': 'parent'
				},
				'draggable': {
					'cursor': 'move',
					'containment': 'parent',
					'cancel': 'video'
				},
				'prefetch': {
					'durationPercentageUntilNextSequence': 60,
					'minimumSequenceDuration': 2
				},
				'menuFadeout': 5000,
				'cuePointType': [{
					"main": mw.KCuePoints.TYPE.THUMB,
					"sub": [mw.KCuePoints.THUMB_SUB_TYPE.SLIDE]
				}],
				'mainViewDisplay': 2, // 1 - Main stream, 2 - Presentation
				'fullScreenDisplayOnly': false,
				'minDisplayWidth': 0,
				'minDisplayHeight': 0,
				"enableKeyboardShortcuts": true,
				"keyboardShortcutsMap": {
					"nextState": 81,   // Add q Sign for next state
					"switchView": 87   // Add w Sigh for switch views
				}
			},
			monitor: {},
			cuePoints: [],
			TYPE: {PRIMARY: "primary", SECONDARY: "secondary"},

			isDisabled: false,
			displayInitialized: false,
			render: true,
			screenShown: false,
			currentScreenNameShown: "",
			dragging: false,
			resizing: false,
			syncEnabled: true,

			setup: function ( ) {
				this.initConfig();
				this.initFSM();
				this.addBindings();
				this.initMonitors();
			},
			isSafeEnviornment: function () {
				var cuePoints = this.getCuePoints();
				var cuePointsExist = (cuePoints.length > 0) ? true : false;
				return (!this.getPlayer().useNativePlayerControls() &&
					( ( this.getPlayer().isLive() && mw.getConfig("EmbedPlayer.LiveCuepoints") ) || cuePointsExist));
			},
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
			getCuePoints: function(){
				var cuePoints = [];
				var _this = this;
				if ( this.getPlayer().kCuePoints ) {
					$.each( _this.getConfig( 'cuePointType' ), function ( i, cuePointType ) {
						$.each( cuePointType.sub, function ( j, cuePointSubType ) {
							var filteredCuePoints = _this.getPlayer().kCuePoints.getCuePointsByType( cuePointType.main, cuePointSubType );
							cuePoints = cuePoints.concat( filteredCuePoints );
						} );
					} );
				}
				cuePoints.sort(function (a, b) {
					return a.startTime - b.startTime;
				});
				return cuePoints;
			},
			initConfig: function () {
				var _this = this;
				this.setConfig( {resizable: $.extend( {}, this.getConfig( 'resizable' ),
					{maxWidthPercentage: this.getConfig( 'resizable' ).maxWidth} )} );
				var maxWidth = ( ( this.getPlayer().getWidth() * this.getConfig( 'resizable' ).maxWidthPercentage ) / 100 );
				var minWidth = ( ( _this.getPlayer().getWidth() * this.getConfig( 'secondScreen' ).size ) / 100 );
				var resizable = $.extend( {}, this.getConfig( 'resizable' ), {
					maxWidth: maxWidth,
					minWidth: minWidth
				} );
				this.setConfig( {resizable: resizable} );

				var wasDisabled = false;
				var actionsControls = {
					start: function ( event ) {
						switch(event.type){
							case "dragstart":
								_this.dragging = true;
								break;
							case "resizestart":
								_this.resizing = true;
								break;
						}

						_this.getPlayer().triggerHelper("dualScreenControlsHide");
						if (_this.controlBar){
							wasDisabled = _this.controlBar.disabled;
						}
						_this.getPlayer().triggerHelper("dualScreenControlsDisable");
						_this.getPlayer().disablePlayControls();
					},
					stop: function ( event ) {
						switch(event.type){
							case "dragstop":
								_this.dragging = false;
								break;
							case "resizestop":
								_this.resizing = false;
								break;
						}

						//Only enable and show if controlBar was enabled before transition
						if (!wasDisabled) {
							_this.getPlayer().triggerHelper("dualScreenControlsEnable");
							_this.getPlayer().triggerHelper("dualScreenControlsShow");
						}
						$( event.toElement ).one( 'click', function ( e ) {
							e.stopImmediatePropagation();
							e.preventDefault();
							e.stopPropagation();
						} );
						_this.getPlayer().enablePlayControls();
						_this.getSecondMonitor().prop = $( this ).css( ['top', 'left', 'width', 'height'] );
					}
				};

				$.extend( _this.getConfig( 'draggable' ), actionsControls );
				$.extend( _this.getConfig( 'resizable' ), actionsControls );
			},
			initFSM: function () {
				function StateMachine( states ) {
					this.states = states;
					this.indexes = {}; //just for convinience
					for ( var i = 0; i < this.states.length; i++ ) {
						this.indexes[this.states[i].name] = i;
						if ( this.states[i].initial ) {
							this.currentState = this.states[i];
						}
					}
					this.consumeEvent = function ( e ) {
						if ( this.currentState.events[e] ) {
							fsmTransitionHandlers(this.currentState.name, e);
							this.currentState.events[e].action();
							this.currentState = this.states[this.indexes[this.currentState.events[e].name]];
						}
					};
					this.canConsumeEvent = function ( e ) {
						return !!this.currentState.events[e];
					};
					this.getStatus = function () {
						return this.currentState.name;
					};
				}

				var _this = this;

				var fsmTransitionHandlers = function (transitionFrom, transitionTo) {
					var transitionHandlerSet = true;
					_this.getPlayer().triggerHelper('preDualScreenTransition', [[transitionFrom, transitionTo]]);

					_this.getPlayer().triggerHelper("dualScreenControlsHide");

					_this.enableMonitorTransition();

					function transitionendHandler( ) {
						if ( transitionHandlerSet ) {
							transitionHandlerSet = false;
							_this.getPlayer().triggerHelper("dualScreenControlsShow");
							_this.disableMonitorTransition();
							_this.getPlayer().triggerHelper('postDualScreenTransition', [[transitionFrom, transitionTo]]);
						}
					}

					if ( mw.getConfig( 'EmbedPlayer.AnimationSupported') ) {
						_this.getFirstMonitor().obj.one( 'transitionend webkitTransitionEnd', transitionendHandler );
						_this.getSecondMonitor().obj.one( 'transitionend webkitTransitionEnd', transitionendHandler );
					} else {
						setTimeout( transitionendHandler, 100 );
					}
				};

				var states = [
					{
						'name': 'PiP',
						'initial': true,
						'events': {
							'SbS': {
								name: 'SbS',
								action: function () {
									_this.disableMonitorFeatures( );
									_this.enableSideBySideView();

								}
							},
							'hide': {
								name: 'hide',
								action: function (  ) {
									_this.disableMonitorFeatures( );
									_this.hideMonitor( _this.getSecondMonitor().obj );
								}
							},
							'switchView': {
								name: 'PiP',
								action: function () {
									_this.disableMonitorFeatures( );
									_this.toggleMainMonitor();
									_this.enableMonitorFeatures( );
								}
							}
						}
					},
					{
						'name': 'SbS',
						'events': {
							'PiP': {
								name: 'PiP',
								action: function () {
									_this.enableMonitorFeatures( );
									_this.disableSideBySideView();
								}
							},
							'hide': {
								name: 'hide',
								action: function () {
									_this.disableSideBySideView();
									_this.hideMonitor( _this.getSecondMonitor().obj );
								}
							},
							'switchView': {
								name: 'SbS',
								action: function () {
									_this.toggleSideBySideView();
									_this.toggleMainMonitor();
								}
							}
						}
					},
					{
						'name': 'hide',
						'events': {
							'PiP': {
								name: 'PiP',
								action: function () {
									_this.enableMonitorFeatures( );
									_this.showMonitor( _this.getSecondMonitor().obj );
								}
							},
							'switchView': {
								name: 'hide',
								action: function () {
									_this.showMonitor( _this.getSecondMonitor().obj );
									_this.hideMonitor( _this.getFirstMonitor().obj );
									_this.toggleMainMonitor();
								}
							},
							'SbS': {
								name: 'SbS',
								action: function () {
									_this.enableSideBySideView();
									_this.showMonitor( _this.getSecondMonitor().obj );
								}
							}
						}
					}
				];

				var nativeAppStates = [
					{
						'name': 'PiP',
						'initial': true,
						'events': {
							'hide': {
								name: 'hide',
								action: function (  ) {
									_this.disableMonitorFeatures();
									_this.hideMonitor( _this.getSecondMonitor().obj );
								}
							}
						}
					},
					{
						'name': 'hide',
						'events': {
							'PiP': {
								name: 'PiP',
								action: function () {
									if (_this.getPrimary() === _this.getSecondMonitor()) {

										_this.toggleMainMonitor();
										_this.showMonitor( _this.getFirstMonitor().obj );
									}
									_this.enableMonitorFeatures();
									_this.showMonitor( _this.getSecondMonitor().obj );
								}
							},
							'switchView': {
								name: 'hide',
								action: function () {
									_this.showMonitor( _this.getSecondMonitor().obj );
									_this.hideMonitor( _this.getFirstMonitor().obj );
									_this.toggleMainMonitor();
								}
							}
						}
					}
				];

				var selectedStatesMap = mw.isNativeApp() ? nativeAppStates : states;

				this.fsm = new StateMachine( selectedStatesMap );
			},
			initMonitors: function () {
				var _this = this;
				$.each( this.TYPE, function ( key, val ) {
					_this.monitor[val] = {};
					_this.monitor[val] = {
						isMain: (val === _this.TYPE.PRIMARY) ? true : false,
						obj: null,
						prop: {},
						isVisible: true
					};
				} );
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
						_this.dragging ||
						_this.resizing ||
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
							var secondScreenProps = _this.getSecondMonitor().prop;
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

							var firstScreen = _this.getFirstMonitor().obj;
							var secondScreen = _this.getSecondMonitor().obj;
							secondScreen.css( screenProps );
							_this.applyIntrinsicAspect();
							//Store props for transitions
							_this.getSecondMonitor().prop = screenProps;
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
							var minWidth = ( ( _this.getPlayer().getWidth() * _this.getConfig( 'secondScreen' ).size ) / 100 );
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

				this.bind( 'onplay', function () {
					_this.loadAdditionalAssets();
					_this.getPlayer().triggerHelper("dualScreenControlsEnable");
				} );

				this.bind( 'onpause ended playerReady', function () {
					_this.getPlayer().triggerHelper("dualScreenControlsShow");
					_this.getPlayer().triggerHelper("dualScreenControlsDisable");
				} );

				//In live mode wait for first updatetime that is bigger then 0 for syncing initial slide
				if (mw.getConfig("EmbedPlayer.LiveCuepoints")) {
					this.bind( 'timeupdate', function ( ) {
						if (!_this.getPlayer().isMulticast &&
							!_this.getPlayer().isDVR() &&
							_this.getPlayer().currentTime > 0) {
							_this.unbind('timeupdate');
						}
						var cuePoint = _this.getCurrentCuePoint();
						_this.sync( cuePoint );
					} );
				}

				this.bind( 'KalturaSupport_ThumbCuePointsReady', function () {
					var currentCuepoint = _this.getCurrentCuePoint() || _this.getCuePoints()[0];
					_this.sync(currentCuepoint , function(){
						_this.secondDisplayReady = true;
					} );
				} );
				this.bind( 'KalturaSupport_CuePointReached', function ( e, cuePointObj ) {
					var cuePoint;
					$.each(_this.getConfig( 'cuePointType' ), function(i, cuePointType){
						var main = $.isArray(cuePointType.main) ? cuePointType.main : [cuePointType.main];
						var sub = $.isArray(cuePointType.sub) ? cuePointType.sub : [cuePointType.sub];
						if ( ( $.inArray( cuePointObj.cuePoint.cuePointType, main ) > -1 ) &&
							( $.inArray( cuePointObj.cuePoint.subType, sub ) > -1 ) ) {
							cuePoint = cuePointObj.cuePoint;
							return false;
						}
					});
					if (!cuePoint){
						cuePoint = _this.getCurrentCuePoint();
					}
					_this.sync( cuePoint );
				} );

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
						_this.getPlayer().triggerHelper("dualScreenControlsEnable");
						_this.getPlayer().triggerHelper("dualScreenControlsHide");
						_this.getPlayer().triggerHelper("dualScreenControlsDisable");
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
								_this.getPlayer().triggerHelper("dualScreenControlsEnable");
								_this.getPlayer().triggerHelper("dualScreenControlsShow");
							}
						}, 100);
					}
				} );
				this.bind("onChangeMedia", function(){
					//Clear the current slide before loading the new media
					_this.getComponent().find( '#SynchImg' ).attr("src", "");
				});
				this.bind("onChangeStream", function(){
					_this.syncEnabled = false;
				});
				this.bind("onChangeStreamDone", function(){
					_this.syncEnabled = true;
					var cuePoint = _this.getCurrentCuePoint();
					_this.sync( cuePoint );
				});
				this.bind("dualScreenStateChange", function(e, state){
					_this.fsm.consumeEvent( state );
				});
				this.bind("showPlayerControls" , function(){
					_this.getPlayer().triggerHelper("dualScreenControlsShow");
				});
				this.bind("postDualScreenTransition", function () {
					_this.applyIntrinsicAspect();
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
			initDisplay: function(){
				var _this = this;
				if (!this.displayInitialized) {
					this.displayInitialized = true;
					this.previousPlayerWidth = this.getPlayer().getWidth();
					this.previousPlayerHeight = this.getPlayer().getHeight();

					var primaryScreen = this.monitor[this.TYPE.PRIMARY].obj = this.getPlayer().getVideoDisplay();
					var secondaryScreen = this.monitor[this.TYPE.SECONDARY].obj = this.getComponent();

					//Set rule attributes
					primaryScreen.addClass( 'dualScreenMonitor firstScreen ' + this.pluginName ).attr( 'data-monitor-rule', this.TYPE.PRIMARY );
					secondaryScreen.addClass( 'dualScreenMonitor' ).attr( 'data-monitor-rule', this.TYPE.SECONDARY );

					secondaryScreen.off().on( 'click dblclick touchstart touchend', function ( e ) {
						_this.embedPlayer.triggerHelper( e );
					} );

					//Set draggable and resizable configuration
					primaryScreen
						.draggable( this.getConfig( 'draggable' ) ).draggable( 'disable' )
						.resizable( this.getConfig( 'resizable' ) ).resizable( 'disable' )
						.on('resize', function (e) {
							e.stopPropagation();
						});

					secondaryScreen
						.draggable( this.getConfig( 'draggable' ) )
						.resizable( this.getConfig( 'resizable' ) )
						.on('resize', function (e) {
							e.stopPropagation();
						});

					this.enableMonitorFeatures();

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
			initControlBar: function(){
				if ( !this.getPlayer().isAudio()) {
					this.controlBar = new mw.dualScreenControlBar( {
						embedPlayer: this.getPlayer(),
						templatePath: this.getConfig( "templatePath" ),
						menuFadeout: this.getConfig( "menuFadeout" ),
						cssClass: this.getCssClass(),
						displayMode: this.displayMode
					} );
				}
			},
			hideDisplay: function(){
				this.getSecondMonitor().obj.css("visibility", "hidden");
				this.getPlayer().triggerHelper("dualScreenControlsHide");
				this.getPlayer().triggerHelper("dualScreenControlsDisable");
			},
			showDisplay: function(){
				this.getFirstMonitor().obj.css("visibility", "");
				this.getSecondMonitor().obj.css("visibility", "");
				this.getPlayer().triggerHelper("dualScreenControlsEnable");
				this.getPlayer().triggerHelper("dualScreenControlsShow");
			},
			checkRenderConditions: function(){
				if ( !( this.dragging || this.resizing ) &&
					(this.getPlayer().layoutBuilder.isInFullScreen() ||
					((!this.getConfig("fullScreenDisplayOnly") &&
					this.getConfig( "minDisplayWidth" ) <= this.getPlayer().getWidth() &&
					this.getConfig( "minDisplayHeight" ) <= this.getPlayer().getHeight()) ) ) ) {
					this.render = true;
				} else {
					this.render = false;
				}
			},

			//Monitor
			getComponent: function () {
				if ( !this.$el ) {
					var width = this.getPlayer().getWidth() * this.getConfig( 'secondScreen' ).size / 100;
					var height = width * this.getConfig('secondScreen').widthHeightRatio;
					this.$el = $( '<div />' )
						.css( {height: height + 'px', width: width + 'px', "background": "black"} )
						.addClass( this.getCssClass() + " secondScreen" );

					this.$el.append(
						$( '<img>' )
							.attr( 'id', 'SynchImg' )
							.addClass("imagePlayer")
					);
				}
				return this.$el;
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
				var monitor = this.getSecondMonitor();
				monitor.obj.position( {
					my: this.getConfig( 'secondScreen' ).startLocation.toLowerCase(),
					at: location[0]+location[1],
					of: $( this.getPlayer().getInterface() )
				} );
				monitor.prop = monitor.obj.css( ['top', 'left', 'width', 'height'] );
			},
			toggleMainMonitor: function () {
				var _this = this;
				var props = this.getSecondMonitor().prop;
				$.each( this.monitor, function ( name, monitor ) {
					monitor.isMain = !monitor.isMain;
					monitor.prop = monitor.isMain ? [] : props;
					monitor.obj.attr( 'data-monitor-rule', monitor.isMain ? _this.TYPE.PRIMARY : _this.TYPE.SECONDARY );
					monitor.obj.toggleClass( 'firstScreen secondScreen' );
					if (!monitor.isMain){
						monitor.obj.css(props);
					}
				} );
			},
			enableMonitorFeatures: function ( ) {
				var monitor = this.getSecondMonitor().obj;
				monitor.draggable( 'enable' ).resizable( 'enable' );
				this.addResizeHandlers();
			},
			disableMonitorFeatures: function ( ) {
				var monitor = this.getSecondMonitor().obj;
				monitor.draggable( 'disable' ).resizable( 'disable' );
				this.removeResizeHandlers(monitor);
			},
			removeResizeHandlers: function(){
				var monitor = this.getSecondMonitor().obj;
				$(monitor).find(".dualScreen-transformhandle" ).remove();
			},
			addResizeHandlers: function () {
				this.removeResizeHandlers();
				var cornerHandleVisibleTimeoutId;
				var _this = this;
				var monitor = this.getSecondMonitor().obj;
				monitor.prepend($("<span>").addClass("dualScreen-transformhandle cornerHandle componentOff").attr("id", "bottomRightHandle"));   //ui-resizable-handle ui-resizable-ne
				monitor.prepend($("<span>").addClass("dualScreen-transformhandle cornerHandle componentOff").attr("id", "bottomLeftHandle"));   //ui-resizable-handle ui-resizable-sw
				monitor.prepend($("<span>").addClass("dualScreen-transformhandle cornerHandle componentOff").attr("id", "topRightHandle"));   //ui-resizable-handle ui-resizable-se
				monitor.prepend($("<span>").addClass("dualScreen-transformhandle cornerHandle componentOff").attr("id", "topLeftHandle"));   //ui-resizable-handle ui-resizable-nw
				monitor
					.on( 'mouseleave', function() { if ( !( mw.isMobileDevice() || _this.dragging ) ) { _this.hideResizeHandlers(); } })
					.on( 'mousemove touchstart', function(){
						if (!_this.dragging){
							_this.showResizeHandlers();
							if(cornerHandleVisibleTimeoutId){
								clearTimeout(cornerHandleVisibleTimeoutId);
							}
							cornerHandleVisibleTimeoutId = setTimeout(function(){_this.hideResizeHandlers();}, _this.getConfig('menuFadeout'));
						}
					});

			},
			hideResizeHandlers: function(){
				var monitor = this.getSecondMonitor().obj;
				$(monitor).find(".cornerHandle" ).addClass( 'componentOff componentAnimation' ).removeClass( 'componentOn' );
			},
			showResizeHandlers: function(){
				var monitor = this.getSecondMonitor().obj;
				$(monitor).find(".cornerHandle" ).removeClass('componentAnimation' ).addClass('componentOn' ).removeClass('componentOff' );
			},
			enableSideBySideView: function () {
				this.getFirstMonitor().obj.addClass( 'sideBySideLeft' );
				this.getSecondMonitor().obj.addClass( 'sideBySideRight' );
			},
			toggleSideBySideView: function () {
				this.getFirstMonitor().obj.toggleClass( 'sideBySideLeft sideBySideRight' );
				this.getSecondMonitor().obj.toggleClass( 'sideBySideRight sideBySideLeft' );
			},
			disableSideBySideView: function () {
				this.getFirstMonitor().obj.removeClass( 'sideBySideRight sideBySideLeft' );
				this.getSecondMonitor().obj.removeClass( 'sideBySideRight sideBySideLeft' );

			},
			hideMonitor: function ( monitor ) {
				if (monitor){
					monitor.addClass( 'hiddenScreen' );
				}
			},
			showMonitor: function ( monitor ) {
				if (monitor){
					monitor.removeClass( 'hiddenScreen' );
				}
			},
			getMonitors: function(){
				var _this = this;
				var monitors = [];
				$.each( _this.TYPE, function ( i, type ) {
					monitors.push(_this.monitor[type].obj);
				});
				return monitors;
			},
			getPrimary: function(){
				return this.monitor[this.TYPE.PRIMARY];
			},
			getSecondary: function(){
				return this.monitor[this.TYPE.SECONDARY];
			},
			getFirstMonitor: function () {
				return this.monitor[this.TYPE.PRIMARY].isMain ? this.monitor[this.TYPE.PRIMARY] : this.monitor[this.TYPE.SECONDARY];
			},
			getSecondMonitor: function () {
				return this.monitor[this.TYPE.PRIMARY].isMain ? this.monitor[this.TYPE.SECONDARY] : this.monitor[this.TYPE.PRIMARY];
			},
			enableMonitorTransition: function () {
				this.monitor[this.TYPE.PRIMARY].obj.addClass( 'screenTransition' );
				this.monitor[this.TYPE.SECONDARY].obj.addClass( 'screenTransition' );
			},
			disableMonitorTransition: function () {
				this.monitor[this.TYPE.PRIMARY].obj.removeClass( 'screenTransition' );
				this.monitor[this.TYPE.SECONDARY].obj.removeClass( 'screenTransition' );
			},
			sync: function ( cuePoint, callback ) {
				if (this.syncEnabled) {
					this.loadAdditionalAssets();
					var _this = this;
					var callCallback = function () {
						_this.applyIntrinsicAspect();
						if ( callback && typeof(callback) === "function" ) {
							callback();
						}
					};
					if ( cuePoint ) {
						var myImg = this.getComponent().find( '#SynchImg' );
						if ( cuePoint.thumbnailUrl ) {
							myImg.attr( 'src', cuePoint.thumbnailUrl );
							callCallback();
						} else {
							this.loadNext( cuePoint, function ( url ) {
								myImg.attr( 'src', url );
								callCallback();
							} );
						}
					}
				}
			},
			applyIntrinsicAspect: function(){
				// Check if a image thumbnail is present:
				var $img = this.getComponent().find( '.imagePlayer' );
				//Make sure both image player and display are initialized
				if( $img.length && this.displayInitialized){
					var pHeight = this.getSecondary().obj.height();
					// Check for intrinsic width and maintain aspect ratio
					var pWidth = parseInt( $img.naturalWidth() / $img.naturalHeight() * pHeight, 10);
					var pClass = 'fill-height';
					if( pWidth > this.getSecondary().obj.width() ){
						pClass = 'fill-width';
					}
					$img.removeClass('fill-width fill-height').addClass(pClass);
				}
			},

			//Prefetch
			loadAdditionalAssets: function () {
				if ( this.cuePoints ) {
					this.cancelPrefetch();
					var currentTime = this.getPlayer().currentTime;
					var nextCuePoint = this.getNextCuePoint( currentTime * 1000 );
					if ( nextCuePoint ) {
						if (!nextCuePoint.loaded) {
							var nextCuePointTime = nextCuePoint.startTime / 1000;
							var prefetch = this.getConfig( 'prefetch' );
							var delta = nextCuePointTime - currentTime;

							var _this = this;

							if ( nextCuePointTime > currentTime && prefetch.minimumSequenceDuration <= delta ) {

								var timeOutDuration = delta * (prefetch.durationPercentageUntilNextSequence / 100) * 1000;
								this.prefetchTimeoutId = setTimeout( function () {
										_this.loadNext( nextCuePoint );
										_this.prefetchTimeoutId = null;
									}, timeOutDuration
								);
							} else if ( prefetch.minimumSequenceDuration > delta ){
								this.loadNext( nextCuePoint );
							} else {
								mw.log('Dual screen::: Too late, bail out!!!');
							}
						} else {
							mw.log('Dual screen:: Asset already loaded, aborting...');
						}
					} else {
						mw.log( 'Dual screen:: No more cuepoints!' );
					}
				}
			},
			cancelPrefetch: function () {
				if ( typeof( this.prefetchTimeoutId ) === 'number' ) {
					mw.log( 'Dual screen:: Cancel pending prefetch(' + this.prefetchTimeoutId + ')' );
					window.clearTimeout( this.prefetchTimeoutId );
					this.prefetchTimeoutId = null;
				}
			},
			loadNext: function (nextCuePoint, callback) {
				if (nextCuePoint.thumbnailUrl){
					if (!nextCuePoint.loaded){
						this.loadImage(nextCuePoint.thumbnailUrl, nextCuePoint, callback);
					}
				} else if (callback || (!nextCuePoint.loading && !nextCuePoint.loaded)) {
					nextCuePoint.loading = true;
					var assetId = nextCuePoint.assetId;

					var _this = this;
					// do the api request
					this.getKalturaClient().doRequest( {
						'service': 'thumbAsset',
						'action': 'getUrl',
						'id': assetId
					}, function ( data ) {
						// Validate result
						if ( !_this.isValidResult( data ) ) {
							return;
						}
						// Preload the next image
						_this.loadImage(data, nextCuePoint, callback);
					} );
				}
			},
			loadImage: function(src, cuePoint, callback){
				var _this = this;
				var img = new Image();
				img.onload = function () {
					cuePoint.loaded = true;
					cuePoint.loading = false;
					cuePoint.thumbnailUrl = src;
					if ( callback && typeof(callback) === "function" ) {
						callback.apply( _this, [src] );
					}
				};
				img.onerror = function () {
					cuePoint.loaded = false;
					cuePoint.loading = false;
					cuePoint.thumbnailUrl = null;
				};
				img.src = src;
			},
			isValidResult: function( data ){
				// Check if we got error
				if( !data
					||
					( data.code && data.message )
				){
					//this.log('Error getting related items: ' + data.message);
					//this.getBtn().hide();
					this.error = true;
					return false;
				}
				this.error = false;
				return true;
			},
			getNextCuePoint: function ( time ) {
				var cuePoints = this.getCuePoints();
				// Start looking for the cue point via time, return first match:
				for ( var i = 0; i < cuePoints.length; i++ ) {
					if ( cuePoints[i].startTime >= time ) {
						return cuePoints[i];
					}
				}
				// No cue point found in range return false:
				return false;
			},
			getCurrentCuePoint: function ( ) {
				var currentTime = this.getPlayer().currentTime *1000;
				var cuePoints = this.getCuePoints();
				var cuePoint;
				// Start looking for the cue point via time, return first match:
				for ( var i = 0; i < cuePoints.length; i++ ) {
					var startTime = cuePoints[i].startTime;
					//Retrieve end time from cuePoint metadata, unless it's less one and then use clip duration.
					//If clip duration doesn't exist or it's 0 then use current time(in multicast live duration is
					//always 0)
					var endTime = cuePoints[i + 1] ? cuePoints[i + 1].startTime :
						(this.getPlayer().getDuration() * 1000) ?
							(this.getPlayer().getDuration() * 1000) : (currentTime + 1);
					if ( startTime <= currentTime && currentTime < endTime ) {
						cuePoint = cuePoints[i];
						break;
					}
				}
				return cuePoint;
			}
		} )
	);
}

)( window.mw, window.jQuery );
