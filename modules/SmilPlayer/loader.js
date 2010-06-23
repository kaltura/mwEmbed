/*
* Loader for smilPlayer
*/
// Wrap in mw to not pollute global namespace
( function( mw ) {

	mw.addResourcePaths( {
		"mw.SmilHooks" : "mw.SmilHooks.js",
		
		"mw.Smil" : "mw.Smil.js",
		"mw.SmilLayout" : "mw.SmilLayout.js",
		"mw.SmilBody" : "mw.SmilBody.js",
		"mw.SmilBuffer" : "mw.SmilBuffer.js",
		"mw.SmilAnimate" : "mw.SmilAnimate.js",
		
		"mw.EmbedPlayerSmil" : "mw.EmbedPlayerSmil.js"
	} );
	
	// Add the mw.SmilPlayer to the embedPlayer loader:
	$j( mw ).bind( 'LoaderEmbedPlayerUpdateRequest', function( event, playerElement, resourceRequest ) {	
		var smilPlayerLibrarySet = [
		    "mw.SmilHooks",
			"mw.Smil",
			"mw.SmilLayout",
			"mw.SmilBody",
			"mw.SmilBuffer",
			"mw.SmilAnimate",
			"mw.EmbedPlayerSmil"
		]; 
			
		// Add smil library set if needed
		if( mw.CheckElementForSMIL( playerElement )  ) {				
			// If the swarm transport is enabled add mw.SwarmTransport to the request.   			
			$j.merge(resourceRequest, smilPlayerLibrarySet);
		}
	} );
	
	
	/**
	* Check if a video tag element has a smil source
	*/ 
	mw.CheckElementForSMIL = function( element ){
		if( $j( element ) .attr('type' ) == 'application/smil' ||
			( $j( element ).attr('src' ) && 
		 	$j( element ).attr('src' ).substr( -4) == 'smil' ) ) 
		 {
		 	return true;
		 }
		 var loadSmil = false;
		 $j( element ).find( 'source' ).each( function(inx, sourceElement){
			if( mw.CheckElementForSMIL( sourceElement ) ){
				loadSmil = true;
				return true;
			}			
		});	 
		return loadSmil;
	};

} )( window.mw );
