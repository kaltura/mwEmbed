/**
 * Simple kaltura javascript api
 *
 * uses configuration Kaltura.ServiceUrl and Kaltura.ServiceBase for api entry point
 * 
 * Should extend new kWidget.api() api.request() base
 */

/**
 * kApi takes supports a few mixed argument types
 *
 * @param {String}
 * 		widgetId used to establish a request key for the given session
 * 		( this enables multiple sessions per widget id on a single page )
 * @param {Mixed}
 * 		Array An Array of request params for multi-request
 * 		Object Named request params
 */
( function( mw, $ ) { "use strict";

mw.KApi = function( widgetId ){
	return this.init( widgetId );
};

mw.KApi.prototype = {
	baseParam: {
		'apiVersion' : '3.1',
		'clientTag' : 'html5:v' + window[ 'MWEMBED_VERSION' ],
		'expiry' : '86400',
		'format' : 9, // 9 = JSONP format
		'ignoreNull' : 1
	},
	playerLoaderCache: [],
	// The local kaltura session key ( so it does not have to be re-grabbed with every request
	ks : null,
	init: function( widgetId ){
		this.widgetId = widgetId;
	},
	/**
	 * Clears the local cache for the ks and player data:
	 */
	clearCache:function(){
		this.playerLoaderCache = [];
		this.ks = null;
	},
	// Stores a callback index for duplicate api requests
	callbackIndex:0,

	getWidgetId: function( ){
		return this.widgetId;
	},
	doRequest : function( requestObject, callback ){
		var _this = this;
		var param = {};
		// Convert into a multi-request if no session is set ( ks will be added below )
		if( !requestObject.length && !this.ks ){
			requestObject = [ requestObject ];
		}

		// If we have Kaltura.NoApiCache flag, pass 'nocache' param to the client
		if( mw.getConfig('Kaltura.NoApiCache') === true ) {
			param['nocache'] = 'true';
		}

		// Check that we have a session established if not make it part of our multi-part request
		if( requestObject.length ){
			param['service'] = 'multirequest';
			param['action'] = 'null';

			// Kaltura api starts with index 1 for some strange reason.
			var mulitRequestIndex = 1;

			for( var i = 0 ; i < requestObject.length; i++ ){
				var requestInx = mulitRequestIndex + i;
				// MultiRequest pre-process each param with inx:param
				for( var paramKey in requestObject[i] ){
					// support multi dimension array request:
					// NOTE kaltura api only has sub arrays ( would be more feature complete to
					// recursively define key appends )
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
		}

		// add in the base parameters:
		for( var i in this.baseParam ){
			if( typeof param[i] == 'undefined' ){
				param[i] = this.baseParam[i];
			}
		};

		// Make sure we have the kaltura session
		// ideally this could be part of the multi-request but could not get it to work
		// see commented out code above.
		this.getKS( function( ks ){
			param['ks'] = ks;
			// Do the getJSON jQuery call with special callback=? parameter:
			_this.doApiRequest( param, callback);
		});
	},
	setKS: function( ks ){
		this.ks = ks;
	},
	getKS: function( callback ){
		if( this.ks ){
			callback( this.ks );
			return true;
		}
		var _this = this;
		// Add the Kaltura session ( if not already set )
		var ksParam = {
				'action' : 'startwidgetsession',
				'widgetId': '_' + this.widget_id
		};
		// add in the base parameters:
		var param = $.extend( { 'service' : 'session' }, this.baseParam, ksParam );
		this.doApiRequest( param, function( data ){
			_this.ks = data.ks;
			callback( _this.ks );
		});
	},
	doApiRequest: function( param, callback ){
		var _this = this;
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
			mw.log("Error global callback name already exists: " + globalCBName );
			// Update the globalCB name inx.
			this.callbackIndex++;
			globalCBName = globalCBName + this.callbackIndex;
		}
		window[ globalCBName ] = function( data ){
			// issue the local scope callback:
			if( callback ){
				callback( data );
				callback = null;
			}
			// don't null this global function name
			// window[ globalCBName ] = null;
		};
		requestURL+= '&callback=' + globalCBName;
		mw.log("kAPI:: doApiRequest: " + requestURL);
		$.getScript( requestURL );
	},
	getApiUrl : function( serviceType ){
		var serviceUrl = mw.getConfig( 'Kaltura.ServiceUrl' );
		if( serviceType && serviceType == 'stats' &&  mw.getConfig( 'Kaltura.StatsServiceUrl' ) ) {
			serviceUrl = mw.getConfig( 'Kaltura.StatsServiceUrl' );
		}
		return serviceUrl + mw.getConfig( 'Kaltura.ServiceBase' ) + serviceType;
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
	},
	/**
	 * PlayerLoader
	 *
	 * Does a single request to the api to
	 * a) Get context data
	 * c) Get flavorasset
	 * b) Get baseEntry
	 */
	playerLoader: function( kProperties, callback ){
		var _this = this;
		var requestObject = [];
		var entryIdValue;
		var refIndex;

		// RefrenceId can come from flashVar (for initial load) or from changeMedia
		if( !kProperties.reference_id && kProperties.flashvars && kProperties.flashvars['referenceId'] ){
			kProperties.reference_id =  kProperties.flashvars['referenceId'];
		}

		if( this.getCacheKey( kProperties ) && this.playerLoaderCache[ this.getCacheKey( kProperties ) ] ){
			mw.log( "KApi:: playerLoader load from cache: " + !!( this.playerLoaderCache[ this.getCacheKey( kProperties ) ] ) );
			callback( this.playerLoaderCache[ this.getCacheKey( kProperties ) ] );
			return ;
		}
		// Local method to fill the cache key and run the assoicated callback
		var fillCacheAndRunCallback = function( namedData ){
			_this.playerLoaderCache[ _this.getCacheKey( kProperties ) ] = namedData;
			callback( namedData );
		}

		// If we don't have entryId and referenceId return an error
		if( !kProperties.reference_id && !kProperties.entry_id ) {
			mw.log( "KApi:: entryId and referenceId not found, exit.");
			callback( { error: "Empty player" } );
			return ;
		}

		// Check if we have ks flashvar and use it for our request
		if( kProperties.flashvars && kProperties.flashvars.ks ) {
			this.setKS( kProperties.flashvars.ks );
		}

		if( kProperties.entry_id ) {
			entryIdValue = kProperties.entry_id; // will be used in other entry requests
			// Get baseEntry
			requestObject.push({
					 'service' : 'baseentry',
					 'action' : 'get',
					 'version' : '-1',
					 'entryId' : kProperties.entry_id
			});
		} else if( kProperties.reference_id ){
			// Use referenceId andGet the entry Id from the referenceId list response
			requestObject.push({
					 'service' : 'baseentry',
					 'action' : 'listByReferenceId',
					 'refId' : kProperties.reference_id
			});

			if( kProperties.uiconf_id ) {
				refIndex = 2;
			} else {
				refIndex = 1;
			}
			entryIdValue = '{' + refIndex + ':result:objects:0:id}';
		}


		// Add Context Data request
		requestObject.push({
			 'contextDataParams' : {
			 	'referrer' : window.kWidgetSupport.getHostPageUrl(),
			 	'objectType' : 'KalturaEntryContextDataParams',
			 	'flavorTags': 'all'
			 },
			 'service' : 'baseentry',
			 'entryId' : entryIdValue,
			 'action' : 'getContextData'
		});

		// Get custom Metadata
		requestObject.push({
			 'service' : 'metadata_metadata',
			 'action' : 'list',
			 'version' : '-1',
			 // metaDataFilter
			 'filter:metadataObjectTypeEqual' :1, /* KalturaMetadataObjectType::ENTRY */
			 'filter:orderBy' : '+createdAt',
			 'filter:objectIdEqual' : entryIdValue,
			 'pager:pageSize' : 1
	    });

		// Get Cue Points if not disable and on an entry_id
		var loadCuePoints = true;
		if( kProperties.flashvars && kProperties.flashvars.getCuePointsData && kProperties.flashvars.getCuePointsData == "false") {
			loadCuePoints = false;
		}

		if( loadCuePoints ){
			requestObject.push({
				'service' : 'cuepoint_cuepoint',
				'action' : 'list',
				'filter:objectType' : 'KalturaCuePointFilter',
				'filter:orderBy' : '+startTime',
				'filter:statusEqual' : 1,
				'filter:entryIdEqual' : entryIdValue
			});
		}
		_this.getNamedDataFromRequest( requestObject, fillCacheAndRunCallback );
	},

	/**
	 * Do the player data Request and populate named dat
	 * @pram {object} requestObject Request object
	 * @parm {function} callback Function called with named data
	 */
	getNamedDataFromRequest: function( requestObject, callback ){
		var _this = this;
		// Do the request and pass along the callback
		this.doRequest( requestObject, function( data ){
			var namedData = {};
			// Name each result data type for easy access

			// Check if we have an error
			if( data[0].code ) {
				mw.log('Error in kaltura api response: ' + data[0].message);
				callback( { 'error' :  data[0].message } );
				return ;
			}

			var dataIndex = 0;
			if( data[0]['confFile'] ){
				namedData['uiConf'] = data[ dataIndex ]['confFile'];
				dataIndex++;
				// See if we only have conf data:
				if( data.length == 1 ){
					callback( namedData );
					return ;
				}
			}
			// The first data index should be meta ( it shows up in either objects[0] or as a raw property
			if( requestObject[dataIndex]['action'] == 'listByReferenceId' ) {
				if( ! data[ dataIndex ].objects || ( data[ dataIndex ].objects && data[ dataIndex ].objects.length == 0 ) ) {
					namedData['meta'] = {
						code: 'ENTRY_ID_NOT_FOUND',
						message: 'Entry with reference id ' + requestObject[dataIndex]['refId'] + ' not found'
					};
				} else {
					namedData['meta'] = data[ dataIndex ].objects[0];
				}
			} else {
				namedData['meta'] = data[ dataIndex ];
			}
			dataIndex++;
			namedData['contextData'] = data[ dataIndex ];
			dataIndex++;
			namedData['entryMeta'] = _this.convertCustomDataXML( data[ dataIndex ] );
			dataIndex++;
			if( data[ dataIndex ] && data[ dataIndex].totalCount > 0 ) {
				namedData['entryCuePoints'] = data[ dataIndex ].objects;
			}
			callback( namedData );
		});
	},

	convertCustomDataXML: function( data ){
		var result = {};
		if( data && data.objects && data.objects[0] ){
			var xml = $.parseXML( data.objects[0].xml );
			var $xml = $( xml ).find('metadata').children();
			$.each( $xml, function(inx, node){
				result[ node.nodeName ] = node.textContent;
			});
		}
		return result;
	},
	/**
	 * Get a string representation of the query string
	 * @param kProperties
	 * @return
	 */
	getCacheKey: function( kProperties ){
		var rKey = '';
		if( kProperties ){
			$.each(kProperties, function( inx, value ){
				if( inx == 'flashvars' ){
					// add in the flashvars that can vary the api response
					if( typeof kProperties.flashvars == 'object'){
						rKey += kProperties.flashvars.getCuePointsData;
						rKey += kProperties.flashvars.ks
					}
				} else {
					rKey+=inx + '_' + value;
				}
			});
		}
		return rKey;
	}
};

/**
 * KApi public entry points:
 *
 * TODO maybe move these over to "static" members of the kApi object ( ie not part of the .prototype methods )
 */
// Cache api object per partner
// ( so that multiple partner types don't conflict if used on a single page )
mw.KApiPartnerCache = [];

mw.kApiGetPartnerClient = function( widgetId ){
	if( !mw.KApiPartnerCache[ widgetId ] ){
		mw.KApiPartnerCache[ widgetId ] = new mw.KApi( widgetId );
	}
	return mw.KApiPartnerCache[ widgetId ];
};
mw.KApiPlayerLoader = function( kProperties, callback ){
	if( !kProperties.widget_id ) {
		mw.log( "Error:: mw.KApiPlayerLoader:: cant run player loader with widget_id "  + kProperties.widget_id );
	}
	// Convert widget_id to partner id
	var kClient = mw.kApiGetPartnerClient( kProperties.widget_id );
	kClient.playerLoader( kProperties, function( data ){
		// Add a timeout so that we are sure to return kClient before issuing the callback
		setTimeout(function(){
			callback( data );
		},0);
	});
	// Return the kClient api object for future requests
	return kClient;
};
mw.KApiRequest = function( widgetId, requestObject, callback ){
	var kClient = mw.kApiGetPartnerClient( widgetId );
	kClient.doRequest( requestObject, callback );
};

})( window.mw, jQuery );
