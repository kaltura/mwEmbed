<?php

/**
 * Description of KalturaResultEntry
 *
 * @author ran
 */
require_once(  dirname( __FILE__ ) . '/KalturaResultObject.php');
class KalturaEntryResult extends KalturaResultObject {
	
	var $entryResultObj = null;
	// Set of sources
	var $sources = null;	
	
	function getCacheFilePath() {
		// Add entry id, cache_st and referrer
		// we include the referrer because of entry access control restictions
		$playerUnique = $this->urlParameters['entry_id'] . $this->getCacheSt() . $this->getReferer();
		$cacheKey = substr( md5( $this->getServiceConfig( 'ServiceUrl' )  ), 0, 5 ) . '_' . $this->getWidgetId() . '_' . 
			   substr( md5( $playerUnique ), 0, 20 );
		
		return $this->getCacheDir() . '/' . $cacheKey . ".entry.txt";
	}
	
	function isCachableRequest( $resultObj = null ){
		if( $this->isAccessControlAllowed( $resultObj ) !== true  ){
			return false;
		}
		// No restrictions
		return true;
	}
	
	function getEntryResult(){
		// Check if we have a cached result object:
		if( ! $this->entryResultObj ){
			$cacheFile = $this->getCacheFilePath();
			// Check if we can use the cache file: 
			if( $this->canUseCacheFile( $cacheFile ) ){
				$this->outputFromCache = true;
				$this->entryResultObj = @unserialize( file_get_contents( $cacheFile ) );
				if( $this->entryResultObj ){
					return $this->entryResultObj;
				}
			}
			// get via non-cached value:
			$this->entryResultObj = $this->getEntryResultFromApi();
			// Test if the resultObject can be cached ( no access control restrictions )
			// pass the result object to avoid recursive calls
			if( $this->isCachableRequest( $this->entryResultObj ) ){
				$this->log('KalturaEntryResult::getEntryResult: ['.$this->urlParameters['entry_id'].'] Cache Entry result: ' . $cacheFile);
				$this->putCacheFile( $cacheFile, serialize( $this->entryResultObj ) );
				$this->outputFromCache = true;
			}
		}
		return $this->entryResultObj;
	}
	
	function getEntryResultFromApi(){
		$client = $this->getClient();
		// define resultObject prior to try catch call
		$resultObject = array();
		try {
			// NOTE this should probably be wrapped in a service class
			$params = array();
			// If no cache flag is on, ask the client to get request without cache
			if( $this->noCache ) {
				$client->addParam( $params, "nocache",  true );
			}
			$namedMultiRequest = new KalturaNamedMultiRequest( $client, $params );
			
			// Added support for passing referenceId instead of entryId
			$useReferenceId = false;
			if( ! $this->urlParameters['entry_id'] && isset($this->urlParameters['flashvars']['referenceId']) ) {
				// Use baseEntry->listByReferenceId
				$useReferenceId = true;
				$refIndex = $namedMultiRequest->addNamedRequest( 'referenceResult', 'baseEntry', 'listByReferenceId', array( 'refId' => $this->urlParameters['flashvars']['referenceId'] ) );
				$entryIdParamValue = '{' . $refIndex . ':result:objects:0:id}';
			} else {
				// Use normal baseEntry->get
				$namedMultiRequest->addNamedRequest( 'meta', 'baseEntry', 'get', array( 'entryId' => $this->urlParameters['entry_id'] ) );
				// Set entry id param value for other requests
				$entryIdParamValue = $this->urlParameters['entry_id'];
			}
			
			// Flavors - getByEntryId is deprecated - Use list instead
			$filter = new KalturaAssetFilter();
			$filter->entryIdEqual = $entryIdParamValue;
			$params = array( 'filter' => $filter );			
			$namedMultiRequest->addNamedRequest( 'flavors', 'flavorAsset', 'list', $params );
				
			// Access control NOTE: kaltura does not use http header spelling of Referer instead kaltura uses: "referrer"
			$params = array( 
				"contextDataParams" => array( 'referrer' =>  $this->getReferer() ),
				"entryId"	=> $entryIdParamValue
			);
			$namedMultiRequest->addNamedRequest( 'accessControl', 'baseEntry', 'getContextData', $params );
			
			// Entry Custom Metadata
			// Always get custom metadata for now 
			//if( $this->getPlayerConfig(false, 'requiredMetadataFields') ) {
				$filter = new KalturaMetadataFilter();
				$filter->orderBy = KalturaMetadataOrderBy::CREATED_AT_ASC;
				$filter->objectIdEqual = $entryIdParamValue;
				$filter->metadataObjectTypeEqual = KalturaMetadataObjectType::ENTRY;
				
				$metadataPager =  new KalturaFilterPager();
				$metadataPager->pageSize = 1;
				$params = array( 'filter' => $filter, 'metadataPager', $metadataPager );
				$namedMultiRequest->addNamedRequest( 'entryMeta', 'metadata_metadata', 'list', $params );
			//}
			
			// Entry Cue Points
			//if( $this->getPlayerConfig(false, 'getCuePointsData') !== false ) {
				$filter = new KalturaCuePointFilter();
				$filter->orderBy = KalturaAdCuePointOrderBy::START_TIME_ASC;
				$filter->entryIdEqual = $entryIdParamValue;

				$params = array( 'filter' => $filter );
				$namedMultiRequest->addNamedRequest( 'entryCuePoints', "cuepoint_cuepoint", "list", $params );
			//}
			// Get the result object as a combination of baseResult and multiRequest
			$resultObject = $namedMultiRequest->doQueue();
			// If flavors are fetched, list contains a secondary 'objects' array
			if ( isset( $resultObject['flavors']->objects ) ) {
				$resultObject['flavors'] = $resultObject['flavors']->objects;
			}
			
			// Check if the server cached the result by search for "cached-dispatcher" in the request headers
			// If not, do not cache the request (Used for Access control cache issue)
			$requestCached = in_array( "X-Kaltura: cached-dispatcher", $client->getResponseHeaders() );
			if( $requestCached === false ) {
				$this->log('KalturaEntryResult::getEntryResultFromApi: Request headers: ' . print_r($client->getResponseHeaders(), true));
				$this->log('KalturaEntryResult::getEntryResultFromApi: set noCache flag to true');				
				$this->noCache = true;
			}
			
		} catch( Exception $e ){
			// Update the Exception and pass it upward
			throw new Exception( KALTURA_GENERIC_SERVER_ERROR . "\n" . $e->getMessage() );
			return array();
		}

		if( $useReferenceId ) {
			if( $resultObject['referenceResult'] && $resultObject['referenceResult']->objects ) {
				$this->urlParameters['entry_id'] = $resultObject['referenceResult']->objects[0]->id;
				$resultObject['meta'] = $resultObject['referenceResult']->objects[0];
			} else {
				$resultObject['meta'] = array();
			}
		}
		// Check that the ks was valid on the first response ( flavors ) 
		if( is_array( $resultObject['meta'] ) && isset( $resultObject['meta']['code'] ) && $resultObject['meta']['code'] == 'INVALID_KS' ){
			$this->error = 'Error invalid KS';
			return array();
		}
		
		// Set partner id from entry meta data
		if( is_object( $resultObject['meta'] ) &&  isset($resultObject['meta']->partnerId) ) {
			$this->partnerId = $resultObject['meta']->partnerId;
		}
		
		// Convert entryMeta to entryMeta XML
		if( isset( $resultObject['entryMeta'] ) && 
			isset( $resultObject['entryMeta']->objects[0] ) && 
			isset( $resultObject['entryMeta']->objects[0]->xml )
		){			
			$resultObject['entryMeta'] = $this->xmlToArray( new SimpleXMLElement( $resultObject['entryMeta']->objects[0]->xml ) );
		}

		// Add Cue Point data. Also check for 'code' error
		if( isset( $resultObject['entryCuePoints'] ) && is_object( $resultObject['entryCuePoints'] )
			&& $resultObject['entryCuePoints']->totalCount > 0 ){
			$resultObject[ 'entryCuePoints' ] = $resultObject['entryCuePoints']->objects;
		}
		
		// Check access control and throw an exception if not allowed: 
		if( isset( $resultObject['accessControl']) ){
			$acStatus = $this->isAccessControlAllowed( $resultObject );
			if( $acStatus !== true ){
				$this->error = $acStatus;
			}
		}
		return $resultObject;
	}
	
