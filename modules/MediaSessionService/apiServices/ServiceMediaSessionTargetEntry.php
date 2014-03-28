<?php 
require_once( dirname( __FILE__ ) . '/../../KalturaSupport/KalturaCommon.php' );

class ServiceMediaSessionTargetEntry {
	// stores the socket connection for real-time events
	var $clientSocket = null;
	
	function __construct(){
		global $container;
		// TODO support standard config cache handler
		// or don't use standard "cache" for m3u8 handling ( i.e memcache would be better )
		$this->cache = new KalturaCache( $container['file_cache_adapter_seralized'] );
		$this->request = $container['request_helper'];
		$this->error = null;
	}
	function run(){
		$this->cache->set( $this->getTargetKey(), $_REQUEST['targetEntry'] );
		header( "Content-type: application/json" );
		print json_encode( array( "status" => "ok" ) );
	}
	
	function getTargetKey(){
		$key = 'target_' . md5( $this->getGuid() );
		return $key;
	}
	function getGuid(){
		if( $this->request->get( 'guid' ) && trim( $this->request->get( 'guid' ) )  != '' ){
			return $this->request->get( 'guid' );
		}
		// TODO error handling
		$this->error = "could not get guid";
	}
}