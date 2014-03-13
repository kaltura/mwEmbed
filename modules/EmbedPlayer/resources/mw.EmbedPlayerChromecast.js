/*
 * The "kaltura player" embedPlayer interface for fallback h.264 and flv video format support
 */
( function( mw, $ ) { "use strict";

	mw.EmbedPlayerChromecast = {
		// Instance name:
		instanceOf : 'Chromecast',
		bindPostfix: '.ccPlayer',
		// List of supported features:
		supports : {
			'playHead' : true,
			'pause' : true,
			'stop' : true,
			'volumeControl' : true
		},
		setup: function( readyCallback ) {
			mw.log('EmbedPlayerChromecast:: Setup');
			var _this = this;
/*
			var doEmbedFunc = function() {
				var flashvars = {
					startvolume:	_this.volume
				}
				if ( isMimeType( "video/playreadySmooth" )
					|| isMimeType( "video/ism" ) ) {

					flashvars.smoothStreamPlayer =true;
					flashvars.preload = "auto";
					flashvars.entryURL = srcToPlay;
					//flashvars.debug = true;

					if ( isMimeType( "video/playreadySmooth" ) )
					{
						var licenseUrl = _this.getKalturaConfig( null, 'playreadyLicenseUrl' ) || mw.getConfig( 'Kaltura.LicenseServerURL' );
						if ( !licenseUrl ) {
							mw.log('EmbedPlayerChromecast::Error:: failed to retrieve playready license URL ' );
						}  else {
							flashvars.licenseURL = licenseUrl;
						}

						var customData = {
							partnerId: _this.kpartnerid,
							ks: _this.getFlashvars( 'ks' ),
							entryId: _this.kentryid
						}
						if ( _this.b64Referrer ) {
							flashvars.referrer = _this.b64Referrer;
						}
						var customDataString = "";
						for(var propt in customData){
							customDataString += propt + "=" + customData[propt] + "&";
						}
						flashvars.challengeCustomData = customDataString;
					}
				} else if ( isMimeType( "video/multicast" ) ) {
					flashvars.multicastPlayer = true;
					flashvars.streamAddress = srcToPlay

					//check if multicast not available
					var timeout = _this.getKalturaConfig( null, 'multicastStartTimeout' ) || _this.defaultMulticastStartTimeout;
					setTimeout( function() {
						if ( !_this.durationReceived ) {
							if ( _this.getKalturaConfig( null, 'enableMulticastFallback' ) == true ) {
								//remove current source to fallback to unicast if multicast failed
								for ( var i=0; i< _this.mediaElement.sources.length; i++ ) {
									if ( _this.mediaElement.sources[i] == _this.mediaElement.selectedSource ) {
										_this.playerObject.stop();
										_this.mediaElement.sources.splice(i, 1);

										//wait until player is ready to play again and trigger play
										_this.bindHelper('onEnableInterfaceComponents' + _this.bindPostfix, function() {
											_this.unbindHelper( 'onEnableInterfaceComponents' + _this.bindPostfix );
											if ( _this.isPlaying() ) {
												_this.play();
											}
										});

										_this.setupSourcePlayer();
										return;
									}
								}
							} else {
								var errorObj = { message: gM( 'ks-LIVE-STREAM-NOT-AVAILABLE' ), title: gM( 'ks-ERROR' ) };
								_this.showErrorMsg( errorObj );
							}
						}
					}, timeout );
				}

				flashvars.autoplay = _this.autoplay;
				_this.durationReceived = false;
				var playerElement = new mw.PlayerElementSilverlight( _this.containerId, 'splayer_' + _this.pid, flashvars, _this, function() {
					var bindEventMap = {
						'playerPaused' : 'onPause',
						'playerPlayed' : 'onPlay',
						'durationChange' : 'onDurationChange',
						'playerPlayEnd' : 'onClipDone',
						'playerUpdatePlayhead' : 'onUpdatePlayhead',
						'bytesTotalChange' : 'onBytesTotalChange',
						'bytesDownloadedChange' : 'onBytesDownloadedChange',
						'playerSeekEnd': 'onPlayerSeekEnd',
						'alert': 'onAlert',
						'switchingChangeStarted': 'onSwitchingChangeStarted',
						'switchingChangeComplete' : 'onSwitchingChangeComplete',
						'flavorsListChanged' : 'onFlavorsListChanged',
						'enableGui' : 'onEnableGui'
					};

					_this.playerObject = playerElement;
					$.each( bindEventMap, function( bindName, localMethod ) {
						_this.playerObject.addJsListener(  bindName, localMethod );
					});
					readyCallback();
				});
			}

			getStreamAddress().then(doEmbedFunc);
*/

		},

		setCurrentTime: function( time ){
			alert("set current time");
		},

        getCurrentTime: function( time ){
            alert("get current time");
        },

		updatePlayhead: function () {
			if ( this.seeking ) {
				this.seeking = false;
				//this.slCurrentTime = this.playerObject.currentTime;
                alert("update playhead");
			}
		},

		/**
		 * on Pause callback from the kaltura flash player calls parent_pause to
		 * update the interface
		 */
		onPause: function() {
			this.updatePlayhead();
			$( this ).trigger( "onpause" );
		},

		/**
		 * onPlay function callback from the kaltura flash player directly call the
		 * parent_play
		 */
		onPlay: function() {
            alert("onplay");
			this.updatePlayhead();
			$( this ).trigger( "playing" );
			this.hideSpinner();
			if ( this.seeking == true ) {
				this.onPlayerSeekEnd();
			}
			this.stopped = this.paused = false;
		},

		onClipDone: function() {
			$( this ).trigger( "onpause" );
			this.playerObject.pause();
			this.parent_onClipDone();
			//this.currentTime = this.slCurrentTime = 0;
			this.preSequenceFlag = false;
		},

		onAlert: function ( data, id ) {
			mw.log('EmbedPlayerChromecast::onAlert ' + data );
            alert("onAlert: "+data);
			/*
            var messageText = data;
			var dataParams = data.split(" ");
			if ( dataParams.length ) {
				var errorCode = dataParams[0];
				//DRM license related error has 6XXX error code
				if ( errorCode.length == 4 && errorCode.indexOf("6")==0 )  {
					messageText = gM( 'ks-NO-DRM-LICENSE' );
				}
			}

			this.layoutBuilder.displayAlert( { message: messageText, title: gM( 'ks-ERROR' ) } );*/
		},

		/**
		 * play method calls parent_play to update the interface
		 */
		play: function() {
            try {
                //this.playerObject.pause();
                $(this).trigger("chromecastPlay");
            } catch(e) {
                mw.log( "EmbedPlayerChromecast:: doPlay failed" );
            }
            this.parent_play();
            $(this).trigger("playing");
		},

		/**
		 * pause method calls parent_pause to update the interface
		 */
		pause: function() {
			try {
				//this.playerObject.pause();
                $(this).trigger("chromecastPause");
			} catch(e) {
				mw.log( "EmbedPlayerChromecast:: doPause failed" );
			}
			this.parent_pause();
		},
		/**
		 * playerSwitchSource switches the player source working around a few bugs in browsers
		 *
		 * @param {object}
		 *			source Video Source object to switch to.
		 * @param {function}
		 *			switchCallback Function to call once the source has been switched
		 * @param {function}
		 *			doneCallback Function to call once the clip has completed playback
		 */
		playerSwitchSource: function( source, switchCallback, doneCallback ){
            alert("playerSwitchSource");
            /*
			//we are not supposed to switch source. Ads can be played as siblings. Change media doesn't use this method.
			if( switchCallback ){
				switchCallback( this.playerObject );
			}
			setTimeout(function(){
				if( doneCallback )
					doneCallback();
			}, 100);*/
		},

		/**
		 * Issues a seek to the playerElement
		 *
		 * @param {Float}
		 *			percentage Percentage of total stream length to seek to
		 */
		seek: function(percentage) {
            alert("seek");
            /*
			var _this = this;
			var seekTime = percentage * this.getDuration();
			mw.log( 'EmbedPlayerKalturaSplayer:: seek: ' + percentage + ' time:' + seekTime );
			if (this.supportsURLTimeEncoding()) {

				// Make sure we could not do a local seek instead:
				if (!(percentage < this.bufferedPercent
					&& this.playerObject.duration && !this.didSeekJump)) {
					// We support URLTimeEncoding call parent seek:
					this.parent_seek( percentage );
					return;
				}
			}
			if ( this.playerObject.duration ) //we already loaded the movie
			{
				this.seeking = true;
				// trigger the html5 event:
				$( this ).trigger( 'seeking' );

				// Issue the seek to the flash player:
				this.playerObject.seek( seekTime );

				// Include a fallback seek timer: in case the kdp does not fire 'playerSeekEnd'
				var orgTime = this.slCurrentTime;
				this.seekInterval = setInterval( function(){
					if( _this.slCurrentTime != orgTime ){
						_this.seeking = false;
						clearInterval( _this.seekInterval );
						$( _this ).trigger( 'seeked' );
					}
				}, mw.getConfig( 'EmbedPlayer.MonitorRate' ) );
			} else if ( percentage != 0 ) {
				this.playerObject.play();
			}

			// Run the onSeeking interface update
			this.layoutBuilder.onSeek();*/
		},
        getPlayerElementTime: function() {
            $(this).trigger("chromecastGetCurrentTime");
            /*
            // Make sure we have .vid obj
            this.getPlayerElement();
            if ( !this.playerElement ) {
                mw.log( 'EmbedPlayerNative::getPlayerElementTime: ' + this.id + ' not in dom ( stop monitor)' );
                this.stop();
                return false;
            }
            var ct =  this.playerElement.getCurrentTime();
            // Return 0 or a positive number:
            if( ! ct || isNaN( ct ) || ct < 0 || ! isFinite( ct ) ){
                return 0;
            }
            // Return the playerElement currentTime
            return this.playerElement.getCurrentTime();*/
        },
		/**
		 * Issues a volume update to the playerElement
		 *
		 * @param {Float}
		 *			percentage Percentage to update volume to
		 */
		setPlayerElementVolume: function(percentage) {
            $(this).trigger("chromecastGetCurrentTime",[percentage]);
		},

		/**
		 * function called by flash at set interval to update the playhead.
		 */
		onUpdatePlayhead: function( playheadValue ) {
			if ( this.seeking ) {
				this.seeking = false;
			}
			//this.slCurrentTime = playheadValue;
			$( this ).trigger( 'timeupdate' );
		},

		onPlayerSeekEnd: function () {
			$( this ).trigger( 'seeked' );
			this.updatePlayhead();
			if( this.seekInterval  ) {
				clearInterval( this.seekInterval );
			}
		},

		onSwitchingChangeStarted: function ( data, id ) {
			$( this ).trigger( 'sourceSwitchingStarted' );
		},


		onSwitchingChangeComplete: function ( data, id ) {
			var value = JSON.parse( data );
            alert("onSwitchingChangeComplete");
            /*
			//fix a bug that old switching process finished before the user switching request and the UI was misleading
			if ( this.requestedSrcIndex!== null && value.newIndex !== this.requestedSrcIndex ) {
				return;
			}
			mw.log( 'EmbedPlayerKalturaSplayer: switchingChangeComplete: new index: ' +  value.newIndex);
			this.mediaElement.setSourceByIndex ( value.newIndex );*/
		}



		/*

		getSourceIndex: function( source ){
			var sourceIndex = null;
			$.each( this.mediaElement.getPlayableSources(), function( currentIndex, currentSource ) {
				if( source.getBitrate() == currentSource.getBitrate() ){
					sourceIndex = currentIndex;
					return false;
				}
			});
			if( sourceIndex == null ){
				mw.log( "EmbedPlayerChromecast:: Error could not find source: " + source.getSrc() );
			}
			return sourceIndex;
		},
		switchSrc: function ( source ) {
			if ( this.playerObject ) {
				var trackIndex = this.getSourceIndex( source );
				mw.log( "EmbedPlayerChromecast:: switch to track index: " + trackIndex);
				$( this ).trigger( 'sourceSwitchingStarted' );
				this.requestedSrcIndex = trackIndex;
				this.playerObject.selectTrack( trackIndex );
			}
		}*/

	}
} )( mediaWiki, jQuery );
