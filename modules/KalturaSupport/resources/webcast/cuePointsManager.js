(function (mw, $) {
    "use strict";
    mw.webcast = mw.webcast || {};

    mw.webcast.CuePointsManager = mw.KBasePlugin.extend({
        /* DEVELOPER NOTICE: you should not set any property directly here (they will be shared between instances) - use the setup function instead */
        setup: function () {
            var _this = this;

            /*
             DEVELOPER NOTICE: you should set properties here (they will be scoped per instance)
            */
            $.extend(_this,{
                _nextPendingCuePointIndex: 0,
                _lastHandledServerTime: null,
                _monitoredCuepoints : {
                    entryContext : null, // this value is being initialized by function 'resetMonitorVariables'
                    intervalId : null,
                    tagsLike : '',
                    enabled : false,
                    typesMapping : {}
                }
            });

            _this.resetMonitorVariables();
            _this.addBindings();

            _this.log('initialize(): invoked');
        },
        getCuePoints : function()
        {
            var player = this.getPlayer();
            var cuePoints = (player && player.kCuePoints) ? player.kCuePoints.getCuePoints() : null;

            return cuePoints || [];
        },
        addBindings : function()
        {
            var _this = this;

            _this.log('addBindings(): registering to events with bind postfix ' + _this.bindPostFix);

            _this.bind("onChangeMedia", function() {
                _this.log('addBindings(onChangeMedia): stop the monitor process');
                _this.stopMonitorProcess({reset : true});
            });

            _this.bind("playerReady", function() {

                var player = _this.getPlayer();
                var shouldRun = player && ((player.isLive() && mw.getConfig("EmbedPlayer.LiveCuepoints")) || player.kCuePoints);
                if (!shouldRun) {
                    _this.log('addBindings(playerReady): prerequisites check failed (event is either vod without cuepoints or marked to ignore live cuepoints), not monitoring cuepoints for that entry');
                    return;
                }

                _this.log('addBindings(playerReady): start the monitor process');

                _this.handleMonitoredCuepoints(_this.getCuePoints());
                _this.startMonitorProcess();
            });

            _this.bind(
                "monitorEvent onplay",
                function (e) {
                    var player = _this.getPlayer();

                    // check if need to handle player events
                    if (!player ||  !player.kCuePoints)
                    {
                        // no cuepoints service found - should not continue with the cuepoint processing
                        return;
                    }

                    if (e.type === 'monitorEvent' && !_this.embedPlayer.isPlaying()){
                        // bypass problem with player that starts throwing monitor event even when paused after user seek while he is not playing
                        return;
                    }


                    var currentTime = player.getPlayerElementTime() * 1000;


                    if (currentTime < 0) {
                        // ignore undesired temporary use cases
                        return;
                    }

                    if ($.isNumeric(_this._lastHandledServerTime) && (_this._lastHandledServerTime - 2000) > currentTime) {
                        // this part handles situation when user 'seek' from the player or if the server time changes
                        // for unknown reason. We don't use the 'seek' event since it sometimes provide an offset time and
                        // fix the value later but our code already modify its' internal state according to the offset time.
                        _this._reinvokeReachedLogicManually();
                        return;
                    }

                    _this._lastHandledServerTime = currentTime;

                    if (_this._getCuePointByIndex(_this._nextPendingCuePointIndex)) {

                        var cuePointsReachedToHandle = _this._getCuePointsReached(currentTime, _this._nextPendingCuePointIndex);

                        if (cuePointsReachedToHandle.cuePoints.length > 0) {
                            _this._nextPendingCuePointIndex = cuePointsReachedToHandle.lastIndex + 1;
                            _this.log('addBindings(' + e.type + ') - updated current index to ' + _this._nextPendingCuePointIndex + ' (will be used next time searching for cue points to handle)');

                            _this._triggerReachedCuePoints(cuePointsReachedToHandle.cuePoints);
                        }

                        // Start of: logic that is used for diagnostics only
                        var nextCuePoint = _this._getCuePointByIndex(_this._nextPendingCuePointIndex);
                        if (nextCuePoint && currentTime) {
                            var seconds = Math.round((nextCuePoint.startTime - currentTime ) / 1000);

                            if (seconds < 100) {
                                // log only if when the next cue point will be reached in less then x seconds
                                _this.log('addBindings(' + e.type + ') - next cue point with id ' + nextCuePoint.id + ' should be handled in ' + seconds + ' seconds (type \'' + nextCuePoint.cuePointType + '\', tags \'' + nextCuePoint.tags + '\', time ' + nextCuePoint.startTime + ', server time ' + currentTime + ')');
                            }
                        }
                        // End of: logic that is used for diagnostics only
                    }
                }
            );
        },
        resetMonitorVariables : function()
        {
            var _this = this;

            _this.log('resetMonitorVariables(): Resetting monitor variables for current entry');

            _this._monitoredCuepoints.entryContext = {
                lastCreatedAt : 0,
                lastCreatedCuePoints : []
            };
        },
        stopMonitorProcess : function(args)
        {
            var _this = this;

            if (_this._monitoredCuepoints.intervalId)
            {
                clearInterval(_this._monitoredCuepoints.intervalId);
                _this._monitoredCuepoints.intervalId = null;
            }

            _this.log('stopMonitorProcess(): Stopped monitor process');

            if (args && args.reset) {
                _this.resetMonitorVariables();
            }
        },
        startMonitorProcess : function() {
            var _this = this;
            _this.log('startMonitorProcess(): Staring monitor variables');


            function retrieveServerCuepoints() {
                _this.log("retrieveServerCuepoints(): requesting new monitored cuepoints from server");
                var entryId = _this.embedPlayer.kentryid;
                var request = {
                    'service': 'cuepoint_cuepoint',
                    'action': 'list',
                    'filter:entryIdEqual': entryId,
                    'filter:objectType': 'KalturaCuePointFilter',
                    'filter:statusIn': '1,3', //1=READY, 3=HANDLED  (3 is after copying to VOD)
                    'filter:cuePointTypeIn': 'codeCuePoint.Code',
                    'filter:tagsLike' : _this._monitoredCuepoints.tagsLike,
                    'filter:orderBy': "+createdAt"
                };

                if (_this._monitoredCuepoints.entryContext.lastCreatedAt) {
                    request['filter:createdAtGreaterThanOrEqual'] =  _this._monitoredCuepoints.entryContext.lastCreatedAt;
                }


                var requestedEntryId = entryId;
                _this.getKalturaClient().doRequest(request,
                    function (data) {
                        if (_this.embedPlayer.kentryid === requestedEntryId && _this._monitoredCuepoints.enabled)
                        {
                            // if an error pop out:
                            if (!data || data.code) {
                                // todo: add error handling
                                _this.log("retrieveServerCuepoints(): Error! could not retrieve live cuepoints");
                                return;
                            }

                            _this.log("retrieveServerCuepoints(): retrieved " + (data.objects ? data.objects.length : 0) + " cuepoints to handle");
                            _this.handleMonitoredCuepoints(data.objects);
                        }
                        else
                        {
                            _this.log("retrieveServerCuepoints(): retrieved results for prvious entry, ignoring results");

                        }
                    }
                );
            }

            var player = _this.getPlayer();
            (player.isLive() && mw.getConfig("EmbedPlayer.LiveCuepoints"))
            {
                var liveCuepointsRequestInterval = mw.getConfig("EmbedPlayer.LiveCuepointsRequestInterval", 10000);

                if (_this._monitoredCuepoints.enabled) {
                    _this.log("startMonitorProcess: Invoking retrieve interval every " + liveCuepointsRequestInterval + " milli-seconds");
                    _this._monitoredCuepoints.intervalId = setInterval(retrieveServerCuepoints, liveCuepointsRequestInterval);
                }
            }
        },
        handleMonitoredCuepoints : function(cuepoints)
        {
            var _this = this;

            if (_this._monitoredCuepoints.enabled && cuepoints && cuepoints.length)
            {
                _this.log("handleMonitoredCuepoints(): checking " + cuepoints.length + " cuepoints for monitored cue points");

                var relevantCuepoints = {};

                if (cuepoints && cuepoints.length)
                {
                    var newLastCreatedAtValue = _this._monitoredCuepoints.entryContext.lastCreatedAt;
                    var newLastCreatedCuePoints = _this._monitoredCuepoints.entryContext.lastCreatedCuePoints.slice();

                    // filter relevant cue points of registered requests
                    for(var i=0;i<cuepoints.length;i++) {
                        var cuepoint = cuepoints[i];

                        var shouldHandle = false;
                        if (cuepoint && cuepoint.tags && cuepoint.cuePointType === 'codeCuePoint.Code')
                        {
                            /*
                             * Important: Since determining if a cue point should be handled is essential yet we don't want to sort the array due to performance considerations,
                             * We will perform a comparison against the created at value of the previous request and only later will update the internal members.
                             * This way we are not affected if the array was not ordered by created at.
                             */
                            if (cuepoint.createdAt > newLastCreatedAtValue) {
                                // ** the retrieved cue point is the most updated one - update variables
                                newLastCreatedCuePoints = [cuepoint.id];
                                newLastCreatedAtValue = cuepoint.createdAt;
                                shouldHandle = true;
                            } else if (cuepoint.createdAt === newLastCreatedAtValue && newLastCreatedCuePoints.indexOf(cuepoint.id) === -1) {
                                // ** the retrieved cue point has the same updated at value as the most updated one - update variables
                                newLastCreatedCuePoints.push(cuepoint.id);
                                shouldHandle = true;
                            } else if (cuepoint.createdAt >= _this._monitoredCuepoints.entryContext.lastCreatedAt && _this._monitoredCuepoints.entryContext.lastCreatedCuePoints.indexOf(cuepoint.id) === -1) {
                                // ** This is fallback condition - handle cue points that were updated since previous request but due to sorting issue is being handled after a cue point with higher updated at value.
                                shouldHandle = true;
                            }
                        }


                        if (shouldHandle) {
                            // extract cue point types
                            var types = cuepoint.tags.split(',');

                            for (var j = 0; j < types.length; j++) {
                                var type = types[j];

                                if (type.indexOf(':') === -1) // make sure you dont handle tag that is multi context
                                {
                                    // check if cuepoint type is requested
                                    var callbacks = _this._monitoredCuepoints.typesMapping[type];

                                    if (callbacks && callbacks.length) {
                                        // add cue point to list of monitored types (aggregate by type)
                                        var monitoredCuepointsByType = relevantCuepoints[type];
                                        if (!monitoredCuepointsByType) {
                                            monitoredCuepointsByType = relevantCuepoints[type] = [];
                                        }

                                        _this.log("handleMonitoredCuepoints(): got flagged cuepoint to monitor of type '" + type + "' with cuepoint id '" + cuepoint.id + "'");
                                        monitoredCuepointsByType.push(cuepoint);
                                    }
                                }
                            }
                        }
                    }

                    // update variables to be used during next request.
                    _this._monitoredCuepoints.entryContext.lastCreatedAt = newLastCreatedAtValue;
                    _this._monitoredCuepoints.entryContext.lastCreatedCuePoints = newLastCreatedCuePoints;
                }

                // invoke callback for monitored cue points
                for(var cuepointType in relevantCuepoints)
                {
                    // for each monitored type raise relevant callbacks
                    var callbacks = _this._monitoredCuepoints.typesMapping[cuepointType];

                    if (callbacks && callbacks.length)
                    {
                        var callbackCuepoints = relevantCuepoints[cuepointType];
                        for(var k=0;k<callbacks.length;k++)
                        {
                            callbacks[k](callbackCuepoints);
                        }
                    }
                }
            }
        },
        registerMonitoredCuepointTypes : function(cuepointTypes, callback)
        {
            var _this = this;

            if (cuepointTypes && cuepointTypes.length && callback)
            {
                _this._monitoredCuepoints.enabled = true;
                for(var i=0;i<cuepointTypes.length;i++)
                {
                    var cuepointType = cuepointTypes[i];


                    var callbackList = _this._monitoredCuepoints.typesMapping[cuepointType];
                    if (!callbackList)
                    {
                        callbackList = _this._monitoredCuepoints.typesMapping[cuepointType] = [];

                        // this type was not registered yet, update the tagsLike condition to be used against Kaltura API
                        _this._monitoredCuepoints.tagsLike += _this._monitoredCuepoints.tagsLike ? ',' : '';
                        _this._monitoredCuepoints.tagsLike +=  cuepointType;
                    }

                    callbackList.push(callback);
                    _this.log("registerMonitoredCuepointTypes(): added monitor callback for cuepoint of type '" + cuepointType + "'");
                }
            }
        },
        _createReachedCuePointsArgs: function (cuePoints, context) {
            var _this = this;

            return $.extend({
                'cuePoints': cuePoints,
                filter: function (args) {
                    var result = [];

                    if (this.cuePoints) {
                        var filterByTags = (args.tags ? args.tags : (args.tag ? [args.tag] : null));
                        result = $.grep(this.cuePoints, function (cuePoint) {
                            var hasTagCondition = filterByTags;
                            var hasTypeCondition = args.types && args.types.length && args.types.length > 0;
                            var isValidTag = hasTagCondition ? filterByTags.indexOf(cuePoint.tags) !== -1 : false;

                            var isValidType = hasTypeCondition ? ($.grep(args.types, function (cuePointType) {
                                return (!cuePointType.main || cuePointType.main === cuePoint.cuePointType) && (!cuePointType.sub || cuePointType.sub === cuePoint.subType);
                            }).length > 0) : false;

                            var passedCustomFilter = (isValidTag || isValidType) && args.filter ? args.filter(cuePoint) : true;


                            return (isValidTag || isValidType) && passedCustomFilter;
                        });

                        result.sort(function (a, b) {
                            return args.sortDesc ? (b.startTime - a.startTime) : (a.startTime - b.startTime);
                        });
                    }

                    return result;
                }
            }, context);
        },
        /**
         * notify listener with cue points that need to be handled
         * @param cuePoints
         * @param eventContext
         */

        _triggerReachedCuePoints: function (cuePoints, eventContext) {
            var _this = this;

            if (_this.onCuePointsReached && cuePoints && cuePoints.length && cuePoints.length > 0) {
                var clonedCuePointsToHandle = [];
                var handledCuePointsIds = '';

                // prepare cue points list to notify listener with
                for (var i = 0; i < cuePoints.length; i++) {

                    var reachedCuePoint = cuePoints[i];
                    handledCuePointsIds += ', ' + reachedCuePoint.id;
                    // Make a copy of the cue point to be triggered.
                    // Sometimes the trigger can result in monitorEvent being called and an
                    // infinite loop ( ie ad network error, no ad received, and restore player calling monitor() )
                    var cuePointToBeTriggered = $.extend({}, reachedCuePoint);
                    clonedCuePointsToHandle.push(cuePointToBeTriggered); // update the cloned list that will be used to invoke event
                }

                // create event args that contains functions to filter the cue points wisely
                var eventArgs = _this._createReachedCuePointsArgs(cuePoints, eventContext);

                _this.log('triggerReachedCuePoints(): notify listener with ' + cuePoints.length + ' cue points to handle' + handledCuePointsIds);
                _this.onCuePointsReached(eventArgs);
            }
        },
        /**
         * Invoke reached event manually for all cue points the started before server time.
         * Ignore optimization that prevent notifying a cue point that was already notified by managing
         * all cue points from the beginning of the entry time.
         */
        _reinvokeReachedLogicManually: function () {
            var _this = this;
            var player = _this.getPlayer();
            var currentTime = player.getPlayerElementTime() * 1000;
            _this.log('reinvokeReachedLogicManually(): server time was modified to a past time (previously ' + _this._lastHandledServerTime + ', current ' + currentTime + "). re-invoke logic by finding all cue points relevant until current time");
            _this._lastHandledServerTime = currentTime;

            _this._nextPendingCuePointIndex = _this._getNextCuePointIndex(currentTime, 0);

            if (_this._nextPendingCuePointIndex > 0 && _this._nextPendingCuePointIndex <= _this.getCuePoints().length) {
                // invoke the following logic if we passed a cue point
                var passedCuePoints = _this.getCuePoints().slice(0, _this._nextPendingCuePointIndex); // get a list of all the cue points that were passed
                _this._triggerReachedCuePoints(passedCuePoints);
            }
        },
        /**
         * Returns the next cuePoint index for requested time
         * @param {Number} time Time in milliseconds
         * @param startFromIndex the first index to start the search from
         * @returns {*}
         */
        _getNextCuePointIndex: function (time, startFromIndex) {
            var _this = this;

            if (!isNaN(time) && time >= 0) {

                startFromIndex = startFromIndex || 0;

                // Start looking for the cue point via time, return FIRST match:
                var cuePointsArray = _this.getCuePoints();
                if (cuePointsArray.length > 0) {
                    var cuePointsLength = cuePointsArray.length;
                    for (var i = startFromIndex; i < cuePointsLength; i++) {
                        if (cuePointsArray[i].startTime >= time) {
                            return i;
                        }
                    }

                    return cuePointsLength; // return the next index which is out-side of the array (because all items in array were already handled)
                }
            }

            return 0;
        },
        _getCuePointByIndex: function (index) {
            var _this = this;

            if ($.isNumeric(index) && index > -1 && index < _this.getCuePoints().length) {
                return _this.getCuePoints()[index];
            }

            return null;
        },
        _getCuePointsReached: function (time, startFromIndex) {
            var _this = this;
            var result = {cuePoints: [], startIndex: startFromIndex, lastIndex: null};

            if ($.isNumeric(startFromIndex) && !isNaN(time) && time >= 0) {
                {
                    startFromIndex = (startFromIndex < 0) ? 0 : startFromIndex;

                    var cuePointsArray = _this.getCuePoints();

                    for (var i = startFromIndex; i < cuePointsArray.length; i++) {
                        var curPoint = cuePointsArray[i];
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
        getCuePointsReached: function () {
            var _this = this;
            var player = _this.getPlayer();
            var currentTime = player.getPlayerElementTime() * 1000;
            var cuePointsContext = _this._getCuePointsReached(currentTime, 0);
            return _this._createReachedCuePointsArgs(cuePointsContext.cuePoints);
        },
        destroy: function () {
            var _this = this;
            _this.log('destroy(): removing listeners for events with bind postfix ' + _this.bindPostFix);
            _this.unbind();
        },
        onCuePointsReached : function(args)
        {
            // do nothing - will be override by creator
        },
        getKalturaClient: function () {
            if (!this.kClient) {
                this.kClient = mw.kApiGetPartnerClient(this.embedPlayer.kwidgetid);
            }
            return this.kClient;
        },
    });
})(window.mw, window.jQuery);