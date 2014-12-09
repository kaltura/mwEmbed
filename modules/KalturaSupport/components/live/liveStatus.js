( function( mw, $ ) {"use strict";
	mw.PluginManager.add( 'liveStatus', mw.KBaseComponent.extend({
		onAirStatus: false,

		defaultConfig: {
			'parent': 'controlsContainer',
			'order': 22,
			'displayImportance': 'high',
			'showTooltip': true
		},

		offlineIconClass: 'icon-off-air live-icon offline-icon',
		onAirIconClass: 'icon-on-air live-icon online-icon',
		unsyncIConClass: 'icon-off-air live-icon live-off-sync-icon',

		liveText: gM( 'mwe-embedplayer-player-on-air' ),
		offlineText: gM( 'mwe-embedplayer-player-off-air' ),
		tooltip: gM( 'mwe-embedplayer-player-jump-to-live' ),

		setup: function() {
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
			this.bind( 'seeking onpause', function() {
				//live is off-synch
				if ( _this.onAirStatus ) {
					_this.getComponent().find('.live-icon').removeClass( _this.onAirIconClass ).addClass( _this.unsyncIConClass );
				}
			});
			this.bind( 'movingBackToLive', function() {
				//live catched up
				if ( _this.onAirStatus ) {
					_this.getComponent().find('.live-icon').removeClass( _this.unsyncIConClass ).addClass( _this.onAirIconClass );
				}
			});
		},
		getComponent: function() {
			var _this = this;
			if( !this.$el ) {
				var $btnText = $( '<div />')
					.addClass( 'btn back-to-live-text timers' + this.getCssClass() )
					.text( this.offlineText );

				var $icon  =$( '<div />' ).addClass( 'btn timers '+ this.offlineIconClass + this.getCssClass() );

				this.$el = $( '<div />')
					.addClass( 'back-to-live' + this.getCssClass() )
					.append( $icon, $btnText )
					.click( function() {
						if ( _this.onAirStatus ) {
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
				this.getPlayer().backToLive();
			}
		},

		setLiveStreamStatus: function() {
			if ( this.onAirStatus ) {
				this.getComponent().find('.live-icon').removeClass( this.offlineIconClass ).addClass( this.onAirIconClass );
				this.getComponent().find('.back-to-live-text').text( this.liveText );
				this.updateTooltip( this.tooltip );
			}
			else {
				this.getComponent().find('.live-icon').removeClass( this.onAirIconClass + " " + this.unsyncIConClass ).addClass( this.offlineIconClass );
				this.getComponent().find('.back-to-live-text').text( this.offlineText );
				this.updateTooltip( "" );
			}
		}
	}))
} )( window.mw, window.jQuery );

