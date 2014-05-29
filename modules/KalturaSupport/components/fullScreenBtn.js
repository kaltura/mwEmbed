( function( mw, $ ) {"use strict";

	mw.PluginManager.add( 'fullScreenBtn', mw.KBaseComponent.extend({

		defaultConfig: {
			"align": "right",
			"parent": "controlsContainer",
			"order": 51,
			"showTooltip": true,
			"displayImportance": "high"
		},

		offIconClass: 'icon-expand',
		onIconClass: 'icon-contract',

		enterFullscreenTxt: gM( 'mwe-embedplayer-player_fullscreen' ),
		exitFullscreenTxt: gM( 'mwe-embedplayer-player_closefullscreen' ),
			
		setup: function( embedPlayer ) {
			this.addBindings();
		},
		isSafeEnviornment: function(){
			return mw.getConfig( 'EmbedPlayer.EnableFullscreen' );
		},
		getComponent: function() {
			var _this = this;
			if( !this.$el ) {
				this.$el = $( '<button />' )
							.attr( 'title', this.enterFullscreenTxt )
							.addClass( "btn " + this.offIconClass + this.getCssClass() )
							.click( function() {
								_this.toggleFullscreen();
							});
			}
            this.setAccessibility(this.$el,this.enterFullscreenTxt);
			return this.$el;
		},
		addBindings: function() {
			var _this = this;
			// Add double click binding
			this.bind('dblclick', function(){
				_this.toggleFullscreen();
			});
			// Update fullscreen icon
			this.bind('onOpenFullScreen', function() {
				_this.getComponent().removeClass( _this.offIconClass ).addClass( _this.onIconClass );
				_this.updateTooltip( _this.exitFullscreenTxt );
                _this.setAccessibility(_this.$el,_this.exitFullscreenTxt);
			});
			this.bind('onCloseFullScreen', function() {
				_this.getComponent().removeClass( _this.onIconClass ).addClass( _this.offIconClass );
				_this.updateTooltip( _this.enterFullscreenTxt );
                _this.setAccessibility(_this.$el,_this.enterFullscreenTxt);
			});
		},
		toggleFullscreen: function() {
			this.getPlayer().toggleFullscreen();
		}
	}));

} )( window.mw, window.jQuery );