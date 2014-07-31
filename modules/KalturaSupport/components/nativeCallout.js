( function( mw, $ ) {"use strict";

	mw.PluginManager.add( 'nativeCallout', mw.KBasePlugin.extend({
		defaultConfig: {

		},
		setup: function(){
			// Bind player
			this.addBindings();
		},
		isSafeEnviornment: function(){
			return mw.isMobileDevice() === true;
		},
		addBindings: function() {
			this.bind('nativeCallout', function(event, nativeCalloutPlugin) {
				if( !nativeCalloutPlugin.exist ) {
					nativeCalloutPlugin.exist = true;
				}
			});
		}
	}));

} )( window.mw, window.jQuery );