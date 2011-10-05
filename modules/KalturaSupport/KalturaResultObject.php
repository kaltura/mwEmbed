<?php

// Include the kaltura client
require_once(  dirname( __FILE__ ) . '/kaltura_client_v3/KalturaClient.php' );
// Include the kaltura named multi request helper class: 
require_once(  dirname( __FILE__ ) . '/KalturaNamedMultiRequest.php');

/**
 * Generates a kaltura result object based on url Parameters 
 */
class KalturaResultObject {
	 
	var $resultObj = null; // lazy init with getResultObject
	var $clientTag = null;
	var $uiConfXml = null; // lazy init
	var $noCache = false;
	// flag to control if we are in playlist mode
	var $isPlaylist = false;
	
	// Local flag to store whether output was came from cache or was a fresh request
	private $outputFromCache = false;
	
	/**
	 * Variables set by the Frame request:
	 */
	private $urlParameters = array(
		'cache_st' => null,
		'p' => null,
		'wid' => null,
		'uiconf_id' => null,
		'entry_id' => null,
		'flashvars' => null,
		'playlist_id' => null,
		'urid' => null,
		// Custom service url properties ( only used when wgKalturaAllowIframeRemoteService is set to true ) 
		'ServiceUrl'=> null,
		'ServiceBase'=>null,
		'CdnUrl'=> null,
		'UseManifestUrls' => null
	
	);
	function __construct( $clientTag = 'php'){
		$this->clientTag = $clientTag;
		//parse input:
		$this->parseRequest();
		// load the request object:
		$this->getResultObject();
	}
	function getServiceConfig( $name ){
		global $wgKalturaAllowIframeRemoteService;
		// Check if we allow URL override: 
		if( $wgKalturaAllowIframeRemoteService ){
			// Check for urlParameters
			if( isset( $this->urlParameters[ $name ] ) ){
				return $this->urlParameters[ $name ];
			}
		}
		// Else use the global config: 
		switch( $name ){
			case 'ServiceUrl' : 
				global $wgKalturaServiceUrl;
				return $wgKalturaServiceUrl;
				break;
			case 'ServiceBase':
				global $wgKalturaServiceBase;
				return $wgKalturaServiceBase;
				break;
			case 'CdnUrl':
				global $wgKalturaCDNUrl;
				return $wgKalturaCDNUrl;
				break;
			case 'UseManifestUrls':
				global $wgKalturaUseManifestUrls;
				return $wgKalturaUseManifestUrls;
				break;
		}
		// else thorw an erro? 
	}

