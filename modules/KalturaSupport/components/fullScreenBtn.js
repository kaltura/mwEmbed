( function( mw, $ ) {"use strict";

	var pluginName = 'fullScreenBtn';
		// Check if the like plugin is enabled:
	mw.addKalturaPlugin( pluginName, function( embedPlayer, callback ){
		new playPauseBtnPlugin( embedPlayer );
		// Continue player build-out
		callback();
	});

	var playPauseBtnPlugin = function( embedPlayer ){
		this.init( embedPlayer );
	};

	playPauseBtnPlugin.prototype = {

		bindPostFix: '.' + pluginName,
		playIconClass: 'icon-expand',
		pauseIconClass: 'icon-contract',

		init: function( embedPlayer ) {
			this.embedPlayer = embedPlayer;
			this.addButton();
			this.addBindings();
		},
		getBtnClass: function() {
			var align = this.embedPlayer.getKalturaConfig( pluginName, 'align' );
			switch( align ) {
				case 'right':
					return " pull-right";
				case 'left':
					return " pull-left";
			}
			return '';
		},
		getButton: function() {
			var _this = this;
			var additionalClass = this.getBtnClass();
			if( !this.$el ) {
				this.$el = $( '<button />' )
							.attr( 'title', gM( 'mwe-embedplayer-player_fullscreen' ) )
							.addClass( "btn " + this.playIconClass + additionalClass )
							.click( function() {
								_this.toggleFullscreen();
							});				
			}
			return this.$el;
		},
		addButton: function() {
			var _this = this;
			var embedPlayer = this.embedPlayer;
			// Add Button
			embedPlayer.bindHelper('addLayoutComponent' + this.bindPostFix, function( e, layoutBuilder ) {
				// Add the button to the control bar
				layoutBuilder.components[ pluginName ] = {
					'o': function() {
						return _this.getButton();
					}
				};
			});
		},
		addBindings: function() {
			var _this = this;
			var embedPlayer = this.embedPlayer;
			embedPlayer.bindHelper('onOpenFullScreen' + this.bindPostFix, function() {
				_this.getButton().removeClass( _this.playIconClass ).addClass( _this.pauseIconClass );
			});
			embedPlayer.bindHelper('onCloseFullScreen' + this.bindPostFix, function() {
				_this.getButton().removeClass( _this.pauseIconClass ).addClass( _this.playIconClass );
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
		toggleFullscreen: function() {this.openNewWindow();return;
			if( mw.getConfig( "EmbedPlayer.NewWindowFullscreen" ) ){
				this.openNewWindow();
			} else {
				this.embedPlayer.layoutBuilder.fullScreenManager.toggleFullscreen();
			}
		}
	};

} )( window.mw, window.jQuery );