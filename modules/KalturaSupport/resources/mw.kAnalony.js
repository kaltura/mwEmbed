/**
 * Created by itayk on 8/4/14.
 */
( function( mw, $ ) {
	"use strict";

	mw.PluginManager.add( 'kAnalony' , mw.KBasePlugin.extend( {

		defaultConfig: {
			id3TagMaxDelay: 20000,
			persistentSessionId : null,
			requestMethod: 'GET'
		},
		tabMode : {
			HIDDEN: 1,
			ACTIVE: 2
		},
		fullscreenMode : {
			NORMAL: 1,
			FULLSCREEN: 2
		},
		soundMode : {
			MUTED: 1,
			HAS_SOUND: 2
		},
		PlayerEvent:{
			"IMPRESSION": 1,
			"PLAY_REQUEST": 2,
			"PLAY": 3,
			"RESUME": 4,
			"PLAY_25PERCENT": 11,
			"PLAY_50PERCENT": 12,
			"PLAY_75PERCENT": 13,
			"PLAY_100PERCENT": 14,
			"SHARE_CLICKED": 21,
			"SHARE_NETWORK": 22,
			"DOWNLOAD": 23,
			"REPORT_CLICKED": 24,
			"REPORT_SUBMITED": 25,
			"ENTER_FULLSCREEN": 31,
			"EXIT_FULLSCREEN": 32,
			"PAUSE": 33,
			"REPLAY": 34,
			"SEEK": 35,
			"RELATED_CLICKED": 36,
			"RELATED_SELECTED": 37,
			"CAPTIONS": 38,
			"SOURCE_SELECTED": 39,
			"INFO": 40,
			"SPEED": 41,
			"VIEW": 99,
            "ERROR": 98,
			"BUFFER_START": 45,
			"BUFFER_END": 46
		},
		startTime: null,
		reportingInterval : 10000,
		bufferTime : 0,
		eventIndex : 1,
		currentBitRate: -1,
		currentflavorId: -1,
		eventType: 1,
		firstPlay: true,
		viewEventInterval: null,
		savedPosition: null,
		monitorIntervalObj:{},
		droppedFrames: 0,
		decodedFrames: 0,
		playTimeSum: 0,
		previousCurrentTime: 0,
		maxChunkDownloadTime: 0,
		_p25Once: false,
		_p50Once: false,
		_p75Once: false,
		_p100Once: false,
		hasSeeked: false,
		dvr: false,
        monitorViewEvents:true,
        playSentOnStart: false,
		absolutePosition: null,
		id3TagEventTime: null,
		manifestDownloadTime: null,
		id3SequenceId: null,
		onPlayStatus: false,
        firstPlayRequestTime: null,
        bandwidthSamples: [],
		firstPlaying: true,
		_isPaused: true,
		_isBuffering: false,
		_mediaChange: false,

		smartSetInterval:function(callback,time,monitorObj) {
			var _this = this;
			//create the timer speed, a counter and a starting timestamp
			var speed = time,
				counter = 1,
				start = new Date().getTime();

			//timer instance function
			var instance = function ()
			{
				if (monitorObj.cancel ){
					return;
				}
				callback();
				//work out the real and ideal elapsed time
				var real = (counter * speed),
					ideal = (new Date().getTime() - start);

				//increment the counter
				counter++;

				//calculate and display the difference
				var diff = (ideal - real);
				monitorObj.counter = counter;
				monitorObj.diff = diff;

				var nextSpeed = speed - diff;
				if (Math.abs(nextSpeed) > speed){
					nextSpeed = speed;
				}
				_this.viewEventInterval = window.setTimeout(function() { instance(); }, nextSpeed);
			};

			//now kick everything off with the first timer instance
			_this.viewEventInterval = window.setTimeout(function() { instance(); }, speed);
		},

		setup: function( ) {
            this.rateHandler = new mw.KavaRateHandler();
            this.timer = new mw.KavaTimer(this);
			this.eventIndex = 1;
            this.bufferTime = 0;
            this.bufferTimeSum = 0;
			this.currentBitRate = -1;
            this.addBindings();
	    },

		addBindings : function() {
			var _this = this;
			var playerEvent = this.PlayerEvent;
			this.embedPlayer.bindHelper( 'playerReady' , function () {
                _this.resetPlayerflags();
				if ( _this.kalturaContextData && _this.kalturaContextData.flavorAssets && _this.kalturaContextData.flavorAssets.length === 1 ){
			        _this.currentBitRate = _this.kalturaContextData.flavorAssets[0].bitrate;
		        }
				_this.sendAnalytics(playerEvent.IMPRESSION);
			});
			this.embedPlayer.bindHelper( 'onChangeMedia' , function () {
				_this.timer.destroy();
				_this.resetSession();
				_this.rateHandler.destroy();
				_this.bufferTime = 0;
				_this.maxChunkDownloadTime = 0;
				_this.droppedFrames = 0;
				_this.decodedFrames = 0;
				_this.firstPlay = true;
				_this.playSentOnStart = false;
				_this.currentBitRate = -1;
				_this.currentflavorId = -1;
				_this.dvr = false;
				_this.monitorViewEvents = true;
				_this.onPlayStatus = false;
				_this.id3SequenceId = null;
				_this.bandwidthSamples = [];
				_this.firstPlaying = true;
				_this._isPaused = true;
				_this._isBuffering = false;
				_this._mediaChange = true;
				_this.manifestDownloadTime = null;
			});
            // calculate bandwidth of current loaded frag
			this.embedPlayer.bindHelper( 'hlsFragBufferedWithData' , function (e,data) {
				if (data.stats.bwEstimate) {
					// store so we can calculate average later
					var time = Math.round(data.stats.tload - data.stats.trequest) / 1000; // convert ms to sec
					var kiloBits = data.stats.loaded / 1000 * 8; // convert to kiloBits
					var bandwidth = kiloBits / time;
					// normalize - ignore > 50000
					if(bandwidth < 50000){
						_this.bandwidthSamples.push(bandwidth);
					}
				}
			});

			this.embedPlayer.bindHelper( 'firstPlay' , function () {
					_this.firstPlayRequestTime = Date.now();
					_this.sendAnalytics(playerEvent.PLAY_REQUEST);
			});

			this.embedPlayer.bindHelper( 'playing' , function () {
                if (_this.embedPlayer.currentState === "start" && _this.playSentOnStart) {
                    return;
                }

				if ( !this.isInSequence() ){
					if ( _this.firstPlaying && !_this.onPlayStatus ) {
						_this.onPlayStatus = true;
						_this.firstPlaying = false;
                        _this.playSentOnStart = true;
						_this.timer.start();
						_this.sendAnalytics(playerEvent.PLAY, {
                            bufferTimeSum: _this.bufferTimeSum,
                            joinTime: (Date.now() - _this.firstPlayRequestTime) / 1000.0
						});
					}else if (_this._isPaused){
                        _this.timer.resume();
						_this._isPaused = false;
						_this.sendAnalytics(playerEvent.RESUME, {
                            bufferTimeSum: _this.bufferTimeSum
						});
					}
				}
			});
			this.embedPlayer.bindHelper( 'onpause' , function () {
				_this.timer.stop();
				_this._isPaused = true;
				_this.sendAnalytics(playerEvent.PAUSE);
                if ( _this.embedPlayer.isDVR() ) {
                    _this.dvr = true;
                }
			});

			this.embedPlayer.bindHelper( 'monitorEvent' , function () {
				_this.updateTimeStats();
			});

			this.embedPlayer.bindHelper( 'seeked' , function (e, seekTarget) {
                _this.hasSeeked = true;
				if ( _this.embedPlayer.isDVR() ) {
					_this.dvr = true;
				}
			});

			this.embedPlayer.bindHelper( 'movingBackToLive', function() {
				_this.dvr = false;
			} );

			this.embedPlayer.bindHelper( 'seeking', function() {
                _this.previousCurrentTime = _this.embedPlayer.currentTime;
                if ( _this.embedPlayer.isDVR() ) {
					_this.dvr = true;
				}
			});

			this.embedPlayer.bindHelper( 'userInitiatedSeek' , function (e, seekTarget) {
				_this.sendAnalytics(playerEvent.SEEK, { "targetPosition": seekTarget } );
			});

			this.embedPlayer.bindHelper( 'showShareEvent' , function () {
				_this.sendAnalytics(playerEvent.SHARE_CLICKED);
			});

			this.embedPlayer.bindHelper( 'socialShareEvent' , function (e, socialNetwork) {
				_this.sendAnalytics(playerEvent.SHARE_NETWORK, {"socialNetwork": socialNetwork.name } );
			});

			this.embedPlayer.bindHelper( 'downloadMedia' , function () {
				_this.sendAnalytics(playerEvent.DOWNLOAD);
			});

			this.embedPlayer.bindHelper('hlsManifestLoadedWithStats', function(e,data){
				if(data && data.stats && data.stats.tload && data.stats.trequest){
					_this.manifestDownloadTime= (data.stats.tload-data.stats.trequest).toFixed(2)/1000;
				}
			});

			this.embedPlayer.bindHelper( 'onOpenFullScreen' , function () {
				_this.sendAnalytics(playerEvent.ENTER_FULLSCREEN);
			});

			this.embedPlayer.bindHelper( 'onCloseFullScreen' , function () {
				_this.sendAnalytics(playerEvent.EXIT_FULLSCREEN);
			});

			this.embedPlayer.bindHelper( 'onEndedDone' , function () {
				_this.maxChunkDownloadTime = 0;
				_this.stopViewTracking();
			});

			this.embedPlayer.bindHelper( 'replayEvent' , function () {
				_this.resetPlayerflags();
				_this.timer.start();
				_this.sendAnalytics(playerEvent.REPLAY);
			});

			this.embedPlayer.bindHelper( 'moderationOpen' , function () {
				_this.sendAnalytics(playerEvent.REPORT_CLICKED);
			});

			this.embedPlayer.bindHelper( 'moderationSubmit' , function (e, reportType) {
				_this.sendAnalytics(playerEvent.REPORT_SUBMITED, { "reportType": reportType});
			});

			this.embedPlayer.bindHelper( 'relatedOpen' , function () {
				_this.sendAnalytics(playerEvent.RELATED_CLICKED);
			});

			this.embedPlayer.bindHelper( 'relatedVideoSelect' , function (e, data) {
				if (!data.autoSelected){
					_this.sendAnalytics(playerEvent.RELATED_SELECTED, { "relatedEntryId": data.entryId});
				}
			});

			this.embedPlayer.bindHelper( 'selectClosedCaptions' , function (e, label, language) {
				_this.sendAnalytics(playerEvent.CAPTIONS, { "caption": language});
			});

			this.embedPlayer.bindHelper( 'newSourceSelected' , function (e, flavorId) {
				_this.rateHandler.setCurrent(0);
				_this.sendAnalytics(playerEvent.SOURCE_SELECTED, { "flavorId": flavorId});
			});

			this.embedPlayer.bindHelper( 'infoScreenOpen' , function () {
				_this.sendAnalytics(playerEvent.INFO);
			});

			this.embedPlayer.bindHelper( 'updatedPlaybackRate' , function (e, speed) {
				_this.sendAnalytics(playerEvent.SPEED, {"playbackSpeed": speed});
			});

			this.embedPlayer.bindHelper('bufferStartEvent', function(){
				if (!_this.firstPlaying) {
					_this._isBuffering = true;
					_this.bufferStartTime = new Date();
					_this.sendAnalytics(playerEvent.BUFFER_START);
				}
			});

			this.embedPlayer.bindHelper('bufferEndEvent', function(){
				if (!_this.firstPlaying && _this._isBuffering) {
					_this._isBuffering = false;
					_this.calculateBuffer();
					_this.bufferStartTime = null;
					_this.sendAnalytics(playerEvent.BUFFER_END);
				}
            });

			this.embedPlayer.bindHelper( 'bitrateChange' ,function( event, newBitrate){
				_this.currentBitRate = newBitrate;
				_this.rateHandler.setCurrent(newBitrate);
			} );

            this.embedPlayer.bindHelper('sourcesReplaced', function () {
                if (!_this.rateHandler.hasRates()) {
                    var rates = [];
                    var sources = _this.embedPlayer.getSources();
                    for (var i = 0; i < sources.length; i++) {
                        var rate = sources[i].getBitrate();
                        rates.push(Math.round(rate));
                    }
                    _this.rateHandler.setRates(rates);
                }
            });

            this.embedPlayer.bindHelper('onPlayerStateChange', function(e, newState, oldState) {
				if (!this.isInSequence()) {
                    if (newState === "pause") {
                        _this.stopViewTracking();
                    }
                    if (newState === "play") {
                        if (oldState === "start" || oldState === "pause") {
                            _this.startViewTracking();
                        }
                    }
                }
			});

            this.embedPlayer.bindHelper( 'AdSupport_midroll AdSupport_postroll' , function () {
                _this.savedPosition = _this.embedPlayer.currentTime; // during ad playback (mid and post only), report position as the last player position
            });

            this.embedPlayer.bindHelper( 'AdSupport_EndAdPlayback' , function () {
                setTimeout(function(){
                    _this.savedPosition = null; // use timeout to use the savedPosition for events reported immediately after ad finish (play event)
                    _this.startViewTracking();
				},0);
            });

            this.embedPlayer.bindHelper('AdSupport_StartAdPlayback', function() {
                _this.stopViewTracking();
            });

			// events for capturing the bitrate of the currently playing source
			this.embedPlayer.bindHelper( 'SourceSelected' , function (e, source) {
                if (source.getBitrate()){
					_this.currentBitRate = source.getBitrate();
                }
				if (source.getAssetId()){
					_this.currentflavorId = source.getAssetId();
				}
			});

			this.embedPlayer.bindHelper('hlsFragLoadedWithStats', function(e,data) {
				if(data && data.stats && data.stats.tload && data.stats.trequest ){
					_this.maxChunkDownloadTime = Math.max((data.stats.tload - data.stats.trequest)/1000, _this.maxChunkDownloadTime);
				}
			});

			this.embedPlayer.bindHelper( 'sourceSwitchingEnd' , function (e, newSource) {
				if (newSource.newBitrate){
					_this.currentBitRate = newSource.newBitrate;
				}
			});

			this.embedPlayer.bindHelper('playerError', function (e, errorObj) {
                var errorCode = errorObj && errorObj.key;
                var errorDetails = errorObj && errorObj.message;
                _this.sendAnalytics(playerEvent.ERROR, {errorCode: errorCode, errorDetails: errorDetails});
            });

			this.embedPlayer.bindHelper( 'onId3Tag' , function (e, id3Tag) {
				if(id3Tag.sequenceId){
					_this.id3SequenceId = id3Tag.sequenceId;
				}
				_this.id3TagEventTime = Date.now();
				_this.absolutePosition = id3Tag.timestamp;
			});
		},
		resetPlayerflags:function(){
            this._p25Once = false;
            this._p50Once = false;
            this._p75Once = false;
            this._p100Once = false;
            this.hasSeeked = false;
            this.previousCurrentTime = 0;
			this.savedPosition = null;
			this.absolutePosition = null;
			this.id3TagEventTime = null;
			this._mediaChange = false;
		},
		/**
		* Both parameters are accumulated so we need to deduct the new values from the previous values. This function
		* does that exactly by saving locally the values. THe function returns the ratio as fraction (E.G. 0.015 )
		* @param droppedFrames
		* @param decodedFrames
		* @returns {number}
		*/
		getDroppedFramesRatio: function ( droppedFrames, decodedFrames) {
			var olddroppedFrames = this.droppedFrames;
			var olddecodedFrames = this.decodedFrames;
			this.droppedFrames = droppedFrames;
			this.decodedFrames = decodedFrames;
			return (Math.round((this.droppedFrames-olddroppedFrames) / (this.decodedFrames-olddecodedFrames) * 1000) / 1000);
		},
		updateTimeStats: function() {
			var _this = this;
			var percent = this.embedPlayer.currentTime / this.embedPlayer.duration;
			var playerEvent = this.PlayerEvent;
			if (!this.embedPlayer.isLive()){
				this.calculatePlayTimeSum();
			}
			// Send updates based on logic present in StatisticsMediator.as
			// Only reprot on first play of a media, don't report on media replay
			if ( !this.embedPlayer.isLive() && (_this.embedPlayer.donePlayingCount === 0)){
				if( !_this._p25Once && percent >= .25 ) {
					_this._p25Once = true;
					_this.embedPlayer.triggerHelper( "firstQuartile" );
					_this.sendAnalytics(playerEvent.PLAY_25PERCENT);
				} else if ( !_this._p50Once && percent >= .50 ) {
					_this._p50Once = true;
					_this.embedPlayer.triggerHelper( "secondQuartile" );
					_this.sendAnalytics(playerEvent.PLAY_50PERCENT);
				} else if( !_this._p75Once && percent >= .75 ) {
					_this._p75Once = true;
					_this.embedPlayer.triggerHelper( "thirdQuartile" );
					_this.sendAnalytics(playerEvent.PLAY_75PERCENT);
				} else if(  !_this._p100Once && percent >= .99) {
					_this._p100Once = true;
					_this.sendAnalytics(playerEvent.PLAY_100PERCENT);
				}
			}
		},

        calculatePlayTimeSum: function () {
            this.playTimeSum += (this.embedPlayer.currentTime - this.previousCurrentTime);
            this.previousCurrentTime = this.embedPlayer.currentTime;
		},

		calaulatePlayTimeSumBasedOnTag: function (){
			this.playTimeSum += (this.embedPlayer.getPlayerElement().currentTime - this.previousCurrentTime);
            this.previousCurrentTime = this.embedPlayer.getPlayerElement().currentTime;
		},

		calculateBuffer : function ( closeSession ){
			var _this = this;
			//if we want to calculate the buffer till now - first check we have started buffer
			if (closeSession &&  !_this.bufferStartTime){
					return;
			}

			//calc the buffer time
			this.bufferTime += (new Date() - _this.bufferStartTime) / 1000;
			if (this.bufferTime > 10){
				this.bufferTime = 10;
			}
			this.bufferTimeSum += this.bufferTime;
			//set the buffer start time to now - in order to continue and counting the current buffer session
			if ( closeSession ){
				_this.bufferStartTime = new Date();
			}
		},

		stopViewTracking :function(){
			var _this = this;
			_this.monitorIntervalObj.cancel = true;
			clearTimeout( _this.viewEventInterval );
			_this.viewEventInterval = null;
		},
		startViewTracking :function(){
			if (this.viewEventInterval){
				this.stopViewTracking();
			}
			if ( !this.monitorViewEvents ){
				return;
			}
			var _this = this;
			var playerEvent = this.PlayerEvent;
			_this.startTime = null;
			_this.kClient = mw.kApiGetPartnerClient( _this.embedPlayer.kwidgetid );
			_this.monitorIntervalObj.cancel = false;
			if ( _this.firstPlay ){
				_this.sendAnalytics(playerEvent.VIEW, _this.generateViewEventObject() );
				_this.firstPlay = false;
			}
			_this.smartSetInterval(function(){
				if ( !_this._p100Once || (_this.embedPlayer.donePlayingCount > 0)){ // since we report 100% at 99%, we don't want any "VIEW" reports after that (FEC-5269)
					var analyticsEvent = _this.generateViewEventObject();
					_this.addDroppedFramesRatioData(analyticsEvent);
					_this.addBandwidthData(analyticsEvent);
					_this.sendAnalytics(playerEvent.VIEW, analyticsEvent );
					_this.bufferTime = 0;
				}
				if ( !_this.monitorViewEvents ){
					_this.stopViewTracking();
				}
			},_this.reportingInterval,_this.monitorIntervalObj);
		},
		// calculate avarage bandwidth, clean bandwidthSamples and add output to the analytics objects
		addBandwidthData: function(analyticsEvent){
		    if(this.bandwidthSamples.length === 0){
		        return;
		    }
			var sum = 0;
			$.each(this.bandwidthSamples,function(){sum+=parseFloat(this) || 0; });
			var avarage = sum / this.bandwidthSamples.length;
			this.bandwidthSamples = [];
			analyticsEvent.bandwidth = avarage.toFixed(3);
		},

		getConnectionType: function() {
			try {
				var navConnection = window.navigator.connection || window.navigator.mozConnection || window.navigator.webkitConnection;
				return navConnection && navConnection.effectiveType ? navConnection.effectiveType : "" ;
			}catch(err) {
				mw.log("Failed to retrieve window.navigator.connection");
			}
			return "";
		},

		getForwardBufferHealth : function(){
			var forwardBufferHealth = NaN;
			try{
				var availableBuffer = this.availableBuffer();
				var targetBuffer = this.embedPlayer.getTargetBuffer();
				if (targetBuffer && availableBuffer) {
					// considering playback left to the target calculation
					forwardBufferHealth = Math.round((availableBuffer * 1000) / targetBuffer) / 1000;
				}
				mw.log("forwardBufferHealth  "+forwardBufferHealth);
			}catch(e){
				mw.log("Failed getting getForwardBufferHealth data");
			}
			return forwardBufferHealth;
		},

		availableBuffer: function(){
			var retVal = 0;
			try{
				var videoEl = this.embedPlayer.getPlayerElement();
				if (videoEl && videoEl.buffered) {
				  for (var i = 0; i < videoEl.buffered.length; i++) {
					if (videoEl.buffered.start(i) <= videoEl.currentTime && videoEl.currentTime <= videoEl.buffered.end(i)) {
					  retVal = videoEl.buffered.end(i) - videoEl.currentTime;
					}
				  }
				}
			}catch(e){
				mw.log("Failed retrieving availableBuffer");
			}
			return retVal;
		  },

		generateViewEventObject: function(){
			var forwardBufferHealth = this.getForwardBufferHealth();
			var tabMode = this.tabMode;
			var soundMode = this.soundMode;
			var fullscreenMode = this.fullscreenMode;
			var isInFullscreen = this.embedPlayer.layoutBuilder.isInFullScreen();
			var event = {
				screenMode : isInFullscreen ? fullscreenMode.FULLSCREEN : fullscreenMode.NORMAL,
				tabMode : document.hidden ? tabMode.HIDDEN : tabMode.ACTIVE,
				soundMode : this.embedPlayer.isMuted() ? soundMode.MUTED : soundMode.HAS_SOUND,
				playTimeSum: this.playTimeSum,
				averageBitrate: this.rateHandler.getAverage(),
				bufferTimeSum: this.bufferTimeSum
			};
			if(this.id3SequenceId){
				event.flavorParamsId = this.id3SequenceId;
			}

			var targetBuffer = this.embedPlayer.getTargetBuffer();
			if(targetBuffer){
				event.targetBuffer = targetBuffer;
			}
			if(forwardBufferHealth){
				event.forwardBufferHealth = forwardBufferHealth;
			}

			if(this.manifestDownloadTime){
				event.manifestDownloadTime = this.manifestDownloadTime;
				this.manifestDownloadTime = null;
      }

			if(this.maxChunkDownloadTime){
				event.segmentDownloadTime = this.maxChunkDownloadTime.toFixed(3);
				// reset for next 10 seconds
				this.maxChunkDownloadTime = 0;
			}
			var connectionType = this.getConnectionType();
			if(connectionType){
				event.networkConnectionType = connectionType;
			}
			return event;
		},

        addDroppedFramesRatioData: function(analyticsEvent){
            var droppedFramesRatio;
            try{
                var vidObj = this.embedPlayer.getPlayerElement();
                if (typeof vidObj.getVideoPlaybackQuality === 'function') {
                    var videoPlaybackQuality = vidObj.getVideoPlaybackQuality();
                    droppedFramesRatio = this.getDroppedFramesRatio( videoPlaybackQuality.droppedVideoFrames , videoPlaybackQuality.totalVideoFrames );
                } else {
                    droppedFramesRatio = this.getDroppedFramesRatio( vidObj.webkitDroppedFrameCount , vidObj.webkitDecodedFrameCount );
                }
            } catch (e) {
                mw.log("Failed getting droppedVideoFrames data");
            }
            if(droppedFramesRatio !== undefined && !isNaN(droppedFramesRatio)){
                analyticsEvent.droppedFramesRatio = droppedFramesRatio;
            }
        },

        getEntrySessionId: function(){
            return this.embedPlayer.evaluate('{configProxy.sessionId}');
        },

        getPosition: function () {
            if (this.embedPlayer.isLive()) {
            	if (this.embedPlayer.getLiveEdgeOffset() < 1){
                    return 0;
				}
                return -(this.embedPlayer.getLiveEdgeOffset());
            } else {
                var position = this.embedPlayer.currentTime ? this.embedPlayer.currentTime : 0;
                if (this.savedPosition) {
                    position = this.savedPosition;
                }
                return position;
            }
        },

		sendAnalytics : function(eventType, additionalData){
			if (this._mediaChange) {
				return;
			}
			//Don't send analytics if entry or partner id are missing
			if (!(this.embedPlayer.kentryid && this.embedPlayer.kpartnerid)){
				return;
			}
			var _this = this;
			if (this.embedPlayer.isLive()){
				this.calaulatePlayTimeSumBasedOnTag();
			} else {
				this.calculatePlayTimeSum();
			}
			this.calculateBuffer(true);
			this.kClient = mw.kApiGetPartnerClient( this.embedPlayer.kwidgetid );
			if ( this.embedPlayer.isMulticast && $.isFunction( this.embedPlayer.getMulticastBitrate ) ) {
				this.currentBitRate = this.embedPlayer.getMulticastBitrate();
			}

			// set playbackType
			var playbackType = "vod";
			if (this.embedPlayer.isLive()){
				playbackType = this.dvr ? "dvr" : "live";
			}

			var position = this.getPosition();

			var statsEvent = {
				'entryId'           : this.embedPlayer.kentryid,
				'partnerId'         : this.embedPlayer.kpartnerid,
				'eventType'         : eventType,
				'sessionId'         : this.getEntrySessionId(),
				'eventIndex'        : this.eventIndex,
				'bufferTime'        : this.bufferTime,
				'actualBitrate'     : this.currentBitRate,
				'flavorId'          : this.currentflavorId,
				'referrer'          : mw.getConfig('EmbedPlayer.IsFriendlyIframe') ? mw.getConfig('EmbedPlayer.IframeParentUrl') : document.referrer,
				'deliveryType'      : this.embedPlayer.streamerType,
				'sessionStartTime'  : this.startTime,
				'uiConfId'          : this.embedPlayer.kuiconfid,
				'clientVer'         : mw.getConfig("version"),
				'position'          : position,
				'playbackType'      : playbackType
			};

			var flashVarEvents = {
				'playbackContext' : 'playbackContext',
				'applicationName' : 'application',
				'userId' : 'userId'
			};
			// support legacy ( deprecated ) top level config
			for( var fvKey in flashVarEvents){
				if( this.embedPlayer.getKalturaConfig( '', fvKey ) ){
					statsEvent[ flashVarEvents[ fvKey ] ] = this.embedPlayer.getKalturaConfig('', fvKey );
				}
			}

			// add ks if available
			var ks = this.kClient.getKs();
			if (ks){
				statsEvent["ks"] = ks;
			}

			// add preferred bitrate if defined by the user
			if ( this.embedPlayer.getRawKalturaConfig('mediaProxy') && this.embedPlayer.getRawKalturaConfig('mediaProxy').preferedFlavorBR ){
				statsEvent["expectedQuality"] = this.embedPlayer.getRawKalturaConfig('mediaProxy').preferedFlavorBR;
			}

			// add specific events data
			if (additionalData){
				$.extend(statsEvent, additionalData);
			}

			// add custom vars
			var config = this.getConfig();
			for (var key in config){
				if (key.indexOf("customVar") !== -1){
					var customVarObj = {};
					customVarObj[key] = config[key];
					$.extend(statsEvent, customVarObj);
				}
			}

			if (this.absolutePosition && Date.now() - this.id3TagEventTime < config.id3TagMaxDelay) {
				statsEvent["absolutePosition"] = this.absolutePosition;
			}


			// add playbackContext
			if (mw.getConfig("playbackContext")){
				statsEvent["playbackContext"] = mw.getConfig("playbackContext");
			}

			if (config.persistentSessionId){
				statsEvent["persistentSessionId"] = config.persistentSessionId
			}

			//Get optional playlistAPI
			this.maybeAddPlaylistId(statsEvent);

			//Shorten the referrer param
			var pageReferrer =  statsEvent[ 'referrer' ];
			var queryPos = pageReferrer.indexOf("?");
			if (queryPos > 0) {
				pageReferrer = pageReferrer.substring(0, queryPos);
			}

			var encodedReferrer = encodeURIComponent(pageReferrer);
			if (encodedReferrer.length > 500) {
				var parser = document.createElement('a');
				parser.href = pageReferrer;
				pageReferrer =  parser.origin;
			}

			statsEvent[ 'referrer' ] = pageReferrer;

			var eventRequest = {'service' : 'analytics', 'action' : 'trackEvent'};
			$.each(statsEvent , function (event , value) {
				eventRequest[event] = value;
			});
			this.eventIndex += 1;
			this.embedPlayer.triggerHelper( 'analyticsEvent' , statsEvent);
			this.log("Trigger analyticsEvent type = "+statsEvent.eventType);
			var callback = function(data){
				try {
					if (typeof data == "object") {
						var parsedData = data;
						if (parsedData.time && !_this.startTime) {
							_this.startTime = parsedData.time;
						}
						if (parsedData.viewEventsEnabled != undefined && !parsedData.viewEventsEnabled) {
							_this.monitorViewEvents = false;
						}
					} else {
						if (!_this.startTime) {
							_this.startTime = data;
						}
					}
				}catch(e){
					mw.log("Failed sync time from server");
				}
			};
			if (config.requestMethod.toUpperCase() === 'POST') {
				var postPayload = {};
				$.extend(postPayload, eventRequest);
				$.each(['service', 'action', 'eventType', 'partnerId', 'entryId', 'sessionId'], function (index, param) {
					delete postPayload[param];
				});
				if( this.kClient.disableCache === true ) {
					postPayload['nocache'] = 'true';
				}
				$.extend( postPayload, this.kClient.baseParam );
				postPayload['format'] = 1;
				this.kClient.xhrPost( this.buildPostUrl(eventRequest) ,JSON.stringify(postPayload), callback, { 'Content-Type': 'application/json'});
			} else {
				this.kClient.doRequest( eventRequest, callback, true);
			}
		},

		buildPostUrl: function(eventParams) {
			var urlParamsArr = $.map(['action', 'eventType', 'partnerId', 'entryId', 'sessionId'], function (key) {
				return key + '=' + eventParams[key];
			});
			return this.kClient.getApiUrl(eventParams['service'] + '&' + urlParamsArr.join('&') );
		},

        maybeAddPlaylistId: function (statsEvent) {
            var plugins = this.embedPlayer.plugins;
            // need to make many checks here due to vast options
			//first make sure playlist plugin even exist and that it already has playlist sets, as they might be loaded
			//dynamically later on, and then make sure a playlist in the set is even selected
            if (plugins && plugins.playlistAPI && plugins.playlistAPI.playlistSet &&
                $.isArray(plugins.playlistAPI.playlistSet) && plugins.playlistAPI.playlistSet.length &&
				(plugins.playlistAPI.currentPlaylistIndex > -1)
			){
                var currentPlaylist = plugins.playlistAPI.playlistSet[plugins.playlistAPI.currentPlaylistIndex];
                if (currentPlaylist) {
                    var playlistId = currentPlaylist.id;
                    if (playlistId) {
                        statsEvent["playlistId"] = playlistId;
                    }
                }
            }
        },

        timerTick: function () {
            this.log("Count current bitrate");
            this.rateHandler.countCurrent();
        },

        timerReport: function () {
			// Other timeout reporting VIEW event every 10 sec
        },

        timerReset: function () {
            this.log("30 seconds passed");
            this.resetSession();
        },

        resetSession: function () {
            this.log("Resets session");
            this.rateHandler.reset();
            this.eventIndex = 1;
            this.playTimeSum = 0;
            this.bufferTimeSum = 0;
            this.startTime = null;
        }
	}));

} )( window.mw, window.jQuery );
