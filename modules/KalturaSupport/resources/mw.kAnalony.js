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
			"VIEW": 99
		},
		startTime:null,
		reportingInterval : 10000,
		bufferTime : 0,
		eventIndex : 1,
		currentBitRate: -1,
		eventType: 1,
		firstPlay: true,
		viewEventInterval: null,
		monitorIntervalObj:{},

		_p25Once: false,
		_p50Once: false,
		_p75Once: false,
		_p100Once: false,
		hasSeeked: false,
		lastSeek: 0,

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
			this.eventIndex = 1;
			this.bufferTime = 0;
			this.currentBitRate = -1;
			this.addBindings();
	    },
		addBindings : function() {
			var _this = this;
			var playerEvent = this.PlayerEvent;
			this.embedPlayer.bindHelper( 'playerReady' , function () {
				_this.resetPlayerflags();
		        if (this.kalturaContextData && this.kalturaContextData.flavorAssets && this.kalturaContextData.flavorAssets.length === 1){
			        _this.currentBitRate = this.kalturaContextData.flavorAssets[0].bitrate;
		        }
				_this.sendAnalytics(playerEvent.IMPRESSION);
			});

			this.embedPlayer.bindHelper( 'userInitiatedPlay' , function () {
				_this.sendAnalytics(playerEvent.PLAY_REQUEST);
			});

			this.embedPlayer.bindHelper( 'onplay' , function () {
				if ( !this.isInSequence() ){
					_this.sendAnalytics(playerEvent.PLAY);
				}
			});
			this.embedPlayer.bindHelper( 'userInitiatedPause' , function () {
				_this.sendAnalytics(playerEvent.PAUSE);
			});

			this.embedPlayer.bindHelper( 'monitorEvent' , function () {
				_this.updateTimeStats();
			});

			this.embedPlayer.bindHelper( 'seeked' , function (e, seekTarget) {
				_this.hasSeeked = true;
				_this.lastSeek = seekTarget;
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

			this.embedPlayer.bindHelper( 'replayEvent' , function () {
				_this.sendAnalytics(playerEvent.REPLAY);
			});

			this.embedPlayer.bindHelper( 'moderationOpen' , function () {
				_this.sendAnalytics(playerEvent.REPORT_CLICKED);
			});

			this.embedPlayer.bindHelper( 'moderationSubmit' , function (e, reportType) {
				_this.sendAnalytics(playerEvent.REPORT_SUBMITED, { "reportType": reportType});
			});

			this.embedPlayer.bindHelper('onPlayerStateChange', function(e, newState, oldState) {
				if (newState === "pause" ){
					_this.stopViewTracking();
				}
				if (newState === "play"){
					_this.startViewTracking();
				}
			});


//				var _this = this;
//				this.bind('onPlayerStateChange', function(e, newState, oldState) {
//					if (newState === "pause" ){
//						_this.stopLiveEvents();
//						_this.playing = false;
//					}
//					if (newState === "play"){
//						_this.startLiveEvents();
//						_this.playing = true;
//					}
//				});
//				this.bind('bufferStartEvent',function(){
//					_this.bufferStartTime = new Date();
//				});
//				this.bind('bufferEndEvent',function(){
//					_this.calculateBuffer();
//					_this.bufferStartTime = null;
//				});
//				this.bind( 'bitrateChange' ,function( event,newBitrate){
//					_this.currentBitRate = newBitrate;
//				} );
//
//				this.bind( 'liveStreamStatusUpdate' ,function( event, status ){
//					if (!status){
//						//we're offline
//						_this.stopLiveEvents();
//						_this.bufferTime = 0;
//						_this.bufferStartTime = null;
//					} else{
//						 if (_this.playing && !_this.isLiveEventsOn){
//							 _this.startLiveEvents();
//						 }
//					}
//				});
//
//				this.bind( 'movingBackToLive', function() {
//					_this.eventType = 1;
//				} );
//
//				this.bind( 'seeked seeking onpause', function() {
//					if ( _this.getPlayer().isDVR() ) {
//						_this.eventType = 2;
//					}
//				});

		},
		resetPlayerflags:function(){
			this._p25Once = false;
			this._p50Once = false;
			this._p75Once = false;
			this._p100Once = false;
			this.hasSeeked = false;
			this.lastSeek = 0;
		},

		updateTimeStats: function() {
			var _this = this;
			var percent = this.embedPlayer.currentTime / this.embedPlayer.duration;
			var seekPercent = this.lastSeek / this.embedPlayer.duration;
			var playerEvent = this.PlayerEvent;

			// Send updates based on logic present in StatisticsMediator.as
			if ( !this.embedPlayer.isLive() ){
				if( !_this._p25Once && percent >= .25  &&  seekPercent <= .25 ) {
					_this._p25Once = true;
					_this.sendAnalytics(playerEvent.PLAY_25PERCENT);
				} else if ( !_this._p50Once && percent >= .50 && seekPercent < .50 ) {
					_this._p50Once = true;
					_this.sendAnalytics(playerEvent.PLAY_50PERCENT);
				} else if( !_this._p75Once && percent >= .75 && seekPercent < .75 ) {
					_this._p75Once = true;
					_this.sendAnalytics(playerEvent.PLAY_75PERCENT);
				} else if(  !_this._p100Once && percent >= .98 && seekPercent < 1) {
					_this._p100Once = true;
					_this.sendAnalytics(playerEvent.PLAY_100PERCENT);
				}
			}
		},

//		calculateBuffer : function ( closeSession ){
//			var _this = this;
//			//if we want to calculate the buffer till now - first check we have started buffer
//			if (closeSession &&  !_this.bufferStartTime){
//					return;
//			}
//
//			//calc the buffer time
//			this.bufferTime += (new Date() - _this.bufferStartTime) / 1000;
//			if (this.bufferTime > 10){
//				this.bufferTime = 10;
//			}
//			//set the buffer start time to now - in order to continue and counting the current buffer session
//			if ( closeSession ){
//				_this.bufferStartTime = new Date();
//			}
//
//		},

		stopViewTracking :function(){
			var _this = this;
			_this.monitorIntervalObj.cancel = true;
			clearTimeout( _this.viewEventInterval );
			_this.viewEventInterval = null;
		},
		startViewTracking :function(){
			var _this = this;
			var playerEvent = this.PlayerEvent;
			_this.startTime = null;
			_this.kClient = mw.kApiGetPartnerClient( _this.embedPlayer.kwidgetid );
			_this.monitorIntervalObj.cancel = false;
			if ( _this.firstPlay ){
				_this.sendAnalytics(playerEvent.VIEW);
				_this.firstPlay = false;
			}
			_this.smartSetInterval(function(){
				_this.sendAnalytics(playerEvent.VIEW);
			},_this.reportingInterval,_this.monitorIntervalObj);

		},
		sendAnalytics : function(eventType, additionalData){
			console.log("---> send event type: "+eventType+" , data: "+JSON.stringify(additionalData));
			return;
			var _this = this;
			_this.calculateBuffer(true);
			_this.kClient = mw.kApiGetPartnerClient( _this.embedPlayer.kwidgetid );
			if ( _this.embedPlayer.isMulticast && $.isFunction( _this.embedPlayer.getMulticastBitrate ) ) {
				_this.currentBitRate = _this.embedPlayer.getMulticastBitrate();
			}
			var liveStatsEvent = {
				'entryId'     : _this.embedPlayer.kentryid,
				'partnerId'   : _this.embedPlayer.kpartnerid,
				'eventType'   :  eventType,
				'sessionId'   : _this.embedPlayer.evaluate('{configProxy.sessionId}'),
				'eventIndex'  : _this.eventIndex,
				'bufferTime'  : _this.bufferTime,
				'bitrate'     : _this.currentBitRate,
				'referrer'    :  encodeURIComponent( mw.getConfig('EmbedPlayer.IframeParentUrl') ),
				'isLive'      :  1,
				'deliveryType': _this.embedPlayer.streamerType,
				'startTime'   : _this.startTime
			};
			var eventRequest = {'service' : 'liveStats', 'action' : 'collect'};
			$.each(liveStatsEvent , function (index , value) {
				eventRequest[ 'event:' + index] = value;
			});
			_this.bufferTime = 0;
			_this.eventIndex +=1;
			_this.embedPlayer.triggerHelper( 'liveAnalyticsEvent' , liveStatsEvent);
			_this.kClient.doRequest( eventRequest, function(data){
				try {
					if (!_this.startTime ) {
						_this.startTime = data;
					}
				}catch(e){
					mw.log("Failed sync time from server");
				}
			}, true );

		}
	}));
} )( window.mw, window.jQuery );