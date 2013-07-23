( function( mw, $ ) {"use strict";

	mw.PluginManager.add( 'controlBarContainer', mw.KBasePlugin.extend({

		defaultConfig: {
			'hover': true
		},

		setup: function(){
			var _this = this;
			// Exit if we're using native controls
			if( this.getPlayer().useNativePlayerControls() ) {
				$( this.getPlayer().getPlayerElement() ).attr('controls', "true");
				return;
			}
			// Register our container
			this.bind( 'addLayoutContainer', function() {
				_this.getPlayer().getInterface().append( _this.getComponent() );
			});
			this.bind( 'showInlineDownloadLink', function(){
				_this.getComponent().hide();
			});
			this.bind( 'layoutReady', function(){
				_this.getComponent().show();
			});
		},
		getComponent: function(){
			if( !this.$el ) {
				var $controlsContainer = $('<div />').addClass('controlsContainer');
				// Add control bar 				
				this.$el = $('<div />')
								.addClass('controlBarContainer')
								.append( $controlsContainer );

				// Add control bar special classes
				if( this.getConfig('hover') && this.getPlayer().layoutBuilder.isOverlayControls() ) {
					this.$el.hide().addClass('hover');
				} else {
					this.$el.addClass('block');
				}
			}
			return this.$el;
		}
	}));

} )( window.mw, window.jQuery );