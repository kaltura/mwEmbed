kWidget.addReadyCallback( function( playerId ){
	var kdp = document.getElementById(playerId);
	//var $ 	= kWidget.getJQuery();
	var addOnce = false;
	kdp.kBind( "mediaReady.onPagePlaylist", function(){
		if( addOnce ){
			return ;
		}
		addOnce = true;
		var playlistObject = kdp.evaluate("{playlistAPI.dataProvider}");
		if( !playlistObject || !playlistObject.content ){
			kWidget.log("Error:: playlistOnPage: no playlist object found")
		}
		// check for a target
		var clipListId = kdp.evaluate('{playlistOnPage.clipListTargetId}' );
		$clipListTarget = clipListId ? $('#' + clipListId) : $('<div />')
				.attr('id', 'clipList_' + playerId ).insertAfter(  $( '#' + playerId ) )

				// Add a base style class: 
		$clipListTarget.addClass( 'kWidget-clip-list' ).css("float", "left")
		// TODO add scroll buttons
		
		$clipsUl = $('<ul>').appendTo( $clipListTarget );
		
		// append all the clips
		$.each( playlistObject.content, function( inx, clip ){
			$clipsUl.append(
				$('<li />').append(
					$('<img />').attr({
						'src' : clip.thumbnailUrl
					}),
					$('<span />').text( clip.description )
				)
				.css('cursor', 'pointer')
				.click(function(){
					kdp.setKDPAttribute("playlistAPI.dataProvider", "selectedIndex", inx );
				})
			)
		});
	});
});