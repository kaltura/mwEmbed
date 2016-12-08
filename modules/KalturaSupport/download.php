<?php
/* 
 * This file will handle the download prodecure based on user agent.
 *
 * @author ran
 */
// Include configuration: ( will include LocalSettings.php )
chdir( dirname( __FILE__ ) . '/../../' );
require_once( 'includes/DefaultSettings.php' );
require_once( dirname( __FILE__ ) . '/KalturaCommon.php' );

$download = new downloadEntry();
$download->redirectDownload();

class downloadEntry {
	var $resultObject = null; // lazy init
	var $sources = null;
	var $forceDownload = false;

	/**
	 * Default constructor - Sets the forceDownload flag accordingly
	 */
	function __construct() {
		if( isset( $_GET[ 'forceDownload' ] ) ) {
			$this->forceDownload = true;
		}
	}
	
	/**
	 * The result object grabber, caches a local result object for easy access
	 * to result object properties. 
	 */
	function getResultObject(){
		global $container;
		if( ! $this->resultObject ){
			try {
				$this->resultObject =  $container['entry_result'];
			} catch ( Exception $e ){
				die( $e->getMessage() );
			}
		}
		return $this->resultObject;
	}
	// Errors set special X-Kaltura and X-Kaltura-App: header and then deliver the no sources video
	private function fatalError( $errorMsg ) {
		header( "X-Kaltura: error-6" );
		header( "X-Kaltura-App: exiting on error 6 - requested flavor was not found" );
		header( "X-Kaltura-Error: " . htmlspecialchars( $errorMsg ) );
		// Then redirect to no-sources video: 
		$this->sources = $this->getErrorVideoSources();
		$flavorUrl = $this->getSourceForUserAgent();
		header( "location: " . $flavorUrl );
		exit(1);
	}
	
	function redirectDownload() {
		$flavorUrl = $this->getSourceForUserAgent();
		$client = $this->getResultObject()->client->getClient();
		$mediaType = $this->getResultObject()->entryResultObj['meta']->mediaType;
		// Redirect to flavor
		header("Cache-Control: no-cache, must-revalidate"); // HTTP/1.1
		header("Pragma: no-cache");
		header("Expires: Sat, 26 Jul 1997 05:00:00 GMT"); // Date in the past
		if ( $this->forceDownload ) {
			header( "Content-Description: File Transfer" );
			header( "Content-Type: application/force-download" );
			$extension = strrchr( substr( $flavorUrl, 0, strpos( $flavorUrl, "?ks=" ) ), '.' );
			$flavorId = substr( strrchr( strstr( $flavorUrl, "/format/", true ), '/' ), 1 );
			
			if($_GET['downloadName'] != null){
				$filename	= urldecode($_GET['downloadName']).$extension;
				$filename = $this->sanitizeFilenameForHeader($filename);
			}else{
				$filename = $flavorId . $extension;
			}

			if( $mediaType !== 2 ){
				$options = new KalturaFlavorAssetUrlOptions();
				$options->fileName = $filename;

				$requestConfig = $client->getConfig();
				array_push($requestConfig->requestHeaders, 'Referer: ' . $this->getResultObject()->request->getReferer());
				$client->setConfig($requestConfig);

				$flavorUrl = $client->flavorAsset->getUrl($flavorId,null,false,$options);
				header("Location: " . $flavorUrl );

			}else{
				header( 'Content-Disposition: attachment; filename="'.$filename.'"' );
				readfile( $flavorUrl );
			}
		}
		else {
			header("Location: " . $flavorUrl );
		}
	}
	
