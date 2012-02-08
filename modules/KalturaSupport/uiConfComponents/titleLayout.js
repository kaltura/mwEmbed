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
				window.titleLayout( embedPlayer );
			}
			// Continue regardless of title is found or not
			callback();
		});
	});
	
	// xxx can be removed once we move to RL
	window.titleLayout = function( embedPlayer ){
		var $titleConfig = embedPlayer.$uiConf.find( '#TopTitleScreen' );
		var titleScreenHeight = $titleConfig.attr( 'height' );
		
		var belowPlayer = embedPlayer.$uiConf.find( '#controlsHolder' ).next( '#TopTitleScreen' ).length
		
		function doTitleLayout(){
			// unbind any old bindings: 
			$( embedPlayer ).unbind( ".titleLayout" );
			
			// Add bindings
			$( embedPlayer ).bind( "onResizePlayer.titleLayout", updatePlayerLayout);
			
			// Add title div to interface:
			$( embedPlayer ).bind("playerReady.titleLayout", function(){
				var $titleContainerDiv = $('<div />')
				.addClass('titleContainer')
				.html(
					getTitleBox()
				);
				embedPlayer.$interface.parent().find('.titleContainer').remove();
				if( belowPlayer ){
					embedPlayer.$interface.after(
						$titleContainerDiv
					);
				}else { 
					embedPlayer.$interface.prepend(
						$titleContainerDiv
					);
				}
				updatePlayerLayout();
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
			var vidHeight;
			// Check if we are using flash ( don't move the player element )
			if( embedPlayer.instanceOf != 'Native' || $vid.length == 0 ){
				$vid = $();
				vidHeight = embedPlayer.getHeight();
			} else {
				vidHeight = ( $vid.height() - titleScreenHeight );
			}
			// add space for the title: 
			$vid
			.css({
				'position' : 'absolute',
				'height' :vidHeight
			});
			if( !belowPlayer ){
				$vid.css( 'top', titleScreenHeight + 'px' );
				embedPlayer.$interface.find(".play-btn-large").css({
					'top' : parseInt( ( vidHeight + parseInt( titleScreenHeight ) ) / 2 )  + 'px'
				});
			} else {
				$( embedPlayer ).css('height', vidHeight )
				embedPlayer.$interface.css( 'height', vidHeight +  embedPlayer.controlBuilder.getHeight() );
				embedPlayer.$interface.parent().find( '.titleContainer' ).css({
					'position': 'absolute',
					'top' : vidHeight + embedPlayer.controlBuilder.getHeight()
				})
				var butonHeight = embedPlayer.controlBuilder.getComponentHeight( 'playButtonLarge' );
				embedPlayer.$interface.find(".play-btn-large").css({
					'top' : parseInt( ( vidHeight - butonHeight ) / 2 )  + 'px'
				});
			}
		};
		// Once all functions are defined call the doTitleLayout
		doTitleLayout();
	};
	
})( window.mw, jQuery );