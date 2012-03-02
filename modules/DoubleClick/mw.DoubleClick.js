( function( mw, $ ) { "use strict";

mw.DoubleClick = function( embedPlayer, callback ){
	this.init( embedPlayer, callback);
};
mw.DoubleClick.prototype = {
	// The bind postfix to keep track of doubleclick bindings. 
	bindPostfix: '.DoubleClick',
	
	// in ad bindings:
	inAdBindPostFix: '.DoubleClickInAd',
	
	// The content video element.
	content: null,
	
	// Global volume holder.
	globalVolume : 1,

	// IMA SDK Ad Loader.
	adsLoader : null,
	// IMA SDK Ad Manager.
	adsManager: null,

	// Status variables for ad and content playback.
	adPlaying: false,
	contentPlaying: false,
	adDuration: null,
	demoStartTime: null,

	init: function( embedPlayer, callback ){
		this.embedPlayer = embedPlayer;
		
		// Inherit BaseAdPlugin
		mw.inherit( this, new mw.BaseAdPlugin( embedPlayer, callback ) );
		
		// Determine if we are in managed or kaltura point based mode. 
		if( this.getConfig("preSequence") && this.getConfig("adTagUrl") ){
			// managed:
			this.addManagedBinding();
		} else {
			// add cuepoint bindings
			this.addKalturaCuePointBindings();
		}
		// Load double click ima library and issue the callback: 
		$.getScript('http://www.google.com/jsapi', function(){
			google.load("ima", "3", {
				"callback" : function(){
					if( callback ){
						callback();
					}
				}
			});
		});
	},
	addManagedBinding: function(){
		var _this = this;
		_this.embedPlayer.bindHelper( 'AdSupport_preroll' + _this.bindPostfix, function( event, sequenceProxy ){
			// Add the slot to the given sequence proxy target target
			sequenceProxy[ _this.getSequenceIndex( 'preroll' ) ] = function( callback ){
				// Setup the restore callback
				_this.restorePlayerCallback = callback;
				// Request ads
				_this.requestAds( unescape( _this.getConfig("adTagUrl") ) );	
			};
		});
	},
	// get the content video tag
	getContent:function(){
		// Set the content element to player element: 
		return this.embedPlayer.getPlayerElement();
	},
	addKalturaCuePointBindings: function(){
		// cue points here
	},
	getAdContainer: function(){
		var adContainerId ='adContainer' + this.embedPlayer.id;
		if( !$('#' + adContainerId ).length ){
			$( this.getContent() ).after( 
				$('<div />')
					.attr( 'id',  adContainerId )
					.css({
						'position' : 'absolute',
						'top' : '0px',
						'left' : '0px'
					})
			)
		}
		return $('#' + adContainerId ).get(0);
	},
	getAdDisplayContainer: function(){
		//  Create the ad display container. Use an existing DOM element
		//	to house the ad display container. Ideally, the element is
		//	positioned above the content video player, so the ads are
		//	displayed correctly.
		//
		if( ! this.adDisplayContainer ){
			this.adDisplayContainer = new google.ima.AdDisplayContainer(
				this.getAdContainer(),
				this.getContent()
			);
		}
		return this.adDisplayContainer;
	},
	// Various initialization activities of the content video element.
	initContent:function() {
		// It is required to send the content complete event at the end of
		// content playback.
		//content.addEventListener('ended', function() {
		//	adsLoader.contentComplete();
		//});

		// Initialize the monitoring of the video playback progress.
		//setInterval(onVideoTimeUpdate, 300);
	},
	
	 // This function requests the ads.
	requestAds: function( adTagUrl, callback ) {
		var _this = this;
		// Create ad request object.
		var adRequest = {};
		adRequest.adTagUrl = adTagUrl;

		// Create ads loader.
		_this.adsLoader = new google.ima.AdsLoader();
		
		// Attach the events before making the request.
		_this.adsLoader.addEventListener(
			google.ima.AdsManagerLoadedEvent.Type.ADS_MANAGER_LOADED,
			function( event ){
				_this.onAdsManagerLoaded( event );
			},
			false);
		_this.adsLoader.addEventListener(
			 google.ima.AdErrorEvent.Type.AD_ERROR,
			 function(event ){
				 _this.onAdError( event );
			 },
			 false);

		mw.log('DoubleClick::requestAds > ' + adTagUrl );

		// 4. Make the request.
		_this.adsLoader.requestAds( adRequest );
	},
	// Handles the ads manager loaded event. In case of no ads, the AD_ERROR
	// event is issued and error handler is invoked.
	onAdsManagerLoaded: function( loadedEvent ) {
		var _this = this;
		mw.log('DoubleClick:: onAdsManagerLoaded');

		// 1. Retrieve the ads manager. Regardless of ad type (video ad,
		//	overlay or ad playlist controlled by ad rules), the API is the
		//	same.
		//
		// It is required to pass in the ad display container created
		// previously and the content element, so the SDK can track content
		// and play ads automatically.
		_this.adsManager = loadedEvent.getAdsManager( this.getAdDisplayContainer(), this.getContent() );

		// Add Ad Manager Listeners 
		_this.addAdMangerListeners();

		// Add embedPlayer listeners:
		_this.addEmbedPlayerListeners();
		
		// Initialize the ads manager. In case of ad playlist with a preroll,
		// the preroll will start playing immediately.
		_this.adsManager.init( _this.embedPlayer.getWidth(), _this.embedPlayer.getHeight(), google.ima.ViewMode.NORMAL);
		_this.adsManager.setVolume( _this.embedPlayer.getPlayerElementVolume() );
		// Start the ad playback. For video and overlay ads, this will
		// start the ads. For automatic ad rules controller ads, this will be
		// ignored.
		mw.log( "DoubleClick::adsManager.play" );
		_this.adsManager.start();
	},
	addAdMangerListeners: function(){
		var _this = this;
		var adsListener = function( eventType, callback ){
			_this.adsManager.addEventListener(
					google.ima.AdEvent.Type[ eventType ],
					function( event ){
						mw.log( "DoubleClick::AdsEvent:" + eventType );
						if( callback )
							callback( event );
					},
					false );
		}
		
		// Add error listener: 
		_this.adsManager.addEventListener(
			google.ima.AdErrorEvent.Type.AD_ERROR,
			function( event ){ _this.onAdError( event ) },
			false
		);
		
		// Add ad listeners: 
		adsListener( 'CLICK' );
		adsListener( 'CONTENT_PAUSE_REQUESTED' );
		adsListener( 'CONTENT_RESUME_REQUESTED');
		adsListener( 'LOADED', function(){
			_this.adsManager.resize( _this.embedPlayer.getWidth(), _this.embedPlayer.getHeight(), google.ima.ViewMode.NORMAL );
		} );
		adsListener( 'STARTED', function(){
			_this.adPlaying = true;
			// hide content: 
			$( _this.getContent() ).hide();
			// Monitor ad progress ( for sequence proxy )
			_this.monitorAdProgress();
		} );
		adsListener( 'PAUSED' );
		adsListener( 'FIRST_QUARTILE' );
		adsListener( 'MIDPOINT' );
		adsListener( 'THIRD_QUARTILE' );
		adsListener( 'COMPLETE' );
		adsListener( 'ALL_ADS_COMPLETED', function(){
			// hide the ad container: 
			$( _this.getAdContainer() ).hide();
			// show the content:
			$( _this.getContent() ).show();
		});
	},
	addEmbedPlayerListeners: function(){
		var _this = this;
		var embedPlayer = this.embedPlayer;
		
		embedPlayer.bindHelper( 'onResizePlayer' + this.inAdBindPostFix, function( event, size, animate ) {
			mw.log("DoubleClick::onResizePlayer: size:" + size.width + ' x ' + size.height );
			// Resize the ad manager on player resize: ( no support for animate )
			_this.adsManager.resize(size.width, size.height, google.ima.ViewMode.NORMAL);
		});
		
		embedPlayer.bindHelper( 'volumeChanged' + this.inAdBindPostFix, function(event, percent){
			mw.log("DoubleClick::volumeChanged:" + percent );
			_this.adsManager.setVolume( percent );
		});
		
		// May have to fix these bindings to support pause play on ads. 
		embedPlayer.bindHelper( 'onpause' + this.inAdBindPostFix, function( event, percent){
			mw.log("DoubleClick::onpause:" + percent );
			_this.adsManager.pause();
		});
		embedPlayer.bindHelper( 'onplay' + this.inAdBindPostFix, function( event, percent){
			mw.log("DoubleClick::onplay:" + percent );
			_this.adsManager.resume();
		});
	},
	monitorAdProgress: function(){
		var _this = this;
		// check if we are still playing an ad:
		if( !_this.adPlaying ){
			return ;
		}
		// Keep monitoring ad progress at MonitorRate as long as ad is playing: 
		setTimeout( function(){
			_this.monitorAdProgress();
		}, mw.getConfig( 'EmbedPlayer.MonitorRate' ) );
	},
	// Handler for various ad errors.
	onAdError: function( errorEvent ) {
		mw.log('DoubleClick:: onAdError: ' + errorEvent.getError() );
		if (this.adsManager) {
			this.adsManager.unload();
		}
		this.restorePlayer();
	},
	restorePlayer: function(){
		this.adPlaying = false;
		// remove any in Ad Bindings
		this.unbindHelper( this.inAdBindPostFix );
		if( this.restorePlayerCallback  ){
			this.restorePlayerCallback();
		}
	},
/*
	// Start button click handler.
	function start() {
		demoStartTime = Date.now();
		initAd();
		initContent();
		requestAds();
	}

	// Pause button click handler.
	function pause() {
		if (adPlaying) {
		adsManager.pause();
		} else {
		content.pause();
		}
	}

	// Resume button click handler.
	function resume() {
		if (adPlaying) {
		adsManager.resume();
		} else {
		content.play();
		}
	}

	// Mute button handler.
	function mute() {
		globalVolume = 0;
		if (adPlaying) {
		adsManager.setVolume(globalVolume);
		} else {
		content.volume = globalVolume;
		}
	}

	 

	

	// Handler for the various VAST ad events the SDK sends.
	function onAdEvent(adEvent) {
		log('Ad event: ' + adEvent.type);
		switch(adEvent.type) {
		case google.ima.AdEvent.Type.LOADED:
			adsManager.resize(playerWidth, playerHeight, google.ima.ViewMode.NORMAL);
			break;
		case google.ima.AdEvent.Type.STARTED:
			adPlaying = true;
			break;
		case google.ima.AdEvent.Type.COMPLETE:
			adDuration = null;
			adPlaying = false;
			break;
		case google.ima.AdEvent.Type.ALL_ADS_COMPLETED:
			document.getElementById('adContainer').visibility = 'hidden';
			break;
		}
	}


	// Handler for the CONTENT_PAUSE_REQUESTED event.
	function onContentPauseRequested() {
		log('Content pause requested.');
		if (contentPlaying) {
		log('Pausing content.');
		content.pause();
		if (isSmallScreenIOS()) {
			content.webkitExitFullscreen();
		}
		contentPlaying = false;
		}
	}

	// Handler for the CONTENT_RESUME_REQUESTED event.
	function onContentResumeRequested() {
		log('Content resume requested.');
		if (!contentPlaying) {
		log('Resuming content.');
		content.play();
		contentPlaying = true;
		}
	}

	// Displays the current time of the video.
	function onVideoTimeUpdate() {
		var time;
		var duration;
		if (adPlaying) {
		var d = adsManager.getRemainingTime();
		document.getElementById('progress').innerHTML =
			'Resume in: ' + formatTime(Math.ceil(d));
		} else {
		time = Math.floor(content.currentTime);
		duration = Math.floor(content.duration);
		document.getElementById('progress').innerHTML =
			formatTime(time) + ' / ' + formatTime(duration);
		}
	}
*/

	/**
	 * TODO should be provided by the generic plugin class. 
	 */
	getConfig: function( attrName ){
		// always get the config from the embedPlayer so that is up-to-date
		return this.embedPlayer.getKalturaConfig( 'doubleClick', attrName );
	}
};
	
})( window.mw, jQuery);
