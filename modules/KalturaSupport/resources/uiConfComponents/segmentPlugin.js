/**
* Handles segment plugin support
*/
( function( mw, $ ) { "use strict";

//Check for new Embed Player events:
mw.addKalturaPlugin( 'segment', function(embedPlayer, callback){
	var timeIn = parseFloat( embedPlayer.getKalturaConfig('segment', 'timeIn') );
	var timeOut = parseFloat( embedPlayer.getKalturaConfig('segment', 'timeOut') );
	embedPlayer.startTime = timeIn;
	embedPlayer.startOffset = timeIn;
	embedPlayer.setDuration( timeOut - timeIn );
	// always retain startTime ( even at stops )
	embedPlayer.bindHelper( 'doStop', function(){
		embedPlayer.startTime = timeIn;
	});
	callback();
});


})( window.mw, jQuery );