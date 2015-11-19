(function (mw, $, LargeLocalStorage, Q) {
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
      contentId: 'kOfflineStorage',
      showIndicator: true,
      requestedStorageSize: 1024 * 1024 * 1024 // in bytes, 1GB by default
    },

    iconBtnClass: 'icon-download',
    entryMetadata: null,

    setup: function () {
      navigator.persistentStorage = navigator.persistentStorage ||
        navigator.webkitPersistentStorage;
      this.overrideBindings();
      this.setBindings();
    },

    overrideBindings: function overrideBindings() {
      var _this = this;

      this.getComponent().unbind('click');
      this.getComponent().click(function () {
        _this.startDownload();
      });
    },

    setBindings: function () {
      var _this = this;

      if (!this.getConfig('showIndicator')) {
        this.getComponent().addClass('hide-important');
      }

      this.bind('playerReady', function () {
        var entryId = _this.getPlayer().evaluate('{mediaProxy.entry}').id;
        console.info('PLAYER READY WITH ENTRY:', entryId);

        _this.entryMetadata = null;
        _this.updateUI();
        _this.getMetadataForEntryId(entryId)
          .then(function (metadata) {
            console.info('METADATA LOADED:', metadata);
            _this.sendNotification('entryExist', entryId);
            _this.entryMetadata = metadata;
            _this.overrideXhr();
            _this.updateUI();
          })
          .finally(function () {
            _this.sendNotification('readyToDownload');
          });
      });

      this.bind('startDownload', function () {
        _this.startDownload();
      });

      this.bind('deleteLocalEntry', function (event, entryId) {
        _this.deleteLocalEntry(entryId)
          .then(function () {
            _this.sendNotification('deleteEntrySuccess', entryId);
          })
          .catch(function () {
            _this.sendNotification('deleteEntryFail', entryId);
          })
          .finally(function () {
            _this.reportUsage();
          });
      });
    },

    deleteLocalEntry: function (entryId) {
      var _this = this;

      entryId = entryId || (this.entryMetadata && this.entryMetadata.id);
      console.info('DELETE LOCAL ENTRY', entryId);

      return this.getLls().then(function (lls) {
        return lls.rm(entryId).then(function () {
          if (_this.entryMetadata && _this.entryMetadata.id === entryId) {
            _this.cancelOverrideXhr();
            _this.entryMetadata = null;
            _this.updateUI();
          }

          console.info('DELETED', entryId);
        });
      });
    },

    startDownload: function () {
      var _this = this;
      var entryId = _this.getPlayer().evaluate('{mediaProxy.entry}').id;
      console.info('START DOWNLOAD RECEIVED');

      if (_this.entryMetadata) {
        _this.sendNotification('entryExist', entryId);
        console.info('THIS ENTRY ALREADY EXISTS');
      } else {
        console.info('START DOWNLOADING');
        _this.downloadEntry();
      }
    },

    cancelOverrideXhr: function () {
      if (XMLHttpRequest.prototype._open) {
        XMLHttpRequest.prototype.open = XMLHttpRequest.prototype._open;
      }
    },

    overrideXhr: function () {
      var _this = this;
      var open = (XMLHttpRequest.prototype._open ||
        (XMLHttpRequest.prototype._open = XMLHttpRequest.prototype.open));

      XMLHttpRequest.prototype.open = function (method, url, async) {
        var xhr = this;
        var send = this.send;
        var shouldIntercept = (url.indexOf(_this.entryMetadata.id) >= 0);
        var mappedFile = shouldIntercept && _this.mapUrlToLocalFile(url);

        if (mappedFile) {
          xhr.send = function (data) {
            console.info('CAPTURED:', mappedFile);

            _this.readAttachment(_this.entryMetadata.id, mappedFile)
              .then(function (data) {
                console.info('CACHE HIT FOR', mappedFile);
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

    mapUrlToLocalFile: function (url) {
      var fileName;

      this.entryMetadata.filesMapping.some(function (mapping) {
        var regExp = mapping.urlRegExp;
        if (regExp.test(url)) {
          var fragmentIndex = url.match(regExp)[1];
          fileName = mapping.fileName.replace('$Number$', fragmentIndex);
          return true;
        }
      });

      console.info('URL', url, 'MAPPED TO', fileName);
      return fileName;
    },

    downloadEntry: function () {
      var _this = this;
      var entry = this.getPlayer().evaluate('{mediaProxy.entry}');

      this.sendNotification('downloadStarted');

      this.getManifest()
        .then(this.getSegmentsFromManifest.bind(this))
        .then(this.downloadSegments.bind(this))
        .then(function (downloadedSegments) {
          console.info('DOWNLOADED SEGMENTS', downloadedSegments);
          _this.sendNotification('entryDownloadSuccess', entry.id);
          _this.saveEntry(entry, downloadedSegments);
        })
        .catch(function (error) {
          console.error(error);
        });
    },

    saveEntry: function (entry, segments) {
      var _this = this;
      var entryId = entry.id;
      var savePromises;

      savePromises = segments.reduce(function (promises, segment) {
        return promises.concat(segment.fragments.map(function (fragment) {
          return _this.getLls().then(function (lls) {
            return lls.setAttachment(entryId, _this.getFileName(fragment.url),
              new Blob([fragment.data]));
          });
        }));
      }, []);

      Q.all(savePromises)
        .then(function () {
          _this.sendNotification('entrySaveSuccess', entryId);

          entry.byteLength = segments.reduce(function (prev, segment) {
            return prev + segment.byteLength;
          }, 0);

          entry.filesMapping = segments.map(function (segment) {
            return {
              url: segment.matchingUrl,
              urlRegExp: new RegExp(segment.matchingUrl),
              fileName: segment.matchingFileName
            };
          });

          return _this.setMetadataForEntry(entry);
        })
        .then(function () {
          var currentEntry = _this.getPlayer().evaluate('{mediaProxy.entry}');
          if (currentEntry.id === entry.id) {
            _this.entryMetadata = entry;
          }

          _this.overrideXhr();
          _this.updateUI();

          _this.sendNotification('savedEntryData', entry);
          console.info('ENTRY SAVED SUCCESSFULLY!');
        })
        .catch(function () {
          _this.sendNotification('filesCleared');
        })
        .finally(function () {
          _this.reportUsage();
        });
    },

    downloadSegments: function (segments) {
      var _this = this;

      return Q.all(segments.map(function (segment) {
        return _this.downloadSegment(segment);
      })).then(function (segments) {
        return segments;
      }).catch(function () {
        console.error('FAILED LOADING ENTRY');
      });
    },

    downloadSegment: function (segment) {
      if (typeof segment.startNumber !== 'number') {
        return this.downloadFragment(segment.urlTemplate)
          .then(function (data) {
            var byteLength = data.byteLength;
            segment.fragments = [];
            segment.byteLength = byteLength;
            segment.fragments.push({
              url: segment.urlTemplate,
              data: data,
              byteLength: byteLength
            });

            return segment;
          });
      }

      var _this = this;
      var deferred = Q.defer();

      segment.fragments = [];
      segment.byteLength = 0;
      doDownloadFragment(segment.urlTemplate, segment.startNumber);
      return deferred.promise;


      function doDownloadFragment(urlTemplate, currentNumber) {
        var url = urlTemplate.replace('$Number$', currentNumber++);

        _this.downloadFragment(url)
          .then(function (data) {
            var byteLength = data.byteLength;

            segment.byteLength += byteLength;
            segment.fragments.push({
              url: url,
              data: data,
              byteLength: byteLength
            });

            doDownloadFragment(urlTemplate, currentNumber);
          })
          .catch(function (reason) {
            if (reason && reason.status === 404) {
              _this.sendNotification('segmentSuccess', segment);
              deferred.resolve(segment);
            } else {
              _this.sendNotification('segmentFail', reason);
              deferred.reject(reason);
            }
          });
      }
    },

    downloadFragment: function (fragmentUrl) {
      var _this = this;
      var counter = 0;
      var deferred = Q.defer();

      query();
      return deferred.promise;


      function query() {
        _this.xhrGet(fragmentUrl, 'arraybuffer')
          .then(function (data) {
            _this.sendNotification('fragmentSuccess', fragmentUrl);
            deferred.resolve(data);
          })
          .catch(function (reason) {
            if (reason.status !== 404 && counter++ < 1) {
              _this.sendNotification('fragmentRetry', fragmentUrl);
              query();
            } else {
              if (reason.status !== 404) {
                _this.sendNotification('fragmentFail', fragmentUrl);
              }

              deferred.reject(reason);
            }
          });
      }
    },

    getSegmentsFromManifest: function ($manifest) {
      var _this = this;
      var segments = []; // urlTemplate, startNumber, matchingUrl, matchingFileName

      $manifest.find('AdaptationSet').each(function (i, adaptationSet) {
        var $adaptationSet = $(adaptationSet);
        var $segmentTemplate = $($adaptationSet.find('SegmentTemplate')[0]);
        var mediaUrlTemplate = $segmentTemplate.attr('media');
        var initialUrlTemplate = $segmentTemplate.attr('initialization');
        var fragmentStartNumber = Number($segmentTemplate.attr('startNumber'));
        var initialUrlSegment = {};
        var mediaUrlSegment = {
          startNumber: fragmentStartNumber
        };

        var maxBandwidth = 0;
        var maxRepresentationId;
        var representationIds = [];
        var representationSelector;

        $adaptationSet.find('Representation').each(function (i, representation) {
          var $representation = $(representation);
          var bandwidth = Number($representation.attr('bandwidth'));
          var id = $representation.attr('id');

          representationIds.push(id);
          if (bandwidth > maxBandwidth) {
            maxBandwidth = bandwidth;
            maxRepresentationId = id;
          }
        });

        representationSelector =
          '(' + representationIds.map(_this.escapeRegExp).join('|') + ')';

        initialUrlSegment.urlTemplate = initialUrlTemplate.replace('$RepresentationID$', maxRepresentationId);
        initialUrlSegment.matchingFileName =
          _this.getFileName(initialUrlTemplate).replace('$RepresentationID$', maxRepresentationId);
        initialUrlSegment.matchingUrl = _this.escapeRegExp(initialUrlTemplate)
          .replace(_this.escapeRegExp('$RepresentationID$'), representationSelector);

        mediaUrlSegment.urlTemplate = mediaUrlTemplate.replace('$RepresentationID$', maxRepresentationId);
        mediaUrlSegment.matchingFileName =
          _this.getFileName(mediaUrlTemplate).replace('$RepresentationID$', maxRepresentationId);
        mediaUrlSegment.matchingUrl = _this.escapeRegExp(mediaUrlTemplate)
          .replace(_this.escapeRegExp('$Number$'), '(\\d+)')
          .replace(_this.escapeRegExp('$RepresentationID$'), representationSelector);

        segments.push(initialUrlSegment, mediaUrlSegment);
      });

      console.info('SEGMENTS', segments);
      return segments;
    },

    getManifest: function () {
      var _this = this;

      return this.xhrGet(this.getPlayer().getSrc())
        .then(function (xml) {
          _this.sendNotification('manifestLoaded');
          return $($.parseXML(xml));
        })
        .catch(function (reason) {
          console.error('FAILED LOADING MANIFEST');
          _this.sendNotification('manifestError', reason);
        });
    },

    getLls: function () {
      return this.lls ? Q(this.lls) : this.requestLls();
    },

    requestLls: function () {
      var _this = this;
      var requestedStorageSize = this.getConfig('requestedStorageSize');

      return this.llsPromise || (this.llsPromise = new LargeLocalStorage({
        size: requestedStorageSize,
        name: this.getConfig('contentId')
      }).initialized
        .then(function (lls) {
          var capacity = lls.getCapacity();
          console.info('INITIALIZED LLS WITH CAPACITY:', capacity);

          if (capacity !== requestedStorageSize) {
            return Q.reject(lls);
          }

          return lls;
        })
        .catch(function () {
          _this.llsPromise = null;
          _this.sendNotification('userFsDenial');
          console.error('ERROR CREATING LLS. USER DENIAL.');
        }));
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
        var obj = JSON.parse(jsonStr);
        obj.filesMapping = obj.filesMapping.map(function (mapping) {
          return $.extend(mapping, {
            urlRegExp: new RegExp(mapping.url)
          });
        });

        return obj;
      });
    },

    setMetadataForEntry: function (entry) {
      return this.getLls().then(function (lls) {
        return lls.setAttachment(entry.id, 'metadata.json', JSON.stringify(entry));
      });
    },

    reportUsage: function () {
      var _this = this;

      return this.getUsageAndQuota()
        .then(function (usage) {
          _this.sendNotification('fsUsageSuccess', usage);
        })
        .catch(function (error) {
          _this.sendNotification('fsUsageError', error);
        });
    },

    getUsageAndQuota: function () {
      var deferred = Q.defer();

      navigator.persistentStorage.queryUsageAndQuota(function (byteUsed, byteCap) {
        deferred.resolve({
          used: byteUsed,
          free: (byteCap - byteUsed),
          total: byteCap
        });
      }, function (error) {
        deferred.reject(error);
      });

      return deferred.promise;
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
            response.reject({
              status: request.status
            });
          }
        }
      };

      request.send('');

      return response.promise;
    },

    sendNotification: function (type, data) {
      this.getPlayer().sendNotification(this.getConfig('notificationName'), {
        data: data,
        type: type
      });
    },

    escapeRegExp: function (str) {
      return str.trim().replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, '\\$&');
    },

    updateUI: function () {
      var $component = this.getComponent();

      if (this.entryMetadata) {
        $component
          .addClass('icon-checkmark')
          .removeClass('icon-download');
      } else {
        $component
          .addClass('icon-download')
          .removeClass('icon-checkmark');
      }
    }
  }));
})(window.mw, window.$, window.LargeLocalStorage, window.Q);