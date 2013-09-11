( function( mw, $ ) {"use strict";

	mw.PluginManager.add( 'fullScreenBtn', mw.KBaseComponent.extend({

		defaultConfig: {
			"align": "right",
         	"parent": "controlsContainer",
         	"order": 51,
         	"showTooltip": true
		},

		offIconClass: 'icon-expand',
		onIconClass: 'icon-contract',

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
							.attr({
								'title': gM( 'mwe-embedplayer-player_fullscreen' ),
								'role': 'button'
							})
							.addClass( "btn " + this.offIconClass + this.getCssClass() )
							.click( function() {
								_this.toggleFullscreen();
							});				
			}
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
			});
			this.bind('onCloseFullScreen', function() {
				_this.getComponent().removeClass( _this.onIconClass ).addClass( _this.offIconClass );
			});
		},
		openNewWindow: function() {
			var embedPlayer = this.embedPlayer;

			// Iframe configuration
			var iframeMwConfig = {
				'EmbedPlayer.IsFullscreenIframe': true,
				'EmbedPlayer.IframeCurrentTime': embedPlayer.currentTime,
				'EmbedPlayer.IframeIsPlaying': embedPlayer.isPlaying(),
				'EmbedPlayer.IframeParentUrl': document.URL
			};

			var url = embedPlayer.getIframeSourceUrl() + '#' + encodeURIComponent(
				JSON.stringify({
					'mwConfig' :iframeMwConfig,
					'playerId' : embedPlayer.id
				})
			);
			embedPlayer.pause();
			// try and do a browser popup:
			var newwin = window.open(
				 url,
				 embedPlayer.id,
				 // Fullscreen window params:
				'width=' + screen.width +
				', height=' + ( screen.height - 90 ) +
				', top=0, left=0' +
				', fullscreen=yes'
			);
			
			if ( window.focus ) {
				newwin.focus();
			}
		},		
		toggleFullscreen: function() {
			if( mw.getConfig( "EmbedPlayer.NewWindowFullscreen" ) ){
				this.openNewWindow();
			} else {
				this.getPlayer().toggleFullscreen();
			}
		}
	}));

} )( window.mw, window.jQuery );