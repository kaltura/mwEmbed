(function (mw, $) {
    'use strict';

    mw.dualScreen = mw.dualScreen || {};
    mw.dualScreen.StreamUtils = mw.KBasePlugin.extend({
        defaultConfig: {
            streamSelectorConfig: {}
        },

        streamSelectorPromise: null,
        playerReadyFlag: false,
        streamChanging: false,
        streams: null,

        setup: function setup() {
            this.streams = null;
            this.addBindings();
        },

        addBindings: function addBindings() {
            var _this = this;

            this.bind('playerReady', function onPlayerReady() {
                _this.playerReadyFlag = true;
            });

            this.bind('onChangeStream', function onChangeStream() {
                _this.streamChanging = true;
            });

            this.bind('onChangeStreamDone', function onChangeStreamDone() {
                _this.streamChanging = false;
            });

            this.bind('onChangeMedia', function onChangeMedia() {
                if (!_this.streamChanging) {
                    _this.log('resetting playerReadyFlag');
                    _this.playerReadyFlag = false;
                    _this.embedPlayer.unbindHelper('.streamUtilsSetStream');
                }
            });
        },

        setStream: function setStream(stream, pauseAfterwards, afterFirstPlay) {
            if (afterFirstPlay) {
                var player = this.getPlayer();
                var _this = this;
                stream && player.bindHelper('firstPlay.streamUtilsSetStream AdSupport_preSequenceComplete.streamUtilsSetStream', function () {
                    player.unbindHelper('.streamUtilsSetStream');
                    $.when(_this.getStreamSelector().then(function (streamSelector) {
                        return streamSelector.setStream(stream, pauseAfterwards);
                    }));
                });
            } else {
                return $.when(stream && this.getStreamSelector().then(function (streamSelector) {
                    return streamSelector.setStream(stream, pauseAfterwards);
                }));
            }
        },

        filterStreamsByTag: function filterStreamsByTag(tag, not) {
            return this.getStreams().then(function (streams) {
                return streams.filter(function (stream) {
                    var tags = stream.data.meta.tags || '';
                    var hasTag = tags.indexOf(tag) > -1;
                    return not ? !hasTag : hasTag;
                });
            });
        },

        getStreams: function getStreams() {
            var _this = this;
            return $.when(this.streams || this.getStreamSelector()
                .then(function (streamSelector) {
                    return (_this.streams = streamSelector.streams);
                }));
        },

        getPlayableStreamsForSecondPlayer: function getPlayableStreamsForSecondPlayer(secondPlayer) {
            var _this = this;

            return this.getStreams()
                .then(function (streams) {
                    var primaryPlayerStreamId = _this.getPlayer().evaluate('{mediaProxy.entry.id}');
                    var secondPlayerStreamId = secondPlayer &&
                        secondPlayer.stream &&
                        secondPlayer.stream.id;

                    var filteredStreams = streams
                        .filter(function (stream) {
                            return stream.id !== primaryPlayerStreamId &&
                                stream.id !== secondPlayerStreamId;
                        });

                    var videoUrlPromises = filteredStreams
                        .map(function (stream) {
                            return _this.getStreamUrl(stream);
                        });

                    return $.when.apply($, videoUrlPromises)
                        .then(function () {
                            var videoUrls = Array.prototype.slice.call(arguments);
                            return filteredStreams
                                .map(function (stream, index) {
                                    return $.extend({}, stream, {
                                        type: 'video',
                                        url: videoUrls[index],
                                        thumbnailUrl: stream.data.meta.thumbnailUrl
                                    });
                                })
                                .filter(function (stream) {
                                    return stream.url;
                                });
                        });
                });
        },

        getStreamSelector: function getStreamSelector() {
            return this.streamSelectorPromise || (this.streamSelectorPromise = this.loadStreamSelector());
        },

        loadStreamSelector: function loadStreamSelector() {
            var _this = this;
            var streamSelector = new mw.streamSelectorUtils.selector(this.getPlayer(), function () {
                this.setConfig(_this.getConfig('streamSelectorConfig'));
                this.getStreams();
            }, 'streamSelectorUtils');

            return streamSelector.readyAndHasStreams.promise()
                .then(function () {
                    return streamSelector;
                })
                .fail(function () {
                    _this.log('unable to load streamSelector');
                });
        },

        getStreamUrl: function getStreamUrl(stream) {
            var _this = this;
            var streamerType = mw.getConfig('streamerType');

            return this.getSource().then(function (source) {
                if (source.src.indexOf('m3u8') > 0 || (streamerType && streamerType !== 'http')) {
                    return _this.getStreamAdaptiveUrl(source, stream);
                } else {
                    return _this.getStreamProgressiveUrl(source, stream);
                }
            });
        },

        getStreamAdaptiveUrl: function getStreamAdaptiveUrl(source, stream) {
            // OSMF-HLS and HDS
            // TODO: make HDS work.
            // as for now slave video doesn't run as HDS
            // (flash loads mp4 progressive download)
            var relevantFlavors = stream.data.contextData.flavorAssets.filter(function (flavor) {
                return flavor.tags.indexOf('ipadnew') !== -1;
            });

            if (!relevantFlavors.length) {
                return;
            }

            var entryId = this.getPlayer().evaluate('{mediaProxy.entry.id}');
            var newFlavors = relevantFlavors.map(function (flavor) {
                return flavor.id;
            }).join(',');

            return source.src
                .replace(entryId, stream.id)
                .replace(source.flavors, newFlavors);
        },

        getStreamProgressiveUrl: function getStreamProgressiveUrl(source, stream) {
            var assetId = this.findClosestPlayableFlavor(source, stream);
            if (!assetId) {
                return;
            }

            var entryId = this.getPlayer().evaluate('{mediaProxy.entry.id}');
            var src = source.src
                .replace(entryId, stream.id)
                .replace(source.assetid, assetId);

            if (this.getPlayer().instanceOf === 'Kplayer') {
                src = src
                    .replace('/format/url/', '/format/http/')
                    .replace('/a.mp4', '/a/a.f4m')
            }

            return src;
        },

        findClosestPlayableFlavor: function (source, stream) {
            var sourceTags = source.tags.split(',');
            var relevantFlavors = stream.data.contextData.flavorAssets.filter(function (flavor) {
                return sourceTags.every(function (tag) {
                    return flavor.tags.split(',').indexOf(tag) !== -1;
                });
            });

            if (!relevantFlavors.length) {
                return;
            }

            var sourceBitrate = source.getBitrate();
            var selectedFlavor = relevantFlavors.sort(function (flavorA, flavorB) {
                var diffA = Math.abs(sourceBitrate - flavorA.bitrate);
                var diffB = Math.abs(sourceBitrate - flavorB.bitrate);
                return diffA - diffB;
            })[0];

            this.log('source bitrate = ' + sourceBitrate);
            this.log('selected source bitrate = ' + selectedFlavor.bitrate);

            return selectedFlavor.id;
        },

        getSource: function getSource() {
            var player = this.getPlayer();

            return $.when(player.mediaElement.selectedSource ||
                this.waitForPlayerReady()
                    .then(function () {
                        return player.mediaElement.selectedSource;
                    }));
        },

        waitForPlayerReady: function waitForPlayerReady() {
            var _this = this;
            var deferred = $.Deferred();

            if (this.getPlayer().getError()) {
                deferred.reject();
            } else if (this.playerReadyFlag) {
                deferred.resolve(this.getPlayer());
            } else {
                this.bind('playerReady', function  oncePlayerReady() {
                    if (_this.getPlayer().getError()) {
                        deferred.reject();
                    } else {
                        deferred.resolve(_this.getPlayer());
                    }
                }, true);
            }

            return deferred.promise();
        },

        isAutoBitrate: function isAutoBitrate() {
            var streamerType = mw.getConfig('streamerType');

            return this.getSource().then(function (source) {
                return (source && source.src.indexOf('m3u8') > 0) || (streamerType && streamerType !== 'http');
            });
        },

        log: function log(msg) {
            mw.log('DualScreen :: streamUtils :: ' + msg);
        },

        destroy: function destroy() {
            this.streamSelectorPromise && this.getStreamSelector().then(function (streamSelector) {
                streamSelector.destroy();
            });

            this._super();
            this.embedPlayer.unbindHelper('.streamUtilsSetStream');
        }
    });
})(window.mw, window.jQuery);