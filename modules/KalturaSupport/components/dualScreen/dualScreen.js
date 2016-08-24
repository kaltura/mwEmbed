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
				"mobileTag": null,
				"menuFadeout": 5000,
				"resizeHandlesFadeout": 5000,
				"mainViewDisplay": 0, // DONT USE THIS - obslete... 1 - Main stream, 2 - Presentation
				"defaultDualScreenViewId": 'pip-parent-in-small',
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
			syncEnabled: true,
			viewInitialized: false,
			render: true,
			auxScreenMinimized: false,
			fsmState: [],
			screenShown: false,
			currentScreenNameShown: "",
			externalControlManager : null,

			setup: function ( ) {
                mw.setConfig("preferedBitrate", 50); //ABR - load kplayer video with the lowest fixed bitrate in order to give dual screen full control on ABR (right now supported for HLS kplayer only). Will be ignored in Native player
                mw.setConfig("EmbedPlayer.SpinnerTarget", "videoHolder"); //set SpinnerTarget to videoHolder
				this.initConfig();
				this.initDisplays();
				this.initFSM();
				this.addBindings();
			},
			isSafeEnviornment: function () {
                if ( mw.isIE7() || mw.isIE8() ) {
                    return false;
                }
                var _this = this;
                var mobileTag = this.getConfig('mobileTag');
                var isMobileDevice = mobileTag && mw.isMobileDevice();

                if (mobileTag) {
                    this.getUtils().setConfig({
                        streamSelectorConfig: {
                            ignoreTag: mobileTag
                        }
                    });
                }

                if (isMobileDevice) {
                    var player = this.getPlayer();

                    this.getUtils().filterStreamsByTag(mobileTag)
                        .then(function (streams) {
                            var mobileStream = streams[0];

                            if (mobileStream) {
                                player.sendNotification('changeMedia', {
                                    entryId: mobileStream.id
                                });

                                _this.bind('onChangeMediaDone', function () {
                                    player.pause();
                                }, true);
                            }
                        });

                    return false;
                } else {
                    return this.initSecondPlayer()
                        .then(function () {
                            mw.log('DualScreen - isSafeEnviornment = true');
                            return true;
                        }, function () {
                            mw.log('DualScreen - isSafeEnviornment :: url for second screen not found or not valid');
                            if (_this.isPlaylistPersistent()) {
                                mw.log('DualScreen - isSafeEnviornment :: playList case :: set plugin to disable');
                                // dual screen disabled for non LC entries in channel playlist
                                _this.disabled = true;
                                return true;
                            }

                            return false;
                        });
                }
			},
			isPlaylistPersistent: function(){
				return (this.getPlayer().playerConfig &&
				this.getPlayer().playerConfig.plugins &&
				this.getPlayer().playerConfig.plugins.playlistAPI &&
				this.getPlayer().playerConfig.plugins.playlistAPI.plugin !== false);
			},
			addBindings: function () {
				var _this = this;
                this.bind( 'playerReady', function (  ) {
                    mw.log('DualScreen - playerReady');
                    //block DualScreen for spalyer
                    if ( _this.getPlayer().instanceOf === 'Silverlight' ) {
                        _this.destroy();
                        return;
                    }

                    if( _this.resetSecondPlayer ){
                        mw.log('DualScreen - playerReady :: reset second player');
                        _this.resetSecondPlayer = false;
                        _this.reset();
                    } else {
                        if ( _this.secondPlayer ) {
                            _this.renderDualScreenView();
                        } else {
                            mw.log('DualScreen - playerReady :: wait for second player');
                            _this.waitingCounter = 0;
                            _this.waitForSecondScreen = setInterval(function () {
                                _this.renderDualScreenView();
                            }, 500);
                        }
                    }
				} );

				this.bind( 'postDualScreenTransition', function () {
					//TODO: move to imagePlayer
                    if( _this.secondPlayer ) {
                        _this.secondPlayer.applyIntrinsicAspect();
                    }
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

				//Disable/enable plugin view on screen plugins and ads actions
				this.bind( "AdSupport_StartAdPlayback", function (e, screenName) {
					_this.minimizeView("disabledScreen");
				} );
				this.bind( "AdSupport_EndAdPlayback", function (e, screenName) {
					_this.restoreView("disabledScreen");
				} );
				this.bind( "preShowScreen", function (e, screenName) {
					_this.minimizeView(screenName);
				} );
				this.bind( "preHideScreen", function (e, screenName) {
					_this.restoreView(screenName);
				} );

				this.bind('dualScreenStreamChange', function (e, data) {
					if (!_this.secondPlayer) {
						return;
					}

					var target = data.target;
					var stream = data.stream;
					if (target === 'slave') {
						if (stream.type === 'video') {
							if (_this.secondPlayer instanceof mw.dualScreen.videoPlayer) {
								_this.secondPlayer.changeStream(stream.url, stream.thumbnailUrl);
								_this.secondPlayer.currentStream = stream;
							} else if (_this.secondPlayer instanceof mw.dualScreen.imagePlayer) {
								// TODO: switch image to video
								var newVideoPlayer = new mw.dualScreen.videoPlayer(_this.getPlayer(), function () {
									this.setUrl(stream.url);
									this.setPoster(stream.thumbnailUrl);
									this.currentStream = stream;
								}, 'videoPlayer');
								_this.secondPlayer.getComponent().replaceWith(newVideoPlayer.getComponent());
								_this.destroySecondScreen();
								_this.secondPlayer = newVideoPlayer;
							}
						} else if (stream.type === 'image') {
							_this.loadSecondScreenImage().then(function (imagePlayer) {
								_this.secondPlayer.getComponent().replaceWith(imagePlayer.getComponent());
								_this.destroySecondScreen();
								_this.secondPlayer = imagePlayer;
							});
						}
					} else if (target === 'master') {
						if (stream.type === 'video') {
							_this.getUtils().setStream(stream);
							_this.getPlayer().restoreEventPropagation();
						} else if (stream.type === 'image') {
							_this.fsm.consumeEvent('switchView');
							_this.getPlayer().pause();
							_this.getUtils().setStream(_this.secondPlayer.currentStream);
							_this.getPlayer().restoreEventPropagation();
							_this.loadSecondScreenImage().then(function (imagePlayer) {
								_this.secondPlayer.getComponent().replaceWith(imagePlayer.getComponent());
								_this.destroySecondScreen();
								_this.secondPlayer = imagePlayer;
							});
						}
					}

					_this.controlBar && _this.getSwitchingStreams().then(function (streams) {
						_this.controlBar.setStreams(streams);
					});
				});

				//Consume view state events
				this.bind( 'dualScreenStateChange', function(e, state){
                    _this.fsm.consumeEvent( state );
				});

                this.bind( 'dualScreenDisplaysSwitched sourcesReplaced', function(e){
                    if( e.type === 'sourcesReplaced' ){
					   _this.abrSourcesLoaded = true;
					}
					if( _this.abrSourcesLoaded ) {
						_this.handleABR();
					}
                });

				//Listen to events which affect controls view state
				this.bind( 'showPlayerControls' , function(){
						if ( _this.controlBar && !_this.disabled ) {
							_this.controlBar.show();
						}
				});
				this.bind( 'onplay', function () {
						if ( _this.controlBar && !_this.disabled && !_this.getPlayer().isAudio() ) {
							_this.controlBar.enable();
						}
				} );
				this.bind( 'onpause ended playerReady', function () {
						if ( _this.controlBar && !_this.disabled && !_this.getPlayer().isAudio() ) {
							_this.controlBar.show();
							_this.controlBar.disable();
						}
				} );
				var wasDisabled = false;
				this.bind( 'startDisplayInteraction', function(){
					if( _this.controlBar ) {
                        _this.controlBar.hide();
                        wasDisabled = _this.controlBar.disabled;
                        _this.controlBar.disable();
                        _this.getPlayer().disablePlayControls();
                    }
				});
				this.bind( 'stopDisplayInteraction', function() {
					//Only enable and show if controlBar was enabled before transition
					if ( _this.controlBar && !wasDisabled ) {
                            _this.controlBar.enable();
                            _this.controlBar.show();
					}
					_this.getPlayer().enablePlayControls();
				});

				this.bind("onChangeMedia", function(){
                    this.log('onChangeMedia');
                    if ( _this.syncEnabled && !_this.disabled){
						//Reset the displays view
						if (_this.fsm.getStatus() !== "PiP") {
							_this.fsm.consumeEvent('PiP');
						}
						if (!_this.displays.getPrimary().isMain){
							_this.fsm.consumeEvent('switchView');
						}

						_this.destroyExternalControlManager();

						//Reset the control bar
						_this.destroyControlBar();
					}
                    //channel play list
                    if( _this.isPlaylistPersistent() ) {
                        mw.log('DualScreen - onChangeMedia :: play list case - reset flag on');
                        _this.secondScreen = null;
						_this.abrSourcesLoaded = false;
                        _this.resetSecondPlayer = true;
                        _this.cuePoints = null;
                        _this.streamUtils = null;

                    }
				});
				this.bind("onChangeStream", function(){
					_this.syncEnabled = false;
				});
				this.bind("onChangeStreamDone", function(){
					_this.syncEnabled = true;
				});

				if (this.getConfig('enableKeyboardShortcuts')) {
					this.bind('addKeyBindCallback', function (e, addKeyCallback) {
						_this.addKeyboardShortcuts(addKeyCallback);
					});
				}
			},

            reset: function ( ) {
                var _this = this;
                this.initSecondPlayer().then(function(){
                    mw.log('DualScreen - reset :: second screen loaded');
                    _this.renderDualScreenView();
                }, function () { //url for second screen not found or not valid
                    mw.log('DualScreen - reset :: url for second screen not found or not valid');
                    _this.disabled = true; //dual screen disabled for non LC entries in channel playlist
                });
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
            renderDualScreenView: function(){
                if( this.secondPlayer ) {
                    mw.log("DualScreen :: renderDualScreenView init");
                    clearInterval(this.waitForSecondScreen);
                    this.waitForSecondScreen = null;

                    if (this.syncEnabled) {
                        var _this = this;
                        this.initView();
                        this.initControlBar();
                        this.initExternalControlManager();

                        if (_this.secondPlayer.canRender()) {
                            _this.log("render condition are met - initializing");
                            _this.checkRenderConditions();
                            if (_this.disabled){
                                _this.disabled = false;
                                _this.restoreView("disabledScreen");
                            }
                            _this.setInitialView();
                            if (!_this.render) {
                                _this.getPrimary().obj.css({
                                    'top': '',
                                    'left': '',
                                    'width': '',
                                    'height': ''
                                }).removeClass('firstScreen');
                                _this.hideDisplay();
                            }
                        } else {
                            _this.log("render condition are not met - disabling");
                            if (!_this.disabled){
                                _this.minimizeView("disabledScreen");
                                _this.disabled = true;
                            }
                        }
                    }
                } else {
                    if ( this.waitingCounter < 5 ) {
                        this.waitingCounter++;
                    } else {
                        mw.log("DualScreen :: clear waitForSecondScreen timer - no second screen");
                        clearInterval(this.waitForSecondScreen);
                        this.waitForSecondScreen = null;
                    }
                }
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

					if ( _this.controlBar && !_this.disabled ) {
						_this.controlBar.hide();
					}
					_this.bind("displayTransitionEnded", function ( ) {
						if ( transitionHandlerSet ) {
							transitionHandlerSet = false;
							if ( _this.controlBar && !_this.disabled && !_this.getPlayer().isAudio() ) {
								_this.controlBar.show();
							}
							_this.displays.disableTransitions();
							_this.getPlayer().triggerHelper('postDualScreenTransition', [[transitionFrom, transitionTo]]);
						}
					});
					_this.displays.enableTransitions();
				};

				var selectedStatesMap = mw.isNativeApp() ? mw.dualScreen.nativeAppStates : mw.dualScreen.states;

				this.fsm = new mw.dualScreen.StateMachine( selectedStatesMap, this.displays, fsmTransitionHandlers );
			},
			initExternalControlManager : function()
			{
				this.log("initExternalControlManager(): creating new instance of external control manager");
				var _this = this;
                this.externalControlManager = new mw.dualScreen.externalControlManager(this.getPlayer(), function () {
                }, "dualScreenExternalControlManager");
			},
			destroyExternalControlManager : function()
			{
				if (this.externalControlManager) {
					mw.log("dualScreen.destroyExternalControlManager(): removing existing instance of external control manager");
					this.externalControlManager.destroy();
					this.externalControlManager = null;
				}
			},
			initDisplays: function () {
				var _this = this;
				this.displays = new mw.dualScreen.displays(this.getPlayer(), function () {
					this.setConfig({
						resizeHandlesFadeout: _this.getConfig( 'resizeHandlesFadeout' ),
						resizable: _this.getConfig( 'resizable' ),
						draggable: _this.getConfig( 'draggable' )
					});
					this.initDisplays();
                }, "dualScreenDisplays");
			},
			initControlBar: function(){
				if ( !this.controlBar && !this.getPlayer().isAudio()) {
                    var _this = this;
                    this.loadControlBar();
                    this.getSwitchingStreams().then(function (streams) {
                        _this.controlBar.setStreams(streams);
                    });
				}
			},
			getSwitchingStreams: function () {
				var _this = this;

				return this.getUtils().getPlayableStreamsForSecondPlayer(this.secondPlayer).then(function (streams) {
					if (!(_this.secondPlayer instanceof mw.dualScreen.imagePlayer) && _this.hasSlides()) {
						streams.push({
							type: 'image',
							thumbnailUrl: 'https://placeholdit.imgix.net/~text?txtsize=64&txt=ATTACHED%20SLIDES&w=320&h=180'
						});
					}

					return streams;
				});
			},
            loadControlBar: function () {
                var _this = this;
                this.controlBar = new mw.dualScreen.dualScreenControlBar(_this.getPlayer(), function(){
                    this.setConfig('menuFadeout', _this.getConfig('menuFadeout'));
                }, 'dualScreenControlBar');
                if (this.getPlayer().isAudio()) {
                    this.controlBar.hide();
                    this.controlBar.disable();
                }
                this.embedPlayer.getInterface().append( this.controlBar.getComponent() );
            },
			initView: function(){
				var _this = this;
				if (!this.viewInitialized) {
					this.viewInitialized = true;
					this.previousPlayerWidth = this.getPlayer().getWidth();
					this.previousPlayerHeight = this.getPlayer().getHeight();

					//Get display containers, primary is the original video display, containing the video element,
					//Secondary is the dual screen, so need to populate it with the second player component
					var primaryPlayerContainer = this.getPlayer().getVideoDisplay();
					var secondaryPlayerContainer = this.getComponent();
                    if(this.secondPlayer) {
                        secondaryPlayerContainer.append(this.secondPlayer.getComponent());
                    }

					//Attach the primaryPlayerContainer to the primary display
					var primaryDisplay = this.displays.getPrimary();
					primaryDisplay.attachView(primaryPlayerContainer);

					//Attach the secondaryDisplay to the second display
					var secondaryDisplay = this.displays.getSecondary();
					secondaryDisplay.attachView(secondaryPlayerContainer);

					//Proxy pointer events from the second screen to the embedPlayer layer
					var pointerEvents = "click dblclick touchstart touchend";
					secondaryPlayerContainer
				        .off(pointerEvents)
				        .on( pointerEvents, function ( e ) {
							//Verify that second screen is not in the middle of user interaction before delegating events
							if(!_this.displays.getSecondary().isUserInteracting()){
								_this.embedPlayer.triggerHelper( e );
							}
						} );

					//Enable user actions on the secondary/Aux screen
					primaryDisplay.disableUserActions();
					secondaryDisplay.enableUserActions();

					//Set initial position of the secondary/Aux screen
					this.positionSecondDisplay();
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
			},
			setInitialView: function(){
				var _this = this;
				var showLoadingSlide = function () {
					if ( !_this.secondDisplayReady && _this.render && mw.getConfig( "EmbedPlayer.LiveCuepoints" ) ) {
						//TODO: add information slide for no current slide available
					}
				};

				if ( this.getConfig( "defaultDualScreenViewId" ) !== 'parent-only' && !mw.isNativeApp() ||
					this.getPlayer().isAudio()) {
					this.bind( 'postDualScreenTransition.spinnerPostFix', function () {
						_this.unbind( 'postDualScreenTransition.spinnerPostFix' );
						showLoadingSlide();
					} );
				} else {
					showLoadingSlide();
				}

				var defaultDualScreenViewId = '';
				var backwardCompatibilityView = this.getConfig('mainViewDisplay');

				switch (backwardCompatibilityView)
				{
					case 1:
						defaultDualScreenViewId = 'pip-parent-in-large';
						break;
					case 2:
						defaultDualScreenViewId = 'pip-parent-in-small';
						break;
					default:
						defaultDualScreenViewId = this.getConfig('defaultDualScreenViewId');
						break;
				}

				if (_this.getPlayer().isAudio()){
					defaultDualScreenViewId = 'no-parent';
				}

				// the following code is warpped with timeout to make sure it happens in a separated event loop cycle.
				// otherwise autoplay might not work.
				setTimeout( function () {

					if ( _this.externalControlManager ) {

						if (defaultDualScreenViewId)
						{
							_this.externalControlManager.setViewById(defaultDualScreenViewId);
						}

						_this.externalControlManager.start();
					}

				}, 1000 );
			},

			//Manage display helpers
			disableView: function(){
				this.displays.getAuxDisplay().obj.css("visibility", "hidden");
                if(this.controlBar) {
                    this.controlBar.hide();
                    this.controlBar.disable();
                }
			},
			enableView: function(){
				this.displays.getMainDisplay().obj.css("visibility", "");
				this.displays.getAuxDisplay().obj.css("visibility", "");
				if (this.controlBar && !this.getPlayer().isAudio()) {
					this.controlBar.enable();
					this.controlBar.show();
				}
			},
			minimizeView: function(screenName){
				this.screenShown = true;
				if (this.render) {
					this.currentScreenNameShown = screenName;
					if (!this.disabled && !this.getPlayer().isAudio()) {
						this.controlBar.enable();
						this.controlBar.hide();
						this.controlBar.disable();
					}
                    if ( screenName === 'disabledScreen' ) {
                        this.minimizeSecondDisplay();
                    }
				}
			},
			restoreView: function(screenName){
				this.screenShown = false;
				if (!this.disabled && this.render && this.currentScreenNameShown === screenName) {
					this.currentScreenNameShown = "";
					this.maximizeSecondDisplay();
					//Use setTimeout to verify that screens are hidden and not that this is a part of
					// screens transition --> when going from one screen to another we first emit preHideScreen and
					//only then preShowScreen
					var _this = this;
					setTimeout(function(){
						if ( _this.controlBar && !_this.screenShown && !_this.disabled && !_this.getPlayer().isAudio() ) {
							_this.controlBar.enable();
							_this.controlBar.show();
						}
					}, 100);
				}
			},
			minimizeSecondDisplay: function(){
			    if (!this.auxScreenMinimized) {
					this.auxScreenMinimized = true;
				    var primaryIsMain = (this.displays.getPrimary() === this.displays.getMainDisplay());
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
					this.displays.getPrimary().obj.css( {'top': '', 'left': '', 'width': '', 'height': ''} ).removeClass( 'firstScreen' );
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
					this.displays.getPrimary().obj.addClass( 'firstScreen' );
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
				this.log("request update screen layout");
				var eventName = mw.isAndroid() ? 'resize' : 'orientationchange';
				if (this.viewInitialized &&
					!(
					this.displays.getAuxDisplay().isUserInteracting() ||
					this.screenShown ||
					( eventName === event.type && !this.getPlayer().layoutBuilder.isInFullScreen() )
					)
				){
					this.log("request update screen layout - pass update conditions");
					this.checkRenderConditions();
					//Hide display and control bar during resizing
					this.disableView();
					//Avoid debouncing of screen resize timeout handler
					if ( this.updateSecondScreenLayoutTimeout ) {
						clearTimeout( this.updateSecondScreenLayoutTimeout );
						this.updateSecondScreenLayoutTimeout = null;
					}
					this.updateSecondScreenLayoutTimeout = setTimeout( function () {
						if (_this.disabled) {
							_this.log("request update screen layout - got status 'disabled' while trying to update");
							_this.displays.getPrimary().obj.css("visibility", "");
							_this.minimizeSecondDisplay();
						} else {
							_this.updateSecondScreenLayoutTimeout = null;
							//Calculate new screen ratios
							var secondScreenProps = _this.displays.getAuxDisplay().getProperties();
							var playerWidth = _this.getPlayer().getWidth();
							var playerHeight = _this.getPlayer().getHeight();
							var widthRatio = (playerWidth / _this.previousPlayerWidth);
							var heightRatio = (playerHeight / _this.previousPlayerHeight);
							//Save current dimensions for next differential calculation
							_this.previousPlayerWidth = playerWidth;
							_this.previousPlayerHeight = playerHeight;

							//Calculate and apply new screen properties
							var screenWidth = secondScreenProps.width.replace('px', '');
							var screenWidthHeightRatio = _this.getConfig('secondScreen').widthHeightRatio;
							var screenTop = secondScreenProps.top.replace('px', '');
							var screenLeft = secondScreenProps.left.replace('px', '');
							var newWidth = _this.roundPrecisionFloat((screenWidth * widthRatio), -2);
							var newHeight = _this.roundPrecisionFloat(screenWidthHeightRatio * newWidth, -2);
							var topOffset = _this.roundPrecisionFloat((screenTop * heightRatio), -2);
							var leftOffset = _this.roundPrecisionFloat((screenLeft * widthRatio), -2);
							var screenProps = {
								height: newHeight + "px",
								width: newWidth + "px",
								top: topOffset + "px",
								left: leftOffset + "px"
							};
							if (newHeight + topOffset > playerHeight) {
								screenProps.top = (playerHeight - newHeight) + "px";
							}
							if (newWidth + leftOffset > playerWidth) {
								screenProps.left = (playerWidth - newWidth) + "px";
							}

							var secondScreen = _this.displays.getAuxDisplay();
							secondScreen.repaint(screenProps);
							//TODO: move to image player
							_this.secondPlayer.applyIntrinsicAspect();
							if (!_this.disabled && _this.render) {
								//Show display and control bar after resizing
								_this.enableView();
								_this.maximizeSecondDisplay();
							} else {
								_this.displays.getPrimary().obj.css("visibility", "");
								_this.minimizeSecondDisplay();
							}

							//Calculate screen resize max width
							var maxWidth = ( ( playerWidth * _this.getConfig('resizable').maxWidthPercentage ) / 100 );
							var minWidth = ( ( playerWidth * _this.getConfig('secondScreen').sizeRatio ) / 100 );

							secondScreen.setResizeLimits({
								maxWidth: maxWidth,
								minWidth: minWidth
							});
						}
					}, 0 );
				} else {
					_this.log("request update screen layout - didn't pass update conditions");
				}
			},
			checkRenderConditions: function(){
				this.render = (
					!this.displays.getAuxDisplay().isUserInteracting() &&
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
			roundPrecisionFloat: function(value, exp){
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

			//player controllers
			initSecondPlayer: function(){
                var _this = this;

                //load second screen as imagePlayer
                return this.loadSecondScreenImage()
                    .then(null, function () {
                        // unable to load image player
                        // load second screen as video player
                        _this.destroySecondScreen();
                        return _this.loadSecondScreenVideo();
                    })
                    .then(function (res) {
                        return (_this.secondPlayer = res);
                    }, function () {
                        mw.log('ERROR loading second screen video');
                        return $.Deferred().reject();
                    });
			},

            loadSecondScreenImage: function(){
                // check if entry has cue-points (PPT presentation has been recorded)
                var hasCuePoints = this.hasSlides();
                var passthroughConfig = {
                    prefetch: this.getConfig('prefetch'),
                    cuePointType: this.getConfig('cuePointType')
                };

                var imagePlayer = hasCuePoints && new mw.dualScreen.imagePlayer(this.getPlayer(), function () {
                    this.setConfig(passthroughConfig);
                }, "imagePlayer");

                return $.when(hasCuePoints ? imagePlayer : $.Deferred().reject());
            },

            destroyControlBar: function ( ) {
                if ( this.controlBar ) {
                    this.controlBar.destroy();
                    this.controlBar = null;
                }
            },

            destroySecondScreen: function ( ) {
              if ( this.secondPlayer ) {
                  this.secondPlayer.destroy();
                  this.secondPlayer = null;
              }
            },

            destroy: function ( ) {
                this.destroySecondScreen();
                this.getUtils().destroy();
                this.destroyControlBar();
                this.getComponent().remove();
            },

            loadSecondScreenVideo: function(){
                var player = this.getPlayer();
                return this.getUtils().getPlayableStreamsForSecondPlayer(this.secondPlayer)
                    .then(function (playableStreams) {
                        return playableStreams.length ? new mw.dualScreen.videoPlayer(player, function () {
                            var stream = playableStreams[0];
                            this.setUrl(stream.url);
                            this.setPoster(stream.thumbnailUrl);
                            this.currentStream = stream;
                        }, 'videoPlayer') : $.Deferred().reject();
                    });
            },

            handleABR: function ( ) {
                if ( this.getPlayer().getVideoDisplay().attr('data-display-rule') === 'primary' ) {
                    mw.log("DualScreen :: handleABR :: set kplayer to ABR AUTO and secondPlayer to lowest bitrate");
                    this.getPlayer().mediaElement.autoSelectSource();
                    // this.getPlayer().switchSrc(-1);
					if( this.secondPlayer instanceof mw.dualScreen.videoPlayer && this.secondPlayer.isABR() ) {
						this.secondPlayer.switchSrc(0);
					}
                } else {
                    mw.log("DualScreen :: handleABR :: set secondPlayer to ABR AUTO and kplayer to lowest bitrate");
                    this.getPlayer().switchSrc(this.getPlayer().getSources()[0]);
                    // this.getPlayer().switchSrc(0);
					if( this.secondPlayer instanceof mw.dualScreen.videoPlayer && this.secondPlayer.isABR() ) {
						this.secondPlayer.switchSrc(-1);
					}
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
			positionSecondDisplay: function(){
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
				this.displays.getAuxDisplay().position({
					my: this.getConfig( 'secondScreen' ).startLocation.toLowerCase(),
					at: location[0]+location[1],
					of: $( this.getPlayer().getInterface() )
				});

                //take care of flash obj (seek through hidden flash player will be very slow, so we need to bring at least several pixels inside the visible area of the player frame)
                if ( this.getPlayer().instanceOf === 'Kplayer' ) {
                    this.displays.setFlashMode(true);
                }
			},

			// service methods
			getCuePoints: function () {
				if (!this.cuePoints) {
					var cuePoints = [];
					var kCuePoints = this.getPlayer().kCuePoints;

					if (kCuePoints) {
						$.each(this.getConfig('cuePointType'), function (i, cuePointType) {
							$.each(cuePointType.sub, function (j, cuePointSubType) {
								var filteredCuePoints = kCuePoints.getCuePointsByType(cuePointType.main, cuePointSubType);
								cuePoints = cuePoints.concat(filteredCuePoints);
							});
						});
					}

					cuePoints.sort(function (a, b) {
						return a.startTime - b.startTime;
					});

					this.cuePoints = cuePoints;
				}

				return this.cuePoints;
			},
			hasSlides: function () {
				var player = this.getPlayer();
				return (player.isLive() && mw.getConfig('EmbedPlayer.LiveCuepoints')) ||
					this.getCuePoints().length;
			},
			getUtils: function () {
				return this.streamUtils ||
					(this.streamUtils =
						new mw.dualScreen.StreamUtils(this.getPlayer(), $.noop, 'dualScreenStreamUtils'));
			}
		} )
	);
}

)( window.mw, window.jQuery );
