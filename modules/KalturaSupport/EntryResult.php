<?php

/**
 * Description of KalturaResultEntry
 *
 * @author ran
 */
class EntryResult
{

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

    function __construct($request, $client, $cache, $logger, $uiconf)
    {

        if (!$request)
            throw new Exception("Error missing request object");
        if (!$client)
            throw new Exception("Error missing client object");
        if (!$cache)
            throw new Exception("Error missing cache object");
        if (!$logger)
            throw new Exception("Error missing logger object");
        if (!$uiconf)
            throw new Exception("Error missing uiconf object");

        // Set our objects
        $this->request = $request;
        $this->client = $client;
        $this->cache = $cache;
        $this->logger = $logger;
        $this->uiconf = $uiconf;
    }

    function getResponseHeaders()
    {
        global $wgKalturaUiConfCacheTime;
        // only use response headers if not cachable
        if (!$this->isCachable($this->entryResultObj)) {
            return $this->responseHeaders;
        }
        // else cache for cache key save time:
        $saveTime = $this->cache->get($this->getCacheKey() . '_savetime');
        if (!$saveTime) {
            $saveTime = time();
        }
        return array(
            "Cache-Control: public, max-age=$wgKalturaUiConfCacheTime, max-stale=0",
            "Expires: " . gmdate("D, d M Y H:i:s", $saveTime + $wgKalturaUiConfCacheTime) . " GMT",
        );
    }

    function getResult()
    {
        $mediaProxyOverride = json_decode(json_encode($this->uiconf->getPlayerConfig('mediaProxy')), true);
        // Check for entry or reference Id
        if (!$this->request->getEntryId() && !$this->request->getReferenceId()) {

            // check for user supplied mediaProxy override of entryResult
            if ($mediaProxyOverride && isset($mediaProxyOverride['entry'])) {
                $mediaProxyOverride['entry']['manualProvider'] = 'true';
                return $mediaProxyOverride;
            }
            return array();
        }

        // Check for entry non-expired entry cache:
        if (!$this->request->hasKS()) {
            $this->entryResultObj = unserialize($this->cache->get($this->getCacheKey()));
        }

        // Check if we have need to load from api
        if (!$this->entryResultObj) {
            $this->entryResultObj = $this->getEntryResultFromApi();
            // if no errors, not admin and we have access, and we have a fresh API result, add to cache.
            // note playback will always go through playManifest
            // so we don't care if we cache where one users has permission but another does not.
            // we never cache admin or ks users access so would never expose info that not defined across anonymous regional access.
            if ($this->isCachable()) {
                $this->cache->set($this->getCacheKey(), serialize($this->entryResultObj));
                $this->cache->set($this->getCacheKey() . '_savetime', time());
            }
        }
        // check if we have errors on the entry
        if ($this->error) {
            $this->entryResultObj['error'] = $this->error;
        }
        // merge in mediaProxy values if set:
        if ($mediaProxyOverride) {
            $this->entryResultObj = array_replace_recursive($this->entryResultObj, $mediaProxyOverride);
            if (isset($mediaProxyOverride['sources'])) {
                $mediaProxyOverride['entry']['manualProvider'] = 'true';
            }
        }
        return $this->entryResultObj;
    }

    function isCachable()
    {
        return !$this->error
        &&
        $this->isAccessControlAllowed($this->entryResultObj)
        &&
        !$this->request->hasKS();
    }

    function getCacheKey()
    {
        //Cache by entryId and protocol
        global $wgForceCache, $wgHTTPProtocol;
        $key = '';
        if ($this->request->isEmbedServicesEnabled() && $this->request->isEmbedServicesRequest()) {
            if ($wgForceCache) {
                $data = $this->request->getEmbedServicesRequest();
                $config = "none";
                if (isset($data->config)) {
                    $config = serialize($data->config);
                }
                $cacheKey = $data->MediaID . '_' . $config;
                $key .= md5(serialize($cacheKey));
            } else
                $key .= md5(serialize($this->request->getEmbedServicesRequest()));
        }
        if ($this->request->getEntryId()) {
            $key .= $this->request->getEntryId();
        }
        if ($this->request->getReferenceId()) {
            $key .= $this->request->getReferenceId();
        }
        $key .= ".".$wgHTTPProtocol;
        return $key;
    }

