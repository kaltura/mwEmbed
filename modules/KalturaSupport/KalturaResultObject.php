<?php

define( 'KALTURA_GENERIC_SERVER_ERROR', "Error getting sources from server. Please try again.");

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
	var $uiConfFile = null;
	var $uiConfXml = null; // lazy init
	var $playlistObject = null; // lazy init playlist Object
	var $noCache = false;
	// flag to control if we are in playlist mode
	var $isPlaylist = null; // lazy init
    var $isCarousel = null;
	var $isJavascriptRewriteObject = null;
	var $error = false;
	// Set of sources
	var $sources = null;
	var $partnerId = null;
	
	// Local flag to store whether output was came from cache or was a fresh request
	private $outputFromCache = false;
	// local flag to store if the uiconf file was from cache.
	private $outputUiConfFileFromCache = false;

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
		'debug' => null
	);
	
	var $playerConfig = array();

	function __construct( $clientTag = 'php'){
		//parse input:
		$this->parseRequest();
		// set client tag with cache_st
		$this->clientTag = $clientTag . ',cache_st: ' . $this->urlParameters['cache_st'];
		// load the request object:
		$this->getResultObject();
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
	function getError() {
		return $this->error;
	}
	public function getPlayerConfig( $confPrefix = false, $attr = false ) {
		if( ! $this->playerConfig ) {
			$this->setupPlayerConfig();
		}
		$plugins = $this->playerConfig['plugins'];
		$vars = $this->playerConfig['vars'];

		if( $confPrefix ) {
			if( isset( $plugins[ $confPrefix ] ) ) {
				if( $attr ) {
					if( isset( $plugins[ $confPrefix ][ $attr ] ) ) {
						return $plugins[ $confPrefix ][ $attr ];
					} else {
						return null;
					}
				} else {
					return $plugins[ $confPrefix ];
				}
			} else {
				return null;
			}
		}

		if( $attr && isset( $vars[ $attr ] ) ) {
			return $vars[ $attr ];
		}

		return $this->playerConfig;
	}

	public function getWidgetPlugins() {
		if( ! $this->playerConfig ) {
			$this->setupPlayerConfig();
		}
		return $this->playerConfig['plugins'];
	}

	public function getWidgetUiVars() {
		if( ! $this->playerConfig ) {
			$this->setupPlayerConfig();
		}
		return $this->playerConfig['vars'];
	}

	// empty player test ( nothing in the uiConf says "player" diffrent from other widgets so we 
	// we just have to use the 
	function isEmptyPlayer(){
		if( !$this->urlParameters['entry_id'] && ! isset( $this->urlParameters['flashvars']['referenceId'] ) && !$this->isJavascriptRewriteObject()
			&& !$this->isPlaylist() && !$this->isCarousel() ){
			return true;
		}
		return false;
	}
    // Check if the requested url includes a carousel
    function isCarousel(){
        if ( !is_null ( $this->isCarousel ) ){
            return $this->isCarousel;
        }
		$this->isCarousel = ( !! $this->getPlayerConfig('playlistAPI', 'kpl0Url') ) && ( !! $this->getPlayerConfig( 'related' ) );
        return $this->isCarousel;
    }
	// Check if the requested url is a playlist
	function isPlaylist(){
		// Check if the playlist is null: 
		if( !is_null ( $this->isPlaylist ) ){
			return $this->isPlaylist;
		}
		// Check if its a playlist url exists ( better check for playlist than playlist id )
		$this->isPlaylist = ( !! $this->getPlayerConfig('playlistAPI', 'kpl0Url') && !$this->isCarousel() ) ;
		return $this->isPlaylist;
	}
	function isJavascriptRewriteObject() {
		// If this is a pptWidget, handle in client side
		// TODO: we should handle this widget the same as playlist
		if( $this->getPlayerConfig('pptWidgetAPI', 'plugin') ) {
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
	public function isCachedUiConfFile(){
		global $wgEnableScriptDebug;
		if( $wgEnableScriptDebug ) {
			return false;
		}
		return $this->outputUiConfFileFromCache;
	}
	public function getUserAgent() {
		return isset($_SERVER['HTTP_USER_AGENT']) ? $_SERVER['HTTP_USER_AGENT'] : '';
	}
	/**
	 * Checks if a user agent is restricted via the user restriction plugin present in the uiConf XML
	 * this check is run as part of resultObject handling so we must pass in the uiConf string
	 */ 
	public function isUserAgentRestrictedPlugin() {
		$userAgentPlugin = $this->getPlayerConfig('restrictUserAgent');
		if( $userAgentPlugin ) {
			$restrictedMessage = true;
			// Set error message
			if( $userAgentPlugin['restrictedUserAgentTitle'] && $userAgentPlugin['restrictedUserAgentMessage'] ) {
				$restrictedMessage = $userAgentPlugin['restrictedUserAgentTitle'] . "\n" . $userAgentPlugin['restrictedUserAgentMessage'];
			}

			$restrictedStrings = $userAgentPlugin['restrictedUserAgents'];
			if( $restrictedStrings ) {
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
			}
		}
		return false;
	}
	/**
	*  Access Control Handling
	*/
	public function isAccessControlAllowed( &$resultObject = null ) {
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
			$resultObject =  $this->getResultObject();
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
		} else {
			$userAgentRestricted = $this->isUserAgentRestrictedPlugin();
			if( $userAgentRestricted === false ) {
				return true;
			} else {
				// We have user agent restriction, set up noCache flag
				$this->noCache = true;
				if( $userAgentRestricted === true ) {
					return $userAgentMessage;
				} else {
					return $userAgentRestricted;
				}
			}
		}
		return true;
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
		require_once 'KalturaSupport.i8ln.php';
		if( isset( $messages['ks-' . $msgKey ] )){
			return $messages['ks-' . $msgKey ];
		}
		return $msgKey;
	}
	
	function formatString( $str ) {
		// trim any whitespace
		$str = trim( $str );
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

	/* setupPlayerConfig()
	 * Creates an array of our player configuration.
	 * The array is build from: Flashvars, uiVars, uiConf
	 * The array include 2 arrays:
	 * plugins - contains all of our plugins configuration
	 * vars - contain flat player configuration
	 */
	function setupPlayerConfig() {

		$plugins = array();
		$vars = array();

		// Get all plugins elements
		if( $this->uiConfFile ) {
			$pluginsXml = $this->getUiConfXML()->xpath("*//*[@id]");
			for( $i=0; $i < count($pluginsXml); $i++ ) {
				$pluginId = (string) $pluginsXml[ $i ]->attributes()->id;
				// Enforce the lower case first letter of plugin convention: 
                if ( isset( $pluginId[0] ) ) {
                    $pluginId = strtolower( $pluginId[0] ) . substr( $pluginId, 1 );
                }
				$plugins[ $pluginId ] = array(
					'plugin' => true
				);
				foreach( $pluginsXml[ $i ]->attributes() as $key => $value) {
					if( $key == "id" ) {
						continue;
					}
					$plugins[ $pluginId ][ $key ] = $this->formatString( (string) $value );
				}
			}
		}
		
		// Strings
		if( $this->uiConfFile ) {
			$uiStrings = $this->getUiConfXML()->xpath("*//string");
			for( $i=0; $i < count($uiStrings); $i++ ) {
				$key = ( string ) $uiStrings[ $i ]->attributes()->key;
				$value = ( string ) $uiStrings[ $i ]->attributes()->value;
				
				// setup string s plugin: 
				if( !isset( $plugins[ 'strings' ] ) ){
					$plugins[ 'strings' ] = array ();
				}
				// add the current key value pair: 
				$plugins[ 'strings' ][ $key ] = $value;
			}
		}
		
		
		// Flashvars
		if( $this->urlParameters[ 'flashvars' ] ) {
			$flashVars = $this->urlParameters[ 'flashvars' ];
			foreach( $flashVars as $fvKey => $fvValue) {
				$vars[ $fvKey ] = $this->formatString( $fvValue );
			}
		}

		// uiVars
		if( $this->uiConfFile ) {
			$uiVarsXml = $this->getUiConfXML()->xpath( "*//var" );
			for( $i=0; $i < count($uiVarsXml); $i++ ) {

				$key = ( string ) $uiVarsXml[ $i ]->attributes()->key;
				$value = ( string ) $uiVarsXml[ $i ]->attributes()->value;
				$override = ( string ) $uiVarsXml[ $i ]->attributes()->overrideflashvar;

				// Continue if flashvar exists and can't override
				if( isset( $vars[ $key ] ) && !$override ) {
					continue;
				}
				$vars[ $key ] = $this->formatString($value);
			}
		}
		
		// Set Plugin attributes from uiVars/flashVars to our plugins array
		foreach( $vars as $key => $value ) {
			// If this is not a plugin setting, continue
			if( strpos($key, "." ) === false ) {
				continue;
			}

			$pluginKeys = explode(".", $key);
			$pluginId = $pluginKeys[0];
			// Enforce the lower case first letter of plugin convention: 
			$pluginId = strtolower( $pluginId[0] ) . substr($pluginId, 1 );
			
			$pluginAttribute = $pluginKeys[1];

			// If plugin exists, just add/override attribute
			if( isset( $plugins[ $pluginId ] ) ) {
				$plugins[ $pluginId ][ $pluginAttribute ] = $value;
			} else {
				// Add to plugins array with the current key/value
				$plugins[ $pluginId ] = array(
					$pluginAttribute => $value
				);
			}
			// Removes from vars array (keep only flat vars)
			//unset( $vars[ $key ] );
		}

		$this->playerConfig = array(
			'plugins' => $plugins,
			'vars' => $vars,
			'uiConfId' => $this->getUiConfId(),
			'partnerId' => $this->getPartnerId()
		);
		
		// Add entry Id if exists
		if( $this->getEntryId() ) {
			$this->playerConfig['entryId'] = $this->getEntryId();
		}

		//echo '<pre>';
		//echo json_encode( $this->playerConfig );
		//print_r( $this->playerConfig );
		//exit();
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
		// Get a key based on partner id,  entry_id and ui_confand and refer url
		$playerUnique = ( isset( $this->urlParameters['entry_id'] ) ) ?  $this->urlParameters['entry_id'] : '';
		$playerUnique .= ( isset( $this->urlParameters['uiconf_id'] ) ) ?  $this->urlParameters['uiconf_id'] : '';
		$playerUnique .= ( isset( $this->urlParameters['cache_st'] ) ) ? $this->urlParameters['cache_st'] : ''; 
		// Check for playlist urls
		$playerUnique .= ( isset( $this->urlParameters['flashvars']['playlistAPI.kpl0Url']  ) )? 
			$this->urlParameters['flashvars']['playlistAPI.kpl0Url']  : '';
			
		$playerUnique .= $this->getReferer();

		// Hash the service url, the partner_id, the player_id and the Referer url: 
		return substr( md5( $this->getServiceConfig( 'ServiceUrl' )  ), 0, 5 ) . '_' . $this->getPartnerId() . '_' . 
			   substr( md5( $playerUnique ), 0, 20 );
	}

	private function getResultObjectFromApi(){
		if( $this->isEmptyPlayer() ){
			return $this->getUiConfResult();
		} else if( $this->isPlaylist() || $this->isCarousel() ){
			return $this->getPlaylistResult();
		} else {
			return $this->getEntryResult();
		}
	}
	
	function getUiConfResult(){
		// no need to call this.. the getters don't have clean lazy init and . 
		// $this->loadUiConf
		$resultObject = Array( 'uiConf' => $this->uiConfFile, 'uiconf_id' => $this->urlParameters['uiconf_id'] );
		$resultObject = array_merge( $this->getBaseResultObject(), $resultObject);
		return $resultObject;
	}
	function loadUiConf() {
		// If no uiconf_id .. throw exception
		if( !$this->urlParameters['uiconf_id'] ) {
			throw new Exception( "Missing uiConf ID" );
		}
		// Check if we have a cached result object:
		if( !$this->uiConfFile ){
			$cacheFile = $this->getCacheDir() . '/' . $this->getResultObjectCacheKey() . ".uiconf.txt";
			if( $this->canUseCacheFile( $cacheFile ) ){
				$this->uiConfFile = file_get_contents( $cacheFile );
				$this->outputUiConfFileFromCache = true;
			} else {
				$this->uiConfFile = $this->loadUiConfFromApi();
				$this->putCacheFile( $cacheFile, $this->uiConfFile );
			}
		}
		$this->parseUiConfXML( $this->uiConfFile );
		$this->setupPlayerConfig();
	}

	function loadUiConfFromApi() {
		$client = $this->getClient();
		$kparams = array();
		try {
			if( $this->noCache ) {
				$client->addParam( $kparams, "nocache",  true );
			}
			$client->addParam( $kparams, "id",  $this->urlParameters['uiconf_id'] );
			$client->queueServiceActionCall( "uiconf", "get", $kparams );

			$rawResultObject = $client->doQueue();
		} catch( Exception $e ){
			// Update the Exception and pass it upward
			throw new Exception( KALTURA_GENERIC_SERVER_ERROR . "\n" . $e->getMessage() );
		}
		
		if( isset( $rawResultObject->code ) ) {
			$this->error = $rawResultObject['message'];
		}
		if( isset( $rawResultObject->confFile ) ){
			return $this->cleanUiConf( $rawResultObject->confFile );
		}
		return null;
	}

	function getPlaylistResult(){
		// Get the first playlist list:
		$playlistId =  $this->getFirstPlaylistId();
		
		$playlistObject = $this->getPlaylistObject( $playlistId  );
		
		// Create an empty resultObj
		if( isset( $playlistObject[0] ) && $playlistObject[0]->id ){
			// Set the isPlaylist flag now that we are for sure dealing with a playlist
			if ( !$this->isCarousel() ) {
				$this->isPlaylist = true;
			}
			// Check if we have playlistAPI.initItemEntryId
			if( $this->getPlayerConfig('playlistAPI', 'initItemEntryId' ) ){
				$this->urlParameters['entry_id'] = 	htmlspecialchars( $this->getPlayerConfig('playlistAPI', 'initItemEntryId' ) );
			} else {
				$this->urlParameters['entry_id'] = $playlistObject[0]->id;
			}
			
			// Now that we have an entry_id get entry data:
			$resultObj = $this->getEntryResult();
			
			// Include the playlist in the response:
			$resultObj[ 'playlistData' ] = array(
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
		// Build the reqeust: 
		$kparams = array();
		if( !$this->playlistObject ){
			// Check if we are dealing with a playlist url: 
			if( preg_match('|^http(s)?://[a-z0-9-]+(.[a-z0-9-]+)*(:[0-9]+)?(/.*)?$|i', $playlistId) != 0 ){
				$this->playlistObject = $this->getPlaylistObjectFromMrss( $playlistId );
			} else {
				// kaltura playlist id:
				$this->playlistObject = $this->getPlaylistObjectFromKalturaApi( $playlistId );
			}
		}
		return $this->playlistObject;
	}
	function getPlaylistObjectFromMrss( $mrssUrl ){
		$mrssXml = @file_get_contents( $mrssUrl );	
		if( ! $mrssXml ){
			$this->error = 'Could not load mrss url';
			return array();
		}
		try{
			$xml = new SimpleXMLElement( $mrssXml );
		} catch( Exception $e ){
			$this->error = 'Could not parse mrss xml';
			return array();
		}
		// Build the entry set array:		
		$entrySet = array();
		foreach ($xml->channel->item as $item) {
			$kaltuarNS = $item->children('http://kaltura.com/playlist/1.0'); 
			if( isset( $kaltuarNS->entryId ) ){
				$entrySet[] = $kaltuarNS->entryId;
			}
		}
		
		$client = $this->getClient();
		try {
			$kparams = array();
			$client->addParam( $kparams, "entryIds", implode(',', $entrySet ) );
			$client->queueServiceActionCall( "baseEntry", "getByIds", $kparams );
			$this->playlistObject = $client->doQueue();
				
		} catch( Exception $e ){
			// Throw an Exception and pass it upward
			throw new Exception( KALTURA_GENERIC_SERVER_ERROR . "\n" . $e->getMessage() );
			return array();
		}
		return $this->playlistObject;
	}
	function getPlaylistObjectFromKalturaApi( $playlistId ){
		$client = $this->getClient();
		$cacheFile = $this->getCacheDir() . '/' . $this->getPartnerId() . '.' . $this->getCacheSt() . $playlistId;
		if( $this->canUseCacheFile( $cacheFile ) ){
			$this->playlistObject = unserialize( file_get_contents( $cacheFile ) );
		} else {
			try {
				$kparams = array();
				
				$client->addParam( $kparams, "id", $playlistId);
				$client->queueServiceActionCall( "playlist", "execute", $kparams );
				
				$this->playlistObject = $client->doQueue();
				$this->putCacheFile( $cacheFile, serialize( $this->playlistObject) );
			
			} catch( Exception $e ){
				// Throw an Exception and pass it upward
				throw new Exception( KALTURA_GENERIC_SERVER_ERROR . "\n" . $e->getMessage() );
				return false;
			}
		}
		return $this->playlistObject; 
	}
	/**
	 * Get the XML for the first playlist ( the one likely to be displayed ) 
	 * 
	 * this is so we can pre-load details about the first entry for fast playlist loading,
	 * and so that the first entry video can be in the page at load time.   
	 */
	function getFirstPlaylistId(){
		$playlistId = $this->getPlayerConfig('playlistAPI', 'kpl0Url');
		$playlistId = urldecode( $playlistId );
		$playlistId = htmlspecialchars_decode( $playlistId );
		// Parse out the "playlistId from the url ( if its a url )
		$plParsed = parse_url( $playlistId );

		if( is_array( $plParsed ) && isset( $plParsed['query'] ) ){
			$args = explode("&", $plParsed['query'] );
			foreach( $args as $inx => $argSet ){
				$keyVal = explode('=', $argSet );
				if( count( $keyVal ) == 2 ){
					if( $keyVal[0] == 'playlist_id' ){
						$playlistId = $keyVal[1];
					}
				}
			}
		}
		return $playlistId;
	}
	
	function getEntryResult(){
		$client = $this->getClient();
		// define resultObject prior to try catch call
		$resultObject = array();
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
			// Set entry parameter
			$entryParam = array( 'entryId' => $entryIdParamValue );
			
			// getByEntryId is deprecated - Use list instead
			$filter = new KalturaAssetFilter();
			$filter->entryIdEqual = $entryIdParamValue;
			$params = array( 'filter' => $filter );

			// Flavors: 
			$namedMultiRequest->addNamedRequest( 'flavors', 'flavorAsset', 'list', $params );
				
			// Access control NOTE: kaltura does not use http header spelling of Referer instead kaltura uses: "referrer"
			$params = array_merge( $entryParam, 
				array( "contextDataParams" => array( 
							'referrer' =>  $this->getReferer()
						)
					)
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
			if( $this->getPlayerConfig(false, 'getCuePointsData') !== false ) {
				$filter = new KalturaCuePointFilter();
				$filter->orderBy = KalturaAdCuePointOrderBy::START_TIME_ASC;
				$filter->entryIdEqual = $entryIdParamValue;

				$params = array( 'filter' => $filter );
				$namedMultiRequest->addNamedRequest( 'entryCuePoints', "cuepoint_cuepoint", "list", $params );
			}
			// Get the result object as a combination of baseResult and multiRequest
			$resultObject = $namedMultiRequest->doQueue();
			// merge in the base result object:
			$resultObject = array_merge( $this->getBaseResultObject(), $resultObject);
			// If flavors are fetched, list contains a secondary 'objects' array
			if ( isset( $resultObject['flavors']->objects ) ) {
				$resultObject['flavors'] = $resultObject['flavors']->objects;
			}
			
			// Check if the server cached the result by search for "cached-dispatcher" in the request headers
			// If not, do not cache the request (Used for Access control cache issue)
			$requestCached = in_array( "X-Kaltura: cached-dispatcher", $client->getResponseHeaders() );
			if( $requestCached === false ) {
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
		// Convert entryMeta to entryMeta XML
		if( isset( $resultObject['entryMeta'] ) && 
			isset( $resultObject['entryMeta']->objects[0] ) && 
			isset( $resultObject['entryMeta']->objects[0]->xml )
		){			
			$resultObject['entryMeta'] = $this->xmlToArray( new SimpleXMLElement( $resultObject['entryMeta']->objects[0]->xml ) );
		}
		
		// Add uiConf file to our object
		if( $this->uiConfFile ){
			$resultObject[ 'uiconf_id' ] = $this->urlParameters['uiconf_id'];
			$resultObject[ 'uiConf' ] = $this->uiConfFile;
		}
		
		// Set the partner id
		if( is_object( $resultObject['meta'] ) && isset( $resultObject['meta']->partnerId ) ) {
			$this->partnerId = $resultObject['meta']->partnerId;
			$resultObject['partner_id'] = $resultObject['meta']->partnerId;
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
	 * Convert xml data to array
	 */
	function xmlToArray ( $data ){
		if ( is_object($data) ){
			$data = get_object_vars($data);
		}
		return (is_array($data)) ? array_map( array( $this, __FUNCTION__) ,$data) : $data;
	}	
	public function getReferer(){
		global $wgKalturaForceReferer;
		if( $wgKalturaForceReferer !== false ){
			return $wgKalturaForceReferer;
		}
		return ( isset( $_SERVER['HTTP_REFERER'] ) ) ? $_SERVER['HTTP_REFERER'] : 'http://www.kaltura.org/';
	}
	private function getRemoteAddrHeader(){
		global $wgKalturaRemoteAddressSalt, $wgKalturaForceIP, $wgKalturaRemoteAddrWhitelistedHosts;
		if( $wgKalturaRemoteAddressSalt === false ){
			return '';
		}
		$remoteIp = null;
		$requestHeaders = getallheaders();
		
		// Check for X-KALTURA-REMOTE-ADDR header for debug
		if( isset( $requestHeaders['X-KALTURA-REMOTE-ADDR'] ) && $requestHeaders['X-KALTURA-REMOTE-ADDR'] != '' ){
			return "X_KALTURA_REMOTE_ADDR: " . $requestHeaders['X-KALTURA-REMOTE-ADDR'];
		}
		
		// Check for x-forward-for and x-real-ip headers 
		if( isset( $_SERVER['HTTP_X_FORWARDED_FOR'] ) &&
			( 
				in_array( $_SERVER['HTTP_HOST'], $wgKalturaRemoteAddrWhitelistedHosts ) 
					||
				isset( $_SERVER['HTTP_X_FORWARDED_HOST']) &&
				in_array( $_SERVER['HTTP_X_FORWARDED_HOST'], $wgKalturaRemoteAddrWhitelistedHosts ) 
			)
		){
			// pick the first non private ip
			$headerIPs = trim( $_SERVER['HTTP_X_FORWARDED_FOR'], ',' );
			$headerIPs = explode(',', $headerIPs);
			foreach ($headerIPs as $ip){
				preg_match("/^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}/", trim($ip), $matches); // ignore any string after the ip address
				if ( !isset( $matches[0] ) ){
					continue;
				}
					
	 			$tempAddr = trim($matches[0]);
	 			if ( self::isIpPrivate( $tempAddr ) ){	// verify that ip is not from a private range
	 				continue;
	 			}
	 			
	 			$remoteIp = $tempAddr;
	 			break;
		 	}
		}
		// Check for x-real-ip
		if( !$remoteIp && isset( $requestHeaders['X-Real-IP'] ) ){
			// also trim any white space
			list( $remoteIp ) = explode( ',', $requestHeaders['X-Real-IP'] );
		}
		// if all else fails use the $remoteIp
		if( !$remoteIp ){
			$remoteIp = $_SERVER['REMOTE_ADDR'];
		}
		// Support configuration override for testing. 
		if( $wgKalturaForceIP ){
			$remoteIp = $wgKalturaForceIP;
		}
		// make sure there is no white space
		$remoteIp = trim( $remoteIp );
		$s = $remoteIp . "," . time() . "," . microtime( true );
		return "X_KALTURA_REMOTE_ADDR: " . $s . ',' . md5( $s . "," . $wgKalturaRemoteAddressSalt );
	}
	public static function isIpPrivate( $ip ){
		$privateRanges = array(
			'10.0.0.0|10.255.255.255',
			'172.16.0.0|172.31.255.255',
			'192.168.0.0|192.168.255.255',
			'169.254.0.0|169.254.255.255',
			'127.0.0.0|127.255.255.255',
		);
		
		$longIp = ip2long($ip);
		if ($longIp && $longIp != -1)
		{
			foreach ($privateRanges as $range)
			{
				list($start, $end) = explode('|', $range);
				if ($longIp >= ip2long($start) && $longIp <= ip2long($end)) {
					return true;
				}
			}
		}
		return false;
	}
	private function getClient(){
		global $mwEmbedRoot, $wgKalturaUiConfCacheTime, $wgScriptCacheDirectory, 
			$wgMwEmbedVersion, $wgKalturaServiceTimeout, $wgLogApiRequests;

		$cacheDir = $wgScriptCacheDirectory;

		$cacheFile = $this->getCacheDir() . '/' . $this->getWidgetId() . '.' . $this->getCacheSt() . ".ks.txt";
		$cacheLife = $wgKalturaUiConfCacheTime;

		$conf = new KalturaConfiguration( null );

		$conf->serviceUrl = $this->getServiceConfig( 'ServiceUrl' );
		$conf->serviceBase = $this->getServiceConfig( 'ServiceBase' );
		$conf->clientTag = $this->clientTag;
		$conf->curlTimeout = $wgKalturaServiceTimeout;
		$conf->userAgent = $this->getUserAgent();
		$conf->verifySSL = false;
		$conf->requestHeaders = array(  $this->getRemoteAddrHeader() );

		if( $wgLogApiRequests ) {
			require_once 'KalturaLogger.php';
			$conf->setLogger( new KalturaLogger() );
		}
		
		$client = new KalturaClient( $conf );
		if( isset($this->urlParameters['flashvars']['ks']) ) {
			$this->ks = $this->urlParameters['flashvars']['ks'];
		} else if( isset($this->urlParameters['ks']) ) {
			$this->ks = $this->urlParameters['ks'];
		} else {
			if( $this->canUseCacheFile( $cacheFile ) ){
				$this->ks = file_get_contents( $cacheFile );
			} else {
				try{
					$session = $client->session->startWidgetSession( $this->urlParameters['wid'] );
					$this->ks = $session->ks;
					$this->partnerId = $session->partnerId;
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
	public function getThumbnailUrl() {
		// Get result object
		$result =  $this->getResultObject();

		// Add KS if needed
		$ksParam = '';
		if( $this->getWidgetUiVars('loadThumbnailWithKs') ) {
			$ksParam = '?ks=' . $this->getKS();
		}

		if( isset( $result['meta'] ) && is_object( $result['meta'] ) && !isset( $result['meta']->code) ){
			return $result['meta']->thumbnailUrl . '/height/480' . $ksParam;
		} else {
			// return black pixel
			return "data:image/png,%89PNG%0D%0A%1A%0A%00%00%00%0DIHDR%00%00%00%01%00%00%00%01%08%02%00%00%00%90wS%DE%00%00%00%01sRGB%00%AE%CE%1C%E9%00%00%00%09pHYs%00%00%0B%13%00%00%0B%13%01%00%9A%9C%18%00%00%00%07tIME%07%DB%0B%0A%17%041%80%9B%E7%F2%00%00%00%19tEXtComment%00Created%20with%20GIMPW%81%0E%17%00%00%00%0CIDAT%08%D7c%60%60%60%00%00%00%04%00%01'4'%0A%00%00%00%00IEND%AEB%60%82";
		}
	}
	public function getUrlParameters(){
		return $this->urlParameters;
	}
	public function getJSON(){
		return json_encode( $this->getResultObject() );
	}

	/* 
	 * Cleans up uiConf XML from bad format
	 * Hopefully we could remove this function in the future
	 */
	public function cleanUiConf( $uiConf ) {
		// remove this hack as soon as possible
		$uiConf = str_replace( '[kClick="', 'kClick="', $uiConf);
		// remove this hack as soon as possible as well!
		$brokenFlashVarXMl =  'autoPlay=false&screensLayer.startScreenOverId=startScreen&screensLayer.startScreenId=startScreen';
		$uiConf = str_replace( $brokenFlashVarXMl, htmlentities( $brokenFlashVarXMl ), $uiConf );
		// handle any non-escapsed &
		$uiConf = preg_replace('/&[^; ]{0,6}.?/e', "((substr('\\0',-1) == ';') ? '\\0' : '&amp;'.substr('\\0',1))", $uiConf);

		return $uiConf;
	}
	/*
	 * Parse uiConf XML
	 */
	public function parseUiConfXML( $uiConf ){
		if( $uiConf == '' ) {
			// Empty uiConf ( don't try and parse, return an empty object)
			return new SimpleXMLElement('<xml />' );
		}
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
	public function getUiConf() {
		if( ! $this->uiConfFile ) {
			$this->loadUiConf();
		}
		return $this->uiConfFile;
	}
	public function getUiConfXML() {
		if( !$this->uiConfXml ){
			$this->loadUiConf();
		}
		return $this->uiConfXml;
	}
	public function getMeta(){
		$result = $this->getResultObject();
		if( isset( $result['meta'] ) ){
			return $result['meta'];
		} else {
			return false;
		}
	}
	public function getResultObject(){
		global $wgKalturaUiConfCacheTime, $wgEnableScriptDebug, $wgKalturaForceResultCache;

		// Load the uiConf first so we could setup our player configuration
		$this->loadUiConf();
		
		// check if its an empty player and set the error: 
		if( $this->isEmptyPlayer() ){
			$this->error = self::NO_ENTRY_ID_FOUND;
		}

		// Check if we have a cached result object:
		if( !$this->resultObj ){
			$cacheFile = $this->getCacheDir() . '/' . $this->getResultObjectCacheKey() . ".entry.txt";
			// Check if we can use the cache file: 
			if( $this->canUseCacheFile( $cacheFile ) ){
				$this->outputFromCache = true;
				$this->resultObj = unserialize( file_get_contents( $cacheFile ) );
			} else {
				$this->resultObj = $this->getResultObjectFromApi();
				// Test if the resultObject can be cached ( no access control restrictions )
				if( $this->isCachableRequest() ){
					$this->putCacheFile( $cacheFile, serialize( $this->resultObj  ) );
					$this->outputFromCache = true;
				}
			}
		}
		return $this->resultObj;
	}
	public function getFileCacheTime() {
		$cacheFile = $this->getCacheDir() . '/' . $this->getResultObjectCacheKey() . ".entry.txt";
		return ( @filemtime( $cacheFile ) )? @filemtime( $cacheFile ) : time();
	}
	private function canUseCacheFile( $cacheFile ){
		global $wgEnableScriptDebug, $wgKalturaForceResultCache, $wgKalturaUiConfCacheTime;
		
		$useCache = !$wgEnableScriptDebug;
		if( $wgKalturaForceResultCache === true){
			$useCache = true;
		}
		$filemtime = @filemtime( $cacheFile );  // returns FALSE if file does not exist
		if ( !$useCache || !$filemtime || filesize( $cacheFile ) === 0 || ( time() - $filemtime >= $wgKalturaUiConfCacheTime ) ){
			return false;
		}
		return true;
	}
	private function isCachableRequest(){
		if( $this->isAccessControlAllowed( $this->resultObj ) !== true  ){
			return false;
		}
		// No prestrictions 
		return true;
	}
	private function putCacheFile( $cacheFile, $data ){
		// Don't cache if noCache flag has been set. 
		if( $this->noCache ){
			return ;
		}
		@file_put_contents( $cacheFile, $data );
	}
}
