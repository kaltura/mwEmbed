(function (mw, $) {
    "use strict";

    mw.PluginManager.add('webcastPolls', mw.KBaseScreen.extend({

        defaultConfig: {
            templatePath: '../WebcastPolls/resources/webcastPolls.tmpl.html'
        },
        locale: {
            respondsLbl: gM('mwe-webc-polls-respondsLbl')
        },
        isShowingPoll : false,
        currentPollId : null,
        cuePointsManager : null,
        pollsData : {},
        isScreenOpened: false,
        initializeCuePointsManager : function()
        {
            var _this = this;

            if (!_this.cuePointsManager) {
                // we need to initialize the instance
                _this.cuePointsManager = new mw.webcast.CuePointsManager(_this.getPlayer(), function () {
                }, "webcastPollsCuePointsManager");


                _this.cuePointsManager.onCuePointsReached = function (args) {
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
                };
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

            if (_this.isShowingPoll)
            {
                _this.currentPollId = null;

                _this.hideScreen();

                // TODO [es] reset poll dom to prepare to next poll
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

            if (_this.isShowingPoll && _this.$webcastPoll)
            {
                var pollData = _this.pollsData[_this.currentPollId];

                if (pollData)
                {
                    _this.$webcastPoll.find('[name="question"]').text(pollData.question);
                    updateAnswer(1,pollData);
                    updateAnswer(2,pollData);
                    updateAnswer(3,pollData);
                    updateAnswer(4,pollData);
                    updateAnswer(5,pollData);

                    _this.showPoll();
                }else
                {
                    _this.$webcastPoll.find('[name="question"],[name="answer1"],[name="answer2"],[name="answer3"],[name="answer4"],[name="answer5"]').text('');
                    _this.showLoader();
                }
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

            if (!_this.isShowingPoll)
            {
                _this.showScreen();
            }

            try {
                if (!_this.currentPollId || _this.currentPollId !== pollState.pollId) {
                    _this.currentPollId = pollState.pollId;
                    // new poll to handle
                    _this.getPollData(pollState.pollId, true).then(function (result) {
                        _this.syncPollDOM();
                    }, function (reason) {
                        // TODO [es] handle
                    });


                } else {
                    // update existing poll state if needed

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
        setup: function () {

            // prevent pause of video while poll is being disabled
            this.setConfig('previewPlayerEnabled', true);
            this.setConfig('usePreviewPlayer', true);

            // TODO [es] check if needed
            //if (mw.isMobileDevice()) {
            //    console.log("mobile device");
            //}

            this.addBindings();

            this.initializeCuePointsManager();

        },

        addBindings: function () {
            // bind to cue point events
            var _this = this;
            var embedPlayer = this.getPlayer();

            this.bind('onpause', function () {
                // TODO [es] check if need to disable poll

            });



            this.bind('playerReady', function () {


                //setTimeout(function () {
                //    _this.showScreen();
                //
                //    setTimeout(function () {
                //        _this.showPoll();
                //
                //    }, 3000);
                //
                //    //setTimeout(function(){
                //    //	_this.getPlayer().hideSpinner();
                //    //	_this.question="hello";
                //    //	_this.removeScreen();
                //    //	_this.showScreen();
                //    //},5000);
                //
                //    //setTimeout(function () {
                //    //    _this.hideScreen();
                //    //
                //    //}, 10000);
                //}, 1000);
            });
            this.bind('preShowScreen', function (event, screenName) {

                if (screenName === "webcastPolls") {
                    _this.getScreen().then(function (screen) {
                        screen.addClass('semiTransparentBkg'); // add semi-transparent background for share plugin screen only. Won't affect other screen based plugins
                        _this.isScreenOpened = true;

                        // prevent keyboard key actions to allow typing in share screen fields
                        embedPlayer.triggerHelper('onDisableKeyboardBinding');

                        // disable all player controls except play button, scrubber and volume control
                        // TODO [es] amir - what other controls are available?
                        _this.disablePlayerControls();

                        // set responsive size
                        if (embedPlayer.getVideoHolder().width() < 400) {
                            // TODO [es]
                            //$(".share").addClass("small");
                        }
                    });
                }
            });

            this.bind('showScreen', function (event, screenName) {
                _this.isShowingPoll = true;
                if (screenName === "webcastPolls") {
                    _this.$webcastPoll = $('.webcastPolls');
                    _this.getScreen().then(function (screen) {
                        $("#" + embedPlayer.getPlayerElement().id).addClass("blur");

                    });
                    _this.syncPollDOM();
                }
            });

            this.bind('hideScreen',function()
            {
                _this.isShowingPoll = false;
            });

            this.bind('preHideScreen', function (event, screenName) {
                if (screenName === "webcastPolls") {
                    _this.$webcastPoll = $('.webcastPolls');

                    _this.isScreenOpened = true;
                    // restore keyboard actions
                    // TODO [es] amir - is there a situation where the keyboard binding was disabled before the screen was loaded?
                    embedPlayer.triggerHelper('onEnableKeyboardBinding');

                    // re-enable player controls
                    // TODO [es] amir - what is 'isInSequence'?
                    //if ( !embedPlayer.isInSequence() ){
                    //	_this.enablePlayerControls();
                    //}
                    _this.enablePlayerControls();

                    // remove blur
                    if (embedPlayer.getPlayerElement()) {
                        $("#" + embedPlayer.getPlayerElement().id).removeClass("blur");
                        embedPlayer.getPlayerPoster().removeClass("blur");
                    }
                }
            });

            this.bind('onplay', function (event, data) {
                if (_this.isScreenOpened) {
                    setTimeout(function () {
                        _this.disablePlayerControls();
                    }, 200);
                }
            });

            this.bind('onpause', function (event, data) {
                // TODO [es] amir - purpose?
                if (_this.isScreenOpened) {
                    $("#" + embedPlayer.getPlayerElement().id).addClass("blur");
                    embedPlayer.getPlayerPoster().addClass("blur");
                }
            });

            this.bind('updateLayout', function (event, data) {
                if (_this.isScreenOpened) {
                    // TODO [es] amir - when 'updateLayout' is relevant?
                    //if (embedPlayer.getVideoHolder().width() < 400){
                    //	$(".share").addClass("small");
                    //}else{
                    //	$(".share").removeClass("small");
                    //}
                }
            });
        },

        disablePlayerControls: function () {
           // embedPlayer.disablePlayControls(["volumeControl", "scrubber", "playPauseBtn", "playlistAPI"]);
        },

        enablePlayerControls: function () {
            // embedPlayer.enablePlayControls();
        },

        getTemplateData: function () {
            return {
                'locale' : this.locale
            };
        },

        // bind to template UI events
        addScreenBindings: function () {

        },

        // called from template X button
        closeScreen: function () {
            this.removeScreen();
        },
        showLoader : function()
        {
            var _this = this;
            _this.$webcastPoll.find('[name="pollContainer"]').css({'display' : 'none'});
            _this.$webcastPoll.find('[name="loadingContainer"]').css({display: 'table'});
        },
        showPoll : function()
        {
            var _this = this;

            _this.$webcastPoll.find('[name="loadingContainer"]').css({display: 'none'});
            _this.$webcastPoll.find('[name="pollContainer"]').css({'display' : 'table'});
        }



    }));

})(window.mw, window.jQuery);
