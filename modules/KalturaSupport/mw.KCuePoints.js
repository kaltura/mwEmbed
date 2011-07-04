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
					return cuePoint;
				}
			}
			//No cue point found in range return false:
			return false;
		};

		/**
		 * Triggers the given cue point
		 * @param (Object) Cue Point object
		 **/
		var triggerCuePoint = function( cuePoint ) {
			console.log('Triggered Cue Point: ' + cuePoint.name + ' | Current Time:' + (embedPlayer.currentTime * 1000) + ' | cuePoint Time:' + cuePoint.startTime );
			/*
			 *  We need different events for each cue point type
			 *  TODO: will be changed according to the real type from the server
			 */
			if( cuePoint.type == 1 ) {
				// Ad type cue point
				var eventName = 'adOpportunity';
			} else if( cuePoint.type == 2 ) {
				// Code type cue point
				var eventName = 'cuePointReached';
			}
			$j( embedPlayer ).trigger( 'KalturaSupport_' + eventName, cuePoint );
		};

		// Get first cue point
		var nextCuePoint = getCuePoint(0);
		
		// Handle first cue point (preRoll)
		if( nextCuePoint.startTime == 0 ) {
			nextCuePoint.startTime = 1;
		}

		// Handle last cue point (postRoll)
		$j( embedPlayer ).bind("ended", function(){
			var lastCuePoint = cuePoints[ cuePoints.length - 1];
			var endTime = ( embedPlayer.duration * 1000 ) - 500; // The acceptible time for postRoll
			if( lastCuePoint.startTime > endTime ) {
				// Found postRoll, trigger cuePoint
				triggerCuePoint(lastCuePoint);
			}
		});

		// Bind for seeked event to update the nextCuePoint
		$j( embedPlayer ).bind("seeked", function(){
			var currentTime = embedPlayer.currentTime * 1000;
			nextCuePoint = getCuePoint(currentTime);
		});

		// Bind to monitorEvent to trigger the cue points events
		$j( embedPlayer ).bind( 'monitorEvent', function() {
			var currentTime = embedPlayer.currentTime * 1000;
			if( currentTime >= nextCuePoint.startTime ) {
				// Trigger the cue point
				triggerCuePoint(nextCuePoint);

				// Get next cue point
				nextCuePoint = getCuePoint(currentTime);
			}
		});
		
	});
});