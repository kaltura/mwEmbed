( function( mw, $ ) { "use strict";

	mw.addKalturaPlugin( 'volumeBar', function( embedPlayer, callback ){
		var layout = embedPlayer.getKalturaConfig( 'volumeBar', 'layoutMode' ) || 'vertical';
		$( embedPlayer ).bind( 'addControlBarComponent', function(event, controlBar ){
			controlBar.volumeLayout = layout;
		});
		callback();
	});
	
})( window.mw, window.jQuery );
