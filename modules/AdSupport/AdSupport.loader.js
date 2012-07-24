// Scope everything in "mw" ( keeps the global namespace clean )
( function( mw, $ ) { "use strict";
	$( mw ).bind( 'EmbedPlayerNewPlayer', function( event, embedPlayer ){
		embedPlayer.bindHelper( 'KalturaSupport_DoneWithUiConf', function(){
			// TODO move to adTimeline
			if( mw.addAdTimeline ){
				mw.addAdTimeline ( embedPlayer );
			}
		});
	});
} )( window.mw, jQuery );