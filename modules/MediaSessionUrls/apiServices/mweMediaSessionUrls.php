<?php
/**
* This service supports sending parsing player config for the purpuse of ad stiching delivery
*/
require_once( dirname( __FILE__ ) . '/../../KalturaSupport/KalturaCommon.php' );

$wgMwEmbedApiServices['mediaSession'] = 'mweMediaSessionUrls';

class mweMediaSessionUrls{
	var $resultObject = null;

	function __construct() {
		global $container;
		$this->request = $container['request_helper'];
		$this->utility = $container['utility_helper'];
		$this->entryResult = $container['entry_result'];
	}
	
	function run(){
		global $wgEnableScriptDebug;
		// load all the sources for the entry: 
		$this->entryResult->getSourceUrls();
		// detect url session type ( only support HLS for now )
		
		// switch session type run ( only support HLS for now )
		$protocolHandler = $this->getProtocolHandler();
		$protocolHandler->startSession();
		
		// download and parse m3u8 
	}
	function serveSessionUrl(){
	
	}
	function sessionUrl(){
		
	}

	// Allows for the script to support being called directly or via pre-loader that includes uiConf info
	function getJsConfigLine( $configName, $value ){

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
	
	}
}