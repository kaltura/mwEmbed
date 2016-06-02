(function (mw, $) {
    "use strict";

    mw.PluginManager.add('webcastPolls', mw.KBasePlugin.extend({
        defaultConfig : {
            'templatePath' : '../WebcastPolls/resources/webcastPolls.tmpl.html'
        },
        locale: {
            respondsLbl: gM('mwe-webc-polls-respondsLbl')
        },
        currentPollId : null,
        cuePointsManager : null,
        pollsData : {},
        poolVotingProfileId : null,
        userId : null,
        userVote : {
            metadataId : null,
            answer : null,
            inProgress : false,
            canUserVote : false
        },
        kalturaProxy : null,
        kClient : null,
        isPollShown: false,
        userProfile : null,
        resetPersistData : function()
        {
            _this.userVote = { metadataId : null, answer : null, inProgress : false, canUserVote : false};
            _this.currentPollId = null;
        },
        setup: function () {
            this.addBindings();
            this.initializeDependentPlugins();
            this.initializeImportantInfo();
        },
        addBindings: function () {
            // bind to cue point events
            var _this = this;

            this.bind('onpause', function () {
                // TODO [es] change status of poll to prevent voting
            });

            this.bind('seeked',function()
            {
                // ## Checking if we are pausing, if we do then we need to handle sync from 'seeked' event. otherwise the 'onplay' event will handle the sync
                if (!_this.getPlayer().isPlaying())
                {
                    _this.syncByReachedCuePoints();
                }
            });

            this.bind('onplay', function () {
                // ## make sure you sync current poll with latest reached cue point
                _this.syncByReachedCuePoints();
            });

            this.bind('onChangeMedia', function () {
                // ## invoke remove poll when changing media
                _this.removePoll();
            });

            this.bind('playerReady', function () {
                setTimeout(function()
                {
                    _this.handleNewPollState({state : 'show', pollId : '1_orhujkkr'});

                    //setTimeout(function()
                    //{
                    //    _this.handleNewPollState({state : 'hide', pollId : '1_hq5wdy2w'});
                    //
                    //    setTimeout(function()
                    //    {
                    //        _this.handleNewPollState({state : 'show', pollId : '1_orhujkkr'});
                    //    },5000);
                    //},5000);

                },2000);
            });

            this.bind('updateLayout', function (event, data) {
                if (_this.isPollShown) {
                    // TODO [es] amir - when 'updateLayout' is relevant?
                    //if (embedPlayer.getVideoHolder().width() < 400){
                    //	$(".share").addClass("small");
                    //}else{
                    //	$(".share").removeClass("small");
                    //}
                }
            });
        },

        initializeImportantInfo:function() {

            var _this=this;

            _this.userId = _this.userProfile.getUserID();

            _this.kalturaProxy.getVoteCustomMetadataProfileId().then(function(result)
            {
                _this.poolVotingProfileId = result.profileId;
            }, function(reason)
            {
                _this.poolVotingProfileId = null;
            });
        },
        syncByReachedCuePoints : function()
        {
            var _this = this;
            if (_this.cuePointsManager) {
                var cuePointsReachedResult = _this.cuePointsManager.getCuePointsReached();
                if (!_this.cuePointsReached(cuePointsReachedResult)) {
                    // ## when user seek/press play we need to handle scenario that no relevant cue points has reached and thus we need to clear the poll
                    _this.removePoll();
                }
            }
        },
        initializeDependentPlugins : function()
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

            if (!_this.cuePointsManager) {
                // we need to initialize the instance
                _this.cuePointsManager = new mw.webcast.CuePointsManager(_this.getPlayer(), function () {
                }, "webcastPollsCuePointsManager");


                _this.cuePointsManager.onCuePointsReached = _this.handleReachedCuePoints;
            }
        },
        handleReachedCuePoints : function (args) {
            var relevantCuePoints = args.filter({
                tags: ['select-poll-state'],
                sortDesc: true
            });
            var mostUpdatedCuePointToHandle = relevantCuePoints.length > 0 ? relevantCuePoints[0] : null; // since we ordered the relevant cue points descending - the first cue point is the most updated

            if (mostUpdatedCuePointToHandle) {
                try {
                    var pollState = JSON.parse(mostUpdatedCuePointToHandle.partnerData);
                    _this.handleNewPollState(pollState);
                }catch(e)
                {
                    // TODO [es]
                }

            }
        },
        handleNewPollState : function(pollState)
        {
            var _this = this;
            if (pollState)
            {
                if (pollState.state === 'show')
                {
                    _this.showOrUpdatePollByState(pollState);
                }else
                {
                    _this.removePoll();
                }
            }
        },
        removePoll : function()
        {
            var _this = this;

            if (_this.isPollShown)
            {
                _this.removeWebcastPollElement();
                _this.isPollShown = false;
            }

            // ## IMPORTANT: perform cleanup of information that was relevant to previous poll
            _this.resetPersistData();
        },
        syncDOMUserVoting : function()
        {
            var _this = this;
            if (_this.$webcastPoll)
            {
                var selectedAnswerSelector = '[name="answer' + _this.userVote.answer + '"]';

                _this.$webcastPoll.find('.answer').not('.answer>'+selectedAnswerSelector).removeClass('selected');

                if (_this.userVote.answer)
                {
                    _this.$webcastPoll.find(selectedAnswerSelector).parent().addClass('selected');
                }

            }
        },
        syncPollDOM : function(){
            var _this = this;

            function updateAnswer(answerIndex, pollData)
            {
                var answerContent = pollData.answers[answerIndex + ''];
                if (answerContent) {
                    _this.$webcastPoll.find('[name="answer' + answerIndex + '"]').text(answerContent).parent().show();
                }else
                {
                    _this.$webcastPoll.find('[name="answer' + answerIndex + '"]').parent().hide();
                }
            }

            if (_this.currentPollId)
            {
                // ## should check that requested poll is shown

                // Make sure we have a container
                if (!_this.$webcastPoll)
                {
                    _this.$webcastPoll = _this.getWebcastPollElement();
                }

                var pollData = _this.currentPollId ? _this.pollsData[_this.currentPollId] : null;

                if (pollData)
                {
                    _this.$webcastPoll.find('[name="question"]').text(pollData.question);
                    updateAnswer(1,pollData);
                    updateAnswer(2,pollData);
                    updateAnswer(3,pollData);
                    updateAnswer(4,pollData);
                    updateAnswer(5,pollData);

                    _this.showPollDOMContent();
                }else
                {
                    _this.$webcastPoll.find('[name="question"],[name="answer1"],[name="answer2"],[name="answer3"],[name="answer4"],[name="answer5"]').text('');
                    _this.showPollDOMLoader();
                }

                _this.syncDOMUserVoting();
            }else
            {
                // ## should hide poll if any is shown
            }
        },
        showOrUpdatePollByState : function(pollState)
        {
            var _this = this;

            if (!pollState || !pollState.pollId)
            {
                // todo [es] handle invalid state
                return;

            }

            try {
                var isShowingAPoll = !_this.currentPollId;
                var isShowingRequestedPoll = isShowingAPoll && (_this.currentPollId === pollState.pollId);

                if (!isShowingAPoll || !isShowingRequestedPoll) {
                    var webcastPollElement = _this.getWebcastPollElement(); // Important: we invoke this function to make sure the webcast poll element exists,
                    if (webcastPollElement) {
                        _this.isPollShown = true; // make sure the poll is shown
                        _this.currentPollId = pollState.pollId;

                        if (!isShowingRequestedPoll) {
                            var invokedByPollId = _this.currentPollId;
                            _this.getPollData(pollState.pollId, true).then(function (result) {
                                if (invokedByPollId === _this.currentPollId) {
                                    _this.syncPollDOM();
                                }
                            }, function (reason) {
                                if (invokedByPollId === _this.currentPollId) {
                                    // TODO [es] handle
                                }
                            });


                            _this.kalturaProxy.getUserVote(_this.userId, _this.currentPollId,_this.poolVotingProfileId ).then(function (result) {
                                if (invokedByPollId === _this.currentPollId) {
                                    _this.userVote.canUserVote = true;
                                    _this.userVote.answer = result.answer;
                                    _this.userVote.metadataId = result.metadataId;
                                    _this.syncDOMUserVoting();
                                }
                            }, function (reason) {
                                if (invokedByPollId === _this.currentPollId) {
                                    // TODO [es] handle
                                }
                            });
                        }

                        _this.syncPollDOM();
                    }else {
                        // TODO [es]
                    }
                } else {
                    // // TODO [es] handle 'allowVote','showResults' and other states

                }
            }catch(e)
            {
                // todo [es] handle
            }
        },
        getPollData : function(pollId, forceGet)
        {
            var _this = this;
            var defer = $.Deferred();

            if (_this.pollsData[pollId] && !forceGet)
            {
                var pollData = pollData[pollId];
                defer.resolve({data : pollData });
            }else {
                _this.pollsData[pollId] = null;

                _this.kalturaProxy.getPollData(pollId).then(function(result)
                {
                    try {
                        _this.pollsData[pollId] = result.pollData;
                        defer.resolve({data : result.pollData });
                    }catch(e)
                    {
                        defer.reject({});
                    }
                },function(reason)
                {
                    mw.log(reason);
                    defer.reject({});
                });
            }

            return defer.promise();
        },
        removeWebcastPollElement : function()
        {
            var _this = this;
            if (_this.$webcastPoll)
            {
                _this.$webcastPoll.remove();
                _this.$webcastPoll = null;
            }
        },
        handleAnswerClicked : function(e)
        {
            var _this = this;

            if (!_this.currentPollId ||  !_this.poolVotingProfileId || _this.userVote.inProgress || !_this.userVote.canUserVote)
            {
                return;
            }

            var previousAnswer = _this.userVote.answer;

            try {
                var selectedAnswer = $(e.currentTarget).children(0).data('poll-value');

                if (_this.userVote.answer === selectedAnswer)
                {
                    return;
                }
                _this.userVote.inProgress = true;
                _this.userVote.answer = selectedAnswer;
                _this.syncDOMUserVoting();

                if (_this.userVote.metadataId)
                {
                    var invokedByPollId = _this.currentPollId;
                    _this.kalturaProxy.transmitVoteUpdate(_this.userVote.metadataId, _this.userId, selectedAnswer).then(function (result) {
                        if (invokedByPollId === _this.currentPollId) {
                            _this.userVote.inProgress = false;
                            _this.syncDOMUserVoting();
                        }

                    }, function (reason) {
                        if (invokedByPollId === _this.currentPollId) {
                            // TODO [es]
                            _this.userVote.inProgress = false;
                            _this.userVote.answer = previousAnswer;
                            _this.syncDOMUserVoting();
                        }
                    });
                }else {
                    var invokedByPollId = _this.currentPollId;
                    _this.kalturaProxy.transmitNewVote( _this.currentPollId, _this.poolVotingProfileId, _this.userId, selectedAnswer).then(function (result) {
                        if (invokedByPollId === _this.currentPollId) {
                            _this.userVote.inProgress = false;
                            _this.userVote.metadataId = result.metadataId;
                            _this.syncDOMUserVoting();
                        }

                    }, function (reason) {
                        if (invokedByPollId === _this.currentPollId) {
                            // TODO [es]
                            _this.userVote.inProgress = false;
                            _this.userVote.answer = previousAnswer;
                            _this.syncDOMUserVoting();
                        }
                    });
                }
            }catch(e)
            {
                // TODO [es]
                _this.userVote.inProgress  = false;
                _this.userVote.answer = previousAnswer;
                _this.syncDOMUserVoting();

            }

        },
        getWebcastPollElement : function()
        {
            var _this = this;

            if (_this.$webcastPoll)
            {
                return _this.$webcastPoll;
            }

            try
            {
                var pollRawHTML = (window && window.kalturaIframePackageData && window.kalturaIframePackageData.templates) ?  window.kalturaIframePackageData.templates[_this.getConfig('templatePath')] : '';

                if (pollRawHTML && _this.getPlayer() && _this.getPlayer().getVideoHolder()) {
                    var poll = $(pollRawHTML);
                    poll.find('.answer').click($.proxy(_this.handleAnswerClicked,_this));

                    _this.$webcastPoll = poll;
                    _this.getPlayer().getVideoHolder().append(_this.$webcastPoll);
                }
            }catch(e)
            {
                _this.$webcastPoll = null;
            }

            return _this.$webcastPoll;
        },
        showPollDOMLoader : function()
        {
            var _this = this;
            if (_this.$webcastPoll) {
                _this.$webcastPoll.find('[name="pollContent"]').hide();
                _this.$webcastPoll.find('[name="loadingContainer"]').show();
            }
        },
        showPollDOMContent : function()
        {
            var _this = this;

            if (_this.$webcastPoll) {
                _this.$webcastPoll.find('[name="loadingContainer"]').hide();
                _this.$webcastPoll.find('[name="pollContent"]').fadeIn('slow');
            }
        }



    }));

})(window.mw, window.jQuery);

