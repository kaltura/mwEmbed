/**
uiConf Examples:
<Plugin id="googleAnalytics" visualDebug="false” path="googleAnalyticsPlugin.swf" width="0%" height="0%" loadingPolicy="wait" urchinCode="UA-30149691-1"/> 
<Plugin id="googleAnalytics" visualDebug="false” path="googleAnalyticsPlugin.swf" customEvent=”doPlay” width="0%" height="0%" loadingPolicy="wait" urchinCode="UA-30149691-1"/>
<Plugin id="googleAnalytics" visualDebug="false” path="googleAnalyticsPlugin.swf" customEvent=”doPlay,playerStateChange,addThis” addThisCategory=”My AddThis Category” addThisAction=”My AddThis Action” addThisLabel=”My AddThis Label” addThisValue=”1” width="0%" height="0%" loadingPolicy="wait" urchinCode="UA-30149691-1"/> 
**/
( function( mw, $ ) {"use strict";
	mw.GoogleAnalytics = function( embedPlayer, callback ) {
		return this.init( embedPlayer, callback );
	}
	
	mw.GoogleAnalytics.prototype = {
		
		// Bind PostFix
		bindPostFix : '.googleAnalytics',
		
		// List of events to be tracked
		eventTrackList : [], 
	
		// A callback function to track what's being tracked / sent to google 
		trackEventMonitor : null,

		// The target player to add event binding too
		embedPlayer : null,

		// The category for all the tracking events. 
		trackingCategory : 'Kaltura Video Events',

		// pageTracker object ( if set to null async tracking is used via _gaq.push calls )
		googlePageTracker : null,

		// Local variables: 
		_lastPlayHeadTime : 0,

		// last seek:
		_lastSeek : 0,

		// The Default Track List
		defaultTrackList : [
			'kdpReady',
			'mediaReady',
			'doPause',
			'doPlay',
			'doStop',
			'doSeek',
			'doDownload',
			'changeMedia',
			'openFullScreen',
			'closeFullScreen',
			// special case meta events:
			'quartiles' // quartiles an event for every 1/4 the of the video played*/
		],

		// The full set of notifications for kdp3 ( validates event names ) 
		validEventList : [  
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
		
		defaultValueEventList : [
			'openFullScreen',
			'closeFullScreen',
			'changeMedia',
			'doPlay',
			'doPause',
			'doSeek',
			'doDownload'
		],

        init: function( embedPlayer, callback ) {
            var _this = this;
			this.embedPlayer = embedPlayer;
			// Unbind any existing bindings
			this.embedPlayer.unbindHelper( _this.bindPostfix );
			var options = this.embedPlayer.getKalturaConfig( 'googleAnalytics' );
			// Validate the eventTrackList
			if( options.eventTrackList ) {
				for( var i = 0 ; i < options.eventTrackList.length; i ++ ) {
					// make sure its a valid event: 
					if( this.inArray( this.validEventList, options.eventTrackList[ i ] ) ) {
						this.eventTrackList.push( options.eventTrackList[ i ] );
					}
				}
			} else {
				// just use the default list: 
				this.eventTrackList = this.defaultTrackList;
			}
			
			if( options.trackEventMonitor && window.parent[ options.trackEventMonitor ] ) {
				this.trackEventMonitor = window.parent[ options.trackEventMonitor ];
			}

			// Setup the initial state of some flags
			this._p25Once = false;
			this._p50Once = false;
			this._p75Once = false;
			this._p100Once = false;
			this.hasSeeked = false;
			this.lastSeek = 0;
			window._gaq = window._gaq || [];
			window._gaq.push( [ '_setAccount', options.urchinCode ] );
			window._gaq.push(['_setDomainName', 'none']);
			window._gaq.push(['_setAllowLinker', true]);
			window._gaq.push( [ '_trackPageview' ] );

			var ga = document.createElement( 'script' );
			ga.type = 'text/javascript';
			ga.async = true;
			ga.src = ('https:' == document.location.protocol ? 'https://ssl' : 'http://www') + '.google-analytics.com/ga.js';
			var s = document.getElementsByTagName('script')[0]; 
			s.parentNode.insertBefore(ga, s);

			this.addPlayerBindings();
			callback();
        },
		
		// Add the player bindings 
		addPlayerBindings: function(){
			var _this = this;
			$.each( _this.eventTrackList, function() {
				var eventName = this;
				var eventNameBinding = _this.getEventNameBinding( eventName );
				_this.embedPlayer.addJsListener( eventNameBinding + _this.bindPostFix, function( data ) {
					_this.playerEvent( eventName, data );
				} );
			} );
		},
		
		/**
		* Handles the mapping for special case eventNames that 
		* don't match their corresponding kaltura listener binding name 
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
			var _this = this;
			var entryDuration = this.embedPlayer.duration;

			// Set the seek and time percent:
			var percent = currentTime / entryDuration ;
			var seekPercent = this._lastSeek / entryDuration;

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
			var optionValue = this.getOptionalValue( methodName, data );
			// check for special case of 'quartiles'
			if( methodName == 'quartiles' ){				
				var qStat = this.getQuartilesStatus( data );
				// Don't process the tracking event
				if( !qStat)
					return false;
				methodName = qStat + "_pct_watched";
				optionValue = this.embedPlayer.duration * parseInt( qStat ) / 100;
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
				trackEvent.push( parseInt( optionValue ) );

			return trackEvent;
		},
		
		/**
		* Get an optional label for the methodName and data
		*/
		getOptionalLabel: function(  methodName, data ) {
			var clipTitle = this.embedPlayer.kalturaPlayerMetaData.name;
			var entryId = this.embedPlayer.kentryid;
			var widgetId = this.embedPlayer.kwidgetid;
			return ( clipTitle + "|" + entryId + "|" + widgetId );
		},
		
		/**
		* Get an optional data value for the methodName
		*/
		getOptionalValue: function(  methodName, data ){
			if( methodName == 'doSeek' ){
				this._lastSeek = this.embedPlayer.currentTime;
				return this._lastSeek;
			}
			if( methodName == 'volumeChanged' ){
				if( data.newVolume )
					return data.newVolume;
			}
			if( this.inArray( this.defaultValueEventList, methodName ) ) {
				return 1;
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
})( window.mw, window.jQuery );