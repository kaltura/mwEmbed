<?php 

class KalturaUtils {

	var $request = null;

	public function __construct( $request = null ) {
		if(!$request)
			throw new Exception("Error missing request object");

		$this->request = $request;
	}

	public function isCacheEnabled() {
		global $wgEnableScriptDebug, $wgKalturaForceResultCache;

		$useCache = !$wgEnableScriptDebug;
		// Force cache flag ( even in debug )
		if( $wgKalturaForceResultCache === true){
			$useCache = true;
		}

		// Check for Cache st
		if( intval($this->request->getCacheSt()) > time() ) {
			$useCache = false;
		}
		return $useCache;		
	}

	public function formatString( $str ) {
		// decode the value: 
		$str = html_entity_decode( $str );
		if( $str === "true" ) {
			return true;
		} else if( $str === "false" ) {
			return false;
		} else if( is_numeric( $str ) ){
			// check for zero prefixed values and return them as strings. 
			if( is_string( $str ) && $str[0] == '0' ){
				return $str;
			}
			return (float)$str;
		} else if( json_decode( $str ) !== null && $str[0] == '{' ){
			return json_decode( $str );
		} else {
			return $str;
		}
	}

	public function getCachingHeaders( $headers = array() ) {
		$result = array();
		foreach( $headers as $header ) {
			if( strpos($header, 'Expires:') !== false || strpos($header, 'Cache-Control:') !== false ) {
				$result[] = $header;
			}
		}
		return $result;
	}
}