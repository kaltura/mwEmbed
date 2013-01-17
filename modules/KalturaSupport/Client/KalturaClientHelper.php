<?php

// Include the kaltura client
require_once(  dirname( __FILE__ ) . '/kaltura_client_v3/KalturaClient.php' );
// Include the kaltura named multi request helper class: 
require_once(  dirname( __FILE__ ) . '/KalturaNamedMultiRequest.php');

class KalturaClientHelper extends KalturaClient {

	private $cacheString = 'cached-dispatcher';

	// Check if the server cached the result by search for "cached-dispatcher" in the request headers
	public function isCacheable() 
	{
		foreach( $this->getResponseHeaders() as $value ) {
			if( strpos($value, $this->cacheString) !== false ) {
				return true;
			}
		}
		$this->log('Cache key: ' . $this->cacheString . ' was not found in request headers: ' . print_r($this->getResponseHeaders(), true));
		return false;
	}
}