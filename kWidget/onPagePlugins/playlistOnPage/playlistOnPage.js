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
		
		
		$clipsUl = $('<ul>').appendTo( $clipListTarget );
		
		// append all the clips
		$.each( playlistObject.content, function( inx, clip ){
			$clipsUl.append(
				$('<li />').append(
					$('<img />').attr({
						'src' : clip.thumbnailUrl
					})
					.css({
						'width': '100px'
					}),
					$('<span />').text( clip.description )
				)
				.css('cursor', 'pointer')
				.click(function(){
					kdp.setKDPAttribute("playlistAPI.dataProvider", "selectedIndex", inx );
				})
			)
		});
		
		// add scroll buttons
		$clipListTarget.prepend(
			$( '<button />' )
				.addClass( "next .btn" )
				.text('>')
		)
		$clipListTarget.append(
			$( '<button />' )
			.addClass( "prev .btn" )
			.text('<')
		)
		// add scrolling Carousel to clip list:
		$clipListTarget.jCarouselLite({
			btnNext: ".next",
			btnPrev: ".prev"
		});
	});
});