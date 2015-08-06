/*
 * The "kaltura player" embedPlayer interface for fallback h.264 and flv video format support
 */
(function (mw, $) {
	"use strict";

	mw.EmbedPlayerSilverlight = {
		// Instance name:
		instanceOf: 'Silverlight' ,
		bindPostfix: '.sPlayer' ,
		playerPrefix: 'EmbedPlayerSilverlight' ,
		//default playback start time to wait before falling back to unicast in millisecods
		defaultMulticastStartTimeout: 10000 ,
		defaultMulticastKeepAliveInterval: 10000 ,
		defaultMulticastKESKtimeout: 10000 ,
		defaultMulticastKESStartInterval: 2000 ,
		multicastAddress: null ,
		defaultEnableMulticastFallback: true ,
		containerId: null ,
		// List of supported features:
		supports: {
			'playHead': true ,
			'pause': true ,
			'stop': true ,
			'sourceSwitch': true ,
			'timeDisplay': true ,
			'volumeControl': true ,
			'overlays': true ,
			'fullscreen': true
		} ,
		requestedSrcIndex: null ,
		durationReceived: false ,
		gotFirstMulticastFrame: false,
		readyCallbackFunc: undefined ,
		isMulticast: false ,
		isError: false ,
		readyFuncs: [] ,
		// Create our player element
		setup: function ( readyCallback ) {
			var _this = this;
			mw.log( 'EmbedPlayerSilverlight:: Setup' );

			// Check if we created the sPlayer container
			var $container = this.getPlayerContainer();
			// If container exists, show the player and exit
			if ( $container.length ) {
				this.enablePlayerObject( true );
				$container.css( 'visibility' , 'visible' );
				readyCallback();
				return;
			}

			// Create the container
			this.getVideoDisplay().prepend(
				$( '<div />' )
					.attr( 'id' , this.containerId )
					.addClass( 'maximize' )
			);

			this.slCurrentTime = 0;
			this.loadMedia( readyCallback );

			this.bindHelper( 'changeEmbeddedTextTrack' , function ( e , data ) {
				if ( _this.playerObject ) {
					_this.playerObject.selectTextTrack( data.index );
				}
			} );

			this.bindHelper( 'switchAudioTrack' , function ( e , data ) {
				if ( _this.playerObject ) {
					_this.playerObject.selectAudioTrack( data.index );
				}
			} );
		} ,

		fillDiagnostics: function ( diagObj ) {
			if ( diagObj ) {

				if ( this.multiastServerUrl ) {
					diagObj.multiastServerUrl = this.multiastServerUrl;
				}
				if (this.multicastSessionId) {
					diagObj.multicastSessionId = this.multicastSessionId;
				}
			}
		} ,
		connectToKES: function ( resolvedSrc ) {
			mw.log( 'connectToKES ' + resolvedSrc );
			var deferred = $.Deferred();
			$.ajax( {
				url: resolvedSrc ,
				timeout: this.getKalturaConfig( null , 'multicastKESKtimeout' ) || this.defaultMulticastKESKtimeout ,
				dataType: 'jsonp' ,
				success: function ( response ) {
					return deferred.resolve( response );
				} ,
				error: function () {
					return deferred.reject();
				}
			} );
			return deferred.promise();
		} ,
		handleMulticastPlayManifest: function ( resolvedSrc , doEmbedFunc ) {
			mw.log( 'handleMulticastPlayManifest ' + resolvedSrc );
			var _this = this;

			if ($.isPlainObject(resolvedSrc)) {
				mw.log( 'handleMulticastPlayManifest ' + JSON.stringify( resolvedSrc) );
				var bestFlavour=null;
				if (resolvedSrc.flavors) {
					resolvedSrc.flavors.forEach(function (flavour) {
						if (!bestFlavour || flavour.bitrate > bestFlavour.bitrate) {
							bestFlavour = flavour;
						}
					});
				}
				_this.resolvedSrc=resolvedSrc;
				if (bestFlavour) {
					resolvedSrc = bestFlavour.url;
				} else {

					mw.log('Invalid play manifest');
					_this.isError = true;
					var errorObj = {message: gM('ks-LIVE-STREAM-NOT-AVAILABLE'), title: gM('ks-ERROR')};
					_this.showErrorMsg(errorObj);
				}
			}
			//we got an multicast server that we need to redirect
			if ( resolvedSrc.indexOf( "http" ) === 0 ) {
				this.multiastServerUrl = resolvedSrc;
				var startFailoverFromMulticastServer = function () {

					mw.log( 'startFailoverFromMulticastServer ' );
					if (_this.multicastSessionId) {
						_this.isError = true;

						if (_this.playerObject) {
							_this.playerObject.stop();
						}
						_this.stopped = true;


						_this.bindHelper("playerReady", function () {
							mw.log( 'playerReady called, resetting firstPlay' );
							_this.firstPlay = true; //resume live playback when the new player is ready
						});
						_this.setupSourcePlayer(); //switch player
					}
				};
				var onKESResponse = function ( response ) {

					mw.log( 'EmbedPlayerSPlayer got multicast details from KES: ' + JSON.stringify( response ) );


					//verify we got a valid response from KES
					if ( response && response.multicastAddress && response.multicastPort && response.hls ) {

						var multicastAddress = response.multicastAddress + ":" + response.multicastPort;
						mw.log( 'multicastAddress: ' + multicastAddress + ' KES: ' + response.multicastSourceAddress);

						//first time
						if ( !_this.multicastAddress ) {

							_this.multicastAddress = multicastAddress;
							_this.multicastSourceAddress = response.multicastSourceAddress;
							_this.multicastPolicyOverMulticastEnabled = response.multicastPolicyOverMulticastEnabled;
							_this.multicastSessionId = response.id;
							doEmbedFunc( multicastAddress );
							//keep alive
							startConnectToKESTimer();

						} else {
							if ( _this.multicastAddress !== multicastAddress ||
								 _this.multicastSessionId !== response.id ) {
								mw.log( 'detected multicastAddress or multicastSessionId changed' );
								startFailoverFromMulticastServer();
							} else {
								//keep alive
								startConnectToKESTimer();
								//mw.log('keep alive sent successfully');
							}
						}
					} else {
						if (response && response.state==="Loading") {

							mw.log('KES still loading, retrying later');
							//retry
							startConnectToKESTimer();
						} else {
							if ( !_this.multicastSessionId ) { //only if we never got multicast result we should display that, otherwise just keepon trying
								mw.log('Invalid multicast address/port returned from KES');
								_this.isError = true;
								var errorObj = {message: gM('ks-LIVE-STREAM-NOT-AVAILABLE'), title: gM('ks-ERROR')};
								_this.showErrorMsg(errorObj);
							} else {
								//we already got multicast working at the past, retry to connect to KES∂
								startConnectToKESTimer();
							}
						}
					}
				};

				var startConnectToKESTimer = function () {

					//in case of fallback to unicast we don't want to restart by accident
					if (!_this.isMulticast) {
						return;
					}

					var retryTime= _this.getKalturaConfig( null , 'multicastKESStartInterval' ) || _this.defaultMulticastKESStartInterval;

					if (_this.multicastSessionId)
						retryTime=_this.getKalturaConfig( null , 'multicastKeepAliveInterval' ) || _this.defaultMulticastKeepAliveInterval;

					_this.keepAliveMCTimeout = setTimeout( function () {
						try {
							_this.connectToKES( resolvedSrc ).then( onKESResponse , startFailoverFromMulticastServer );
						}
						catch ( e ) {
							mw.log( 'connectToKES failed ' + e.message + ' ' + e.stack );
							startConnectToKESTimer();
						}
					} , retryTime );
				};

				startConnectToKESTimer();

			} else {
				doEmbedFunc( resolvedSrc );
			}
		} ,
		fallbackToUnicast: function () {
			var _this = this;

            if ( this.playerObject ) {
                this.playerObject.stop();
            }
            this.stopped = true;

			var enableMulticastFallback = _this.getKalturaConfig( null , 'enableMulticastFallback' ) || _this.defaultEnableMulticastFallback;
			if ( enableMulticastFallback ) {
				mw.log( 'fallbackToUnicast: try unicast' );
                //remove current source to fallback to unicast if multicast failed
				for ( var i = 0 ; i < _this.mediaElement.sources.length ; i++ ) {
					if ( _this.mediaElement.sources[i] == _this.mediaElement.selectedSource ) {
                        _this.mediaElement.sources.splice(i, 1);
                        break;
                    }
				}
                _this.bindHelper("playerReady", function(){
                    _this.firstPlay = true; //resume live playback when the new player is ready
                });
                _this.setupSourcePlayer(); //switch player
			} else {
				mw.log( "fallbackToUnicast: stop here since we don't allow multicast failver" );
				var errorObj = {message: gM( 'ks-LIVE-STREAM-NOT-AVAILABLE' ) , title: gM( 'ks-ERROR' )};
				_this.showErrorMsg( errorObj );
			}
			_this.readyCallbackFunc = undefined;
		} ,
		//in live we must first check if player is live
		loadLive: function ( doEmbedFunc , readyCallback ) {
			mw.log( 'loadLive' );
			var _this = this;
			$( _this ).trigger( 'checkIsLive' , [function ( onAirStatus ) {
				var startSilverlight = function () {
					_this.resolveSrcURL(_this.getSrc()).then(function (result) {

						if (_this.isMulticast) {
							_this.handleMulticastPlayManifest(result, doEmbedFunc);
						} else {
							doEmbedFunc(result);
						}
					});
				}
				if ( onAirStatus ) {
					startSilverlight();
				} else {
					//stream is offline, stream address can be retrieved when online
					_this.bindHelper( "liveOnline" + _this.bindPostfix , function () {
						_this.unbindHelper( "liveOnline" + _this.bindPostfix );
						_this.addPlayerSpinner();
						startSilverlight();
						//no need to save readyCallback since it was already called
						_this.readyCallbackFunc = undefined;
					} );
					readyCallback();
				}
			}] );
		} ,
		loadMedia: function ( readyCallback ) {
			var _this = this;

			//if error occured- don't try to load playmanifest, return
			if ( !$.isEmptyObject( this.playerError ) ) {
				readyCallback();
				return;
			}

			var isMimeType = function ( mimeType ) {
				return _this.mediaElement.selectedSource &&
					_this.mediaElement.selectedSource.mimeType == mimeType;
			};

			var doEmbedFunc = function ( resolvedSrc ) {
				var flashvars = {
					startvolume: _this.volume
				};
				if ( isMimeType( "video/mp4" )
					||
					isMimeType( "video/h264" )
				) {
					resolvedSrc = encodeURIComponent(resolvedSrc);
					flashvars.entryURL = resolvedSrc;
				} else if (
					isMimeType( "video/playreadySmooth" )
					||
					isMimeType( "video/ism" )
				) {
					resolvedSrc = encodeURIComponent(resolvedSrc);
					_this.streamerType = 'smoothStream';

					flashvars.smoothStreamPlayer = true;
					flashvars.preload = "auto";
					flashvars.entryURL = resolvedSrc;
					//flashvars.debug = true;

					if ( isMimeType( "video/playreadySmooth" ) ) {
						flashvars.preload = "none";
						var licenseBaseUrl = mw.getConfig('Kaltura.UdrmServerURL');
						if (!licenseBaseUrl) {
							this.log('Error:: failed to retrieve playready UDRM license URL ');
						}
						//TODO: error handling in case of error
						var licenseData = this.mediaElement.getLicenseUriComponent();
						if (!licenseData) {
							this.log('Error:: failed to retrieve playready UDRM license data ');
						}
						//Concat all URL parts
						var licenseUrl = licenseBaseUrl + "/playready/license?" + licenseData;

						//Encode URL so it can be passed via HTML tag
						flashvars.licenseURL = encodeURIComponent(licenseUrl);

						var customData = {
							partnerId: _this.kpartnerid ,
							ks: _this.getFlashvars( 'ks' ) ,
							entryId: _this.kentryid
						};
						if ( _this.b64Referrer ) {
							flashvars.referrer = _this.b64Referrer;
						}

						var customDataString = "";
						for ( var propt in customData ) {
							customDataString += propt + "=" + customData[propt] + "&";
						}
						var eventObj = {
							customString: customDataString
						}

						$( _this ).trigger( 'challengeCustomData' , eventObj );

						flashvars.challengeCustomData = eventObj.customString;

					}
				} else if ( isMimeType( "video/multicast" ) ) {

					_this.bindHelper( "liveOffline" , function () {
						//if stream became offline
						if ( _this.playerObject ) {
							_this.playerObject.stop();
						}
					} );

					flashvars.multicastPlayer = true;
					flashvars.streamAddress = resolvedSrc;
					if (_this.multicastSourceAddress) {
						flashvars.sourceAddress = _this.multicastSourceAddress;
					}
					flashvars.multicastPolicyOverMulticastEnabled = _this.multicastPolicyOverMulticastEnabled;
					//flashvars.debug = true;

					//check if multicast not available
					var timeout = _this.getKalturaConfig( null , 'multicastStartTimeout' ) || _this.defaultMulticastStartTimeout;
					_this.isError = false;
					setTimeout( function () {
						if ( !_this.gotFirstMulticastFrame ) {
							_this.isError = true;
							_this.fallbackToUnicast();
						}
					} , timeout );
				}
				_this.autoplay = _this.autoplay || _this.isMulticast;
				flashvars.autoplay = _this.autoplay;
				flashvars.isLive = _this.isLive();
				flashvars.isDVR = ( _this.isDVR() == 1 );
				_this.durationReceived = false;
				_this.readyCallbackFunc = readyCallback;
				var playerElement = new mw.PlayerElementSilverlight( _this.containerId , 'splayer_' + _this.pid , flashvars , _this , function () {
					var bindEventMap = {
						'playerPaused': 'onPause' ,
						'playerPlayed': 'onPlay' ,
						'durationChange': 'onDurationChange' ,
						'playerPlayEnd': 'onClipDone' ,
						'playerUpdatePlayhead': 'onUpdatePlayhead' ,
						'bytesTotalChange': 'onBytesTotalChange' ,
						'bytesDownloadedChange': 'onBytesDownloadedChange' ,
						'playerSeekEnd': 'onPlayerSeekEnd' ,
						'switchingChangeStarted': 'onSwitchingChangeStarted' ,
						'switchingChangeComplete': 'onSwitchingChangeComplete' ,
						'flavorsListChanged': 'onFlavorsListChanged' ,
						'enableGui': 'onEnableGui' ,
						'audioTracksReceived': 'onAudioTracksReceived' ,
						'audioTrackSelected': 'onAudioTrackSelected' ,
						'textTracksReceived': 'onTextTracksReceived' ,
						'textTrackSelected': 'onTextTrackSelected' ,
						'loadEmbeddedCaptions': 'onLoadEmbeddedCaptions' ,
						'error': 'onError' ,
						'alert': 'onError'
					};

					_this.playerObject = playerElement;
					$.each( bindEventMap , function ( bindName , localMethod ) {
						_this.playerObject.addJsListener( bindName , localMethod );
					} );

					if ( _this.getFlashvars( 'stretchVideo' ) ) {
						playerElement.stretchFill();
					}

					if ( isMimeType( "video/mp4" )
						||
						isMimeType( "video/h264" )
						||
						isMimeType( "video/playreadySmooth" )
						||
						_this.isLive()
					) {
						_this.durationReceived = true;
					}
					readyCallback();
				} );
			}

			if ( _this.isLive() ) {
				_this.isMulticast= isMimeType( "video/multicast" );
				_this.loadLive( doEmbedFunc , readyCallback );
			} else {
				_this.resolveSrcURL( _this.getSrc() ).then( doEmbedFunc );
			}
		} ,

		isDVR: function () {
			if ( this.isMulticast ) {
				return false;
			}
			return this.parent_isDVR();
		} ,

		setCurrentTime: function ( time ) {
			this.slCurrentTime = time;
		} ,

		/**
		 * enable / disable player object from listening and reacting to events
		 * @param enabled true will enable, false will disable
		 */
		enablePlayerObject: function ( enabled ) {
			if ( this.playerObject ) {
				this.playerObject.disabled = enabled;
			}
		} ,

		/**
		 * Hide the player from the screen and disable events listeners
		 **/
		disablePlayer: function () {
			this.getPlayerContainer().css( 'visibility' , 'hidden' );
			this.enablePlayerObject( false );
		} ,

		changeMediaCallback: function ( callback ) {
			this.slCurrentTime = 0;
			// Check if we have source
			if ( this.getSrc() ) {
				this.loadMedia( callback );
			} else {
				callback();
			}
		} ,

		/*
		 * Write the Embed html to the target
		 */
		embedPlayerHTML: function () {
		} ,

		updatePlayhead: function () {
			if ( this.seeking ) {
				this.seeking = false;
			}
		} ,

		/**
		 * on Pause callback from the kaltura flash player calls parent_pause to
		 * update the interface
		 */
		onPause: function () {
			this.updatePlayhead();
			$( this ).trigger( "onpause" );
		} ,

		/**
		 * onPlay function callback from the kaltura flash player directly call the
		 * parent_play
		 */
		onPlay: function () {
			//workaround to avoid two playing events with autoPlay.
			if ( !this.durationReceived ) {
				return;
			}
			if ( this._propagateEvents ) {

				this.updatePlayhead();
				$( this ).trigger( "playing" );
				this.getPlayerContainer().css( 'visibility' , 'visible' );
				this.hideSpinner();
				this.stopped = this.paused = false;
			}
		} ,

		callReadyFunc: function () {
			if ( this.readyCallbackFunc ) {
				this.readyCallbackFunc();
				this.readyCallbackFunc = undefined;
			}
		} ,

		onDurationChange: function ( data , id ) {

			if (this.isLive()) {
				this.gotFirstMulticastFrame=true;
			}
			//first durationChange indicate player is ready
			if ( !this.durationReceived ) {
				//hide player until we click play
				this.getPlayerContainer().css( 'visibility' , 'hidden' );
				this.durationReceived = true;
				if ( !this.isError ) {
					this.callReadyFunc();

					//in silverlight we have unusual situation where "Start" is sent after "playing", this workaround fixes the controls state
					if ( this.autoplay ) {
						$( this ).trigger( "playing" );
						this.monitor();
					}
				} else if ( this.autoplay ) {
					this.playerObject.pause();
				}

				if ( this.readyFuncs && this.readyFuncs.length > 0 ) {
					for ( var i = 0 ; i < this.readyFuncs.length ; i++ ) {
						this.readyFuncs[i]();
					}
					this.readyFuncs = [];
				}
			}

			// Update the duration ( only if not in url time encoding mode:
			this.setDuration( data );
			this.playerObject.duration = data;
		} ,

		onClipDone: function () {
			$( this ).trigger( "onpause" );
			this.playerObject.pause();
			this.parent_onClipDone();
			this.currentTime = this.slCurrentTime = 0;
		} ,

		onError: function ( message ) {
			var data = {errorMessage: message};
			mw.log( 'EmbedPlayerSPlayer::onError: ' + message );
			this.triggerHelper( 'embedPlayerError' , [data] );
		} ,

		handlePlayerError: function ( data ) {
			var messageText = this.getKalturaMsg( 'ks-CLIP_NOT_FOUND' );
			if ( data && data.errorMessage ) {
				messageText = data.errorMessage;
				var dataParams = messageText.split( " " );
				if ( dataParams.length ) {
					var errorCode = dataParams[0];
					//DRM license related error has 6XXX error code
					if ( errorCode.length == 4 && errorCode.indexOf( "6" ) == 0 ) {
						messageText = gM( 'ks-NO-DRM-LICENSE' );
					}
				}
			}

			var errorObj = {message: messageText , title: gM( 'ks-ERROR' )};
			if ( this.readyCallbackFunc ) {
				this.setError( errorObj );
				this.callReadyFunc();
			} else {
				this.layoutBuilder.displayAlert( errorObj );
			}
		} ,

		/**
		 * play method calls parent_play to update the interface
		 */
		play: function () {
			mw.log( 'EmbedPlayerSPlayer::play' + this.isMulticast + ""+this.durationReceived);
			var _this = this;
			if ( (!this.isMulticast || this.durationReceived) && this.parent_play() ) {
				//TODO:: Currently SL player initializes before actual volume is read from cookie, so we set it on play
				//need to refactor the volume logic and remove this.
				this.setPlayerElementVolume( this.volume );
				//bring back the player
				this.getPlayerContainer().css( 'visibility' , 'visible' );
				_this.playerObject.play();
				this.monitor();
			} else {
				mw.log( "EmbedPlayerSPlayer:: parent play returned false, don't issue play on splayer element" );
			}
		} ,

		/**
		 * pause method calls parent_pause to update the interface
		 */
		pause: function () {
			if ( !this.isPlaying() ) {
				return;
			}
			try {
				//after first play we don't want to pause in multicast, only stop
				if ( this.isMulticast && !this.firstPlay ) {
					this.playerObject.stop();
				} else {
					this.playerObject.pause();
				}
			} catch ( e ) {
				mw.log( "EmbedPlayerSPlayer:: doPause failed" );
			}
			this.parent_pause();
		} ,
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
		playerSwitchSource: function ( source , switchCallback , doneCallback ) {
			//we are not supposed to switch source. Ads can be played as siblings. Change media doesn't use this method.
			if ( switchCallback ) {
				switchCallback( this.playerObject );
			}
			setTimeout( function () {
				if ( doneCallback )
					doneCallback();
			} , 100 );
		} ,

		/**
		 * Issues a seek to the playerElement
		 *
		 * @param {Float}
		 *            percentage Percentage of total stream length to seek to
		 */
		doSeek: function ( seekTime ) {
			var _this = this;
			// Include a fallback seek timer: in case the kdp does not fire 'playerSeekEnd'
			var orgTime = this.slCurrentTime;
			this.seekInterval = setInterval( function () {
				if ( (_this.slCurrentTime != orgTime) && _this.seeking ) {//TODO - check seeking also
					_this.seeking = false;
					clearInterval( _this.seekInterval );
					_this.triggerHelper( 'seeked' , [_this.slCurrentTime] );
				}
			} , mw.getConfig( 'EmbedPlayer.MonitorRate' ) );
			this.stopEventPropagation();
			// Issue the seek to the flash player:
			this.playerObject.seek( seekTime );
		} ,
		canSeek: function () {
			var _this = this;
			var deferred = $.Deferred();
			if ( this.playerObject.duration ) { //we already loaded the movie
				this.log( "player can seek" );
				return deferred.resolve();
			} else {
				this.log( "player can't seek - try to init video element ready state" );
				this.canSeekPlayedHandler = function () {
					_this.restoreEventPropagation();
					//Issue a pause on the player element
					_this.playerObject.pause();
					//Remove the temprary event listener
					_this.playerObject.removeJsListener( "playerPlayed" , "canSeekPlayedHandler" );
					_this.log( "player can seek" );
					deferred.resolve();
				};
				//Register temporary event handler for playerPlayed event
				this.playerObject.removeJsListener( "playerPlayed" , "canSeekPlayedHandler" );
				this.playerObject.addJsListener( "playerPlayed" , "canSeekPlayedHandler" );
				//Stop event propagation so play would not be caught by analytics
				this.stopEventPropagation();
				//Issue a play on the player element
				this.playerObject.play();
				return deferred;
			}
		} ,
		/**
		 * Issues a volume update to the playerElement
		 *
		 * @param {Float}
		 *            percentage Percentage to update volume to
		 */
		setPlayerElementVolume: function ( percentage ) {
			this.playerObject.changeVolume( percentage );
		} ,

		/**
		 * function called by flash at set interval to update the playhead.
		 */
		onUpdatePlayhead: function ( playheadValue ) {
			if ( this.seeking ) {
				this.seeking = false;
			}
			this.slCurrentTime = playheadValue;
			$( this ).trigger( 'timeupdate' );
		} ,

		/**
		 * function called by flash when the total media size changes
		 */
		onBytesTotalChange: function ( data , id ) {
			this.bytesTotal = data.newValue;
		} ,

		/**
		 * function called by flash applet when download bytes changes
		 */
		onBytesDownloadedChange: function ( data , id ) {
			this.bytesLoaded = data.newValue;
			this.bufferedPercent = this.bytesLoaded / this.bytesTotal;
			// Fire the parent html5 action
			$( this ).trigger( 'updateBufferPercent' , this.bufferedPercent );
		} ,

		onPlayerSeekEnd: function () {
			this.restoreEventPropagation();
			this.triggerHelper( 'seeked' );
			if ( this.seekInterval ) {
				clearInterval( this.seekInterval );
			}
		} ,

		onSwitchingChangeStarted: function ( data , id ) {
			$( this ).trigger( 'sourceSwitchingStarted' , [data] );
		} ,

		onSwitchingChangeComplete: function ( data , id ) {
			var value = JSON.parse( data );
			//fix a bug that old switching process finished before the user switching request and the UI was misleading
			if ( this.requestedSrcIndex !== null && value.newIndex !== this.requestedSrcIndex ) {
				return;
			}
			mw.log( 'EmbedPlayerKalturaSplayer: switchingChangeComplete: new index: ' + value.newIndex );
			this.mediaElement.setSourceByIndex( value.newIndex );
			$( this ).trigger( 'sourceSwitchingEnd' , [data] );
		} ,

		onFlavorsListChanged: function ( data , id ) {
			var values = JSON.parse( data );
			this.parent_onFlavorsListChanged( values.flavors );

		} ,

		onEnableGui: function ( data , id ) {
			if ( data.guiEnabled === false ) {
				this.disablePlayControls();
			} else {
				this.enablePlayControls();
			}
		} ,

		onAudioTracksReceived: function ( data ) {
			var _this = this;
			this.callIfReady( function () {
				_this.triggerHelper( 'audioTracksReceived' , JSON.parse( data ) );
			} );
		} ,

		onAudioTrackSelected: function ( data ) {
			var _this = this;
			this.callIfReady( function () {
				_this.triggerHelper( 'audioTrackIndexChanged' , JSON.parse( data ) );
			} );
		} ,

		onTextTrackSelected: function ( data ) {
			var _this = this;
			this.callIfReady( function () {
				_this.triggerHelper( 'textTrackIndexChanged' , JSON.parse( data ) );
			} );
		} ,

		onTextTracksReceived: function ( data ) {
			var _this = this;
			this.callIfReady( function () {
				_this.triggerHelper( 'textTracksReceived' , JSON.parse( data ) );
			} );
		} ,

		/**
		 * Get the embed player time
		 */
		getPlayerElementTime: function () {
			// update currentTime
			return this.slCurrentTime;
		} ,

		/**
		 * Get the embed flash object player Element
		 */
		getPlayerElement: function () {
			return this.playerObject;
		} ,

		getPlayerContainer: function () {
			if ( !this.containerId ) {
				this.containerId = 'splayer_' + this.id;
			}
			return $( '#' + this.containerId );
		} ,

		/*
		 * get the source index for a given source
		 */
		getSourceIndex: function ( source ) {
			var sourceIndex = null;
			$.each( this.mediaElement.getPlayableSources() , function ( currentIndex , currentSource ) {
				if ( source.getBitrate() == currentSource.getBitrate() ) {
					sourceIndex = currentIndex;
					return false;
				}
			} );
			if ( sourceIndex == null ) {
				mw.log( "EmbedPlayerSPlayer:: Error could not find source: " + source.getSrc() );
			}
			return sourceIndex;
		} ,
		switchSrc: function ( source ) {
			if ( this.playerObject && this.mediaElement.getPlayableSources().length > 1 ) {
				var trackIndex = -1;
				if ( source !== -1 ) {
					trackIndex = this.getSourceIndex( source );
				}
				mw.log( "EmbedPlayerSPlayer:: switch to track index: " + trackIndex );
				$( this ).trigger( 'sourceSwitchingStarted' , [
					{currentBitrate: source.getBitrate()}
				] );
				this.requestedSrcIndex = trackIndex;
				this.playerObject.selectTrack( trackIndex );
			}
		} ,
		canAutoPlay: function () {
			return true;
		} ,

		clean: function () {
			$( this.getPlayerContainer() ).remove();

			if ( this.keepAliveMCTimeout ) {
				clearTimeout( this.keepAliveMCTimeout );
				this.keepAliveMCTimeout = null;
			}
		} ,

		callIfReady: function ( callback ) {
			if ( this.durationReceived ) {
				callback();
			} else {
				this.readyFuncs.push( callback );
			}
		} ,

		onLoadEmbeddedCaptions: function ( data ) {
			var captionData = JSON.parse( data );
			var caption = {
				source: {
					srclang: captionData.language
				} ,
				capId: captionData.language ,
				ttml: captionData.ttml
			};
			this.triggerHelper( 'onEmbeddedData' , caption );
		}

	}
})(mediaWiki, jQuery);
