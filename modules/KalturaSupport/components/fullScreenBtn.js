( function( mw, $ ) {"use strict";

	var pluginName = 'fullScreenBtn';
		// Check if the plugin is enabled:
	mw.addKalturaPlugin( pluginName, function( embedPlayer, callback ){
		new fullScreenBtnPlugin( embedPlayer, callback, pluginName );
	});

	var fullScreenBtnPlugin = mw.KBaseComponent.extend({

		offIconClass: 'icon-expand',
		onIconClass: 'icon-contract',

		setup: function( embedPlayer ) {
			this.addBindings();
		},
		checkEnviornment: function(){
			return mw.getConfig( 'EmbedPlayer.EnableFullscreen' );
		},
		getComponent: function() {
			var _this = this;
			var additionalClass = this.getComponentClass();
			if( !this.$el ) {
				this.$el = $( '<button />' )
							.attr( 'title', gM( 'mwe-embedplayer-player_fullscreen' ) )
							.addClass( "btn " + this.offIconClass + additionalClass )
							.click( function() {
								_this.toggleFullscreen();
							});				
			}
			return this.$el;
		},
		addBindings: function() {
			var _this = this;
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
				this.getPlayer().layoutBuilder.fullScreenManager.toggleFullscreen();
			}
		}
	});

} )( window.mw, window.jQuery );