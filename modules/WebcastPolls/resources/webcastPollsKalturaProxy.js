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
        getUserVote : function(pollId, userId)
        {
            var _this = this;
            var defer = $.Deferred();

            if (userId && pollId) {

                var request = {
	                'service': 'poll_poll',
	                'action': 'getVote',
	                'pollId': pollId,
	                'userId': userId
                };
                _this.log("requesting information about poll user vote for poll id '" + pollId + "' for user '" + userId + "'");
                _this.getKalturaClient().doRequest(request, function (response) {
                    if (!_this.isErrorResponse(response)) {
                        //Got a good response - now check if it has a previous vote for this user or not
                        if (response && response.indexOf("Could not find vote")==-1) {
                            _this.log("resolving request with the following details: user perform a vote for that poll selecting " + JSON.parse(response)[0]);
                            var result = {answer: JSON.parse(response)[0]};
                            defer.resolve(result);
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
                    _this.log("rejecting request due to error from kaltura api server with reason " + (reason ? JSON.stringify(reason) : ''));
                    defer.reject();
                });
            } else {
                _this.log("rejecting request due to missing required information from plugin");
                defer.reject({});
            }
            return defer.promise();
		},
        transmitNewVote : function(pollId, pollProfileId, userId, selectedAnswer ){
            var _this = this;
            var defer = $.Deferred();
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
