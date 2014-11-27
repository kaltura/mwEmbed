/*
 * The "kaltura player" embedPlayer interface for fallback h.264 and flv video format support
 */
( function( mw, $ ) { "use strict";

mw.EmbedPlayerKplayer = {
	// Instance name:
	instanceOf : 'Kplayer',

	bindPostfix: '.kPlayer',

	//Flag indicating we should cancel autoPlay on live entry
	// (we set it to true as a workaround to make the Flash start the live checks call)
	cancelLiveAutoPlay: false,
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
	// If the media loaded event has been fired
	mediaLoadedFlag: false,
	seekStarted: false,
	// stores the manifest derived flavor index / list:
	manifestAdaptiveFlavors: [],
	// Stores the current time as set from flash player
	flashCurrentTime : 0,
	selectedFlavorIndex : 0,
	b64Referrer: base64_encode( window.kWidgetSupport.getHostPageUrl() ),
	playerObject: null,
	//when playing live rtmp we increase the timeout until we display the "offline" alert, cuz player takes a while to identify "online" state
	LIVE_OFFLINE_ALERT_TIMEOUT: 8000,
	ignoreEnableGui: false,

	// Create our player element
	setup: function( readyCallback ) {
		mw.log('EmbedPlayerKplayer:: Setup');

		// Check if we created the kPlayer container
		var $container = this.getPlayerContainer();
		// If container exists, show the player and exit
		if( $container.length ){
			this.enablePlayerObject( true );
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
		this.getEntryUrl().then(function(srcToPlay){
			flashvars.widgetId = "_" + _this.kpartnerid;
			flashvars.partnerId = _this.kpartnerid;
			flashvars.autoMute = _this.muted || mw.getConfig( 'autoMute' );
			flashvars.streamerType = _this.streamerType;

			flashvars.entryUrl = encodeURIComponent( srcToPlay );
			flashvars.entryDuration = _this.getDuration();
			flashvars.isMp4 = _this.isMp4Src();
			flashvars.ks = _this.getFlashvars( 'ks' );
			flashvars.serviceUrl = mw.getConfig( 'Kaltura.ServiceUrl' );
			flashvars.b64Referrer = _this.b64Referrer;
			flashvars.forceDynamicStream = _this.getKalturaAttributeConfig( 'forceDynamicStream' );
			flashvars.isLive = _this.isLive();
			flashvars.stretchVideo =  _this.getKalturaAttributeConfig( 'stretchVideo' ) || false;

			flashvars.flavorId = _this.getKalturaAttributeConfig( 'flavorId' );
			if ( ! flashvars.flavorId && _this.mediaElement.selectedSource ) {
				flashvars.flavorId = _this.mediaElement.selectedSource.getAssetId();
				//_this workaround saves the last real flavorId (usefull for example in widevine_mbr replay )
				_this.setFlashvars( 'flavorId', flashvars.flavorId );
			}

			if ( _this.streamerType != 'http' && _this.mediaElement.selectedSource ) {
				flashvars.selectedFlavorIndex = _this.getSourceIndex( _this.mediaElement.selectedSource  );
			}

			//add OSMF HLS Plugin if the source is HLS
			if ( _this.isHlsSource( _this.mediaElement.selectedSource ) && mw.getConfig("LeadWithHLSOnFlash") ) {
				flashvars.KalturaHLS = { plugin: 'true', asyncInit: 'true', loadingPolicy: 'preInitialize' };
				flashvars.streamerType = _this.streamerType = 'hls';
			}

			if ( _this.isLive() && _this.streamerType == 'rtmp' && !_this.cancelLiveAutoPlay ) {
				flashvars.autoPlay = true;
			}

			if ( _this.getKalturaAttributeConfig( 'maxAllowedRegularBitrate' ) ) {
				flashvars.maxAllowedRegularBitrate =  _this.getKalturaAttributeConfig( 'maxAllowedRegularBitrate' );
			}
			if ( _this.getKalturaAttributeConfig( 'maxAllowedFSBitrate' ) ) {
				flashvars.maxAllowedFSBitrate =  _this.getKalturaAttributeConfig( 'maxAllowedFSBitrate' );
			}

			//will contain flash plugins we need to load
			var kdpVars = _this.getKalturaConfig( 'kdpVars', null );
			$.extend ( flashvars, kdpVars );
			var playerElementFlash = new mw.PlayerElementFlash( _this.kPlayerContainerId, 'kplayer_' + _this.pid, flashvars, _this, function() {
				var bindEventMap = {
					'playerPaused' : 'onPause',
					'playerPlayed' : 'onPlay',
					'durationChange' : 'onDurationChange',
					'playbackComplete' : 'onClipDone',
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
					'liveStreamReady': 'onLiveStreamReady',
					'loadEmbeddedCaptions': 'onLoadEmbeddedCaptions',
					'bufferChange': 'onBufferChange',
					'audioTracksReceived': 'onAudioTracksReceived',
					'audioTrackSelected': 'onAudioTrackSelected',
					'videoMetadataReceived': 'onVideoMetadataReceived',
					'hlsEndList': 'onHlsEndList'
				};
				_this.playerObject = this.getElement();
				$.each( bindEventMap, function( bindName, localMethod ) {
					_this.playerObject.addJsListener(  bindName, localMethod );
				});
				if ( _this.startTime !== undefined && _this.startTime != 0 ) {
					_this.playerObject.setKDPAttribute('mediaProxy', 'mediaPlayFrom', _this.startTime );
				}
				readyCallback();

				if (mw.getConfig( 'autoMute' )){
					_this.triggerHelper("volumeChanged",0);
				}

			});

			_this.bindHelper( 'switchAudioTrack', function(e, data) {
				if ( _this.playerObject ) {
					_this.playerObject.sendNotification( "doAudioSwitch",{ audioIndex: data.index  } );
				}
			});

			_this.bindHelper( 'liveEventEnded', function() {
				if ( _this.playerObject ) {
					_this.playerObject.sendNotification( "liveEventEnded" );
				}
			});
		});

	},

	isHlsSource: function( source ) {
		if ( source && (source.getMIMEType() == 'application/vnd.apple.mpegurl' )) {
			return true;
		}
		return false;
	},

	setCurrentTime: function( time, callback ){
		this.flashCurrentTime = time;
        if( callback ){
            callback();
        }
	},

	addStartTimeCheck: function() {
		//nothing here, just override embedPlayer.js function
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
		//Show the native video tag
		this.showNativePoster();
		this.enablePlayerObject( false );
	},

	/**
	 * Show the native video tag
	 */
	showNativePoster: function(){
		var videoTagObj = $ ( $( '#' + this.pid ).get( 0 ) );
		if (videoTagObj){
			videoTagObj.css('visibility', '');
		}
	},

	/**
	 * Hide the native video tag
	 */
	hideNativePoster: function(){
		var videoTagObj = $ ( $( '#' + this.pid ).get( 0 ) );
		if (videoTagObj){
			videoTagObj.css('visibility', 'hidden');
		}
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
	getSourcesForKDP: function() {
		var _this = this;
		var sourcesByTags = [];
		var flavorTags = _this.getKalturaAttributeConfig( 'flavorTags' );
		//select default 'web' / 'mbr' flavors
		if ( flavorTags === undefined ) {
			var sources = _this.mediaElement.getPlayableSources();
			$.each( sources, function( sourceIndex, source ) {
				if ( _this.checkForTags( source.getTags(), ['web', 'mbr'] ) || ( _this.isHlsSource( source ))) {
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
		if ( ! ( this.isLive() || this.sourcesReplaced || this.isHlsSource( this.mediaElement.selectedSource ) ) ) {
			this.mediaElement.autoSelectSource( { 'sources': this.getSourcesForKDP() } );
		}
		else if ( this.isLive() && this.streamerType == 'rtmp' ){
			var _this = this;

			if ( ! this.autoplay ) { //not a real "autoPlay", just to enable live checks
				this.autoplay = true;
				//cancel the autoPlay once Flash starts the live checks
				this.cancelLiveAutoPlay = true;
			} else if ( this.playerObject ) {
				this.playerObject.setKDPAttribute( 'configProxy.flashvars', 'autoPlay', 'true');
			}
			//with rtmp the first seconds look offline, delay the "offline" message
			this.setKDPAttribute('liveCore', 'offlineAlertOffest', this.LIVE_OFFLINE_ALERT_TIMEOUT);
			$( this ).bind( 'layoutBuildDone', function() {
				_this.disablePlayControls();
			});

		}
	},

	changeMediaCallback: function( callback ){
		var _this = this;
		this.updateSources();
		this.seekStarted = false;
		this.mediaLoadedFlag = false;
		this.flashCurrentTime = 0;
		this.playerObject.setKDPAttribute( 'mediaProxy', 'isLive', this.isLive() );
		this.playerObject.setKDPAttribute( 'mediaProxy', 'isMp4', this.isMp4Src() );
		this.playerObject.setKDPAttribute( 'mediaProxy', 'entryDuration', this.getDuration() );
		this.getEntryUrl().then(function( srcToPlay ){
			_this.playerObject.sendNotification( 'changeMedia', {
				entryUrl: srcToPlay
			});
			callback();
		});

	},

	isMp4Src: function() {
		if ( this.mediaElement.selectedSource &&
			( this.mediaElement.selectedSource.getMIMEType() == 'video/mp4' || this.mediaElement.selectedSource.getMIMEType() == 'video/h264' ) ) {
			return true;
		}
		return false;
	},

	/*
	 * Write the Embed html to the target
	 */
	embedPlayerHTML: function() {},

	/**
	 * on Pause callback from the kaltura flash player calls parent_pause to
	 * update the interface
	 */
	onPause: function() {
		$( this ).trigger( "pause" );
	},

	/**
	 * onPlay function callback from the kaltura flash player directly call the
	 * parent_play
	 */
	onPlay: function() {
		if(this._propagateEvents) {
			$( this ).trigger( "playing" );
			this.hideSpinner();
			if ( this.isLive() ) {
				this.ignoreEnableGui = false;
				this.enablePlayControls( ['sourceSelector'] );
			}
			this.stopped = this.paused = false;
		}
	},

	onDurationChange: function( data, id ) {
		// Update the duration ( only if not in url time encoding mode:
		if( !this.supportsURLTimeEncoding() ){
			this.setDuration( data.newValue );
			this.playerObject.duration = data.newValue;
		}
	},
	onVideoMetadataReceived: function( data ){
		if ( data && data.info ) {
			$( this ).trigger( 'videoMetadataReceived',[ data.info ]);
		}
		// Trigger "media loaded"
		if( ! this.mediaLoadedFlag ){
			$( this ).trigger( 'mediaLoaded' );
			this.mediaLoadedFlag = true;
		}
	},
	onClipDone: function() {
		this.parent_onClipDone();
		this.preSequenceFlag = false;
	},

	onAlert: function ( data, id ) {
		if ( data.messageKey ) {
			data.message = gM ( data.messageKey );
		}
		if ( data.titleKey ) {
			data.title = gM ( data.titleKey );
		}
		this.layoutBuilder.displayAlert( data );
	},

	/**
	 * m3u8 has 'EndList' tag
	 */
	onHlsEndList: function () {
		this.triggerHelper( 'liveEventEnded' );
	},

	/**
	 * play method calls parent_play to update the interface
	 */
	play: function() {
		mw.log('EmbedPlayerKplayer::play');
		var shouldDisable = false
		if ( this.isLive() && this.paused ) {
			shouldDisable = true;
		}
		if ( this.parent_play() ) {
			//live might take a while to start, meanwhile disable gui
			if ( shouldDisable ) {
				this.ignoreEnableGui = true;
				this.disablePlayControls( ['sourceSelector'] );
			}
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
	seek: function(percentage, stopAfterSeek) {
		var _this = this;
		this.seekStarted = true;
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

		// Trigger preSeek event for plugins that want to store pre seek conditions.
		var stopSeek = {value: false};
		this.triggerHelper( 'preSeek', [percentage, stopAfterSeek, stopSeek] );
		if(stopSeek.value){
			return;
		}

		this.seeking = true;

		// Save currentTime
		this.kPreSeekTime = _this.currentTime;
		this.currentTime = ( percentage * this.duration ).toFixed( 2 ) ;

		// trigger the html5 event:
		$( this ).trigger( 'seeking' );

		// Run the onSeeking interface update
		this.layoutBuilder.onSeek();

		this.unbindHelper("seeked" + _this.bindPostfix).bindHelper("seeked" + _this.bindPostfix, function(){
			_this.unbindHelper("seeked" + _this.bindPostfix);
			_this.removePoster();
			_this.startMonitor();
			if( stopAfterSeek ){
				_this.hideSpinner();
				_this.pause();
				_this.updatePlayheadStatus();
			} else {
				// continue to playback ( in a non-blocking call to avoid synchronous pause event )
				setTimeout(function(){
					if ( !_this.stopPlayAfterSeek ) {
						mw.log( "EmbedPlayerNative::sPlay after seek" );
						_this.play();
						_this.stopPlayAfterSeek = false;
					}
				},0);
			}
		});

		if ( this.firstPlay ) {
			this.stopEventPropagation();
			if ( this.streamerType == 'http' ) {
				this.playerObject.seek( seekTime );
			}
			this.playerObject.setKDPAttribute('mediaProxy', 'mediaPlayFrom', seekTime );
			this.playerObject.play();
		} else {
			this.playerObject.seek( seekTime );
		}

	},

	/**
	 * Issues a volume update to the playerElement
	 *
	 * @param {Float}
	 *			percentage Percentage to update volume to
	 */
	setPlayerElementVolume: function(percentage) {
			if ( this.playerObject ) {
				this.playerObject.changeVolume( percentage );
			}
	},

	/**
	 * function called by flash at set interval to update the playhead.
	 */
	onUpdatePlayhead: function( playheadValue ) {
		if ( this.seeking ) {
			this.seeking = false;
		}
		this.flashCurrentTime = playheadValue;
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
		if ( this.firstPlay ) {
			this.restoreEventPropagation();
		}
		this.previousTime = this.currentTime = this.flashCurrentTime = this.playerObject.getCurrentTime();
		this.seeking = false;
		if (this.seekStarted){
			this.seekStarted = false;
			$( this ).trigger( 'seeked',[this.playerObject.getCurrentTime()]);
		}
	},

	onSwitchingChangeStarted: function ( data, id ) {
		$( this ).trigger( 'sourceSwitchingStarted', [ data ] );
	},

	onSwitchingChangeComplete: function ( data, id ) {
		if (data && data.newBitrate) {
			this.triggerHelper( 'bitrateChange' , data.newBitrate );
		}
		// TODO if we need to track source index should be top level method per each play interface having it's own adaptive logic
		//this.mediaElement.setSourceByIndex ( data.newIndex );
		$( this ).trigger( 'sourceSwitchingEnd', [ data ]  );
	},

	onFlavorsListChanged: function ( data, id ) {
		var _this = this;
		var flavors = data.flavors;
		if ( flavors && flavors.length > 1 ) {
			this.setKDPAttribute( 'sourceSelector' , 'visible', true);
		}
		// update the manifest defined flavor set: 
		this.manifestAdaptiveFlavors = [];
		$.each(flavors, function(inx, flavor){
			_this.manifestAdaptiveFlavors.push( new mw.MediaSource( flavor ) )
		});
		// trigger source update event for any plugins 
		$(this).trigger( 'sourcesReplaced' );
		//this.mediaElement.setSourceByIndex( 0 );
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
			this.playerObject.setKDPAttribute( 'configProxy.flashvars', 'autoPlay', 'false');  //reset property for next media
			this.triggerHelper( 'liveStreamStatusUpdate', { 'onAirStatus' : true } );
			if ( this.cancelLiveAutoPlay ) {
				this.cancelLiveAutoPlay = false;
				this.autoplay = false;
				//fix misleading player state after we cancelled autoplay
				this.pause();
			}
		}
	},

	onLoadEmbeddedCaptions: function( data ) {
		this.triggerHelper( 'onTextData', data );

		var caption = {
			source: {
				srclang: data.language
			},
			capId: data.trackid,
			caption: {
				content: data.text
			}
		};
		this.triggerHelper( 'onEmbeddedData', caption );
	},

	onEnableGui: function ( data, id ) {
		if ( this.ignoreEnableGui ) {
			return;
		}
		if ( data.guiEnabled === false ) {
			this.disablePlayControls();
		} else {
			this.enablePlayControls();
		}			
	},

	onBufferChange: function ( buffering ) {
		//vod buffer is already being monitored by EmbedPlayer.js
		if ( this.isLive() ) {
			if ( buffering ) {
				this.bufferStart();
			} else {
				this.bufferEnd();
			}
		}
	},

	onAudioTracksReceived: function ( data ) {
		this.triggerHelper( 'audioTracksReceived', data );
	},

	onAudioTrackSelected: function ( data ) {
		this.triggerHelper( 'audioTrackIndexChanged', data  );
	},

	/**
	 * Get the embed player time
	 */
	getPlayerElementTime: function() {
		// update currentTime
		return this.flashCurrentTime;
	},

	/**
	 * Get the embed flash object player Element
	 */
	getPlayerElement: function(){
		return this.playerObject;
	},

	getPlayerContainer: function(){
		if( !this.kPlayerContainerId ){
			this.kPlayerContainerId = 'kplayer_' + this.id;
		}
		return $( '#' +  this.kPlayerContainerId );
	},

	/**
	* Get the URL to pass to KDP according to the current streamerType
	*/
	getEntryUrl: function() {
		var deferred = $.Deferred();
		var originalSrc = this.mediaElement.selectedSource.getSrc();
		if ( this.isHlsSource( this.mediaElement.selectedSource )) {

			this.resolveSrcURL( originalSrc )
				.then(function ( srcToPlay ){
				deferred.resolve( srcToPlay );
			}, function () { //error
				deferred.resolve( originalSrc );
			});
			return deferred;
		}

		else if ( this.isLive() || this.sourcesReplaced ) {
			deferred.resolve( originalSrc );
		}
		var flavorIdParam = '';
		var mediaProtocol = this.getKalturaAttributeConfig( 'mediaProtocol' ) || mw.getConfig('Kaltura.Protocol') || "http";
		var format;
		var fileExt = 'f4m';
		if ( this.streamerType === 'hdnetwork' ) {
			format = 'hdnetworksmil';
			fileExt = 'smil';
		} else if ( this.streamerType === 'live' ) {
			format = 'rtmp';
		} else {
			format = this.streamerType;
			if ( format == 'http' ) {
				flavorIdParam = this.mediaElement.selectedSource ? "/flavorId/" + this.mediaElement.selectedSource.getAssetId() : "";
			}
		}

		//build playmanifest URL
		var srcUrl =  window.kWidgetSupport.getBaseFlavorUrl( this.kpartnerid ) + "/entryId/" + this.kentryid + flavorIdParam 
				 + this.getPlaymanifestArg ( "deliveryCode", "deliveryCode" ) + "/format/" + format
				 + "/protocol/" + mediaProtocol + this.getPlaymanifestArg( "cdnHost", "cdnHost" ) + this.getPlaymanifestArg( "storageId", "storageId" )
				 +  "/ks/" + this.getFlashvars( 'ks' ) + "/uiConfId/" + this.kuiconfid  + this.getPlaymanifestArg ( "referrerSig", "referrerSig" )  
				 + this.getPlaymanifestArg ( "tags", "flavorTags" ) + "/a/a." + fileExt + "?referrer=" + this.b64Referrer  ;
		var refObj = {src:srcUrl};
		this.triggerHelper( 'SourceSelected' , refObj );
		deferred.resolve(refObj.src);
		return deferred;
	},

	/**
	* If argkey was set as flashvar or uivar this function will return a string with "/argName/argValue" form, 
	* that can be concatanated to playmanifest URL. 
	* Otherwise an empty string will be returnned
	*/
	getPlaymanifestArg: function ( argName, argKey ) {
		var argString = "";
		var argVal = this.getKalturaAttributeConfig( argKey );
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
		$.each( this.getSources(), function( currentIndex, currentSource ) {
			if( source.getAssetId() == currentSource.getAssetId() ){
				sourceIndex = currentIndex;
				return false;
			}
		});
		if( sourceIndex == null ){
			mw.log( "EmbedPlayerKplayer:: Error could not find source: " + source.getSrc() );
		}
		return sourceIndex;
	},
	switchSrc: function ( source ) {
		var _this = this;
		//http requires source switching, all other switch will be handled by OSMF in KDP
		if ( this.streamerType == 'http' && !this.getKalturaAttributeConfig( 'forceDynamicStream' ) ) {
			//other streamerTypes will update the source upon "switchingChangeComplete"
			this.mediaElement.setSource ( source );
			this.getEntryUrl().then(function( srcToPlay ){
				_this.playerObject.setKDPAttribute ('mediaProxy', 'entryUrl', srcToPlay);
				_this.playerObject.sendNotification('doSwitch', { flavorIndex: _this.getSourceIndex( source ) });
			});
			return;
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
	setKPlayerAttribute: function( host, prop, val ) {
		this.playerObject.setKDPAttribute(host, prop, val);
	},
	clean:function(){
		$(this.getPlayerContainer()).remove();
	},
	setStorageId: function( storageId ) {
		var _this = this;
		this.parent_setStorageId( storageId );
		//set url with new storageId
		if ( this.playerObject ) {
			this.getEntryUrl().then(function( srcToPlay ) {
				_this.playerObject.setKDPAttribute( 'mediaProxy' , 'entryUrl' , srcToPlay );
			});
		}
	},
	toggleFullscreen: function() {
		var _this = this;
		this.parent_toggleFullscreen();
		//Redraw flash object, this fixes a Flash resize issue on when wmode=transparent
		this.playerObject.redrawObject();

		if ( _this.layoutBuilder.fullScreenManager.isInFullScreen() ) {
			_this.playerObject.sendNotification( "hasOpenedFullScreen" );
		} else {
			_this.playerObject.sendNotification( "hasCloseFullScreen" );
		}
	}
};

} )( mediaWiki, jQuery );
