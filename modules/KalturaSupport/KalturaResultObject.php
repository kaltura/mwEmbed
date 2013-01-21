<?php

define( 'KALTURA_GENERIC_SERVER_ERROR', "Error getting sources from server. Please try again.");

// Include Kaltura client helper
require_once(  dirname( __FILE__ ) . '/KalturaCommon.php');

/**
 * Generates a kaltura result object based on url Parameters 
 */
class KalturaResultObject {
	var $resultObj = null; // lazy init with getResultObject
	var $clientTag = null;
	var $noCache = false;
	var $partnerId = null;
	// flag to control if we are in playlist mode
	var $isPlaylist = null; // lazy init
	var $error = false;
	
	// Local flag to store whether output was came from cache or was a fresh request
	var $outputFromCache = false;

	// Setup static error messages
	const NO_ENTRY_ID_FOUND = "No Entry ID was found";
	
	/**
	 * Variables set by the Frame request:
	 */
	public $urlParameters = array(
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
		'UseManifestUrls' => null,
		'ks' => null,
		'debug' => null,
		// for thumbnails
		'width' => null,
		'height'=> null,
		'playerId' => null,
		'vid_sec' => null,
		'vid_slices' => null
	);
	
	var $playerConfig = array();

	function __construct( $clientTag = 'php'){
		//parse input:
		$this->parseRequest();
		// set client tag with cache_st
		$this->clientTag = $clientTag . ',cache_st: ' . $this->urlParameters['cache_st'];
	}
	function getServiceConfig( $name ){
		global $wgKalturaAllowIframeRemoteService;
		
		// Check if we allow URL override: 
		if( $wgKalturaAllowIframeRemoteService == true ){
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
	}
	function setError( $errorArr ) {
		switch( $errorArr['code'] ) {
			case 'INVALID_KS':
				$this->error = "Invalid KS\nWe're sorry, the KS is invalid.";
				break;
			default:
				$this->error = $errorArr['code'] . "\n" . $errorArr['message'];
		}	
	}
	function getError() {
		return $this->error;
	}
	// empty player test ( nothing in the uiConf says "player" diffrent from other widgets so we 
	// we just have to use the 
	function isEmptyPlayer(){
		if( !$this->urlParameters['entry_id'] 
				&& 
			!isset( $this->urlParameters['flashvars']['referenceId'] ) 
				&& 
			!$this->isPlaylist() 
		){
			return true;
		}
		return false;
	}
	public function isCachedOutput(){
		global $wgEnableScriptDebug; 
		// Don't cache output if an iframe or there is an error.
		if( $wgEnableScriptDebug || $this->error ){
			return false;
		}
		return $this->outputFromCache;
	}

	public function getUserAgent() {
		return isset($_SERVER['HTTP_USER_AGENT']) ? $_SERVER['HTTP_USER_AGENT'] : '';
	}
	/**
	 * Get the kaltura message key message text
	 * @param string $msgKey
	 */
	function getKalturaMsg( $msgKey ){
		global $messages;
		if( $this->getPlayerConfig( 'strings', $msgKey ) ){
			return $this->getPlayerConfig( 'strings', $msgKey );
		}
		// kind of a hack.. manually load the kaltura message file ( 
		// TODO clean up so we can use normal wfMsg stubs with loaded modules. 
		require_once dirname( __FILE__ ) . '/KalturaSupport.i18n.php';
		if( isset( $messages['ks-' . $msgKey ] )){
			return $messages['ks-' . $msgKey ];
		}
		return $msgKey;
	}
	
	static function formatString( $str ) {
		// decode the value: 
		$str = html_entity_decode( $str );
		if( $str === "true" ) {
			return true;
		} else if( $str === "false" ) {
			return false;
		} else if( is_numeric( $str ) ){
			// check for zero prefixed values and return them as strings. 
			if( is_string( $str ) && $str[0] == '0' ){
				return $str;
			}
			return (float)$str;
		} else if( json_decode( $str ) !== null && $str[0] == '{' ){
			return json_decode( $str );
		} else {
			return $str;
		}
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
		if( isset( $_REQUEST['nocache'] ) && $_REQUEST['nocache'] == 'true' ) {
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
	public function getCacheDir(){
		global $wgScriptCacheDirectory;
		$cacheDir = $wgScriptCacheDirectory . '/iframe';
		// make sure the dir exists:
		if( ! is_dir( $cacheDir) ){
			@mkdir( $cacheDir, 0777, true );
		}
		return $cacheDir;
	}
	public function getReferer(){
		global $wgKalturaForceReferer;
		if( $wgKalturaForceReferer !== false ){
			return $wgKalturaForceReferer;
		}
		return ( isset( $_SERVER['HTTP_REFERER'] ) ) ? $_SERVER['HTTP_REFERER'] : 'http://www.kaltura.com/';
	}
	private function getRemoteAddrHeader(){
		global $wgKalturaRemoteAddressSalt, $wgKalturaForceIP;
		if( $wgKalturaRemoteAddressSalt === false ){
			return '';
		}
		$ip = null;
		// Check for x-forward-for and x-real-ip headers 
		$requestHeaders = getallheaders(); 
		if( isset( $requestHeaders['X-Forwarded-For'] ) ){
			// only care about the fist ip ( most likely source ip address ) 
			list( $ip ) = explode( ',', $requestHeaders['X-Forwarded-For'] );
		}
		// Check for x-real-ip
		if( !$ip && isset( $requestHeaders['X-Real-IP'] ) ){
			// also trim any white space
			list( $ip ) = explode( ',', $requestHeaders['X-Real-IP'] );
		}
		if( !$ip ){
			$ip = $_SERVER['REMOTE_ADDR'];
		}
		if( $wgKalturaForceIP ){
			$ip = $wgKalturaForceIP;
		}
		// make sure there is no white space
		$ip = trim( $ip );
		$s = $ip . "," . time() . "," . microtime( true );
		return "X_KALTURA_REMOTE_ADDR: " . $s . ',' . md5( $s . "," . $wgKalturaRemoteAddressSalt );
	}
	public function getClient(){
		global $wgKalturaServiceTimeout, $wgLogApiRequests;

		$cacheFile = $this->getCacheDir() . '/' . $this->getWidgetId() . '.' . $this->getCacheSt() . ".ks.txt";

		$conf = new KalturaConfiguration( null );

		$conf->serviceUrl = $this->getServiceConfig( 'ServiceUrl' );
		$conf->serviceBase = $this->getServiceConfig( 'ServiceBase' );
		$conf->clientTag = $this->clientTag;
		$conf->curlTimeout = $wgKalturaServiceTimeout;
		$conf->userAgent = $this->getUserAgent();
		$conf->verifySSL = false;
		$conf->requestHeaders = array( $this->getRemoteAddrHeader() );

		if( $wgLogApiRequests ) {
			require_once 'KalturaLogger.php';
			$conf->setLogger( new KalturaLogger() );
			$this->logger = $conf->getLogger();
		}
		
		$client = new KalturaClient( $conf );
		
		// Set KS
		if( isset($this->urlParameters['flashvars']['ks']) ) {
			$this->ks = $this->urlParameters['flashvars']['ks'];
		} else if( isset( $this->urlParameters['ks'] ) ) {
			$this->ks = $this->urlParameters['ks'];
		}
		// check for empty ks
		if( !isset( $this->ks) || trim( $this->ks ) == '' ){
			if( $this->canUseCacheFile( $cacheFile ) ){
				$this->ks = file_get_contents( $cacheFile );
			} else {
				try{
					$session = $client->session->startWidgetSession( $this->urlParameters['wid'] );
					$this->ks = $session->ks;
					$this->partnerId = $session->partnerId;
					$this->log('KalturaResultObject::getClient: Cache KS');
					$this->putCacheFile( $cacheFile,  $this->ks );
				} catch ( Exception $e ){
					throw new Exception( KALTURA_GENERIC_SERVER_ERROR . "\n" . $e->getMessage() );
				}
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
	public function getUiConfId(){
		return $this->urlParameters[ 'uiconf_id' ];
	}
	public function getWidgetId() {
		return $this->urlParameters['wid'];
	}
	public function getPartnerId(){
		return $this->partnerId;
	}
	public function getEntryId(){
		return ( isset( $this->urlParameters['entry_id'] ) ) ? $this->urlParameters['entry_id'] : false;
	}
	public function getReferenceId() {
		if ( isset($this->urlParameters['flashvars']) && isset($this->urlParameters['flashvars']['referenceId']) ) {
			return $this->urlParameters['flashvars']['referenceId'];
		}
		return false;
	}
	public function getUrlParameters(){
		return $this->urlParameters;
	}

	public function getFileCacheTime( ) {
		$cacheFile = $this->getCacheFilePath();
		return ( @filemtime( $cacheFile ) )? @filemtime( $cacheFile ) : time();
	}
	public function canUseCacheFile( $cacheFile ){
		global $wgEnableScriptDebug, $wgKalturaForceResultCache, $wgKalturaUiConfCacheTime;
		
		// Check if file exists
		if( file_exists( $cacheFile ) === false ) {
			return false;
		}

		// Check for file size
		if( filesize( $cacheFile ) === 0 ) { 
			return false;
		}

		// If debug mode, disable cache
 		$useCache = !$wgEnableScriptDebug;

		// Force cache flag ( even in debug )
 		if( $wgKalturaForceResultCache === true){
 			$useCache = true;
 		}

 		$filemtime = @filemtime( $cacheFile );  // returns FALSE if file does not exist
		// Check for cache st parameter
		if( $this->getCacheSt() && ( intval($this->getCacheSt()) > ($filemtime - 60) ) ) {
			$useCache = false;
 		}

		// Check if cache is still valid
		if( ( time() - $filemtime >= $wgKalturaUiConfCacheTime ) ) {
			$useCache = false;
		}

		return $useCache; 		
	}
	public function putCacheFile( $cacheFile, $data ){
		// Don't cache if noCache flag has been set. 
		if( $this->noCache ){
			$this->log('KalturaResultObject::putCacheFile: NoCache!');
			return ;
		}
		@file_put_contents( $cacheFile, $data );
	}
	public function log( $msg ) {
		global $wgLogApiRequests;
		if( $wgLogApiRequests ) {
			$this->logger->log($msg);
		}
	}	
}
