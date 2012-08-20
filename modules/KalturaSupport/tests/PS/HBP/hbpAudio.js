( function( mw, $ ) { "use strict";
	$( mw ).bind( 'EmbedPlayerNewPlayer', function( event, embedPlayer ) {
		embedPlayer.displayPlayer = false;
		embedPlayer.attributionbutton = false;
		mw.log('ExternalResources:: IframeCustomPluginJs1:: EmbedPlayerNewPlayer');
		mw.setConfig( 'EmbedPlayer.TimeDisplayWidth', 85 );
		mw.setConfig( 'EmbedPlayer.EnableOptionsMenu', false );
		mw.addMessages( {
			'mwe-embedplayer-pause_clip' : 'Pause',
			'mwe-embedplayer-play_clip' : 'Play',
			'mwe-embedplayer-volume_control' : 'Mute',
			'mwe-embedplayer-volume_control-unmute' : 'Unmute'
		} );

		$( embedPlayer ).bind( 'KalturaSupport_CheckUiConf', function( event, $uiConf, callback ) {
			var embedPlayer = this;
			var bindPostFix = '.hbpCustomSkin';
			window[ 'hbpSkin'].addRemoveBindings( embedPlayer, bindPostFix );


			mw.log('ExternalResources:: IframeCustomPluginJs1:: KalturaSupport_CheckUiConf');
			// continue player build out
			callback();
		});
	});

	window[ 'hbpSkin' ] = {
		addRemoveBindings : function( embedPlayer, bindPostFix ) {
			embedPlayer.unbindHelper( bindPostFix );

			embedPlayer.bindHelper( 'playerReady' + bindPostFix, function() {
				window[ 'hbpSkin' ].customizeSkin( embedPlayer );
			} );

			embedPlayer.bindHelper( 'onToggleMute' + bindPostFix, function() {
				window[ 'hbpSkin' ].toggleMute( embedPlayer );
			} );
		},

		customizeSkin : function( embedPlayer ) {
			var _this = this;
			var $interface = embedPlayer.$interface;
			var $play_head = $interface.find( '.play_head' );
			var $button = $interface.find( 'div.rButton' ).first();

			var $lastButton = _this.lastButton( embedPlayer );
			if ( mw.isIOS() ) {
				$lastButton = $interface.find( '.time-disp' );
			}

			$lastButton.addClass( 'lastButton' )
				.css( {
					'-moz-border-radius' : '6px !important',
					'-webkit-border-radius' : '6px !important',
					'-khtml-border-radius' : '6px !important',
					'border-radius' : '6px !important'
				} )
				.hover( function() {
					$( this ).css( {
						'-moz-border-radius-topleft' : '0px !important',
						'-moz-border-radius-bottomleft' : '0px !important',
						'-webkit-border-top-left-radius' : '0px !important',
						'-webkit-border-bottom-left-radius' : '0px !important',
						'-khtml-border-top-left-radius' : '0px !important',
						'-khtml-border-bottom-left-radius' : '0px !important',
						'border-top-left-radius' : '0px !important',
						'border-bottom-left-radius' : '0px !important'
					} );
				} );

			// No volume slider
			$interface.find( '.vol_container' ).remove();

			var buttonMargin = 2;
			var buttonPadding = 4;
			var buttonHeight = 16;
			if ( $button.length ) {
				buttonMargin = parseInt ( $button.css( 'margin-top' ) );
				buttonPadding = parseInt ( $button.css( 'padding-top' ) );
				buttonHeight = $button.height();
			}
			var backgroundLeft = $play_head.position().left - 2;
			var backgroundWidth = embedPlayer.getWidth() - backgroundLeft - 7;
			// Controls background
			var $newBG = $( '<div />' )
				.css( {
					'position' : 'absolute',
					'background-color' : '#B4CECF',
					'width' : backgroundWidth + 'px',
					'height' : buttonHeight + ( 2 * buttonPadding ) + 'px',
					'margin' : buttonMargin + 'px',
					'left' :  backgroundLeft - 2 + 'px',
					'z-index' : -1
				} )
				.addClass ( 'ui-corner-all custom-background' );

			if ( $interface.find( '.custom-background').length ) {
				$interface.find( '.custom-background').remove();
			}
			$interface.find( '.control-bar' ).prepend( $newBG );
			$interface.find( '.time-disp').css( {
				'height' : buttonHeight + ( 2 * buttonPadding ) + 'px',
				'line-height' : buttonHeight + ( 2 * buttonPadding ) + 'px'
			} );

			// Stretching playhead to the available space
			if ( $interface.find( '.time-disp' ).length ) {
				var playHeadEnd = embedPlayer.getWidth() - $interface.find( '.time-disp' ).position().left + 5;
				$play_head.css( {
					'right' : playHeadEnd + 'px',
					'height' : '7px'
				} );
			}

			// Playhead padded border
			var $paddedBorder = $( '<div />' )
				.addClass( 'padded-border' )
				.css( {
					'width' : $play_head.width() + 2 + 'px',
					'height' : $play_head.height() + 2 + 'px',
					'left' : $play_head.position().left + parseInt( $play_head.css( 'margin-left' ) ) - 1 + 'px',
					'top' : $play_head.position().top + parseInt( $play_head.css( 'margin-top' ) ) - 1 + 'px'
				} )
			if ( $interface.find( '.padded-border').length ) {
				$interface.find( '.padded-border').remove();
			}
			$play_head.before( $paddedBorder );
		},

		toggleMute : function( embedPlayer ) {
			if ( embedPlayer.muted ) {
				embedPlayer.$interface.find( '.volume_control span' ).removeClass( 'ui-icon-volume-on' ).addClass( 'ui-icon-volume-off' );
				embedPlayer.$interface.find( '.volume_control' ).attr( 'title', gM( 'mwe-embedplayer-volume_control-unmute' ) );
			} else {
				embedPlayer.$interface.find( '.volume_control span' ).removeClass( 'ui-icon-volume-off' ).addClass( 'ui-icon-volume-on' );
				embedPlayer.$interface.find( '.volume_control' ).attr( 'title', gM( 'mwe-embedplayer-volume_control' ) );
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