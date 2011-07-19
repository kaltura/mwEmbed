<?php
// Special mwEmbedLoader.js entry point with php based configuration
// ( will be deprecated  once we move to new resource loader ) 

// include configuration 
require_once( realpath( dirname( __FILE__ ) ) . '/includes/DefaultSettings.php' );

// TODO Check cache to see if its expired ( file modified time of mwEmbedLoader.js vs cache modified time ) 
$loaderJs = 'KALTURA_SCRIPT_NAME =  "' . addslashes( $_SERVER['REQUEST_URI'] ) . '";' . "\n";

// Get resource (  mwEmbedLoader.js )
$loaderJs .= file_get_contents( 'mwEmbedLoader.js' );

// Append ResourceLoder path to loader.js
$loaderJs .= "\n" . "SCRIPT_LOADER_URL = '". addslashes( $wgResourceLoaderUrl ) . "';\n";
	
// Set up globals to be exported as mwEmbed config: 
$exportedJsConfig= array(
	'Kaltura.UseManifestUrls' => $wgKalturaUseManifestUrls,
	'Kaltura.ServiceUrl' => $wgKalturaServiceUrl,
	'Kaltura.ServiceBase' => $wgKalturaServiceBase,
	'Kaltura.CdnUrl' => $wgKalturaCDNUrl,
	'Kaltura.IframeRewrite' => $wgKalturaIframeRewrite,
	'EmbedPlayer.EnableIframeApi'  => $wgEnableIframeApi,
	'EmbedPlayer.EnableIpadHTMLControls' => $wgEnableIpadHTMLControls,
	'EmbedPlayer.UseFlashOnAndroid' => true,
	'Kaltura.LoadScriptForVideoTags' => true,
	'Kaltura.AllowRemoteService' => $wgAllowRemoteKalturaService
);
// Append Custom config: 
foreach( $exportedJsConfig as $key => $val ){
	// @@TODO use a library Boolean conversion routine: 
	$val = ( $val === true )? $val = 'true' : $val;
	$val = ( $val === false )? $val = 'false' : $val;
	$val = ( $val != 'true' && $val != 'false' )? "'" . addslashes( $val ) . "'": $val;
	$loaderJs .= "mw.setConfig('". addslashes( $key ). "', $val );\n";
}

if($wgEnableScriptDebug === true) {
    $loaderJs .= 'SCRIPT_FORCE_DEBUG = true;';
}

// TODO Minify via php_min
// ob_gzhandler automatically checks for browser gzip support and gzips
ob_start("ob_gzhandler");

header("Content-type: text/javascript");
echo $loaderJs;

?>