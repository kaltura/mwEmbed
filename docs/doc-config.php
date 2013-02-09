<?php 	
// Some includes for output of configuration options
require_once( realpath( dirname( __FILE__ ) ) . '/../includes/DefaultSettings.php' );
/**
 * Docs configuration 
 */
// Detect rewrite support:
if (function_exists('apache_get_modules')) {
	$modules = apache_get_modules();
	$wgUseRewriteUrls = in_array('mod_rewrite', $modules);
} else {
	$wgUseRewriteUrls =  getenv('HTTP_MOD_REWRITE')=='On' ? true : false ;
}
$wgUseRewriteUrls = false;

$path = ( isset( $_GET['path'] ) ) ? $_GET['path'] : 'main';
$pathParts = explode('/', $path );
$pathPrefix = ( $wgUseRewriteUrls 
					&& 
				count( $pathParts ) > 1
					&&
				strrpos( $_SERVER['REQUEST_URI'], 'index.php' ) === false 
			) ? '../' : '';

/*Some quick and dirty feature helpers */
function get_features_html(){
	$featureSet = include( 'featureList.php' );
	$o='';
	// make top level ul / li
	
}
function get_flat_feature_set_list(){
	$featureSet = include( 'featureList.php' );
	$flatList = array();
	foreach( $featureSet as $topCat => $featureSetList ){
		foreach( $featureSetList['featureSets'] as $na => $featureSet ){
			$flatList[] = $featureSet;
		}
	}
	return $flatList;
}

?>