	// Returns the value of given flashvar
	// Make sure to use '===' when comparing values
	function getFlashvarConfig( $name ) {
		// If no flash vars retrun false
		if( !isset ($this->urlParameters[ 'flashvars' ]) ) {
			return null;
		}

		// If value doesn't exists retrun false
		if( !isset( $this->urlParameters[ 'flashvars' ][ $name ] ) ) {
			return null;
		}

		$value = $this->urlParameters[ 'flashvars' ][ $name ];
		// If value has boolean value, return it as boolean
		if( $value == "true") {
			$value = true;
		} elseif( $value == "false" ) {
			$value = false;
		}
		return $value;
	}
	/**
	 * Kaltura object provides sources, sometimes no sources are found or an error occurs in 
	 * a video delivery context we don't want ~nothing~ to happen instead we send a special error
	 * video. 
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
	public static function getBlackVideoSources(){
		// @@TODO merge with Kaltura.BlackVideoSources config!!
		return array(
		    'webm' => array(
		        'src' => 'http://www.kaltura.com/p/243342/sp/24334200/playManifest/entryId/1_vp5cng42/flavorId/1_oiyfyphl/format/url/protocol/http/a.webm',
		        'type' => 'video/webm',
				'data-flavorid' => 'webm'
			),
			'ogg' => array(
				'src' => 'http://www.kaltura.com/p/243342/sp/24334200/playManifest/entryId/1_vp5cng42/flavorId/1_6yqa4nmd/format/url/protocol/http/a.ogg',
				'type' => 'video/ogg',
				'data-flavorid' => 'ogg'
			),
			'iphone' => array(
				'src' =>'http://www.kaltura.com/p/243342/sp/24334200/playManifest/entryId/1_vp5cng42/flavorId/1_6wf0o9n7/format/url/protocol/http/a.mp4',
				'type' => 'video/h264',
				'data-flavorid' => 'iPhone'
			),
		);
	}
	
	// Check if the requested url is a playlist
	public function isPlaylist(){
		// first check the flag
		if( $this->isPlaylist )
			return true;
		// else check url params: 
		return ( $this->urlParameters['playlist_id'] !== null || $this->urlParameters['entry_id'] === null);
	}
	public function isCachedOutput(){
		return $this->outputFromCache;
	}
	private function getUserAgent() {
		return $_SERVER['HTTP_USER_AGENT'];
	}
	/**
	 * Checks if a user agent is restricted via the user restriction plugin present in the uiConf XML
	 * this check is run as part of resultObject handling so we must pass in the uiConf string
	 */ 
	public function isUserAgentRestrictedPlugin( $uiConf ) {
		//echo('<textarea style="width: 100%; height: 100%;">' . $uiConf . '</textarea>'); exit();
		$restrictedMessage = true;
		// Check for plugin definition in flashVars
		if( $this->getFlashvarConfig('restrictUserAgent.plugin') ) {
			$restrictedStrings = $this->getFlashvarConfig('restrictUserAgent.restrictedUserAgents');
			if( $this->getFlashvarConfig('restrictUserAgent.restrictedUserAgentTitle') && $this->getFlashvarConfig('restrictUserAgent.restrictedUserAgentMessage') ) {
				$restrictedMessage = $this->getFlashvarConfig('restrictUserAgent.restrictedUserAgentTitle') ."\n". $this->getFlashvarConfig('restrictUserAgent.restrictedUserAgentMessage');
			}
		} else {
		
			// Pass in the uiConf string ( need to clean up resultObject parsing logic ) 
			$this->getUiConfXMl( $uiConf );
			// Check for plug definition in uiConf
			$restrictUserAgentPlugin = $this->uiConfXml->xpath("*//Plugin[@id = 'restrictUserAgent']");
			if( $restrictUserAgentPlugin ) {
				$restrictUserAgentPlugin = $restrictUserAgentPlugin[0]->attributes();
				$restrictedStrings = $restrictUserAgentPlugin->restrictedUserAgents;
				if( isset($restrictUserAgentPlugin->restrictedUserAgentTitle) && isset($restrictUserAgentPlugin->restrictedUserAgentMessage) ) {
					$restrictedMessage = $restrictUserAgentPlugin->restrictedUserAgentTitle . "\n" . $restrictUserAgentPlugin->restrictedUserAgentMessage;
				}
			}else {
				return false;
			}
		}
		
		// If we don't have any string to search for, return true
		if( !isset($restrictedStrings) || empty($restrictedStrings) ) { return false; }

		// Lower case user agents string
		$userAgent = strtolower( $this->getUserAgent() );
		$restrictedStrings = strtolower( $restrictedStrings );
		$restrictedStrings = explode(",", $restrictedStrings);
		
		foreach( $restrictedStrings as $string ) {
			$string = str_replace(".*", "", $string); // Removes .*
			$string = trim($string);
			if( ! strpos( $userAgent, $string ) === false ) {
				return $restrictedMessage;
			}
		}
		return false;
	}

	public function getSourceForUserAgent( $sources = null, $userAgent = false ){
		// Get all sources
		if( !$sources ){
			$sources = $this->getSources();
		}
		// Get user agent
		if( !$userAgent ){
			$userAgent = $this->getUserAgent();
		}
	
		//@@TODO integrate a library for doing this user-agent -> source selection
		// what follows somewhat arbitrary
		
		$flavorUrl = false ;
		// First set the most compatible source ( iPhone h.264 )
		if( isset( $sources['iphone'] ) ) {
			$flavorUrl = $sources['iphone']['src'];
		}
		// h264 for iPad
		if( isset( $sources['ipad'] ) ) {
			$flavorUrl = $sources['ipad']['src'];
		}
		// rtsp3gp for BlackBerry
		if( strpos( $userAgent, 'BlackBerry' ) !== false && $sources['rtsp3gp'] ){
			return 	$sources['rtsp3gp']['src'];
		}
		
		// 3gp check 
		if( isset( $sources['3gp'] ) ) {
			// Blackberry ( newer blackberry's can play the iPhone src but better safe than broken )
			if( strpos( $userAgent, 'BlackBerry' ) !== false ){
				$flavorUrl = $sources['3gp']['src'];
			}
			// if we have no iphone source then do use 3gp:
			if( !$flavorUrl ){
				$flavorUrl = $sources['3gp']['src'];
			}
		}
		
		// Firefox > 3.5 and chrome support ogg
		if( isset( $sources['ogg'] ) ){
			// chrome supports ogg:
			if( strpos( $userAgent, 'Chrome' ) !== false ){
				$flavorUrl = $sources['ogg']['src'];
			}
			// firefox 3.5 and greater supported ogg:
			if( strpos( $userAgent, 'Firefox' ) !== false ){
				$flavorUrl = $sources['ogg']['src'];
			}
		}
		
		// Firefox 4x and chrome support webm ( use after ogg )
		if( isset( $sources['webm'] ) ){
			if( strpos( $userAgent, 'Chrome' ) !== false ){
				$flavorUrl = $sources['webm']['src'];
			}
			if( strpos( $userAgent, 'Firefox/4' ) !== false
				||
				strpos( $userAgent, 'Firefox/5' ) !== false 
			){
				$flavorUrl = $sources['webm']['src'];
			}
		}
		
		return $flavorUrl;
	}
	
