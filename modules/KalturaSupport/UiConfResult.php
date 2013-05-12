<?php
/**
 * Description of KalturaUiConfResult
 *
 * @author ran
 */
class UiConfResult {

	// Define dependencies
	var $request = null;
	var $client = null;
	var $cache = null;
	var $logger = null;
	var $utility = null;

	var $uiConfFile = null;
	var $uiConfXml = null; 
	var $playerConfig = null;
	var $noCache = null;
	var $isPlaylist = null;
	
	function __construct( $request, $client, $cache, $logger, $utility ) {

		if(!$request)
			throw new Exception("Error missing request object");
		if(!$client)
			throw new Exception("Error missing client object");
		if(!$cache)
			throw new Exception("Error missing cache object");
		if(!$logger)
			throw new Exception("Error missing logger object");
		if(!$utility)
			throw new Exception("Error missing utility object");		
		
		// Set our objects
		$this->request = $request;
		$this->client = $client;
		$this->cache = $cache;
		$this->logger = $logger;
		$this->utility = $utility;

		$this->loadUiConf();
	}

	function getCacheKey() {
		$cacheKey = substr( md5( $this->request->getServiceConfig( 'ServiceUrl' )  ), 0, 5 ) . 
						'-' . $this->request->getWidgetId() . '-' . $this->request->getUiConfId();
		
		return "uiconf-" . $cacheKey;
	}

	function getConfigCacheKey() {
		$key = $this->getCacheKey();
		$key = str_replace("uiconf-", "config-", $key);
		$flashVars = $this->request->getFlashVars();
		if( count($flashVars) ) {
			$fvString = implode(",", $flashVars);
			$key = $key . "-" . substr( md5($fvString), 0, 10 );
		}
		return $key;
	}
	
	function loadUiConf() {
		// If no uiconf_id .. throw exception
		if( ! $this->request->getUiConfId() ) {
			throw new Exception( "Missing uiConf ID" );
		}
		
		// Check if we have a cached result object:
		$cacheKey = $this->getCacheKey();
		$this->uiConfFile = $this->cache->get( $cacheKey );
		if( $this->uiConfFile === false ){
			$this->uiConfFile = $this->loadUiConfFromApi();
			if( $this->uiConfFile !== null ) {
				$this->logger->log('KalturaUiConfResult::loadUiConf: [' . $this->request->getUiConfId() . '] Cache uiConf xml to: ' . $cacheKey);
				$this->cache->set( $cacheKey, $this->uiConfFile );
			} else {
				throw new Exception( $this->error );
			}
		} else {
			// set output from cache file flag: ( if no exception was thrown ) 
			$this->outputFromCache = true;
		}
		
		$this->parseUiConfXML( $this->uiConfFile );
		$this->setupPlayerConfig();
	}

