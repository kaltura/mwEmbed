(function ( mw, $ ) {
    "use strict";
    mw.dualScreen = mw.dualScreen || {};

    mw.dualScreen.videoSync = mw.KBasePlugin.extend({

        isSyncDelay: false,
        skipSyncDelay: false,

        setup: function () {
            this.addBinding();
        },
        isSafeEnviornment: function () {
            return !( "mediaGroup" in document.createElement("video") );
        },
        addBinding: function(){
            var _this = this;
            this.bind('playerReady', function(){
                //_this.setMediaGroups();
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

            this.mediaGroupSyncEvents( controller, slaves );

            // Declare context sensitive `canplay` handler
            var canPlay = function canPlay() {

                if ( ++ready === elements.length ) {

                    // Now that it is safe to play the video, remove the handlers
                    elements.forEach(function( elem ) {
                        elem.removeEventListener( "canplay", canPlay, false );
                    });
                    this.mediaGroupSync(controller, slaves);
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

                $(elem).on( "canplay", canPlay, false );
            });
        },
        mediaGroupSyncEvents: function(controller, slaves){
            $(controller).on("onplay", function(){
                var _this = this;
                slaves.forEach(function (slave) {
                    mw.log("DualScreen :: videoSync :: onplay :: slave.play");
                    slave.play();
                    if ( slave.isFlashHLS ) {
                        if( _this.skipSyncDelay ) {
                            _this.skipSyncDelay = false;
                            return;
                        } else {
                            _this.triggerDelay();
                        }
                    }
                });
            }.bind(this));

            $(controller).on("onpause", function(){
                slaves.forEach(function(slave){
                    mw.log("DualScreen :: videoSync :: onpause :: slave.pause");
                    slave.pause();
                });
            });
            var synchInterval = 1000;
            var lastSync = 0;
            $(controller).on("timeupdate", function(){
                if ( this.isSyncDelay ) {
                    return;
                }
                var now = Date.now();
                if (((now - lastSync) > synchInterval) || controller.paused) {
                    lastSync = now;
                    this.mediaGroupSync(controller, slaves);
                }
            }.bind(this));

            $(controller).on("seeking", function(){
                var _this = this;
                slaves.forEach(function(slave){
                    mw.log("DualScreen :: videoSync :: seeking :: slave.pause (FLASH ONLY -> isSyncDelay = true)");
                    slave.pause();
                    if ( slave.isFlashHLS ) {
                        _this.isSyncDelay = true; // manually trigger syncDelay, so we won't sync the slave till the master will fire seeked
                    }
                });
            }.bind(this));

            $(controller).on("seeked", function(){
                var _this = this;
                this.mediaGroupSync(controller, slaves);
                if ( !controller.paused ) {
                    slaves.forEach(function (slave) {
                        mw.log("DualScreen :: videoSync :: seeked :: slave.play (FLASH ONLY -> isSyncDelay = false)");
                        slave.play();
                        _this.isSyncDelay = false; // manually reset syncDelay
                        _this.skipSyncDelay = true;
                    });
                }
            }.bind(this));

            $(controller).on("ended", function() {
                this.mediaGroupSync(controller, slaves);
                slaves.forEach(function(slave){
                    mw.log("DualScreen :: videoSync :: ended :: slave.pause + seek to 0.01");
                    slave.pause();
                    slave.setCurrentTime(0.01);
                });
            }.bind(this));
        },
        triggerDelay: function ( ) {
            if( this.syncInterval ) {
                this.clearSyncIntervat();
            }
            var _this = this;
            this.isSyncDelay = true;
            mw.log("DualScreen :: videoSync :: isSyncDelay = true");

            this.syncInterval = setInterval(function () {
                _this.isSyncDelay = false;
                mw.log("DualScreen :: videoSync :: isSyncDelay = false");
                _this.clearSyncIntervat();
            }, 1000);
        },
        clearSyncIntervat: function ( ) {
            clearInterval(this.syncInterval);
            this.syncInterval = null;
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
                    if ( slave.isFlashHLS && slave.isSeeking() ) {
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
                        if ( slave.isFlashHLS ){
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
                        this.log("DualScreen :: videoSync :: mediaGroupSync :: Seeking slave to " + (controller.currentTime + seekAhead));
                        slave.setCurrentTime(controller.currentTime + seekAhead);
                        if ( slave.isFlashHLS ) {
                            this.triggerDelay();
                        }
                    }

                }.bind(this));
            }
        },
        getSyncDelay: function(controller, slave) {
            var ctMaster = controller.currentTime; // current time in seconds
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
        }
    });
})(window.mw, window.jQuery);