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
            pollResults: {
                getRequest: function (entryId, pollId) {
                    var request = {
                        'service': 'cuepoint_cuepoint',
                        'action': 'list',
                        'filter:objectType': 'KalturaAnnotationFilter',
                        'filter:entryIdEqual': entryId,
                        'filter:orderBy': '-createdAt',
                        'filter:cuePointTypeIn': 'annotation.Annotation',
                        'filter:parentIdEqual': pollId,
                        'filter:tagsLike': 'poll-results',
                        'pager:pageSize': 1,
                        'pager:pageIndex': 1
                    };

                    return request;
                },
                handleResponse: function (result,response) {
                    var pollResults = {};

                    if (response.objects && response.objects.length) {
                        var pollResults = response.objects[0].text;
                        result.pollResults = JSON.parse(pollResults);
                    }

                    return pollResults;
                }
            },
            pollData : {
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
                    var pollData = JSON.parse(response.text);
                    result.pollData = pollData;
                }
            }
        },
        getPollResults : function(pollId)
        {
            var _this = this;
            var defer = $.Deferred();

            var request = _this.adapters.pollResults.getRequest(_this.getPlayer().kentryid, pollId);

            _this.getKalturaClient().doRequest(request, function(response)
            {
                if (!_this.isErrorResponse(response))
                {
                    var result = {};
                    _this.adapters.pollResults.handleResponse(result,response);
                    defer.resolve(result);
                }else {
                    defer.reject();
                }
            },false, function(reason)
            {
                defer.reject({});
            });

            return defer.promise();
        },
        getPollContent : function(pollId)
        {
            var _this = this;
            var defer = $.Deferred();

            var pollDataRequest = _this.adapters.pollData.getRequest(pollId);
            var pollResultsRequest = _this.adapters.pollResults.getRequest(_this.getPlayer().kentryid, pollId);

            _this.getKalturaClient().doRequest([pollDataRequest, pollResultsRequest], function(responses)
            {
                if (!_this.isErrorResponse(responses))
                {
                    try {
                        var result = {};
                        _this.adapters.pollData.handleResponse(result,responses[0]);
                        _this.adapters.pollResults.handleResponse(result,responses[1]);

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
        getUserVote : function(userId, pollId, profileId )
        {
            var _this = this;
            var defer = $.Deferred();


            var request = {
                'service': 'cuepoint_cuepoint',
                'action': 'list',
                'filter:entryIdEqual': _this.getPlayer().kentryid,
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

            this.getKClient().doRequest(request, function (result) {
                if (!_this.isErrorResponse(result))
                {
                    try {
                        var cuePoint =(result.objects && result.objects.length > 0) ? result.objects[0] : null;

                        if (cuePoint)
                        {
                            var metadata = (cuePoint.relatedObjects &&
                                cuePoint.relatedObjects.pollVoteResponseProfile &&
                                cuePoint.relatedObjects.pollVoteResponseProfile.objects &&
                                cuePoint.relatedObjects.pollVoteResponseProfile.objects.length > 0
                            ) ? cuePoint.relatedObjects.pollVoteResponseProfile.objects[0] : null;

                            if (metadata && metadata.xml)
                            {
                                var voteAnswerToken = metadata.xml.match(/<Answer>([0-9]+?)<[/]Answer>/);
                                var vote = (voteAnswerToken.length === 2) ? voteAnswerToken[1] : null;
                                var metadataId = metadata.id;

                                if (vote) {
                                    defer.resolve({metadataId: metadataId, answer: vote});
                                }else {
                                    // ## failed to extract metadata of cuepoint - invalid situation
                                    defer.reject();
                                }
                            }else
                            {
                                // ## got cue point without metadata - invalid situation
                                defer.reject();
                            }
                        }else
                        {
                            // ## user didn't vote already - valid situation
                            defer.resolve({metadataId : null,answer : null});
                        }
                    }catch(e)
                    {
                        // ## general error
                        mw.log.error(e);
                        defer.reject();
                    }

                }else {
                    // ## got error from api
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
