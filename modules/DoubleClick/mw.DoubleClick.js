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
	adPlaying: false,
	contentPlaying: false,
	adDuration: null,
	demoStartTime: null,
	
	// Flags for a fallback check for all ads completed .
	contentDoneFlag: null,
	
	// Flag for startting ad playback sequence:
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
		
		// Load double click ima per doc:
		// http://code.google.com/apis/ima/docs/sdks/googlehtml5_ads_v3.html#loadsdk
		$.getScript('http://s0.2mdn.net/instream/html5/ima.js', function(){
			google.ima.SdkLoader.setCallbacks( function(){
				if( $.isFunction( callback) ){
					// Determine if we are in managed or kaltura point based mode. 
					if( _this.getConfig( "preSequence" ) && _this.getConfig( "adTagUrl" ) ){
						// Managed bindings
						_this.addManagedBinding();
					} else {
						// Add cuepoint bindings
						_this.addKalturaCuePointBindings();
					}
					callback();
				}
			}, function( errorCode ){
				mw.log( "Error::DoubleClick Loading Error: " + errorCode );
				// Don't add any bindings directly issue callback: 
				callback();
			});
			google.ima.SdkLoader.load("3");
		});
		
		// Load double click ima library and issue the callback:
		/*$.getScript('http://www.google.com/jsapi', function(){
			google.load("ima", "3", {
				"callback" : function(){
					if( callback ){
						callback();
					}
				}
			});
		});*/
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
				mw.log( "DoubleClick:: addManagedBinding : requestAds");
				_this.requestAds( unescape( _this.getConfig("adTagUrl") ) );	
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
	// get the content video tag
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
			
			mw.log("DoubleClick:: AdOpportunity:: " + cuePoint.startTime + ' ad type: ' + adType);
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
						mw.log( "DoubleClick:: addManagedBinding : requestAds");
						_this.requestAds( unescape( cuePoint.sourceUrl ) );	
					};
				});
			}
			// If cuepoint ad type is midroll request inline: 
			if( adType == 'midroll' ){
				// All cuepoints act as "midrolls" 
				mw.log( "DoubleClick:: addKalturaCuePointBindings: midroll -> requestAds");
				// pause the player while requesting adds
				_this.embedPlayer.pauseLoading();
				// request the ads: 
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

		mw.log( 'DoubleClick::requestAds > ' + adTagUrl );

		// 4. Make the request.
		_this.adsLoader.requestAds( adsRequest );
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
		
		// Add ad listeners: 
		adsListener( 'CLICK' );
		adsListener( 'CONTENT_PAUSE_REQUESTED', function(event){
			// set a local method for true ad playback start. 
			_this.startedAdPlayback = function(){
				_this.embedPlayer.adTimeline.updateUiForAdPlayback( _this.currentAdSlotType );
			}
			// loading ad:
			_this.embedPlayer.pauseLoading();
			// sometimes CONTENT_PAUSE_REQUESTED is the last event we receive :(
			// give double click 6 seconds to load the ad, else return to content playback
			setTimeout( function(){
				if( $.isFunction( _this.startedAdPlayback ) ){
					_this.onAdError( " CONTENT_PAUSE_REQUESTED without no ad LOADED! ");
				}
			}, 6000 );
		} );
		adsListener( 'LOADED', function(){
			// check for startted ad playback sequence callback 
			if( _this.startedAdPlayback ){
				_this.startedAdPlayback();
				_this.startedAdPlayback = null;
			}
			
			var size = _this.getPlayerSize();
			_this.adsManager.resize( size.width, size.height, google.ima.ViewMode.NORMAL );	
			// Hide player content
			_this.hideContent();
			// show the loading spinner until we start ad playback
			_this.embedPlayer.addPlayerSpinner();
			// if on iPad hide the quicktime logo: 
			_this.hidePlayerOffScreen( _this.getAdContainer()  );
		} );
		adsListener( 'STARTED', function(){
			// hide spinner: 
			_this.embedPlayer.hidePlayerSpinner();
			// make sure the player is in play state: 
			_this.embedPlayer.playInterfaceUpdate();
			
			// hide content / show playerplayer position: 
			_this.hideContent();
			
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
			// the current ad is complete hide off screen ( until next ad plays ) 
			_this.hidePlayerOffScreen();
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
	getPlayerSize: function(){
		return {
			'width': this.embedPlayer.getPlayerWidth(),
			'height': this.embedPlayer.getPlayerHeight() 
		}
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
			this.adsManager.resize( 
					this.embedPlayer.width, this.embedPlayer.height, google.ima.ViewMode.NORMAL 
				);
		}
		// hide content:
		this.hidePlayerOffScreen(
			this.getContent()
		)
	},
	showContent: function(){
		mw.log("DoubleClick:: show Content / hide Ads");
		// show content
		this.embedPlayer.syncPlayerSize();
		
		// make sure content is in sync with aspect size: 
		if( this.embedPlayer.controlBuilder ){
			this.embedPlayer.controlBuilder.syncPlayerSize();
		}
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
		
		embedPlayer.bindHelper( 'onResizePlayer' + this.bindPostfix, function( event, size, animate ) {
			if( _this.adPlaying ){
				mw.log( "DoubleClick::onResizePlayer: size:" + size.width + ' x ' + size.height );
				// Resize the ad manager on player resize: ( no support for animate )
				_this.adsManager.resize( parseInt( size.width) , parseInt( size.height ), google.ima.ViewMode.NORMAL );
			}
		});
		embedPlayer.bindHelper( 'onResizePlayerDone' + this.bindPostfix, function( event, size, animate ) {
			// make sure the display states are in sync: 
			if( _this.adPlaying ){
				_this.hidePlayerOffScreen(
					_this.getContent()
				)
			}	
		});
		
		embedPlayer.bindHelper( 'volumeChanged' + this.bindPostfix, function(event, percent){
			if( _this.adPlaying ){
				mw.log("DoubleClick::volumeChanged:" + percent );
				_this.adsManager.setVolume( percent );
			}
		});
		
		// May have to fix these bindings to support pause play on ads. 
		embedPlayer.bindHelper( 'onpause' + this.bindPostfix, function( event, percent){
			if( _this.adPlaying ){
				mw.log("DoubleClick::onpause:" + percent );
				_this.adsManager.pause();
			}
		});
		embedPlayer.bindHelper( 'onplay' + this.bindPostfix, function( event, percent){
			if( _this.adPlaying ){
				mw.log("DoubleClick::onplay:" + percent );
				_this.adsManager.resume();
			}
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
		var errorMsg = ( errorEvent['getError'] )? errorEvent.getError() : errorEvent;
		mw.log('DoubleClick:: onAdError: ' + errorMsg  );
		if (this.adsManager && $.isFunction(this.adsManager.unload) ) {
			this.adsManager.unload();
		}
		this.restorePlayer();
	},
	restorePlayer: function( onContentComplete ){
		mw.log("DoubleClick::restorePlayer: content complete:" + onContentComplete);
		this.adPlaying = false;
		this.embedPlayer.sequenceProxy.isInSequence = false;
		
		// Show the content:
		this.showContent();

		// Do an sync play call ( without events if not on postroll )
		if( !onContentComplete && this.getContent()['play'] ){
			this.getContent().play();
		}
		
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
