( function( mw, $ ) {"use strict";
	mw.PluginManager.add( 'liveStatus', mw.KBaseComponent.extend({
		onAirStatus: false,

		defaultConfig: {
			'parent': 'controlsContainer',
			'order': 32,
			'displayImportance': 'high',
			'showTooltip': true
		},

		offlineIconClass: 'icon-off-air offline-icon',
		onAirIconClass: 'icon-on-air live-icon',

		liveText: gM( 'mwe-embedplayer-player-on-air' ),
		offlineText: gM( 'mwe-embedplayer-player-off-air' ),
		tooltip: gM( 'mwe-embedplayer-player-jump-to-live' ),

		setup: function() {
			this.addBindings();
		},
		addBindings: function() {
			var _this = this;
			this.bind( 'liveStreamStatusUpdate', function( e, onAirObj ) {
				_this.onAirStatus = onAirObj.onAirStatus;
				_this.setLiveStreamStatus( _this.getLiveStreamStatusText() );
			} );
		},
		getComponent: function() {
			var _this = this;
			if( !this.$el ) {
				var $btnText = $( '<div />')
					.addClass( 'back-to-live-text ' + this.getCssClass() )
					.text( this.offlineText );

				var $button  =$( '<button />' )
					.addClass( "btn " + this.offlineIconClass + this.getCssClass() );

				this.$el = $( '<div />')
					.addClass( 'ui-widget back-to-live' + this.getCssClass() )
					.append( $button, $btnText )
					.click( function() {
						if ( _this.onAirStatus ) {
							_this.backToLive();
						}
					});
			}
			return this.$el;
		},

		backToLive: function() {
			this.getPlayer().backToLive();
		},

		getLiveStreamStatusText: function() {
			if ( this.onAirStatus ) {
				return 'On Air';
			}
			return 'Off Air';
		},
		setLiveStreamStatus: function( value ) {
			var components = this.getComponent().children();
			if ( this.onAirStatus ) {
				components[0].removeClass( this.offlineIconClass ).addClass( this.onAirIconClass );
				components[1].text( this.liveText );
				this.updateTooltip( this.tooltip );
			}
			else {
				components[0].removeClass( this.onAirIconClass ).addClass( this.offlineIconClass );
				components[1].text( this.offlineText );
				this.updateTooltip( "" );
			}
		}
	}))
} )( window.mw, window.jQuery );

