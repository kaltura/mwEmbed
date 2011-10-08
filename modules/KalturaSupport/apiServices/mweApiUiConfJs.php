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
		$o = '/* kaltura uiConfJS loader */';
		// get the checkUserAgentPlayerRules call if present in plugins
		$o.= $this->getUserAgentPlayerRules();
		// add any on-page javascript
		
		$this->sendHeaders();
		echo $o;
	}
	/**
	 * Outputs the user agent playing rules if present in uiConf
	 */
	function getUserAgentPlayerRules(){
		$o='';
		// Do an xml query for the plugin
		$userAgentPlayerRules = $this->getResultObject()->getUiConfXML()->xpath("*//Plugin[@id='userAgentPlayerRules']");
		if( $userAgentPlayerRules ) {
			$attr = $userAgentPlayerRules[0]->attributes();
			$rulesObject = array(
				'rules' => array(),
				'actions' => array()
			);
			foreach( $userAgentPlayerRules[0]->attributes() as $key => $val ){
				//print "key:$key val:$val\n";
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
				$o='if( ! window[\'preMwEmbedConfig\'] ) { preMwEmbedConfig = {}; };';
				$this->jsConfigCheckDone = true;
			}
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
			require_once( dirname( __FILE__ ) .  '/../KalturaResultObject.php' );
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
// lcfirst does not exist in old php
if ( false === function_exists('lcfirst') ):
    function lcfirst( $str )
    { return (string)(strtolower(substr($str,0,1)).substr($str,1));}
endif; 