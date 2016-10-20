( function( mw, $ ) {"use strict";

	mw.PluginManager.add( 'playPauseBtn', mw.KBaseComponent.extend({

		defaultConfig: {
			'parent': 'controlsContainer',
			'order': 1,
			'showTooltip': true,
			"displayImportance": "high"
		},

		isDisabled: false,

		playIconClass: 'icon-play',
		pauseIconClass: 'icon-pause',
		replayIconClass: 'icon-replay',

		playTitle: gM( 'mwe-embedplayer-play_clip' ),
		pauseTitle: gM( 'mwe-embedplayer-pause_clip' ),
		replayTitle: gM('mwe-embedplayer-replay'),

		setup: function( embedPlayer ) {
			this.addBindings();
		},
		isSafeEnviornment: function(){
			return !this.embedPlayer.isMobileSkin();
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
			this.bind('onPlayerStateChange', function(e, newState, oldState ){
				_this.updateUI( newState, oldState );
			});
                this.bind('onOpenFullScreen', function () {
                    try {
                    _this.getComponent().focus();
                    } catch(e){}
                });

		},
		updateUI: function( newState, oldState ){
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
					title = this.playTitle;
					newIconClass = this.playIconClass;
					break;
				case 'pause':
					if ( oldState && oldState!='end' ) {
						title = this.playTitle;
						newIconClass = this.playIconClass;
					} else {   	//if we get 'paused' after 'end' state - leave 'replay' icon
						ignoreChange = true;
					}
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
				this.updateTooltip(title);
                this.setAccessibility(this.$el,title);
				this.getComponent()
					.removeClass( removeIconClasses )
					.addClass( newIconClass );
			}

		},
		togglePlayback: function() {
			if( this.isDisabled ) return ;
			var notificationName = ( this.getPlayer().isPlaying() ) ? 'doPause' : 'doPlay';
			this.getPlayer().sendNotification( notificationName, {'userInitiated': true} );
		}
	})
	);

} )( window.mw, window.jQuery );
