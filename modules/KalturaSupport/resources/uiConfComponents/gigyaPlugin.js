/*
 * This is not a real gigya plugin. We don't have one for HTML5 player.
 * This is only use to add iframe share screen
 */
( function( mw, $ ) {"use strict";
	mw.addKalturaPlugin('gigya', function( embedPlayer, callback ){

		// Bind to control bar build out
		embedPlayer.bindHelper( 'addControlBarComponent', function(event, controlBar ){
					var $shareButton = {
						'w': 28,
						'o': function( ctrlObj ) {

							var $textButton = $( '<div />' )
								.attr( 'title', gM( 'mwe-embedplayer-share' ) )
								.addClass( "ui-state-default ui-corner-all ui-icon_link rButton" )
								.append( $( '<span />' ).addClass( "ui-icon ui-icon-link" ) )
								.buttonHover()
								.click(function() {
									controlBar.displayMenuOverlay(
										controlBar.getShare()
									);
									embedPlayer.triggerHelper( 'showShareEvent' );
								});

							return $textButton;
						}
					};

					// Add the button to control bar
					controlBar.supportedComponents['shareIframe'] = true;
					controlBar.components['shareIframe'] = $shareButton;

		});

		// Continue regardless of title is found or not
		callback();
	});

})( window.mw, window.jQuery );