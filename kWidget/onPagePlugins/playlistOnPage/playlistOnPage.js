kWidget.addReadyCallback( function( playerId ){
	var kdp = document.getElementById(playerId);
	//var $ 	= kWidget.getJQuery();
	var addOnce = false;
	var genClipListId = 'k-clipList-' + playerId;
	// remove any old genClipListId:
	$('#' + genClipListId ).remove();
	kdp.kBind( "changeMedia.onPagePlaylist", function(){
		// todo highlight the active clip
	});
	
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
		var isVertical = ( kdp.evaluate( '{playlistOnPage.layout}' ) == 'vertical' );
		if( isVertical ){
			$clipListTarget.addClass( 'k-vertical' );
			// Give player height if dynamically added: 
			if( !clipListId ){
				// if adding in after the player make sure the player is float left so 
				// the playlist shows up after:
				$(kdp).css('float', 'left');
				$clipListTarget
				.css( {
					'float' : 'left',
					'height' : $( kdp ).height() + 'px',
					'width' : $( kdp ).width() + 'px'
				});
			}
		} else {
			// horizontal layout
			// Give it player width if dynamically added: 
			if( !clipListId ){
				$clipListTarget.css( {
					'width' : $( kdp ).width() + 'px'
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
					.attr({
						'src' : clip.thumbnailUrl
					}),
					
					$('<h3 />')
					.addClass( 'k-title' )
					.text( clip.name ),
					
					$('<p />')
					.addClass( 'k-description' )
					.text( ( clip.description == null )? '': clip.description )
					
				)
				.click(function(){
					kdp.setKDPAttribute("playlistAPI.dataProvider", "selectedIndex", inx );
				}).hover(function(){
					$( this ).addClass( 'k-active' );
				},
				function(){
					$( this ).removeClass( 'k-active' );
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
		// Add scrolling carousel to clip list:
		$clipListTarget.find( '.k-carousel' ).css( {
			'width' :$clipListTarget.width(),
		}).jCarouselLite({
			btnNext: ".k-next",
			btnPrev: ".k-prev",
			visible: 3,
			mouseWheel: true,
			vertical: isVertical
		});
		
	});
});