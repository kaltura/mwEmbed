/**
 * Adds uiConf based playlist support
 */
( function( mw, $ ) {
	
// XXX RL17 remove
window.playlistPlugin = true;

$( mw ).bind( 'newEmbedPlayerEvent', function( event, embedPlayer ){
	$( embedPlayer ).bind( 'KalturaSupport_CheckUiConf', function( event, $uiConf, callback ){
		// special iframe playlist target:  ( @@todo generalize the target system ) 
		var $playlist = $('#playlistContainer');
		// Check if playlist is enabled:
		if( embedPlayer.getKalturaConfig( 'playlistAPI', 'plugin' ) 
				&&
			// Make sure the target is present and not already hosting a playlist
			( $playlist.get(0) && ! $playlist.get(0).playlist )
		){
			// Call playlist handler
			mw.load( [ 'EmbedPlayer', 'Playlist', 'KalturaPlaylist' ], function(){
				//  $uiConf disappears in this scope: maybe a timeout in mw.load 
				// XXX RL17 re-check this
				var $uiConf = embedPlayer.$uiConf;

				// Check ui-conf for horizontal or vertical playlist
				// Were know if the playlist is vertical or horizontal based on the parent element of the #playlist
				// vbox - vertical | hbox - horizontal
				var playlistParentNodeName = $uiConf.find("#playlist").parent().get(0).nodeName.toLowerCase();
				var layout = (playlistParentNodeName == 'vbox') ? 'vertical' : 'horizontal';
				
				// XXX hard coded for now think about a better way to get at this info:
				$playlist.playlist({
					'layout': layout,
					'embedPlayer' : embedPlayer
				}); 
				callback();
			});
		} else {
			// if playlist is not enabled continue player build out
			callback();
		}
	});
});

})( window.mw, jQuery );