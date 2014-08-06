/**
 * Created by itayk on 8/4/14.
 */
( function( mw, $ ) {
	"use strict";

	mw.PluginManager.add( 'liveAnalytics' , mw.KBasePlugin.extend( {

			defaultConfig: {
				'forceLoad': false
			},
			reportingInterval : 10000,
			bufferTime : 0,
			eventIndex :1,
			currentBitRate:-1,
			setup: function( ) {
			   var _this = this;
				_this.removeBindings( );
				this.embedPlayer.bindHelper( 'playerReady' , function () {
			   	    if ( _this.embedPlayer.isLive() || _this.getConfig('forceLoad') ) {
				        _this.eventIndex = 1;
				        _this.bufferTime = 0;
				        _this.currentBitRate = -1;
						_this.addBindings();
					}
				} );
		   },
			addBindings : function() {
				var _this = this;
				this.bind('onPlayerStateChange', function(e, newState, oldState) {
					if (newState === "pause" ){
						_this.stopLiveEvents();
					}
					if (newState === "play"){
						_this.startLiveEvents();
					}
				});
				this.bind('bufferStartEvent',function(){
					_this.bufferStartTime = new Date();
				});
				this.bind('bufferEndEvent',function(){
					_this.calculateBuffer();
					_this.bufferStartTime = null;
				});
				this.bind( 'bitrateChange' ,function(event,newBitrate){
					_this.currentBitRate = newBitrate;
				} );
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
				clearInterval( _this.liveEventInterval );
				_this.liveEventInterval = null;
			},
			startLiveEvents :function(){
				var _this = this;
				_this.isLiveEventsOn = true;
				_this.kClient = mw.kApiGetPartnerClient( _this.embedPlayer.kwidgetid );
				clearInterval( _this.liveEventInterval );
				this.sendLiveAnalytics();
				_this.liveEventInterval = setInterval(function(){
					_this.sendLiveAnalytics();
				},_this.reportingInterval);

			},
			sendLiveAnalytics : function(){
				var _this = this;
				_this.calculateBuffer(true);
				_this.kClient = mw.kApiGetPartnerClient( _this.embedPlayer.kwidgetid );
				var liveStatsEvent = {
					'entryID'     : _this.embedPlayer.kentryid,
					'partnerID'   : _this.embedPlayer.kpartnerid,
					'eventType'  :  1,
					'sessionID'   : _this.embedPlayer.evaluate('{configProxy.sessionId}'),
					'eventIndex'  : _this.eventIndex,
					'bufferTime'  : _this.bufferTime,
					'bitrate'     : _this.currentBitRate,
					'referrer'    :  encodeURIComponent( mw.getConfig('EmbedPlayer.IframeParentUrl') ),
					'isLive'      :  1,
					'deliveryType': _this.embedPlayer.streamerType
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