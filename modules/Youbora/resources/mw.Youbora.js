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
			"youboraVersion":'2.0.0',
			// by default configured against the "kaltura" house account
			"accountName": 'kaltura',
			"trackEventMonitor": null,
			// default custom params: 
			"param1": "{playerStatusProxy.loadTime}"
		},
		// the view index is incremented as users views multiple clips in a given play session. 
		viewIndex: 0,
		// if beacon requests are sent before youbora is setup queue them: 
		queuedBeacons: [],
		
		setup: function(){
			var _this = this;
			// init function defines a manual callback ( needs to be set on every new 'stream' )
			this.bind('changeMedia', function(){
				// if viewing content in a single session increment the view index
				_this.viewIndex++;
			});
			// get the data setup: 
			var setupUrl = '//nqs.nice264.com/data' + this.getBaseParams();
			$.get( setupUrl, function(xmlData){
				_this.host = $(xmlData).find('h').text();
				_this.pingTime = $(xmlData).find('pt').text();
				_this.viewCode = $(xmlData).find('c').text();
				_this.hanldeQueue()
			});
			this.addBindings();
		},
		addBindings:function(){
			var _this = this;
			var playRequestStartTime = null;
			var firstPlayDone = false; 
			this.bind('firstPlay', function(){
				_this.unbind('firstPlay');
				// on play send the "start" action: 
				var beaconObj = {
					'resource': _this.getCurrentVideoSrc(),
					// 'transcode' // not presently used. 
					'live': _this.embedPlayer.isLive(),
					'properties': JSON.stringify( _this.getMediaProperties() ),
					'user': "", // should be the active user id, not presently set .
					'referer': _this.embedPlayer.evaluate('{utility.referrer_url}'),
					'totalBytes': "", // could potentially be populated if we use XHR for iframe payload + static loader + DASH MSE for segments )
					'pingTime': _this.pingTime,
				};
				for( var i = 1; i < 10; i++ ){
					// see if the param config is populated ( don't use getConfig evaluated value, as it could evaluate to false ) 
					if( _this.embedPlayer.getRawKalturaConfig( "youbora", "param" + i ) ){
						beaconObj[ "param" + i ] = _this.getConfig( "param" + i );
					}
				}
				_this.sendBeacon( 'start', beaconObj );
				playRequestStartTime = new Date().getTime();
				firstPlayDone = true;
				// start "ping monitoring"
				_this.bindPingTracking();
			});
			// track joinTime ( time between play and positive time )
			this.bind('timeupdate', function(){
				// only track the first timeupdate:
				_this.unbind('timeupdate');
				_this.sendBeacon( 'joinTime', {
					'time': new Date().getTime() - playRequestStartTime,
					'eventTime': _this.embedPlayer.currentTime,
				});
			});
			// track buffer under run 
			var startBufferClock = null;
			this.bind('bufferStartEvent',function(){
				startBufferClock = new Date().getTime() ;
			});
			this.bind('bufferEndEvent',function(){
				_this.sendBeacon( 'bufferUnderrun', {
					'time': _this.embedPlayer.currentTime,
					'duration': new Date().getTime() - startBufferClock,
				});
			});
			var userHasPaused = false;
			// track pause: 
			this.bind( 'onpause', function( playerState ){
				_this.sendBeacon( 'pause' );
				userHasPaused = true;
			});
			// after first play, track resume:
			this.bind( 'onplay', function( playerState ){
				if( userHasPaused ){
					_this.sendBeacon( 'resume' );
				}
			});
			// track content end:
			this.bind( 'postEnded', function(){
				_this.sendBeacon( 'stop', {
					'diffTime': new Date().getTime() - _this.previusPingTime
				});
			})
		},
		bindPingTracking: function(){
			var _this = this;
			// start previusPingTime at bind time: 
			this.previusPingTime = new Date().getTime();
			setInterval(function(){
				// only issue pings while playing: 
				if( _this.embedPlayer.isPlaying() ){
					_this.sendBeacon( 'ping',{
						'pingTime': (( new Date().getTime() - _this.previusPingTime )  / 1000 ).toFixed(), // round seconds
						'bitrate': _this.embedPlayer.mediaElement.selectedSource.getBitrate(),
						'time': _this.embedPlayer.currentTime,
						// totalBytes, // value is only sent along with the dataType parameter. If the bitrate parameter is sent, then this one is not needed.
						'dataType': 0, // Kaltura does not really do RTMP streams any more. 
						'diffTime': new Date().getTime() - _this.previusPingTime
						// 'nodeHost' //String that indicates the CDN’s Node Host
					});
					// update previusPingTime 
					_this.previusPingTime = new Date().getTime();
				}
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
				'￼manufacturer': "",
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
			var parms = '?system=' + this.getConfig('accountName') + 
			'&pluginVersion=' + this.getPluginVersion();
			if( this.viewCode ){
				parms += '&code=' + this.viewCode;
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
			if( !this.host ){
				this.queuedBeacons.push( [action, payload ] )
				return ;
			}
			if( !payload ){
				payload = {};
			}
			
			if ( this.getConfig( 'trackEventMonitor' ) ) {
				try{
					window.parent[ this.getConfig( 'trackEventMonitor' ) ]( action, JSON.stringify( payload ) );
				} catch(e){
					// error could not log event.
				}
			}
			var beaconUrl = '//' + this.host + '/' + action + this.getBaseParams() + '&' +
				$.param( payload );
			
			// issue a get for the beacon url
			$.get( beaconUrl );
		},
		getViewCode: function(){
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