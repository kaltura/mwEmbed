( function( mw, $ ) {"use strict";

    mw.PluginManager.add( 'liveCore', mw.KBasePlugin.extend({

        firstPlay : false,
        /**
         * API requests interval for updating live stream status (Seconds).
         * Default is 30 seconds, to match server's cache expiration
         */
        liveStreamStatusInterval : 10,

        // Default DVR Window (Seconds)
        defaultDVRWindow : 30 * 60,

        onAirStatus: true,

        defaultConfig: {
            //time in ms to wait before displaying the offline alert
            offlineAlertOffest: 1000,
            //disable the islive check (force live to true)
            disableLiveCheck: false,
            //hide live indicators when playing offline from DVR
            hideOfflineIndicators: false,
            //hide currentTimeLabel when livestream is not DVR
            hideCurrentTimeLabel: true,
            //show thumbnail if livestream becomes offline
            showThumbnailWhenOffline : false
        },

        /**
         * (only for iOS) indicates we passed the dvr window size and once we will seek backwards we should reAttach timUpdate events
         */
        shouldReAttachTimeUpdate: false,

        playWhenOnline:false,

        /**
         * In native HLS playback we don't get duration so we set it to maximum "currentTime" value
         */
        maxCurrentTime: 0,

        /**
         * indicates that we've received the first live status update
         */
        liveStreamStatusUpdated : false,


        setup: function() {
            this.addPlayerBindings();
            this.extendApi();
        },
        /**
         * Extend JS API to match the KDP
         */
        extendApi: function() {
            var _this = this;

            this.getPlayer().isOffline = function() {
                return !_this.onAirStatus;
            }
        },

        addPoster: function(){
            this.getPlayer().removePosterFlag = false;
            this.getPlayer().updatePosterHTML();
        },

        removePoster: function(){
            this.getPlayer().removePoster();
            this.getPlayer().removePosterFlag = true;
        },

        addPlayerBindings: function() {
            var _this = this;
            var embedPlayer = this.getPlayer();

            this.bind( 'checkIsLive', function( e, callback ) {
                _this.getLiveStreamStatusFromAPI( callback );
            });

            this.bind( 'playerReady', function() {
                _this.onAirStatus = true;
                _this.isLiveChanged();
            } );

            this.bind( 'onpause', function() {
                if ( embedPlayer.isLive() && _this.isDVR() && _this.switchDone ) {
                    embedPlayer.addPlayerSpinner();
                }
            } );

            this.bind( 'onChangeMedia', function() {
                if ( _this.onProgress ) {
                    var vid = embedPlayer.getPlayerElement();
                    vid.removeEventListener('progress', _this.onProgress);
                    _this.onProgress = null;
                }
            } );

            this.bind('firstPlay', function () {
                _this.firstPlay = true;
                if ( _this.isNativeHLS() && embedPlayer.isLive() && _this.isDVR() ) {
                    _this.onProgress = function () {
                        var seekable = vid.seekable;
                        if(seekable.length > 0) {
                            var seekableEnd = seekable.end(seekable.length - 1);
                            embedPlayer.setDuration(seekableEnd);
                        }
                    };
                    var vid = embedPlayer.getPlayerElement();
                    vid.addEventListener('progress', _this.onProgress);
                }
            });

            this.bind('AdSupport_PreSequenceComplete', function () {
                _this.switchDone = true;
            } );

            this.bind( 'liveStreamStatusUpdate', function( e, onAirObj ) {

                if ( !_this.liveStreamStatusUpdated ) {
                    _this.liveStreamStatusUpdated = true;
                    if( onAirObj.onAirStatus ){
                        if ( !embedPlayer.isPlaying() ) {
                            _this.addPoster();
                        }
                        _this.getPlayer().enablePlayControls();
                    }else{
                        _this.getPlayer().disablePlayControls();
                    }
                }

                //if we moved from live to offline  - show message
                if ( _this.onAirStatus && !onAirObj.onAirStatus ) {

                    //check if kaltura live first...
                    _this.getCurrentServerTime().then (function(timeToStop) {

                        _this.offAirTime = timeToStop;

                        if (!_this.offAirInterval) {
                            _this.offAirInterval=setInterval( function() {
                                _this.offAirCheck();
                            }, 1000 );
                        }
                    })
                }  else if ( !_this.onAirStatus && onAirObj.onAirStatus ) {
                    _this.resetOffAirCheck();
                    if ( _this.getPlayer().removePosterFlag && !_this.playWhenOnline && !embedPlayer.isPlaying() ) {
                        _this.addPoster();
                    }
                    embedPlayer.layoutBuilder.closeAlert(); //moved from offline to online - hide the offline alert
                    if ( !_this.getPlayer().getError() ) {
                        _this.getPlayer().enablePlayControls();
                    }
                    embedPlayer.triggerHelper( 'liveOnline' );
                    if ( _this.playWhenOnline ) {
                        embedPlayer.play();
                        _this.playWhenOnline = false;
                    }

                    //reload livestream
                    if ( !embedPlayer.firstPlay && _this.isDVR() ) {
                        embedPlayer.disablePlayControls();
                        var shouldPause = !embedPlayer.isPlaying();
                        var playingEvtName = "seeked.backToLive playing.backToLive";
                        embedPlayer.bindHelper( playingEvtName , function() {
                            embedPlayer.unbindHelper( playingEvtName );
                            setTimeout( function() {
                                embedPlayer.enablePlayControls();
                                if ( shouldPause ) {
                                    embedPlayer.pause();
                                }
                            }, 1);

                        });

                        setTimeout( function() {
                            _this.maxCurrentTime = 0;
                            //in case player was in 'ended' state change to 'paused' state
                            embedPlayer.pauseInterfaceUpdate();
                            embedPlayer.backToLive();
                        }, 1000 );

                    }
                }

                //check for pending autoPlay
                if ( onAirObj.onAirStatus &&
                    embedPlayer.firstPlay &&
                    embedPlayer.autoplay &&
                    embedPlayer.canAutoPlay() &&
                    !embedPlayer.isInSequence() &&
                    !embedPlayer.isPlaying() ) {
                    embedPlayer.play();
                }

                _this.onAirStatus = onAirObj.onAirStatus;
            } );

            this.bind( 'durationChange', function( e, newDuration) {
                if ( _this.switchDone && embedPlayer.isLive() && _this.isDVR() && embedPlayer.paused ) {
                    //refresh playhead position
                    embedPlayer.triggerHelper( 'timeupdate', [ embedPlayer.getPlayerElementTime() ] );
                    embedPlayer.triggerHelper( 'updatePlayHeadPercent', [ embedPlayer.getPlayerElementTime() / embedPlayer.duration ] );

                }
            });

            this.bind( 'liveEventEnded', function() {
                if ( embedPlayer.isLive() && _this.isDVR() ) {
                    //change state to "VOD"
                    embedPlayer.setLive( false );
                    if ( _this.getConfig('hideOfflineIndicators') ) {
                        _this.isLiveChanged();
                    }
                    //once moving back to live, set live state again
                    embedPlayer.bindHelper( 'liveOnline', function() {
                        embedPlayer.setLive( true );
                    } );

                    if ( !_this.isNativeHLS() ) {
                        embedPlayer.bindHelper( 'ended', function() {
                            if(embedPlayer.getPlayerElement().seek){
                                embedPlayer.getPlayerElement().seek( 0 );
                            }
                        });
                    }
                }
            });

            this.bind( 'movingBackToLive', function() {
                //in case stream is shorter now (long disconnection) reset the duration
                if ( _this.isDVR() && _this.isNativeHLS() ) {
                    _this.maxCurrentTime = 0;
                }
            });
        },
        resetOffAirCheck: function() {
            if (this.offAirInterval){
                clearInterval(this.offAirInterval);
                this.offAirInterval = null;
                this.offAirTime=Infinity;
            }
        },

        offAirCheck: function() {
            var embedPlayer = this.getPlayer();

            if (this.onAirStatus ) {
                return
            }

            var isPlaying = embedPlayer.isPlaying() && !embedPlayer.buffering;
            var explicitLive= embedPlayer.evaluate("{mediaProxy.entry}").explicitLive;

            if (!explicitLive && isPlaying) {
                this.playWhenOnline=true;
                mw.log("Don't stop if we are still playing");
                return;
            }
            if (!isPlaying || embedPlayer.currentTime	 > this.offAirTime) {

                mw.log("Player position ("+new Date(1000*embedPlayer.currentTime)+") is passed offline time: "+new Date(1000*this.offAirTime)+")!!, stopping!");

                if (this.isDVR()) {
                    embedPlayer.triggerHelper('liveEventEnded');
                } else {
                    //remember last state
                    this.playWhenOnline = true;

                    if (this.getConfig('showThumbnailWhenOffline')) {
                        embedPlayer.hideSpinner();
                        mw.setConfig('EmbedPlayer.HidePosterOnStart', false);
                        this.addPoster();
                    } else {
                        embedPlayer.layoutBuilder.displayAlert({
                            title: embedPlayer.getKalturaMsg('ks-LIVE-STREAM-OFFLINE-TITLE'),
                            message: embedPlayer.getKalturaMsg('ks-LIVE-STREAM-OFFLINE'),
                            keepOverlay: true,
                            noButtons: true,
                            props: {
                                customAlertTitleCssClass: "AlertTitleTransparent",
                                customAlertMessageCssClass: "AlertMessageTransparent",
                                customAlertContainerCssClass: "AlertContainerTransparent"
                            }
                        });
                    }
                    this.getPlayer().disablePlayControls();
                    embedPlayer.triggerHelper('liveOffline');

                }
                this.resetOffAirCheck();
            } else {
                mw.log("Stream is offline, but player position ("+new Date(1000*embedPlayer.currentTime)+") is before offline time: "+new Date(1000*    this.offAirTime)+")");
            }
        },


        isLiveChanged: function() {
            var _this = this;
            var embedPlayer = this.getPlayer();

            //ui components to hide
            var showComponentsArr = [];
            //ui components to show
            var hideComponentsArr = [];
            _this.maxCurrentTime = 0;
            _this.liveStreamStatusUpdated = false;
            //live entry
            if ( embedPlayer.isLive() ) {
                if ( !this.getConfig("disableLiveCheck")) {
                    //the controls will be enabled upon liveStatus==true notification
                    _this.removePoster();
                    embedPlayer.disablePlayControls();
                }
                _this.addLiveStreamStatusMonitor();
                //hide source selector until we support live streams switching
                hideComponentsArr.push( 'sourceSelector' );
                embedPlayer.addPlayerSpinner();
                _this.getLiveStreamStatusFromAPI( function( onAirStatus ) {
                    if ( !embedPlayer._checkHideSpinner ) {
                        embedPlayer.hideSpinner();
                    }
                } );
                _this.switchDone = true;
                if ( embedPlayer.sequenceProxy ) {
                    _this.switchDone = false;
                }

                hideComponentsArr.push( 'durationLabel' );
                //live + DVR
                if ( _this.isDVR() && !embedPlayer.casting) {
                    _this.dvrWindow = embedPlayer.evaluate( '{mediaProxy.entry.dvrWindow}' ) * 60;
                    if ( !_this.dvrWindow ) {
                        _this.dvrWindow = _this.defaultDVRWindow;
                    }
                    showComponentsArr.push( 'scrubber' );
                    hideComponentsArr.push( 'currentTimeLabel' ); //new DVR layout: no time label, only negative live edge offset at the mousemove over the scrubber
                } else {  //live + no DVR
                    showComponentsArr.push( 'liveStatus' );
                    hideComponentsArr.push( 'scrubber', 'currentTimeLabel' );
                }
            }
            //not a live entry: restore ui, hide live ui
            else {
                embedPlayer.removePosterFlag = false;
                hideComponentsArr.push( 'liveStatus' );
                showComponentsArr.push( 'scrubber', 'durationLabel', 'currentTimeLabel' );
                if (!embedPlayer.isMobileSkin()){
                    showComponentsArr.push( 'sourceSelector' );
                }
                _this.removeLiveStreamStatusMonitor();
                _this.unbind('timeupdate');
            }

            embedPlayer.triggerHelper('onShowInterfaceComponents', [ showComponentsArr ] );
            embedPlayer.triggerHelper('onHideInterfaceComponents', [ hideComponentsArr ] );
            embedPlayer.doUpdateLayout();
        },

        isDVR: function(){
            return ( this.getPlayer().isDVR()  && this.getPlayer().isTimeUpdateSupported() );
        },

        getCurrentTime: function() {
            return this.getPlayer().getPlayerElement().currentTime;
        },

        removeMinDVRMonitor: function() {
            this.log( "removeMinDVRMonitor" );
            this.minDVRMonitor = clearInterval( this.minDVRMonitor );
        },

        /**
         * API Requests to update on/off air status
         */
        addLiveStreamStatusMonitor: function() {
            //if player is in error state- no need for islive calls
            if ( this.embedPlayer.getError() ) {
                return;
            }
            this.log( "addLiveStreamStatusMonitor" );
            var _this = this;
            this.liveStreamStatusMonitor = setInterval( function() {
                _this.getLiveStreamStatusFromAPI();
            }, _this.liveStreamStatusInterval * 1000 );
        },

        removeLiveStreamStatusMonitor: function() {
            this.log( "removeLiveStreamStatusMonitor" );
            this.liveStreamStatusMonitor = clearInterval( this.liveStreamStatusMonitor );
        },

        /**
         * Get on/off air status based on the API and update locally
         */
        getLiveStreamStatusFromAPI: function( callback ) {
            var _this = this;
            var embedPlayer = this.getPlayer();

            if ( embedPlayer.getFlashvars( 'streamerType') == 'rtmp' ) {
                if ( callback ) {
                    callback( _this.onAirStatus );
                }
                return;
            }

            if (this.getConfig("disableLiveCheck")){
                if ( callback ) {
                    callback( true );
                }
                setTimeout(function () {
                    embedPlayer.triggerHelper('liveStreamStatusUpdate', {'onAirStatus': true});
                }, 0);
                return;
            }

            var service = 'liveStream';
            //type liveChannel
            if ( embedPlayer.kalturaPlayerMetaData && embedPlayer.kalturaPlayerMetaData.type == 8 ) {
                service = 'liveChannel';
            }
            var protocol = 'hls';
            if ( embedPlayer.streamerType != 'http' ) {
                protocol = embedPlayer.streamerType;
            }

            var requestObj = {
                'service' : service,
                'action' : 'islive',
                'id' : embedPlayer.kentryid,
                'protocol' : protocol,
                'partnerId': embedPlayer.kpartnerid
            };
            if ( mw.isIOSAbove7() ) {
                requestObj.rnd = Math.random();
            }
            _this.getKalturaClient().doRequest( requestObj, function( data ) {
                var onAirStatus = false;
                if ( data === true ) {
                    onAirStatus = true;
                }
                if ( callback ) {
                    callback( onAirStatus );
                }
                embedPlayer.triggerHelper( 'liveStreamStatusUpdate', { 'onAirStatus' : onAirStatus } );
            },mw.getConfig("SkipKSOnIsLiveRequest"),function(){
                mw.log("Error occur while trying to check onAir status");
                embedPlayer.triggerHelper( 'liveStreamStatusUpdate', { 'onAirStatus' : false } );
            } );
        },

        getKalturaClient: function() {
            if( ! this.kClient ) {
                this.kClient = mw.kApiGetPartnerClient( this.embedPlayer.kwidgetid );
            }
            return this.kClient;
        },

        log: function( msg ) {
            mw.log( "LiveStream :: " + msg);
        },

        isNativeHLS: function() {
            if ( mw.isIOS() || mw.isDesktopSafari() || mw.isAndroid() || mw.isEdge()) {
                return true;
            }
            return false;
        },

        getCurrentServerTime:function() {
            var deferred = $.Deferred();

            var requestObj = {
                'service' : "system",
                'action' : 'getTime'
            };
            if ( mw.isIOSAbove7() ) {
                requestObj.rnd = Math.random();
            }
            this.getKalturaClient().doRequest( requestObj, function( data ) {
                deferred.resolve(data);
            }, function (error) {
                deferred.reject(error);
            });
            return deferred.promise();

        }

    }));

} )( window.mw, window.jQuery );
