( function( mw, $ ) { "use strict";

	var watermarkPlugin = function( embedPlayer, $watermarkConf ){
		// Make sure we have a watermark url:
		if( !$watermarkConf.attr('watermarkPath') ){
			return false;
		}
		// Draw the watermark to the player
		var getCss = function( $watermarkConf ){
			var watermarkCss = {
				'position' : 'absolute',
				'z-index':1
			};

			switch( $watermarkConf.attr( 'watermarkPosition' ) ){
				case 'topRight':
					watermarkCss.top = watermarkCss.right = 0;
					break;
				case 'topLeft':
					watermarkCss.top = watermarkCss.left = 0;
					break;
				case 'bottomRight':
					watermarkCss.right = watermarkCss.bottom = 0;
					break;
				case 'bottomLeft':
					watermarkCss.left = watermarkCss.bottom = 0;
					break;
			}
			watermarkCss.padding = $watermarkConf.attr( 'padding') + 'px';
			return watermarkCss;
		};
		// remove any old watermarks: 
		embedPlayer.getVideoHolder().find( '.k-watermark-plugin' ).remove();
		
		var watermarkCss = getCss( $watermarkConf );
		embedPlayer.getVideoHolder().append(
			$('<span />')
			.addClass('k-watermark-plugin')
			.css( watermarkCss )
			.append(
				$('<a />').attr({
					'href' : $watermarkConf.attr('watermarkClickPath'),
					'target' : '_blank'
				})
				.click( function(){
					embedPlayer.sendNotification( 'watermarkClick' );
					return true;  
				})
				.append(
					$('<img />').attr({
						'src': $watermarkConf.attr('watermarkPath'),
						'id' : embedPlayer.id + '_' + $watermarkConf.attr('id')
					})
				)
			)
		);
	};

	// Bind the KalturaWatermark where the uiconf includes the Kaltura Watermark
	mw.addKalturaPlugin( 'watermark', function(embedPlayer, callback ){
		// Check if the uiConf xml includes a watermark 'tag' ( not a normal plugin )
		var bindPostFix = '.watermark';
		var $uiConf =  embedPlayer.$uiConf;
		// remove any old watermark bindings:
		embedPlayer.unbindHelper( bindPostFix );

		var $watermarkConf = $uiConf.find( 'watermark' );
		// check if the watermark is a descendant of controlsHolder
		if( $uiConf.find('#controlsHolder watermark').length ){
			// Turn off default attribution
			mw.setConfig('EmbedPlayer.AttributionButton', false);
			// wait for addToContolBar time:
			embedPlayer.bindHelper( 'addControlBarComponent' + bindPostFix, function(event, controlBar ){
				controlBar.supportedComponents['controlBarWatermark'] = true;
				controlBar.components['controlBarWatermark'] = {
						'w': 28,
						'o': function( ctrlObj ) {
							var $watermarkButton = $('<div />')
							.addClass('rButton k-watermark-plugin')
							.css({
								'top' : '0px'
							})
							.append(
								$('<a />').attr({
									'href' : $watermarkConf.attr('watermarkClickPath'),
									'target' : '_blank'
								}).append(
									$('<img />').attr({
										'src': $watermarkConf.attr('watermarkPath'),
										'id' : embedPlayer.id + '_' + $watermarkConf.attr('id')
									})
									.css({
										'right': '1px',
										'position': 'absolute'
									})

								)
							)
						return $watermarkButton;
					}
				};
			});
			// Center image once control object build out is done:
			$(embedPlayer).bind('controlBarBuildDone' + bindPostFix, function(){
				embedPlayer.$interface.find( '.control-bar' ).find( '.k-watermark-plugin img' ).load(function(){
					var cHeight = embedPlayer.controlBuilder.getHeight();
					// check  aspect size:
					if( $( this ).height() < 16 && parseInt( $( this ).css('top') ) == -2 ){
						 $( this ).css( 'top',  ( cHeight - (  cHeight - ( $( this ).height() / 2)  ) ) );
					}
				})
			})
		} else {
			// Wait for the player to be ready
			embedPlayer.bindHelper( 'playerReady' + bindPostFix, function(){
				// Run the watermark plugin code
				watermarkPlugin( embedPlayer, $( $uiConf ).find( 'watermark' ) );
			});
			// Set up ad bindings to hide / re show watermark:
			embedPlayer.bindHelper( 'AdSupport_StartAdPlayback' + bindPostFix, function(){
				embedPlayer.$interface.find('.k-watermark-plugin').hide();
			});
			embedPlayer.bindHelper( 'AdSupport_EndAdPlayback' + bindPostFix, function(){
				embedPlayer.$interface.find('.k-watermark-plugin').show();
			});
			// TODO on player resize always put the watermark where the video is.
		}
		// Continue player build out
		callback();
	});

})( window.mw, jQuery );
