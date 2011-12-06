( function( mw, $ ) {
	// 	Check for the Title 
	$( mw ).bind( 'newEmbedPlayerEvent', function( event, embedPlayer ){
		$( embedPlayer ).bind( 'KalturaSupport_CheckUiConf', function( event, $uiConf, callback ){
			
			// If native controls don't show the title
			if( embedPlayer.useNativePlayerControls() ) {
				callback();
				return ;
			}

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
			// unbind any old bindings: 
			$( embedPlayer ).unbind( ".titleLayout" );
			
			// Add bindings
			$( embedPlayer ).bind( "playerReady.titleLayout", function(){
				updatePlayerLayout();
			});

			$( embedPlayer ).bind( "onResizePlayer.titleLayout", updatePlayerLayout);
			
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
			// add space for the title: 
			$vid
			.css({
				'position' : 'absolute',
				'height' : ( $vid.height() - titleScreenHeight ) + 'px', 
				'top' : titleScreenHeight + 'px'
			});
			embedPlayer.$interface.find(".play-btn-large").css({
				'top' : parseInt( ( $vid.height() + parseInt(titleScreenHeight ) ) / 2 )  + 'px'
			});
		};		
		// Once all functions are defined call the doTitleLayout
		doTitleLayout();
	};
	
})( window.mw, jQuery );