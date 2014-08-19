( function( mw, $ ) {"use strict";

	mw.PluginManager.add( 'sideBarContainer', mw.KBasePlugin.extend({

		defaultConfig: {
			'hover': true,
			'clickToClose': false,
			'position': 'left'
		},

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
					if (_this.getConfig('isSideBarOpen')) {
						_this.setConfig( 'isSideBarOpen', 'false' );
						if (_this.getConfig('clickToClose')) {
							_this.getComponentReminder().removeClass( 'shifted' );
							_this.getComponent().removeClass( 'openBtn' );
						}
					} else {
						_this.setConfig( 'isSideBarOpen', 'true' );
						_this.getComponentReminder().addClass( 'shifted' );
						_this.getComponent().addClass( 'openBtn' );
					}
				});
				if (!_this.getConfig('clickToClose')) {
					_this.getComponent().on( 'mouseleave', function () {
						_this.setConfig( 'isSideBarOpen', 'false' );
						_this.getComponent().removeClass( 'openBtn' );
						_this.getComponentReminder().removeClass( 'shifted' );
					} );
				}
			});

			// If have no components, hide
			this.bind('layoutBuildDone', function(){
				if( !_this.getComponent().children().length ){
					_this.destroy();
				}
			});

			this.bind('updateLayout', function(){
				_this.getComponent().css('height', _this.getPlayer().getVideoHolder().height());
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
				this.bind( 'onComponentsHoverEnabled', function(){
					_this.keepOnScreen = false;
				});
			}
		},
		show: function(){
			this.getComponentReminder().addClass( 'open' );
			// Trigger the screen overlay with layout info:
			this.getPlayer().triggerHelper( 'onShowSidelBar', {
				'top' : this.getComponentReminder().height() + 15
			});
		},
		hide: function(){

			if( this.keepOnScreen || (this.getConfig('clickToClose') && this.getConfig( 'isSideBarOpen'))) return;
			this.setConfig( 'isSideBarOpen', 'false' );
			this.getComponentReminder().removeClass( 'open shifted' );
			this.getComponent().removeClass( 'openBtn' );
			// Allow interface items to update:
			this.getPlayer().triggerHelper('onHideSideBar', {'top' : 15} );
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
					.append($('<div>' )
						.addClass( 'TocBtnBorder ' + _this.getConfig('position') ))
					.append($('<div>' )
						.append($('<div>' )
							.addClass( 'icon-list' ))
						.addClass( 'icon-list-container' )
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