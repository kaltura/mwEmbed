var senders = {};  // a list of Chrome senders
var liveStreaming = false;  // a flag to indicate live streaming or not
var maxBW = null;  // maximum bandwidth
var videoStreamIndex = -1;  // index for video stream
var audioStreamIndex = -1;  // index for audio stream
var licenseUrl = null;  // license server URL
var videoQualityIndex = -1;  // index for video quality level
var audioQualityIndex = -1;  // index for audio quality level
var manifestCredentials = false;  // a flag to indicate manifest credentials
var segmentCredentials = false;  // a flag to indicate segment credentials
var licenseCredentials = false;  // a flag to indicate license credentials
var streamVideoBitrates;  // bitrates of video stream selected
var streamAudioBitrates;  // bitrates of audio stream selected

var castReceiverManager = null; // an instance of cast.receiver.CastReceiverManager
var mediaManager = null;  // an instance of cast.receiver.MediaManager
var messageBus = null;  // custom message bus
var mediaElement = null;  // media element
var mediaHost = null;  // an instance of cast.player.api.Host
var mediaProtocol = null;  // an instance of cast.player.api.Protocol
var mediaPlayer = null;  // an instance of cast.player.api.Player
var playerInitialized = false;
var isInSequence = false;
var debugMode = false;
var kdp;
var maskAdEndedIdelState = false;
var adsPluginEnabled = false;
var protocol;

