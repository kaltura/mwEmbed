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
				"PLAY_25PERCENT": 4,
				"PLAY_50PERCENT": 5,
				"PLAY_75PERCENT": 6,
				"PLAY_100PERCENT": 7,
				"EDIT": 8,
				"SHARE": 9,
				"DOWNLOAD": 10,
				"REPORT": 11,
				"ENTER_FULLSCREEN": 12,
				"EXIT_FULLSCREEN": 13,
				"PAUSE": 14,
				"REPLAY": 15,
				"SEEK": 16,
				"VIEW": 20
			},
			startTime:null,
			reportingInterval : 10000,
			bufferTime : 0,
			eventIndex : 1,
			currentBitRate: -1,
			eventType: 1,
			playing:false,
			firstPlay: true,
			liveEventInterval: null,
			monitorIntervalObj:{},

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
					_this.liveEventInterval = window.setTimeout(function() { instance(); }, nextSpeed);
				};

				//now kick everything off with the first timer instance
				_this.liveEventInterval = window.setTimeout(function() { instance(); }, speed);
			},

			setup: function( ) {
				this.addBindings( );
//				this.embedPlayer.bindHelper( 'playerReady' , function () {
//			   	    if ( _this.embedPlayer.isLive() || _this.getConfig('forceLoad') ) {
//				        _this.eventIndex = 1;
//				        _this.bufferTime = 0;
//				        _this.currentBitRate = -1;
//						_this.addBindings();
//				        if (_this.embedPlayer &&
//					        _this.embedPlayer.kalturaContextData &&
//					        _this.embedPlayer.kalturaContextData.flavorAssets &&
//					        _this.embedPlayer.kalturaContextData.flavorAssets.length === 1){
//					        _this.currentBitRate = _this.embedPlayer.kalturaContextData.flavorAssets[0].bitrate;
//				        }
//					}
//				} );
		    },
			addBindings : function() {
				var _this = this;
				var playerEvent = this.PlayerEvent;
				this.embedPlayer.bindHelper( 'playerReady' , function () {
					_this.sendAnalytics(playerEvent.IMPRESSION);
				});

				this.embedPlayer.bindHelper( 'userInitiatedPlay' , function () {
					_this.sendAnalytics(playerEvent.PLAY_REQUEST);
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
				//set the buffer start time to now - in order to continue and counting the current buffer session
				if ( closeSession ){
					_this.bufferStartTime = new Date();
				}

			},

			stopLiveEvents :function(){
				var _this = this;
				_this.isLiveEventsOn = false;
				_this.monitorIntervalObj.cancel = true;
				clearTimeout( _this.liveEventInterval );
				_this.liveEventInterval = null;
			},
			startLiveEvents :function(){
				var _this = this;
				_this.startTime = null;
				if ( _this.isLiveEventsOn )  {
					return;
				}
				_this.isLiveEventsOn = true;
				_this.kClient = mw.kApiGetPartnerClient( _this.embedPlayer.kwidgetid );
				_this.monitorIntervalObj.cancel = false;
				if ( _this.firstPlay ){
					_this.sendAnalytics();
					_this.firstPlay = false;
				}
				_this.smartSetInterval(function(){
					_this.sendAnalytics();
				},_this.reportingInterval,_this.monitorIntervalObj);

			},
			sendAnalytics : function(eventType){
				console.log("---> send event type: "+eventType);
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
		})
	);
} )( window.mw, window.jQuery );