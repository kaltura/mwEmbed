<?php 
/**
 * This file stores default settings for Kaltura html5 client library "mwEmbed".
 * 
 *  DO NOT MODIFY THIS FILE. Instead modify LocalSettings.php in the parent mwEmbd directory. 
 * 
 */
// The default cache directory
$wgScriptCacheDirectory = realpath( dirname( __FILE__ ) ) . '/cache';

$wgBaseMwEmbedPath = realpath( dirname( __FILE__ ) . '/../' );

// The version of the library
$wgMwEmbedVersion = '1.7.0.rc4';

/**
 * Set the resource loader path to load.php based on server env.
 */
$wgProto = (isset($_SERVER['HTTPS']) && $_SERVER['HTTPS'] == 'on') ? 'https' : 'http';
$wgServerPort = (($_SERVER['SERVER_PORT']) != '80' && $_SERVER['SERVER_PORT'] != '443')?':'.$_SERVER['SERVER_PORT']:'';
$wgServer = $wgProto . '://' . $_SERVER['SERVER_NAME'] .$wgServerPort.  dirname( $_SERVER['SCRIPT_NAME'] ) . '/';

// By default set $wgScriptPath to empty
$wgScriptPath = '';

// Default Load Script path
$wgLoadScript = $wgServer . $wgScriptPath . 'load.php';

// Support legacy $wgResourceLoaderUrl url. 
$wgResourceLoaderUrl = $wgLoadScript;

// The list of enabled modules 
$wgMwEmbedEnabledModules = array();
// By default we enable every module in the "modules" folder
// Modules are registered after localsettings.php to give a chance 
// for local configuration to override the set of enabled modules
$d = dir( realpath( dirname( __FILE__ ) )  . '/../modules' );	
while (false !== ($entry = $d->read())) {
	if( substr( $entry, 0, 1 ) != '.' ){
		$wgMwEmbedEnabledModules[] = $entry;
	}
}
// Default HTTP protocol
$wgHTTPProtocol = (isset($_SERVER['HTTPS']) && $_SERVER['HTTPS'] == 'on') ? "https" : "http";

// Default debug mode
$wgEnableScriptDebug = false;

// $wgMwEmbedModuleConfig allow setting of any mwEmbed configuration variable 
// ie $wgMwEmbedModuleConfig['ModuleName.Foo'] = 'bar';
// For list of configuration variables see the .conf file in any given mwEmbed module
$wgMwEmbedModuleConfig = array();

// A special variable to note the stand alone resource loader mode: 
$wgStandAloneResourceLoaderMode = true;

/**
 * Client-side resource modules. 
 */
$wgResourceModules = array();	

/* Default skin can be any jquery based skin */
$wgDefaultSkin = 'kaltura-dark';

/**
 * Default player skin module diffrent from jquery theme, 
 * controls layout and enabled components
 */
$wgVideoPlayerSkinModule = 'mw.PlayerSkinMvpcf';

// If the resource loader is in 'debug mode'
$wgResourceLoaderDebug = false;

// If the resource loader should minify vertical space
$wgResourceLoaderMinifyJSVerticalSpace = false;


$wgMwEmbedProxyUrl =  $wgServer . $wgScriptPath . 'simplePhpXMLProxy.php';

/**
 * Maximum time in seconds to cache resources served by the resource loader
 */
$wgResourceLoaderMaxage = array(
	'versioned' => array(
		// Squid/Varnish but also any other public proxy cache between the client and MediaWiki
		'server' => 30 * 24 * 60 * 60, // 30 days
		// On the client side (e.g. in the browser cache).
		'client' => 30 * 24 * 60 * 60, // 30 days
	),
	'unversioned' => array(
		'server' => 60 * 60, // 1 hour
		'client' => 60 * 60, // 1 hour
	),
);

/*********************************************************
 * Default Kaltura Configuration: 
 * TODO move kaltura configuration to KalturaSupport module ( part of New ResourceLoader update ) 
 ********************************************************/

