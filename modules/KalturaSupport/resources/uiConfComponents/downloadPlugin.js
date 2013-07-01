/* Download Plugin:
<Plugin id="download" width="0%" height="0%" includeInLayout="false" loadingPolicy="noWait" flavorId=""/>

<Button id="downloadBtnControllerScreen"
	focusRectPadding="0"
	buttonType="iconButton"
	kClick="sendNotification('doDownload')"
	height="22"
	icon="downloadIcon"
	styleName="controllerScreen"
	tooltip="download video"
	k_buttonType="buttonIconControllerArea"
	color1="14540253"
	color2="16777215"
	color3="3355443"
	color4="10066329"
	color5="16777215"
	font="Arial"/>
 */

( function( mw, $ ) {"use strict";

	var downloadPlugin = {

		init: function( embedPlayer ) {
			this.embedPlayer = embedPlayer;
			this.addPlayerBindings();
			this.addDownloadButton();
		},

		addPlayerBindings: function() {
			var _this = this;
			var embedPlayer = this.embedPlayer;
			embedPlayer.unbindHelper( 'downloadMedia' );
			embedPlayer.bindHelper( 'downloadMedia', function() {
				_this.downloadMedia();
			});
		},

		addDownloadButton: function() {
			var embedPlayer = this.embedPlayer;
			// TODO: We should have better support for kClick attribute [ sendNotification( 'doDownload' ) ]
			// var downloadButtonClick = embedPlayer.getKalturaConfig( 'downloadBtnControllerScreen', 'kClick' );

			mw.log( 'downloadPlugin :: add download button' );
			embedPlayer.bindHelper( 'addControlBarComponent', function(event, controlBar ){

				var $downloadButton = {
					'w': 28,
					'o': function( ctrlObj ) {
						var $textButton = $( '<div />' )
							.attr( 'title', embedPlayer.getKalturaConfig( 'downloadBtnControllerScreen', 'tooltip' ) )
							.addClass( "ui-state-default ui-corner-all ui-icon-arrowthickstop-1-s ui-icon_link rButton" )
							.append( $( '<span />' ).addClass( "ui-icon ui-icon-arrowthickstop-1-s" ) )
							// TODO: Add label/text buttons support
							// .append( $( '<span />' ).text( _this.config.label ).css( {'font-family': embedPlayer.getKalturaConfig( 'downloadBtnControllerScreen', 'font' ),'font-size': '12px'} ) )
							.buttonHover()
							.click(function() {
								embedPlayer.triggerHelper( 'downloadMedia' );
							});
						return $textButton;
					}
				};

				// Add the button to control bar
				controlBar.supportedComponents[ 'downloadButton' ] = true;
				controlBar.components[ 'downloadButton' ] = $downloadButton;
			});

		},
		downloadMedia: function() {
			var embedPlayer = this.embedPlayer;
			var downloadUrl = mw.getMwEmbedPath() + '/modules/KalturaSupport/download.php/wid/' + embedPlayer.kwidgetid + '/uiconf_id/' + embedPlayer.kuiconfid + '/entry_id/' + embedPlayer.kentryid + '?forceDownload=true';
			// Append KS
			var client = mw.kApiGetPartnerClient( embedPlayer.kwidgetid );
			client.getKS(function( ks ){
				downloadUrl += '&ks=' + ks;
				window.open( downloadUrl );
			});
		}
	};

	// Bind to new player event
	mw.addKalturaPlugin( 'download', function( embedPlayer, callback ) {
		// iOS does not support the download plugin:
		if( !mw.isIOS() ){
			downloadPlugin.init( embedPlayer );
		}
		// Continue player build-out
		callback();
	});

})( window.mw, window.jQuery );