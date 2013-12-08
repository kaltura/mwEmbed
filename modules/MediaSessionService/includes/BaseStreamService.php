<?php 
require_once( dirname( __FILE__ ) . '/../../KalturaSupport/KalturaCommon.php' );

class BaseStreamService {
	
	function __construct(){
		global $container;
		$this->cache = $container['cache_helper'];
		$this->request = $container['request_helper'];
		$this->entryResult = $container['entry_result'];
		$this->uiConfResult = $container['uiconf_result'];
	}
	function setStreamUrl( $url ){
		$this->streamUrl = $url;
	}
	function getStreamHandler(){
		// Grab and parse the base content m3u8
		$streamContent = $this->getStreamContent();
		// Replace all the urls with kaltura service urls ( only M3u8Handler supported right now )
		$streamHandler = new M3u8Handler( $streamContent );
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
		// gets the guid from the request, if not set in the requets generates a guid to pass on to subquent requests
		if( $this->request->get( 'guid' ) ){
			return  $this->request->get( 'guid' ) ;
		}
		// TODO: check for cookie or session based uuid
		// gennerate with php: 
		return uniqid();
	}
	function getCacheKey(){
		return md5( $this->streamUrl );
	}
}