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
	
	// The current ad Slot type by default "managed" i.e doubleClick manages the player sequence. 
	currentAdSlotType : null,

	init: function( embedPlayer, callback ){
		this.embedPlayer = embedPlayer;
		
		// Inherit BaseAdPlugin
		mw.inherit( this, new mw.BaseAdPlugin( embedPlayer, callback ) );
		
		// Determine if we are in managed or kaltura point based mode. 
		if( this.getConfig( "preSequence" ) && this.getConfig( "adTagUrl" ) ){
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
		mw.log( "DoubleClick::addManagedBinding" );
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
		var _this = this;
		// Add a binding for cuepoints:
		_this.embedPlayer.bindHelper( 'KalturaSupport_AdOpportunity' + _this.bindPostfix, function( event,  cuePointWrapper ){
			var cuePoint = cuePointWrapper.cuePoint;
			// Check if trackCuePoints has been disabled 
			if( _this.getConfig( 'trackCuePoints') === false){
				return ;
			}
			
			// Check that the cue point is protocolType = 0 and cuePointType == adCuePoint.Ad
			if( cuePoint.protocolType !== 0 || cuePoint.cuePointType != 'adCuePoint.Ad' ){
				return ;
			}
			// Check if we have a provider filter:
			var providerFilter = _this.getConfig('provider');
			if( providerFilter && cuePoint.tags.toLowerCase().indexOf( providerFilter.toLowerCase() ) === -1 ){
				// skip the cuepoint that did not match the provider filter
				mw.log( "mw.DoubleClick:: skip cuePoint with tag: " + cuePoint.tags + ' != ' + providerFilter );
				return ;
			}
			
			// Get the ad type for each cuepoint
			var adType = _this.embedPlayer.kCuePoints.getRawAdSlotType( cuePoint );
			
			mw.log("DoubleClick:: AdOpportunity:: " + cuePoint.startTime + ' ad type: ' + adType);
			if( adType == 'overlay' ){
				_this.loadAndDisplayOverlay( cuePoint );
				return true; // continue to next cue point
			}
			
			// Check if video type: 
			if( adType == 'midroll'  ||  adType == 'preroll' || adType == 'postroll'  ){
				_this.currentAdSlotType = adType;
				// All cuepoints act as "midrolls" 
				_this.requestAds( cuePoint.sourceUrl );
			}
		});
	},
	/**
	 * Load and display an overlay 
	 * @param cuePoint
	 * @return
	 */
	loadAndDisplayOverlay: function( cuePoint ){
		var _this = this;
		// Don't display overlays if in an ad: 
		if( this.embedPlayer.evaluate('{sequenceProxy.isInSequence}') ){
			return ;
		}
		// Request the ad ( will trigger the currentAdCallback and onResumeRequestedCallback when done )
		_this.requestAds( cuePoint.sourceUrl, 'overlay' );
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
	requestAds: function( adTagUrl, adType ) {
		var _this = this;
		// Create ad request object.
		var adRequest = {};
		adRequest.adTagUrl = adTagUrl;
		if( adType ){
			adRequest['adType'] = adType;
		}
		// Make sure the  this.getAdDisplayContainer() is created as part of the initial ad request:
		this.getAdDisplayContainer();
		
		
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
		mw.log( 'DoubleClick:: onAdsManagerLoaded' );

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
				false 
			);
		}
		
		// Add error listener: 
		_this.adsManager.addEventListener(
			google.ima.AdErrorEvent.Type.AD_ERROR,
			function( event ){ _this.onAdError( event ) },
			false
		);
		
		// Add ad listeners: 
		adsListener( 'CLICK' );
		adsListener( 'CONTENT_PAUSE_REQUESTED', function(){
			// if we are not already in a sequence setup the player for ad playback: 
			if( ! _this.embedPlayer.sequenceProxy.isInSequence ){
				_this.embedPlayer.pauseLoading();
				_this.embedPlayer.adTimeline.updateUiForAdPlayback( _this.currentAdSlotType );
			}
		} );
		adsListener( 'LOADED', function(){
			var size = _this.getPlayerSize();
			_this.adsManager.resize( size.width, size.height, google.ima.ViewMode.NORMAL );	
			// Hide player content
			_this.hideContent();
			// show the loading spinner until we start ad playback
			_this.embedPlayer.addPlayerSpinner();
			// if on iPad hide the quicktime logo: 
			_this.hideIpadPlayerOffScreen();
		} );
		adsListener( 'STARTED', function(){
			// hide spinner: 
			_this.embedPlayer.hidePlayerSpinner();
			
			// if on iPad hide restore player from quicktime logo hide: 
			_this.restoreIpadPlayerOnScreen();
			
			// set ad playing flag: 
			_this.adPlaying = true;
			_this.embedPlayer.sequenceProxy.isInSequence = true;
			
			// Monitor ad progress ( for sequence proxy )
			_this.monitorAdProgress();
		} );
		adsListener( 'PAUSED' );
		adsListener( 'FIRST_QUARTILE' );
		adsListener( 'MIDPOINT' );
		adsListener( 'THIRD_QUARTILE' );
		adsListener( 'COMPLETE', function(){
			// the current ad is complete hide offscreen ( until next ad plays ) 
			_this.hideIpadPlayerOffScreen();
		});
		// Resume content:
		adsListener( 'CONTENT_RESUME_REQUESTED', function(){
			_this.restorePlayer();
		});
		adsListener( 'ALL_ADS_COMPLETED', function(){
			_this.restorePlayer();
		});
	},
	getPlayerSize: function(){
		return {
			'width': this.embedPlayer.$interface.width(),
			'height': this.embedPlayer.getPlayerHeight() 
		}
	},
	/**
	 * iPad displays a quicktime logo while loading, this helps hide that
	 */
	hideIpadPlayerOffScreen:function(){
		$( this.getAdContainer() ).find('video').css({
			'position' : 'absolute', 
			'left': '-4048px'
		})
	},
	restoreIpadPlayerOnScreen:function(){
		$( this.getAdContainer() ).find('video').css( 'left', '0px');
	},
	hideContent: function(){
		var _this = this;
		// show the ad container: 
		$( this.getAdContainer() ).show();
		// hide content:
		$( this.getContent() ).hide();
	},
	showContent: function(){
		// show content
		$( this.getContent() ).show();
		// hide the ad container: 
		$( this.getAdContainer() ).hide();
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
			// update 'timeRemaining' and duration for no-ad ) 
			_this.embedPlayer.adTimeline.updateSequenceProxy( 'timeRemaining',  null );
			_this.embedPlayer.adTimeline.updateSequenceProxy( 'duration', null );
			return ;
		}
		// Update sequence property per active ad: 
		_this.embedPlayer.adTimeline.updateSequenceProxy( 'timeRemaining',  _this.adsManager.getRemainingTime() );
		var $adVid = $( _this.getAdContainer() ).find( 'video' );
		if( $adVid.length ){
			var vid = $adVid.get(0);
			_this.embedPlayer.adTimeline.updateSequenceProxy( 'duration',  vid.duration );
			_this.embedPlayer.triggerHelper( 'AdSupport_AdUpdatePlayhead', vid.currentTime );
			
			// TODO player interface updates should be configurable see Mantis 14076 and 14019
			_this.embedPlayer.controlBuilder.setStatus( 
					mw.seconds2npt( vid.currentTime ) + '/' + mw.seconds2npt( vid.duration ) 
			);
			_this.embedPlayer.updatePlayHead( vid.currentTime / vid.duration );
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
		this.embedPlayer.sequenceProxy.isInSequence = true;
		
		// iOS can't play a new video with an active one in the dom: 
		// remove the ad video tag ( before trying to restore player ) 
		var $adVid = $( this.getAdContainer() ).find('video');
		var adSrc = $adVid.attr('src');
		var adStyle = $adVid.attr('style');
		var $adVidParent = 	$adVid.parent();
		$adVid.remove();
		
		// show the content:
		this.showContent();
		// remove any in Ad Bindings
		this.embedPlayer.unbindHelper( this.inAdBindPostFix );
		if( this.restorePlayerCallback  ){
			this.restorePlayerCallback();
			this.restorePlayerCallback = null;
		} else {
			// stop ad playback: 
			this.embedPlayer.adTimeline.restorePlayer();
			// managed midroll ( just play content directly )
			this.embedPlayer.play();
		}
		setTimeout(function(){
			// after we have issued play we can restore an uninitialized ad video: 
			$adVidParent.prepend( $('<video />').attr({
				'src': adSrc,
				'style' : adStyle
				}) 
			);
		}, 1000 );
	},
	/**
	 * TODO should be provided by the generic ad plugin class. 
	 */
	getConfig: function( attrName ){
		// always get the config from the embedPlayer so that is up-to-date
		return this.embedPlayer.getKalturaConfig( 'doubleClick', attrName );
	}
};
	
})( window.mw, jQuery);
