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
					'size': '30%',
					'startLocation': 'right bottom'
				},
				'resizable': {
					'handles': 'n, e, w, s, ne, se, sw, nw',
					'ghost': true,
					//'animate': true,
					'maxWidth': 40,
					'aspectRatio': true,
					'minWidth': 100
				},
				'draggable': {
					'cursor': 'move',
					'containment': 'parent',
					'cancel': 'video'
				},
				'prefetch': {
					'durationPercentageUntilNextSequence': 60,
					'minimumSequenceDuration': 2
				}
			},
			monitor: {},
			controlBar: {},
			cuePoints: [],
			TYPE: {PRIMARY: "primary", SECONDARY: "secondary"},

			isDisabled: false,

			controlBarComponents: {
				sideBySide: {
					id: 'sideBySide'
				},
				toggleEnabledView: {
					id: 'toggleEnabledView'
				},
				toggleMainView: {
					id: 'toggleMainView'
				}
			},

			setup: function ( embedPlayer ) {
				this.initConfig();
				this.initFSM();
				this.addBindings();
				this.initMonitors();
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
					this.consumeEvent = function ( e, source ) {
						if ( this.currentState.events[e] ) {
							fsmTransitionHandlers();
							this.currentState.events[e].action( source );
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

				var fsmTransitionHandlers = function () {
					_this.disableControlBar();
					_this.enableMonitorTransition();

					function transitionendHandler( e ) {
						_this.enableControlBar();
						_this.disableMonitorTransition();
					}

					_this.getFirstMonitor().obj.one( 'transitionend webkitTransitionEnd', transitionendHandler );
					_this.getSecondMonitor().obj.one( 'transitionend webkitTransitionEnd', transitionendHandler );
				};

				var states = [
					{
						'name': 'PiP',
						'initial': true,
						'events': {
							'SbS': {
								name: 'SbS',
								action: function () {
									_this.toggleMonitorFeatures( _this.getSecondMonitor().obj );
									_this.enableSideBySideView();

								}
							},
							'hide': {
								name: 'SV',
								action: function ( source ) {
									_this.toggleMonitorFeatures( _this.getSecondMonitor().obj );
									if ( source == _this.TYPE.PRIMARY ) {
										_this.toggleMainMonitor();
									}
									_this.hideMonitor( _this.getSecondMonitor().obj );
								}
							},
							'switch': {
								name: 'PiP',
								action: function () {
									_this.toggleMonitorFeatures( _this.getFirstMonitor().obj );
									_this.toggleMonitorFeatures( _this.getSecondMonitor().obj );
									_this.toggleMainMonitor();
								}
							}
						}
					},
					{
						'name': 'SbS',
						'events': {
							'SbS': {
								name: 'PiP',
								action: function ( source ) {
									if ( source == _this.TYPE.SECONDARY ) {
										_this.toggleMainMonitor();
									}
									_this.toggleMonitorFeatures( _this.getSecondMonitor().obj );
									_this.disableSideBySideView();
								}
							},
							'hide': {
								name: 'SV',
								action: function ( source ) {
									if ( source == _this.TYPE.PRIMARY ) {
										_this.toggleMainMonitor();
									}
									_this.disableSideBySideView();
									_this.hideMonitor( _this.getSecondMonitor().obj );
								}
							},
							'switch': {
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
							'hide': {
								name: 'PiP',
								action: function () {
									_this.toggleMonitorFeatures( _this.getSecondMonitor().obj );
									_this.showMonitor( _this.getSecondMonitor().obj );
								}
							},
							'switch': {
								name: 'SV',
								action: function () {
									_this.showMonitor( _this.getSecondMonitor().obj );
									_this.hideMonitor( _this.getFirstMonitor().obj );

									_this.toggleMainMonitor();
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

					_this.controlBar[val] = {};
					_this.controlBar[val] = {
						rule: val,
						obj: null,
						prop: {},
						isVisible: false
					};

				} );
				function monitor() {
				}

				monitor.prototype = {
					setFirst: function () {
						if ( !this.isMain ) {
							this.isMain = true;
							this.obj.draggable( 'disable' ).resizable( 'disable' );
							this.obj.removeClass( this.sideBySideClass + 'secondScreen' ).addClass( 'firstScreen' );
							this.obj.attr( 'data-monitor-rule', _this.TYPE.PRIMARY )
						}

					},
					setSecond: function () {
						if ( this.isMain ) {
							this.isMain = false;
							this.obj.draggable( 'enable' ).resizable( 'enable' );
							this.obj.removeClass( this.sideBySideClass + 'firstScreen' ).addClass( 'secondScreen' );
							this.obj.attr( 'data-monitor-rule', _this.TYPE.SECONDARY )
						}
					},
					toggleFirstSecond: function () {
						if ( this.isMain ) {
							this.setSecond();
						} else {
							this.setFirst();
						}
					},
					doSideBySide: function () {
						if ( !this.isMain ) {
							this.obj.draggable( 'disable' ).resizable( 'disable' );
						}
						this.sideBySideClass = this.isMain ? 'sideBySideLeft' : 'sideBySideRight';
						this.obj.addClass( this.sideBySideClass );
					},
					undoSideBySide: function () {
						if ( !this.isMain ) {
							this.obj.draggable( 'enable' ).resizable( 'enable' );
						}
						this.obj.removeClass( this.sideBySideClass );
					},
					hide: function () {
						this.obj.addClass( 'hiddenScreen' );
					},
					show: function () {
						this.obj.removeClass( 'hiddenScreen' );
					}
				}

			},
			addBindings: function () {
				var _this = this;
				this.bind( 'playerReady', function ( e, newState ) {

					var cuePoints = _this.getPlayer().kCuePoints.getCuePoints();
					$.each( cuePoints, function ( index, cuePoint ) {
						if ( cuePoint.cuePointType == "codeCuePoint.Code" ) {
							_this.cuePoints.push( cuePoint );
						}
					} );
					_this.cuePoints.sort( function ( a, b ) {
						return a.startTime - b.startTime;
					} );

					var primaryScreen = _this.monitor[_this.TYPE.PRIMARY].obj = _this.getPlayer().getVideoDisplay();
					var secondaryScreen = _this.monitor[_this.TYPE.SECONDARY].obj = _this.getComponent();
					_this.controlBar[_this.TYPE.PRIMARY].obj = _this.getControlBar( _this.TYPE.PRIMARY );
					_this.controlBar[_this.TYPE.SECONDARY].obj = _this.getControlBar( _this.TYPE.SECONDARY );

					//Set rule attributes
					primaryScreen.addClass( 'dualScreenMonitor' ).attr( 'data-monitor-rule', _this.TYPE.PRIMARY ).addClass( 'firstScreen' );
					secondaryScreen.addClass( 'dualScreenMonitor' ).attr( 'data-monitor-rule', _this.TYPE.SECONDARY );

					_this.setControlBarBindings();

					primaryScreen
						.draggable( _this.getConfig( 'draggable' ) ).draggable( 'disable' )
						.resizable( _this.getConfig( 'resizable' ) ).resizable( 'disable' );

					secondaryScreen
						.draggable( _this.getConfig( 'draggable' ) )
						.resizable( _this.getConfig( 'resizable' ) );

					secondaryScreen.position( {
						my: _this.getConfig( 'secondScreen' ).startLocation.toLowerCase(),
						at: _this.getConfig( 'secondScreen' ).startLocation.toLowerCase(),
						of: $( _this.getPlayer().getVideoHolder() )
					} );

					//_this.setConfig( 'secondaryScreenProps', secondaryScreen.css( ['top', 'left', 'width', 'height'] ) )
				} );

				this.bind( 'onOpenFullScreen', function ( e, cuePointObj ) {
					setTimeout( function () {
						var secondScreen = _this.getSecondMonitor().obj;
						if ( !_this.fullScreen ) {
							var loc = secondScreen.css( ['top', 'left', 'height', 'width'] );
							console.info(loc);
							var playerWidth = _this.getPlayer().getPlayerWidth();
							var playerHeight = _this.getPlayer().getPlayerHeight();
							console.info( playerHeight +", " + playerWidth )
							var widthRatio = _this.widthRatio = playerWidth / 640;
							var heightRatio = _this.heightRatio = playerHeight / 360;

							_this.fullScreen = {
								//top: (loc.top.replace( 'px', '' ) * heightRatio) + "px",
								//left: (loc.left.replace( 'px', '' ) * widthRatio) + "px",
								height: (loc.height.replace( 'px', '' ) * heightRatio) + "px",
								width: (loc.width.replace( 'px', '' ) * widthRatio) + "px"
							};
						}

						//console.info(_this.fullScreen);

						//secondScreen.css( _this.fullScreen );
						var maxWidth = ( ( _this.getPlayer().getWidth() * _this.getConfig( 'resizable' ).maxWidthPercentage ) / 100 );
						//var resizable = $.extend( {}, _this.getConfig( 'resizable' ), {maxWidth: maxWidth} );
						console.info(maxWidth);
						//_this.setConfig( {resizable: resizable} );
						secondScreen.resizable( {maxWidth: maxWidth} );
					}, 1000 );
				} );
				this.bind( 'onCloseFullScreen', function ( e, cuePointObj ) {
					var secondScreen = _this.getSecondMonitor().obj;
						setTimeout( function () {
							var maxWidth = ( ( _this.getPlayer().getWidth() * _this.getConfig( 'resizable' ).maxWidthPercentage ) / 100 );
							//var resizable = $.extend( {}, _this.getConfig( 'resizable' ), {maxWidth: maxWidth} );
							//_this.setConfig( {resizable: resizable} );
							console.info( maxWidth );


							secondScreen.resizable( {maxWidth: maxWidth} );
						}, 1000);
				} );


				this.bind( 'onplay', function () {
					_this.loadAdditionalAssets();
				} );
				this.bind( 'seeked', function () {
					_this.cancelPrefetch();
					_this.loadAdditionalAssets();
				} )
				this.bind( 'KalturaSupport_CuePointReached', function ( e, cuePointObj ) {
					_this.sync( cuePointObj.cuePoint );

				} );

			},

			//Monitor
			getComponent: function () {
				var _this = this;
				if ( !this.$el ) {
					$( "<style type='text/css'> .secondScreen{  height: " +
						_this.getConfig( 'secondScreen' ).size +
						"; width: " +
						_this.getConfig( 'secondScreen' ).size +
						"; z-index: 2;" +
						"} </style>" ).appendTo( "head" );
					this.$el = $( '<div />' )
						.addClass( this.getCssClass() + " secondScreen" );

					this.$el.append(
						$( '<img>' )
							.css( {'height': '100%', 'width': '100%'} )
							.attr( 'src', 'http://localhost/myPages/TEST/lectureCapture/1.jpeg' )
							.attr( 'id', 'mySynchImg' )
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
			toggleMonitorFeatures: function ( monitor ) {
				if ( monitor.draggable( 'option', 'disabled' ) ) {
					monitor.css( this.getSecondMonitor().prop );
					monitor.draggable( 'enable' ).resizable( 'enable' );
				} else {
					this.getFirstMonitor().prop = monitor.css( ['top', 'left', 'width', 'height'] );
					this.getSecondMonitor().prop = monitor.css( ['top', 'left', 'width', 'height'] );
					monitor.draggable( 'disable' ).resizable( 'disable' );
				}

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
				console.info( 'Sync screens' );
				this.loadAdditionalAssets();
				//this.getSecondMonitor().obj.append( $( 'span' ).text( cuePoint.code ) );
				var myImg = this.getComponent().find( '#mySynchImg' );
				var imgId = Math.floor( Math.random() * 6 );
				imgId = (imgId == 0) ? 1 : imgId;
				myImg.attr( 'src', 'http://localhost/myPages/TEST/lectureCapture/' + imgId + '.jpeg' );
			},

			//Control Bar
			getControlBar: function ( type ) {
				var $controlBar = this.controlBar[type].obj;
				if ( !$controlBar ) {
					$controlBar = this.controlBar[type].obj = $( '<div />' )
						.addClass( 'controlBar ' + this.pluginName )
						.attr( {'id': type, 'data-controlBar-rule': type} )
						.css( 'visibility', 'hidden' )
						.append(
						$( '<div class="controlBar-content" /> ' ).append(
							this.getTemplateHTML( {rule: type} )
						)
					);
					this.getPlayer().getVideoHolder().append( $controlBar );
				}
				return $controlBar;
			},
			positionControlBar: function ( type ) {
				this.controlBar[type].obj.position( {
					my: 'left top',
					at: 'left top',
					of: $( '.dualScreenMonitor[data-monitor-rule=' + type + ']' ),
					collision: 'none'
				} );
			},
			setControlBarBindings: function () {
				var _this = this;

				var handled;

				//Set control bar visiblity handlers
				$.each( _this.TYPE, function ( i, type ) {
					handled = handled || {};
					handled[type] = false;

					_this.monitor[type].obj.on( 'mouseover mouseout mousemove touchstart', handleMouseEvent );
					_this.controlBar[type].obj.on( 'mouseover mouseout touchstart', handleMouseEvent );
				} );

				function handleMouseEvent( e ) {
					var monitorRule = this.dataset.monitorRule || this.dataset.controlbarRule;
					if ( e.type == 'mouseout' && !handled[monitorRule] ) {
						_this.hideControlBar( monitorRule );
					} else {
						_this.showControlBar( monitorRule );
						if ( e.type == 'touchstart' && !handled[monitorRule] ) {
							handled[monitorRule] = true;
							setTimeout( function () {
								handled[monitorRule] = false;
								_this.hideControlBar( monitorRule );
							}, 3000 );
						}
					}
				}

				//Attach control bar action handlers
				$.each( _this.TYPE, function ( name, type ) {
					$.each( _this.controlBarComponents, function ( name, component ) {
						_this.controlBar[type].obj.on( 'click', 'li > span#' + component.id, function () {
							var event = null;

							switch ( component.id ) {
								case 'sideBySide':
									event = "SbS";
									break;
								case 'toggleMainView':
									event = "switch";
									break;
								case 'toggleEnabledView':
									event = 'hide';
									break;
							}
							if ( event != null ) {
								_this.fsm.consumeEvent( event, type );
							}
						} );
					} );

					_this.controlBar[type].obj
						.on( 'click', 'li > span#' + _this.controlBarComponents.sideBySide.id, function () {
							if ( _this.fsm.getStatus() != "SV" ) {
								_this.controlBar[_this.TYPE.PRIMARY].obj
									.find( 'span#' + _this.controlBarComponents.sideBySide.id )
									.toggleClass( 'iconmoon-arrow-down-right2 iconmoon-arrow-up-left2' );
							}
						} )
						.on( 'click', 'li > span#' + _this.controlBarComponents.toggleEnabledView.id, function () {
							try {
								_this.controlBar[_this.TYPE.PRIMARY].obj
									.find( 'span#' + _this.controlBarComponents.toggleEnabledView.id )
									.toggleClass( 'iconmoon-eye-blocked iconmoon-gallery' );
								_this.controlBar[_this.TYPE.PRIMARY].obj
									.find( 'span#' + _this.controlBarComponents.sideBySide.id )
									.addClass( 'iconmoon-arrow-down-right2' )
									.removeClass( 'iconmoon-arrow-up-left2' )
									.toggleClass( 'disabled' );
							}catch (e){
								console.error(e);
								debugger;
							}
						} );
				} );
			},
			disableControlBar: function () {
				this.hideControlBar( this.TYPE.PRIMARY );
				this.hideControlBar( this.TYPE.SECONDARY );
				this.monitorControlBarDisabled = true;
			},
			enableControlBar: function () {
				this.monitorControlBarDisabled = false;
			},
			hideControlBar: function ( type ) {
				if ( this.monitorControlBarDisabled ) {
					return;
				}
				if ( this.controlBar[ type ].isVisible ) {
					this.controlBar[ type ].obj.css( 'visibility', 'hidden' );
					this.controlBar[ type ].isVisible = false;
				}
			},
			showControlBar: function ( type ) {
				if ( this.monitorControlBarDisabled ) {
					return;
				}
				if ( !this.controlBar[ type ].isVisible ) {
					this.positionControlBar( type );
					this.controlBar[ type ].obj.css( 'visibility', 'visible' );
					this.controlBar[ type ].isVisible = true;
				}
			},

			//Prefetch
			loadAdditionalAssets: function () {
				var start;
				var end;

				if ( this.cuePoints ) {
					console.info( 'Load additional asset' );
					var currentTime = this.getPlayer().currentTime;
					var nextCuePoint = this.getNextCuePoint( currentTime * 1000 );
					if ( nextCuePoint ) {
						if (!nextCuePoint.loaded) {
							var nextCuePointTime = nextCuePoint.startTime / 1000;
							var prefetch = this.getConfig( 'prefetch' );
							//console.info( this.currentCuePoint + ": " + currentTime + " < " + nextCuePointTime + " ||| " + (nextCuePointTime - currentTime) * (prefetch.durationPercentageUntilNextSequence/100) );
							var delta = nextCuePointTime - currentTime;
							start =  window.performance ? window.performance.now() : new Date();

							var _this = this;

							if ( nextCuePointTime > currentTime && prefetch.minimumSequenceDuration <= delta ) {
								console.debug( "Next cuepoint will arrive in " + delta.toFixed( 2 ) + " sec" );

								var timeOutDuration = delta * (prefetch.durationPercentageUntilNextSequence / 100) * 1000;
								this.prefetchTimeoutId = setTimeout( function () {
										_this.loadNext( nextCuePoint );
										end = window.performance ? window.performance.now() : new Date();
										console.warn( "Prefetch PID " + _this.prefetchTimeoutId + " after..." + ((end - start) / 1000).toFixed( 2 ) );
										_this.prefetchTimeoutId = null;
									}, timeOutDuration
								);
								console.info( "Will prefetch PID " + this.prefetchTimeoutId + " in " + (timeOutDuration / 1000).toFixed( 2 ) + "sec" );
							} else if ( prefetch.minimumSequenceDuration > delta ){
								console.debug( "Next cuepoint is due to arrive in less then minimum sequence duration (" +
									prefetch.minimumSequenceDuration + "sec)");
								console.warn( 'Loading Now!!!!' );
								this.loadNext( nextCuePoint );
							} else {
								console.error('Too late, bail out!!!');
							}
						} else {
							console.info('Asset already loaded, aborting...')
						}
					} else {
						console.info( 'No more cuepoints!' );
					}
				}
			},
			cancelPrefetch: function () {
				if ( typeof( this.prefetchTimeoutId ) == 'number' ) {
					console.error( 'Cancel pending prefetch(' + this.prefetchTimeoutId + ')' );
					window.clearTimeout( this.prefetchTimeoutId );
					this.prefetchTimeoutId = null;
				}
			},
			loadNext: function (nextCuePoint) {
				var imgId = Math.floor( Math.random() * 6 );
				imgId = (imgId == 0) ? 1 : imgId;
				var img = new Image();
				img.onload = function () {
					nextCuePoint.loaded = true;
				}
				img.onerror = function () {
					nextCuePoint.loaded = false;
				}
				img.src = 'http://localhost/myPages/TEST/lectureCapture/' + imgId + '.jpeg';
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
			}
		} )
	);

})( window.mw, window.jQuery );
