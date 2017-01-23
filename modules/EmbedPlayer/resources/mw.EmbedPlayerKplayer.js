/*
 * The "kaltura player" embedPlayer interface for fallback h.264 and flv video format support
 */
(function (mw, $) {
	"use strict";

	mw.EmbedPlayerKplayer = {
		// Instance name:
		instanceOf: 'Kplayer',

		bindPostfix: '.kPlayer',

		playerPrefix: 'EmbedPlayerKplayer',

		//Flag indicating we should cancel autoPlay on live entry
		// (we set it to true as a workaround to make the Flash start the live checks call)
		cancelLiveAutoPlay: false,
		// List of supported features:
		supports: {
			'playHead': true,
			'pause': true,
			'stop': true,
			'sourceSwitch': true,
			'timeDisplay': true,
			'volumeControl': true,
			'overlays': true,
			'fullscreen': true
		},
		// If the media loaded event has been fired
		mediaLoadedFlag: false,
		seekStarted: false,
		// Stores the current time as set from flash player
		flashCurrentTime: 0,
		selectedFlavorIndex: 0,
		b64Referrer: base64_encode(window.kWidgetSupport.getHostPageUrl()),
		playerObject: null,
		//when playing live rtmp we increase the timeout until we display the "offline" alert, cuz player takes a while to identify "online" state
		LIVE_OFFLINE_ALERT_TIMEOUT: 8000,
		ignoreEnableGui: false,
		flashActivationRequired: false,
        unresolvedSrcURL: false,
        kPreload: {
            'preLoading':false,
            'playPending':false
        },

		// Create our player element
		setup: function (readyCallback) {
			mw.log('EmbedPlayerKplayer:: Setup');

			// Check if we created the kPlayer container
			var $container = this.getPlayerContainer();
			// If container exists, show the player and exit
			if ($container.length) {
				this.enablePlayerObject(true);
				$container.css('visibility', 'visible');
				readyCallback();
				return;
			}

			//Hide the native video tag
			this.hideNativePoster();

			// Create the container
			this.getVideoDisplay().prepend(
				$('<div />')
					.attr('id', this.kPlayerContainerId)
					.addClass('maximize')
			);

			var _this = this;
			this.updateSources();

			var flashvars = {};
		this.getEntryUrl().then(function (srcToPlay) {
				flashvars.widgetId = "_" + _this.kpartnerid;
				flashvars.partnerId = _this.kpartnerid;
				flashvars.autoMute = _this.muted || mw.getConfig('autoMute');
				flashvars.streamerType = _this.streamerType;

				flashvars.entryUrl = encodeURIComponent(srcToPlay);
				flashvars.entryDuration = _this.getDuration();
				flashvars.isMp4 = _this.isMp4Src();
				flashvars.ks = _this.getFlashvars('ks');
				flashvars.serviceUrl = mw.getConfig('Kaltura.ServiceUrl');
				flashvars.b64Referrer = _this.b64Referrer;
				flashvars.forceDynamicStream = _this.getKalturaAttributeConfig('forceDynamicStream');
				flashvars.isLive = _this.isLive();
				flashvars.stretchVideo = _this.getKalturaAttributeConfig('stretchVideo') || false;

				flashvars.flavorId = _this.getKalturaAttributeConfig('flavorId');
				if (!flashvars.flavorId && _this.mediaElement.selectedSource) {
					flashvars.flavorId = _this.mediaElement.selectedSource.getAssetId();
					//_this workaround saves the last real flavorId (usefull for example in widevine_mbr replay )
					_this.setFlashvars('flavorId', flashvars.flavorId);
				}

				if (_this.streamerType != 'http' && _this.streamerType != 'hls' && _this.mediaElement.selectedSource) {
					flashvars.selectedFlavorIndex = _this.getSourceIndex(_this.mediaElement.selectedSource);
				}

                //add ignoreAkamaiHD to the flashvars if added by user (HDS start time)
                if(mw.getConfig("ignoreAkamaiHD")) {
                    flashvars.ignoreAkamaiHD = mw.getConfig("ignoreAkamaiHD");
                }

				//add OSMF HLS Plugin if the source is HLS
				if (_this.isHlsSource(_this.mediaElement.selectedSource)) {
					var hlsPluginConfiguration = {plugin: 'true', asyncInit: 'true', loadingPolicy: 'preInitialize'};
                    if (mw.getConfig("hlsLiveSegmentBuffer")) {
                        hlsPluginConfiguration["liveSegmentBuffer"] = mw.getConfig("hlsLiveSegmentBuffer");
                    }
                    if (mw.getConfig("hlsMaxReliabilityRecordSize")) {
                        hlsPluginConfiguration["maxReliabilityRecordSize"] = mw.getConfig("hlsMaxReliabilityRecordSize");
                    }
                    if (mw.getConfig("hlsMaxDownSwitchLimit")) {
                        hlsPluginConfiguration["maxDownSwitchLimit"] = mw.getConfig("hlsMaxDownSwitchLimit");
                    }
                    if (mw.getConfig("hlsMaxUpSwitchLimit")) {
                        hlsPluginConfiguration["maxUpSwitchLimit"] = mw.getConfig("hlsMaxUpSwitchLimit");
                    }
                    if (mw.getConfig("hlsInitialBufferTime")) {
                        hlsPluginConfiguration["initialBufferTime"] = mw.getConfig("hlsInitialBufferTime");
                    }
                    if (mw.getConfig("hlsExpandedBufferTime")) {
                        hlsPluginConfiguration["expandedBufferTime"] = mw.getConfig("hlsExpandedBufferTime");
                    }
                    if (mw.getConfig("hlsMaxBufferTime")) {
                        hlsPluginConfiguration["maxBufferTime"] = mw.getConfig("hlsMaxBufferTime");
                    }
                    var preferedBitRate = _this.evaluate( '{mediaProxy.preferedFlavorBR}' );
                    if( preferedBitRate ) {
                        hlsPluginConfiguration["prefBitrate"] = preferedBitRate;
                        flashvars.disableAutoDynamicStreamSwitch = true; // disable autoDynamicStreamSwitch logic inside KDP (while playing + if player.isDynamicStream turn autoSwitch on)
                    }
                    if( mw.getConfig("maxBitrate") ) {
                        hlsPluginConfiguration["maxBitrate"] = mw.getConfig("maxBitrate");
                    }
                    if( mw.getConfig("minBitrate") ) {
                        hlsPluginConfiguration["minBitrate"] = mw.getConfig("minBitrate");
                    }
                    if (mw.getConfig("hlsLogs")) {
                        hlsPluginConfiguration["sendLogs"] = mw.getConfig("hlsLogs");
                        var func = ["onManifest", "onNextRequest", "onDownload", "onCurrentTime", "onTag"];
                        for (var index = 0; index < func.length; index++) {

                            (function () {
                                var x = func[index];
                                if (x) {
                                    window[x] = function (a, b, c, d, e, f, g, h) {
                                        parent.window[x](a, b, c, d, e, f, g, h);
                                    }
                                }
                            })();
                        }
                    }
                    flashvars.KalturaHLS = hlsPluginConfiguration;
                    flashvars.streamerType = _this.streamerType = 'hls';
				}

				if (_this.isLive() && _this.streamerType == 'rtmp' && !_this.cancelLiveAutoPlay) {
					flashvars.autoPlay = true;
				}

				if (_this.getKalturaAttributeConfig('maxAllowedRegularBitrate')) {
					flashvars.maxAllowedRegularBitrate = _this.getKalturaAttributeConfig('maxAllowedRegularBitrate');
				}
				if (_this.getKalturaAttributeConfig('maxAllowedFSBitrate')) {
					flashvars.maxAllowedFSBitrate = _this.getKalturaAttributeConfig('maxAllowedFSBitrate');
				}

				//will contain flash plugins we need to load
				var kdpVars = _this.getKalturaConfig('kdpVars', null);
				$.extend(flashvars, kdpVars);

				var flashFailCallback = function(){
					_this.removePoster();
					_this.layoutBuilder.displayAlert( {
						title: _this.getKalturaMsg( 'ks-FLASH-BLOCKED-TITLE' ),
						message: _this.getKalturaMsg( 'ks-FLASH-BLOCKED' ),
						keepOverlay: true,
						noButtons : true,
						props: {
							customAlertTitleCssClass: "AlertTitleTransparent",
							customAlertMessageCssClass: "AlertMessageTransparent",
							customAlertContainerCssClass: "AlertContainerTransparent flashBlockAlertContainer"
						}
					});
				};

				var playerElementFlash = new mw.PlayerElementFlash(_this.kPlayerContainerId, 'kplayer_' + _this.pid, flashvars, _this, function () {
					var bindEventMap = {
						'playerPaused': 'onPause',
						'playerPlayed': 'onPlay',
						'durationChange': 'onDurationChange',
						'playbackComplete': 'onClipDone',
						'playerUpdatePlayhead': 'onUpdatePlayhead',
						'bytesTotalChange': 'onBytesTotalChange',
						'bytesDownloadedChange': 'onBytesDownloadedChange',
						'playerSeekEnd': 'onPlayerSeekEnd',
						'alert': 'onAlert',
						'switchingChangeStarted': 'onSwitchingChangeStarted',
						'switchingChangeComplete': 'onSwitchingChangeComplete',
						'flavorsListChanged': 'onFlavorsListChanged',
						'liveStreamOffline': 'onLiveEntryOffline',
						'liveStreamReady': 'onLiveStreamReady',
						'loadEmbeddedCaptions': 'onLoadEmbeddedCaptions',
						'bufferChange': 'onBufferChange',
						'audioTracksReceived': 'onAudioTracksReceived',
						'audioTrackSelected': 'onAudioTrackSelected',
						'videoMetadataReceived': 'onVideoMetadataReceived',
						'mediaLoaded': 'onMediaLoaded',
						'hlsEndList': 'onHlsEndList',
						'mediaError': 'onMediaError',
						'bitrateChange': 'onBitrateChange',
                        'textTracksReceived': 'onTextTracksReceived',
                        'debugInfoReceived': 'onDebugInfoReceived',
						'readyToPlay': 'onReadyToPlay',
                        'id3tag': 'onId3tag'
					};
				_this.playerObject = this.getElement();
					$.each(bindEventMap, function (bindName, localMethod) {
						_this.playerObject.addJsListener(bindName, localMethod);
					});
					if (_this.startTime !== undefined && _this.startTime != 0 && !_this.supportsURLTimeEncoding()) {
						_this.playerObject.setKDPAttribute('mediaProxy', 'mediaPlayFrom', _this.startTime);
					}
					readyCallback();

                    if (mw.getConfig('autoMute')) {
						_this.triggerHelper("volumeChanged", 0);
					}

				},flashFailCallback);

				_this.bindHelper('switchAudioTrack' + _this.bindPostfix, function (e, data) {
					if (_this.playerObject) {
						_this.playerObject.sendNotification("doAudioSwitch", { audioIndex: data.index  });
					}
				});

				_this.bindHelper('liveEventEnded' + _this.bindPostfix, function () {
					if (_this.playerObject) {
						_this.playerObject.sendNotification("liveEventEnded");
					}
				});

                _this.bindHelper('changeEmbeddedTextTrack' + _this.bindPostfix, function (e, data) {
                    if (_this.playerObject) {
                        _this.playerObject.sendNotification("doTextTrackSwitch", { textIndex :data.index});
                    }
                });

                _this.bindHelper('liveOnline' + _this.bindPostfix, function(){
					if( this.isLive() && !this.isDVR() ) {
                        _this.reset();
                    }
                });
			});

		},

        load: function(){
            //block preload if live or autoplay, unless autoplay was activated on a player with preroll
            if( !this.isLive() && (!this.autoplay || ( this.autoplay && this.isInSequence() ) ) ) {
                //activate preload workaround: start downloading segments and pause the stream
                this.kPreload.preLoading = true;
                this.playerObject.play();
            }
        },

        reset: function(){
			if ( this.restarting ) {
				return;
			}
            this.restarting = true;
            var _this = this;
            this.clean();
            this.setup(function(){
                _this.restarting = false;
                _this.play();
            });
        },

		isHlsSource: function (source) {
			if (source && (source.getMIMEType() == 'application/vnd.apple.mpegurl' )) {
				return true;
			}
			return false;
		},

		setCurrentTime: function (time, callback) {
			this.flashCurrentTime = time;
			if (callback) {
				callback();
			}
		},

		addStartTimeCheck: function () {
			//nothing here, just override embedPlayer.js function
		},

		/**
		 * enable / disable player object from listening and reacting to events
		 * @param enabled true will enable, false will disable
		 */
		enablePlayerObject: function (enabled) {
			if (this.playerObject) {
				this.playerObject.disabled = enabled;
			}
		},

		/**
		 * Hide the player from the screen and disable events listeners
		 **/
		disablePlayer: function () {
			this.getPlayerContainer().css('visibility', 'hidden');
			//Show the native video tag
			this.showNativePoster();
			this.enablePlayerObject(false);
		},

		/**
		 * Show the native video tag
		 */
		showNativePoster: function () {
			var videoTagObj = $($('#' + this.pid).get(0));
			if (videoTagObj) {
				videoTagObj.css('visibility', '');
			}
		},

		/**
		 * Hide the native video tag
		 */
		hideNativePoster: function () {
			var videoTagObj = $($('#' + this.pid).get(0));
			if (videoTagObj) {
				videoTagObj.css('visibility', 'hidden');
			}
		},

        /**
         * receive languages list from hls player plugin
         */
        onTextTracksReceived: function (data) {
            this.triggerHelper('textTracksReceived', data);
        },

		/** 
		* Override base flavor sources method with local set of adaptive flavor tags. 
		*/
		getSources: function(){
			// check if manifest defined flavors have been defined: 
			if( this.manifestAdaptiveFlavors.length ){
				return this.manifestAdaptiveFlavors;
			}
			return this.getSourcesForKDP();
		},
		
		/**
		 * Get required sources for KDP. Either by flavorTags flashvar or tagged wtih 'web'/'mbr' by default
		 * or hls sources
		 **/
		getSourcesForKDP: function () {
			var _this = this;
			var sourcesByTags = [];
			var flavorTags = _this.getKalturaAttributeConfig('flavorTags');
			//select default 'web' / 'mbr' flavors
			if (flavorTags === undefined) {
				var sources = _this.mediaElement.getPlayableSources();
				$.each(sources, function (sourceIndex, source) {
					if (_this.checkForTags(source.getTags(), ['web', 'mbr']) || ( _this.isHlsSource(source))) {
						sourcesByTags.push(source);
					}
				});
			} else {
				sourcesByTags = _this.getSourcesByTags(flavorTags);
			}
			return sourcesByTags;
		},

		restorePlayerOnScreen: function () {
		},

		updateSources: function () {
			if (!( this.isLive() || this.sourcesReplaced || this.isHlsSource(this.mediaElement.selectedSource) )) {
				this.autoSelectTemporalSource( { 'sources': this.getSourcesForKDP() } );
			}
			else if (this.isLive() && this.streamerType == 'rtmp') {
				var _this = this;

				if (!this.autoplay) { //not a real "autoPlay", just to enable live checks
					this.autoplay = true;
					//cancel the autoPlay once Flash starts the live checks
					this.cancelLiveAutoPlay = true;
				} else if (this.playerObject) {
					this.playerObject.setKDPAttribute('configProxy.flashvars', 'autoPlay', 'true');
				}
				//with rtmp the first seconds look offline, delay the "offline" message
				this.setKDPAttribute('liveCore', 'offlineAlertOffest', this.LIVE_OFFLINE_ALERT_TIMEOUT);
				$(this).bind('layoutBuildDone', function () {
					_this.disablePlayControls();
				});

			}
		},

		changeMediaCallback: function (callback) {
			var _this = this;
			this.updateSources();
			this.seekStarted = false;
			this.mediaLoadedFlag = false;
			this.flashCurrentTime = 0;
			this.playerObject.setKDPAttribute('mediaProxy', 'isLive', this.isLive());
			this.playerObject.setKDPAttribute('mediaProxy', 'isMp4', this.isMp4Src());
			this.playerObject.setKDPAttribute('mediaProxy', 'entryDuration', this.getDuration()); //TODO - to support inteliseek - set the correct duration using seekFrom and clipTo
			this.getEntryUrl().then(function (srcToPlay) {
				if (!_this.playlist || _this.autoplay){
					_this.bindHelper("onChangeMediaDone"+_this.bindPostfix, function(){
						_this.unbindHelper("onChangeMediaDone"+_this.bindPostfix);
						_this.play();
					});
				}
				_this.playerObject.sendNotification('changeMedia', {
					entryUrl: srcToPlay
				});
				callback();
			});

		},

		isMp4Src: function () {
			if (this.mediaElement.selectedSource &&
				( this.mediaElement.selectedSource.getMIMEType() == 'video/mp4' || this.mediaElement.selectedSource.getMIMEType() == 'video/h264' )) {
				return true;
			}
			return false;
		},

		/*
		 * Write the Embed html to the target
		 */
		embedPlayerHTML: function () {
		},

		/**
		 * on Pause callback from the kaltura flash player calls parent_pause to
		 * update the interface
		 */
		onPause: function () {
            if(this.kPreload.preLoading){
                this.kPreload.preLoading = false;
                if(this.kPreload.playPending){
                    this.kPreload.playPending = false;
                    this.play();
                }
                return;
            }
			$(this).trigger("pause");
		},

		/**
		 * onPlay function callback from the kaltura flash player directly call the
		 * parent_play
		 */
		onPlay: function () {
            if(this.kPreload.preLoading){
                this.playerObject.pause();
                return;
            }
			if ( mw.isChrome() && !this.flashActivationRequired && mw.getConfig("EmbedPlayer.EnableFlashActivation") !== false ){
				this.flashActivationRequired = true;
				$(this).hide();
			}
			if (this._propagateEvents) {
				$(this).trigger("playing");
				this.hideSpinner();
				if (this.isLive()) {
					this.ignoreEnableGui = false;
					this.enablePlayControls(['sourceSelector']);
				}
				this.stopped = this.paused = false;
			}
		},

		onDurationChange: function (data, id) {
			var dur = this.getDuration();
			if (this.startTime && this.pauseTime) {
				dur = this.pauseTime - this.startTime + 2;
			} else {
				if (this.startTime) {
					dur = dur - this.startTime + 2;
				}
			}
			if ( !this.isLive() && data.newValue > dur && mw.getConfig("EmbedPlayer.EnableURLTimeEncoding")===true ) {
				return;
			}
			// Update the duration ( only if not in url time encoding mode:
			this.setDuration(data.newValue);
			this.playerObject.duration = data.newValue;
		},
		onVideoMetadataReceived: function (data) {
			if (data && data.info) {
				$(this).trigger('videoMetadataReceived', [ data.info ]);
			}
			// Trigger "media loaded"
			if (!this.mediaLoadedFlag) {
				$(this).trigger('mediaLoaded');
				this.mediaLoadedFlag = true;
			}
		},
		onMediaLoaded: function () {
			// Trigger "media loaded"
			if (!this.mediaLoadedFlag) {
				$(this).trigger('mediaLoaded');
				this.mediaLoadedFlag = true;
			}
		},
		onClipDone: function () {
			this.parent_onClipDone();
			this.flashCurrentTime = 0;
		},

		onAlert: function (data, id) {
			if (data.messageKey) {
				data.message = gM(data.messageKey);
			}
			if (data.titleKey) {
				data.title = gM(data.titleKey);
			}
			this.layoutBuilder.displayAlert(data);
		},

		/**
		 * m3u8 has 'EndList' tag
		 */
		onHlsEndList: function () {
			this.triggerHelper('liveEventEnded');
		},
		/**
		 * Playback error
		 *
		 */
		onMediaError: function (data) {
			var error = null;
			if (data) {
				error = data.errorId + " detail:" + data.errorDetail;
			}
			data.errorMessage = this.getKalturaMsg('ks-CLIP_NOT_FOUND');
			mw.log("EmbedPlayerKPlayer::MediaError error code: " + error);
			this.triggerHelper('embedPlayerError', [ data ]);
		},

		/**
		 * play method calls parent_play to update the interface
		 */
		play: function () {
            if(this.kPreload.preLoading){
                this.kPreload.playPending = true;
                return;
            }
            if(this.restarting){
                return;
            }
            var _this = this;
			mw.log('EmbedPlayerKplayer::play');
            if(this.unresolvedSrcURL){
                this.getEntryUrl().then(function (srcToPlay) {
                    _this.unresolvedSrcURL = false;
                    _this.playerObject.sendNotification('changeMedia', {
                        entryUrl: srcToPlay
                    });
                    _this.play();
                });
                return;
            }
			var shouldDisable = false;
			if (this.isLive() && this.paused) {
				shouldDisable = true;
			}
			if (this.parent_play()) {
				//live might take a while to start, meanwhile disable gui
				if (shouldDisable) {
					this.ignoreEnableGui = true;
					this.disablePlayControls(['sourceSelector']);
				}
				this.playerObject.play();
				this.monitor();
			} else {
				mw.log("EmbedPlayerKPlayer:: parent play returned false, don't issue play on kplayer element");
			}
		},

		/**
		 * pause method calls parent_pause to update the interface
		 */
		pause: function () {
			try {
				this.playerObject.pause();
			} catch (e) {
				mw.log("EmbedPlayerKplayer:: doPause failed");
			}
			this.parent_pause();
		},
		/**
		 * playerSwitchSource switches the player source working around a few bugs in browsers
		 *
		 * @param {object}
		 *            source Video Source object to switch to.
		 * @param {function}
		 *            switchCallback Function to call once the source has been switched
		 * @param {function}
		 *            doneCallback Function to call once the clip has completed playback
		 */
		playerSwitchSource: function (source, switchCallback, doneCallback) {
			//we are not supposed to switch source. Ads can be played as siblings. Change media doesn't use this method.
			if (switchCallback) {
				switchCallback(this.playerObject);
			}
			setTimeout(function () {
				if (doneCallback)
					doneCallback();
			}, 100);
		},

		/**
		 * Issues a seek to the playerElement
		 *
		 * @param {Float}
		 *            percentage Percentage of total stream length to seek to
		 */
		doSeek: function (seekTime) {
			this.seekStarted = true;
			if (this.firstPlay) {
				this.stopEventPropagation();
				if (this.streamerType == 'http') {
					this.playerObject.seek(seekTime);
				} else {
					this.playerObject.setKDPAttribute( 'mediaProxy', 'mediaPlayFrom', seekTime );
					this.playerObject.play();
				}
			} else {
				this.playerObject.seek(seekTime);
			}
		},

		/**
		 * Issues a volume update to the playerElement
		 *
		 * @param {Float}
		 *            percentage Percentage to update volume to
		 */
		setPlayerElementVolume: function (percentage) {
			if (this.playerObject) {
				this.playerObject.changeVolume(percentage);
			}
		},

		/**
		 * function called by flash at set interval to update the playhead.
		 */
		onUpdatePlayhead: function (playheadValue) {
			if ( this.flashActivationRequired ){
				this.flashActivationRequired = false;
				$(this).show();
			}
            if(this.isLive()){
                $(this).trigger('timeupdate');
                return; //for Live the flashCurrentTime will be updated through id3Tag
            }
			if (this.seeking) {
				this.seeking = false;
                this.flashCurrentTime = playheadValue;
			}else {
                if(this.flashCurrentTime < playheadValue){
                    this.flashCurrentTime = playheadValue;
                }
            }
			$(this).trigger('timeupdate');
		},

		/**
		 * function called by flash when the total media size changes
		 */
		onBytesTotalChange: function (data, id) {
			this.bytesTotal = data.newValue;
		},

		/**
		 * function called by flash applet when download bytes changes
		 */
		onBytesDownloadedChange: function (data, id) {
			this.bytesLoaded = data.newValue;
			this.bufferedPercent = this.bytesLoaded / this.bytesTotal;
			// Fire the parent html5 action
			$(this).trigger('updateBufferPercent', this.bufferedPercent);
		},

		onPlayerSeekEnd: function () {
			if (this.firstPlay) {
				this.restoreEventPropagation();
			}
			if (this.seekStarted) {
				this.seekStarted = false;
				this.triggerHelper('seeked', [this.playerObject.getCurrentTime()]);
			}
		},

		onSwitchingChangeStarted: function (data, id) {
			$(this).trigger('sourceSwitchingStarted', [ data ]);
		},

		onSwitchingChangeComplete: function (data, id) {
			this.onBitrateChange( data );
			// TODO if we need to track source index should be top level method per each play interface having it's own adaptive logic
			//this.mediaElement.setSourceByIndex(data.newIndex);
            $(this).trigger('sourceSwitchingEnd', [ data.newIndex ]);
		},

		onBitrateChange: function ( data ) {
			if ( data && data.newBitrate ) {
				this.triggerHelper('bitrateChange', data.newBitrate);
			}
		},

		onFlavorsListChanged: function (data, id) {
			var flavors = data.flavors;
			var currentSources = [];
			if (this.mediaElement) {
				currentSources = this.mediaElement.getPlayableSources();
			}
			if (flavors && flavors.length > 1) {
				//find matching pixels height because flash doesn't expose it
				if (currentSources.length > 0) {
					$.each(flavors, function (index, flavor) {
						for (var i = 0; i < currentSources.length; i++) {
							if (currentSources[i].bandwidth == flavor.bandwidth) {
								flavor.height = currentSources[i].height;
								break;
							}
						}
					});
				}
				this.setKDPAttribute('sourceSelector', 'visible', true);
				this.parent_onFlavorsListChanged(flavors);
			}
		},

		onLiveEntryOffline: function () {
			if (this.streamerType == 'rtmp') {
				this.triggerHelper('liveStreamStatusUpdate', { 'onAirStatus': false });
			}
		},

		onLiveStreamReady: function () {
			if (this.streamerType == 'rtmp') {
				//first time the livestream is ready
				this.hideSpinner();
				this.playerObject.setKDPAttribute('configProxy.flashvars', 'autoPlay', 'false');  //reset property for next media
				this.triggerHelper('liveStreamStatusUpdate', { 'onAirStatus': true });
				if (this.cancelLiveAutoPlay) {
					this.cancelLiveAutoPlay = false;
					this.autoplay = false;
					//fix misleading player state after we cancelled autoplay
					this.pause();
				}
			}
		},

		onLoadEmbeddedCaptions: function (data) {
			this.triggerHelper('onTextData', data);

			var caption = {
				source: {
					srclang: data.language
				},
				capId: data.trackid,
				caption: {
					content: data.text
				}
			};
			this.triggerHelper('onEmbeddedData', caption);
		},

		onEnableGui: function (data, id) {
			if (this.ignoreEnableGui) {
				return;
			}
			if (data.guiEnabled === false) {
				this.disablePlayControls();
			} else {
				this.enablePlayControls();
			}
		},

		onBufferChange: function (buffering) {
			if (buffering) {
				this.bufferStart();
			} else {
				this.bufferEnd();
			}
		},

		onAudioTracksReceived: function (data) {
			this.triggerHelper('audioTracksReceived', data);
		},

		onAudioTrackSelected: function (data) {
			this.triggerHelper('audioTrackIndexChanged', data);
		},

        onDebugInfoReceived: function (data){
            var msg = '';
            for (var prop in data) {
                msg += prop + ': ' + data[prop]+' | ';
            }
            this.triggerHelper('debugInfoReceived', data);
            mw.log("EmbedPlayerKplayer:: onDebugInfoReceived | " + msg);
        },

		onReadyToPlay: function (){
            this.triggerHelper('readyToPlay');
        },

        onId3tag: function (data) {
			//Decode the data
			var id3TagData = base64_decode(data.data);
			//Get the JSON substring
			var id3TagString = id3TagData.substring(id3TagData.indexOf("{"), id3TagData.lastIndexOf("}")+1);
			//Parse JSON
			var id3Tag = JSON.parse(id3TagString);

            this.triggerHelper('onId3Tag', id3Tag);
        },

		/**
		 * Get the embed player time
		 */
		getPlayerElementTime: function () {
			// update currentTime
			return this.flashCurrentTime;
		},

		/**
		 * Get the embed flash object player Element
		 */
		getPlayerElement: function () {
			return this.playerObject;
		},

		getPlayerContainer: function () {
			if (!this.kPlayerContainerId) {
				this.kPlayerContainerId = 'kplayer_' + this.id;
			}
			return $('#' + this.kPlayerContainerId);
		},

		/**
		 * Get the URL to pass to KDP according to the current streamerType
		 */
		getEntryUrl: function () {
            var _this = this;
			var deferred = $.Deferred();
			var originalSrc = this.mediaElement.selectedSource.getSrc();
			if (this.isHlsSource(this.mediaElement.selectedSource)) {
                // add playerType=flash indicator (Kaltura Live HLS only)
                //if( this.isLive() &&  mw.getConfig('isLiveKalturaHLS') ) {
                //    originalSrc = originalSrc + "&playerType=flash";
                //}
                this.streamerType = 'hls';
				this.resolveSrcURL(originalSrc)
					.then(function (srcToPlay) {
                        _this.unresolvedSrcURL = false;
                        deferred.resolve(srcToPlay);
					}, function () { //error
                        _this.unresolvedSrcURL = true;
						deferred.resolve(originalSrc);
					});
				return deferred;
			}

			else if (this.isLive() || this.sourcesReplaced) {
				return deferred.resolve(originalSrc);
			}
			var flavorIdParam = '';
			var mediaProtocol = this.getKalturaAttributeConfig('mediaProtocol') || mw.getConfig('Kaltura.Protocol') || "http";
			var format;
			var fileExt = 'f4m';
			if (this.streamerType === 'hdnetwork') {
				format = 'hdnetworksmil';
				fileExt = 'smil';
			} else if (this.streamerType === 'live') {
				format = 'rtmp';
			} else {
				format = this.streamerType;
				if (format == 'http') {
					flavorIdParam = this.mediaElement.selectedSource ? "/flavorId/" + this.mediaElement.selectedSource.getAssetId() : "";
				}
			}

			//build playmanifest URL
			var ksString = this.getFlashvars('ks') ? "/ks/" + this.getFlashvars('ks') : "";
			var srcUrl = window.kWidgetSupport.getBaseFlavorUrl(this.kpartnerid) + "/entryId/" + this.kentryid + flavorIdParam
				+ this.getPlaymanifestArg("deliveryCode", "deliveryCode") + "/format/" + format
				+ "/protocol/" + mediaProtocol + this.getPlaymanifestArg("cdnHost", "cdnHost") + this.getPlaymanifestArg("storageId", "storageId")
				+ ksString + "/uiConfId/" + this.kuiconfid + this.getPlaymanifestArg("referrerSig", "referrerSig")
				+ this.getPlaymanifestArg("tags", "flavorTags") + "/a/a." + fileExt + "?referrer=" + this.b64Referrer;


			if (this.supportsURLTimeEncoding() && this.pauseTime) {
				// remove previous clipTo param from the URL if exists
				if (srcUrl.indexOf("&clipTo=") !== -1) {
					srcUrl = srcUrl.substr(0, this.selectedSource.src.indexOf("&clipTo="));
				}
				// add the new clipTo param to the URL
				srcUrl = srcUrl + "&clipTo=" + parseInt(this.pauseTime) * 1000;
			}
			if (this.supportsURLTimeEncoding() && this.startTime) {
				// remove previous seekFrom param from the URL if exists
				if (srcUrl.indexOf("&seekFrom=") !== -1) {
					srcUrl = srcUrl.substr(0, srcUrl.indexOf("&seekFrom="));
				}
				// add the new seekFrom param to the URL
				srcUrl = srcUrl + "&seekFrom=" + parseInt(this.startTime) * 1000;
			}

			srcUrl = srcUrl +"&playSessionId="  + this.evaluate('{configProxy.sessionId}');

            //copy clientTag from original playManifest
            if (originalSrc.indexOf("&clientTag=") !== -1) {
                var clientTag = originalSrc.slice(originalSrc.indexOf("clientTag"));
                clientTag = clientTag.slice(0, clientTag.indexOf("&"))
                srcUrl = srcUrl + "&" + clientTag;
            }
			
			var sourceElm = $('<source />')
				.attr( {src: srcUrl} )
				.get( 0 );
			var refObj = new mw.MediaSource(sourceElm);
			this.triggerHelper('SourceSelected', refObj);
			deferred.resolve(refObj.src);
			return deferred;
		},

		/**
		 * If argkey was set as flashvar or uivar this function will return a string with "/argName/argValue" form,
		 * that can be concatanated to playmanifest URL.
		 * Otherwise an empty string will be returnned
		 */
		getPlaymanifestArg: function (argName, argKey) {
			var argString = "";
			var argVal = this.getKalturaAttributeConfig(argKey);
			if (argVal !== undefined) {
				argString = "/" + argName + "/" + argVal;
			}
			return argString;
		},
		switchSrc: function (source) {
			var _this = this;
			//http requires source switching, all other switch will be handled by OSMF in KDP
			if (this.streamerType == 'http' && !this.getKalturaAttributeConfig('forceDynamicStream')) {
				//other streamerTypes will update the source upon "switchingChangeComplete"
				this.mediaElement.setSource(source);
				this.getEntryUrl().then(function (srcToPlay) {
					_this.playerObject.setKDPAttribute('mediaProxy', 'entryUrl', srcToPlay);
					_this.playerObject.sendNotification('doSwitch', { flavorIndex: _this.getSourceIndex(source) });
				});
				return;
			}
            var sourceIndex = -1; //autoDynamicStreamSwitch = true for adaptive bitrate (Auto)
            if( source !== -1 ){
                sourceIndex = this.getSourceIndex(source);
            }
			this.playerObject.sendNotification('doSwitch', { flavorIndex: sourceIndex });
		},
		canAutoPlay: function () {
			return (!this.isLive() || (this.isLive() && !this.isOffline()));
		},
		backToLive: function () {
			this.triggerHelper('movingBackToLive');
            var _this = this;
            if(this.isDVR()){
                this.playerObject.sendNotification('goLive');
                if (this.buffering) {
                    this.bindHelper('bufferEndEvent'+this.bindPostfix, function () {
                        _this.unbindHelper('bufferEndEvent'+_this.bindPostfix);
                        _this.playerObject.seek(_this.getDuration());
                        //Unfreeze scrubber
                        _this.syncMonitor();
                    });
                }
            }else{
                this.bindHelper('playing'+this.bindPostfix, function () {
                    _this.unbindHelper('playing'+_this.bindPostfix);
                    _this.playerObject.sendNotification('goLive');
                });
            }
		},

		setKPlayerAttribute: function (host, prop, val) {
			this.playerObject.setKDPAttribute(host, prop, val);
		},
		clean: function () {
			this.unbindHelper(  this.bindPostfix );
			$(this.getPlayerContainer()).remove();
			this.playerObject = null;
		},
		setStorageId: function (storageId) {
			var _this = this;
			this.parent_setStorageId(storageId);
			//set url with new storageId
			if (this.playerObject) {
				this.getEntryUrl().then(function (srcToPlay) {
					_this.playerObject.setKDPAttribute('mediaProxy', 'entryUrl', srcToPlay);
				});
			}
		},
		toggleFullscreen: function () {
			var _this = this;
			this.parent_toggleFullscreen();
			//Redraw flash object, this fixes a Flash resize issue on when wmode=transparent
			this.playerObject.redrawObject();

			if (_this.layoutBuilder.fullScreenManager.isInFullScreen()) {
				_this.playerObject.sendNotification("hasOpenedFullScreen");
			} else {
				_this.playerObject.sendNotification("hasCloseFullScreen");
			}
		},
		playSegment: function (startTime, endTime) {
			var _this = this;
			if (this.supportsURLTimeEncoding()) {
				this.getEntryUrl().then(function (srcToPlay) {
					var shouldSeek = !_this.paused;
					_this.stop();
					_this.playerObject.sendNotification('changeMedia', {
						entryUrl: srcToPlay
					});
					if (shouldSeek) {
						_this.seek(0);
					} else {
						_this.playerObject.sendNotification("doStop");
					}
				});
			} else {
				this.playerObject.setKDPAttribute('mediaProxy', 'mediaPlayFrom', this.startTime);
				if (endTime) {
					this.pauseTime = endTime;
				}
				if (startTime) {
					this.seek(startTime);
				}
			}

		},
        getCurrentBufferLength: function(){
            return parseInt(this.playerObject.getCurrentBufferLength()); //return buffer length in seconds
        },

		bufferHandling: function(){
			// Nothing here, only overwrite the super bufferHandling method.
			// The buffer handling here made by Flash itself, by listening to "bufferChange" event.
		}
	};

})(mediaWiki, jQuery);
