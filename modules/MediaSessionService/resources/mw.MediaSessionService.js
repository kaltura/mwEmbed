// Scope everything in "mw" ( keeps the global namespace clean )
( function( mw, $ ) { "use strict";
	$( mw ).bind( 'EmbedPlayerNewPlayer', function( event, embedPlayer ){
		// setup override binding: 
		$( embedPlayer ).bind('SetAdClassName', function( event, className ){
			debugger;
			className = kAdsMediaSession 
		});
	});
	
	
	// the base 
	
} )( window.mw, jQuery );