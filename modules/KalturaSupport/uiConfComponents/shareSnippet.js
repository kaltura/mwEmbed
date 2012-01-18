/*
 * Share Snippet plugin:

<Plugin id="ShareSnippet" width="1" height="1"
path="/content/uiconf/ps/cornell/kdp_3.5.32/plugins/ShareSnippetPlugin4.swf"
visible="false" includeInLayout="false"
landingPagePrefix="http://www.cornell.edu/video/?videoID="
generatorEmbedPrefix="http://www.cornell.edu/video/embed.js?videoID="
uuidType="customField" uuidFieldName="CCVideoID"
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

( function( mw, $ ) {
	// Bind to new player event
	$( mw ).bind( 'newEmbedPlayerEvent', function( event, embedPlayer ){
		$( embedPlayer ).bind( 'KalturaSupport_CheckUiConf', function( event, $uiConf, callback ){
			
			// Check if plugin exists
			if( embedPlayer.isPluginEnabled( 'ShareSnippet' ) ) {
				window['shareSnippet'].init( embedPlayer );
			}

			// Continue player build-out
			callback();
		});
	});

	// Share snippet
	window['shareSnippet'] = {

		init: function( embedPlayer ) {
			this.embedPlayer = embedPlayer;
			this.setupConfig();
			this.addPlayerBindings();
			this.addShareButton();
		},

		setupConfig: function() {

			var shareConfig = [
				'landingPagePrefix',
				'uuidType',
				'uuidFieldName',
				'generatorEmbedPrefix',
				'customSnippetBefore',
				'customSnippetAfter'
			];

			this.config = this.embedPlayer.getKalturaConfig('ShareSnippet', shareConfig);
		},

		addPlayerBindings: function() {
			var _this = this;
			$( this.embedPlayer ).unbind('showShareSnippets').bind('showShareSnippets', function() {
				_this.drawModal();
			});
		},

		addShareButton: function() {
			var _this = this;
			var embedPlayer = this.embedPlayer;
			var shareButtonClick = embedPlayer.getKalturaConfig('shareBtnControllerScreen', 'kClick');
			// TODO: We should have better support for kClick attribute [ sendNotification('showShareSnippets') ]
			if( shareButtonClick.indexOf('showShareSnippets') ) {

				mw.log('shareSnippet :: add share button');
				$( embedPlayer ).bind( 'addControlBarComponent', function(event, controlBar ){

					var $shareButton = {
						'w': 28,
						'o': function( ctrlObj ) {

							var $textButton = $( '<div />' )
								.attr( 'title', gM( 'mwe-embedplayer-share' ) )
								.addClass( "ui-state-default ui-corner-all ui-icon_link rButton" )
								.append( $( '<span />' ).addClass( "ui-icon ui-icon-link" ) )
								.buttonHover()
								.click(function() {
									$( embedPlayer ).trigger('showShareSnippets');
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

		getUniqueId: function() {
			if( this.config['uuidType'] == 'entryId' ) {
				return this.embedPlayer.evaluate('{mediaProxy.entry.id}');
			} else {
				return this.embedPlayer.evaluate('{mediaProxy.entryMetadata.' + this.config['uuidFieldName'] + '}');
			}
		},

		drawModal: function() {

			var embedPlayer = this.embedPlayer,
				config = this.config,
				showError = false,
				videoId = this.getUniqueId(),
				shareUrl,
				generatorPageUrl,
				customSnippet;

			// Generate Share URL
			if( config['landingPagePrefix'] ) {
				// Custom share URL
				shareUrl = config['landingPagePrefix'] + videoId;
			} else {
				// Default KMC preview page
				var partnerId = embedPlayer.kwidgetid.substr(1,embedPlayer.kwidgetid.length);
				shareUrl = mw.getConfig('Kaltura.ServiceUrl') + '/index.php/kmc/preview/';
				shareUrl += 'partner_id/' + partnerId + '/entry_id/' + embedPlayer.kentryid + '/uiconf_id/' + embedPlayer.kuiconfid;
			}

			// Genrate Embed Code
			if( config['generatorEmbedPrefix'] ) {
				generatorPageUrl = config['generatorEmbedPrefix'] + videoId;
			} else {
				showError = true;
				generatorPageUrl = "Plugin is not configured correctly. Generator page prefix is not set";
			}

			if( showError ) {
				customSnippet = generatorPageUrl;
			} else {
				customSnippet = unescape(config['customSnippetBefore']) + generatorPageUrl + unescape(config['customSnippetAfter']);
			}

			var $title = $('<h2 />').text('Share');
			var $shareLink = $('<div />').append(
				$('<span />').text('Email or IM this to your friends:'),
				$('<textarea />')
				.css({'width': '95%', 'height': '15px'})
				.text(shareUrl)
				.click( function() {
					this.select();
				})
			);
			var $shareCode = $('<div />').append(
				$('<span />').text('Copy this code to your website or blog:'),
				$('<textarea />')
				.css({'width': '95%', 'height': '30px'})
				.text(customSnippet)
			).css({'margin-top': '20px', 'clear': 'both'});

			var $selectLinkButton = false;
			var $selectCodeButton = false;
			if( ! mw.isIpad() ) {
				// Share Link Button
				$selectLinkButton = $('<button />')
				.addClass( 'ui-state-default ui-corner-all copycode' )
				.text( gM( 'mwe-embedplayer-copy-code' ) )
				.click(function() {
					$shareLink.find( 'textarea' ).focus().select();
					// Copy the text if supported:
					if ( document.selection ) {
						CopiedTxt = document.selection.createRange();
						CopiedTxt.execCommand( "Copy" );
					}
				} );

				$shareLink.append( $selectLinkButton );

				// Share Code Button
				$selectCodeButton = $('<button />')
				.addClass( 'ui-state-default ui-corner-all copycode' )
				.text( gM( 'mwe-embedplayer-copy-code' ) )
				.click(function() {
					$shareCode.find( 'textarea' ).focus().select();
					// Copy the text if supported:
					if ( document.selection ) {
						CopiedTxt = document.selection.createRange();
						CopiedTxt.execCommand( "Copy" );
					}
				} );

				$shareCode.append( $selectCodeButton );
			}

			var $shareScreen = $('<div />').append(
				$title, $shareLink, $shareCode
			);

			embedPlayer.controlBuilder.displayMenuOverlay( $shareScreen );
		}
	};


})( window.mw, window.jQuery );