	/**
	*  Access Control Handling
	*/
	public function isAccessControlAllowed( $resultObject = null ) {
			
		// Kaltura only has entry level access control not playlist level access control atm: 
		// don't check anything without an entry_id
		if( !isset( $this->urlParameters['entry_id'] ) ){
			return true;
		}

		// If we have an error, return
		if( $this->error ) {
			return $this->error;
		}

		if( $resultObject === null ){
			$resultObject = $this->getEntryResult();
		}
		// check for access control resultObject property:
		if( !isset( $resultObject['accessControl']) ){
			return true;
		}
		$accessControl = $resultObject['accessControl'];
		
		// Check if we had no access control due to playlist
		if( is_array( $accessControl ) && isset( $accessControl['code'] )){
			// Error ? .. should do better error checking.
			// errors we have seen so far: 
				//$accessControl['code'] == 'MISSING_MANDATORY_PARAMETER'
				//$accessControl['code'] == 'INTERNAL_SERVERL_ERROR'  
			return true;
		}
		
		// Checks if admin
		if( $accessControl->isAdmin ) {
			return true;
		}

		/* Domain Name Restricted */
		if( $accessControl->isSiteRestricted ) {
			return "Un authorized domain\nWe're sorry, this content is only available on certain domains.";
		}

		/* Country Restricted */
		if( $accessControl->isCountryRestricted) {
			return "Un authorized country\nWe're sorry, this content is only available in certain countries.";
		}

		/* IP Address Restricted */
		if( $accessControl->isIpAddressRestricted) {
			return "Un authorized IP address\nWe're sorry, this content is only available for ceratin IP addresses.";
		}

		/* Session Restricted */
		if( $accessControl->isSessionRestricted && 
				( $accessControl->previewLength == -1 || $accessControl->previewLength == null ) )
		{
			return $this->getKalturaMsg( 'NO_KS' );
		}

		if( $accessControl->isScheduledNow === 0 || $accessControl->isScheduledNow === false ) {
			return "Out of scheduling\nWe're sorry, this content is currently unavailable.";
		}
		
		/*echo $this->getUserAgent() . '<br />';
		echo '<pre>'; print_r($accessControl); 
		exit();*/
		
		$userAgentMessage = "User Agent Restricted\nWe're sorry, this content is not available for your device.";
		if( isset( $accessControl->isUserAgentRestricted ) && $accessControl->isUserAgentRestricted ) {
			return $userAgentMessage;
		}
		return true;
	}
	
	/**
	 * Convert xml data to array
	 */
	function xmlToArray ( $data ){
		if ( is_object($data) ){
			$data = get_object_vars($data);
		}
		return (is_array($data)) ? array_map( array( $this, __FUNCTION__) ,$data) : $data;
	}	
}

