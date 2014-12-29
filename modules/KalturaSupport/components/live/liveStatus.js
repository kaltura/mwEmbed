( function( mw, $ ) {"use strict";
	mw.PluginManager.add( 'liveStatus', mw.KBaseComponent.extend({
		onAirStatus: false,

		defaultConfig: {
			'parent': 'controlsContainer',
			'order': 22,
			'displayImportance': 'high',
			'showTooltip': true
		},

		offlineIconClass: 'icon-off-air live-icon offline-icon not-clickable',
		onAirIconClass: 'icon-on-air live-icon online-icon not-clickable',
		unsyncIConClass: 'icon-off-air live-icon live-off-sync-icon',
		noThumbClass: 'not-clickable',

		liveText: gM( 'mwe-embedplayer-player-on-air' ),
		offlineText: gM( 'mwe-embedplayer-player-off-air' ),
		tooltip: gM( 'mwe-embedplayer-player-jump-to-live' ),

		prevIconClass: undefined,

		setup: function() {
			this.prevIconClass = this.onAirIconClass;
			this.addBindings();
		},
		addBindings: function() {
			var _this = this;
			this.bind( 'liveStreamStatusUpdate', function( e, onAirObj ) {
				if ( onAirObj.onAirStatus != _this.onAirStatus ) {
					_this.onAirStatus = onAirObj.onAirStatus;
					_this.setLiveStreamStatus();
				}
			} );
			if ( this.getPlayer().isDVR() ) {

				this.bind( 'seeked seeking onpause', function() {
					//live is off-synch
					if ( _this.onAirStatus ) {
						_this.setOffSyncUI();
					}
					_this.prevIconClass = _this.unsyncIConClass;
				});
			}
		},
		getComponent: function() {
			var _this = this;
			if( !this.$el ) {
				var $btnText = $( '<div />')
					.addClass( 'btn back-to-live-text timers ' + this.noThumbClass + this.getCssClass() )
					.text( this.offlineText );

				var $icon  =$( '<div />' ).addClass( 'btn timers '+ this.offlineIconClass + this.getCssClass() );

				this.$el = $( '<div />')
					.addClass( 'back-to-live' + this.getCssClass() )
					.append( $icon, $btnText )
					.click( function() {
						if ( _this.onAirStatus && _this.getPlayer().isDVR() && _this.prevIconClass != _this.onAirIconClass ) {
							_this.backToLive();
						}
					});
			}
			return this.$el;
		},

		backToLive: function() {
			if ( this.getPlayer().firstPlay )  {
				this.getPlayer().play();
			}  else {
				this.getPlayer().removePoster();
				this.getPlayer().backToLive();
			}

			//live catched up
			if ( this.onAirStatus ) {
				this.setLiveUI();
				this.prevIconClass = this.onAirIconClass ;
			}
		},

		setOffSyncUI: function() {
			this.getComponent().find('.live-icon').removeClass( this.offlineIconClass + " " + this.onAirIconClass ).addClass( this.unsyncIConClass );
			this.getComponent().find('.back-to-live-text').text( this.liveText ).removeClass( this.noThumbClass );
			this.updateTooltip( this.tooltip );
		},

		setLiveUI: function() {
			this.getComponent().find('.live-icon').removeClass( this.offlineIconClass + " " + this.unsyncIConClass ).addClass( this.onAirIconClass );
			this.getComponent().find('.back-to-live-text').text( this.liveText ).addClass( this.noThumbClass );
			this.updateTooltip( "" );
		},

		setLiveStreamStatus: function() {
			if ( this.onAirStatus ) {
				if ( this.prevIconClass == this.unsyncIConClass ) {
					this.setOffSyncUI();
				} else {
					this.setLiveUI();
				}
			}
			else {
				this.getComponent().find('.live-icon').removeClass( this.onAirIconClass + " " + this.unsyncIConClass ).addClass( this.offlineIconClass );
				this.getComponent().find('.back-to-live-text').text( this.offlineText );
				this.updateTooltip( "" );
			}
		}
	}))
} )( window.mw, window.jQuery );

