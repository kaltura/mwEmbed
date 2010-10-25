/**
* Supports the parsing and layout of ads format see:
* tests/VAST_Kaltura_Ad_Support.html
*/

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
		var _this = this; 
		this.embedPlayer = embedPlayer;
		this.$adConfig = $adConfig;		
		// Load the Ads
		_this.loadAds( function(){
			mw.log("All ads have been loaded");
		})			
	},
	// Load all the ads per the $adConfig
	loadAds: function( callback ){		
		var _this = this;			
		var loadQueueCount = 0;
		// Add timeline events: 
		this.$adConfig.find( 'timeline' ).children().each( function(na, node){
			var adDisplayConfAttr = ["nads", "frequency", "start"];			
			if( $j(node).attr( 'enabled') == 'true' ){
				// Setup the displayConf with a pointer to this adConfig ( for general ad config )
				var displayConf = { 
					'adConfig' : _this.$adConfig  
				};
				// Add the ad displayCon attributes to the displayConf
				for( var i =0; i < adDisplayConfAttr.length; i++){
					if( $j(node).attr( adDisplayConfAttr[i] ) ){
						displayConf[ adDisplayConfAttr[i] ] = $j(node).attr( adDisplayConfAttr[i] );
					}
				}
				if( $j(node).attr('url')  ){
					loadQueueCount++;
					// Load and parse the adXML into displayConf format
					_this.loadAdXml( $j(node).attr('url'), function( adDisplayConf ){
						// make sure we have a valid callback: 
						if( adDisplayConf ){						
							// Add to the player timeline bindings ( hopefully before the user hits 'play' )
							mw.addAdToPlayerTimeline( 
								_this.embedPlayer, 
								node.nodeName,							
								$j.extend( displayConf, adDisplayConf ) // merge in adDisplayConf
							)
						};
						loadQueueCount--;
						if( loadQueueCount == 0 ){
							callback();
						}
					});
				} else {
					// need to add support for mw.addToPlayerTimeline for non VAST ads^					
				}
			}			
		})
		// Check if no ads had to be "loaded"
		if( loadQueueCount == 0 ){
			callback();
		}
	},
	loadAdXml: function( adUrl, callback ){
		var proxyUrl = mw.getConfig( 'Kaltura.xmlProxyUrl' );
		if( !proxyUrl){
			mw.log("Error: mw.KAds : missing kaltura proxy url ( can't load ad ) ");
			return; 
		}
		// In theory if on the same server we don't need to proxy 
		// ( but ad servers are almost always on a different server)		
		// @@todo also we should explore html5 based cross domain request 
		// if the servers set the proper access permissions 
		// ( because cookies don't work well with the proxy ) 
		$j.getJSON( proxyUrl + '?url=' + adUrl + '&callback=?', function( result ){
			var adDisplayConf = {};
			if( result['http_code'] == 'ERROR' || result['http_code'] == 0 ){
				mw.log("Error: loadAdXml error with http response");
				callback(false);
				return ;
			}
			// Parse the 'content' callback ( for now only VAST is of this type )
			adDisplayConf['$vast'] = $j( result['content'] );
			adDisplayConf.type = 'vast';
			// @@todo we may want to abstract VAST a bit more if we support multiple types 
			callback( adDisplayConf );
		})
	}
}