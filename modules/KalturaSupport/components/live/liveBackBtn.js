( function( mw, $ ) {"use strict";
	mw.PluginManager.add( 'liveBackBtn', mw.KBaseComponent.extend({

		defaultConfig: {
			'parent': 'controlsContainer',
			'order': 53,
			"displayImportance": "medium"
		},

		getComponent: function() {
			var _this = this;
			if( !this.$el ) {
				var $backToLiveText = $( '<div />')
					.addClass( 'back-to-live-text ' + this.getCssClass() )
					.text( 'Live' );

				var $backToLiveWrapper =
					$( '<div />' )
						.addClass( 'back-to-live-icon ' + this.getCssClass() );
				this.$el =
					$( '<div />')
						.addClass( 'ui-widget back-to-live ' + this.getCssClass() )
						.append( $backToLiveWrapper, $backToLiveText )
						.click( function() {
							_this.backToLive();
						} );
			}
			return this.$el;
		},

		backToLive: function() {
			this.getPlayer().backToLive();
		}

	}))
} )( window.mw, window.jQuery );
