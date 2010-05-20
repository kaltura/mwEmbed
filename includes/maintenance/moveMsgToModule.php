<?php
if ( isset( $_SERVER ) && array_key_exists( 'REQUEST_METHOD', $_SERVER ) ) {
	print "This script must be run from the command line\n";
	exit();
}
exit( 'This script has been depreciated' );
// Merge all the modules msgs into

// First get the big list of translations
require_once ( '../../languages/mwEmbed.i18n.php' ) ;

$path = realpath( '../../modules' );
$moduleBuckets = array();
// For each module folder
$objects = new RecursiveIteratorIterator( new RecursiveDirectoryIterator( $path ), RecursiveIteratorIterator::SELF_FIRST );
foreach ( $objects as $fname => $object ) {
	if ( substr( $fname, - 3 ) == '.js'
		&& strpos( $fname, '/cache/' ) === false
		&& strpos( $fname, '/tests/' ) === false )
	{

		$jsFileText = file_get_contents( $fname );
		preg_match( '/modules\/([^\/]*)\//siU', $fname, $fmatches );

		if( !$fmatches[1] )
			die("error could not get module name");

		$moduleName = $fmatches[1];
		if( strpos( $jsFileText, 'mw.addMessages')  !== false ){
			preg_match( '/mw\.addMessages\s*\(\s*{(.*)}\s*\)\s*/siU',
				$jsFileText,
				$matches );

			if( $matches[1] && $jmsg = json_decode( '{' . $matches[1] . '}', true ) ) {
				if( ! isset( $moduleBuckets[ $moduleName ] )) {
					//Output standard header:
					$moduleBuckets[ $moduleName ] = array();
				}
				foreach( $jmsg as $mk=>$mt ){
					$moduleBuckets[ $moduleName ][$mk] = $mt;
				}
			} else {
				print "COULD NOT PARSE: $fname\n";
			}
		}
	}
}

// Output to an i18n.php file for each module
foreach( $moduleBuckets as $moduleName => $msgAry ){
	$s ='<?php
/*
 * Internationalisation for ' . $moduleName . '
 *
 * @file
 * @ingroup Extensions
 */

$messages = array();
';

	// Output English msgs on top::
	$s.= '$messages[\'en\'] = array(' . "\n";
	foreach( $msgAry as $mk => $mv ) {
		$s.="\t'{$mk}' => '" . str_replace( '\'', '\\\'', $mv ) . "',\n";
	}
	$s.= ");\n";
	//Find the msgs in other languages
	foreach( $messages as $langKey => $msgSet ){
		$startLangFlag = false;

		// Check every msg for language keys:
		foreach( $msgAry as $mk => $mv ) {
			if( $langKey != 'en' && isset( $messages[ $langKey ][ $mk ] ) ){
				if( !$startLangFlag ){
					$s.= '$messages[\''.$langKey.'\'] = array(' . "\n";
					$startLangFlag = true;
				}
				$s.="\t'{$mk}' => '" . str_replace( '\'', '\\\'', $messages[ $langKey ][$mk] ) . "',\n";
			}
		}
		if( $startLangFlag ){
			$s.= ");\n";
		}
	}

	// Output the module localization file:
	$outTarget = dirname( __FILE__ ) . '/../../modules/' . $moduleName . '/' .$moduleName . '.i18n.php';
	file_put_contents( $outTarget, $s  );
	print "wrote: $outTarget\n";
}


