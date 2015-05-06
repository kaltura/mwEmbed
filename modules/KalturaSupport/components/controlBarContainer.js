( function( mw, $ ) {"use strict";

	mw.PluginManager.add( 'controlBarContainer', mw.KBasePlugin.extend({

		defaultConfig: {
			'hover': false
		},

		keepOnScreen: false,

		setup: function(){
			// Exit if we're using native controls
			if( this.getPlayer().useNativePlayerControls() ) {
				this.getPlayer().enableNativeControls();
				return;
			}
			// Set overlay controls to configuration
			this.getPlayer().overlaycontrols = this.getConfig('hover');

			// Bind player
			this.addBindings();
		},
		addBindings: function(){
			var _this = this;
			// Register our container
			this.bind( 'addLayoutContainer', function() {
				_this.getPlayer().getInterface().append( _this.getComponent() );
			});
			this.bind( 'showInlineDownloadLink', function(){
				_this.hide();
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
				this.bind( 'onComponentsHoverEnabled', function(){
					_this.keepOnScreen = false;
					_this.hide();
				});
				this.bind( 'onHideSideBar', function(){
					_this.forceOnScreen = false;
				});
				this.bind( 'onShowSideBar', function(){
					_this.forceOnScreen = true;
				});
			} else {
				this.getPlayer().isControlsVisible = true;
			}
		},
		show: function(){
			this.getPlayer().isControlsVisible = true;
			this.getComponent().addClass( 'open' );
			// Trigger the screen overlay with layout info:
			this.getPlayer().triggerHelper( 'onShowControlBar', {
				'bottom' : this.getComponent().height() + 15
			} );
			var $interface = this.embedPlayer.getInterface();
			$interface.removeClass( 'player-out' );
		},
		hide: function(){
			if( this.keepOnScreen || this.forceOnScreen) return;
			this.getPlayer().isControlsVisible = false;
			this.getComponent().removeClass( 'open' );
			var $interface = this.embedPlayer.getInterface();
			$interface.addClass( 'player-out' );
			// Allow interface items to update:
			this.getPlayer().triggerHelper('onHideControlBar', {'bottom' : 15} );

		},
		getComponent: function(){
			if( !this.$el ) {
				var $controlsContainer = $('<div />').addClass('controlsContainer');
				// Add control bar 				
				this.$el = $('<div />')
								.addClass('controlBarContainer')
								.append( $controlsContainer );

				// Add control bar special classes
				if( this.getConfig('hover') && this.getPlayer().isOverlayControls() ) {
					this.$el.addClass('hover');
					this.embedPlayer.getVideoHolder().addClass('hover');
				} else {
					this.$el.addClass('block');
				}
			}
			return this.$el;
		}
	}));

} )( window.mw, window.jQuery );