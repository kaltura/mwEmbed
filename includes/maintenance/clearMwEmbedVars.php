<?php
if ( isset( $_SERVER ) && array_key_exists( 'REQUEST_METHOD', $_SERVER ) ) {
	print "This script must be run from the command line\n";
	exit();
}
exit( 'This script has been depreciated' );
$mwPath = dirname( __FILE__ ) . '/../../languages/mwEmbed.i18n.php' ;

include( $mwPath );
$saveKeys = array(
/*
 * js file: /mwEmbed.js
 */
'mwe-loading_txt' => 'Loading ...',
'mwe-size-gigabytes' => '$1 GB',
'mwe-size-megabytes' => '$1 MB',
'mwe-size-kilobytes' => '$1 K',
'mwe-size-bytes' => '$1 B',
'mwe-error_load_lib' => 'Error: JavaScript $1 was not retrievable or does not define $2',
'mwe-apiproxy-setup' => 'Setting up API proxy',
'mwe-load-drag-item' => 'Loading dragged item',
'mwe-ok' => 'OK',
'mwe-cancel' => 'Cancel',
'mwe-enable-gadget' => 'Enable multimedia beta ( mwEmbed ) for all pages',
'mwe-enable-gadget-done' => 'multimedia beta gadget has been enabled',
'mwe-must-login-gadget' => 'To enable gadget you must <a target="_new" href="$1">login</a>',
'mwe-test-plural' => 'I ran {{PLURAL:$1|$1 test|$1 tests}}',
);

//output only the $saveKeys
$s = '<?php

/**
 * Localization file for mwEmbed.js
 */
';
foreach( $messages as $langKey => $msgSet ){
	$startLangFlag = false;

	// Check every msg for language keys:
	foreach( $saveKeys as $mk => $mv ) {
		if( isset( $messages[$langKey][ $mk ] ) ){
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

file_put_contents( $mwPath , $s);


