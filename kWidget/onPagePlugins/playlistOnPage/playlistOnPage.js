kWidget.addReadyCallback( function( playerId ){
	var kdp = document.getElementById(playerId);
	//var $ 	= kWidget.getJQuery();
	var addOnce = false;
	var genClipListId = 'k-clipList-' + playerId;
	// remove any old genClipListId:
	$('#' + genClipListId ).remove();

	function getClipListTarget(){
		// check for generated id: 
		if( $('#' + genClipListId ).length ){
			return  $('#' + genClipListId );
		}
		var clipListId = kdp.evaluate('{playlistOnPage.clipListTargetId}' );
		// check for clip target:
		if( clipListId && $('#' + clipListId ).length ){
			return  $('#' + clipListId)
		}
		// Generate a new clip target ( if none was found )
		return $('<div />').attr('id', genClipListId ).insertAfter(  $( '#' + playerId ) )
	}
	function activateEntry( activeEntryId ){
		var $carousel = getClipListTarget().find( '.k-carousel' );
		// highlight the active clip ( make sure only one clip is highlighted )
		var $clipList = getClipListTarget().find( 'ul li' );
		if( $clipList.length && activeEntryId ){
			$clipList.each( function( inx, clipLi ){
				// kdp moves entryId to .entryId in playlist data provider ( not a db mapping )
				var entryMeta =  $( clipLi ).data( 'entryMeta' );
				var clipEntryId = entryMeta.entryId || entryMeta.id;
				if( clipEntryId == activeEntryId ){
					$( clipLi ).addClass( 'k-active' ).data( 'activeEntry', true );
					// scroll to the target entry:
					$carousel[0].jCarouselLiteGo( inx );
				} else {
					$( clipLi ).removeClass( 'k-active' ).data('activeEntry', false)
				}
			});
		}
	}
	kdp.kBind( "changeMedia.onPagePlaylist", function( clip ){
		activateEntry( clip.entryId );
	});

	kdp.kBind( "mediaReady.onPagePlaylist", function(){
		if( addOnce ){
			return ;
		}
		var clipListId = kdp.evaluate('{playlistOnPage.clipListTargetId}' );
		addOnce = true;
		var playlistObject = kdp.evaluate("{playlistAPI.dataProvider}");
		if( !playlistObject || !playlistObject.content ){
			kWidget.log("Error:: playlistOnPage: no playlist object found")
		}
		// check for a target
		$clipListTarget = getClipListTarget();
		// Add a base style class: 
		$clipListTarget.addClass( 'kWidget-clip-list' );

		// add layout mode: 
		var layoutMode = kdp.evaluate( '{playlistOnPage.layoutMode}' ) || 'horizontal';
		$clipListTarget.addClass( 'k-' + layoutMode );
		// check layout mode:

		var isVertical = ( kdp.evaluate( '{playlistOnPage.layoutMode}' ) == 'vertical' );
		if( isVertical ){
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
				$('<li />')
				.data( {
					'entryMeta': clip,
					'index' : inx
				})
				.append(
					$('<img />')
					.attr({
						'src' : clip.thumbnailUrl
					}),
					$('<div />')
					.addClass( 'k-clip-desc' )
					.append(
						$('<h3 />')
						.addClass( 'k-title' )
						.text( clip.name ),
						
						$('<p />')
						.addClass( 'k-description' )
						.text( ( clip.description == null ) ? '': clip.description )
					)
				)
				.click(function(){
					kdp.setKDPAttribute("playlistAPI.dataProvider", "selectedIndex", inx );
				}).hover(function(){
					$( this ).addClass( 'k-active' );
				},
				function(){
					// only remove if not the active entry:
					if( !$( this ).data( 'activeEntry' ) ){
						$( this ).removeClass( 'k-active' );
					}
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
		// Add scrolling carousel to clip list ( once dom sizes are up-to-date ) 
		$clipListTarget.find( '.k-carousel' ).jCarouselLite({
			btnNext: ".k-next",
			btnPrev: ".k-prev",
			visible: 3,
			mouseWheel: true,
			vertical: isVertical
		});

		// activate entry:
		activateEntry(  kdp.evaluate( '{mediaProxy.entry.id}' ) );
	});
});