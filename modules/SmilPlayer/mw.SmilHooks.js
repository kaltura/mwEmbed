
// Define the SmilHooks object
mw.SmilHooks = {};

// Add the smil player to available player types: 
$j( mw ).bind( 'EmbedPlayerManagerReady', function( event ) {			
	
	// Add the swarmTransport playerType	
	mw.EmbedTypes.players.defaultPlayers[ 'application/smil' ] = [ 'Smil' ];
	
	// Build the swarm Transport "player"
	var smilMediaPlayer = new mediaPlayer( 'smilPlayer', [ 'application/smil' ], 'Smil' );
	
	// Add the swarmTransport "player"
	mw.EmbedTypes.players.addPlayer( smilMediaPlayer );

} );		

// Tell embedPlayer not to wait for height / width metadata in cases of smil documents
$j( mw ).bind( 'addElementWaitForMetaEvent', function( event, waitForMetaObject ) {
	if( mw.CheckElementForSMIL(  waitForMetaObject[ 'playerElement' ] ) ){
		waitForMetaObject[ 'waitForMeta' ] = false;
		return false;
	}
});

// Bind the smil check for sources
$j( mw ).bind( 'newEmbedPlayerEvent', function( event, swapedPlayerId ) {
	// Setup local reference to embedPlayer interface
	var embedPlayer = $j( '#' + swapedPlayerId ).get(0);
									
	// Setup the "embedCode" binding to swap in an updated url
	$j( embedPlayer ).bind( 'checkPlayerSourcesEvent', function( event, callback ) {
		mw.log( " smil enter checkPlayerSources" );
		// Get the first smil source: 
		mw.log( "Source is: " + embedPlayer.mediaElement.getSources( 'application/smil' )[0].getSrc() );
		embedPlayer.smil = new mw.Smil( embedPlayer );
		
		// Load the smil url as part of "source check"
		embedPlayer.smil.loadFromUrl(  embedPlayer.mediaElement.getSources( 'application/smil' )[0].getSrc(), function(){
			callback(); 
		});
	} );
});

