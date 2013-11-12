<?php

define( 'KALTURA_GENERIC_SERVER_ERROR', "Error getting sources from server. Please try again.");

/* 
 * TODO: Use PHP5 auto loading capability instead of requiring all of our resources all the time
 */

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
require_once( dirname( __FILE__ ) . '/KalturaUtils.php');

// Include Kaltura Utilities

// Initilize our shared container
$container = new Pimple();

// Setup Request helper
$container['request_helper'] = $container->share(function ($c) {
	return new RequestHelper( $c['utility_helper'] );
});

$container['utility_helper'] = $container->share(function ($c) {
	return new KalturaUtils();
});

$kUtility = $container['utility_helper'];

// Set global vars
$container['mwembed_version'] = $wgMwEmbedVersion;
$container['cache_directory'] = $wgScriptCacheDirectory;
$container['logs_directory'] = $wgScriptCacheDirectory . '/logs';
$container['cache_expiry'] = $wgKalturaUiConfCacheTime;
$container['enable_logs'] = $wgLogApiRequests;
$container['service_timeout'] = $wgKalturaServiceTimeout;

// Setup Logger object
$container['logger'] = $container->share(function ($c) {
	return new KalturaLogger( $c['logs_directory'], $c['enable_logs'] );
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

	// Choose which cache adapter to use
	global $wgEnableScriptDebug, $wgKalturaForceResultCache;
	$useCache = !$wgEnableScriptDebug;
	// Force cache flag ( even in debug )
	if( $wgKalturaForceResultCache === true){
		$useCache = true;
	}
	$request = $c['request_helper'];

	// Check for Cache st
	if( intval($request->getCacheSt()) > time() ) {
		$useCache = false;
	}

	$className = ($useCache) ? 'file_cache_adapter' : 'no_cache_adapter';
	return new KalturaCache( $c[ $className ], $c['cache_expiry'] );
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
		'Method'			=>	'GET',
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
	require_once( dirname( __FILE__ ) .  '/UiConfResult.php' );
	return new UiConfResult(
		$c['request_helper'], 
		$c['client_helper'], 
		$c['cache_helper'], 
		$c['logger'], 
		$c['utility_helper'] 
	);
});

$container['entry_result'] = $container->share(function ($c) {
	require_once( dirname( __FILE__ ) .  '/EntryResult.php' );
	return new EntryResult(
		$c['request_helper'], 
		$c['client_helper'], 
		$c['cache_helper'], 
		$c['logger'],
		$c['uiconf_result']
	);
});

$container['playlist_result'] = $container->share(function ($c) {
	require_once( dirname( __FILE__ ) .  '/PlaylistResult.php' );
	return new PlaylistResult(
		$c['request_helper'], 
		$c['client_helper'], 
		$c['cache_helper'], 
		$c['uiconf_result'], 
		$c['entry_result']
	);
});
