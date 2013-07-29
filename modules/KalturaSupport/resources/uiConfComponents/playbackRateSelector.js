
/**
 * Enables a playback speed selector
 */
( function( mw, $ ) { "use strict";
	mw.addKalturaPlugin( 'playbackRateSelector', function( embedPlayer, callback ) {
		var prsPlugin = {
			'getConfig': function( attr ){
				return embedPlayer.getKalturaConfig('playbackRateSelector', attr );
			},
			'currentSpeed': embedPlayer.getKalturaConfig('playbackRateSelector', 'defaultSpeed'),
			'getMenu': function(){
				var $speedMenu = $('<ul />');
				var speedSet = prsPlugin.getConfig( 'speeds' ).split( ',' );
				// Local function to closure the "source" variable scope:
				$.each( speedSet, function( inx, speedFloat ){
					var icon = ( prsPlugin.currentSpeed == speedFloat ) ? 'bullet' : 'radio-on';
					$speedMenu.append(
						$.getLineItem( speedFloat + 'x', icon,function(){
							var vid = embedPlayer.getPlayerElement();
							vid.playbackRate = speedFloat;
							prsPlugin.currentSpeed = speedFloat;
							embedPlayer.getInterface()
								.find( '.speed-switch' ).text( prsPlugin.currentSpeed + 'x' );
							
							// update menu
							embedPlayer.getInterface()
							.find( '.swMenuContainer').find('li').each(function(){
								var $icon = $(this).find('.ui-icon');
								$icon.removeClass( 'ui-icon-bullet' ).addClass( 'ui-icon-radio-on' );
								if( $(this).text() == prsPlugin.currentSpeed + 'x' ){
									$icon.removeClass('ui-icon-radio-on').addClass( 'ui-icon-bullet')
								}
							}) 
							
							
						})
					);
				})
				return $speedMenu;
			},
			'getSpeedTitle':function(){
				return prsPlugin.currentSpeed + 'x';
			},
			'component':{
				'w' : 50,
				'o' : function( ctrlObj ){
					var $menuContainer = $('<div />').addClass( 'swMenuContainer' ).hide();
					ctrlObj.embedPlayer.getInterface().append(
							$menuContainer
					)
					// Stream switching widget ( display the current selected stream text )
					return $( '<div />' )
						.addClass('ui-widget speed-switch')
						.css('height', ctrlObj.getHeight() )
						.append(
							prsPlugin.getSpeedTitle()
						).menu( {
							'content' : prsPlugin.getMenu(),
							'zindex' : mw.getConfig( 'EmbedPlayer.FullScreenZIndex' ) + 2,
							'keepPosition' : true,
							'targetMenuContainer' : $menuContainer,
							'width' : 160,
							'showSpeed': 0,
							'createMenuCallback' : function(){
								var $interface = ctrlObj.embedPlayer.getInterface();
								var $sw = $interface.find( '.speed-switch' );
								var $swMenuContainer = $interface.find('.swMenuContainer');
								var height = $swMenuContainer.find( 'li' ).length * 24;
								if( height > $interface.height() - 30 ){
									height = $interface.height() - 30;
								}
								// Position from top ( why we can't use bottom here )
								var top = $interface.height() - height - ctrlObj.getHeight() - 8;
								$menuContainer.css({
									'position' : 'absolute',
									'left': $sw[0].offsetLeft-30,
									'top' : top,
									'bottom': ctrlObj.getHeight(),
									'height' : height
								})
								ctrlObj.embedPlayer.disableComponentsHover();
							},
							'closeMenuCallback' : function(){
								ctrlObj.embedPlayer.restoreComponentsHover()
							}
						} );
				}
			}
		};
		// If the plugin is enabled add binding for layoutBuilder append: 
		$(embedPlayer).bind('addControlBarComponent.playbackRateSelector', function(){
			embedPlayer.layoutBuilder.supportedComponents[ 'playbackRateSelector' ] = true;
			embedPlayer.layoutBuilder.components['playbackRateSelector'] = prsPlugin.component;
		});
		callback();
	});

})( window.mw, window.jQuery );