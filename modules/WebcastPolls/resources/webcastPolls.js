(function (mw, $) {
    "use strict";

    /**
     * Plugin representing a webcast polls.
     * This class is responsible for the the interaction with the producer (using cue points), the player (using player events) and the user (using dom elements and events).
     */
    mw.PluginManager.add('webcastPolls', mw.KBasePlugin.extend({
        defaultConfig: {
        },
        cuePointsManager: null,
        cachedPollsContent: {},
        kalturaProxy: null,
        kClient: null,
        userProfile: null,
        userVote: {}, // ## Should remain empty (filled by 'resetPersistData')
        pollData: {}, // ## Should remain empty (filled by 'resetPersistData')
        globals : {
            votingProfileId: null,
            userId: null,
            isPollShown: false
        },
        resetPersistData: function ()
        {
            var _this = this;

            _this.userVote = {metadataId: null, answer: null, inProgress: false, canUserVote: false, isReady: false, showAnswers :false};
            _this.pollData = {
                pollId : null,
                content: null,
                showResults: false,
                showTotals: false,
                pollResults: null
            };
        },
        setup: function ()
        {
            var _this = this;

            _this.resetPersistData();

            _this.addBindings();
            _this.initializeDependentPlugins();

            _this.globals.userId = _this.userProfile.getUserID();

            _this.kalturaProxy.getVoteCustomMetadataProfileId().then(function (result) {
                _this.globals.votingProfileId = result.profileId;
            }, function (reason) {
                _this.globals.votingProfileId = null;
            });
        },
        addBindings: function ()
        {
            // bind to cue point events
            var _this = this;

            this.bind('onpause seeked onplay onChangeMedia', function (e) {
                _this.handlePlayerEvent(e.type);
            });
        },
        filterStateCuePoints : function(context)
        {
            var _this = this;
            if (context && context.filter && context.cuePoints) {
                var relevantCuePoints = context.filter({
                    tags: ['select-poll-state', 'remove-selected-thumb', 'select-a-thumb'],
                    sortDesc: true
                });

                return relevantCuePoints.length > 0 ? relevantCuePoints[0] : null; // since we ordered the relevant cue points descending - the first cue point is the most updated
            }

            return null;
        },
        filterPollResultsCuePoints : function(context)
        {
            var _this = this;
            if (context && context.filter && context.cuePoints && _this.pollData.pollId) {

                try {
                    var relevantCuePoints = context.filter({
                        tags: ['poll-results'],
                        sortDesc: true,
                        filter : function(cuePoint)
                        {
                            var pollData = JSON.parse(cuePoint.partnerData);
                            return pollData.pollId  === _this.pollData.pollId;
                        }
                    });

                    return relevantCuePoints.length > 0 ? relevantCuePoints[0] : null; // since we ordered the relevant cue points descending - the first cue point is the most updated
                }catch(e)
                {
                    // TODO [es]
                }
            }

            return null;
        },
        handlePlayerEvent : function(eventName)
        {
            var _this = this;

            switch(eventName)
            {
                case 'onpause':
                case 'onChangeMedia':
                    _this.removePoll();
                    break;
                case 'onplay':
                case 'seeked':
                    if (eventName === 'onplay' || (eventName === 'seeked' && !_this.getPlayer().isPlaying())) {
                        if (_this.cuePointsManager) {
                            var cuePointsReachedArgs = _this.cuePointsManager.getCuePointsReached();

                            // when user seek/press play we need to handle scenario that no relevant cue points has reached and thus we need to perform some cleanups
                            _this.handleStateCuePoints(true);
                            _this.handlePollResultsCuePoints(true);
                        }
                    }
                    break;
                default:
                    break;
            }

            return false;
        },
        initializeDependentPlugins: function ()
        {
            var _this = this;

            if (!_this.userProfile) {
                // we need to initialize the instance
                _this.userProfile = new mw.webcast.UserProfile(_this.getPlayer(), function () {
                }, "webcastPollsUserProfile");
            }

            if (!_this.kalturaProxy) {
                // we need to initialize the instance
                _this.kalturaProxy = new mw.webcastPolls.WebcastPollsKalturaProxy(_this.getPlayer(), function () {
                }, "webcastPollsKalturaProxy");
            }

            if (!_this.view) {
                // we need to initialize the instance
                _this.view = new mw.webcastPolls.WebcastPollsView(_this.getPlayer(), function () {
                }, "webcastPollsKalturaView");
                _this.view.parent = _this;
            }

            if (!_this.cuePointsManager) {
                // we need to initialize the instance
                _this.cuePointsManager = new mw.webcast.CuePointsManager(_this.getPlayer(), function () {
                }, "webcastPollsCuePointsManager");
                _this.cuePointsManager.onCuePointsReached = $.proxy(function(args)
                {
                    _this.handleStateCuePoints(args);
                    _this.handlePollResultsCuePoints(args);
                },_this);
            }
        },
        handlePollResultsCuePoints: function (args)
        {
            var _this = this;
            var resetMode = false;
            var cuePointArgs = args;

            if ($.type(args) === 'boolean' )
            {
                if (args) {
                    resetMode = true;
                    cuePointArgs = _this.cuePointsManager.getCuePointsReached();
                }else
                {
                    return;
                }
            }

            if (_this.pollData.showResults || _this.pollData.showTotals)
            {
                var pollResultsCuePoint = _this.filterPollResultsCuePoints(cuePointArgs);
                if (pollResultsCuePoint && pollResultsCuePoint.partnerData) {
                    try {
                        var pollResults = JSON.parse(pollResultsCuePoint.partnerData);
                        _this.pollData.pollResults = pollResults;
                    } catch (e) {
                        _this.pollData.pollResults = null;
                    }

                }else {
                    if (resetMode) {
                        _this.pollData.pollResults = null;
                    }
                }
            }else
            {
                _this.pollData.pollResults = null;
            }

            _this.view.syncDOMPollResults();
        },
        handleStateCuePoints: function (args)
        {
            var _this = this;
            var resetMode = false;
            var cuePointArgs = args;

            if ($.type(args) === 'boolean')
            {
                if (args) {
                    resetMode = true;
                    cuePointArgs = _this.cuePointsManager.getCuePointsReached();
                }else
                {
                    return;
                }
            }

            var stateCuePointToHandle = _this.filterStateCuePoints(cuePointArgs);
            if (stateCuePointToHandle) {
                try {
                    var showingAPoll = stateCuePointToHandle.tags.indexOf('select-poll-state') > -1;

                    if (showingAPoll) {
                        var pollState = JSON.parse(stateCuePointToHandle.partnerData);

                        if (pollState) {
                            _this.showOrUpdatePollByState(pollState);
                        }
                    } else {
                        _this.removePoll();
                    }
                } catch (e) {
                    // TODO [es]
                }

            }else {
                if (resetMode) {
                    _this.removePoll();
                }
            }

            return !!stateCuePointToHandle;
        },
        removePoll: function ()
        {
            var _this = this;

            if (_this.globals.isPollShown) {
                _this.view.removeWebcastPollElement();
                _this.globals.isPollShown = false;
            }

            // ## IMPORTANT: perform cleanup of information that was relevant to previous poll
            _this.resetPersistData();
        },
        showOrUpdatePollByState: function (pollState)
        {
            var _this = this;

            if (!pollState || !pollState.pollId) {
                // todo [es] handle invalid state
                return;

            }

            try {
                var isShowingRequestedPoll = _this.pollData.pollId === pollState.pollId;
                var pollElement = _this.view.getWebcastPollElement(); // Important: we invoke this function to make sure the webcast poll element exists

                if (pollElement) {

                    if (!isShowingRequestedPoll) {
                        // ## prepare component internals to new poll
                        _this.resetPersistData();

                        // ## update internals
                        _this.globals.isPollShown = true;
                        _this.pollData.pollId = pollState.pollId;
                    }

                    // sync internals with poll status
                    _this.userVote.canUserVote = pollState.status === 'inProgress';
                    _this.pollData.showAnswers = pollState.showAnswers;
                    _this.pollData.showTotals = pollState.showTotals && pollState.showTotals !== 'disabled';
                    _this.pollData.showResults = pollState.showResults && pollState.showResults !== 'disabled';

                    if (!isShowingRequestedPoll)
                    {
                        // ## show the poll the first time & extract important information

                        var invokedByPollId = _this.pollData.pollId;
                        // ## get poll data to show
                        _this.getPollContent(pollState.pollId, true).then(function (result) {
                            if (invokedByPollId === _this.pollData.pollId) {
                                _this.pollData.content = result.content;
                                _this.userVote.isReady = true;
                                _this.userVote.answer = result.userVote.answer;
                                _this.userVote.metadataId = result.userVote.metadataId;

                                _this.updatepoll

                                _this.view.syncPollDOM();
                            }
                        }, function (reason) {
                            if (invokedByPollId === _this.pollData.pollId) {
                                // TODO [es] handle
                            }
                        });


                        // make sure we update the view with the new poll
                        _this.view.syncPollDOM();
                    } else {
                        // ## update current poll with voting and results according to poll status.
                        _this.view.syncDOMAnswersVisibility();
                        _this.view.syncDOMUserVoting();
                        _this.view.syncDOMPollResults();
                    }
                }else{
                    // TODO [es]
                }

            } catch (e) {
                // todo [es] handle
            }
        },
        getPollContent: function (pollId, forceGet)
        {
            var _this = this;
            var defer = $.Deferred();

            if (_this.cachedPollsContent[pollId] && !forceGet) {
                var pollData = pollData[pollId].pollData;
                var pollResults = pollData[pollId].pollResults;
                var userVote = pollData[pollId].userVote;
                defer.resolve({content: pollData, results : pollResults, userVote : userVote});
            } else {
                _this.cachedPollsContent[pollId] = null;

                _this.kalturaProxy.getPollContent(pollId,_this.globals.votingProfileId, _this.globals.userId).then(function (result) {
                    try {
                        _this.cachedPollsContent[pollId] = result;
                        defer.resolve({content: result.pollData, results : result.pollResults,  userVote : result.userVote});
                    } catch (e) {
                        defer.reject({});
                    }
                }, function (reason) {
                    mw.log(reason);
                    defer.reject({});
                });
            }

            return defer.promise();
        },
        canUserVote: function ()
        {
            var _this = this;
            return _this.pollData.pollId && _this.globals.votingProfileId && !_this.userVote.inProgress && _this.userVote.canUserVote && _this.userVote.isReady;
        },
        handleAnswerClicked: function (e)
        {
            var _this = this;

            if (!_this.canUserVote()) {
                return;
            }

            var previousAnswer = _this.userVote.answer;

            try {
                var selectedAnswer = $(e.currentTarget).find("[data-poll-value]").data('poll-value');

                if (isNaN(selectedAnswer))
                {
                    // TODO [es]
                    return;

                }
                if (_this.userVote.answer === selectedAnswer) {
                    return;
                }
                _this.userVote.inProgress = true;
                _this.userVote.answer = selectedAnswer;
                _this.view.syncDOMUserVoting();

                if (_this.userVote.metadataId) {
                    var invokedByPollId = _this.pollData.pollId;
                    _this.kalturaProxy.transmitVoteUpdate(_this.userVote.metadataId, _this.globals.userId, selectedAnswer).then(function (result) {
                        if (invokedByPollId === _this.pollData.pollId) {
                            _this.userVote.inProgress = false;
                            _this.view.syncDOMUserVoting();
                        }

                    }, function (reason) {
                        if (invokedByPollId === _this.pollData.pollId) {
                            // TODO [es]
                            _this.userVote.inProgress = false;
                            _this.userVote.answer = previousAnswer;
                            _this.view.syncDOMUserVoting();
                        }
                    });
                } else {
                    var invokedByPollId = _this.pollData.pollId;
                    _this.kalturaProxy.transmitNewVote(_this.pollData.pollId, _this.globals.votingProfileId, _this.globals.userId, selectedAnswer).then(function (result) {
                        if (invokedByPollId === _this.pollData.pollId) {
                            _this.userVote.inProgress = false;
                            _this.userVote.metadataId = result.metadataId;
                            _this.view.syncDOMUserVoting();
                        }

                    }, function (reason) {
                        if (invokedByPollId === _this.pollData.pollId) {
                            // TODO [es]
                            _this.userVote.inProgress = false;
                            _this.userVote.answer = previousAnswer;
                            _this.view.syncDOMUserVoting();
                        }
                    });
                }
            } catch (e) {
                // TODO [es]
                _this.userVote.inProgress = false;
                _this.userVote.answer = previousAnswer;
                _this.view.syncDOMUserVoting();

            }

        }
    }));

})(window.mw, window.jQuery);

