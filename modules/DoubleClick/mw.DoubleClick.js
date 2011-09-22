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
	
	init: function( embedPlayer, callback ){
		mw.log( 'DoubleClick:: init: ' + embedPlayer.id );
		var _this = this;
		this.embedPlayer = embedPlayer;
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
		if( this.getConfig( 'preSequence') )
			slotSet.push( 'preroll');
		
		if( this.getConfig( 'postSequence') )
			slotSet.push( 'postroll' );
		
		// Add preroll / post roll
		$.each( slotSet, function( inx, slotType ){
			// Add the adSlot binding
			// @@TODO use the "sequence number" as a slot identifier. 
			$( _this.embedPlayer ).bind( 'AdSupport_' + slotType, function( event, callback ){
				// pause base playback:
				 _this.embedPlayer.pause(); 
				 
				// Ad a loading spinner: 
				$( _this.embedPlayer ).getAbsoluteOverlaySpinner();
		
				// Setup the current ad callback: 
				_this.currentAdLoadedCallback = function( adsManager ){
					adsManager.play( _this.embedPlayer.getPlayerElement() );
				};
				// Setup the restore callback
				_this.onResumeRequestedCallback = function(){
					callback();
				};
				// Request the ad ( will trigger the currentAdCallback and onResumeRequestedCallback when done )
				_this.getAdsLoader( function( adsLoader ){
					adsLoader.requestAds( {
						'adTagUrl' : _this.getAdTagUrl(),
						'adType': 'VIDEO'
					});
				});
			});
		});
		
		// Check for cuepoints
		if( _this.embedPlayer.rawCuePoints ){
			// Setup cuepoints 
			$.each( _this.embedPlayer.rawCuePoints, function( inx, cuePoint ){
				// Make sure the cue point is tagged for dobuleclick
				if( cuePoint.tags.indexOf( "doubleclick" ) === -1 ){
					return true;
				}
				// Get the ad type for each cuepoint
				var adType = _this.embedPlayer.kCuePoints.getAdSlotType( cuePoint );
				if( adType == 'overlay' ){
					// TODO add it to the right place in the timeline
					
					return true; // continue to next cue point
				}
				if( adType == 'midroll' ){
					var doneMidroll = false;
					// TODO add this to the timeline ( not the monitor ) 
					$( _this.embedPlayer).bind('monitorEvent', function(){
						if( _this.embedPlayer.currentTime > cuePoint.startTime && doneMidroll == false ){
							// play the midroll
							_this.adsManager.play( _this.embedPlayer.getPlayerElement() );
						}
					});
				}
			});
		}
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
		debugger;
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
	    
	    // Set a visual element on which clicks should be tracked for video ads
		adsManager.setClickTrackingElement( _this.embedPlayer );
		
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
		this.callback();
	},
	getConfig: function( configName ){
		// always get the config from the embedPlayer so that is up-to-date
		return this.embedPlayer.getKalturaConfig( 'doubleclick', configName );
	}
};
	
})( window.mw, jQuery);

