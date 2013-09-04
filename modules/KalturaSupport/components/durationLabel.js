( function( mw, $ ) {"use strict";

	mw.PluginManager.add( 'durationLabel', mw.KBaseComponent.extend({

		defaultConfig: {
			parent: "controlsContainer",
         	order: 31,
			prefix: ' / '
		},
		
		contentDuration: 0,

		setup: function(){
			var _this = this;
			this.bind( 'durationChange', function(event, duration){
				if( !_this.getPlayer().isInSequence() ){
					_this.contentDuration = duration;
					_this.updateUI( duration );
				}
			});
			// Support duration for Ads
			this.bind( 'AdSupport_AdUpdateDuration', function(e, duration){
				_this.updateUI( duration );
			});
			this.bind( 'AdSupport_EndAdPlayback', function(){
				_this.updateUI( _this.contentDuration );
			});
		},
		updateUI: function( duration ){
			var formatTime = mw.seconds2npt( parseFloat( duration ) )
			this.getComponent().text( this.getConfig('prefix') + formatTime );
		},
		getComponent: function() {
			if( !this.$el ) {
				this.$el = $( '<div />' )
							.addClass ( "timers" + this.getCssClass() )
							.text( this.getConfig('prefix') + '0:00' );
			}
			return this.$el;
		}
	}));

} )( window.mw, window.jQuery );		