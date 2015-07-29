/**
 * Created by einatr on 7/9/15.
 */
(function (mw, $) {
    "use strict";

    mw.PluginManager.add('relatedFiles', mw.KBaseScreen.extend({

        defaultConfig: {
            parent: "controlsContainer",
            align: "right",
            tooltip: gM('mwe-embedplayer-relatedFiles'),
            showTooltip: true,
            displayImportance: 'medium',
            templatePath: '../RelatedFiles/resources/relatedFiles.tmpl.html',

            downloadEnabled: true
        },

        iconBtnClass: "icon-share",//"icon-relatedFiles",
        relatedFilesList: [],

        setup: function () {
            //TODO: make plugin icon disabled; - onEnable/onDisable
            this.addBindings();
        },

        addBindings: function(){
            var _this = this;
            this.bind('playerReady', function () {
                _this.getRelatedFiles();
            });
        },

        getRelatedFiles: function(){
            var _this = this;
            var attachmentsRequest = {
                'service': 'attachment_attachmentasset',
                'action': 'list',
                'filter:entryIdEqual': _this.getPlayer().kentryid
            };
            _this.getKClient().doRequest(attachmentsRequest, function (attachmentResult) {
                _this.fillRelatedFilesList(attachmentResult.objects);
            });
        },

        getKClient: function () {
            if (!this.kClient) {
                this.kClient = mw.kApiGetPartnerClient(this.embedPlayer.kwidgetid);
            }
            return this.kClient;
        },

        fillRelatedFilesList: function(attachments){
            var _this = this;
            for(var i=0; i < attachments.length; i++){
                _this.relatedFilesList.push(_this.createFile(attachments[i]));
            }
            //TODO: make plugin icon enabled
        },

        createFile: function(attachment){
            /*
             createdAt: 1436443851
             description: ""
             entryId: "1_whkdbnzd"
             fileExt: "jpg"
             filename: "hand.jpg"
             format: "2"
             id: "1_0r6vtsf6"
             partnerId: 243342
             size: 100128
             status: 2
             tags: ""
             updatedAt: 1436443851
             version: "1"
             */

            var file={};
            file.filename = attachment.filename;
            file.size = attachment.size;
            file.id = attachment.id;

            return file;
        },

        download: function(e, id){
            //alert(id);
            var urlRequest = {
                'service': 'attachment_attachmentasset',
                'action': 'geturl',
                'id': id
            };

             this.getKClient().doRequest(urlRequest, function (urlResult) {
                 console.log(urlResult);
             });

        },

        getTemplateData: function () {
            return {
                'relatedFiles': this,
                'downloadEnabled': this.getConfig('downloadEnabled'),
                'files': this.relatedFilesList
            };
        }
    }));

})(window.mw, window.jQuery);