(function (mw, $) {
    "use strict";
    mw.webcast = mw.webcast || {};

    mw.webcast.CuePointsManager = mw.KBasePlugin.extend({
        _nextPendingCuePointIndex: 0,
        _lastHandledServerTime: null,
        _monitoredCuepoints : {
            enabled : false,
            typesMapping : {}
        },
        setup: function () {
            var _this = this;

            _this.addBindings();

            _this.log('initialize()', 'invoked');
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

            _this.log('addBindings()', 'invoked');

            var player = _this.getPlayer();
            var shouldRun = player && ((player.isLive() && mw.getConfig("EmbedPlayer.LiveCuepoints")) || player.kCuePoints);
            if (!shouldRun) {
                _this.log('addBindings()', 'prerequisites check failed, disabling component');
                return;
            }


            _this.log('addBindings()', 'registering to events with bind postfix ' + _this.bindPostFix);

            _this.bind("onChangeMedia", function() {

                // TODO [es] df

            });

            _this.bind("playerReady", function() {
                if (_this._monitoredCuepoints.enabled)
                {
                    var cuepoints = _this.getCuePoints();

                    var monitoredCuepoints = {};

                    if (cuepoints && cuepoints.length)
                    {
                        for(var i=0;i<cuepoints.length;i++)
                        {
                            var cuepoint = cuepoints[i];

                            // TODO [es] filter by type cue points and annotation
                            if (cuepoint && cuepoint.tags && cuepoint.Type !== '')
                            {
                                var types = cuepoint.tags.split(',');

                                for(var j=0;j<types.length;j++)
                                {
                                    var type = types[j];

                                    var callbacks = _this._monitoredCuepoints.typesMapping[type];

                                    if (callbacks && callbacks.length)
                                    {
                                        var monitoredCuepointsByType = monitoredCuepoints[type];
                                        if (!monitoredCuepointsByType)
                                        {
                                            monitoredCuepointsByType = monitoredCuepoints[type] = [];
                                        }

                                        _this.log("got flagged cuepoint to monitor of type '" + type + "' with cuepoint id '" + cuepoint.id + "'");
                                        monitoredCuepointsByType.push(cuepoint);
                                    }
                                }
                            }
                        }
                    }

                    for(var cuepointType in monitoredCuepoints)
                    {
                        var callbacks = _this._monitoredCuepoints.typesMapping[cuepointType];

                        if (callbacks && callbacks.length)
                        {
                            var callbackCuepoints = monitoredCuepoints[cuepointType];
                            for(var k=0;k<callbacks.length;k++)
                            {
                                callbacks[k](callbackCuepoints);
                            }
                        }
                    }
                }
            });



            _this.bind(
                "monitorEvent onplay",
                function (e) {
                    var player = _this.getPlayer();
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
                            _this.log('initialize.bind(' + e.type + ')', 'found ' + cuePointsReachedToHandle.cuePoints.length + ' cue point that should be handled (server time ' + currentTime + ')');
                            _this._nextPendingCuePointIndex = cuePointsReachedToHandle.lastIndex + 1;
                            _this.log('onPlayerReady.bind(' + e.type + ')', 'updating current index to ' + _this._nextPendingCuePointIndex + ' (will be used next time searching for cue points to handle)');

                            _this._triggerReachedCuePoints(cuePointsReachedToHandle.cuePoints);
                        }

                        var nextCuePoint = _this._getCuePointByIndex(_this._nextPendingCuePointIndex);
                        if (nextCuePoint && currentTime) {
                            var seconds = Math.round((nextCuePoint.startTime - currentTime ) / 1000);

                            if (seconds < 100) {
                                // log only if when the next cue point will be reached in less then x seconds
                                _this.log('onPlayerReady.bind(' + e.type + ')', 'next cue point with id ' + nextCuePoint.id + ' should be handled in ' + seconds + ' seconds (type \'' + nextCuePoint.cuePointType + '\', tags \'' + nextCuePoint.tags + '\', time ' + nextCuePoint.startTime + ', server time ' + currentTime + ')');
                            }
                        }
                    }
                }
            );
        },
        monitorCuepoints : function(cuepointTypes, callback)
        {
            var _this = this;

            if (cuepointTypes && cuepointTypes.length && callback)
            {
                _this._monitoredCuepoints.enabled = true;
                for(var i=0;i<cuepointTypes.length;i++)
                {
                    var cuepointType = cuepointTypes[i];
                    _this.log("added monitor callback for cuepoint of type '" + cuepointType + "'");
                    var callbackList = _this._monitoredCuepoints.typesMapping[cuepointType];
                    if (!callbackList)
                    {
                        callbackList = _this._monitoredCuepoints    .typesMapping[cuepointType] = [];
                    }

                    callbackList.push(callback);
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

                _this.log('triggerReachedCuePoints()', 'notify listener with ' + cuePoints.length + ' cue points to handle' + handledCuePointsIds);
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
            _this.log('reinvokeReachedLogicManually()', 'server time was modified to a past time (previously ' + _this._lastHandledServerTime + ', current ' + currentTime + "). re-invoke logic by finding all cue points relevant until current time");
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

                    for (var i = startFromIndex; i < _this.getCuePoints().length; i++) {
                        var curPoint = _this.getCuePoints()[i];
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
            _this.log('destroy()', 'removing listeners for events with bind postfix ' + _this.bindPostFix);
            _this.unbind();
        },
        onCuePointsReached : function(args)
        {
            // do nothing - will be override by creator
        }
    });
})(window.mw, window.jQuery);