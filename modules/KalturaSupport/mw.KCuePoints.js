/**
* Adds cue points support
*/
$j( mw ).bind( 'newEmbedPlayerEvent', function( event, embedPlayer ){
	$j( embedPlayer ).bind( 'KalturaSupport_CuePointsReady', function( event ){

		mw.log( "KCuePoints:: Cue Points ready");
		var cuePoints = embedPlayer.entryCuePoints;

		/**
		* Returns the next cuePoint object for requested time
		* @param {String} time Time in mili seconds
		*/
		var getCuePoint = function ( time ) {
			// Start looking for the cue point via time, return first match:
			for( var i = 0; i < cuePoints.length; i++ ) {
				cuePoint = cuePoints[ i ];
				if( cuePoint.startTime >= time ) {
					console.log('Next Cue Point is:' + cuePoint.name);
					return cuePoint;
				}
			}
			//No cue point found in range return false:
			return false;
		};

		// Get first cue point
		var nextCuePoint = getCuePoint(0);

		// Bind to monitorEvent to trigger cuePointReach event
		$j( embedPlayer ).bind( 'monitorEvent', function() {
			var currentTime = embedPlayer.currentTime * 1000;
			if( currentTime >= nextCuePoint.startTime ) {
				console.log('Found Cue Point: ' + nextCuePoint.name);
				/*
				 *  We need different events for each cue point type
				 *  TODO: will be changed according to the real type from the server
				 */
				if( nextCuePoint.type == 1 ) {
					// Ad type cue point
					var eventName = 'adOpportunity';
				} else if( nextCuePoint.type == 2 ) {
					// Code type cue point
					var eventName = 'cuePointReached';
				}
				$j( embedPlayer ).trigger( 'KalturaSupport_' + eventName, nextCuePoint );

				// Get next cue point
				nextCuePoint = getCuePoint(currentTime);
			}
		});

		// Bind for seeked event to update the nextCuePoint
		$j( embedPlayer ).bind("seeked", function(){
			var currentTime = embedPlayer.currentTime * 1000;
			nextCuePoint = getCuePoint(currentTime);
		});
		
	});
});