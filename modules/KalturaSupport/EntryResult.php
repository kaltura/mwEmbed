<?php
/**
 * Description of KalturaResultEntry
 *
 * @author ran
 */
class EntryResult {
	
	var $request = null;
	var $client = null;
	var $cache = null;
	var $logger = null;
	var $uiconf = null;
	var $noCache = null;
	var $error = null;
	var $entryResultObj = null;
	var $partnerId = 0;

	var $responseHeaders = array();

	function __construct( $request, $client, $cache, $logger, $uiconf ) {

		if(!$request)
			throw new Exception("Error missing request object");
		if(!$client)
			throw new Exception("Error missing client object");
		if(!$cache)
			throw new Exception("Error missing cache object");
		if(!$logger)
			throw new Exception("Error missing logger object");
		if(!$uiconf)
			throw new Exception("Error missing uiconf object");
		
		// Set our objects
		$this->request = $request;
		$this->client = $client;
		$this->cache = $cache;
		$this->logger = $logger;
		$this->uiconf = $uiconf;
	}

	function getResponseHeaders() {
		global $wgKalturaUiConfCacheTime;
		// only use response headers if not cachable
		if( !$this->isCachable( $this->entryResultObj ) ){
			return $this->responseHeaders;
		}
		// else cache for cache key save time: 
		$saveTime = $this->cache->get( $this->getCacheKey() + '_savetime' );
		if( !$saveTime ){
			$saveTime = time();
		}
		return array(
			"Cache-Control: public, max-age=$wgKalturaUiConfCacheTime, max-stale=0",
			"Expires: " . gmdate( "D, d M Y H:i:s", $saveTime + $wgKalturaUiConfCacheTime ) . " GM",
		);
	}
	
