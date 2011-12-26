( function( mw, $){

mw.DoubleClick = function( embedPlayer, callback, pluginName ){
	this.init( embedPlayer, callback , pluginName);
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
	
	init: function( embedPlayer, callback, pluginName ){
		mw.log( 'DoubleClick:: init: ' + embedPlayer.id );
		var _this = this;
		
		// Set the plugin name ( used to get config ) 
		this.pluginName = pluginName;
		
		// Inherit BaseAdPlugin
		mw.inherit( this, new mw.BaseAdPlugin( embedPlayer, callback ) );
		this.embedPlayer = embedPlayer;
		// Add all the player bindings for loading ads at the correct times
		_this.addPlayerBindings();
		
		// Issue the callback to continue player build out
		callback();
	},
	/**
	 * Adds the player bindings for double click configuration. 
	 * @return
	 */
	addPlayerBindings: function(){
		var _this = this;
		var slotSet = [];
		// remove any old binding: 
		_this.embedPlayer.unbindHelper( _this.bindPostfix );
		
		
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
			_this.embedPlayer.bindHelper( 'AdSupport_' + slotType + _this.bindPostfix, function( event, sequenceProxy ){
				// Add the slot to the given sequence proxy target target
				sequenceProxy[ _this.getSequenceIndex( slotType ) ] = function( callback ){
					_this.loadAndPlayVideoSlot( slotType, callback );	
				};
			});
		});

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
			if( providerFilter && cuePoint.tags.toLowerCase().indexOf( providerFilter ) === -1 ){
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
			
			// Ceck if video type: 
			if( adType == 'midroll'  ||  adType == 'preroll' || adType == 'postroll'  ){
				// All cuepoints act as "midrolls" 
				_this.loadAndPlayVideoSlot( 'midroll', function(){
					_this.embedPlayer.adTimeline.restorePlayer();
					// try to play again after a single MonitorRate wait time 
					// double click player is not fully restored 
					setTimeout(function(){
						_this.embedPlayer.play();
					}, mw.getConfig( "EmbedPlayer.MonitorRate" ) );
				}, cuePoint);
			}
		});
		// On clip done hide any overlay banners that are still active
		_this.embedPlayer.bindHelper( 'ended' + _this.bindPostfix, function(){
			 if( _this.activeOverlayadManager ){
				 _this.activeOverlayadManager.unload();
			 }
		});
		// On change media remove any existing ads: 
		_this.embedPlayer.bindHelper( 'onChangeMedia' + _this.bindPostfix, function(){
			_this.embedPlayer.unbindHelper(  _this.bindPostfix );
			_this.destroy();
		});
	},
	
	/**
	 *  Destroy the doubleClick binding instance:
	 */ 
	destroy: function(){
		 if( this.activeOverlayadManager ){
			 this.activeOverlayadManager.unload();
		 }
		 if( this.onResumeRequestedCallback ){
			 this.onResumeRequestedCallback();
		 }
	},
	/**
	 * Load and display an overaly 
	 * @param cuePoint
	 * @return
	 */
	loadAndDisplayOverlay: function( cuePoint ){
		var _this = this;
		// Don't display overlays if in an ad: 
		if( this.embedPlayer.evaluate('{sequenceProxy.isInSequence}') ){
			return ;
		}
		
		// Setup the current ad callback: 
		_this.currentAdLoadedCallback = function( adsManager ){
			mw.log( "DoubleClick::loadAndDisplayOverlay> currentAdLoadedCallback ")
			var embedPlayer = _this.embedPlayer;
			
			 // Keep the overlay positioned per controls overlay
		    var bottom = 0;
			// Check if we are overlaying controls ( move the banner up ) 
			if( embedPlayer.controlBuilder.isOverlayControls() ){
				embedPlayer.bindHelper( 'onShowControlBar' + _this.bindPostfix, function(){
					$overlay.animate({ 'bottom': embedPlayer.controlBuilder.height + 'px'}, 'fast');
				});
				embedPlayer.bindHelper( 'onHideControlBar' + _this.bindPostfix, function(){
					$overlay.animate({ 'bottom': 0 + 'px'}, 'fast');
				});
			} else {
				bottom = ctrlBarBottom = embedPlayer.controlBuilder.height ;
			}
			var $overlay = _this.getOverlaySlot( bottom );

			// add binding for resize player
			embedPlayer.bindHelper( 'onCloseFullScreen'+ _this.bindPostfix +
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

		    adsManager.play( $overlay[0] );
		    // Set the active overlay manager: 
		    _this.activeOverlayadManager = adsManager;
		    
		    // Only display overlays for cuePoint duration time 
		    var startTime = embedPlayer.currentTime;		    	
		    embedPlayer.bindHelper( 'monitorEvent' + _this.bindPostfix, function(){
		    	if( embedPlayer.currentTime - startTime  > ( cuePoint.duration / 1000 ) ){
		    		// remove the overly
		    		if( _this.activeOverlayadManager ){
			    		_this.activeOverlayadManager.unload();
						_this.activeOverlayadManager = null;
		    		}
		    		// remove this binding:
		    		 $(embedPlayer).unbind( 'monitorEvent' + _this.bindPostfix );
		    	}
		    });
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
		};
		return $( this.embedPlayer ).find('.doubleclick-overlay-slot');
	},
	/**
	 * Load and play a given slot
	 */
	loadAndPlayVideoSlot: function( slotType, callback, cuePoint){
		var _this = this;
		mw.log( "DoubleClick::loadAndPlayVideoSlot> " + slotType + " pause while loading ads ");
		
		var adClickPostFix = '.dcAdClick';
		
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
				_this.embedPlayer.adTimeline.updateUiForAdPlayback( slotType );
			}

			// Update the playhead to play state:
			_this.embedPlayer.playInterfaceUpdate();
			
			// TODO This should not be needed ( fix event stop event propagation ) 
			_this.embedPlayer.monitor();
			mw.log( "DoubleClick::adsManager.play" );
			var vid = _this.embedPlayer.getPlayerElement();
			adsManager.play( vid );
			
			// TODO this is almost the same as freewheel ad pause.. 
			// we should add generic support for "adPause" in adSupport
			
			// Show the control bar with a ( force on screen option for iframe based clicks on ads ) 
			// double click only gives us a "raw pause" 
			$( vid ).bind( 'pause' + adClickPostFix, function(){
				// a click we want to  enable play button: 
				_this.embedPlayer._playContorls = true;
				// play interface update:
				_this.embedPlayer.pauseInterfaceUpdate();
				// force display the control bar: 
				_this.embedPlayer.controlBuilder.showControlBar( true );
				// Add a play binding: to restore hover 
				$( vid ).bind( 'play' + adClickPostFix, function(){
					// remove ad click binding
					$( vid ).unbind( 'play' + adClickPostFix );
					_this.embedPlayer.controlBuilder.restoreControlsHover();
					// a restore _playControls restriction if in an ad ) 
					if( _this.embedPlayer.sequenceProxy.isInSequence ){
						_this.embedPlayer._playContorls = false;
					}
					_this.embedPlayer.playInterfaceUpdate();
				});
			});
			
		};
		// Setup the restore callback
		_this.onResumeRequestedCallback = function(){
			mw.log( "DoubleClick::loadAndPlayVideoSlot> onResumeRequestedCallback" );
			var vid = _this.embedPlayer.getPlayerElement();
			// unbind the click 
			$( vid ).unbind( adClickPostFix );
			
			// Restore player
			if( _this.embedPlayer.adTimeline ){
				_this.embedPlayer.adTimeline.restorePlayer();
			}
			// Clear out the older currentAdLoadedCallback
			_this.currentAdLoadedCallback = null;
			// Issue the loadAndPlayVideoSlot callback 
			callback();
		};
		// Request the ad ( will trigger the currentAdCallback and onResumeRequestedCallback when done )
		_this.getAdsLoader( function( adsLoader ){
			mw.log("DoubleClick: request Ads from adTagUrl: " +  _this.getAdTagUrl( slotType, cuePoint ));
			adsLoader.requestAds({
				'adTagUrl' : _this.getAdTagUrl( slotType, cuePoint ),
				'adType': 'video'
			});
		});
	},
	/**
	 * Assembles an AdSlotUrl 
	 * @param slotType
	 * @param cuePoint
	 * @return URL
	 */
	getAdTagUrl: function ( slotType, cuePoint ){
		// Return the cuePoint after evaluating any substitutions 
		var adUrl = this.embedPlayer.evaluate(  
				this.findTagUrl( slotType, cuePoint ) 
			);
		
		var rParam = ( adUrl.indexOf('?') ===  -1 ) ? '?' : '&';
		// Add in structured ui-conf components to ad url request:
		if( this.getConfig( 'contentId' ) ){
			adUrl+= rParam + 'vid=' + this.getConfig( 'contentId' ); 
			rParam = '&';
		}
		// cmsId 
		if( this.getConfig( 'cmsId' ) ){
			adUrl+= rParam + 'cmsid=' + this.getConfig('cmsId');
		};
		return adUrl;
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
		if( this.getConfig( slotType + 'adTagUrl') ){
			return this.getConfig( slotType + 'AdTagUrl' );
		}

		if( !this.getConfig( 'adTagUrl' ) ){
			mw.log("Error: DoubleClick no adTagUrl found for " + slotType );
		}
		// else just return a master adTagUrl config var:
		return this.getConfig( 'adTagUrl' );
	},
	getAdsLoader: function( callback ){
		var _this = this;
		
		var createLoader = function(){
			// Create a new ad Loader:
			var adsLoader = new google.ima.AdsLoader()
			
			// Turn off Competitive Exclusion 
			adsLoader.setCompetitiveExclusion(false);
			
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
			callback( adsLoader );
		};
		
		// Check if google ima is already loaded: 
		if( typeof google != 'undefined' && google.ima && google.ima.AdsLoader ){
			// Refresh the ads loader?
			createLoader();
			return ;
		}
		$.getScript('http://www.google.com/jsapi', function(){
			google.load("ima", "1", {"callback" : function(){
				createLoader();
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
	        function(){ 
	        	_this.onPauseRequested(); 
	        }
	    );
		adsManager.addEventListener(
	        google.ima.AdEvent.Type.CONTENT_RESUME_REQUESTED,
	        function(){ 
	        	_this.onResumeRequested(); 
	        } 
	    );
		// if currentAdLoadedCallback is set issue the adLoad callback: 
		if( this.currentAdLoadedCallback ){
			 this.currentAdLoadedCallback( adsManager );
		}
	},
	onPauseRequested: function(){
		mw.log( "DoubleClick:: onPauseRequested" );
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
		// Update the playhead to play state:
		this.embedPlayer.play();
		// On ad error don't stop playback: 
		this.onResumeRequested();
	},
	getConfig: function( configName ){
		// always get the config from the embedPlayer so that is up-to-date
		return this.embedPlayer.getKalturaConfig( this.pluginName, configName );
	}
};
	
})( window.mw, jQuery);

