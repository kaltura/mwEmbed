(function ( mw, $ ) {
    "use strict";
    mw.dualScreen = mw.dualScreen || {};

    mw.dualScreen.videoSync = mw.KBasePlugin.extend({
        isSyncDelay: false,
        shouldSyncState: true,
        eventListeners: {},

        isSafeEnviornment: function () {
            return !( "mediaGroup" in document.createElement("video") );
        },
        setMediaGroups: function(groups){
            var mediagroupId = this.getPlayer().pid+"_kMediaGroup";
            this.embedPlayer.setAttribute("kMediaGroup", mediagroupId);
            this.embedPlayer.setAttribute("kMediaGroupMaster", "true");
            groups.forEach(function(element){
                $(element).attr("kMediaGroup", mediagroupId);
            });

            var nodelist = document.querySelectorAll( "[kMediaGroup]" ),
                elements = [].slice.call( nodelist ),
                filtereds = {},
                mediagroups;

            // Allow only if no `mediaGroup` property exists
            //Currently we don't support native mediaGroups. In the future, when native mediaGroups will be fully implemented in the browsers, our custom implementation might be removed
            elements = elements.filter(function (elem) {
                return !elem.mediaGroup;
            });

            // Filter for groupnames
            mediagroups = elements.map(function( elem ) {
                return elem.getAttribute( "kMediaGroup" );
            }).filter(function( val ) {
                if ( !filtereds[ val ] ) {
                    filtereds[ val ] = elements.filter(function( elem ) {
                        return elem.getAttribute( "kMediaGroup" ) === val;
                    });
                    return true;
                }
                return false;
            });

            // Iterate all collected mediagroup names
            // Call mediaGroup() with group name and nodelist params
            mediagroups.forEach(function( group ) {
                this.kMediaGroup( group, filtereds[ group ] );
            }.bind(this));
        },

        kMediaGroup: function( group, elements ) {

            var controller, slaves,
                ready = 0;

            // Get the single controller element
            controller = elements.filter(function( elem ) {
                return elem.getAttribute("kMediaGroupMaster") || !!elem.controls || elem.getAttribute("controls", true);
            })[ 0 ];

            // Filter nodelist for all elements that will
            // be controlled by the	controller element
            slaves = elements.filter(function( elem ) {
                return !elem.controls && !elem.getAttribute("kMediaGroupMaster");
            });

            if ( !controller ) {
                return;
            }

            // Declare context sensitive `canplay` handler
            function canPlay() {
                if ( ++ready >= slaves.length && !controller.buffering ) {
                    // Now that it is safe to play the video
                    var isPlaying = controller.isPlaying();
                    slaves.forEach(function (slave) {
                        isPlaying ? slave.play() : slave.pause();
                    });

                    // this.mediaGroupSync(controller, slaves);
                }
            }

            // Iterate all elements in mediagroup set
            // Add `canplay` event listener, this ensures that setting currentTime
            // doesn't throw exception (Code 11) by tripping seek on a media element
            // that is not yet seekable
            elements.forEach(function( elem ) {
                // Set the actual element IDL property `kMediaGroup`
                //Currently we don't support native mediaGroups. In the future, when native mediaGroups will be fully implemented in the browsers, our custom implementation might be removed
                elem.kMediaGroup = elem.getAttribute( "kMediaGroup" );
                $(elem).one('canplay', canPlay);
            });

            this.mediaGroupSyncEvents( controller, slaves );
        },
        mediaGroupSyncEvents: function(controller, slaves){
            var lastSync = 0;
            var synchInterval = 1000;
            var bufferTimerId;
            var _this = this;
            var eventsMap = {
                onplay: function (suppressLog) {
                    if (_this.shouldSyncState /*&& controller.isPlaying()*/) {
                        !suppressLog && _this.log("onplay :: slave.play");
                        slaves.forEach(function (slave) {
                            slave.play();
                        });
                    }
                },
                onpause: function (suppressLog) {
                    if (_this.shouldSyncState) {
                        !suppressLog && _this.log("onpause :: slave.pause");
                        slaves.forEach(function(slave){
                            slave.pause();
                        });
                    }
                },
                timeupdate: function () {
                    if (!this.isSyncDelay && this.shouldSyncState) {
                        var now = Date.now();

                        if (((now - lastSync) > synchInterval) || controller.paused) {
                            lastSync = now;
                            this.mediaGroupSync(controller, slaves);
                        }
                    } else {
                        this.log('timeupdate :: skip, master time: ' + this.getMasterCurrentTime(controller));
                    }
                }.bind(this),
                seeking: function () {
                    this.log('seeking :: master to ' + controller.currentSeekTargetTime);
                    eventsMap.onpause(true);
                    slaves.some(function(slave){
                        if ( slave.isFlash ) {
                            _this.log("seeking :: slave.pause (FLASH ONLY -> isSyncDelay = true)");
                            _this.isSyncDelay = true; // manually trigger syncDelay, so we won't sync the slave till the master will fire seeked
                        }

                        return slave.isFlash;
                    });
                }.bind(this),
                seeked: function () {
                    // fix issue when playhead is not updated after seek
                    // reproduces only with Flash progressive player
                    controller.flashCurrentTime = this.getMasterCurrentTime(controller);
                    controller.updatePlayheadStatus();
                    this.log('seeked :: master to ' + this.getMasterCurrentTime(controller));
                    // this.mediaGroupSync(controller, slaves);

                    slaves.some(function (slave) {
                        if (slave.isFlash) {
                            _this.log("seeked :: slave.play (FLASH ONLY -> isSyncDelay = false)");
                            _this.isSyncDelay = false; // manually reset syncDelay
                        }

                        return slave.isFlash;
                    });

                    eventsMap.onplay(true);
                }.bind(this),
                ended: function () {
                    slaves.forEach(function(slave){
                        _this.log("ended :: slave.pause + seek to 0.01");
                        slave.pause();
                        _this.seekSlave(slave, controller, 0, 0.01);
                    });
                },
                bufferStartEvent: function () {
                    if (controller.seeking || !controller.isPlaying()) {
                        return;
                    }

                    _this.log('bufferStartEvent :: master');
                    clearTimeout(bufferTimerId);

                    bufferTimerId = setTimeout(function () {
                        eventsMap.onpause(true);
                        bufferTimerId = -1;
                    }, 1000);
                },
                bufferEndEvent: function () {
                    if (controller.seeking) {
                        return;
                    }

                    _this.log('bufferEndEvent :: master');

                    clearTimeout(bufferTimerId);
                    if (bufferTimerId < 0) {
                        eventsMap.onplay(true);
                    }

                    bufferTimerId = null;
                },
                AdSupport_StartAdPlayback: function () {
                    _this.log('AdSupport_StartAdPlayback :: master');
                    eventsMap.onpause(true);
                    _this.shouldSyncState = false;
                },
                AdSupport_EndAdPlayback: function () {
                    _this.log('AdSupport_EndAdPlayback :: master');
                    _this.shouldSyncState = true;
                    eventsMap.onplay(true);
                }
            };

            $(controller).on(eventsMap);
            this.eventListeners[controller.kMediaGroup] = eventsMap;
        },
        mediaGroupSync: function( controller, slaves ) {
            if ( this.isSyncDelay || controller.stopped ) {
                return;
            }
            var synchDelayThresholdPositive = 0.05;
            var synchDelayThresholdNegative = (-0.05);
            var maxGap = 4;
            var seekAhead = 0.25; // s

            if ( slaves.length ) {
                slaves.forEach(function( slave ) {
                    if ( slave.isFlash && slave.isSeeking() ) {
                        this.log('mediaGroupSync :: slave is flash and seeking => skip');
                        return;
                    }

                    var doSeek = false;
                    var synchDelay = this.getSyncDelay(controller, slave);
                    this.log("mediaGroupSync :: synchDelay is " + synchDelay);
                    var playbackRateChange = 0;
                    var adaptivePlaybackRate = (Math.round(Math.abs(synchDelay) * 100)) / 100;
                    if (synchDelay > synchDelayThresholdPositive) {
                        playbackRateChange = (-1) * adaptivePlaybackRate;
                    } else if (synchDelay < synchDelayThresholdNegative) {
                        playbackRateChange = adaptivePlaybackRate;
                    }

                    if (!slave.supportsPlaybackrate) {
                        if ( slave.isFlash ){
                            doSeek = (Math.abs(synchDelay) > 1);
                        } else {
                            doSeek = (Math.abs(synchDelay) > 0.5);
                        }
                    } else if (slave.supportsPlaybackrate) {
                        if (playbackRateChange !== 0) {
                            if (Math.abs(synchDelay) < maxGap) {
                                this.log("mediaGroupSync :: Adjusting slave playbackRateChange = " + (controller.playbackRate + playbackRateChange));
                                // set a slower playback rate for the video to let the master video catch up
                                slave.playbackRate = (controller.playbackRate + playbackRateChange);
                            } else {
                                this.log("mediaGroupSync :: Adjusting slave playbackRateChange to controller and flagging for seek");
                                // set playback rate back to normal
                                slave.playbackRate = controller.playbackRate;
                                // mark for seeking
                                doSeek = true;
                            }
                        }
                        // everything is fine
                        else if (!controller.paused) {
                            this.log("mediaGroupSync :: Controller and slave sync, adjusting slave playback rate to master");
                            // set playback rate back to normal
                            slave.playbackRate = controller.playbackRate;
                            // play the video
                            slave.play();
                        }
                    }

                    // if marked for seeking
                    if (doSeek) {
                        this.log("mediaGroupSync :: Seeking slave to " + (this.getMasterCurrentTime(controller) + seekAhead));
                        this.seekSlave(slave, controller, this.getMasterCurrentTime(controller), (slave.isFlash && slave.isABR()) ? 0 : seekAhead);
                    }

                }.bind(this));
            }
        },
        seekSlave: function (slave, player, seekTime, aheadTime) {
            seekTime = seekTime < 0 ? 0 : seekTime;
            if (slave.ended && slave.duration && Math.ceil(seekTime) > slave.duration) {
                // trying to seek out of bounds after slave already ended
                // pause slave
                this.log('seekSlave :: seekTime ' + seekTime + ' is out of bounds 0..' + slave.duration + '. pause slave');
                slave.pause();
                return;
            }

            this.log('seekSlave :: seeking to=' + seekTime + ', ahead=' + aheadTime);

            var _this = this;
            var playing = player.isPlaying();

            if (slave.isFlash) {
                $(slave).one('seeked', function (event, value) {
                    _this.log('seekSlave :: seeked to ' + value);
                    clearTimeout(seekTimeoutId);
                    if (!seekTimeoutId) {
                        // it can happen that slave seeks not exactly to the
                        // required seek time. that's why we have to play slave
                        // and wait up till current times are in sync
                        var diff = value - seekTime;
                        if (diff < 0 && Math.abs(diff) > aheadTime) {
                            _this.log('seekSlave :: diff > aheadTime, have to sync. diff=' + diff + ', ahead = ' + aheadTime);
                            $(slave).on('timeupdate ended', function onTimeUpdate(event, newTime) {
                                var newDiff = newTime - seekTime;
                                var ended = event.type === 'ended';
                                if (ended || (newDiff > 0 || Math.abs(newDiff) <= aheadTime)) {
                                    _this.log('seekSlave :: slave' + (ended ? 'ended' : (' timeupdate ' + newTime + ', new diff=' + newDiff)));
                                    $(this).off('timeupdate ended', onTimeUpdate);
                                    _this.isSyncDelay = false;
                                    (!playing || ended) && slave.pause();
                                    _this.restoreMaster(player, playing);
                                }
                            });

                            slave.stopAfterSeek = false;
                            slave.stopPlayAfterSeek = true;
                            slave.play();
                            _this.isSyncDelay = true;
                        } else {
                            _this.restoreMaster(player, playing);
                        }
                    }
                });

                var seekTimeoutId = setTimeout(haltMasterAndWaitForSlaves, aheadTime * 1000);
            }

            slave.setCurrentTime(seekTime + aheadTime);

            function haltMasterAndWaitForSlaves() {
                if (slave.isSeeking()) {
                    _this.log('seekSlave :: haltMasterAndWaitForSlaves :: halting master');
                    if (playing) {
                        player.pause();
                        slave.isABR() && slave.play();
                    }

                    _this.bind('onRemovePlayerSpinner.haltMasterPostFix', function () {
                        player.addPlayerSpinner();
                    });

                    player.addPlayerSpinner();
                    player.disablePlayControls();
                    player.triggerHelper('dualScreenDisableView');
                    seekTimeoutId = null;
                }
            }
        },
        restoreMaster: function (controller, wasPlaying) {
            this.unbind('onRemovePlayerSpinner.haltMasterPostFix');
            controller.hideSpinner();
            controller.enablePlayControls();
            controller.triggerHelper('dualScreenEnableView');
            wasPlaying && controller.play();
        },
        getMasterCurrentTime: function (controller) {
            return controller.getPlayerElement().getCurrentTime ?
                controller.getPlayerElement().getCurrentTime() :
                controller.getPlayerElement().currentTime;
        },
        getSyncDelay: function(controller, slave) {
            var ctMaster = this.getMasterCurrentTime(controller); // current time in seconds
            var ct = slave.getCurrentTime(); // current time in seconds
            var syncGap = 0; // s
            if ((ctMaster != -1) && (ct != -1) && !this.isInInterval(ct, ctMaster - syncGap, ctMaster)) {
                return ct - ctMaster; // time difference
            }
            return 0; // delay is acceptable
        },
        isInInterval: function(num, lower, upper) {
            return (
                (!isNaN(num) && !isNaN(lower) && !isNaN(upper)) &&
                (lower <= upper) &&
                ((num >= lower) && (num <= upper))
            );
        },
        destroy: function () {
            $.each(this.eventListeners, function (mediaGroupId, events) {
                $('[kmediagroup="' + mediaGroupId + '"]').off(events);
            });

            this._super();
        },
        log: function (msg) {
            mw.log('DualScreen :: videoSync :: ' + msg);
        }
    });
})(window.mw, window.jQuery);