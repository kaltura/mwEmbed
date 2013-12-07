<?php 
require_once( dirname( __FILE__ ) . '/../../KalturaSupport/KalturaCommon.php' );

class BaseStreamHandler {
	
	function __construct(){
		global $container;
		$this->cache = $container['cache_helper'];
		$this->request = $container['request_helper'];
		$this->entryResult = $container['entry_result'];
	}
	function setStreamUrl( $url ){
		$this->streamUrl = $url;
	}
	function getParsedStream(){
		// Grab and parse the base content m3u8
		$streamContent = $this->getStreamContent();
		// Replace all the urls with kaltura service urls ( only M3u8Parser supported right now )
		$parsedStream = new M3u8Parser( $streamContent );
		return $parsedStream;
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
	function getCacheKey(){
		return md5( $this->streamUrl );
	}
}