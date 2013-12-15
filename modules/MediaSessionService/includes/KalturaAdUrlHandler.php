<?php 
require_once( dirname( __FILE__ ) . '/WebsocketLogger.php' );

class KalturaAdUrlHandler{
	// partner data: 
	// set to player.kaltura.com account for now ( $wgKalturaAdminSecret is already integrated to staging )
	var $adPartnerId = '243342';
	var $adRefId = null;
	var $adEntryResult = null;
	var $adEntryRequest = null;
	var $hlsUrl = null;
	
	var $maxRedirects = 3;
	function __construct( $vastUrl ){
		global $container; 
		$this->vastUrl = $vastUrl;
		$this->client = $container['client_helper'];
		$this->websocketLogger = $container['websocket_logger'];
	}
	function getHLSUrl(){
		if( $this->hlsUrl === null ){
			$this->hlsUrl = $this->getHLSSource();
		}
		return $this->hlsUrl;
	}
	function getHLSSource(){
		$this->websocketLogger->send("Get Ad HLS source");
		// check that we can get a ref id: 
		if( $this->getAdRefId() === false ){
			// vast url may not be active
			$this->websocketLogger->send("Invalid source Ad url");
			return false;
		}
		// get entry results via ref id:
		$sources = $this->getAdEntrySources();
		if( count( $sources ) == 0 ){
			//echo "# " . $this->getAdRefId() . " not yet ready\n";
			$this->websocketLogger->send( "Ad: " . $this->getAdRefId() . " not yet ready, do import and skip ad");
			// asset can't be imported instantly, return false for this pass
			$this->importAdEntry();
			return false;
		}
		// return the HLS source: 
		foreach( $sources as $source){
			// technically there are iPadNew and iPhoneNew ( two Adaptive sets )
			// We may want to consolidate now that bugs around Adaptive are not as common in iOS
			if( $source['type'] == 'application/vnd.apple.mpegurl' ){
				$this->websocketLogger->send( "Found Ad HLS, ad id: " . $this->getAdRefId() );
				//echo "#got source: " . $source['src'] . " \n";
				return $source['src'];
			}
		}
	}
	function importAdEntry(){
		global $wgKalturaAdminSecret;
		$client = $this->client->getClient();

		// First check that the refid is not already present:
		if( $this->isRefEntryPresent() ){
			//echo "# Entry, but found not yet ready\n";
			// entry was found ( assume import is in progress )
			// TODO some error handling, maybe re-issue the import depending on error type? 
			return false;;
		} else {
			//echo "# {$this->getAdRefId()}  not found\n";
		}
		// authenticate:
		$ks = $client->session->start ($wgKalturaAdminSecret, 'ad-importer', KalturaSessionType::ADMIN, $this->adPartnerId );
		$client->setKS( $ks );
		
		$entry = new KalturaPlayableEntry();
		$entry->name = "VAST AD: ". substr( $this->getAdRefId(),0, 8 );
		$entry->mediaType = KalturaMediaType::VIDEO;
		$entry->referenceId = $this->getAdRefId();
		$type = KalturaEntryType::MEDIA_CLIP;
		$entryResult  = $client->baseEntry->add($entry, $type);

		// create url resource: 
		$urlResource = new KalturaUrlResource();
		$urlResource->url = $this->vastUrl;
		$mediaResult = $client->media->addcontent( $entryResult->id, $urlResource);
		
		//echo "# created entry , {$entryResult->id} \n";
	}
	function isRefEntryPresent(){
		$client = $this->client->getClient();
		$filter = new KalturaBaseEntryFilter();
		$filter->referenceIdEqual = $this->getAdRefId();
		$pager = null;
		$result = $client->baseEntry->listAction($filter, $pager);
		return $result->totalCount;
	}
	/**
	 * Get the ref Id once per session ( will request 
	 * @return boolean
	 */
	function getAdRefId(){
		if( $this->adRefId === null){
			// hash the url + head content length request on the ad, set as ref id.
			// this has the added benefit of confirming the "url" is still online
			$contentLengh = $this->getContentLengthHeader( $this->vastUrl, 0 );
			// content length request failed, return false ( content may be offline )
			if( $contentLengh === false){
				return false;
			}
			
			$this->adRefId = md5( $contentLengh . $this->vastUrl );
		}
		return $this->adRefId;
	}
	function getAdEntrySources(){
		
		$kSources = new KalturaSources( $this->getAdEntryResult() );
		// don't redirect on missing sources: 
		$kSources->setRedirectOnError( false );
		$sources = $kSources->getSources();
		
		return $sources;
	}
	function getAdEntryRequest(){
		global $container;
		if( !$this->adEntryRequest ){
			$this->adEntryRequest = new RequestHelper( $container['utility_helper'] );
			// remove "entryId" if set
			$this->adEntryRequest->remove( 'entry_id' );
			// remove partner id if set,
			$this->adEntryRequest->remove( 'partner_id' );
			
			$this->adEntryRequest->set( 'flashvars', array( 'referenceId' => $this->getAdRefId() ) );
			$this->adEntryRequest->set( 'wid', '_243342' );
		}
		return $this->adEntryRequest;
	}
	function getAdEntryResult(){
		global $container;
		if( !$this->adEntryResult ){
			$this->adEntryResult = new EntryResult(
					$this->getAdEntryRequest(),
					$container['client_helper'],
					$container['cache_helper'],
					$container['logger'],
					$container['uiconf_result']
			);
		}
		return $this->adEntryResult;
	}
	/**
	 * return false, if url does not resolve, or the header of the url
	 */
	function getContentLengthHeader( $url, $depth = 0 ){
		$headers= get_headers( $url );
		// failed request:
		if( $headers === false ){
			return false;
		}
		if( $depth > $this->maxRedirects ){
			// error hit max redirects:
			return false;
		}
		foreach( $headers as $head ){
			if( strpos( $head, 'Location:' ) !== false ){
				return $this->getContentLengthHeader( trim( str_replace('Location:','', $head) ), $depth++ );
			}
		}
		// no Location header return content length: 
		foreach( $headers as $head ){
			if( strpos( $head, 'Content-Length:' ) !== false ){
				return trim( str_replace( 'Content-Length:', '', $head ) );
			}
		}
	}
}