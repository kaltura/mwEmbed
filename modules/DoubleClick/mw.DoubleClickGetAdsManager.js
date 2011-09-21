( function( mw, $){

mw.DoubleClickGetAdsManager = function( options ){
	this.init( options );
};
mw.DoubleClickGetAdsManager.prototype = {
	/**
	 * local config object:
	 * 
	 * options include: 
	 * 	adRequest {Object} with the 'adTagUrl' and 
	 * 	callback {Function} Called once the adMannager is ready
	 * 
	 */ 
	init: function( options ){
		var _this = this;
		// add in the options
		$.extend( this, options );
		// Run ght google Ads Loader call:
		_this.getGoogleAdsLoader( )
	},
	// Load the google libraries
	getGoogleAdsLoader: function( adsLoader ){
		
		// Set up listeners:
		adsLoader.addEventListener(
		    google.ima.AdsLoadedEvent.Type.ADS_LOADED,
		    function( adsLoadedEvent ){ _this.onAdsLoaded( adsLoadedEvent ); },
		    false);
		
		adsLoader.addEventListener(
		    google.ima.AdErrorEvent.Type.AD_ERROR,
		    function( adErrorEvent ){ _this.onAdsError( adErrorEvent ); },
		    false);
		
		// Make request
		_this.adsLoader.requestAds( _this.getAdsRequest() );
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
