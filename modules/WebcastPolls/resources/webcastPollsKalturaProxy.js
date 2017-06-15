(function (mw, $) {
    "use strict";
    mw.webcastPolls = mw.webcastPolls || {};

    mw.webcastPolls.WebcastPollsKalturaProxy = mw.KBasePlugin.extend({
        /* DEVELOPER NOTICE: you should not set any property directly here (they will be shared between instances) - use the setup function instead */
        defaultConfig :
        {
            /* DEVELOPER NOTICE : don't use this plugin config feature since it is a detached plugin. A detached plugin cannot access the player configuration to support overrides */
        },
        setup : function()
        {
            var _this = this;

            /*
             DEVELOPER NOTICE: you should set properties here (they will be scoped per instance)
             */
            $.extend(_this, {
            });
        },
        isErrorResponse : function(result)
        {
            var _this = this;
            var hasError = false;

            if (!result)
            {

                _this.log('request to server failed with the following details: got undefined or null response');
                return true;
            }

            if ($.isArray(result))
            {
                $.each(result,function(index, response)
                {
                    hasError = hasError || (response && response.objectType && response.objectType === "KalturaAPIException");
                });
            }else
            {
                hasError = (result && result.objectType && result.objectType === "KalturaAPIException");
            }

            if (hasError)
            {
                _this.log('request to server failed with the following details: ' + result.code + ' - ' + result.message);
            }

            return hasError;
        },
        getUserVote : function(pollId, profileId, userId)
        {
            var _this = this;
            var defer = $.Deferred();

            if (profileId && userId && pollId) {

                var request = {
                    'service': 'cuepoint_cuepoint',
                    'action': 'list',
                    'filter:entryIdEqual': _this.getPlayer().kentryid,
                    'filter:orderBy': '-createdAt', // although only one vote is allowed per user, we fetch the last one so if for unknown reason we have duplicates, the user will see his last choice
                    'filter:objectType': 'KalturaAnnotationFilter',
                    'filter:cuePointTypeIn': 'annotation.Annotation',
                    'filter:tagsMultiLikeOr': ('id:' + pollId),

                    /*Search  metadata   */
                    'filter:advancedSearch:objectType': 'KalturaMetadataSearchItem',
                    'filter:advancedSearch:metadataProfileId': profileId,
                    "responseProfile:objectType":"KalturaResponseProfileHolder",
                    "responseProfile:systemName":"pollVoteResponseProfile",

                    //search all messages on my session id
                    'filter:advancedSearch:items:item1:objectType': "KalturaSearchCondition",
                    'filter:advancedSearch:items:item1:field': "/*[local-name()='metadata']/*[local-name()='UserId']",
                    'filter:advancedSearch:items:item1:value': userId,

                    'pager:pageSize': 1,
                    'pager:pageIndex': 1
                };

                _this.log("requesting information about poll user vote for poll id '" + pollId + "' for user '" + userId + "'");
                _this.getKalturaClient().doRequest(request, function (response) {
                    if (!_this.isErrorResponse(response)) {
                        var cuePoint = (response && response.objects && response.objects.length > 0) ? response.objects[0] : null;

                        if (cuePoint) {
                            var metadata = (cuePoint.relatedObjects &&
                                cuePoint.relatedObjects.pollVoteResponseProfile &&
                                cuePoint.relatedObjects.pollVoteResponseProfile.objects &&
                                cuePoint.relatedObjects.pollVoteResponseProfile.objects.length > 0
                            ) ? cuePoint.relatedObjects.pollVoteResponseProfile.objects[0] : null;

                            if (metadata && metadata.xml) {
                                var voteAnswerToken = metadata.xml.match(/<Answer>([0-9]+?)<[/]Answer>/);
                                var vote = (voteAnswerToken && voteAnswerToken.length === 2) ? voteAnswerToken[1] : null;
                                var metadataId = metadata.id;

                                _this.log("resolving request with the following details: answer '" + vote + "' metadataId '" + metadataId + "'");
                                var result = {metadataId: metadataId, answer: vote};
                                defer.resolve(result);

                            } else {
                                // ## got cue point without metadata - invalid situation
                                _this.log("rejecting request due to invalid response from kaltura api");
                                defer.reject();
                            }
                        }else {
                            _this.log("resolving request with the following details: user didn't perform a vote for that poll");
                            defer.resolve({});
                        }
                    } else {
                        _this.log("rejecting request due to error from kaltura api server");
                        defer.reject();
                    }

                }, false, function (reason) {
                    _this.log("rejecting request due to error from kaltura api server with reason " + (reason ? JSON.stringify(reason) : ''));
                    defer.reject({});
                });
            }else
            {
                _this.log("rejecting request due to missing required information from plugin");
                defer.reject({});
            }

            return defer.promise();
        },
		transmitVoteUpdate : function(metadataId, userId, selectedAnswer,pollId)
		{
			var _this = this;
			var defer = $.Deferred();
            //using vote API
            if (pollId && userId && selectedAnswer) {
                var vote = {
                    "service": "poll_poll",
                    "action": "vote",
                    "pollId": pollId,
                    "answerIds": selectedAnswer, // 1
                    "userId": userId
                };
                _this.getKClient().doRequest(vote, function (result) {
                    if(!_this.isErrorResponse(result)){
                        defer.resolve({});
                    }else{
                        _this.log("Got error response from server " + result);
                        defer.reject();
                    }
                }, false, function (reason) {
                    //TODO - Eitan handle errors later
                    _this.log("rejecting request due to error from kaltura api server with reason " + (reason ? JSON.stringify(reason) : ''));
                    defer.reject();
                });
            } else {
                _this.log("rejecting request due to missing required information from plugin");
                defer.reject({});
            }
            return defer.promise();
		},
		transmitNewVote : function(pollId, pollProfileId, userId, selectedAnswer )
		{
			var _this = this;
			var defer = $.Deferred();
			// TODO - remove 'if' once switch to new API
			//using vote API
            if (pollId && pollProfileId && userId && selectedAnswer) {
                var vote = {
                    "service": "poll_poll",
                    "action": "vote",
                    "pollId": pollId,
                    "answerIds": selectedAnswer, // 1
                    "userId": userId
                };
                _this.getKClient().doRequest(vote, function (result) {
                    if(!_this.isErrorResponse(result)){
                        defer.resolve({});
                    }else{
                        _this.log("Got error response from server " + result);
                        defer.reject();
                    }
                }, false, function (reason) {
                    _this.log("rejecting request due to error from kaltura api server with reason " + (reason ? JSON.stringify(reason) : ''));
                    defer.reject();
                });
            } else {
                _this.log("rejecting request due to missing required information from plugin");
                defer.reject({});
            }
            return defer.promise();
		},

        getVoteCustomMetadataProfileId : function()
        {
            var _this = this;
            var defer = $.Deferred();

            var listMetadataProfileRequest = {
                service: "metadata_metadataprofile",
                action: "list",
                "filter:systemNameEqual": 'pollVoteCustomMetadataProfile'
            };

            _this.log("requesting voting metadata profile id for partner");
            this.getKClient().doRequest(listMetadataProfileRequest, function (result) {
                if (!_this.isErrorResponse(result) && result.objects.length) {
                    defer.resolve({profileId: result.objects[0].id});
                } else {
                    _this.log("rejecting request due to error from kaltura api server");
                    defer.reject();
                }
            },false,function(reason)
            {
                _this.log("rejecting request due to error from kaltura api server with reason " + (reason ? JSON.stringify(reason) : ''));
                defer.reject();
            });

            return defer.promise();
        },
        getKClient: function ()
        {
            if (!this.kClient) {
                this.kClient = mw.kApiGetPartnerClient(this.getPlayer().kwidgetid);
            }
            return this.kClient;
        }
    });

})(window.mw, window.jQuery);
