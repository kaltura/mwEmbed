/**
* Adds cue points support
*/
( function( mw, $ ) {
	
mw.KCuePoints = function( embedPlayer ){
	return this.init( embedPlayer );
};
mw.KCuePoints.prototype = {
		
	// the bind postfix:
	bindPostfix: '.kCuePoints',
	
	init: function( embedPlayer ){
		this.embedPlayer = embedPlayer;
		this.addPlayerBindings();
	},
	destroy: function(){
		$(this.embedPlayer).unbind( this.bindPostfix );
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
		$( embedPlayer ).bind( "monitorEvent" + this.bindPostfix, function() {
			var currentTime = embedPlayer.currentTime * 1000;
			var cuePointType = _this.getRawAdSlotType(nextCuePoint);
			// Don't trigger postrolls
			// TODO: we should remove preroll / postroll from the cuePoints array and handle them different
			if( currentTime >= nextCuePoint.startTime && cuePointType != 'postroll' && embedPlayer._propagateEvents ) {
				// Trigger the cue point
				_this.triggerCuePoint( nextCuePoint );
				// Get next cue point
				nextCuePoint = _this.getCuePoint( currentTime );
			}
		});

		// Handle last cue point (postRoll)
		$( embedPlayer ).bind( "ended" + this.bindPostfix, function(){
			var cuePoints = _this.getCuePoints();
			var lastCuePoint = cuePoints[ cuePoints.length - 1];
			if( lastCuePoint.startTime >= _this.getEndTime() ) {
				// Found postRoll, trigger cuePoint
				_this.triggerCuePoint( lastCuePoint );
			}
		});

		// Bind for seeked event to update the nextCuePoint
		$( embedPlayer ).bind( "seeked" + this.bindPostfix, function(){
			var currentTime = embedPlayer.currentTime * 1000;
			nextCuePoint = _this.getCuePoint(currentTime);
		});

		$( embedPlayer ).bind( 'onChangeMedia' + this.bindPostfix, function(){
			_this.destroy();
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
	getCuePoint: function( time ){
		var cuePoints = this.getCuePoints();
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
			cuePointWrapper.context = this.getAdType( rawCuePoint );
		}
		mw.log('mw.KCuePoints :: Trigger event: ' + eventName + ' - ' + rawCuePoint.cuePointType + ' at: ' + rawCuePoint.startTime );
		$( this.embedPlayer ).trigger(  eventName, cuePointWrapper );
	},
	
	// Get Ad Type from Cue Point
	getAdType: function( rawCuePoint ) {
		if( rawCuePoint.startTime == 1 ) {
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
			return this.getAdType( cuePointWrapper.cuePoint ) + 'roll';
		} else {
			return 'overlay';
		}
	},
	getRawAdSlotType: function( rawCuePoint ){
		if( rawCuePoint.adType == 1 ) {
			return this.getAdType( rawCuePoint ) + 'roll';
		} else {
			return 'overlay';
		}
	},

	// Returns the number of Ads
	// @filter - string/optional | could be 'video', 'overlay'
	getTotalAdsCount: function( filter ) {
		var cuePoints = this.getCuePoints();
		if( !cuePoints )
			return 0;

		var totalVideoAds = 0;
		var totalOverlayAds = 0;

		$.each(cuePoints, function( idx, rawCuePoint) {
			if(rawCuePoint.cuePointType == 'adCuePoint.Ad') {
				if( rawCuePoint.adType == 1 ) {
					totalVideoAds++;
				} else {
					totalOverlayAds++;
				}
			}
		});

		var totalAllAds = totalVideoAds + totalOverlayAds;

		if( filter ) {
			if( filter == 'video' ) {
				return totalVideoAds;
			} else if( filter == 'overlay' ) {
				return totalOverlayAds;
			}
		}

		return  totalAllAds;
	}
};

} )( window.mw, window.jQuery );