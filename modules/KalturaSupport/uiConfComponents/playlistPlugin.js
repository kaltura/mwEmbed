/**
 * Adds uiConf based playlist support
 */
( function( mw, $ ) {
	
// XXX RL17 remove
window.playlistPlugin = true;

$( mw ).bind( 'newEmbedPlayerEvent', function( event, embedPlayer ){
	$( embedPlayer ).bind( 'KalturaSupport_CheckUiConf', function( event, $uiConf, callback ){
		// Check if playlist is enabled:
		if( embedPlayer.getKalturaConfig( 'playlistAPI', 'plugin' ) ){
			// Call playlist handler
			mw.load( [ 'EmbedPlayer', 'Playlist', 'KalturaPlaylist' ], function(){
				//  $uiConf disappears in this scope: maybe a timeout in mw.load 
				// XXX RL17 re-check this
				var $uiConf = embedPlayer.$uiConf;
				// Check ui-conf for horizontal or vertical playlist
				var layout = ( $uiConf.find('#playlistHolder').attr('width') != '100%' ) 
								? 'horizontal' : 'vertical';
				$(embedPlayer).parent().playlist({
					'layout': layout,
					'embedPlayer' : embedPlayer
				}); 
				callback();
			});
		}
		callback();
	});
});

})( window.mw, jQuery );