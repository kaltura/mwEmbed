( function( mw, $ ) {"use strict";
	mw.PluginManager.add( 'liveTimeDisplay', mw.KBaseComponent.extend({

		defaultConfig: {
			'parent': 'controlsContainer',
			'order': 52,
			"displayImportance": "high"
		},

		setup: function() {
			this.addBindings();
		},
		addBindings: function() {
		},
		getComponent: function() {
			if( !this.$el ) {
				this.$el = $( '<div />' ).addClass( "ui-widget live-stream-status" + this.getCssClass() );
			}
			return this.$el;
		}
	}))
} )( window.mw, window.jQuery );

