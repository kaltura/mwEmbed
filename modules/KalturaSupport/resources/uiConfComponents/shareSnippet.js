/*
 * Share Snippet plugin:

<Plugin id="shareSnippet" width="1" height="1"
path="/content/uiconf/ps/cornell/kdp_3.5.32/plugins/ShareSnippetPlugin4.swf"
visible="false" includeInLayout="false"
landingPagePrefix="http://www.cornell.edu/video/?videoID="
generatorEmbedPrefix="http://www.cornell.edu/video/embed.js?videoID="
uuid="{mediaProxy.entryMetadata.CCVideoID}"
customSnippetBefore="%3Cscript%20src%3D'"
customSnippetAfter="' type%3D'text%2Fjavascript'%3E%3C%2Fscript%3E%3Cnoscript%3EEmbedded%20video%20from%20%3Ca%20href%3D'http%3A%2F%2Fwww.cornell.edu%2Fvideo'%3ECornell%20University%3C%2Fa%3E%3C%2Fnoscript%3E" />

*
* Share Button:
*

<Button id="shareBtnEndScreen"
kClick="sendNotification('showShareSnippets')"
buttonType="onScreenButton" minWidth="60"
labelPlacement="top" label="Share"
styleName="onScreenBtn" upIcon="shareIcon"
k_buttonType="buttonIconControllerArea" color1="14540253"
color2="16777215" color3="3355443" color4="0x58A1E0"
color5="16777215" font="Arial" />

*
*/

( function( mw, $ ) { "use strict";

	// Share snippet
	var shareSnippet = {

		pluginName: 'shareSnippet',

		init: function( embedPlayer ) {
			this.embedPlayer = embedPlayer;
			this.addPlayerBindings();
			this.addShareButton();
		},

		// We should have a base Plugin that will have getConfig method and plugin will extend that class and call the partner getConfig
		getConfig: function( attr ) {
			return this.embedPlayer.getKalturaConfig( this.pluginName, attr );
		},

		addPlayerBindings: function() {
			var _this = this;
			this.embedPlayer.unbindHelper('showShareSnippets');
			this.embedPlayer.bindHelper('showShareSnippets', function() {
				_this.drawModal();
			});
		},

		addShareButton: function() {
			var _this = this;
			var embedPlayer = this.embedPlayer;
			var shareButtonClick = embedPlayer.getKalturaConfig('kalturaShareBtnControllerScreen', 'kClick') || embedPlayer.getKalturaConfig('shareBtnControllerScreen', 'kClick') ;
			// TODO: We should have better support for kClick attribute [ sendNotification('showShareSnippets') ]
			if( shareButtonClick && shareButtonClick.indexOf('showShareSnippets') ) {

				mw.log('shareSnippet :: add share button');
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
									embedPlayer.triggerHelper('showShareSnippets');
								});

							return $textButton;
						}
					};

					// Add the button to control bar
					controlBar.supportedComponents['shareLink'] = true;
					controlBar.components['shareLink'] = $shareButton;

				});

			}
		},

		drawModal: function() {

			var embedPlayer = this.embedPlayer,
				showError = false,
				shareUrl,
				generatorPageUrl,
				customSnippet;

			var isPlaying = embedPlayer.isPlaying();
			if( isPlaying ) {
				embedPlayer.pause();
			}

			// Generate Share URL
			if( this.getConfig('landingPagePrefix') ) {
				// Custom share URL
				shareUrl = this.getConfig('landingPagePrefix') + this.getConfig('uuid');
			} else {
				// Default KMC preview page
				var partnerId = embedPlayer.kwidgetid.substr(1,embedPlayer.kwidgetid.length);
				shareUrl = mw.getConfig('Kaltura.ServiceUrl') + '/index.php/kmc/preview/';
				shareUrl += 'partner_id/' + partnerId + '/entry_id/' + embedPlayer.kentryid + '/uiconf_id/' + embedPlayer.kuiconfid;
			}

			// Genrate Embed Code
			if( this.getConfig('generatorEmbedPrefix') ) {
				generatorPageUrl = this.getConfig('generatorEmbedPrefix') + this.getConfig('uuid');
			} else {
				generatorPageUrl = this.getConfig('uuid');
			}

			if( showError ) {
				customSnippet = '';
			} else {
				customSnippet = unescape(this.getConfig('customSnippetBefore')) + generatorPageUrl + unescape(this.getConfig('customSnippetAfter'));
			}

			var $title = $('<h2 />').text('Share');
			var $shareLink = $('<div />').append(
				$('<span />').text('Email or IM this to your friends:'),
				$('<input />')
				.css({'width': '95%', 'background': '#E4E4E4', 'color': '#666'})
				.val(shareUrl)
				.click( function() {
					this.select();
				})
			);
			var $shareCode = $('<div />').append(
				$('<span />').text('Copy this code to your website or blog:'),
				$('<input />')
				.css({'width': '95%', 'background': '#E4E4E4', 'color': '#666'})
				.val(customSnippet)
				.click( function() {
					this.select();
				})
			).css({'margin-top': '20px', 'clear': 'both'});

			var $selectLinkButton = false;
			var $selectCodeButton = false;
			if( ! mw.isIpad() ) {
				// Share Link Button
				$selectLinkButton = $('<button />')
				.addClass( 'ui-state-default ui-corner-all copycode' )
				.text( gM( 'mwe-embedplayer-copy-code' ) )
				.click(function() {
					$shareLink.find( 'input' ).focus().select();
					// Copy the text if supported:
					if ( document.selection ) {
						var copiedTxt = document.selection.createRange();
						copiedTxt.execCommand( "Copy" );
					}
				} );

				$shareLink.append( $selectLinkButton );

				// Share Code Button
				$selectCodeButton = $('<button />')
				.addClass( 'ui-state-default ui-corner-all copycode' )
				.text( gM( 'mwe-embedplayer-copy-code' ) )
				.click(function() {
					$shareCode.find( 'input' ).focus().select();
					// Copy the text if supported:
					if ( document.selection ) {
						var copiedTxt = document.selection.createRange();
						copiedTxt.execCommand( "Copy" );
					}
				} );

				$shareCode.append( $selectCodeButton );
			}

			var $shareScreen = $('<div />').append(
				$title, $shareLink, $shareCode
			);

			var closeCallback = function() {
				if( isPlaying ) {
					embedPlayer.play();
				}
			};

			embedPlayer.controlBuilder.displayMenuOverlay( $shareScreen, closeCallback );
		}
	};

	// Bind to new player event
	mw.addKalturaPlugin( 'shareSnippet', function( embedPlayer, callback ){
		shareSnippet.init( embedPlayer );
		// Continue player build-out
		callback();
	});

})( window.mw, window.jQuery );