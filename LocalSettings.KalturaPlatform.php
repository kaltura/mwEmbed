<?php
/**
 * This file store all of mwEmbed local configuration ( in a default svn check out this file is empty )
 *
 * See includes/DefaultSettings.php for a configuration options
 */

// Old kConf path
$kConfPath = '../../../app/alpha/config/kConf.php';
if( ! file_exists( $kConfPath ) ) {
	// New kConf path
	$kConfPath = '../../../app/infra/kConf.php';
	if( ! file_exists( $kConfPath ) ) {
		die('Error: Unable to find kConf.php at ' . $kConfPath);
	}
}
// Load kaltura configuration file
require_once( $kConfPath );

$kConf = new kConf();

// Kaltura HTML5lib Version
$wgKalturaVersion = basename(getcwd()); // Gets the version by the folder name

// Get per partner cdn api host list
$partnerCdnApiHosts = kConf::getMap('partner_cdn_api_hosts');

// get partner ID if available
if (isset($_REQUEST['wid'])) {
    $partnerId = ltrim($_REQUEST['wid'], '_');
} elseif (isset($_REQUEST['partner_id'])) {
    $partnerId = $_REQUEST['partner_id'];
} elseif( isset( $_SERVER['PATH_INFO'] ) ) {
    $urlParts = explode( '/', $_SERVER['PATH_INFO'] );
    $index = array_search('p', $urlParts);
    if ($index !== false && isset($urlParts[$index + 1])) {
        $partnerId = $urlParts[$index + 1];
    }
}
// Check if partner has custom HTTP CDN API host
if (isset($partnerCdnApiHosts['http_hosts'][$partnerId])) {
	$wgKalturaServiceUrl = $partnerCdnApiHosts['http_hosts'][$partnerId];
} else {
    // The default Kaltura HTTP service url:
    $wgKalturaServiceUrl = wgGetUrl('cdn_api_host');
}
// Default Kaltura CDN url:
$wgKalturaCDNUrl = wgGetUrl('cdn_host');
// Default Stats URL
$wgKalturaStatsServiceUrl = wgGetUrl('stats_host');
// Default Live Stats URL
$wgKalturaLiveStatsServiceUrl = wgGetUrl('live_stats_host');
// Default Kaltura Analytics URL
$wgKalturaAnalyticsServiceUrl = wgGetUrl('analytics_host');

// SSL host names
if( $wgHTTPProtocol == 'https' ){
	// Check if partner has custom HTTPS CDN API host
	if (isset($partnerCdnApiHosts['https_hosts'][$partnerId])) {
		$wgKalturaServiceUrl = $partnerCdnApiHosts['https_hosts'][$partnerId];
	} else {
		// The default Kaltura HTTPS service url:
	    $wgKalturaServiceUrl = wgGetUrl('cdn_api_host_https');
	}
	$wgKalturaCDNUrl = wgGetUrl('cdn_host_https');
	$wgKalturaStatsServiceUrl = wgGetUrl('stats_host_https');
	$wgKalturaLiveStatsServiceUrl = wgGetUrl('live_stats_host_https');
	$wgKalturaAnalyticsServiceUrl = wgGetUrl('analytics_host_https');

}

// Default Asset CDN Path (used in ResouceLoader.php):
$wgCDNAssetPath = $wgKalturaCDNUrl;

// Default Kaltura Cache Path
$wgScriptCacheDirectory = $kConf->get('cache_root_path') . '/html5/' . $wgKalturaVersion;

if (strpos($_SERVER["HTTP_HOST"], "kaltura.com")){
	$wgLoadScript = $wgKalturaServiceUrl . '/html5/html5lib/' . $wgKalturaVersion . '/load.php';
	$wgResourceLoaderUrl = $wgLoadScript;
}

// Salt for proxy the user IP address to Kaltura API
if( $kConf->hasParam('remote_addr_header_salt') ) {
	$wgKalturaRemoteAddressSalt = $kConf->get('remote_addr_header_salt');
}

// Disable Apple HLS if defined in kConf
if( $kConf->hasParam('use_apple_adaptive') ) {
	$wgKalturaUseAppleAdaptive = $kConf->get('use_apple_adaptive');
}

// Get Kaltura Supported API Features
if( $kConf->hasParam('features') ) {
	$wgKalturaApiFeatures = $kConf->get('features');
}

// Allow Iframe to connect remote service
$wgKalturaAllowIframeRemoteService = true;

// Set debug for true (testing only)
$wgEnableScriptDebug = false;

// Get PlayReady License URL
if( $kConf->hasMap('playReady') ) {
	$playReadyMap = $kConf->getMap('playReady');
	if($playReadyMap)
		$wgKalturaLicenseServerUrl = $playReadyMap['license_server_url'];
}

// Get PlayReady License URL
if( $kConf->hasMap('drm') ) {
	$drmMap = $kConf->getMap('drm');
	if($drmMap)
		$wgKalturaUdrmLicenseServerUrl = $drmMap['license_server_url'];
}

if( $kConf->hasParam('overrideDomain') ) {
	$wgEnableKalturaOverrideDomain = $kConf->get('overrideDomain');
}

if( $kConf->hasParam('enableEmbedServicesRouting') ) {
	$wgEnableKalturaEmbedServicesRouting = $kConf->get('enableEmbedServicesRouting');
}


$wgUseMemcache = false;
$wgMemcacheConfiguration = $kConf->get('memcacheLocal','cache',null);
if( $wgMemcacheConfiguration )
{
	$wgUseMemcache = true;
}


// A helper function to get full URL of host
function wgGetUrl( $hostKey = null ) {
	global $wgHTTPProtocol, $wgServerPort, $kConf;
	if( $hostKey && $kConf->hasParam($hostKey) ) {
		return $wgHTTPProtocol . '://' . $kConf->get($hostKey) . $wgServerPort;
	}
	return null;
}
