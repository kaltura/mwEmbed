( function( mw, $ ) { "use strict";

	mw.addKalturaPlugin( ['mw.Peer5'], 'peer5', function( embedPlayer, callback){
		// do user agent checks {
		if( true ){
			embedPlayer.peer5 = new mw.Peer5( embedPlayer, callback );
			return ;
		}
		//be sure to issue callback if not running plugin: 
		callback();
	});


})( window.mw, jQuery );
