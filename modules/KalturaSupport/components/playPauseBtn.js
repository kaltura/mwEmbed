( function( mw, $ ) {"use strict";

	mw.PluginManager.add( 'playPauseBtn', mw.KBaseComponent.extend({

		defaultConfig: {
			'parent': 'controlsContainer',
		 	'order': 1
		},

		isDisabled: false,

		playIconClass: 'icon-play',
		pauseIconClass: 'icon-pause',
		replayIconClass: 'icon-replay',

		playTitle: gM( 'mwe-embedplayer-play_clip' ),
		pauseTitle: gM( 'mwe-embedplayer-pause_clip' ),
		replayTitle: 'Replay',

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
		onEnable: function(){
			this.isDisabled = false;
			this.getComponent().toggleClass('disabled');
		},
		onDisable: function(){
			this.isDisabled = true;
			this.getComponent().toggleClass('disabled');
		},
		addBindings: function() {
			var _this = this;
			this.bind('onPlayerStateChange', function(e, newState ){
				_this.updateUI( newState );
			});
		},
		updateUI: function( newState ){
			var removeIconClasses = this.playIconClass + ' ' + this.pauseIconClass + ' ' + this.replayIconClass;
			var newIconClass = null;
			var title = null;
			var ignoreChange = false;

			switch( newState ) {
				case 'play':
					title = this.pauseTitle;
					newIconClass = this.pauseIconClass;
				break;
				case 'start':
				case 'pause':
					title = this.playTitle;
					newIconClass = this.playIconClass;
				break;
				case 'end': 
					title = this.replayTitle;
					newIconClass = this.replayIconClass;
				break;
				default:
					// On other states do nothing
					ignoreChange = true;
				break;
			}

			if( ignoreChange ){
				return;
			} else {
				ignoreChange = false;
				this.getComponent()
					.attr( 'title', title )
					.removeClass( removeIconClasses )
					.addClass( newIconClass );
			}

		},
		togglePlayback: function() {
			if( this.isDisabled ) return ;
			var notificationName = ( this.getPlayer().isPlaying() ) ? 'doPause' : 'doPlay';
			this.getPlayer().sendNotification( notificationName );
		}
	})
	);

} )( window.mw, window.jQuery );