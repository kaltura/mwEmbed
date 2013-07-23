( function( mw, $ ) {"use strict";

	mw.PluginManager.add( 'durationLabel', mw.KBaseComponent.extend({
		setup: function(){
			var _this = this;
			this.bind( 'durationChange', function(event, duration){
				var formatDuration = mw.seconds2npt( parseFloat( duration ) )
				_this.getComponent().text( formatDuration );
			});
		},
		getComponent: function() {
			if( !this.$el ) {
				this.$el = $( '<div />' ).addClass ( "timers duration" );
			}
			return this.$el;
		}
	}));

} )( window.mw, window.jQuery );		