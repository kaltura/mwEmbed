(function (mw, $) {
    "use strict";
    mw.webcastPolls = mw.webcastPolls || {};

    mw.webcastPolls.WebcastPollsKalturaProxy = mw.KBasePlugin.extend({
        defaultConfig : {
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
        getPollData : function(pollId)
        {
            var _this = this;
            var defer = $.Deferred();

            var request = {
                'service': 'cuepoint_cuepoint',
                'action': 'get',
                'id': pollId
            };

            _this.getKalturaClient().doRequest(request, function(result)
            {
                try {
                    var pollData = JSON.parse(result.text);
                    defer.resolve({pollData : pollData });
                }catch(e)
                {
                    defer.reject({});
                }

            },false, function(reason)
            {
                defer.reject({});
            });

            return defer.promise();
        },
        transmitNewVote : function(userId, pollId, pollProfileId, selectedAnswer)
        {
            var _this = this;
            var defer = $.Deferred();

            var createCuePointRequest = {
                "service": "cuePoint_cuePoint",
                "action": "add",
                "cuePoint:objectType": "KalturaAnnotation",
                "cuePoint:entryId": _this.getPlayer().kentryid,
                "cuePoint:text": selectedAnswer, // TODO [es] should be removed
                "cuePoint:isPublic": 1,
                "cuePoint:searchableOnEntry": 0,
                "cuePoint:parentId": pollId
            };

            var addMetadataRequest = {
                service: "metadata_metadata",
                action: "add",
                metadataProfileId: pollProfileId,
                objectId: "{1:result:id}",
                xmlData: '<metadata><Answer>' + selectedAnswer + '</Answer><UserId>' + userId + '</UserId></metadata>', // TODO [es] add user id
                objectType: "annotationMetadata.Annotation"
            };

            _this.getKClient().doRequest([createCuePointRequest, addMetadataRequest], function (result) {

                if (_this.isErrorResponse(result))
                {
                    defer.reject();
                }else {
                    defer.resolve();
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
        getUserVote : function(userId, pollId, profileId ){
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

                //search all messages on my session id
                'filter:advancedSearch:items:item1:objectType': "KalturaSearchCondition",
                'filter:advancedSearch:items:item1:field': "/*[local-name()='metadata']/*[local-name()='UserId']",
                'filter:advancedSearch:items:item1:value': userId
            };

            this.getKClient().doRequest(request, function (result) {
                if (_this.isErrorResponse(result))
                {
                    defer.reject();
                }else {
                    var vote = (result.objects && result.objects.length > 0) ? result.objects[0].text : null
                    defer.resolve({vote : vote});
                }
            },false,function(reason)
            {
                defer.reject();
            });

            return defer.promise();
        },
        getKClient: function () {
            if (!this.kClient) {
                this.kClient = mw.kApiGetPartnerClient(this.getPlayer().kwidgetid);
            }
            return this.kClient;
        }
    });

})(window.mw, window.jQuery);
