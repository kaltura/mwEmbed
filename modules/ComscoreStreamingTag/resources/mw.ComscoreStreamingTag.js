( function( mw, $ ) { "use strict";

	/*
	 Limitations:
	 - No tracking for the overlay ads
	 */
	mw.ComscoreStreamingTag = function( embedPlayer, callback ){
		this.init( embedPlayer, callback );
	};

	mw.ComscoreStreamingTag.prototype = {

		pluginVersion: "1.0.7",
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
		currentPlayerPluginState: null, // Keep track of the comScore pluguin state
		bandwidth: 0,
		lastCuePointUpdateTime: -1,
		adCuePoints: null,
		adsPlayed: [],
		currentAd: {},
		currentBitrate: 0,
		shouldSetClip: true,
		buffering: false,
		seeking: false,
		isPlaybackIntended: false,
		playing: false,
		checkEveryIndex:0,
		lastKnownTime: 0,
		// Mapping for the module settings and the StreamSense plugin
		configOptions: {c2:"c2", pageView:"pageview", logUrl:"logurl", persistentLabels:"persistentlabels", debug:"debug"},

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

			var genericPluginUrlSecure = this.getConfig("genericPluginUrlSecure") || this.genericPluginUrlSecure;
			var genericPluginUrl = this.getConfig("genericPluginUrl") || this.genericPluginUrl;
			var standalonePluginUrl = this.isSecure() ? genericPluginUrlSecure : genericPluginUrl;

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

		setClip: function() {
			// Clip labels only need to be set once per loaded media asset (ad or content)
			// and BEFORE the Streaming Tag is notified that the media is playing.
			if (this.shouldSetClip) {
				this.callStreamSensePlugin("setClip", this.getClipLabels(), false, [], true);
				this.shouldSetClip = false;
			}
		},

		onPlaybackActive: function() {
			if (this.isPlaybackIntended
				&& this.playing
				&& !this.seeking
				&& this.getPlayerPluginState() != this.PlayerPluginState().PLAYING
				&& this.getPlayerPluginState() != this.PlayerPluginState().AD_PLAYING) {
				this.setClip();
				var seek = this.getPlayerPluginState() == this.PlayerPluginState().SEEKING;
				this.callStreamSensePlugin("notify", this.playerEvents.PLAY, this.getLabels(seek), this.getCurrentPosition());
				this.setPlayerPluginState(this.PlayerPluginState().PLAYING);
				this.lastKnownTime = this.embedPlayer.getPlayerElementTime();
			}
		},

		onPlaybackInactive: function() {
			if (this.getPlayerPluginState() == this.PlayerPluginState().PLAYING) {
				this.setPlayerPluginState(this.PlayerPluginState().PAUSED);
				this.callStreamSensePlugin("notify", this.playerEvents.PAUSE, this.getLabels(this.seeking), this.getCurrentPosition());
				this.lastKnownTime = this.embedPlayer.getPlayerElementTime();
			}
		},

		onBuffering: function() {
			this.callStreamSensePlugin("notify", this.playerEvents.BUFFER, {});
			this.setPlayerPluginState(this.PlayerPluginState().BUFFERING);
		},

		onAdPlay: function(adId, type, index, duration) {
			if (arguments.length != 4) {
				var adMetadata = this.embedPlayer.evaluate( '{sequenceProxy.activePluginMetadata}' );
				if (!adMetadata) return;
				adId = adMetadata.ID;
				type = adMetadata.type.toLowerCase();
				duration = adMetadata.duration * 1000;
				index = 0; // Unknown value
			}
			if (type != 'preroll' && type != 'midroll' && type != "postroll") {
				return; // ComScore only tags prerolls, midrolls and postrolls
			}
			if (this.currentAd.id == adId) return; // If this is already in use, ignore it.

			this.currentAd.id = adId;
			this.currentAd.type = type;
			this.currentAd.index = index;
			if (this.adsPlayed.length < index + 1) {
				this.adsPlayed.push(this.currentAd);
			}
			if (this.currentAd.duration > 0){
				this.currentAd.duration = duration;
			}
			this.setPlayerPluginState(this.PlayerPluginState().AD_PLAYING);
			this.callStreamSensePlugin("setClip", this.getClipLabels(), false, {}, true);
			this.callStreamSensePlugin("notify", this.playerEvents.PLAY, this.getLabels(), 0);
			this.shouldSetClip = true;
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
			try {
				if (parent && parent[this.getConfig('trackEventMonitor')]) {
					var parsedArgs = args.slice();
					if (action == "notify") {
						parsedArgs[1] = ns_.StreamSense.PlayerEvents.toString(parsedArgs[1])
					}
					parent[this.getConfig('trackEventMonitor')](parsedArgs);
				}
			} catch (e) {}
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
				_this.currentBitrate = selectedSrc.getBitrate() * 1024;
			});

			embedPlayer.bindHelper( 'bufferStartEvent' + _this.bindPostfix, function(){
				_this.buffering = true;
			});

			embedPlayer.bindHelper( 'bufferEndEvent' + _this.bindPostfix, function(){
				_this.buffering = false;
			});

			embedPlayer.bindHelper( 'monitorEvent' + _this.bindPostfix, function(){
				if (_this.checkEveryIndex++ % 2 != 0) return;
				var currentTime = embedPlayer.getPlayerElementTime();

				if (currentTime != _this.lastKnownTime) {
					if (_this.isPlaybackIntended) {
						_this.playing = true;
					} else {
						_this.playing = false;
					}
				} else {
					_this.playing = false;
				}
				if (_this.isPlaybackIntended) {
					if( !_this.playing && _this.buffering) {
						// If the user pressed the play button while the player is paused and buffering
						// then this can be considered buffering due to an empty buffer
						// (i.e., buffering prior to playback or re-buffering during playback).
						_this.onBuffering();
					} else {
						if (_this.playing && !_this.seeking) {
							_this.onPlaybackActive();
						} else {
							_this.onPlaybackInactive();
						}
					}
				}
				_this.lastKnownTime = currentTime;
			});

			embedPlayer.bindHelper( 'onChangeMedia' + _this.bindPostfix, function(){
				_this.destroy();
			});

			//This event has not been observed to be triggered.
			//embedPlayer.bindHelper( 'playerUpdatePlayhead' + _this.bindPostfix, function(event){
			//_this.log("playerUpdatePlayhead");
			//});

			embedPlayer.bindHelper('onplay' + _this.bindPostfix, function() {
				_this.isPlaybackIntended = true;
			});

			embedPlayer.bindHelper('onpause' + _this.bindPostfix, function(event) {
				_this.isPlaybackIntended = false;
				_this.playing = false;
				_this.onPlaybackInactive();
			});

			embedPlayer.bindHelper('doStop' + _this.bindPostfix, function(event) {
				var seek = _this.getPlayerPluginState() == _this.PlayerPluginState().SEEKING;
				_this.setPlayerPluginState(_this.PlayerPluginState().ENDED_PLAYING);
				if(_this.isPlaybackIntended && _this.playing) {
					_this.callStreamSensePlugin("notify", _this.playerEvents.END, _this.getLabels(seek));
				}
				_this.lastKnownTime = 0;
				_this.checkEveryIndex = 0;
			});

			embedPlayer.bindHelper('seeked.started' + _this.bindPostfix, function(event) {
				_this.seeking = true;
				if (_this.isPlaybackIntended && _this.getPlayerPluginState() != _this.PlayerPluginState().SEEKING) {
					_this.onPlaybackInactive();
					_this.setPlayerPluginState(_this.PlayerPluginState().SEEKING);
					// The following statement is ineffective as the 'seeked.started' event is only triggered AFTER seeking has completed.
					// At that time the plugin has already sent the PAUSE event to indicate playback halted, which can be confirmed visually.
					//_this.callStreamSensePlugin("notify", _this.playerEvents.PAUSE, _this.getLabels(true), _this.getCurrentPosition());
				}
			});

			embedPlayer.bindHelper('seeked.stopped' + _this.bindPostfix, function(event) {
				_this.seeking = false;
			});

			embedPlayer.bindHelper('onOpenFullScreen' + _this.bindPostfix, function() {
				_this.inFullScreen = true;
				_this.streamSenseInstance.setLabel("ns_st_ws", _this.isFullScreen() ? "full" : "norm", true);
			});

			embedPlayer.bindHelper('onCloseFullScreen' + _this.bindPostfix, function() {
				_this.inFullScreen = false;
				_this.streamSenseInstance.setLabel("ns_st_ws", _this.isFullScreen() ? "full" : "norm", true);
			});

			embedPlayer.bindHelper( 'onChangeMedia' + _this.bindPostFix, function(){
				_this.log("onChangeMedia ");
			});

			embedPlayer.bindHelper( 'onPlayerStateChange' + _this.bindPostFix, function(event){
				// This code appears to never be called?
				_this.log("onPlayerStateChange " + event);
			});

			embedPlayer.bindHelper('onAdOpen' + _this.bindPostfix, function(event, adId, networkName, type, index) {
				_this.onAdPlay(adId, type, index, 0);
			});

			embedPlayer.bindHelper('AdSupport_StartAdPlayback' + _this.bindPostfix, function() {
				_this.onAdPlay();
			});

			embedPlayer.bindHelper('AdSupport_AdUpdateDuration' + _this.bindPostfix, function(event, duration) {
				_this.onAdPlay();
				_this.currentAd.duration = duration * 1000;
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
				labels.ns_st_ep = this.getMediaName(); // Media title from CMS.
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
			if (!rawConfig) return [];
			var result = {};
			// Split and trim the spaces
			rawConfig.split(/ *, */g).forEach(function(x) {
				try {
					x = decodeURIComponent(x);
				} catch (e) {}
				// Create two groups, one for the label name and the second one for the label value without any "
				var re = /([^=]+)="?([^"]*)"?/g;
				var arr = re.exec(x);
				(arr.length == 3) && (result[arr[1]] = _this.evaluateString(arr[2]));
			});
			return result;
		},

		evaluateString: function(str) {
			var _this = this;
			// Match all the elements inside {}
			var re = /{[^}]+}/g;
			var result = str.replace(re, function(match, p1, p2) {
				return _this.embedPlayer.evaluate(match)
			});
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
			return mw.getConfig('Kaltura.Protocol') == 'https';
		}
	};

})( window.mw, jQuery);