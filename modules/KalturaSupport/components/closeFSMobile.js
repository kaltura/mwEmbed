( function( mw, $ ) {"use strict";

	mw.PluginManager.add( 'closeFSMobile', mw.KBaseComponent.extend({
		defaultConfig: {
			"parent": "topBarContainer",
			"order": 1,
			"align": "left",
			"btnTitle": 'Done'
		},
		setup: function(){
			var _this = this;
			this.bind('playerReady', function(){
				// Update title to entry name
				_this.getComponent().text(
					_this.getConfig('btnTitle')
				);
			});
			this.addBindings();
		},
		addBindings: function() {
			var _this = this;
			this.bind('enterfullscreen', function() {
				_this.getComponent().show();
			});
			this.bind('exitfullscreen', function() {
				_this.getComponent().hide();
			});
		},
		getComponent: function() {
			var _this = this;
			if( !this.$el ) {
				this.$el = $( '<div />' )
					.addClass("btn").addClass ( this.getCssClass())
					.click(function(){_this.exitFullScreen()})
					.hide();
			}
			return this.$el;
		},
		exitFullScreen: function(){
			this.embedPlayer.doneFSBtnPressed();
		}
	}));

} )( window.mw, window.jQuery );