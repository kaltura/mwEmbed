function kGoogleAnalytics ( options ){
	this.init( options );
	return this;
};
kGoogleAnalytics.prototype = {
	// List of events to be tracked
	eventTrackList: [],

	// A callback function to track what's being tracked / sent to google
	trackEventMonitor: null,

	// The target player to add event binding too
	playerElement: null,

	// The category for all the tracking events.
	trackingCategory: 'KalturaVideo',

	// pageTracker object ( if set to null async tracking is used via _gaq.push calls )
	googlePageTracker : null,

	// Local variables:
	_lastPlayHeadTime: 0,

	// last seek:
	_lastSeek: 0,

	// The Default Track List
	defaultTrackList: [
			'mediaReady',
			'doPause',
			'doPlay',
			'doStop',
			'doSeek',
			'openFullScreen',
			'closeFullScreen',
			'volumeChanged',
			// special case meta events:
			'quartiles' // quartiles an event for every 1/4 the of the video played
	],
	// The full set of notifications for kdp3 ( validates event names )
	validEventList :[
			'quartiles',
			'startUp',
			'durationChange',
			'initiatApp',
			'changeMedia',
			'cleanMedia',
			'skinLoaded',
			'skinLoadFailed',
			'entryReady',
			'entryFailed',
			'sourceReady',
			'loadMedia',
			'mediaLoading',
			'mediaReady',
			'mediaUnloaded',
			'mediaLoadError',
			'mediaError',
			'rootResize',
			'mediaViewableChange',
			'pre1start',
			'post1start',
			'doPause',
			'doPlay',
			'doPlayEntry',
			'doStop',
			'doSeek',
			'doIntelligentSeek',
			'doSwitch',
			'kdpReady',
			'kdpEmpty',
			'layoutReady',
			'playerStateChange',
			'playerReady',
			'playerContainerReady',
			'playerPaused',
			'playerPlayed',
			'playerSeekStart',
			'playerSeekEnd',
			'playerPlayEnd',
			'playerDimensionChange',
			'openFullScreen',
			'closeFullScreen',
			'changeVolume',
			'volumeChanged',
			'enableGui',
			'fastForward',
			'stopFastForward',
			'bytesDownloadedChange',
			'bytesTotalChange',
			'bufferProgress',
			'bufferChange',
			'playerDownloadComplete',
			'endEntrySession',
			'endPreSession',
			'endPostSession',
			'durationChange',
			'hasCloseFullScreen',
			'hasOpenedFullScreen',
			'switchingChange',
			'scrubberDragStart',
			'scrubberDragEnd',
			'alert',
			'showUiElement',
			'cancelAlerts',
			'enableAlerts',
			'freePreviewEnd'
	],

	/**
	 * Constructor
	 *
	 * @param options configuration object
	 * @return
	 */
	init: function( options ){
		// Map options to local "this" object
		var map = ['pageTracker', 'playerElement', 'trackingCategory', 'trackEventMonitor'];
		for( var i = 0 ; i < map.length; i++ ){
			if( options[ map[i] ] ){
				this[ map[i] ] =options[ map[i] ];
			}
		}
		// Validate the eventTrackList
		if( options.eventTrackList ){
			for( var i = 0 ; i < options.eventTrackList.length; i ++ ){
				// make sure its a valid event:
				if( this.inArray( this.validEventList, options.eventTrackList[ i ] ) ){
					this.eventTrackList.push( options.eventTrackList[ i ] );
				}
			}
		} else {
			// just use the default list:
			this.eventTrackList = this.defaultTrackList;
		}

		// Setup the initial state of some flags
		this._p25Once = false;
		this._p50Once = false;
		this._p75Once = false;
		this._p100Once = false;
		this.hasSeeked = false;
		this.lastSeek = 0;

		this.addPlayerBindings();
	},

	// Add the player bindings
	addPlayerBindings: function(){
		var _this = this;
		// add the event to the player ( assuming the jsListener is ready:
		_this.waitForAddJsListener( function(){
			for( var i = 0 ; i < _this.eventTrackList.length; i++ ){
				var eventName = _this.eventTrackList[i];
				var globalCBName = 'kga_' + eventName + '_' + _this.playerElement.id;
				// Add a global callback: ( add a closer context so the for loop context does not override.
				_this.addNamedGloablBinding( eventName,  globalCBName );
			};
		});
	},
	addNamedGloablBinding: function( eventName, globalCBName  ){
		var _this = this;
		window[ globalCBName ] = function( data ) {
			_this.playerEvent( eventName, data);
		};
		_this.playerElement.addJsListener(  _this.getEventNameBinding( eventName ), globalCBName);
	},
	waitForAddJsListener: function( callback ){
		var _this = this;
		if( typeof this.playerElement.addJsListener != 'undefined' ){
			callback();
		} else {
			setTimeout( function(){ _this.waitForAddJsListener( callback ); }, 1 );
		}
	},
	/**
	 * Handles the mapping for special case eventNames that
	 * do n't match their corresponding kaltura listener binding name
	 */
	getEventNameBinding: function( eventName ){
		switch( eventName ){
			case 'quartiles':
				return 'playerUpdatePlayhead';
			break;
		}
		return eventName;
	},
	playerEvent: function( methodName, data ){
		var trackingArgs = this.getTrackingEvent( methodName, data );
		// Don't track false events:
		if( !trackingArgs )
			return ;

		// Send the google event:
		if( this.googlePageTracker ){
			this.googlePageTracker._trackEvent.apply( trackingArgs );
		} else {
			var gaqAry = trackingArgs.slice(0);
			gaqAry.unshift( "_trackEvent" );
			window._gaq.push( gaqAry );
		}
		// Send the event to the monitor ( if set in the initial options )
		if( typeof this.trackEventMonitor == 'function'){
			this.trackEventMonitor.apply( this, trackingArgs );
		}

	},
	/**
	 * Send updates for time stats
	 */
	getQuartilesStatus: function( currentTime ) {
		this._lastPlayHeadTime = currentTime;
		// Setup local references:
		var embedPlayer = this.playerElement;
		var _this = this;
		var entryDuration = this.playerElement.evaluate('{mediaProxy.entry.duration}');

		// Set the seek and time percent:
		var percent = currentTime / entryDuration ;
		var seekPercent = this._lastSeek/ entryDuration;

		// Send updates based on logic present in StatisticsMediator.as
		if( !_this._p25Once && percent >= .25  &&  seekPercent <= .25 ) {
			_this._p25Once = true;
			return '25';
		} else if ( !_this._p50Once && percent >= .50 && seekPercent < .50 ) {
			_this._p50Once = true;
			return '50';
		} else if( !_this._p75Once && percent >= .75 && seekPercent < .75 ) {
			_this._p75Once = true;
			return '75';
		} else if(  !_this._p100Once && percent >= .98 && seekPercent < 1) {
			_this._p100Once = true;
			return '100';
		}
		return false;
	},

	getTrackingEvent: function( methodName, data ){
		var optionLabel = this.getOptionalLabel( methodName, data );
		var optionValue = this.getOptionalValue(methodName, data);
		// check for special case of 'quartiles'
		if( methodName == 'quartiles' ){
			var qStat = this.getQuartilesStatus( data );
			// Don't process the tracking event
			if( !qStat)
				return false;
			// Else set the option value to quartile value:
			optionValue = qStat;
		}

		// Special case don't track initial html5 volumeChange event ( triggered right after playback )
		// xxx this is kind of broken we need to subscribe to the interface volume updates
		// not the volumeChange event ( since html fires this at start and end of video )
		if( methodName == 'volumeChanged' && ( this._lastPlayHeadTime < .25 || this._p100Once ) ){
			return false;
		}

		var trackEvent = [
			  this.trackingCategory,
			  methodName
		];
		if( optionLabel !== null )
			trackEvent.push( optionLabel );

		if( optionValue !== null )
			trackEvent.push( optionValue );

		return trackEvent;
	},
	/**
	 * Get an optional label for the methodName and data
	 */
	getOptionalLabel: function(  methodName, data ){
		if( data.entryId ){
			return data.entryId;
		}
		// return the entry id from the embedPlayer
		var entryId = this.playerElement.evaluate( '{mediaProxy.entry.id}' );
		if( entryId )
			return entryId;

		return null;
	},
	/**
	 * Get an optional data value for the methodName
	 */
	getOptionalValue: function(  methodName, data ){
		if( methodName == 'doSeek' ){
			this._lastSeek = data;
			return data;
		}
		if( methodName == 'volumeChanged' ){
			if( data.newVolume )
				return data.newVolume;
		}
		return null;
	},
	// not dependent on jQuery so add a utility inArray function:
	inArray: function( ary,  val ) {
		for (var i =0; i < ary.length; i++ ) {
		   if (ary[i] === val) {
			  return true; // If you want the key of the matched value, change "true" to "key"
		   }
		}
		return false;
	}

};