<?php 
require_once( dirname( __FILE__ ) . '/../../KalturaSupport/KalturaCommon.php' );
require_once( dirname( __FILE__ ) . '/WebsocketLogger.php' );

class BaseStreamService {
	// stores the socket connection for real-time events
	var $clientSocket = null;
	
	function __construct(){
		global $container;
		// TODO support standard config cache handler
		// or don't use standard "cache" for m3u8 handling ( i.e memcache would be better )
		$this->cache = new KalturaCache( $container['file_cache_adapter_seralized'] );
		
		$this->request = $container['request_helper'];
		$this->entryResult = $container['entry_result'];
		$this->uiConfResult = $container['uiconf_result'];
		$this->websocketLogger = $container['websocket_logger'];
	}
	function setStreamUrl( $url ){
		$this->streamUrl = $url;
	}
	function getStreamHandler(){
		// Grab and parse the base content m3u8
		$streamContent = $this->getStreamContent();
		// Replace all the URLs with Kaltura service URLs ( only M3u8Handler supported right now )
		$streamHandler = new M3u8Handler( $streamContent );
		// add the standard set of service params:
		$streamHandler->setServiceParams (
			array(
				'uiconf_id' => $this->request->getUiConfId(),
				'wid' => $this->request->getWidgetId(),
				'entry_id' => $this->request->getEntryId(),
				'guid' => $this->getGuid()
			)
		);
		return $streamHandler;
	}
	function getStreamContent(){
		$content =  $this->cache->get( $this->getCacheKey() );
		if( $content ){
			return $content;
		} 
		$content = file_get_contents( $this->streamUrl );
		// TODO take into consideration headers or per stream cache metadata info. 
		$this->cache->set(  $this->getCacheKey(), $content );
		return $content;
	}
	function getGuid(){
		// gets the guid from the request, if not set in the request generates a guid to pass on to subsequent requests
		if( $this->request->get( 'guid' ) ){
			return $this->request->get( 'guid' ) ;
		}
		// TODO: check for cookie or session based guid
		// for now just, generate with php: 
		return uniqid();
	}
	function getCacheKey(){
		return md5( $this->streamUrl );
	}
}