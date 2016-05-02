( function( mw, $ ) {"use strict";

	// Add chromecast player:
	$( mw ).bind('EmbedPlayerUpdateMediaPlayers', function( event, mediaPlayers ){
		var chromecastSupportedProtocols = ['video/mp4'];
		var chromecastPlayer = new mw.MediaPlayer( 'chromecast', chromecastSupportedProtocols, 'Chromecast' );
		mediaPlayers.addPlayer( chromecastPlayer );
	});

	mw.PluginManager.add( 'chromecast', mw.KBaseComponent.extend({

		defaultConfig: {
			'parent': 'controlsContainer',
			'order': 7,
			'visible': false,
			'align': "right",
			'applicationID': "FFCC6D19", // DB6462E9: Chromecast default receiver, FFCC6D19: Kaltura custom receiver supporting DRM, HLS and smooth streaming
			'showTooltip': true,
			'tooltip': gM('mwe-chromecast-chromecast'),
			'title': gM('mwe-chromecast-chromecast'),
			'debugReceiver': false,
			'receiverLogo': false,
			'logoUrl': null,
			'useKalturaPlayer': false,
			'debugKalturaPlayer': false
		},
		isDisabled: false,

		currentMediaSession: null,
		mediaCurrentTime: 0,
		mediaDuration: null,
		casting: false,
		session: null,
		request: null,
		autoPlay: true,

		monitorInterval: null,

		savedPlayer: null, // save player before cast
		savedVolume: 0,	   // save player volume before cast
		savedPosition: 0,  // save video position before cast

		startCastTitle: gM( 'mwe-chromecast-startcast' ),
		stopCastTitle: gM( 'mwe-chromecast-stopcast' ),

		receiverName: '',
		drmConfig: null,
		MESSAGE_NAMESPACE: 'urn:x-cast:com.kaltura.cast.player',

		isNativeSDK: false, //flag for using native mobile IMA SDK

		setup: function( embedPlayer ) {
			var _this = this;
			this.addBindings();
			this.isNativeSDK  = mw.getConfig( "EmbedPlayer.ForceNativeComponent");

			if (!this.isNativeSDK) {
				var ticks = 0;
				var intervalID = setInterval(function () {
					ticks++;
					if (typeof chrome !== "undefined" && typeof chrome.cast !== "undefined" && typeof chrome.cast.SessionRequest !== "undefined") {
						_this.initializeCastApi();
						clearInterval(intervalID);
					} else {
						if (ticks === 40) { // cancel check after 10 seconds
							clearInterval(intervalID);
						}
					}
				}, 250);
			}
		},

		addBindings: function() {
			var _this = this;
			this.bind('chromecastPlay', function(){_this.playMedia();});
			this.bind('chromecastPause', function(){_this.pauseMedia();});
			this.bind('chromecastSwitchMedia', function(e, url, mime){_this.loadMedia(url, mime);});
			this.bind('chromecastGetCurrentTime', function(){_this.getCurrentTime();});
			this.bind('chromecastSetVolume', function(e, percent){_this.setVolume(e,percent);});
			this.bind('chromecastSeek', function(e, percent){_this.seekMedia(percent);});
			this.bind('stopCasting', function(){_this.toggleCast();});

			$( this.embedPlayer).bind('chromecastDeviceConnected', function(){
				_this.onRequestSessionSuccess();
			});
			$( this.embedPlayer).bind('chromecastDeviceDisConnected', function(){
				_this.stopApp();
			});

			$( this.embedPlayer).bind('hideConnectingMessage', function(){
				_this.embedPlayer.layoutBuilder.closeAlert();
				_this.getComponent().css("color","#35BCDA");
				_this.updateScreen();
			});

			$( this.embedPlayer).bind('updateDashContextData', function(e, drmConfig){
				_this.drmConfig = drmConfig;
			});

			$( this.embedPlayer).bind('onChangeMedia', function(e){
				_this.savedPosition = 0;
			});

			$(this.embedPlayer).bind('playerReady', function() {
				if ( mw.getConfig( "EmbedPlayer.ForceNativeComponent") ) {
					// send application ID to native app
					_this.embedPlayer.getPlayerElement().attr( 'chromecastAppId', _this.getConfig( 'applicationID' ));
				}
			});
		},

		getComponent: function() {
			var _this = this;
			if( !this.$el ) {
				this.$el = $( '<button/>' )
					.attr( 'title', this.startCastTitle )
					.addClass( "btn icon-chromecast" + this.getCssClass() )
					.click( function() {
						if( _this.embedPlayer.selectedPlayer && _this.embedPlayer.selectedPlayer.library != "NativeComponent" ) {
								_this.toggleCast();
						} else {
							// 'NativeComponent' event for showing chromecast device list on mobile native apps
							$( _this.embedPlayer ).trigger( 'showChromecastDeviceList' );

							var chromeCastSource = _this.getChromecastSource();
							// set source using a timeout to avoid setting auto source by Akamai Analytics
							setTimeout(function() {
								_this.embedPlayer.mediaElement.setSource(chromeCastSource);
							},300);
						}
					});
			}
			return this.$el;
		},

		showConnectingMessage: function(){
			this.embedPlayer.showErrorMsg({
					'title':'Chromecast Player',
					'message': gM('mwe-chromecast-connecting'),
					'props':{
						'customAlertContainerCssClass': 'connectingMsg',
						'customAlertTitleCssClass': 'hidden',
						'textColor': '#ffffff'
					}
				}
			);
		},

		toggleCast : function(){
			if (this.isDisabled){
				return false;
			}
			var _this = this;
			if (!this.casting){
				// launch app
				this.showConnectingMessage();
				this.embedPlayer.disablePlayControls(["chromecast"]);
				var sessionRequest = new chrome.cast.SessionRequest(this.getConfig("applicationID").toString(), [chrome.cast.Capability.VIDEO_OUT], 60000);
				chrome.cast.requestSession(
					function(e){
						_this.onRequestSessionSuccess(e);
					}, 
					function(error){
						_this.onLaunchError(error);
					},
					sessionRequest
				);
			}else{
				// stop casting
				this.stopMedia();
				this.stopApp();
			}
		},

		onRequestSessionSuccess: function(e) {
			if (!this.isNativeSDK){
				this.log( "Session success: " + e.sessionId);
				this.session = e;
			}
			this.embedPlayer.layoutBuilder.closeAlert();
			this.getComponent().css("color","#35BCDA");
			this.updateTooltip(this.stopCastTitle);
			this.casting = true;
			this.embedPlayer.casting = true;

			// set receiver debug if needed
			if ( this.getConfig("debugReceiver") ){
				this.sendMessage({'type': 'show', 'target': 'debug'});
			}
			// set kaltura logo if needed
			if ( this.getConfig("logoUrl") && this.getConfig("receiverLogo") ){
				this.sendMessage({'type': 'setLogo', 'logo': this.getConfig("logoUrl")});
			}
			if ( this.getConfig("receiverLogo") ){
				this.sendMessage({'type': 'show', 'target': 'logo'});
			}
			// add DRM support
			if (this.drmConfig){
				this.sendMessage({'type': 'license', 'value': this.drmConfig.contextData.widevineLicenseServerURL});
				this.log("set license URL to: " + this.drmConfig.contextData.widevineLicenseServerURL);
			}
			if (this.getConfig("useKalturaPlayer") === true){
				var flashVars = this.getFlashVars();
				this.sendMessage({'type': 'embed', 'publisherID': this.embedPlayer.kwidgetid.substr(1), 'uiconfID': this.embedPlayer.kuiconfid, 'entryID': this.embedPlayer.kentryid, 'debugKalturaPlayer': this.getConfig("debugKalturaPlayer"), 'flashVars': flashVars});
				this.embedPlayer.showErrorMsg(
					{'title':'Chromecast Player',
						'message': gM('mwe-chromecast-loading'),
						'props':{
							'customAlertContainerCssClass': 'connectingMsg',
							'customAlertTitleCssClass': 'hidden',
							'textColor': '#ffffff'
						}
					}
				);
			} else {
				this.sendMessage({'type': 'load'});
				this.loadMedia();
			}
			if (this.isNativeSDK){
				return;
			}

			var _this = this;
			this.session.addMessageListener(this.MESSAGE_NAMESPACE, function(namespace, message){
				_this.log("Got Message From Receiver: "+message);
				if (message == "readyForMedia"){
					_this.loadMedia();
				}
			});
		},
		getFlashVars: function(){
			var _this = this;
			var plugins = ['doubleClick', 'youbora', 'kAnalony', 'related', 'comScoreStreamingTag', 'watermark', 'heartbeat', 'proxyData'];

			var fv = {};
			plugins.forEach(function(plugin){
				if (!$.isEmptyObject(_this.embedPlayer.getKalturaConfig(plugin))){
					fv[plugin] = _this.embedPlayer.getKalturaConfig(plugin);
				}
			});
			// add support for custom proxyData for OTT app developers
			var proxyData = this.getConfig('proxyData');
			if ( proxyData ){
				var recursiveIteration = function(object) {
					for (var property in object) {
						if (object.hasOwnProperty(property)) {
							if (typeof object[property] == "object"){
								recursiveIteration(object[property]);
							}else{
								object[property] = _this.embedPlayer.evaluate( object[property] );
							}
						}
					}
				}
				recursiveIteration(proxyData);
				fv['proxyData'] = proxyData;
			}
			return fv;
		},

		onLaunchError: function(error) {
			this.embedPlayer.layoutBuilder.closeAlert();
			this.embedPlayer.enablePlayControls();
			this.log("launch error: "+error.code);
		},

		initializeCastApi: function() {
			var _this = this;
			var sessionRequest = new chrome.cast.SessionRequest(this.getConfig("applicationID").toString()); // 'Castv2Player'
			var apiConfig = new chrome.cast.ApiConfig(sessionRequest,
				function(event){
					_this.sessionListener(event);
				}, 
				function(event){
					_this.receiverListener(event);
				}
			);
			chrome.cast.initialize(apiConfig, 
				function(){
					_this.onInitSuccess();
				}, 
				function(){
					_this.onError();
				}
			);
		},

		sessionListener: function( e ) {
			this.log("New session ID: ' + e.sessionId);");
			this.session = e;
			if (this.session.media.length !== 0) {
				this.log('Found ' + this.session.media.length + ' existing media sessions.');
				this.onMediaDiscovered('onRequestSessionSuccess_', this.session.media[0]);
			}else{
				this.onRequestSessionSuccess(e);
			}
			this.session.addMediaListener(
				this.onMediaDiscovered.bind(this, 'addMediaListener'));
			this.session.addUpdateListener(this.sessionUpdateListener.bind(this));
		},

		onMediaDiscovered: function(how, mediaSession) {
			var _this = this;
			this.embedPlayer.layoutBuilder.closeAlert();
			// if page reloaded and in playlist - select the currently playing clip
			if ( how === 'onRequestSessionSuccess_' && this.embedPlayer.playlist){
				this.stopApp();
				// TODO: handle playlist reload
				return;
//				var castedManifest = mediaSession.media.contentId;
//				var castedMedia = castedManifest.substr(castedManifest.indexOf("/entryId/")+9,10);
//				var currentManifest = this.embedPlayer.getSource().src;
//				var currentMedia = currentManifest.substr(currentManifest.indexOf("/entryId/")+9,10);
//				if (castedMedia !== currentMedia){
//					setTimeout(function(){
//						_this.casting = true;
//						_this.embedPlayer.casting = true;
//						_this.embedPlayer.sendNotification("playlistPlayMediaById",castedMedia);
//					},0);
//
//				}
			}
			this.log("new media session ID:" + mediaSession.mediaSessionId + ' (' + how + ')');
			this.currentMediaSession = mediaSession;
			this.getComponent().css("color","#35BCDA");
			this.updateTooltip(this.stopCastTitle);
			mediaSession.addUpdateListener(function(e){_this.onMediaStatusUpdate(e);});
			this.mediaCurrentTime = this.currentMediaSession.currentTime;
			this.mediaDuration = this.currentMediaSession.media.duration;

			// switch to Chromecast player
			var chromeCastSource = this.getChromecastSource();
			if (chromeCastSource){
				// pause the current player if playing
				this.embedPlayer.pause();
				// save player, current volume and current position
				if (this.savedPlayer === null){
					this.savedPlayer = this.embedPlayer.selectedPlayer;
				}
				// we want to save the position only if we are no in an ad
				if ((_this.embedPlayer.sequenceProxy && _this.embedPlayer.sequenceProxy.isInSequence) !== true){
					this.savedPosition = this.embedPlayer.currentTime;
				}
				this.savedVolume = this.embedPlayer.volume;
				// select Chromecast player
				this.embedPlayer.selectPlayer(
					mw.EmbedTypes.mediaPlayers.getPlayerById('chromecast')
				);
				this.embedPlayer.disablePlayer();
				this.embedPlayer.updatePlaybackInterface();
				// set source using a timeout to avoid setting auto source by Akamai Analytics
				setTimeout(function(){
					_this.embedPlayer.mediaElement.setSource(chromeCastSource);
					_this.embedPlayer.receiverName = _this.session.receiver.friendlyName;
					// set volume and position according to the video settings before switching players
					_this.setVolume(null, _this.savedVolume);
					if (_this.currentMediaSession.media.duration && _this.savedPosition > 0 && !_this.embedPlayer.changeMediaStarted){
						_this.seekMedia(_this.savedPosition / _this.currentMediaSession.media.duration * 100);
					}
					// update media duration for durationLable component
					_this.embedPlayer.mediaLoaded(_this.currentMediaSession);
					if (_this.autoPlay){
						_this.embedPlayer.play();
					}
					_this.updateScreen();
					// hide kaltura logo
					if ( _this.getConfig("receiverLogo") ){
						_this.sendMessage({'type': 'hide', 'target': 'logo'});
					}
				},300);
				if (_this.monitorInterval !== null){
					clearInterval(_this.monitorInterval);
				}
				_this.monitorInterval = setInterval(function(){_this.monitor();},1000);
			}
		},

		playMedia: function() {
			if( !this.currentMediaSession ) {
				return;
			}
			this.currentMediaSession.play(
				null, 
				this.mediaCommandSuccessCallback.bind(
					this,
					"playing started for " + this.currentMediaSession.sessionId
				), 
				this.onError
			);
		},

		pauseMedia: function(){
			if( !this.currentMediaSession ){
				return;
			}
			this.currentMediaSession.pause(null, 
				this.mediaCommandSuccessCallback.bind(
					this,
					"paused " + this.currentMediaSession.sessionId
				), 
				this.onError
			);
		},

		monitor: function(){
			var _this = this;
			this.currentMediaSession.getStatus(null,null,
				function(){
					if (this.getCurrentTime() > 0){
						_this.stopApp(); // stop app if chromecast is not connected (user used the browser icon to disconnect)
					}
				});
			this.embedPlayer.updatePlayhead( this.getCurrentTime(), this.mediaDuration );
		},

		seekMedia: function(pos) {
			this.log('Seeking ' + this.currentMediaSession.sessionId + ':' + 
					this.currentMediaSession.mediaSessionId + ' to ' + pos + "%");
			var request = new chrome.cast.media.SeekRequest();
			request.currentTime = pos * this.currentMediaSession.media.duration / 100;
			this.currentMediaSession.seek( request, 
				this.onSeekSuccess.bind(
						this, 
						'media seek done'
				), 
				this.onError
			);
		},

		onSeekSuccess: function(info) {
			this.log(info);
			this.embedPlayer.onPlayerSeekEnd();
		},

		getCurrentTime: function(){
			this.mediaCurrentTime = this.currentMediaSession.getEstimatedTime();
			return this.mediaCurrentTime;
		},



		setVolume: function(e, percent){
			if( !this.currentMediaSession ) {
				return;
			}

			this.embedPlayer.volume = percent;
			var volume = new chrome.cast.Volume();
			volume.level = percent;
			volume.muted = (percent === 0);
			var request = new chrome.cast.media.VolumeRequest();
			request.volume = volume;
			this.currentMediaSession.setVolume( request, 
				this.mediaCommandSuccessCallback.bind(
					this, 
					'media set-volume done'
				), 
				this.onError
			);
		},

		mediaCommandSuccessCallback: function(info) {
			this.log("info:" + info);
		},

		sessionUpdateListener: function(isAlive) {
			var message = isAlive ? 'Session Updated' : 'Session Removed';
			message += ': ' + this.session.sessionId;
			this.log(message);
			if (!isAlive ){
				this.stopApp();
			}
		},

		onMediaStatusUpdate: function(isAlive) {
			if (!isAlive){
				// clip done
				//this.session = null;
				// make sure we are still on Chromecast player since session will be lost when returning to the native player as well
				if ( this.getPlayer().instanceOf === "Chromecast" && this.currentMediaSession.idleReason === "FINISHED" ){
					this.embedPlayer.clipDone(); // trigger clipDone
					this.autoPlay = false;       // set autoPlay to false for rewind
					this.loadMedia();            // reload the media for rewind
				}
			}
		},

		loadMedia: function(url, mime) {
			var _this = this;
			if (!this.session || (!url && !this.embedPlayer.getSource())) {
				this.log("no session");
				return;
			}
			this.savedPosition = 0;
			// if URL and mime type were passed use it. If not - get the them from the embed player current source
			var currentMediaURL = url || this.embedPlayer.getSource().src;
			var mimeType = mime || this.embedPlayer.getSource().mimeType;

			this.embedPlayer.resolveSrcURL( currentMediaURL ).then(
				function(source){
					return source;
				},
				function () { //error
					return currentMediaURL;
				})
				.then( function(currentMediaURL ){
						_this.log("loading..." + currentMediaURL);
						var mediaInfo = new chrome.cast.media.MediaInfo( currentMediaURL );
						mediaInfo.contentType = mimeType;
						_this.request = new chrome.cast.media.LoadRequest( mediaInfo );
						_this.request.autoplay = false;
						_this.request.currentTime = 0;

						var payload = {
							"title:" : $(".titleLabel").html(),
							"thumb" : _this.embedPlayer.poster
						};

						var json = {
							"payload" : payload
						};

						_this.request.customData = json;

						_this.session.loadMedia(_this.request,
							_this.onMediaDiscovered.bind(_this, 'loadMedia'),
							_this.onMediaError
						);
				});
		},

		stopMedia: function() {
			if( !this.currentMediaSession ) {
				return;
			}

			this.currentMediaSession.stop(null, 
				this.mediaCommandSuccessCallback.bind(this,
					"stopped " + this.currentMediaSession.sessionId
				), 
				this.onError
			);
			this.updateTooltip(this.startCastTitle);
			this.log("media stopped");
		},

		stopApp: function() {
			clearInterval(this.monitorInterval);
			var _this = this;
			this.getComponent().css("color","white");
			this.updateTooltip(this.startCastTitle);
			this.casting = false;
			this.embedPlayer.casting = false;
			this.embedPlayer.getInterface().find(".chromecastScreen").remove();
			if (this.isNativeSDK){
				return;
			}
			var seekTime = this.getCurrentTime();
			// stop casting
			this.session.stop(this.onStopAppSuccess, this.onError);
			// restore native player
			this.embedPlayer.selectPlayer(this.savedPlayer);
			this.savedPlayer = null;
			this.embedPlayer.disablePlayer();
			this.embedPlayer.updatePlaybackInterface();
			this.embedPlayer.enablePlayControls();
			if (this.embedPlayer.playlist){
				mw.setConfig("EmbedPlayer.KeepPoster",false);
				mw.setConfig('EmbedPlayer.HidePosterOnStart', true);
			}
			if (this.embedPlayer.isLive()){
				this.embedPlayer.pause();
				setTimeout(function(){
					_this.embedPlayer.play();
				},1000);
			}else{
				if ( this.embedPlayer.selectedPlayer.library == "Kplayer" ){
					// since we don't have the canSeek promise, we need to reload the media on playerReady, wait for it to load and then preform the seek operation. Add a timeout as seek is not always available on the mediaLoaded event
					this.bind("playerReady.stopCast", function(){
						_this.unbind("playerReady.stopCast");
						_this.bind("mediaLoaded.stopCast", function(){
							_this.unbind("mediaLoaded.stopCast");
							setTimeout(function(){
								_this.embedPlayer.seek(seekTime, false);
							},1000);
						});
						_this.embedPlayer.load();
					})
				}else{
					this.embedPlayer.canSeek().then(function () {
						_this.embedPlayer.seek(seekTime, false);
					});
				}
			}
		},

		onStopAppSuccess: function() {
			console.log("Chromecast: Session stopped");
		},

		onMediaError: function(e) {
			this.embedPlayer.layoutBuilder.closeAlert();
			console.log("Chromecast: media error: "+ e.code);
		},

		receiverListener: function(e) {
			if( e === 'available' ) {
				this.log("receiver found");
			}
			else {
				this.log("receiver list empty");
			}
		},

		onInitSuccess: function() {
			var _this = this;
			this.log("init success");
			this.show();
			this.bind("layoutBuildDone ended", function(){
				_this.show();
			});
		},

		onError: function(e) {
			console.log("Chromecast: Error. code: " + e.code + ", description: " + e.description);
		},

		getChromecastSource: function(){
			var sources = this.embedPlayer.mediaElement.sources;
			var videoSize = 0;
			var newSource = null;
			var supportedMimeTypes = ['video/mp4', 'application/dash+xml', 'application/vnd.apple.mpegurl'];
			var i = 0;
			for ( i=0 ; i < sources.length; i++){
				var source = sources[i];
				if ($.inArray(source.mimeType, supportedMimeTypes) !== -1){
					if (source.sizebytes && parseInt(source.sizebytes) > videoSize){ // find the best quality MP4 source
						newSource = source;
						videoSize = parseInt(newSource.sizebytes);
					}else{
						newSource = source;
					}
				}
			}
			if (newSource){
				this.log("Getting Chromecast source");
				sources.push(newSource);
				return newSource;
			}else{
				this.log("Could not find a source suitable for casting");
				return false;
			}
		} ,

		updateScreen: function(){
			var _this = this;
			this.embedPlayer.getInterface().find(".chromecastScreen").remove();
			this.embedPlayer.getVideoHolder().append(this.getPlayingScreen());
			$(".chromecastThumb").load(function(){
				setTimeout(function(){
					_this.setPlayingScreen();
				},0);
			});
		},

		getPlayingScreen: function(){
			return '<div class="chromecastScreen" style="background-color: #000000; opacity: 0.7; width: 100%; height: 100%; font-family: Arial; position: absolute">' +
				'<div class="chromecastPlayback">' +
				'<div class="chromecastThumbBorder">' +
				'<img class="chromecastThumb" src="' + this.embedPlayer.poster + '"></img></div> ' +
				'<div class="titleHolder">' +
				'<span class="chromecastTitle"></span><br>' +
				'<div><i class="icon-chromecast chromecastPlayingIcon chromecastPlaying"></i>' +
				'<span class="chromecastPlaying">' + gM('mwe-chromecast-playing') + '</span>'+
				'<span id="chromecastReceiverName" class="chromecastPlaying chromecastReceiverName"></span>'+
				'</div></div></div></div>';
		},

		setPlayingScreen: function(){
			var factor = $(".chromecastThumb").naturalWidth() / $(".chromecastThumb").naturalHeight();
			var thumbWidth = 116;//this.embedPlayer.getVideoHolder().width() / 4;
			$(".chromecastThumb").width(thumbWidth);
			$(".chromecastThumbBorder").width(thumbWidth);
			$(".chromecastThumb").height(thumbWidth / factor);
			$(".chromecastThumbBorder").height(thumbWidth / factor);
			var title = this.embedPlayer.evaluate('{mediaProxy.entry.name}');
			$(".chromecastTitle").text(title);
			$("#chromecastReceiverName").text(this.embedPlayer.receiverName);
		},

		sendMessage: function(message) {
			var _this = this;
			if (this.isNativeSDK){
				$( _this.embedPlayer ).trigger( 'sendCCRecieverMessage', message );
				return;
			}
			if (this.session != null) {
				this.session.sendMessage( this.MESSAGE_NAMESPACE, message, this.onMsgSuccess.bind(this,
					'Message sent: ' + JSON.stringify(message)), this.onMsgError);
			}
		},

		onMsgSuccess: function(message) {
			this.log(message);
		},

		onMsgError: function(message) {
			mw.log(message);
		}

	}));
} )( window.mw, window.jQuery );