( function( mw, $ ) {
	// 	Check for the Title 
	$( mw ).bind( 'newEmbedPlayerEvent', function( event, embedPlayer ){
		$( embedPlayer ).bind( 'KalturaSupport_CheckUiConf', function( event, $uiConf, callback ){
			// Check for Titles: 
			if( $uiConf.find( '#TopTitleScreen' ).length ){
				// Bind changeMedia to update title  
				window.titleLayout( embedPlayer, $uiConf.find( '#TopTitleScreen' ) );
			}
			// Continue regardless of title is found or not
			callback();
		});
	});
	
	// xxx can be removed once we move to RL
	window.titleLayout = function( embedPlayer, $titleConfig ){
		var titleScreenHeight = $titleConfig.attr( 'height' );
		
		function doTitleLayout(){
			// Add bindings
			$( embedPlayer ).bind( "playerReady", updatePlayerLayout);

			$( embedPlayer ).bind( "onResizePlayer", updatePlayerLayout);
			
			// Add title div to interface:
			$( embedPlayer ).bind("playerReady", function(){
				embedPlayer.$interface.find('.titleContainer').remove();
				embedPlayer.$interface.prepend(
					$('<div />')
						.addClass('titleContainer')
						.html(
							getTitleBox()
						)
				);
			});
		}
		function getTitleBox(){
			var titleLayout = new mw.KLayout({
				'$layoutBox' : $titleConfig,
				'embedPlayer' : embedPlayer
			});
			return titleLayout.getLayout();

		}
		function updatePlayerLayout(){
			var $vid = $( embedPlayer.getPlayerElement() );
			if( $vid.length ){		
				// add space for the title: 
				$vid
				.css({
					'height' : ( $vid.height() - titleScreenHeight ) + 'px', 
					'top' : titleScreenHeight + 'px'
				});						
			} else {
				$( '#' + embedPlayer.id).css( {
					'height' : $( '#' + embedPlayer.id).height() - titleScreenHeight  + 'px', 
					'width' : $( '#' + embedPlayer.id).width() + 'px'
				});
				var oldTop = embedPlayer.$interface.find('.play-btn-large').css('top');
				embedPlayer.$interface
					.find('.play-btn-large')
					.css('top', parseInt( oldTop ) - .5 * titleScreenHeight );
			}
		};		
		// once all functions are defined call the doTitleLayout
		doTitleLayout();
	};
	
})( window.mw, jQuery );