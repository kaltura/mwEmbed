/**
 * Created by itayk on 09/02/17.
 */
/**
 * Created by itayk on 8/18/14.
 */
( function( mw, $ ) {"use strict";

    mw.PluginManager.add( 'adsServerStich', mw.KBasePlugin.extend({
       sessionid:null,
        queueAdRquest:[],
        cuePoints:[],
        trackers:[],
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
            } );

            this.bind("mediaLoaded", function(event,source) {
                var serverHostName = _this.getConfig("playServer");
                var getAdsUrl = serverHostName +  "/p/"+_this.embedPlayer.kpartnerid+"/layout/playerManifest/uiConfId/"+_this.embedPlayer.kuiconfid+"/entryId/0_v8y4bir3/flavorId/0_bp09oz39/sessionId/"+_this.sessionid+"/a.json"
                $.getJSON(getAdsUrl ,function(data){
                    if (data && data.sequences) {
                        var cues = [];

                        for ( var i = 0 ; i < data.sequences.length ; i++ ) {
                           var currentSeq = data.sequences[i];
                            if (currentSeq.adId && currentSeq.offset == 0){
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
                        if (currentOffset == 0){
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
        trackCuePoints:function(){
            var currentTime = this.embedPlayer.currentTime*1000;
            if (currentTime){
                for (var i=0; i<this.cuePoints.length;i++){
                    var currentCuePoint = this.cuePoints[i];
                    if (currentTime > currentCuePoint.offset  && !currentCuePoint.isDone) {
                        if (currentCuePoint.ad.autoskip){
                           if ( currentCuePoint.ad.offset> 1000 ){
                                //todo need to seek here
                               //  this.embedPlayer.seek( ( currentCuePoint.ad.offset +currentTime ) / 1000 );

                           }
                            currentCuePoint.isDone = true;
                            continue;
                        }
                        currentCuePoint.isDone = true;
                        this.trackAd(currentCuePoint.ad);
                        if (currentCuePoint.ad.clickURL) {
                            this.addClickURL(currentCuePoint.ad.clickURL , currentCuePoint.offset + currentCuePoint.ad.duration);
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
        addClickURL:function(url,timeToStop) {
            var _this = this;
            var addClick = function () {
                clearTimeout( _this.clickURLTimeout);
                _this.clickURLTimeout = null;

                // the event stack being exhausted.
                var $clickTarget = (mw.isTouchDevice()) ? $( _this.embedPlayer ) : _this.embedPlayer.getVideoHolder();
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
                _this.clickURLTimeout = null;
                var $clickTarget = (mw.isTouchDevice()) ? $( _this.embedPlayer ) : _this.embedPlayer.getVideoHolder();
                $clickTarget.unbind( _this.adClickPostFix );
                _this.embedPlayer.enablePlayControls();
            };
            var checkWhenToStop = function () {
                var currentTime = _this.embedPlayer.currentTime * 1000;
                if ( timeToStop < currentTime ) {
                    removeClick();
                } else{
                    _this.clickURLTimeout = setTimeout(checkWhenToStop,500);
                }

            }
            addClick();
            checkWhenToStop();
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