	function getResult(){
		$mediaProxyOverride = json_decode(json_encode( $this->uiconf->getPlayerConfig( 'mediaProxy' ) ), true);
		// check for user supplied mediaProxy override of entryResult
		if( $mediaProxyOverride && isset( $mediaProxyOverride['entry'] ) ){
			$mediaProxyOverride['entry']['manualProvider'] = 'true';
			return $mediaProxyOverride;
		}
		// Check for entry or reference Id
		if( ! $this->request->getEntryId() && ! $this->request->getReferenceId() ) {
			return array();
		}
		
		// Check for entry cache:
		if ( !$this->request->hasKS() ){
            $this->entryResultObj = unserialize( $this->cache->get( $this->getCacheKey() ) );
            if( $this->entryResultObj ){
                return $this->entryResultObj;
            }
        }
		
		// Check if we have a cached result object:
		if( ! $this->entryResultObj ){
			$this->entryResultObj = $this->getEntryResultFromApi();
		}
		// if no errors, not admin and we have access, add to cache. 
		// note playback will always go through playManifest 
		// so we don't care if we cache where one users has permission but another does not. 
		// we never cache admin or ks users access so would never expose info that not defined across anonymous regional access. 
		if( $this->isCachable() ){
			$this->cache->set( $this->getCacheKey(), serialize( $this->entryResultObj ) );
			$this->cache->set( $this->getCacheKey() + '_savetime', time() );
		}
		
		//check if we have errors on the entry
		if ($this->error) {
			$this->entryResultObj['error'] = $this->error;
		}
		return $this->entryResultObj;
	}
	function isCachable(){
		return !$this->error 
				&& 
			$this->isAccessControlAllowed( $this->entryResultObj ) 
				&&
			!$this->request->hasKS();
	}
	function getCacheKey(){
		$key = '';
		if ($this->request->isEmbedServicesEnabled() && $this->request->isEmbedServicesRequest()){
			$key.= md5( serialize( $this->request->getEmbedServicesRequest() ) );
		}
		if( $this->request->getEntryId() ){
			$key.= $this->request->getEntryId();
		}
		if( $this->request->getReferenceId() ){
			$key.= $this->request->getReferenceId();
		}
		return $key;
	}
	function getEntryResultFromApi(){
		global $wgKalturaApiFeatures;

		// Check if the API supports entryRedirect feature
		$supportsEntryRedirect = isset($wgKalturaApiFeatures['entryRedirect']) ? $wgKalturaApiFeatures['entryRedirect'] : false;

		$client = $this->client->getClient();
		// define resultObject prior to try catch call
		$resultObject = array();
		try {
			// NOTE this should probably be wrapped in a service class
			$params = array();
			// If no cache flag is on, ask the client to get request without cache
			if( $this->request->noCache ) {
				$client->addParam( $params, "nocache",  true );
			}
			$namedMultiRequest = new KalturaNamedMultiRequest( $client, $params );

			$filter = new KalturaBaseEntryFilter();
			if( ! $this->request->getEntryId() && $this->request->getReferenceId() ) {
				$filter->referenceIdEqual = $this->request->getReferenceId();
			} else if( $supportsEntryRedirect && $this->request->getFlashVars('disableEntryRedirect') !== true ){
				$filter->redirectFromEntryId = $this->request->getEntryId();
			} else {
				$filter->idEqual = $this->request->getEntryId();
			}

			if ($this->request->isEmbedServicesEnabled() && $this->request->isEmbedServicesRequest()){
				$filter->freeText = urlencode(json_encode($this->request->getEmbedServicesRequest()));
			}

			$baseEntryIdx = $namedMultiRequest->addNamedRequest( 'meta', 'baseEntry', 'list', array('filter' => $filter) );
			// Get entryId from the baseEntry request response
			$entryId = '{' . $baseEntryIdx . ':result:objects:0:id}';
			
			// ------- Disabled AC from iframe. -----
			// Access control NOTE: kaltura does not use http header spelling of Referer instead kaltura uses: "referrer"
			$filter = $this->getACFilter();
			$params = array( 
				"contextDataParams" => $filter,
				"entryId"	=> $entryId
			);
			$namedMultiRequest->addNamedRequest( 'contextData', 'baseEntry', 'getContextData', $params );
			
			
			// Entry Custom Metadata
			// Always get custom metadata for now 
			//if( $this->uiconf->getPlayerConfig(false, 'requiredMetadataFields') ) {
				$filter = new KalturaMetadataFilter();
				$filter->orderBy = KalturaMetadataOrderBy::CREATED_AT_ASC;
				$filter->objectIdEqual = $entryId;
				$filter->metadataObjectTypeEqual = KalturaMetadataObjectType::ENTRY;
				// Check if metadataProfileId is defined
				$metadataProfileId = $this->uiconf->getPlayerConfig( false, 'metadataProfileId' );
				if( $metadataProfileId ){
					$filter->metadataProfileIdEqual = $metadataProfileId;
				}
				
				$metadataPager =  new KalturaFilterPager();
				$metadataPager->pageSize = 1;
				$params = array( 'filter' => $filter, 'metadataPager', $metadataPager );
				$namedMultiRequest->addNamedRequest( 'entryMeta', 'metadata_metadata', 'list', $params );
			//}
			
			// Entry Cue Points
			// Always get Cue Points for now
			//if( $this->uiconf->getPlayerConfig(false, 'getCuePointsData') !== false ) {
				$filter = new KalturaCuePointFilter();
				$filter->orderBy = KalturaAdCuePointOrderBy::START_TIME_ASC;
				$filter->entryIdEqual = $entryId;

				$params = array( 'filter' => $filter );
				$namedMultiRequest->addNamedRequest( 'entryCuePoints', "cuepoint_cuepoint", "list", $params );
			//}

			// Get the result object as a combination of baseResult and multiRequest
			$resultObject = $namedMultiRequest->doQueue();
			//print_r($resultObject);exit();
			$this->responseHeaders = $client->getResponseHeaders();

		} catch( Exception $e ){
			// Update the Exception and pass it upward
			throw new Exception( KALTURA_GENERIC_SERVER_ERROR . "\n" . $e->getMessage() );
			return array();
		}

		if( is_object($resultObject['meta']) 
			&& isset($resultObject['meta']->objects) 
			&& count($resultObject['meta']->objects) ) {
			$this->request->set('entry_id', $resultObject['meta']->objects[0]->id);
			$resultObject['meta'] = $resultObject['meta']->objects[0];
		} else {
			$resultObject['meta'] = array();
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
		
		// Check access control and flavorAssets and throw an exception if not allowed: 
		if( isset( $resultObject['contextData']) ){
			$acStatus = $this->isAccessControlAllowed( $resultObject );
			if( $acStatus !== true ){
				$this->error = $acStatus;
			}
		}
		return $resultObject;
	}
	public function getACFilter(){
		$filter = new KalturaEntryContextDataParams();
		$filter->referrer = $this->request->getReferer();
		$filter->userAgent = $this->request->getUserAgent();
		$filter->flavorTags = 'all';
		if ( $this->uiconf->getPlayerConfig( false, 'flavorTags' ) ) {
		    $filter->flavorTags = $this->uiconf->getPlayerConfig( false, 'flavorTags' );
		}
		if( $this->uiconf->getPlayerConfig( false, 'streamerType' ) ) {
			$filter->streamerType =  $this->uiconf->getPlayerConfig( false, 'streamerType' );
		}
		return $filter;
	}
	/**
	*  Access Control Handling
	*/
	public function isAccessControlAllowed( $resultObject = null ) {
			
		// Kaltura only has entry level access control not playlist level access control atm: 
		// don't check anything without an entry_id
		/*if( !$this->request->getEntryId() ){
			return true;
		}*/

		// If we have an error, return
		if( $this->error ) {
			return $this->error;
		}

		if( $resultObject === null ){
			$resultObject = $this->getResult();
		}
		// check for access control resultObject property:
		if( !isset( $resultObject['contextData']) ){
			return true;
		}
		$accessControl = (array) $resultObject['contextData'];
		
		// Check if we had no access control due to playlist
		if( is_array( $accessControl ) && isset( $accessControl['code'] )){
			// Error ? .. should do better error checking.
			// errors we have seen so far: 
				//$accessControl['code'] == 'MISSING_MANDATORY_PARAMETER'
				//$accessControl['code'] == 'INTERNAL_SERVERL_ERROR'  
			return true;
		}

		// Checks if admin
		if( isset( $accessControl['isAdmin'] ) && $accessControl['isAdmin']) {
			return true;
		}

		/* Domain Name Restricted */
		if( isset( $accessControl['isSiteRestricted'] ) && $accessControl['isSiteRestricted'] ) {
			return "Un authorized domain\nWe're sorry, this content is only available on certain domains.";
		}

		/* Country Restricted */
		if( isset( $accessControl['isCountryRestricted'] ) && $accessControl['isCountryRestricted'] ) {
			return "Un authorized country\nWe're sorry, this content is only available in certain countries.";
		}

		/* IP Address Restricted */
		if( isset( $accessControl['isIpAddressRestricted'] ) && $accessControl['isIpAddressRestricted'] ) {
			return "Un authorized IP address\nWe're sorry, this content is only available for certain IP addresses.";
		}

		/* Session Restricted */
		if( ( isset( $accessControl['isSessionRestricted'] ) && $accessControl['isSessionRestricted'] ) 
				&& 
			( 
				isset( $accessControl['previewLength'] ) 
					&& 
				( $accessControl['previewLength'] == -1 || $accessControl['previewLength'] == null ) 
			)
		){
			return "No KS where KS is required\nWe're sorry, access to this content is restricted.";
		}

		if( isset( $accessControl['isScheduledNow'] ) && 
			( $accessControl['isScheduledNow'] === 0 || $accessControl['isScheduledNow'] === false ) 
		){
			return "Out of scheduling\nWe're sorry, this content is currently unavailable.";
		}
		
		/*echo $this->getUserAgent() . '<br />';
		echo '<pre>'; print_r($accessControl); 
		exit();*/
		
		$userAgentMessage = "User Agent Restricted\nWe're sorry, this content is not available for your device.";
		if( isset( $accessControl['isUserAgentRestricted'] ) && $accessControl['isUserAgentRestricted'] ) {
			return $userAgentMessage;
		}

		// check for generic "block"
		$actions = isset( $accessControl->accessControlActions ) ? 
					$accessControl->accessControlActions:
					isset( $accessControl->actions )? $accessControl->actions: null;

		if( $actions && count( $actions ) ) {
			for($i=0;$i<count($actions); $i++){
				$actionsObj = $actions[$i];

				if( get_class( $actionsObj ) == 'KalturaAccessControlBlockAction' ){
					return "No KS where KS is required\nWe're sorry, access to this content is restricted.";
				}
			}
		}
		
		return true;
	}

	public function getPartnerId() {
		return $this->partnerId;
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

