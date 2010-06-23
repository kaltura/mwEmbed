/**
* SwarmTransport loader
*/

/**
* Default player module configuration 
*/
( function( mw ) {
	
	mw.addResourcePaths( {
		"mw.SwarmTransport" : "mw.SwarmTransport.js" 
	});

	mw.setDefaultConfig({
	 	/** 
	 	* If SwarmTransport should be enabled by default as video transport mechanism
	 	*/ 
 		'SwarmTransport.enable': true,
 		
 		/**
 		* If the swarm transport plugin should be recommended if the user does not have it installed. 
 		*/ 	 	
 		'SwarmTransport.recommend' : false,
 		
 		/**
 		* Lookup service url
 		*/
 		'SwarmTransport.torrentLookupUrl' : 'http://url2torrent.net/get/'
	});
	
	// Add the mw.SwarmTransport to the embedPlayer loader:
	$j( mw ).bind( 'LoaderEmbedPlayerUpdateRequest', function( event, playerElement, classRequest ) {			
		// If the swarm transport is enabled add mw.SwarmTransport to the request.   
		if( mw.getConfig( 'SwarmTransport.enable' ) ) {
			if( $j.inArray( 'mw.SwarmTransport', classRequest ) == -1 )  {
				classRequest.push( 'mw.SwarmTransport' );
			}
		}
	});
			
})( window.mw );
