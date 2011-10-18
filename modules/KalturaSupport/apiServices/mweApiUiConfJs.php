<?php
/**
* This file injects all on Page uiConf based javascript and configuration and loader. 
*
* it requires a partner_id and a uiconf_id 
*/
$wgMwEmbedApiServices['uiconfJs'] = 'mweApiUiConfJs';

// should extend a base mwApiService class
// TODO split into two services "pageResources" and "userAgentPlayerRules"
class mweApiUiConfJs {
	var $resultObject = null;
	var $preLoaderMode = false;
	var $jsConfigCheckDone = false;
	
	function run(){
		$o = "/* kaltura uiConfJS loader */\n";
		// get the checkUserAgentPlayerRules call if present in plugins
		$o.= $this->getUserAgentPlayerRules();
		// Get on page javascript: 
		$o.= $this->getPluginPageJs();
		// add any on-page javascript
		$this->sendHeaders();
		echo $o;
	}
	/**
	 * outputs 
	 */
	function getPluginPageJs(){
		// Get all the "plugins" 
		$o = "";
		// @@TODO clean this up with a real getPlayerConfig method
		$resultObject = $this->getResultObject();
		$playerConfig =  $resultObject->playerConfig;
		foreach( $playerConfig['plugins'] as $pluginName => $plugin){
			foreach( $plugin as $pluginAttr => $pluginAttrValue ){
				if( strpos( $pluginAttr, 'onPageJs' ) === 0 ){
					$o.= "kAppendScriptUrl( '". $this->getExternalResourceUrl( $pluginAttrValue) . "' );\n";
				}
				if( strpos( $pluginAttr, 'onPageCss' ) === 0 ){
					$o.= "kAppendCssUrl( '". $this->getExternalResourceUrl( $pluginAttrValue) . "' );\n";
				}
			}
		}
		foreach( $playerConfig['vars'] as $varName => $varValue){
			// check for vars based plugin config: 
			if( strpos( $pluginAttr, 'onPageJs' ) === 0 ){
				$o.= "kAppendScriptUrl( '". $this->getExternalResourceUrl( $pluginAttrValue) . "' );\n";
			}
			if( strpos( $pluginAttr, 'onPageCss' ) === 0 ){
				$o.= "kAppendCssUrl( '". $this->getExternalResourceUrl( $pluginAttrValue) . "' );\n";
			}
		}
		return $o;
	}
	function getExternalResourceUrl( $url ){
		global $wgEnableScriptDebug;
		// Append time if in debug mode 
		if( $wgEnableScriptDebug ){
			$url.= ( strpos( $url, '?' ) === false )? '?':'&';
			$url.= time();
		}
		return $url;
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
					$o.=$this->getJsConfigLine( 'disableForceMobileHTML5', 'true');
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
			$o.= 'if( !window[\'kUserAgentPlayerRules\'] ){ kUserAgentPlayerRules = {}; }; '. "\n";
			$o.= 'kUserAgentPlayerRules[\'' . $this->getResultObject()->getUiConfId() . '\'] = ' . json_encode( $rulesObject );
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
		global $wgMwEmbedVersion;
		if( ! $this->resultObject ){
			require_once( dirname( __FILE__ ) .  '/../KalturaResultObject.php' );
			try{
				// Init a new result object with the client tag: 
				$this->resultObject = new KalturaResultObject( 'html5iframe:' . $wgMwEmbedVersion );
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
		global $wgKalturaUiConfCacheTime;
		// set content type to javascript:
		header("Content-type: text/javascript");
		// Set relevent expire headers:
		if( $this->getResultObject()->isCachedUiConfFile() ){
			$time = $this->getResultObject()->getFileCacheTime();
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