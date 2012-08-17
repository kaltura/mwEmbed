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


// Output MWEMBED_VERSION global: 
echo "window['MWEMBED_VERSION'] = '$wgMwEmbedVersion';\n";

// Bootstrap some js code to make the "loader" work in stand alone mode
// not need when iframe includes starup and sets iframeStartup flag
if( !isset( $_GET[ 'mwEmbedSetupDone' ] ) ){
	// Bootstrap some js code to make the "loader" work in stand alone mode
	// Note this has to be wrapped in a document.write to run after other document.writes
	$pageStartupScript = Html::inlineScript(
		ResourceLoader::makeLoaderConditionalScript(
			Xml::encodeJsCall( 'mw.loader.go', array() )
		)
	);
	echo Xml::encodeJsCall( 'document.write', array( $pageStartupScript ) );
	
	?>
	var waitForMwCount = 0;
	var waitforMw = function( callback ){
		if( window['mw'] ){
			// most browsers will directly execute the callback:
			callback();
			return ;
		}
		setTimeout(function(){
			waitForMwCount++;
			if( waitForMwCount < 1000 ){
				waitforMw( callback );
			} else {
				console.log("Error in loading mwEmbedLodaer");
			}
		}, 10 );
	};
	<?php 
	// Load the core mw.MwEmbedSupport library
	$pageMwEmbedScript = Html::inlineScript(
		'waitforMw( function(){' .
		ResourceLoader::makeLoaderConditionalScript(
			Xml::encodeJsCall( 'mw.loader.load', array( 'mw.MwEmbedSupport' ) )
		) .
		'});'
	);
	echo Xml::encodeJsCall( 'document.write', array( $pageMwEmbedScript ) );
}
