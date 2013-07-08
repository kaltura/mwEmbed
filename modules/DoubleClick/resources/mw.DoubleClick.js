( function( mw, $ ) { "use strict";

mw.DoubleClick = function( embedPlayer, callback, pluginName ){
	this.init( embedPlayer, callback, pluginName);
};
mw.DoubleClick.prototype = {
	// The bind postfix to keep track of doubleclick bindings.
	bindPostfix: '.DoubleClick',

	// The content video element.
	content: null,

	// Global volume holder.
	globalVolume : 1,

	// IMA SDK Ad Loader.
	adsLoader : null,
	// IMA SDK Ad Manager.
	adsManager: null,

	// Status variables for ad and content playback.
	adActive: false,
	// if the current ad is paused:
	adPaused: false,

	// The monitor interval index:
	adMonitor: null,

	// store the ad start time
	adPreviousTimeLeft: null,
	contentPlaying: false,
	adDuration: null,
	demoStartTime: null,

	// Flags for a fallback check for all ads completed .
	contentDoneFlag: null,

	// Flag for starting ad playback sequence:
	startedAdPlayback: null,

	allAdsCompletedFlag: null,


	// The current ad Slot type by default "managed" i.e doubleClick manages the player sequence.
	currentAdSlotType : null,

	init: function( embedPlayer, callback, pluginName ){
		var _this = this;

		this.embedPlayer = embedPlayer;

		// Inherit BaseAdPlugin
		mw.inherit( this, new mw.BaseAdPlugin( embedPlayer, callback ) );

		// Set the plugin name
		this.pluginName = pluginName;

		// reset the contentDoneFlag flags:
		this.contentDoneFlag = null;
		this.allAdsCompletedFlag = null;

		// remove any old bindings:
		embedPlayer.unbindHelper( this.bindPostfix );

		// make sure any old ad Manager is unloaded:
		var globalAdsManger = $(_this.embedPlayer).data( 'doubleClickAdsMangerRef' );
		if( globalAdsManger ){
			mw.log( "DoubleClick::unload old adManger" );
			if ( $.isFunction( globalAdsManger.unload ) ) {
				globalAdsManger.unload();
			}
			if( $('#' + this.getAdContainerId() ).length ){
				$('#' + this.getAdContainerId() ).remove();
			}
		}

		// Load double click ima per doc:
		this.loadIma( function(){
			// Determine if we are in managed or kaltura point based mode.
			if( _this.getConfig( "preSequence" ) && _this.getConfig( "adTagUrl" ) ){
				// Check for adPattern
				if( _this.getConfig( 'adPattern' ) ){
					var adIndex = _this.getAdPatternIndex();
					mw.log( "DoubleClick:: adPattern: " + _this.getConfig( 'adPattern' ) +
							" on index: " + adIndex );
					if( adIndex == 'A' ){
						// Managed bindings
						_this.addManagedBinding();
					}
				} else {
					// No defined ad pattern always use managed bindings
					_this.addManagedBinding();
				}
			} else {
				// Add cuepoint bindings
				_this.addKalturaCuePointBindings();
			}
			// Issue the callback to continue player build out:
			callback();
		}, function( errorCode ){
			mw.log( "Error::DoubleClick Loading Error: " + errorCode );
			// Don't add any bindings directly issue callback:
			callback();
		});
	},
	/**
	 * Get the global adPattern index:
	 */
	getAdPatternIndex:function(){
		var adPattern = this.getConfig( 'adPattern' );
		var currentAdIndex = $( this.embedPlayer ).data('DcAdPatternIndex');
		if( typeof currentAdIndex === 'undefined' ){
			currentAdIndex = 0;
		} else{
			// increment the index
			currentAdIndex++
			// index is past adPattern length reset to 0
			if( currentAdIndex > adPattern.length -1 ){
				currentAdIndex = 0;
			}
		}
		// update add index:
		$( this.embedPlayer ).data('DcAdPatternIndex', currentAdIndex);
		// return the adPattern index:
		return adPattern[currentAdIndex];
	},
	/**
	 * Load the google IMA library:
	 */
	loadIma:function( successCB, failureCB ){
		$.getScript( '//s0.2mdn.net/instream/html5/ima3.js', function() {
			successCB();
		} )
		.fail( function( jqxhr, settings, errorCode ) {
			failureCB( errorCode );
		} );
	},
	addManagedBinding: function(){
		var _this = this;
		mw.log( "DoubleClick::addManagedBinding" );
		_this.embedPlayer.bindHelper( 'AdSupport_preroll' + _this.bindPostfix, function( event, sequenceProxy ){
			// Add the slot to the given sequence proxy target target
			sequenceProxy[ _this.getSequenceIndex( 'preroll' ) ] = function( callback ){
				// if a preroll set it as such:
				_this.currentAdSlotType = 'preroll';
				// Setup the restore callback
				_this.restorePlayerCallback = callback;
				// Request ads
				mw.log( "DoubleClick:: addManagedBinding : requestAds:" +  _this.getConfig( 'adTagUrl' )  );
				_this.requestAds( _this.getConfig( 'adTagUrl' ) );
			};
		});
		_this.embedPlayer.bindHelper( 'AdSupport_postroll' + _this.bindPostfix, function( event, sequenceProxy ){
			sequenceProxy[ _this.getSequenceIndex( 'postroll' ) ] = function( callback ){
				// Setup the restore callback
				_this.restorePlayerCallback = callback;

				// set content complete flag
				_this.contentDoneFlag = true;

				// set current slot to postRoll
				_this.currentAdSlotType = 'postroll';

				// trigger the double click end sequence:
				_this.adsLoader.contentComplete();
			};
		});
	},
	/**
	 * Get the content video tag
	 */
	getContent:function(){
		// Set the content element to player element:
		return this.embedPlayer.getPlayerElement();
	},
	addKalturaCuePointBindings: function(){
		var _this = this;
		mw.log("DoubleClick::addKalturaCuePointBindings");
		// Add a binding for cuepoints:
		_this.embedPlayer.bindHelper( 'KalturaSupport_AdOpportunity' + _this.bindPostfix, function( event,  cuePointWrapper ){
			mw.log( "DoubleClick:: evaluate ad oppertunity");
			var cuePoint = cuePointWrapper.cuePoint;
			// Check if trackCuePoints has been disabled
			if( _this.getConfig( 'trackCuePoints') === false){
				mw.log( "DoubleClick:: trackCuePoints is false");
				return ;
			}

			// Check that the cue point is protocolType = 0 and cuePointType == adCuePoint.Ad
			if( cuePoint.protocolType !== 0 || cuePoint.cuePointType != 'adCuePoint.Ad' ){
				mw.log( "DoubleClick:: cuePoint protocol != 0 or type != adCuePoint.ad" );
				return ;
			}

			// Check if we have a provider filter:
			var providerFilter = _this.getConfig('provider');
			if( providerFilter && cuePoint.tags.toLowerCase().indexOf( providerFilter.toLowerCase() ) === -1 ){
				// skip the cuepoint that did not match the provider filter
				mw.log( "DoubleClick:: skip cuePoint with tag: " + cuePoint.tags + ' != ' + providerFilter );
				return ;
			}

			// Get the ad type for each cuepoint
			var adType = _this.embedPlayer.kCuePoints.getRawAdSlotType( cuePoint );

			mw.log( "DoubleClick:: AdOpportunity:: " + cuePoint.startTime + ' ad type: ' + adType );
			if( adType == 'overlay' ){
				_this.loadAndDisplayOverlay( cuePoint );
				return true; // continue to next cue point
			}
			// Update the ad slot type:
			_this.currentAdSlotType = adType;

			if( adType == 'preroll' || adType == 'postroll' ){
				_this.embedPlayer.bindHelper( 'AdSupport_' + adType + _this.bindPostfix, function( event, sequenceProxy ){
					// Add the slot to the given sequence proxy target target
					sequenceProxy[ _this.getSequenceIndex( adType ) ] = function( callback ){
						// Setup the restore callback
						_this.restorePlayerCallback = callback;
						// Request ads
						mw.log( "DoubleClick:: addManagedBinding : cuePoint:" +  adType );
						_this.requestAds( cuePoint.sourceUrl );
					};
				});
			}
			// If cuepoint ad type is midroll request inline:
			if( adType == 'midroll' ){
				// All cuepoints act as "midrolls"
				mw.log( "DoubleClick:: addKalturaCuePointBindings: midroll -> requestAds" );
				// pause the player while requesting adds
				_this.embedPlayer.pauseLoading();
				// request the ads:
				_this.requestAds( cuePoint.sourceUrl ) ;
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
		if( !$('#' + this.getAdContainerId() ).length ){
			this.embedPlayer.$interface.append(
				$('<div />')
					.attr( 'id',  this.getAdContainerId() )
					.css({
						'position' : 'absolute',
						'top' : '0px',
						'left' : '0px'
					})
			)
		}
		return $('#' + this.getAdContainerId() ).get(0);
	},
	getAdContainerId: function(){
		return 'adContainer' + this.embedPlayer.id;
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
	/**
	 * Adds custom params to ad url.
	 */
	addCustomParams: function( adUrl ){
		var postFix = this.getConfig( 'customParams' ) ?
				'cust_params=' + encodeURIComponent( this.getConfig( 'customParams' ) ) : '';
		if( postFix ){
			var paramSeperator = adUrl.indexOf( '?' ) === -1 ? '?' :
				adUrl[ adUrl.length -1 ] == '&' ? '': '&';

			return unescape( adUrl ) + paramSeperator + postFix;
		} else {
			return unescape( adUrl );
		}
	},
	// note in flash this is supported as a methods on adRequest:
	// https://developers.google.com/interactive-media-ads/docs/sdks/googleflashas3_apis#AdsRequest
	// but in html5
	// we have to do this manually:
	// https://developers.google.com/interactive-media-ads/docs/sdks/googlehtml5_apis#ima.SimpleAdsRequest
	addAdRequestParams: function( adTagUrl ){
		var _this = this;
		var paramSep =  adTagUrl.indexOf( '?' ) === -1 ? '?' : '&';
		var adRequestMap = {
			'contentId' : 'vid',
			'cmsId' : 'cmsid'
		}
		$.each( adRequestMap, function( uiconfId, paramId ){
			if( _this.getConfig( uiconfId) ){
				adTagUrl+= paramSep + paramId + '=' + encodeURIComponent( _this.getConfig( uiconfId ) );
				paramSep = '&';
			}
		});
		return adTagUrl;
	},
	// This function requests the ads.
	requestAds: function( adTagUrl, adType ) {
		var _this = this;
		// Add any custom params:
		adTagUrl = _this.addCustomParams( adTagUrl );

		// Add any adRequest mappings:
		adTagUrl = _this.addAdRequestParams( adTagUrl );

		mw.log( "DoubleClick::requestAds: url: " + adTagUrl );

		// Update the local lastRequestedAdTagUrl for debug and audits
		_this.embedPlayer.setKDPAttribute( this.pluginName, 'requestedAdTagUrl', adTagUrl );

		// Create ad request object.
		var adsRequest = {};
		adsRequest.adTagUrl = adTagUrl;
		if( adType ){
			adsRequest['adType'] = adType;
		}
		// Set the size in the adsRequest
		var size = _this.getPlayerSize();

		adsRequest.linearAdSlotWidth = size.width;
		adsRequest.linearAdSlotHeight = size.height;

		adsRequest.nonLinearAdSlotWidth = size.width;
		adsRequest.nonLinearAdSlotHeight = size.height;

		// Make sure the  this.getAdDisplayContainer() is created as part of the initial ad request:
		this.getAdDisplayContainer();

		// Create ads loader.
		_this.adsLoader = new google.ima.AdsLoader( _this.adDisplayContainer );

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

		// 4. Make the request.
		_this.adsLoader.requestAds( adsRequest );
	},
	isSiblingVideoAd: function(){
		return ( this.getConfig('videoTagSiblingAd') && ! mw.isIOS() );
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

		_this.adsManager = loadedEvent.getAdsManager( this.getContent()	);

		// add a global ad manager refrence:
		$( _this.embedPlayer ).data( 'doubleClickAdsMangerRef', _this.adsManager );

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
					if( $.isFunction( callback ) ){
						callback( event );
					}
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
		// A flag to protect against double ad start.
		var lastAdStartTime = null;

		// Add ad listeners:
		adsListener( 'CLICK' );
		adsListener( 'CONTENT_PAUSE_REQUESTED', function(event){
			// set a local method for true ad playback start.
			_this.startedAdPlayback = function(){
				_this.embedPlayer.adTimeline.updateUiForAdPlayback( _this.currentAdSlotType );
				_this.startedAdPlayback = null;
			}
			// loading ad:
			_this.embedPlayer.pauseLoading();
			// sometimes CONTENT_PAUSE_REQUESTED is the last event we receive :(
			// give double click 12 seconds to load the ad, else return to content playback
			setTimeout( function(){
				if( $.isFunction( _this.startedAdPlayback ) ){
					// ad error will resume playback
					_this.onAdError( " CONTENT_PAUSE_REQUESTED without no ad LOADED! ");
				}
			}, 12000 );
		} );
		adsListener( 'LOADED', function(){
			// check for started ad playback sequence callback
			if( _this.startedAdPlayback ){
				_this.startedAdPlayback();
			}

			var size = _this.getPlayerSize();
			_this.adsManager.resize( size.width, size.height, google.ima.ViewMode.NORMAL );
			// Hide player content
			_this.hideContent();
			// show the loading spinner until we start ad playback
			_this.embedPlayer.addPlayerSpinner();
			// if on iPad hide the quicktime logo:
			_this.hidePlayerOffScreen( _this.getAdContainer()  );

			// Monitor ad progress
			_this.monitorAdProgress();
		} );
		adsListener( 'STARTED', function(){
			// Check for ad Stacking ( two starts in less then 250ms )
			if( lastAdStartTime !== null &&
				new Date().getTime() - lastAdStartTime < 250
			){
				mw.log("ERROR:: Stacking Ad STARTED! :" + ( lastAdStartTime - new Date().getTime() ) );
				// Not sure what we should do here:
				// 1) we can't unload manager since we have to play back the active ads
				// 2) we can't pause the ad since it could pause the really active ad
				// 3) .. all we can do is break out of event flow for player and hope, double click,
				// 		fixes this bug on their side.
				return ;
			} else{
				mw.log( 'DoubleClick:: time delta since last adStart: ' +
						( new Date().getTime() - lastAdStartTime ) );
			}
			// update the last ad start time:
			lastAdStartTime = new Date().getTime();

			// check for started ad playback sequence callback
			if( _this.startedAdPlayback ){
				_this.startedAdPlayback();
			}
			// hide spinner:
			_this.embedPlayer.hideSpinnerAndPlayBtn();
			// make sure the player is in play state:
			_this.embedPlayer.playInterfaceUpdate();

			// hide content / show playerplayer position:
			_this.hideContent();

			// set ad playing flag:
			_this.adActive = true;
			_this.embedPlayer.sequenceProxy.isInSequence = true;

			_this.adStartTime = new Date().getTime();

			if( _this.getConfig('playPauseUI') ){
				_this.enablePausePlayUI( true );
			}

			// Monitor ad progress
			_this.monitorAdProgress();
		} );
		adsListener( 'PAUSED', function(){
			// Send a notification to trigger associated events and update ui
			_this.embedPlayer.sendNotification('doPause');
			_this.enablePausePlayUI( false );
		} );
		adsListener( 'FIRST_QUARTILE', function(){
			// Monitor ad progress ( if for some reason we are not already monitoring )
			_this.monitorAdProgress();
		});
		adsListener( 'MIDPOINT' );
		adsListener( 'THIRD_QUARTILE' );
		adsListener( 'COMPLETE', function(){
			// make sure content is in sync with aspect size:
			if( _this.embedPlayer.layoutBuilder ){
				//_this.embedPlayer.layoutBuilder.syncPlayerSize();
			}

			if( _this.contentDoneFlag ){
				// Include a fallback check for ALL_ADS_COMPLETED
				setTimeout(function(){
					if( !_this.allAdsCompletedFlag ){
						mw.log("DoubleClick:: Fallback ALL_ADS_COMPLETED call");
						// restore the player but don't play content since ads are done:
						_this.restorePlayer( true );
					}
				}, 1000 );
			}
		});
		// Resume content:
		adsListener( 'CONTENT_RESUME_REQUESTED', function(){
			// Update slot type, if a preroll switch to midroll
			if( _this.currentAdSlotType == 'preroll' ){
				_this.currentAdSlotType = 'midroll';
				// ( will be updated to postroll at contentDoneFlag update time )
			}
			_this.restorePlayer();
		});
		adsListener( 'ALL_ADS_COMPLETED', function(){
			// check that content is done before we restore the player, managed players with only pre-rolls fired
			// ALL_ADS_COMPLETED after preroll not after all ad opportunities for this content have expired.
			if( _this.contentDoneFlag ){
				// set the allAdsCompletedFlag to not call restore player twice
				_this.allAdsCompletedFlag = true;
				// restore the player but don't play content since ads are done:
				_this.restorePlayer( true );
			}
		});
	},
	enablePausePlayUI:function( adPlayingBack ){
		var _this = this;
		// re-enable hover:
		this.embedPlayer.$interface.find( '.play-btn' )
			.buttonHover()
			.css('cursor', 'pointer' );

		// update icon state:
		var a = ( adPlayingBack )? 'play' : 'pause';
		var b =  ( adPlayingBack )? 'pause' : 'play';
		this.embedPlayer.$interface.find('.play-btn span')
		.removeClass( 'ui-icon-' + a )
		.addClass( 'ui-icon-' + b );

		// bind pause play
		this.embedPlayer.$interface.find( '.play-btn' )
		.unbind('click')
		.click( function( ) {
			mw.log("DoubleClick::proxied play btn click: isPlaying:" + adPlayingBack );
			if( adPlayingBack ){
				_this.embedPlayer.sendNotification('doPause');
			} else {
				_this.embedPlayer.sendNotification('doPlay' );
			}
		 })
	},
	getPlayerSize: function(){
		return this.embedPlayer.layoutBuilder.getPlayerSize();
	},
	hideContent: function(){
		mw.log("DoubleClick:: hide Content / show Ads");
		var _this = this;
		// show the ad container:
		$( this.getAdContainer() ).css({
			'top' : 0,
			'left' : 0
		});
		if( this.adsManager && this.adsManager.resize ){
			var size = this.getPlayerSize();
			this.adsManager.resize(
				size.width, size.height, google.ima.ViewMode.NORMAL
			);
		}
		// hide content:
		if( this.isSiblingVideoAd() ){
			this.hidePlayerOffScreen(
				this.getContent()
			)
		}
	},
	showContent: function(){
		mw.log("DoubleClick:: show Content / hide Ads");
		// Make sure content is visable:
		$( this.getContent() ).show();
		// make sure the player is shown ( double click sets visibility on end? )
		// restore size to 100%x100%
		$( this.getContent() ).css({
			'visibility':'visible',
			'width': '100%',
			'height': '100%'
		});

		// hide the ad container:
		this.hidePlayerOffScreen(
			this.getAdContainer()
		);
	},
	/**
	 * iPad displays a quicktime logo while loading, this helps hide that
	 */
	hidePlayerOffScreen:function(target){
		$( target ).css({
			'position' : 'absolute',
			'left': '-4048px'
		})
	},

	addEmbedPlayerListeners: function(){
		var _this = this;
		var embedPlayer = this.embedPlayer;

		embedPlayer.bindHelper( 'updateLayout' + this.bindPostfix, function() {
			if( _this.adActive ){
				var width = embedPlayer.getInterface().width();
				var height = embedPlayer.getInterface().height()
				mw.log( "DoubleClick::onResizePlayer: size:" + width + ' x ' + height );
				// Resize the ad manager on player resize: ( no support for animate )
				_this.adsManager.resize( width, height, google.ima.ViewMode.NORMAL );
			}
		});

		embedPlayer.bindHelper( 'volumeChanged' + this.bindPostfix, function(event, percent){
			if( _this.adActive ){
				mw.log("DoubleClick::volumeChanged:" + percent );
				_this.adsManager.setVolume( percent );
			}
		});


		/**
		 * Handle any send notification events:
		 */
		embedPlayer.bindHelper( 'Kaltura_SendNotification' + this.bindPostfix, function(event, notificationName, notificationData){
			// Only take local api actions if in an Ad.
			if( _this.adActive ){
				mw.log("DoubleClick:: sendNotification: " + notificationName );
				switch( notificationName ){
					case 'doPause':
						_this.adPaused = true;
						_this.adsManager.pause();
						$( embedPlayer ).trigger( 'onpause' );
						if( _this.getConfig('playPauseUI') ){
							_this.enablePausePlayUI( false );
						}
						break;
					case 'doPlay':
						_this.adPaused = false;
						_this.adsManager.resume()
						$( embedPlayer ).trigger( 'onplay' );
						if( _this.getConfig('playPauseUI') ){
							_this.enablePausePlayUI( true );
						}
						_this.monitorAdProgress();
						break;
					case 'doStop':
						_this.adsManager.stop();
						_this.adActive = false;
						_this.embedPlayer.sequenceProxy.isInSequence = false;
						_this.embedPlayer.stop();
						break;
				}
			}
		});
	},
	monitorAdProgress: function(){
		var _this = this;
		// Keep monitoring ad progress at MonitorRate as long as ad is playing:
		if( !this.adMonitor ){
			this.adMonitor = setInterval( function(){
				_this.doMonitorAdProgress();
			}, mw.getConfig( 'EmbedPlayer.MonitorRate' ) );
		}
	},
	doMonitorAdProgress: function(){
		var _this = this;
		// check if we are still playing an ad:
		if( !_this.adActive ){
			// update 'timeRemaining' and duration for no-ad )
			_this.embedPlayer.adTimeline.updateSequenceProxy( 'timeRemaining',  null );
			_this.embedPlayer.adTimeline.updateSequenceProxy( 'duration', null );
			clearInterval( this.adMonitor );
			this.adMonitor = 0;
			return ;
		}
		// Check if we have an ad buffer underun that double click apparently does not check for :(
		if( _this.adPreviousTimeLeft == _this.adsManager.getRemainingTime()  ){
			// reset the previous time check:
			_this.adPreviousTimeLeft = null;
			// if we already have an active buffer check continue:
			if( _this.activeBufferUnderunCheck ){
				return ;
			}
			_this.activeBufferUnderunCheck = true;
			setTimeout( function(){
				if( _this.adActive && !_this.adPaused && _this.adPreviousTimeLeft ==  _this.adsManager.getRemainingTime()  ){
					mw.log( "DoubleClick:: buffer underun pause?  try to continue playback ");
					// try to restart playback:
					_this.adsManager.resume();
					// restore the previous time check:
					_this.adPreviousTimeLeft = _this.adsManager.getRemainingTime();
				}
				_this.activeBufferUnderunCheck = false;
			}, 2000);
		}
		// no buffer underun make sure we are not displaying the loading spinner:
		_this.embedPlayer.hideSpinnerAndPlayBtn();

		// update the adPreviousTimeLeft
		_this.adPreviousTimeLeft = _this.adsManager.getRemainingTime();

		// Update sequence property per active ad:
		_this.embedPlayer.adTimeline.updateSequenceProxy( 'timeRemaining',  _this.adsManager.getRemainingTime() );
		var $adVid = ( _this.isSiblingVideoAd() ) ?
					$( _this.getAdContainer() ).find( 'video' ):
					$( _this.getContent() );
		if( $adVid.length ){
			// always use the latest video:
			var vid = $adVid[ $adVid.length -1 ];
			_this.embedPlayer.adTimeline.updateSequenceProxy( 'duration',  vid.duration );
			_this.embedPlayer.triggerHelper( 'AdSupport_AdUpdatePlayhead', vid.currentTime );

			// TODO player interface updates should be configurable see Mantis 14076 and 14019
			_this.embedPlayer.layoutBuilder.setStatus(
				mw.seconds2npt( vid.currentTime ) + '/' + mw.seconds2npt( vid.duration )
			);
			_this.embedPlayer.updatePlayHead( vid.currentTime / vid.duration );
		}
	},
	// Handler for various ad errors.
	onAdError: function( errorEvent ) {
		var errorMsg = ( typeof errorEvent.getError != 'undefined' ) ? errorEvent.getError() : errorEvent;
		mw.log('DoubleClick:: onAdError: ' + errorMsg );
		if (this.adsManager && $.isFunction( this.adsManager.unload ) ) {
			this.adsManager.unload();
		}
		this.restorePlayer();
	},
	restorePlayer: function( onContentComplete ){
		mw.log("DoubleClick::restorePlayer: content complete:" + onContentComplete);
		var _this = this;
		this.adActive = false;
		this.embedPlayer.sequenceProxy.isInSequence = false;

		// Show the content:
		this.showContent();

		// sometimes double click has sets visibility to false ( async :( ):
		setTimeout(function(){
			$( _this.getContent() ).css('visibility',  'visible');
		}, 250);

		// Check for sequence proxy style restore:
		if( $.isFunction( this.restorePlayerCallback ) ){
			// also do the normal restore ( will issue an async play call )
			this.restorePlayerCallback();
			this.restorePlayerCallback = null;
		} else { // do a manual restore:
			// restore player with normal events:
			this.embedPlayer.adTimeline.restorePlayer();
			// managed complete ... call clip done if content complete.
			if( onContentComplete ){
				this.embedPlayer.onClipDone();
			} else {
				this.embedPlayer.play();
			}
		}

		// Do an sync play call ( if not on postroll )
		if( !onContentComplete ){
			this.forceContentPlay();
		}

	},
	forceContentPlay: function(){
		var _this = this;
		var vid = this.getContent();
		var isPlaying = false;
		var playBindStr = 'playing.dcForceContentPlay';
		$( vid ).unbind( playBindStr ).bind( playBindStr, function(){
			isPlaying = true;
			// make sure the content duration is accurate:
			if( vid.duration ){
				_this.embedPlayer.duration = vid.duration;
			}
			$( vid ).unbind( playBindStr );
		});
		vid.play();
		setTimeout(function(){
			var vid = _this.getContent();
			if( ! isPlaying && ! _this.embedPlayer.paused ){
				// Try again:
				vid.play();
				_this.forceContentPlay();
			}
		}, 4000 );
	},
	/**
	 * TODO should be provided by the generic ad plugin class.
	 */
	getConfig: function( attrName ){
		// always get the config from the embedPlayer so that is up-to-date
		return this.embedPlayer.getKalturaConfig( this.pluginName, attrName );
	}
};

})( window.mw, jQuery);
