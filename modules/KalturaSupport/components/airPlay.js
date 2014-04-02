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
		isSafeEnviornment: function(){
			 // If mw.getConfig( "EmbedPlayer.ForceNativeComponent") is null or empty
			if( ( mw.getConfig( "EmbedPlayer.ForceNativeComponent") == null || mw.getConfig( "EmbedPlayer.ForceNativeComponent") === "" ) ){
				return false;
			}

			return mw.getConfig( "EmbedPlayer.ForceNativeComponent");
		},
		addBindings: function() {
			var _this = this;

			this.bind('playerReady', function() {
				_this.addNativeAirPlayButton();
			});

			this.bind('onShowControlBar', function() {
				setTimeout(function(){
					_this.showNativeAirPlayButton( _this.getComponent()[0].getBoundingClientRect() );
				}, 200);
			});

			this.bind('onHideControlBar', function() {
				_this.hideNativeAirPlayButton();
			});

			this.bind('enterfullscreen exitfullscreen', function() {
				if( this.isControlsVisible ){
					_this.showNativeAirPlayButton( _this.getComponent()[0].getBoundingClientRect() );
				}
			});
		},
		getComponent: function() {
			if( !this.$el ) {
				this.$el = $( '<button />' )
					.addClass("btn").addClass( this.getCssClass() );
			}

			return this.$el;
		},
		addNativeAirPlayButton: function(){
			this.embedPlayer.addNativeAirPlayButton();
		},
		showNativeAirPlayButton: function( airPlayBtnOffset ){
			this.embedPlayer.showNativeAirPlayButton( airPlayBtnOffset );
		},
		hideNativeAirPlayButton: function(){
			this.embedPlayer.hideNativeAirPlayButton();
		}
	}));

} )( window.mw, window.jQuery );