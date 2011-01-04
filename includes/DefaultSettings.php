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
$wgMwEmbedPathUrl = false;

/*********************************************************
 * Default Kaltura Configuration: 
 * TODO move kaltura configuration to KalturaSupport module ( part of ResourceLoader update ) 
 ********************************************************/

// The default Kaltura service url:
$wgKalturaServiceUrl = 'http://www.kaltura.com/';

// Default Kaltura CDN url: 
$wgKalturaCDNUrl = 'http://cdn.kaltura.com';

// Default Kaltura service url:
$wgKalturaServiceBase = '/api_v3/index.php?';

// Default expire time for ui conf api queries in seconds 
$wgKalturaUiConfCacheTime = 600;




/*********************************************************
 * Include local settings override:
 ********************************************************/
$wgLocalSettingsFile = realpath( dirname( __FILE__ ) ) . '../LocalSettings.php'; 
if( is_file( $wgLocalSettingsFile ) ){
	require_once( $wgLocalSettingsFile );
}

/*********************************************************
 * Set any autoconfigure variables if not set in LocalSettings 
 * 
 * These variables should be set to false at the top of DefaultSettings.php
 ********************************************************/
if( $wgMwEmbedPathUrl === false ){
	$wgMwEmbedPathUrl  = str_replace( 'mwEmbedFrame.php', '', $_SERVER['SCRIPT_NAME'] );
}

?>