onload = function () {
	if (debugMode){
		cast.receiver.logger.setLevelValue(cast.receiver.LoggerLevel.DEBUG);
		cast.player.api.setLoggerLevel(cast.player.api.LoggerLevel.DEBUG);
	}

	mediaElement = document.getElementById('receiverVideoElement');
	mediaElement.autoplay = true;
	setMediaElementEvents(mediaElement);
	mediaManager = new cast.receiver.MediaManager(mediaElement);

	castReceiverManager = cast.receiver.CastReceiverManager.getInstance();
	messageBus = castReceiverManager.getCastMessageBus('urn:x-cast:com.kaltura.cast.player');

	setCastReceiverManagerEvents();
	initApp();

	messageBus.onMessage = function (event) {
		console.log('### Message Bus - Media Message: ' + JSON.stringify(event));
		setDebugMessage('messageBusMessage', event);

		console.log('### CUSTOM MESSAGE: ' + JSON.stringify(event));
		// show/hide messages
		console.log(event['data']);
		var payload = JSON.parse(event['data']);
		if (payload['type'] === 'show') {
			if (payload['target'] === 'debug') {
				document.getElementById('messages').style.display = 'block';
			}
			if (payload['target'] === 'logo') {
				document.getElementById('logo').style.display = 'block';
			} else {
				document.getElementById('receiverVideoElement').style.display = 'block';
			}
		} else if (payload['type'] === 'hide') {
			if (payload['target'] === 'debug') {
				document.getElementById('messages').style.display = 'none';
			}
			if (payload['target'] === 'logo') {
				var logoElement =  document.getElementById('logo');
				logoElement.style.opacity = 0;
				setTimeout(function() {
					logoElement.style.display = 'none';
				},1000);
			} else {
				document.getElementById('receiverVideoElement').style.display = 'none';
			}
		} else if (payload['type'] === 'ENABLE_CC') {
			var trackNumber = payload['trackNumber'];
			setCaption(trackNumber);
		} else if (payload['type'] === 'WebVTT') {
			mediaPlayer.enableCaptions(false);
			mediaPlayer.enableCaptions(true, 'webvtt', 'captions.vtt');
		} else if (payload['type'] === 'TTML') {
			mediaPlayer.enableCaptions(false);
			mediaPlayer.enableCaptions(true, 'ttml', 'captions.ttml');
		} else if (payload['type'] === 'live') {
			if (mediaManager){
				mediaManager.onGetStatus(event);
			}
			if (payload['value'] === true) {
				liveStreaming = true;
			} else {
				liveStreaming = false;
			}
		} else if (payload['type'] === 'maxBW') {
			maxBW = payload['value'];
		} else if (payload['type'] === 'license') {
			licenseUrl = payload['value'];
			setDebugMessage('licenseUrl', licenseUrl);
		} else if (payload['type'] === 'qualityIndex' &&
			payload['mediaType'] === 'video') {
			videoQualityIndex = payload['value'];
			setDebugMessage('videoQualityIndex', videoQualityIndex);
		} else if (payload['type'] === 'qualityIndex' &&
			payload['mediaType'] === 'audio') {
			audioQualityIndex = payload['value'];
			setDebugMessage('audioQualityIndex', audioQualityIndex);
		} else if (payload['type'] === 'manifestCredentials') {
			manifestCredentials = payload['value'];
			setDebugMessage('manifestCredentials', manifestCredentials);
		} else if (payload['type'] === 'segmentCredentials') {
			segmentCredentials = payload['value'];
			setDebugMessage('segmentCredentials', segmentCredentials);
		} else if (payload['type'] === 'licenseCredentials') {
			licenseCredentials = payload['value'];
			setDebugMessage('licenseCredentials', licenseCredentials);
		} else if (payload['type'] === 'customData') {
			customData = payload['value'];
			setDebugMessage('customData', customData);
		} else if (payload['type'] === 'load') {
			//setMediaManagerEvents();
		} else if (payload['type'] === 'notification') {
			kdp.sendNotification(payload['event'], [payload['data']]); // pass notification event to the player
		} else if (payload['type'] === 'setLogo') {
			document.getElementById('logo').style.backgroundImage = "url(" + payload['logo'] + ")";
		} else if (payload['type'] === 'setKDPAttribute') {
			kdp.setKDPAttribute(payload['plugin'], payload['property'], payload['value']);
		} else if (payload['type'] === 'changeMedia') {
			var logoElem = document.getElementById('logo');
			logoElem.style.display = 'block';
			logoElem.style.opacity = 1;
			if (mediaPlayer) {
				mediaPlayer.unload();
				mediaPlayer = null;
			}
			kdp.sendNotification('changeMedia', payload.data);
		} else if (payload['type'] === 'embed') {
			if (!playerInitialized) {
				var intervalID = setInterval(function () {
					if (typeof mw !== "undefined") {
						clearInterval(intervalID);
						var publisherID = payload['publisherID'];
						var uiconfID = payload['uiconfID'];
						var entryID = payload['entryID'];
						mw.setConfig("EmbedPlayer.HidePosterOnStart", true);
						if (payload['debugKalturaPlayer'] == true) {
							mw.setConfig("debug", true);
							mw.setConfig("debugTarget", "kdebug");
							//mw.setConfig("debugFilter", "---");
							mw.setConfig("autoScrollDebugTarget", true);
							document.getElementById('kdebug').style.display = 'block';
						}
						mw.setConfig("chromecastReceiver", true);
						mw.setConfig("Kaltura.ExcludedModules", "chromecast");
						var fv = {
							"dash":{
								'plugin': false
							},
							"multiDrm":{
								'plugin': false
							},
							"embedPlayerChromecastReceiver": {
								'plugin': true
							},
							"chromecast": {
								'plugin': false
							},
							"playlistAPI":{
								'plugin': false
							}
						};
						fv = extend(fv, payload['flashVars']);
						var mimeType = null;
						var src = null;

						kWidget.embed({
							"targetId": "kaltura_player",
							"wid": "_" + publisherID,
							"uiconf_id": uiconfID,
							"readyCallback": function (playerId) {
								if (!playerInitialized) {
									playerInitialized = true;
									kdp = document.getElementById(playerId);
									kdp.kBind("broadcastToSender", function (msg) {
										messageBus.broadcast(msg);
										isInSequence = ( msg == "chromecastReceiverAdOpen" );
									});
									var loadContent = function () {
										console.info("Load content");
										if (protocol !== null) {
											console.info("Attaching content media source");
											mediaPlayer.load();

											var updateDuration = function () {
												if (mediaElement.duration) {
													mediaElement.removeEventListener("durationchange", updateDuration, false);
													var mediaInfo = mediaManager.getMediaInformation();
													mediaInfo.duration = mediaElement.duration;
													mediaManager.setMediaInformation(mediaInfo);
												}
											};
											mediaElement.addEventListener("durationchange", updateDuration, false);
										}
									};
									kdp.kBind("firstPlay", function(){
										document.getElementById('logo').style.display = 'block';
									});
									kdp.kBind("onContentResumeRequested", function(){
										console.info("Ad ended");
										loadContent();
									});
									kdp.kBind("adErrorEvent", function(){
										console.info("Ad error");
										loadContent();
									});
									kdp.kBind("chromecastReceiverLoaded", function () {
										setMediaManagerEvents();
									});
									kdp.kBind("SourceSelected", function (source) {
										mimeType = source.mimeType;
										src = source.src;
									});
									kdp.kBind("widgetLoaded layoutReady", function () {
										 if (kdp.evaluate('{doubleClick.plugin}') || kdp.evaluate('{vast.plugin}')){
											 adsPluginEnabled = true;
										 }
										var msg = "readyForMedia";
										msg = msg + "|" + src + "|" + mimeType;
										messageBus.broadcast(msg);
									});
								}
							},
							"flashvars": fv,
							"cache_st": 1438601385,
							"entry_id": entryID
						});
					}
				}, 100);
			}
		} else {
			licenseUrl = null;
		}
		// broadcast(event['data']);
	};


};
function setMediaManagerEvents() {
	mediaManager.customizedStatusCallback= function(status){
		console.info(status);
		if (maskAdEndedIdelState && (status.playerState = cast.receiver.media.PlayerState.IDLE)){
			console.info("Preventing IDLE on ad ended event, set player state to BUFFERING");
			status.playerState = cast.receiver.media.PlayerState.PLAYING;
			maskAdEndedIdelState = false;
		}
		return status;
	};
	/**
	 * Called when the media ends.
	 *
	 * mediaManager.resetMediaElement(cast.receiver.media.IdleReason.FINISHED);
	 **/
	mediaManager['onEndedOrig'] = mediaManager.onEnded;
	/**
	 * Called when the media ends
	 */
	mediaManager.onEnded = function () {
		setDebugMessage('mediaManagerMessage', 'ENDED');
		console.info("onEnded: sequenceProxy.isInSequence=" + kdp.evaluate("{sequenceProxy.isInSequence}"));
		if (kdp.evaluate('{sequenceProxy.isInSequence}')) {
			maskAdEndedIdelState = true;
		} else {
			var logoElement =  document.getElementById('logo');
			logoElement.style.opacity = 1;
			setTimeout(function() {
				logoElement.style.display = 'block';
			},1000);
			mediaManager['onEndedOrig']();
		}
	};

	/**
	 * Default implementation of onError.
	 *
	 * mediaManager.resetMediaElement(cast.receiver.media.IdleReason.ERROR)
	 **/
	mediaManager['onErrorOrig'] = mediaManager.onError;
	/**
	 * Called when there is an error not triggered by a LOAD request
	 * @param {Object} obj An error object from callback
	 */
	mediaManager.onError = function (obj) {
		setDebugMessage('mediaManagerMessage', 'ERROR - ' + JSON.stringify(obj));

		mediaManager['onErrorOrig'](obj);
		if (mediaPlayer) {
			mediaPlayer.unload();
			mediaPlayer = null;
		}
	};

	/**
	 * Processes the get status event.
	 *
	 * Sends a media status message to the requesting sender (event.data.requestId)
	 **/
	mediaManager['onGetStatusOrig'] = mediaManager.onGetStatus;
	/**
	 * Processes the get status event.
	 * @param {Object} event An status object
	 */
	mediaManager.onGetStatus = function (event) {
		console.log('### Media Manager - GET STATUS: ' + JSON.stringify(event));
		setDebugMessage('mediaManagerMessage', 'GET STATUS ' +
			JSON.stringify(event));

		mediaManager['onGetStatusOrig'](event);
	};

	/**
	 * Default implementation of onLoadMetadataError.
	 *
	 * mediaManager.resetMediaElement(cast.receiver.media.IdleReason.ERROR, false);
	 * mediaManager.sendLoadError(cast.receiver.media.ErrorType.LOAD_FAILED);
	 **/
	mediaManager['onLoadMetadataErrorOrig'] = mediaManager.onLoadMetadataError;
	/**
	 * Called when load has had an error, overridden to handle application
	 * specific logic.
	 * @param {Object} event An object from callback
	 */
	mediaManager.onLoadMetadataError = function (event) {
		console.log('### Media Manager - LOAD METADATA ERROR: ' +
			JSON.stringify(event));
		setDebugMessage('mediaManagerMessage', 'LOAD METADATA ERROR: ' +
			JSON.stringify(event));

		mediaManager['onLoadMetadataErrorOrig'](event);
	};

	/**
	 * Default implementation of onMetadataLoaded
	 *
	 * Passed a cast.receiver.MediaManager.LoadInfo event object
	 * Sets the mediaElement.currentTime = loadInfo.message.currentTime
	 * Sends the new status after a LOAD message has been completed succesfully.
	 * Note: Applications do not normally need to call this API.
	 * When the application overrides onLoad, it may need to manually declare that
	 * the LOAD request was sucessful. The default implementaion will send the new
	 * status to the sender when the video/audio element raises the
	 * 'loadedmetadata' event.
	 * The default behavior may not be acceptable in a couple scenarios:
	 *
	 * 1) When the application does not want to declare LOAD succesful until for
	 *    example 'canPlay' is raised (instead of 'loadedmetadata').
	 * 2) When the application is not actually loading the media element (for
	 *    example if LOAD is used to load an image).
	 **/
	mediaManager['onLoadMetadataOrig'] = mediaManager.onLoadMetadataLoaded;
	/**
	 * Called when load has completed, overridden to handle application specific
	 * logic.
	 * @param {Object} event An object from callback
	 */
	mediaManager.onLoadMetadataLoaded = function (event) {
		console.log('### Media Manager - LOADED METADATA: ' +
			JSON.stringify(event));
		setDebugMessage('mediaManagerMessage', 'LOADED METADATA: ' +
			JSON.stringify(event));
		mediaManager['onLoadMetadataOrig'](event);
	};

	/**
	 * Processes the pause event.
	 *
	 * mediaElement.pause();
	 * Broadcast (without sending media information) to all senders that pause has
	 * happened.
	 **/
	mediaManager['onPauseOrig'] = mediaManager.onPause;
	/**
	 * Process pause event
	 * @param {Object} event
	 */
	mediaManager.onPause = function (event) {
		if (kdp.evaluate("{sequenceProxy.isInSequence}")) {
			console.info("======Prevent pause during ad!!!!!");
		}else {
			console.log('### Media Manager - PAUSE: ' + JSON.stringify(event));
			setDebugMessage('mediaManagerMessage', 'PAUSE: ' + JSON.stringify(event));
			mediaManager['onPauseOrig'](event);
		}
	};

	/**
	 * Default - Processes the play event.
	 *
	 * mediaElement.play();
	 *
	 **/
	mediaManager['onPlayOrig'] = mediaManager.onPlay;
	/**
	 * Process play event
	 * @param {Object} event
	 */
	mediaManager.onPlay = function (event) {
		console.log('### Media Manager - PLAY: ' + JSON.stringify(event));
		setDebugMessage('mediaManagerMessage', 'PLAY: ' + JSON.stringify(event));
		kdp.sendNotification("doPlay");
		mediaManager['onPlayOrig'](event);
	};

	/**
	 * Default implementation of the seek event.
	 * Sets the mediaElement.currentTime to event.data.currentTime. If the
	 * event.data.resumeState is cast.receiver.media.SeekResumeState.PLAYBACK_START
	 * and the mediaElement is paused then call mediaElement.play(). Otherwise if
	 * event.data.resumeState is cast.receiver.media.SeekResumeState.PLAYBACK_PAUSE
	 * and the mediaElement is not paused, call mediaElement.pause().
	 * Broadcast (without sending media information) to all senders that seek has
	 * happened.
	 **/
	mediaManager['onSeekOrig'] = mediaManager.onSeek;
	/**
	 * Process seek event
	 * @param {Object} event
	 */
	mediaManager.onSeek = function (event) {
		console.log('### Media Manager - SEEK: ' + JSON.stringify(event));
		setDebugMessage('mediaManagerMessage', 'SEEK: ' + JSON.stringify(event));
		if (kdp.evaluate('{sequenceProxy.isInSequence}')) {
			var requestId = event.data.requestId;
			window.mediaManager.broadcastStatus(true, requestId);
		} else {
			mediaManager['onSeekOrig'](event);
		}
	};

	/**
	 * Default implementation of the set volume event.
	 * Checks event.data.volume.level is defined and sets the mediaElement.volume
	 * to the value.
	 * Checks event.data.volume.muted is defined and sets the mediaElement.muted
	 * to the value.
	 * Broadcasts (without sending media information) to all senders that the
	 * volume has changed.
	 **/
	mediaManager['onSetVolumeOrig'] = mediaManager.onSetVolume;
	/**
	 * Process set volume event
	 * @param {Object} event
	 */
	mediaManager.onSetVolume = function (event) {
		console.log('### Media Manager - SET VOLUME: ' + JSON.stringify(event));
		setDebugMessage('mediaManagerMessage', 'SET VOLUME: ' +
			JSON.stringify(event));

		mediaManager['onSetVolumeOrig'](event);
	};

	/**
	 * Processes the stop event.
	 *
	 * mediaManager.resetMediaElement(cast.receiver.media.IdleReason.CANCELLED,
	 *   true, event.data.requestId);
	 *
	 * Resets Media Element to IDLE state. After this call the mediaElement
	 * properties will change, paused will be true, currentTime will be zero and
	 * the src attribute will be empty. This only needs to be manually called if
	 * the developer wants to override the default behavior of onError, onStop or
	 * onEnded, for example.
	 **/
	mediaManager['onStopOrig'] = mediaManager.onStop;
	/**
	 * Process stop event
	 * @param {Object} event
	 */
	mediaManager.onStop = function (event) {
		console.log('### Media Manager - STOP: ' + JSON.stringify(event));
		setDebugMessage('mediaManagerMessage', 'STOP: ' + JSON.stringify(event));

		mediaManager['onStopOrig'](event);
	};

	/**
	 * Default implementation for the load event.
	 *
	 * Sets the mediaElement.autoplay to false.
	 * Checks that data.media and data.media.contentId are valid then sets the
	 * mediaElement.src to the data.media.contentId.
	 *
	 * Checks the data.autoplay value:
	 *   - if undefined sets mediaElement.autoplay = true
	 *   - if has value then sets mediaElement.autoplay to that value
	 **/
	mediaManager['onLoadOrig'] = mediaManager.onLoad;
	/**
	 * Processes the load event.
	 * @param {Object} event
	 */
	mediaManager.onLoad = function (event) {
		messageBus.broadcast("mediaManager.onLoad");
		console.log('### Media Manager - LOAD: ' + JSON.stringify(event));
		setDebugMessage('mediaManagerMessage', 'LOAD ' + JSON.stringify(event));

		if (mediaPlayer !== null) {
			mediaPlayer.unload(); // Ensure unload before loading again
		}

		if (event.data['media'] && event.data['media']['contentId']) {
			var url = event.data['media']['contentId'];

			setDebugMessage('mediaPlayerState', '-');

			mediaHost = new cast.player.api.Host({
				'mediaElement': mediaElement,
				'url': url
			});

			if (manifestCredentials) {
				mediaHost.updateManifestRequestInfo = function (requestInfo) {
					// example of setting CORS withCredentials
					if (!requestInfo.url) {
						requestInfo.url = url;
					}
					requestInfo.withCredentials = true;
				};
			}
			if (segmentCredentials) {
				mediaHost.updateSegmentRequestInfo = function (requestInfo) {
					// example of setting CORS withCredentials
					requestInfo.withCredentials = true;
					// example of setting headers
					//requestInfo.headers = {};
					//requestInfo.headers['content-type'] = 'text/xml;charset=utf-8';
				};
			}
			if (licenseCredentials) {
				mediaHost.updateLicenseRequestInfo = function (requestInfo) {
					// example of setting CORS withCredentials
					requestInfo.withCredentials = true;
				};
			}

			if (licenseUrl) {
				mediaHost.licenseUrl = licenseUrl;
			}

//			if (customData) {
//				mediaHost.licenseCustomData = customData;
//				console.log('### customData: ' + customData);
//			}

			if ((videoQualityIndex != -1 && streamVideoBitrates &&
				videoQualityIndex < streamVideoBitrates.length) ||
				(audioQualityIndex != -1 && streamAudioBitrates &&
					audioQualityIndex < streamAudioBitrates.length)) {
				mediaHost['getQualityLevelOrig'] = mediaHost.getQualityLevel;
				mediaHost.getQualityLevel = function (streamIndex, qualityLevel) {
					if (streamIndex == videoStreamIndex && videoQualityIndex != -1) {
						return videoQualityIndex;
					} else if (streamIndex == audioStreamIndex &&
						audioQualityIndex != -1) {
						return audioQualityIndex;
					} else {
						return qualityLevel;
					}
				};
			}

			mediaHost.onError = function (errorCode, requestStatus) {
				messageBus.broadcast("mediaHostState: Fatal Error: code = " + errorCode);
				console.error('### HOST ERROR - Fatal Error: code = ' + errorCode);
				setDebugMessage('mediaHostState', 'Fatal Error: code = ' + errorCode);
				if (mediaPlayer !== null) {
					mediaPlayer.unload();
				}
			};

			var initialTimeIndexSeconds = event.data['media']['currentTime'] || 0;
			protocol = null;
			var ext = null;
			if (url.lastIndexOf('.m3u8') >= 0) {
				protocol = cast.player.api.CreateHlsStreamingProtocol(mediaHost);
				ext = 'HLS';
			} else if (url.lastIndexOf('.mpd') >= 0) {
				protocol = cast.player.api.CreateDashStreamingProtocol(mediaHost);
				ext = 'MPEG-DASH';
			} else if (url.lastIndexOf('.ism/') >= 0 ||
				url.lastIndexOf('.isml/') >= 0) {
				protocol = cast.player.api.CreateSmoothStreamingProtocol(mediaHost);
				ext = 'Smooth Streaming';
			}
			console.log('### Media Protocol Identified as ' + ext);
			setDebugMessage('mediaProtocol', ext);


			if (protocol === null) {
				// Call on original handler
				mediaManager['onLoadOrig'](event); // Call on the original callback
			} else {
				// Advanced Playback - HLS, MPEG DASH, SMOOTH STREAMING
				// Player registers to listen to the media element events through the
				// mediaHost property of the  mediaElement
				mediaPlayer = new cast.player.api.Player(mediaHost);
				var loadMethod;
				if (!adsPluginEnabled || (event.data['customData'] && event.data['customData']['replay'])) {
					loadMethod = "load";
				} else {
					loadMethod = "preload";
				}
				if (liveStreaming) {
					mediaPlayer[loadMethod](protocol, Infinity);
				}
				else {
					mediaPlayer[loadMethod](protocol, initialTimeIndexSeconds);
				}
			}
			messageBus.broadcast("mediaHostState: success");
			setDebugMessage('mediaHostState', 'success');
		}
	};
}
function initApp() {
	console.log('### Application Loaded. Starting system.');
	setDebugMessage('applicationState', 'Loaded. Starting up.');

	/**
	 * Application config
	 **/
	var appConfig = new cast.receiver.CastReceiverManager.Config();

	/**
	 * Text that represents the application status. It should meet
	 * internationalization rules as may be displayed by the sender application.
	 * @type {string|undefined}
	 **/
	appConfig.statusText = 'Ready to play';

	/**
	 * Maximum time in seconds before closing an idle
	 * sender connection. Setting this value enables a heartbeat message to keep
	 * the connection alive. Used to detect unresponsive senders faster than
	 * typical TCP timeouts. The minimum value is 5 seconds, there is no upper
	 * bound enforced but practically it's minutes before platform TCP timeouts
	 * come into play. Default value is 10 seconds.
	 * @type {number|undefined}
	 * 10 minutes for testing, use default 10sec in prod by not setting this value
	 **/
	appConfig.maxInactivity = 600;
	castReceiverManager.onShutdown = function(){
		messageBus.broadcast("shutdown"); // receiver was shut down by the browser Chromecast icon - send message to the player to stop the app
	}
	/**
	 * Initializes the system manager. The application should call this method when
	 * it is ready to start receiving messages, typically after registering
	 * to listen for the events it is interested on.
	 */
	castReceiverManager.start(appConfig);
}