	/**
	*  Access Control Handling
	*/
	public function isAccessControlAllowed( &$resultObject = null ) {
		// Kaltura only has entry level access control not playlist level access control atm: 
		// don't check playlist
		if( $this->isPlaylist() ){
			return true;
		}
		
		if( !$resultObject ){
			$resultObject =  $this->getResultObject();
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
		if( $accessControl->isSessionRestricted && $accessControl->previewLength == -1 ) {
			return "No KS where KS is required\nWe're sorry, access to this content is restricted.";
		}

		if( $accessControl->isScheduledNow === 0) {
			return "Out of scheduling\nWe're sorry, this content is currently unavailable.";
		}
		
		//echo $this->getUserAgent() . '<br />';
		//echo '<pre>'; print_r($accessControl); exit();
		//die($this->getKS());
		$userAgentMessage = "User Agent Restricted\nWe're sorry, this content is not available for your device.";
		if( isset( $accessControl->isUserAgentRestricted ) && $accessControl->isUserAgentRestricted ) {
			return $userAgentMessage;
		} else {
			if( isset( $resultObject['uiConf'] ) ){
				$userAgentRestricted = $this->isUserAgentRestrictedPlugin( $resultObject['uiConf'] );
				if( $userAgentRestricted === false ) {
					return true;
				} else {
					if( $userAgentRestricted === true ) {
						return $userAgentMessage;
					} else {
						return $userAgentRestricted;
					}
				}
			}
		}
		return true;
	}
	
	// Load the Kaltura library and grab the most compatible flavor
	public function getSources(){
		global $wgKalturaServiceUrl, $wgKalturaUseAppleAdaptive;
		// Check the access control before returning any source urls
		if( !$this->isAccessControlAllowed() ) {
			return array();
		}

		$resultObject =  $this->getResultObject(); 
		
		// add any web sources
		$sources = array();

		// Check for error in getting flavor
		if( isset( $resultObject['flavors']['code'] ) ){
			switch(  $resultObject['flavors']['code'] ){
				case  'ENTRY_ID_NOT_FOUND':
					throw new Exception( "Entry Id not found\n" . $resultObject['flavors']['message'] );
				break;
			}
			// @@TODO should probably refactor to use throw catch error system.
			return array();
		}

		// Store flavorIds for Akamai HTTP
		$ipadFlavors = '';
		$iphoneFlavors = '';

		// Decide if to use playManifest or flvClipper URL
		if( $this->getServiceConfig( 'UseManifestUrls' ) ){
			$flavorUrl =  $this->getServiceConfig( 'ServiceUrl' ) .'/p/' . $this->getPartnerId() . '/sp/' .
			$this->getPartnerId() . '00/playManifest/entryId/' . $this->urlParameters['entry_id'];			
		} else {
			$flavorUrl = $this->getServiceConfig( 'CdnUrl' ) .'/p/' . $this->getPartnerId() . '/sp/' .
			$this->getPartnerId() . '00/flvclipper/entry_id/' .
			$this->urlParameters['entry_id'];
		}
		
		$videoIsTranscodingFlag = false;
		if( !isset( $resultObject['flavors'] ) ){
			return array();
		}
		foreach( $resultObject['flavors'] as $KalturaFlavorAsset ){
			// if flavor status is not ready - continute to the next flavor
			if( $KalturaFlavorAsset->status != 2 ) { 
				if( $KalturaFlavorAsset->status == 4 ){
					$videoIsTranscodingFlag = true;
				}
				continue; 
			}
			// If we have apple http steaming then use it for ipad & iphone instead of regular flavors
			if( strpos( $KalturaFlavorAsset->tags, 'applembr' ) !== false ) {
				$assetUrl = $flavorUrl . '/format/applehttp/protocol/http/a.m3u8';

				$sources['applembr'] = array(
					'src' => $assetUrl,
					'type' => 'application/vnd.apple.mpegurl',
					'data-flavorid' => 'AppleMBR'
				);
				continue;
			}
			// Check for rtsp as well:
			if( strpos( $KalturaFlavorAsset->tags, 'hinted' ) !== false ){
				$assetUrl = $flavorUrl . '/flavorId/' . $KalturaFlavorAsset->id .  '/format/rtsp/name/a.3gp';
				$sources['rtsp3gp'] = array(
					'src' => $assetUrl,
					'type' => 'application/rtsl',
					'data-flavorid' => 'rtsp3gp'
				);
				continue;
			}
			
			// Else use normal 
			$assetUrl = $flavorUrl . '/flavorId/' . $KalturaFlavorAsset->id . '/format/url/protocol/http';

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
				$sources['iphone'] = array(
					'src' => $assetUrl . '/a.mp4',
					'type' => 'video/h264',
					'data-flavorid' => 'iPhone'
				);
			};
			if( strpos( $KalturaFlavorAsset->tags, 'ipad' ) !== false ){
				$sources['ipad'] = array(
					'src' => $assetUrl  . '/a.mp4',
					'type' => 'video/h264',
					'data-flavorid' => 'iPad'
				);
			};

			if( $KalturaFlavorAsset->fileExt == 'webm' ){
				$sources['webm'] = array(
					'src' => $assetUrl . '/a.webm',
					'type' => 'video/webm',
					'data-flavorid' => 'webm'
				);
			}

			if( $KalturaFlavorAsset->fileExt == 'ogg' || $KalturaFlavorAsset->fileExt == 'ogv'
				|| $KalturaFlavorAsset->fileExt == 'oga'
			){
				$sources['ogg'] = array(
					'src' => $assetUrl . '/a.ogg',
					'type' => 'video/ogg',
					'data-flavorid' => 'ogg'
				);
			};
			if( $KalturaFlavorAsset->fileExt == '3gp' ){
				$sources['3gp'] = array(
					'src' => $assetUrl . '/a.3gp',
					'type' => 'video/3gp',
					'data-flavorid' => '3gp'
				);
			};
		}
		// If there are no sources and we are waiting for a transcode throw an error
		if( count( $sources ) == 0 && $videoIsTranscodingFlag ){
			throw new Exception( "Video is transcoding, check back later" );
		}
		
		$ipadFlavors = trim($ipadFlavors, ",");
		$iphoneFlavors = trim($iphoneFlavors, ",");

		// Create iPad flavor for Akamai HTTP
		if ( $ipadFlavors && $wgKalturaUseAppleAdaptive ){
			$assetUrl = $flavorUrl . '/flavorIds/' . $ipadFlavors . '/format/applehttp/protocol/http';

			$sources['ipadnew'] = array(
				'src' => $assetUrl . '/a.m3u8',
				'type' => 'application/vnd.apple.mpegurl',
				'data-flavorid' => 'iPadNew'
			);
		}

		// Create iPhone flavor for Akamai HTTP
		if ( $iphoneFlavors && $wgKalturaUseAppleAdaptive )
		{
			$assetUrl = $flavorUrl . '/flavorIds/' . $iphoneFlavors . '/format/applehttp/protocol/http';

			$sources['iphonenew'] = array(
				'src' => $assetUrl . '/a.m3u8',
				'type' => 'application/vnd.apple.mpegurl',
				'data-flavorid' => 'iPhoneNew'
			);
		}
		// Add in playManifest authentication tokens ( both the KS and referee url ) 
		if( $this->getServiceConfig( 'UseManifestUrls' ) ){
			foreach($sources as &$source ){
				if( isset( $source['src'] )){
					$source['src'] .= '?ks=' . $this->getKS() . '&referrer=' . base64_encode( $this->getReferer() );
				}
			}
		}
        //echo '<pre>'; print_r($sources); exit();
		return $sources;
	}
	
