( function( mw, $ ) {"use strict";

	var pluginName = 'playPauseBtn';
		// Check if the plugin is enabled:
	mw.addKalturaPlugin( pluginName, function( embedPlayer, callback ){
		new playPauseBtnPlugin( embedPlayer, pluginName );
		// Continue player build-out
		callback();
	});

	var playPauseBtnPlugin = mw.KBaseComponent.extend({

		playIconClass: 'icon-play',
		pauseIconClass: 'icon-pause',

		setup: function( embedPlayer ) {
			this.addBindings();
		},
		getComponent: function() {
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
		addBindings: function() {
			var _this = this;
			this.bind('onplay', function() {
				_this.getComponent().removeClass( _this.playIconClass ).addClass( _this.pauseIconClass );
			});
			this.bind('onpause', function() {
				_this.getComponent().removeClass( _this.pauseIconClass ).addClass( _this.playIconClass );
			});
		},
		togglePlayback: function() {
			var notificationName = ( this.getPlayer().isPlaying() ) ? 'doPause' : 'doPlay';
			this.getPlayer().sendNotification( notificationName );
		}
	});

} )( window.mw, window.jQuery );