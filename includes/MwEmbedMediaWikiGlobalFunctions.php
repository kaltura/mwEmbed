<?php 
/**
 * Includes a subset of functions used for mwEmbed found in mediaWiki GlobalFunctions.php
 * and some mwEmbed specific global functions 
 */

# Autodetect, convert and provide timestamps of various types

/**
 * Unix time - the number of seconds since 1970-01-01 00:00:00 UTC
 */
define( 'TS_UNIX', 0 );

/**
 * MediaWiki concatenated string timestamp (YYYYMMDDHHMMSS)
 */
define( 'TS_MW', 1 );

/**
 * MySQL DATETIME (YYYY-MM-DD HH:MM:SS)
 */
define( 'TS_DB', 2 );

/**
 * RFC 2822 format, for E-mail and HTTP headers
 */
define( 'TS_RFC2822', 3 );

/**
 * ISO 8601 format with no timezone: 1986-02-09T20:00:00Z
 *
 * This is used by Special:Export
 */
define( 'TS_ISO_8601', 4 );

/**
 * An Exif timestamp (YYYY:MM:DD HH:MM:SS)
 *
 * @see http://exif.org/Exif2-2.PDF The Exif 2.2 spec, see page 28 for the
 *       DateTime tag and page 36 for the DateTimeOriginal and
 *       DateTimeDigitized tags.
 */
define( 'TS_EXIF', 5 );

/**
 * Oracle format time.
 */
define( 'TS_ORACLE', 6 );

/**
 * Postgres format time.
 */
define( 'TS_POSTGRES', 7 );

/**
 * DB2 format time
 */
define( 'TS_DB2', 8 );

/**
 * ISO 8601 basic format with no timezone: 19860209T200000Z
 *
 * This is used by ResourceLoader
 */
define( 'TS_ISO_8601_BASIC', 9 );


/**@{
 * Cache type
 */
define( 'CACHE_ANYTHING', -1 );  // Use anything, as long as it works

/**
 * @param $outputtype Mixed: A timestamp in one of the supported formats, the
 *                    function will autodetect which format is supplied and act
 *                    accordingly.
 * @param $ts Mixed: the timestamp to convert or 0 for the current timestamp
 * @return Mixed: String / false The same date in the format specified in $outputtype or false
 */
