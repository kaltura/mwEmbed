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
		codeCuePointsArray : [],
		liveCuePointsIntervalId: null,
		threshold: 3,
		supportedCuePoints: [
			mw.KCuePoints.TYPE.CODE,
			mw.KCuePoints.TYPE.THUMB,
			mw.KCuePoints.TYPE.QUIZ_QUESTION
		],
		previewCuePointTag:null,

		init: function (embedPlayer) {
			var _this = this;
			// Remove any old bindings:
			this.destroy();
			// Setup player ref:
			this.embedPlayer = embedPlayer;
			// grab duplicate-check threshold from player config if exists
			var playerConfig = this.embedPlayer.playerConfig;
			if( playerConfig.plugins.dualScreen
				&& playerConfig.plugins.dualScreen.thresholdForDuplicateCP  ){
				this.threshold = playerConfig.plugins.dualScreen.thresholdForDuplicateCP;
			}
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
            this.baseThumbAssetUrl=null;
            this.disableThumbnailAssetUrlFetching=mw.getConfig("EmbedPlayer.disableThumbnailAssetUrlFetching");
		},
		destroy: function () {
			if (this.liveCuePointsIntervalId) {
				clearInterval(this.liveCuePointsIntervalId);
				this.liveCuePointsIntervalId = null;
			}
            this.baseThumbAssetUrl = null;
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
			var newCodeCuePointsArray = [];
			$.each(cuePoints, function (idx, cuePoint) {
				if ((_this.getVideoAdType(cuePoint) == 'pre' || _this.getVideoAdType(cuePoint) == 'post') &&
					cuePoint.cuePointType == 'adCuePoint.Ad') {
					_this.triggerCuePoint(cuePoint);
				} else {
					// Midroll or non-ad cuepoint
					if (cuePoint.cuePointType === 'codeCuePoint.Code')
					{
						newCodeCuePointsArray.push(cuePoint);
                        newCuePointsArray.push(cuePoint);
                    }else if (cuePoint.cuePointType != "eventCuePoint.Event") {
						newCuePointsArray.push(cuePoint);
					}
				}
			});

			this.midCuePointsArray = newCuePointsArray;
			this.codeCuePointsArray = newCodeCuePointsArray;
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
			var loadThumbnailWithReferrer = this.embedPlayer.getFlashvars( 'loadThumbnailWithReferrer' );
			var referrer = window.kWidgetSupport.getHostPageUrl();

            function processAllCuePoints() {
                var urls=[];
                $.each(thumbCuePoint, function (index, item) {
                    // for some thumb cue points, assetId may be undefined from the API.
                    if (typeof item.assetId !== 'undefined') {
                        urls.push(_this.baseThumbAssetUrl.replace(/thumbAssetId\/([^\/]+)/,"/thumbAssetId/"+item.assetId));
                    }
                });
                processThumbnailUrls(urls);
            }

            function processThumbnailUrls(data) {
                $.each(data, function (index, thumbnailUrl) {
                    if (_this.isValidResult(thumbnailUrl)) {
                        var resItem = responseArray[index];
                        if (resItem) {
                            resItem.thumbnailUrl = thumbnailUrl;
                            if (loadThumbnailWithReferrer) {
                                resItem.thumbnailUrl += '?options:referrer=' + referrer;
                            }
                        }
                    }
                });
                // Since the thumb assets request is async the callback needs to be async as well
                if (callback) {
                    setTimeout(function () {
                        callback();
                    }, 0);
                }
            }

            function getUrl(index) {
                if (index>=requestArray.length) {
                    return;
                }
                // do the api request
                _this.getKalturaClient().doRequest({
                    'service': 'thumbAsset',
                    'action': 'getUrl',
                    'id': requestArray[index].id
                }, function (thumbnailUrl) {

                    if (_this.isValidResult(thumbnailUrl)) {
                        _this.baseThumbAssetUrl = thumbnailUrl;
                        processAllCuePoints();
                    } else {
                        getUrl(index+1);
                    }
                });
            }
            //Create request data only for cuepoints that have assetId
            $.each(thumbCuePoint, function (index, item) {
                // for some thumb cue points, assetId may be undefined from the API.
                if (typeof item.assetId !== 'undefined') {
                    requestArray.push(
                        {
                            'service': 'thumbAsset',
                            'action': 'getUrl',
                            'id': item.assetId
                        }
                    );
                    responseArray.push(item);
                }

            });
            if (requestArray.length) {

                if (!_this.disableThumbnailAssetUrlFetching) {
                    if (_this.baseThumbAssetUrl) {
                        processAllCuePoints();
                    } else {
                        getUrl(0);
                    }
                } else {
                    // do the api request
                    this.getKalturaClient().doRequest(requestArray, function (data) {
                        // Validate result
                        if (requestArray.length === 1) {
                            data = [data];
                        }
                        processThumbnailUrls(data);
                    });
                }
            } else {
                if (callback) {
                    setTimeout(function () {
                        callback();
                    }, 0);
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
			this.fixLiveCuePointArray(this.codeCuePointsArray);
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
				var cpThreshold  = mw.getConfig("cuePointsThreshold") ? parseInt(mw.getConfig("cuePointsThreshold")) : 60;
				mw.log("mw.KCuePoints:: Loading cue points with threshold of " + cpThreshold + " seconds : "+ (lastCreationTime - cpThreshold) );
				request['filter:createdAtGreaterThanOrEqual'] = lastCreationTime - cpThreshold;
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

				var thumbNewCuePoints = [];
				var codeNewCuePoints = [];
				var playerNewCuePoints = [];
				//Only add new cuepoints
				$.each(rawCuePoints, function (id, rawCuePoint) {
					if (!_this.associativeCuePoints[rawCuePoint.id]) {
						_this.associativeCuePoints[rawCuePoint.id] = rawCuePoint;
						playerNewCuePoints.push(rawCuePoint);

						if (rawCuePoint.cuePointType === 'codeCuePoint.Code')
						{
							codeNewCuePoints.push(rawCuePoint);
						}else {
							thumbNewCuePoints.push(rawCuePoint);
						}
					}
				});

				if (playerNewCuePoints.length > 0)
				{
					var playerCuePoints = this.getCuePoints();
					//update cuepoints
					$.merge(playerCuePoints, playerNewCuePoints);
				}
				if (thumbNewCuePoints.length > 0) {

					//update midpoint cuepoints
					$.merge(this.midCuePointsArray, thumbNewCuePoints);
					//Request thumb asset only for new cuepoints
					this.requestThumbAsset(thumbNewCuePoints, function () {
						_this.embedPlayer.triggerHelper('KalturaSupport_ThumbCuePointsUpdated', [thumbNewCuePoints]);
					});
				}

				if (codeNewCuePoints.length > 0) {
					// update code cue points
					$.merge(this.codeCuePointsArray, codeNewCuePoints);
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
					var currentTime = embedPlayer.getPlayerElementTime() * 1000;
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
		getCodeCuePoints : function()
		{
			return this.codeCuePointsArray || [];
		},
		getCuePointsByType: function (type, subType) {
			var filteredCuePoints = this.getCuePoints();
			if (filteredCuePoints && ( type || subType )) {
				var _this = this;
				filteredCuePoints = $.grep( filteredCuePoints, function ( cuePoint ) {
					var foundCuePointType = _this.validateCuePointAttribute(cuePoint, "cuePointType", type);
					var foundCuePointSubType = _this.validateCuePointAttribute(cuePoint, "subType", subType);
					var checkCuePointsTag = _this.validateCuePointTags(cuePoint, _this.getPreviewCuePointTag());
					return foundCuePointType && foundCuePointSubType && checkCuePointsTag;
				} );
				// filter same CP
				filteredCuePoints = filteredCuePoints.filter(function( item,index,allInArray ) {
					return _this.removeDuplicatedCuePoints(allInArray,index);
				});
			}
			return filteredCuePoints;
		},
		/**
		 * check if CP have tag tagName which we do not want to show
		 * @param cuePoint - Cp which we want to check
		 * @param tagName - tag name which we do not want to show
		 * @return {boolean} result - if true - will show current CP
		 */
		validateCuePointTags: function(cuePoint, tagName){
			if(cuePoint && cuePoint.tags && tagName){
				var result  = cuePoint.tags.indexOf(tagName) === -1;
				var playerConfig = this.embedPlayer.playerConfig;
				if(playerConfig && playerConfig.plugins && playerConfig.plugins.dualScreen && playerConfig.plugins.dualScreen.allowAdminCuePoints && !result){
					result =  true;
				}
				return result;
			}
			return true;
		},
		getPreviewCuePointTag:function () {
			if(!this.previewCuePointTag){
				var tagName = "__PREVIEW_CUEPOINT_TAG__";
				var playerConfig = this.embedPlayer.playerConfig;
				if(playerConfig && playerConfig.plugins && playerConfig.plugins.dualScreen && playerConfig.plugins.dualScreen.PREVIEW_CUEPOINT_TAG){
					tagName =  playerConfig.plugins.dualScreen.PREVIEW_CUEPOINT_TAG;
				}
				this.previewCuePointTag = tagName;
				return tagName;
			}
			return this.previewCuePointTag;
			
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
		 * if have same CP earlier - hide current CuePoint
		 * @param  allCP - array of CP where try to find same CP
		 * @param  currentCuePointIndex - position from current CP
		 *
		 */
		removeDuplicatedCuePoints:function (allCP, currentCuePointIndex) {
			var defaultThreshold = this.threshold;
			var currentCP = allCP[currentCuePointIndex];
			var prevCP = this.getPrevCPWithCorrectType(allCP,currentCuePointIndex);
			if(prevCP !== false && currentCP && currentCP.partnerData){
				var startTimeDelta = Math.abs(currentCP.startTime - prevCP.startTime);
				var isTheSamePartnerData = currentCP.partnerData === prevCP.partnerData;
				var isSameTitle = currentCP.title === prevCP.title;
				var isSameDescription = currentCP.description === prevCP.description;
				var isTheSameTags = currentCP.tags === prevCP.tags;
				if(isTheSamePartnerData && isTheSameTags && isSameTitle && isSameDescription && startTimeDelta <= defaultThreshold*1000){
					return false;
				}
			}
			return true;
		},
		getPrevCPWithCorrectType: function (allCP,currentCuePointIndex) {
			var prevCP = false;
			var previousIndex = currentCuePointIndex - 1;
			var currentCP = allCP[currentCuePointIndex];
			var thresholdTime = this.threshold;
			for(var i = previousIndex; i>=0;i--){
				var startTimeDelta = Math.abs(currentCP.startTime - allCP[i].startTime);
				//if delta of createdAt and startTime is more than thresholdTime - it's not a duplicated cuepoint
				if(startTimeDelta > thresholdTime*1000){
					break;
				}
				if(allCP[i].cuePointType === currentCP.cuePointType){
					prevCP = allCP[i];
					break;
				}
			}
			return prevCP;
		},
		/**
		 * Returns the next cuePoint object for requested time
		 * @param {Number} time Time in milliseconds
		 */
		getNextCuePoint: function (time) {
            function compareByStartTime(a, b) {
                if (a.startTime < b.startTime) return -1;
                if (a.startTime > b.startTime) return 1;
                return 0;
            }

            if (!isNaN(time) && time >= 0) {
				var cuePoints = this.midCuePointsArray;
				cuePoints.sort(compareByStartTime);
				// Start looking for the cue point via time, return FIRST match:
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
			mw.log('mw.KCuePoints :: Trigger event: ' + eventName + ' - ' + rawCuePoint.cuePointType + ' at: ' + rawCuePoint.startTime );
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

})(window.mw, window.jQuery);
