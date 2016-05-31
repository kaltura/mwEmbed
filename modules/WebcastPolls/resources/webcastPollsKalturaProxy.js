(function (mw, $) {
    "use strict";
    mw.webcastPolls = mw.webcastPolls || {};

    mw.webcastPolls.WebcastPollsKalturaProxy = mw.KBasePlugin.extend({
        defaultConfig : {
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
        transmitNewVote : function(pollId, pollProfileId, selectedAnswer)
        {
            var _this = this;
            var defer = $.Deferred();

            var createCuePointRequest = {
                "service": "cuePoint_cuePoint",
                "action": "add",
                "cuePoint:objectType": "KalturaAnnotation",
                "cuePoint:entryId": _this.getPlayer().kentryid,
                "cuePoint:text": '',
                "cuePoint:isPublic": 1,
                "cuePoint:searchableOnEntry": 0,
                "cuePoint:parentId": pollId
            };

            var addMetadataRequest = {
                service: "metadata_metadata",
                action: "add",
                metadataProfileId: pollProfileId,
                objectId: "{1:result:id}",
                xmlData: '<metadata><Answer>' + selectedAnswer + '</Answer></metadata>', // TODO [es] add user id
                objectType: "annotationMetadata.Annotation"
            };

            _this.getKClient().doRequest([createCuePointRequest, addMetadataRequest], function (result) {

                // TODO [es] if one fails, do we reach this point? if so need to handle results
                defer.resolve();
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
        getUserVote : function(pollId){
            var _this = this;

            var request = {
                'service': 'cuepoint_cuepoint',
                'action': 'list',
                'filter:tagsLike':_this.QandA_cuePointTag,
                'filter:entryIdEqual': entryId,
                'filter:objectType': 'KalturaAnnotationFilter',
                'filter:orderBy': '+createdAt',
                'filter:isPublicEqual': '1',
                "responseProfile:objectType":"KalturaResponseProfileHolder",
                "responseProfile:systemName":_this.QandA_ResponseProfileSystemName,

                /*Search  metadata   */
                'filter:advancedSearch:objectType': 'KalturaMetadataSearchItem',
                'filter:advancedSearch:metadataProfileId': _this.metadataProfile.id,
                'filter:advancedSearch:type': 2, //or

                //search all messages on my session id
                'filter:advancedSearch:items:item0:objectType': "KalturaSearchCondition",
                'filter:advancedSearch:items:item0:field': "/*[local-name()='metadata']/*[local-name()='ThreadCreatorId']",
                'filter:advancedSearch:items:item0:value': _this.userId,

                //find all announcements
                'filter:advancedSearch:items:item1:objectType': "KalturaSearchCondition",
                'filter:advancedSearch:items:item1:field': "/*[local-name()='metadata']/*[local-name()='Type']",
                'filter:advancedSearch:items:item1:value': "Announcement",

                //find all AnswerOnAir cue points
                'filter:advancedSearch:items:item2:objectType': "KalturaSearchCondition",
                'filter:advancedSearch:items:item2:field': "/*[local-name()='metadata']/*[local-name()='Type']",
                'filter:advancedSearch:items:item2:value': "AnswerOnAir"
            };
        },
        getKClient: function () {
            if (!this.kClient) {
                this.kClient = mw.kApiGetPartnerClient(this.getPlayer().kwidgetid);
            }
            return this.kClient;
        }
    });

})(window.mw, window.jQuery);
