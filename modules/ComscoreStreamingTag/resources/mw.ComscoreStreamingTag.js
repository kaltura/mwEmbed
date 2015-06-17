( function( mw, $ ) { "use strict";

	mw.ComscoreStreamingTag = function( embedPlayer, callback ){
		this.init( embedPlayer, callback );
	};

	mw.ComscoreStreamingTag.prototype = {

		pluginVersion: "1.0.0",
		reportingPluginName: "kaltura",
		playerVersion: mw.getConfig('version'),
		genericPluginUrlSecure: "https://sb.scorecardresearch.com/c2/plugins/streamingtag_plugin_generic.js",
		genericPluginUrl: "http://b.scorecardresearch.com/c2/plugins/streamingtag_plugin_generic.js",

		bindPostfix: '.ComScoreStreamingTag',
		moduleName: 'ComScoreStreamingTag',
		unknownValue: 'unknown',

		streamSenseInstance: null, // Placeholder reference for comScore Generic plugin

		clipNumberMap: {},
	    clipNumberCounter: 0,
		playerEvents: null,
		inFullScreen: false,
		currentPlayerPluginState: null,
		bandwidth: 0,
		lastCuePointUpdateTime: -1,
		adCuePoints: null,
		adsPlayed: [],
		currentAd: {},
		currentBitrate: 0,
		shouldSetClip: true,
		// Mapping for the module settings and the StreamSense plugin
		configOptions: {c2:"c2", pageView:"pageview", logUrl:"logurl", persistentLabels:"persistentlabels", debug:"debug", include:"include", includePrefixes:"include_prefixes", exclude:"exclude", excludePrefixes:"exclude_prefixes"},

		PlayerPluginState: function () {
			var stringMap = [ "initializing", "idle", "new_clip_loaded", "playing", "paused", "ended_playing", "buffering", "seeking", "scrubbing", "ad_playing", "ad_paused", "ad_ended_playing", "destroyed"];
			return {
				INITIALIZING: 0,
				IDLE: 1,
				NEW_CLIP_LOADED: 2,
				PLAYING: 3,
				PAUSED: 4,
				ENDED_PLAYING: 5,
				BUFFERING: 6,
				SEEKING: 7,
				SCRUBBING: 8,
				AD_PLAYING: 9,
				AD_PAUSED: 10,
				AD_ENDED_PLAYING: 11,
				DESTROYED: 13,
				toString: function (eventType) {
					return stringMap[eventType];
				}
			};
		},

		init: function( embedPlayer, callback ){
			this.embedPlayer = embedPlayer;
			this.currentPlayerPluginState = this.PlayerPluginState().INITIALIZING;
			var _this = this;
			var _callback = callback;

			this.mediaElement = new mw.MediaElement(embedPlayer);

			_this.currentAd.id = "";
			_this.currentAd.type = "";
			_this.currentAd.index = 0;
			_this.currentAd.duration = 0;

			var comScoreSettings = {};
			if (_this.isSecure())
				comScoreSettings.secure = true;

			// The configuration naming used in Kaltura are different from the settings in the StreamSense plugin
			for (var key in _this.configOptions) {
				if (this.getConfig(key)) {
					comScoreSettings[_this.configOptions[key]] = this.getConfig(key)
				}
			}

			var standalonePluginUrl = this.isSecure() ? this.genericPluginUrlSecure : this.genericPluginUrl;

			kWidget.appendScriptUrl(standalonePluginUrl, function(){
				_this.streamSenseInstance = new ns_.StreamSense.Plugin(comScoreSettings, _this.reportingPluginName, _this.pluginVersion, _this.playerVersion, {
					init: function () {
						_this.playerEvents = ns_.StreamSense.PlayerEvents;
					},
					release: function () {
					},
					position: function () {
						return _this.getCurrentPosition();
					},
					preMeasurement: function() {
						return true;
					},
					postMeasurement: function() {}
				});
				_this.addPlayerBindings( _callback );
				// We only need to create the StreamingTag Playlist here because the player re-initialises the whole
				// plugin each time it loads a(nother) content media assets.
				_this.callStreamSensePlugin("setPlaylist", _this.getPlaylistLabels(), true);
			}, document);
		},

		log: function(message) {
			//this.streamSenseInstance.log("ComScoreStreamingTag::   " + message);
			mw.log("ComScoreStreamingTag::   " + message);
		},

		setPlayerPluginState: function(newState) {
			if (newState && newState !== this.currentPlayerPluginState) {
				this.log("============================================================");
				this.log("PLAYER PLUGIN MOVING TO A NEW STATE: " + this.PlayerPluginState().toString(newState).toUpperCase());
				this.log("============================================================");

				this.currentPlayerPluginState = newState;
			}
		},

		getPlayerPluginState: function() {
			return this.currentPlayerPluginState;
		},

		getConfig: function (attr) {
			return this.embedPlayer.getKalturaConfig(this.moduleName, attr);
		},

		callStreamSensePlugin:function(){
			var args = $.makeArray( arguments );
			var action = args[0];
			if( parent && parent[ this.getConfig('trackEventMonitor') ] ){
				// Translate the event type to make it more human readable
				var parsedArgs = args.slice();
				if (action == "notify") {
					parsedArgs[1] = ns_.StreamSense.PlayerEvents.toString(parsedArgs[1])
				}
				parent[ this.getConfig('trackEventMonitor') ]( parsedArgs );
			}
			args.splice(0, 1);
			this.streamSenseInstance[action].apply(this, args);
		},

		addPlayerBindings: function( callback ) {
			var _this = this;
			var embedPlayer = this.embedPlayer;

			// Unbind any old bindings:
			embedPlayer.unbindHelper( _this.bindPostfix );

			embedPlayer.bindHelper( 'SourceChange' + _this.bindPostfix, function(){
				var selectedSrc = _this.embedPlayer.mediaElement.selectedSource;
				_this.currentBitrate = selectedSrc.getBitrate();
			});

			embedPlayer.bindHelper( 'onChangeMedia' + _this.bindPostfix, function(){
				_this.destroy();
			});

			embedPlayer.bindHelper( 'playerUpdatePlayhead' + _this.bindPostfix, function(event){
				_this.log("playerUpdatePlayhead ");
			});

			embedPlayer.bindHelper('onplay' + _this.bindPostfix, function() {
				if (_this.getPlayerPluginState() != _this.PlayerPluginState().PLAYING
					&& _this.getPlayerPluginState()!= _this.PlayerPluginState().AD_PLAYING) {
					// Clip labels only need to be set once per loaded media asset (ad or content)
					// and BEFORE the Streaming Tag is notified that the media is playing.
					if (_this.shouldSetClip) {
						_this.callStreamSensePlugin("setClip", _this.getClipLabels(), false, [], true);
						_this.shouldSetClip = false;
					}
					var seek = _this.getPlayerPluginState() == _this.PlayerPluginState().SEEKING;
					_this.callStreamSensePlugin("notify", _this.playerEvents.PLAY, _this.getLabels(seek), _this.getCurrentPosition());
					_this.setPlayerPluginState(_this.PlayerPluginState().PLAYING);
				}
			});

			embedPlayer.bindHelper('onpause' + _this.bindPostfix, function(event) {
				if (_this.getPlayerPluginState() == _this.PlayerPluginState().PLAYING) {
					if (_this.getDuration() == _this.getCurrentPosition()) {
						_this.callStreamSensePlugin("notify", _this.playerEvents.END, _this.getLabels());
					}else {
						_this.setPlayerPluginState(_this.PlayerPluginState().PAUSED);
						_this.callStreamSensePlugin("notify", _this.playerEvents.PAUSE, _this.getLabels(), _this.getCurrentPosition());
					}
				}
			});

			embedPlayer.bindHelper('doStop' + _this.bindPostfix, function(event) {
				_this.setPlayerPluginState(_this.PlayerPluginState().ENDED_PLAYING);
				_this.callStreamSensePlugin("notify", _this.playerEvents.END, _this.getLabels());
			});

			embedPlayer.bindHelper('seeked.started' + _this.bindPostfix, function(event) {
				if (_this.getPlayerPluginState() != _this.PlayerPluginState().SEEKING) {
					_this.setPlayerPluginState(_this.PlayerPluginState().SEEKING);
					_this.callStreamSensePlugin("notify", _this.playerEvents.PAUSE, _this.getLabels(true), _this.getCurrentPosition());
				}
			});

			embedPlayer.bindHelper('onOpenFullScreen' + _this.bindPostfix, function() {
				_this.inFullScreen = true;
				this.streamSenseInstance.setLabel("ns_st_ws", _this.isFullScreen() ? "full" : "norm", true);
			});

			embedPlayer.bindHelper('onCloseFullScreen' + _this.bindPostfix, function() {
				_this.inFullScreen = false;
				this.streamSenseInstance.setLabel("ns_st_ws", _this.isFullScreen() ? "full" : "norm", true);
			});

			embedPlayer.bindHelper( 'onChangeMedia' + _this.bindPostFix, function(){
				_this.log("onChangeMedia ");
			});

			embedPlayer.bindHelper( 'onPlayerStateChange' + _this.bindPostFix, function(event){
				// This code appears to never be called?
				_this.log("onPlayerStateChange " + event);
			});

			embedPlayer.bindHelper('onAdOpen' + _this.bindPostfix, function(event, adId, networkName, type, index) {
				_this.currentAd.id = adId;
				_this.currentAd.type = type;
				_this.currentAd.index = index;

				// Check if the add is already stored. The ads are played in order.
				if (_this.adsPlayed.length < index + 1) {
					_this.adsPlayed.push(_this.currentAd);
				}

				// We need to update the player plugin state before setting up the clip.
				_this.setPlayerPluginState(_this.PlayerPluginState().AD_PLAYING);
				_this.callStreamSensePlugin("setClip", _this.getClipLabels(), false, {}, true);
				_this.callStreamSensePlugin("notify", _this.playerEvents.PLAY, _this.getLabels(), 0);

				_this.shouldSetClip = true;
			});

			embedPlayer.bindHelper('AdSupport_EndAdPlayback' + _this.bindPostfix, function() {
				_this.setPlayerPluginState(_this.PlayerPluginState().AD_ENDED_PLAYING);
				_this.callStreamSensePlugin("notify", _this.playerEvents.END, _this.getLabels());
				_this.currentAd.id = "";
				_this.currentAd.type = "";
				_this.currentAd.index = 0;
				_this.currentAd.duration = 0;
			});

			embedPlayer.bindHelper('AdSupport_AdUpdateDuration' + _this.bindPostfix, function(event, duration) {
				_this.currentAd.duration = duration * 1000;
			});

			embedPlayer.bindHelper('adClick' + _this.bindPostfix, function(url) {
				// When the ad is clicked its also paused
				_this.callStreamSensePlugin("notify", _this.playerEvents.PAUSE, _this.getLabels());
				_this.callStreamSensePlugin("notify", _this.playerEvents.AD_CLICK, _this.getLabels());
			});

			// release the player
			callback();
		},

		destroy: function() {
			$( this.embedPlayer ).unbind( this.bindPostfix );
		},

		getLabels: function(seek) {
			//get common labels values
			this.streamSenseInstance.setLabel("ns_st_br", this.currentBitrate, true);
			this.streamSenseInstance.setLabel("ns_st_ws", this.isFullScreen() ? "full" : "norm", true);
			this.streamSenseInstance.setLabel("ns_st_vo", this.getVolume(), true);

			return seek ? {ns_st_ui: "seek"} : {};
		},

		getPlaylistLabels: function() {
			var labels = {};

			var playlist = this.getPlayList();
			if (playlist) {
				labels.ns_st_pl = playlist.name; // Playlist title set to player playlist's name.
				/*
				// We cannot include playlist length - in number of items as well as an amount of time - because the
				// player does not have any info about the number of ads and their length.

				labels.ns_st_cp = playlist.length;

				var totVidLength = 0;
				for (var i = 0; i < playlist.items.length; i++) {
					totVidLength += playlist.items[i].duration * 1000;
				}
				labels.ns_st_ca = totVidLength; // total playlist length
				*/
			} else {
				/*
				// We cannot include playlist length as amount of time because the player does not have any info about
				// the number of ads and their length.

				labels.ns_st_ca = this.getDuration();
				*/
				labels.ns_st_pl = this.getMediaName(); // Playlist title set to content media title.
			}
			return labels;
		},

		getClipLabels: function() {
			var labels = {};

			if (this.getPlayerPluginState() == this.PlayerPluginState().AD_PLAYING) {
				// Currently playing advertisement media - set the clip labels accordingly.

				// Assign key clip labels.
				labels.ns_st_ci = this.currentAd.id || this.unknownValue; // Unique Media Asset ID
				labels.ns_st_cn = this.getClipNumber(labels.ns_st_ci); // Clip number in the Streaming Tag playlist.
				labels.ns_st_pn = "1"; // Current part number of the ad. Always assume part 1.
				labels.ns_st_tp = "1"; // Always assume ads have a total // Playlist title. of 1 parts.
				labels.ns_st_cl = this.currentAd.duration; // Length of the ad in milliseconds.
				labels.ns_st_cs = this.getPlayerSize(); // Content dimensions (uses player dimensions).
				labels.ns_st_ad = "1"; // Advertisement flag

				// Assign classification type labels.
				labels.ns_st_ty = this.isVideoContent() ? "video" : "audio";
				if(this.isLiveStream()) {
					labels.ns_st_li = "1";
				}
				labels.ns_st_ct = this.getMediaType(false, this.isVideoContent(), this.isLiveStream());

				// Update the Advertisement flag to reflect pre-roll, mid-roll, post-roll, where possible.
				if (this.currentAd.type) { //this is a pre-roll add
					switch (this.currentAd.type) {
						case 'preroll':
							labels.ns_st_ad = "pre-roll";
							break;
						case 'midroll':
							labels.ns_st_ad = "mid-roll";
							break;
						case 'postroll':
							labels.ns_st_ad = "post-roll";
							break;
					}
				}
			} else {
				// Currently playing content media - set the clip labels accordingly.

				// Assign key clip labels.
				labels.ns_st_ci = this.getEntryId(); // Unique Media Asset ID
				labels.ns_st_cn = this.getClipNumber(labels.ns_st_ci); // Clip number in the Streaming Tag playlist.
				labels.ns_st_pn = this.getPartNumber(); // Current part number of the content asset.
				labels.ns_st_tp = this.getTotalNumberOfContentParts(); // Total number of content asset parts.
				labels.ns_st_pr = this.getMediaName(); // Media title from CMS.
				labels.ns_st_cu = this.getClipURL() || this.unknownValue; // Media streaming URL.
				labels.ns_st_cl = this.getDuration(); // Length of the content asset in milliseconds.
				labels.ns_st_cs = this.getPlayerSize(); // Content dimensions (uses player dimensions).

				// Assign classification type labels.
				labels.ns_st_ty = this.isVideoContent() ? "video" : "audio";
				if(this.isLiveStream()) {
					labels.ns_st_li = "1";
				}
				labels.ns_st_ct = this.getMediaType(true, this.isVideoContent(), this.isLiveStream());
			}
			var labelMapping = this.parserRawConfig('labelMapping');
			for (var attrname in labelMapping) {
				labels[attrname] = labelMapping[attrname];
			}
			return labels;
		},

		parserRawConfig: function(configName) {
			var _this = this;
			var rawConfig = this.embedPlayer.getRawKalturaConfig(this.moduleName, configName)
			var result = {};
			rawConfig.split(',').forEach(function(x){
				var arr = x.split('=');
				arr[1] && (result[arr[0]] = _this.evaluateString(arr[1]));
			});
			return result;
		},

		evaluateString: function(str) {
			var hasToEvaluate = false;
			var valueToEvaluate = "";
			var result = "";
			for (var i = 0, len = str.length; i < len; i++) {
				var c = str.charAt(i);
				if (c =='{') {
					hasToEvaluate = true;
					valueToEvaluate = c;
				} else if (c=='}' && hasToEvaluate) {
					valueToEvaluate = valueToEvaluate.concat(c);
					var value = String(this.embedPlayer.evaluate(valueToEvaluate));
					result = result.concat(value);
					hasToEvaluate = false;
				} else if (hasToEvaluate){
					valueToEvaluate = valueToEvaluate.concat(c);
				} else {
					result = result.concat(c);
				}
			}
			try {
				result = eval(result);
			} catch(err) {
				// Do nothing
			}
			return result;
		},

		getMediaType: function(isContent, isVideo, isLive) {
			// There currently is no way to determine the number of content parts from the player API.
			// Because of that some part of this logic will not be executed.
			// We keep the logic in place in case this improves at some point.
			if(isContent) {
				if(isVideo) {
					// Media is video+audio or video-only (image-only).
					if(isLive) {
						return "vc23"; // Live means unicast/simulcast/multicast streaming.
					}
					else{
						var numberOfContentParts = this.getTotalNumberOfContentParts();
						if(numberOfContentParts == 1)
							return "vc11"; // Assuming short form if there is only 1 part.
						else if(numberOfContentParts > 1)
							return "vc12"; // Assuming long form is there is more than 1 part.
						else {
							// This can only happen when numberOfContentParts == 0, which means we don't know the number.
							return "vc00"; // Default fallback value.
						}
					}
				}
				else {
					// Media is audio-only.
					if(isLive) {
						return "ac23";
					}
					else {
						var numberOfContentParts = this.getTotalNumberOfContentParts();
						if (numberOfContentParts == 1)
							return "ac11"; // Assuming short form if there is only 1 part.
						else if (numberOfContentParts > 1)
							return "ac12"; // Assuming long form is there is more than 1 part.
						else {
							// This can only happen when numberOfContentParts == 0, which means we don't know the number.
							return "ac00"; // Default fallback value.
						}
					}
				}
			}
			else {
				// Media is ad.
				if (this.currentAd.type) {
					// There is no sub-classifaction for live streams.
					if(isLive) return "va21";
					// Sub classification for non-live streams.
					switch (this.currentAd.type) {
						case 'preroll':
							return isVideo ? "va11" : "aa11";
							break;
						case 'midroll':
							return isVideo ? "va12" : "aa12";
							break;
						case 'postroll':
							return isVideo ? "va13" : "aa13";
							break;
					}
					return isVideo ? "va00" : "aa00";
				}
			}
			return "vc00"; // This won't ever be reached, but this would be the default fallback value.
		},

		getPlayList: function() {
			var playlist = this.embedPlayer.evaluate("{playlistAPI.dataProvider}");
			if (playlist)
				return playlist.content[0];
			return null;
		},

		getDuration: function() {
			var duration = this.embedPlayer.evaluate("{mediaProxy.entry.duration}");
			return isNaN(duration) ? 0 : Math.max(Math.floor(duration * 1000), 0);
		},

		getVolume: function() {
			return this.embedPlayer.evaluate('{video.volume}') || "0";
		},

		getCurrentPosition: function() {
			if (!this.embedPlayer || !this.embedPlayer.evaluate('{video.player.currentTime}'))
				return 0;
			var currentTime = this.embedPlayer.evaluate('{video.player.currentTime}') * 1000;
			return isNaN(currentTime) ? 0 : Math.max(Math.floor(currentTime), 0);
		},

		isFullScreen: function() {
			return this.inFullScreen;
		},

		getMediaName: function() {
			return this.embedPlayer.evaluate("{mediaProxy.entry.name}") || this.unknownValue;
		},

		getClipURL: function() {
			return this.embedPlayer.evaluate("{mediaProxy.entry.downloadUrl}") || this.unknownValue;
		},

		isVideoContent: function() {
			// This function should return true if the media asset has a visual component, i.e., if it's video or image.
			// We're not using embedPlayer.isImageSource(), but rather just check if the media asset is audio or not.
			return !(this.embedPlayer.isAudio());
		},

		getPlayerSize: function() {
			return this.embedPlayer.getVideoHolder().width() + 'x' + this.embedPlayer.getVideoHolder().height();
		},

		getEntryId: function() {
			return this.embedPlayer.evaluate("{mediaProxy.entry.id}");
		},

		isLiveStream: function() {
			var streamerType = this.embedPlayer.evaluate("{mediaProxy.isLive}");
			return streamerType || false;
		},

		getPartNumber: function() {
			var currentTime = this.getCurrentPosition();
			var partNumber = 1;
			var lastStartAd = -1;
			for (var i = 0; i < this.adsPlayed.length; i++) {
				if (currentTime != 0
					&& this.adsPlayed[i].playedAt >= currentTime
					&& this.adsPlayed[i].playedAt != lastStartAd) { // If there are 2 ads together we only count one part
					partNumber++;
				}
				lastStartAd = this.adsPlayed[i].playedAt;
			}
			return partNumber;
		},

		getTotalNumberOfContentParts: function() {
			// It is not possible to retrieve all the number of ad breaks (and their cue points).
			// This means the total number of content parts is unknown, which is indicated by value 0.
			return 0;
		},

		getClipNumber: function(mediaId) {
			var cn = this.clipNumberMap[mediaId];
			if (cn) {
				return cn;
			}
			this.clipNumberCounter++;
			this.clipNumberMap[mediaId] = this.clipNumberCounter;

			mw.setConfig(this.clipNumberMapConfigKey, this.clipNumberMap);
			mw.setConfig(this.clipNumberCounterConfigKey, this.clipNumberCounter);

			return this.clipNumberCounter;
		},

		isSecure:  function () {
			return mw.getConfig('Kaltura.Protocol') == 'https:';
		}
	};

})( window.mw, jQuery);
