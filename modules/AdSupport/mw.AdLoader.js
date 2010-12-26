
mw.AdLoader = {
	/**
	 * Get ad display configuration object from a url
	 * 
	 * @param {string} adUrl
	 * 		The url which contains the xml ad payload
	 * @param {function} callback
	 * 		Function called with ad payload once ad content is loaded. 
	 */
	load: function( adUrl, callback ){
		var _this = this;
		// We use a xml proxy ( passing on the clients ip for geo lookup ) 
		// since the ad server is almost never on the same domain as the api.
		// @@todo also we should explore html5 based cross domain request to avoid the proxy
		var proxyUrl = mw.getConfig( 'AdSupport.XmlProxyUrl' );
		if( !proxyUrl){
			mw.log("Error: mw.KAds : missing kaltura proxy url ( can't load ad ) ");
			return ; 
		}
		$j.getJSON( proxyUrl + '?url=' + encodeURIComponent( adUrl ) + '&callback=?', function( result ){
			var adDisplayConf = {};
			if( result['http_code'] == 'ERROR' || result['http_code'] == 0 ){
				mw.log("Error: loadAdXml error with http response");
				callback(false);
				return ;
			}
			var adFormat = 'unknown';
				
			// Check result['contents']  for "<vast> </vast> tag
			var lowerCaseXml = result['contents'].toLowerCase();
			if( lowerCaseXml.indexOf('<vast') != -1 &&
				lowerCaseXml.indexOf('</vast>')	){
				adFormat = 'vast';
			}
			if( lowerCaseXml.indexOf('<videoadservingtemplate') != -1 &&
				lowerCaseXml.indexOf('</videoadservingtemplate>')	){
				adFormat = 'vast';
			}			
			switch( adFormat ){
				case 'vast':
					// If we have lots of ad formats we could conditionally load them here: 
					// mw.load( 'mw.VastAdParser.js', function(){})
					callback( 
						mw.VastAdParser.parse( result['contents'] ) 
					);
					return ;
				break;
			}					
			mw.log("Error: could not parse adFormat from add content: \n" + result['contents']);
			callback( {} );
		})
	},
}