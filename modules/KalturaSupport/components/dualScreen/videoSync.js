(function ( mw, $ ) {
    "use strict";
    mw.dualScreen = mw.dualScreen || {};

    mw.dualScreen.videoSync = mw.KBasePlugin.extend({
        setup: function () {
            this.addBinding();
        },
        isSafeEnviornment: function () {
            return !( "mediaGroup" in document.createElement("video") );
        },
        addBinding: function(){
            var _this = this;
            this.bind('playerReady', function(){
                _this.setMediaGroups();
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
                slaves.forEach(function (slave) {
                   //slave.sendNotification("doPlay");
                    slave.play();
                    //slave.currentTime = controller.currentTime;
                });
            });

            $(controller).on("onpause", function(){
                slaves.forEach(function(slave){
                    //slave.sendNotification("doPause");

                    slave.pause();
                });
            });
            var synchInterval = 1000;
            var lastSync = 0;
            $(controller).on("timeupdate", function(){
                var now = Date.now();
                if (((now - lastSync) > synchInterval) || controller.paused) {
                    lastSync = now;
                    this.mediaGroupSync(controller, slaves);
                }
            }.bind(this));

            $(controller).on("seeking", function(){
                slaves.forEach(function(slave){
                    //slave.currentTime = controller.currentTime;
                    slave.pause();
                });
            });

            $(controller).on("seeked", function(){
                this.mediaGroupSync(controller, slaves);
                if ( !controller.paused ) {
                    slaves.forEach(function (slave) {
                        slave.play();
                    });
                }
            }.bind(this));

            $(controller).on("ended", function() {
                this.mediaGroupSync(controller, slaves);
                slaves.forEach(function(slave){
                    slave.pause();
                });
            }.bind(this));
        },
        mediaGroupSync: function( controller, slaves ) {
            var synchDelayThresholdPositive = 0.05;
            var synchDelayThresholdNegative = (-0.05);
            var maxGap = 4;
            var seekAhead = 0.25; // s

            if ( slaves.length ) {
                slaves.forEach(function( slave ) {
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
                        doSeek = (Math.abs(synchDelay) > 0.5);
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
                        this.log("Seeking slave to " + (controller.currentTime + seekAhead));
                        slave.setCurrentTime(controller.currentTime + seekAhead);
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