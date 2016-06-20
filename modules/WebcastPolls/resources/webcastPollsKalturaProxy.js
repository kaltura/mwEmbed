(function (mw, $) {
    "use strict";
    mw.webcastPolls = mw.webcastPolls || {};

    mw.webcastPolls.WebcastPollsKalturaProxy = mw.KBasePlugin.extend({
        defaultConfig :
        {
        },
        isErrorResponse : function(result)
        {
            if (!result)
            {
                return true;
            }
            if ($.isArray(result))
            {
                var hasError = false;
                $.each(result,function(index, response)
                {
                    hasError = hasError || (response && response.objectType && response.objectType === "KalturaAPIException");
                });

                return hasError;
            }else
            {
                return (result && result.objectType && result.objectType === "KalturaAPIException");
            }
        },
        adapters : {
            pollContent : {
                getRequest : function(pollId)
                {
                    var request = {
                        'service': 'cuepoint_cuepoint',
                        'action': 'get',
                        'id': pollId
                    };

                    return request;
                },
                handleResponse : function(result, response)
                {
                    var pollContent = JSON.parse(response.text);
                    result.pollContent = pollContent;
                }
            },
            userVote : {
                getRequest: function(entryId, pollId, profileId, userId)
                {
                    var request = {
                        'service': 'cuepoint_cuepoint',
                        'action': 'list',
                        'filter:entryIdEqual': entryId,
                        'filter:orderBy': '-createdAt', // although only one vote is allowed per user, we fetch the last one so if for unknown reason we have duplicates, the user will see his last choice
                        'filter:objectType': 'KalturaAnnotationFilter',
                        'filter:cuePointTypeIn': 'annotation.Annotation',
                        'filter:parentIdEqual': pollId,

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

                    return request;
                },
                handleResponse : function(result, response)
                {
                    result.userVote = {};

                    var cuePoint =(response && response.objects && response.objects.length > 0) ? response.objects[0] : null;

                    if (cuePoint)
                    {
                        var metadata = (cuePoint.relatedObjects &&
                            cuePoint.relatedObjects.pollVoteResponseProfile &&
                            cuePoint.relatedObjects.pollVoteResponseProfile.objects &&
                            cuePoint.relatedObjects.pollVoteResponseProfile.objects.length > 0
                        ) ? cuePoint.relatedObjects.pollVoteResponseProfile.objects[0] : null;

                        if (metadata && metadata.xml) {
                            var voteAnswerToken = metadata.xml.match(/<Answer>([0-9]+?)<[/]Answer>/);
                            var vote = (voteAnswerToken && voteAnswerToken.length === 2) ? voteAnswerToken[1] : null;
                            var metadataId = metadata.id;

                            result.userVote = {metadataId: metadataId, answer: vote};

                            if (!vote)
                            {
                                // TODO [es] log
                            }
                        }else
                        {
                            // ## got cue point without metadata - invalid situation
                            throw new Error("todo"); // TODO [es]
                        }
                    }

                }
            }
        },
        getUserVote : function(pollId, profileId, userId)
        {
            var _this = this;
            var defer = $.Deferred();

            if (profileId && userId && pollId) {

                var request = _this.adapters.userVote.getRequest(_this.getPlayer().kentryid, pollId, profileId, userId);

                _this.getKalturaClient().doRequest(request, function (response) {
                    if (!_this.isErrorResponse(response)) {
                        try {
                            var result = {};
                            _this.adapters.userVote.handleResponse(result, response);
                            defer.resolve(result);
                        } catch (e) {
                            defer.reject({});
                        }
                    } else {
                        defer.reject();
                    }

                }, false, function (reason) {
                    defer.reject({});
                });
            }else
            {
                defer.reject({});
            }

            return defer.promise();
        },
        getPollContent : function(pollId, profileId, userId)
        {
            var _this = this;
            var defer = $.Deferred();

            var requests = [];
            requests.push(_this.adapters.pollContent.getRequest(pollId));

            if (profileId)
            {
                requests.push(_this.adapters.userVote.getRequest(_this.getPlayer().kentryid,pollId, profileId, userId));
            }

            _this.getKalturaClient().doRequest(requests, function(responses)
            {
                if (!_this.isErrorResponse(responses))
                {
                    try {
                        var result = {};
                        _this.adapters.pollContent.handleResponse(result,responses[0]);
                        if (responses.length === 2) {
                            _this.adapters.userVote.handleResponse(result, responses[1]);
                        }

                        defer.resolve(result);
                    }catch(e)
                    {
                        defer.reject({});
                    }
                }else {
                    defer.reject();
                }

            },false, function(reason)
            {
                defer.reject({});
            });

            return defer.promise();
        },
        transmitVoteUpdate : function(metadataId, userId, selectedAnswer)
        {
            var _this = this;
            var defer = $.Deferred();

            var updateMetadataRequest = {
                service: "metadata_metadata",
                action: "update",
                id : metadataId,
                xmlData: '<metadata><Answer>' + selectedAnswer + '</Answer><UserId>' + userId + '</UserId></metadata>',
            };

            _this.getKClient().doRequest(updateMetadataRequest, function (result) {
                if (!_this.isErrorResponse(result))
                {
                    defer.resolve({});
                }else {
                    defer.reject();
                }
            },false,function()
            {
                defer.reject();
            });

            return defer.promise();
        },
        transmitNewVote : function(pollId, pollProfileId, userId, selectedAnswer)
        {
            var _this = this;
            var defer = $.Deferred();

            var createCuePointRequest = {
                "service": "cuePoint_cuePoint",
                "action": "add",
                "cuePoint:objectType": "KalturaAnnotation",
                "cuePoint:entryId": _this.getPlayer().kentryid,
                "cuePoint:isPublic": 1,
                "cuePoint:searchableOnEntry": 0,
                "cuePoint:parentId": pollId
            };

            var addMetadataRequest = {
                service: "metadata_metadata",
                action: "add",
                metadataProfileId: pollProfileId,
                objectId: "{1:result:id}",
                xmlData: '<metadata><Answer>' + selectedAnswer + '</Answer><UserId>' + userId + '</UserId></metadata>',
                objectType: "annotationMetadata.Annotation"
            };

            _this.getKClient().doRequest([createCuePointRequest, addMetadataRequest], function (result) {

                if (result && result.length === 2 && !_this.isErrorResponse(result))
                {
                    defer.resolve({metadataId : result[1].id});
                }else {
                    defer.reject();
                }
            },false,function()
            {
                defer.reject();
            });

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

            this.getKClient().doRequest(listMetadataProfileRequest, function (result) {
                if (result.objects.length) {
                    defer.resolve({profileId: result.objects[0].id});
                }else
                {
                    defer.reject();
                }
            },false,function(reason)
            {
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
