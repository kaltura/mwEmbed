/**
 * Kaltura style analytics reporting class
 */
( function( mw, $ ) { "use strict";

// Avoid undefined symbol for javascript response "Kaltura" from the api
window['Kaltura'] = true;

// KAnalytics Constructor
mw.KAnalytics = function( embedPlayer ){
	this.init( embedPlayer );
};

// Add analytics to the embed player:
mw.addKAnalytics = function( embedPlayer ) {
	embedPlayer.kAnalytics = new mw.KAnalytics( embedPlayer );
}
mw.KAnalytics.prototype = {

	// Local reference to embedPlayer
	embedPlayer: null,

	// Report Set object
	reportSet : null,

	// Stores the last time we issued a seek event
	// avoids sending lots of seeks while scrubbing
	lastSeekEventTime: 0,

	bindPostFix: '.kAnalytics',

	// Start Time
	startReportTime: 0,

	//delay the stats call in x sec
	delay:0,

    histroyEvent : {},
    histroyEventCount:{},
	kEventTypes : {
		'WIDGET_LOADED' : 1,
		'MEDIA_LOADED' : 2,
		'PLAY' : 3,
		'PLAY_REACHED_25' : 4,
		'PLAY_REACHED_50' : 5,
		'PLAY_REACHED_75' : 6,
		'PLAY_REACHED_100' : 7,
		'OPEN_EDIT' : 8,
		'OPEN_VIRAL' : 9,
		'OPEN_DOWNLOAD' : 10,
		'OPEN_REPORT' : 11,
		'BUFFER_START' : 12,
		'BUFFER_END' : 13,
		'OPEN_FULL_SCREEN' : 14,
		'CLOSE_FULL_SCREEN' : 15,
		'REPLAY' : 16,
		'SEEK' : 17,
		'OPEN_UPLOAD' : 18,
		'SAVE_PUBLISH' : 19,
		'CLOSE_EDITOR' : 20,
		'PRE_BUMPER_PLAYED' : 21,
		'POST_BUMPER_PLAYED' : 22,
		'BUMPER_CLICKED' : 23,
		'FUTURE_USE_1' : 24,
		'FUTURE_USE_2' : 25,
		'FUTURE_USE_3' : 26
	},

	/**
	 * Constructor for kAnalytics
	 *
	 * @param {Object}
	 *		  embedPlayer Player to apply Kaltura analytics to.
	 * @parma {Object}
	 * 			kalturaClient Kaltura client object for the api session.
	 */
	init: function( embedPlayer ) {
		var _this = this;
		// set the version of html5 player
		this.version = mw.getConfig( 'version' );
        if (!mw.KAnalytics.totalEventCount)  {
            mw.KAnalytics.totalEventCount = 0;
        }
		// Setup the local reference to the embed player
		this.embedPlayer = embedPlayer;
		if( ! this.kClient ) {
			this.kClient = mw.kApiGetPartnerClient( embedPlayer.kwidgetid );
			this.delay = this.embedPlayer.getKalturaConfig( 'statistics' , 'delay' ) ? this.embedPlayer.getKalturaConfig( 'statistics' , 'delay' ) * 1000 : 0;
		}
		// Remove any old bindings:
		$( embedPlayer ).unbind( this.bindPostFix );

		$( embedPlayer ).bind( 'playerReady' + this.bindPostFix, function(){
			// Setup the initial state of some flags
			_this.resetPlayerflags();
		});

        $( embedPlayer ).bind( 'changeMedia' + this.bindPostFix, function() {
            // Setup the initial state of some flags
            _this.histroyEvent = {};
            _this.histroyEventCount = {};
        });

		// Add relevant hooks for reporting beacons
		this.bindPlayerEvents();
	},
	resetPlayerflags:function(){
		this._p25Once = false;
		this._p50Once = false;
		this._p75Once = false;
		this._p100Once = false;
		this.hasSeeked = false;
		this.lastSeek = 0;
    },
	/**
	 * Get the current report set
	 *
	 * @param {Number}
	 *			KalturaStatsEventType The eventType number.
	 */
	sendAnalyticsEvent: function( KalturaStatsEventKey ){
		var _this = this;
		mw.log("KAnalytics :: doSendAnalyticsEvent > " + KalturaStatsEventKey );
		// Kalutra analytics does not collect info for ads:
		if( this.embedPlayer.evaluate('{sequenceProxy.isInSequence}') ){
			return ;
		}

		// get the id for the given event:
		var eventKeyId = this.kEventTypes[ KalturaStatsEventKey ];
		// Generate the status event
		var eventSet = {
			'eventType'			: eventKeyId,
			'clientVer'			: this.version,
			'currentPoint'		: parseInt( this.embedPlayer.currentTime * 1000 ),
			'duration'			: this.embedPlayer.getDuration(),
			'eventTimestamp'	: new Date().getTime(),
			'isFirstInSession'	: 'false',
			'objectType'		: 'KalturaStatsEvent',
			'partnerId'			: this.embedPlayer.kpartnerid,
			'sessionId'			: this.embedPlayer.evaluate('{configProxy.sessionId}'),
			'uiconfId'			: 0
		};
		if( isNaN( eventSet.duration )  ){
			eventSet.duration = 0;
		}

		// Set the seek condition:
		eventSet[ 'seek' ] = ( this.hasSeeked ) ? 'true' : 'false';

		// Set the 'event:entryId'
		if( this.embedPlayer.kentryid ){
			eventSet[ 'entryId' ] = this.embedPlayer.kentryid;
		} else {
			// if kentryid is not set, use the selected source url
			eventSet[ 'entryId' ] = this.embedPlayer.getSrc();
		}

        if (this.histroyEvent[eventSet[ 'entryId' ]]   == null)
        {
            this.histroyEvent[eventSet[ 'entryId' ]] = [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0];
        }

        if (this.histroyEventCount[eventSet[ 'entryId' ]]   == null)
        {
            this.histroyEventCount[eventSet[ 'entryId' ]] = 0;
        }
        this.histroyEvent[eventSet[ 'entryId' ]][eventKeyId - 1] = 1;
        this.histroyEventCount[eventSet[ 'entryId' ]]++;
        mw.KAnalytics.totalEventCount++;

        eventSet[ 'historyEvents' ] = this.histroyEvent[eventSet[ 'entryId' ]].join('') + '-' + this.histroyEventCount[eventSet[ 'entryId' ]] + '-' + mw.KAnalytics.totalEventCount ;
        // Set the 'event:uiconfId'
		if( this.embedPlayer.kuiconfid ) {
			eventSet[ 'uiconfId' ] = this.embedPlayer.kuiconfid;
		}
		// Set the 'event:widgetId'
		if( this.embedPlayer.kwidgetid ) {
			eventSet[ 'widgetId' ] = this.embedPlayer.kwidgetid;
		}
		var flashVarEvents = {
				'playbackContext' : 'contextId',
				'originFeature' : 'featureType',
				'applicationName' : 'applicationId',
				'userId' : 'userId'
		}
		// support legacy ( deprecated ) top level config
		for( var fvKey in flashVarEvents){
			if( this.embedPlayer.getKalturaConfig( '', fvKey ) ){
				eventSet[ flashVarEvents[ fvKey ] ] = encodeURIComponent( this.embedPlayer.getKalturaConfig('', fvKey ) );
			}
		}
		// check for the vars in the correct location:
		for( var fvKey in flashVarEvents){
			if( this.embedPlayer.getKalturaConfig( 'statistics', fvKey ) ){
				eventSet[ flashVarEvents[ fvKey ] ] = encodeURIComponent( this.embedPlayer.getKalturaConfig('statistics', fvKey ) );
			}
		}
		// hideUserId will remove the userId from the analytics call EVEN if the embed code sends one (unless hashedUserId is in use)
		if(this.embedPlayer.getKalturaConfig( 'statistics' , 'hideUserId') && eventSet.userId){
			delete(eventSet.userId);
		}

		// Add referrer parameter
		var pageReferrer =  mw.getConfig('EmbedPlayer.IsFriendlyIframe') ? mw.getConfig('EmbedPlayer.IframeParentUrl') : document.referrer;
		eventSet[ 'referrer' ] = encodeURIComponent( pageReferrer );

		// Add in base service and action calls:
		var eventRequest = {'service' : 'stats', 'action' : 'collect'};
		// Add event parameters
		for( var i in eventSet){
			eventRequest[ 'event:' + i] = eventSet[i];
		}

		var kanalonyConfig = this.embedPlayer.getKalturaConfig( 'kAnalony' );
		if (kanalonyConfig && kanalonyConfig.plugin ){
			eventRequest[ 'hasKanalony' ] = true;
		}

		// Send events for this player:
		$( this.embedPlayer ).trigger( 'KalturaSendAnalyticEvent', [ KalturaStatsEventKey, eventSet ] );

		// check for defined callback: 
		var parentTrackName = this.embedPlayer.getKalturaConfig( 'statistics', 'trackEventMonitor');
		if(  mw.getConfig('EmbedPlayer.IsFriendlyIframe') ){
			try {
				if( window.parent[ parentTrackName ] ){
					 window.parent[ parentTrackName ]( KalturaStatsEventKey, eventSet );
				}
			} catch( e ){
				// error in calling parent page event
			}
		}
		//hideKS is an attribute that will prevent the request from sending the KS even if the embed code receives one
		if (this.embedPlayer.getFlashvars('ks') && !this.embedPlayer.getKalturaConfig( 'statistics' , 'hideKs') ){
			eventRequest['ks'] = this.embedPlayer.getFlashvars('ks');
		}

		// Do the api request:
		if (this.delay) {
			setTimeout( function () {
				_this.kClient.doRequest( eventRequest , null , true );
			} , this.delay );
		} else {
			this.kClient.doRequest( eventRequest , null , true );
		}
	},

	/**
	 * Binds player events for analytics reporting
	 */
	bindPlayerEvents: function(){

		// Setup local reference to embedPlayer
		var embedPlayer = this.embedPlayer;
		var _this = this;

		// Setup shortcut anonymous function for player bindings
		var b = function( hookName, eventType ){
			$( _this.embedPlayer ).bind( hookName + _this.bindPostFix, function(){
				_this.sendAnalyticsEvent( eventType );
			});
		};

		// When the player is ready
		b( 'widgetLoaded', 'WIDGET_LOADED' );

		// When the poster or video ( when autoplay ) media is loaded
		b( 'KalturaSupport_EntryDataReady', 'MEDIA_LOADED' );

		// When the play button is pressed or called from javascript
		b( 'firstPlay', 'PLAY' );

		// When the show Share menu is displayed
		b( 'showShareEvent', 'OPEN_VIRAL' );

		// When the show download menu is displayed
		b( 'downloadMedia', 'OPEN_DOWNLOAD' );

		// When the clip starts to buffer ( not all player types )
		b( 'bufferStartEvent', 'BUFFER_START' );

		// When the clip is full buffered
		b( 'bufferEndEvent', 'BUFFER_END' );

		// When the fullscreen button is pressed
		// ( presently does not register iPhone / iPad until it has js bindings )
		b( 'onOpenFullScreen', 'OPEN_FULL_SCREEN' );

		// When the close fullscreen button is pressed.
		// ( presently does not register iphone / ipad until it has js bindings )
		b( 'onCloseFullScreen', 'CLOSE_FULL_SCREEN' );

		// When the user plays (after the ondone event was fired )
		b( 'replayEvent', 'REPLAY' );

		// Bind on the seek event
		$( embedPlayer ).bind( 'seeked' + this.bindPostFix, function( seekTarget ) {
			// Don't send a bunch of seeks on scrub:
			if( _this.lastSeekEventTime == 0 ||
				_this.lastSeekEventTime + 2000	< new Date().getTime() )
			{
				_this.sendAnalyticsEvent( 'SEEK' );
			}

			// Update the last seekTime
			_this.lastSeekEventTime =  new Date().getTime();

			// Then set local seek flags
			this.hasSeeked = true;
			this.lastSeek = seekTarget;
		} );

		// Let updateTimeStats handle the currentTime monitor timing

		$( embedPlayer ).bind( 'monitorEvent' + this.bindPostFix, function(){
			_this.updateTimeStats();
		});


		/*
		 * Other kaltura event types that are presently not usable in the
		 * html5 player at this point in time:
		 *
		 * OPEN_EDIT = 8;
		 * OPEN_REPORT = 11;
		 * OPEN_UPLOAD = 18;
		 * SAVE_PUBLISH = 19;
		 * CLOSE_EDITOR = 20;
		 *
		 * PRE_BUMPER_PLAYED = 21;
		 * POST_BUMPER_PLAYED = 22;
		 * BUMPER_CLICKED = 23;
		 *
		 * FUTURE_USE_1 = 24;
		 * FUTURE_USE_2 = 25;
		 * FUTURE_USE_3 = 26;
		 */
	},

	/**
	 * Send updates for time stats
	 */
	updateTimeStats: function() {
		// Setup local references:
		var embedPlayer = this.embedPlayer;
		var _this = this;

		// Set the seek and time percent:
		var percent = embedPlayer.currentTime / embedPlayer.duration;
		var seekPercent = this.lastSeek/ embedPlayer.duration;

		// Send updates based on logic present in StatisticsMediator.as
		if ( !embedPlayer.isLive() ){
			if( !_this._p25Once && percent >= .25  &&  seekPercent <= .25 ) {

				_this._p25Once = true;
				_this.sendAnalyticsEvent( 'PLAY_REACHED_25' );
				$( embedPlayer ).trigger( "firstQuartile" );

			} else if ( !_this._p50Once && percent >= .50 && seekPercent < .50 ) {

				_this._p50Once = true;
				_this.sendAnalyticsEvent( 'PLAY_REACHED_50' );
				$( embedPlayer ).trigger( "secondQuartile" );

			} else if( !_this._p75Once && percent >= .75 && seekPercent < .75 ) {

				_this._p75Once = true;
				_this.sendAnalyticsEvent( 'PLAY_REACHED_75' );
				$( embedPlayer ).trigger( "thirdQuartile" );

			} else if(  !_this._p100Once && percent >= .98 && seekPercent < 1) {

				_this._p100Once = true;
				_this.sendAnalyticsEvent( 'PLAY_REACHED_100' );
			}
		}
	}
};

})( window.mw, window.jQuery );