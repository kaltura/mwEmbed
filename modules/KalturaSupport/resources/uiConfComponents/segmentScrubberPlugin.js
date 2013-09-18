/**
* Handles segment plugin support
*/
( function( mw, $ ) { "use strict";

//Check for new Embed Player events:
mw.addKalturaPlugin( 'segmentScrubber', function(embedPlayer, callback){
	var updateTimeOffsets = function(){
		var stopEvent = 'doStop.segmentScrubber';
		var timeIn = embedPlayer.getKalturaConfig('mediaProxy', 'mediaPlayFrom' );
		var timeOut = embedPlayer.getKalturaConfig('mediaProxy', 'mediaPlayTo' );
		embedPlayer.startTime = timeIn;
		embedPlayer.startOffset = timeIn;
		embedPlayer.setDuration( timeOut - timeIn );
		// always retain startTime ( even at stops )
		embedPlayer.unbindHelper(stopEvent).bindHelper(stopEvent, function(){
			embedPlayer.startTime = parseFloat( timeIn );
		});
	}
	embedPlayer.bindHelper('playerReady', function(){
		updateTimeOffsets();
	});
	embedPlayer.bindHelper( 'Kaltura_SetKDPAttribute', function(event, componentName, property){
		if( componentName == "mediaProxy" 
			&&
			( property == 'mediaPlayFrom' || property =='mediaPlayTo' )
		){
			updateTimeOffsets();
		}
	});
	// any time we update 'mediaProxy.mediaPlayFrom' or 'mediaProxy.mediaPlayTo', update the times. 
	callback();
});


})( window.mw, jQuery );