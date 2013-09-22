( function( mw, $ ) {"use strict";

	mw.PluginManager.add( 'titleLabel', mw.KBaseComponent.extend({
		defaultConfig: {
			"parent": "topBarContainer",
			"order": 1
		},
		setup: function(){
			var _this = this;
			this.bind('playerReady', function(){
				// Update title to entry name
				_this.getComponent().text( 
					_this.getPlayer().evaluate('{mediaProxy.entry.name}') 
				);
			});
		},
		getComponent: function() {
			if( !this.$el ) {
				this.$el = $( '<div />' )
							.addClass ( this.getCssClass() );
			}
			return this.$el;
		}
	}));

})( window.mw, window.jQuery );