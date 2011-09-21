/**
* Adds cue points support
*/
( function( mw, $ ) {
	
mw.KCuePoints = function( embedPlayer ){
	return this.init( embedPlayer );
};
mw.KCuePoints.prototype = {
	init: function( embedPlayer ){
		this.embedPlayer = embedPlayer;
		this.addPlayerBindings();
	},
	/**
	 * Adds player cue point bindings
	 */
	addPlayerBindings: function(){
		var _this = this;
		// Get first cue point
		var nextCuePoint = this.getCuePoint(0);
		var embedPlayer = this.embedPlayer;
		
		// Handle first cue point (preRoll)
		if( nextCuePoint.startTime == 0 ) {
			nextCuePoint.startTime = 1;
		}

		// Bind to monitorEvent to trigger the cue points events
		$( embedPlayer ).bind( "monitorEvent.kCuePoints", function() {
			var currentTime = embedPlayer.currentTime * 1000;
			if( currentTime >= nextCuePoint.startTime ) {
				// Trigger the cue point
				_this.triggerCuePoint( nextCuePoint );

				// Get next cue point
				nextCuePoint = _this.getCuePoint( currentTime );
			}
		});

		// Handle last cue point (postRoll)
		$( embedPlayer ).bind( "ended.kCuePoints", function(){
			var cuePoints = _this.getCuePoints();
			var lastCuePoint = cuePoints[ cuePoints.length - 1];
			if( lastCuePoint.startTime >= _this.getEndTime() ) {
				// Found postRoll, trigger cuePoint
				_this.triggerCuePoint( lastCuePoint );
			}
		});

		// Bind for seeked event to update the nextCuePoint
		$( embedPlayer ).bind( "seeked.kCuePoints", function(){
			var currentTime = embedPlayer.currentTime * 1000;
			nextCuePoint = _this.getCuePoint(currentTime);
		});
	},
	getEndTime: function(){
		return this.embedPlayer.evaluate('{mediaProxy.entry.msDuration}');
	},
	getCuePoints: function(){
		if( ! this.embedPlayer.entryCuePoints || ! this.embedPlayer.entryCuePoints.length ){
			return false;
		}
		return this.embedPlayer.entryCuePoints;
	},
	/**
	* Returns the next cuePoint object for requested time
	* @param {Number} time Time in milliseconds
	*/
	getCuePoint: function( time ){
		// Check if embedPlayer has entryCuePoints
		if( ! this.getCuePoints() ){
			return false;
		}
		var cuePoints = this.getCuePoints();
		// Start looking for the cue point via time, return first match:
		for( var i = 0; i<cuePoints.length; i++) {
			if( cuePoints[i].startTime >= time ) {
				return cuePoints[i];
			}
		}
		// No cue point found in range return false:
		return false;
	},
	/**
	 * Triggers the given cue point
	 * @param (Object) Cue Point object
	 **/
	triggerCuePoint: function( cuePoint ) {
		/**
		 *  We need different events for each cue point type
		 */
		var eventName;
		/*
		 * The cue point object is wrapped with another object that has context property.
		 * We used that property so that the different plugins will know the context of the ad
		 * In case the cue point is not a adOpportunity their will be no context
		 * 
		 * This matches the KDP implementation
		 * */
		var obj = {
			cuePoint: cuePoint
		};
		if( cuePoint.cuePointType == 'codeCuePoint.Code' ) {
			// Code type cue point ( make it easier for people grepping the code base for an event )
			eventName = 'KalturaSupport_CuePointReached';
		} else if( cuePoint.cuePointType == 'adCuePoint.Ad' ) {
			// Ad type cue point
			eventName = 'KalturaSupport_AdOpportunity';
			obj.context = this.getAdType(cuePoint);
		}
		$( this.embedPlayer ).trigger(  eventName, obj );
		mw.log('mw.KCuePoints :: Triggered event: ' + eventName + ' - ' + cuePoint.cuePointType + ' at: ' + cuePoint.startTime );
	},
	
	// Get Ad Type from Cue Point
	getAdType: function( cuePoint ) {
		if( cuePoint.startTime == 1 ) {
			return 'pre';
		} else if( cuePoint.startTime == this.getEndTime() ) {
			return 'post';
		} else {
			return 'mid';
		}
		mw.log("Error:: KCuePoints could not determine adType");
	},

	getAdSlotType: function( cuePoint ) {		
		if( cuePoint.cuePoint.adType == 1 ) {
			return this.getAdType( cuePoint ) + 'roll';
		} else {
			return 'overlay';
		}
	}
};

} )( window.mw, window.jQuery );