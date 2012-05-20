( function( mw, $ ) { "use strict";
	// 	Check for the Title 
	$( mw ).bind( 'newEmbedPlayerEvent', function( event, embedPlayer ){
		$( embedPlayer ).bind( 'KalturaSupport_CheckUiConf', function( event, $uiConf, callback ){
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
		
		var doTitleLayout = function(){
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
		};
		var getTitleBox = function(){
			var titleLayout = new mw.KLayout({
				'$layoutBox' : $titleConfig,
				'embedPlayer' : embedPlayer
			});
			var $returnLayout = titleLayout.getLayout();
			if ( $returnLayout.find('span').text() == 'null' ) {
				$returnLayout.find('span').text('');
			}
			return $returnLayout;
		};
		var updatePlayerLayout = function(){
			var $vid = $( '#' + embedPlayer.pid + ',.playerPoster,#' + embedPlayer.id );
			var vidHeight = $vid.height();
			if( $vid.length == 0 ){
				$vid = $();
				vidHeight = embedPlayer.getHeight();
			} else {
				vidHeight = embedPlayer.$interface.height() - titleScreenHeight;
				if( !embedPlayer.controlBuilder.isOverlayControls() ){
					vidHeight = vidHeight - embedPlayer.controlBuilder.height; 
				}
			}
			var position = (mw.isIOS4()) ? 'static' : 'absolute';
			mw.log("TitleLayout:: update height: " + titleScreenHeight );
			// add space for the title: 
			$vid
			.css({
				'position' : position,
				'height' : vidHeight
			});
			if( !belowPlayer ){
				mw.log("TitleLayout:: update top: " + titleScreenHeight );
				$vid.css( 'top', titleScreenHeight + 'px' );
			} else {
				// $( embedPlayer ).css('height', vidHeight )
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
	
})( window.mw, window.jQuery );