(function (mw, $) {
	"use strict";

	/**
	 * Youbora analytics implementation based on their open REST API
	 * http://support.youbora.com/hc/en-us/article_attachments/201042582/Youbora_Analytics_-_Player_Plugin_Open_REST_API_-_v2.1.0.pdf
	 */
	
	mw.PluginManager.add( 'youbora', mw.KBasePlugin.extend( {

		defaultConfig: {
			"contentMetadata": {
				"title": "{mediaProxy.entry.name}",
				"genre": "", 
				"language": "", 
				"year": "",
				"cast": "", 
				"director": "", 
				"owner": "", 
				"duration": "{mediaProxy.entry.duration}", 
				"parental": "", 
				"price": "", 
				"rating": "", 
				"audioType": "", 
				"audioChannels": ""
			},
			"userId": null,
			"youboraVersion":'2.2.1',
			"bufferUnderrunThreshold": 1000,
			// by default configured against the "kaltura" house account
			"accountName": 'kaltura',
			"trackEventMonitor": null,
			// default custom params: 
			"param1": "{playerStatusProxy.loadTime}",
			// player id
			"param2": "{configProxy.kw.uiconfid}"
		},
		// the view index is incremented as users views multiple clips in a given play session.
		viewIndex: 0,
		// if beacon requests are sent before youbora is setup queue them: 
		queuedBeacons: [],
		// the active ping interval:
		activePingInterval: null,
		// the flag for active viewcode generation  
		settingUpViewCodeFlag: null,
		viewCode: null,
		currentBitRate: -1,
		bindPostfix: '.Youbora',
		
		setup: function(){
			var _this = this;
			this.currentBitRate = -1;
			// init function defines a manual callback ( needs to be set on every new 'stream' )
			this.bind('onChangeMedia', function(){
				// clear ping interval
				clearInterval( _this.activePingInterval );
				_this.activePingInterval = null;
				// dispatch stop beacon if changing media during playback in order to close the session at Youbora
				if (_this.embedPlayer.currentState !== 'end'){
					_this.sendBeacon( 'stop', {
						'diffTime': new Date().getTime() - _this.previusPingTime
					});
				}
				// unbind all events
				_this.unbind( _this.bindPostfix );
				if (_this.firstPlayDone){
					_this.incrementViewIndex();
				}
			});
			this.bind('playerReady', function(){
				if ( _this.kalturaContextData && _this.kalturaContextData.flavorAssets && _this.kalturaContextData.flavorAssets.length === 1 ){
					_this.currentBitRate = _this.kalturaContextData.flavorAssets[0].bitrate;
				}
				_this.addBindings();
			});
			this.setupViewCode();
		},
		setupViewCode: function(){
			var _this = this;
			if( this.settingUpViewCodeFlag || this.viewCode !== null){
				this.log( "setupViewCode -> skipped viewCode is already being generated.");
				return ;
			}
			this.settingUpViewCodeFlag = true;
			// setup and view code: 
			var payload = this.getBaseParams();
			payload['pluginVersion'] = this.getPluginVersion();
			payload['system'] = this.getConfig('accountName');
			var setupUrl = '//nqs.nice264.com/data?' + $.param( payload );
			$.get( setupUrl, function(xmlData){
				_this.host = $(xmlData).find('h').text();
				_this.pingTime = $(xmlData).find('pt').text();
				_this.viewCode = $(xmlData).find('c').text();
				
				_this.log( "setup viewCode: " + _this.viewCode );
				// update async view code generation flag. 
				_this.settingUpViewCodeFlag = false;
				_this.hanldeQueue();
				// in case playback already started (autoplay) and ping interval wasn't set yet (as it didn't have a pingTime when playback started) - start ping interval
				if (!_this.activePingInterval && _this.firstPlayDone){
					_this.activePingInterval = setInterval(function(){
						_this.sendPing();
					}, _this.pingTime * 1000);
				}
			});
		},
		addBindings:function(){
			var _this = this;
			this.unbind( this.bindPostfix );
			this.playRequestStartTime = null;
			this.firstPlayDone = false; 
			this.bindFirstPlay();

			// track content end:
			this.bind( 'postEnded' + this.bindPostfix, function(){
				_this.sendBeacon( 'stop', {
					'diffTime': new Date().getTime() - _this.previusPingTime
				});
				clearInterval( _this.activePingInterval );
				_this.activePingInterval = null;
				// reset the firstPlay flag:
				_this.embedPlayer.firstPlay = true;
				_this.firstPlayDone = false;
				_this.unbind( _this.bindPostfix );
				_this.incrementViewIndex();
				_this.addBindings();
			});

			// handle errors
			this.bind('embedPlayerError' + this.bindPostfix + ' mediaLoadError'  + this.bindPostfix + ' playerError' + this.bindPostfix, function () {
				var errorMsg = _this.embedPlayer.getError() ? _this.embedPlayer.getError().message : _this.embedPlayer.getErrorMessage();
				_this.sendBeacon( 'error', {
					'player': 'kaltura-player-v' + MWEMBED_VERSION,
					'errorCode': '-1', // currently we don't support error codes
					'msg': errorMsg,
					'resource': _this.getCurrentVideoSrc(),
					// 'transcode' // not presently used.
					'live': _this.embedPlayer.isLive(),
					'properties': JSON.stringify( _this.getMediaProperties() ),
					'user': _this.getConfig('userId') || "", // should be the active user id,
					'referer': _this.embedPlayer.evaluate('{utility.referrer_url}'),
					'totalBytes': "0", // could potentially be populated if we use XHR for iframe payload + static loader + DASH MSE for segments )
					'pingTime': _this.pingTime
				});
			});

			this.bind( 'bitrateChange' + this.bindPostfix ,function( event, newBitrate){
				_this.currentBitRate = newBitrate;
			} );
			// events for capturing the bitrate of the currently playing source
			this.bind( 'SourceSelected' + this.bindPostfix , function (e, source) {
				if (source.getBitrate()){
					_this.currentBitRate = source.getBitrate();
				}
			});
			this.bind( 'sourceSwitchingEnd' + this.bindPostfix , function (e, newSource) {
				if (newSource.newBitrate){
					_this.currentBitRate = newSource.newBitrate;
				}
			});
		},
		incrementViewIndex: function(){
			this.viewIndex++;
			this.log( "increment viewIndex: " + this.viewIndex );
		},
		getCustomParams: function(){
			var paramObj = {};
			for( var i = 1; i < 10; i++ ){
				// see if the param config is populated ( don't use getConfig evaluated value, as it could evaluate to false ) 
				if( this.embedPlayer.getRawKalturaConfig( "youbora", "param" + i ) ){
					paramObj[ "param" + i ] = this.getConfig( "param" + i );
				}
			}
			return paramObj;
		},
		bindPlaybackEvents: function(){
			var _this = this;
			// track pause: 
			var userHasPaused = false;
			this.bind( 'userInitiatedPause' + this.bindPostfix, function( playerState ){
				// ignore if pause is within .5 seconds of end of video of after change media:
				if ( Math.abs(_this.embedPlayer.firstPlay || ( _this.embedPlayer.duration - _this.embedPlayer.currentTime )) < .5  ){
					return ;
				}
				_this.sendBeacon( 'pause' );
				userHasPaused = true;
			});
			// after first play, track resume:
			this.bind( 'userInitiatedPlay' + this.bindPostfix, function( playerState ){
				// ignore if resume within .5 seconds of end of video:
				if( ( Math.abs(_this.embedPlayer.duration - _this.embedPlayer.currentTime )) < .5  ){
					return ;
				}
				if( userHasPaused ){
					_this.sendBeacon( 'resume' );
					userHasPaused = false;
				}
			});

			// handle buffer underrun tracking
			var checkBufferUnderrun = null;
			var shouldReprotBufferUnderrun = false;
			var bufferStartTime = null;
			this.bind('bufferStartEvent' + this.bindPostfix,function(){
				if (!_this.embedPlayer.seeking){
					var startBufferPlayerTime = _this.embedPlayer.currentTime;
					bufferStartTime = Date.now();
					if (checkBufferUnderrun){
						clearInterval(checkBufferUnderrun);
						checkBufferUnderrun = null;
					}
					checkBufferUnderrun = setInterval(function(){
						if (_this.embedPlayer.currentTime === startBufferPlayerTime || _this.embedPlayer.isLive()){
							shouldReprotBufferUnderrun = true;
						}else{
							startBufferPlayerTime = _this.embedPlayer.currentTime;
						}
					},_this.getConfig("bufferUnderrunThreshold"));
				}
			});

			this.bind('bufferEndEvent' + this.bindPostfix,function(e){
				clearInterval(checkBufferUnderrun);
				checkBufferUnderrun = null;
				if ( e.type === 'bufferEndEvent' && shouldReprotBufferUnderrun ){
					shouldReprotBufferUnderrun = false;
					_this.sendBeacon( 'bufferUnderrun', {
						'time': _this.embedPlayer.currentTime,
						'duration': Date.now() - bufferStartTime
					});
				}
			});

			this.bind('onAdPlay' + this.bindPostfix,function(e){
				clearInterval(checkBufferUnderrun);
				checkBufferUnderrun = null;
			});
		},

		bindFirstPlay:function(){
			var _this = this;
			var sendStartEvent = function(){
				var beaconObj = {
					'player': 'kaltura-player-v' + MWEMBED_VERSION,
					'resource': _this.getCurrentVideoSrc(),
					// 'transcode' // not presently used.
					'live': _this.embedPlayer.isLive(),
					'properties': JSON.stringify( _this.getMediaProperties() ),
					'user': _this.getConfig('userId') || "", // should be the active user id,
					'referer': _this.embedPlayer.evaluate('{utility.referrer_url}'),
					'totalBytes': "0", // could potentially be populated if we use XHR for iframe payload + static loader + DASH MSE for segments )
					'pingTime': _this.pingTime
				};
				beaconObj = $.extend( beaconObj, _this.getCustomParams() );
				_this.sendBeacon( 'start', beaconObj );
				_this.bindPingTracking(); // start "ping monitoring"
			}
			this.bind('AdSupport_PreSequence' + this.bindPostfix, function(){
				if (!_this.firstPlayDone){
					sendStartEvent();
					_this.firstPlayDone = true;
				}
			});

			this.bind('firstPlay' + this.bindPostfix, function(){
				_this.playRequestStartTime = new Date().getTime();
				if (!_this.firstPlayDone){
					// on play send the "start" action:
					sendStartEvent();
					_this.firstPlayDone = true;
					_this.bindFirstJoin();
				}else{
					_this.bindFirstJoin();
				}
			});
		},
		bindFirstJoin: function(){
			var _this = this;
			this.unbind('playing');
			// track joinTime ( time between play and positive time )
			this.bind('playing', function(){
				// only track the first playing event:
				_this.unbind('playing');
				_this.sendBeacon( 'joinTime', {
					'time': new Date().getTime() - _this.playRequestStartTime,
					'eventTime': _this.embedPlayer.currentTime
				});
				_this.bindPlaybackEvents();
			});
		},
		bindPingTracking: function(){
			var _this = this;
			// don't start ping tracking if already active
			if( this.activePingInterval ){
				return ;
			}
			// if pingTime was already retrieved from the server, setup the ping interval. If not, it will be set once the pingTime is retrieved from the server
			if (this.pingTime){
				this.activePingInterval = setInterval(function(){
					_this.sendPing();
				}, this.pingTime * 1000);
			}
			this.sendPing();
		},
		sendPing: function(){
			if ( this.embedPlayer.isMulticast && $.isFunction( this.embedPlayer.getMulticastBitrate ) ) {
				this.currentBitRate = this.embedPlayer.getMulticastBitrate();
			}
			var bitrate = this.embedPlayer.mediaElement.selectedSource.getBitrate();
			if (this.currentBitRate === -1 && bitrate > 0){
				this.currentBitRate = bitrate;
			}
			var pingTime = this.previusPingTime ? (( new Date().getTime() - this.previusPingTime )  / 1000 ).toFixed() : 0;
			this.sendBeacon( 'ping',{
				'pingTime': pingTime, // round seconds
				'bitrate': this.currentBitRate !== -1 ? this.currentBitRate * 1024 : -1,
				'time': this.embedPlayer.currentTime,
				//'totalBytes':"0", // value is only sent along with the dataType parameter. If the bitrate parameter is sent, then this one is not needed.
				//'dataType': "0", // Kaltura does not really do RTMP streams any more.
				'diffTime': new Date().getTime() - this.previusPingTime
				// 'nodeHost' //String that indicates the CDN� Node Host
			});
			// update previusPingTime
			this.previusPingTime = new Date().getTime();
		},
		getMediaProperties: function(){
			var _this = this;
			// evaluate each content metadata property: 
			var contentMetadata = this.getConfig('contentMetadata');
			$.each( contentMetadata, function(k,v){
				contentMetadata[k] = _this.embedPlayer.evaluate( v );
			});
			contentMetadata["title"] = this.embedPlayer.evaluate("{mediaProxy.entry.name}");
			contentMetadata["duration"] = this.embedPlayer.evaluate("{mediaProxy.entry.duration}");
			return {
				'filename': this.getEntryProperty( 'name' ),
				'content_id': this.getEntryProperty( 'id'),
				'content_metadata': contentMetadata,
				'transaction_type': 'Free', // should use 'rent', 'subscription', 'EST' as available,
				'quality': this.getQaulity()
				//'content_type': ? // Trailer, Episode, Movie,
				//'device': this.getDeviceObj() // not really easily populated.
			}
		},
		getDeviceObj: function(){
			return {
				'manufacturer': "",
				'type': "",
				'year': "", 
				'firmware': ""
			}
		},
		/**
		 * returns HD or SD based on media size being above 480P
		 */
		getQaulity: function(){
			var source = this.getPlayer().mediaElement.selectedSource;
			if( source && source.getHeight() > 480 ){
				return 'HD'
			}
			return 'SD'
		},
		getEntryProperty: function( prop ){
			return this.embedPlayer.evaluate( '{mediaProxy.entry.' + prop + '}' ); 
		},
		getBaseParams: function(){
			var parms = {
				'randomNumber': Math.floor(Math.random()*90000) + 10000 // 5 digit random number.
			};
			if( this.getViewCode() ){
				parms['code'] = this.getViewCode();
			}
			return parms;
		},
		getPluginVersion:function(){
			var playerVersion = 'kaltura-player-v' + MWEMBED_VERSION;
			return this.getConfig('youboraVersion') + '_' + playerVersion;
		},
		hanldeQueue: function(){
			while( this.queuedBeacons.length ){
				var beacon = this.queuedBeacons.shift();
				this.sendBeacon( beacon[0], beacon[1] );
			}
		},
		sendBeacon: function( action, payload ){
			// queue if we are not ready for beacons: 
			if( this.viewCode === null ){
				this.queuedBeacons.push( [action, payload ] );
				this.setupViewCode();
				return ;
			}
			if( !payload ){
				payload = {};
			}
			payload = $.extend({}, this.getBaseParams(), payload );
			// special case only send pluginVersion on start and error beacons: 
			if( action == 'start' || action == 'error' ){
				payload['pluginVersion'] = this.getPluginVersion();
			}
			// system is only sent for data, start, or error
			if( action == 'data' || action == 'start' || action == 'error'){
				payload['system'] = this.getConfig('accountName');
			}
			
			if ( this.getConfig( 'trackEventMonitor' ) ) {
				try{
					window.parent[ this.getConfig( 'trackEventMonitor' ) ]( action, JSON.stringify( payload ) );
				} catch(e){
					// error could not log event.
				}
			}
			this.log( action + " :: " + JSON.stringify( payload ) );
			var beaconUrl = '//' + this.host + '/' + action + '?' +  $.param( payload );
			
			// issue a get for the beacon url
			$.get( beaconUrl );
		},
		getViewCode: function(){
			if( typeof this.viewCode != 'string' ){
				return null;
			}
			return this.viewCode + "_" + this.viewIndex;
		},
		getCurrentVideoSrc: function(){
			return this.embedPlayer.getSrc();
		}

	}))
	
})(window.mw, window.jQuery);