/**
* mwProxy js2 page system.
*
* Invokes the apiProxy system 
*/

/*
 * Since this is proxy server set a pre-append debug flag to know which debug msgs are coming from where
 */
 
mw.setConfig( 'pre-append-log', 'Proxy:');
 
if ( !mwApiProxyConfig ){
	var mwApiProxyConfig = { };
}

// The default mwApiProxyConfig config 
// xxx todo whitelist all inter-wiki actions
var mwApiProxyDefaultConfig = {
	'master_whitelist' 	: [ 
		'en.wikipedia.org', 
		'commons.wikimedia.org', 
		'prototype.wikimedia.org', 
		'localhost', 
		'127.1.1.100' 
	],
	'master_blacklist'	: []
};

// User white_list should also be checked and configured at runtime.
mw.ready( function() {
	// Build our configuration from the default and mwApiProxyConfig vars
	mwApiProxyConfig = $j.extend( true, mwApiProxyDefaultConfig,  mwApiProxyConfig );
	mw.setConfig( 'apiProxyConfig',  mwApiProxyConfig);
	 
	// Do a setTimeout to 0 to call after other zero delay async events 
	// ( once everyone is doing buildout within mwsetup prior to .ready this won't be needed. ) 
	mw.log( 'load ApiProxy' );
	mw.load( 'ApiProxy', function() {
		//Clear out the page content ( not needed for iframe proxy ) 
		$j( 'body' ).html( '' );
		mw.ApiProxy.server();
	} );
} );
