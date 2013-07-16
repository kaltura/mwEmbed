<?php
/**
* This file injects all on Page uiConf based javascript and configuration and loader. 
*
* it requires a partner_id and a uiconf_id 
*/
require_once( dirname( __FILE__ ) . '/../KalturaCommon.php' );

$wgMwEmbedApiServices['uiconfJs'] = 'mweApiUiConfJs';

// should extend a base mwApiService class
// TODO split into two services "pageResources" and "userAgentPlayerRules"
class mweApiUiConfJs {
	var $resultObject = null;
	var $preLoaderMode = false;
	var $jsConfigCheckDone = false;
	var $lastFileModTime = 0;

	function __construct() {
		global $container;
		$this->request = $container['request_helper'];
		$this->utility = $container['utility_helper'];
	}
	
	function run(){
		global $wgEnableScriptDebug;
		$o = "/* kaltura uiConfJS loader */\n";
		// get the checkUserAgentPlayerRules call if present in plugins
		$o.= $this->getUserAgentPlayerRules();
		// Get on page javascript: 
		$o.= $this->getPluginPageJs();
		// add any on-page javascript
		$this->sendHeaders();
		// check if we should minify:
		if( !$wgEnableScriptDebug ){
			// ob_gzhandler automatically checks for browser gzip support and gzips
			if(!ob_start("ob_gzhandler")) ob_start();
			// output the cached min version:
			$this->outputMinfiedCached( $o );
		} else {
			echo $o;
		}
	}
	function outputMinfiedCached( $jsContent ){
		global $wgScriptCacheDirectory, $wgMwEmbedVersion, $wgBaseMwEmbedPath, $wgResourceLoaderMinifierStatementsOnOwnLine;
		// Get the JSmin class:
		require_once( $wgBaseMwEmbedPath . '/includes/libs/JavaScriptMinifier.php' );
		
		// Create cache directory if not exists
		if( ! file_exists( $wgScriptCacheDirectory ) ) {
			$created = @mkdir( $wgScriptCacheDirectory );
			if( ! $created ) {
				echo "if( console ){ console.log('Error in creating cache directory: ". $wgScriptCacheDirectory . "'); }";
			}
		}

		$loaderCacheFile = $wgScriptCacheDirectory . '/uiConfJs-' . $wgMwEmbedVersion . $this->getKey() . '.js';

		$cacheModTime = @filemtime( $loaderCacheFile );
		
		// check if there were any updates to the mwEmbedLoader file
		if( is_file( $loaderCacheFile ) && $this->lastFileModTime < $cacheModTime ){
			echo file_get_contents( $loaderCacheFile );
		} else {
			$jsMinContent = JavaScriptMinifier::minify( $jsContent, $wgResourceLoaderMinifierStatementsOnOwnLine );
			if( !@file_put_contents( $loaderCacheFile, $jsMinContent ) ){
				echo "if( console ){ console.log('Error in creating loader cache: ". $wgScriptCacheDirectory . "'); }";
			}
			echo $jsMinContent;
		}
	}
	function getKey(){
		$key = $this->request->getWidgetId() . '-' . $this->request->getUiConfId();
        $flashVars = $this->request->getFlashVars();
	    unset($flashVars[‘swid’]);
	    ksort($flashVars);
    	return $key . '-' . md5(http_build_query($flashVars));
	}
	function resolvePath( $path ){
		global $wgKalturaPSHtml5SettingsPath, $wgBaseMwEmbedPath;
		if( strpos( $path, '{onPagePluginPath}' ) !== 0 
			&&
			strpos( $path, '{html5ps}' ) !== 0 
		){
			return $path;
		}
		if( strpos( $path, '{onPagePluginPath}' )  === 0 ){
			$path = str_replace( '{onPagePluginPath}', '', $path);
			$fullPath = $wgBaseMwEmbedPath . '/kWidget/onPagePlugins' . $path;
			return $fullPath;	
		}
		if( strpos( $path, '{html5ps}' ) === 0 ){
			$basePsPath =  realpath( dirname( $wgKalturaPSHtml5SettingsPath ) . '/../ps/' );
			return realpath( str_replace('{html5ps}', $basePsPath, $path) );
		}
		return $path; 
	}
	/**
	 * outputs 
	 */
	function getPluginPageJs( $callbackJsName = null ){
		global $wgEnableScriptDebug, $wgBaseMwEmbedPath;
		// flag for requires jQuery
		$requiresJQuery = false;
		// inti script output 
		$o = '';
		// Get all the "plugins" 
		$scriptSet = array();
		$cssSet = array();
		// TODO check for all local paths and wrap with script loader url
		$playerConfig = $this->getResultObject()->getPlayerConfig();
		
		foreach( $playerConfig['plugins'] as $pluginName => $plugin){
			foreach( $plugin as $pluginAttr => $pluginAttrValue ){
				if( strpos( $pluginAttr, 'onPageJs' ) === 0 ){
					$scriptSet[] = $pluginAttrValue;
				}
				if( strpos( $pluginAttr, 'onPageCss' ) === 0 ){
					$cssSet[] = $pluginAttrValue;
				}
				if( $pluginAttr == 'requiresJQuery' ){
					$requiresJQuery = true;
				}
			}
		}
		
		foreach( $playerConfig['vars'] as $varName => $varValue){
			// check for vars based plugin config: 
			if( strpos( $varName, 'onPageJs' ) === 0 ){
				$scriptSet[] = $varValue;
			}
			if( strpos( $varName, 'onPageCss' ) === 0 ){
				$cssSet[] = $varValue;
			}
		}
		
		// css does not need any special handling either way: 
		// TODO package in css resources
		foreach( $cssSet as $cssFile ){
			$o.='kWidget.appendCssUrl(\'' . $this->utility->getExternalResourceUrl( $cssFile ) . "');\n";
		}
		
		// Always Output the mwEmbedLoader javascript inline ( if possible ) to be minified and gziped above )
		foreach( $scriptSet as $inx => $filePath ){
			$fullPath = $this->resolvePath( $filePath );
			// don't allow directory traversing: 
			if( 
				// Should be a file inside the mwEmbed repo:
				strpos( realpath( $fullPath ), realpath( $wgBaseMwEmbedPath ) ) !== 0 
				&&
				// Or should be a file in the kwidget-ps repo:
				strpos( $filePath, '{html5ps}' ) !== 0
			){
				// error attempted directory traversal:
				continue;
			}
			if( substr( $filePath, -2 ) !== 'js' ){
				// error attempting to load a non-js file
				continue;
			}
			// Check that the file exists:
			if( is_file( $fullPath ) ){
				$o.= file_get_contents( $fullPath  ) . "\n\n";
				if( filemtime( $fullPath ) > $this->lastFileModTime ){
					$this->lastFileModTime = filemtime( $fullPath );
				}
				unset( $scriptSet[ $inx] );
			}
		}
		// output the remaining assets via appendScriptUrls
		$o.= "\n" . 'kWidget.appendScriptUrls( [';
		$coma = '';
		foreach( $scriptSet as $script ){
			$o.= $coma . '"' . $this->utility->getExternalResourceUrl( $script ) . "\"\n";
			$coma =',';
		}
		// setup the callback js if need be
		$cbjs = '';
		if( $callbackJsName != null || isset( $_REQUEST['callback'] ) ){
			$callback = ( $callbackJsName != null )? $callbackJsName : htmlspecialchars( $_REQUEST['callback'] );
			$cbjs = 'window.' . $callback .'();';
		}
		$o.='], function(){' . "\n" . $cbjs . "\n". '})';
		
		// check if we need jQuery wrap all the output in a conditional include ( if its not already on the page ) 
		if( $requiresJQuery ){
			$o = "kWidget.jQueryLoadCheck( function( $, jQuery ){ \n" . $o . "\n});";
		}
		return $o;
	}
	/**
	 * Outputs the user agent playing rules if present in uiConf
	 */
	function getUserAgentPlayerRules(){
		$o = '';
		// Do an xml query for the plugin
		$userAgentPlayerRules = $this->getResultObject()->getPlayerConfig( 'userAgentPlayerRules' );
		if( count( $userAgentPlayerRules ) ) {
			$rulesObject = array(
				'rules' => array(),
				'actions' => array()
			);
			foreach( $userAgentPlayerRules as $key => $val ){
				// Check for special keys: 
				if( $key == 'disableForceMobileHTML5' && $val =='true' ){
					$o .= $this->getJsConfigLine( 'disableForceMobileHTML5', 'true');
					continue;	
				}
				// Check for blanket "leadWithHTML5" attribute
				if( $key == 'leadWithHTML5' && $val == 'true' ){
					// TODO we don't exactly want "forceMobileHTML5" we want "leadWithHTML5", 
					// use flash if no native html5 support
					$o .= $this->getJsConfigLine( 'forceMobileHTML5', 'true' );
					continue;
				}
				// Parse the rule index and type: 
				preg_match( '/r([0-9]+)(.*)/', $key, $matches );
				if( count( $matches ) ){
					if( $matches[2] == 'Match' || $matches[2] == 'RegMatch' ){
						$rule = array();
						$rule[  lcfirst( $matches[2] ) ] = (string)$val;
						$rulesObject[ 'rules' ][ $matches[1] ] = $rule;
					} else if( $matches[2] == 'LeadWithHTML5' || $matches[2] == 'ForceFlash'
						|| $matches[2] == 'ForceMsg' 
					){
						// true 
						$rulesObject[ 'actions' ] [ $matches[1] ] = array(
							'mode' =>  lcfirst( $matches[2] ),
							'val' => (string)$val
						);
					}
				}
			}
			$o.= 'kWidget.userAgentPlayerRules[\'' . $this->getResultObject()->request->getUiConfId() . '\'] = ' . json_encode( $rulesObject );
		}
		return $o;
	}
	// allows for the script to support being called directly or via pre-loader that includes uiConf info
	function getJsConfigLine( $configName, $value ){
		if( $this->preLoaderMode ){
			if( ! $this->jsConfigCheckDone){
				$o='if( ! window[\'preMwEmbedConfig\'] ) { window.preMwEmbedConfig = {}; };';
				$this->jsConfigCheckDone = true;
			}
			return $o . 'window.preMwEmbedConfig[\'' . htmlspecialchars( $configName ) . '\'] = ' . $value . ';' . "\n";
		} else {
			return 'mw.setConfig(\'' . htmlspecialchars( $configName ) . '\', ' . $value . ');' . "\n";
		}
		
	}
	/**
	 * The result object grabber, caches a local result object for easy access
	 * to result object properties. 
	 */
	function getResultObject(){
		global $container;
		if( ! $this->resultObject ){
			try{
				// Init a new result object with the client tag: 
				$this->resultObject = $container['uiconf_result'];
			} catch ( Exception $e ){
				$this->fatalError( $e->getMessage() );
			}
		}
		return $this->resultObject;
	}
	// report nothing on failure
	function fatalError( $error ){
		die( '/* Error: ' . $error . ' */' );
	}
	function sendHeaders(){
		global $wgKalturaUiConfCacheTime, $wgEnableScriptDebug, $wgKalturaForceResultCache;

		// Set content type to javascript:
		header("Content-type: text/javascript");
		
		// UiConf js should always send expire headers:
		$useCacheHeaders = !$wgEnableScriptDebug;
		if( $wgKalturaForceResultCache === true){
			$useCacheHeaders = true;
		}
		
		// Set relevent expire headers:
		if( $useCacheHeaders ){
			$time = time();
			header( 'Pragma: public' );
			// Cache for $wgKalturaUiConfCacheTime
			header( "Cache-Control: public, max-age=$wgKalturaUiConfCacheTime, max-stale=0");
			header( "Last-Modified: " . gmdate( "D, d M Y H:i:s", $time) . "GMT");
			header( "Expires: " . gmdate( "D, d M Y H:i:s", $time + $wgKalturaUiConfCacheTime ) . " GM" );
		} else {
			header("Cache-Control: no-cache, must-revalidate"); // HTTP/1.1
			header("Pragma: no-cache");
			header("Expires: Sat, 26 Jul 1997 05:00:00 GMT"); // Date in the past
		}
	}
}

// lcfirst does not exist in old php
if ( false === function_exists('lcfirst') ):
    function lcfirst( $str )
    { return (string)(strtolower(substr($str,0,1)).substr($str,1));}
endif;