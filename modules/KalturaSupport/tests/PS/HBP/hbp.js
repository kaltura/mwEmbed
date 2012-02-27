( function( mw, $ ) {
	$( mw ).bind( 'newEmbedPlayerEvent', function( event, embedPlayer ) {
		embedPlayer.attributionbutton = false;
		mw.log("ExternalResources:: IframeCustomPluginJs1:: newEmbedPlayerEvent");
		mw.setConfig( 'EmbedPlayer.TimeDisplayWidth', 85 );
		mw.setConfig( 'EmbedPlayer.EnableOptionsMenu', false );

		$( embedPlayer ).bind( 'KalturaSupport_CheckUiConf', function( event, $uiConf, callback ) {
			var embedPlayer = this;
			var bindPostFix = '.hbpCustomSkin';
			
			embedPlayer.unbindHelper( 'playerReady' + bindPostFix );
			embedPlayer.bindHelper( 'playerReady' + bindPostFix, function() {
				window[ 'hbpSkin' ].customizeSkin( embedPlayer );
			} );
			
			embedPlayer.unbindHelper( 'onResizePlayer' + bindPostFix );
			embedPlayer.bindHelper( 'onResizePlayer' + bindPostFix, function() {
				window[ 'hbpSkin' ].customizeSkin( embedPlayer );
			} );
			
			embedPlayer.unbindHelper( 'onToggleMute' + bindPostFix );
			embedPlayer.bindHelper( 'onToggleMute' + bindPostFix, function() {
				window[ 'hbpSkin' ].toggleMute( embedPlayer );
			} );

			embedPlayer.unbindHelper( 'onOpenFullScreen' + bindPostFix );
			embedPlayer.bindHelper( 'onOpenFullScreen' + bindPostFix, function() {
				window[ 'hbpSkin' ].toggleFullscreen( embedPlayer );
			} );
			
			embedPlayer.unbindHelper( 'onCloseFullScreen' + bindPostFix );
			embedPlayer.bindHelper( 'onCloseFullScreen' + bindPostFix, function() {
				window[ 'hbpSkin' ].toggleFullscreen( embedPlayer );
			} );

			mw.log("ExternalResources:: IframeCustomPluginJs1:: KalturaSupport_CheckUiConf");
			// continue player build out
			callback();
		});
	});
	
	window[ 'hbpSkin' ] = {
		customizeSkin : function( embedPlayer ) {
			var _this = this;
			var $interface = embedPlayer.$interface;
			var $play_head = $interface.find( '.play_head' );
			var $button = $interface.find( 'div.rButton' ).first();
			
			// No volume slider
			$interface.find( '.vol_container' ).remove();
			
			var $lastButton = _this.lastButton( embedPlayer );
			$lastButton.css( {
				'-moz-border-radius' : '6px !important',
				'-webkit-border-radius' : '6px !important',
				'-khtml-border-radius' : '6px !important',
				'border-radius' : '6px !important',
				'-moz-border-radius-topleft' : '0px !important',
				'-moz-border-radius-bottomleft' : '0px !important',
				'-webkit-border-top-left-radius' : '0px !important',
				'-webkit-border-bottom-left-radius' : '0px !important',
				'-khtml-border-top-left-radius' : '0px !important',
				'-khtml-border-bottom-left-radius' : '0px !important',
				'border-top-left-radius' : '0px !important',
				'border-bottom-left-radius' : '0px !important',
				'margin-right' : '3px !important',
				'border-right' : '0px !important'
			} );
			
			
			// Stretching playhead to the available space
			var playHeadEnd = embedPlayer.getWidth() - $interface.find( '.time-disp' ).position().left + 5;
			if ( embedPlayer.controlBuilder.inFullScreen ) {
				playHeadEnd = screen.width - $interface.find( '.time-disp' ).position().left + 5;
			}
			$play_head.css( 'right', playHeadEnd + 'px' );
			
			var buttonMargin = parseInt ( $button.css( 'margin-top' ) );
			var buttonPadding = parseInt ( $button.css( 'padding-top' ) );
			var buttonHeight = $button.height();
			var backgroundLeft = $play_head.position().left - 2;
			var backgroundWidth = $interface.width() - backgroundLeft - 7;
			if ( embedPlayer.controlBuilder.inFullScreen ) {
				backgroundWidth = screen.width - backgroundLeft - 7;
			}
			// Controls background
			$newBG = $( '<div />' )
				.css( {
					'position' : 'absolute',
					'background-color' : '#2B2B2B',
					'width' : backgroundWidth + 'px',
					'height' : buttonHeight + ( 2 * buttonPadding ) + 'px',
					'margin' : buttonMargin + 'px',
					'left' :  backgroundLeft + 'px',
					'z-index' : -1
				} )
				.addClass ( 'ui-corner-all custom-background' );
			if ( $interface.find( '.custom-background').length ) {
				$interface.find( '.custom-background').remove();
			}
			$interface.find( '.control-bar' ).prepend( $newBG );
			$interface.find( '.timed-text' ).unbind( 'click.hbpSkin' );
			$interface.find( '.timed-text' ).bind( 'click.hbpSkin', function() {
				_this.toggleCC( embedPlayer );
			} );
		},
		
		toggleMute : function( embedPlayer ) {
			if ( embedPlayer.muted ) {
				embedPlayer.$interface.find( '.volume_control span' ).removeClass( 'ui-icon-volume-on' ).addClass( 'ui-icon-volume-off' );
			} else {
				embedPlayer.$interface.find( '.volume_control span' ).removeClass( 'ui-icon-volume-off' ).addClass( 'ui-icon-volume-on' );
			}
		},
		
		toggleFullscreen : function( embedPlayer ) {
			if ( embedPlayer.controlBuilder.inFullScreen ) {
				embedPlayer.$interface.find( '.ui-icon-arrow-4-diag' ).addClass( 'minimize' );
			} else {
				embedPlayer.$interface.find( '.ui-icon-arrow-4-diag' ).removeClass( 'minimize' );
			}			
		},
		
		toggleCC : function( embedPlayer ) {
			var layout = embedPlayer.timedText.config.layout;
			if ( layout == "off" ) {
				embedPlayer.$interface.find( '.ui-icon-comment' ).removeClass( 'active' );
			} else {
				embedPlayer.$interface.find( '.ui-icon-comment' ).addClass( 'active' );
			}
		},
		
		lastButton : function ( embedPlayer ) {
			var maxPosition = 0;
			var $lastButton = null;
			embedPlayer.$interface.find( '.rButton' ).each( function() {
				if ( $(this).position().left > maxPosition ) {
					maxPosition = $(this).position().left;
					$lastButton = $(this);
				}
			} );
			return $lastButton;
		}
	
	}
})( window.mw, jQuery );