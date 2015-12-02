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
			"youboraVersion":'2.0.0',
			// by default configured against the "kaltura" house account
			"accountName": 'kaltura',
			"trackEventMonitor": null,
			// default custom params: 
			"param1": "{playerStatusProxy.loadTime}",
			// player id
			"param2": "{configProxy.kw.uiconfid}"
		},
		// the view index is incremented as users views multiple clips in a given play session. 
		// set to -1 by default to have always increment "start" start at zero.
		viewIndex: 0,
		// if beacon requests are sent before youbora is setup queue them: 
		queuedBeacons: [],
		// current ad:
		currentAd:{},
		// timestamp for ad complete: 
		adCompleteTime: null,
		// the active ping interval:
		activePingInterval: null,
		// the flag for active viewcode generation  
		settingUpViewCodeFlag: null,
		
		
		setup: function(){
			var _this = this;
			// init function defines a manual callback ( needs to be set on every new 'stream' )
			this.bind('onChangeMedia', function(){
				// clear ping interval
				clearInterval( _this.activePingInterval );
				_this.activePingInterval = null;
				// on changeMedia clear out viewCode
				_this.viewCode = null;
			});
			this.bind('onChangeMediaDone', function(){
				_this.addBindings();
				_this.setupViewCode();
			});
			this.addBindings();
			this.setupViewCode();
		},
		setupViewCode: function(){
			var _this = this;
			if( this.settingUpViewCodeFlag ){
				this.log( "setupViewCode -> skiped viewCode is already being generated.");
				return ;
			}
			this.settingUpViewCodeFlag = true;
			// setup and view code: 
			var payload = this.getBaseParams();
			payload['pluginVersion'] = this.getPluginVersion();
			var setupUrl = '//nqs.nice264.com/data?' + $.param( payload );
			$.get( setupUrl, function(xmlData){
				_this.host = $(xmlData).find('h').text();
				_this.pingTime = $(xmlData).find('pt').text();
				_this.viewCode = $(xmlData).find('c').text();
				
				_this.log( "setup viewCode: " + _this.viewCode );
				// update async view code generation flag. 
				_this.settingUpViewCodeFlag = false;
				_this.hanldeQueue();
			});
		},
		addBindings:function(){
			var _this = this;
			this.playRequestStartTime = null;
			this.firstPlayDone = false; 
			this.bindFirstPlay();
			// unbind any prev session events:
			this.unbind('bufferEndEvent');
			// track content end:
			this.bind( 'postEnded', function(){
				_this.sendBeacon( 'stop', {
					'diffTime': new Date().getTime() - _this.previusPingTime
				});
				clearInterval( _this.activePingInterval );
				_this.activePingInterval = null;
				// reset the firstPlay flag:
				_this.embedPlayer.firstPlay = true;
				// on end clear out viewCode: 
				_this.viewCode = null;
				_this.bindFirstPlay();
			});
			this.bindAdEvents();
		},
		incrementViewIndex: function(){
			this.viewIndex++;
			this.log( "increment viewIndex: " + this.viewIndex );
		},
		bindAdEvents: function(){
			var _this = this;
			this.unbind('onAdOpen');
			this.bind( 'onAdOpen', function(event, adId, networkName, type, index) {
				_this.currentAd.id = adId;
				_this.currentAd.type = type;
				_this.currentAd.index = index;
				// on midroll or  increment before ad events:
				if( type == 'midroll' ||  type == 'postroll'){
					// do not increment index during ads
					//_this.incrementViewIndex();
				}
				_this.unbind( 'onAdComplete');
				_this.bind( 'onAdComplete', function() {
					_this.adCompleteTime = new Date().getTime();
					/*_this.sendBeacon( 'stop', {
						'diffTime': new Date().getTime() - _this.previusPingTime
					});*/
					// do not increment index during ads
					//_this.incrementViewIndex();
				});
				// wait for ad duration update to trigger ad start event
				_this.unbind( 'AdSupport_AdUpdateDuration');
				_this.bind('AdSupport_AdUpdateDuration', function(e, duration){
					// TODO add YouBora logic
					return false;
					_this.unbind("AdSupport_AdUpdateDuration");
					var adMetadata = _this.embedPlayer.evaluate( '{sequenceProxy.activePluginMetadata}' );
					// issue youbora ad start (  just "start" with ad metadata )
					var beaconObj = {
						'resource': adMetadata.url,
						// 'transcode' // not presently used. 
						'live': _this.embedPlayer.isLive(),
						'properties': JSON.stringify({ 	
							'filename':  adMetadata.type + "_" + ( adMetadata.name || "" ),
							'content_id': adMetadata.ID,
							'content_metadata': {
								"title": adMetadata.title,
								"duration": duration, 
							},
						}),
						'referer': _this.embedPlayer.evaluate('{utility.referrer_url}'),
						'totalBytes': "0",
						'pingTime': _this.pingTime,
					};
					beaconObj = $.extend( beaconObj, _this.getCustomParams() );
					_this.sendBeacon( 'start', beaconObj );
					
					// start ping tracking: 
					_this.bindPingTracking();
				});
			});
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
			this.unbind( 'onpause');
			this.bind( 'onpause', function( playerState ){
				// ignore if pause is within .5 seconds of end of video: 
				if( ( _this.embedPlayer.duration - _this.embedPlayer.currentTime ) < .5  ){
					return ;
				}
				_this.sendBeacon( 'pause' );
				userHasPaused = true;
			});
			// after first play, track resume:
			this.unbind( 'onplay');
			this.bind( 'onplay', function( playerState ){
				// ignore if resume if within .5 seconds of end of video: 
				if( ( _this.embedPlayer.duration - _this.embedPlayer.currentTime ) < .5  ){
					return ;
				}
				if( userHasPaused ){
					_this.sendBeacon( 'resume' );
					userHasPaused = false;
				}
			});
			// track buffer under run 
			var startBufferClock = null;
			// track seek times for seek false positives 
			var seekTime = null;
			// update seek time both at start and end of seek ( sometime buffer end happens before seek end )
			_this.unbind('preSeek');
			_this.bind('preSeek', function(){
				seekTime = new Date().getTime();
			})
			// clear out startBufferClock
			this.bind('postEnded', function(){
				startBufferClock = null;
			});
			this.bind('bufferStartEvent',function(){
				startBufferClock = new Date().getTime();
				_this.log("bufferStartEvent:: startBufferClock: " + startBufferClock);
				_this.unbind('seeked');
				_this.bind('seeked', function(){
					seekTime = new Date().getTime();
				})
				_this.unbind('bufferEndEvent');
				_this.bind('bufferEndEvent',function(){
					if( !startBufferClock || startBufferClock > new Date().getTime() ){
						_this.log("startBufferClock null or predates current time");
						return;
					}
					_this.log("bufferEndEvent:: time since start:" + ( startBufferClock > new Date().getTime() ) );
					// if less then 1000 ms from seek end don't trigger underrun:
					_this.log("bufferEndEvent:: detla from seek time:" + (new Date().getTime() - seekTime ) );
					if( seekTime && (new Date().getTime() - seekTime ) < 1000 ){
						return ;
					}
					// if less then 1000 ms from ad end don't trigger underrun:
					_this.log("bufferEndEvent:: detla from ad end:" + (new Date().getTime() -  _this.adCompleteTime ) );
					if( _this.adCompleteTime && (new Date().getTime() - _this.adCompleteTime ) < 1000  ){
						return ;
					}
					seekTime = null;
					_this.adCompleteTime = null;
					// ignore buffer events during seek: 
					_this.sendBeacon( 'bufferUnderrun', {
						'time': _this.embedPlayer.currentTime,
						'duration': new Date().getTime() - startBufferClock
					});
				});
			});
		},
		bindFirstPlay:function(){
			var _this = this;
			// unbind any existing events: 
			this.unbind( 'bufferStartEvent');
			this.unbind( 'onpause' );
			this.unbind(  'onplay' );

			this.bind('firstPlay', function(){
				_this.unbind('firstPlay');
				// on play send the "start" action: 
				var beaconObj = {
					'resource': _this.getCurrentVideoSrc(),
					// 'transcode' // not presently used. 
					'live': _this.embedPlayer.isLive(),
					'properties': JSON.stringify( _this.getMediaProperties() ),
					'user': _this.getConfig('userId') || "", // should be the active user id,
					'referer': _this.embedPlayer.evaluate('{utility.referrer_url}'),
					'totalBytes': "0", // could potentially be populated if we use XHR for iframe payload + static loader + DASH MSE for segments )
					'pingTime': _this.pingTime,
				};
				beaconObj = $.extend( beaconObj, _this.getCustomParams() );
				_this.sendBeacon( 'start', beaconObj );
				_this.playRequestStartTime = new Date().getTime();
				_this.firstPlayDone = true;
				// start "ping monitoring"
				_this.bindPingTracking();
				_this.bindFirstJoin();
			});
		},
		bindFirstJoin: function(){
			var _this = this;
			// track joinTime ( time between play and positive time )
			this.bind('timeupdate', function(){
				// only track the first timeupdate:
				_this.unbind('timeupdate');
				_this.sendBeacon( 'joinTime', {
					'time': new Date().getTime() - _this.playRequestStartTime,
					'eventTime': _this.embedPlayer.currentTime,
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
			// start previusPingTime at bind time: 
			this.previusPingTime = new Date().getTime();
			this.activePingInterval = setInterval(function(){
				_this.sendBeacon( 'ping',{
					'pingTime': (( new Date().getTime() - _this.previusPingTime )  / 1000 ).toFixed(), // round seconds
					'bitrate': _this.embedPlayer.mediaElement.selectedSource.getBitrate() || -1,
					'time': _this.embedPlayer.currentTime,
					//'totalBytes':"0", // value is only sent along with the dataType parameter. If the bitrate parameter is sent, then this one is not needed.
					//'dataType': "0", // Kaltura does not really do RTMP streams any more. 
					'diffTime': new Date().getTime() - _this.previusPingTime
					// 'nodeHost' //String that indicates the CDN� Node Host
				});
				// update previusPingTime 
				_this.previusPingTime = new Date().getTime();
			}, this.pingTime * 1000 );
		}, 
		getMediaProperties: function(){
			var _this = this;
			// evaluate each content metadata property: 
			var contentMetadata = this.getConfig('contentMetadata');
			$.each( contentMetadata, function(k,v){
				contentMetadata[k] = _this.embedPlayer.evaluate( v );
			});
			return {
				'filename': this.getEntryProperty( 'name' ),
				'content_id': this.getEntryProperty( 'id'),
				'content_metadata': contentMetadata,
				'transaction_type': 'Free', // should use 'rent', 'subscription', 'EST' as available,
				'quality': this.getQaulity(),
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
			if( source.getHeight() > 480 ){
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
			var vid = this.embedPlayer.getPlayerElement();
			if( vid && vid.src ){
				return vid.src;
			}
			// else just return the normal content source:
			return this.embedPlayer.getSrc();
		},
		inAd: function(){
			return !! this.embedPlayer.evaluate( '{sequenceProxy.isInSequence}' );
		}

	}))
	
})(window.mw, window.jQuery);