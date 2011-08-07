/**
* Adds cue points support
*/
( function( mw, $ ) {
	
mw.KCuePoints = function( embedPlayer ){
	this.init( embedPlayer );
};
mw.KCuePoints.prototype = {
	init: function( embedPlayer ){
		this.embedPlayer = embedPlayer;
		//In order to get the entry duration we need to get it before we start playing
		this.entryDuration = embedPlayer.duration;
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
		return this.entryDuration * 1000;
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
		/*
		 *  We need different events for each cue point type
		 *  TODO: will be changed according to the real type from the server
		 */
		var eventName;
		var obj = {
			cuePoint: cuePoint
		};
		if( cuePoint.cuePointType == 'codeCuePoint.Code' ) {
			// Code type cue point
			eventName = 'CuePointReached';
		} else if( cuePoint.cuePointType == 'adCuePoint.Ad' ) {
			// Ad type cue point
			eventName = 'AdOpportunity';
			obj.context = this.getAdType(cuePoint);
		}
		$( this.embedPlayer ).trigger( 'KalturaSupport_' + eventName, obj );
		mw.log('Cue Points :: Triggered event: ' + eventName + ' - ' + cuePoint.cuePointType + ' at: ' + cuePoint.startTime );
	},
	
	// Determine our cue point Ad type
	getAdType: function( cuePoint ) {
		if( cuePoint.startTime == 1 ) {
			return 'pre';
		} else if( cuePoint.startTime == this.getEndTime() ) {
			return 'post';
		} else {
			return 'mid';
		}
	}
};

} )( window.mw, jQuery );