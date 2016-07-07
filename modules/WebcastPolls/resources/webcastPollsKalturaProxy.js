(function (mw, $) {
    "use strict";
    mw.webcastPolls = mw.webcastPolls || {};

    mw.webcastPolls.WebcastPollsKalturaProxy = mw.KBasePlugin.extend({
        defaultConfig :
        {
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

            if (metadataId && userId && selectedAnswer) {
                var updateMetadataRequest = {
                    service: "metadata_metadata",
                    action: "update",
                    id: metadataId,
                    xmlData: '<metadata><Answer>' + selectedAnswer + '</Answer><UserId>' + userId + '</UserId></metadata>',
                };

                _this.log("transmitting update of vote for poll with id '" + pollId + "'");
                _this.getKClient().doRequest(updateMetadataRequest, function (result) {
                    if (!_this.isErrorResponse(result)) {
                        _this.log('successfully transmitted update of vote');
                        defer.resolve({});
                    } else {
                        _this.log("rejecting request due to error from kaltura api server");
                        defer.reject();
                    }
                }, false, function (reason) {
                    _this.log("rejecting request due to error from kaltura api server with reason " + (reason ? JSON.stringify(reason) : ''));
                    defer.reject();
                });
            }else {
                _this.log("rejecting request due to missing required information from plugin");
                defer.reject({});
            }

            return defer.promise();
        },
        transmitNewVote : function(pollId, pollProfileId, userId, selectedAnswer)
        {
            var _this = this;
            var defer = $.Deferred();

            return defer.promise();
            if (pollId && pollProfileId && userId && selectedAnswer) {
                var createCuePointRequest = {
                    "service": "cuePoint_cuePoint",
                    "action": "add",
                    "cuePoint:objectType": "KalturaAnnotation",
                    "cuePoint:entryId": _this.getPlayer().kentryid,
                    "cuePoint:isPublic": 1,
                    "cuePoint:tags": ('id:' + pollId)
                };

                var addMetadataRequest = {
                    service: "metadata_metadata",
                    action: "add",
                    metadataProfileId: pollProfileId,
                    objectId: "{1:result:id}",
                    xmlData: '<metadata><Answer>' + selectedAnswer + '</Answer><UserId>' + userId + '</UserId></metadata>',
                    objectType: "annotationMetadata.Annotation"
                };

                _this.log("transmitting new vote for poll with id '" + pollId + "'");
                _this.getKClient().doRequest([createCuePointRequest, addMetadataRequest], function (result) {

                    if (result && result.length === 2 && !_this.isErrorResponse(result)) {
                        _this.log("successfully transmitted new vote, got back metadata id '" + result[1].id + "'");
                        defer.resolve({metadataId: result[1].id});
                    } else {
                        _this.log("rejecting request due to error from kaltura api server");
                        defer.reject();
                    }
                }, false, function (reason) {
                    _this.log("rejecting request due to error from kaltura api server with reason " + (reason ? JSON.stringify(reason) : ''));
                    defer.reject();
                });
            }else {
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
