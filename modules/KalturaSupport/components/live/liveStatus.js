( function( mw, $ ) {"use strict";
	mw.PluginManager.add( 'liveStatus', mw.KBaseComponent.extend({
		onAirStatus: false,

		defaultConfig: {
			'parent': 'controlsContainer',
			'order': 52,
			"displayImportance": "high"
		},

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
			if( !this.$el ) {
				this.$el = $( '<div />' ).addClass( "ui-widget live-stream-status" + this.getCssClass() );
			}
			return this.$el;
		},
		getLiveStreamStatusText: function() {
			if ( this.onAirStatus ) {
				return 'On Air';
			}
			return 'Off Air';
		},
		setLiveStreamStatus: function( value ) {
			this.getComponent().html( value );
			if ( this.onAirStatus ) {
				this.getComponent().removeClass( 'live-off-air' ).addClass( 'live-on-air' );
			}
			else {
				this.getComponent().removeClass( 'live-on-air' ).addClass( 'live-off-air' );
			}
		}
	}))
} )( window.mw, window.jQuery );