function setCaption(trackNumber) {
	var current, next;
	if (protocol) {
		var streamCount = protocol.getStreamCount();
		var streamInfo;
		for ( current = 0 ; current < streamCount ; current++ ) {
			if ( protocol.isStreamEnabled( current ) ) {
				streamInfo = protocol.getStreamInfo( current );
				if ( streamInfo.mimeType.indexOf( 'text' ) === 0 ) {
					protocol.enableStream( current , false );
					mediaPlayer.enableCaptions( false );
					break;
				}
			}
		}
		if ( trackNumber ) {
			protocol.enableStream( trackNumber , true );
			mediaPlayer.enableCaptions( true );
		}
	}
}

function nextCaption() {
	var current, next;
	if (protocol) {
		var streamCount = protocol.getStreamCount();
		var streamInfo;
		for ( current = 0 ; current < streamCount ; current++ ) {
			if ( protocol.isStreamEnabled( current ) ) {
				streamInfo = protocol.getStreamInfo( current );
				if ( streamInfo.mimeType.indexOf( 'text' ) === 0 ) {
					break;
				}
			}
		}

		if ( current === streamCount ) {
			next = 0;
		} else {
			next = current + 1;
		}

		while ( next !== current ) {
			if ( next === streamCount ) {
				next = 0;
			}

			streamInfo = protocol.getStreamInfo( next );
			if ( streamInfo.mimeType.indexOf( 'text' ) === 0 ) {
				break;
			}

			next++;
		}

		if ( next !== current ) {
			if ( current !== streamCount ) {
				protocol.enableStream( current , false );
				mediaPlayer.enableCaptions( false );
			}

			if ( next !== streamCount ) {
				protocol.enableStream( next , true );
				mediaPlayer.enableCaptions( true );
			}
		}
	}
}