	// Parse the embedFrame request and sanitize input
	private function parseRequest(){
		global $wgEnableScriptDebug, $wgKalturaUseAppleAdaptive, 
				$wgKalturaPartnerDisableAppleAdaptive;
		// Support /key/value path request:
		if( isset( $_SERVER['PATH_INFO'] ) ){
			$urlParts = explode( '/', $_SERVER['PATH_INFO'] );
			foreach( $urlParts as $inx => $urlPart ){
				foreach( $this->urlParameters as $attributeKey => $na){
					if( $urlPart == $attributeKey && isset( $urlParts[$inx+1] ) ){
						$_REQUEST[ $attributeKey ] = $urlParts[$inx+1];
					}
				}
			}
		}

		// Check for urlParameters in the request:
		foreach( $this->urlParameters as $attributeKey => $na){
			if( isset( $_REQUEST[ $attributeKey ] ) ){
				// set the url parameter and don't let any html in:
				if( is_array( $_REQUEST[$attributeKey] ) ){
					$payLoad = array();
					foreach( $_REQUEST[$attributeKey] as $key => $val ){
						$payLoad[$key] = htmlspecialchars( $val );
					}
					$this->urlParameters[ $attributeKey ] = $payLoad;
				} else {
					$this->urlParameters[ $attributeKey ] = htmlspecialchars( $_REQUEST[$attributeKey] );
				}
			}
		}
		// string to bollean  
		foreach( $this->urlParameters as $k=>$v){
			if( $v == 'false'){
				$this->urlParameters[$k] = false;
			}
			if( $v == 'true' ){
				$this->urlParameters[$k] = true;
			}
		}
		
		if( isset( $this->urlParameters['p'] ) && !isset( $this->urlParameters['wid'] ) ){
			$this->urlParameters['wid'] = '_' . $this->urlParameters['p'];  
		}
		//echo '<pre>'; print_r( $this->urlParameters[ 'flashvars' ] ); exit();
			
		// Check for debug flag
		if( isset( $_REQUEST['debugKalturaPlayer'] ) || isset( $_REQUEST['debug'] ) ){
			$this->debug = true;
			$wgEnableScriptDebug = true;
		}

		// Check for no cache flag
		if( isset( $_REQUEST['nocache'] ) && $_REQUEST['nocache'] == true ) {
			$this->noCache = true;
		}

		// Check for required config
		if( $this->urlParameters['wid'] == null ){
			throw new Exception( 'Can not display player, missing widget id' );
		}
		
		// Dissable apple adaptive per partner id:
		if( in_array( $this->getPartnerId(), $wgKalturaPartnerDisableAppleAdaptive ) ){
			$wgKalturaUseAppleAdaptive = false;
		}
		
	}
	private function getCacheDir(){
		global $mwEmbedRoot, $wgScriptCacheDirectory;
		$cacheDir = $wgScriptCacheDirectory . '/iframe';
		// make sure the dir exists:
		if( ! is_dir( $cacheDir) ){
			@mkdir( $cacheDir, 0777, true );
		}
		return $cacheDir;
	}
	/**
	 * Returns a cache key for the result object based on Referer and partner id
	 */
	private function getResultObjectCacheKey(){
		// Get a key based on partner id,  entry_id and ui_confand and refer url:
		$playerUnique = ( isset( $this->urlParameters['entry_id'] ) ) ?  $this->urlParameters['entry_id'] : '';
		$playerUnique .= ( isset( $this->urlParameters['uiconf_id'] ) ) ?  $this->urlParameters['uiconf_id'] : '';
		$playerUnique .= ( isset( $this->urlParameters['cache_st'] ) ) ? $this->urlParameters['cache_st'] : ''; 
		$playerUnique .= $this->getReferer();

		// hash the service url, the partner_id, the player_id and the Referer url: 
		return substr( md5( $this->getServiceConfig( 'ServiceUrl' )  ), 0, 5 ) . '_' . $this->getPartnerId() . '_' . 
			   substr( md5( $playerUnique ), 0, 16 );
	}

