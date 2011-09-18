( function( mw, $){

mw.DoubleClickIMA = function( embedPlayer ){
	this.init( embedPlayer );
};
mw.DoubleClickIMA.prototype = {
	init: function( embedPlayer ){
		var _this = this;
		this.embedPlayer = embedPlayer;
		
		// load the google libraries
		this.getGoogleAdsLoader(function( adsLoader ){
			// setup local ref:
			_this.adsLoader = adsLoader;
		});
	},
	getGoogleAdsLoader: function( callback ){
		$.getScript('http://www.google.com/jsapi',function(){
			 google.setOnLoadCallback(function(){
				 var adsLoader = new google.ima.AdsLoader();
				 callback( adsLoader );
			 });
			 google.load("ima", "1");
		});
	}
}
	
})( window.mw, jQuery);

