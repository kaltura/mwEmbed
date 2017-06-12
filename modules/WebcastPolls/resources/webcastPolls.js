(function (mw, $) {
    "use strict";

    /**
     * Plugin representing a webcast polls.
     * This class is responsible for the the interaction with the producer (using cue points), the player (using player events) and the user (using dom elements and events).
     */
    mw.PluginManager.add('webcastPolls', mw.KBasePlugin.extend({
        defaultConfig: {
            'userId' : 'User'
        },
		polls_push_notification: "POLLS_PUSH_NOTIFICATIONS",
        cuepoints : [],
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

            this.bind('onpause onplay onChangeMedia backlogPushCuepointsLoaded', function (e,args) {
                _this.handlePlayerEvent(e.type,args);
            });
        },
        /**
         * Filter list of reached cue points to get the most updated poll status cue point
         * @param context
         * @returns {object} the most updated poll status reached cue point if found, otherwise null
         */
        filterStateCuePoints : function(context)
        {
        	this.printTagsAndId(context.cuePoints);
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
        handlePlayerEvent : function(eventName , args)
        {
            var _this = this;

            switch(eventName)
            {
                case 'backlogPushCuepointsLoaded':
                    //if we got here - the pass cuepoints were loaded
					for(var i = 0;i< this.cuepoints.length;i++)
					{
					    try {
					        var cuepoint = this.cuepoints[i];
					        var cuepointContent = cuepoint.partnerData ? JSON.parse(cuepoint.partnerData) : null;
					        var cuepointTags = cuepoint.tags;
					        if(cuepointTags && cuepointTags.indexOf("poll-data") == -1){
					            continue; // process only poll-data cuepoints
                            }
					        var pollIdTokens = (cuepoint.tags || '').match(/id:([^, ]*)/);
					        var pollId = pollIdTokens && pollIdTokens.length === 2 ? pollIdTokens[1] : null;

					        if (cuepointContent && pollId)
					        {
					            var pollContent = cuepointContent.text;

					            if (pollId && pollContent) {
					                _this.log("updated content of poll with id '" + pollId + "'");
					                if(_this.globals.pollsContentMapping[pollId]) {
					                     $.extend(_this.globals.pollsContentMapping[pollId], pollContent);
					                }else {
					                    _this.globals.pollsContentMapping[pollId] = pollContent;
					                }
					            }
					        }

					    }catch(e)
					    {
					        _this.log("ERROR while tring to extract poll information with error " + e);
					    }

					}
                    break;
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
                    if (eventName === 'onplay') {
                        // # we need to sync current poll state when user press playing or seeking.
                        // Note that since onplay is triggered also after seeking we don't need to handle that event explicitly
                        _this.log("event '" + eventName + "' - start syncing current poll state");
                        if (_this.cuePointsManager) {
                        	//TODO Eitan
							// _this.handleStateCuePoints({reset:true});
							// _this.handlePollResultsCuePoints({reset:true});
                        }
                        _this.log("event '" + eventName + "' - done syncing current poll state");
                    }
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


            if(_this.embedPlayer.isLive()) {
				//Live mode - use push notifications engine
				_this.pushCuePointsManager = mw.KPushCuePointsManager.getInstance(this.embedPlayer);
				_this.pushCuePointsManager.registerToNotification(_this.polls_push_notification, _this.getUserID(),
					this.cuePointLoaded, this.cuePointReached, this, "polls");
				//TODO - Eitan - detach
			}
            // }else{
                // VOD mode
                if (!_this.cuePointsManager) {
                    // cue points manager used to monitor and notify when relevant cue points reached (polls status, results).
                    _this.cuePointsManager = new mw.webcast.CuePointsManager(_this.getPlayer(), function () {
                    }, "webcastPolls_CuePointsManager");

                    _this.cuePointsManager.registerMonitoredCuepointTypes(['poll-data'],function(cuepoints)
                    {
						// console.log(">>>>> @@", "registerMonitoredCuepointTypes" , cuepoints);
                       // for(var i = 0;i< cuepoints.length;i++)
                       // {
                       //     try {
                       //         var cuepoint = cuepoints[i];
                       //         var cuepointContent = cuepoint.partnerData ? JSON.parse(cuepoint.partnerData) : null;
                       //          var pollIdTokens = (cuepoint.tags || '').match(/id:([^, ]*)/);
                       //         var pollId = pollIdTokens && pollIdTokens.length === 2 ? pollIdTokens[1] : null;
					   //
                       //         if (cuepointContent && pollId)
                       //         {
                       //             var pollContent = cuepointContent.text;
					   //
                       //             if (pollId && pollContent) {
                       //                 _this.log("updated content of poll with id '" + pollId + "'");
                       //                 if(_this.globals.pollsContentMapping[pollId]) {
                       //                      $.extend(_this.globals.pollsContentMapping[pollId], pollContent);
                       //                 }else {
                       //                     _this.globals.pollsContentMapping[pollId] = pollContent;
                       //                 }
                       //             }
                       //         }
					   //
                       //     }catch(e)
                       //     {
                       //         _this.log("ERROR while tring to extract poll information with error " + e);
                       //     }
					   //
                       // }
                    });

                    _this.cuePointsManager.onCuePointsReached = $.proxy(function(args)
                    {
						console.log(">>>>> @@", "onCuePointsReached" , args);
                        // new cue points reached - change internal polls status when relevant cue points reached
						// disconnected from old CP manager
						// _this.handleStateCuePoints({cuepointsArgs : args});
						// _this.handlePollResultsCuePoints({cuepointsArgs : args});
                    },_this);
                }
            //TODO - detach
			// }

		},

		filter : function (args) {
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
					return args.sortDesc ? (b.createdAt - a.createdAt) : (a.createdAt - b.createdAt);
				});
			}

			return result;
		},

		executeCuePointReached: function (cuepoint) {
			var cuepointTags = cuepoint.tags;
			// if this is a poll-data, and if it is the first poll-data we need to store the poll
			if(cuepointTags && cuepointTags.indexOf("poll-data") > -1){
				var cuepointContent = cuepoint.partnerData ? JSON.parse(cuepoint.partnerData) : null;
				var pollIdTokens = (cuepoint.tags || '').match(/id:([^, ]*)/);
				var pollId = pollIdTokens && pollIdTokens.length === 2 ? pollIdTokens[1] : null;
				var pollContent = cuepointContent.text;
				if (pollId && pollContent) {
					this.log("updated content of poll with id '" + pollId + "'");
					if(this.globals.pollsContentMapping[pollId]) {
						$.extend(this.globals.pollsContentMapping[pollId], pollContent);
					}else {
						this.globals.pollsContentMapping[pollId] = pollContent;
					}
				}
			}
			this.addToLocalCuePointsArray(cuepoint);
			var args = {cuePoints:this.cuepoints,filter:this.filter};
			this.handleStateCuePoints({cuepointsArgs : args});
			this.handlePollResultsCuePoints({cuepointsArgs : args});
		},

		//TODO - remove
		printTagsAndId (arr){
			console.log(">>>>>>>>>>>>>>>>>>>>>>>>>>>>"  );
			for (var i = 0; i < arr.length; i++) {
				var obj = arr[i];
				console.log(">>>>>",obj.id, obj.tags  );
			}
			console.log(">>>>>>>>>>>>>>>>>>>>>>>>>>>>"  );
		},




        //deep compare
		jsonEqual : function(a,b) {
			return JSON.stringify(a) === JSON.stringify(b);
		},
        // checks if this cuePoint is in the array, push if not
        addToLocalCuePointsArray : function (cp){
            var isInArray = $.isArray(cp,this.cuepoints);
            var foundInArray = false;
			for (var i = 0; i < this.cuepoints.length; i++) {
				var obj = this.cuepoints[i];
                if(this.jsonEqual(obj,cp)){
					foundInArray = true;
					break;
                }
			}
			//push to array only if this cuepoint does not exist
			if(!foundInArray){
				this.cuepoints.push(cp);
            }
        },
		cuePointLoaded: function (notificationName, cuePoint, scope) {
			scope.executeCuePointLoaded(cuePoint);
		},
		cuePointReached: function (cuePoint, scope) {
			scope.executeCuePointReached(cuePoint);
		},
		executeCuePointLoaded: function (cuePoint) {
			this.addToLocalCuePointsArray(cuePoint);
		},
		getMetaDataProfile: function () {
			var _this = this;

			var listMetadataProfileRequest = {
				service: "metadata_metadataprofile",
				action: "list",
				"filter:systemNameEqual": this.polls_push_notification
			};
			this.userId = this.getUserID();
			var deferred = $.Deferred();
			this.getKClient().doRequest(listMetadataProfileRequest, function (result) {
				if (result.objectType === "KalturaAPIException") {
					mw.log("Error getting metadata profile: " + result.message + " (" + result.code + ")");
					deferred.resolve(false);
					return;
				}
				_this.metadataProfile = result.objects[0];
				deferred.resolve(true);
			});
			return deferred;
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

		// return something like ##guestHashSeparator-186168013885295##
		generateUserId: function(prefix){
			var _this = this;

			return	"##" +
				prefix + "HashSeparator" +
				_this.getKSHash(_this.getPlayer().getFlashvars().ks) +
				_this.getRandomInt(10000,99999999).toString() +
				"##";
		},


		getUserID: function () {
			var _this = this;

			// If our user ID is the same as the configured anonymousUserId we need to generate one, or get it from localStorage (if exists)
			if (!_this.getConfig("userRole") || _this.getConfig("userRole") === "anonymousRole") {

				var userId = _this.generateUserId("polls-");
				//if localStorage is available, get & store the user id from it;
				if (window.localStorage) {
					try {
						if (!localStorage.kAnonymousUserId) {
							localStorage.kAnonymousUserId = userId;
						}
						userId = localStorage.kAnonymousUserId;
					} catch (e) {
						mw.log("Exception in getUserID: " + e);
					}
				}
				mw.log("Using kAnonymousUserId: ", userId);
				return userId;
			}
			return _this.getConfig("userId");
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
						//TODO - Eitan start investigation here why a new poll gets error
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
                    _this.kalturaProxy.getUserVote(pollId, _this.globals.votingProfileId, _this.globals.userId).then(function (result) {
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
					//Eitan this is wrong. We need to get the votes only from BE and not as FE ++
                    // increase total voters by 1
                    if (_this.pollData.pollResults)
                    {
                    	//TODO
                        // _this.pollData.pollResults.totalVoters++;
                    }else {
                        this.pollData.pollResults = { totalVoters : 1};
                    }
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
		log : function(msg){
        	mw.log("webcastPolls :: " + msg)
		},
        _canCompareTotalVoters: function (newPollResults) {
            var _this = this;
            return _this.pollData && _this.pollData.pollResults && _this.pollData.pollResults.totalVoters && newPollResults.totalVoters;
        }
    }));

})(window.mw, window.jQuery);

