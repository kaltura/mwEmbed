/**
* SwarmTransport loader
*/

/**
* Default player module configuration 
*/
( function( mw ) {
	
	mw.addClassFilePaths( {
		"mw.SwarmTransport" : "mw.SwarmTransport.js" 
	});

	mw.setDefaultConfig({
	 	/** 
	 	* If SwarmTransport should be enabled by default as video transport mechanism
	 	*/ 
 		'enableSwarmTransport': false,
 		
 		/**
 		* If the swarm transport plugin should be recommended if the user does not have it installed. 
 		*/ 	 	
 		'recommendSwarmTransport' : false  
	});
	
	// Add the mw.SwarmTransport to the embedPlayer loader:
	$j( mw ).bind( 'LoaderEmbedPlayerUpdateRequest', function( event, playerElement, classRequest ) {			
		// If the swarm transport is enabled add mw.SwarmTransport to the request.   
		if( mw.getConfig( 'enableSwarmTransport' ) ) {
			if( $j.inArray( 'mw.SwarmTransport', classRequest ) == -1 )  {
				classRequest.push( 'mw.SwarmTransport' );
			}
		}
	});		
})( window.mw );
