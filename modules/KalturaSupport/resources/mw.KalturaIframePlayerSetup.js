( function( mw, $, playerData ) { "use strict";

	function resolvePlayerConfig(serverSettings, clientSettings){
		var resolvedSettings = jQuery.extend(true, {}, serverSettings);

		if (serverSettings.vars["inlineScript"] && (clientSettings !== null)) {

			var clientFlashvars = clientSettings.flashvars;
			var clientPlugins = {};
			var clientVars = {};

			//Categorize client flashvars to plugins and vars
			$.each(clientFlashvars, function (name, value) {
				//Check if uiVar can be overridden from server side, if not then set
				//TODO: exclude $pluginId == 'Kaltura' || $pluginId == 'EmbedPlayer' || $pluginId == 'KalturaSupport'
				if ($.isPlainObject(value)) {
					clientPlugins[name] = value;
				} else {
					clientVars[name] = value;
				}
			});

			//Resolve player vars, with respect to uiVar override settings
			if (serverSettings && serverSettings.uiVars) {
				//Get all vars from server
				var resolvedVars = resolvedSettings.vars;
				var serverUiVars = serverSettings.uiVars;
				//Iterate over server configuration
				$.each(serverUiVars, function (i, serverUiVar) {
					var name = serverUiVar.key;
					//Check if uiVar can be overridden from server side, if not then set client side var if it exist
					if (clientVars[name] && !serverUiVar.overrideFlashvar) {
						resolvedVars[name] = clientVars[name];
					}
				});
				//Set all client vars that don't exist at all in uiConf
				$.each(clientVars, function (name, value) {
					if (!resolvedVars[name]) {
						resolvedVars[name] = value;
					}
				});
			}
			//Combine the plugins data
			$.extend(true, resolvedSettings.plugins, clientPlugins);
		}
		return resolvedSettings;
	}
	//Check if we are a friendly iframe:
	try {
		if( window['parent'] && window['parent']['kWidget'] && window !== window['parent'] ){
			mw.config.set( 'EmbedPlayer.IsFriendlyIframe', true );
		} else{
			mw.config.set( 'EmbedPlayer.IsFriendlyIframe', false );
		}
	} catch(e) {
		mw.config.set( 'EmbedPlayer.IsFriendlyIframe', false );
	}

	// Parse any configuration options passed via window['parent']
	if( mw.config.get( 'EmbedPlayer.IsFriendlyIframe' ) ){
		try {
			if( window['parent'] && window['parent']['preMwEmbedConfig'] ){
				// Grab config from parent frame:
				mw.config.set( window['parent']['preMwEmbedConfig'] );
				// Set the "iframeServer" to the current domain ( do not include hash tag )
				mw.config.set( 'EmbedPlayer.IframeParentUrl', document.URL.replace(/#.*/, '' ) );
			}
		} catch( e ) {
			// not set via hash
		}
	} else {
		// for iframe share, or no-client-side js popup window players
		try{
			var hashString = window.location.hash;
			if ( hashString ) {
				var hashObj = JSON.parse( decodeURIComponent ( hashString.replace( /^#/, '' ) ) );
				if( hashObj && hashObj.mwConfig ){
					mw.config.set( hashObj.mwConfig );
				}
			}
		} catch( e ) {
			kWidget.log( "KalturaIframePlayerSetup, could not get configuration " );
		}
	}
	var serverSettings = playerData['playerConfig'];
	var clientSettings = mw.getConfig("widgetOriginalSettings_" + playerData.playerId);
	var playerConfig = resolvePlayerConfig(serverSettings, clientSettings);

	// Set the main KalturaSupport.PlayerConfig var:
	mw.config.set( 'KalturaSupport.PlayerConfig', playerConfig );

	// We should first read the config for the hashObj and after that overwrite with our own settings
	// The entire block below must be after mw.config.set( hashObj.mwConfig );

	// Don't do an iframe rewrite inside an iframe
	mw.config.set( 'Kaltura.IframeRewrite', false );

	// Set a prepend flag so its easy to see what's happening on client vs server side of the iframe:
	mw.config.set( 'Mw.LogPrepend', 'iframe:');

	// Don't rewrite the video tag from the loader ( if html5 is supported it will be
	// invoked below and respect the persistent video tag option for iPad overlays )
	mw.config.set( 'Kaltura.LoadScriptForVideoTags', false );

	// Don't wait for player metadata for size layout and duration Won't be needed since
	// we add durationHint and size attributes to the video tag
	mw.config.set( 'EmbedPlayer.WaitForMeta', false );

	mw.config.set( 'EmbedPlayer.IframeParentPlayerId', playerData['playerId'] );

	// Set uiConf global vars for this player ( overrides on-page config )
	mw.config.set( playerData['enviornmentConfig'] );

	// Remove the fullscreen option if we are in an iframe:
	if( mw.config.get('EmbedPlayer.IsFullscreenIframe') ){
		mw.config.set('EmbedPlayer.EnableFullscreen', false );
	} else {
		// If we don't get a 'EmbedPlayer.IframeParentUrl' update fullscreen to pop-up new
		// window. ( we won't have the iframe api to resize the iframe )
		if( mw.config.get( 'EmbedPlayer.IframeParentUrl' ) === null && !mw.config.get( 'EmbedPlayer.ForceNativeComponent' ) ){
			mw.config.set( 'EmbedPlayer.NewWindowFullscreen', true );
			mw.config.set( 'EmbedPlayer.EnableIpadNativeFullscreen', true );
		}
	}

	var removeElement = function( elemId ) {
		if( document.getElementById( elemId ) ){
			try {
				var el = document.getElementById( elemId );
				el.parentNode.removeChild(el);
			} catch ( e ){
				// Failed to remove element
			}
		}
	};

	if( kWidget.isUiConfIdHTML5( playerData.playerConfig.uiConfId )
			||
		!( kWidget.supportsFlash() || mw.config.get( 'Kaltura.ForceFlashOnDesktop' ) )
	){
		// remove the no_rewrite flash object ( never used in rewrite )
		removeElement('kaltura_player_iframe_no_rewrite');

		// Issue the embedPlayer call:
		$( '#' + playerData.playerId ).embedPlayer( function(){
			// Try again to remove the flash player if not already removed:
			$('#kaltura_player_iframe_no_rewrite').remove();

			var embedPlayer = $( '#' + playerData.playerId )[0];
			// Try to seek to the IframeSeekOffset time:
			if( mw.config.get( 'EmbedPlayer.IframeCurrentTime' ) ){
				embedPlayer.currentTime = mw.config.get( 'EmbedPlayer.IframeCurrentTime' );
			}
			// Maintain play state for html5 browsers
			if( mw.config.get('EmbedPlayer.IframeIsPlaying') ){
				embedPlayer.play();
			}
		});
	} else {
		mw.log("Error: KalturaIframePlayer:: rendering flash player after loading html5 lib");
	}

	// Handle server errors
	if( playerData.error ){
		$('body').append(
			$('<div />')
				.attr('id', 'error')
				.html(playerData.error)
		);
	}

})( window.mw, window.jQuery, window.kalturaIframePackageData );
