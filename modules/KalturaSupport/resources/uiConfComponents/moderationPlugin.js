( function( mw, $ ) { "use strict";

	mw.PluginManager.add( 'moderation', mw.KBaseScreen.extend({

		defaultConfig: {
			"parent": mw.isMobileDevice() ? 'topBarContainer' : 'controlsContainer',
			"order": 62,
			"displayImportance": "low",
			"align": "right",
			"showTooltip": true,
			"smartContainer": 'morePlugins',
			"smartContainerCloseEvent": 'closeMenuOverlay',
			"minDescriptionLength" : 0,
			"title": gM("ks-MODERATION-REPORT"),
			"header": gM("ks-MODERATION-HEADER"),
			"text": gM("ks-MODERATION-TEXT"),
			"placeholder": gM("ks-MODERATION-PLACEHOLDER"),
			"tooltip": gM("ks-MODERATION-REPORT"),
			"reasonSex": gM("ks-MODERATION-REASON-SEX"),
			"reasonViolence": gM("ks-MODERATION-REASON-VIOLENCE"),
			"reasonHarmful": gM("ks-MODERATION-REASON-HARMFUL"),
			"reasonSpam": gM("ks-MODERATION-REASON-SPAM")
		},

		setup: function () {
			this.addBindings();
		},

		addBindings: function () {
			this.bind('onChangeMedia', $.proxy(function () {
				this.getPlayer().triggerHelper( 'onEnableKeyboardBinding' );
				$(this.getPlayer().getPlayerElement()).removeClass( "blur" );
				this.getPlayer().getPlayerPoster().removeClass( "blur" );
			}, this));
		},
		getScreen: function(){
			return $.Deferred().resolve(this.screen);
		},
		drawModal: function() {
			if (this.isDisabled) return;
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
				$('<div></div>').append(
						$('<i></i>')
							.addClass("icon-toggle")).append(
				$( '<select />' )
					.attr( 'id','flagType' )
					.append(
						$( '<option />' ).attr( 'value', 1 ).text( _this.getConfig( 'reasonSex' ) ),
						$( '<option />' ).attr( 'value', 2 ).text( _this.getConfig( 'reasonViolence' ) ),
						$( '<option />' ).attr( 'value', 3 ).text( _this.getConfig( 'reasonHarmful' ) ),
						$( '<option />' ).attr( 'value', 4 ).text( _this.getConfig( 'reasonSpam' ) )
					)
					.css({'width': '100%', 'height': '26px', 'margin': '10px 0 10px 0'})),
				$( '<label for="flagComments">'+ gM("ks-MODERATION-PLACEHOLDER" ) +'</label>' ),
				$( '<textarea />' )
					.attr( 'id', 'flagComments' )
					.bind('input propertychange', function() {
						if( $(this).val().length == _this.getConfig("minDescriptionLength")){
						$(this).removeClass("validationError");
						}
					})
					.css({'width': '100%', 'height': '40px', 'margin-top': '10px'}),
				$('<div/>' ).append(
					$( '<div />' )
					.addClass( 'reportButton right' )
					.text( gM("ks-MODERATION-SUBMIT-BTN") )
					.attr( 'tabindex',0 )
					.attr( 'role', 'button')
					.click(function() {
						_this.submitFlag({
							'flagType': $( '#flagType' ).val(),
							'flagComments': $( '#flagComments' ).val()
						});
					}) )
			);
			if (mw.isAndroid()){
				$moderationMessage.find(".icon-toggle").remove();
			}
			var $moderationScreen = $( '<div />' ).append($header, $moderationMessage );

			var closeCallback = function() {
				// Enable space key binding
				_this.hideScreen();
				_this.getPlayer().triggerHelper( 'onEnableKeyboardBinding' );
				$(_this.getPlayer().getPlayerElement()).removeClass( "blur" );
				_this.getPlayer().getPlayerPoster().removeClass( "blur" );
				if( isPlaying ) {
					_this.getPlayer().play();
				}
			};
			this.screen = $moderationScreen;
			this.showScreen();

			this.showModal($moderationScreen, closeCallback);
		},
		showModal: function(screen, closeCallback){
			this.getPlayer().disablePlayControls();
			this.getPlayer().layoutBuilder.displayMenuOverlay( screen, closeCallback );
			$(this.getPlayer().getPlayerElement()).addClass("blur");
			this.getPlayer().getPlayerPoster().addClass("blur");
			this.getPlayer().triggerHelper( 'moderationOpen' );
		},
		closeModal: function(){
			this.getPlayer().enablePlayControls();
			$( this.getPlayer().getPlayerElement() ).removeClass( "blur" );
			this.getPlayer().getPlayerPoster().removeClass( "blur" );
			this.getPlayer().layoutBuilder.closeMenuOverlay();
		},
		submitFlag: function(flagObj) {
			var _this = this;
			//validation length of description check
			if (_this.getConfig("minDescriptionLength") != 0 && flagObj.flagComments.length < this.getConfig("minDescriptionLength")  ){
				this.screen.find("#flagComments").addClass("validationError");
				return;
			}
			this.getPlayer().triggerHelper( 'moderationSubmit', flagObj.flagType );
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
						$( '<h3 />' ).text( gM("ks-MODERATION-THANKS") ),
						$( '<div />' ).append(
							$( '<div />' )
								.addClass( 'reportButton' )
								.text( gM("ks-MODERATION-DONE") )
								.click(function() {
									_this.getPlayer().triggerHelper( 'onEnableKeyboardBinding' );
									_this.closeModal();
								})
						)
					);
				_this.getPlayer().layoutBuilder.displayMenuOverlay( $flagScreen );
			},
			false,
			function(error){
				_this.log("Error sending report to server: " + error);
				_this.getPlayer().layoutBuilder.closeMenuOverlay();
			});
		},
		getComponent: function(){
			var _this = this;
			if( !this.$el ){
				var tooltipLabel = this.getConfig('tooltip');
				this.$el = $( '<button />' )
								.addClass( 'btn icon-flag' + this.getCssClass() )
								.attr({
									'title': tooltipLabel
								})
								.click( function(){
									_this.drawModal();
								});
				this.setAccessibility(this.$el, tooltipLabel);
			}
			return this.$el;
		}
	}));

})( window.mw, window.jQuery );