/**
* Adds cue points support
*/
( function( mw, $ ) { "use strict";

mw.KCuePoints = function( embedPlayer ){
	return this.init( embedPlayer );
};
mw.KCuePoints.prototype = {

	// The bind postfix:
	bindPostfix: '.kCuePoints',
	midCuePointsArray: [],

	init: function( embedPlayer ){
		var _this = this;
		// Remove any old bindings:
		this.destroy();
		// Setup player ref:
		this.embedPlayer = embedPlayer;

		// Proccess cue points
		embedPlayer.bindHelper('KalturaSupport_CuePointsReady' + this.bindPostfix, function() {
			_this.processCuePoints();
			// Add player bindings:
			_this.addPlayerBindings();
		});
	},
	destroy: function(){
		$( this.embedPlayer ).unbind( this.bindPostfix );
	},
	/*
	 * Trigger Pre/Post cue points and create Mid cue points array
	 */
	processCuePoints: function() {
		var _this = this;
		var cuePoints = this.getCuePoints();
		// Create new array with midrolls only
		var newCuePointsArray = [];
		$.each( cuePoints, function( idx, cuePoint ){
			if( _this.getVideoAdType( cuePoint ) == 'pre' || _this.getVideoAdType( cuePoint ) == 'post' ) {
				_this.triggerCuePoint( cuePoint );
			} else {
				// Midroll
				newCuePointsArray.push( cuePoint );
			}
		});

		this.midCuePointsArray = newCuePointsArray;
	},
	/**
	 * Adds player cue point bindings
	 */
	addPlayerBindings: function(){
		var _this = this;
		// Get first cue point
		var currentCuePoint = this.getNextCuePoint(0);
		var embedPlayer = this.embedPlayer;

		// Don't add any bindings if no cuePoint exists )
		if( !currentCuePoint ){
			return ;
		}

		// Destroy on changeMedia
		$( embedPlayer ).bind( 'onChangeMedia' + this.bindPostfix, function(){
			_this.destroy();
		});

		// Bind for seeked event to update the nextCuePoint
		$( embedPlayer ).bind( "seeked" + this.bindPostfix, function(){
			var currentTime = embedPlayer.currentTime * 1000;
			currentCuePoint = _this.getNextCuePoint( currentTime );
		});

		// Bind to monitorEvent to trigger the cue points events
		$( embedPlayer ).bind( "monitorEvent" + this.bindPostfix, function() {
			// Check if the currentCuePoint exists
			if( ! currentCuePoint  ){
				return ;
			}

			var currentTime = embedPlayer.currentTime * 1000;
			if( currentTime > currentCuePoint.startTime && embedPlayer._propagateEvents ){
				// Make a copy of the cue point to be triggered.
				// Sometimes the trigger can result in monitorEvent being called and an
				// infinite loop ( ie ad network error, no ad received, and restore player calling monitor() )
				var cuePointToBeTriggered = $.extend( {}, currentCuePoint);
				// Update the current Cue Point to the "next" cue point
				currentCuePoint = _this.getNextCuePoint( currentTime );
				// Trigger the cue point
				_this.triggerCuePoint( cuePointToBeTriggered );
			}
		});
	},
	getEndTime: function(){
		return this.embedPlayer.evaluate('{mediaProxy.entry.msDuration}');
	},
	getCuePoints: function(){
		if( ! this.embedPlayer.rawCuePoints || ! this.embedPlayer.rawCuePoints.length ){
			return [];
		}
		return this.embedPlayer.rawCuePoints;
	},
	/**
	* Returns the next cuePoint object for requested time
	* @param {Number} time Time in milliseconds
	*/
	getNextCuePoint: function( time ){
		var cuePoints = this.midCuePointsArray;
		// Start looking for the cue point via time, return first match:
		for( var i = 0; i < cuePoints.length; i++) {
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
	triggerCuePoint: function( rawCuePoint ) {
		/**
		 *  We need different events for each cue point type
		 */
		var eventName;
		/*
		 * Evaluate cuePoint sourceURL strings ( used for VAST property substitutions ) 
		 */
		rawCuePoint.sourceUrl = this.embedPlayer.evaluate( rawCuePoint.sourceUrl );
		
		/*
		 * The cue point object is wrapped with another object that has context property.
		 * We used that property so that the different plugins will know the context of the ad
		 * In case the cue point is not a adOpportunity their will be no context
		 *
		 * This matches the KDP implementation
		 * */
		var cuePointWrapper = {
			'cuePoint' : rawCuePoint
		};
		if( rawCuePoint.cuePointType == 'codeCuePoint.Code' ) {
			// Code type cue point ( make it easier for people grepping the code base for an event )
			eventName = 'KalturaSupport_CuePointReached';
		} else if( rawCuePoint.cuePointType == 'adCuePoint.Ad' ) {
			// Ad type cue point
			eventName = 'KalturaSupport_AdOpportunity';
			cuePointWrapper.context = this.getVideoAdType( rawCuePoint );
		} else {
			// Ignore all others cue points types
			return ;
		}
		mw.log('mw.KCuePoints :: Trigger event: ' + eventName + ' - ' + rawCuePoint.cuePointType + ' at: ' + rawCuePoint.startTime );
		$( this.embedPlayer ).trigger(  eventName, cuePointWrapper );
		// TOOD "midSequenceComplete"
	},

	// Get Ad Type from Cue Point
	getVideoAdType: function( rawCuePoint ) {
		if( rawCuePoint.startTime === 0 ) {
			return 'pre';
		} else if( rawCuePoint.startTime == this.getEndTime() ) {
			return 'post';
		} else {
			return 'mid';
		}
		mw.log("Error:: KCuePoints could not determine adType");
	},
	/**
	 * Accept a cuePoint wrapper
	 * @param cuePointWrapper
	 * @return
	 */
	getAdSlotType: function( cuePointWrapper ) {
		if( cuePointWrapper.cuePoint.adType == 1 ) {
			return this.getVideoAdType( cuePointWrapper.cuePoint ) + 'roll';
		} else {
			return 'overlay';
		}
	},
	getRawAdSlotType: function( rawCuePoint ){
		if( rawCuePoint.adType == 1 ) {
			return this.getVideoAdType( rawCuePoint ) + 'roll';
		} else {
			return 'overlay';
		}
	},

	// Returns the number of CuePoints by type
	// @filter(optional) - string | one of: 'preroll', 'midroll', 'postroll', 'overlay'
	getCuePointsCount: function( filter ) {
		var _this = this;
		var cuePoints = this.getCuePoints();

		// No cue points, return zero
		if( !cuePoints )
			return 0;

		// No filter, return all cue points
		if( !filter )
			return  cuePoints.length;

		var totalResults = {
			'preroll': 0,
			'midroll': 0,
			'postroll': 0,
			'overlay': 0
		};

		$.each(cuePoints, function( idx, rawCuePoint) {
			totalResults[ _this.getRawAdSlotType( rawCuePoint ) ]++;
		});

		// return count by filter
		if( filter && totalResults[ filter ] ) {
			return totalResults[ filter ];
		}
		// anything else, return zero
		return 0;
	}
};

} )( window.mw, window.jQuery );