	private function getResultObjectFromApi(){
		if( $this->isPlaylist() ){
			return $this->getPlaylistResult();
		} else {
			return $this->getEntryResult();
		}
	
	}
	function getPlaylistResult(){
		// if no uiconf_id .. now way to return playlist data
		if( !$this->urlParameters['uiconf_id']) {
			return array();
		}
		$client = $this->getClient();
		try {
			$client->addParam( $kparams, "id",  $this->urlParameters['uiconf_id'] );
			$client->queueServiceActionCall( "uiconf", "get", $kparams );
			$kparams = array();
			
			$rawResultObject = $client->doQueue();
		} catch( Exception $e ){
			// Update the Exception and pass it upward
			throw new Exception( KALTURA_GENERIC_SERVER_ERROR . "\n" . $e->getMessage() );
			return array();
		}
		$resultObject = $this->getBaseResultObject();
		if( isset( $rawResultObject ) && $rawResultObject->confFile ){
			$resultObject[ 'uiconf_id' ] = $this->urlParameters['uiconf_id'];
			$resultObject[ 'uiConf'] = $rawResultObject->confFile;
		}
		
		// Try to parse the uiconf data: 
		$uiConfXml = new SimpleXMLElement( $resultObject[ 'uiConf'] );
		
		// Get the first playlist list:
		$playlistId =  $this->getFirstPlaylistId( $uiConfXml );
		$playlistObject = $this->getPlaylistObject( $playlistId  );

		// Create an empty resultObj
		if( isset( $playlistObject[0] ) && $playlistObject[0]->id ){
			// Set the isPlaylist flag now that we are for sure dealing with a playlist
			$this->isPlaylist = true;
			$this->urlParameters['entry_id'] = $playlistObject[0]->id;
			// Now that we have all the entry data, return that:
			$resultObj = $this->getEntryResult();
			
			// Include the playlist in the response:
			$resultObj[ 'playlistCache' ] = array(
				$playlistId => $playlistObject
			);
			return $resultObj;
		} else {
			// XXX could not get first playlist item: 	
			return array();
		}
		
	}
	/**
	 * Get playlist object
	 */
	function getPlaylistObject( $playlistId ){ 
		$client = $this->getClient();
		// Build the reqeust: 
		$kparams = array();
		try {
			$client->addParam( $kparams, "id", $playlistId);
			$client->queueServiceActionCall( "playlist", "execute", $kparams );
			$kparams = array();
			
			return $client->doQueue();
		} catch( Exception $e ){
			// Throw an Exception and pass it upward
			throw new Exception( KALTURA_GENERIC_SERVER_ERROR . "\n" . $e->getMessage() );
			return false;
		}
	}
	/**
	 * Get the XML for the first playlist ( the one likely to be displayed ) 
	 * 
	 * this is so we can pre-load details about the first entry for fast playlist loading,
	 * and so that the first entry video can be in the page at load time.   
	 */
	function getFirstPlaylistId( &$uiConfXml ){
		// Setup the intial playlist id to null 
		$playlistId = null;
		$checkFlashVar = true;
		// Check for uiConf style playlist id ( should only match one )
		$result = $uiConfXml->xpath( "*//var[@key = 'playlistAPI.kpl0Url']" );
		if( isset( $result[0] ) ){
			foreach ( $result[0]->attributes() as $key => $val ) {
				if( $key == 'value' ){
					$playlistId = urldecode( $val );
				}
				if( $key == 'overrideflashvar' && $val == 'true' ){
					$checkFlashVar = false;	
				}
			}
		}
		// Check for flashvar style playlist id
		if( $checkFlashVar && $this->getFlashvarConfig('playlistAPI.kpl0Url') ){
			// Check for flashvar 
			$playlistId = $this->getFlashvarConfig('playlistAPI.kpl0Url');
			
		}
		$playlistId = htmlspecialchars_decode( $playlistId );
		// Parse out the "playlistId from the url ( if its a url )
		$plParsed = parse_url( $playlistId );

		if( is_array( $plParsed ) && isset( $plParsed['query'] ) ){
			$args = explode("&", $plParsed['query'] );
			foreach( $args as $inx => $argSet ){
				list( $key, $val )	= explode('=', $argSet );
				if( $key == 'playlist_id' ){
					$playlistId = $val;
				}
			}
		}
		return $playlistId;
	}
	
