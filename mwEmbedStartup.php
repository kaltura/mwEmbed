<?php
/**
* Kaltura entry point to resource loader framework
*/
// Set the request variables:
$_GET['modules'] = 'startup';
$_GET['only'] = 'scripts';

// NOTE this won't work so well with symbolic links
$loaderPath = 'load.php';
if( is_file( $loaderPath ) ){
	chdir( dirname( $loaderPath ) );
	include_once( $loaderPath );
} else {
	print "if( console && console.log ){ console.log( 'Error can't find load.php' ) }";
}

// Bootstrap some js code to make the "loader" work in stand alone mode
// Note this has to be wrapped in a document.write to run after other document.writes
$pageStartupScript = Html::inlineScript(
	ResourceLoader::makeLoaderConditionalScript(
		Xml::encodeJsCall( 'mw.loader.go', array() )
	)
);
echo Xml::encodeJsCall( 'document.write', array( $pageStartupScript ) );

// Load the core mw.MwEmbedSupport library
$pageMwEmbedScript = Html::inlineScript(
	ResourceLoader::makeLoaderConditionalScript(
		Xml::encodeJsCall( 'mw.loader.load', array( 'mw.MwEmbedSupport' ) )
	)
);
echo Xml::encodeJsCall( 'document.write', array( $pageMwEmbedScript ) );
