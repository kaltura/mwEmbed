( function( mw, $ ) { "use strict";
	mw.addKalturaPlugin( ['mw.Peer5'], 'peer5', function( embedPlayer, callback){
		var ua = navigator.userAgent;
		if( /chrome/i.test(ua)) {
			var uaArray = ua.split(' ');
			// check chrome browser version: 
			if( parseInt( uaArray[uaArray.length - 2].substr(7).split('.')[0] ) > 25 ){
				embedPlayer.peer5 = new mw.Peer5( embedPlayer, callback );
				return ;
			}
		}
		//if not HTML5 supported, should not get in!
		//be sure to issue callback if not running plugin:
		callback();
	});
})( window.mw, jQuery );
