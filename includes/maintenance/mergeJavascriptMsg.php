<?php
/**
* Merges in JavaScript with mwEmbed.i18n.php
*
* @file
* @ingroup Maintenance
*/

# Abort if called from a web server
if ( isset( $_SERVER ) && array_key_exists( 'REQUEST_METHOD', $_SERVER ) ) {
	print "This script must be run from the command line\n";
	exit();
}
exit( 'This script has been depreciated' );
define( 'MEDIAWIKI', true );
// Get the scriptLoader globals:
require_once( '../../jsScriptLoader.php' );

$mwSTART_MSG_KEY = '$messages[\'en\'] = array(';
$mwEND_MSG_KEY = ',
);';

function print_help(){
?>
This script helps merge msgs between javascript and php
Usage:
	-j merges javascript msgs into php
	-p merges php msgs back into javascript
	-q will disable screen output and wait time
	--modpath [/path/to/module/folder] path to a module folder to be updated
<?php
}

// Get options ( like override JS or override PHP )
if ( in_array($argv[1], array('--help', '-help', '-h', '-?')) ) {
	print_help();
}
$mergeToPhp = $mergeToJS = false;
$showInfo = true;
foreach($argv as $inx => $arg){
	if($inx == 0)
		continue;
	if( $arg == '-j' ){
		$mergeToPhp = true;
	}else if( $arg == '-p' ) {
		$mergeToJS = true;
	}else if( $arg == '-q'){
		$showInfo = false;
	}else if( $arg == '--modpath' ){
		print_help();
	}
}

die();

if($showInfo){
	if ( $mergeToPhp )
	print "Will merge *Javascript to PHP* in 3 seconds ";

	if ( $mergeToJS )
	print "Will merge *PHP to Javascript* in 3 seconds ";

	for ( $i = 0; $i < 3; $i++ ) {
		print '.';
		sleep( 1 );
	}
	print "\n";
}

// read in mwEmbed.i18n.php
$rawLangFile = file_get_contents( $mwLangFilePath );

$startInx = strpos( $rawLangFile, $mwSTART_MSG_KEY ) + strlen( $mwSTART_MSG_KEY );
$endInx = strpos( $rawLangFile, $mwEND_MSG_KEY ) + 1;
if ( $startInx === false || $endInx === false ) {
	if( $showInfo ) {
		print "Could not find $mwSTART_MSG_KEY or $mwEND_MSG_KEY in mwEmbed.i18n.php\n";
	}
	exit();
}

$preFile = substr( $rawLangFile, 0, $startInx );
$msgSet = substr( $rawLangFile, $startInx, $endInx - $startInx );
$postFile = substr( $rawLangFile, $endInx );

// build replacement from all javascript in mwEmbed
$path = realpath( '../../' );

$curFileName = '';
// @@todo existing msgSet should be parsed (or we just "include" the file first)
$msgSet = "";

$objects = new RecursiveIteratorIterator( new RecursiveDirectoryIterator( $path ), RecursiveIteratorIterator::SELF_FIRST );
foreach ( $objects as $fname => $object ) {
	if ( substr( $fname, - 3 ) == '.js'
		&& strpos( $fname, '/cache/' ) === false
		&& strpos( $fname, '/tests/' ) === false )
	{

		$jsFileText = file_get_contents( $fname );
		$mwPos = strpos( $fname, 'mwEmbed' ) + 7;
		$curFileName = substr( $fname, $mwPos );
		// @@todo fix: will break down if someone does }) in their msg text
		if ( preg_match( '/mw\.addMessages\s*\(\s*{(.*)}\s*\)\s*/siU',
			$jsFileText,
			$matches ) )
		{
			$msgSet .= doJsonMerge( $matches[1] );
		}
	}
}
// Rebuild and output to single php file if mergeToPHP is on
if ( $mergeToPhp ) {
	if ( file_put_contents( $mwLangFilePath, trim( $preFile ) . "\n\t" . trim( $msgSet ) . "\n" . ltrim( $postFile ) ) ) {
		if( $showInfo )
			print "updated $mwLangFilePath file\n";
		exit();
	}
}
/**
 * Merges json messages into php file.
 * @param string $json_txt Json text to be merged
 */
