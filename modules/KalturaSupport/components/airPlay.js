( function( mw, $ ) {"use strict";

	mw.PluginManager.add( 'airPlay', mw.KBaseComponent.extend({
		defaultConfig: {
			"parent": "topBarContainer",
			"order": 10,
			"align": "right"
		},
		setup: function(){
			this.addBindings();
		},
		addBindings: function() {
			var _this = this;

			this.bind('airPlay', function() {
				_this.getComponent().show();
			});

			this.bind('playerReady', function() {
				_this.addNativeAirPlayButton( _this.getComponent()[0].getBoundingClientRect() );
			});

			this.bind('onShowControlBar', function() {
				_this.showNativeAirPlayButton();
			});

			this.bind('onHideControlBar', function() {
				_this.hideNativeAirPlayButton();
			});
		},
		getComponent: function() {
			if( !this.$el ) {
				this.$el = $( '<button />' )
					.addClass("btn").addClass( this.getCssClass() )
			}

			return this.$el;
		},
		addNativeAirPlayButton: function( airPlayBtnOffset ){
			this.embedPlayer.addNativeAirPlayButton( airPlayBtnOffset );
		},
		showNativeAirPlayButton: function(){
			this.embedPlayer.showNativeAirPlayButton();
		},
		hideNativeAirPlayButton: function(){
			this.embedPlayer.hideNativeAirPlayButton();
		}
	}));

} )( window.mw, window.jQuery );