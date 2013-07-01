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
	var $isJsonConfig = null;	
	
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

		// Get confFilePath flashvar
		$confFilePath = $this->request->getFlashvars('confFilePath');

		// If no uiconf_id .. throw exception
		if( !$this->request->getUiConfId() && !$confFilePath ) {
			throw new Exception( "Missing uiConf ID or confFilePath" );
		}

		// Try to load confFile from local path
		if( $confFilePath ) {
			$this->loadFromLocalFile( $confFilePath );
		} else {
			// Check if we have a cached result object:
			$cacheKey = $this->getCacheKey();
			$this->uiConfFile = $this->cache->get( $cacheKey );
		}
		
		if( $this->uiConfFile === false ){
			$this->uiConfFile = $this->loadUiConfFromApi();
			if( $this->uiConfFile !== null ) {
				$this->logger->log('KalturaUiConfResult::loadUiConf: [' . $this->request->getUiConfId() . '] Cache uiConf xml to: ' . $cacheKey);
				$this->cache->set( $cacheKey, $this->uiConfFile );
			} else {
				throw new Exception( $this->error );
			}
		}

		if( $this->isJson() ) {
			$this->parseJSON( $this->uiConfFile );
		} else {
			$this->parseUiConfXML( $this->uiConfFile );
			$this->setupPlayerConfig();
		}
	}

	public function isJson() {
		// Check for curey brackets in first & last characters
		if( $this->isJsonConfig === null && $this->uiConfFile ) {
			$firstChar = substr($this->uiConfFile, 0, 1);
			$lastChar = substr($this->uiConfFile, -1);
			if( $firstChar == '{' && $lastChar == '}' ) {
				$this->isJsonConfig = true;
			}
		}
		return $this->isJsonConfig;
	}

	function loadFromLocalFile( $filePath ) {
		$libPath = realpath(dirname(__FILE__) . '/../../' ); 
		$filePath = str_replace('{libPath}', $libPath, $filePath);
		$this->uiConfFile = file_get_contents($filePath);
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
		
		// Check if config is JSON based
		if( $rawResultObject->objTypeAsString == "HTML5" ) {
			$this->isJsonConfig = true;
		}

		if( isset( $rawResultObject->confFile ) ){
			return $this->cleanUiConf( $rawResultObject->confFile );
		}
		
	}

	public function parseJSON( $uiConf ) {
		$this->playerConfig = json_decode( $uiConf, true );
		if( json_last_error() ) {
			throw new Exception("Error Processing JSON: " . json_last_error() );
		}
		$this->playerConfig['vars'] = array();

		/*
		echo '<pre>';
		print_r($this->playerConfig);
		exit();
		*/
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
						$plugins[ $pluginId ][ $key ] = $this->utility->formatString( (string) $value );
					}
				}
			}
			
			// Strings
			if( $this->uiConfFile ) {
				$uiStrings = $this->getUiConfXML()->xpath("*//string");
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
				$uiVarsXml = $this->getUiConfXML()->xpath( "*//var" );
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

			// Set player config
			$this->playerConfig = array(
				'plugins' => $plugins,
				'vars' => $vars,
				'layout' => array()
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
