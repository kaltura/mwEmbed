/*
 * The "kaltura player" embedPlayer interface for fallback h.264 and flv video format support
 */
( function( mw, $ ) { "use strict";

mw.EmbedPlayerKplayer = {
	// Instance name:
	instanceOf : 'Kplayer',

	bindPostfix: '.kPlayer',

	initialized: false,

	forceDynamicStream: false,

	playerJsReady: false,

	//Flag indicating we should cancel autoPlay on live entry
	// (we set it to true as a workaround to make the Flash start the live checks call)
	cancelLiveAutoPlay : false,

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
	streamerType : 'http',
	selectedFlavorIndex : 0,
	b64Referrer: base64_encode( window.kWidgetSupport.getHostPageUrl() ),
	jsReadyFuncName: 'kPlayerJsReady',



	/**
	* Get required sources for KDP. Either by flavorTags flashvar or tagged wtih 'web'/'mbr' by default
	**/
	getSourcesForKDP : function () {
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

	/*
	 * Write the Embed html to the target
	 */
	embedPlayerHTML : function() {
		var _this = this;

		var kPlayerContainerId = 'kplayer_' + this.id;
		if( !$( '#' + kPlayerContainerId).length ){
			this.getVideoDisplay().prepend(
				$('<div />').attr('id', kPlayerContainerId).addClass('maximize')
			);
		}

		if ( ! this.initialized  ) {
			if ( ! ( this.live || this.sourcesReplaced ) ) {
				var newSources = this.getSourcesForKDP();
				this.replaceSources( newSources );
				this.mediaElement.autoSelectSource();
			}
			else if ( this.live && this.getFlashvars('streamerType') == 'rtmp' ){
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
			this.initialized = true;
			//first call to this function is redundant?
			return;
		}


		this.flashCurrentTime = 0;

		mw.log("EmbedPlayerKplayer:: embed src::" + _this.getEntryUrl());
		var flashvars = {};
		flashvars.autoPlay = "true";
		flashvars.widgetId = "_" + this.kpartnerid;
		flashvars.partnerId = this.kpartnerid;
		flashvars.jsCallBackReadyFunc = this.jsReadyFuncName;
		flashvars.externalInterfaceDisabled = "false";
		this.streamerType = this.getKalturaConfig( null, 'streamerType' ) || 'http';
		//currently 'auto' is not supported, remove it after we support baseEntry.getContextData
		if ( this.streamerType == 'auto' ) {
			this.streamerType = 'http';
		}
		flashvars.streamerType = this.streamerType;
		flashvars.entryUrl = this.getEntryUrl();
		flashvars.ks = this.getFlashvars( 'ks' );
		flashvars.serviceUrl = mw.getConfig( 'Kaltura.ServiceUrl' );
		flashvars.b64Referrer = this.b64Referrer;
		flashvars.forceDynamicStream = this.forceDynamicStream = this.getFlashvars( 'forceDynamicStream' );
		flashvars.isLive = this.isLive();

		flashvars.flavorId = this.getFlashvars( 'flavorId' );
		if ( ! flashvars.flavorId && this.mediaElement.selectedSource ) {
			flashvars.flavorId = this.mediaElement.selectedSource.getAssetId();
			//this workaround saves the last real flavorId (usefull for example in widevine_mbr replay )
			this.setFlashvars( 'flavorId', flashvars.flavorId );
		}
		var playerPath = mw.getMwEmbedPath() + 'modules/EmbedPlayer/binPlayers/kaltura-player';
		// Use a relative url if the protocol is file://
		if ( new mw.Uri( document.URL ).protocol == 'file' ) {
			playerPath = mw.getRelativeMwEmbedPath() + 'modules/EmbedPlayer/binPlayers/kaltura-player';
			flashvars.entryUrl = this.getEntryUrl();
		}
		if ( this.streamerType != 'http' && this.selectedFlavorIndex != 0 ) {
			flashvars.selectedFlavorIndex = this.selectedFlavorIndex;
		}
		//if debug mode
		if( mw.getConfig( 'debug', true ) ){
			flashvars.debugMode = 'true';
		}
		//will contain flash plugins we need to load
		var kdpVars = this.getKalturaConfig( 'kdpVars', null );
		$.extend ( flashvars, kdpVars );
		var kdpPath = playerPath + '/kdp3.swf';
		mw.log( "KPlayer:: embedPlayerHTML" );
		// remove any existing pid ( if present )
		$( '#' + this.pid ).remove();
		_this.playerJsReady = false;
		window[this.jsReadyFuncName] = function( playerId ){
			_this.postEmbedActions();
			_this.playerJsReady = true;
			if ( _this.live && _this.cancelLiveAutoPlay) {
				_this.onLiveEntry( null, null );
			}
		};
		
		// attributes and params:
		flashembed(
			kPlayerContainerId, {
				id :				_this.pid,
				src :				kdpPath,
				bgcolor :			"#000000",
				allowNetworking :	"all",
				version :			[10,0],
				wmode :				"opaque"
			},
			flashvars
		);
	
		//Workaround: sometimes onscreen clicks didn't work without the div on top ( check Chrome on Mac for example )
		var clickthruDiv = document.createElement('div');
		$( clickthruDiv ).width( '100%' )
						.height('100%')
						.css ('position' , 'absolute')
						.css( 'top', 0 )
						.css( 'left', 0 )
						.appendTo( $ ('#' + $( this ).attr('id') ));

		// Remove any old bindings:
		$(_this).unbind( this.bindPostfix );

		// Flash player loses its bindings once it changes sizes::
		$(_this).bind( 'onOpenFullScreen' + this.bindPostfix , function() {
			_this.postEmbedActions();
		});
		$(_this).bind( 'onCloseFullScreen' + this.bindPostfix, function() {
			_this.postEmbedActions();
		});
		$(_this).bind( 'onChangeMedia' , function() {
			_this.currentTime = _this.flashCurrentTime = 0;
			$( _this ).trigger( 'timeupdate' );
			this.playerJsReady = false;
		});
	},

	// The number of times we have tried to bind the player
	bindTryCount : 0,

	/**
	 * javascript run post player embedding
	 */
	postEmbedActions : function() {
		var _this = this;
		this.getPlayerElement();
		if ( this.playerElement && this.playerElement.addJsListener ) {
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

			$.each( bindEventMap, function( bindName, localMethod ) {
				_this.bindPlayerFunction(bindName, localMethod);
			});
			this.bindTryCount = 0;
			// Start the monitor
			this.monitor();			

		} else {
			this.bindTryCount++;
			// Keep trying to get the player element
			if( this.bindTryCount > 500 ){ // 5 seconds
				mw.log('Error:: KDP player never ready for bindings!');
				return ;
			}
			setTimeout(function() {
				_this.postEmbedActions();
			}, 100);
		}
	},

	/**
	 * Bind a Player Function,
	 *
	 * Build a global callback to bind to "this" player instance:
	 *
	 * @param {String}
	 *			flash binding name
	 * @param {String}
	 *			function callback name
	 */
	bindPlayerFunction : function(bindName, methodName) {
		mw.log( 'EmbedPlayerKplayer:: bindPlayerFunction:' + bindName );
		// The kaltura kdp can only call a global function by given name
		var gKdpCallbackName = 'kdp_' + methodName + '_cb_' + this.id.replace(/[^a-zA-Z 0-9]+/g,'');

		// Create an anonymous function with local player scope
		var createGlobalCB = function(cName, embedPlayer) {
			window[ cName ] = function(data) {
				// Track all events ( except for playerUpdatePlayhead and bytesDownloadedChange )
				if( bindName != 'playerUpdatePlayhead' && bindName != 'bytesDownloadedChange' ){
					mw.log("EmbedPlayerKplayer:: event: " + bindName);
				}
				if ( embedPlayer._propagateEvents ) {
					embedPlayer[methodName](data);
				}
			};
		}(gKdpCallbackName, this);
		// Remove the listener ( if it exists already )
		this.playerElement.removeJsListener( bindName, gKdpCallbackName );
		// Add the listener to the KDP flash player:
		this.playerElement.addJsListener( bindName, gKdpCallbackName);
	},

	updatePlayhead : function () {
		if ( this.seeking ) {
			this.seeking = false;
			this.flashCurrentTime = this.playerElement.getCurrentTime();
		}
	},

	/**
	 * on Pause callback from the kaltura flash player calls parent_pause to
	 * update the interface
	 */
	onPause : function() {
		this.updatePlayhead();
		$( this ).trigger( "onpause" );
	},

	/**
	 * onPlay function callback from the kaltura flash player directly call the
	 * parent_play
	 */
	onPlay : function() {
		this.updatePlayhead();
		$( this ).trigger( "playing" );
		if ( this.seeking == true ) {
			onPlayerSeekEnd();
		}
	},

	onDurationChange : function( data, id ) {
		// Update the duration ( only if not in url time encoding mode:
		if( !this.supportsURLTimeEncoding() ){
			this.setDuration( data.newValue );
		}
	},

	onClipDone : function() {
		$( this ).trigger( "onpause" );
		this.parent_onClipDone();
		this.preSequenceFlag = false;
	},

	onAlert : function ( data, id ) {
		this.layoutBuilder.displayAlert( data );
	},

	/**
	 * play method calls parent_play to update the interface
	 */
	play: function() {
		if ( this.playerJsReady ) {
			this.playerElement.sendNotification('doPlay');
		}
		this.parent_play();
	},

	/**
	 * pause method calls parent_pause to update the interface
	 */
	pause: function() {
		if ( this.playerJsReady ) {
			//fixes a strange exception in IE 10
			try {
   				this.playerElement.sendNotification('doPause');
   			} catch(e) {
   				mw.log( "EmbedPlayerKplayer:: doPause failed" );
   			}
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
		var _this = this;
		var waitCount = 0;
		var src = source.getSrc();
		// Check if the source is already set to the target:
		if( !src || src == this.getSrc() ){
			if( switchCallback ){
				switchCallback();
			}
			setTimeout(function(){
				if( doneCallback )
					doneCallback();
			}, 100);
			return ;
		}

		var waitForJsListen = function( callback ){
			if(  _this.getPlayerElement() &&  _this.getPlayerElement().addJsListener ){
				callback();
			} else {
				// waited for 2 seconds fail
				if( waitCount > 20 ){
					mw.log( "Error: Failed to swtich player source!");
					if( switchCallback )
						switchCallback();
					if( doneCallback )
						doneCallback();
					return;
				}

				setTimeout(function(){
					waitCount++;
					waitForJsListen( callback );
				},100)
			}
		};
		// wait for jslistener to be ready:
		waitForJsListen( function(){
			var gPlayerReady = 'kdp_switch_' + _this.id + '_switchSrcReady';
			var gDoneName = 'kdp_switch_' + _this.id + '_switchSrcEnd';
			var gChangeMedia =  'kdp_switch_' + _this.id + '_changeMedia';
			window[ gPlayerReady ] = function(){
				mw.log("EmbedPlayerKplayer:: playerSwitchSource: " + src);
				// remove the binding as soon as possible ( we only want this event once )
				_this.getPlayerElement().removeJsListener( 'playerReady', gPlayerReady );

				_this.getPlayerElement().sendNotification("changeMedia", { 'entryId': this.kentryid, 'entryUrl': this.getEntryUrl()} );

				window[ gChangeMedia ] = function (){
					mw.log("EmbedPlayerKplayer:: Media changed: " + src);
					if( $.isFunction( switchCallback) ){
						switchCallback( _this );
						switchCallback = null
					}
					// restore monitor:
					_this.monitor();
				}
				// Add change media binding
				_this.getPlayerElement().removeJsListener('changeMedia', gChangeMedia);
				_this.getPlayerElement().addJsListener( 'changeMedia', gChangeMedia);

				window[ gDoneName ] = function(){
					if( $.isFunction( doneCallback ) ){
						doneCallback();
						doneCallback = null;
					}
				};
				_this.getPlayerElement().removeJsListener('playerPlayEnd', gDoneName);
				_this.getPlayerElement().addJsListener( 'playerPlayEnd', gDoneName);
			};
			// Remove then add the event:
			_this.getPlayerElement().removeJsListener( 'playerReady', gPlayerReady );
			_this.getPlayerElement().addJsListener( 'playerReady', gPlayerReady );
		});
	},

	/**
	 * Issues a seek to the playerElement
	 *
	 * @param {Float}
	 *			percentage Percentage of total stream length to seek to
	 */
	seek : function(percentage) {
		var _this = this;
		var seekTime = percentage * this.getDuration();
		this.getPlayerElement();
		mw.log( 'EmbedPlayerKalturaKplayer:: seek: ' + percentage + ' time:' + seekTime );
		if (this.supportsURLTimeEncoding()) {

			// Make sure we could not do a local seek instead:
			if (!(percentage < this.bufferedPercent
					&& this.playerElement.duration && !this.didSeekJump)) {
				// We support URLTimeEncoding call parent seek:
				this.parent_seek( percentage );
				return;
			}
		}
		if ( this.playerJsReady ) {
			this.seeking = true;
			// trigger the html5 event:
			$( this ).trigger( 'seeking' );

			// Issue the seek to the flash player:
			this.playerElement.sendNotification('doSeek', seekTime);

			// Include a fallback seek timer: in case the kdp does not fire 'playerSeekEnd'
			var orgTime = this.flashCurrentTime;
			var seekInterval = setInterval( function(){
				if( _this.flashCurrentTime != orgTime ){
					_this.seeking = false;
					clearInterval( seekInterval );
					$( this ).trigger( 'seeked' );
				}
			}, mw.getConfig( 'EmbedPlayer.MonitorRate' ) );

		} else if ( percentage != 0 ) {
			// try to do a play then seek:
			this.doPlayThenSeek(percentage);
		}

		// Run the onSeeking interface update
		this.layoutBuilder.onSeek();
	},

	/**
	 * Seek in a existing stream
	 *
	 * @param {Float}
	 *			percentage Percentage of the stream to seek to between 0 and 1
	 */
	doPlayThenSeek : function(percentage) {
		mw.log('EmbedPlayerKplayer::doPlayThenSeek::');
		var _this = this;
		// issue the play request
		this.play();

		// let the player know we are seeking
		_this.seeking = true;
		$( this ).trigger( 'seeking' );

		var getPlayerCount = 0;
		var readyForSeek = function() {
			_this.getPlayerElement();
			// if we have duration then we are ready to do the seek ( flash can't
			// seek untill there is some buffer )
			if ( _this.playerJsReady && _this.getDuration() && _this.bufferedPercent) {
				var seekTime = percentage * _this.getDuration();
				// Issue the seek to the flash player:
				_this.playerElement.sendNotification('doSeek', seekTime);
			} else {
				// Try to get player for 20 seconds:
				if (getPlayerCount < 400) {
					setTimeout(readyForSeek, 50);
					getPlayerCount++;
				} else {
					mw.log('Error: doPlayThenSeek failed');
				}
			}
		};
		readyForSeek();
	},

	/**
	 * Issues a volume update to the playerElement
	 *
	 * @param {Float}
	 *			percentage Percentage to update volume to
	 */
	setPlayerElementVolume : function(percentage) {
		if ( this.playerJsReady ) {
			this.playerElement.sendNotification( 'changeVolume', percentage );
		}
	},

	/**
	 * function called by flash at set interval to update the playhead.
	 */
	onUpdatePlayhead : function( playheadValue ) {
		if ( this.seeking ) {
			this.seeking = false;
		}
		this.flashCurrentTime = playheadValue;
		$( this ).trigger( 'timeupdate' );
	},

	/**
	 * function called by flash when the total media size changes
	 */
	onBytesTotalChange : function( data, id ) {
		this.bytesTotal = data.newValue;
	},

	/**
	 * function called by flash applet when download bytes changes
	 */
	onBytesDownloadedChange : function( data, id ) {
		this.bytesLoaded = data.newValue;
		this.bufferedPercent = this.bytesLoaded / this.bytesTotal;
		// Fire the parent html5 action
		$( this ).trigger( 'updateBufferPercent', this.bufferedPercent );
	},

	onPlayerSeekEnd : function () {
		$( this ).trigger( 'seeked' );
		if( seekInterval  ) {
			clearInterval( seekInterval );
		}
	},

	onSwitchingChangeStarted : function ( data, id ) {
		$( this ).trigger( 'sourceSwitchingStarted' );
	},

	onSwitchingChangeComplete : function ( data, id ) {
		this.mediaElement.setSourceByIndex ( data.newIndex );
	},

	onFlavorsListChanged : function ( data, id ) {
		var flavors = data.flavors;
		if ( flavors && flavors.length > 1 ) {
			this.setKDPAttribute( 'sourceSelector' , 'visible', true);	
		}
		this.replaceSources( flavors );
		
		//this.mediaElement.setSourceByIndex( 0 );
	},

	onLiveEntry : function ( data, id ) {
		if ( this.cancelLiveAutoPlay ) {
			this.getPlayerElement().setKDPAttribute( 'configProxy.flashvars', 'autoPlay', 'false');
		}
		this.triggerHelper( 'liveStreamStatusUpdate', { 'onAirStatus' : false } );
	},

	onLiveStreamReady: function ( data, id ) {
		//first time the livestream is ready
		this.triggerHelper( 'liveStreamStatusUpdate', { 'onAirStatus' : true } );
		if ( this.cancelLiveAutoPlay ) {
			this.cancelLiveAutoPlay = false;
			//fix misleading player state after we cancelled autoplay
			$( this ).trigger( "onpause" );
		}
	},

	onEnableGui : function ( data, id ) {
		if ( data.guiEnabled === false ) {
			this.disablePlayControls();
		} else {
			this.enablePlayControls();
		}			
	},

	/**
	 * Get the embed player time
	 */
	getPlayerElementTime : function() {
		// update currentTime
		return this.flashCurrentTime;
	},

	/**
	 * Get the embed fla object player Element
	 */
	getPlayerElement : function() {
		this.playerElement = document.getElementById( this.pid );
		return this.playerElement;
	},

	/**
	* Get the URL to pass to KDP according to the current streamerType
	*/
	getEntryUrl : function() {
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
	getPlaymanifestArg : function ( argName, argKey ) {
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
	switchSrc : function ( source ) {
		if ( this.playerJsReady ) {
			//http requires source switching, all other switch will be handled by OSMF in KDP
			if ( this.streamerType == 'http' && ! this.forceDynamicStream ) { 
				//other streamerTypes will update the source upon "switchingChangeComplete"
				this.mediaElement.setSource ( source );
				this.playerElement.setKDPAttribute ('mediaProxy', 'entryUrl', this.getEntryUrl());
			}
			this.playerElement.sendNotification('doSwitch', { flavorIndex: this.getSourceIndex( source ) });
		} else {
			this.selectedFlavorIndex = sourceIndex;
			this.mediaElement.setSource ( source );
		}
	},
	canAutoPlay: function() {
		return true;
	},
	backToLive: function() {
		if ( this.playerJsReady ) {
			this.playerElement.sendNotification('goLive');
		}
	}
};

} )( mediaWiki, jQuery );

/*
 * jQuery Tools 1.2.5 - The missing UI library for the Web
 *
 * [toolbox.flashembed]
 *
 * NO COPYRIGHTS OR LICENSES. DO WHAT YOU LIKE.
 *
 * http://flowplayer.org/tools/
 *
 * File generated: Fri Oct 22 13:51:38 GMT 2010
 */
(function(){function f(a,b){if(b)for(var c in b)if(b.hasOwnProperty(c))a[c]=b[c];return a}function l(a,b){var c=[];for(var d in a)if(a.hasOwnProperty(d))c[d]=b(a[d]);return c}function m(a,b,c){if(e.isSupported(b.version))a.innerHTML=e.getHTML(b,c);else if(b.expressInstall&&e.isSupported([6,65]))a.innerHTML=e.getHTML(f(b,{src:b.expressInstall}),{MMredirectURL:location.href,MMplayerType:"PlugIn",MMdoctitle:document.title});else{if(!a.innerHTML.replace(/\s/g,"")){a.innerHTML="<h2>Flash version "+b.version+
" or greater is required</h2><h3>"+(g[0]>0?"Your version is "+g:"You have no flash plugin installed")+"</h3>"+(a.tagName=="A"?"<p>Click here to download latest version</p>":"<p>Download latest version from <a href='"+k+"'>here</a></p>");if(a.tagName=="A")a.onclick=function(){location.href=k}}if(b.onFail){var d=b.onFail.call(this);if(typeof d=="string")a.innerHTML=d}}if(i)window[b.id]=document.getElementById(b.id);f(this,{getRoot:function(){return a},getOptions:function(){return b},getConf:function(){return c},
getApi:function(){return a.firstChild}})}var i=document.all,k="http://www.adobe.com/go/getflashplayer",n=typeof jQuery=="function",o=/(\d+)[^\d]+(\d+)[^\d]*(\d*)/,j={width:"100%",height:"100%",id:"_"+(""+Math.random()).slice(9),allowfullscreen:true,allowscriptaccess:"always",quality:"high",version:[3,0],onFail:null,expressInstall:null,w3c:false,cachebusting:false};window.attachEvent&&window.attachEvent("onbeforeunload",function(){__flash_unloadHandler=function(){};__flash_savedUnloadHandler=function(){}});
window.flashembed=function(a,b,c){if(typeof a=="string")a=document.getElementById(a.replace("#",""));if(a){if(typeof b=="string")b={src:b};return new m(a,f(f({},j),b),c)}};var e=f(window.flashembed,{conf:j,getVersion:function(){var a,b;try{b=navigator.plugins["Shockwave Flash"].description.slice(16)}catch(c){try{b=(a=new ActiveXObject("ShockwaveFlash.ShockwaveFlash.7"))&&a.GetVariable("$version")}catch(d){try{b=(a=new ActiveXObject("ShockwaveFlash.ShockwaveFlash.6"))&&a.GetVariable("$version")}catch(h){}}}return(b=
o.exec(b))?[b[1],b[3]]:[0,0]},asString:function(a){if(a===null||a===undefined)return null;var b=typeof a;if(b=="object"&&a.push)b="array";switch(b){case "string":a=a.replace(new RegExp('(["\\\\])',"g"),"\\$1");a=a.replace(/^\s?(\d+\.?\d+)%/,"$1pct");return'"'+a+'"';case "array":return"["+l(a,function(d){return e.asString(d)}).join(",")+"]";case "function":return'"function()"';case "object":b=[];for(var c in a)a.hasOwnProperty(c)&&b.push('"'+c+'":'+e.asString(a[c]));return"{"+b.join(",")+"}"}return String(a).replace(/\s/g,
" ").replace(/\'/g,'"')},getHTML:function(a,b){a=f({},a);var c='<object width="'+a.width+'" height="'+a.height+'" id="'+a.id+'" name="'+a.id+'"';if(a.cachebusting)a.src+=(a.src.indexOf("?")!=-1?"&":"?")+Math.random();c+=a.w3c||!i?' data="'+a.src+'" type="application/x-shockwave-flash"':' classid="clsid:D27CDB6E-AE6D-11cf-96B8-444553540000"';c+=">";if(a.w3c||i)c+='<param name="movie" value="'+a.src+'" />';a.width=a.height=a.id=a.w3c=a.src=null;a.onFail=a.version=a.expressInstall=null;for(var d in a)if(a[d])c+=
'<param name="'+d+'" value="'+a[d]+'" />';a="";if(b){for(var h in b)if(b[h]){d=b[h];a+=h+"="+(/function|object/.test(typeof d)?e.asString(d):d)+"&"}a=a.slice(0,-1);c+='<param name="flashvars" value=\''+a+"' />"}c+="</object>";return c},isSupported:function(a){return g[0]>a[0]||g[0]==a[0]&&g[1]>=a[1]}}),g=e.getVersion();if(n){jQuery.tools=jQuery.tools||{version:"1.2.5"};jQuery.tools.flashembed={conf:j};jQuery.fn.flashembed=function(a,b){return this.each(function(){$(this).data("flashembed",flashembed(this,
a,b))})}}})();