function doJsonMerge( $json_txt ) {
	global $curFileName, $fname, $messages, $mergeToJS, $jsFileText, $showInfo;

	$outPhp = "\n\t/*\n";
	$outPhp .= "\t * js file: {$curFileName}\n";
	$outPhp .= "\t */\n";

	$jsMsgAry = array();
	$doReplaceFlag = false;

	$jmsg = json_decode( '{' . $json_txt . '}', true );
	if ( count( $jmsg ) != 0 ) {

		foreach ( $jmsg as $k => $v ) {
			// Check if the existing value is changed and merge and merge ->right
			if ( isset( $messages['en'][$k] ) ) {
				if ( $messages['en'][$k] != $v ) {
					$doReplaceFlag = true;
					if( $showInfo )
						print "'$k' does not match:\n" . $messages['en'][$k] . "\n!=\n" . $v . "\n In: {$curFileName} \n";
				}
				// add the actual value: (replace new lines (not compatible json)
				// $jsMsgAry[$k] = str_replace("\n", '\\n', $messages['en'][$k]);
				$jsMsgAry[$k] = $messages['en'][$k];
				$doReplaceFlag = true;
			} ;
			$outPhp .= "\t'{$k}' => '" . str_replace( '\'', '\\\'', $v ) . "',\n";
		}
		// Merge the jsLanguage array back in and wrap the output
		if ( $mergeToJS && $doReplaceFlag ) {
			$json = json_encode( $jsMsgAry );
			$json_txt = jsonReadable( $json );
			// escape $1 for preg replace:
			$json_txt = str_replace( '$', '\$', $json_txt );
			// print "json:\n$json_txt \n";
			$str = preg_replace ( '/mw.addMessages\s*\(\s*{(.*)}\s*\)\s*/siU',
						"mw.addMessages(" . $json_txt . ")",
						$jsFileText );

			if ( file_put_contents( $fname, $str ) ) {
				if( $showInfo )
					print "\nupdated $curFileName from php\n\n";
			} else {
				die( "Could not write to: " . $fname );
			}
		}
		// Return phpOut for building msgSet in outer function
		return $outPhp;

	} else {
		if($showInfo)
			print "Could not get any json vars from: $curFileName\n";
		return '';
	}
}
/**
 * Formats a json string
 *
 * @param string $json Json string to be formated
 */
function jsonReadable( $json ) {
	$tabcount = 0;
	$result = '';
	$inquote = false;
	$ignorenext = false;

	$tab = "\t";
	$newline = "\n";

	for ( $i = 0; $i < strlen( $json ); $i++ ) {
		$char = $json[$i];

		if ( $ignorenext ) {
			$result .= $char;
			$ignorenext = false;
		} else {
			switch( $char ) {
				case '{':
					$tabcount++;
					$result .= $char . $newline . str_repeat( $tab, $tabcount );
					break;
				case '}':
					$tabcount--;
					$result = trim( $result ) . $newline . str_repeat( $tab, $tabcount ) . $char;
					break;
				case ',':
					if ( $inquote ) {
						$result .= $char;
					} else {
						$result .= $char . $newline . str_repeat( $tab, $tabcount );
					}
				break;
				case ':':
					if ( $inquote ) {
						$result .= $char;
					} else {
						$result .= ' ' . $char . ' ';
					}
					break;
				case '"':
					$inquote = !$inquote;
					$result .= $char;
					break;
				case '\\':
					if ( $inquote ) $ignorenext = true;
					$result .= $char;
					break;
				default:
					$result .= $char;
			}
		}
	}

	return $result;
}