	// Load the Kaltura library and grab the most compatible flavor
	public function getSources(){
		global $wgKalturaServiceUrl, $wgKalturaUseAppleAdaptive, $wgHTTPProtocol;
		// Check if we already have sources loaded:
		if( $this->sources !== null ){
			return $this->sources;
		}
		// Check the access control before returning any source urls
		$isAccessControlAllowed = $this->getResultObject()->isAccessControlAllowed();
		if( ! $isAccessControlAllowed ) {
			return $this->fatalError( $isAccessControlAllowed );
			return array();
		}

		$kResultObject = $this->getResultObject();
		$resultObject =  $kResultObject->getResult();
		
		// add any web sources
		$this->sources = array();

		// Check for empty flavor set:
		if( !isset( $resultObject['contextData']->flavorAssets ) ){
			$this->fatalError( 'No flavors were found' );
			return array();
		}

		// Check for error in getting flavor
		if( is_array( $resultObject['meta'] ) && isset( $resultObject['meta']['code'] ) ){
			$this->fatalError( $resultObject['meta']['message'] );
			return array();
		}

		// Store flavorIds for Akamai HTTP
		$ipadFlavors = '';
		$iphoneFlavors = '';

		// Decide if to use playManifest or flvClipper URL
		if( $kResultObject->request->getServiceConfig( 'UseManifestUrls' ) ){
			$flavorUrl =  $kResultObject->request->getServiceConfig( 'ServiceUrl' ) .'/p/' . $kResultObject->getPartnerId() . '/sp/' .
			$kResultObject->getPartnerId() . '00/playManifest/entryId/' . $kResultObject->request->getEntryId();
		} else {
			$flavorUrl = $kResultObject->request->getServiceConfig( 'CdnUrl' ) .'/p/' . $kResultObject->getPartnerId() . '/sp/' .
			$kResultObject->getPartnerId() . '00/flvclipper/entry_id/' . $kResultObject->request->getEntryId();
		}
		foreach( $resultObject['contextData']->flavorAssets as $KalturaFlavorAsset ){
			$source = array(
				'data-bandwidth' => $KalturaFlavorAsset->bitrate * 8,
				'data-width' =>  $KalturaFlavorAsset->width,
				'data-height' =>  $KalturaFlavorAsset->height
			);

			// If flavor status is not ready - continute to the next flavor
			if( $KalturaFlavorAsset->status != 2 ) {
				if( $KalturaFlavorAsset->status == 4 ){
					$source['data-error'] = "not-ready-transcoding" ;
				}
				continue;
			}

			// If we have apple http steaming then use it for ipad & iphone instead of regular flavors
			if( strpos( $KalturaFlavorAsset->tags, 'applembr' ) !== false ) {
				$assetUrl = $flavorUrl . '/format/applehttp/protocol/' . $wgHTTPProtocol . '/a.m3u8';

				$this->sources[] = array_merge( $source, array(
					'src' => $assetUrl,
					'type' => 'application/vnd.apple.mpegurl',
					'data-flavorid' => 'AppleMBR',
				) );
				continue;
			}

			// Check for rtsp as well:
			if( strpos( $KalturaFlavorAsset->tags, 'hinted' ) !== false ){
				$assetUrl = $flavorUrl . '/flavorId/' . $KalturaFlavorAsset->id .  '/format/rtsp/name/a.3gp';
				$this->sources[] = array_merge( $source, array(
					'src' => $assetUrl,
					'type' => 'application/rtsl',
					'data-flavorid' => 'rtsp3gp',
				) );
				continue;
			}

			// Else use normal
			$assetUrl = $flavorUrl . '/flavorId/' . $KalturaFlavorAsset->id . '/format/url/protocol/' . $wgHTTPProtocol;

			// Add iPad Akamai flavor to iPad flavor Ids list
			if( strpos( $KalturaFlavorAsset->tags, 'ipadnew' ) !== false ) {
				$ipadFlavors .= $KalturaFlavorAsset->id . ",";
			}

			// Add iPhone Akamai flavor to iPad&iPhone flavor Ids list
			if( strpos( $KalturaFlavorAsset->tags, 'iphonenew' ) !== false )
			{
				$ipadFlavors .= $KalturaFlavorAsset->id . ",";
				$iphoneFlavors .= $KalturaFlavorAsset->id . ",";
			}

			if( strpos( $KalturaFlavorAsset->tags, 'iphone' ) !== false ){
				$this->sources[] = array_merge( $source, array(
					'src' => $assetUrl . '/a.mp4',
					'type' => 'video/h264',
					'data-flavorid' => 'iPhone',
				) );
			};
			if( strpos( $KalturaFlavorAsset->tags, 'ipad' ) !== false ){
				$this->sources[] = array_merge( $source, array(
					'src' => $assetUrl  . '/a.mp4',
					'type' => 'video/h264',
					'data-flavorid' => 'iPad',
				) );
			};

			if( $KalturaFlavorAsset->fileExt == 'webm'
				|| // Kaltura transcodes give: 'matroska'
				strtolower($KalturaFlavorAsset->containerFormat) == 'matroska'
				|| // Some ingestion systems give "webm"
				strtolower($KalturaFlavorAsset->containerFormat) == 'webm'
			){
				$this->sources[] = array_merge( $source, array(
					'src' => $assetUrl . '/a.webm',
					'type' => 'video/webm',
					'data-flavorid' => 'webm'
				) );
			}

			if( $KalturaFlavorAsset->fileExt == 'ogg'
				||
				$KalturaFlavorAsset->fileExt == 'ogv'
				||
				$KalturaFlavorAsset->containerFormat == 'ogg'
			){
				$this->sources[] = array_merge( $source, array(
					'src' => $assetUrl . '/a.ogg',
					'type' => 'video/ogg',
					'data-flavorid' => 'ogg',
				) );
			};

			// Check for ogg audio:
			if( $KalturaFlavorAsset->fileExt == 'oga' ){
				$this->sources[] = array_merge( $source, array(
					'src' => $assetUrl . '/a.oga',
					'type' => 'audio/ogg',
					'data-flavorid' => 'ogg',
				) );
			}


			if( $KalturaFlavorAsset->fileExt == '3gp' ){
				$this->sources[] = array_merge( $source, array(
					'src' => $assetUrl . '/a.3gp',
					'type' => 'video/3gp',
					'data-flavorid' => '3gp'
				));
			};
		}

		$ipadFlavors = trim($ipadFlavors, ",");
		$iphoneFlavors = trim($iphoneFlavors, ",");

		// Apple adaptive streaming is sometimes broken for short videos
		// If video duration is less then 10 seconds, we should disable it
		if( $resultObject['meta']->duration < 10 ) {
			$wgKalturaUseAppleAdaptive = false;
		}

		// Create iPad flavor for Akamai HTTP
		if ( $ipadFlavors && $wgKalturaUseAppleAdaptive ){
			$assetUrl = $flavorUrl . '/flavorIds/' . $ipadFlavors . '/format/applehttp/protocol/' . $wgHTTPProtocol;
			// Adaptive flavors have no inheret bitrate or size:
			$this->sources[] = array(
				'src' => $assetUrl . '/a.m3u8',
				'type' => 'application/vnd.apple.mpegurl',
				'data-flavorid' => 'iPadNew'
			);
		}

		// Create iPhone flavor for Akamai HTTP
		if ( $iphoneFlavors && $wgKalturaUseAppleAdaptive )
		{
			$assetUrl = $flavorUrl . '/flavorIds/' . $iphoneFlavors . '/format/applehttp/protocol/' . $wgHTTPProtocol;
			// Adaptive flavors have no inheret bitrate or size:
			$this->sources[] = array(
				'src' => $assetUrl . '/a.m3u8',
				'type' => 'application/vnd.apple.mpegurl',
				'data-flavorid' => 'iPhoneNew'
			);
		}

		// Add in playManifest authentication tokens ( both the KS and referee url )
		if( $kResultObject->request->getServiceConfig( 'UseManifestUrls' ) ){
			foreach($this->sources as & $source ){
				if( isset( $source['src'] )){
					$source['src'] .= '?ks=' . $kResultObject->client->getKS() . '&referrer=' . $this->getReferer().'&playSessionId='.$this->getPlaySession();
				}
			}
		}

		// if the are no sources and we are waiting for transcode add the no sources error
		if( count( $this->sources ) == 0 ) {
			$this->fatalError( "No mobile sources found" );
			return array();
		}

		//echo '<pre>'; print_r($this->sources); exit();
		return $this->sources;
	}
	private function getReferer() {
		if( isset($_GET['referrer']) ) {
			return $_GET['referrer'];
		} else {
			return base64_encode( $this->getResultObject()->request->getReferer() );
		}
	}
	private function getPlaySession(){
		if( isset($_GET['playSessionId']) ) {
			return $_GET['playSessionId'];
		}
	}
	public function getSourceForUserAgent(){

		// Get user agent
		$userAgent = $this->getResultObject()->request->getUserAgent();

		$flavorUrl = false;
		
		// First set the most compatible source ( iPhone h.264 low quality)
		$iPhoneSrc = $this->getSourceFlavorUrl( 'iPhone' );
		if( $iPhoneSrc ) {
			$flavorUrl = $iPhoneSrc;
		}
		// if your on an iphone or BB 7.1 we are done:
		if( strpos( $userAgent, 'iPhone' ) || ( strpos( $userAgent, 'BlackBerry' ) && strpos( $userAgent, '7.1' ) ) ){
			return $flavorUrl;
		}
		// h264 for iPad
		$iPadSrc = $this->getSourceFlavorUrl( 'iPad' );
		if( $iPadSrc ) {
			$flavorUrl = $iPadSrc;
		}
		// rtsp3gp for BlackBerry
		$rtspSrc = $this->getSourceFlavorUrl( 'rtsp3gp' );
		if( strpos( $userAgent, 'BlackBerry' ) !== false && $rtspSrc){
			return 	$rtspSrc;
		}

		// 3gp check
		$gpSrc = $this->getSourceFlavorUrl( '3gp' );
		if( $gpSrc ) {
			// Blackberry ( newer blackberry's can play the iPhone src but better safe than broken )
			if( strpos( $userAgent, 'BlackBerry' ) !== false ){
				$flavorUrl = $gpSrc;
			}
			// if we have no iphone source then do use 3gp:
			if( !$flavorUrl ){
				$flavorUrl = $gpSrc;
			}
		}

		// Firefox > 3.5 and chrome support ogg
		$ogSrc = $this->getSourceFlavorUrl( 'ogg' );
		if( $ogSrc ){
			// chrome supports ogg:
			if( strpos( $userAgent, 'Chrome' ) !== false ){
				$flavorUrl = $ogSrc;
			}
			// firefox 3.5 and greater supported ogg:
			if( strpos( $userAgent, 'Firefox' ) !== false ){
				$flavorUrl = $ogSrc;
			}
		}

		// Firefox > 3 and chrome support webm ( use after ogg )
		$webmSrc = $this->getSourceFlavorUrl( 'webm' );
		if( $webmSrc ){
			if( strpos( $userAgent, 'Chrome' ) !== false ){
				$flavorUrl = $webmSrc;
			}
			if( strpos( $userAgent, 'Firefox/3' ) === false && strpos( $userAgent, 'Firefox' ) !== false ){
				$flavorUrl = $webmSrc;
			}
		}
		return $flavorUrl;
	}

