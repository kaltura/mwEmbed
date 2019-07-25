(function (mw, $, kWidget) {
    "use strict";
    mw.streamSelectorUtils = mw.streamSelectorUtils || {};

    mw.streamSelectorUtils.selector = mw.KBaseComponent.extend({

        defaultConfig: {
            "defaultStream": 1,
            "maxNumOfStream": 4,
            "ignoreTag": null
        },

        streams: null,
        streamsReady: null,
        streamEnded: false,
        readyAndHasStreams: null,
		streamChanging: false,

        setup: function () {
            // we have to manually reset streams array because
            // class.js copies the value by reference from prototype
            this.streams = [];
            this.addBindings();
            this.readyAndHasStreams = $.Deferred();
        },
        destroy: function () {
            this._super();
            this.getComponent().remove();
        },
        addBindings: function () {
            var _this = this;

            this.bind('StreamListReady', function () {
                //Indicate that the streams are ready to enable spinning animation on source switching
                _this.streamsReady = true;
                //Insert original entry to streams
                _this.streams.splice(0, 0, {
                    id: _this.getPlayer().kentryid,
                    data: {
                        meta: _this.getPlayer().kalturaPlayerMetaData,
                        contextData: _this.getPlayer().kalturaContextData
                    }
                });
                _this.currentStream = _this.getDefaultStream();

                if (_this.getPlayer().kentryid !== _this.currentStream.id) {
                    _this.setStream(_this.currentStream);
                }
                if (_this.streams.length > 1) {
                    _this.readyAndHasStreams.resolve();
                } else {
                    _this.readyAndHasStreams.reject();
                }
            });

            this.bind("ended", function () {
                _this.streamEnded = true;
            });

            this.bind("onplay onChangeStreamDone", function () {
                _this.streamEnded = false;
            });

            this.bind('changeStream', function (e, arg) {
                _this.externalSetStream(arg);
            });
            
            this.bind('onChangeMedia', function () {
                if (!_this.streamChanging){
                    _this.streams = [];
                    _this.streamsReady = false;
                }
            });
        },
        getStreams: function () {
            var _this = this;
            var requestObject = [
                {
                    'service': 'baseEntry',
                    'action': 'list',
                    'filter:objectType': 'KalturaBaseEntryFilter',
                    'filter:typeEqual': 1,
                    'filter:parentEntryIdEqual': this.getPlayer().kentryid
                },
                {
                    'service': 'flavorAsset',
                    'action': 'list',
                    'filter:objectType': 'KalturaFlavorAssetFilter',
                    'filter:entryIdIn': '{1:result:objects:_all:id}'
                }
            ];            

            // do the api request
            this.getKalturaClient().doRequest(requestObject, function (data) {
                // Validate result
                if (data && _this.isValidResult(data[0] && data[0].totalCount > 0)) {
                    var groupedData = _this.groupStreamList(data)
                    _this.createStreamList([data[0]].concat(groupedData));
                } else {
                    mw.log('streamSelectorUtil::Error retrieving streams, disabling component');
                    _this.readyAndHasStreams.reject();
                }
            });
        },
        groupStreamList: function (data) {
            var grouped = {};
            var result = [];
            if (data[1] && Array.isArray(data[1].objects)) {
                grouped = data[1].objects.reduce(function(prev, next) {
                    if (prev[next.entryId]) {
                        prev[next.entryId] = prev[next.entryId].concat([next])
                    } else {
                        prev[next.entryId] = [next]
                    }
                    return prev
                }, {})
            }
            for (var key in grouped) {
                if (grouped.hasOwnProperty(key)) {
                    result.push({
                        objectType: "KalturaFlavorAssetListResponse",
                        objects: grouped[key],
                        totalCount: grouped[key].length
                    });
                }
            }
            if (result.length > 4) {
                result.length = 4;
            }
            return result;
        },
        createStreamList: function (data) {
            var _this = this;
            var subStreams = data[0].objects;
            var subStreamsData = data.slice(1);
            if (subStreams && subStreams.length > 0) {
                var ignoreTag = this.getConfig('ignoreTag');
                $.each( subStreams, function ( i, subStream ) {
                    if (subStreamsData[i] &&
                        !(ignoreTag && subStream.tags && subStream.tags.indexOf(ignoreTag) > -1)) {
                        _this.streams.push( {
                            id: subStream.id,
                            data: {
                                meta: subStream,
                                contextData: {
                                    flavorAssets: subStreamsData[i].objects
                                }
                            }
                        } );
                    }
                } );
            } else {
                mw.log('streamSelectorUtil::No streams avaialble');
            }
            _this.embedPlayer.triggerHelper('StreamListReady');
        },
        isValidResult: function (data) {
            // Check if we got error
            if (!data || ( data.code && data.message ) ) {
                var msg = data.message ? ': ' + data.message : '.';
                mw.log('streamSelectorUtil::Error, invalid result' + msg);
                this.error = true;
                return false;
            }
            this.error = false;
            return true;
        },

        getNextStream: function () {
            if (this.streams[this.getCurrentStreamIndex() + 1]) {
                return this.streams[this.getCurrentStreamIndex() + 1];
            }
            return this.streams[this.getCurrentStreamIndex()];
        },
        getPrevStream: function () {
            if (this.streams[this.getCurrentStreamIndex() - 1]) {
                return this.streams[this.getCurrentStreamIndex() - 1];
            }
            return this.streams[this.getCurrentStreamIndex()];
        },
        getDefaultStream: function () {
            return this.streams[(this.getConfig('defaultStream') - 1)];
        },
        getCurrentStreamIndex: function () {
            var _this = this;
            var index = null;
            $.each(this.streams, function (idx, stream) {
                if (_this.currentStream == stream) {
                    index = idx;
                    return false;
                }
            });
            return index;
        },
        externalSetStream: function (id) {
            var stream = this.streams[id];
            if (stream) {
                this.setStream(stream);
                this.setActiveMenuItem();
            } else {
                this.log("Error - invalid stream id");
            }
        },
        setStream: function (stream, pauseAfterwards) {
            this.log("set stream");
            if (this.currentStream !== stream) {
                var _this = this;
                var embedPlayer = this.getPlayer();
                this.streamChanging = true;
                embedPlayer.triggerHelper('onChangeStream', [_this.currentStream.id]);
                //Set reference to active stream
                this.currentStream = stream;
                //Get reference for current time for setting timeline after source switch
                var currentTime = embedPlayer.getPlayerElementTime();
                //Check if stream ended, and ignore current time data if so
                if (this.streamEnded) {
                    currentTime = 0;
                }
                //Save current autoplay state to return it after switching
                var origAutoplay = embedPlayer.autoplay;
                //When switching stream always start playing
                embedPlayer.autoplay = true;

                //Freeze scrubber and time labels to exhibit seamless transition between streams
                if (currentTime > 0) {
                    embedPlayer.triggerHelper("freezeTimeIndicators", [true]);
                }
                embedPlayer.stopEventPropagation();

                var checkPlayerSourcesFunction = function (callback) {
                    //Create source data from raw data
                    var sources = kWidgetSupport.getEntryIdSourcesFromPlayerData(embedPlayer.kpartnerid, stream.data);
                    //handle player data mappings to embedPlayer and check for errors
                    kWidgetSupport.handlePlayerData(embedPlayer, stream.data);
                    //Replace sources
                    embedPlayer.replaceSources(sources);

                    //Update player metadata and poster/thumbnail urls
                    embedPlayer.kalturaPlayerMetaData = stream.data.meta;
                    //Do not show poster on switch to avoid poster flashing
                    mw.setConfig('EmbedPlayer.HidePosterOnStart', true);
                    embedPlayer.triggerHelper('KalturaSupport_EntryDataReady', embedPlayer.kalturaPlayerMetaData);
                    //Reinit the kCuePoints service
                    if( (embedPlayer.rawCuePoints && embedPlayer.rawCuePoints.length > 0)) {
                        embedPlayer.kCuePoints = new mw.KCuePoints( embedPlayer );
                        embedPlayer.triggerHelper('KalturaSupport_CuePointsReady', [embedPlayer.rawCuePoints]);
                    }
                    callback();
                };

                var nativeStreamSelector = embedPlayer.plugins['streamSelector'];
                var onSeeked = function () {
                    //Unfreeze scrubber and time labels after transition between streams
                    embedPlayer.triggerHelper("freezeTimeIndicators", [false]);
                    //emove the black screen afteer seek has ended
                    embedPlayer.removeBlackScreen();
                    //Return poster to allow display of poster on clip done
                    mw.setConfig('EmbedPlayer.HidePosterOnStart', false);
                    _this.streamChanging = false;
                    nativeStreamSelector && (nativeStreamSelector.streamChanging = false);
                    embedPlayer.triggerHelper('onChangeStreamDone', [_this.currentStream.id]);

                    if (pauseAfterwards) {
                        embedPlayer.pause();
                    }
                };

                var changeMediaCallback = function () {
                    //Return autoplay state to original
                    embedPlayer.autoplay = origAutoplay;
                    //If player is still not playing then start playback
                    if (!embedPlayer.isPlaying()){
                        embedPlayer.play();
                    }
                    embedPlayer.restoreEventPropagation();
                    // issue a seek
                    if (currentTime > 0) {
                        //Add black screen before seek to avoid flashing of video
                        embedPlayer.addBlackScreen();

                        var postFix = '.streamSelectorUtilsChangeMedia';
                        if (embedPlayer.instanceOf === 'Kplayer' && embedPlayer.streamerType === 'hls') {
                            embedPlayer.unbindHelper('playing' + postFix).bindOnceHelper('playing' + postFix, function () {
                                embedPlayer.unbindHelper('seeked' + postFix).bindOnceHelper('seeked' + postFix, onSeeked);
                                embedPlayer.seek(currentTime, false);
                            }, true);
                        } else if (embedPlayer.isFlavorSwitching) {
                            // wait until flavor is changed
                            // TODO: create special event for EmbedPlayer::playerSwitchSource callback
                            embedPlayer.unbindHelper('seeked' + postFix + '1').bindOnceHelper('seeked' + postFix + '1', function () {
                                embedPlayer.unbindHelper('seeked' + postFix).bindOnceHelper('seeked' + postFix, onSeeked);
                                embedPlayer.seek(currentTime, false);
                            });
                        } else {
                            embedPlayer.unbindHelper('seeked' + postFix).bindOnceHelper('seeked' + postFix, onSeeked);
                            embedPlayer.seek(currentTime, false);
                        }
                    } else {
                        //Return poster to allow display of poster on clip done
                        mw.setConfig('EmbedPlayer.HidePosterOnStart', false);
                        embedPlayer.triggerHelper( "onPlayerStateChange", ["play"] );
                        embedPlayer.triggerHelper('onChangeStreamDone', [_this.currentStream.id]);

                        if (pauseAfterwards) {
                            embedPlayer.pause();
                        }
                    }
                };

                if (nativeStreamSelector) {
                    var newStream = $.grep(nativeStreamSelector.streams, function (s) {
                        return s.id === stream.id;
                    })[0];

                    nativeStreamSelector.streamChanging = true;
                    if (newStream) {
                        nativeStreamSelector.currentStream = newStream;
                        nativeStreamSelector.setActiveMenuItem();
                    }
                }

                embedPlayer.changeMedia(changeMediaCallback, checkPlayerSourcesFunction, false);
            } else {
                this.log("selected stream is already the active stream");
            }
        },
        getComponent: function () {
            var _this = this;
            if (!this.$el) {
                this.$el = $('<div />');
            }
            return this.$el;
        }
    });

})(window.mw, window.jQuery, kWidget);