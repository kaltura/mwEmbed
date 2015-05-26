/**
 * Adds cue points support
 */
(function (mw, $) {
	"use strict";

	mw.KCuePoints = function (embedPlayer) {
		return this.init(embedPlayer);
	};
	mw.KCuePoints.prototype = {

		// The bind postfix:
		bindPostfix: '.kCuePoints',
		midCuePointsArray: [],
		liveCuePointsIntervalId: null,

		init: function (embedPlayer) {
			var _this = this;
			// Remove any old bindings:
			this.destroy();
			// Setup player ref:
			this.embedPlayer = embedPlayer;

			// Process cue points
			embedPlayer.bindHelper('KalturaSupport_CuePointsReady' + this.bindPostfix, function () {
				_this.processCuePoints();
				// Add player bindings:
				_this.addPlayerBindings();
				//Set live cuepoint polling
				if (_this.embedPlayer.isLive() && mw.getConfig("EmbedPlayer.LiveCuepoints")) {
					_this.requestLiveCuepoints();
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
		requestLiveCuepoints: function () {
			var _this = this;

			// Create associative cuepoint array to enable comparing new cuepoints vs existing ones
			var cuePoints = this.getCuePoints();
			this.associativeCuePoints = {};
			$.each(cuePoints, function (index, cuePoint) {
				_this.associativeCuePoints[cuePoint.id] = cuePoint;
			});

			//Start live cuepoint pulling
			this.liveCuePointsIntervalId = setInterval(function () {
				var entryId = _this.embedPlayer.kentryid;
				var request = {
					'service': 'cuepoint_cuepoint',
					'action': 'list',
					'filter:entryIdEqual': entryId,
					'filter:objectType': 'KalturaCuePointFilter',
					'filter:statusIn': '1,3',
					'filter:cuePointTypeEqual': 'thumbCuePoint.Thumb'
				};
				var lastUpdatedAt = _this.getLastUpdateTime() + 1;
				// Only add lastUpdatedAt filter if any cue points already received
				if (lastUpdatedAt > 0) {
					request['filter:updatedAtGreaterThanOrEqual'] = lastUpdatedAt;
				}
				_this.getKalturaClient().doRequest( request,
					function (data) {
						// if an error pop out:
						if (!data || data.code) {
							// todo: add error handling
							mw.log("Error:: KCuePoints could not retrieve live cuepoints");
							return;
						}
						_this.updateCuePoints(data.objects);
						_this.embedPlayer.triggerHelper('KalturaSupport_CuePointsUpdated', [data.totalCount]);
					}
				);
			}, mw.getConfig("EmbedPlayer.LiveCuepointsRequestInterval") || 10000);
		},
		updateCuePoints: function (rawCuePoints) {
			if (rawCuePoints.length > 0) {
				var _this = this;

				var associativeRawCuePoints = {};
				$.each(rawCuePoints, function (index, cuePoint) {
					associativeRawCuePoints[cuePoint.id] = cuePoint;
				});

				var updatedCuePoints = [];
				//Only add new cuepoints or existing cuepoints which have a newer updateAt value
				$.each(associativeRawCuePoints, function (id, rawCuePoint) {
					if ((!_this.associativeCuePoints[id]) /*||
						( _this.associativeCuePoints[id] &&
							_this.associativeCuePoints[id].updatedAt < rawCuePoint.updatedAt )*/) {
						_this.associativeCuePoints[id] = rawCuePoint;
						updatedCuePoints.push(rawCuePoint);
					}
				});

				if (updatedCuePoints.length > 0) {
					var cuePoints = this.getCuePoints();
					//update cuepoints
					$.merge(cuePoints, updatedCuePoints);
					//update midpoint cuepoints
					$.merge(this.midCuePointsArray, updatedCuePoints);
					//Request thumb asset only for new cuepoints
					this.requestThumbAsset(updatedCuePoints, function () {
						_this.embedPlayer.triggerHelper('KalturaSupport_ThumbCuePointsUpdated', [updatedCuePoints]);
					});
					// sort the cuePoitns by startTime:
					this.midCuePointsArray.sort(function (a, b) {
						return a.startTime - b.startTime;
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
			var currentCuePoint = this.getNextCuePoint(0);
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
					var currentTime = embedPlayer.currentTime * 1000;
					//In case of seeked the current cuepoint needs to be updated to new seek time before
					if (e.type == "seeked") {
						currentCuePoint = _this.getPreviousCuePoint(currentTime);
					}
					// Check if the currentCuePoint exists
					if (currentCuePoint && currentTime > currentCuePoint.startTime && embedPlayer._propagateEvents) {
						// Make a copy of the cue point to be triggered.
						// Sometimes the trigger can result in monitorEvent being called and an
						// infinite loop ( ie ad network error, no ad received, and restore player calling monitor() )
						var cuePointToBeTriggered = $.extend({}, currentCuePoint);
						// Trigger the cue point
						_this.triggerCuePoint(cuePointToBeTriggered);
					}
					// Update the current Cue Point to the "next" cue point
					currentCuePoint = _this.getNextCuePoint(currentTime);
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
			if (!isNaN(time) && time >= 0) {
				var cuePoints = this.midCuePointsArray;
				// Start looking for the cue point via time, return first match:
				for (var i = 0; i < cuePoints.length; i++) {
					if (cuePoints[i].startTime >= time) {
						return cuePoints[i];
					}
				}
			}
			// No cue point found in range return false:
			return false;
		},
		/**
		 * Returns the previous cuePoint object for requested time
		 * @param {Number} time Time in milliseconds
		 */
		getPreviousCuePoint: function (time) {
			if (!isNaN(time) && time >= 0) {
				var cuePoints = this.midCuePointsArray;
				// Start looking for the cue point via time, return first match:
				for (var i = 0; i < cuePoints.length; i++) {
					if (cuePoints[i].startTime >= time) {
						var index = (i - 1 > 0) ? (i - 1) : 0;
						return cuePoints[index];
					}
				}
			}
			// if no cuepoint found then return last one:
			return cuePoints[cuePoints.length - 1];
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
			if (rawCuePoint.cuePointType == 'codeCuePoint.Code' || rawCuePoint.cuePointType == 'thumbCuePoint.Thumb') {
				// Code type cue point ( make it easier for people grepping the code base for an event )
				eventName = 'KalturaSupport_CuePointReached';
			} else if (rawCuePoint.cuePointType == 'adCuePoint.Ad') {
				// Ad type cue point
				eventName = 'KalturaSupport_AdOpportunity';
				cuePointWrapper.context = this.getVideoAdType(rawCuePoint);
			} else {
				// Ignore all others cue points types
				return;
			}
			mw.log('mw.KCuePoints :: Trigger event: ' + eventName + ' - ' + rawCuePoint.cuePointType + ' at: ' + rawCuePoint.startTime);
			$(this.embedPlayer).trigger(eventName, cuePointWrapper);
			// TOOD "midSequenceComplete"
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
	mw.KCuePoints.TYPE = {
		AD: "adCuePoint.Ad",
		ANNOTATION: "annotation.Annotation",
		CODE: "codeCuePoint.Code",
		EVENT: "eventCuePoint.Event",
		THUMB: "thumbCuePoint.Thumb"
	};
	mw.KCuePoints.THUMB_SUB_TYPE = {
		SLIDE: 1,
		CHAPTER: 2
	};

})(window.mw, window.jQuery);