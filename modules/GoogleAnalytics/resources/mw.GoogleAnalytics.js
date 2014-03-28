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

		// Flag to check whether change media is done - Not send wrong quartile events before playhead is updated
		duringChangeMediaFlag: false,

		// The Default Track List
		defaultTrackList : [
			'kdpReady',
			'mediaReady',
			'doPause',
			'playerPlayed',
			'playerPlayEnd',
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

		getConfig: function( attr )  {
			return this.embedPlayer.getKalturaConfig( 'googleAnalytics', attr );
		},

		init: function( embedPlayer, callback ) {
			var _this = this;
			this.embedPlayer = embedPlayer;
			// Unbind any existing bindings
			this.embedPlayer.unbindHelper( _this.bindPostFix );

			// just use the default list:
			this.eventTrackList = this.defaultTrackList;

			var customEvents = [];
			if ( this.getConfig( 'customEvent' ) ) {
				customEvents = this.getConfig( 'customEvent' ).split( ',' );
			}

			// Remove duplicates
			$.each( customEvents, function( i ) {
				if ( $.inArray( this, _this.eventTrackList ) != -1 ) {
					customEvents.splice( i, 1 );
				}
			} );

			this.eventTrackList = $.merge( _this.eventTrackList, customEvents );

			// Setup the initial state of some flags
			this._p25Once = false;
			this._p50Once = false;
			this._p75Once = false;
			this._p100Once = false;
			this.hasSeeked = false;
			this.lastSeek = 0;
			window._gaq = window._gaq || [];
			window._gaq.push( [ '_setAccount', _this.getConfig( 'urchinCode' ) ] );
			if ( mw.getConfig( 'debug' ) ) {
				window._gaq.push( [ '_setDomainName', 'none' ] );
				window._gaq.push( [ '_setAllowLinker', true ] );
			}
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
			_this.embedPlayer.bindHelper( 'onChangeMedia' + _this.bindPostFix, function() {
				_this.embedPlayer.unbindHelper( _this.bindPostFix );
				_this.duringChangeMediaFlag = true;
			} );
			var playerAlreadyPlayed = false;
			$.each( _this.eventTrackList, function() {
				var eventName = this;
				// Disable quartiles for entries with no duration, i.e live streaming
				if ( eventName == 'quartiles' && !_this.embedPlayer.duration ) {
					return ;
				}
				var eventNameBinding = _this.getEventNameBinding( eventName );
				_this.embedPlayer.addJsListener( eventNameBinding + _this.bindPostFix, function( data ) {
					if( eventNameBinding == 'playerPlayed' ){
						if( playerAlreadyPlayed ){
							return ;
						}
						playerAlreadyPlayed = true;
					}
					_this.playerEvent( eventName, data );
					
				} );
			} );
		},

		/**
		* Handles the mapping for special case eventNames that
		* don't match their corresponding kaltura listener binding name
		*/
		getEventNameBinding: function( eventName ){
			// Explicitly casting eventName to string - iOS 4.3.1 tweak
			eventName = eventName.toString();
			switch( eventName ){
				case 'quartiles':
					return 'playerUpdatePlayhead';
				break;
			}
			return eventName;
		},

		playerEvent: function( methodName, data ) {
			var trackingArgs = this.getTrackingEvent( methodName, data );
			// Don't track false events:
			if ( !trackingArgs )
				return ;

			if( this.duringChangeMediaFlag && methodName != 'changeMedia' ){
				return ;
			}

			// if flagged a change media call disregard everything until changeMedia
			this.duringChangeMediaFlag = false;

			// Send the google event:
			if( this.googlePageTracker ){
				// Passing an array to this function doesn't seem to work. Besides, have to make sure first three args are strings and last one is integer
				this.googlePageTracker._trackEvent( trackingArgs[0], trackingArgs[1], trackingArgs[2], trackingArgs[3] );
			} else {
				var gaqAry = trackingArgs.slice(0);
				gaqAry.unshift( "_trackEvent" );
				window._gaq.push( gaqAry );
			}
			// Send the event to the monitor ( if set in the initial options )
			if ( this.getConfig( 'trackEventMonitor' ) ) {
				try{
					window.parent[ this.getConfig( 'trackEventMonitor' ) ].apply( this, trackingArgs );
				} catch ( e ){
					// error sending tracking event. 
					mw.log("Error with google track event: " + e );
				}
				
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
			if ( !_this._p25Once && percent >= .25  &&  seekPercent <= .25 ) {
				_this._p25Once = true;
				return '25';
			} else if ( !_this._p50Once && percent >= .50 && seekPercent < .50 ) {
				_this._p50Once = true;
				return '50';
			} else if ( !_this._p75Once && percent >= .75 && seekPercent < .75 ) {
				_this._p75Once = true;
				return '75';
			} else if (  !_this._p100Once && percent >= .98 && seekPercent < 1) {
				_this._p100Once = true;
				return '100';
			}
			return false;
		},

		getTrackingEvent: function( methodName, data ) {
			var optionValue;
			// check for special case of 'quartiles'
			if ( methodName == 'quartiles' ){
				var qStat = this.getQuartilesStatus( data );
				// Don't process the tracking event
				if ( !qStat ) {
					return false;
				}
				methodName = qStat + "_pct_watched";
				optionValue = this.embedPlayer.duration * parseInt( qStat ) / 100;
			}
			var optionLabel = this.getOptionalLabel( methodName, data );
			optionValue = this.getOptionalValue( methodName, data );
			// Special case don't track initial html5 volumeChange event ( triggered right after playback )
			// xxx this is kind of broken we need to subscribe to the interface volume updates
			// not the volumeChange event ( since html fires this at start and end of video )
			if ( methodName == 'volumeChanged' && ( this._lastPlayHeadTime < .25 || this._p100Once ) ){
				return false;
			}

			var eventCategory = this.trackingCategory;
			var eventAction = methodName;
			var customEvents = [];

			if ( this.getConfig( 'customEvent') ) {
				customEvents = this.getConfig( 'customEvent').split( ',' );
				if ( $.inArray( methodName, customEvents ) != -1 ) {
					if ( this.getConfig( methodName + "Category" ) ) {
						eventCategory = this.getConfig( methodName + "Category" );
					}
					if ( this.getConfig( methodName + "Action" ) ) {
						eventAction = this.getConfig( methodName + "Action" );
					}
				}
			}
			var trackEvent = [
				eventCategory.toString(),
				eventAction.toString()
			];

			if ( optionLabel !== null )
				trackEvent.push( optionLabel.toString() );

			if ( optionValue !== null )
				trackEvent.push( parseInt( optionValue ) );

			return trackEvent;
		},

        /**
         * Get an optional label for the methodName and data
         */
        getOptionalLabel: function( methodName, data ) {
            methodName = methodName.toString();
            var clipTitle = ( this.embedPlayer.kalturaPlayerMetaData && this.embedPlayer.kalturaPlayerMetaData.name ) ? this.embedPlayer.kalturaPlayerMetaData.name : '';
            var entryId = this.embedPlayer.kentryid;
            var widgetId = this.embedPlayer.kwidgetid;
            var refId = this.embedPlayer.kalturaPlayerMetaData.referenceId;
            var refString = "";
            if(refId && this.getConfig('sendRefId') == true)
                refString = refId + "|";
            var customEvents = [];
            if ( this.getConfig( 'customEvent' ) ) {
                customEvents = this.getConfig( 'customEvent' ).split( ',' );
                if ( $.inArray( methodName, customEvents ) != -1 ) {
                    if ( this.getConfig( methodName + "Label" ) ) {
                        return this.getConfig( methodName + "Label" );
                    }
                }

            }
            return ( refString + clipTitle + "|" + entryId + "|" + widgetId );
        },

		/**
		* Get an optional data value for the methodName
		*/
		getOptionalValue: function(  methodName, data ) {
			methodName = methodName.toString();
			if( methodName == 'doSeek' || methodName.indexOf( 'pct_watched') != -1 ){
				this._lastSeek = this.embedPlayer.currentTime;
				return this._lastSeek;
			}
			if ( methodName == 'volumeChanged' ){
				if ( data.newVolume )
					return data.newVolume;
			}
			var customEvents = [];
			if ( this.getConfig( 'customEvent' ) ) {
				customEvents = this.getConfig( 'customEvent' ).split( ',' );
				if ( $.inArray( methodName, customEvents ) != -1 ) {
					if ( this.getConfig( methodName + "Value" ) ) {
						return this.getConfig( methodName + "Value" );
					}
				}
			}

			if( $.inArray( methodName, this.defaultValueEventList ) != -1 ) {
				return 1;
			}
			return null;
		}
	};
})( window.mw, window.jQuery );
