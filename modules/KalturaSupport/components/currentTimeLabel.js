( function( mw, $ ) {"use strict";

	mw.PluginManager.add( 'currentTimeLabel', mw.KBaseComponent.extend({

		defaultConfig: {
			"parent": "controlsContainer",
		 	"order": 21,
		 	"displayImportance": "high"
		},

		setup: function(){
			var _this = this;
			this.bind( 'timeupdate', function(){
				if( !_this.getPlayer().isInSequence() ){
					_this.updateUI( _this.getCurrentTime() );
				}
			});
			// Bind to Ad events
			this.bind( 'AdSupport_AdUpdatePlayhead', function(e, currentTime){
				if( _this.getPlayer().isInSequence() ){
					_this.updateUI( currentTime );
				}
			});
			this.bind( 'AdSupport_EndAdPlayback', function(){
				_this.updateUI( _this.getCurrentTime() );
			});
			this.bind( 'seeked', function(){
				_this.updateUI( _this.getCurrentTime() );
			});
		},
		updateUI: function( time ){
			this.getComponent().text( mw.seconds2npt( time ) );
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