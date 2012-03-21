/* captureThumbnail Plugin:
<Plugin id="captureThumbnail" 
    width="0%" 
    height="0%" 
    includeInLayout="false" 
    loadingPolicy="noWait"/>

<Button id="captureThumbBtnControllerScreen"
	kClick="sendNotification( 'captureThumbnail' )"
	height="22"
	buttonType="iconButton"
	focusRectPadding="0"
	icon="thumbIcon"
	styleName="controllerScreen"
	tooltip="Use current frame as the video thumbnail"
	k_buttonType="buttonIconControllerArea"
	color1="14540253"
	color2="16777215"
	color3="3355443"
	color4="10066329"
	color5="16777215"
	font="Arial"/>*/
( function( mw, $ ) { "use strict";
	// Bind to new player event
	$( mw ).bind( 'newEmbedPlayerEvent', function( event, embedPlayer ) {
		embedPlayer.bindHelper( 'KalturaSupport_CheckUiConf', function( event, $uiConf, callback ) {
			
			// Check if plugin exists
			if( embedPlayer.isPluginEnabled( 'captureThumbnail' ) ) {
                window['captureThumbnailPlugin'].init( embedPlayer );
			}

			// Continue player build-out
			callback();
		} );
	} );

    window[ 'captureThumbnailPlugin' ] = {
        
        init: function( embedPlayer ) {
            this.embedPlayer = embedPlayer;
            this.addPlayerBindings();
            this.addCaptureButton();
        },

		addPlayerBindings: function() {
			var _this = this;
            var embedPlayer = this.embedPlayer;
			embedPlayer.unbindHelper( 'captureThumbnail' );
            embedPlayer.bindHelper( 'captureThumbnail', function() {
                _this.captureThumbnail();
            } );
            embedPlayer.unbindHelper( 'captureThumbnailFinished' );
            embedPlayer.bindHelper( 'captureThumbnailFinished', function( e, isPlaying ) {
                _this.drawModal( isPlaying );
            } )
		},
        
        addCaptureButton: function() {
			var embedPlayer = this.embedPlayer;
            // TODO: We should have better support for kClick attribute [ sendNotification( 'flagForReview' ) ]
            // var captureButtonClick = embedPlayer.getKalturaConfig( 'captureThumbnail', 'kClick' );
			
            mw.log( 'captureThumbnailPlugin :: add button' );
            embedPlayer.bindHelper( 'addControlBarComponent', function(event, controlBar ) {

                var $captureButton = {
                    'w': 28,
                    'o': function( ctrlObj ) {
                        var $textButton = $( '<div />' )
                            .attr( 'title', embedPlayer.getKalturaConfig( 'captureThumbBtnControllerScreen', 'tooltip' ) )
                            .addClass( "ui-state-default ui-corner-all ui-icon-image ui-icon_link rButton" )
                            .append( $( '<span />' ).addClass( "ui-icon ui-icon-image" ) )
                            // TODO: Add label/text buttons support
                            .buttonHover()
                            .click(function() {
                                embedPlayer.triggerHelper( 'captureThumbnail' );
                            } );
                        return $textButton;
                    }
                };

                // Add the button to control bar
                controlBar.supportedComponents['captureButton'] = true;
                controlBar.components['captureButton'] = $captureButton;
            } );
        },
        
        captureThumbnail: function() {
            var _this = this;
            var embedPlayer = this.embedPlayer;
            var isPlaying = embedPlayer.isPlaying();
            embedPlayer.pause();
            embedPlayer.addPlayerSpinner();
            var roundedTime = ( parseFloat( embedPlayer.currentTime ) ).toFixed( 3 );
            this.getKalturaClient().doRequest( {
				'service' : 'thumbasset',
				'action' : 'generate',
                'entryId' : embedPlayer.kentryid,
                'thumbParams:quality': 75,
                'thumbParams:videoOffset': roundedTime,
                'thumbParams:objectType': 'KalturaThumbParams',
                'thumbParams:requiredPermissions:-': ''               
			}, function( data ) {
                var thumbId = data.id;
                if ( thumbId ) {
                    _this.kClient.doRequest( {
                        'service' : 'thumbasset',
                        'action' : 'setAsDefault',
                        'thumbAssetId' : thumbId
                    }, function() { 
                        embedPlayer.triggerHelper( 'captureThumbnailFinished', isPlaying );
                    } );
                }
            } );
        },

		drawModal: function( isPlaying ) {
			var embedPlayer = this.embedPlayer;
            
            embedPlayer.hidePlayerSpinner();
            embedPlayer.controlBuilder.displayAlert({
                'title': 'Capture Thumbnail',
                'message': 'New thumbnail has been set',
                'buttons': [],
                'callbackFunction': function() { 
                    if ( isPlaying ) {
                        embedPlayer.play();
                    }
                },
                'isExternal': false, // KDP defaults to false
                'isModal': true,
                'props': {
                    'buttonRowSpacing': '5px'
                }
            } );
		},      

        getKalturaClient: function() {
			if( ! this.kClient ) {
				this.kClient = mw.kApiGetPartnerClient( this.embedPlayer.kwidgetid );
			}
			return this.kClient;
		}
               
    };
} )( window.mw, window.jQuery );