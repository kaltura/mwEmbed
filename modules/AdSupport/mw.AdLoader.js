
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
		// First try to directly load the ad url:
		try{
		$.ajax({
			url: adUrl,
			success: function( data ) {
				_this.handleResult( data, callback );
			},
			error: function( jqXHR, textStatus, errorThrown ){
				// try to load the file with the proxy:
				_this.loadFromProxy( adUrl, callback );
			}
		});
		} catch ( e ){
			mw.log( "AdLodaer:: first cross domain request failed, trying with proxy");
		}
	},
	loadFromProxy: function( adUrl, callback ){
		var _this = this;
		// We use a xml proxy ( passing on the clients ip for geo lookup ) 
		// since the ad server is almost never on the same domain as the api.
		// @@todo also we should explore html5 based cross domain request to avoid the proxy
		var proxyUrl = mw.getConfig( 'Mw.XmlProxyUrl' );
		if( !proxyUrl ){
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
			try{
				var resultXML = $j.parseXML( result['contents'] );
			} catch (e){
				mw.log("Error: AdLoader could not parse:" + resultXML);
				callback({});
				return ;
			}
			// get the xml document:
			_this.handleResult( resultXML, callback );
		});
	},
	handleResult: function(data, callback ){
		var _this = this;
		switch( _this.getAdFormat( data) ){
			case 'vast':
				// If we have lots of ad formats we could conditionally load them here: 
				// ( normally we load VastAdParser before we get here but just in-case ) 
				mw.load( 'mw.VastAdParser', function(){
					callback(
						mw.VastAdParser.parse( data )
					);
				});
				return ;
			break;
		}					
		mw.log("Error: could not parse adFormat from add content: \n" + data);
		callback( {} );
	},
	/**
	 * Get ad Format
	 * @param {string} 
	 * 		The xml string of the ad contents
	 * @return 
	 * @type {string}
	 * 		The type of string
	 */
	getAdFormat: function( xmlObject ){
		if( xmlObject.childNodes ){
			var rootNodeName = xmlObject.childNodes[0].nodeName;
		}
		if( rootNodeName && ( 
				rootNodeName.toLowerCase() == 'vast' || 
				rootNodeName.toLowerCase() == 'videoadservingtemplate' ) 
		){
			return 'vast';
		}
		return 'unknown';
	}
};
