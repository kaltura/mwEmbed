(function (mw, $) {
    "use strict";
    mw.dualScreen = mw.dualScreen || {};

    mw.dualScreen.CuePointsManager = function(name, bindPostfix, player, onCuePointsReached) {

        var $player = $(player);
        var nextPendingCuePointIndex = null;

        function log(context, message) {
            mw.log(name + "." + context + ":" + message);
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
                var eventArgs = $.extend({
                    'cuePoints': cuePoints,
                    filter: function (args) {
                        var result = [];

                        if (this.cuePoints) {
                            result = $.grep(this.cuePoints, function (cuePoint) {
                                var isValidTag = (!args.tag || (cuePoint.tags === args.tag));
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
                }, eventContext);

                log('triggerReachedCuePoints()', 'notify listener with ' + cuePoints.length + ' cue points to handle');
                onCuePointsReached(eventArgs);
            }
        }

        function getCodeCuePoints() {
            return player.kCuePoints.getCodeCuePoints();
        }

        function initialize() {
            nextPendingCuePointIndex = getNextCuePointIndex(0);

            $player.bind('onChangeMedia', function () {
                nextPendingCuePointIndex = getNextCuePointIndex(0);
            });

            $player.bind('seeked', function () {
                //In case of seeked the current cuepoint needs to be updated to new seek time before
                var currentTime = player.getPlayerElementTime() * 1000;

                log('bind(seeked)', 'event of type seeked invoked, re-searching for first relevant cuepoint by new time. ');
                nextPendingCuePointIndex = getNextCuePointIndex(currentTime, 0);

                var cuePoints = getCodeCuePoints();

                if (nextPendingCuePointIndex > 0 && nextPendingCuePointIndex <= cuePoints.length) {
                    // invoke the following logic if we passed a cue point
                    var passedCuePoints = cuePoints.slice(0, nextPendingCuePointIndex); // get a list of all the cue points that were passed
                    triggerReachedCuePoints(passedCuePoints);
                }
            });

            $player.bind(
                "monitorEvent" + bindPostfix +
                " onplay" + bindPostfix,
                function (e) {
                    var currentTime = player.getPlayerElementTime() * 1000;

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

                var cuePoints = getCodeCuePoints();

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
            var cuePoints = getCodeCuePoints();
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

                    var cuePoints = getCodeCuePoints();

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

        initialize();
    }
})( window.mw, window.jQuery);