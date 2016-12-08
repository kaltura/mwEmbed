/**
* EmbedPlayer loader
*/
( function( mw, $ ) {
	/**
	* Add a DOM ready check for player tags
	*
	* We use 'SetupInterface' binding so other code that depend on the video interface can
	* work after the 'IntefacesReady' event
	*/
	$( mw ).bind( 'SetupInterface', function( event, callback ){
		// Check if we have tags to rewrite:
		if( $( mw.getConfig( 'EmbedPlayer.RewriteSelector' )  ).length ) {
			// Rewrite the embedPlayer EmbedPlayer.RewriteSelector and run callback once ready:
			$( mw.getConfig( 'EmbedPlayer.RewriteSelector' ) )
				.embedPlayer( callback );
		} else {
			callback();
		}
	});

	/**
	* Add the mwEmbed jQuery loader wrapper
	*/
	$.fn.embedPlayer = function( readyCallback ){
		var playerSelect;
		if( this.selector ){
			playerSelect = this.selector;
		} else {
			playerSelect = this;
		}
		mw.log( 'jQuery.fn.embedPlayer :: ' + playerSelect );

		// Set up the embed video player class request: (include the skin js as well)
		var dependencySet = [
			'mw.EmbedPlayer'
		];

		// TODO move mw.EmbedPlayerNativeComponent DEP HERE

		var rewriteElementCount = 0;
		$( playerSelect).each( function(index, playerElement){
			// Make sure the playerElement has an id:
			if( !$( playerElement ).attr('id') ){
				$( playerElement ).attr( "id", 'mwe_vid' + ( index ) );
			}
			// apply spinner to outer container ( video does not have size while loading in firefox )
			var $spinerTarget = $( playerElement ).parents('.mwPlayerContainer');
			if( !$spinerTarget.length ){
				$spinerTarget = $( playerElement );
			}
			$spinerTarget.getAbsoluteOverlaySpinner()
			.attr('id', 'loadingSpinner_' + $( playerElement ).attr('id') );

			// Allow other modules update the dependencies
			$( mw ).trigger( 'EmbedPlayerUpdateDependencies',
					[ playerElement, dependencySet ] );
			
		});

		// Remove any duplicates in the dependencySet:
		dependencySet = $.unique( dependencySet );
		var processPlayer = function(){
			// Setup enhanced language support:
			 window.gM = mw.jqueryMsg.getMessageFunction( {} );
			mw.processEmbedPlayers( playerSelect , readyCallback );
		};

		if (window.inlineScript){
			var processPlayerIntervalMaxTries = 20;
			var processPlayerInterval = setInterval(function(){
				if (mw && mw.processEmbedPlayers) {
					clearInterval(processPlayerInterval);
					processPlayerInterval = null;
					processPlayer();
				}
				processPlayerIntervalMaxTries--;
				if (processPlayerIntervalMaxTries === 0){
					clearInterval(processPlayerInterval);
					showPlayerError();
				}
			} ,0);

			return;
		}

		// Do the request and process the playerElements with updated dependency set
		mediaWiki.loader.using( dependencySet, function(){
			processPlayer();
		}, function( e ){
			showPlayerError(e);
		});

		function showPlayerError(e){
			$( playerSelect).each( function(index, playerElement){
				// apply spinner to outer container ( video does not have size while loading in firefox )
				var $spinerTarget = $( playerElement ).parents('.mwPlayerContainer');
				if( !$spinerTarget.length ){
					$spinerTarget = $( playerElement );
				}

				//Remove spinner
				$spinerTarget
					.parent()
					.find('#loadingSpinner_' + $( playerElement ).attr('id') )
					.remove();

				//Set default error message and props
				var defaultErrorObj = {
					title:  'Player failed',
					message: 'The player or one of its dependencies have failed loading',
					buttons: null,
					noButtons: true,
					callbackFunction:  null,
					isExternal: true,
					props: {
						textColor: null,
						titleTextColor: null,
						buttonRowSpacing: null,
						buttonHeight: null,
						buttonSpacing: null
					}
				};

				var loaderObj = mw.getConfig( 'EmbedPlayer.loader' );
				var loaderErrorObj = loaderObj && loaderObj.error || {};
				var errorObj = $.extend({}, defaultErrorObj, loaderErrorObj);

				//Create the error element
				var errorElem = createErrorMessage(errorObj);
				//Add error dialog to screen
				$spinerTarget
					.parent()
					.append($("<div />" )
						.attr('id', 'errorMessage_' + $( playerElement ).attr('id') )
						.css({
							'visibility': 'visible',
							'position': 'absolute',
							'left': '0px',
							'top': '0px',
							'width': '100%',
							'height': '100%',
							'text-align': 'center',
							'z-index': '1000'
						})
						.append(errorElem)
				);

			});
			throw new Error( 'Error loading EmbedPlayer dependency set: ' + (e && e.message)  );
		}

		function createErrorMessage(alertObj) {
			var $container = $( '<div />' ).addClass( 'alert-container' );
			var $title = $( '<div />' ).text( alertObj.title ).addClass( 'alert-title alert-text' );
			if ( alertObj.props && alertObj.props.titleTextColor ) {
				$title.removeClass( 'alert-text' );
				$title.css( 'color', mw.getHexColor( alertObj.props.titleTextColor ) );
			}
			var $message = $( '<div />' ).html( alertObj.message ).addClass( 'alert-message alert-text' );
			if ( alertObj.isError ) {
				$message.addClass( 'error' );
			}
			if ( alertObj.props && alertObj.props.textColor ) {
				$message.removeClass( 'alert-text' );
				$message.css( 'color', mw.getHexColor( alertObj.props.textColor ) );
			}
			var $buttonsContainer = $( '<div />' ).addClass( 'alert-buttons-container' );
			if ( alertObj.props && alertObj.props.buttonRowSpacing ) {
				$buttonsContainer.css( 'margin-top', alertObj.props.buttonRowSpacing );
			}
			var $buttonSet = alertObj.buttons || [];

			// If no button was passed display just OK button
			var buttonsNum = $buttonSet.length;
			if ( buttonsNum == 0 && !alertObj.noButtons ) {
				$buttonSet = ["OK"];
				buttonsNum++;
			}

			if ( buttonsNum > 0 ) {
				$container.addClass( 'alert-container-with-buttons' );
			}

			var callback = function () {};

			if ( typeof alertObj.callbackFunction == 'string' ) {
				if ( alertObj.isExternal ) {
					try {
						callback = window.parent[ alertObj.callbackFunction ];
					} catch ( e ) {
						// could not call parent method
					}
				} else {
					callback = window[ alertObj.callbackFunction ];
				}
			} else if ( typeof alertObj.callbackFunction == 'function' ) {
				callback = alertObj.callbackFunction;
			}

			$.each( $buttonSet, function(i) {
				var label = this.toString();
				var $currentButton = $( '<button />' )
					.addClass( 'alert-button' )
					.text( label )
					.click( function( eventObject ) {
						callback( eventObject );
						closeErrorMessage( alertObj.keepOverlay );
					} );
				if ( alertObj.props && alertObj.props.buttonHeight ) {
					$currentButton.css( 'height', alertObj.props.buttonHeight );
				}
				// Apply buttons spacing only when more than one is present
				if (buttonsNum > 1) {
					if (i < buttonsNum-1) {
						if ( alertObj.props && alertObj.props.buttonSpacing ) {
							$currentButton.css( 'margin-right', alertObj.props.buttonSpacing );
						}
					}
				}
				$buttonsContainer.append( $currentButton );
			} );
			return $container.append( $title, $message, $buttonsContainer );
		}
		function closeErrorMessage( keepOverlay ) {
			var $alert = $(".alert-container");
			mw.log( 'closeAlert' );
			$alert.remove();
			return false; // onclick action return false;
		}
	};


} )( window.mediaWiki, window.jQuery );
