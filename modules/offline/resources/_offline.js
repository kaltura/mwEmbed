(function (mw, $, LargeLocalStorage, Q, moment) {
  'use strict';

  mw.PluginManager.add('offline', mw.KBaseScreen.extend({
    defaultConfig: {
      align: 'right',
      parent: 'controlsContainer',
      displayImportance: 'low',
      showTooltip: true,
      templatePath: 'resources/tmpl/offline.tmpl.html',
      tooltip: 'Local media',
      order: 50,

      notificationName: 'offline',
      storageRootName: 'kOfflineStorage',
      requestedStorageSize: 1024 * 1024 * 1024 // in bytes, 1GB by default
    },

    iconBtnClass: 'icon-download',
    entryMetadata: null,

    setup: function () {
      var _this = this;

      this.bind('playerReady', function () {
        var entryId = _this.getPlayer().evaluate('{mediaProxy.entry}').id;
        console.info('PLAYER READY WITH ENTRY:', entryId);

        _this.getMetadataForEntryId(entryId).then(function (metadata) {
          console.info('METADATA LOADED:', metadata);
          _this.entryMetadata = metadata;
          _this.overrideXhr();
        }, function () {
          _this.handleManifest();
        });
      });
    },

    overrideXhr: function () {
      var _this = this;
      var open = (XMLHttpRequest.prototype._open ||
        (XMLHttpRequest.prototype._open = XMLHttpRequest.prototype.open));

      XMLHttpRequest.prototype.open = function (method, url, async) {
        var xhr = this;
        var send = this.send;
        var shouldIntercept =
          _this.entryMetadata.fragmentsBaseUrls.some(function (baseUrl) {
            return url.indexOf(baseUrl) >= 0;
          });

        if (shouldIntercept) {
          xhr.send = function (data) {
            var fileName = _this.getFileName(url);
            console.info('CAPTURED:', fileName);

            _this.readAttachment(_this.entryMetadata.id, fileName)
              .then(function (data) {
                console.info('CACHE HIT FOR', fileName);
                var onload = xhr.onload;

                Object.defineProperties(xhr, {
                  readyState: {
                    value: 4,
                    writable: false
                  },
                  status: {
                    value: 200,
                    writable: false
                  },
                  response: {
                    value: data,
                    writable: false
                  },
                  responseType: {
                    value: 'arraybuffer',
                    writable: true
                  }
                });

                onload.call(xhr);
              }).catch(function () {
                console.error('NO CACHE HIT');
                send.call(xhr, data);
              });
          };
        }

        open.call(xhr, method, url, async);
      };
    },

    downloadEntryData: function (entryData) {
      var _this = this;

      Q.all(entryData.fragments.map(function (fragment) {
        return _this.xhrGet(fragment.url, 'arraybuffer');
      })).then(function (fragments) {
        return Q.all(fragments.map(function (fragment, index) {
          _this.lls
            .setAttachment(entryData.entry.id,
              entryData.fragments[index].fileName,
              new Blob([fragment]));
        }));
      }).then(function () {
        _this.lls.setAttachment(entryData.entry.id,
          'metadata.json',
          JSON.stringify(entryData.entry));
      }).done();
    },

    handleManifest: function () {
      var _this = this;

      this.getManifest().then(function (xml) {
        var $xml = $.parseXML(xml);
        var $mpd = $($xml.find('MPD')[0]);
        var entryDuration =
          moment.duration($mpd.attr('mediaPresentationDuration')).asMilliseconds();
        var entryData = {
          entry: _this.getPlayer().evaluate('{mediaProxy.entry}'),
          fragments: []
        };

        entryData.entry.fragmentsBaseUrls = [];

        $xml.find('AdaptationSet').each(function (index, adaptationSet) {
          var $adaptationSet = $(adaptationSet);
          var $segmentTemplate = $($adaptationSet.find('SegmentTemplate')[0]);
          var mediaUrlTemplate = $segmentTemplate.attr('media');
          var initialUrlTemplate = $segmentTemplate.attr('initialization');
          var fragmentStartNumber = Number($segmentTemplate.attr('startNumber'));
          var fragmentsNumber = Math.ceil(entryDuration / $segmentTemplate.attr('duration'));
          // var maxBitrate = Number.POSITIVE_INFINITY;
          var maxBitrate = 0;
          var maxRepresentationId;
          var localBaseUrl = _this.getBaseUrl(initialUrlTemplate);
          var localFragments = [initialUrlTemplate];

          for (var i = fragmentStartNumber; i < (fragmentStartNumber + fragmentsNumber); ++i) {
            localFragments.push(mediaUrlTemplate.replace('$Number$', i));
          }

          $adaptationSet.find('Representation').each(function (index, representation) {
            var $representation = $(representation);
            var bitrate = Number($representation.attr('bandwidth'));
            var id = $representation.attr('id');

            if (bitrate > maxBitrate) {
              maxBitrate = bitrate;
              maxRepresentationId = id;
            }
          });

          localFragments = $.map(localFragments, function (localFragment) {
            var url = localFragment.replace('$RepresentationID$', maxRepresentationId);
            return {
              url: url,
              fileName: _this.getFileName(url)
            };
          });

          entryData.fragments = entryData.fragments.concat(localFragments);
          if (entryData.entry.fragmentsBaseUrls.indexOf(localBaseUrl) < 0) {
            entryData.entry.fragmentsBaseUrls.push(localBaseUrl);
          }
        });

        console.info('EntryData:', entryData);
        _this.downloadEntryData(entryData);
      }).catch(function () {
        console.error('Failed getting mpeg-dash manifest');
      });
    },

    getManifest: function () {
      return this.xhrGet(this.getPlayer().getSrc());
    },

    getLls: function () {
      var _this = this;

      return this.lls ? Q(this.lls) : new LargeLocalStorage({
        size: this.getConfig('requestedStorageSize'),
        name: this.getConfig('storageRootName')
      }).initialized.then(function (lls) {
        console.info('INITIALIZED LLS WITH CAPACITY:', lls.getCapacity());
        return (_this.lls = lls);
      }, function () {
        console.error('ERROR CREATING LLS');
      });
    },

    getBaseUrl: function (url) {
      return url.split('/').slice(0, -1).join('/');
    },

    getFileName: function (url) {
      return url.split('/').pop();
    },

    readAttachment: function (docKey, attachKey, asString) {
      var _this = this;

      return this.getLls().then(function (lls) {
        return lls.getAttachment(docKey, attachKey).then(function (file) {
          console.info('ATTACHMENT READ SUCCESSFULLY:', docKey + '/' + attachKey, file);
          if (!file) {
            return Q.reject(file);
          }

          return _this.readFile(file, asString);
        });
      });
    },

    readFile: function (file, asString) {
      var deferred = Q.defer();
      var reader = new FileReader();

      reader.onloadend = function () {
        if (this.readyState === FileReader.DONE) {
          console.info('FILE READ SUCCESSFULLY:', file);
          deferred.resolve(this.result);
        } else {
          console.info('FILE READ ERROR:', file);
          deferred.reject(this.result);
        }
      };

      if (asString) {
        reader.readAsBinaryString(file);
      } else {
        reader.readAsArrayBuffer(file);
      }

      return deferred.promise;
    },

    getMetadataForEntryId: function (entryId) {
      return this.readAttachment(entryId, 'metadata.json', true).then(function (jsonStr) {
        return JSON.parse(jsonStr);
      });
    },

    xhrGet: function (path, responseType) {
      var response = Q.defer();
      var request = new XMLHttpRequest();

      request.responseType = responseType || 'text';
      request.open('GET', path, true);
      request.onreadystatechange = function () {
        if (request.readyState === 4) {
          if (request.status >= 200 && request.status < 400) {
            response.resolve(request.response);
          } else {
            response.reject('HTTP ' + request.status + ' for ' + path);
          }
        }
      };

      request.send('');

      return response.promise;
    },

    sendNotification: function (type, data) {
      this.getPlayer().sendNotification(this.getConfig('notificationName'), $.extend(data || {}, {
        type: type
      }));
    }
  }));
})(window.mw, window.$, window.LargeLocalStorage, window.Q, window.moment);