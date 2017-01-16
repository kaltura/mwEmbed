(function (mw, $) {
	"use strict";

	mw.UniversalAnalytics = function (embedPlayer, callback) {
		return this.init(embedPlayer, callback);
	}

	mw.UniversalAnalytics.prototype = {

		// Bind PostFix
		bindPostFix: '.universalAnalytics',

		// List of events to be tracked
		eventTrackList: [],

		// A callback function to track what's being tracked / sent to google
		trackEventMonitor: null,

		// The target player to add event binding too
		embedPlayer: null,

		// The category for all the tracking events.
		trackingCategory: 'Kaltura Video Events',

		googlePageTracker: null,

		// Local variables:
		_lastPlayHeadTime: 0,

		// last seek:
		_lastSeek: 0,

		// Flag to check whether change media is done - Not send wrong quartile events before playhead is updated
		duringChangeMediaFlag: false,

		// The Default Track List
		defaultTrackList: [
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

		defaultValueEventList: [
			'openFullScreen',
			'closeFullScreen',
			'changeMedia',
			'doPlay',
			'doPause',
			'doSeek',
			'doDownload'
		],

		interactiveEventList: [
			'doSeek',
			'playerPlayed',
			'doPause'
		],

		getConfig: function (attr) {
			return this.embedPlayer.getKalturaConfig('universalAnalytics', attr);
		},

		init: function (embedPlayer, callback) {
            var _this = this;
            this.embedPlayer = embedPlayer;
            // Unbind any existing bindings
            this.embedPlayer.unbindHelper(_this.bindPostFix);

			window.ga=window.ga||function(){(ga.q=ga.q||[]).push(arguments)};ga.l=+new Date;
			var UAInclude  = window.document.createElement('script');
			UAInclude.async = true;
			UAInclude.src = 'https://www.google-analytics.com/analytics.js';

			var script = window.document.getElementsByTagName('script')[0];
			script.parentNode.insertBefore(UAInclude,script);

            ga('create', _this.getConfig('urchinCode'), 'auto' );

            // just use the default list:
			this.eventTrackList = this.defaultTrackList;

			var customEvents = [];
			if (this.getConfig('customEvent')) {
				customEvents = this.getConfig('customEvent').split(',');
			}

			// Remove duplicates
			$.each(customEvents, function (i) {
				if ($.inArray(this, _this.eventTrackList) != -1) {
					customEvents.splice(i, 1);
				}
			});

			this.eventTrackList = $.merge(_this.eventTrackList, customEvents);
			this.eventTrackList = $.unique(this.eventTrackList);

			// Setup the initial state of some flags
			this._p25Once = false;
			this._p50Once = false;
			this._p75Once = false;
			this._p100Once = false;
			this.hasSeeked = false;
			this.lastSeek = 0;

			if (mw.getConfig('debug')) {
                ga('require', 'linker');
                ga('linker:autoLink', ['.*']);
			}

			if (_this.getConfig('allowLinker')) {
                ga('require', 'linker');
                ga('linker:autoLink', ['.*']);
			}
			// check if we should anonymize Ips, from google docs: 
			// https://developers.google.com/analytics/devguides/collection/gajs/methods/gaJSApi_gat#_gat._anonymizeIp
			if( this.getConfig( 'anonymizeIp' ) ){
                ga('set', 'anonymizeIp', true);
			}
			// set correct utmp when unfriendly iframe
			if ( !mw.getConfig('EmbedPlayer.IsFriendlyIframe' ) && typeof(document.referrer)!= 'undefined' ){
				//get path and remove everything after ? and # in the URL to send clean path to GA
				ga('set', 'page', document.referrer.replace(/^[^:]+:\/\/[^/]+/, '').replace(/#.*/, '').replace(/\?.*/, ''));
			}
			if ( !this.getConfig('disableTrackPageview') ) {
                ga('send', 'pageview');
			}

			this.addPlayerBindings();
			callback();
		},

		// Add the player bindings
		addPlayerBindings: function () {
			var _this = this;
			_this.embedPlayer.bindHelper('onChangeMedia' + _this.bindPostFix, function () {
				_this.embedPlayer.unbindHelper(_this.bindPostFix);
				_this.duringChangeMediaFlag = true;
			});
			_this.embedPlayer.addJsListener('UniversalAnalyticsEvent' + _this.bindPostFix, function (data) {
				_this.UniversalAnalyticsEvent(data);
			});
			var playerAlreadyPlayed = false;
			$.each(_this.eventTrackList, function () {
				var eventName = this;
				// Disable quartiles for entries with no duration, i.e live streaming
				if ( eventName == 'quartiles' && _this.embedPlayer.isLive() ) {
					return;
				}
				var eventNameBinding = _this.getEventNameBinding(eventName);
				_this.embedPlayer.addJsListener(eventNameBinding + _this.bindPostFix, function (data) {
					if (eventNameBinding == 'playerPlayed') {
						if (playerAlreadyPlayed) {
							return;
						}
						playerAlreadyPlayed = true;
					}
					_this.playerEvent(eventName, data);

				});
			});

			_this.embedPlayer.bindHelper('Kaltura_ConfigChanged', function(event, pluginName, property, value){
				if( pluginName === "universalAnalytics" ){
					if(property === "urchinCode") {
                        ga('create', _this.getConfig('urchinCode'), 'auto' );
					}
				}
			});
		},

		/**
		 * Handles the mapping for special case eventNames that
		 * don't match their corresponding kaltura listener binding name
		 */
		getEventNameBinding: function (eventName) {
			// Explicitly casting eventName to string - iOS 4.3.1 tweak
			eventName = eventName.toString();
			switch (eventName) {
				case 'quartiles':
					return 'playerUpdatePlayhead';
					break;
			}
			return eventName;
		},

        UniversalAnalyticsEvent: function(AnalyticsEvent){
		    AnalyticsEvent.eventCategory = this.getConfig("trackingCategory") || this.trackingCategory;
            ga('send', 'event', AnalyticsEvent);
            return;
		},

		playerEvent: function (methodName, data) {
			var trackingArgs = this.getTrackingEvent(methodName, data);
			// Don't track false events:
			if (!trackingArgs)
				return;

			if (this.duringChangeMediaFlag && methodName != 'changeMedia') {
				return;
			}

			// if flagged a change media call disregard everything until changeMedia
			this.duringChangeMediaFlag = false;


            ga('send', 'event', trackingArgs[0], trackingArgs[1], trackingArgs[2], trackingArgs[3], trackingArgs[4]);

			// Send the event to the monitor ( if set in the initial options )
			if (this.getConfig('trackEventMonitor')) {
				try {
					window.parent[ this.getConfig('trackEventMonitor') ].apply(this, trackingArgs);
				} catch (e) {
					// error sending tracking event. 
					mw.log("Error with google track event: " + e);
				}

			}
		},

		/**
		 * Send updates for time stats
		 */
		getQuartilesStatus: function (currentTime) {
			this._lastPlayHeadTime = currentTime;
			// Setup local references:
			var _this = this;
			var entryDuration = this.embedPlayer.duration;

			// Set the seek and time percent:
			var percent = currentTime / entryDuration;
			var seekPercent = this._lastSeek / entryDuration;
			// Send updates based on logic present in StatisticsMediator.as
			if (!_this._p25Once && percent >= .25 && seekPercent <= .25) {
				_this._p25Once = true;
				return '25';
			} else if (!_this._p50Once && percent >= .50 && seekPercent < .50) {
				_this._p50Once = true;
				return '50';
			} else if (!_this._p75Once && percent >= .75 && seekPercent < .75) {
				_this._p75Once = true;
				return '75';
			} else if (!_this._p100Once && percent >= .98 && seekPercent < 1) {
				_this._p100Once = true;
				return '100';
			}
			return false;
		},

		getTrackingEvent: function (methodName, data) {
			var optionValue;
			// check for special case of 'quartiles'
			if (methodName == 'quartiles') {
				var qStat = this.getQuartilesStatus(data);
				// Don't process the tracking event
				if (!qStat) {
					return false;
				}
				methodName = qStat + "_pct_watched";
				optionValue = this.embedPlayer.duration * parseInt(qStat) / 100;
			}
			var optionLabel = this.getOptionalLabel(methodName, data);
			optionValue = this.getOptionalValue(methodName, data);
			// Special case don't track initial html5 volumeChange event ( triggered right after playback )
			// xxx this is kind of broken we need to subscribe to the interface volume updates
			// not the volumeChange event ( since html fires this at start and end of video )
			if (methodName == 'volumeChanged' && ( this._lastPlayHeadTime < .25 || this._p100Once )) {
				return false;
			}

			var eventCategory = this.getConfig("trackingCategory") || this.trackingCategory;
			var eventAction = methodName;
			var customEvents = [];

			if (this.getConfig('customEvent')) {
				customEvents = this.getConfig('customEvent').replace(/ /g,'').split(',');
				if ($.inArray(methodName, customEvents) != -1) {
					if (this.getConfig(methodName + "Category")) {
						eventCategory = this.getConfig(methodName + "Category");
					}
					if (this.getConfig(methodName + "Action")) {
						eventAction = this.getConfig(methodName + "Action");
					}
				}
			}
			var trackEvent = [
				eventCategory.toString(),
				eventAction.toString()
			];

			if (optionLabel !== null) {
				trackEvent.push(optionLabel.toString());
			} else{
				trackEvent.push(undefined);
			}

			if (optionValue !== null) {
				trackEvent.push(parseInt(optionValue));
			}else{
				trackEvent.push(undefined);
			}

			var fieldParams = {};
			if ( this.isInteractiveEvent(methodName) ){
				fieldParams.nonInteraction = false;
			}else{
				fieldParams.nonInteraction = true;
			}
			trackEvent.push(fieldParams);

			return trackEvent;
		},

		isInteractiveEvent: function(methodName){
			if ($.inArray(methodName, this.interactiveEventList) != -1) {
				return true;
			}
			return false;
		},

		/**
		 * Get an optional label for the methodName and data
		 */
		getOptionalLabel: function (methodName, data) {
			methodName = methodName.toString();
			var clipTitle = ( this.embedPlayer.kalturaPlayerMetaData && this.embedPlayer.kalturaPlayerMetaData.name ) ? this.embedPlayer.kalturaPlayerMetaData.name : '';
			var entryId = this.embedPlayer.kentryid;
			var uiconfId = this.embedPlayer.kuiconfid;
			var widgetId = this.embedPlayer.kwidgetid;
			var refId = this.embedPlayer.kalturaPlayerMetaData.referenceId;
			var refString = "";
			if (refId && this.getConfig('sendRefId') == true)
				refString = refId + "|";
			var customEvents = [];
			if (this.getConfig('customEvent')) {
				customEvents = this.getConfig('customEvent').split(',');
				if ($.inArray(methodName, customEvents) != -1) {
					if (this.getConfig(methodName + "Label")) {
						return this.getConfig(methodName + "Label");
					}
				}

			}
			// check for configured optionalLabel override: 
			if( this.getConfig('optionalLabel') ){
				return  this.getConfig('optionalLabel');
			}
			return ( refString + clipTitle + "|" + entryId + "|" + widgetId + "|" +uiconfId  );
		},

		/**
		 * Get an optional data value for the methodName
		 */
		getOptionalValue: function (methodName, data) {
			methodName = methodName.toString();
			if (methodName == 'doSeek' || methodName.indexOf('pct_watched') != -1) {
				this._lastSeek = this.embedPlayer.currentTime;
				return this._lastSeek;
			}
			if (methodName == 'volumeChanged') {
				if (data.newVolume)
					return data.newVolume;
			}
			var customEvents = [];
			if (this.getConfig('customEvent')) {
				customEvents = this.getConfig('customEvent').split(',');
				if ($.inArray(methodName, customEvents) != -1) {
					if (this.getConfig(methodName + "Value")) {
						return this.getConfig(methodName + "Value");
					}
				}
			}

			if ($.inArray(methodName, this.defaultValueEventList) != -1) {
				return 1;
			}
			return null;
		}
	};
})(window.mw, window.jQuery);