	/**
	 * Gets a single source url flavors by flavor id ( gets the first flavor )
	 *
	 * TODO we should support setting a bitrate as well.
	 *
	 * @param $sources
	 * 	{Array} the set of sources to search
	 * @param $flavorId
	 * 	{String} the flavor id string
	 */
	 public function getSourceUrl($kResultObject, $resultObject, $source){
		global $wgHTTPProtocol;

		if( $kResultObject->request->getServiceConfig( 'UseManifestUrls' ) ){
			$flavorUrl =  $kResultObject->request->getServiceConfig( 'ServiceUrl' ) .'/p/' . $kResultObject->getPartnerId() . '/sp/' .
			$kResultObject->getPartnerId() . '00/playManifest/entryId/' . $kResultObject->request->getEntryId();
		} else {
			$flavorUrl = $kResultObject->request->getServiceConfig( 'CdnUrl' ) .'/p/' . $kResultObject->getPartnerId() . '/sp/' .
			$kResultObject->getPartnerId() . '00/flvclipper/entry_id/' . $kResultObject->request->getEntryId();
		}
		$assetUrl = $flavorUrl . '/flavorId/' . $source->id . '/format/url/protocol/' . $wgHTTPProtocol;
		$src =  $assetUrl .'/a.' . $source->fileExt . '?ks=' . $kResultObject->client->getKS() . '&referrer=' . $this->getReferer();
		return $src;
	 }
	private function isSourceOnlyAsset(){
		$kResultObject = $this->getResultObject();
		$resultObject =  $kResultObject->getResult();
		
		return ( 
				// check if flavorAssets do not exist:
				(
				!isset( $resultObject['contextData']->flavorAssets ) 
				||
				count( $resultObject['contextData']->flavorAssets ) == 0 
				)
			&& 
				// check if downloadUrl is defined: 
				isset( $resultObject['meta']->downloadUrl )
		);
	}

