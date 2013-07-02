( function( mw, $ ) {"use strict";

	var pluginName = 'playPauseBtn';
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
		playIconClass: 'icon-play',
		pauseIconClass: 'icon-pause',

		init: function( embedPlayer ) {
			this.embedPlayer = embedPlayer;
			this.addButton();
			this.addBindings();
		},
		getButton: function() {
			var _this = this;
			if( !this.$el ) {
				this.$el = $( '<button />' )
							.attr( 'title', gM( 'mwe-embedplayer-play_clip' ) )
							.addClass( "btn icon-play" )
							.click( function() {
								_this.togglePlayback();
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
			embedPlayer.bindHelper('onplay' + this.bindPostFix, function() {
				_this.getButton().removeClass( _this.playIconClass ).addClass( _this.pauseIconClass );
			});
			embedPlayer.bindHelper('onpause' + this.bindPostFix, function() {
				_this.getButton().removeClass( _this.pauseIconClass ).addClass( _this.playIconClass );
			});
		},
		togglePlayback: function() {
			var notificationName = ( this.embedPlayer.isPlaying() ) ? 'doPause' : 'doPlay';
			this.embedPlayer.sendNotification( notificationName );
		}
	};

} )( window.mw, window.jQuery );