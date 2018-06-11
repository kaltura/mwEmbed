( function( mw, $ ) {"use strict";

	mw.PluginManager.add( 'sideBarContainer', mw.KBasePlugin.extend({

		defaultConfig: {
			'hover': true,
			'clickToClose': false,
			'closeTimeout': 2000,
			'position': 'left',
			'fullScreenDisplayOnly': false,
			'minDisplayWidth': 0,
			'minDisplayHeight': 0,
			'toggleBtnLabel': null,
			enableKeyboardShortcuts: true,
			"keyboardShortcutsMap": {
				"open": "ctrl+79",   // Add ctrl+o Sign for next stream
				"close": "ctrl+alt+79"   // Add ctrl+alt+o Sigh for previous stream
			}
		},
		enabled: true,
		render: true,
		currentScreenNameShown: "",
		keepOnScreen: false,
		openAfterDisable: false,

		setup: function(){
			// Bind player
			this.addBindings();
		},
		addBindings: function(){
			var _this = this;
			// Register our container
			this.bind( 'addLayoutContainer', function() {
				_this.getPlayer().getVideoHolder().before( _this.getComponent() );
				_this.getComponent().after(_this.$elHelper);
			});
			this.bind( 'layoutBuildDone ended', function(){
				var disableClosingTimeout = function(){
					if (_this.closeBarTimeout){
						clearTimeout(_this.closeBarTimeout);
						_this.closeBarTimeout = null;
					}
				};
				_this.getComponentReminder().off('click touchstart').on('click touchstart', function(e){
					e.stopPropagation();
					e.preventDefault();
					disableClosingTimeout();
					_this.toggleSideBar();
					return false;
				}).on('keydown', _this.keyDownHandler);
				if (!_this.getConfig('clickToClose')) {
					_this.getComponent()
						.on( 'mouseleave', function () {
							disableClosingTimeout();
							_this.closeBarTimeout = setTimeout(function(){
								_this.closeBarTimeout = null;
								if (_this.getConfig('isSideBarOpen')) {
									_this.close();
								}
							}, _this.getConfig("closeTimeout"));
						} )
						.on('mouseenter', function () {
							disableClosingTimeout();
						});
				}
			});
			this.bind( 'onDisableInterfaceComponents', function( event, excludedComponents ){
				if( $.inArray( _this.pluginName, excludedComponents ) == -1) {
					_this.enabled = false;
					_this.hideReminder();
				}
			});
			this.bind( 'onEnableInterfaceComponents', function( event, excludedComponents ){
				if( $.inArray( _this.pluginName, excludedComponents ) == -1) {
					_this.enabled = true;
					_this.showReminder();
				}
			});
			this.bind( 'preShowScreen', function( event, screenName ){
				_this.currentScreenNameShown = screenName;
				_this.enabled = false;
				_this.hideReminder();
			});
			this.bind( 'preHideScreen', function( event, screenName ){
				if (_this.currentScreenNameShown === screenName) {
					_this.currentScreenNameShown = "";
					_this.enabled = true;
					_this.showReminder();
				}
			});
			this.bind('updateLayout', function(){
				if (_this.getPlayer().layoutBuilder.isInFullScreen() ||
					(!_this.getConfig("fullScreenDisplayOnly") &&
					_this.getConfig("minDisplayWidth") <= _this.getPlayer().getWidth() &&
					_this.getConfig("minDisplayHeight") <= _this.getPlayer().getHeight())){
					_this.render = true;
					//Sidebar height is player height without the top and bottom bars
					_this.setHeight();
					_this.showReminder();
				} else {
					_this.render = false;
					_this.hideReminder();
				}
			});

			// If have no components, hide
			this.bind('layoutBuildDone', function(){
				if( !_this.getComponent().children().length ){
					_this.getComponent().hide();
					_this.getComponentReminder().hide();
				}
			});
			this.bind('onChangeMedia', function(){
				_this.close();
			});
			this.bind('closeSideBarContainer', function(){
				_this.close();
			});
			this.bind('openSideBarContainer', function(){
				_this.open();
			});
			this.bind('onChangeMediaDone layoutChange', function(){
				var children = _this.getComponent().children();
				if( children.length && (children.filter('*[data-visibility="visible"]').length > 0 )) {
					_this.getComponent().show();
					_this.getComponentReminder().show();
				} else {
					_this.getComponent().hide();
					_this.getComponentReminder().hide();
				}
			});

			this.bind( 'layoutBuildDone ended', function(){
				_this.setHeight();
				_this.showReminder();
			});

			// Bind hover events
			if( this.getConfig('hover') ){
				// Show / Hide controlbar on hover
				this.bind( 'showPlayerControls', function(e, data){
					_this.showReminder();
				});
				this.bind( 'hidePlayerControls', function(){
					_this.hideReminder();
				});
				this.bind( 'onComponentsHoverDisabled', function(){
					_this.keepOnScreen = true;
					_this.showReminder();
				});
				this.bind( 'onComponentsHoverEnabled preHideScreen', function(){
					_this.keepOnScreen = false;
				});
			}

			//key bindings
			if (this.getConfig('enableKeyboardShortcuts')) {
				this.bind('addKeyBindCallback', function (e, addKeyCallback) {
					_this.addKeyboardShortcuts(addKeyCallback);
				});
			}
		},
		addKeyboardShortcuts: function (addKeyCallback) {
			var _this = this;
			// Add ctrl+O for open side bar
			addKeyCallback(this.getConfig("keyboardShortcutsMap").open, function () {
				_this.open();
			});
			// Add ctrl+Alt+O for close side bar
			addKeyCallback(this.getConfig("keyboardShortcutsMap").close, function () {
				_this.close();
			});
		},
		keyDownHandler: function(ev){
			if(ev.which === 13 || ev.which === 32)
			{
				$(ev.target).click();
			}
		},
		showReminder: function(){
			if (this.enabled && this.render) {
				this.getComponentReminder().addClass( 'open' );
				if ( this.openAfterDisable ) {
					this.openAfterDisable = false;
					this.getComponentReminder().trigger( "click" );
				}
			}
		},
		hideReminder: function(){
			if( this.enabled && this.render && (this.keepOnScreen || (this.getConfig('clickToClose') && this.getConfig( 'isSideBarOpen')))) return;
			if ( this.getConfig( 'isSideBarOpen' ) ) {
				this.openAfterDisable = true;
			}
			this.setConfig( 'isSideBarOpen', 'false' );
			this.getComponentReminder().removeClass( 'open shifted' );
			this.getComponent().removeClass( 'openBtn' );
		},
		toggleSideBar: function(){
			if (this.getConfig('isSideBarOpen')) {
				this.close();
			} else {
				this.open();
			}
		},
		open: function(){
			if (this.render) {
				this.setConfig( 'isSideBarOpen', 'true' );
				this.getComponentReminder().addClass( 'shifted' );
				this.getComponent().addClass( 'openBtn' );
				// Trigger the screen overlay with layout info:
				this.getPlayer().triggerHelper( 'onShowSideBar');
				this.getPlayer().triggerHelper('clearTooltip');
				this.getPlayer().triggerHelper( 'onComponentsHoverDisabled');
			}
		},
		close: function(){
			this.setConfig( 'isSideBarOpen', 'false' );
			this.getComponent().removeClass( 'openBtn' );
			this.getComponentReminder().removeClass( 'shifted' );
			// Allow interface items to update:
			this.getPlayer().triggerHelper('onHideSideBar');
			this.getPlayer().triggerHelper('clearTooltip');
			this.getPlayer().triggerHelper( 'onComponentsHoverEnabled');
		},
		setHeight: function(){
			var height = this.getPlayer().getHeight() - this.getPlayer().getControlBarContainer().height();
			var noControls = this.getPlayer().isMobileSkin() ? 2 : 0;
			if (this.getPlayer().getTopBarContainer().length && this.getPlayer().getTopBarContainer().children().length !== noControls) {
				height -= this.getPlayer().getTopBarContainer().height();
				//If topbar exist then add top value
				this.getComponent().css('top', this.getPlayer().getTopBarContainer().height());
				this.getComponentReminder().css('top', this.getPlayer().getTopBarContainer().height());
			} else {
				this.getComponent().css('top', 0);
				this.getComponentReminder().css('top', 0);
			}
			this.getComponent().css('height', height);
		},
		getComponent: function(){
			if( !this.$el ) {
				this.getComponentReminder();
				var _this = this;
				// Add control bar
				this.$el = $('<div />')
					.addClass('sideBarContainer ' + _this.getConfig('position'));

				// Add control bar special classes
				if( this.getConfig('hover') ) {
					this.$el.addClass('hover');
				} else {
					this.$el.addClass('block');
				}
			}
			return this.$el;
		},
		getComponentReminder: function(){
			if( !this.$elHelper ) {
				var _this = this;
				// Add control bar

				var title = this.getConfig("toggleBtnLabel") || gM("ks-sidebar-toggleBtn");

				this.$elHelper = $('<a>' )
					.addClass( 'sideBarContainerReminder tooltipBelow ' + _this.getConfig('position') )
					.prop("title", title)
					.attr({"data-show-tooltip":true, "tabindex":7,"href":"#","aria-label":"show slides"})
					.append($('<div id="sideBarContainerReminderContainer">' )
						.addClass( 'icon-chapterMenu' )
					);

				// Add control bar special classes
				if( this.getConfig('hover') ) {
					this.$elHelper.addClass('hover');
				} else {
					this.$elHelper.addClass('block');
				}
			}
			return this.$elHelper;
		},
		destroy: function(){
			this._super();
			this.getComponent().remove();
			this.getComponentReminder().remove();
		}
	}));

} )( window.mw, window.jQuery );