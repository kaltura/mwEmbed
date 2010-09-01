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
 		'SwarmTransport.Enable': true,
 		
 		/**
 		* If the swarm transport plugin should be recommended if the user does not have it installed. 
 		*/ 	 	
 		'SwarmTransport.Recommend' : false,
 		
 		/**
 		* Lookup service url
 		*/
 		'SwarmTransport.TorrentLookupUrl' : 'http://url2torrent.net/get/'
	});
	
	// Add the mw.SwarmTransport to the embedPlayer loader:
	$j( mw ).bind( 'LoaderEmbedPlayerUpdateRequest', function( event, playerElement, classRequest ) {			
		// If the swarm transport is enabled add mw.SwarmTransport to the request.   
		if( mw.getConfig( 'SwarmTransport.Enable' ) ) {
			if( $j.inArray( 'mw.SwarmTransport', classRequest ) == -1 )  {
				classRequest.push( [ 'mw.SwarmTransport' ]);
			}
		}
	});
			
})( window.mw );
