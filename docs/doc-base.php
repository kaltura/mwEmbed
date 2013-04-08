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
$wgUseRewriteUrls = true;

$path = ( isset( $_GET['path'] ) ) ? $_GET['path'] : 'main';
$pathParts = explode('/', $path );
$pathPrefix = ( $wgUseRewriteUrls 
			&& 
		count( $pathParts ) > 1
			&&
		strrpos( $_SERVER['REQUEST_URI'], 'index.php' ) === false 
	) ? '../' : '';

	
/* setup base feature list keys*/
$featureList = include( 'featureList.php' );

$flatFeatureList = array();
foreach( $featureList as $featureCategoryKey => $featureCategory ){
	foreach( $featureCategory['featureSets'] as $featureSetKey => $featureSet){
		foreach( $featureSet['testfiles'] as $testfileKey =>  $testfile ){
			$flatFeatureList[ $testfileKey ] = array($featureCategoryKey,  $featureSetKey, $testfileKey);
		}
	}
}
$path = ( isset( $_GET['path'] ) )?$_GET['path'] : 'main';
$pathParts = explode('/', $path );
if( count( $pathParts ) == 1 && isset( $flatFeatureList[ $pathParts[0] ] ) ){
	$pathParts = $flatFeatureList[ $pathParts[0] ];
}
	

// normalize path from path key if present: 
$kdocPageType = 'landing';

if( $path != 'main' ){
	$kdocPageType = 'featurepage';
}
// check for content page types:
if( $path == 'resources' 
	|| $path == 'advertising' 
	|| $path == 'templates'
	|| $path == 'customersamples'
){
	$kdocPageType = 'contentpage';
}

// Set page title if avaliable from path:
$kdocPageTitle = $path;
if(		isset( $featureList[ $pathParts[0] ] )
		&& isset( $featureList[ $pathParts[0] ]['featureSets'][ $pathParts[1] ] )
		&& isset( $featureList[ $pathParts[0] ]['featureSets'][ $pathParts[1] ]['testfiles'][ $pathParts[2] ] )
){
	$kdocPageTitle = $featureList[ $pathParts[0] ]['featureSets'][ $pathParts[1] ]['testfiles'][ $pathParts[2] ]['title'];
}

?>
