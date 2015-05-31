(function ( mw, $ ) {
	"use strict";
	mw.PluginManager.add( 'dualScreen', mw.KBaseComponent.extend( {

			defaultConfig: {
				'parent': 'videoHolder',
				'order': 1,
				'showTooltip': false,
				"displayImportance": 'high',
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
				'resizeHandlesFadeout': 5000,
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
			TYPE: {PRIMARY: "primary", SECONDARY: "secondary"},

			isDisabled: false,
			displayInitialized: false,
			render: true,
			screenShown: false,
			currentScreenNameShown: "",
			dragging: false,
			resizing: false,


			setup: function ( ) {
				this.initConfig();
				this.initFSM();
				this.addBindings();
				this.initMonitors();
			},
			isSafeEnviornment: function () {
				this.screenObj = new mw.dualScreen.imagePlayer({
					embedPlayer: this.getPlayer()
				});
				return this.screenObj.isSafeEnviornment();
				/*var cuePoints = this.getCuePoints();
				var cuePointsExist = (cuePoints.length > 0) ? true : false;
				return (!this.getPlayer().useNativePlayerControls() &&
							(
								( this.getPlayer().isLive() && this.getPlayer().isDvrSupported() && mw.getConfig("EmbedPlayer.LiveCuepoints") ) ||
								( !this.getPlayer().isLive() && cuePointsExist )
							)
						);*/
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

						_this.controlBar.hide();
						if (_this.controlBar){
							wasDisabled = _this.controlBar.disabled;
						}
						_this.controlBar.disable();
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
							_this.controlBar.enable();
							_this.controlBar.show();
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
				var _this = this;

				var fsmTransitionHandlers = function (transitionFrom, transitionTo) {
					var transitionHandlerSet = true;
					_this.getPlayer().triggerHelper('preDualScreenTransition', [[transitionFrom, transitionTo]]);

					_this.controlBar.hide();

					_this.enableMonitorTransition();

					function transitionendHandler( ) {
						if ( transitionHandlerSet ) {
							transitionHandlerSet = false;
							_this.controlBar.show();
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

				var selectedStatesMap = mw.isNativeApp() ? mw.dualScreen.nativeAppStates : mw.dualScreen.states;

				this.fsm = new mw.dualScreen.StateMachine( selectedStatesMap, this, fsmTransitionHandlers );
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
							//TODO: move to image player
							_this.screenObj.applyIntrinsicAspect();
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
					_this.controlBar.enable();
				} );

				this.bind( 'onpause ended playerReady', function () {
					_this.controlBar.show();
					_this.controlBar.disable();
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
				this.bind("dualScreenStateChange", function(e, state){
					_this.fsm.consumeEvent( state );
				});
				this.bind("showPlayerControls" , function(){
					_this.controlBar.show();
				});
				this.bind("postDualScreenTransition", function () {
					//TODO: move to imagePlayer
					_this.screenObj.applyIntrinsicAspect();
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
					this.controlBar = this.getPlayer().plugins.dualScreenControlBar;
					this.embedPlayer.getInterface().append( this.controlBar.getComponent() );
				}
			},
			hideDisplay: function(){
				this.getSecondMonitor().obj.css("visibility", "hidden");
				this.controlBar.hide();
				this.controlBar.disable();
			},
			showDisplay: function(){
				this.getFirstMonitor().obj.css("visibility", "");
				this.getSecondMonitor().obj.css("visibility", "");
				this.controlBar.enable();
				this.controlBar.show();
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

					this.$el.append( this.screenObj.getComponent());
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
							cornerHandleVisibleTimeoutId = setTimeout(function(){_this.hideResizeHandlers();}, _this.getConfig('resizeHandlesFadeout'));
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
			}
		} )
	);
}

)( window.mw, window.jQuery );
