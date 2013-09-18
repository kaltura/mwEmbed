( function( mw, $ ) { "use strict";

	mw.PluginManager.add( 'moderation', mw.KBaseComponent.extend({

		defaultConfig: {
			"parent": "controlsContainer",
         	"order": 62,
         	"align": "right",
         	"showTooltip": true,

         	"tooltip": "Report",
         	"reasonSex": "Sexual Content",
         	"reasonViolence": "Violent Or Repulsive",
         	"reasonHarmful": "Harmful Or Dangerous Act",
         	"reasonSpam": "Spam / Commercials"
		},

		drawModal: function() {
			var _this = this;

			var isPlaying = this.getPlayer().isPlaying();
			if( isPlaying ) {
				this.getPlayer().pause();
			}

			// Disable space key binding to enable entering "space" inside the textarea
		 	this.getPlayer().triggerHelper( 'onDisableKeyboardBinding' );

		 	var $header = $( '<h2 />' ).text(this.getConfig( 'header' ));
			var $moderationMessage = $( '<div />' ).append(
				$( '<span />' ).text(this.getConfig( 'text' )),
				$( '<div />' ).append(
					$( '<select />' )
						.attr( 'id','flagType' )
						.append(
							$( '<option />' ).attr( 'value', 1 ).text( _this.getConfig( 'reasonSex' ) ),
							$( '<option />' ).attr( 'value', 2 ).text( _this.getConfig( 'reasonViolence' ) ),
							$( '<option />' ).attr( 'value', 3 ).text( _this.getConfig( 'reasonHarmful' ) ),
							$( '<option />' ).attr( 'value', 4 ).text( _this.getConfig( 'reasonSpam' ) )
						)
					),
				$( '<textarea />' )
					.attr( 'id', 'flagComments' )
					.css({'width': '95%', 'height': '50px', 'margin-top': '5px'}),
				$( '<button />' )
					.addClass( 'ui-state-default ui-corner-all copycode' )
					.text( 'Submit' )
					.click(function() {
						_this.submitFlag({
							'flagType': $( '#flagType' ).val(),
							'flagComments': $( '#flagComments' ).val()
						});
					})
			);

			var $moderationScreen = $( '<div />' ).append($header, $moderationMessage );

			var closeCallback = function() {
				// Enable space key binding
				_this.getPlayer().triggerHelper( 'onEnableKeyboardBinding' );
				if( isPlaying ) {
					_this.getPlayer().play();
				}
			};

			this.getPlayer().layoutBuilder.displayMenuOverlay( $moderationScreen, closeCallback );
		},
		submitFlag: function(flagObj) {
			var _this = this;

			this.getPlayer().layoutBuilder.closeMenuOverlay();
			this.getPlayer().addPlayerSpinner();

			this.getKalturaClient().doRequest( {
				'service' : 'baseentry',
				'action' : 'flag',
				'moderationFlag:objectType' : 'KalturaModerationFlag',
				'moderationFlag:flaggedEntryId' : _this.getPlayer().kentryid,
				'moderationFlag:flagType' : flagObj.flagType,
				'moderationFlag:comments' : flagObj.flagComments
			}, function( data ) {
				_this.getPlayer().hideSpinner();
				var $flagScreen = $( '<div />' )
					.append(
						$( '<h3 />' ).text( 'Thank you for sharing your concerns' ),
						$( '<div />' ).append(
							$( '<button />' )
								.addClass( 'ui-state-default ui-corner-all copycode' )
								.text( 'Done' )
								.click(function() {
									_this.getPlayer().triggerHelper( 'onEnableKeyboardBinding' );
									_this.getPlayer().layoutBuilder.closeMenuOverlay();
								})
						)
					);
				_this.getPlayer().layoutBuilder.displayMenuOverlay( $flagScreen );
			});
		},
		getComponent: function(){
			var _this = this;
			if( !this.$el ){
				this.$el = $( '<button />' )
								.addClass( 'btn icon-flag' + this.getCssClass() )
								.attr({
									'title': this.getConfig('tooltip')
								})
								.click( function(){
									_this.drawModal();
								});
			}
			return this.$el;
		}
	}));

})( window.mw, window.jQuery );