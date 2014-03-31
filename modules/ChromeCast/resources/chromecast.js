( function( mw, $ ) {"use strict";

	mw.PluginManager.add( 'chromecast', mw.KBaseComponent.extend({

		defaultConfig: {
			'parent': 'topBarContainer',
			'order': 7,
			'align': "right",
			'tooltip': 'Chromecast'
		},
		isDisabled: false,

		applicationID: "DB6462E9",
		progressFlag: 1,
		currentMediaSession: null,
		mediaCurrentTime: 0,
		mediaDuration: null,
		casting: false,
		session: null,
		request: null,
		updateInterval: null,

		monitorInterval: null,

		savedPlayer: null, // save player before cast
		savedVolume: 0,	// save player volume before cast
		savedPosition: 0,  // save video position before cast

		startCastTitle: gM( 'mwe-embedplayer-startCast' ),
		stopCastTitle: gM( 'mwe-embedplayer-stopCast' ),

		setup: function( embedPlayer ) {
			var _this = this;
			this.getComponent().addClass("disabled");
			window['__onGCastApiAvailable'] = function(loaded, errorInfo) {
				if (loaded) {
					_this.initializeCastApi();
				} else {
					mw.log(errorInfo);
				}
			}
		},

		addBindings: function() {
			var _this = this;
			$(this.embedPlayer).bind('chromecastPlay', function(){_this.playMedia()});
			$(this.embedPlayer).bind('chromecastPause', function(){_this.pauseMedia()});
			$(this.embedPlayer).bind('chromecastSwitchMedia', function(e, url, mime){_this.loadMedia(url, mime)});
			$(this.embedPlayer).bind('chromecastGetCurrentTime', function(){_this.getCurrentTime()});
			$(this.embedPlayer).bind('chromecastSetVolume', function(e, percent){_this.setVolume(e,percent)});
			$(this.embedPlayer).bind('chromecastSeek', function(e, percent){_this.seekMedia(percent)});
			$(this.embedPlayer).bind('stopCasting', function(){_this.toggleCast()});
		},

		getComponent: function() {
			var _this = this;
			if( !this.$el ) {
				this.$el = $( '<button/>' )
					.attr( 'title', this.startCastTitle )
					.addClass( "btn icon-chromecast" + this.getCssClass() )
					.click( function() {
						_this.toggleCast();
					});
			}
			return this.$el;
		},

		getCssClass: function() {
			var cssClass = ' comp ' + this.pluginName + ' ';
			switch( this.getConfig( 'align' ) ) {
				case 'right':
					cssClass += " pull-right";
					break;
				case 'left':
					cssClass += " pull-left";
					break;
			}
			if( this.getConfig('cssClass') ) {
				cssClass += ' ' + this.getConfig('cssClass');
			}
			if( this.getConfig('displayImportance') ){
				var importance = this.getConfig('displayImportance').toLowerCase();
				if( $.inArray(importance, ['low', 'medium', 'high']) !== -1 ){
					cssClass += ' display-' + importance;
				}
			}
			return cssClass;
		},

		toggleCast : function(){
			if (this.isDisabled){
				return false;
			}
			var _this = this;
			if (!this.casting){
				// launch app
				chrome.cast.requestSession(function(e){_this.onRequestSessionSuccess(e)}, function(){_this.onLaunchError()});
			}else{
				// stop casting
				this.stopMedia();
				this.stopApp()
			}
		},

		onRequestSessionSuccess: function(e) {
			mw.log("ChromeCast::session success: " + e.sessionId);
			this.session = e;
			this.getComponent().css("color","#35BCDA");
			this.getComponent().attr( 'title', this.stopCastTitle )
			this.casting = true;
			this.loadMedia();
		},

		onLaunchError: function() {
			mw.log("ChromeCast::launch error");
		},

		initializeCastApi: function() {
			var _this = this;
			var sessionRequest = new chrome.cast.SessionRequest(this.applicationID); // 'Castv2Player'
			var apiConfig = new chrome.cast.ApiConfig(sessionRequest, function(event){_this.sessionListener(event)}, function(event){_this.receiverListener(event)});
			chrome.cast.initialize(apiConfig, function(){_this.onInitSuccess()}, function(){_this.onError()});
		},

		sessionListener: function(e) {
			mw.log('ChromeCast::New session ID: ' + e.sessionId);
			this.session = e;
			if (this.session.media.length != 0) {
				mw.log('ChromeCast::Found ' + this.session.media.length + ' existing media sessions.');
				this.onMediaDiscovered('onRequestSessionSuccess_', this.session.media[0]);
			}
			this.session.addMediaListener(
				this.onMediaDiscovered.bind(this, 'addMediaListener'));
			this.session.addUpdateListener(this.sessionUpdateListener.bind(this));
		},

		onMediaDiscovered: function(how, mediaSession) {
			mw.log("ChromeCast::new media session ID:" + mediaSession.mediaSessionId + ' (' + how + ')');
			this.currentMediaSession = mediaSession;
			var _this = this;
			mediaSession.addUpdateListener(function(e){_this.onMediaStatusUpdate(e)});
			this.mediaCurrentTime = this.currentMediaSession.currentTime;
			this.mediaDuration = this.currentMediaSession.media.duration;

			// switch to Chromecast player
			var chromeCastSource = this.getChromecastSource();
			if (chromeCastSource){
				// pause the current player if playing
				this.embedPlayer.pause();
				// save player, current volume and current position
				if (this.savedPlayer == null){
					this.savedPlayer = this.embedPlayer.selectedPlayer;
				}
				this.savedPosition = this.embedPlayer.currentTime;
				this.savedVolume = this.embedPlayer.volume;
				// select Chromecast player
				this.embedPlayer.selectPlayer( mw.EmbedTypes.getChroemcastPlayer() );
				this.embedPlayer.disablePlayer();
				this.embedPlayer.updatePlaybackInterface();
				// set source using a timeout to avoid setting auto source by Akamai Analytics
				setTimeout(function(){
					_this.embedPlayer.mediaElement.setSource(chromeCastSource);
                    _this.embedPlayer.receiverName = _this.session.receiver.friendlyName;
					_this.addBindings();
					// set volume and position according to the video settings before switching players
					_this.setVolume(null, _this.savedVolume);
					_this.seekMedia(_this.savedPosition / _this.currentMediaSession.media.duration * 100);
					// update media duration for durationLable component
					_this.embedPlayer.mediaLoaded(_this.currentMediaSession);
					// play media
					_this.embedPlayer.play();
				},300);
				if (_this.monitorInterval != null){
					clearInterval(_this.monitorInterval);
				}
				_this.monitorInterval = setInterval(function(){_this.monitor()},1000);
			}
			//playpauseresume.innerHTML = 'Play';
			//document.getElementById("casticon").src = 'images/cast_icon_active.png';
		},

		playMedia: function() {
			if( !this.currentMediaSession )
				return;
			this.currentMediaSession.play(null, this.mediaCommandSuccessCallback.bind(this,"playing started for " + this.currentMediaSession.sessionId), this.onError);
			$( this.embedPlayer ).trigger( 'onPlayerStateChange', [ "pause" ] );
		},

		pauseMedia: function(){
			if( !this.currentMediaSession )
				return;
			this.currentMediaSession.pause(null, this.mediaCommandSuccessCallback.bind(this,"paused " + this.currentMediaSession.sessionId), this.onError);
		},

		monitor: function(){
			this.embedPlayer.updatePlayhead(this.getCurrentTime(), this.mediaDuration);
		},

		seekMedia: function(pos) {
			console.log('Seeking ' + this.currentMediaSession.sessionId + ':' + this.currentMediaSession.mediaSessionId + ' to ' + pos + "%");
			var request = new chrome.cast.media.SeekRequest();
			request.currentTime = pos * this.currentMediaSession.media.duration / 100;
			this.currentMediaSession.seek(request, this.onSeekSuccess.bind(this, 'media seek done'), this.onError);
		},

		onSeekSuccess: function(info) {
			console.log(info);
			this.embedPlayer.onPlayerSeekEnd();
		},

		getCurrentTime: function(){
			this.mediaCurrentTime = this.currentMediaSession.getEstimatedTime();
			return this.mediaCurrentTime;
		},



		setVolume: function(e, percent){
			if( !this.currentMediaSession )
				return;

			this.embedPlayer.volume = percent;
			var volume = new chrome.cast.Volume();
			volume.level = percent;
			volume.muted = (percent == 0);
			var request = new chrome.cast.media.VolumeRequest();
			request.volume = volume;
			this.currentMediaSession.setVolume(request, this.mediaCommandSuccessCallback.bind(this, 'media set-volume done'), this.onError);
		},

		mediaCommandSuccessCallback: function(info) {
			mw.log('ChromeCast::' + info);
		},

		sessionUpdateListener: function(isAlive) {
			var message = isAlive ? 'ChromeCast::Session Updated' : 'Session Removed';
			message += ': ' + this.session.sessionId;
			mw.log(message);
			if (!isAlive) {
				//this.session = null;
			}
		},

		onMediaStatusUpdate: function(isAlive) {
			if (!isAlive){
				// clip done
				//this.session = null;
				// make sure we are still on Chromecast player since session will be lost when returning to the native player as well
				if (this.getPlayer().instanceOf == "Chromecast" && this.currentMediaSession.idleReason == "FINISHED"){
				   this.embedPlayer.clipDone();
				}
			}
		},

		loadMedia: function(url, mime) {
			var _this = this;
			if (!this.session) {
				mw.log("ChromeCast::no session");
				return;
			}
			// if URL and mime type were passed use it. If not - get the them from the embed player current source
			var currentMediaURL = url ? url : this.embedPlayer.getSource().src;
			var mimeType = mime ? mime : this.embedPlayer.getSource().mimeType;

			mw.log("ChromeCast::loading..." + currentMediaURL);
			var mediaInfo = new chrome.cast.media.MediaInfo(currentMediaURL);
			mediaInfo.contentType = mimeType;
			this.request = new chrome.cast.media.LoadRequest(mediaInfo);
			this.request.autoplay = false;
			this.request.currentTime = 0;

			var payload = {
				"title:" : $(".titleLabel").html(),
				"thumb" : this.embedPlayer.poster
			};

			var json = {
				"payload" : payload
			};

			this.request.customData = json;

			this.session.loadMedia(this.request, _this.onMediaDiscovered.bind(this, 'loadMedia'), _this.onMediaError);

		},

		stopMedia: function() {
			if( !this.currentMediaSession )
				return;

			this.currentMediaSession.stop(null, this.mediaCommandSuccessCallback.bind(this,"stopped " + this.currentMediaSession.sessionId), this.onError);;
			mw.log("ChromeCast::media stopped");
		},

		stopApp: function() {
			clearInterval(this.monitorInterval);
			var _this = this;

			// stop casting
			this.session.stop(this.onStopAppSuccess, this.onError);
			this.getComponent().css("color","white");
			this.getComponent().attr( 'title', this.startCastTitle )
			this.casting = false;

			// restore native player
			this.embedPlayer.selectPlayer(this.savedPlayer);
			this.savedPlayer = null;
			this.embedPlayer.disablePlayer();
			this.embedPlayer.updatePlaybackInterface();
			this.embedPlayer.play();
		},

		onStopAppSuccess: function() {
			mw.log('ChromeCast::Session stopped');
		},

		onMediaError: function(e) {
			mw.log("ChromeCast::media error");
		},

		receiverListener: function(e) {
			if( e === 'available' ) {
				mw.log("ChromeCast::receiver found");
			}
			else {
				mw.log("ChromeCast::receiver list empty");
			}
		},

		onInitSuccess: function() {
			mw.log("ChromeCast::init success");
			this.getComponent().removeClass("disabled");
		},

		onError: function() {
			mw.log("ChromeCast::error");
		},

		onEnable: function() {
			this.isDisabled = false;
			this.getComponent().toggleClass('disabled');
		},
		onDisable: function() {
			this.isDisabled = true;
			this.getComponent().toggleClass('disabled');
		},

		getChromecastSource: function(){
			// find the best quality MP4 source
			var sources = this.embedPlayer.mediaElement.sources;
			var requiredMimetype = "video/mp4";
			var videoSize = 0;
			var newSource = null;
			for (var i=0; i < sources.length; i++){
				var source = sources[i];
				if (source.mimeType == requiredMimetype && parseInt(source.sizebytes) > videoSize){
					newSource = source;
					videoSize = parseInt(newSource.sizebytes);
				}
			}
			if (newSource){
				mw.log("ChromeCast:: getting Chromecast source");
				sources.push(newSource);
				return newSource;
			}else{
				mw.log("ChromeCast:: could not find a source suitable for casting");
				return false;
			}
		}
	}));

} )( window.mw, window.jQuery );