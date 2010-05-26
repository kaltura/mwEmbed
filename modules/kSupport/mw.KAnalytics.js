/**
* Kaltura style analytics reporting class
*/


//Global mw.addKAnalytics manager
var mwKAnalyticsManager = {};
mw.addKAnalytics = function( embedPlayer ) {
	mwKAnalyticsManager[ embedPlayer.id ] = new mw.KAnalytics( embedPlayer ) ;
} 

// KAnalytics Constructor
mw.KAnalytics = function( embedPlayer ){
	this.init( 	embedPlayer );
}

mw.KAnalytics.prototype = {

	// The version of kAnalytics
	version : '0.1',
	
	// Local refrance to embedPlayer
	embedPlayer: null,
	
	// Report Set object
	reportSet : null,
	
	// Stores the last time we issued a seek event
	// avoids sending lots of seeks while scrubbing 
	lastSeekEventTime: 0,
	
	/** 
	* Constructor for kAnalytics
	* @param {Object} embedPlayer Player to apply Kaltura analytics to. 
	*/
	init: function( embedPlayer ) {
	
		// Setup the local reference to the embed player
		this.embedPlayer = embedPlayer;
		
		// Setup the initial state of some flags
		this._p25Once = false;
		this._p50Once = false;
		this._p75Once = false;
		this._p100Once = false;
		this.hasSeeked = false;
		this.lastSeek = 0;
		
		// Add relevant hooks for reporting beacons
		this.addPlayerHooks();		
	},
	
	/**
	* Get the current report set
	* @param {Number} KalturaStatsEventType The eventType number.
	*/
	sendStatsEvent: function( KalturaStatsEventKey ){		
		// Check if we have a monitorAnalytics callback 
		if( typeof mw.getConfig( 'kalturaAnalyticsCallbackLog' ) == 'function' ) {
			mw.getConfig( 'kalturaAnalyticsCallbackLog' )( KalturaStatsEventKey );
		}
		var eventKeyId = KalturaStatsEventType[ KalturaStatsEventKey ];
		// Generate the reportSet
		var reportSet = {
			'event:eventType' :	eventKeyId,
					
			'action' : 'collect',
			'clientTag' : 'mwEmbed.kAnalytics.html5',
			'event:clientVer' : this.version,
			'event:currentPoint' : 	this.embedPlayer.currentTime * 1000,
			'event:duration' :	this.embedPlayer.getDuration(),
			'event:eventTimestamp' : new Date().getTime(),			
			'event:isFirstInSession' : 'false',
			'event:objectType' : 'KalturaStatsEvent',
			'event:partnerId' :	mw.getConfig( 'kPartnerId' ),			
			'event:sessionId' : mw.getConfig( 'kSessionId' ),
			'event:uiconfId' : 0,
			'ignoreNull' : 1,
			'ks' : mw.getConfig( 'kalturaKS' ),
			'service' : 'stats'	
		};		
		// Set the seek condition: 
		reportSet[ 'event:seek' ] = ( this.hasSeeked ) ? 'true' : 'false';
		
		// Set the 'event:entryId'
		if( $j( this ).attr( 'kentryid' ) ){
			reportSet[ 'event:entryId' ] = 	 $j( this ).attr( 'kentryid' );
		} else { 
			// if kentryid is not set, use the selected source url
			reportSet[ 'event:entryId' ] = this.embedPlayer.getSrc();
		}			
		
		// Add the kalturaStats container if missing. 
		if( $j( '#kalturaStats_' + this.embedPlayer.id ).length == 0 ){
			$j( 'body').append( 
				$j('<div />').attr( {
					'id' : 'kalturaStats_' + this.embedPlayer.id
				} )
				.hide()
			);		
		}		
		// Append the image to the hidden kalturaStats div
		var reportUrl = 
			( $j( this.embedPlayer ).attr( 'kalturaStatsServer') ) ?
			$j( this.embedPlayer ).attr( 'kalturaStatsServer') : 
			mw.getConfig( 'kalturaStatsServer' );

		// Add the reportSet to the url : 
		reportUrl+= '?' + $j.param( reportSet );
		
		$j( '#kalturaStats_' + this.embedPlayer.id ).append( 
			$j('<img />').attr( 'src', reportUrl )
		);
	},
	
	/**
	* Adds the hooks for the player stats reporting 
	*/ 
	addPlayerHooks: function(){
	
		// Setup local reference to embedPlayer
		var embedPlayer = this.embedPlayer;
		var _this = this;
		
		// Setup shortcut anonymous function for player bindings
		var b = function( hookName, eventType ){
			$j( _this.embedPlayer ).bind( hookName, function(){
				_this.sendStatsEvent( eventType )
			});
		};
		
		// When the player is ready
		b( 'playerReady', 'WIDGET_LOADED' );
		
		// When the poster or video ( when autoplay ) media is loaded 
		b( 'mediaLoaded', 'MEDIA_LOADED' );
		
		// When the play button is pressed or called from javascript			
		b( 'playEvent', 'PLAY' );
	
		// When the show Share menu is displayed
		b( 'showShareEvent', 'OPEN_VIRAL' );
		
		// When the show download menu is displayed 
		b( 'showDownloadEvent', 'OPEN_DOWNLOAD' );
		
		// When the clip starts to buffer ( not all player types )
		b( 'bufferStartEvent', 'BUFFER_START' );
		
		// When the clip is full bufferd
		b( 'bufferEndEvent', 'BUFFER_END' );
		
		// When the fullscreen button is pressed  
		//( presently does not register iphone / ipad until it has js bindings )
		b( 'openFullScreenEvent', 'OPEN_FULL_SCREEN' );
		
		// When the close fullscreen button is pressed.
		//( presently does not register iphone / ipad until it has js bindings ) 
		b( 'closeFullScreenEvent', 'CLOSE_FULL_SCREEN' );
		
		// When the user plays (after the ondone event was fired ) 
		b( 'replayEvent', 'REPLAY' );	
	
		// Bind on the seek event ( actual HTML5 binding ) 
		$j( embedPlayer ).bind( 'onSeek', function( seekTarget ) {
			// Don't send a bunch of seeks on scrub:
			if( _this.lastSeekEventTime == 0 || 
				_this.lastSeekEventTime + 2000	< new Date().getTime() )
			{
				_this.sendStatsEvent( 'SEEK' ); 
			}
			mw.log("lsk:" + _this.lastSeekEventTime + ' npw: ' +  new Date().getTime());
			// Update the last seekTime
			_this.lastSeekEventTime =  new Date().getTime();
			
			// Then set local seek flags 
			this.hasSeeked = true;		
			this.lastSeek = seekTarget;	
		} );
		
		// Let updateTimeStats handle the currentTime monitor timing 

		$j( embedPlayer ).bind( 'monitorEvent', function(){
			_this.updateTimeStats();			
		}); 
				
		// Not usable in the html5 player at this point in time:
		/*		
			KalturaStatsEventType.OPEN_EDIT = 8;
			KalturaStatsEventType.OPEN_REPORT = 11;
			KalturaStatsEventType.OPEN_UPLOAD = 18;
			KalturaStatsEventType.SAVE_PUBLISH = 19;
			KalturaStatsEventType.CLOSE_EDITOR = 20;
			
			KalturaStatsEventType.PRE_BUMPER_PLAYED = 21;
			KalturaStatsEventType.POST_BUMPER_PLAYED = 22;
			KalturaStatsEventType.BUMPER_CLICKED = 23;
			
			KalturaStatsEventType.FUTURE_USE_1 = 24;
			KalturaStatsEventType.FUTURE_USE_2 = 25;
			KalturaStatsEventType.FUTURE_USE_3 = 26;
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
		if( !_this._p25Once && percent >= .25  &&  seekPercent <= .25 ) {
					
			_this._p25Once = true;			
			_this.sendStatsEvent( 'PLAY_REACHED_25' );
									
		} else if ( !_this._p50Once && percent >= .50 && seekPercent < .50 ) {
		
			_this._p50Once = true;
			_this.sendStatsEvent( 'PLAY_REACHED_50' );
						
		} else if( !_this._p75Once && percent >= .75 && seekPercent < .75 ) {
			
			_this._p75Once = true;
			_this.sendStatsEvent( 'PLAY_REACHED_75' );
			
		} else if(  !_this._p100Once && percent >= .98 && seekPercent < 1) {
			
			_this._p100Once = true;
			_this.sendStatsEvent( 'PLAY_REACHED_100' );
			
		}		
	}
}