function wfTimestamp( $outputtype = TS_UNIX, $ts = 0 ) {
	$uts = 0;
	$da = array();
	$strtime = '';

	if ( !$ts ) { // We want to catch 0, '', null... but not date strings starting with a letter.
		$uts = time();
		$strtime = "@$uts";
	} elseif ( preg_match( '/^(\d{4})\-(\d\d)\-(\d\d) (\d\d):(\d\d):(\d\d)$/D', $ts, $da ) ) {
		# TS_DB
	} elseif ( preg_match( '/^(\d{4}):(\d\d):(\d\d) (\d\d):(\d\d):(\d\d)$/D', $ts, $da ) ) {
		# TS_EXIF
	} elseif ( preg_match( '/^(\d{4})(\d\d)(\d\d)(\d\d)(\d\d)(\d\d)$/D', $ts, $da ) ) {
		# TS_MW
	} elseif ( preg_match( '/^-?\d{1,13}$/D', $ts ) ) {
		# TS_UNIX
		$uts = $ts;
		$strtime = "@$ts"; // Undocumented?
	} elseif ( preg_match( '/^\d{2}-\d{2}-\d{4} \d{2}:\d{2}:\d{2}.\d{6}$/', $ts ) ) {
		# TS_ORACLE // session altered to DD-MM-YYYY HH24:MI:SS.FF6
		$strtime = preg_replace( '/(\d\d)\.(\d\d)\.(\d\d)(\.(\d+))?/', "$1:$2:$3",
				str_replace( '+00:00', 'UTC', $ts ) );
	} elseif ( preg_match( '/^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2})(?:\.*\d*)?Z$/', $ts, $da ) ) {
		# TS_ISO_8601
	} elseif ( preg_match( '/^(\d{4})(\d{2})(\d{2})T(\d{2})(\d{2})(\d{2})(?:\.*\d*)?Z$/', $ts, $da ) ) {
		#TS_ISO_8601_BASIC
	} elseif ( preg_match( '/^(\d{4})\-(\d\d)\-(\d\d) (\d\d):(\d\d):(\d\d)\.*\d*[\+\- ](\d\d)$/', $ts, $da ) ) {
		# TS_POSTGRES
	} elseif ( preg_match( '/^(\d{4})\-(\d\d)\-(\d\d) (\d\d):(\d\d):(\d\d)\.*\d* GMT$/', $ts, $da ) ) {
		# TS_POSTGRES
	} elseif (preg_match('/^(\d{4})\-(\d\d)\-(\d\d) (\d\d):(\d\d):(\d\d)\.\d\d\d$/',$ts,$da)) {
		# TS_DB2
	} elseif ( preg_match( '/^[ \t\r\n]*([A-Z][a-z]{2},[ \t\r\n]*)?' . # Day of week
							'\d\d?[ \t\r\n]*[A-Z][a-z]{2}[ \t\r\n]*\d{2}(?:\d{2})?' .  # dd Mon yyyy
							'[ \t\r\n]*\d\d[ \t\r\n]*:[ \t\r\n]*\d\d[ \t\r\n]*:[ \t\r\n]*\d\d/S', $ts ) ) { # hh:mm:ss
		# TS_RFC2822, accepting a trailing comment. See http://www.squid-cache.org/mail-archive/squid-users/200307/0122.html / r77171
		# The regex is a superset of rfc2822 for readability
		$strtime = strtok( $ts, ';' );
	} elseif ( preg_match( '/^[A-Z][a-z]{5,8}, \d\d-[A-Z][a-z]{2}-\d{2} \d\d:\d\d:\d\d/', $ts ) ) {
		# TS_RFC850
		$strtime = $ts;
	} elseif ( preg_match( '/^[A-Z][a-z]{2} [A-Z][a-z]{2} +\d{1,2} \d\d:\d\d:\d\d \d{4}/', $ts ) ) {
		# asctime
		$strtime = $ts;
	} else {
		# Bogus value...
		wfDebug("wfTimestamp() fed bogus time value: TYPE=$outputtype; VALUE=$ts\n");

		return false;
	}



	static $formats = array(
		TS_UNIX => 'U',
		TS_MW => 'YmdHis',
		TS_DB => 'Y-m-d H:i:s',
		TS_ISO_8601 => 'Y-m-d\TH:i:s\Z',
		TS_ISO_8601_BASIC => 'Ymd\THis\Z',
		TS_EXIF => 'Y:m:d H:i:s', // This shouldn't ever be used, but is included for completeness
		TS_RFC2822 => 'D, d M Y H:i:s',
		TS_ORACLE => 'd-m-Y H:i:s.000000', // Was 'd-M-y h.i.s A' . ' +00:00' before r51500
		TS_POSTGRES => 'Y-m-d H:i:s',
		TS_DB2 => 'Y-m-d H:i:s',
	);

	if ( !isset( $formats[$outputtype] ) ) {
		throw new MWException( 'wfTimestamp() called with illegal output type.' );
	}

	if ( function_exists( "date_create" ) ) {
		if ( count( $da ) ) {
			$ds = sprintf("%04d-%02d-%02dT%02d:%02d:%02d.00+00:00",
				(int)$da[1], (int)$da[2], (int)$da[3],
				(int)$da[4], (int)$da[5], (int)$da[6]);

			$d = date_create( $ds, new DateTimeZone( 'GMT' ) );
		} elseif ( $strtime ) {
			$d = date_create( $strtime, new DateTimeZone( 'GMT' ) );
		} else {
			return false;
		}

		if ( !$d ) {
			wfDebug("wfTimestamp() fed bogus time value: $outputtype; $ts\n");
			return false;
		}

		$output = $d->format( $formats[$outputtype] );
	} else {
		if ( count( $da ) ) {
			// Warning! gmmktime() acts oddly if the month or day is set to 0
			// We may want to handle that explicitly at some point
			$uts = gmmktime( (int)$da[4], (int)$da[5], (int)$da[6],
				(int)$da[2], (int)$da[3], (int)$da[1] );
		} elseif ( $strtime ) {
			$uts = strtotime( $strtime );
		}

		if ( $uts === false ) {
			wfDebug("wfTimestamp() can't parse the timestamp (non 32-bit time? Update php): $outputtype; $ts\n");
			return false;
		}

		if ( TS_UNIX == $outputtype ) {
			return $uts;
		}
		$output = gmdate( $formats[$outputtype], $uts );
	}

	if ( ( $outputtype == TS_RFC2822 ) || ( $outputtype == TS_POSTGRES ) ) {
		$output .= ' GMT';
	}

	return $output;
}
// simple mediaWiki msg retrival: 
$wgMessageCache = array();
function wfMsgExt( $key, $options = array() ){
	global $wgLoadedMsgKeysFlag, $wgMessageCache, $mwLanguageCode;

	$langKey = ( $options['language'] )? $options['language'] : 'en';
	
	// Check if $wgMessageCache is empty, if so poulate will all its messages:
	if( count( $wgMessageCache) === 0){
		mwEmbedLoadMsgKeys( $langKey );
	}	
	if ( isset( $wgMessageCache[ $key ] ) ) {
		return $wgMessageCache[ $key ];
	} else {
		return '[' . $key . ']';
	}	
}

