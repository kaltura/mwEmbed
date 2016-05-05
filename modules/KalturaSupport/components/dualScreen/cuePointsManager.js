(function (mw, $) {
    "use strict";
    mw.dualScreen = mw.dualScreen || {};

    mw.dualScreen.CuePointsManager = function(name, bindPostfix, player, onCuePointsReached, invoker) {

        var $player = $(player);
        var nextPendingCuePointIndex = 0;
        var lastHandledServerTime = null;
        var isEnabled = false;

        function log(context, message) {
            mw.log(name + "." + context + ":" + message);
        }

        function createReachedCuePointsArgs(cuePoints, context)
        {
            return $.extend({
                'cuePoints': cuePoints,
                filter: function (args) {
                    var result = [];

                    if (this.cuePoints) {
                        var filterByTags = (args.tags ? args.tags : (args.tag ? [args.tag] : null));
                        result = $.grep(this.cuePoints, function (cuePoint) {
                            var isValidTag = (!filterByTags || filterByTags.indexOf(cuePoint.tags) !== -1);
                            var isValidType = (!args.types || $.grep(args.types, function (cuePointType) {
                                return (!cuePointType.main || cuePointType.main === cuePoint.cuePointType) && (!cuePointType.sub || cuePointType.sub === cuePoint.subType);
                            }).length > 0);

                            return isValidTag && isValidType;
                        });

                        result.sort(function (a, b) {
                            return args.sortDesc ? (b.startTime - a.startTime) : (a.startTime - b.startTime);
                        });
                    }

                    return result;
                }
            }, context);
        }
        /**
         * notify listener with cue points that need to be handled
         * @param cuePoints
         * @param eventContext
         */

        function triggerReachedCuePoints(cuePoints,eventContext)
        {
            if (onCuePointsReached) {
                // create event args that contains functions to filter the cue points wisely
                var eventArgs = createReachedCuePointsArgs(cuePoints,eventContext);

                log('triggerReachedCuePoints()', 'notify listener with ' + cuePoints.length + ' cue points to handle');
                onCuePointsReached.call(invoker,eventArgs);
            }
        }

        function getManagerCuePoints() {

            return player.kCuePoints ? player.kCuePoints.getManagerCuePoints() : [];
        }

        /**
         * Invoke reached event manually for all cue points the started before server time.
         * Ignore optimization that prevent notifying a cue point that was already notified by managing
         * all cue points from the beginning of the entry time.
         */
        function reinvokeReachedLogicManually()
        {
            var currentTime = player.getPlayerElementTime() * 1000;
            log('reinvokeReachedLogicManually()', 'server time was modified to a past time (previously ' + lastHandledServerTime + ', current ' + currentTime + "). re-invoke logic by finding all cue points relevant until current time" );
            lastHandledServerTime = currentTime;

            nextPendingCuePointIndex = getNextCuePointIndex(currentTime, 0);

            var cuePoints = getManagerCuePoints();

            if (nextPendingCuePointIndex > 0 && nextPendingCuePointIndex <= cuePoints.length) {
                // invoke the following logic if we passed a cue point
                var passedCuePoints = cuePoints.slice(0, nextPendingCuePointIndex); // get a list of all the cue points that were passed
                triggerReachedCuePoints(passedCuePoints);
            }
        }

        function enable()
        {
            isEnabled = true;
        }

        function disable()
        {
            isEnabled = false;
        }

        function initialize() {
            $player.bind('onChangeMedia', function () {
                disable();
                // reset internal state to be ready for new media
                nextPendingCuePointIndex = 0;
                lastHandledServerTime = null;
            });

            $player.bind(
                "monitorEvent" + bindPostfix +
                " onplay" + bindPostfix,
                function (e) {

                    if (!isEnabled)
                    {
                        return;
                    }

                    var currentTime = player.getPlayerElementTime() * 1000;

                    if ($.isNumeric(lastHandledServerTime) && (lastHandledServerTime - 2000) > currentTime)
                    {
                        // this part handles situation when user 'seek' from the player or if the server time changes
                        // for unknown reason. We don't use the 'seek' event since it sometimes provide an offset time and
                        // fix the value later but our code already modify its' internal state according to the offset time.
                        reinvokeReachedLogicManually();
                        return;
                    }

                    lastHandledServerTime = currentTime;


                    if (getCuePointByIndex(nextPendingCuePointIndex)) {

                        var cuePointsReachedToHandle = getCuePointsReached(currentTime, nextPendingCuePointIndex);

                        if (cuePointsReachedToHandle.cuePoints.length > 0) {
                            log('initialize.bind(' + e.type + ')', 'found ' + cuePointsReachedToHandle.cuePoints.length + ' cue point that should be handled (server time ' + currentTime + ')');
                            nextPendingCuePointIndex = cuePointsReachedToHandle.lastIndex + 1;
                            log('initialize.bind(' + e.type + ')', 'updating current index to ' + nextPendingCuePointIndex + ' (will be used next time searching for cue points to handle)');

                            var clonedCuePointsToHandle = [];
                            for (var i = 0; i < cuePointsReachedToHandle.cuePoints.length; i++) {

                                var reachedCuePoint = cuePointsReachedToHandle.cuePoints[i];
                                mw.log('initialize.bind(' + e.type + ')','trigger event for cuePoint ' + reachedCuePoint.id + ' with start time ' + new Date(reachedCuePoint.startTime));
                                // Make a copy of the cue point to be triggered.
                                // Sometimes the trigger can result in monitorEvent being called and an
                                // infinite loop ( ie ad network error, no ad received, and restore player calling monitor() )
                                var cuePointToBeTriggered = $.extend({}, reachedCuePoint);
                                clonedCuePointsToHandle.push(cuePointToBeTriggered); // update the cloned list that will be used to invoke event
                            }

                            // invoke the reached aggregated event - use the cloned list since
                            // sometimes the trigger can result in monitorEvent being called and an
                            // infinite loop ( ie ad network error, no ad received, and restore player calling monitor() )
                            triggerReachedCuePoints(clonedCuePointsToHandle);
                        }

                        var nextCuePoint = getCuePointByIndex(nextPendingCuePointIndex);
                        if (nextCuePoint && currentTime) {
                            var seconds = Math.round((nextCuePoint.startTime - currentTime ) / 1000);

                            if (seconds < 120) {
                                // log only if when the next cue point will be reached in less then x seconds
                                log('initialize.bind(' + e.type + ')','next cue point with id ' + nextCuePoint.id + ' should be handled in ' + seconds + ' seconds (type \'' + nextCuePoint.cuePointType + '\', tags \'' + nextCuePoint.tags + '\', time ' + nextCuePoint.startTime + ', server time ' + currentTime + ')');
                            }
                        }
                    }
                }
            );
        }

        /**
         * Returns the next cuePoint index for requested time
         * @param {Number} time Time in milliseconds
         * @param startFromIndex the first index to start the search from
         * @returns {*}
         */
        function getNextCuePointIndex(time, startFromIndex) {
            if (!isNaN(time) && time >= 0) {

                startFromIndex = startFromIndex || 0;

                var cuePoints = getManagerCuePoints();

                // Start looking for the cue point via time, return FIRST match:
                if (cuePoints && cuePoints.length > 0) {
                    for (var i = startFromIndex; i < cuePoints.length; i++) {
                        if (cuePoints[i].startTime >= time) {
                            return i;
                        }
                    }

                    return cuePoints.length; // return the next index which is out-side of the array (because all items in array were already handled)
                }
            }
            // No cue point found in range return false:
            return -1;
        }

        function getCuePointByIndex(index) {
            var cuePoints = getManagerCuePoints();
            if ($.isNumeric(index) && index > -1 && index < cuePoints.length) {
                return cuePoints[index];
            }

            return null;
        }

        function getCuePointsReached(time, startFromIndex) {

            var result = {cuePoints: [], startIndex: startFromIndex, lastIndex: null};

            if ($.isNumeric(startFromIndex) && !isNaN(time) && time >= 0) {
                {
                    startFromIndex = (startFromIndex < 0) ? 0 : startFromIndex;

                    var cuePoints = getManagerCuePoints();

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
        }

        this.isEnabled = function()
        {
            return isEnabled;
        };
        this.enable = enable;
        this.disable = disable;
        this.getCuePointsReached = function()
        {
            if (isEnabled) {
                var currentTime = player.getPlayerElementTime() * 1000;
                var cuePointsContext = getCuePointsReached(currentTime, 0);
                return createReachedCuePointsArgs(cuePointsContext.cuePoints);
            }

            return null;
        }


        initialize();
    }
})( window.mw, window.jQuery);