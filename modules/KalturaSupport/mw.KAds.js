/**
* Supports the parsing and layout of ads format see:
* tests/VAST_Kaltura_Ad_Support.html
*/

mw.addKalturaAds

//KAnalytics Constructor
mw.KAnalytics = function( embedPlayer, kalturaClient ){
	this.init( 	embedPlayer, kalturaClient );
}

//Global mw.addKAd manager
var mwKAdManager = {};
mw.addKalturaAds = function( embedPlayer, $adConfig ) {
	mwKAdManager[ embedPlayer.id ] = new mw.KAds( embedPlayer, $adConfig ) ;
} 

mw.KAds = function( embedPlayer,   $adConfig) {
	// Create a Player Manager
	return this.init( embedPlayer, $adConfig );
};
mw.KAds.prototype = {
	
	init: function( embedPlayer, $adConfig ){
		this.embedPlayer = embedPlayer;
		this.$adConfig = $adConfig;		
		this.addPlayerBindings();
	},
	
	addPlayerBindings: function(){
	}
}