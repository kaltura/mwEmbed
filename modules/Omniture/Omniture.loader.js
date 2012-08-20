( function( mw, $ ) { "use strict";

	mw.addKalturaConfCheck( function( embedPlayer, callback ){
		var pluginName = null;
		pluginName = embedPlayer.isPluginEnabled( 'omniture' ) ? 'omniture' : null;
		if( ! pluginName ){
			pluginName = embedPlayer.isPluginEnabled( 'siteCatalyst15' ) ? 'siteCatalyst15' : null;
		}
		// Check the "plugin" is enabled:
		if( pluginName ){
			mw.load('mw.Omniture', function(){
				new mw.Omniture( embedPlayer, pluginName, callback);
			});
			return ;
		}
		// no Omniture, run callback directly
		callback();
	});

})( window.mw, window.jQuery);