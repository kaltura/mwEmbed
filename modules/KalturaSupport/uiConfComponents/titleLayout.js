( function( mw, $ ) {"use strict";
	// 	Check for the Title 
	$( mw ).bind( 'newEmbedPlayerEvent', function( event, embedPlayer ){
		$( embedPlayer ).bind( 'KalturaSupport_CheckUiConf', function( event, $uiConf, callback ){
			// Check for Titles: 
			if( embedPlayer.isPluginEnabled( 'TopTitleScreen' ) ){
				// Bind changeMedia to update title  
				window.titleLayout( embedPlayer );
			}
			// Continue regardless of title is found or not
			callback();
		});
	});
	
	// xxx can be removed once we move to RL
	window.titleLayout = function( embedPlayer ){
		
		var belowPlayer = embedPlayer.$uiConf.find( '#controlsHolder' ).next( '#TopTitleScreen' ).length;
		
		var doTitleLayout = function() {
			// unbind any old bindings: 
			$( embedPlayer ).unbind( ".titleLayout" );
			
			// Add title div to interface:
			$( embedPlayer ).bind("playerReady.titleLayout", function(){
				
				var $titleContainerDiv = $('<div />')
				.addClass('titleContainer')
				.html(
					getTitleBox()
				)
				.data('includeinlayout', true);
				
				embedPlayer.$interface.parent().find('.titleContainer').remove();
				if( belowPlayer ){
					embedPlayer.$interface.find('#videoHolder').after(
						$titleContainerDiv
					);
				}else { 
					embedPlayer.$interface.prepend(
						$titleContainerDiv
					);
				}
				
				// TODO: we should bind to "buildLayout" event and add plugin layout there
				// so that we will only have one call to updateLayout once all plugins finished loaded
				embedPlayer.updateLayout();
			});
		};
		
		var getTitleBox = function(){
			var $titleConfig = embedPlayer.$uiConf.find('#TopTitleScreen');
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
		// Once all functions are defined call the doTitleLayout
		doTitleLayout();
	};
	
})( window.mw, window.jQuery );