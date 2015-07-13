mw.kalturaPluginWrapper(function() {

	mw.PluginManager.add( 'tvpapiAnalytics', mw.KBasePlugin.extend({

		defaultConfig: {
			mediaHitInterval: 30
		},

		isPlaying: false,
		concurrentFlag: false,
		fileId: null,
		didFirstPlay: false,
		mediaHitInterval: null,

		setup: function() {
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
			this.sendPostRequest('MediaMark', params);
		},

		sendMediaHit: function() {
			// Do not send media hit in the following conditions: concurrent limit, current time not updated (might be error)
			if(this.concurrentFlag || this.getPlayer().getPlayerElementTime() === 0 ){
				return;
			}
			this.sendPostRequest('MediaHit', this.getBaseParams());
		},

		getProxyData: function( key ) {
			return this.getPlayer().getKalturaConfig('proxyData', key);
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
			return {
				"initObj": this.getProxyData('initObj'),
				"mediaType": 0,
				"iMediaID": this.getProxyData('MediaID'),
				"iFileID": this.fileId,
				"iLocation": this.getCurrentTime()
			};
		},

		sendPostRequest: function( service, params ) {
			// Do not send requests during ad playback
			if( !this.getPlayer().isInSequence() ) {
				this.getPlayer().triggerHelper(service, [service, params]);

				this.log('sendPostRequest: request: ' + service, params);
				var _this = this;
				$.ajax({
					url: this.getPlayer().getFlashvars('TVPAPIBaseUrl') + service,
					data: JSON.stringify(params),
					crossDomain: true,
					type: 'POST',
					dataType: 'text',
					success: function (data) {
						_this.log('sendPostRequest: response for ' + service + ': ' + data);
						if (data == '"Concurrent"') {
							_this.concurrentFlag = true;
							_this.getPlayer().triggerHelper('tvpapiShowConcurrent');
						}
					},
					error: function (xhr, textStatus, errorThrown) {
						_this.log('sendPostRequest error', errorThrown);
					}
				});
			}
		}

	}));
});