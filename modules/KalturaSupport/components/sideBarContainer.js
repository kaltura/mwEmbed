( function( mw, $ ) {"use strict";

	mw.PluginManager.add( 'sideBarContainer', mw.KBasePlugin.extend({

		defaultConfig: {
			'hover': true,
			'clickToClose': false,
			'closeTimeout': 1000,
			'position': 'left',
			'fullScreenDisplayOnly': false,
			'minDisplayWidth': 0,
			'minDisplayHeight': 0
		},
		enabled: true,
		render: true,
		screenShown: false,
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
				_this.getComponentReminder().off('click').on('click', function(){
					_this.toggleSideBar();
				});
				if (!_this.getConfig('clickToClose')) {
					_this.getComponent().on( 'mouseleave', function () {
						setTimeout(function(){
							if (_this.getConfig('isSideBarOpen')) {
								_this.closeSideBar();
							}
						}, _this.getConfig("closeTimeout"));
					} );
				}
			});
			this.bind( 'preShowScreen onDisableInterfaceComponents', function( event, excludedComponents ){
				if( event.type == "preShowScreen" || $.inArray( _this.pluginName, excludedComponents ) == -1) {
					_this.enabled = false;
					_this.hide();
				}
			});
			this.bind( 'preHideScreen onEnableInterfaceComponents', function( event, excludedComponents ){
				if( event.type == "preHideScreen" || $.inArray( _this.pluginName, excludedComponents ) == -1) {
					_this.enabled = true;
					_this.show();
				}
			});
			this.bind('updateLayout', function(){
				if (_this.getPlayer().layoutBuilder.isInFullScreen() ||
					(!_this.getConfig("fullScreenDisplayOnly") &&
					_this.getConfig("minDisplayWidth") <= _this.getPlayer().getWidth() &&
					_this.getConfig("minDisplayHeight") <= _this.getPlayer().getHeight())){
					_this.render = true;
					_this.getComponent().css('height', _this.getPlayer().getVideoHolder().height());
					_this.show();
				} else {
					_this.render = false;
					_this.hide();
				}
			});

			// If have no components, hide
			this.bind('layoutBuildDone', function(){
				if( !_this.getComponent().children().length ){
					_this.destroy();
				}
			});
			this.bind( 'layoutBuildDone ended', function(){
				_this.show();
			});

			// Bind hover events
			if( this.getConfig('hover') ){
				// Show / Hide controlbar on hover
				this.bind( 'showPlayerControls', function(e, data){
					_this.show();
				});
				this.bind( 'hidePlayerControls', function(){
					_this.hide();
				});
				this.bind( 'onComponentsHoverDisabled', function(){
					_this.keepOnScreen = true;
					_this.show();
				});
				this.bind( 'onComponentsHoverEnabled preHideScreen', function(){
					_this.keepOnScreen = false;
				});
			}
		},
		show: function(){
			if (this.enabled && this.render) {
				this.getComponentReminder().addClass( 'open' );
				// Trigger the screen overlay with layout info:
				this.getPlayer().triggerHelper( 'onShowSidelBar', {
					'top': this.getComponentReminder().height() + 15
				} );
				if ( this.openAfterDisable ) {
					this.openAfterDisable = false;
					this.getComponentReminder().trigger( "click" );
				}
			}
		},
		hide: function(){
			if( this.enabled && this.render && (this.keepOnScreen || (this.getConfig('clickToClose') && this.getConfig( 'isSideBarOpen')))) return;
			if ( this.getConfig( 'isSideBarOpen' ) ) {
				this.openAfterDisable = true;
			}
			this.setConfig( 'isSideBarOpen', 'false' );
			this.getComponentReminder().removeClass( 'open shifted' );
			this.getComponent().removeClass( 'openBtn' );
			// Allow interface items to update:
			this.getPlayer().triggerHelper('onHideSideBar', {'top' : 15} );
		},
		toggleSideBar: function(){
			if (this.getConfig('isSideBarOpen')) {
				this.closeSideBar();
			} else {
				this.openSideBar();
			}
		},
		openSideBar: function(){
			if (this.render) {
				this.setConfig( 'isSideBarOpen', 'true' );
				this.getComponentReminder().addClass( 'shifted' );
				this.getComponent().addClass( 'openBtn' );
			}
		},
		closeSideBar: function(){
			this.setConfig( 'isSideBarOpen', 'false' );
			this.getComponent().removeClass( 'openBtn' );
			this.getComponentReminder().removeClass( 'shifted' );
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

				this.$elHelper = $('<div>' )
					.addClass( 'sideBarContainerReminder ' + _this.getConfig('position') )
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