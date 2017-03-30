/**
 * Created by itayk on 09/02/17.
 */
/**
 * Created by itayk on 8/18/14.
 */
( function( mw, $ ) {"use strict";

    mw.PluginManager.add( 'adsServerStich', mw.KBasePlugin.extend({
        adDataLoaded :false,
        hasPreRoll:false,
       sessionid:null,
        seekAfterAd:-1,
        queueAdRquest:[],
        cuePoints:[],
        lastCurrentTime:0,
        trackers:[],
        shouldMonitorSeek:true,
        defaultConfig: {
            playServer : "http://dev-backend3.dev.kaltura.com"
        },
        adClickPostFix:".adsServerStich",
        setup: function(){
            this.addBindings();
        },
        addBindings: function(){
            var _this = this;

            this.bind("SourceSelected", function(event,source){
                if ( source.src.toLowerCase().indexOf("playmanifest") > -1 &&
                    source.src.toLowerCase().indexOf("sessionid/") === -1 ) {
                    if ( !_this.sessionid ){
                        _this.sessionid = Math.floor(Math.random() * 1000000000);
                    }
                    source.src = _this.injectParam(source.src,"uiconf/" + _this.embedPlayer.kuiconfid);
                    source.src = _this.injectParam(source.src,"sessionId/" + _this.sessionid);
                    source.src = _this.injectGetParam(source.src,"playerConfig=" + _this.getPlayerConfig());
                }
            });

            this.bind( "monitorEvent" , function () {
                _this.reportTrackers();
                _this.trackCuePoints();
                _this.trackQueueAds();
                _this.lastCurrentTime = _this.embedPlayer.currentTime;
            } );

            this.bind( "preSeek" , function(event,seektime,stopAfterSeek, stopSeek){
                if (_this.shouldMonitorSeek) {
                    _this.checkBeforeSeek(seektime,stopAfterSeek, stopSeek);

                }
                if (!_this.adDataLoaded) {

                    _this.waitingForAdDataToLoad = [seektime,stopAfterSeek, stopSeek];
                    stopSeek.value = true;
                    stopAfterSeek = true;
                    _this.embedPlayer.seeking = false;             
                }
                _this.shouldMonitorSeek = true;

            });

            this.bind("mediaLoaded", function(event,source) {
                var serverHostName = _this.getConfig("playServer");
                var getAdsUrl = serverHostName +  "/p/"+_this.embedPlayer.kpartnerid+"/layout/playerManifest/uiConfId/"+_this.embedPlayer.kuiconfid+"/entryId/0_v8y4bir3/flavorId/0_bp09oz39/sessionId/"+_this.sessionid+"/a.json"
                $.getJSON(getAdsUrl ,function(data){
                    if (data && data.sequences) {
                        _this.adDataLoaded = true;
                        var cues = [];

                        for ( var i = 0 ; i < data.sequences.length ; i++ ) {
                           var currentSeq = data.sequences[i];
                            if (currentSeq.adId && currentSeq.offset == 0){
                                _this.hasPreroll = true;
                                //preroll!!!
                                _this.getAdData(currentSeq.adId,currentSeq.offset );
                                cues.push(0);
                            }
                            else {
                                if (currentSeq.adId) {
                                    _this.queueAdRquest.push( {
                                        offset: currentSeq.offset ,
                                        sequence: currentSeq ,
                                        isDone: false
                                    } );
                                    cues.push(currentSeq.offset);
                                }
                            }
                        }

                        if (_this.waitingForAdDataToLoad){
                            _this.checkBeforeSeek(_this.waitingForAdDataToLoad[0],_this.waitingForAdDataToLoad[1],_this.waitingForAdDataToLoad[2]);
                            _this.waitingForAdDataToLoad = null;
                        }
                        var scrubber = _this.embedPlayer.getInterface().find(".scrubber");
                        scrubber.parent().prepend('<div class="bubble-ad"></div>');


                        for (var i = 0 ;i<cues.length;i++) {
                            var pos = Math.round((cues[i]/(_this.embedPlayer.duration * 1000)*100)) ;
                            $('.bubble-ad').append($('<div id ="' + "key"+i + '" style="margin-left:' + pos + '%">' +
                                ' </div>')
                                    .addClass("")
                            );

                        }
                    }
                });

            });

        },

        checkBeforeSeek:function (seektime,stopAfterSeek,stopSeek) {
            var _this= this;
            if ( _this.adDataLoaded
                && _this.hasPreroll
                && _this.embedPlayer.kPreSeekTime == 0 ) {
                if (!stopSeek) {
                    stopSeek = {};
                }
                stopSeek.value = true;
                stopAfterSeek = true;
                _this.embedPlayer.seeking = false;
            }

            //check if we miss cuepoint during seek - if so take the last one
            if ( _this.cuePoints && _this.cuePoints.length > 0 ) {
                var lastOffset = 0;
                var missedCue = null;
                for ( var i = 0 ; i < _this.queueAdRquest.length ; i++ ) {
                    var currentCue = _this.queueAdRquest[i];
                    if ( currentCue.offset > lastOffset && currentCue.offset < seektime * 1000 ) {
                        lastOffset = currentCue.offset;
                        missedCue = currentCue;
                    }
                }
                //found the cue we need to see to
                if ( missedCue && !missedCue.isDone ) {
                    _this.shouldMonitorSeek = false;
                    stopSeek.value = true;
                    stopAfterSeek = true;
                    _this.embedPlayer.seeking = false;
                    _this.embedPlayer.sendNotification( "doSeek" , missedCue.offset / 1000 );
                }
            }

            _this.seekAfterAd = seektime;


        },

        getAdData: function(adId,offset){
            var _this = this;
            var serverHostName = _this.getConfig("playServer");
            var getAdsUrl = serverHostName +  "/p/"+_this.embedPlayer.kpartnerid+"/layout/playerAdBreak/adId/"+adId+"/sessionId/"+_this.sessionid+"/a.json";
            $.getJSON(getAdsUrl, function(data){
                if (data && data.ads){
                    var totalInternalOffset = 0;
                    for (var i = 0 ; i < data.ads.length; i++){
                        var currentAd = data.ads[i] ;
                        //ignore autoskip for now - look at only true ads
                        var currentOffset = offset + currentAd.offset ;
                        currentAd.clickURL = currentAd.clickThrough;
                        if (currentOffset == 0 ){
                            _this.trackAd(currentAd,currentOffset);
                            if (currentAd.clickURL) {
                                _this.addClickURL(currentAd.clickURL , currentOffset + currentAd.duration);
                            }
                        } else {
                            _this.cuePoints.push({offset:currentOffset,ad:currentAd,isDone:false});
                        }
                        totalInternalOffset +=currentOffset + currentAd.duration;                  
                    }
                }


            });
        },
        trackAd : function(ad,offset) {
            for ( var i = 0 ; i < ad.beacons.length ; i++ ) {
                var currentBeacon = ad.beacons[i];
                this.trackers.push( {
                    offset: currentBeacon.offset + offset ,
                    url: currentBeacon.value ,
                    isDone: false
                } );
            }
        },
        trackCuePoints:function() {
            var currentTime = this.embedPlayer.currentTime * 1000;
            if ( currentTime ) {
                for ( var i = 0 ; i < this.cuePoints.length ; i++ ) {
                    var currentCuePoint = this.cuePoints[i];
                    if ( currentTime > currentCuePoint.offset &&
                         currentTime < currentCuePoint.offset + 1000
                        && !currentCuePoint.isDone ) {
                        if ( currentCuePoint.ad.autoskip ) {
                            if ( currentCuePoint.ad.offset > 1000 ) {
                                this.shouldMonitorSeek = false;
                                this.embedPlayer.sendNotification( "doSeek",( currentCuePoint.offset + currentCuePoint.ad.duration ) / 1000 );
                            }
                            currentCuePoint.isDone = true;
                            continue;
                        }
                        currentCuePoint.isDone = true;
                        this.trackAd( currentCuePoint.ad );
                        if ( currentCuePoint.ad.clickURL ) {
                            this.addClickURL( currentCuePoint.ad.clickURL , currentCuePoint.offset + currentCuePoint.ad.duration );
                        }
                    } 
                }
            }
        },
        trackQueueAds:function(){
            var _this = this;
            var currentTime = this.embedPlayer.currentTime*1000;
            if (currentTime){
                for (var i=0; i<this.queueAdRquest.length;i++){
                    var currentReq = this.queueAdRquest[i];
                    if (currentTime +3000 > currentReq.offset  && !currentReq.isDone) {
                            _this.getAdData(currentReq.sequence.adId,currentReq.sequence.offset );
                        currentReq.isDone = true;
                    }
                }
            }
        },
        addSkipAd:function(timeToSkip){
            var _this = this;
            var $videoHolder = this.embedPlayer.getVideoHolder();
            var $skipAd = $videoHolder.append("<div id='skipAd' style='cursor:pointer;vertical-align:middle;bottom:41px;right:8px;position:absolute;text-align:center;width: 70px;height: 30px;background-color: rgba(0,0,0,0.6);border-radius: 2px;'>" +
                "<span style='vertical-align:middle;line-height:30px;width: 53px;height: 17px;font-family: Helvetica;font-size: 14px;font-weight: bold; color: #FFFFFF;'>Skip Ad</span></div>").find("#skipAd")

            var clickEventName = "click" + _this.adClickPostFix;
            if ( mw.isTouchDevice() ) {
                clickEventName += " touchend" + _this.adClickPostFix;
            }
            $skipAd.unbind( clickEventName ).bind( clickEventName , function ( e ) {
                _this.shouldMonitorSeek = false;
                _this.embedPlayer.sendNotification("doSeek",timeToSkip/1000);
                _this.removeSkipAd();
            });

        },

        removeSkipAd:function(){
            var $videoHolder = this.embedPlayer.getVideoHolder();
            $videoHolder.find("#skipAd").remove();
        },

        addAdvertiseText:function(){
            var _this = this;
            var $videoHolder = this.embedPlayer.getVideoHolder();
            var $adText = $videoHolder.append("<div id='adText' style='position:absolute;bottom:49px;left:10px;width: 90px;height: 17px;font-family: Helvetica;font-size: 14px;line-height: 17px;color: #FFFFFF;text-shadow: 0 2px 4px 0 rgba(0,0,0,0.5);'>Advertisement</div>")

        },
        removeAdvertiseText:function(){
            var _this = this;
            var $videoHolder = this.embedPlayer.getVideoHolder();
            $videoHolder.find("#adText").remove();

        },
        addClickURL:function(url,timeToStop) {
            var _this = this;
            var addClick = function () {
                _this.addAdvertiseText()
                clearTimeout( _this.clickURLTimeout);
                _this.clickURLTimeout = null;

                var $videoHolder = _this.embedPlayer.getVideoHolder();
                var $clickTarget = $videoHolder.append("<div id='clickthrough' style='cursor:pointer;vertical-align:middle;top:10px;left:7px;position:absolute;text-align:center;width: 96px;height: 30px;background-color: #00ABCC;border-radius: 2px;'>" +
                    "<span style='vertical-align:middle;line-height:30px;width:77px;height: 17px;font-family: Helvetica;font-size: 14px;font-weight: bold;color: #FFFFFF;'>Learn more</span></div>").find("#clickthrough")

                // the event stack being exhausted.
               // var $clickTarget = (mw.isTouchDevice()) ? $( _this.embedPlayer ) : _this.embedPlayer.getVideoHolder();
                var clickEventName = "click" + _this.adClickPostFix;
                if ( mw.isTouchDevice() ) {
                    clickEventName += " touchend" + _this.adClickPostFix;
                }
                $clickTarget.unbind( clickEventName ).bind( clickEventName , function ( e ) {
                    e.stopPropagation();
                    e.preventDefault();
                    _this.embedPlayer.pause();
                    window.open( url );
                    _this.embedPlayer.enablePlayControls();

                    return false;
                } );
                _this.embedPlayer.disablePlayControls();
            };
            var removeClick = function () {
                _this.removeAdvertiseText()

                _this.clickURLTimeout = null;
                var $videoHolder = _this.embedPlayer.getVideoHolder();
                var $clickTarget = $videoHolder.find("#clickthrough");

                $clickTarget.unbind( _this.adClickPostFix );
                $clickTarget.remove();
                _this.embedPlayer.enablePlayControls();
                _this.removeSkipAd();
                if ( _this.seekAfterAd > 0){
                    _this.shouldMonitorSeek = false;
                    _this.embedPlayer.sendNotification("doSeek",_this.seekAfterAd);
                    _this.seekAfterAd = -1;
                }
            };
            var checkWhenToStop = function () {
                var currentTime = _this.embedPlayer.currentTime * 1000;
                if ( timeToStop < currentTime ) {
                    removeClick();
                } else{
                    _this.clickURLTimeout = setTimeout(checkWhenToStop,500);
                }

            };
            addClick();
            checkWhenToStop();
           this.addSkipAd(timeToStop);
        },
        reportTrackers:function(){
            var currentTime = this.embedPlayer.currentTime;
            if (currentTime){
                for ( var i = 0 ; i < this.trackers.length ; i++ ) {
                    var currentTracker = this.trackers[i] ;
                    if (currentTracker.offset < currentTime && !currentTracker.isDone){
                        mw.sendBeaconUrl(currentTracker.url);
                        currentTracker.isDone = true;
                    }
                }
            }
        },
        injectParam:function(src,param) {
            return src.replace( /playmanifest/ig ,"playManifest/" + param );

        },
        injectGetParam:function(src,param){
            if (src.indexOf("?") > -1){
                return src + "&" + param;
            }
            return src +"?" + param;
        },
        getPlayerConfig:function(){
            var fv = this.embedPlayer.getFlashvars();
            delete fv[0];
            return JSON.stringify(fv);
        }

    }));

} )( window.mw, window.jQuery );
