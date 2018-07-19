/**
 * Created by itayk on 8/4/14.
 */
( function( mw, $ ) {
	"use strict";

	mw.PluginManager.add( 'kAnalony' , mw.KBasePlugin.extend( {
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
			"VIEW": 99
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
        playTimeSum: 0,
		previousCurrentTime: 0,
		_p25Once: false,
		_p50Once: false,
		_p75Once: false,
		_p100Once: false,
		hasSeeked: false,
		dvr: false,
        monitorViewEvents:true,
        playSentOnStart: false,
		absolutePosition: null,

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
            this.entryPlayCounter = 1;
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
				_this.firstPlay = true;
                _this.entryPlayCounter++;
                _this.playSentOnStart = false;
			});

			this.embedPlayer.bindHelper( 'userInitiatedPlay' , function () {
				_this.sendAnalytics(playerEvent.PLAY_REQUEST);
			});

			this.embedPlayer.bindHelper( 'onplay' , function () {
                if (_this.embedPlayer.currentState === "start" && _this.playSentOnStart) {
                    return;
                }

				if ( !this.isInSequence() && (_this.firstPlay || _this.embedPlayer.currentState !== "play") ){
					if ( _this.firstPlay ){
                        _this.playSentOnStart = true;
						_this.timer.start();
						_this.sendAnalytics(playerEvent.PLAY, {
                            bufferTimeSum: _this.bufferTimeSum
						});
					}else{
                        _this.timer.resume();
						_this.sendAnalytics(playerEvent.RESUME, {
                            bufferTimeSum: _this.bufferTimeSum
						});
					}
				}
			});
			this.embedPlayer.bindHelper( 'userInitiatedPause' , function () {
				_this.timer.stop();
				_this.sendAnalytics(playerEvent.PAUSE);
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

			this.embedPlayer.bindHelper( 'seeking onpause', function() {
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

			this.embedPlayer.bindHelper( 'onOpenFullScreen' , function () {
				_this.sendAnalytics(playerEvent.ENTER_FULLSCREEN);
			});

			this.embedPlayer.bindHelper( 'onCloseFullScreen' , function () {
				_this.sendAnalytics(playerEvent.EXIT_FULLSCREEN);
			});

			this.embedPlayer.bindHelper( 'onEndedDone' , function () {
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

			this.embedPlayer.bindHelper( 'selectClosedCaptions' , function (e, language) {
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
				_this.bufferStartTime = new Date();
			});

			this.embedPlayer.bindHelper('bufferEndEvent', function(){
				_this.calculateBuffer();
				_this.bufferStartTime = null;
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

			this.embedPlayer.bindHelper( 'sourceSwitchingEnd' , function (e, newSource) {
				if (newSource.newBitrate){
					_this.currentBitRate = newSource.newBitrate;
				}
			});

			this.embedPlayer.bindHelper( 'onId3Tag' , function (e, id3Tag) {
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
		},

		updateTimeStats: function() {
			var _this = this;
			var percent = this.embedPlayer.currentTime / this.embedPlayer.duration;
			var playerEvent = this.PlayerEvent;
			if (!this.embedPlayer.isLive()){
				this.calculatePlayTimeSum();
			}
			// Send updates based on logic present in StatisticsMediator.as
			if ( !this.embedPlayer.isLive() ){
				if( !_this._p25Once && percent >= .25 ) {
					_this._p25Once = true;
					_this.sendAnalytics(playerEvent.PLAY_25PERCENT);
				} else if ( !_this._p50Once && percent >= .50 ) {
					_this._p50Once = true;
					_this.sendAnalytics(playerEvent.PLAY_50PERCENT);
				} else if( !_this._p75Once && percent >= .75 ) {
					_this._p75Once = true;
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
				_this.sendAnalytics(playerEvent.VIEW, {
					playTimeSum: _this.playTimeSum,
                    averageBitrate: _this.rateHandler.getAverage(),
					bufferTimeSum: _this.bufferTimeSum
                });
				_this.firstPlay = false;
			}
			_this.smartSetInterval(function(){
				if ( !_this._p100Once ){ // since we report 100% at 99%, we don't want any "VIEW" reports after that (FEC-5269)
					_this.sendAnalytics(playerEvent.VIEW, {
                        playTimeSum: _this.playTimeSum,
                        averageBitrate: _this.rateHandler.getAverage(),
                        bufferTimeSum: _this.bufferTimeSum
                    });
					_this.bufferTime = 0;
				}
				if ( !_this.monitorViewEvents ){
					_this.stopViewTracking();
				}
			},_this.reportingInterval,_this.monitorIntervalObj);

		},

		getEntrySessionId: function(){
			return this.embedPlayer.evaluate('{configProxy.sessionId}') + "-" + this.entryPlayCounter;
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

            if (this.absolutePosition) {
	            statsEvent["absolutePosition"] = this.absolutePosition;
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

			// add playbackContext
			if (mw.getConfig("playbackContext")){
				statsEvent["playbackContext"] = mw.getConfig("playbackContext");
			}

            //Get optional playlistAPI
			this.maybeAddPlaylistId(statsEvent);

            //Shorten the refferer param
            var pageReferrer =  statsEvent[ 'referrer' ];
            var queryPos = pageReferrer.indexOf("?");
            if (queryPos > 0) {
                pageReferrer = pageReferrer.substring(0, queryPos);
            }

            var encodedReferrer = encodeURIComponent(pageReferrer);
            if (encodedReferrer.length > 500) {
                var parser = document.createElement('a');
                parser.href = pageReferrer;
                encodedReferrer = encodeURIComponent(parser.origin);
            }

            statsEvent[ 'referrer' ] = encodedReferrer;

			var eventRequest = {'service' : 'analytics', 'action' : 'trackEvent'};
			$.each(statsEvent , function (event , value) {
				eventRequest[event] = value;
			});
			this.eventIndex += 1;
			this.embedPlayer.triggerHelper( 'analyticsEvent' , statsEvent);
			this.log("Trigger analyticsEvent type = "+statsEvent.eventType);
			this.kClient.doRequest( eventRequest, function(data){
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
            }, true);
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