/**
 * Adds cue points support
 */
(function (mw, $) {
	"use strict";

	mw.KCuePoints = function (embedPlayer) {
		return this.init(embedPlayer);
	};
	mw.KCuePoints.TYPE = {
		AD: "adCuePoint.Ad",
		ANNOTATION: "annotation.Annotation",
		CODE: "codeCuePoint.Code",
		EVENT: "eventCuePoint.Event",
		THUMB: "thumbCuePoint.Thumb",
		QUIZ_QUESTION: "quiz.QUIZ_QUESTION"
	};
	mw.KCuePoints.THUMB_SUB_TYPE = {
		SLIDE: 1,
		CHAPTER: 2
	};
	mw.KCuePoints.prototype = {

		// The bind postfix:
		bindPostfix: '.kCuePoints',
		midCuePointsArray: [],
		liveCuePointsIntervalId: null,
		supportedCuePoints: [
			mw.KCuePoints.TYPE.CODE,
			mw.KCuePoints.TYPE.THUMB,
			mw.KCuePoints.TYPE.QUIZ_QUESTION
		],

		init: function (embedPlayer) {
			var _this = this;
			// Remove any old bindings:
			this.destroy();
			// Setup player ref:
			this.embedPlayer = embedPlayer;

			// Process cue points
			embedPlayer.bindHelper('KalturaSupport_CuePointsReady' + this.bindPostfix, function () {
				_this.initSupportedCuepointTypes();
				_this.processCuePoints();
				// Add player bindings:
				_this.addPlayerBindings();
				//Set live cuepoint polling
				if (_this.embedPlayer.isLive() && mw.getConfig("EmbedPlayer.LiveCuepoints")) {
					_this.setLiveCuepointsWatchDog();
				}
			});
		},
		destroy: function () {
			if (this.liveCuePointsIntervalId) {
				clearInterval(this.liveCuePointsIntervalId);
				this.liveCuePointsIntervalId = null;
			}
			$(this.embedPlayer).unbind(this.bindPostfix);
		},
		/*
		 * Trigger Pre/Post cue points and create Mid cue points array
		 */
		processCuePoints: function () {
			var _this = this;
			var cuePoints = this.getCuePoints();
			this.requestThumbAsset(cuePoints, function () {
				_this.embedPlayer.triggerHelper('KalturaSupport_ThumbCuePointsReady');
			});
			// Create new array with midrolls only
			var newCuePointsArray = [];
			$.each(cuePoints, function (idx, cuePoint) {
				if ((_this.getVideoAdType(cuePoint) == 'pre' || _this.getVideoAdType(cuePoint) == 'post') &&
					cuePoint.cuePointType == 'adCuePoint.Ad') {
					_this.triggerCuePoint(cuePoint);
				} else {
					// Midroll or non-ad cuepoint
					if (cuePoint.cuePointType != "eventCuePoint.Event") {
						newCuePointsArray.push(cuePoint);
					}
				}
			});

			this.midCuePointsArray = newCuePointsArray;
		},
		initSupportedCuepointTypes: function(){
			//Initial flashvars configuration arrives in form of comma-separated string,
			//so turn it into array of supported types.
			var supportedCuePoints = mw.getConfig("EmbedPlayer.SupportedCuepointTypes", this.supportedCuePoints);

			if ($.type(supportedCuePoints) === "string"){
				supportedCuePoints = supportedCuePoints.split(",")
			}

			mw.setConfig("EmbedPlayer.SupportedCuepointTypes", supportedCuePoints);
		},
		requestThumbAsset: function (cuePoints, callback) {
			var _this = this;
			var requestArray = [];
			var responseArray = [];
			var requestCuePoints = cuePoints || this.getCuePoints();
			var thumbCuePoint = $.grep(requestCuePoints, function (cuePoint) {
				return (cuePoint.cuePointType == 'thumbCuePoint.Thumb');
			});

			//Create request data only for cuepoints that have assetId
			$.each(thumbCuePoint, function (index, item) {
				requestArray.push(
					{
						'service': 'thumbAsset',
						'action': 'getUrl',
						'id': item.assetId
					}
				);
				responseArray[index] = item;
			});

			if (requestArray.length) {
				// do the api request
				this.getKalturaClient().doRequest(requestArray, function (data) {
					// Validate result
					if (requestArray.length === 1){
						data = [data];
					}
					$.each(data, function (index, res) {
						if (!_this.isValidResult(res)) {
							data[index] = null;
						}
					});
					$.each(thumbCuePoint, function (index, item) {
						item.thumbnailUrl = data[index];
					});
					if (callback) {
						callback();
					}
				});
			} else {
				if (callback) {
					callback();
				}
			}
		},
		fixLiveCuePointArray:function(arr) {
			$.each(arr, function (index,cuePoint) {
				cuePoint.startTime = cuePoint.createdAt*1000; //start time is in ms and createdAt is in seconds
			});
			arr.sort(function (a, b) {
				return a.createdAt - b.createdAt;
			});
		},
		setLiveCuepointsWatchDog: function () {
			var _this = this;

			// Create associative cuepoint array to enable comparing new cuepoints vs existing ones
			var cuePoints = this.getCuePoints();

			this.fixLiveCuePointArray(this.midCuePointsArray);
			this.fixLiveCuePointArray(cuePoints);

			this.associativeCuePoints = {};
			$.each(cuePoints, function (index, cuePoint) {
				_this.associativeCuePoints[cuePoint.id] = cuePoint;
			});

			var liveCuepointsRequestInterval = mw.getConfig("EmbedPlayer.LiveCuepointsRequestInterval", 10000);

			mw.log("mw.KCuePoints::start live cue points watchdog, polling rate: " + liveCuepointsRequestInterval + "ms");

			//Start live cuepoint pulling
			this.liveCuePointsIntervalId = setInterval(function(){
				_this.requestLiveCuepoints();
			}, liveCuepointsRequestInterval);

			//Todo: stop when live is offline or when stopped/paused
			this.embedPlayer.bindHelper("liveOffline", function(){
				if (_this.liveCuePointsIntervalId) {
					mw.log("mw.KCuePoints::lifeOffline event received, stop live cue points watchdog");
					clearInterval(_this.liveCuePointsIntervalId);
					_this.liveCuePointsIntervalId = null;
				}
			});
			this.embedPlayer.bindHelper("liveOnline", function(){
				if (!_this.liveCuePointsIntervalId) {
					mw.log("mw.KCuePoints::liveOnline event received, start live cue points watchdog");
					//Fetch first update when going back to live and then set a watchdog
					_this.requestLiveCuepoints();
					_this.liveCuePointsIntervalId = setInterval(function () {
						_this.requestLiveCuepoints();
					}, liveCuepointsRequestInterval);
				}
			});
		},
		requestLiveCuepoints: function () {
			var _this = this;
			var entryId = _this.embedPlayer.kentryid;
			var request = {
				'service': 'cuepoint_cuepoint',
				'action': 'list',
				'filter:entryIdEqual': entryId,
				'filter:objectType': 'KalturaCuePointFilter',
				'filter:statusIn': '1,3', //1=READY, 3=HANDLED  (3 is after copying to VOD)
				'filter:cuePointTypeIn': 'thumbCuePoint.Thumb,codeCuePoint.Code',
				'filter:orderBy': "+createdAt" //let backend sorting them
			};
			var lastCreationTime = _this.getLastCreationTime() + 1;
			// Only add lastUpdatedAt filter if any cue points already received
			if (lastCreationTime > 0) {
				request['filter:createdAtGreaterThanOrEqual'] = lastCreationTime;
			}
			this.getKalturaClient().doRequest( request,
				function (data) {
					// if an error pop out:
					if (!data || data.code) {
						// todo: add error handling
						mw.log("Error:: KCuePoints could not retrieve live cuepoints");
						return;
					}
					_this.fixLiveCuePointArray(data.objects);
					_this.updateCuePoints(data.objects);
					_this.embedPlayer.triggerHelper('KalturaSupport_CuePointsUpdated', [data.totalCount]);
				}
			);
		},
		updateCuePoints: function (rawCuePoints) {
			if (rawCuePoints.length > 0) {
				var _this = this;

				var updatedCuePoints = [];
				//Only add new cuepoints
				$.each(rawCuePoints, function (id, rawCuePoint) {
					if (!_this.associativeCuePoints[rawCuePoint.id]) {
						_this.associativeCuePoints[rawCuePoint.id] = rawCuePoint;
						updatedCuePoints.push(rawCuePoint);
						mw.log('mwKCuePoints.updateCuePoints: added to queue cue point with id ' + rawCuePoint.id);
					}
				});

				if (updatedCuePoints.length > 0) {
					// TODO [es] -> Oren - will 'this.getCuePoints()' consumers be affected now that we will add also the code cue points?
					var cuePoints = this.getCuePoints();
					//update cuepoints
					$.merge(cuePoints, updatedCuePoints);
					//update midpoint cuepoints
					$.merge(this.midCuePointsArray, updatedCuePoints);
					//Request thumb asset only for new cuepoints
					this.requestThumbAsset(updatedCuePoints, function () {
						_this.embedPlayer.triggerHelper('KalturaSupport_ThumbCuePointsUpdated', [updatedCuePoints]);
					});
				}
			}
		},
		getLastUpdateTime: function () {
			var cuePoints = this.getCuePoints();
			var lastUpdateTime = -1;
			$.each(cuePoints, function (key, cuePoint) {
				if (lastUpdateTime < cuePoint.updatedAt) {
					lastUpdateTime = cuePoint.updatedAt;
				}
			});
			return lastUpdateTime;
		},
		getLastCreationTime: function () {
			var cuePoints = this.getCuePoints();
			var lastCreationTime = -1;
			$.each(cuePoints, function (key, cuePoint) {
				if (lastCreationTime < cuePoint.createdAt) {
					lastCreationTime = cuePoint.createdAt;
				}
			});
			return lastCreationTime;
		},
		getKalturaClient: function () {
			if (!this.kClient) {
				this.kClient = mw.kApiGetPartnerClient(this.embedPlayer.kwidgetid);
			}
			return this.kClient;
		},
		isValidResult: function (data) {
			// Check if we got error
			if (!data){
				mw.log("mw.KCuePoints :: error retrieving data");
				return false;
			} else if ( data.code && data.message ) {
				mw.log("mw.KCuePoints :: error code: " + data.code + ", error message: " + data.message);
				return false;
			}
			return true;
		},
		/**
		 * Adds player cue point bindings
		 */
		addPlayerBindings: function () {
			var _this = this;

			// Get first cue point
			var nextCuePointIndex = _this.getNextCuePointIndex(0);

			var embedPlayer = this.embedPlayer;

			// Don't add any bindings if no cuePoint exists )
			if (!( ( embedPlayer.isLive() && mw.getConfig("EmbedPlayer.LiveCuepoints") ) || currentCuePoint)) {
				return;
			}

			// Destroy on changeMedia
			$(embedPlayer).bind('onChangeMedia' + this.bindPostfix, function () {
				_this.destroy();
			});


			// Bind to monitorEvent to trigger the cue points events and update he nextCuePoint
			$(embedPlayer).bind(
				"monitorEvent" + this.bindPostfix +
				" seeked" + this.bindPostfix +
				" onplay" + this.bindPostfix +
				" KalturaSupport_ThumbCuePointsUpdated" + this.bindPostfix,
				function (e) {
					// TODO [es]: oren, we are we listening here for 'KalturaSupport_ThumbCuePointsUpdated'?
					var currentTime = embedPlayer.getPlayerElementTime() * 1000;

					//In case of seeked the current cuepoint needs to be updated to new seek time before
					if (e.type == "seeked") {
						mw.log('mw.KCuePoints.bind(' + e.type + '): event of type seeked invoked, re-searching for first relevant cuepoint by time');
						nextCuePointIndex = _this.getPreviousCuePointIndex(currentTime);
						mw.log('mw.KCuePoints.bind(' + e.type + '): found new cue point index ' + nextCuePointIndex);
					}


					if (_this.getCuePointByIndex(nextCuePointIndex)) {
						mw.log('mw.KCuePoints.bind(' + e.type + '): checking for cue points that should be handled starting from index ' + nextCuePointIndex + ' (server time ' + new Date(currentTime) + ')');

						var cuePointsReachedToHandle = _this.getCuePointsReached(currentTime, nextCuePointIndex);

						if (cuePointsReachedToHandle.cuePoints.length > 0) {
							mw.log('mw.KCuePoints.bind(' + e.type + '): found ' + cuePointsReachedToHandle.cuePoints.length + ' cue point that should be handled');
							nextCuePointIndex = cuePointsReachedToHandle.lastIndex + 1;
							mw.log('mw.KCuePoints.bind(' + e.type + '): updating current index to ' + nextCuePointIndex + ' (will be used next time searching for cue points to handle)');

							var clonedCuePointsToHandle = [];
							for (var i = 0; i < cuePointsReachedToHandle.cuePoints.length; i++) {
								var reachedCuePoint = cuePointsReachedToHandle.cuePoints[i];
								mw.log('mw.KCuePoints.bind(' + e.type + '): trigger event for cuePoint ' + reachedCuePoint.id + ' with start time ' + new Date(reachedCuePoint.startTime));

								// Make a copy of the cue point to be triggered.
								// Sometimes the trigger can result in monitorEvent being called and an
								// infinite loop ( ie ad network error, no ad received, and restore player calling monitor() )
								var cuePointToBeTriggered = $.extend({}, reachedCuePoint);
								clonedCuePointsToHandle.push(cuePointToBeTriggered); // update the cloned list that will be used to invoke event

								// Trigger the cue point
								_this.triggerCuePoint(cuePointToBeTriggered);
							}

							// invoke the reached aggregated event - use the cloned list since
							// sometimes the trigger can result in monitorEvent being called and an
							// infinite loop ( ie ad network error, no ad received, and restore player calling monitor() )
							_this.triggerCuePointsReachedAggregated(clonedCuePointsToHandle, {playerEventType: e.type});
						}

						var nextCuePoint = _this.getCuePointByIndex(nextCuePointIndex);
						if (nextCuePoint) {
							mw.log('mw.KCuePoints.bind(' + e.type + '): next cue point with id ' + nextCuePoint.id + ' should be handled on ' + new Date(nextCuePoint.startTime));
						}
					}
				}
			);
		},
		getEndTime: function () {
			return this.embedPlayer.evaluate('{mediaProxy.entry.msDuration}');
		},
		getCuePoints: function () {
			if (!this.embedPlayer.rawCuePoints || !this.embedPlayer.rawCuePoints.length) {
				this.embedPlayer.rawCuePoints = [];
			}
			return this.embedPlayer.rawCuePoints;
		},
		getCuePointsByType: function (type, subType) {
			var filteredCuePoints = this.getCuePoints();
			if (filteredCuePoints && ( type || subType )) {
				var _this = this;
				filteredCuePoints = $.grep( filteredCuePoints, function ( cuePoint ) {
					var foundCuePointType = _this.validateCuePointAttribute(cuePoint, "cuePointType", type);
					var foundCuePointSubType = _this.validateCuePointAttribute(cuePoint, "subType", subType);
					return foundCuePointType && foundCuePointSubType;
				} );
			}
			return filteredCuePoints;
		},
		validateCuePointAttribute: function(cuePoint, attrName, attrValues){
			var foundAttr = false;
			if (attrName && attrValues) {
				if (!$.isArray(attrValues)){
					attrValues = [attrValues];
				}
				$.each( attrValues, function ( i, attrValue ) {
					if ( attrValue == cuePoint[attrName] ) {
						foundAttr = true;
						return false;
					}
				} );
			} else {
				foundAttr = true;
			}
			return foundAttr;
		},

		/**
		 * Returns the next cuePoint object for requested time
		 * @param {Number} time Time in milliseconds
		 */
		getNextCuePoint: function (time) {
			var nextCuePointIndex = this.getNextCuePointIndex(time, 0);

			if (nextCuePointIndex !== -1)
			{
				var cuePoints = this.midCuePointsArray;
				return cuePoints[nextCuePointIndex];
			}

			// No cue point found in range return false:
			return false;
		},
		/**
		 * Returns the next cuePoint index for requested time
		 * @param {Number} time Time in milliseconds
		 * @param startFromIndex the first index to start the search from
		 * @returns {*}
		 */
		getNextCuePointIndex: function (time, startFromIndex) {
			if (!isNaN(time) && time >= 0) {

				startFromIndex = startFromIndex || 0;

				var cuePoints = this.midCuePointsArray;
				// Start looking for the cue point via time, return FIRST match:
				for (var i = startFromIndex; i < cuePoints.length; i++) {
					if (cuePoints[i].startTime >= time) {
						return i;
					}
				}
			}
			// No cue point found in range return false:
			return -1;
		},
		/**
		 * Returns the previous cuePoint object for requested time
		 * @param {Number} time Time in milliseconds
		 */
		getPreviousCuePoint: function (time) {
			var previousCuePointIndex = this.getPreviousCuePointIndex(time);

			if (previousCuePointIndex !== -1)
			{
				var cuePoints = this.midCuePointsArray;
				return cuePoints[previousCuePointIndex];
			}

			// no cue point index provided, return false
			return false;
		},
		/**
		 * Returns the previous cuePoint index for requested time
		 * @param {Number} time Time in milliseconds
		 */
		getPreviousCuePointIndex: function (time) {
			if (!isNaN(time) && time >= 0) {
				var cuePoints = this.midCuePointsArray;
				// Start looking for the cue point via time, return first match:
				for (var i = 0; i < cuePoints.length; i++) {
					if (cuePoints[i].startTime >= time) {
						var index = (i - 1 > 0) ? (i - 1) : 0;
						return index;
					}
				}
			}

			// if no cuepoint found then return last one:
			return cuePoints.length - 1;
		},
		getCuePointByIndex : function(index)
		{
			if ($.isNumeric(index) && index > -1 && index < this.midCuePointsArray.length)
			{
				var cuePoints = this.midCuePointsArray;
				return cuePoints[index];
			}

			return null;
		},
		getCuePointsReached : function(time, startFromIndex) {

			var result = {cuePoints: [], startIndex: startFromIndex, lastIndex: null};
			if ($.isNumeric(startFromIndex) && startFromIndex > -1 && !isNaN(time) && time >= 0) {
				{
					var cuePoints = this.midCuePointsArray;

					for (var i = startFromIndex; i < cuePoints.length; i++) {
						var curPoint = cuePoints[i];
						if (curPoint.startTime <= time) {
							result.cuePoints.push(curPoint);
							result.lastIndex = i;
						} else {
							break;
						}
					}
				}
			}

			return result;
		},
		/**
		 * Triggers the given cue point
		 * @param (Object) Cue Point object
		 **/
		triggerCuePoint: function (rawCuePoint) {
			/**
			 *  We need different events for each cue point type
			 */
			var eventName;
			/*
			 * Evaluate cuePoint sourceURL strings ( used for VAST property substitutions )
			 */
			rawCuePoint.sourceUrl = this.embedPlayer.evaluate(rawCuePoint.sourceUrl);

			/*
			 * The cue point object is wrapped with another object that has context property.
			 * We used that property so that the different plugins will know the context of the ad
			 * In case the cue point is not a adOpportunity their will be no context
			 *
			 * This matches the KDP implementation
			 * */
			var cuePointWrapper = {
				'cuePoint': rawCuePoint
			};
			if (rawCuePoint.cuePointType == 'adCuePoint.Ad') {
				// Ad type cue point
				eventName = 'KalturaSupport_AdOpportunity';
				cuePointWrapper.context = this.getVideoAdType(rawCuePoint);
			} else if($.inArray(rawCuePoint.cuePointType, mw.getConfig("EmbedPlayer.SupportedCuepointTypes")) !== -1){
				// Code type cue point ( make it easier for people grepping the code base for an event )
				eventName = 'KalturaSupport_CuePointReached';
			} else {
				return;
			}
			mw.log('mw.KCuePoints :: Trigger event: ' + eventName + ' - ' + rawCuePoint.cuePointType + ' at: ' + rawCuePoint.startTime);
			$(this.embedPlayer).trigger(eventName, cuePointWrapper);
			// TOOD "midSequenceComplete"
		},
		/**
		 *
		 * @param cuePoints
		 * @param eventContext
         */
		triggerCuePointsReachedAggregated: function (cuePoints, eventContext) {

			var filteredCuePoints = [];
			for(var i = 0; i < cuePoints.length;i++)
			{
				var cuePoint = cuePoints[i];
				if (cuePoint.cuePointType != 'adCuePoint.Ad' && $.inArray(cuePoint.cuePointType, mw.getConfig("EmbedPlayer.SupportedCuepointTypes")) !== -1){
					// use the same conditions used in function 'triggerCuePoint' to detect which cue points should be handled.
					filteredCuePoints.push(cuePoint);

					/*
					 * Evaluate cuePoint sourceURL strings ( used for VAST property substitutions )
					 */
					cuePoint.sourceUrl = this.embedPlayer.evaluate(cuePoint.sourceUrl);
				}
			}

			if (filteredCuePoints.length === 0)
			{
				// after filtering the cue points we left with empty list of cue points to handle
				return;
			}

			/*
			 * The cue point object is wrapped with another object that has context property.
			 * We used that property so that the different plugins will know the context of the ad
			 * In case the cue point is not a adOpportunity their will be no context
			 *
			 * This matches the KDP implementation
			 * */
			var eventArgs = $.extend({
				'cuePoints': filteredCuePoints
			},eventContext);


			mw.log('mw.KCuePoints :: Trigger event \'KalturaSupport_CuePointsReachedAggregated\' with - ' + filteredCuePoints.length + ' cue points to handle');
			$(this.embedPlayer).trigger('KalturaSupport_CuePointsReachedAggregated', eventArgs);
		},
		// Get Ad Type from Cue Point
		getVideoAdType: function (rawCuePoint) {
			if (rawCuePoint.startTime === 0) {
				return 'pre';
			} else if (rawCuePoint.startTime == this.getEndTime()) {
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
		getAdSlotType: function (cuePointWrapper) {
			if (cuePointWrapper.cuePoint.adType == 1) {
				return this.getVideoAdType(cuePointWrapper.cuePoint) + 'roll';
			} else {
				return 'overlay';
			}
		},
		getRawAdSlotType: function (rawCuePoint) {
			if (rawCuePoint.adType == 1) {
				return this.getVideoAdType(rawCuePoint) + 'roll';
			} else {
				return 'overlay';
			}
		},

		// Returns the number of CuePoints by type
		// @filter(optional) - string | one of: 'preroll', 'midroll', 'postroll', 'overlay'
		getCuePointsCount: function (filter) {
			var _this = this;
			var cuePoints = this.getCuePoints();

			// No cue points, return zero
			if (!cuePoints)
				return 0;

			// No filter, return all cue points
			if (!filter)
				return  cuePoints.length;

			var totalResults = {
				'preroll': 0,
				'midroll': 0,
				'postroll': 0,
				'overlay': 0
			};

			$.each(cuePoints, function (idx, rawCuePoint) {
				totalResults[ _this.getRawAdSlotType(rawCuePoint) ]++;
			});

			// return count by filter
			if (filter && totalResults[ filter ]) {
				return totalResults[ filter ];
			}
			// anything else, return zero
			return 0;
		}
	};

})(window.mw, window.jQuery);

