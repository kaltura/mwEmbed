<?php 
/**
 * This file helps mwEmbed use mediaWiki resources without modification 
 * ( it stubs mediaWiki function and class calls where needed )
 */

/** 
 * Defines: 
 */
/**
 * Protocol constants for wfExpandUrl()
 */
define( 'PROTO_RELATIVE', '//' );

/**
 * global functions
 */
function wfDebug( $text, $logonly = false ) {
	return ;
}
/**
 * Get the path to a specified script file, respecting file
 * extensions; this is a wrapper around $wgScriptExtension etc.
 *
 * @param $script String: script filename, sans extension
 * @return String
 */
function wfScript( $script = 'index' ) {
	global $wgScriptPath, $wgScriptExtension;
	return "{$wgScriptPath}/{$script}{$wgScriptExtension}";
}


// Stub userLang ( if no language code provided 
class UserLang {
	// getCode (default english )
	public function getCode(){
		return 'en';
	}
}
// MWException stub:
class MWException extends Exception {
}

// Stub xml functions:
class Xml {
	/**
	 * Encode a variable of unknown type to JavaScript.
	 * Arrays are converted to JS arrays, objects are converted to JS associative
	 * arrays (objects). So cast your PHP associative arrays to objects before
	 * passing them to here.
	 */
	public static function encodeJsVar( $value ) {
		if ( is_bool( $value ) ) {
			$s = $value ? 'true' : 'false';
		} elseif ( is_null( $value ) ) {
			$s = 'null';
		} elseif ( is_int( $value ) ) {
			$s = $value;
		} elseif ( is_array( $value ) && // Make sure it's not associative.
			(array_keys($value) === range( 0, count($value) - 1 ) || count($value) == 0)
				) {
			$s = '[';
			foreach ( $value as $elt ) {
				if ( $s != '[' ) {
					$s .= ', ';
				}
				$s .= self::encodeJsVar( $elt );
			}
			$s .= ']';
		} elseif ( $value instanceof XmlJsCode ) {
			$s = $value->value;
		} elseif ( is_object( $value ) || is_array( $value ) ) {
			// Objects and associative arrays
			$s = '{';
			foreach ( (array)$value as $name => $elt ) {
				if ( $s != '{' ) {
					$s .= ', ';
				}
				$s .= '"' . self::escapeJsString( $name ) . '": ' .
					self::encodeJsVar( $elt );
			}
			$s .= '}';
		} else {
			$s = '"' . self::escapeJsString( $value ) . '"';
		}
		return $s;
	}
	/**
	 * Create a call to a JavaScript function. The supplied arguments will be 
	 * encoded using Xml::encodeJsVar(). 
	 *
	 * @param $name String The name of the function to call, or a JavaScript expression
	 *    which evaluates to a function object which is called.
	 * @param $args Array of arguments to pass to the function.
	 * @since 1.17
	 */
	public static function encodeJsCall( $name, $args ) {
		$s = "$name(";
		$first = true;
		foreach ( $args as $arg ) {
			if ( $first ) {
				$first = false;
			} else {
				$s .= ', ';
			}
			$s .= Xml::encodeJsVar( $arg );
		}
		$s .= ");\n";
		return $s;
	}
	/**
	 * Returns an escaped string suitable for inclusion in a string literal
	 * for JavaScript source code.
	 * Illegal control characters are assumed not to be present.
	 *
	 * @param $string String to escape
	 * @return String
	 */
	public static function escapeJsString( $string ) {
		// See ECMA 262 section 7.8.4 for string literal format
		$pairs = array(
			"\\" => "\\\\",
			"\"" => "\\\"",
			'\'' => '\\\'',
			"\n" => "\\n",
			"\r" => "\\r",

			# To avoid closing the element or CDATA section
			"<" => "\\x3c",
			">" => "\\x3e",

			# To avoid any complaints about bad entity refs
			"&" => "\\x26",

			# Work around https://bugzilla.mozilla.org/show_bug.cgi?id=274152
			# Encode certain Unicode formatting chars so affected
			# versions of Gecko don't misinterpret our strings;
			# this is a common problem with Farsi text.
			"\xe2\x80\x8c" => "\\u200c", // ZERO WIDTH NON-JOINER
			"\xe2\x80\x8d" => "\\u200d", // ZERO WIDTH JOINER
		);
		return strtr( $string, $pairs );
	}
}
/**
 * A wrapper class which causes Xml::encodeJsVar() and Xml::encodeJsCall() to 
 * interpret a given string as being a JavaScript expression, instead of string 
 * data.
 *
 * Example:
 *
 *    Xml::encodeJsVar( new XmlJsCode( 'a + b' ) );
 *
 * Returns "a + b".
 * @since 1.17
 */
class XmlJsCode {
	public $value;

