( function( mw, $ ) {"use strict";

	mw.PluginManager.add( 'playPauseBtn', mw.KBaseComponent.extend({

		defaultConfig: {
			'parent': 'controlsContainer',
         	'order': 1
		},

		playIconClass: 'icon-play',
		pauseIconClass: 'icon-pause',

		playTitle: gM( 'mwe-embedplayer-play_clip' ),
		pauseTitle: gM( 'mwe-embedplayer-pause_clip' ),

		setup: function( embedPlayer ) {
			this.addBindings();
		},
		getComponent: function() {
			var _this = this;
			if( !this.$el ) {
				this.$el = $( '<button />' )
							.attr( 'title', this.playTitle )
							.addClass( "btn icon-play" + this.getCssClass() )
							.click( function() {
								_this.togglePlayback();
							});				
			}
			return this.$el;
		},
		addBindings: function() {
			var _this = this;
			this.bind('onplay', function() {
				_this.getComponent()
					.attr( 'title', _this.playTitle )
					.removeClass( _this.playIconClass ).addClass( _this.pauseIconClass );
			});
			this.bind('onpause', function() {
				_this.getComponent()
					.attr( 'title', _this.pauseTitle )
					.removeClass( _this.pauseIconClass ).addClass( _this.playIconClass );
			});
		},
		togglePlayback: function() {
			var notificationName = ( this.getPlayer().isPlaying() ) ? 'doPause' : 'doPlay';
			this.getPlayer().sendNotification( notificationName );
		}
	})
	);

} )( window.mw, window.jQuery );