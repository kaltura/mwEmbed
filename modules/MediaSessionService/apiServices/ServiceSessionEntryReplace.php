<?php 
require_once( dirname( __FILE__ ) . '/../../KalturaSupport/KalturaCommon.php' );
require_once( dirname( __FILE__ ) . '/WebsocketLogger.php' );

class ServiceSessionEntryReplace {
	// stores the socket connection for real-time events
	var $clientSocket = null;
	
	function __construct(){
		global $container;
		// TODO support standard config cache handler
		// or don't use standard "cache" for m3u8 handling ( i.e memcache would be better )
		$this->cache = new KalturaCache( $container['file_cache_adapter_seralized'] );
	}
}