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


	var captureThumbnailPlugin = {

			bindPostFix : '.captureThumbnail',

	    init: function( embedPlayer ) {
	        this.embedPlayer = embedPlayer;
	        this.addPlayerBindings();
	        this.addCaptureButton();
	    },

		addPlayerBindings: function() {
			var _this = this;
	        var embedPlayer = this.embedPlayer;

			// Unbind previously binded events by namespace
			embedPlayer.unbindHelper( _this.bindPostFix );
	        embedPlayer.bindHelper( 'captureThumbnail', function() {
	            _this.captureThumbnail();
	        } );
	        embedPlayer.bindHelper( 'captureThumbnailFinished', function( e, isPlaying ) {
	            _this.drawModal( isPlaying );
	        } );
	        embedPlayer.bindHelper( 'captureThumbnailError', function( e, isPlaying ) {
	            _this.drawModal( isPlaying, true );
	        } );
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
				// In case of error, print an error message
				if ( data.message && data.message.indexOf( "Error" ) != -1 ) {
					embedPlayer.triggerHelper( 'captureThumbnailError', isPlaying );
					return false;
				}
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
				return true;
	        } );
	    },

		drawModal: function( isPlaying, isError ) {
			var embedPlayer = this.embedPlayer;
	        var alertObj = {
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
			};
			if ( isError ) {
				alertObj.message = 'An error occurred while trying to capture thumbnail'
			}
	        embedPlayer.hideSpinnerAndPlayBtn();
	        embedPlayer.controlBuilder.displayAlert( alertObj );
		},

	    getKalturaClient: function() {
			if( ! this.kClient ) {
				this.kClient = mw.kApiGetPartnerClient( this.embedPlayer.kwidgetid );
			}
			return this.kClient;
		}

	};

	// Bind to new player event
	mw.addKalturaPlugin( 'captureThumbnail', function( embedPlayer, callback ){
		captureThumbnailPlugin.init( embedPlayer );
		// Continue player build-out
		callback();
	});


} )( window.mw, window.jQuery );