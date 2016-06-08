(function (mw, $) {
    "use strict";

    mw.PluginManager.add('webcastPolls', mw.KBasePlugin.extend({
        defaultConfig: {
            monitorPollResultsInterval: 5000
        },
        currentPollId: null,
        cuePointsManager: null,
        cachedPollsContent: {},
        poolVotingProfileId: null,
        userId: null,
        userVote: {}, // ## Should remain empty (filled by 'resetPersistData')
        pollData: {}, // ## Should remain empty (filled by 'resetPersistData')
        kalturaProxy: null,
        kClient: null,
        isPollShown: false,
        userProfile: null,
        resetPersistData: function ()
        {
            var _this = this;

            _this.userVote = {metadataId: null, answer: null, inProgress: false, canUserVote: false, isReady: false};
            _this.pollData = {
                content: null,
                showResults: false,
                showTotals: false,
                fetchResultsId: null,
                pollResults: null
            };
            _this.currentPollId = null;
        },
        setup: function ()
        {
            var _this = this;

            _this.resetPersistData();

            _this.addBindings();
            _this.initializeDependentPlugins();

            _this.userId = _this.userProfile.getUserID();

            _this.kalturaProxy.getVoteCustomMetadataProfileId().then(function (result) {
                _this.poolVotingProfileId = result.profileId;
            }, function (reason) {
                _this.poolVotingProfileId = null;
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
        filterCuePoints : function(context)
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
                            if (!_this.handleReachedCuePoints(cuePointsReachedArgs)) {
                                // when user seek/press play we need to handle scenario that no relevant cue points has reached and thus we need to clear the image shown.
                                _this.removePoll();
                            }
                        }
                    }
                    break;
                default:
                    break;
            }

            var _this = this;

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
                _this.cuePointsManager.onCuePointsReached = $.proxy(_this.handleReachedCuePoints,_this);
            }
        },
        handleReachedCuePoints: function (args)
        {
            var _this = this;
            var mostUpdatedCuePointToHandle = _this.filterCuePoints(args);
            if (mostUpdatedCuePointToHandle) {
                try {
                    var showingAPoll = mostUpdatedCuePointToHandle.tags.indexOf('select-poll-state') > -1;

                    if (showingAPoll) {
                        var pollState = JSON.parse(mostUpdatedCuePointToHandle.partnerData);

                        if (pollState) {
                            _this.showOrUpdatePollByState(pollState);
                        }

                    } else {
                        _this.removePoll();
                    }
                } catch (e) {
                    // TODO [es]
                }

            }

            return !!mostUpdatedCuePointToHandle;
        },
        removePoll: function ()
        {
            var _this = this;

            if (_this.isPollShown) {
                _this.view.removeWebcastPollElement();
                _this.isPollShown = false;
            }

            // ## IMPORTANT: perform cleanup of information that was relevant to previous poll
            _this.resetPersistData();

            _this.stopMonitorPollResults();
        },
        showOrUpdatePollByState: function (pollState)
        {
            var _this = this;

            if (!pollState || !pollState.pollId) {
                // todo [es] handle invalid state
                return;

            }

            try {
                var isShowingRequestedPoll = _this.currentPollId === pollState.pollId;
                var pollElement = _this.view.getWebcastPollElement(); // Important: we invoke this function to make sure the webcast poll element exists

                if (pollElement) {

                    if (!isShowingRequestedPoll) {
                        // ## prepare component internals to new poll
                        _this.resetPersistData();

                        // ## update internals
                        _this.isPollShown = true;
                        _this.currentPollId = pollState.pollId;
                    }

                    // sync internals with poll status
                    _this.userVote.canUserVote = pollState.allowVoting;
                    _this.pollData.showTotals = pollState.showTotals && pollState.showTotals !== 'disabled';
                    _this.pollData.showResults = pollState.showResults && pollState.showResults !== 'disabled';

                    if (!isShowingRequestedPoll)
                    {
                        // ## show the poll the first time & extract important information

                        var invokedByPollId = _this.currentPollId;
                        // ## get poll data to show
                        _this.getPollContent(pollState.pollId, true).then(function (result) {
                            if (invokedByPollId === _this.currentPollId) {
                                _this.pollData.content = result.content;
                                _this.pollData.pollResults = result.results;

                                _this.userVote.isReady = true;
                                _this.userVote.answer = result.userVote.answer;
                                _this.userVote.metadataId = result.userVote.metadataId;

                                _this.view.syncPollDOM();
                            }
                        }, function (reason) {
                            if (invokedByPollId === _this.currentPollId) {
                                // TODO [es] handle
                            }
                        });

                        _this.updatePollResultsStatus();

                        // make sure we update the view with the new poll
                        _this.view.syncPollDOM();
                    } else {
                        // ## update current poll with voting and results according to poll status.
                        _this.updatePollResultsStatus();
                        _this.view.syncDOMUserVoting();
                    }
                }else{
                    // TODO [es]
                }

            } catch (e) {
                // todo [es] handle
            }
        },
        updatePollResultsStatus: function ()
        {
            var _this = this;

            if (_this.pollData.showTotals || _this.pollData.showResults) {
                _this.startMonitorPollResults();
            } else {
                _this.stopMonitorPollResults();
            }
        },
        startMonitorPollResults: function ()
        {
            var _this = this;
            if (!_this.pollData.fetchResultsId) {
                _this.view.syncDOMPollResults();
                _this.pollData.fetchResultsId = setInterval($.proxy(_this.updatePollResults,_this), _this.getConfig('monitorPollResultsInterval'))
            }
        },
        updatePollResults: function ()
        {
            var _this = this;
            var invokedByPollId = _this.currentPollId;
            _this.kalturaProxy.getPollResults(invokedByPollId).then(function (result) {
                if (invokedByPollId === _this.currentPollId) {
                    _this.pollData.pollResults = result.pollResults;
                    _this.view.syncDOMPollResults();
                }
            }, function (reason) {
                // TODO [es] handle
            })
        },
        stopMonitorPollResults: function ()
        {
            var _this = this;
            if (_this.pollData.fetchResultsId) {
                clearInterval(_this.pollData.fetchResultsId);
                _this.pollData.fetchResultsId = null;
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

                _this.kalturaProxy.getPollContent(pollId,_this.poolVotingProfileId, _this.userId).then(function (result) {
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
            return _this.currentPollId && _this.poolVotingProfileId && !_this.userVote.inProgress && _this.userVote.canUserVote && _this.userVote.isReady;
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
                    var invokedByPollId = _this.currentPollId;
                    _this.kalturaProxy.transmitVoteUpdate(_this.userVote.metadataId, _this.userId, selectedAnswer).then(function (result) {
                        if (invokedByPollId === _this.currentPollId) {
                            _this.userVote.inProgress = false;
                            _this.view.syncDOMUserVoting();
                        }

                    }, function (reason) {
                        if (invokedByPollId === _this.currentPollId) {
                            // TODO [es]
                            _this.userVote.inProgress = false;
                            _this.userVote.answer = previousAnswer;
                            _this.view.syncDOMUserVoting();
                        }
                    });
                } else {
                    var invokedByPollId = _this.currentPollId;
                    _this.kalturaProxy.transmitNewVote(_this.currentPollId, _this.poolVotingProfileId, _this.userId, selectedAnswer).then(function (result) {
                        if (invokedByPollId === _this.currentPollId) {
                            _this.userVote.inProgress = false;
                            _this.userVote.metadataId = result.metadataId;
                            _this.view.syncDOMUserVoting();
                        }

                    }, function (reason) {
                        if (invokedByPollId === _this.currentPollId) {
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

