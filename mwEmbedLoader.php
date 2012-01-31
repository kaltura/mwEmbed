<?php
// Special mwEmbedLoader.js entry point with php based configuration
// ( will be deprecated  once we move to new resource loader ) 

// Include configuration 
require_once( realpath( dirname( __FILE__ ) ) . '/includes/DefaultSettings.php' );

// Kaltura Comment
$loaderComment = "/**
* Kaltura HTML5 Library v$wgMwEmbedVersion 
* Library Page http://www.kaltura.org/project/HTML5_Video_Media_JavaScript_Library
* 
* Common configuration options see: 
* http://html5video.org/wiki/Kaltura_SaaS_FAQ
*
* Whats in this version of Kaltura HTML5
* http://html5video.org/wiki/Kaltura_HTML5_Release_Notes
* 
*/\n";

// Append ResourceLoder path to loader.js
$loaderJs = "window['SCRIPT_LOADER_URL'] = '". addslashes( $wgResourceLoaderUrl ) . "';\n";

// Add the library version: 
$loaderJs .= "window['KALTURA_LOADER_VERSION'] = '$wgMwEmbedVersion';\n";

// Get resource (  kWidgetLoader.js )
$loaderJs .= file_get_contents( 'kWidgetLoader.js' );

// Get resource (  mwEmbedLoader.js )
$loaderJs .= file_get_contents( 'mwEmbedLoader.js' );

// Include checkUserAgentPlayer code
$loaderJs .= file_get_contents( 'modules/KalturaSupport/kdpPageJs/checkUserAgentPlayerRules.js' );

// Set up globals to be exported as mwEmbed config: 
$exportedJsConfig= array(
	'debug' => $wgEnableScriptDebug,
	'Kaltura.UseManifestUrls' => $wgKalturaUseManifestUrls,
	'Kaltura.ServiceUrl' => $wgKalturaServiceUrl,
	'Kaltura.ServiceBase' => $wgKalturaServiceBase,
	'Kaltura.CdnUrl' => $wgKalturaCDNUrl,
	'Kaltura.StatsServiceUrl' => $wgKalturaStatsServiceUrl,
	'Kaltura.IframeRewrite' => $wgKalturaIframeRewrite,
	'EmbedPlayer.EnableIframeApi'  => $wgEnableIframeApi,
	'EmbedPlayer.EnableIpadHTMLControls' => $wgEnableIpadHTMLControls,
	'EmbedPlayer.UseFlashOnAndroid' => true,
	'Kaltura.LoadScriptForVideoTags' => true,
	'Kaltura.AllowIframeRemoteService' => $wgKalturaAllowIframeRemoteService,
	'Kaltura.UseAppleAdaptive' => $wgKalturaUseAppleAdaptive,
	'Kaltura.EnableEmbedUiConfJs' => $wgKalturaEnableEmbedUiConfJs
);

// Append Custom config: 
foreach( $exportedJsConfig as $key => $val ){
	// @@TODO use a library Boolean conversion routine: 
	$val = ( $val === true )? $val = 'true' : $val;
	$val = ( $val === false )? $val = 'false' : $val;
	$val = ( $val != 'true' && $val != 'false' )? "'" . addslashes( $val ) . "'": $val;
	$loaderJs .= "mw.setConfig('". addslashes( $key ). "', $val );\n";
}

header("Content-type: text/javascript");
if( isset( $_GET['debug'] ) || $wgEnableScriptDebug ){
	
	header("Cache-Control: no-cache, must-revalidate"); // HTTP/1.1
	header("Pragma: no-cache");
	header("Expires: Sat, 26 Jul 1997 05:00:00 GMT"); // Date in the past
	
	echo $loaderComment . $loaderJs;
} else {
	// Get the JSmin class:
	require_once( realpath( dirname( __FILE__ ) ) . '/includes/library/JSMin.php' );
	
	// Set the expire time for the loader to 5 min. ( it controls the version of the actual library payload )
	$max_age = 60*5; 
	header("Cache-Control: private, max-age=$max_age max-stale=0");
	header('Expires: ' . gmdate('D, d M Y H:i:s', time() + $max_age) . 'GMT');
	header('Last-Modified: ' . gmdate('D, d M Y H:i:s', time()) . 'GMT');
	
	// TODO Minify via php_min
	// ob_gzhandler automatically checks for browser gzip support and gzips
	ob_start("ob_gzhandler");

	// Create cache directory if not exists
	if( ! file_exists( $wgScriptCacheDirectory ) ) {
		$created = mkdir( $wgScriptCacheDirectory );
		if( ! $created ) {
			echo "if( console ){ console.log('Error in creating cache directory: ". $wgScriptCacheDirectory . "'); }";
		}
	}
	
	$loaderCacheFile = $wgScriptCacheDirectory . '/loader_' . $wgHTTPProtocol . '.min.' . $wgMwEmbedVersion . '.js';

	$javascriptModTime = @filemtime( 'mwEmbedLoader.js' );
	$cacheModTime = @filemtime( $loaderCacheFile );
	
	// check if there were any updates to the mwEmbedLoader file
	if( is_file( $loaderCacheFile ) && $javascriptModTime < $cacheModTime ){
		echo $loaderComment . file_get_contents( $loaderCacheFile );
	} else {
		$loaderMin = JSMin::minify( $loaderJs );
		file_put_contents( $loaderCacheFile, $loaderMin );
		echo $loaderComment . $loaderMin;
	}
}