function setCastReceiverManagerEvents() {
	castReceiverManager.onReady = function (event) {
		console.log('### Cast Receiver Manager is READY: ' + JSON.stringify(event));
		setDebugMessage('castReceiverManagerMessage', 'READY: ' +
			JSON.stringify(event));
		setDebugMessage('applicationState', 'Loaded. Started. Ready.');
	};

	castReceiverManager.onSenderConnected = function (event) {
		console.log('### Cast Receiver Manager - Sender Connected : ' +
			JSON.stringify(event));
		setDebugMessage('castReceiverManagerMessage', 'Sender Connected: ' +
			JSON.stringify(event));

		senders = castReceiverManager.getSenders();
		setDebugMessage('senderCount', '' + senders.length);
	};

	castReceiverManager.onSenderDisconnected = function (event) {
		console.log('### Cast Receiver Manager - Sender Disconnected : ' +
			JSON.stringify(event));
		setDebugMessage('castReceiverManagerMessage', 'Sender Disconnected: ' +
			JSON.stringify(event));

		senders = castReceiverManager.getSenders();
		if ((senders.length === 0) &&
			(event.reason == cast.receiver.system.DisconnectReason.REQUESTED_BY_SENDER)) {
			castReceiverManager.stop();
		}
		setDebugMessage('senderCount', '' + senders.length);
	};

	castReceiverManager.onSystemVolumeChanged = function (event) {
		console.log('### Cast Receiver Manager - System Volume Changed : ' +
			JSON.stringify(event));
		setDebugMessage('castReceiverManagerMessage', 'System Volume Changed: ' +
			JSON.stringify(event));

		// See cast.receiver.media.Volume
		console.log('### Volume: ' + event.data['level'] + ' is muted? ' +
			event.data['muted']);
		setDebugMessage('volumeMessage', 'Level: ' + event.data['level'] +
			' -- muted? ' + event.data['muted']);
	};
}

