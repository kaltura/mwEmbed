( function( mw, $ ) { "use strict";

	mw.addKalturaPlugin( ['mw.AttracTV'], 'AttracTV', function( embedPlayer, callback){
		// do user agent checks {
		if( true ){
			embedPlayer.AttracTV = new mw.AttracTV( embedPlayer, callback );
			return ;
		}
		//be sure to issue callback if not running plugin: 
		callback();
	});


})( window.mw, jQuery );
