<?php 
// Special mwEmbedLoader.js entry point with php based configuration
// ( will be deprecated  once we move to new resource loader ) 

// include configuration 
require_once( realpath( dirname( __FILE__ ) ) . '/includes/DefaultSettings.php' );

// TODO Check cache to see if its expired ( file modified time of mwEmbedLoader.js vs cache modified time ) 

// Get resource (  mwEmbedLoader.js )
$loaderJs = file_get_contents( 'mwEmbedLoader.js' );

// Append ResourceLoder path to loader.js
$loaderJs .= "\n" . "SCRIPT_LOADER_URL = '". addslashes( $wgResourceLoaderUrl ) . "';\n";

// Set up globals to be exported as mwEmbed config: 
$exportedJsConfig= array(
	'Kaltura.ServiceUrl' => $wgKalturaServiceUrl,
	'Kaltura.ServiceBase' => $wgKalturaServiceBase,
	'Kaltura.CdnUrl' => $wgKalturaCDNUrl
);
// Append Custom config: 
foreach( $exportedJsConfig as $key => $val ){
	$loaderJs .= "mw.setConfig('". addslashes( $key )."', '" . addslashes( $val ) . "');\n";
}

// TODO Minify via php_min

// ob_gzhandler automatically checks for browser gzip support in and gzips
ob_start("ob_gzhandler");

header("Content-type: text/javascript");
echo $loaderJs;

?>