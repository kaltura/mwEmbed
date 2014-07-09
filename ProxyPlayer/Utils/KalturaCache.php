<?php

class KalturaCache {

	var $adapter = null;
	var $defaultExpiry = null;
	
	function __construct( $cacheAdapter, $defaultExpiry = null ) {
		$this->adapter = $cacheAdapter;
		if( $defaultExpiry ) {
			$this->defaultExpiry = $defaultExpiry;
		}
	}

	public function get($key) {
		return $this->adapter->get($key);
	}
	
	public function set($key, $var, $expiry = null) {
		// Set default expiry
		if( $expiry === null && $this->defaultExpiry !== null ) {
			$expiry = $this->defaultExpiry;
		}
		return $this->adapter->set($key, $var, $expiry);
	}

	public function delete($key) {
		return $this->adapter->delete($key);
	}

}