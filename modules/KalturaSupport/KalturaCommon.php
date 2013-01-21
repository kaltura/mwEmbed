<?php

define( 'KALTURA_GENERIC_SERVER_ERROR', "Error getting sources from server. Please try again.");

// Include Pimple - Dependency Injection
// http://pimple.sensiolabs.org/
require_once( dirname( __FILE__ ) . '/../../includes/Pimple.php' );
// Include request utility helper
require_once( dirname( __FILE__ ) . '/RequestHelper.php' );
// Include the kaltura client
require_once( dirname( __FILE__ ) . '/Client/KalturaClientHelper.php' );
// Include Kaltura Logger
require_once( dirname( __FILE__ ) . '/KalturaLogger.php' );
// Include Kaltura Cache
require_once( dirname( __FILE__ ) . '/Cache/kFileSystemCacheWrapper.php');
require_once( dirname( __FILE__ ) . '/Cache/kNoCacheWrapper.php');
require_once( dirname( __FILE__ ) . '/KalturaCache.php');

function cache_enabled() {
	global $wgEnableScriptDebug, $wgKalturaForceResultCache, $container;

	$request = $container['request_helper'];

	$useCache = !$wgEnableScriptDebug;
	// Force cache flag ( even in debug )
	if( $wgKalturaForceResultCache === true){
		$useCache = true;
	}

	// Check for Cache st
	if( intval($request->getCacheSt()) > time() ) {
		$useCache = false;
	}
	return $useCache;
}

function format_string( $str ) {
	// decode the value: 
	$str = html_entity_decode( $str );
	if( $str === "true" ) {
		return true;
	} else if( $str === "false" ) {
		return false;
	} else if( is_numeric( $str ) ){
		// check for zero prefixed values and return them as strings. 
		if( is_string( $str ) && $str[0] == '0' ){
			return $str;
		}
		return (float)$str;
	} else if( json_decode( $str ) !== null && $str[0] == '{' ){
		return json_decode( $str );
	} else {
		return $str;
	}
}

// Initilize our shared container
$container = new Pimple();

// Setup Request helper
$container['request_helper'] = $container->share(function ($c) {
	return new RequestHelper();
});

// Set global vars
$container['mwembed_version'] = $wgMwEmbedVersion;
$container['cache_directory'] = $wgScriptCacheDirectory;
$container['cache_expiry'] = $wgKalturaUiConfCacheTime;
$container['enable_logs'] = $wgLogApiRequests;
$container['service_timeout'] = $wgKalturaServiceTimeout;
$container['cache_adapter_name'] = (cache_enabled()) ? 'file_cache_adapter' : 'no_cache_adapter';

// Setup Logger object
$container['logger'] = $container->share(function ($c) {
	return new KalturaLogger( $c['cache_directory'], $c['enable_logs'] );
});

// Setup Cache Adapter / Helper
$container['no_cache_adapter'] = $container->share(function ($c) {
	return new kNoCacheWrapper();
});
$container['file_cache_adapter'] = $container->share(function ($c) {
	$fileCache = new kFileSystemCacheWrapper();
	$fileCache->init($c['cache_directory'], 'iframe', 2, false, $c['cache_expiry'], true);
	return $fileCache;
});
$container['cache_helper'] = $container->share(function ($c) {
	$adapter = $c[ $c['cache_adapter_name'] ];
	return new KalturaCache( $adapter, $c['cache_expiry'] );
});

// Setup client helper
$container['client_helper'] = $container->share(function ($c) {

	// Get request & logger object
	$request = $c['request_helper'];
	$logger = $c['logger'];

	// Setup client config
	$config = array(
		'ClientTag'			=>	'html5iframe:' . $c['mwembed_version'] . ',cache_st: ' . $request->getCacheSt(),
		'ServiceUrl'		=>	$request->getServiceConfig('ServiceUrl'),
		'ServiceBase'		=>	$request->getServiceConfig('ServiceBase'),
		'ServiceTimeout'	=>	$c['service_timeout'],
		'UserAgent'			=>	$request->getUserAgent(),
		'RequestHeaders'	=>	($request->getRemoteAddrHeader()) ? array( $request->getRemoteAddrHeader() ) : array(),
	);

	// Add logger if needed
	if( $c['enable_logs'] ) {
		$config['Logger'] = $c['logger'];
	}
	// Set KS from our request or generate a new KS
	if( $request->hasKS() ) {
		$config['KS'] = $request->getKS();
	} else {
		$config['WidgetId'] = $request->getWidgetId();
	}	

	return new KalturaClientHelper( $config );
});

$container['uiconf_result'] = $container->share(function ($c) {
	return new UiConfResult($c['request_helper'], $c['client_helper'], $c['cache_helper'], $c['logger']);
});