	function __construct( $value ) {
		$this->value = $value;
	}
}

// stub html functions
class Html {
	/**
	 * Output a <script> tag linking to the given URL, e.g.,
	 * <script src=foo.js></script>.
	 *
	 * @param $url string
	 * @return string Raw HTML
	 */
	public static function linkedScript( $url ) {
		return '<script src="' . htmlspecialchars( $url) . '" type="text/javascript"></script>';
	}
	/**
	 * Output a <script> tag with the given contents.  TODO: do some useful
	 * escaping as well, like if $contents contains literal '</script>' or (for
	 * XML) literal "]]>".
	 *
	 * @param $contents string JavaScript
	 * @return string Raw HTML
	 */
	public static function inlineScript( $contents ) {
		if ( preg_match( '/[<&]/', $contents ) ) {
			$contents = "/*<![CDATA[*/$contents/*]]>*/";
		}
		return '<script type"text/javascript">'. $contents . '</script>';
	}
}


// Stub MessageBlobStore ( don't use db, just directly grab messages from php ) 
class MessageBlobStore { 
	/**
	 * Get the message blobs for a set of modules
	 *
	 * @param $resourceLoader ResourceLoader object
	 * @param $modules array Array of module objects keyed by module name
	 * @param $lang string Language code
	 * @return array An array mapping module names to message blobs
	 */
	public static function get( ResourceLoader $resourceLoader, $modules, $lang ) {
		$blobs = array();
		foreach( $modules as $name => $module ){
			$messages = array();
			foreach ( $module->getMessages() as $key ) {		
				$messages[$key] = wfMsgExt( $key, array( 'language' => $lang ) );
			}
			if( count( $messages ) ){
				$blobs[ $name ] = FormatJson::encode( (object)$messages );
			}
		}
		return $blobs;
	}
}

/**
 * MediaWiki abstracts the json functions with fallbacks
 * here we just map directly to the native php call: 
 */
class FormatJson{
	public static function encode($value, $isHtml=false){
		return json_encode($value);
	}
	public static function decode( $value, $assoc=false ){
		return json_decode( $value, $assoc );
	}
}

// Stub WebRequest
// Just serving static files, don't have a concept of wiki titles etc.)
class WebRequest {
	protected $data, $headers = array();
	public function __construct() {
		// POST overrides GET data
		// We don't use $_REQUEST here to avoid interference from cookies...
		$this->data = $_POST + $_GET;
	}
	/**
	 * Fetch a scalar from the input or return $default if it's not set.
	 * 
	 * @param $name String
	 * @param $default String: optional default (or NULL)
	 * @return String
	 */
	public function getVal( $name, $default = null ) {
		return ( isset( $this->data[ $name ] ) )? (string) $this->data[ $name ] : $default;
	}
	
	/**
	 * Fetch a boolean value from the input or return $default if not set.
	 * Unlike getBool, the string "false" will result in boolean false, which is
	 * useful when interpreting information sent from JavaScript.
	 *
	 * @param $name String
	 * @param $default Boolean
	 * @return Boolean
	 */
	public function getFuzzyBool( $name, $default = false ) {
		if( isset( $this->data[ $name ] ) ){
			if( $this->data[ $name ] === 'false' ){
				return false;
			}
			return true;
		} else {
			return $default;
		}
	}
	
	/**
	 * Get a request header, or false if it isn't set
	 * @param $name String: case-insensitive header name
	 */
	public function getHeader($name) {
		$name = strtoupper($name);
		if (!$this->headers && function_exists('apache_request_headers')) {
			foreach (apache_request_headers() as $tempName => $tempValue) {
				$this->headers[strtoupper( $tempName )] = $tempValue;
			}
		}
		if (isset($this->headers[$name])) {
			return $this->headers[$name];
		} else {
			return false;
		}
	}
}
/**
 * This function takes two arrays as input, and returns a CGI-style string, e.g.
 * "days=7&limit=100". Options in the first array override options in the second.
 * Options set to "" will not be output.
 */
function wfArrayToCGI( $array1, $array2 = null ) {
	if ( !is_null( $array2 ) ) {
		$array1 = $array1 + $array2;
	}

	$cgi = '';
	foreach ( $array1 as $key => $value ) {
		if ( $value !== '' ) {
			if ( $cgi != '' ) {
				$cgi .= '&';
			}
			if ( is_array( $value ) ) {
				$firstTime = true;
				foreach ( $value as $v ) {
					$cgi .= ( $firstTime ? '' : '&') .
						urlencode( $key . '[]' ) . '=' .
						urlencode( $v );
					$firstTime = false;
				}
			} else {
				if ( is_object( $value ) ) {
					$value = $value->__toString();
				}
				$cgi .= urlencode( $key ) . '=' .
					urlencode( $value );
			}
		}
	}
	return $cgi;
}

?>