    function getEntryResultFromApi()
    {
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
            if ($this->request->noCache) {
                $client->addParam($params, "nocache", true);
            }
            $namedMultiRequest = new KalturaNamedMultiRequest($client, $params);

            $filter = new KalturaBaseEntryFilter();
            if (!$this->request->getEntryId() && $this->request->getReferenceId()) {
                $filter->referenceIdEqual = $this->request->getReferenceId();
            } else if ($supportsEntryRedirect && $this->uiconf->getPlayerConfig(false, 'disableEntryRedirect') !== true) {
                $filter->redirectFromEntryId = $this->request->getEntryId();
            } else {
                $filter->idEqual = $this->request->getEntryId();
            }

            $responseProfile = array(
                "type" => 2,
                "fields" => "userId,creatorId"
            );

            if ($this->request->isEmbedServicesEnabled() && $this->request->isEmbedServicesRequest()) {
                $filter->freeText = urlencode(json_encode($this->request->getEmbedServicesRequest()));
            }

            $baseEntryIdx = $namedMultiRequest->addNamedRequest('meta', 'baseEntry', 'list', array('filter' => $filter, 'responseProfile' => $responseProfile));
            // Get entryId from the baseEntry request response
            $entryId = '{' . $baseEntryIdx . ':result:objects:0:id}';

            // ------- Disabled AC from iframe. -----
            // Access control NOTE: kaltura does not use http header spelling of Referer instead kaltura uses: "referrer"
            $filter = $this->getACFilter();
            $params = array(
                "contextDataParams" => $filter,
                "entryId" => $entryId
            );
            $namedMultiRequest->addNamedRequest('contextData', 'baseEntry', 'getContextData', $params);


            // Entry Custom Metadata
            // Always get custom metadata for now
            //if( $this->uiconf->getPlayerConfig(false, 'requiredMetadataFields') ) {
            $filter = new KalturaMetadataFilter();
            $filter->orderBy = KalturaMetadataOrderBy::CREATED_AT_ASC;
            $filter->objectIdEqual = $entryId;
            $filter->metadataObjectTypeEqual = KalturaMetadataObjectType::ENTRY;
            // Check if metadataProfileId is defined
            $metadataProfileId = $this->uiconf->getPlayerConfig(false, 'metadataProfileId');
            if ($metadataProfileId) {
                $filter->metadataProfileIdEqual = $metadataProfileId;
            }

            $metadataPager = new KalturaFilterPager();
            $metadataPager->pageSize = 1;
            $params = array('filter' => $filter, 'metadataPager', $metadataPager);
            $namedMultiRequest->addNamedRequest('entryMeta', 'metadata_metadata', 'list', $params);
            //}

            // Entry Cue Points
            // Always get Cue Points for now
            //if( $this->uiconf->getPlayerConfig(false, 'getCuePointsData') !== false ) {
            $filter = new KalturaCuePointFilter();
            $filter->orderBy = KalturaAdCuePointOrderBy::START_TIME_ASC;
            $filter->entryIdEqual = $entryId;

            $params = array('filter' => $filter);
            $namedMultiRequest->addNamedRequest('entryCuePoints', "cuepoint_cuepoint", "list", $params);
            //}

            // Get the result object as a combination of baseResult and multiRequest
            $resultObject = $namedMultiRequest->doQueue();
            //print_r($resultObject);exit();
            $this->responseHeaders = $client->getResponseHeaders();

        } catch (Exception $e) {
            // Update the Exception and pass it upward
            throw new Exception(KALTURA_GENERIC_SERVER_ERROR . "\n" . $e->getMessage());
            return array();
        }

        if (is_object($resultObject['meta'])
            && isset($resultObject['meta']->objects)
            && count($resultObject['meta']->objects)
        ) {
            $this->request->set('entry_id', $resultObject['meta']->objects[0]->id);
            $resultObject['meta'] = $resultObject['meta']->objects[0];
        } else {
            $resultObject['meta'] = array();
        }
        // Check that the ks was valid on the first response ( flavors )
        if (is_array($resultObject['meta']) && isset($resultObject['meta']['code']) && $resultObject['meta']['code'] == 'INVALID_KS') {
            $this->error = 'Error invalid KS';
            return array();
        }

        $vars = $this->uiconf->playerConfig['vars'];
        $playerConfig = $this->uiconf->getPlayerConfig();
        if (is_array($resultObject['contextData']) && isset($resultObject['contextData']['code']) && $resultObject['contextData']['code'] == 'ENTRY_ID_NOT_FOUND' && !isset($vars['referenceId'])) {
            if (!isset($playerConfig['plugins']['strings']['mwe-embedplayer-missing-source'])) {
                $this->error = 'No source video was found';
            }
            return array();
        }

