( function( mw, $ ) {"use strict";

	mw.PluginManager.add( 'topBarContainer', mw.KBasePlugin.extend({

		defaultConfig: {
			'hover': true
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
			});
			this.bind( 'layoutBuildDone ended', function(){
				_this.show();
			});

			// If have no components, hide
			this.bind('layoutBuildDone', function(){
				if( !_this.getComponent().children().length ){
					_this.destroy();
				}
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
			this.getComponent().addClass( 'open' );
			// Trigger the screen overlay with layout info:
			this.getPlayer().triggerHelper( 'onShowToplBar', {
				'top' : this.getComponent().height() + 15
			});
		},
		hide: function(){
			if( this.keepOnScreen ) return;
			this.getComponent().removeClass( 'open' );
			// Allow interface items to update:
			this.getPlayer().triggerHelper('onHideTopBar', {'top' : 15} );
		},
		getComponent: function(){
			if( !this.$el ) {
				// Add control bar 				
				this.$el = $('<div />')
								.addClass('topBarContainer');

				// Add control bar special classes
				if( this.getConfig('hover') ) {
					this.$el.addClass('hover');
				} else {
					this.$el.addClass('block');
				}
			}
			return this.$el;
		},
		destroy: function(){
			this._super();
			this.getComponent().remove();
		}
	}));

} )( window.mw, window.jQuery );