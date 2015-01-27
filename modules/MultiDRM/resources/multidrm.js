/**
 * Created by itayk on 1/27/15.
 */
( function( mw, $ ) {
	"use strict";

	// Add chromecast player:
	$( mw ).bind( 'EmbedPlayerUpdateMediaPlayers' , function ( event , mediaPlayers ) {
		var multiDRMProtocols = ['video/mp4'];
		var multiDRMPlayer = new mw.MediaPlayer( 'multidrm' , multiDRMProtocols , 'MultiDRM' );
		mediaPlayers.addPlayer( multiDRMPlayer );
		// add
		$.each( multiDRMProtocols , function ( inx , mimeType ) {
			if ( mediaPlayers.defaultPlayers[ mimeType ] ) {
				mediaPlayers.defaultPlayers[ mimeType ].push( 'MultiDRM' );
				return true;
			}
			mediaPlayers.defaultPlayers[ mimeType ] = ['MultiDRM'];
		} );
	} );


} )( window.mw, window.jQuery );
