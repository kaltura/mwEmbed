/**
 * Add embedPlayer hooks for smil 
 */


// Add the smil player to available player types: 
$j( mw ).bind( 'EmbedPlayerManagerReady', function( event ) {			
	
	// Add the swarmTransport playerType	
	mw.EmbedTypes.players.defaultPlayers[ 'application/smil' ] = [ 'Smil' ];
	
	// Build the swarm Transport "player"
	var smilMediaPlayer = new mediaPlayer( 'smilPlayer', [ 'application/smil' ], 'Smil' );
	
	// Add the swarmTransport "player"
	mw.EmbedTypes.players.addPlayer( smilMediaPlayer );
				
} );		