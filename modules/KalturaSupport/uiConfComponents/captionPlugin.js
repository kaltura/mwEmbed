// Wrap in mw
// Check for new Embed Player events: 
$j( mw ).bind( 'newEmbedPlayerEvent', function( event, embedPlayer ){

	// Check for KalturaSupport uiConf
	$j( embedPlayer ).bind( 'KalturaSupport_CheckUiConf', function( event, $uiConf, callback ){

		// Old closeCaption plugin
		var oldCaptionConfig = kWidgetSupport.getPluginConfig(
				embedPlayer,
				$uiConf, 
				'closedCaptions', 
				[ 'plugin', 'relativeTo', 'position', 'width', 'height', 'skin', 'bg',
				 'fontsize', 'opacity', 'fontFamily', 'type',  'ccUrl', 'timeOffset' ]
		);

		// closeCaption Under player plugin
		var underCaptionConfig = kWidgetSupport.getPluginConfig(
				embedPlayer,
				$uiConf, 
				'closedCaptionsUnderPlayer', 
				[ 'plugin', 'width', 'height', 'fontsize', 'bg', 'fontcolor', 'opacity', 'fontFamily' ]
		);

		// closeCaption Over player plugin
		var overCaptionConfig = kWidgetSupport.getPluginConfig(
				embedPlayer,
				$uiConf,
				'closedCaptionsOverPlayer',
				[ 'plugin', 'width', 'height', 'fontsize', 'bg', 'fontColor', 'opacity',
					'fontFamily', 'useGlow', 'glowColor', 'glowBlur' ]
		);

		// Select the available plugin
		var captionConfig = { plugin: false };
		if( oldCaptionConfig && oldCaptionConfig.plugin ) {
			captionConfig = oldCaptionConfig;
		} else if( underCaptionConfig && underCaptionConfig.plugin ) {
			captionConfig = underCaptionConfig;
		} else if( overCaptionConfig && overCaptionConfig.plugin ) {
			captionConfig = overCaptionConfig;
		}

		// TODO: remove check for TempCaptions once Eagle is out
		if( captionConfig.plugin || mw.getConfig('Kaltura.TempCaptions')){
			captionPlugin( embedPlayer, captionConfig ,  callback );
		} else {
			callback();
		}
	});
});

var captionPlugin = function( embedPlayer, captionConfig, callback){
	// Load the Kaltura TimedText and TimedText Module:
	mw.load( [ "TimedText", "mw.KTimedText" ], function() {
		// Add captions to the player
		embedPlayer.timedText = new mw.KTimedText( embedPlayer, captionConfig ); 
		mw.log("CaptionPlugin: done registering captions, run callback");
		callback();
	});
};

