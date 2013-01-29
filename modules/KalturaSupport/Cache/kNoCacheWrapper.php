<?php

class kNoCacheWrapper {

	public function get($key) {
		return false;
	}
	
	public function set($key, $var, $expiry = 0) {
		return false;
	}

	public function delete($key) {
		return false;
	}

}