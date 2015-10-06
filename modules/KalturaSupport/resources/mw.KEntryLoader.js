/**
 * KEntryLoader enables easy loading of entries with respective metadata. 
 */
( function( mw, $ ) { "use strict";

mw.KEntryLoader = function( client, kProperties ){
	return this.init( client, kProperties );
};

mw.KEntryLoader.prototype = {
	baseDataInx:0,
	playerLoaderCache: [],
	init: function( client, kProperties ){
		this.clinet = client;
		this.kProperties = kProperties;
	},
	/**
	 * PlayerLoader
	 *
	 * Does a single request to the api to
	 * a) Get context data
	 * c) Get flavorasset
	 * b) Get baseEntry
	 */
	get: function( callback ){
		var _this = this,
			requestObject = [];
		var kProperties = this.kProperties;
		// Normalize flashVars
		kProperties.flashvars = kProperties.flashvars || {};
		
		var entryResult = this.getFromStorage( this.getCacheKey( kProperties ) );
		if( entryResult ){
			mw.log("KEntryLoader::loaded from storage");
			callback( entryResult );
			// issue async check for cache purge / update 
			callback = function(){
				mw.log("KEntryLoader:: async update of entry object");
			}
		}

		// If we don't have entryId and referenceId return an error
		if( !kProperties.flashvars.referenceId && !kProperties.entry_id ) {
			mw.log( "KApi:: entryId and referenceId not found, exit.");
			callback( { error: "Empty player" } );
			return ;
		}

		// Check if we have ks flashvar and use it for our request
		if( kProperties.flashvars && kProperties.flashvars.ks ) {
			this.clinet.setKs( kProperties.flashvars.ks );
		}

		// Always get the entry id from the first request result
		var entryIdValue = '{1:result:objects:0:id}';

		// Base entry request
		var baseEntryRequestObj = {
			'service' : 'baseentry',
			'action' : 'list',
			'filter:objectType' : 'KalturaBaseEntryFilter'
		};
		// Filter by reference Id
		if( !kProperties.entry_id && kProperties.flashvars.referenceId ){
			baseEntryRequestObj['filter:referenceIdEqual'] = kProperties.flashvars.referenceId;
		} else if ( kProperties.entry_id ){
			if( kProperties.features['entryRedirect'] && kProperties.flashvars.disableEntryRedirect !== true ) {
				// Filter by redirectEntryId
				baseEntryRequestObj['filter:redirectFromEntryId'] = kProperties.entry_id;
			} else {
				// Filter by entryId
				baseEntryRequestObj['filter:idEqual'] = kProperties.entry_id;
			}
		}
		requestObject.push(baseEntryRequestObj);
		var streamerType = kProperties.flashvars.streamerType || 'http';
		var flavorTags = kProperties.flashvars.flavorTags || 'all';

		// Add Context Data request
		requestObject.push({
			'contextDataParams' : {
				'referrer' : window.kWidgetSupport.getHostPageUrl(),
				'objectType' : 'KalturaEntryContextDataParams',
				'flavorTags': flavorTags,
				'streamerType': streamerType
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
		// Check for metadataProfileId flashvar
		if( typeof kProperties.flashvars['metadataProfileId'] != 'undefined' ){
			requestObject[requestObject.length-1][ 'filter:metadataProfileIdEqual'] = kProperties.flashvars['metadataProfileId'];
		}

		if( kProperties.flashvars.getCuePointsData !== false ){
			requestObject.push({
				'service' : 'cuepoint_cuepoint',
				'action' : 'list',
				'filter:objectType' : 'KalturaCuePointFilter',
				'filter:orderBy' : '+startTime',
				'filter:statusEqual' : 1,
				'filter:entryIdEqual' : entryIdValue
			});
		}
		_this.getNamedDataFromAPI( requestObject, function( namedData ){
			if ( !mw.getConfig("EmbedPlayer.DisableEntryCache") ) {
				_this.setStorage( _this.getCacheKey( kProperties ), namedData); 
			}
			callback( namedData );
		} );
	},
	/**
	 * Do the player data Request and populate named data
	 * @pram {object} requestObject Request object
	 * @parm {function} callback Function called with named data
	 */
	getNamedDataFromAPI: function( requestObject, callback ){
		var _this = this;
		// Do the request and pass along the callback
		this.clinet.doRequest( requestObject, function( data ){
			var namedData = {};
			// Name each result data type for easy access

			// Check if we have an error
			if( data[0].code ) {
				mw.log('Error in kaltura api response: ' + data[0].message);
				callback( { 'error' :  data[0].message } );
				return ;
			}
			var dataIndex = _this.baseDataInx;
			// The first data index should be meta ( it shows up in either objects[0] or as a raw property
			if( ! data[ dataIndex ].objects || ( data[ dataIndex ].objects && data[ dataIndex ].objects.length == 0 )) {
				namedData['meta'] = {
					code: 'ENTRY_ID_NOT_FOUND',
					message: 'Entry not found'
				};
			} else {
				namedData['meta'] = data[ dataIndex ].objects[0];
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
	getFromStorage: function( cacheKey ){
		var storage = window['localStorage']
		if ( storage && storage.getItem ) {
			return JSON.parse( storage.getItem( cacheKey) );
		}
	},
	setStorage: function( cacheKey, value ){
		var stroage = window['localStorage'];
		if( stroage && stroage.setItem ){
			stroage.setItem( cacheKey, JSON.stringify( value) );
		}
	},
	/**
	 * Get a cache key for entry request
	 * @param kProperties
	 * @return
	 */
	getCacheKey: function( settings ){
		var cacheKey = '';
		if( settings ){
			for(var i in settings){
				if( i == 'flashvars' ){
					for(var j in settings){
						if( j == 'getCuePointsData'  ||
							j =='ks'  ||
							j == 'referenceId' 
						){
							cacheKey += settings[i][j];
						}
					}
				} else if( 
					i == 'entry_id' ||
					i == 'partner_id' ||
					i == 'wid' 
				){
					cacheKey += i + '_' + settings[i];
				}
			};
		}
		return cacheKey;
	}
};

/**
 * KApi entry loader public entry points:
 *
 */
mw.kApiEntryLoader = function( kProperties, callback ){
	if( !kProperties.widget_id ) {
		mw.log( "Error:: mw.KApiPlayerLoader:: cant run player loader with widget_id "  + kProperties.widget_id );
	}
	// Make sure we have features
	if( !kProperties.features ) {
		kProperties.features = {};
	}
	// Convert widget_id to partner id
	var client = mw.kApiGetPartnerClient( kProperties.widget_id );
	var entryLoader = new mw.KEntryLoader( client, kProperties );
	
	entryLoader.get(callback);
	
	// Return the kClient api object for future requests
	return client;
};

})( window.mw, jQuery );
