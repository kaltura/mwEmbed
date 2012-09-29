kWidget.addReadyCallback( function( playerId ){
	var kdp = document.getElementById(playerId);
	//var $ 	= kWidget.getJQuery();
	var addOnce = false;
	var genClipListId = 'k-clipList-' + playerId;
	// remove any old genClipListId:
	$('#' + genClipListId ).remove();
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
				.attr('id', genClipListId ).insertAfter(  $( '#' + playerId ) )

		// Add a base style class: 
		$clipListTarget.addClass( 'kWidget-clip-list' );
		// check layout mode:
		var layout =kdp.evaluate( '{playlistOnPage.layout}' );
		if( layout == 'vertical' ){
			// Give player height if dynamically added: 
			if( !clipListId ){
				$clipListTarget.css( {
					'height' : $( kdp ).height() + 'px'
				});
			}
		} else {
			// horizontal layout
			// Give it player width if dynamically added: 
			if( !clipListId ){
				$clipListTarget.css( {
					'width' : $( kdp ).width() + 'px',
					'height' : '90px'
				});
			}
		}
		
		
		$clipsUl = $('<ul>').appendTo( $clipListTarget )
		.wrap( 
			$( '<div />' ).addClass('k-carousel')
		)
		
		// append all the clips
		$.each( playlistObject.content, function( inx, clip ){
			$clipsUl.append(
				$('<li />').append(
					$('<img />')
					.addClass( 'centered' )
					.attr({
						'src' : clip.thumbnailUrl
					})
				)
				.click(function(){
					kdp.setKDPAttribute("playlistAPI.dataProvider", "selectedIndex", inx );
				}).hover(function(){
					
				},
				function(){
					
				})
			)
		});
		// Add scroll buttons
		$clipListTarget.prepend(
			$( '<a />' )
			.addClass( "k-scroll k-prev" )
		)
		$clipListTarget.append(
			$( '<a />' )
			.addClass( "k-scroll k-next" )
		)
		// add scrolling carousel to clip list:
		$clipListTarget.find( '.k-carousel' ).jCarouselLite({
			btnNext: ".k-next",
			btnPrev: ".k-prev",
			mouseWheel: true
		});
		
	});
});