	function getEntryResult(){
		global $wgKalturaEnableCuePointsRequest;
		$client = $this->getClient();
		$client->startMultiRequest();
		try {
			// NOTE this should probably be wrapped in a service class
			$kparams = array();

			// If no cache flag is on, ask the client to get request without cache
			if( $this->noCache ) {
				$client->addParam( $kparams, "nocache",  true );
				$default_params = $kparams;
			} else {
				$default_params = array();
			}
			$namedMultiRequest = new KalturaNamedMultiRequest( $client, $default_params );
			
			// Flavors: 
			$entryParam = array( 'entryId' => $this->urlParameters['entry_id'] );
			$namedMultiRequest->addNamedRequest( 'flavors', 'flavorAsset', 'getByEntryId', $entryParam );
				
			// Access control NOTE: kaltura does not use http header spelling of Referer instead kaltura uses: "referrer"
			$params = array_merge( $entryParam, array( "contextDataParams" => array( 'referrer' =>  $this->getReferer() ) ) );
			$namedMultiRequest->addNamedRequest( 'accessControl', 'baseEntry', 'getContextData', $params );

			// Entry Meta
			$namedMultiRequest->addNamedRequest( 'meta', 'baseEntry', 'get', $entryParam );
			
			if( $this->urlParameters['uiconf_id'] ) {
				$params =  array( "id" =>  $this->urlParameters['uiconf_id'] );
				$namedMultiRequest->addNamedRequest( 'uiConf', "uiconf", "get", $params );
			}
			
			// Entry Custom Metadata
			// Always get custom metadata for now 
			//if( $this->getFlashvarConfig('requiredMetadataFields') ) {
				$filter = new KalturaMetadataFilter();
				$filter->orderBy = KalturaMetadataOrderBy::CREATED_AT_ASC;
				$filter->objectIdEqual = $this->urlParameters['entry_id'];
				$filter->metadataObjectTypeEqual = KalturaMetadataObjectType::ENTRY;
				$metadataPager =  new KalturaFilterPager();
				$metadataPager->pageSize = 1;

				$params = array( 'filter' => $filter, 'metadataPager', $metadataPager );
				$namedMultiRequest->addNamedRequest( 'entryMeta', 'metadata_metadata', 'list', $params );
			//}
			
			// Entry Cue Points
			if( $this->getFlashvarConfig('getCuePointsData') !== false ) {
				$filter = new KalturaCuePointFilter();
				$filter->orderBy = KalturaAdCuePointOrderBy::START_TIME_ASC;
				$filter->entryIdEqual = $this->urlParameters['entry_id'];

				$params = array( 'filter' => $filter );
				$namedMultiRequest->addNamedRequest( 'entryCuePoints', "cuepoint_cuepoint", "list", $params );
			}
			// Get the result object as a combination of baseResult and multiRequest
			$resultObject = $namedMultiRequest->doQueue();
			// merge in the base result object:
			$resultObject = array_merge( $this->getBaseResultObject(), $resultObject);
			
			// Check if the server cached the result by search for "cached-dispatcher" in the request headers
			// If not, do not cache the request (Used for Access control cache issue)
			$requestCached = strpos($client->getHeaders(), "X-Kaltura: cached-dispatcher");
			if( $requestCached === false ) {
				$this->noCache = true;
			}
			
		} catch( Exception $e ){
			// Update the Exception and pass it upward
			throw new Exception( KALTURA_GENERIC_SERVER_ERROR . "\n" . $e->getMessage() );
			return array();
		}
		// Check that the ks was valid on the first response ( flavors ) 
		if( isset( $resultObject['flavors']['code'] ) && $resultObject['flavors']['code'] == 'INVALID_KS' ){
			throw new Exception( 'Error invalid KS');
			return array();
		}
		// Convert entryMeta to entryMeta XML
		if( isset( $resultObject['entryMeta'] ) && 
			isset( $resultObject['entryMeta']->objects[0] ) && 
			isset( $resultObject['entryMeta']->objects[0]->xml )
		){			
			$resultObject['entryMeta'] = $this->xmlToArray( new SimpleXMLElement( $resultObject['entryMeta']->objects[0]->xml ) );
		}
		
		// Convert uiConf to confFile response
		if( isset( $resultObject['uiConf'] ) && $resultObject['uiConf']->confFile ){
			$resultObject[ 'uiconf_id' ] = $this->urlParameters['uiconf_id'];
			$resultObject[ 'uiConf'] = $resultObject['uiConf']->confFile;
		}

		// Add Cue Point data. Also check for 'code' error
		if( isset( $resultObject['entryCuePoints'] ) && is_object( $resultObject['entryCuePoints'] )
			&& $resultObject['entryCuePoints']->totalCount > 0 ){
			$resultObject[ 'entryCuePoints' ] = $resultObject['entryCuePoints']->objects;
		}
		
		// Check access control and throw an exception if not allowed: 
		$acStatus = $this->isAccessControlAllowed( $resultObject );
		if( $acStatus !== true ){
			throw new Exception( $acStatus );
		}	
		
		return $resultObject;
	}

