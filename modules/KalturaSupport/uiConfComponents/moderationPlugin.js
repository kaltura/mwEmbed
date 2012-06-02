/* Moderation Plugin:
<Plugin id="moderation"
	width="100%"
	height="100%"
	header="Report this content as Inapproriate"
	text="Please describe your concern about the video, so that we can review it and determine whether it isn't appropriate for all viewers."/>

<Button id="flagBtnControllerScreen" 
    buttonType="iconButton"
    kClick="sendNotification( 'flagForReview' )"
    height="22"
    styleName="controllerScreen"
    focusRectPadding="0"
    icon="flagIcon"
    tooltip="Report this content as inappropriate"
    k_buttonType="buttonIconControllerArea"
    color1="14540253"
    color2="16777215"
    color3="3355443"
    color4="10066329"
    color5="16777215"
    font="Arial"/>
*/
( function( mw, $ ) { "use strict";
	// Bind to new player event
	$( mw ).bind( 'newEmbedPlayerEvent', function( event, embedPlayer ){
		embedPlayer.bindHelper( 'KalturaSupport_CheckUiConf', function( event, $uiConf, callback ){
			
			// Check if plugin exists
			if( embedPlayer.isPluginEnabled( 'moderation' ) ) {
                window[ 'moderationPlugin' ].init( embedPlayer );
			}

			// Continue player build-out
			callback();
		});
	});

    window[ 'moderationPlugin' ] = {
        
        init: function( embedPlayer ) {
            this.embedPlayer = embedPlayer;
            this.addPlayerBindings();
            this.addFlagButton();
        },

		addPlayerBindings: function() {
			var _this = this;
            var embedPlayer = this.embedPlayer;
			embedPlayer.unbindHelper( 'flagForReview' );
            embedPlayer.bindHelper( 'flagForReview', function() {
                _this.drawModal();
            });
            embedPlayer.unbindHelper( 'moderationSubmitted' );
            embedPlayer.bindHelper( 'moderationSubmitted', function(e,flagObj) {
                _this.submitFlag(flagObj);
            })
		},
        
        addFlagButton: function() {
			var embedPlayer = this.embedPlayer;
            // TODO: We should have better support for kClick attribute [ sendNotification( 'flagForReview' ) ]
            // var flagButtonClick = embedPlayer.getKalturaConfig( 'flagBtnControllerScreen', 'kClick' );
			
            mw.log( 'moderationPlugin :: add flag button' );
            embedPlayer.bindHelper( 'addControlBarComponent', function(event, controlBar ){

                var $flagButton = {
                    'w': 28,
                    'o': function( ctrlObj ) {
                        var $textButton = $( '<div />' )
                            .attr( 'title', embedPlayer.getKalturaConfig( 'flagBtnControllerScreen', 'tooltip' ) )
                            .addClass( "ui-state-default ui-corner-all ui-icon-flag ui-icon_link rButton" )
                            .append( $( '<span />' ).addClass( "ui-icon ui-icon-flag" ) )
                            // TODO: Add label/text buttons support
                            // .append( $( '<span />' ).text( _this.config.label ).css( {'font-family': embedPlayer.getKalturaConfig( 'flagBtnControllerScreen', 'font' ),'font-size': '12px'} ) )
                            .buttonHover()
                            .click(function() {
                                embedPlayer.triggerHelper( 'flagForReview' );
                            });
                        return $textButton;
                    }
                };

                // Add the button to control bar
                controlBar.supportedComponents[ 'flagButton' ] = true;
                controlBar.components[ 'flagButton' ] = $flagButton;
            });
        },
        
		drawModal: function() {

			var embedPlayer = this.embedPlayer;
			
			var isPlaying = embedPlayer.isPlaying();
			if( isPlaying ) {
				embedPlayer.pause();
			}			
            
            var $header = $( '<h2 />' ).text(embedPlayer.getKalturaConfig( 'moderation', 'header' ));
			var $moderationMessage = $( '<div />' ).append(
				$( '<span />' ).text(embedPlayer.getKalturaConfig( 'moderation', 'text' )),
                $( '<div />' ).append(
                    $( '<select />' )
                        .attr( 'id','flagType' )
                        .append(
                            $( '<option />' ).attr( 'value', 1 ).text( 'Sexual Content' ),
                            $( '<option />' ).attr( 'value', 2 ).text( 'Violent Or Repulsive' ),
                            $( '<option />' ).attr( 'value', 3 ).text( 'Harmful Or Dangerous Act' ),
                            $( '<option />' ).attr( 'value', 4 ).text( 'Spam / Commercials' )
                        )
                    ),
				$( '<textarea />' )
                    .attr( 'id', 'flagComments' )
                    .css({'width': '95%', 'height': '50px', 'margin-top': '5px'}),
                $( '<button />' )
                    .addClass( 'ui-state-default ui-corner-all copycode' )
                    .text( 'Submit' )
                    .click(function() {
                        embedPlayer.triggerHelper( 'moderationSubmitted',[{
                                'flagType': $( '#flagType' ).val(),
                                'flagComments': $( '#flagComments' ).val()
                        }]);
                    })
			);

			var $moderationScreen = $( '<div />' ).append($header, $moderationMessage );

			var closeCallback = function() {
				if( isPlaying ) {
					embedPlayer.play();
				}
			};
			
			embedPlayer.controlBuilder.displayMenuOverlay( $moderationScreen, closeCallback );
		},
        
        submitFlag: function(flagObj) {
            var _this = this,
                embedPlayer = this.embedPlayer;

            embedPlayer.controlBuilder.closeMenuOverlay();
            embedPlayer.addPlayerSpinner();
            
            this.getKalturaClient().doRequest( {
				'service' : 'baseentry',
				'action' : 'flag',
				'moderationFlag:objectType' : 'KalturaModerationFlag',
				'moderationFlag:flaggedEntryId' : _this.embedPlayer.kentryid,
				'moderationFlag:flagType' : flagObj.flagType,
                'moderationFlag:comments' : flagObj.flagComments
			}, function( data ) {
                embedPlayer.hideSpinnerAndPlayBtn();
                var $flagScreen = $( '<div />' )
                    .append(
                        $( '<h3 />' ).text( 'Thank you for sharing your concerns' ),
                        $( '<div />' ).append(
                            $( '<button />' )
                                .addClass( 'ui-state-default ui-corner-all copycode' )
                                .text( 'Done' )
                                .click(function() {
                                    embedPlayer.controlBuilder.closeMenuOverlay();
                                })
                        )
                    );
                embedPlayer.controlBuilder.displayMenuOverlay( $flagScreen );
			});

        },
        
        getKalturaClient: function(){
			if( ! this.kClient ){
				this.kClient = mw.kApiGetPartnerClient( this.embedPlayer.kwidgetid );
			}
			return this.kClient;
		}
               
    };
})( window.mw, window.jQuery );