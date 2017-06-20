(function (mw, $) {
    "use strict";

    /**
     * Plugin representing a webcast polls.
     * This class is responsible for the the interaction with the producer (using cue points), the player (using player events) and the user (using dom elements and events).
     */
    mw.PluginManager.add('webcastPolls', mw.KBasePlugin.extend({
        defaultConfig: {
            'userId' : 'User',
            'usePushNotification' : true
        },
        polls_push_notification: "POLLS_PUSH_NOTIFICATIONS",
        cuePointsManager: null, // manages all the cue points tracking (cue point reached of poll results, poll states etc).
        kalturaProxy: null, // manages the communication with the Kaltura api (invoke a vote, extract poll data).
        userProfile: null, // manages active user profile
        configuration: {}, // ## Should remain empty (filled by 'resetPersistData')
        userVote: {}, // ## Should remain empty (filled by 'resetPersistData')
        pollData: {}, // ## Should remain empty (filled by 'resetPersistData')
        /* stores all the information that doesn't relate directly to the poll currently selected */
        globals : {
            pollsContentMapping : {}, // stores the polls questions/answers - resetting this object during ChangeMedia event
            votingProfileId: null, // used to create a voting cue point (with relevant metadata)
            userId: null, // used to mange user voting (prevent duplication of voting)
            isPollShown: false // indicate if we actually showing a poll (all minimal poll data was retrieved and the poll can be shown)
        },
        /**
         * Resets poll player plugin internals
         */
        resetPersistData: function ()
        {
            var _this = this;
            _this.log('resetting current poll information');
            _this.configuration = {currentView: 'sharedView'};
            _this.userVote = {metadataId: null, answer: null, inProgress: false, canUserVote: false, isReady: false};
            _this.pollData = {
                showAnswers :false,
                pollId : null,
                failedToExtractContent : false,
                content: null,
                showResults: false,
                showTotals: false,
                pollResults: null
            };
        },
        /**
         * Bootstrap the plugin upon player loading.
         */
        setup: function () {
            var _this = this;

            // reset parameters
            _this.resetPersistData();

            // register to player events
            _this.addBindings();

            // initialize dependent components
            _this.initializeDependentComponents();


            // ## only if live - fetch information that will assist later with voting
            if (this.embedPlayer.isLive()) {
                // get user id (will be used later when voting or fetching user vote)
                _this.globals.userId = _this.userProfile.getUserID($.proxy(_this.getConfig, _this));
                _this.log("got user id '" + _this.globals.userId + "'  that will be used for voting");

                //  get voting metadata id needed to create user voting
                _this.kalturaProxy.getVoteCustomMetadataProfileId().then(function (result) {
                    _this.log("got voting metadata profile id '" + result.profileId + "', reload current poll user voting (if any)");
                    // got metadata id - store for later use and reload user voting of current poll
                    _this.globals.votingProfileId = result.profileId;

                    _this.reloadPollUserVoting();

                }, function (reason) {
                    // if failed to retrieve metadata id - do nothing
                    _this.log("error while trying to get voting metadata profile id, user will not be able to vote");
                    _this.globals.votingProfileId = null;
                });

            }else
            {
                _this.log("entry is in vod mode - disable voting feature for polls");

            }
        },
        /**
         * Reloads user voting of current poll using the metadata id needed for voting
         */
        reloadPollUserVoting : function()
        {

            var _this = this;
            if (this.embedPlayer.isLive() && _this.pollData.pollId) {
                var invokedByPollId = _this.pollData.pollId;
                // ## get poll data to show
                _this.getPollUserVote(_this.pollData.pollId).then(function (result) {
                    if (invokedByPollId === _this.pollData.pollId) {
                        _this.userVote.isReady = true;
                        _this.userVote.answer = result.answer;
                        _this.userVote.metadataId = result.metadataId;
                        _this.view.syncDOMUserVoting();
                    }
                }, function (reason) {
                    if (invokedByPollId === _this.pollData.pollId) {
                        _this.userVote.answer = null;
                        _this.userVote.metadataId = result.metadataId;
                        _this.view.syncDOMUserVoting();
                    }
                });
            }
        },
        /**
         * Monitor player events and adjust current poll status accordingly
         */
        addBindings: function ()
        {
            // bind to cue point events
            var _this = this;

            this.bind('onpause onplay onChangeMedia movingBackToLive', function (e) {
                _this.handlePlayerEvent(e.type);
            });
        },
        /**
         * Filter list of reached cue points to get the most updated poll status cue point
         * @param context
         * @returns {object} the most updated poll status reached cue point if found, otherwise null
         */
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
        /**
         * Filter list of reached cue points to get the most updated poll results cue point of current poll
         * @param context
         * @returns {object} the most updated poll results reached cue point of current poll if found, otherwise null
         */
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
        /**
         * Changes current poll status according to player events.
         * For example, removing the poll when user pause the player
         * @param eventName the event name invoked by the player.
         * @returns {boolean}
         */
        handlePlayerEvent : function(eventName)
        {
            var _this = this;

            switch(eventName)
            {
                case 'onpause':
                    _this.log("event '" + eventName + "' triggered - removing current poll (if any)");
                    // remove current poll is found when player is being paused
                    _this.removePoll();
                    break;
                case 'onChangeMedia':
                    _this.log("event '" + eventName + "' triggered - removing current poll (if any)");
                    // remove current poll is found when changing media (during channel playlist for example)
                    _this.removePoll();

                    // clear poll content of previous entry
                    _this.globals.pollsContentMapping = {};
                    break;
                case 'onplay':
                        // # we need to sync current poll state when user press playing or seeking.
                        // Note that since onplay is triggered also after seeking we don't need to handle that event explicitly
                        _this.log("event '" + eventName + "' - start syncing current poll state");
                        if (_this.cuePointsManager) {
                            _this.handleStateCuePoints({reset:true});
                            _this.handlePollResultsCuePoints({reset:true});
                        }
                        _this.log("event '" + eventName + "' - done syncing current poll state");
                    break;
                case 'movingBackToLive':
                    setTimeout(function(){
                        // the timer is to let the player adjust its getLiveEdgeOffset value.
                        // when this happens in a synced call, the player still holds a positive value instead of 0
                        _this.log("event '" + eventName + "' - start syncing current poll state");
                        if (_this.cuePointsManager) {
                            _this.handleStateCuePoints({reset:true});
                            _this.handlePollResultsCuePoints({reset:true});
                        }
                        _this.log("event '" + eventName + "' - done syncing current poll state");
                        },500);
                    break;
                default:
                    break;
            }
        },
        /**
         * Initializes required dependent components used by the polls plugin 
         */
        initializeDependentComponents: function ()
        {
            var _this = this;

            if (!_this.userProfile) {
                // user profile component used to provide current user id needed for voting.
                _this.userProfile = new mw.webcast.UserProfile(_this.getPlayer(), function () {
                }, "webcastPolls_UserProfile");
            }

            if (!_this.kalturaProxy) {
                // kaltura api proxy used to communicate with the kaltura api (transmit voting, fetch poll data etc)
                _this.kalturaProxy = new mw.webcastPolls.WebcastPollsKalturaProxy(_this.getPlayer(), function () {
                }, "webcastPolls_KalturaProxy");
            }

            if (!_this.view) {
                // initialize component that manages the interactions with polls DOM elements.
                _this.view = new mw.webcastPolls.WebcastPollsView(_this.getPlayer(), function () {
                }, "webcastPolls_KalturaView");
                _this.view.parent = _this;
            }

            if (!_this.cuePointsManager) {
                // cue points manager used to monitor and notify when relevant cue points reached (polls status, results).
                _this.cuePointsManager = new mw.webcast.CuePointsManager(_this.getPlayer(), function () {
                }, "webcastPolls_CuePointsManager");
                //set push method only with live. For VOD use the existing cuePointManager logic
                if(_this.embedPlayer.isLive()){
                    _this.cuePointsManager.setPushNotificationMode(_this.getConfig('usePushNotification'));
                }

				var pushSystemName = null;
				// send the pushSystemName only if we have usePushNotification set to true
				if(_this.getConfig("usePushNotification")){
					pushSystemName = _this.polls_push_notification;
                }

	            _this.cuePointsManager.registerMonitoredCuepointTypes(['poll-data','poll-results'],function(cuepoints){
		            for(var i = 0;i< cuepoints.length;i++){
			            try {
				            var cuepoint = cuepoints[i];
				            var cuepointContent = cuepoint.partnerData ? JSON.parse(cuepoint.partnerData) : null;
				            var pollIdTokens = (cuepoint.tags || '').match(/id:([^, ]*)/);
				            var pollId = pollIdTokens && pollIdTokens.length === 2 ? pollIdTokens[1] : null;
				            //live vote update (don't wait for poll-resaults cuepoint time to trigger).
				            // Run this only for polls-resaults cuepoitns and if we are in the correct poll
				            if(cuepoint.tags == "poll-results" && cuepointContent.pollId == _this.pollData.pollId ){
					            // if current poll doesn't have yet poll pollResults - create it now
					            if(!_this.pollData.pollResults){
						            _this.pollData.pollResults = cuepointContent;
					            }
					            if( cuepointContent.totalVoters && cuepointContent.totalVoters >= _this.pollData.pollResults.totalVoters ){
						            //update only if result is higher than current votes-count
						            _this.pollData.pollResults.totalVoters = cuepointContent.totalVoters;
						            _this.view.syncDOMPollResults();
					            }

				            }
				            if (cuepointContent && pollId) {
					            var pollContent = cuepointContent.text;
					            if (pollId && pollContent) {
						            _this.log("updated content of poll with id '" + pollId + "'");
						            if(_this.globals.pollsContentMapping[pollId]) {
							            $.extend(_this.globals.pollsContentMapping[pollId], pollContent);
						            }else{
							            _this.globals.pollsContentMapping[pollId] = pollContent;
						            }
					            }
				            }

			            }catch(e){
				            _this.log("ERROR while tring to extract poll information with error " + e);
			            }

		            }
	            } , [pushSystemName]);

                _this.cuePointsManager.onCuePointsReached = $.proxy(function(args)
                {
                    // new cue points reached - change internal polls status when relevant cue points reached
                    _this.handleStateCuePoints({cuepointsArgs : args});
                    _this.handlePollResultsCuePoints({cuepointsArgs : args});
                },_this);
            }
        },
        /**
         * Modifies current poll results according to cue points reached.
         * This function searches for relevant cue points and if found changes current poll results
         * @param context arguments provided by cue points manager with support for smart cue points filtering OR value 'true' to handle reset mode
         */
        handlePollResultsCuePoints: function (context)
        {
            var _this = this;
            var resetMode = false;
            var cuepointsArgs = context.cuepointsArgs;

            if (context && context.reset) {
                _this.log("handling reset mode for poll results");
                // # we should check all reached cue points and treat this scenario as reset (meaning if no cue points found should remove previous polls results)
                resetMode = true;
                cuepointsArgs = _this.cuePointsManager.getCuePointsReached();
            }

            if (cuepointsArgs) {
                _this.log("start syncing poll results by analyzing " + cuepointsArgs.cuePoints.length + " reached cue points");

                if (_this.pollData.showResults || _this.pollData.showTotals) {
                    // according to poll state should show poll results or totals
                    var pollResultsCuePoint = _this.filterPollResultsCuePoints(cuepointsArgs);
                    if (pollResultsCuePoint && pollResultsCuePoint.partnerData) {
                        try {
                            _this.log("got updated results and/or total voters for current poll  - syncing current poll accordingly");
                            var pollResults = JSON.parse(pollResultsCuePoint.partnerData);
                            //make sure to update polls' total voters number only if greater than the one currently displayed
                            if(_this._canCompareTotalVoters(pollResults) && (_this.pollData.pollResults.totalVoters > pollResults.totalVoters)) {
                                //assign current total voters
                                pollResults.totalVoters = _this.pollData.pollResults.totalVoters;
                            }
                            _this.pollData.pollResults = pollResults;
                        } catch (e) {
                            _this.log("invalid poll results structure - ignoring current result");
                            _this.pollData.pollResults = null;
                        }
                    } else {
                        if (resetMode) {
                            _this.log("reset mode - didn't find any relevant poll results, removing current poll results (if any)");
                            // in reset mode if we didn't find any relevant poll results we should assume current poll has not results
                            _this.pollData.pollResults = null;
                        }
                    }
                } else {
                    _this.log("poll state is set to hide results and total voters - hiding poll results (if any)");
                    // according to poll state should hide poll results
                    _this.pollData.pollResults = null;
                }

                _this.log("done syncing poll results");


                _this.view.syncDOMPollResults();
            }
        },
        /**
         * Modifies current poll status according to cue points reached.
         * This function searches for relevant cue points and if found changes current poll status
         * @param context arguments provided by cue points manager with support for smart cue points filtering  OR value 'true' to handle reset mode
         */
        handleStateCuePoints: function (context)
        {
            var _this = this;
            var resetMode = false;
            var cuepointsArgs = context.cuepointsArgs;

            if (context && context.reset) {
                _this.log("handling reset mode for poll results");
                // # we should check all reached cue points and treat this scenario as reset (meaning if no cue points found should remove previous polls results)
                resetMode = true;
                cuepointsArgs = _this.cuePointsManager.getCuePointsReached();
            }

            if (cuepointsArgs) {
                _this.log("start syncing current poll state by analyzing " + cuepointsArgs.cuePoints.length + " reached cue points");

                var stateCuePointToHandle = _this.filterStateCuePoints(cuepointsArgs);
                if (stateCuePointToHandle) {
                    try {
                        var showingAPoll = stateCuePointToHandle.tags.indexOf('select-poll-state') > -1;

                        if (showingAPoll) {
                            _this.log("got state update for current poll  - syncing current poll with state '" + stateCuePointToHandle.partnerData + "'");

                            var pollState = JSON.parse(stateCuePointToHandle.partnerData);
                            if(pollState.status == "inProgress" && _this.embedPlayer.isDVR()){
                                //in DVR mode check if this poll was ended by the moderator
                                var pollId = pollState.pollId;
                                var allCuePoints = _this.cuePointsManager.getCuePoints();
                                // look for same poll id with 'finished' status
                                for(var i=allCuePoints.length-1;i>0;--i){
                                    if( allCuePoints[i].partnerData &&
                                        allCuePoints[i].partnerData.indexOf('"status":"finished"') > -1 &&
                                        allCuePoints[i].partnerData.indexOf('"showResults":"disabled"') > -1 &&
                                        allCuePoints[i].partnerData.indexOf(pollId) > -1 ){
                                            //This state should show the poll as active but in fact it ended - don't allow
                                            //users to answer - copy ended CP state
                                            pollState = JSON.parse(allCuePoints[i].partnerData);
                                            break;
                                        }
                                    }
                                //disable poll if not in live - 30 sec is the threshold
                                if(_this.embedPlayer.getLiveEdgeOffset() > 30){
                                    pollState.status = "finished";
                                }
                            }
                            if (pollState) {
                                _this.showOrUpdatePollByState(pollState);
                            }
                        } else {
                            _this.log("found an update for currently shown asset which is not of type poll, remove current poll (if any)");
                            _this.removePoll();
                        }
                    } catch (e) {
                        // TODO [es]
                    }

                } else {
                    if (resetMode) {
                        _this.log("reset mode - didn't find any relevant poll state, removing current poll (if any)");
                        // in reset mode if we didn't find any relevant poll we should remove the current one
                        _this.removePoll();
                    }
                }

                _this.log("done syncing current poll state");
            }
        },
        /**
         * Removes currently shown poll (if any) from the view and reset polls plugin information
         */
        removePoll: function ()
        {
            var _this = this;
            _this.log("removing currently shown poll (if any)")

            if (_this.globals.isPollShown) {
                _this.view.removeWebcastPollElement();
                _this.globals.isPollShown = false;
            }

            // ## IMPORTANT: perform cleanup of information that was relevant to previous poll
            _this.resetPersistData();
        },
        /**
         * Update currently shown poll state according to poll state information
         * @param pollState poll state context information
         */
        showOrUpdatePollByState: function (pollState)
        {
            var _this = this;

            if (!pollState || !pollState.pollId) {
                // ignore empty poll state context
                return;
            }

            try {
                var isShowingRequestedPoll = _this.pollData.pollId === pollState.pollId; // flag indicating if currently shown the requested poll.
                var pollElement = _this.view.getWebcastPollElement(); // requesting a poll element to be sure it exists

                if (pollElement) {
                    _this.log("handling update state for poll '" + pollState.pollId + "' (currently showing poll '" + _this.pollData.pollId + "')");
                    if (!isShowingRequestedPoll) {
                        // ## prepare component internals to new poll
                        _this.resetPersistData();

                        // ## update internals
                        _this.globals.isPollShown = true;
                        _this.pollData.pollId = pollState.pollId;
                    }else if (_this.pollData.failedToExtractContent)
                    {
                        _this.log("failed to extract poll with id " + pollState.pollId + "'. ignoring state updates");
                        return;
                    }

                    // sync internals with poll status
                    _this.userVote.canUserVote = pollState.status === 'inProgress';
                    _this.pollData.showAnswers = pollState.showAnswers;
                    _this.pollData.showTotals = pollState.showTotals && pollState.showTotals !== 'disabled';
                    _this.pollData.showResults = pollState.showResults && pollState.showResults !== 'disabled';

                    if (!isShowingRequestedPoll)
                    {
                        // ## show the poll the first time & extract important information

                        var pollContent = _this.globals.pollsContentMapping[_this.pollData.pollId];
                        if (pollContent)
                        {
                            _this.pollData.content = pollContent;

                            // fetch user vote of requested poll only if we are live and has a valid voting profile id
                            if (_this.globals.votingProfileId && this.embedPlayer.isLive())
                            {
                                var invokedByPollId = _this.pollData.pollId;
                                _this.getPollUserVote(invokedByPollId).then(function (result) {
                                    if (invokedByPollId === _this.pollData.pollId) {
                                        _this.userVote.isReady = true;
                                        _this.userVote.answer = result.answer;
                                        _this.userVote.metadataId = result.metadataId;

                                        _this.view.syncDOMUserVoting();
                                    }
                                }, function (reason) {
                                    if (invokedByPollId === _this.pollData.pollId) {
                                        _this.log("failed to retrieve user voting, ignoring error silently");
                                    }
                                });
                            }

                            _this.view.syncPollDOM(); // make sure we update the view with the new poll
                            _this.handlePollResultsCuePoints({reset: true}); // update currently shown poll results (if required)
                        }else
                        {
                            // requesting to show a poll that we dont have data for - show visual error to the user
                            _this.pollData.failedToExtractContent = true;
                            _this.view.syncPollDOM();
                        }
                    } else {
                        // ## update current poll with voting and results according to poll status.
                        _this.view.syncDOMAnswersVisibility();
                        _this.view.syncDOMUserVoting();
                        _this.view.syncDOMPollResults();
                    }
                }else{
                    // has nothing to do if poll dom element not created
                    _this.log("failed to retrieve user voting, ignoring error silently");
                }
            } catch (e) {
                _this.log("general error occurred while trying to show a poll " + e);
                _this.pollData.failedToExtractContent = true;
                _this.view.syncPollDOM();
            }
        },
        /**
         * Gets poll user vote (during live event only)
         * @param pollId pollId to get user vote for
         * @returns {*} a promise with user vote information
         */
        getPollUserVote : function(pollId) {
            var _this = this;
            var defer = $.Deferred();

            if (this.embedPlayer.isLive()) {

                if (_this.globals.votingProfileId) {
                    _this.log("requesting user vote for  poll '" + pollId + "' from kaltura api");
                    _this.kalturaProxy.getUserVote(pollId, _this.globals.userId).then(function (result) {
                        _this.log("retrieved user vote for poll '" + pollId + "' from kaltura api");
                        defer.resolve(result);
                    }, function (reason) {
                        _this.log("failed to retrieve user vote for poll '" + pollId + "' from kaltura api." + JSON.stringify(reason || {}));
                        defer.reject({error: "failed to retrieve user vote for poll '" + pollId + "' from kaltura api"});
                    });
                } else {
                    _this.log("request aborted. missing voting profile id required by Kaltura api");
                    defer.reject({error: "missing required information to retrieve user vote"});
                }
            } else {
                _this.log("request for getting poll user vote is not relevant during vod mode");
                defer.reject({});
            }

            return defer.promise();
        },
        /**
         * Indicates if a user can vote
         * @returns {*|null|boolean} true if the user can vote, false otherwise
         */
        canUserVote: function ()
        {
            var _this = this;
            return this.embedPlayer.isLive() && _this.pollData.pollId && _this.globals.votingProfileId && _this.userVote.canUserVote && _this.userVote.isReady;
        },
        /**
         * Indicates if vote is being processed and sent to server
         * @returns {boolean} true if vote is being submitted to server
         */
        voteInProgress: function ()
        {
            var _this = this;
            return _this.userVote.inProgress;
        },
        /**
         * returns current poll view configuration
         * @returns {string}
         */
        getViewConfig: function ()
        {
            var _this = this;
            return _this.configuration.currentView;
        },
        /**
         * handle answer clicked by user
         * @param e
         */
        handleAnswerClicked: function (e)
        {
            var _this = this;

            if (!_this.canUserVote() || _this.voteInProgress()) {
                _this.log('user cannot vote at the moment - ignoring request');
                return;
            }

            var previousAnswer = _this.userVote.answer;

            try {
                var selectedAnswer = $(e.currentTarget).find("[data-poll-value]").data('poll-value'); // get selected answer by user

                if (isNaN(selectedAnswer))
                {
                    _this.log('failed to get the answer identifier for user selected answer - ignoring request');
                    return;

                }

                if (_this.userVote.answer === selectedAnswer) {
                    _this.log('user tried to vote to currently selected answer - ignoring request');
                    return;
                }

                _this.log('transmitting user vote for answer ' + selectedAnswer);
                _this.userVote.inProgress = true;
                _this.userVote.answer = selectedAnswer;
                _this.view.syncDOMUserVoting();



                if (_this.userVote.metadataId) {
                    _this.log('user already voted for this poll, update user vote');
                    var invokedByPollId = _this.pollData.pollId;
                    _this.kalturaProxy.transmitVoteUpdate(_this.userVote.metadataId, _this.globals.userId, selectedAnswer, _this.pollData.pollId).then(function (result) {
                        if (invokedByPollId === _this.pollData.pollId) {
                            _this.log('successfully updated server with user answer');
                            _this.userVote.inProgress = false;
                            _this.view.syncDOMUserVoting();
                        }

                    }, function (reason) {
                        if (invokedByPollId === _this.pollData.pollId) {
                            _this.log('error occurred while updating server with user answer - undo to previously selected answer (if any)');
                            _this.userVote.inProgress = false;
                            _this.userVote.answer = previousAnswer;
                            _this.view.syncDOMUserVoting();
                        }
                    });
                } else {
                    _this.log("user didn't vote yet in this poll, add user vote");

                    // get this value only from BE and not from FE
                    // _this.pollData.pollResults.totalVoters++;

                    _this.view.syncDOMPollResults();


                    var invokedByPollId = _this.pollData.pollId;
                    _this.kalturaProxy.transmitNewVote(_this.pollData.pollId, _this.globals.votingProfileId, _this.globals.userId, selectedAnswer).then(function (result) {
                        if (invokedByPollId === _this.pollData.pollId) {
                            _this.log('successfully updated server with user vote');
                            _this.userVote.inProgress = false;
                            _this.userVote.metadataId = result.metadataId;
                            _this.view.syncDOMUserVoting();
                        }

                    }, function (reason) {
                        if (invokedByPollId === _this.pollData.pollId) {
                            _this.log('error occurred while updating server with user answer - undo to previously selected answer (if any)');

                            // reduce one vote that was added automatically
                            if (_this.pollData.pollResults)
                            {
                                _this.pollData.pollResults.totalVoters--;
                            }
                            _this.view.syncDOMPollResults();

                            _this.userVote.inProgress = false;
                            _this.userVote.answer = previousAnswer;
                            _this.view.syncDOMUserVoting();
                        }
                    });
                }


            } catch (e) {
                _this.log('failed to get update user vote in kaltura server - undo to previously selected answer (if any)');
                _this.userVote.inProgress = false;
                _this.userVote.answer = previousAnswer;
                _this.view.syncDOMUserVoting();

            }

        },

        _canCompareTotalVoters: function (newPollResults) {
            var _this = this;
            return _this.pollData && _this.pollData.pollResults && _this.pollData.pollResults.totalVoters && newPollResults.totalVoters;
        }
    }));

})(window.mw, window.jQuery);

