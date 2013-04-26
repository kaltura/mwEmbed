/* Like Plugin:
<Plugin id="likeAPI"
	width="0%"
	height="0%"
	likeButton="{likeButton}"
	includeInLayout="false"
/>
<Button id="likeButton"
	focusRectPadding="0"
	toggle="true"
	selectedTooltip="unlike this video"
	tooltip="like this video"
	upTooltip="like this video"
	upIcon="like"
	overIcon="like"
	downIcon="like"
	disabeledIcon="like"
	selectedUpIcon="unlike"
	selectedOverIcon="unlike"
	selectedDownIcon="unlike"
	selectedDisabledIcon="unlike"
	kClick="sendNotification('doLike')"
	color1="11184810"
	color2="16777215"
	color3="16777215"
	color4="11184810"
	color5="0"
	font="Arial"
/>
*/
( function( mw, $ ) {"use strict";
	var likeAPI = {

		bindPostFix: '.likeAPI',

		// TODO - remove this var and references - This is temporary workaround for the double loading
		submitted: false,

		init: function( embedPlayer ) {
			this.embedPlayer = embedPlayer;
			this.addPlayerBindings();
			this.addLikeButton();
			this.checkLike();
		},

		addPlayerBindings: function() {
			var _this = this;
			var embedPlayer = this.embedPlayer;

			embedPlayer.unbindHelper( _this.bindPostFix );
			embedPlayer.bindHelper( 'likeSubmitted' + _this.bindPostFix, function( e, like ) {
				_this.toggleButton( like );
			} );
		},

		addLikeButton: function() {
			var _this = this;
			var embedPlayer = this.embedPlayer;

			mw.log( 'likePlugin :: Add like button' );
			embedPlayer.bindHelper( 'addControlBarComponent', function( e, controlBar ) {
				var $likeButton = {
					'w': 28,
					'o': function( ctrlObj ) {
						var $textButton = $( '<div />' )
							.attr( 'title', embedPlayer.getKalturaConfig( 'likeButton', 'tooltip' ) )
							.addClass( "ui-state-default ui-corner-all ui-icon_link rButton like-btn" )
							.append( $( '<span />' ).addClass( "ui-icon ui-icon-like-on" ) )
							.buttonHover()
							.click( function() {
								_this.likeUnlike( true );
							} );
						return $textButton;
					}
				};
				// Add the button to the control bar
				controlBar.supportedComponents[ 'likeButton' ] = true;
				controlBar.components[ 'likeButton' ] = $likeButton;
			} );
		},

		checkLike: function() {
			var _this = this;
			var embedPlayer = this.embedPlayer;

			_this.getKalturaClient().doRequest( {
				'service' : 'like_like',
				'action' : 'checkLikeExists',
				'entryId' : embedPlayer.kentryid
			}, function( data ) {
				var like = false;
				if ( data === true ) {
					like = true;
				}
				_this.toggleButton( like );
				embedPlayer.triggerHelper( 'onCheckLike', like )
			} );
		},

		/**
		 * Toggle button based by passed 'like' param:
		 * like = true: show unlike (and vice versa)
		 */
		toggleButton: function( like ) {
			var _this = this;
			var embedPlayer = this.embedPlayer;
			var $likeButton = embedPlayer.$interface.find( '.like-btn' ).find( 'span' );
			if ( $likeButton.length ) {
				$likeButton.removeClass( "ui-icon-like-on ui-icon-like-off" );
				if ( like ) {
					$likeButton.addClass( "ui-icon-like-off" );
					$likeButton.parent().attr( 'title', embedPlayer.getKalturaConfig( 'likeButton', 'selectedTooltip' ) );
				}
				else {
					$likeButton.addClass( "ui-icon-like-on" );
					$likeButton.parent().attr( 'title', embedPlayer.getKalturaConfig( 'likeButton', 'tooltip' ) );
				}
				$likeButton.unbind( 'click' );
				$likeButton.click( function() {
					_this.likeUnlike( !like );
				} );
			}
		},

		likeUnlike: function( like ) {
			if ( this.submitted ) {
				this.submitted = false;
				return;
			}
			this.submitted = true;
			var embedPlayer = this.embedPlayer;
			var action = 'like';
			if ( !like ) {
				action = 'unlike';
			}
			this.getKalturaClient().doRequest( {
				'service' : 'like_like',
				'action' : action,
				'entryId' : embedPlayer.kentryid
			}, function( data ) {
				if ( data === true ) {
					embedPlayer.triggerHelper( 'likeSubmitted', like );
				}
				else {
					embedPlayer.triggerHelper( 'likeError' );
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

	// Check if the like plugin is enabled:
	mw.addKalturaPlugin( 'likeAPI', function( embedPlayer, callback ){
		likeAPI.init( embedPlayer );
		// Continue player build-out
		callback();
	});

} )( window.mw, window.jQuery );