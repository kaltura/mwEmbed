/* apiProxy Loader */

mw.addResourcePaths( {
	"mw.ApiProxy"	: "mw.ApiProxy.js"
} );

mw.addModuleLoader( 'ApiProxy', function( callback ) {
	mw.load( [
		'mw.ApiProxy',
		'JSON'
	], function() {
		callback( 'ApiProxy' );
	});
});
