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
		flashvars.streamerType = this.streamerType;
		flashvars.entryUrl = this.getEntryUrl();
		flashvars.ks = this.getFlashvars( 'ks' );
		flashvars.serviceUrl = mw.getConfig( 'Kaltura.ServiceUrl' );
		flashvars.b64Referrer = this.b64Referrer;
		flashvars.forceDynamicStream = this.getFlashvars( 'forceDynamicStream' );
		flashvars.isLive = this.isLive();

		flashvars.flavorId = this.getFlashvars( 'flavorId' );
		if ( ! flashvars.flavorId && this.mediaElement.selectedSource ) {
			flashvars.flavorId = this.mediaElement.selectedSource.getAssetId();
			//this workaround saves the last real flavorId (usefull for example in widevine_mbr replay )
			this.setFlashvars( 'flavorId', flashvars.flavorId );
		}

		if ( this.streamerType != 'http' && this.selectedFlavorIndex != 0 ) {
			flashvars.selectedFlavorIndex = this.selectedFlavorIndex;
		}

		//will contain flash plugins we need to load
		var kdpVars = this.getKalturaConfig( 'kdpVars', null );
		$.extend ( flashvars, kdpVars );
		var playerElementFlash = new mw.PlayerElementFlash( this.kPlayerContainerId, 'kplayer_' + this.pid, flashvars, this, function() {
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
				'liveEtnry': 'onLiveEntry',
				'liveStreamReady': 'onLiveStreamReady'
			};
			_this.playerObject = this.getElement();
			$.each( bindEventMap, function( bindName, localMethod ) {
				_this.playerObject.addJsListener(  bindName, localMethod );
			});
			readyCallback();
			if ( _this.live && _this.cancelLiveAutoPlay ){
				_this.onLiveEntry();
			}
		});
	},

	setCurrentTime: function( time ){
		this.flashCurrentTime = time;
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
	getSourcesForKDP: function() {
		var _this = this;
		var sourcesByTags = [];
		var flavorTags = _this.getKalturaConfig( null, 'flavorTags' );
		//select default 'web' / 'mbr' flavors
		if ( flavorTags === undefined ) {
			var sources = _this.mediaElement.getPlayableSources();
			$.each( sources, function( sourceIndex, source ) {
				if ( _this.checkForTags( source.getTags(), ['web', 'mbr'] )) {
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
			//in this case Flash player will determine when live is on air
			if ( ! this.autoplay ) {
				this.autoplay = true;
				//cancel the autoPlay once Flash starts the live checks
				this.cancelLiveAutoPlay = true;
			}
			$( this ).bind( 'layoutBuildDone', function() {
				_this.disablePlayControls();
			});

		}
	},

	changeMediaCallback: function( callback ){
		this.updateSources();
		this.flashCurrentTime = 0;
		this.playerObject.setKDPAttribute( 'mediaProxy', 'isLive', this.isLive() );
		this.playerObject.sendNotification( 'changeMedia', {
			entryUrl: this.getEntryUrl()
		});
		callback();
	},

	/*
	 * Write the Embed html to the target
	 */
	embedPlayerHTML: function() {},

	updatePlayhead: function () {
		if ( this.seeking ) {
			this.seeking = false;
			this.flashCurrentTime = this.playerObject.getCurrentTime();
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
			this.setDuration( data.newValue );
			this.playerObject.duration = data.newValue;
		}
	},

	onClipDone: function() {
		$( this ).trigger( "onpause" );
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
			var orgTime = this.flashCurrentTime;
			 this.seekInterval = setInterval( function(){
				if( _this.flashCurrentTime != orgTime ){
					_this.seeking = false;
					clearInterval( _this.seekInterval );
					$( _this ).trigger( 'seeked' );
				}
			}, mw.getConfig( 'EmbedPlayer.MonitorRate' ) );
		} else if ( percentage != 0 ) {
			this.playerObject.setKDPAttribute('mediaProxy', 'mediaPlayFrom', seekTime);
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
		this.playerObject.sendNotification( 'changeVolume', percentage );
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
		
		//this.mediaElement.setSourceByIndex( 0 );
	},

	onLiveEntry: function () {
		if ( this.cancelLiveAutoPlay ) {
			this.playerObject.setKDPAttribute( 'configProxy.flashvars', 'autoPlay', 'false');
		}
		this.triggerHelper( 'liveStreamStatusUpdate', { 'onAirStatus': false } );
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
		if ( this.live || this.sourcesReplaced ) {
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
	}
};

} )( mediaWiki, jQuery );
