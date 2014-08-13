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
		flashvars.widgetId = "_" + this.kpartnerid;
		flashvars.partnerId = this.kpartnerid;
        flashvars.autoMute = this.muted || mw.getConfig( 'autoMute' );
		flashvars.streamerType = this.streamerType;
		flashvars.entryUrl = encodeURIComponent( this.getEntryUrl() );
		flashvars.isMp4 = this.isMp4Src();
		flashvars.ks = this.getFlashvars( 'ks' );
		flashvars.serviceUrl = mw.getConfig( 'Kaltura.ServiceUrl' );
		flashvars.b64Referrer = this.b64Referrer;
		flashvars.forceDynamicStream = this.getFlashvars( 'forceDynamicStream' );
		flashvars.isLive = this.isLive();
		flashvars.stretchVideo =  this.getFlashvars( 'stretchVideo' ) || false;

		flashvars.flavorId = this.getFlashvars( 'flavorId' );
		if ( ! flashvars.flavorId && this.mediaElement.selectedSource ) {
			flashvars.flavorId = this.mediaElement.selectedSource.getAssetId();
			//this workaround saves the last real flavorId (usefull for example in widevine_mbr replay )
			this.setFlashvars( 'flavorId', flashvars.flavorId );
		}

		if ( this.streamerType != 'http' && this.selectedFlavorIndex != 0 ) {
			flashvars.selectedFlavorIndex = this.selectedFlavorIndex;
		}

		//add OSMF HLS Plugin if the source is HLS
		if ( this.isHlsSource( this.mediaElement.selectedSource ) && mw.getConfig("LeadWithHLSOnFlash") ) {
			flashvars.sourceType = 'url';
			flashvars.ignoreStreamerTypeForSeek = true;
			flashvars.KalturaHLS = { plugin: 'true', asyncInit: 'true', loadingPolicy: 'preInitialize' };
			this.streamerType = "hls";
		}

		if ( this.live && this.streamerType == 'rtmp' && !this.cancelLiveAutoPlay ) {
			flashvars.autoPlay = true;
		}

		//will contain flash plugins we need to load
		var kdpVars = this.getKalturaConfig( 'kdpVars', null );
		$.extend ( flashvars, kdpVars );
		var playerElementFlash = new mw.PlayerElementFlash( this.kPlayerContainerId, 'kplayer_' + this.pid, flashvars, this, function() {
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
				'bufferChange': 'onBufferChange'
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
	* Get required sources for KDP. Either by flavorTags flashvar or tagged wtih 'web'/'mbr' by default
	 * or hls sources
	**/
	getSourcesForKDP: function() {
		var _this = this;
		var sourcesByTags = [];
		var flavorTags = _this.getKalturaConfig( null, 'flavorTags' );
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
		if ( ! ( this.live || this.sourcesReplaced ) ) {
			var newSources = this.getSourcesForKDP();
			this.replaceSources( newSources );
			this.mediaElement.autoSelectSource();
		}
		else if ( this.live && this.streamerType == 'rtmp' ){
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
		this.updateSources();
		this.flashCurrentTime = 0;
		this.playerObject.setKDPAttribute( 'mediaProxy', 'isLive', this.isLive() );
		this.playerObject.setKDPAttribute( 'mediaProxy', 'isMp4', this.isMp4Src() );
		this.playerObject.sendNotification( 'changeMedia', {
			entryUrl: this.getEntryUrl()
		});
		callback();
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
		$( this ).trigger( "playing" );
		this.hideSpinner();
		if ( this.isLive() ) {
			this.ignoreEnableGui = false;
			this.enablePlayControls();
		}
		if ( this.seeking == true ) {
			this.onPlayerSeekEnd();
		}
		this.stopped = this.paused = false;
	},

	onDurationChange: function( data, id ) {
		// Update the duration ( only if not in url time encoding mode:
		if( !this.supportsURLTimeEncoding() ){
			this.setDuration( data.newValue );
			this.playerObject.duration = data.newValue;
		}
	},

	onClipDone: function() {
		this.parent_onClipDone();
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
			//live might take a while to start, meanwhile disable gui
			if ( this.isLive() ) {
				this.ignoreEnableGui = true;
				this.disablePlayControls();
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
		this.seeking = true;
		// trigger the html5 event:
		$( this ).trigger( 'seeking' );

		// Issue the seek to the flash player:
		this.playerObject.seek( seekTime );

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
		$( this ).trigger( 'seeked',[this.playerObject.getCurrentTime()]);
		this.seeking = false;
		this.flashCurrentTime = this.playerObject.getCurrentTime();
		if( this.seekInterval  ) {
			clearInterval( this.seekInterval );
		}
	},

	onSwitchingChangeStarted: function ( data, id ) {
		$( this ).trigger( 'sourceSwitchingStarted' );
	},

	onSwitchingChangeComplete: function ( data, id ) {
		if (data && data.newBitrate) {
			this.triggerHelper( 'bitrateChange' , data.newBitrate );
		}
		this.mediaElement.setSourceByIndex ( data.newIndex );
	},

	onFlavorsListChanged: function ( data, id ) {
		var flavors = data.flavors;
		if ( flavors && flavors.length > 1 ) {
			this.setKDPAttribute( 'sourceSelector' , 'visible', true);
		}
		this.replaceSources( flavors );

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
		if ( this.live || this.sourcesReplaced || this.isHlsSource( this.mediaElement.selectedSource )) {
			return this.mediaElement.selectedSource.getSrc();
		}
		var flavorIdParam = '';
		var mediaProtocol = this.getKalturaConfig( null, 'mediaProtocol' ) || "http";
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
	setKPlayerAttribute: function( host, prop, val ) {
		this.playerObject.setKDPAttribute(host, prop, val);
	},
	clean:function(){
		$(this.getPlayerContainer()).remove();
	},
	setStorageId: function( storageId ) {
		this.parent_setStorageId( storageId );
		//set url with new storageId
		if ( this.playerObject ) {
			this.playerObject.setKDPAttribute ( 'mediaProxy', 'entryUrl', this.getEntryUrl() );
		}
	},
	toggleFullscreen: function() {
		this.parent_toggleFullscreen();
		//Redraw flash object, this fixes a Flash resize issue on when wmode=transparent
		this.playerObject.redrawObject();
	}
};

} )( mediaWiki, jQuery );