// To include signed headers with user IPs for IP restriction lookups, input a salt string for 
// $wgKalturaRemoteAddressSalt configuration option. 
$wgKalturaRemoteAddressSalt = false;

// If we should check for onPage resources per the external resources plugin
$wgKalturaEnableEmbedUiConfJs = false;

// Enables the result cache while in debug mode 
// This enables fast player rendering while scripts remain unminifed. 
// ( normally $wgEnableScriptDebug disables result cache )
$wgKalturaForceResultCache = false;

// For force ip testing geo restrictions
$wgKalturaForceIP = false;

// To test sites with referre restrictions: 
$wgKalturaForceReferer = false;

// The default Kaltura service url:
$wgKalturaServiceUrl = 'http://cdnapi.kaltura.com';
// if https use cdnsecakmi
if( $wgHTTPProtocol == 'https' ){
	$wgKalturaServiceUrl =  'https://www.kaltura.com';
}

// Default Kaltura CDN url: 
$wgKalturaCDNUrl = 'http://cdnbakmi.kaltura.com';
// if https use cdnsecakmi
if( $wgHTTPProtocol == 'https' ){
	$wgKalturaCDNUrl =  'https://cdnsecakmi.kaltura.com';
}

// Default Kaltura Stats url
$wgKalturaStatsServiceUrl = 'http://stats.kaltura.com';
if( $wgHTTPProtocol == 'https' ){
	$wgKalturaStatsServiceUrl = 'https://www.kaltura.com';
}

// Default Kaltura service url:
$wgKalturaServiceBase = '/api_v3/index.php?service=';

// Default CDN Asset Path
$wgCDNAssetPath = $wgHTTPProtocol . '://' . $_SERVER['HTTP_HOST'];

// Default api request timeout in seconds 
$wgKalturaServiceTimeout = 20;

// If the iframe will accept 3rd party domain remote service requests 
// should be left "off" in production. 
$wgKalturaAllowIframeRemoteService = false;

// Default expire time for ui conf api queries in seconds 
$wgKalturaUiConfCacheTime = 60*10; // 10 min

// Cache errors for 30 seconds to avoid overloading apaches in CDN setups
$wgKalturaErrorCacheTime = 30;

// By default enable the iframe rewrite
$wgKalturaIframeRewrite = true;

$wgEnableIpadHTMLControls = true;

$wgKalturaUseManifestUrls = true;

// The admin secret should be set to an integration admin secret key for testing 
// api actions that require admin rights, like granting a ks for preview / play:
$wgKalturaAdminSecret = null;

// By default do allow custom resource includes. 
$wgAllowCustomResourceIncludes = true;

// An array of partner ids for which apple adaptive should be disabled. 
$wgKalturaPartnerDisableAppleAdaptive = array();

// By default use apple adaptive if we have the ability
$wgKalturaUseAppleAdaptive = ($wgHTTPProtocol == 'https') ? false : true;

// Add Kaltura api services: ( should be part of kaltura module config)
include_once( realpath( dirname( __FILE__ ) )  . '/../modules/KalturaSupport/apiServices/mweApiUiConfJs.php' );
include_once( realpath( dirname( __FILE__ ) )  . '/../modules/KalturaSupport/apiServices/mweApiSleepTest.php' );
include_once( realpath( dirname( __FILE__ ) )  . '/../modules/KalturaSupport/apiServices/mweApiKSTest.php' );

/*********************************************************
 * Include local settings override:
********************************************************/
$wgLocalSettingsFile = realpath( dirname( __FILE__ ) ) . '/../LocalSettings.php';

if( is_file( $wgLocalSettingsFile ) ){
	require_once( $wgLocalSettingsFile );
}

/**
 * Extensions should register foreign module sources here. 'local' is a
 * built-in source that is not in this array, but defined by
 * ResourceLoader::__construct() so that it cannot be unset.
 *
 * Example:
 *   $wgResourceLoaderSources['foo'] = array(
 *       'loadScript' => 'http://example.org/w/load.php',
 *       'apiScript' => 'http://example.org/w/api.php'
 *   );
 */
$wgResourceLoaderSources = array();

