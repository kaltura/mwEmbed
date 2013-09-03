( function( mw, $ ) {"use strict";

	mw.PluginManager.add( 'currentTimeLabel', mw.KBaseComponent.extend({

		defaultConfig: {
			"parent": "controlsContainer",
         	"order": 21
		},

		setup: function(){
			var _this = this;
			this.bind( 'timeupdate', function(){
				_this.getComponent().text( mw.seconds2npt( _this.getCurrentTime() ) );
			});
			this.bind( 'seeked', function(){
				_this.getComponent().text( mw.seconds2npt( _this.getCurrentTime() ) );
			});
		},
		getCurrentTime: function(){
			var ct = this.getPlayer().currentTime - this.getPlayer().startOffset;
			if( ct < 0 ){
				ct = 0;
			}
			return parseFloat( ct );
		},
		getComponent: function() {
			if( !this.$el ) {
				this.$el = $( '<div />' )
					.addClass ( "timers" + this.getCssClass() )
					.text( '0:00' );
			}
			return this.$el;
		}
	}));

} )( window.mw, window.jQuery );		