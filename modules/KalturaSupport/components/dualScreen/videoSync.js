(function ( mw, $ ) {
    "use strict";
    mw.dualScreen = mw.dualScreen || {};

    mw.dualScreen.videoSync = mw.KBasePlugin.extend({
        isSyncDelay: false,
        skipSyncDelay: false,
        eventListeners: {},

        setup: function () {
            this.addBinding();
        },
        isSafeEnviornment: function () {
            return !( "mediaGroup" in document.createElement("video") );
        },
        addBinding: function(){
            var _this = this;

            this.bind("bufferStartEvent", function () {
                _this.log("bufferStartEvent");
                //start timer. if buffering is more than a second -> pause the slave video
            });

            this.bind("bufferEndEvent", function () {
                _this.log("bufferEndEvent");
                //kill the timer (if exists and resume the slave video
            });
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
            }).filter(function( val, i, array ) {
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
            var canPlay = function canPlay() {
                if ( ++ready >= slaves.length && !controller.buffering ) {
                    // Now that it is safe to play the video
                    var isPlaying = controller.isPlaying();
                    slaves.forEach(function (slave) {
                        isPlaying ? slave.play() : slave.pause();
                    });

                    // this.mediaGroupSync(controller, slaves);
                }
            }.bind(this);

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
            var eventsMap = {
                onplay: function () {
                    slaves.forEach(function (slave) {
                        mw.log("DualScreen :: videoSync :: onplay :: slave.play");
                        slave.play();
                    });
                },
                onpause: function () {
                    slaves.forEach(function(slave){
                        mw.log("DualScreen :: videoSync :: onpause :: slave.pause");
                        slave.pause();
                    });
                },
                timeupdate: function () {
                    if (this.isSyncDelay) {
                        console.info('skipping timeupdate', this.getMasterCurrentTime(controller));
                        return;
                    }

                    var now = Date.now();
                    if (((now - lastSync) > synchInterval) || controller.paused) {
                        lastSync = now;
                        this.mediaGroupSync(controller, slaves);
                    }
                }.bind(this),
                seeking: function () {
                    console.info('master seeking', controller.currentSeekTargetTime);
                    var _this = this;
                    slaves.forEach(function(slave){
                        mw.log("DualScreen :: videoSync :: seeking :: slave.pause (FLASH ONLY -> isSyncDelay = true)");
                        slave.pause();
                        if ( slave.isFlash ) {
                            _this.isSyncDelay = true; // manually trigger syncDelay, so we won't sync the slave till the master will fire seeked
                        }
                    });
                }.bind(this),
                seeked: function () {
                    controller.flashCurrentTime = this.getMasterCurrentTime(controller);
                    controller.updatePlayheadStatus();
                    console.info('master seeked', this.getMasterCurrentTime(controller));
                    var _this = this;
                    // this.mediaGroupSync(controller, slaves);

                    slaves.forEach(function (slave) {
                        mw.log("DualScreen :: videoSync :: seeked :: slave.play (FLASH ONLY -> isSyncDelay = false)");
                        if (slave.isFlash) {
                            _this.isSyncDelay = false; // manually reset syncDelay
                        }
                    });

                    if ( !controller.paused ) {
                        slaves.forEach(function (slave) {
                            slave.play();
                        });
                    }
                }.bind(this),
                ended: function () {
                    this.mediaGroupSync(controller, slaves);
                    slaves.forEach(function(slave){
                        mw.log("DualScreen :: videoSync :: ended :: slave.pause + seek to 0.01");
                        slave.pause();
                        slave.setCurrentTime(0.01);
                    });
                }.bind(this),
                bufferStartEvent: function () {
                    if (controller.seeking || !controller.isPlaying()) {
                        return;
                    }

                    console.info('buffer start');
                    clearTimeout(bufferTimerId);

                    bufferTimerId = setTimeout(function () {
                        slaves.forEach(function (slave) {
                            slave.pause();
                        });

                        bufferTimerId = -1;
                    }, 1000);
                },
                bufferEndEvent: function () {
                    if (controller.seeking) {
                        return;
                    }

                    console.info('buffer end');

                    clearTimeout(bufferTimerId);
                    if (bufferTimerId < 0 && controller.isPlaying()) {
                        slaves.forEach(function (slave) {
                            slave.play();
                        });
                    }

                    bufferTimerId = null;
                }
            };

            $(controller).on(eventsMap);
            this.eventListeners[controller.kMediaGroup] = eventsMap;
        },
        mediaGroupSync: function( controller, slaves ) {
            if ( this.isSyncDelay ) {
                return;
            }
            var synchDelayThresholdPositive = 0.05;
            var synchDelayThresholdNegative = (-0.05);
            var maxGap = 4;
            var seekAhead = 0.25; // s

            if ( slaves.length ) {
                slaves.forEach(function( slave ) {
                    if ( slave.isFlash && slave.isSeeking() ) {
                        console.info('slave seeking');
                        return;
                    }

                    this.log("Check slave sync");

                    var doSeek = false;
                    var synchDelay = this.getSyncDelay(controller, slave);
                    this.log("synchDelay is " + synchDelay);
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
                                this.log("Adjusting slave playbackRateChange = " + (controller.playbackRate + playbackRateChange));
                                // set a slower playback rate for the video to let the master video catch up
                                slave.playbackRate = (controller.playbackRate + playbackRateChange);
                            } else {
                                this.log("Adjusting slave playbackRateChange to controller and flagging for seek");
                                // set playback rate back to normal
                                slave.playbackRate = controller.playbackRate;
                                // mark for seeking
                                doSeek = true;
                            }
                        }
                        // everything is fine
                        else if (!controller.paused) {
                            this.log("Controller and slave sync, adjusting slave playback rate to master");
                            // set playback rate back to normal
                            slave.playbackRate = controller.playbackRate;
                            // play the video
                            slave.play();
                        }
                    }

                    // if marked for seeking
                    if (doSeek) {
                        this.log("DualScreen :: videoSync :: mediaGroupSync :: Seeking slave to " + (this.getMasterCurrentTime(controller) + seekAhead));
                        this.seekSlave(slave, controller, this.getMasterCurrentTime(controller), !slave.isABR() ? seekAhead : 0);
                        // slave.setCurrentTime(controller.currentTime + seekAhead);
                    }

                }.bind(this));
            }
        },
        seekSlave: function (slave, player, seekTime, aheadTime) {
            seekTime = seekTime < 0 ? 0 : seekTime;
            console.info('slave seeking', seekTime, aheadTime);

            var _this = this;
            var playing = player.isPlaying();

            if (slave.isFlash) {
                $(slave).one('seeked', function (event, value) {
                    console.info('slave seeked', value);
                    clearTimeout(seekTimeoutId);
                    if (!seekTimeoutId) {
                        // it can happen that slave seeks not exactly to the
                        // required seek time. that's why we have to play slave
                        // and wait up till current times are in sync
                        var diff = value - seekTime;
                        if (diff < 0 && Math.abs(diff) > aheadTime) {
                            console.info('diff > aheadTime. syncing.', diff, aheadTime);
                            $(slave).on('timeupdate', function onTimeUpdate(event, newTime) {
                                var newDiff = newTime - seekTime;
                                if (newDiff > 0 || Math.abs(newDiff) <= aheadTime) {
                                    console.info('slave timeupdate', newTime, newDiff);
                                    $(this).off('timeupdate', onTimeUpdate);
                                    player.hideSpinner();
                                    player.enablePlayControls();
                                    player.triggerHelper('dualScreenEnableView');
                                    _this.isSyncDelay = false;
                                    playing && player.play();
                                    !playing && slave.pause();
                                }
                            });

                            slave.stopAfterSeek = false;
                            slave.stopPlayAfterSeek = true;
                            slave.play();
                            _this.isSyncDelay = true;
                        } else {
                            player.hideSpinner();
                            player.enablePlayControls();
                            player.triggerHelper('dualScreenEnableView');
                            playing && player.play();
                        }
                    }
                });

                var seekTimeoutId = setTimeout(haltMasterAndWaitForSlaves, aheadTime * 1000);
            }

            slave.setCurrentTime(seekTime + aheadTime);

            function haltMasterAndWaitForSlaves() {
                if (slave.isSeeking()) {
                    console.info('halting master');
                    if (playing) {
                        player.pause();
                        slave.isABR() && slave.play();
                    }

                    player.addPlayerSpinner();
                    player.disablePlayControls();
                    player.triggerHelper('dualScreenDisableView');
                    seekTimeoutId = null;
                }
            }
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
        }
    });
})(window.mw, window.jQuery);