(function (mw, $, LargeLocalStorage, Q) {
  'use strict';

  mw.PluginManager.add('offline', mw.KBaseScreen.extend({
    defaultConfig: {
      align: 'right',
      parent: 'controlsContainer',
      displayImportance: 'low',
      showTooltip: true,
      templatePath: '../offline/resources/tmpl/offline.tmpl.html',
      tooltip: 'Local media',
      order: 50,
      useInternalUI: false,
      notificationName: 'offlineAPIEvent',
      contentId: 'kOfflineStorage',
      showIndicator: true,
      requestedStorageSize: 1024 * 1024 * 1024 // in bytes, 1GB by default
    },

    iconBtnClass: 'icon-download',
    entryMetadata: null,
    templateData: {
      status: 'Downloading',
      progress: 50
    },

    setup: function () {
      navigator.persistentStorage = navigator.persistentStorage ||
        navigator.webkitPersistentStorage;
      this.overrideBindings();
      this.setBindings();
    },

    overrideBindings: function overrideBindings() {
      var _this = this;
      this.getComponent().unbind('click');
      if(this.getConfig('useInternalUI')){
        this.getComponent().click(function () {
          _this.startDownload();
        });
      }else{
        //disable mouse hand cursor
        _this.getComponent().css("cursor","default");
      }
    },

    setBindings: function () {
      var _this = this;

      if (!this.getConfig('showIndicator')) {
        this.getComponent().addClass('hide-important');
      }

      this.bind('playerReady', function () {
        var entryId = _this.getPlayer().evaluate('{mediaProxy.entry}').id;
        _this.log('PLAYER READY WITH ENTRY:', entryId);

        _this.entryMetadata = null;
        _this.updateUI();
        _this.getMetadataForEntryId(entryId)
          .then(function (metadata) {
            _this.log('METADATA LOADED:', metadata);
            _this.sendNotification('entryExists', entryId);
            _this.entryMetadata = metadata;
            _this.overrideXhr();
            _this.updateUI();
          })
          .finally(function () {
            _this.sendNotification('offlinePluginReady');
          });
      });

      this.bind('offlineStartDownload', function () {
        _this.startDownload();
      });

      this.bind('offlineDeleteLocalEntry', function (event, entryId) {
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

      if (this.getConfig('useInternalUI')) {
        this.bind(this.getConfig('notificationName'), function (event, payload) {
          var type = payload.type;
          var data = payload.data;

          if (type === 'downloadStarted') {
            _this.showScreen();
            _this.updateTemplate({
              status: 'Prepairing to download',
              progress: 0
            });
          } else if (type === 'progress') {
            _this.updateTemplate({
              progress: data
            });
          } else if (type === 'fragmentsDownloadStart') {
            _this.updateTemplate({
              status: 'Downloading...'
            });
          } else if (type === 'entryDownloadSuccess') {
            _this.updateTemplate({
              status: 'Saving...'
            });
          } else if (type === 'entrySaveFail') {
            _this.updateTemplate({
              status: 'Entry saving failed'
            });
          } else if (type === 'savedEntryData' || type === 'entrySaveSuccess') {
            _this.updateTemplate({
              status: 'Saved'
            });
          }
        });
      }
    },

    deleteLocalEntry: function (entryId) {
      var _this = this;

      entryId = entryId || (this.entryMetadata && this.entryMetadata.id);
      _this.log('DELETE LOCAL ENTRY', entryId);

      return this.getLls().then(function (lls) {
        return lls.rm(entryId).then(function () {
          if (_this.entryMetadata && _this.entryMetadata.id === entryId) {
            _this.cancelOverrideXhr();
            _this.entryMetadata = null;
            _this.updateUI();
          }
          _this.log('DELETED', entryId);
        });
      });
    },

    startDownload: function () {
      var _this = this;
      var entryId = _this.getPlayer().evaluate('{mediaProxy.entry}').id;
      this.log('START DOWNLOAD RECEIVED');

      if (_this.entryMetadata) {
        _this.sendNotification('entryExists', entryId);
        _this.log('THIS ENTRY ALREADY EXISTS');
      } else {
        _this.log('START DOWNLOADING');
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
            _this.log('CAPTURED:', mappedFile);

            _this.readAttachment(_this.entryMetadata.id, mappedFile)
              .then(function (data) {
                _this.log('CACHE HIT FOR', mappedFile);
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
                _this.log('NO CACHE HIT');
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

     this.log('URL', url, 'MAPPED TO', fileName);
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
          _this.log('DOWNLOADED SEGMENTS', downloadedSegments);
          _this.sendNotification('entryDownloadSuccess', entry.id);
          _this.saveEntry(entry, downloadedSegments);
        })
        .catch(function (error) {
          _this.sendNotification('entrySaveFail', entry.id);
          _this.log(error);
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
          _this.log('ENTRY SAVED SUCCESSFULLY!');
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
      var totalLength = 0;
      var loadedLength = 0;
      var progressMap = [];
      var progress = 0;

      return Q.all(segments.map(function (segment) {
        return _this.countSegment(segment);
      })).then(function (segments) {
        _this.sendNotification('fragmentsDownloadStart');
        totalLength = segments.reduce(function (prev, segment, segmentIndex) {
          progressMap.push([]);
          return prev + (segment.byteLength = segment.fragments.reduce(function (prev, fragment, fragmentIndex) {
            progressMap[segmentIndex].push([]);
            progressMap[segmentIndex][fragmentIndex] = 0;
            return prev + fragment.byteLength;
          }, 0));
        }, 0);

        return Q.all(segments.map(function (segment) {
          return _this.downloadSegment(segment);
        }));
      }).progress(function (e) {
        var loaded = e.value.value.loaded;
        var current = progressMap[e.index][e.value.index];
        var diff = loaded - current;
        var newProgress;

        loadedLength += diff;
        progressMap[e.index][e.value.index] = loaded;
        newProgress = Math.round(loadedLength / totalLength * 100);

        if (progress !== newProgress) {
          progress = newProgress;
          _this.sendNotification('progress', progress);
          _this.log('PROGRESS', progress + '%');
        }
      }).catch(function (error) {
        _this.sendNotification('entryDownloadFail');
        _this.log('FAILED LOADING ENTRY', error);
      });
    },

    countSegment: function (segment) {
      var _this = this;
      var deferred = Q.defer();
      var shouldIncrement = (typeof segment.startNumber === 'number');

      segment.fragments = [];
      doCountFragments(segment.urlTemplate, segment.startNumber);
      return deferred.promise;

      function doCountFragments(urlTemplate, currentNumber) {
        var fragmentUrl = urlTemplate.replace('$Number$', currentNumber);

        _this.retryXhrIfFails(function () {
          return _this.xhrGetFirstProgress(fragmentUrl, 'arraybuffer');
        }, function () {
          _this.sendNotification('fragmentHeadersRetry', fragmentUrl);
        })
        .then(function (result) {
          _this.sendNotification('fragmentHeadersSuccess', fragmentUrl);
          segment.fragments.push({
            url: fragmentUrl,
            byteLength: result.event.total
          });

          if (shouldIncrement) {
            doCountFragments(urlTemplate, ++currentNumber);
          } else {
            deferred.resolve(segment);
          }
        })
        .catch(function (errorResult) {
          if (errorResult && errorResult.status === 404) {
            deferred.resolve(segment);
          } else {
            _this.sendNotification('fragmentHeadersFail', fragmentUrl);
            deferred.reject(errorResult);
          }
        });
      }
    },

    downloadSegment: function (segment) {
      var _this = this;

      return Q.all(segment.fragments.map(function (fragment) {
        return _this.retryXhrIfFails(function () {
          return _this.xhrGet(fragment.url, 'arraybuffer');
        }, function () {
          _this.sendNotification('fragmentRetry', fragment.url);
        }).then(function (data) {
          _this.sendNotification('fragmentSuccess', fragment.url);
          fragment.data = data;
          return fragment;
        }).catch(function () {
          _this.sendNotification('fragmentFail', fragment.url);
        });
      })).then(function () {
        return segment;
      });
    },

    retryXhrIfFails: function (promiseFn, onRetryFn) {
      return promiseFn()
        .catch(function (errorResult) {
          if (errorResult && errorResult.status === 404) {
            return Q.reject(errorResult);
          }

          if (typeof onRetryFn === 'function') {
            onRetryFn();
          }

          return promiseFn();
        });
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

      _this.log('SEGMENTS', segments);
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
            _this.log('FAILED LOADING MANIFEST');
          _this.sendNotification('manifestError', reason);
        });
    },

    getLls: function () {
      return Q(this.lls || this.requestLls());
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
                _this.log('INITIALIZED LLS WITH CAPACITY:', capacity);

          if (capacity !== requestedStorageSize) {
            return Q.reject(lls);
          }

          return lls;
        })
        .catch(function () {
          _this.llsPromise = null;
          _this.sendNotification('userFsDenial');
          _this.log('ERROR CREATING LLS. USER DENIAL.');
        }));
    },

    getFileName: function (url) {
      return url.split('/').pop();
    },

    readAttachment: function (docKey, attachKey, asString) {
      var _this = this;

      return this.getLls().then(function (lls) {
        return lls.getAttachment(docKey, attachKey).then(function (file) {
          _this.log('ATTACHMENT READ SUCCESSFULLY:', docKey + '/' + attachKey, file);
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
      var _this = this;
      reader.onloadend = function () {
        if (this.readyState === FileReader.DONE) {
          _this.log('FILE READ SUCCESSFULLY:', file);
          deferred.resolve(this.result);
        } else {
          _this.log('FILE READ ERROR:', file);
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

      request.onprogress = function (e) {
        response.notify(e);
      };

      request.send('');

      return response.promise;
    },

    xhrGetFirstProgress: function (path, responseType) {
      var response = Q.defer();
      var request = new XMLHttpRequest();

      request.responseType = responseType || 'text';
      request.open('GET', path, true);
      request.onprogress = function (e) {
        var status = request.status;
        response[(status >= 200 && status < 400) ? 'resolve' : 'reject']({
          status: status,
          event: e
        });

        request.abort();
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
    },

    updateTemplate: function (params) {
      var _this = this;
      var status = (params && params.status) || '';
      var progress = params && params.progress;

      this.getScreen().then(function ($screen) {
        var $status = _this.$status ||
          (_this.$status = $($screen.find('#offlineStatus')));
        var $progress = _this.$progress ||
          (_this.$progress = $($screen.find('#offlineProgress')));

        $status.text(status || $status.text());
        $progress.val(typeof progress === 'number' ? progress : $progress.val());
      });
    }
  }));
})(window.mw, window.$, window.LargeLocalStorage, window.Q);