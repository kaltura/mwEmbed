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
					'size': '30',
					'startLocation': 'right-15 bottom'
				},
				'resizable': {
					'handles': 'ne, se, sw, nw',
					'ghost': true,
					//'animate': true,
					'maxWidth': 40,
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
				'cuePointType': ['thumbCuePoint.Thumb'],
				'mainViewDisplay': 2 // 1 - Main stream, 2 - Presentation
			},
			monitor: {},
			controlBar: {},
			cuePoints: [],
			TYPE: {PRIMARY: "primary", SECONDARY: "secondary"},

			isDisabled: false,

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
				var _this = this;
				var cuePointsExist = false;
				if ( this.getPlayer().kCuePoints ) {
					var cuePoints = this.getPlayer().kCuePoints.getCuePoints();
					var filteredCuePoints = $.grep( cuePoints, function ( cuePoint ) {
						var found = false;
						$.each( _this.getConfig( 'cuePointType' ), function ( i, cuePointType ) {
							if ( cuePointType == cuePoint.cuePointType ) {
								found = true;
								return false;
							}
						} );
						return found;
					} );
					cuePointsExist = (filteredCuePoints.length > 0) ? true : false;
				}
				return !mw.isIphone() && cuePointsExist;
			},
			initConfig: function () {
				var _this = this;
				this.setConfig( {resizable: $.extend( {}, this.getConfig( 'resizable' ), {maxWidthPercentage: this.getConfig( 'resizable' ).maxWidth} )} );
				var maxWidth = ( ( this.getPlayer().getWidth() * this.getConfig( 'resizable' ).maxWidthPercentage ) / 100 );
				var resizable = $.extend( {}, this.getConfig( 'resizable' ), {maxWidth: maxWidth} );
				this.setConfig( {resizable: resizable} );

				var actionsControls = {
					start: function ( event ) {
						_this.disableControlBar();
						_this.getPlayer().disablePlayControls();
					},
					stop: function ( event ) {
						_this.enableControlBar();
						$( event.toElement ).one( 'click', function ( e ) {
							e.stopImmediatePropagation();
						} );
						_this.getPlayer().enablePlayControls();
						_this.getSecondMonitor().prop = $( this ).css( ['top', 'left', 'width', 'height'] );
					}
				};

				$.extend( _this.getConfig( 'draggable' ), actionsControls )
				$.extend( _this.getConfig( 'resizable' ), actionsControls )
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
					_this.getPlayer().triggerHelper('preDualScreenTransition', [[transitionFrom, transitionTo]])

					_this.disableControlBar();
					_this.enableMonitorTransition();

					function transitionendHandler( e ) {
						if ( transitionHandlerSet ) {
							_this.getPlayer().triggerHelper('postDualScreenTransition', [[transitionFrom, transitionTo]])
							transitionHandlerSet = false;
							_this.enableControlBar();
							_this.disableMonitorTransition();
						}
					}

					if ( _this.getConfig( 'animationSupported' ) ) {
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
									_this.disableMonitorFeatures( _this.getSecondMonitor().obj );
									_this.enableSideBySideView();

								}
							},
							'hide': {
								name: 'SV',
								action: function (  ) {
									_this.hideMonitor( _this.getSecondMonitor().obj );
								}
							},
							'switchView': {
								name: 'PiP',
								action: function () {
									_this.enableMonitorFeatures( _this.getFirstMonitor().obj );
									_this.disableMonitorFeatures( _this.getSecondMonitor().obj );
									_this.toggleMainMonitor();
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
									_this.enableMonitorFeatures( _this.getSecondMonitor().obj );
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
									_this.enableMonitorFeatures( _this.getSecondMonitor().obj );
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
					_this.originalWidth = _this.getPlayer().getPlayerWidth();
					_this.originalHeight = _this.getPlayer().getPlayerHeight();

					var primaryScreen = _this.monitor[_this.TYPE.PRIMARY].obj = _this.getPlayer().getVideoDisplay();
					var secondaryScreen = _this.monitor[_this.TYPE.SECONDARY].obj = _this.getComponent();

					//Set rule attributes
					primaryScreen.addClass( 'dualScreenMonitor firstScreen ' + _this.pluginName ).attr( 'data-monitor-rule', _this.TYPE.PRIMARY );
					secondaryScreen.addClass( 'dualScreenMonitor' ).attr( 'data-monitor-rule', _this.TYPE.SECONDARY );

					secondaryScreen.off().on( 'click dblclick touchstart touchend', function ( e ) {
						_this.embedPlayer.triggerHelper( e );
					} );

					_this.addResizeHandlers(secondaryScreen);

					_this.setControlBarBindings();

					_this.checkAnimationSupport();

					primaryScreen
						.draggable( _this.getConfig( 'draggable' ) ).draggable( 'disable' )
						.resizable( _this.getConfig( 'resizable' ) ).resizable( 'disable' );

					secondaryScreen
						.draggable( _this.getConfig( 'draggable' ) )
						.resizable( _this.getConfig( 'resizable' ) );

					secondaryScreen.position( {
						my: "right-15 bottom-"+(10+_this.getPlayer().layoutBuilder.getHeight()),//_this.getConfig( 'secondScreen' ).startLocation.toLowerCase() + "-15",
						at: "right bottom+",//+(_this.getPlayer().getHeight() - _this.getPlayer().layoutBuilder.getHeight()),
//							_this.getConfig( 'secondScreen' ).startLocation.toLowerCase() + "-" + (_this.getPlayer().layoutBuilder.getHeight()),
						of: $( _this.getPlayer().getInterface() )
					} );

					_this.getSecondMonitor().prop = secondaryScreen.css( ['top', 'left', 'width', 'height'] );
					_this.getSecondMonitor().obj.css( _this.getSecondMonitor().prop );

					if ( _this.getConfig( "mainViewDisplay" ) == 2 ) {
						_this.bind('postDualScreenTransition', function(e, transition){
							_this.unbind('postDualScreenTransition');
							if (!_this.secondDisplayReady) {
								secondaryScreen.find( '#SynchImg' ).getAbsoluteOverlaySpinner().attr( 'id', 'secondScreenLoadingSpinner' );
							}
						});
						_this.fsm.consumeEvent( "switchView" );
					} else if (!_this.secondDisplayReady) {
						secondaryScreen.find( '#SynchImg' ).getAbsoluteOverlaySpinner().attr( 'id', 'secondScreenLoadingSpinner' );
					}

					//dualScreen components are set on z-index 1-3, so set all other components to zIndex 4 or above
	                  $.each(_this.embedPlayer.getVideoHolder().children(), function(index, childNode){
		                  var obj = $(childNode);
		                  var classList = obj.attr('class')? obj.attr('class').split(/\s+/) : [];
		                  if ( $.inArray("dualScreen", classList) == -1){
	                          if ( isNaN(obj.css('z-index')) ){
		                          obj.css('z-index', 4);
	                          } else {
	                              var zIndex = obj.css('z-index');
		                          obj.css('z-index', zIndex + 4);
	                          }
	                      }
	                  });
				} );

				this.bind( 'onOpenFullScreen', function () {
					_this.hideMonitor( _this.getSecondMonitor().obj );
					setTimeout( function () {
						_this.setControlBarWidth();
						//Calculate screen properties
						var secondScreenProps = _this.getSecondMonitor().prop;
						var secondScreen = _this.getSecondMonitor().obj;
						var playerWidth = _this.getPlayer().getPlayerWidth();
						var playerHeight = _this.getPlayer().getPlayerHeight();
						var widthRatio = _this.widthRatio = (playerWidth / _this.originalWidth).toFixed( 2 );
						var heightRatio = _this.heightRatio = (playerHeight / _this.originalHeight).toFixed( 2 );
						var screenProps = {
							height: (secondScreenProps.height.replace( 'px', '' ) * heightRatio).toFixed( 2 ) + "px",
							width: (secondScreenProps.width.replace( 'px', '' ) * widthRatio).toFixed( 2 ) + "px",
							top: (secondScreenProps.top.replace( 'px', '' ) * heightRatio).toFixed( 2 ) + "px",
							left: (secondScreenProps.left.replace( 'px', '' ) * widthRatio).toFixed( 2 ) + "px"
						};
						_this.showMonitor( _this.getSecondMonitor().obj );
						secondScreen.css( screenProps );

						//Calculate screen resize max width
						var maxWidth = ( ( _this.getPlayer().getWidth() * _this.getConfig( 'resizable' ).maxWidthPercentage ) / 100 );
						secondScreen.resizable( {maxWidth: maxWidth} );

						//Store props for transitions
						_this.getFirstMonitor().prop = screenProps;
						_this.getSecondMonitor().prop = screenProps;

					}, 1000 );
				} );
				this.bind( 'onCloseFullScreen', function () {
					_this.hideMonitor( _this.getSecondMonitor().obj );
					setTimeout( function () {
						_this.setControlBarWidth();
						///Calculate screen properties
						var secondScreenProps = _this.getSecondMonitor().prop;
						var secondScreen = _this.getSecondMonitor().obj;
						var screenProps = {
							height: (secondScreenProps.height.replace( 'px', '' ) / _this.heightRatio).toFixed( 2 ) + "px",
							width: (secondScreenProps.width.replace( 'px', '' ) / _this.widthRatio).toFixed( 2 ) + "px",
							top: (secondScreenProps.top.replace( 'px', '' ) / _this.heightRatio).toFixed( 2 ) + "px",
							left: (secondScreenProps.left.replace( 'px', '' ) / _this.widthRatio).toFixed( 2 ) + "px"
						};
						_this.showMonitor( _this.getSecondMonitor().obj );
						secondScreen.css( screenProps );

						//Calculate screen resize max width
						var maxWidth = ( ( _this.getPlayer().getWidth() * _this.getConfig( 'resizable' ).maxWidthPercentage ) / 100 );
						secondScreen.resizable( {maxWidth: maxWidth} );

						//Store props for transitions
						_this.getFirstMonitor().prop = screenProps;
						_this.getSecondMonitor().prop = screenProps;

					}, 1000 );
				} );

				this.bind( 'onplay', function () {
					_this.loadAdditionalAssets();
				} );
				this.bind( 'seeked', function () {
					//_this.cancelPrefetch();
					var cuePoint = _this.getCurrentCuePoint();
					_this.sync( cuePoint );
				} );

				this.bind( 'KalturaSupport_ThumbCuePointsReady', function () {
					var cuePoints = _this.getPlayer().kCuePoints.getCuePoints();
					$.each( cuePoints, function ( index, cuePoint ) {
						if ( $.inArray( cuePoint.cuePointType, _this.getConfig( 'cuePointType' ) ) > -1 ) {
							_this.cuePoints.push( cuePoint );
						}
					} );

					_this.cuePoints.sort( function ( a, b ) {
						return a.startTime - b.startTime;
					} );
					_this.loadNext( _this.cuePoints[0], function(){
						var $spinner = $( '#secondScreenLoadingSpinner' );
						if ( $spinner.length > 0 ) {
							// remove the spinner
							$spinner.remove();
						}
						_this.secondDisplayReady = true;

	//					_this.toggleMonitorFeatures(_this.getSecondMonitor());
					} );
	//				_this.toggleMonitorFeatures(_this.getSecondMonitor());
				} );
				this.bind( 'KalturaSupport_CuePointReached', function ( e, cuePointObj ) {
					_this.sync( cuePointObj.cuePoint );
				} );

				var fsmState = [];
				var screenShown = false;
				var cssParams = {};
				this.bind( "preShowScreen", function () {
					screenShown = true;
					if (_this.fsm.getStatus() != "pip"){
						fsmState.push(_this.fsm.getStatus());
						_this.fsm.consumeEvent( 'pip' );
					}
					if ( !_this.getPrimary().isMain ) {
						fsmState.push('switchView');
						_this.fsm.consumeEvent( 'switchView' );
					}
					cssParams = _this.getFirstMonitor().obj.css( ['top', 'left', 'width', 'height'] );
					_this.getPrimary().obj.css({'top': '', 'left': '', 'width': '', 'height': ''} ).removeClass('firstScreen');
					_this.fsm.consumeEvent( 'hide' );
				} );
				this.bind( "preHideScreen", function () {
					if (screenShown) {
						screenShown = false;
						_this.getPrimary().obj.addClass( 'firstScreen' );
						_this.getPrimary().obj.css( cssParams );
						$.each(fsmState, function(i, state){
							_this.fsm.consumeEvent( state );
						});
						fsmState = [];
					}
				} );
			},
			checkAnimationSupport: function ( elm ) {
				elm = elm || document.body || document.documentElement;
				var animation = false,
					animationstring = 'animation',
					keyframeprefix = '',
					domPrefixes = 'Webkit Moz O ms Khtml'.split( ' ' ),
					pfx = '';

				if ( elm.style.animationName !== undefined ) {
					animation = true;
				}

				if ( animation === false ) {
					for ( var i = 0; i < domPrefixes.length; i++ ) {
						if ( elm.style[ domPrefixes[i] + 'AnimationName' ] !== undefined ) {
							pfx = domPrefixes[ i ];
							animationstring = pfx + 'Animation';
							keyframeprefix = '-' + pfx.toLowerCase() + '-';
							animation = true;
							break;
						}
					}
				}

				this.setConfig( 'animationSupported', animation );
			},

			//Monitor
			getComponent: function () {
				if ( !this.$el ) {
					this.getControlBar();
					var x = this.getPlayer().getWidth() * this.getConfig( 'secondScreen' ).size / 100;
					var y = this.getPlayer().getHeight() * this.getConfig( 'secondScreen' ).size / 100;
					this.$el = $( '<div />' )
						.css( {height: y + 'px', width: x + 'px'} )
						.addClass( this.getCssClass() + " secondScreen" );

					this.$el.append(
						$( '<img>' )
							.css( {'height': '100%', 'width': '100%'} )
							.attr( 'alt', 'Slideshow' )
							.attr( 'id', 'SynchImg' )
					);
				}
				return this.$el;
			},

			toggleMainMonitor: function () {
				var _this = this;
				$.each( this.monitor, function ( name, monitor ) {
					monitor.isMain = !monitor.isMain;
					monitor.obj.attr( 'data-monitor-rule', monitor.isMain ? _this.TYPE.PRIMARY : _this.TYPE.SECONDARY )
					monitor.obj.toggleClass( 'firstScreen secondScreen' )
				} );
			},
			enableMonitorFeatures: function ( monitor ) {
				monitor.css( this.getSecondMonitor().prop );
				monitor.draggable( 'enable' ).resizable( 'enable' );
				this.addResizeHandlers(monitor);
			},
			disableMonitorFeatures: function ( monitor ) {
				this.getFirstMonitor().prop = monitor.css( ['top', 'left', 'width', 'height'] );
				this.getSecondMonitor().prop = monitor.css( ['top', 'left', 'width', 'height'] );
				monitor.draggable( 'disable' ).resizable( 'disable' );
				//monitor.css({'top': '', 'left': '', 'width': '', 'height': ''});
				this.removeResizeHandlers(monitor);
			},
			removeResizeHandlers: function(monitor){
				monitor.find(".dualScreen-transformhandle" ).remove();
			},
			addResizeHandlers: function (monitor, action) {
				var dragging = false;
				monitor.prepend($("<span>").addClass("dualScreen-transformhandle componentAnimation cornerHandle bottomRightHandle").addClass('componentOff'));
				monitor.prepend($("<span>").addClass("dualScreen-transformhandle componentAnimation cornerHandle bottomLeftHandle").addClass('componentOff'));
				monitor.prepend($("<span>").addClass("dualScreen-transformhandle componentAnimation cornerHandle topRightHandle").addClass('componentOff'));
				monitor.prepend($("<span>").addClass("dualScreen-transformhandle componentAnimation cornerHandle topLeftHandle").addClass('componentOff'));
				monitor
					.on( 'mousemove touchstart', function(e){if (dragging){return;}$(this ).find('.cornerHandle' ).addClass('componentOn' ).removeClass('componentOff')})
					.on( 'mouseleave', function(e){if (dragging){return;}$(this ).find('.cornerHandle' ).addClass('componentOff').removeClass('componentOn' )})
					.on( 'mousedown', function(){dragging = true;})
					.on( 'mouseup', function(){dragging = false;});

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
				monitor.addClass( 'hiddenScreen' );
			},
			showMonitor: function ( monitor ) {
				monitor.removeClass( 'hiddenScreen' );
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
			sync: function ( cuePoint ) {
				this.loadAdditionalAssets();

				var myImg = this.getComponent().find( '#SynchImg' );
				if (cuePoint.thumbnailUrl) {
					myImg.attr( 'src', cuePoint.thumbnailUrl);
				} else {
					this.loadNext(cuePoint, function(url){
						myImg.attr( 'src', url);
					});
				}
			},

			//Control Bar
			getControlBar: function ( ) {
				if ( !this.$controlBar ) {
					this.$controlBar = $( '<div />' )
						.addClass( 'controlBar componentAnimation componentOff' + this.getCssClass() )
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
			positionControlBar: function ( height ) {
				this.getControlBar().position( {
					my: 'right top+'+(height || 0),
					at: 'right top',
					of: this.getPlayer().getInterface(),
					collision: 'none'
				} );
			},
			setControlBarBindings: function () {
				//Set control bar visiblity handlers
				var _this = this;
				var components = this.getMonitors().concat(_this.getControlBar()).concat(_this.getPlayer().getVideoHolder());
				$.each(components, function(i, obj){
					obj
						.on( 'mousemove touchstart', function(e){_this.showControlBar( )} )
						.on( 'mouseleave', function(e){_this.hideControlBar( )} );
				});

				//add drop shadow containers for control bar
				this.getPlayer().getInterface().find(".mwEmbedPlayer").prepend($("<div class='controlBarShadow componentAnimation'></div>").addClass('componentOff'));
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

				this.bind("onShowToplBar onHideToplBar", function(e, height){
					_this.positionControlBar(height.top);
				});
			},
			disableControlBar: function () {
				clearTimeout(this.getControlBar().handleTouchTimeoutId);
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
					this.getControlBar().addClass('componentOff' ).removeClass('componentOn');
					$(this.getPlayer().getInterface()).find(".controlBarShadow" ).addClass('componentOff' ).removeClass('componentOn');
					this.getControlBar().isVisible = false;
				}
			},
			showControlBar: function ( ) {
				if ( this.monitorControlBarDisabled || this.ignoreNextMouseEvent) {
					this.ignoreNextMouseEvent = false;
					return;
				}
				if ( !this.getControlBar().isVisible ) {
					this.getControlBar().addClass('componentOn' ).removeClass('componentOff');
					this.positionControlBar();
					this.getControlBar().isVisible = true;
					$(this.getPlayer().getInterface()).find(".controlBarShadow" ).addClass('componentOn' ).removeClass('componentOff');
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
				var cuePoints = this.cuePoints;
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
				var cuePoints = this.cuePoints;
				var cuePoint;
				// Start looking for the cue point via time, return first match:
				for ( var i = 0; i < cuePoints.length; i++ ) {
					var startTime = cuePoints[i].startTime;
					var endTime = cuePoints[i + 1] ? cuePoints[i + 1].startTime : (this.getPlayer().getDuration() * 1000);
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