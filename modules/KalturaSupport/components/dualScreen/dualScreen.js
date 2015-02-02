(function ( mw, $ ) {
	"use strict";
	mw.PluginManager.add( 'dualScreen', mw.KBaseComponent.extend( {

			defaultConfig: {
				'parent': 'videoHolder',
				'order': 1,
				'showTooltip': false,
				"displayImportance": 'high',
				'templatePath': 'components/dualScreen/displayControlBar.tmpl.html',
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
				'minDisplayHeight': 0
			},
			monitor: {},
			controlBar: {},
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

			controlBarComponents: {
				sideBySide: {
					id: 'sideBySide',
					title: ['Side By Side']
				},
				singleView: {
					id: 'singleView',
					title: ['Single View']
				},
				pip: {
					id: 'pip',
					title: ['Picture In Picture']
				},
				switchView: {
					id: 'switchView',
					title: ['Toggle Main View']
				}
			},

			setup: function ( embedPlayer ) {
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
						_this.disableControlBar();
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
						_this.enableControlBar();
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
					}
					this.canConsumeEvent = function ( e ) {
						return !!this.currentState.events[e];
					}
					this.getStatus = function () {
						return this.currentState.name;
					}
				}

				var _this = this;

				var fsmTransitionHandlers = function (transitionFrom, transitionTo) {
					var transitionHandlerSet = true;
					_this.getPlayer().triggerHelper('preDualScreenTransition', [[transitionFrom, transitionTo]]);

					_this.disableControlBar();
					_this.enableMonitorTransition();

					function transitionendHandler( e ) {
						if ( transitionHandlerSet ) {
							transitionHandlerSet = false;
							_this.enableControlBar();
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
								name: 'SV',
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
								name: 'SV',
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
						'name': 'SV',
						'events': {
							'PiP': {
								name: 'PiP',
								action: function () {
									_this.enableMonitorFeatures( );
									_this.showMonitor( _this.getSecondMonitor().obj );
								}
							},
							'switchView': {
								name: 'SV',
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

				this.fsm = new StateMachine( states );
			},
			initMonitors: function () {
				var _this = this;
				$.each( this.TYPE, function ( key, val ) {
					_this.monitor[val] = {};
					_this.monitor[val] = {
						isMain: (val == _this.TYPE.PRIMARY) ? true : false,
						obj: null,
						prop: {},
						isVisible: true
					};
				} );
			},
			addBindings: function () {
				var _this = this;
				this.bind( 'playerReady', function ( e, newState ) {
					_this.checkRenderConditions();
					_this.initDisplay();
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
								( eventName == event.type && !_this.getPlayer().layoutBuilder.isInFullScreen() )
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
							var widthRatio = (playerWidth / _this.previousPlayerWidth).toFixed( 2 );
							var heightRatio = (playerHeight / _this.previousPlayerHeight).toFixed( 2 );

							//Save current dimensions for next differential calculation
							_this.previousPlayerWidth = playerWidth;
							_this.previousPlayerHeight = playerHeight;

							//Calculate and apply new screen properties
							var newWidth = parseInt( (secondScreenProps.width.replace( 'px', '' ) * widthRatio).toFixed( 2 ) );
							var newHeight = parseInt( newWidth * _this.getConfig( 'secondScreen' ).widthHeightRatio );
							var topOffset = parseInt( (secondScreenProps.top.replace( 'px', '' ) * heightRatio).toFixed( 2 ) );
							var leftOffset = parseInt( (secondScreenProps.left.replace( 'px', '' ) * widthRatio).toFixed( 2 ) );
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
				var context = isIframe ? window['parent'] : window;
				// Bind orientation change to resize player
				$( context ).bind( eventName, updateSecondScreenLayout);

				this.bind( 'onplay', function () {
					_this.loadAdditionalAssets();
					_this.monitorControlBarDisabled = false;
				} );

				this.bind( 'onpause ended', function () {
					_this.ignoreNextMouseEvent = false;
					_this.showControlBar();
					_this.monitorControlBarDisabled = true;
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
						cuePoint = _this.getCurrentCuePoint()
					}
					_this.sync( cuePoint );
				} );

				var fsmState = [];
				var secondDisplayMinimized = false;
				var minimizeSecondDisplay = function(){
					if (!secondDisplayMinimized) {
						secondDisplayMinimized = true;
						if (!(_this.getPrimary().isMain && _this.fsm.getStatus() == "SV")) {
							_this.bind( "postDualScreenTransition", function ( event, transitions ) {
									if ( transitions[1] == "hide" ) {
										_this.getPlayer().unbindHelper( "postDualScreenTransition" );
										_this.disableControlBar();
									}
								}
							);
							fsmState.push( _this.fsm.getStatus() );
							if ( !_this.getPrimary().isMain ) {
								fsmState.push( 'switchView' );
								_this.fsm.consumeEvent( 'switchView' );
							}
							if ( _this.fsm.getStatus() != "PiP" ) {
								_this.fsm.consumeEvent( 'PiP' );
							}

							_this.fsm.consumeEvent( 'hide' );
							_this.ignoreNextMouseEvent = true;
						} else {
							_this.disableControlBar();
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
						_this.bind("postDualScreenTransition", function(event, transitions) {
								if ( transitions[0] == "SV" ) {
									_this.getPlayer().unbindHelper( "postDualScreenTransition" );
									_this.enableControlBar();
								}
							}
						);
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
						_this.hideControlBar();
						minimizeSecondDisplay();
					}
				} );
				this.bind( "preHideScreen", function (e, screenName) {
					_this.screenShown = false;
					if (_this.render && _this.currentScreenNameShown === screenName) {
						_this.currentScreenNameShown = "";
						maximizeSecondDisplay();
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
					var cuePoint = _this.getCurrentCuePoint()
					_this.sync( cuePoint );
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

					this.setControlBarBindings();

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

					if ( this.getConfig( "mainViewDisplay" ) == 2 ) {
						this.bind( 'postDualScreenTransition.spinnerPostFix', function () {
							_this.unbind( 'postDualScreenTransition.spinnerPostFix' );
							showLoadingSlide();
						} );
						setTimeout( function () {
							_this.fsm.consumeEvent( "switchView" );
						}, 1000 );
					} else {
						showLoadingSlide();
					}

					//dualScreen components are set on z-index 1-3, so set all other components to zIndex 4 or above
					this.zIndexObjs = [];
					$.each( this.embedPlayer.getVideoHolder().children(), function ( index, childNode ) {
						var obj = $( childNode );
						var classList = obj.attr( 'class' ) ? obj.attr( 'class' ).split( /\s+/ ) : [];
						if ( $.inArray( "dualScreen", classList ) == -1 ) {
							if ( isNaN( obj.css( 'z-index' ) ) ) {
								obj.css( 'z-index', 4 );
							} else {
								var zIndex = obj.css( 'z-index' );
								obj.css( 'z-index', zIndex + 4 );
							}
							_this.zIndexObjs.push( obj );
						}
					} );

					this.showControlBar();
					this.monitorControlBarDisabled = true;
				}
			},
			hideDisplay: function(){
				this.getSecondMonitor().obj.css("visibility", "hidden");
				this.disableControlBar();
				this.getControlBar().css("visibility", "hidden");
			},
			showDisplay: function(){
				this.getFirstMonitor().obj.css("visibility", "");
				this.getSecondMonitor().obj.css("visibility", "");
				this.getControlBar().css("visibility", "");
				this.setControlBarWidth();
				this.positionControlBar();
				this.enableControlBar();
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
					this.getControlBar();
					var width = this.getPlayer().getWidth() * this.getConfig( 'secondScreen' ).size / 100;
					var height = width * this.getConfig('secondScreen').widthHeightRatio;
					this.$el = $( '<div />' )
						.css( {height: height + 'px', width: width + 'px'} )
						.addClass( this.getCssClass() + " secondScreen" );

					this.$el.append(
						$( '<img>' )
							.attr( 'id', 'SynchImg' )
							.addClass("imagePlayer")
					);
					this.applyIntrinsicAspect();
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
					monitor.obj.attr( 'data-monitor-rule', monitor.isMain ? _this.TYPE.PRIMARY : _this.TYPE.SECONDARY )
					monitor.obj.toggleClass( 'firstScreen secondScreen' )
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
					.on( 'mouseleave', function(e) { if ( !( mw.isMobileDevice() || _this.dragging ) ) { _this.hideResizeHandlers(); } })
					.on( 'mousemove touchstart', function(e){
						if (!_this.dragging){
							_this.showResizeHandlers();
							if(cornerHandleVisibleTimeoutId){
								clearTimeout(cornerHandleVisibleTimeoutId);
							}
							cornerHandleVisibleTimeoutId = setTimeout(function(){_this.hideResizeHandlers();}, _this.getConfig('menuFadeout'))
						}
					});

			},
			hideResizeHandlers: function(){
				var monitor = this.getSecondMonitor().obj;
				$(monitor).find(".cornerHandle" ).addClass( 'componentOff componentAnimation' ).removeClass( 'componentOn' )
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
				monitor && monitor.addClass( 'hiddenScreen' );
			},
			showMonitor: function ( monitor ) {
				monitor && monitor.removeClass( 'hiddenScreen' );
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
					var callCallback = function () {
						if ( callback && typeof(callback) == "function" ) {
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
				if( $img.length ){
					var pHeight = this.getPlayer().getVideoDisplay().height();
					// Check for intrinsic width and maintain aspect ratio
					var pWidth = parseInt( $img.naturalWidth() / $img.naturalHeight() * pHeight);
					var pClass = 'fill-height';
					if( pWidth > this.getPlayer().getVideoDisplay().width() ){
						pClass = 'fill-width';
					}
					$img.removeClass('fill-width fill-height').addClass(pClass);
				}
			},

			//Control Bar
			getControlBar: function ( ) {
				if ( !this.$controlBar ) {
					this.$controlBar = $( '<div />' )
						.addClass( 'controlBar componentOff' + this.getCssClass() )
						.append(
						$( '<div class="controlBar-content" /> ' ).append(
							this.getTemplateHTML( )
						)
					);
					this.getPlayer().getInterface().append( this.$controlBar );
					this.setControlBarWidth();
				}
				return this.$controlBar;
			},
			setControlBarWidth: function(){
				var width = 0;
				this.getControlBar().find("#displayControlBar").each(function() {
					width += $(this).outerWidth( true );
				});
				this.getControlBar().
					css({'width': width + 10});
			},
			positionControlBar: function (  ) {
				var height = 0;
				if (this.getPlayer().getTopBarContainer().length) {
					height = this.getPlayer().getTopBarContainer().height();
				}
				this.getControlBar().position( {
					my: 'right top+'+height,
					at: 'right top',
					of: this.getPlayer().getInterface(),
					collision: 'none'
				} );
			},
			setControlBarBindings: function () {
				//Set control bar visiblity handlers
				var _this = this;
				this.getPlayer().getInterface()
					.on( 'mousemove touchstart', function(e){_this.showControlBar( )} )
					.on( 'mouseleave', function(e){if (!mw.isMobileDevice()){_this.hideControlBar( )} } );

				//add drop shadow containers for control bar
				this.getPlayer().getInterface().find(".mwEmbedPlayer").prepend($("<div class='controlBarShadow componentAnimation'></div>").addClass('componentOff'));
				this.getComponent().prepend($("<div class='controlBarShadow componentAnimation'></div>").addClass('componentOff'));
				//Attach control bar action handlers
				$.each( _this.controlBarComponents, function ( name, component ) {
					_this.getControlBar()
						.on( 'click', 'li > span#' + component.id, function () {
							var event = null;
							switch ( component.id ) {
								case 'sideBySide':
									event = "SbS";
									break;
								case 'switchView':
									event = "switchView";
									break;
								case 'singleView':
									event = 'hide';
									break;
								case 'pip':
									event = 'PiP';
									break;
							}
							if ( event != null ) {
								_this.fsm.consumeEvent( event );
							}
						} )
						.find('li > span#' + component.id)
						.attr('title', component.title)
						.attr('data-show-tooltip', true);
				} );

				this.bind("showPlayerControls" , function(){
					_this.showControlBar();
				});
			},
			disableControlBar: function () {
				clearTimeout(this.getControlBar().handleTouchTimeoutId);
				this.monitorControlBarDisabled = false;
				this.hideControlBar( );
				this.monitorControlBarDisabled = true;
			},
			enableControlBar: function () {
				this.monitorControlBarDisabled = false;
				this.showControlBar( );
			},
			hideControlBar: function ( ) {
				if ( this.monitorControlBarDisabled ) {
					return;
				}
				if ( this.getControlBar().isVisible ) {
					this.getControlBar().addClass('componentOff componentAnimation' ).removeClass('componentOn');
					this.getFirstMonitor().obj.find(".controlBarShadow" ).addClass('componentOff componentAnimation' ).removeClass('componentOn');
					this.getControlBar().isVisible = false;
				}
			},
			showControlBar: function ( ) {
				if ( this.monitorControlBarDisabled || this.ignoreNextMouseEvent) {
					this.ignoreNextMouseEvent = false;
					return;
				}
				if ( !this.getControlBar().isVisible ) {
					this.getControlBar().removeClass('componentAnimation').addClass('componentOn' ).removeClass('componentOff');
					this.positionControlBar();
					this.getControlBar().isVisible = true;
					this.getFirstMonitor().obj.find(".controlBarShadow" ).removeClass('componentAnimation').addClass('componentOn' ).removeClass('componentOff');
				}

				var _this = this;
				if (this.getControlBar().handleTouchTimeoutId){
					clearTimeout(this.getControlBar().handleTouchTimeoutId);
				}
				this.getControlBar().handleTouchTimeoutId = setTimeout( function () {
					_this.ignoreNextMouseEvent = true;
					_this.hideControlBar( );
				}, this.getConfig('menuFadeout') );

			},

			//Prefetch
			loadAdditionalAssets: function () {
				var start;
				var end;

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
										end = window.performance ? window.performance.now() : new Date();
										_this.prefetchTimeoutId = null;
									}, timeOutDuration
								);
							} else if ( prefetch.minimumSequenceDuration > delta ){
								this.loadNext( nextCuePoint );
							} else {
								mw.log('Dual screen::: Too late, bail out!!!');
							}
						} else {
							mw.log('Dual screen:: Asset already loaded, aborting...')
						}
					} else {
						mw.log( 'Dual screen:: No more cuepoints!' );
					}
				}
			},
			cancelPrefetch: function () {
				if ( typeof( this.prefetchTimeoutId ) == 'number' ) {
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
					if ( callback && typeof(callback) == "function" ) {
						callback.apply( _this, [src] );
					}
				}
				img.onerror = function () {
					cuePoint.loaded = false;
					cuePoint.loading = false;
					cuePoint.thumbnailUrl = null;
				}
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

})( window.mw, window.jQuery );