/**
 * Load all the msg keys into $wgMessageCache
 * @param $langKey String Language key to be used
 */
function mwEmbedLoadMsgKeys( $langKey ){
	global $wgExtensionMessagesFiles, $wgMessageCache;

	foreach( $wgExtensionMessagesFiles as $msgFile ){
		if( !is_file( $msgFile ) ) {
			throw new MWException( "Missing msgFile: " . htmlspecialchars( $msgFile ) . "\n" );
		}
		require( $msgFile );
		// First include the English fallback:
		$wgMessageCache = array_merge( $wgMessageCache, $messages[ 'en' ] );
		
		// Then override with the current language:
		if( isset( $messages[ $langKey ] ) ) {
			$wgMessageCache = array_merge( $wgMessageCache, $messages[ $langKey ] );
		}
	}
	$wgLoadedMsgKeysFlag = true;
}

// Memcached stubs:
/**
 * Get a cache key
 */
function wfMemcKey( /*... */ ) {
	$args = func_get_args();
	$key = implode( ':', $args );
	$key = str_replace( ' ', '_', $key );
	return $key;
}
function wfGetCache( ){
	return new mwEmbedSimpleFileCache();
}
class mwEmbedSimpleFileCache{
	public static function get( $key ){
		return mweGetFromFileCache( $key );
	}
	public static function set( $key, $data){
		return mweSaveFileToCache( $key, $data);
	}
}

# MwEmbed specific functions 
/* 
 * Retrive a file from cache key
 * 
 */
function mweGetFromFileCache( $key ){
	global $IP;
	$filePath = mweGetFilePathFromKey( $key );
	$rawResult = @file_get_contents( $filePath );
	if( $rawResult === false ){
		return null;
	}
	return unserialize( $rawResult );
};
/**
 *  Save a file to cache key
 *  @param $key String
 *  @param $data {Object|String}
 */
function mweSaveFileToCache ( $key, $data){
	global $IP;
	$filePath = mweGetFilePathFromKey( $key );
	$path = dirname( $filePath );
	if( !is_dir($path ) ){
		$ok = @mkdir( $path, 0777, true ); // PHP5 <3	
		if( !$ok ){
			return false;
		}
	}
	file_put_contents( $filePath, serialize( $data ) );
	return true;
}
function mweGetFilePathFromKey( $key ){
	global $IP;
	$hash = sha1( $key );
	// Pretty darn unlikely cache missmatch:
	return "$IP/cache/". substr( $hash, 0, 1) . '/' . substr( $hash, 1, 1) .
			 '/' . substr( $hash, 0, 48 );
}


/**
 * Expand a potentially local URL to a fully-qualified URL.  Assumes $wgServer
 * and $wgProto are correct.
 *
 * @todo this won't work with current-path-relative URLs
 * like "subdir/foo.html", etc.
 *
 * @param $url String: either fully-qualified or a local path + query
 * @return string Fully-qualified URL
 */
function wfExpandUrl( $url ) {
	if( substr( $url, 0, 2 ) == '//' ) {
		global $wgProto;
		return $wgProto . ':' . $url;
	} elseif( substr( $url, 0, 1 ) == '/' ) {
		global $wgServer;
		return $wgServer . $url;
	} else {
		return $url;
	}
}
?>