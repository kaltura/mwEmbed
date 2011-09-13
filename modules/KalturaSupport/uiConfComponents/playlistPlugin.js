( function( mw, $ ) {

window.playlistPlugin = true;

$( mw ).bind( 'newEmbedPlayerEvent', function( event, embedPlayer ){
	$( embedPlayer ).bind( 'KalturaSupport_CheckUiConf', function( event, $uiConf, callback ){
		// Check if playlist is enabled:
		if( embedPlayer.getKalturaConfig( 'playlistAPI', 'plugin' ) ){
			//debugger;
			// Call playlist handler
			mw.load( [ 'EmbedPlayer', 'Playlist', 'KalturaPlaylist' ], function(){
				// Quick non-ui conf check for layout mode 
				// @@TOOD we can fix this now!
				var layout = ( $j( widgetTarget ).width() > $j( widgetTarget ).height() ) 
								? 'horizontal' : 'vertical';
				$j( '#' + widgetTarget.id ).playlist({
					'layout': layout,
					'titleHeight' : 0 // Kaltura playlist don't include the title ontop of the video
				}); 
				callback();
			});
		}
		callback();
	});
});

})( window.mw, jQuery );