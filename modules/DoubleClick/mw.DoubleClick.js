( function( mw, $){

mw.DoubleClick = function( embedPlayer, callback ){
	this.init( embedPlayer, callback );
};
mw.DoubleClick.prototype = {
	// Local config object
	config: {},
	
	// The current loading ad callback
	currentAdLoadedCallback: null,
	
	// The resume request callback
	onResumeRequestedCallback: null, 
	
	// A pointer to the active adManager
	activeOverlayadManager: null,
	
	// The bind bindPostfix for all doubleclick bindings
	bindPostfix: '.doubleClick',
	
	init: function( embedPlayer, callback ){
		mw.log( 'DoubleClick:: init: ' + embedPlayer.id );
		var _this = this;
		
		// Inherit BaseAdPlugin
		mw.inherit( this, new mw.BaseAdPlugin(  embedPlayer, callback ) );
		
		// Load the ad manager:
		this.getAdsLoader( function( adsLoader ){
			
			// Set up listeners:
			adsLoader.addEventListener(
			    google.ima.AdsLoadedEvent.Type.ADS_LOADED,
			    function( adsLoadedEvent ){ 
			    	_this.onAdsLoaded( adsLoadedEvent ); 
			    },
			    false
			);
			
			adsLoader.addEventListener(
			    google.ima.AdErrorEvent.Type.AD_ERROR,
			    function( adErrorEvent ){ 
			    	_this.onAdsError( adErrorEvent ); 
			    },
			    false
			);
			
			// Add all the player bindings for loading ads at the correct times
			_this.addPlayerBindings();
			
			// issue the callback to continue player build out
			callback();
		});
	},
	/**
	 * Adds the player bindings for double click configuration. 
	 * @return
	 */
	addPlayerBindings: function(){
		var _this = this;
		var slotSet = [];

		// Check for pre-sequence: 
		if( parseInt( this.getConfig( 'preSequence') ) ){
			slotSet.push( 'preroll');
		}
		
		if( parseInt( this.getConfig( 'postSequence') ) ){
			slotSet.push( 'postroll' );
		}
		
		// Add preroll / post roll
		$.each( slotSet, function( inx, slotType ){
			// Add the adSlot binding
			// @@TODO use the "sequence number" as a slot identifier. 
			$( _this.embedPlayer ).bind( 'AdSupport_' + slotType + _this.bindPostfix, function( event, sequenceProxy ){
				// Add the slot to the given sequence proxy target target
				sequenceProxy[ _this.getSequenceIndex( slotType ) ] = function( callback ){
					_this.loadAndPlayVideoSlot( slotType, callback );	
				};
			});
		});

		// Add a binding for cuepoints:
		$( _this.embedPlayer ).bind( 'KalturaSupport_AdOpportunity' + _this.bindPostfix, function( event,  cuePointWrapper ){
			 _this.embedPlayer.pause();
			var cuePoint = cuePointWrapper.cuePoint;
			// check if trackCuePoints has been disabled 
			if( _this.getConfig( 'trackCuePoints') === false){
				return ;
			}
			// Make sure the cue point is tagged for dobuleclick
			if( cuePoint.tags.indexOf( "doubleclick" ) === -1 ){
				return ;
			}			
			// Get the ad type for each cuepoint
			var adType = _this.embedPlayer.kCuePoints.getRawAdSlotType( cuePoint );
			
			mw.log("DoubleClick:: AdOpportunity:: " + cuePoint.startTime + ' ad type: ' + adType);
			if( adType == 'overlay' ){
				_this.loadAndDisplayOverlay( cuePoint );
				// TODO add it to the right place in the timeline
				return true; // continue to next cue point
			}
			// check if video type: 
			if( adType == 'midroll'  ||  adType == 'preroll' || adType == 'postroll'  ){
				_this.loadAndPlayVideoSlot( 'midroll', function(){
					// play the restored entry ( restore propagation ) 
					_this.embedPlayer.play();
				}, cuePoint);
			}
		});
		// on clip done hide any overlay banners that are still active
		$( _this.embedPlayer ).bind( 'ended' + _this.bindPostfix, function(){
			 if( _this.activeOverlayadManager )
				 _this.activeOverlayadManager.unload();
		});
		// on change media remove any existing ads: 
		$( _this.embedPlayer ).bind( 'onChangeMedia' + _this.bindPostfix, function(){
			_this.destroy();
		});
	},
	
	/**
	 *  Destroy the doubleClick binding instance:
	 */ 
	destroy:function(){
		// Run the parent destroy:
		this.parent_destroy();
		
		 if( this.activeOverlayadManager )
			 this.activeOverlayadManager.unload();
		 
		 if( this.onResumeRequestedCallback )
			 this.onResumeRequestedCallback();
		
	},
	/**
	 * Load and display an overaly 
	 * @param cuePoint
	 * @return
	 */
	loadAndDisplayOverlay: function( cuePoint ){
		var _this = this;
		// Setup the current ad callback: 
		_this.currentAdLoadedCallback = function( adsManager ){
			var embedPlayer = _this.embedPlayer;
			
			 // Keep the overlay positioned per controls overlay
		    var bottom = 0;
			// Check if we are overlaying controls ( move the banner up ) 
			if( embedPlayer.controlBuilder.isOverlayControls() ){
				$( embedPlayer ).bind( 'onShowControlBar' + _this.bindPostfix, function(){
					$overlay.animate({ 'bottom': embedPlayer.controlBuilder.height + 'px'}, 'fast');
				});
				$( embedPlayer ).bind( 'onHideControlBar' + _this.bindPostfix, function(){
					$overlay.animate({ 'bottom': 0 + 'px'}, 'fast');
				});
			} else {
				bottom = ctrlBarBottom = embedPlayer.controlBuilder.height ;
			}
			var $overlay = _this.getOverlaySlot( bottom );

			// add binding for resize player
			$( embedPlayer ).bind( 'onCloseFullScreen'+ _this.bindPostfix +
					' onOpenFullScreen' + _this.bindPostfix + 
					' onResizePlayer'+ _this.bindPostfix, function(e) {
				adsManager.setAdSlotWidth( embedPlayer.getPlayerWidth() );
			    adsManager.setAdSlotHeight( embedPlayer.getPlayerHeight() );
			});
			
		    // Set the ad slot size.
		    adsManager.setAdSlotWidth( embedPlayer.getPlayerWidth() );
		    adsManager.setAdSlotHeight( embedPlayer.getPlayerHeight() - bottom );
		    
		    // Set Alignment
		    adsManager.setHorizontalAlignment( google.ima.AdSlotAlignment.HorizontalAlignment.CENTER );
		    adsManager.setVerticalAlignment( google.ima.AdSlotAlignment.VerticalAlignment.BOTTOM );

		    adsManager.play( $overlay.get(0) );
		    
		    // Set the active overlay manager: 
		    _this.activeOverlayadManager = adsManager;
		};
		
		// Request the ad ( will trigger the currentAdCallback and onResumeRequestedCallback when done )
		_this.getAdsLoader( function( adsLoader ){
			adsLoader.requestAds( {
				'adTagUrl' : _this.getAdTagUrl( 'overlay', cuePoint ),
				'adType': 'overlay'
			});
		});
	},
	getOverlaySlot: function( ctrlBarBottom){
		// Add a ad slot:
		if( ! $( this.embedPlayer ).find('.doubleclick-overlay-slot').length ){
			$( this.embedPlayer ).append( 
					$('<div />')
					.addClass('doubleclick-overlay-slot')
					.css({
						'position' : 'absolute',
						'left' : 0,
						'top' : 0,
						'bottom' : ctrlBarBottom + 'px'
					})
			);
		}
		return $( this.embedPlayer ).find('.doubleclick-overlay-slot');
	},
	/**
	 * Load and play a given slot
	 */
	loadAndPlayVideoSlot: function( slotType, callback, cuePoint){
		var _this = this;
		mw.log( "DoubleClick::loadAndPlayVideoSlot> pause while loading ads ");
		// Pause playback:
		_this.embedPlayer.pauseLoading();
		
		// Remove any active overlays: 
		if( _this.activeOverlayadManager ){
			_this.activeOverlayadManager.unload();
			_this.activeOverlayadManager = null;
		}

		// Setup the current ad callback: 
		_this.currentAdLoadedCallback = function( adsManager ){
			mw.log( "DoubleClick::loadAndPlayVideoSlot> currentAdLoaded got adsManager" );
			 // Set a visual element on which clicks should be tracked for video ads
			adsManager.setClickTrackingElement( _this.embedPlayer );
			
			// hide the loader; 
			_this.embedPlayer.hidePlayerSpinner();
			
			// TODO integrate into timeline proper: 
			if( _this.embedPlayer.adTimeline && slotType != 'overlay' ){
				_this.embedPlayer.adTimeline.updateUiForAdPlayback();
			}

			// Update the playhead to play state:
			_this.embedPlayer.play();

			// sometimes the player does not play on first request: 
			setTimeout(function(){
				_this.embedPlayer.play();
			}, 250)
			
			// TODO This should not be needed ( fix event stop event propagation ) 
			_this.embedPlayer.monitor();
			mw.log( "DoubleClick::adsManager.play" );
			
			adsManager.play( _this.embedPlayer.getPlayerElement() );
		};
		// Setup the restore callback
		_this.onResumeRequestedCallback = function(){
			mw.log( "DoubleClick::loadAndPlayVideoSlot> onResumeRequestedCallback" );
			// TODO integrate into timeline proper: 
			if( _this.embedPlayer.adTimeline ){
				_this.embedPlayer.adTimeline.restorePlayer();
			}
			// Clear out the older currentAdLoadedCallback
			_this.currentAdLoadedCallback = null;
			// issue the callback 
			callback();
		};
		// Request the ad ( will trigger the currentAdCallback and onResumeRequestedCallback when done )
		_this.getAdsLoader( function( adsLoader ){
			mw.log("DoubleClick: request Ads from adTagUrl: " +  _this.getAdTagUrl( slotType, cuePoint ));
			adsLoader.requestAds( {
				'adTagUrl' : _this.getAdTagUrl( slotType, cuePoint ),
				'adType': 'video'
			});
		});
	},
	/**
	 * Tries to get an AdSlotUrl in the few places it could be located
	 * @param slotType
	 * @param cuePoint
	 * @return URL
	 */
	getAdTagUrl: function ( slotType, cuePoint ){
		// Return the cuePoint after evaluating any substitutions 
		return this.embedPlayer.evaluate(  
				this.findTagUrl( slotType, cuePoint ) 
			);
	},
	/**
	 * Tries to get an AdSlotUrl in the few places it could be located
	 * @param slotType
	 * @param cuePoint
	 * @return URL
	 */
	findTagUrl: function( slotType, cuePoint ){
		// if the cuePoint includes a url return that: 
		if( cuePoint && cuePoint.sourceUrl ){
			return cuePoint.sourceUrl;
		}
		// Check if the ui conf has defined an AdTagUrl for preAdTagUrl or postAdTagUrl
		if( this.getConfig( slotType + 'AdTagUrl') ){
			return this.getConfig( slotType + 'AdTagUrl' );
		}
		if(!this.getConfig( 'adTagUrl' ) ){
			mw.log("Error: DoubleClick no adTagUrl found for " + slotType );
		}
		// else just return a master adTagUrl config var:
		return this.getConfig( 'adTagUrl' );
	},
	getAdsLoader: function( callback ){
		var _this = this;
		if( _this.adsLoader ){
			callback( _this.adsLoader );
			return ;
		}
		$.getScript('http://www.google.com/jsapi', function(){
			google.load("ima", "1", {"callback" : function(){
				_this.adsLoader = new google.ima.AdsLoader();
				callback( _this.adsLoader );
			}});
		});
	},
	onAdsLoaded: function( adsLoadedEvent ){
		var _this = this;
		mw.log("DoubleClick:: onAdsLoaded " + adsLoadedEvent );
		// Get the ads manager
		var adsManager = adsLoadedEvent.getAdsManager();
		
		// Add the error handler: 
		adsManager.addEventListener(google.ima.AdErrorEvent.Type.AD_ERROR, function( adError ){
			_this.onAdsError( adError );
		});
		
		// Listen and respond to events which require you to pause/resume content
		adsManager.addEventListener(
	        google.ima.AdEvent.Type.CONTENT_PAUSE_REQUESTED,
	        function(){ _this.onPauseRequested(); }
	    );
		adsManager.addEventListener(
	        google.ima.AdEvent.Type.CONTENT_RESUME_REQUESTED,
	        function(){ _this.onResumeRequested(); } 
	    );
	    
		// if currentAdLoadedCallback is set issue the adLoad callback: 
		if( this.currentAdLoadedCallback ){
			 this.currentAdLoadedCallback( adsManager );
		}
	},
	onPauseRequested: function(){
		mw.log( "DoubleClick:: onPauseRequested" );
		//_this.embedPlayer.pause();
		 // Setup UI for showing ads (e.g. display ad timer countdown,
	    // disable seeking, etc.)
	    // setupUIForAd();
	},
	onResumeRequested: function(){
		mw.log( "DoubleClick:: onResumeRequested" );
		if( this.onResumeRequestedCallback ){
			this.onResumeRequestedCallback();
		}
		this.onResumeRequestedCallback = false;
	},
	onAdsError: function( adErrorEvent ){
		mw.log("DoubleClick:: onAdsError:" + adErrorEvent.getError() );
		// On ad error don't stop playback: 
		this.onResumeRequested();
	},
	getConfig: function( configName ){
		// always get the config from the embedPlayer so that is up-to-date
		return this.embedPlayer.getKalturaConfig( 'doubleclick', configName );
	}
};
	
})( window.mw, jQuery);

