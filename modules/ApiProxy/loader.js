/* apiProxy Loader */

// Wrap in mw to not pollute global namespace
( function( mw ) {
	mw.addResourcePaths( {
		"mw.ApiProxy"	: "mw.ApiProxy.js"
	} );
	
	mw.addModuleLoader( 'ApiProxy', [
		'JSON',
		'mw.ApiProxy'	
	]);
} )( window.mw );