function setMediaElementEvents(mediaElement) {
	mediaElement.addEventListener('loadstart', function (e) {
		kdp.sendNotification("loadstart");
		document.getElementById("kaltura_player").style.visibility = "visible";
		console.log('######### MEDIA ELEMENT LOAD START');
		setDebugMessage('mediaElementState', 'Load Start');
		messageBus.broadcast("mediaElement: Load Start");

	});
	mediaElement.addEventListener('loadeddata', function (e) {
		if (protocol === undefined || protocol === null){
			return;
		}
		console.log('######### MEDIA ELEMENT DATA LOADED');
		setDebugMessage('mediaElementState', 'Data Loaded');
		messageBus.broadcast("mediaElement:Data Loaded");
		var streamCount = protocol.getStreamCount();
		var streamInfo;
		var streamVideoCodecs;
		var streamAudioCodecs;
		var captions = {};
		for (var c = 0; c < streamCount; c++) {
			streamInfo = protocol.getStreamInfo(c);
			if (streamInfo.mimeType.indexOf('text') === 0) {
				captions[c] = streamInfo.language;
			} else if (streamInfo.mimeType === 'video/mp4' ||
				streamInfo.mimeType === 'video/mp2t') {
				streamVideoCodecs = streamInfo.codecs;
				streamVideoBitrates = streamInfo.bitrates;
				if (maxBW) {
					var videoLevel = protocol.getQualityLevel(c, maxBW);
				}
				else {
					var videoLevel = protocol.getQualityLevel(c);
				}
				setDebugMessage('streamVideoQuality', streamInfo.bitrates[videoLevel]);
				videoStreamIndex = c;
				setDebugMessage('videoStreamIndex', videoStreamIndex);
			} else if (streamInfo.mimeType === 'audio/mp4') {
				audioStreamIndex = c;
				setDebugMessage('audioStreamIndex', audioStreamIndex);
				streamAudioCodecs = streamInfo.codecs;
				streamAudioBitrates = streamInfo.bitrates;
				var audioLevel = protocol.getQualityLevel(c);
				setDebugMessage('streamAudioQuality', streamInfo.bitrates[audioLevel]);
			}
			else {
			}
		}
		setDebugMessage('streamCount', streamCount);
		setDebugMessage('streamVideoCodecs', streamVideoCodecs);
		setDebugMessage('streamVideoBitrates', JSON.stringify(streamVideoBitrates));
		setDebugMessage('streamAudioCodecs', streamAudioCodecs);
		setDebugMessage('streamAudioBitrates', JSON.stringify(streamAudioBitrates));
		setDebugMessage('captions', JSON.stringify(captions));

		// send captions to senders
		console.log(JSON.stringify(captions));
		if (Object.keys(captions).length > 0) {
			var caption_message = {};
			caption_message['captions'] = captions;
			//messageSender(senders[0], JSON.stringify(caption_message));
			broadcast(JSON.stringify(caption_message));
		}

		// send video bitrates to senders
		if (streamVideoBitrates && Object.keys(streamVideoBitrates).length > 0) {
			var video_bitrates_message = {};
			video_bitrates_message['video_bitrates'] = streamVideoBitrates;
			broadcast(JSON.stringify(video_bitrates_message));
		}

		// send audio bitrates to senders
		if (streamAudioBitrates && Object.keys(streamAudioBitrates).length > 0) {
			var audio_bitrates_message = {};
			audio_bitrates_message['audio_bitrates'] = streamAudioBitrates;
			broadcast(JSON.stringify(audio_bitrates_message));
		}

		getPlayerState();

	});
	mediaElement.addEventListener('canplay', function (e) {
		console.log('######### MEDIA ELEMENT CAN PLAY');
		setDebugMessage('mediaElementState', 'Can Play');
		getPlayerState();
	});
	mediaElement.addEventListener('ended', function (e) {
		console.log('######### MEDIA ELEMENT ENDED');
		setDebugMessage('mediaElementState', 'Ended');
		getPlayerState();
	});
	mediaElement.addEventListener('playing', function (e) {
		console.log('######### MEDIA ELEMENT PLAYING');
		setDebugMessage('mediaElementState', 'Playing');
	});
	mediaElement.addEventListener('waiting', function (e) {
		console.log('######### MEDIA ELEMENT WAITING');
		setDebugMessage('mediaElementState', 'Waiting');
		getPlayerState();
	});
	mediaElement.addEventListener('stalled', function (e) {
		console.log('######### MEDIA ELEMENT STALLED');
		setDebugMessage('mediaElementState', 'Stalled');
		getPlayerState();
	});
	mediaElement.addEventListener('error', function (e) {
		console.log('######### MEDIA ELEMENT ERROR ' + e);
		setDebugMessage('mediaElementState', 'Error');
		getPlayerState();
	});
	mediaElement.addEventListener('abort', function (e) {
		console.log('######### MEDIA ELEMENT ABORT ' + e);
		messageBus.broadcast("mediaElement: aborted");
		setDebugMessage('mediaElementState', 'Abort');
		getPlayerState();
	});
	mediaElement.addEventListener('susppend', function (e) {
		console.log('######### MEDIA ELEMENT SUSPEND ' + e);
		setDebugMessage('mediaElementState', 'Suspended');
		getPlayerState();
	});
	mediaElement.addEventListener('progress', function (e) {
		setDebugMessage('mediaElementState', 'Progress');
		getPlayerState();
	});

	mediaElement.addEventListener('seeking', function (e) {
		console.log('######### MEDIA ELEMENT SEEKING ' + e);
		setDebugMessage('mediaElementState', 'Seeking');
		getPlayerState();
	});
	mediaElement.addEventListener('seeked', function (e) {
		console.log('######### MEDIA ELEMENT SEEKED ' + e);
		setDebugMessage('mediaElementState', 'Seeked');
		getPlayerState();
	});
}
/*
 * send message to a sender via custom message channel
 @param {string} senderId A id string for specific sender
 @param {string} message A message string
 */