        //if the video is still uploading or converting
        if (isset($resultObject['meta']) && isset($resultObject['meta']->status) &&
            ($resultObject['meta']->status == 0 || $resultObject['meta']->status == 1)
        ) {
            if (!isset($playerConfig['plugins']['strings']['ks-ENTRY_CONVERTING'])) {
                $this->error = 'No source video was found - Entry in process';
                return array();
            }
        }


        // Set partner id from entry meta data
        if (is_object($resultObject['meta']) && isset($resultObject['meta']->partnerId)) {
            $this->partnerId = $resultObject['meta']->partnerId;
        }

        // Convert entryMeta to entryMeta XML
        if (isset($resultObject['entryMeta']) &&
            isset($resultObject['entryMeta']->objects[0]) &&
            isset($resultObject['entryMeta']->objects[0]->xml)
        ) {
            $resultObject['entryMeta'] = $this->xmlToArray(new SimpleXMLElement($resultObject['entryMeta']->objects[0]->xml));
        }

        // Add Cue Point data. Also check for 'code' error
        if (isset($resultObject['entryCuePoints'])
            && is_object($resultObject['entryCuePoints'])
            && $resultObject['entryCuePoints']->totalCount > 0
            && count($resultObject['entryCuePoints']->objects) > 0
        ) {
            // count the number of missing objects
            $countDiff = $resultObject['entryCuePoints']->totalCount - count($resultObject['entryCuePoints']->objects);
            if ($countDiff > 0) {
                $remainingPagesObject = $this->doCuePointsMultiPageRequest($client, $resultObject);
                if (is_array($remainingPagesObject) && count($remainingPagesObject) > 0) {
                    $resultObject['entryCuePoints'] = $this->mergeAllCuePointsPages($resultObject, $remainingPagesObject);
                }
            } else {
                $resultObject['entryCuePoints'] = $resultObject['entryCuePoints']->objects;
            }
        }

