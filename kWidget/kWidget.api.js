/*********************************************
* A minimal wrapper for kaltura server api
* 
* Supports static requests,
* Auto includes kWidget for userKS queries ( where admin ks is not provided )
* Makes use of defined: 
* 	'Kaltura.ServiceUrl', 'http://cdnapi.kaltura.com' );
* 		&&
*	'Kaltura.ServiceBase'
**********************************************/
(function(kWidget){ "use strict"
if( !kWidget ){
	kWidget = window.kWidget = {};
}
kWidget.api = function( widgetId, ks ){
	return this.init( widgetId, ks );
};
kWidget.api.prototype = {
	ks: null,
	baseParam: {
		'apiVersion' : '3.1',
		'expiry' : '86400',
		'clientTag': 'kwidget:v',
		'format' : 9, // 9 = JSONP format
		'ignoreNull' : 1
	},
	/**
	 * Init the api object:
	 * options {Object} Set of init options
	 */
	init: function( options  ){
		for( var i in options ){
			this[i] = options[i];
		}
		// check for globals if not set, use mw.getConfig
		if( ! this.serviceUrl ){
			this.serviceUrl = mw.getConfig( 'Kaltura.ServiceUrl' );
		}
		if( ! this.serviceBase ){
			this.serviceBase = mw.getConfig( 'Kaltura.ServiceBase' ); 
		}
		if( ! this.statsServiceUrl ){
			this.statsServiceUrl = mw.getConfig( 'Kaltura.StatsServiceUrl' );
		}
		if( typeof this.disableCache == 'undefined' ){
			this.disableCache = mw.getConfig('Kaltura.NoApiCache');
		}
		// append MWEMBED_VERSION to the client tag ( if set )
		this.baseParam.clientTag+= window[ 'MWEMBED_VERSION' ] || '';
	},
	setKs: function( ks ){
		this.ks = ks;
	},
	getKs: function(){
		return this.ks;
	},
	/**
	 * Do an api request and get data in callback
	 */
	doRequest: function ( requestObject, callback ){
		var _this = this;
		var param = {};
		// If we have Kaltura.NoApiCache flag, pass 'nocache' param to the client
		if( this.disableCach === true ) {
			param['nocache'] = 'true';
		}
		
		// Add in the base parameters:
		for( var i in this.baseParam ){
			if( typeof param[i] == 'undefined' ){
				param[i] = this.baseParam[i];
			}
		};
		// Check for "user" service queries ( no ks or wid is provided  )
		if( requestObject['service'] != 'user' ){
			$.extend( param, this.handleKsServiceRequest( requestObject ) );
		} else {
			$.extend( param, requestObject );
		}

		// Remove service tag ( hard coded into the api url )
		var serviceType = param['service'];
		delete param['service'];

		// Add the signature ( if not a session init )
		if( serviceType != 'session' ){
			param['kalsig'] = _this.getSignature( param );
		}

		// Build the request url with sorted params:
		var requestURL = _this.getApiUrl( serviceType ) + '&' + $.param( param );

		var globalCBName = 'kapi_' + _this.getSignature( param );
		if( window[ globalCBName ] ){
			// Update the globalCB name inx.
			this.callbackIndex++;
			globalCBName = globalCBName + this.callbackIndex;
		}
		window[ globalCBName ] = function( data ){
			// check if the base param was a session ( then directly return the data object ) 
			if( data.length == 2 && param[ '1:service' ] == 'session' ){
				data = data[1];
			}
			// issue the local scope callback:
			if( callback ){
				callback( data );
				callback = null;
			}
			// null out the global callback for fresh loads
			delete window[ globalCBName ];
		};
		requestURL+= '&callback=' + globalCBName;
		kWidget.appendScriptUrl( requestURL );
	},
	handleKsServiceRequest: function( requestObject ){
		var param = {};
		// put the ks into the params request if set
		if( requestObject[ 'ks' ] ){
			this.ks = requestObject['ks'];
		}
		// Convert into a multi-request if no session is set ( ks will be added below )
		if( !requestObject.length && !this.getKs() ){
			requestObject = [ requestObject ];
		}
		// Check that we have a session established if not make it part of our multi-part request
		if( requestObject.length ){
			param['service'] = 'multirequest';
			param['action'] = 'null';

			// Kaltura api starts with index 1 for some strange reason.
			var mulitRequestIndex = 1;
			// check if we should add a user ks
			if( !this.getKs() ){
				param[ mulitRequestIndex + ':service' ] = 'session';
				param[ mulitRequestIndex + ':action' ] = 'startWidgetSession';
				param[ mulitRequestIndex + ':widgetId'] = this.wid;
				// update the request index:
				mulitRequestIndex = 2;
			}

			for( var i = 0 ; i < requestObject.length; i++ ){
				var requestInx = mulitRequestIndex + i;
				// If ks was null always add back ref to ks:
				param[ requestInx + ':ks'] = ( this.getKs() ) ? this.getKs() : '{1:result:ks}';
				
				// MultiRequest pre-process each param with inx:param
				for( var paramKey in requestObject[i] ){
					// support multi dimension array request:
					if( typeof requestObject[i][paramKey] == 'object' ){
						for( var subParamKey in requestObject[i][paramKey] ){
							param[ requestInx + ':' + paramKey + ':' +  subParamKey ] =
								requestObject[i][paramKey][subParamKey];
						}
					} else {
						param[ requestInx + ':' + paramKey ] = requestObject[i][paramKey];
					}
				}
			}
		} else {
			param = requestObject;
			param['ks'] = this.getKs();
		}
		return param;
	},
	getApiUrl : function( serviceType ){
		var serviceUrl = this.serviceUrl;
		if( serviceType && serviceType == 'stats' && this.statsServiceUrl ) {
			serviceUrl = this.statsServiceUrl
		}
		return serviceUrl + this.serviceBase + serviceType;
	},
	getSignature: function( params ){
		params = this.ksort(params);
		var str = "";
		for(var v in params) {
			var k = params[v];
			str += k + v;
		}
		return MD5( str );
	},
	/*hashCode: function(str){
		var hash = 0;
		if (str.length == 0) return hash;
		for (i = 0; i < str.length; i++) {
			char = str.charCodeAt(i);
			hash = ((hash<<5)-hash)+char;
			hash = hash & hash; // Convert to 32bit integer
		}
		return hash;
	},*/
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
}

})( window.kWidget );