function messageSender(senderId, message) {
	messageBus.send(senderId, message);
}

/*
 * broadcast message to all senders via custom message channel
 @param {string} message A message string
 */
function broadcast(message) {
	messageBus.broadcast(message);
}

/*
 * set debug message on receiver screen/TV
 @param {string} message A message string
 */
function setDebugMessage(elementId, message) {
	if (debugMode){
		document.getElementById(elementId).innerHTML = '' + JSON.stringify(message);
	}
}

/*
 * get media player state
 */
function getPlayerState() {
	if (mediaPlayer){
		try {
			var playerState = mediaPlayer.getState();
			setDebugMessage('mediaPlayerState', 'underflow: ' + playerState['underflow']);
		}catch(e){}
	}
}
function extend(a, b){
	for(var key in b)
		if(b.hasOwnProperty(key))
			a[key] = b[key];
	return a;
}
/*
 * get DOM element css properties
 */
function getCss(dom){
	var style;
	var returns = {};
	if(window.getComputedStyle){
		var camelize = function(a,b){
			return b.toUpperCase();
		};
		style = window.getComputedStyle(dom, null);
		for(var i = 0, l = style.length; i < l; i++){
			var prop = style[i];
			var camel = prop.replace(/\-([a-z])/g, camelize);
			var val = style.getPropertyValue(prop);
			returns[camel] = val;
		};
		return returns;
	};
	if(style = dom.currentStyle){
		for(var prop in style){
			returns[prop] = style[prop];
		};
		return returns;
	};
	return this.css();
}