( function( mw, $ ) {"use strict";

	var pluginName = 'controlBarContainer';
		// Check if the plugin is enabled:
	mw.addKalturaPlugin( pluginName, function( embedPlayer, callback ){
		new controlBarContainer( embedPlayer, callback, pluginName );
	});

	var controlBarContainer = mw.KBasePlugin.extend({
		setup: function(){
			var _this = this;
			// Register our container
			this.bind( 'addLayoutContainer', function() {
				_this.getPlayer().getInterface().append( _this.getComponent() );
			});
			this.bind( 'showInlineDownloadLink', function(){
				_this.getComponent().hide();
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
				if( this.getPlayer().layoutBuilder.isOverlayControls() ) {
					this.$el.hide().addClass('hover');
				} else {
					this.$el.addClass('block');
				}
			}
			return this.$el;
		}
	});
} )( window.mw, window.jQuery );