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
        isPollShown: false,
        setup: function () {
            this.addBindings();
            this.initializeCuePointsManager();
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
                    _this.handleNewPollState({state : 'show', pollId : '1_hq5wdy2w'});

                    setTimeout(function()
                    {
                        _this.handleNewPollState({state : 'hide', pollId : '1_hq5wdy2w'});

                        setTimeout(function()
                        {
                            _this.handleNewPollState({state : 'show', pollId : '1_orhujkkr'});
                        },5000);
                    },5000);

                },5000);
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
        initializeCuePointsManager : function()
        {
            var _this = this;

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

            _this.currentPollId = null;
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
                    _this.currentPollId = pollState.pollId;
                    var webcastPollElement = _this.getWebcastPollElement(); // Important: we invoke this function to make sure the webcast poll element exists,
                    if (webcastPollElement) {
                        _this.isPollShown = true;

                        _this.syncPollDOM();

                        // new poll to handle
                        _this.getPollData(pollState.pollId, true).then(function (result) {
                            _this.syncPollDOM();
                        }, function (reason) {
                            // TODO [es] handle
                        });
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

                var request = {
                    'service': 'cuepoint_cuepoint',
                    'action': 'get',
                    'id': pollId
                };

                _this.getKalturaClient().doRequest(request, function(result)
                {
                    try {
                        var pollData = JSON.parse(result.text);
                        _this.pollsData[pollId] = pollData;
                        defer.resolve({data : pollData });
                    }catch(e)
                    {
                        defer.reject({});
                    }

                },false, function(reason)
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
                    _this.$webcastPoll = $(pollRawHTML);
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
