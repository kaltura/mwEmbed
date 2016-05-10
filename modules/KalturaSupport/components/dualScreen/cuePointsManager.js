(function (mw, $) {
    "use strict";
    mw.dualScreen = mw.dualScreen || {};

    var eventBindPostfixIdentifier = 1;
    var defaultName = 'CuePointsManager';

    mw.dualScreen.CuePointsManager = function(name, player, onCuePointsReached, invoker) {

        var $player = $(player);


        var eventsBindPostfix = '.' + (name || defaultName) + eventBindPostfixIdentifier;
        eventBindPostfixIdentifier++;

        var entryEventsBindPostfix = eventsBindPostfix + '-entry';
                var nextPendingCuePointIndex = 0;
        var lastHandledServerTime = null;
        var fetchedCuePoints = [];

        function log(context, message) {
            mw.log(name + "." + defaultName + "." + context + ":" + message);
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
                            var hasTagCondition = filterByTags;
                            var hasTypeCondition = args.types && args.types.length && args.types.length > 0;
                            var isValidTag = hasTagCondition ? filterByTags.indexOf(cuePoint.tags) !== -1 : false;

                            var isValidType = hasTypeCondition ? ($.grep(args.types, function (cuePointType) {
                                return (!cuePointType.main || cuePointType.main === cuePoint.cuePointType) && (!cuePointType.sub || cuePointType.sub === cuePoint.subType);
                            }).length > 0) : false;

                            return isValidTag || isValidType;
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
            if (onCuePointsReached && cuePoints && cuePoints.length && cuePoints.length > 0) {
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
                var eventArgs = createReachedCuePointsArgs(cuePoints,eventContext);

                log('triggerReachedCuePoints()', 'notify listener with ' + cuePoints.length + ' cue points to handle' + handledCuePointsIds);
                onCuePointsReached.call(invoker,eventArgs);
            }
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

            if (nextPendingCuePointIndex > 0 && nextPendingCuePointIndex <= fetchedCuePoints.length) {
                // invoke the following logic if we passed a cue point
                var passedCuePoints = fetchedCuePoints.slice(0, nextPendingCuePointIndex); // get a list of all the cue points that were passed
                triggerReachedCuePoints(passedCuePoints);
            }
        }

        function reset() {
            log('reset()', 'reset internals');
            fetchedCuePoints = [];
            nextPendingCuePointIndex = 0;
            lastHandledServerTime = null;

            log('reset()', 'removing listeners for events with bind postfix ' + entryEventsBindPostfix);
            $player.unbind(entryEventsBindPostfix);

        }

        function destroy()
        {
            log('destroy()', 'removing listeners for events with bind postfix ' + eventsBindPostfix);
            $player.unbind(eventsBindPostfix);

            reset();

        }

        function onPlayerReady()
        {
            log('onPlayerReady()', 'invoked');

            var shouldRun = player && ((player.isLive() && mw.getConfig("EmbedPlayer.LiveCuepoints")) || player.kCuePoints);
            if (!shouldRun) {
                log('onPlayerReady()', 'prerequisites check failed, disabling component');
                return;
            }

            reset();
            fetchedCuePoints = player.kCuePoints ? player.kCuePoints.getCuePoints() : [];

            log('onPlayerReady()', 'registering to events with bind postfix ' + entryEventsBindPostfix);

            $player.bind(
                "monitorEvent" + entryEventsBindPostfix +
                " onplay" + entryEventsBindPostfix,
                function (e) {
                    var currentTime = player.getPlayerElementTime() * 1000;

                    if (currentTime < 0)
                    {
                        // ignore undesired temporary use cases
                        return;
                    }

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
                            log('onPlayerReady.bind(' + e.type + ')', 'updating current index to ' + nextPendingCuePointIndex + ' (will be used next time searching for cue points to handle)');

                            triggerReachedCuePoints(cuePointsReachedToHandle.cuePoints);
                        }

                        var nextCuePoint = getCuePointByIndex(nextPendingCuePointIndex);
                        if (nextCuePoint && currentTime) {
                            var seconds = Math.round((nextCuePoint.startTime - currentTime ) / 1000);

                            if (seconds < 120) {
                                // log only if when the next cue point will be reached in less then x seconds
                                log('onPlayerReady.bind(' + e.type + ')','next cue point with id ' + nextCuePoint.id + ' should be handled in ' + seconds + ' seconds (type \'' + nextCuePoint.cuePointType + '\', tags \'' + nextCuePoint.tags + '\', time ' + nextCuePoint.startTime + ', server time ' + currentTime + ')');
                            }
                        }
                    }
                }
            );
        }

        function initialize() {
            log('initialize()', 'invoked');

            $player.bind('onChangeMedia' + eventsBindPostfix, function () {
                log('onChangeMedia()', 'invoked');
                reset();
            });
            
            $player.bind('playerReady' + eventsBindPostfix, function () {
                log('playerReady()', 'invoked');
                onPlayerReady();
            });

            onPlayerReady();
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

                // Start looking for the cue point via time, return FIRST match:
                if (fetchedCuePoints && fetchedCuePoints.length > 0) {
                    for (var i = startFromIndex; i < fetchedCuePoints.length; i++) {
                        if (fetchedCuePoints[i].startTime >= time) {
                            return i;
                        }
                    }

                    return fetchedCuePoints.length; // return the next index which is out-side of the array (because all items in array were already handled)
                }
            }
            // No cue point found in range return false:
            return -1;
        }

        function getCuePointByIndex(index) {
            if ($.isNumeric(index) && index > -1 && index < fetchedCuePoints.length) {
                return fetchedCuePoints[index];
            }

            return null;
        }

        function getCuePointsReached(time, startFromIndex) {

            var result = {cuePoints: [], startIndex: startFromIndex, lastIndex: null};

            if ($.isNumeric(startFromIndex) && !isNaN(time) && time >= 0) {
                {
                    startFromIndex = (startFromIndex < 0) ? 0 : startFromIndex;

                    for (var i = startFromIndex; i < fetchedCuePoints.length; i++) {
                        var curPoint = fetchedCuePoints[i];
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

        this.getCuePointsReached = function() {

            var currentTime = player.getPlayerElementTime() * 1000;
            var cuePointsContext = getCuePointsReached(currentTime, 0);
            return createReachedCuePointsArgs(cuePointsContext.cuePoints);


            return null;
        }
        this.destroy = destroy;


        initialize();
    }
})( window.mw, window.jQuery);