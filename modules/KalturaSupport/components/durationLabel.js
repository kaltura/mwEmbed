( function( mw, $ ) {"use strict";

	mw.PluginManager.add( 'durationLabel', mw.KBaseComponent.extend({

		defaultConfig: {
			parent: "controlsContainer",
		 	order: 31,
		 	displayImportance: 'medium',
			prefix: ' / '
		},
		
		contentDuration: 0,

		setup: function(){
			var _this = this;
			if ( mw.isMobileDevice() ){
				this.setConfig("prefix","");
				this.getComponent().data("width",0.1);
			}
			this.bind( 'durationChange', function(event, duration){
				if( !_this.getPlayer().isInSequence() ){
					_this.contentDuration = duration;
					_this.updateUI( Math.floor(duration) );
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
			var duration = this.getConfig('prefix') !== undefined ? this.getConfig('prefix') + formatTime : formatTime;
			this.getComponent().text( duration );
		},
		getComponent: function() {
			if( !this.$el ) {
				var duration = this.getConfig('prefix') !== undefined ? this.getConfig('prefix') + '0:00' : '0:00';
				this.$el = $( '<div />' )
							.addClass ( "timers" + this.getCssClass() )
							.text( duration );
			}
			return this.$el;
		},
		show: function() {
			this.getComponent().css('display','inline').removeData( 'forceHide' );
		}
	}));

} )( window.mw, window.jQuery );		