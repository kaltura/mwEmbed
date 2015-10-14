(function (mw) {
  'use strict';

  var knownExtensions = {
    word: ['doc', 'dot', 'docx', 'docm', 'dotx', 'dotm', 'docb', 'rtf'],
    excel: ['xls', 'xlt', 'xlm', 'xlsx', 'xlsm', 'xltx', 'xltm', 'xlsb', 'xla', 'xlam', 'xll', 'xlw'],
    pdf: ['pdf'],
    'open-office': ['odf'],
    archive: ['tar', 'bz2', 'gz', 'lz', 'lzma', 'z', '7z', 'rar', 'rk', 'tgz', 'tlz', 'zip', 'zipx'],
    picture: ['bmp', 'exif', 'gif', 'ico', 'jpg', 'jpeg', 'png', 'psd', 'tif', 'tiff', 'eps', 'svg'],
    audio: ['wav', 'flac', 'm4a', 'amr', 'mp3', 'aac'],
    video: ['3gp', 'avi', 'flv', 'mp4', 'mkv', 'mov'],
    text: ['txt', 'css', 'js', 'conf', 'log', 'asc']
  };

  mw.PluginManager.add('relatedFiles', mw.KBaseScreen.extend({
    defaultConfig: {
      parent: 'controlsContainer',
      align: 'right',
      tooltip: gM('mwe-embedplayer-relatedFiles'),
      showTooltip: true,
      displayImportance: 'medium',
      templatePath: '../RelatedFiles/resources/relatedFiles.tmpl.html',

      downloadEnabled: true,
      directDownloadSingleFile: false
    },

    iconBtnClass: 'icon-attachment',
    relatedFilesList: [],

    setup: function setup() {
      this.disable();
      this.overrideBindings();
      this.addBindings();
    },

    addBindings: function addBindings() {
      var _this = this;

      this.bind('playerReady', function () {
        _this.disable();
        _this.getRelatedFiles();
      });

      this.bind('onChangeMedia', function () {
        _this.disable();
      });
    },

    overrideBindings: function overrideBindings() {
      var _this = this;

      this.getComponent().unbind('click');
      this.getComponent().click(function () {
        if (_this.getConfig('downloadEnabled') &&
            _this.getConfig('directDownloadSingleFile') &&
            _this.relatedFilesList.length === 1) {
          _this.doDownload(_this.relatedFilesList[0].id);
        } else {
          _this.toggleScreen();
        }
      });
    },

    getRelatedFiles: function getRelatedFiles() {
      var _this = this;
      var attachmentsRequest = {
        'service': 'attachment_attachmentasset',
        'action': 'list',
        'filter:entryIdEqual': this.getPlayer().kentryid
      };

      this.getKClient().doRequest(attachmentsRequest, function (attachmentResult) {
        _this.fillRelatedFilesList(attachmentResult.objects);
      });

      /*TODO Remove later*/
      /*Mock related files list if needed*/
      // var testAttachments = {
      //   'objects': !this.relatedFilesList.length ? [
      //     {
      //       'filename':'hand.jpg',
      //       'format':'2',
      //       'status':2,
      //       'id':'1_0r6vtsf6',
      //       'entryId':'1_whkdbnzd',
      //       'partnerId':243342,
      //       'version':'1',
      //       'size':100128,
      //       'tags':'',
      //       'fileExt':'jpg',
      //       'createdAt':1436443851,
      //       'updatedAt':1436443851,
      //       'description':'',
      //       'objectType':'KalturaAttachmentAsset'
      //     },
      //     {
      //       'filename':'GoodDVR.txt',
      //       'format':'1',
      //       'status':2,
      //       'id':'1_zity53t9',
      //       'entryId':'1_whkdbnzd',
      //       'partnerId':243342,
      //       'version':'1',
      //       'size':31808,
      //       'tags':'',
      //       'fileExt':'txt',
      //       'createdAt':1436443852,
      //       'updatedAt':1436443852,
      //       'description':'',
      //       'objectType':'KalturaAttachmentAsset'
      //     },
      //     {
      //       'filename':'video_heartbeat_javascript.pdf',
      //       'format':'3',
      //       'status':2,
      //       'id':'1_rs8bn94u',
      //       'entryId':'1_whkdbnzd',
      //       'partnerId':243342,
      //       'version':'1',
      //       'size':1021983,
      //       'tags':'',
      //       'fileExt':'pdf',
      //       'createdAt':1436443852,
      //       'updatedAt':1436443852,
      //       'description':'',
      //       'objectType':'KalturaAttachmentAsset'
      //     }
      //   ] : [],
      //   'totalCount':3,
      //   'objectType':'KalturaAttachmentAssetListResponse'
      // };
      // this.fillRelatedFilesList(testAttachments.objects);
    },

    getKClient: function getKClient() {
      if (!this.kClient) {
        this.kClient = mw.kApiGetPartnerClient(this.embedPlayer.kwidgetid);
      }

      return this.kClient;
    },

    fillRelatedFilesList: function fillRelatedFilesList(attachmentResult) {
      var i = 0;
      var l = attachmentResult.length;

      this.relatedFilesList = [];
      for (i; i < l; ++i) {
        this.relatedFilesList.push(this.createFile(attachmentResult[i]));
      }

      this.enable();
    },

    createFile: function createFile(attachment) {
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

      return {
        id: attachment.id,
        size: attachment.size,
        filename: attachment.filename,
        createdAt: attachment.createdAt,
        createdAtFormatted: this.formatDate(attachment.createdAt),
        fileExt: attachment.fileExt,
        type: this.resolveType(attachment)
      };
    },

    download: function download(e, data) {
      this.doDownload((data || {}).id);
    },

    doDownload: function doDownload(attachmentId) {
      if (!this.getConfig('downloadEnabled') && attachmentId) {
        return;
      }

      var urlRequest = {
        service: 'attachment_attachmentasset',
        action: 'geturl',
        id: attachmentId
      };

      this.getKClient().doRequest(urlRequest, function (url) {
        window.location = url;
      });
    },

    getTemplateData: function getTemplateData() {
      return {
        relatedFiles: this,
        downloadEnabled: this.getConfig('downloadEnabled'),
        files: this.relatedFilesList
      };
    },

    disable: function disable() {
      this.getComponent().addClass('hide-important');
    },

    enable: function enable() {
      if (this.relatedFilesList.length) {
        this.getComponent().removeClass('hide-important');
      }
    },

    resolveType: function resolveType(attachment) {
      var extension = (attachment.fileExt || '').toLowerCase();
      var format;
      var group;
      var ar;
      var i;
      var l;

      for (group in knownExtensions) {
        for (ar = knownExtensions[group], i = 0, l = ar.length; i < l; ++i) {
          if (extension === ar[i]) {
            return group;
          }
        }
      }

      format = Number(attachment.format);
      if (format === 1 || format === 3) {
        return 'text';
      } else if (format === 2) {
        return 'video';
      }

      return 'unknown';
    },

    formatDate: function formatDate(unixTimestamp) {
      var months = [
        'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
        'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      var d = new Date(unixTimestamp * 1000);
      var year = d.getFullYear();
      var month = months[d.getMonth()];
      var day = ('0' + d.getDate()).slice(-2);
      var hour = ('0' + d.getHours()).slice(-2);
      var minute = ('0' + d.getMinutes()).slice(-2);

      return day + '-' + month + '-' + year + ' ' + hour + ':' + minute;
    }
  }));

})(window.mw);