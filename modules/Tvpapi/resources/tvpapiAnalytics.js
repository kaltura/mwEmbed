(function (mw, $) {
	"use strict";

	var tvpapiAnalytics = mw.tvpapiRequest.extend({

		defaultConfig: {
			mediaHitInterval: 30,
			startTime:null,
			useNonDvrLinearMediaHits:false
		},

		isPlaying: false,
		concurrentFlag: false,
		fileId: null,
		didFirstPlay: false,
		mediaHitInterval: null,
		useNonDvrLinearMediaHits: false,

		setup: function() {
			if (this.getConfig("startTime")){
				this.continueTime = this.getConfig("startTime");
				this.playFromContinue = true;
			}
			this.bindEvents();
			this.bindContinueToTime();
		},

		bindEvents: function() {
			var _this = this;

			this.bind('playerReady', function(){
				_this.didFirstPlay = false;
				_this.fileId = _this.getPlayer().getSource() ? _this.getPlayer().getSource().assetid : null;
			});

			this.bind('firstPlay', function(){
				_this.didFirstPlay = true;
				_this.sendMediaMark('first_play');
			});

			this.bind('onplay', function(){
				_this.isPlaying = true;
				_this.startMediaHitInterval();
				_this.sendMediaMark('play');
			});

			this.bind('onpause', function(){
				_this.isPlaying = false;
				// During player start up, the player trigger "onpause" events
				// We use didFirstPlay flag to ignore them
				if( _this.didFirstPlay ) {
					_this.sendMediaMark('pause');
				}
			});

			this.bind('onEndedDone', function(){
				_this.isPlaying = false;
				_this.sendMediaMark('finish');
			});

			this.bind('widgetLoaded', function(){
				_this.sendMediaMark('load');
			});

			this.bind('SourceChange', function(){
				if(!_this.didFirstPlay) return;
				_this.sendMediaMark('bitrate_change');
			});

			this.bind('onChangeMedia', function(){
				_this.didFirstPlay = false;
			});
		},

		bindContinueToTime: function() {
			this.bind('tvpapiContinueToTime', $.proxy(function(e, seekTime){
				this.playFromContinue = true;
				this.continueTime = seekTime;
			},this));
			this.bind('seeked', $.proxy(function(){
				this.playFromContinue = false;
			},this));
		},

		startMediaHitInterval: function() {
			var _this = this;
			this.clearMediaHitInterval();
			this.mediaHitInterval = setInterval(function(){
				if( _this.isPlaying ) {
					_this.sendMediaHit();
					_this.playFromContinue = false;
				}
			}, this.getConfig('mediaHitInterval') * 1000 );
		},

		clearMediaHitInterval: function() {
			clearInterval(this.mediaHitInterval);
			this.mediaHitInterval = null;
		},

		sendMediaMark: function( action ) {
			var params = this.getBaseParams();
			params['Action'] = action;
			this.report('MediaMark', params);
		},

		sendMediaHit: function() {
		    var isLive = this.getPlayer().isLive();
		    var isDvr = this.getPlayer().isDVR();

			// Do not send media hit in the following conditions: concurrent limit, current time not updated (might be error) when media is not (live and not dvr and flag is set)
			if(this.concurrentFlag || (!(isLive && !isDvr && this.useNonDvrLinearMediaHits) && this.getPlayer().getPlayerElementTime() === 0) ){
			    return;
			}
			this.report('MediaHit', this.getBaseParams());
		},

		getCurrentTime: function() {
			var currentTime;
			if( this.playFromContinue ) {
				currentTime = this.continueTime;
			} else {
				currentTime = Math.round(this.getPlayer().getPlayerElementTime());
			}
			return currentTime;
		},

		getBaseParams: function() {
		    var isLive = this.getPlayer().isLive();
            var isDvr = this.getPlayer().isDVR();
			return {
				"initObj": this.getInitObj(),
				"mediaType": 0,
				"iMediaID": this.getProxyConfig('MediaID'),
				"iFileID": this.fileId,
				"iLocation": (isLive && !isDvr && this.useNonDvrLinearMediaHits) ? 0 : this.getCurrentTime()
			};
		},

		report: function(service, data){
			// Do not send requests during ad playback
			if( !this.getPlayer().isInSequence() ) {
				var printableData =  JSON.stringify(data, null, '\t');
				//Emit the report API event
				this.getPlayer().triggerHelper(service, data);
				this.log('report: ' + service + ": " + printableData);
				this.restMethod = service;
				var url = this.getRequestUrl();
				if (url) {

					var _this = this;

					this.doRequest(url, data).then(
							function (data) {
								_this.log('response for ' + service + ': ' + data);
								if (data == 'Concurrent') {
									_this.concurrentFlag = true;
									_this.getPlayer().triggerHelper('tvpapiShowConcurrent');
								}
							},
							function (xmlHttpRequest, status, errorThrown) {
								_this.log('sendPostRequest error: ' + errorThrown);
							},
							null
					);
				}
			}

			return false;
		}
	});
	mw.PluginManager.add( 'tvpapiAnalytics', tvpapiAnalytics);
})(window.mw, window.jQuery);
