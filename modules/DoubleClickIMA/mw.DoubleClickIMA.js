( function( mw, $){

mw.DoubleClickIMA = function( embedPlayer, callback ){
	this.init( embedPlayer, callback );
};
mw.DoubleClickIMA.prototype = {
	init: function( embedPlayer, callback ){
		mw.log( 'DoubleClickIMA:: init: ' + embedPlayer.id );
		var _this = this;
		this.embedPlayer = embedPlayer;
		this.callback = callback;

		// Load the google libraries
		this.getGoogleAdsLoader( function( adsLoader ){
			
			// Set up listeners:
			adsLoader.addEventListener(
			    google.ima.AdsLoadedEvent.Type.ADS_LOADED,
			    function( adsLoadedEvent ){ _this.onAdsLoaded( adsLoadedEvent ) },
			    false);
			
			adsLoader.addEventListener(
			    google.ima.AdErrorEvent.Type.AD_ERROR,
			    function(adErrorEvent){ _this.onAdsError(adErrorEvent) },
			    false);
			
			// Make request
			_this.adsLoader.requestAds( _this.getAdsRequest() );

		});
	},
	onAdsLoaded: function( adsLoadedEvent ){
		mw.log("DoubleClickIMA:: onAdsLoaded " + adsLoadedEvent);
		
		// Get the ads manager
		var adsManager = adsLoadedEvent.getAdsManager();
		adsManager.addEventListener(google.ima.AdErrorEvent.Type.AD_ERROR, onAdError);

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
	    adsManager.setClickTrackingElement( _this.embed );
	    try {
	      // Call play to start showing the ad.
	      adsManager.play( _this.embedPlayer.getPlayerElement() );
	    } catch (adError) {
	      // An error may be thrown if there was a problem with the VAST response.
	    }
		
		this.callback();
	},
	onPauseRequested: function(){
		_this.embedPlayer.pause();
		 // Setup UI for showing ads (e.g. display ad timer countdown,
	    // disable seeking, etc.)
	    // setupUIForAd();
	},
	onResumeRequested: function(){
	    // Setup UI back for showing content.
	    // setupUIForContent();
		_this.embedPlayer.play();
	},
	onAdsError: function(adErrorEvent){
		mw.log("DoubleClickIMA:: onAdsError:" + adErrorEvent.getError() );
		this.callback();
	},
	getAdsRequest: function(){
		return {
				adTagUrl: this.getConfig( 'adTagUrl' ),
				adType: "video"
			};
	},
	getConfig: function( configName ){
		if( !this.config ){
			this.config = this.embedPlayer.getKalturaConfig( 'doubleClickIMA', ['adTagUrl'] );
		}
		// will return null or undefined if configName is not set
		return this.config[ configName ];
	},
	getGoogleAdsLoader: function( callback ){
		var _this = this;
		$.getScript('http://www.google.com/jsapi', function(){
			google.load("ima", "1", {"callback" : function(){
				_this.adsLoader = new google.ima.AdsLoader();
				callback( _this.adsLoader );
			}});
		});
	}
}
	
})( window.mw, jQuery);