	function loadUiConfFromApi() {
		$client = $this->client->getClient();
		$kparams = array();
		try {
			if( $this->noCache ) {
				$client->addParam( $kparams, "nocache",  true );
			}
			$client->addParam( $kparams, "id",  $this->request->get('uiconf_id') );
			$client->queueServiceActionCall( "uiconf", "get", $kparams );

			$rawResultObject = $client->doQueue();
		} catch( Exception $e ){
			// Update the Exception and pass it upward
			throw new Exception( KALTURA_GENERIC_SERVER_ERROR . "\n" . $e->getMessage() );
		}
		
		if( is_array( $rawResultObject ) && isset( $rawResultObject['code'] ) ) {
			throw new Exception($rawResultObject['message']);
			return null;
		}
		
		if( isset( $rawResultObject->confFile ) ){
			return $this->cleanUiConf( $rawResultObject->confFile );
		}
		
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
		
		libxml_use_internal_errors(true);
		$xml = simplexml_load_string($uiConf);
		if ($xml === false) {
			$errorMsg = "Failed to parse uiConf XML: \n";
			foreach(libxml_get_errors() as $error) {
				$errorMsg .= "Line " . $error->line . ": " . $error->message . "\n";
			}
			throw new Exception ($errorMsg);
			return new SimpleXMLElement('<xml />' );
		}
		$this->uiConfXml = $xml;
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
	
	/* setupPlayerConfig()
	 * Creates an array of our player configuration.
	 * The array is build from: Flashvars, uiVars, uiConf
	 * The array include 2 arrays:
	 * plugins - contains all of our plugins configuration
	 * vars - contain flat player configuration
	 */
	function setupPlayerConfig() {

		// Generate cache key
		$cacheKey = $this->getConfigCacheKey();

		$this->playerConfig = @unserialize( $this->cache->get( $cacheKey ) );

		if( ! $this->playerConfig ) {
			$xml = $this->getUiConfXML();
			$plugins = array();
			$nodes = array();
			$vars = array();

			// Get all nodes elements
			if( $this->uiConfFile ) {
				$nodesXml = $xml->xpath("*//*[@id]");
				for( $i=0; $i < count($nodesXml); $i++ ) {
					$pluginNode = $nodesXml[ $i ];
					$nodeId = (string) $pluginNode->attributes()->id;
					// Enforce the lower case first letter of plugin convention: 
					if ( isset( $nodeId[0] ) ) {
						$nodeId = strtolower( $nodeId[0] ) . substr( $nodeId, 1 );
					}
					$nodes[ $nodeId ] = array(
						'plugin' => true,
						'type'	 => $pluginNode->getName()
					);
					foreach( $pluginNode->attributes() as $key => $value) {
						if( $key == "id" ) {
							continue;
						}
						$nodes[ $nodeId ][ $key ] = $this->utility->formatString( (string) $value );
					}
				}
			}
			
			// Strings
			if( $this->uiConfFile ) {
				$uiStrings = $xml->xpath("*//string");
				for( $i=0; $i < count($uiStrings); $i++ ) {
					$key = ( string ) $uiStrings[ $i ]->attributes()->key;
					$value = ( string ) $uiStrings[ $i ]->attributes()->value;
					$locale = '';
					if( $uiStrings[ $i ]->attributes()->locale ){
						// append '_' to seperate locale from key 
						$locale = ( string ) $uiStrings[ $i ]->attributes()->locale . '_'; 
					}
					
					// setup string s plugin: 
					if( !isset( $plugins[ 'strings' ] ) ){
						$plugins[ 'strings' ] = array ();
					}
					// add the current key value pair: 
					$plugins[ 'strings' ][ $locale . $key ] = $value;
				}
			}

			// Flashvars
			// Use getFlashvars
			$flashVars = $this->request->getFlashVars();
			if( $flashVars ) {
				foreach( $flashVars as $fvKey => $fvValue) {
					$fvSet = @json_decode( stripslashes( html_entity_decode( $fvValue ) ) ) ;
					// check for json flavar and set acordingly
					if( is_object( $fvSet ) ){
						foreach( $fvSet as $subKey => $subValue ){
							$vars[ $fvKey . '.' . $subKey ] =  $this->utility->formatString( $subValue );
						}
					} else {
						$vars[ $fvKey ] = $this->utility->formatString( $fvValue );
					}
				}
				// Dont allow external resources on flashvars
				$this->filterExternalResources( $vars );
			}

			// uiVars
			if( $this->uiConfFile ) {
				$uiVarsXml = $xml->xpath( "*//var" );
				for( $i=0; $i < count($uiVarsXml); $i++ ) {

					$key = ( string ) $uiVarsXml[ $i ]->attributes()->key;
					$value = ( string ) $uiVarsXml[ $i ]->attributes()->value;
					$override = ( string ) $uiVarsXml[ $i ]->attributes()->overrideflashvar;

					// Continue if flashvar exists and can't override
					if( isset( $vars[ $key ] ) && !$override ) {
						continue;
					}
					$vars[ $key ] = $this->utility->formatString($value);
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
				if( isset( $nodes[ $pluginId ] ) ) {
					$nodes[ $pluginId ][ $pluginAttribute ] = $value;
				} else {
					// Add to nodes array with the current key/value
					$nodes[ $pluginId ] = array(
						$pluginAttribute => $value
					);
				}
				// Removes from vars array (keep only flat vars)
				//unset( $vars[ $key ] );
			}

			foreach( $nodes as $nodeId => $node ) {
				if( isset($node['type']) && $node['type'] == 'Plugin' ) {
					unset($node['type']);
					$plugins[ $nodeId ] = $node;
				}
			}

			// Get layout components
			require_once( dirname( __FILE__ ) .  '/UiConfLayout.php' );
			$uiConfLayout = new uiConfLayout( $xml, $nodes );

			// Set player config
			$this->playerConfig = array(
				'components' => $uiConfLayout->getComponents(),
				'plugins' => $plugins,
				'vars' => $vars
			);
			// Save to cache
			$this->cache->set( $cacheKey, serialize($this->playerConfig) );	
		}

		//echo '<pre>';
		//echo json_encode( $this->playerConfig );
		//print_r( $this->playerConfig );
		//exit();
	}	
	/**
	 * Filters external resources to point at a warning file
	 * @param Array $vars
	 */
	private function filterExternalResources( &$vars ){
		global $wgResourceLoaderUrl, $wgMwEmbedEnabledModules;
		$warningUrl = str_replace('load.php', 'kWidget/externalResourceWarning.js', $wgResourceLoaderUrl);

		# Register / load all the mwEmbed modules
		$configRegister = array();
		foreach( $wgMwEmbedEnabledModules as $moduleName ){
			$manifestPath =  realpath( dirname( __FILE__ ) ) .
							"/../$moduleName/{$moduleName}.manifest.php";
			if( is_file( $manifestPath ) ){
				$configRegister = array_merge( $configRegister, include( $manifestPath ) );
			}
		}
		
		foreach( $vars as $key => $val ){
			if( strpos($key, '.') !== false ){
				list( $pluginKey, $subKey) = explode( '.', $key );
				// Check for generic external resource keys: 
				if( strpos( $subKey, 'iframeHTML5Js' ) === 0 
					&& 
					strpos( $val, '{html5ps}' ) !== 0
				){
					$vars[$key] = $warningUrl;
				}
				// Check for any mainfest defined urlJS type
				if( isset( $configRegister[ $pluginKey ] ) 
						&& 
					isset( $configRegister[ $pluginKey ]['attributes'] ) 
						&&
					isset( $configRegister[ $pluginKey ]['attributes'][ $subKey ] )
						&&
					isset( $configRegister[ $pluginKey ]['attributes'][ $subKey ]['type'] )
						&&
					$configRegister[ $pluginKey ]['attributes'][ $subKey ]['type'] == 'urlJS'
				){
					// we just unset the var ( since we don't want to overide the default
					unset( $vars[$key] );
					// Add a onPageJs warning:
					$vars['IframeCustomPluginJs_warn'] = $warningUrl;
				}
			} else {
				// Check against top level external js include list: 
				if( strpos( $key, 'onPageJs' ) === 0 
					|| 
					strpos( $key, 'IframeCustomPluginJs' ) === 0
				){
					// if the url does not start with {html5ps} or {onPagePluginPath}
					if( strpos( $val, '{html5ps}' ) !== 0 
						&&
						strpos( $val, '{onPagePluginPath}' ) !== 0
					){
						// redirect to external resource
						$vars[$key] = $warningUrl;
					}
				}
			}
		}
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

		// Add additonal player configuration
		$addtionalData = array(
			'uiConfId' 	=> $this->request->getUiConfId(),
			'uiConf' 	=> $this->uiConfFile,
			'widgetId' 	=> $this->request->getWidgetId(),
		);
		// Add entry Id if exists
		if( $this->request->getEntryId() ) {
			$addtionalData['entryId'] = $this->request->getEntryId();
		}
		// Add KS to uiVars
		$this->playerConfig['vars']['ks'] = $this->client->getKS();

		return array_merge($addtionalData, $this->playerConfig);
	}
	// Check if the requested url is a playlist
	public function isPlaylist(){
		// Check if the playlist is null:
		if( !is_null ( $this->isPlaylist ) ){
			return $this->isPlaylist;
		}
		// Check for playlist based on playlistAPI plugin existence
		$this->isPlaylist = ( !! $this->getPlayerConfig('playlistAPI', 'kpl0Url') 
			|| !! $this->getPlayerConfig('playlistAPI', 'kpl0Id') ) ;
		return $this->isPlaylist;
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
	
}

?>
