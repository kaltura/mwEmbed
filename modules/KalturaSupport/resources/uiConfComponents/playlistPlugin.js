/**
 * Adds uiConf based playlist support
 * 
 * @dependencies
 * 		"mw.EmbedPlayer", "mw.Playlist", 
 */
( function( mw, $ ) { "use strict";

// Setup the Playlist source handler binding: 
$( mw ).bind( "PlaylistGetSourceHandler", function( event, playlist ){
	var $playlistTarget = $( '#' + playlist.id );
	var embedPlayer = playlist.embedPlayer;
	var kplUrl0, playlistConfig;
	
	// Check if we are dealing with a kaltura player: 
	if( !embedPlayer  ){
		mw.log("Error: playlist source handler without embedPlayer");
	} else {
		playlistConfig = {
			'uiconf_id' : embedPlayer.kuiconfid,
			'widget_id' : embedPlayer.kwidgetid
		};
		kplUrl0 = embedPlayer.getKalturaConfig( 'playlistAPI', 'kpl0Url' )
	}
	// No kpl0Url, not a kaltura playlist
	if( !kplUrl0 ){
		return ;
	} 
	var plId = new mw.Uri ( kplUrl0 ).query['playlist_id'];
	// If the url has a partner_id and executeplaylist in its url assume its a "kaltura services playlist"
	if( embedPlayer.kalturaPlaylistData || plId && new mw.Uri( kplUrl0 ).query['partner_id'] && kplUrl0.indexOf('executeplaylist') != -1 ){
		playlistConfig.playlist_id = plId;
		playlist.sourceHandler = new mw.PlaylistHandlerKaltura( playlist, playlistConfig );
		return ;
	}
	// must be a media rss url:
	if( mw.isUrl( kplUrl0 ) ){
		playlist.src = kplUrl0;
		playlist.sourceHandler = new mw.PlaylistHandlerKalturaRss( playlist, playlistConfig );
		return ;
	}
	mw.log("Error playlist source not found");
});

// Check for kaltura playlist: 
$( mw ).bind( 'EmbedPlayerNewPlayer', function( event, embedPlayer ){
	$( embedPlayer ).bind( 'KalturaSupport_CheckUiConf', function( event, $uiConf, callback ){
		// Special iframe playlist target:  ( @@todo generalize the target system )
		var $container = $('#container');
		// Check if playlist is enabled:
		if( embedPlayer.isPluginEnabled( 'playlistAPI' ) ){
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
			// Add playlist container and Init playlist
			if( ! $('#playlistContainer').length ) {
				if( layout == 'horizontal' ) {
					$('#playerContainer').before( $playlist );
				} else {
					$('#playerContainer').after( $playlist );
				}

				$playlist.playlist({
					'layout': layout,
					'embedPlayer' : embedPlayer
				});
			}
			callback();
		} else {
			// if playlist is not enabled continue player build out
			callback();
		}
	});
});

})( window.mw, jQuery );