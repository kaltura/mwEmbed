/*
 * The "kaltura player" embedPlayer interface for fallback h.264 and flv video format support
 */
( function( mw, $ ) { "use strict";

	mw.EmbedPlayerSilverlight = {
		// Instance name:
		instanceOf : 'Silverlight',
		bindPostfix: '.sPlayer',
		defaultLicenseUrl: 'http://192.168.193.87/playready/rightsmanager.asmx',
		containerId: null,
		// List of supported features:
		supports : {
			'playHead' : true,
			'pause' : true,
			'stop' : true,
			'sourceSwitch': true,
			'timeDisplay' : true,
			'volumeControl' : true,
			'overlays' : true,
			'fullscreen' : true
		},
		// Create our player element
		setup: function( readyCallback ) {
			mw.log('EmbedPlayerSilverlight:: Setup');

			// Check if we created the sPlayer container
			var $container = this.getPlayerContainer();
			// If container exists, show the player and exit
			if( $container.length ){
				this.enablePlayerObject( true );
				$container.css('visibility', 'visible');
				readyCallback();
				return;
			}

			// Create the container
			this.getVideoDisplay().prepend(
				$('<div />')
					.attr('id', this.containerId)
					.addClass('maximize')
			);

			var _this = this;

			 //multicastPlayer=true,streamAddress=239.1.1.1:10000,autoplay=true,playerId=kplayer,jsCallBackReadyFunc=ready
			//smoothStreamPlayer=true,debug=true,autoplay=true,licenseURL=http://playready.directtaps.net/pr/svc/rightsmanager.asmx?PlayRight=1&UseSimpleNonPersistentLicense=1,playerId=kplayer,entryURL=http://playready.directtaps.net/smoothstreaming/SSWSS720H264PR/SuperSpeedway_720.ism/Manifest,jsCallBackReadyFunc=ready
		/*	var flashvars = {
				smoothStreamPlayer:true,
				preload:"auto",
			//	autoplay:true,
				licenseURL:"http://playready.directtaps.net/pr/svc/rightsmanager.asmx?PlayRight=1&UseSimpleNonPersistentLicense=1",
				entryURL:"http://playready.directtaps.net/smoothstreaming/SSWSS720H264PR/SuperSpeedway_720.ism/Manifest",
		//	challengeCustomData://add ks here

			};*/

			if ( this.mediaElement.selectedSource.mimeType == "video/playreadySmooth"
				|| this.mediaElement.selectedSource.mimeType == "video/ism" ) {
				var flashvars = {
					smoothStreamPlayer:true,
					preload: "auto",
					entryURL: this.getSrc()
					//for tests
					//entryURL: "http://cdnapi.kaltura.com/p/524241/sp/52424100/playManifest/entryId/0_8zzalxul/flavorId/0_3ob6cr7c/format/url/protocol/http/a.mp4"//this.getSrc()
				};

				if ( this.mediaElement.selectedSource
					&& this.mediaElement.selectedSource.mimeType == "video/playreadySmooth" )
				{
					var licenseUrl = this.getKalturaConfig( null, 'playreadyLicenseUrl' ) || this.defaultLicenseUrl;
					flashvars.licenseURL = licenseUrl;
					var customData = {
						partnerId: this.kpartnerid,
						ks: this.getFlashvars( 'ks' ),
						entryId: this.kentryid,
						referrer: this.b64Referrer
					}
					var customDataString = "";
					for(var propt in customData){
						customDataString += propt + "=" + customData[propt] + "&";
					}
					flashvars.challengeCustomData = customDataString;
				}
			} else if ( this.mediaElement.selectedSource.mimeType == "video/multicast" ) {
				//TODO
				//			var flashvars = {
				//				multicastPlayer:true,
				//				autoplay:true,
				//				streamAddress:"239.1.1.1:10000"
				//			};
			}



			var playerElement = new mw.PlayerElementSilverlight( this.containerId, 'splayer_' + this.pid, flashvars, this, function() {
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
					'enableGui' : 'onEnableGui'  ,
					'liveStreamOffline': 'onLiveEntryOffline',
					'liveStreamReady': 'onLiveStreamReady'
				};

				_this.playerObject = playerElement;
				$.each( bindEventMap, function( bindName, localMethod ) {
					_this.playerObject.addJsListener(  bindName, localMethod );
				});
				readyCallback();

			});
		},

		setCurrentTime: function( time ){
			this.slCurrentTime = time;
		},

		/**
		 * enable / disable player object from listening and reacting to events
		 * @param enabled true will enable, false will disable
		 */
		enablePlayerObject: function( enabled ){
			if ( this.playerObject ) {
				this.playerObject.disabled = enabled;
			}
		},

		/**
		 * Hide the player from the screen and disable events listeners
		 **/
		disablePlayer: function(){
			this.getPlayerContainer().css('visibility', 'hidden');
			this.enablePlayerObject( false );
		},

		/**
		 * Get required sources for KDP. Either by flavorTags flashvar or tagged wtih 'web'/'mbr' by default
		 **/
		/*getSourcesForSilverlight: function() {
			var _this = this;
			var sourcesByTags = [];
			var flavorTags = _this.getKalturaConfig( null, 'flavorTags' );
			//select default 'web' / 'mbr' flavors
			if ( flavorTags === undefined ) {
				var sources = _this.mediaElement.getPlayableSources();
				sources.push(new mw.MediaSource())
				debugger;
				$.each( sources, function( sourceIndex, source ) {
					if ( _this.checkForTags( source.getTags(), ['multicast', 'smoothstreaming'] )) {
						sourcesByTags.push ( source );
					}
				});
			} else {
				sourcesByTags = _this.getSourcesByTags( flavorTags );
			}
			return sourcesByTags;
		},

		restorePlayerOnScreen: function(){},

		updateSources: function(){
		      debugger;
				var newSources = this.getSourcesForSilverlight();
				this.replaceSources( newSources );
				this.mediaElement.autoSelectSource();

		}, */


		changeMediaCallback: function( callback ){
			this.slCurrentTime = 0;
			//for tests
			//this.playerObject.src = "http://cdnapi.kaltura.com/p/524241/sp/52424100/playManifest/entryId/1_miehtdy7/flavorId/1_semte5d5/format/url/protocol/http/a.mp4";
			this.playerObject.src = this.getSrc();
			this.playerObject.stop();
			this.playerObject.load();
			callback();
		},

		/*
		 * Write the Embed html to the target
		 */
		embedPlayerHTML: function() {},

		updatePlayhead: function () {
			if ( this.seeking ) {
				this.seeking = false;
				this.slCurrentTime = this.playerObject.currentTime;
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
			this.updatePlayhead();
			$( this ).trigger( "playing" );
			this.hideSpinner();
			if ( this.seeking == true ) {
				this.onPlayerSeekEnd();
			}
			this.stopped = this.paused = false;
		},

		onDurationChange: function( data, id ) {
			// Update the duration ( only if not in url time encoding mode:
			if( !this.supportsURLTimeEncoding() ){
				this.setDuration( data );
				this.playerObject.duration = data;
			}
		},

		onClipDone: function() {
			$( this ).trigger( "onpause" );
			this.playerObject.stop();
			this.parent_onClipDone();
			this.currentTime = this.slCurrentTime = 0;
			this.preSequenceFlag = false;
		},

		onAlert: function ( data, id ) {
			this.layoutBuilder.displayAlert( data );
		},

		/**
		 * play method calls parent_play to update the interface
		 */
		play: function() {
			mw.log('EmbedPlayerKplayer::play')
			if ( this.parent_play() ) {
				this.playerObject.play();
				this.monitor();
			} else {
				mw.log( "EmbedPlayerKPlayer:: parent play returned false, don't issue play on kplayer element");
			}
		},

		/**
		 * pause method calls parent_pause to update the interface
		 */
		pause: function() {
			try {
				this.playerObject.pause();
			} catch(e) {
				mw.log( "EmbedPlayerKplayer:: doPause failed" );
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
			//we are not supposed to switch source. Ads can be played as siblings. Change media doesn't use this method.
			if( switchCallback ){
				switchCallback( this.playerObject );
			}
			setTimeout(function(){
				if( doneCallback )
					doneCallback();
			}, 100);
		},

		/**
		 * Issues a seek to the playerElement
		 *
		 * @param {Float}
		 *			percentage Percentage of total stream length to seek to
		 */
		seek: function(percentage) {
			var _this = this;
			var seekTime = percentage * this.getDuration();
			mw.log( 'EmbedPlayerKalturaKplayer:: seek: ' + percentage + ' time:' + seekTime );
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
			this.layoutBuilder.onSeek();
		},

		/**
		 * Issues a volume update to the playerElement
		 *
		 * @param {Float}
		 *			percentage Percentage to update volume to
		 */
		setPlayerElementVolume: function(percentage) {
			this.playerObject.setVolume(  percentage );
		},

		/**
		 * function called by flash at set interval to update the playhead.
		 */
		onUpdatePlayhead: function( playheadValue ) {
			if ( this.seeking ) {
				this.seeking = false;
			}
			this.slCurrentTime = playheadValue;
			$( this ).trigger( 'timeupdate' );
		},

		/**
		 * function called by flash when the total media size changes
		 */
		onBytesTotalChange: function( data, id ) {
			this.bytesTotal = data.newValue;
		},

		/**
		 * function called by flash applet when download bytes changes
		 */
		onBytesDownloadedChange: function( data, id ) {
			this.bytesLoaded = data.newValue;
			this.bufferedPercent = this.bytesLoaded / this.bytesTotal;
			// Fire the parent html5 action
			$( this ).trigger( 'updateBufferPercent', this.bufferedPercent );
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
			this.mediaElement.setSourceByIndex ( data.newIndex );
		},

		onFlavorsListChanged: function ( data, id ) {
			var flavors = data.flavors;
			if ( flavors && flavors.length > 1 ) {
				this.setKDPAttribute( 'sourceSelector' , 'visible', true);
			}
			this.replaceSources( flavors );

		},

		onLiveEntryOffline: function () {
			if ( this.streamerType == 'rtmp' ) {
				this.triggerHelper( 'liveStreamStatusUpdate', { 'onAirStatus': false } );
			}
		},

		onLiveStreamReady: function () {
			if ( this.streamerType == 'rtmp' ) {
				//first time the livestream is ready
				this.hideSpinner();
				this.triggerHelper( 'liveStreamStatusUpdate', { 'onAirStatus' : true } );
				if ( this.cancelLiveAutoPlay ) {
					this.cancelLiveAutoPlay = false;
					//fix misleading player state after we cancelled autoplay
					$( this ).trigger( "onpause" );
				}
			}
		},

		onEnableGui: function ( data, id ) {
			if ( data.guiEnabled === false ) {
				this.disablePlayControls();
			} else {
				this.enablePlayControls();
			}
		},

		/**
		 * Get the embed player time
		 */
		getPlayerElementTime: function() {
			// update currentTime
			return this.slCurrentTime;
		},

		/**
		 * Get the embed flash object player Element
		 */
		getPlayerElement: function(){
			return this.playerObject;
		},

		getPlayerContainer: function(){
			if( !this.containerId ){
				this.containerId = 'splayer_' + this.id;
			}
			return $( '#' +  this.containerId );
		},

		/**
		 * Get the URL to pass to KDP according to the current streamerType
		 */
		getEntryUrl: function() {
			var srcUrl = "";
			return srcUrl;
		},

		/**
		 * If argkey was set as flashvar or uivar this function will return a string with "/argName/argValue" form,
		 * that can be concatanated to playmanifest URL.
		 * Otherwise an empty string will be returnned
		 */
		getPlaymanifestArg: function ( argName, argKey ) {
			var argString = "";
			var argVal = this.getKalturaConfig( null, argKey );
			if ( argVal !== undefined ) {
				argString = "/" + argName + "/" + argVal;
			}
			return argString;
		},
		/*
		 * get the source index for a given source
		 */
		getSourceIndex: function( source ){
			var sourceIndex = null;
			$.each( this.mediaElement.getPlayableSources(), function( currentIndex, currentSource ) {
				if( source.getSrc() == currentSource.getSrc() ){
					sourceIndex = currentIndex;
					return false;
				}
			});
			if( !sourceIndex ){
				mw.log( "EmbedPlayerKplayer:: Error could not find source: " + source.getSrc() );
			}
			return sourceIndex;
		},
		switchSrc: function ( source ) {
			//http requires source switching, all other switch will be handled by OSMF in KDP
			if ( this.streamerType == 'http' && !this.getFlashvars( 'forceDynamicStream' ) ) {
				//other streamerTypes will update the source upon "switchingChangeComplete"
				this.mediaElement.setSource ( source );
				this.playerObject.setKDPAttribute ('mediaProxy', 'entryUrl', this.getEntryUrl());
			}
			this.playerObject.sendNotification('doSwitch', { flavorIndex: this.getSourceIndex( source ) });
		},
		canAutoPlay: function() {
			return true;
		},
		backToLive: function() {
			this.triggerHelper( 'movingBackToLive' );
			this.playerObject.sendNotification('goLive');
		},

		clean:function(){
			$(this.getPlayerContainer()).remove();
		}

	}
} )( mediaWiki, jQuery );
