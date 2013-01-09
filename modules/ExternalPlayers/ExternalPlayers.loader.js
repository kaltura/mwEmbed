( function( mw, $ ) { "use strict";
	// Add supported external players:
	$( mw ).bind('EmbedPlayerUpdateMediaPlayers', function( event, mediaPlayers ){
		var youTubePlayer = new mw.MediaPlayer( 'youTube', ['video/youtube'], 'YouTube' );
		mediaPlayers.addPlayer( youTubePlayer );
		mediaPlayers.defaultPlayers['video/youtube'] = [ 'YouTube' ];
	});

} )( window.mw, window.jQuery );