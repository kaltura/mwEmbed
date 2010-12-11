/*
 * Simple kaltura javascript api
 *
 * uses configuration Kaltura.ServiceUrl and Kaltura.ServiceBase for api entry point
 */ 

/**
 * kApi takes supports a few mixed argument types
 * 
 * @param {Mixed}
 * 		Array An Array of request params for multi-request 
 * 		Object Named request params
 */
mw.KApi = function( requestObject ){
	// Check that we have a session established if not make it part of our multi-part request
	if( requestObject.length ){
		var multiRequest = {
			'service' : 'multirequest',
			'action' : 'null'
		};
		for( var requestInx = 0 ; requestInx < requestObject.length; requestInx++ ){
			// MultiRequest pre-process each param with inx:param
			for( paramKey in requestObject[requestInx] ){
				multiRequest[ requestInx + ':' + paramKey ] = requestObject[requestInx][paramKey];
			}
		}
		return this.doRequest( multiRequest );
	}
	// Normal named paramaters request:
	return this.doRequest( requestObject );
}

mw.KApi.prototype = {
	baseParam: {
		'apiVersion' : '3.0',
		'clientTag' : 'html5',
		'expiry' '86400',
		'format' : 9, // 9 = JSONP format
		'ignoreNull' : 1
	},
	getSession : function(){
		this.doRequest( service, 
	},
	doRequest : function( param, callback ){
		var requestParam = $.extend( this.baseParam, param );
		requestParam['kalsig'] = this.getSignature( requestParam );
		$j.getJSON(this.getApiUrl(), requestParam, function(){
			
		});		
	},
	getApiUrl : function(){
		return mw.getConfig( 'Kaltura.ServiceUrl' ) + mw.getConfig( 'Kaltura.ServiceBase' );
	},
	getSignature: function( params ){
		params = this.ksort(params);
		var str = "";
		for(var v in params) {
			var k = params[v];
			str += k + v;
		}
		return MD5(str);
	},
	/**
	 * Sorts an array by key, maintaining key to data correlations. This is useful mainly for associative arrays. 
	 * @param arr 	The array to sort.
	 * @return		The sorted array.
	 */
	ksort: function ( arr ) {
		var sArr = [];
		var tArr = [];
		var n = 0;
		for ( i in arr ){
			tArr[n++] = i+"|"+arr[i];
		}
		tArr = tArr.sort();
		for (var i=0; i<tArr.length; i++) {
			var x = tArr[i].split("|");
			sArr[x[0]] = x[1];
		}
		return sArr;
	}	
};

/**
 * KApiPlayerLoader
 * 
 * Does a single request to the api to 
 * a) Start a session,
 * c) Get uiConfFile 
 * b) Get access control information
 * 
*/
mw.KApiPlayerLoader = function( partner_id, entry_id, callback ){
	// The refering url ( can be from the iframe ) 
	var refer = ( mw.getConfig( 'EmbedPlayer.IframeParentUrl') )? 
					mw.getConfig( 'EmbedPlayer.IframeParentUrl') : 
					document.href;
	mw.KApi([
	         // Get Context Data: 
	         {
	        	 'contextDataParams:referrer' : refer
	        	 'contextDataParams:objectType' : 'KalturaEntryContextDataParams',
	        	 'service' : 'baseentry',	        	
	         }
	]);
}