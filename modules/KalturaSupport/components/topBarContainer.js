( function( mw, $ ) {"use strict";

	mw.PluginManager.add( 'topBarContainer', mw.KBasePlugin.extend({

		defaultConfig: {
			'hover': true
		},

		keepOnScreen: false,
		screenOpen: false,

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
			this.bind( 'ended', function(){
				_this.show();
			});
			this.bind( 'layoutBuildDone', function(){
				if (!_this.embedPlayer.isMobileSkin()){
					_this.show();
				}
			});
			// If have no components, hide. For mobile skin we always need the topBarContainer to hold the "exit full screen" button
			this.bind('layoutBuildDone', function(){
				if( !_this.getComponent().children().length && !_this.embedPlayer.isMobileSkin() ){
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
			if ( this.embedPlayer.isMobileSkin() && this.getPlayer().getPlayerPoster().length && this.embedPlayer.getInterface().hasClass("start-state") ){
				return; // prevent showing controls on top of the poster when the video first loads
			}
			if ( !this.screenOpen ){
				this.getComponent().addClass( 'open' );
				// Trigger the screen overlay with layout info:
				this.getPlayer().triggerHelper( 'onShowToplBar', {
					'top' : this.getComponent().height() + 15
				});
			}
		},
		hide: function(){
			if( this.keepOnScreen || this.forceOnScreen) return;
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