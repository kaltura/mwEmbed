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
?>
// IE9 has out of order, wait for mw:
var waitForMwCount = 0;
var waitforMw = function( callback ){
	if( window['mw'] ){
		// most borwsers will directly execute the callback:
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

waitforMw( function(){
	mw.loader.go();
	mw.loader.load('mw.MwEmbedSupport');
});
