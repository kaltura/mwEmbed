<?php
/**
 * This file store all of mwEmbed local configuration ( in a default svn check out this file is empty )
 *
 * See includes/DefaultSettings.php for a configuration options
 */

// Get kaltura configuration file
require_once( realpath( '/opt/kaltura/app/alpha/config' ) . '/kConf.php' );

$kConf = new kConf();

// Kaltura HTML5lib Version
$wgKalturaVersion = basename(getcwd()); // Gets the version by the folder name

// The default Kaltura service url:
$wgKalturaServiceUrl = $wgHTTPProtocol . '://' . $kConf->get('cdn_api_host');
// Default Kaltura CDN url:
$wgKalturaCDNUrl = $wgHTTPProtocol. '://' . $kConf->get('cdn_host');
// Default Stats URL
$wgKalturaStatsServiceUrl = $wgHTTPProtocol. '://' . $kConf->get('stats_host');

// SSL host names
if( $wgHTTPProtocol == 'https' ){
	$wgKalturaServiceUrl = $wgHTTPProtocol . '://' . $kConf->get('cdn_api_host_https');
	$wgKalturaCDNUrl = $wgHTTPProtocol. '://' . $kConf->get('cdn_host_https');
	$wgKalturaStatsServiceUrl = $wgHTTPProtocol. '://' . $kConf->get('stats_host_https');
}

// Default Asset CDN Path (used in ResouceLoader.php):
$wgCDNAssetPath = $wgKalturaCDNUrl;

// Default Kaltura Cache Path
$wgScriptCacheDirectory = $kConf->get('cache_root_path') . 'html5/' . $wgKalturaVersion;

$wgResourceLoaderUrl = $wgKalturaServiceUrl . '/html5/html5lib/' . $wgKalturaVersion . '/ResourceLoader.php';

// Salt for proxy the user IP address to Kaltura API
$wgKalturaRemoteAddressSalt = $kConf->get('remote_addr_header_salt');

// Allow Iframe to connect remote service
$wgKalturaAllowIframeRemoteService = true;

// Set debug for true (testing only)
$wgEnableScriptDebug = false;

// Define which modules to load
$wgMwEmbedEnabledModules =  array( 'EmbedPlayer', 'KalturaSupport', 'AdSupport', 'Playlist', 'TimedText', 'Omniture',
		'Plymedia', 'FreeWheel', 'EmbedWizard',  'SyntaxHighlighter', 'DoubleClick', 'Conviva',
		'NielsenCombined', 'NielsenVideoCensus', 'Comscore', 'DolStatistics' );

?>
