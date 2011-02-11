<?php 
/**
 * This file stores default settings for Kaltura html5 client library "mwEmbed".
 * 
 *  DO NOT MODIFY THIS FILE. Instead modify LocalSettings.php in the parent mwEmbd directory. 
 * 
 */

// The default cache directory
$wgScriptCacheDirectory = realpath( dirname( __FILE__ ) ) . '/cache';

// The absolute or relative path to mwEmbed install folder.
// by default its the entry point minus the entry point name:
$wgMwEmbedPathUrl = str_replace( 
	// List entry points: 
	array( 'mwEmbedFrame.php', 'ResourceLoader.php',  'mwEmbedLoader.php'),
	'', 
	$_SERVER['SCRIPT_NAME']
);

// Url to the resource loader php script: 
$wgResourceLoaderUrl = $wgMwEmbedPathUrl . 'ResourceLoader.php';

// The list of enabled modules 
$wgMwEmbedEnabledModules = array();

// By default we enable every module in the "modules" folder
$d = dir( realpath( dirname( __FILE__ ) )  . '/../modules' );	
while (false !== ($entry = $d->read())) {
	if( substr( $entry, 0, 1 ) != '.' ){
		$wgMwEmbedEnabledModules[] = $entry;
	}
}

/*********************************************************
 * Default Kaltura Configuration: 
 * TODO move kaltura configuration to KalturaSupport module ( part of ResourceLoader update ) 
 ********************************************************/

// Default debug mode
$wgEnableScriptDebug = false;

// The default Kaltura service url:
$wgKalturaServiceUrl = 'http://www.kaltura.com';

// Default Kaltura CDN url: 
$wgKalturaCDNUrl = 'http://cdn.kaltura.com';

// Default Kaltura service url:
$wgKalturaServiceBase = '/api_v3/index.php?service=';

// Default expire time for ui conf api queries in seconds 
$wgKalturaUiConfCacheTime = 600;

$wgKalturaIframeRewrite = 'false';

$wgEnableIframeApi = false;
$wgEnableIpadHTMLControls = false;

$wgKalturaUseManifestUrls = 'true';

/*********************************************************
 * Include local settings override:
 ********************************************************/
$wgLocalSettingsFile = realpath( dirname( __FILE__ ) ) . '/../LocalSettings.php';

if( is_file( $wgLocalSettingsFile ) ){
	require_once( $wgLocalSettingsFile );
}


?>
