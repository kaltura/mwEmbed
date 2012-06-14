/**
 * Adds uiConf based playlist support
 */
( function( mw, $ ) { "use strict";
	
// XXX RL17 remove
window.playlistPlugin = true;

$( mw ).bind( 'newEmbedPlayerEvent', function( event, embedPlayer ){
	$( embedPlayer ).bind( 'KalturaSupport_CheckUiConf', function( event, $uiConf, callback ){
		// special iframe playlist target:  ( @@todo generalize the target system ) 
		var $container = $('#container');
		// Check if playlist is enabled:
		if( embedPlayer.isPluginEnabled( 'playlistAPI' ) ){
			// Call playlist handler
			mw.load( [ 'EmbedPlayer', 'Playlist', 'KalturaPlaylist' ], function(){
				//  $uiConf disappears in this scope: maybe a timeout in mw.load 
				// XXX RL17 re-check this
				var $uiConf = embedPlayer.$uiConf;
				var layout;
				// Check ui-conf for horizontal or vertical playlist
				// Were know if the playlist is vertical or horizontal based on the parent element of the #playlist
				// vbox - vertical | hbox - horizontal 
				if( $uiConf.find('#playlistHolder').length ){
					layout = ( parseInt( $uiConf.find('#playlistHolder').attr('width') ) != 100 ) ? 
								'horizontal' : 
								'vertical';
				} else {
					mw.log("Error could not determine playlist layout type ( use target size ) ");
					layout = ( $container.width() < $container.height() ) 
						? 'vertical' : 'horizontal';
				}
				
				// Create our playlist container
				var $playlist = $( '<div />' ).attr( 'id', 'playlistContainer' );
				// Add layout to cotainer class
				if( ! embedPlayer.isPluginEnabled( 'related' ) ) {
					$container.addClass( layout );
				}
				if( ! $('#playlistContainer').length ) {
					if( layout == 'horizontal' ) {
						$('#playerContainer').before( $playlist );
					} else {
						$('#playerContainer').after( $playlist );
					}
				}
				
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