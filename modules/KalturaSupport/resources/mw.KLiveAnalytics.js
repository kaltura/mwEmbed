/**
 * Created by itayk on 8/4/14.
 */
( function( mw, $ ) {
	"use strict";

	mw.PluginManager.add( 'liveAnalytics' , mw.KBasePlugin.extend( {

			defaultConfig: {
				'forceLoad': false
			},
			startTime:null,
			reportingInterval : 10000,
			bufferTime : 0,
			eventIndex :1,
			currentBitRate:-1,
			playing:false,
			monitorIntervalObj:{},
			smartSetInterval:function(callback,time,monitorObj) {
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
					window.setTimeout(function() { instance(); }, nextSpeed);
				};

				//now kick everything off with the first timer instance
				window.setTimeout(function() { instance(); }, speed);
			},
			setup: function( ) {
			   var _this = this;
				_this.removeBindings( );
				this.embedPlayer.bindHelper( 'playerReady' , function () {
			   	    if ( _this.embedPlayer.isLive() || _this.getConfig('forceLoad') ) {
				        _this.eventIndex = 1;
				        _this.bufferTime = 0;
				        _this.currentBitRate = -1;
						_this.addBindings();
				        if (_this.embedPlayer &&
					        _this.embedPlayer.kalturaContextData &&
					        _this.embedPlayer.kalturaContextData.flavorAssets &&
					        _this.embedPlayer.kalturaContextData.flavorAssets.length === 1){
					        _this.currentBitRate = _this.embedPlayer.kalturaContextData.flavorAssets[0].bitrate;
				        }
					}
				} );
		   },
			addBindings : function() {
				var _this = this;
				this.bind('onPlayerStateChange', function(e, newState, oldState) {
					if (newState === "pause" ){
						_this.stopLiveEvents();
						_this.playing = false;
					}
					if (newState === "play"){
						_this.startLiveEvents();
						_this.playing = true;
					}
				});
				this.bind('bufferStartEvent',function(){
					_this.bufferStartTime = new Date();
				});
				this.bind('bufferEndEvent',function(){
					_this.calculateBuffer();
					_this.bufferStartTime = null;
				});
				this.bind( 'bitrateChange' ,function( event,newBitrate){
					_this.currentBitRate = newBitrate;
				} );

				this.bind( 'liveStreamStatusUpdate' ,function( event, status ){
					if (!status){
						//we're offline
						_this.stopLiveEvents();
						_this.bufferTime = 0;
						_this.bufferStartTime = null;
					} else{
						 if (_this.playing && !_this.isLiveEventsOn){
							 _this.startLiveEvents();
						 }
					}
				});
			},
			calculateBuffer : function ( closeSession ){
				var _this = this;
				//if we want to calculate the buffer till now - first check we have started buffer
				if (closeSession &&  !_this.bufferStartTime){
						return;
				}

				//calc the buffer time
				this.bufferTime += (new Date() - _this.bufferStartTime) / 1000;

				//set the buffer start time to now - in order to continue and counting the current buffer session
				if ( closeSession ){
					_this.bufferStartTime = new Date();
				}

			},
			removeBindings : function (  ){
				this.unbind( "" );
			},
			stopLiveEvents :function(){
				var _this = this;
				_this.isLiveEventsOn = false;
				_this.monitorIntervalObj.cancel = true;
				_this.liveEventInterval = null;
			},
			startLiveEvents :function(){
				var _this = this;
				_this.isLiveEventsOn = true;
				_this.startTime = new Date().getTime();
				_this.kClient = mw.kApiGetPartnerClient( _this.embedPlayer.kwidgetid );
				_this.monitorIntervalObj.cancel = false;
				this.sendLiveAnalytics();
				_this.smartSetInterval(function(){
					_this.sendLiveAnalytics();
				},_this.reportingInterval,_this.monitorIntervalObj);

			},
			sendLiveAnalytics : function(){
				var _this = this;
				_this.calculateBuffer(true);
				_this.kClient = mw.kApiGetPartnerClient( _this.embedPlayer.kwidgetid );
				var liveStatsEvent = {
					'entryId'     : _this.embedPlayer.kentryid,
					'partnerId'   : _this.embedPlayer.kpartnerid,
					'eventType'  :  1,
					'sessionId'   : _this.embedPlayer.evaluate('{configProxy.sessionId}'),
					'eventIndex'  : _this.eventIndex,
					'bufferTime'  : _this.bufferTime,
					'bitrate'     : _this.currentBitRate,
					'referrer'    :  encodeURIComponent( mw.getConfig('EmbedPlayer.IframeParentUrl') ),
					'isLive'      :  1,
					'deliveryType': _this.embedPlayer.streamerType,
					'startTime'   : _this.startTime
				};
				var eventRequest = {'service' : 'LiveStats', 'action' : 'collect'};
				$.each(liveStatsEvent , function (index , value) {
					eventRequest[ 'event:' + index] = value;
				});
				_this.bufferTime = 0;
				_this.eventIndex +=1;
				_this.embedPlayer.triggerHelper( 'liveAnalyticsEvent' , liveStatsEvent);
				_this.kClient.doRequest( eventRequest );

			}
		})
	);
} )( window.mw, window.jQuery );