<?php

class RequestHelper {

	var $ks = null;
	var $noCache = false;
	var $debug = false;

	/**
	 * Variables set by the Frame request:
	 */
	public $urlParameters = array(
		'cache_st' => null,
		'p' => null,
		'partner_id' => null,
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


	function __construct( $clientTag = 'php'){
		//parse input:
		$this->parseRequest();
		// Set KS if available in URL parameter or flashvar
		$this->setKSIfExists();
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

		if( isset( $this->urlParameters['partner_id'] ) && !isset( $this->urlParameters['wid'] ) ){
			$this->urlParameters['wid'] = '_' . $this->urlParameters['partner_id'];  
		}		
			
		// Check for debug flag
		if( isset( $_REQUEST['debug'] ) ){
			$this->debug = true;
			$wgEnableScriptDebug = true;
		}

		// Check for no cache flag
		if( isset( $_REQUEST['nocache'] ) && $_REQUEST['nocache'] == 'true' ) {
			$this->noCache = true;
		}

		// Check for required config
		if( $this->urlParameters['wid'] == null ){
			//throw new Exception( 'Can not display player, missing widget id' );
		}
	}

	function get( $name = null ) {
		if( $name && isset( $this->urlParameters[ $name ] ) ) {
			return $this->urlParameters[ $name ];
		}
		return null;
	}

	function set( $key = null, $val = null ) {
		if( $key && $val ) {
			$this->urlParameters[ $key ] = $val;
			return true;
		}
		return false;
	}

	function getServiceConfig( $name ){
		global $wgKalturaAllowIframeRemoteService;
		
		// Check if we allow URL override: 
		if( $wgKalturaAllowIframeRemoteService == true ){
			// Check for urlParameters
			if( $this->get( $name ) ){
				return $this->get( $name );
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

	public function getUserAgent() {
		return isset($_SERVER['HTTP_USER_AGENT']) ? $_SERVER['HTTP_USER_AGENT'] : '';
	}

	public function getReferer(){
		global $wgKalturaForceReferer;
		if( $wgKalturaForceReferer !== false ){
			return $wgKalturaForceReferer;
		}
		return ( isset( $_SERVER['HTTP_REFERER'] ) ) ? $_SERVER['HTTP_REFERER'] : 'http://www.kaltura.com/';
	}

	public function getRemoteAddrHeader(){
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

	public function getCacheSt(){
		return ( $this->get('cache_st') ) ? $this->get('cache_st') : '';
	}
	public function getUiConfId(){
		return $this->get('uiconf_id');
	}
	public function getWidgetId() {
		return $this->get('wid');
	}
	public function getEntryId(){
		return $this->get('entry_id');
	}
	public function getReferenceId() {
		if ( $this->getFlashVars('referenceId') ) {
			return $this->getFlashVars('referenceId');
		}
		return false;
	}

	public function getFlashVars( $key = null ) {
		if( $this->get('flashvars') ) {
			$flashVars = $this->get('flashvars');
			if( ! is_null( $key ) ) {
				if( isset($flashVars[$key]) ) {
					return $flashVars[$key];
				} else {
					return null;
				}
			}
			return $flashVars;
		}
		return array();
	}

	private function setKSIfExists() {
		$ks = null;
		if( $this->getFlashVars('ks') ) {
			$ks = $this->getFlashVars('ks');
		} else if( $this->get('ks') ) {
			$ks = $this->get('ks');
		}
		// check for empty ks
		if( $ks && trim($ks) != '' ){
			$this->ks = $ks;
		}
	}
	
	public function hasKS() {
		return isset($this->ks);
	}

	public function getKS() {
		return $this->ks;
	}
}