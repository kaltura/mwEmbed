<?php
// Special mwEmbedLoader.js entry point with php based configuration
// ( will be deprecated  once we move to new resource loader ) 

// include configuration 
require_once( realpath( dirname( __FILE__ ) ) . '/includes/DefaultSettings.php' );

// Append ResourceLoder path to loader.js
$loaderJs = "window['SCRIPT_LOADER_URL'] = '". addslashes( $wgResourceLoaderUrl ) . "';\n";

// Add debug flag global as well
if( $wgEnableScriptDebug === true ) {
    $loaderJs .= "window['SCRIPT_FORCE_DEBUG'] = true;\n";
}

// Get resource (  mwEmbedLoader.js )
$loaderJs .= file_get_contents( 'mwEmbedLoader.js' );

// Set up globals to be exported as mwEmbed config: 
$exportedJsConfig= array(
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
	'Kaltura.UseAppleAdaptive' => $wgKalturaUseAppleAdaptive
);

// Append Custom config: 
foreach( $exportedJsConfig as $key => $val ){
	// @@TODO use a library Boolean conversion routine: 
	$val = ( $val === true )? $val = 'true' : $val;
	$val = ( $val === false )? $val = 'false' : $val;
	$val = ( $val != 'true' && $val != 'false' )? "'" . addslashes( $val ) . "'": $val;
	$loaderJs .= "mw.setConfig('". addslashes( $key ). "', $val );\n";
}

// Set the expire time for the loader to 5 min. ( it controls the version of the actual library payload )
$max_age = 60*5; 
header("Cache-Control: private, max-age=$max_age max-stale=0");
header('Expires: ' . gmdate('D, d M Y H:i:s', time() + $max_age) . 'GMT');
header('Last-Modified: ' . gmdate('D, d M Y H:i:s', time()) . 'GMT');

// TODO Minify via php_min
// ob_gzhandler automatically checks for browser gzip support and gzips
ob_start("ob_gzhandler");

header("Content-type: text/javascript");
echo $loaderJs;

?>