<?php 

class KalturaUtils {

	public function formatString( $str ) {
		// decode the value: 
		if( is_string($str) ) {
			$str = html_entity_decode( $str );
		}
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
		} else if( is_array( $str ) ){
			return $str;
		} else if( @json_decode( $str ) !== null && $str[0] == '{' ){
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

	public function getExternalResourceUrl( $url ){
		global $wgEnableScriptDebug, $wgBaseMwEmbedPath, $wgResourceLoaderUrl, $wgHTML5PsWebPath;
		// Check for local path flag:
		if( strpos( $url, '{onPagePluginPath}' ) === 0 ){
			$url = str_replace( '{onPagePluginPath}', '', $url);
			// Check that the file exists: 
			if( is_file( $wgBaseMwEmbedPath . '/kWidget/onPagePlugins' . $url ) ){
				$url = str_replace('load.php', 'kWidget/onPagePlugins', $wgResourceLoaderUrl) . $url;
			}
		}
		// check for {html5ps} local path flag:
		if( strpos( $url, '{html5ps}' ) === 0 ){
			$url = str_replace( '{html5ps}', $wgHTML5PsWebPath, $url);
		}
		
		// Append time if in debug mode 
		if( $wgEnableScriptDebug ){
			$url.= ( strpos( $url, '?' ) === false )? '?':'&';
			$url.= time();
		}
		return $url;
	}

	public function getUserLanguage(){
		$langs = array();

		if (isset($_SERVER['HTTP_ACCEPT_LANGUAGE'])) {
			// break up string into pieces (languages and q factors)
			preg_match_all('/([a-z]{1,8}(-[a-z]{1,8})?)\s*(;\s*q\s*=\s*(1|0\.[0-9]+))?/i', $_SERVER['HTTP_ACCEPT_LANGUAGE'], $lang_parse);

			if (count($lang_parse[1])) {
				// create a list like "en" => 0.8
				$langs = array_combine($lang_parse[1], $lang_parse[4]);
				
				// set default to 1 for any without q factor
				foreach ($langs as $lang => $val) {
					if ($val === '') $langs[$lang] = 1;
				}

				// sort list based on value	
				arsort($langs, SORT_NUMERIC);
			}
		}
		return $langs;
	}
}