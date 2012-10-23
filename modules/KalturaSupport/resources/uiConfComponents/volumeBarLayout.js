( function( mw, $ ) { "use strict";

	mw.addKalturaPlugin( 'volumeBar', function( embedPlayer, callback ){
		var layout = embedPlayer.getKalturaConfig( 'volumeBar', 'layoutMode' ) || 'vertical';
		$( embedPlayer ).bind( 'addControlBarComponent', function(event, controlBar ){
			controlBar.volumeLayout = layout;
			// Update volume slider horizontal size:
			if( controlBar.volumeLayout == 'horizontal' ){
				controlBar.components[ 'volumeControl' ].w = 80;
			}
		});
		callback();
	});

})( window.mw, window.jQuery );
