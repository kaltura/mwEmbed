( function( mw, $){

mw.DoubleClick = function( embedPlayer, callback ){
	this.init( embedPlayer, callback );
};
mw.DoubleClick.prototype = {
	// local config object
	config: {},
	
	// The google ad manager:
	adsManager: null,
	
	init: function( embedPlayer, callback ){
		mw.log( 'DoubleClick:: init: ' + embedPlayer.id );
		var _this = this;
		this.embedPlayer = embedPlayer;
		this.callback = callback;

	},
	onAdsLoaded: function( adsLoadedEvent ){
		var _this = this;
		mw.log("DoubleClick:: onAdsLoaded " + adsLoadedEvent );
		
		// Get the ads manager
		this.adsManager = adsLoadedEvent.getAdsManager();
		
		// Add the error handler: 
		this.adsManager.addEventListener(google.ima.AdErrorEvent.Type.AD_ERROR, function( adError ){
			_this.onAdsError( adError );
		});

		// Listen and respond to events which require you to pause/resume content
		this.adsManager.addEventListener(
	        google.ima.AdEvent.Type.CONTENT_PAUSE_REQUESTED,
	        function(){ _this.onPauseRequested(); }
	    );
		this.adsManager.addEventListener(
	        google.ima.AdEvent.Type.CONTENT_RESUME_REQUESTED,
	        function(){ _this.onResumeRequested(); } 
	    );
	    
	    // Set a visual element on which clicks should be tracked for video ads
		this.adsManager.setClickTrackingElement( _this.embedPlayer );
	   
	    // Check if we found adds;
		_this.addPlayerBindings();
		
		this.callback();
	},
	addPlayerBindings: function(){
		var _this = this;
		
		var slotSet = [];
		// Check for pre-sequence: 
		if( this.getConfig( 'preSequence') )
			slotSet.push( 'preroll');
		
		if( this.getConfig( 'postSequence') )
			slotSet.push( 'postroll' );
		
		$.each( slotSet, function( inx, slotType ){
			// Add the adSlot binding
			// @@TODO use the "sequence number" as a slot identifier. 
			$( _this.embedPlayer ).bind( 'AdSupport_' + slotType, function( event, callback ){
				// Call play to start showing the ad.
				_this.adsManager.play( _this.embedPlayer.getPlayerElement() );
				_this.onResumeRequestedCallback = function(){
					callback();
				};
			});
		});
		
		// Check for cuepoints
		if( this.embedPlayer.entryCuePoints ){
			// Setup cuepoints 
			$.each( this.embedPlayer.entryCuePoints, function( inx, cuePoint ){
				// Make sure the cue point is tagged for dobuleclick
				if( cuePoint.tags.indexOf( "doubleclick" ) !== -1 ){
					return true;
				}
				// Get the ad type for each cuepoint
				var adType = embedPlayer.kCuePoints.getAdType( cuePoint );
				if( adType == 'overlay' ){
					// TODO add it to the right place in the timeline
				}
				if( adType == 'midroll' ){
					var doneMidroll = false;
					// TOOD add this to the timeline ( not the monitor ) 
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
	getAdsRequest: function(){
		var _this = this;
		var adRequest = {};
		// Would be good to also support: 
		// 'channels','contentId', 'publisherId'
		var namedUiConfProps = ['adTagUrl','adType' ];
		$.each(namedUiConfProps, function(inx, propName){
			propValue =  _this.getConfig( propName );
			if( propValue != null ){
				adRequest[ propName ] = propValue;
			}
		});
		
		return adRequest;
	},
	getConfig: function( configName ){
		// always get the config from the embedPlayer so that is up-to-date
		return this.embedPlayer.getKalturaConfig( 'doubleclick', configName );
	};
	
})( window.mw, jQuery);

