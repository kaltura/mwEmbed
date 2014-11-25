( function( mw, $ ) {"use strict";

	mw.PluginManager.add( 'sideBarContainer', mw.KBasePlugin.extend({

		defaultConfig: {
			'hover': true,
			'clickToClose': false,
			'position': 'left'
			'closeTimeout': 1000,
			'position': 'left',
			'fullScreenDisplayOnly': false,
			'minDisplayWidth': 0,
			'minDisplayHeight': 0
		},
		enabled: true,
		keepOnScreen: false,

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

			// If have no components, hide
			this.bind('layoutBuildDone', function(){
				if( !_this.getComponent().children().length ){
					_this.destroy();
				}
			});

			this.bind( 'layoutBuildDone ended', function(){
				_this.show();
			});

			this.bind('updateLayout', function(){
				_this.getComponent().css('height', _this.getPlayer().getVideoHolder().height());
			});

			this.bind("disableSideBar", function(){
				_this.enabled = false;
				_this.hide();
			});
			this.bind("enableSideBar", function(){
				_this.enabled = true;
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
			if (this.enabled) {
				this.getComponentReminder().addClass( 'open' );
				// Trigger the screen overlay with layout info:
				this.getPlayer().triggerHelper( 'onShowSidelBar', {
					'top': this.getComponentReminder().height() + 15
				} );
			}
		},
		hide: function(){
			if( this.enabled && (this.keepOnScreen || (this.getConfig('clickToClose') && this.getConfig( 'isSideBarOpen')))) return;
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