	private function sanitizeFilenameForHeader($filename) {
		strip_tags($filename);
		return preg_replace('/[^A-Za-z0-9\-\.\_\~\!\$\&\'\(\)\*\+\,\;\=\:\@]/', '_', $filename);
	}

	private function getSourceFlavorUrl( $flavorId = false ){
		global $wgHTTPProtocol;

		// first check if we got preferredBitrate or flavour ID
		if( isset($_GET['preferredBitrate']) && $_GET['preferredBitrate'] != null){
			$preferredBitrate = intval($_GET['preferredBitrate']);
		}
		if( isset($_GET['flavorID']) && $_GET['flavorID'] != null){
			$flavorID = $_GET['flavorID'];
		}
		if( isset($_GET['flavorParamsId'] ) && $_GET['flavorParamsId'] != null ){
			$flavorParamsId = $_GET['flavorParamsId'];
		}

		$src = false;
		$kResultObject = $this->getResultObject();
		$resultObject =  $kResultObject->getResult();
		
		if( $this->isSourceOnlyAsset() ){
			// Note we are assuming other assets have flavors, and only image gets direct mapping: 
			// this is probably not a safe assumption, public source only assets may fall into this category 
			// and should be supproted. 
			// ENUM mapping here: https://www.kaltura.com/api_v3/testmeDoc/index.php?object=KalturaMediaType
			return $resultObject['meta']->downloadUrl . '/a.jpg' . '?ks=' . $kResultObject->client->getKS() . '&referrer=' . $this->getReferer();
		}
		
		
		if( isset( $flavorParamsId) ){
			foreach( $resultObject['contextData']->flavorAssets as $source ){
				if( isset($source->flavorParamsId) && $source->flavorParamsId == $flavorParamsId){
					$src = $this->getSourceUrl($kResultObject, $resultObject, $source);
				}
			}
		} 
		
		if ( isset( $flavorID ) && !$src ) {
			// flavor ID overrides preferred bitrate so look for it first
			foreach( $resultObject['contextData']->flavorAssets as $source ){
				if( isset($source->id) && $source->id == $flavorID){
					$src = $this->getSourceUrl($kResultObject, $resultObject, $source);
				}
			}
		} 
		if ( isset( $preferredBitrate ) && !$src ) {
			// if the user specified 0 - return the source
			if ($preferredBitrate == 0){
				foreach( $resultObject['contextData']->flavorAssets as $source ){
					if (isset($source->tags) && strpos($source->tags,'source') !== false){
						$src = $this->getSourceUrl($kResultObject, $resultObject, $source);
					}
				}
			}else{
				// try to find the closest bitrate source
				$deltaBitrate = 999999999;
				foreach( $resultObject['contextData']->flavorAssets as $source ){
					if( isset($source->bitrate) ){
						$delta =  abs( $source->bitrate - $preferredBitrate );
						if ( $delta < $deltaBitrate) {
							$deltaBitrate = $delta;
							$src = $this->getSourceUrl($kResultObject, $resultObject, $source);
						}
					}
				}
			}
		}

		if ($src){
			return $src;
		}

		// if no flavorID or preferredBitrate were specified - continue normally
		$sources = $this->getSources(); // Get all sources ( if not provided )
		$validSources = array(); 
		foreach( $sources as $inx => $source ){
			if( strtolower( $source[ 'data-flavorid' ] ) == strtolower( $flavorId ) ) {
				$validSources[] =  $source;
			}
		}
		// special case the iPhone flavor as generic and we want the lowest quality ( 480 version )
		if( $flavorId == 'iPhone' ){
			$minBit = 999999999;
			$minSrc = null;
			foreach( $validSources  as $source ){
				if( isset($source['data-bandwidth']) && $source['data-bandwidth'] < $minBit ){
					$minSrc = $source['src'];
					$minBit = $source['data-bandwidth'];
				}
			}
			return $minSrc;
		} else if( count( $validSources ) ) {
			// if not preferred bitrate was specified - return the biggest source available
			$maxBit = 0;
			$maxSrc = null;
			foreach( $validSources  as $source ){
				if( isset($source['data-bandwidth']) && $source['data-bandwidth'] > $maxBit ){
					$maxSrc = $source['src'];
					$maxBit = $source['data-bandwidth'];
				}
			}
			return $maxSrc;
		}
		return false;
	}

