<?php

/**
 * Description of KalturaUiConfResult
 *
 * @author ran
 */
require_once(  dirname( __FILE__ ) . '/KalturaResultObject.php');
class KalturaUiConfResult extends KalturaResultObject {

	var $uiConfFile = null;
	var $uiConfXml = null; 
	var $playerConfig = null;
	
	function __construct($clientTag = 'php') {
		parent::__construct($clientTag);
		$this->loadUiConf();
		
		$params = $this->getUrlParameters();
		if( ! $params['entry_id'] && ! isset( $params['flashvars']['referenceId'] ) ) {
			$this->error = parent::NO_ENTRY_ID_FOUND;
		}
	}
	function getCacheFilePath() {
		// Add entry id, cache_st and referrer
		$playerUnique = $this->getUiConfId() . $this->getCacheSt() . $this->getReferer();
		$cacheKey = substr( md5( $this->getServiceConfig( 'ServiceUrl' )  ), 0, 5 ) . '_' . $this->getWidgetId() . '_' . 
			   substr( md5( $playerUnique ), 0, 20 );
		
		return $this->getCacheDir() . '/' . $cacheKey . ".uiconf.txt";
	}	
	
	function loadUiConf() {
		
		// If no uiconf_id .. throw exception
		if( ! $this->getUiConfId() ) {
			throw new Exception( "Missing uiConf ID" );
		}
		
		// Check if we have a cached result object:
		if( !$this->uiConfFile ){
			$cacheFile = $this->getCacheFilePath();
			if( $this->canUseCacheFile( $cacheFile ) ){
				// set output from cache file flag: 
				$this->outputFromCache = true;
				$this->uiConfFile = file_get_contents( $cacheFile );
			} else {
				$this->uiConfFile = $this->loadUiConfFromApi();
				if( $this->uiConfFile !== null ) {
					$this->putCacheFile( $cacheFile, $this->uiConfFile );
				} else {
					throw new Exception( $this->error );
				}
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
		
		if( is_array( $rawResultObject ) && isset( $rawResultObject['code'] ) ) {
			$this->setError( $rawResultObject );
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
				// check for json flavar and set acordingly
				if( is_object( json_decode( html_entity_decode( $fvValue ) ) ) ){
					$fvSet = json_decode( html_entity_decode( $fvValue ) );
					foreach( $fvSet as $subKey => $subValue ){
						$vars[ $fvKey . '.' . $subKey ] =  $this->formatString( $subValue );
					}
				} else {
					$vars[ $fvKey ] = $this->formatString( $fvValue );
				}
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
		
		// Always add KS to uiVars
		$vars[ 'ks' ] = $this->getKS();

		$this->playerConfig = array(
			'plugins' => $plugins,
			'vars' => $vars,
			'uiConfId' => $this->getUiConfId(),
			'uiConf' => $this->uiConfFile,
			'widgetId' => $this->getWidgetId()
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
	// Check if the requested url is a playlist
	public function isPlaylist(){
		// Check if the playlist is null:
		if( !is_null ( $this->isPlaylist ) ){
			return $this->isPlaylist;
		}
		// Check if its a playlist url exists ( better check for playlist than playlist id )
		$this->isPlaylist = ( !! $this->getPlayerConfig('playlistAPI', 'kpl0Url') ) ;
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
