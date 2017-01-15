( function( mw, $ ) {"use strict";

	mw.PluginManager.add( 'controlBarContainer', mw.KBasePlugin.extend({

		defaultConfig: {
			'hover': false
		},

		keepOnScreen: false,
		screenOpen: false,

		setup: function(){
			if (this.embedPlayer.isMobileSkin()){
				this.setConfig("hover", true);
			}
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
			this.bind( 'ended', function(){
				_this.show();
			});
			this.bind( 'layoutBuildDone', function(){
				if (!_this.embedPlayer.isMobileSkin()){
					_this.show();
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
					if (!_this.embedPlayer.layoutBuilder.displayOptionsMenuFlag){
						_this.keepOnScreen = true;
						_this.show();
					}
				});
				this.bind( 'hideScreen closeMenuOverlay', function(){
					_this.screenOpen = false;
					if (!_this.embedPlayer.paused){
						_this.keepOnScreen = false;
						_this.hide();
					}else{
						_this.show();
					}
				});
				this.bind( 'onComponentsHoverEnabled displayMenuOverlay', function(){
					_this.keepOnScreen = false;
					_this.hide();
				});
				this.bind( 'showScreen', function(){
					_this.screenOpen = true;
					_this.keepOnScreen = false;
					_this.forceOnScreen = false;
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
		onConfigChange: function( property, value ){
			switch( property ) {
				case 'visible':
					if( value ) {
						this.getComponent().show();
					} else {
						this.getComponent().hide();
					}
					break;
			}
		},
		show: function(){
			this.getPlayer().isControlsVisible = true;
			if ( !this.screenOpen ) {
				this.getComponent().addClass('open');
				// Trigger the screen overlay with layout info:
				this.getPlayer().triggerHelper('onShowControlBar', {
					'bottom': this.getComponent().height() + 15
				});
			}
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
				var _this = this;
				var $controlsContainer = $('<div />').addClass('controlsContainer');
				// Add control bar 				
				this.$el = $('<div />')
								.addClass('controlBarContainer')
								.append( $controlsContainer );

				// Add control bar special classes
				if( this.getConfig('hover') && this.getPlayer().isOverlayControls() ) {
					this.$el.addClass('hover')
						.on("mouseenter", function(){
							_this.forceOnScreen = true;
						})
						.on("mouseleave click", function(){
							_this.forceOnScreen = false;
						});
					this.embedPlayer.getVideoHolder().addClass('hover');
				} else {
					this.$el.addClass('block');
				}
			}
			return this.$el;
		}
	}));

} )( window.mw, window.jQuery );