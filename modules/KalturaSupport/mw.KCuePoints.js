/**
* Adds cue points support
*/
$j( mw ).bind( 'newEmbedPlayerEvent', function( event, embedPlayer ){
	$j( embedPlayer ).bind( 'KalturaSupport_CuePointsReady', function( event ){

		mw.log( "KCuePoints:: Cue Points ready");
		var cuePoints = embedPlayer.entryCuePoints;
		var endTime = embedPlayer.duration * 1000;

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
			/*
			 *  We need different events for each cue point type
			 *  TODO: will be changed according to the real type from the server
			 */
			var eventName,
				obj = {
					cuePoint: cuePoint
				};

			if( cuePoint.type == 1 ) {
				// Code type cue point
				eventName = 'cuePointReached';
			} else if( cuePoint.type == 2 ) {
				// Ad type cue point
				eventName = 'adOpportunity';
				obj.content = getAdType(cuePoint);
			}
			$j( embedPlayer ).trigger( 'KalturaSupport_' + eventName, obj );
			console.log('Triggered Cue Point: ' + cuePoint.name + ' | Current Time:' + (embedPlayer.currentTime * 1000) + ' | cuePoint Time:' + cuePoint.startTime, obj );
		};

		// Detemine our cue point Ad type
		var getAdType = function( cuePoint ) {
			if( cuePoint.startTime == 1 ) {
				return 'pre';
			} else if( cuePoint.startTime == endTime) {
				return 'post';
			} else {
				return 'mid';
			}
		};

		// Get first cue point
		var nextCuePoint = getCuePoint(0);
		
		// Handle first cue point (preRoll)
		if( nextCuePoint.startTime == 0 ) {
			nextCuePoint.startTime = 1;
		}

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

		// Handle last cue point (postRoll)
		$j( embedPlayer ).bind("ended", function(){
			var lastCuePoint = cuePoints[ cuePoints.length - 1];
			if( lastCuePoint.startTime >= endTime ) {
				// Found postRoll, trigger cuePoint
				triggerCuePoint(lastCuePoint);
			}
		});

		// Bind for seeked event to update the nextCuePoint
		$j( embedPlayer ).bind("seeked", function(){
			var currentTime = embedPlayer.currentTime * 1000;
			nextCuePoint = getCuePoint(currentTime);
		});
		
	});
});