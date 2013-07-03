( function( mw, $ ) {"use strict";

/*

getElement
onEnable
onDisable
onPlayerStateChange

*/

mw.KBaseComponent = mw.KBasePlugin.extend({
	init: function( embedPlayer, pluginName ) {
		this._super( embedPlayer, pluginName );
		// Check if we have get element function
		if( $.isFunction( this.getComponent ) ) {
			this.addComponent();
		}
	},
	addComponent: function() {
		var _this = this;
		// Add Button
		this.bind('addLayoutComponent', function( e, layoutBuilder ) {
			// Add the button to the control bar
			layoutBuilder.components[ _this.pluginName ] = {
				'o': function() {
					return _this.getComponent();
				}
			};
		});		
	}
});

} )( window.mw, window.jQuery );