        // Check access control and flavorAssets and throw an exception if not allowed:
        if (isset($resultObject['contextData'])) {
            $acStatus = $this->isAccessControlAllowed($resultObject);
            if ($acStatus !== true) {
                $this->error = $acStatus;
            }
        }
        return $resultObject;
    }

    private function doCuePointsMultiPageRequest($client, $resultObject)
    {
        try {
            // we define the number of objects retrieved in the original response as page size
            $pageSize = count($resultObject['entryCuePoints']->objects);
            // count the number of missing objects
            $countDiff = $resultObject['entryCuePoints']->totalCount - $pageSize;
            // create new multi request
            $params = array();
            $extraPagesObject = array();
            if ($this->request->noCache) {
                $client->addParam($params, "nocache", true);
            }
            $pagesMultiRequest = new KalturaNamedMultiRequest($client, $params);
            // retrieve the number of missing pages.
            // for example: 700 / 500 = ceil(1.4) = 2 pages (500 from the first and 200 from the second)
            $missingPages = ceil($countDiff / $pageSize);
            for ($i = 0; $i < $missingPages; $i++) {
                // we added 2 to the requested page since we already have the first page.
                // for example: i=0 -> page 2, i=1 -> page 3 and so on...
                $requestedPage = $i + 2;
                $filter = new KalturaCuePointFilter();
                $filter->orderBy = KalturaAdCuePointOrderBy::START_TIME_ASC;
                $filter->entryIdEqual = $this->request->getEntryId();
                $pager = new KalturaFilterPager();
                $pager->pageSize = $pageSize;
                $pager->pageIndex = $requestedPage;
                $pageParams = array('filter' => $filter, 'pager' => $pager);
                $pagesMultiRequest->addNamedRequest('entryCuePoints_page' . $requestedPage, "cuepoint_cuepoint", "list", $pageParams);
            }
            return $pagesMultiRequest->doQueue();
        } catch (Exception $e) {
            // Update the Exception and pass it upward
            throw new Exception(KALTURA_GENERIC_SERVER_ERROR . "\n" . $e->getMessage());
            return array();
        }
    }

    private function mergeAllCuePointsPages($firstPage, $remainingPages)
    {
        $mergedPages = $firstPage['entryCuePoints']->objects;
        for ($i = 0; $i < count($remainingPages); $i++) {
            $pageNum = $i + 2;
            if (isset($remainingPages['entryCuePoints_page' . $pageNum])
                && is_object($remainingPages['entryCuePoints_page' . $pageNum])
                && count($remainingPages['entryCuePoints_page' . $pageNum]->objects) > 0
            ) {
                $mergedPages = array_merge($mergedPages, $remainingPages['entryCuePoints_page' . $pageNum]->objects);
            }
        }
        return $mergedPages;
    }

    public function getACFilter()
    {
        $filter = new KalturaEntryContextDataParams();
        $filter->referrer = $this->request->getReferer();
        $filter->userAgent = $this->request->getUserAgent();
        $filter->flavorTags = 'all';
        if ($this->uiconf->getPlayerConfig(false, 'flavorTags')) {
            $filter->flavorTags = $this->uiconf->getPlayerConfig(false, 'flavorTags');
        }
        if ($this->uiconf->getPlayerConfig(false, 'streamerType')) {
            $filter->streamerType = $this->uiconf->getPlayerConfig(false, 'streamerType');
        }
        return $filter;
    }

    /**
     *  Access Control Handling
     */
    public
    function isAccessControlAllowed($resultObject = null)
    {

        // Kaltura only has entry level access control not playlist level access control atm:
        // don't check anything without an entry_id
        /*if( !$this->request->getEntryId() ){
            return true;
        }*/

        // If we have an error, return
        if ($this->error) {
            return $this->error;
        }

        if ($resultObject === null) {
            $resultObject = $this->getResult();
        }
        // check for access control resultObject property:
        if (!isset($resultObject['contextData'])) {
            return true;
        }
        $accessControl = (array)$resultObject['contextData'];

        // Check if we had no access control due to playlist
        if (is_array($accessControl) && isset($accessControl['code'])) {
            // Error ? .. should do better error checking.
            // errors we have seen so far:
            //$accessControl['code'] == 'MISSING_MANDATORY_PARAMETER'
            //$accessControl['code'] == 'INTERNAL_SERVERL_ERROR'
            return true;
        }

        /* Domain Name Restricted */
        if (isset($accessControl['isSiteRestricted']) && $accessControl['isSiteRestricted']) {
            return "Un authorized domain\nWe're sorry, this content is only available on certain domains.";
        }

        /* Country Restricted */
        if (isset($accessControl['isCountryRestricted']) && $accessControl['isCountryRestricted']) {
            return "Un authorized country\nWe're sorry, this content is only available in certain countries.";
        }

        /* IP Address Restricted */
        if (isset($accessControl['isIpAddressRestricted']) && $accessControl['isIpAddressRestricted']) {
            return "Un authorized IP address\nWe're sorry, this content is only available for certain IP addresses.";
        }

        /* Session Restricted */
        if ((isset($accessControl['isSessionRestricted']) && $accessControl['isSessionRestricted'])
            &&
            (
                isset($accessControl['previewLength'])
                &&
                ($accessControl['previewLength'] == -1 || $accessControl['previewLength'] == null)
            )
        ) {
            return "No KS where KS is required\nWe're sorry, access to this content is restricted.";
        }

        if (isset($accessControl['isScheduledNow']) &&
            ($accessControl['isScheduledNow'] === 0 || $accessControl['isScheduledNow'] === false)
        ) {
            return "Out of scheduling\nWe're sorry, this content is currently unavailable.";
        }

        /*echo $this->getUserAgent() . '<br />';
        echo '<pre>'; print_r($accessControl);
        exit();*/

        $userAgentMessage = "User Agent Restricted\nWe're sorry, this content is not available for your device.";
        if (isset($accessControl['isUserAgentRestricted']) && $accessControl['isUserAgentRestricted']) {
            return $userAgentMessage;
        }

        // check for generic "block"
        $actions = isset($accessControl['accessControlActions']) ?
            $accessControl['accessControlActions'] :
            isset($accessControl['actions']) ? $accessControl['actions'] : null;


        if ($actions && count($actions)) {
            for ($i = 0; $i < count($actions); $i++) {
                $actionsObj = $actions[$i];

                if (get_class($actionsObj) == 'KalturaAccessControlBlockAction') {
                    return "No KS where KS is required\nWe're sorry, access to this content is restricted.";
                }
            }
        }

        return true;
    }

    public
    function getPartnerId()
    {
        return $this->partnerId;
    }

    /**
     * Convert xml data to array
     */
    function xmlToArray($data)
    {
        if (is_object($data)) {
            $data = get_object_vars($data);
        }
        return (is_array($data)) ? array_map(array($this, __FUNCTION__), $data) : $data;
    }
}