	function getBaseResultObject(){
		$baseResultObject = array(
			'partner_id'		=>	$this->getPartnerId(),
			'ks' 				=> 	$this->getKS()
		);
		if( $this->urlParameters['entry_id'] ) {
			$baseResultObject[ 'entry_id' ] = $this->urlParameters['entry_id'];
		}
		return $baseResultObject;
	}
	
	/**
	 * convert xml data to array
	 */
	function xmlToArray ( $data ){
		if ( is_object($data) ){
			$data = get_object_vars($data);
		}
		return (is_array($data)) ? array_map( array( $this, __FUNCTION__) ,$data) : $data;
	}	
	private function getReferer(){
		return ( isset( $_SERVER['HTTP_REFERER'] ) ) ? $_SERVER['HTTP_REFERER'] : 'http://www.kaltura.org/';
	}
	private function getClient(){
		global $mwEmbedRoot, $wgKalturaUiConfCacheTime, $wgScriptCacheDirectory, 
			$wgMwEmbedVersion, $wgKalturaServiceTimeout;

		$cacheDir = $wgScriptCacheDirectory;

		$cacheFile = $this->getCacheDir() . '/' . $this->getPartnerId() . '.' . $this->getCacheSt() . ".ks.txt";
		$cacheLife = $wgKalturaUiConfCacheTime;

		$conf = new KalturaConfiguration( $this->getPartnerId() );

		$conf->serviceUrl = $this->getServiceConfig( 'ServiceUrl' );
		$conf->serviceBase = $this->getServiceConfig( 'ServiceBase' );
		$conf->clientTag = $this->clientTag;
		$conf->curlTimeout = $wgKalturaServiceTimeout;
		$conf->userAgent = $this->getUserAgent();
		
		$client = new KalturaClient( $conf );
		if( $this->getFlashvarConfig('ks') ) {
			$this->ks = $this->getFlashvarConfig('ks');
		} else {
			// Check modify time on cached php file
			$filemtime = @filemtime($cacheFile);  // returns FALSE if file does not exist
			if ( !$filemtime || filesize( $cacheFile ) === 0 || ( time() - $filemtime >= $cacheLife ) ) {
				try{
					$session = $client->session->startWidgetSession( $this->urlParameters['wid'] );
					$this->ks = $session->ks;
					$this->putCacheFile( $cacheFile,  $this->ks );
				} catch ( Exception $e ){
					throw new Exception( KALTURA_GENERIC_SERVER_ERROR . "\n" . $e->getMessage() );
				}
			} else {
				$this->ks = file_get_contents( $cacheFile );
			}
		}
		// Set the kaltura ks and return the client
		$client->setKS( $this->ks );

		return $client;
	}
	public function getKS(){
		if( !isset( $this->ks ) ){
			$this->getClient();
		}
		return $this->ks;
	}	
	public function getCacheSt(){
		return ( isset( $this->urlParameters['cache_st'] ) ) ? $this->urlParameters['cache_st'] : '';
	}
	public function getPartnerId(){
		// Partner id is widget_id but strip the first character
		return substr( $this->urlParameters['wid'], 1 );
	}
	public function getEntryId(){
		return $this->urlParameters['entry_id'];
	}
	public function getThumbnailUrl() {
		$result =  $this->getResultObject();
		return $result['meta']->thumbnailUrl;
	}
	public function getUrlParameters(){
		return $this->urlParameters;
	}
	public function getJSON(){
		return json_encode( $this->getResultObject() );
	}
	public function getUiConf(){
		$result = $this->getResultObject();
		if( isset( $result['uiConf'] ) ){
			return $result['uiConf'];
		} else {
			return false;
		}
	}
	public function getUiConfXML( $uiConf  = false ){
		global $wgKalturaIframe;
		if( !$this->uiConfXml ){
			if( !$uiConf ){
				// TODO we need to clean this up because getResultObject has a bit of parsing logic right now.
				//  getResultObject should not call any parsing functions
				$uiConf = $this->getUiConf();
			}
			if( $uiConf == '' ) {
				// Empty uiConf ( don't try and parse, return an empty object)
				return new SimpleXMLElement('<xml />' );
			}
			// remove this hack as soon as possible
			$uiConf = str_replace( '[kClick="', 'kClick="', $uiConf);
			// remove this hack as soon as possible as well!
			$brokenFlashVarXMl =  'autoPlay=false&screensLayer.startScreenOverId=startScreen&screensLayer.startScreenId=startScreen';
			$uiConf = str_replace( $brokenFlashVarXMl, htmlentities( $brokenFlashVarXMl ), $uiConf );
			// handle any non-escapsed &
			$uiConf = preg_replace('/&[^; ]{0,6}.?/e', "((substr('\\0',-1) == ';') ? '\\0' : '&amp;'.substr('\\0',1))", $uiConf);
			
			/*
			libxml_use_internal_errors(true);
			$sxe = simplexml_load_string($uiConf);
			if (!$sxe) {
			    echo "Failed loading XML\n";
			    foreach(libxml_get_errors() as $error) {
			        echo "\t", $error->message;
			    }
			}
			*/
			
			$this->uiConfXml = new SimpleXMLElement( $uiConf );
		}
		return $this->uiConfXml;
	}
	public function getMeta(){
		$result = $this->getResultObject();
		if( isset( $result['meta']  ) ){
			return $result['meta'];
		} else {
			return false;
		}
	}
	private function getResultObject(){
		global $wgKalturaUiConfCacheTime;
		// Check if we have a cached result object:
		if( !$this->resultObj ){
			$cacheFile = $this->getCacheDir() . '/' . $this->getResultObjectCacheKey() . ".entry.txt";
			
			// Check modify time on cached php file
			$filemtime = @filemtime( $cacheFile );  // returns FALSE if file does not exist
			if ( !$filemtime || filesize( $cacheFile ) === 0 || ( time() - $filemtime >= $wgKalturaUiConfCacheTime ) ){
				$this->resultObj = $this->getResultObjectFromApi();
			} else {
				$this->outputFromCache = true;
				$this->resultObj = unserialize( file_get_contents( $cacheFile ) );
			}
			// Test if the resultObject can be cached ( no access control restrictions )
			if( $this->isCachableRequest() ){
				$this->putCacheFile( $cacheFile, serialize( $this->resultObj  ) );
			}
		}
		return $this->resultObj;
	}
	public function getFileCacheTime() {
		$cacheFile = $this->getCacheDir() . '/' . $this->getResultObjectCacheKey() . ".entry.txt";
		return ( @filemtime( $cacheFile ) )? @filemtime( $cacheFile ) : time();
	}
	private function isCachableRequest(){
		if( $this->isAccessControlAllowed( $this->resultObj ) !== true  ){
			return false;
		}
		// No prestrictions 
		return true;
	}
	private function putCacheFile( $cacheFile, $data ){
		global $wgEnableScriptDebug;
		// Don't cache things when in "debug" mode:
		if( $wgEnableScriptDebug || $this->noCache ){
			return ;
		}
		file_put_contents( $cacheFile, $data );
	}
}
