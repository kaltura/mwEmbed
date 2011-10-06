<?php 
/**
* This file injects all on Page uiConf based javascript and configuration and loader. 
*
* it requires a partner_id and a uiconf_id 
*/

// Include configuration: ( will include LocalSettings.php ) 
require(  dirname( __FILE__ ) . '../../../includes/DefaultSettings.php' );

// Setup the kalturaIframe
global $wgKalturaUiConfJs;
$wgKalturaUiConfJs = new KalturaUiConfJs();

if( ! ob_start("ob_gzhandler") ) ob_start();
// Output the uiConf js
echo $wgKalturaUiConfJs->outputUiConfJs();
// flush the buffer.
ob_end_flush();


class KalturaUiConfJs{
	var $resultObject = null;
	var $preLoaderMode = false;
	
	function outputUiConfJs(){
		$o = '';
		$o.= $this->getUserAgentPlayerRules();
		// get the checkUserAgentPlayerRules call if present in plugins
		
		$this->sendHeaders();
		echo $o;
	}
	/**
	 * Outputs the user agent playing rules if present in uiConf
	 */
	function getUserAgentPlayerRules(){
		// Do an xml query for the plugin
		$userAgentPlayerRules = $this->getResultObject()->getUiConfXML()->xpath("*//Plugin[@id='userAgentPlayerRules']");
		if( $userAgentPlayerRules ) {
			$attr = $userAgentPlayerRules[0]->attributes();
			$rulesObject = array(
				'rules' => array(),
				'Action' => array()
			);
			$o='';
			foreach( $userAgentPlayerRules[0]->attributes() as $key => $val ){
				// Check for special keys: 
				if( $key == 'disableForceMobileHTML5' ){
					$o.=$this->getJsConfigLine( 'disableForceMobileHTML5', 'true');
					continue;	
				}
				// parse the rule index and type: 
				preg_match('/r([0-9]+)(.*)/', $key, $matches);
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
			$o='if( !window[\'kUserAgentPlayerRules\'] ){ kUserAgentPlayerRules = {}; }; '. "\n";
			$o.= 'kUserAgentPlayerRules=' . json_encode( $rulesObject );
		}
		return $o;
	}
	// allows for the script to support being called directly or via pre-loader that includes uiConf info
	function getJsConfigLine( $configName, $value ){
		if( $this->preLoaderMode ){
			$o='if( ! window[\'preMwEmbedConfig\'] ) { preMwEmbedConfig = {}; };';
			return $o . 'preMwEmbedConfig[\'' . htmlspecialchars( $configName ) . '\'] = ' . $value . ';' . "\n";
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
			require_once( dirname( __FILE__ ) .  '/KalturaResultObject.php' );
			try{
				// Init a new result object with the client tag: 
				$this->resultObject = new KalturaResultObject( 'html5iframe:' . $wgMwEmbedVersion );;
			} catch ( Exception $e ){
				$this->fatalError( $e->getMessage() );
			}
		}
		return $this->resultObject;
	}
	
	function sendHeaders(){
		global $wgKalturaUiConfCacheTime;
		header('Content-type: text/javascript' );
		// always cached: 
		header( 'Pragma: public' );
		// Cache for $wgKalturaUiConfCacheTime
		$time = $this->getResultObject()->getFileCacheTime();
		header( "Cache-Control: public, max-age=$wgKalturaUiConfCacheTime, max-stale=0");
		header( "Last-Modified: " . gmdate( "D, d M Y H:i:s", $time) . "GMT");
		header( "Expires: " . gmdate( "D, d M Y H:i:s", $time + $wgKalturaUiConfCacheTime ) . " GM" );
	}
}