	/**
	 * Kaltura object provides sources, sometimes no sources are found or an error occurs in a video
	 * delivery context we don't want ~nothing~ to happen instead we send a special error video.
	 */
	public static function getErrorVideoSources(){
		// @@TODO pull this from config: 'Kaltura.BlackVideoSources'
		return array(
			'iphone' => array(
				'src' => 'http://www.kaltura.com/p/243342/sp/24334200/playManifest/entryId/1_g18we0u3/flavorId/1_ktavj42z/format/url/protocol/http/a.mp4',
				'type' =>'video/h264',
				'data-flavorid' => 'iPhone'
			),
			'ogg' => array(
				'src' => 'http://www.kaltura.com/p/243342/sp/24334200/playManifest/entryId/1_g18we0u3/flavorId/1_gtm9gzz2/format/url/protocol/http/a.ogg',
				'type' => 'video/ogg',
				'data-flavorid' => 'ogg'
			),
			'webm' => array(
				'src' => 'http://www.kaltura.com/p/243342/sp/24334200/playManifest/entryId/1_g18we0u3/flavorId/1_bqsosjph/format/url/protocol/http/a.webm',
				'type' => 'video/webm',
				'data-flavorid' => 'webm'
			),
			'3gp' => array(
				'src' => 'http://www.kaltura.com/p/243342/sp/24334200/playManifest/entryId/1_g18we0u3/flavorId/1_mfqemmyg/format/url/protocol/http/a.mp4',
				'type' => 'video/3gp',
				'data-flavorid' => '3gp'
			)
		 );
	}
}
