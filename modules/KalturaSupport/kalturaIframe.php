<?php
/**
 * KalturaIframe support
 */
@ob_end_clean();

// Check for custom resource ps config file:
if( isset( $wgKalturaPSHtml5SettingsPath ) && is_file( $wgKalturaPSHtml5SettingsPath ) ){
	require_once( $wgKalturaPSHtml5SettingsPath );
}

require_once 'kalturaIframeClass.php';

// Setup the kalturaIframe
$kIframe = new kalturaIframeClass();

// start gzip compression if avaliable: 
if(!ob_start("ob_gzhandler")) ob_start();

// Check if we are wrapping the iframe output in a callback
if( isset( $_REQUEST['callback']  )) {
	// check for json output mode ( either default raw content or 'parts' for sections
	$json = null;
	if( isset ( $_REQUEST['parts'] ) && $_REQUEST['parts'] == '1' ){
		$json = array(
			'rawHead' =>  $kIframe->outputIframeHeadCss(),
			'rawScripts' => $kIframe->getKalturaIframeScripts()
		);
	} else {
		// For full page replace:
		$json = array(
			'content' => $kIframe->getIFramePageOutput() 
		);
	}
	// Set the iframe header:
	$kIframe->setIFrameHeaders();
	echo htmlspecialchars( $_REQUEST['callback'] ) .
		'(' . json_encode( $json ) . ');';
	header('Content-Type: text/javascript' );
} else {
	// If not outputing JSON output the entire iframe to the current buffer:
	$iframePage =  $kIframe->getIFramePageOutput();
	// Set the iframe header:
	$kIframe->setIFrameHeaders();
	echo $iframePage;
}
ob_end_flush();

