// Wrap in mw
( function( mw, $ ) {
// Check for new Embed Player events: 
$( mw ).bind( 'newEmbedPlayerEvent', function( event, embedPlayer ){
	// Check for KalturaSupport uiConf
	$( embedPlayer ).bind( 'KalturaSupport_CheckUiConf', function( event, $uiConf, callback ){
		// Old closeCaption plugin
		var oldCaptionConfig = embedPlayer.getKalturaConfig(
				'closedCaptions', 
				[ 'plugin', 'relativeTo', 'position', 'width', 'height', 'skin', 'bg',
				 'fontsize', 'opacity', 'fontFamily', 'type',  'ccUrl', 'timeOffset' ]
		);

		// closeCaption Under player plugin
		var underCaptionConfig = embedPlayer.getKalturaConfig(
				'closedCaptionsUnderPlayer', 
				[ 'plugin', 'width', 'height', 'fontsize', 'bg', 'fontcolor', 'opacity', 'fontFamily', 'timeOffset' ]
		);

		// closeCaption Over player plugin
		var overCaptionConfig = embedPlayer.getKalturaConfig(
				'closedCaptionsOverPlayer',
				[ 'plugin', 'width', 'height', 'fontsize', 'bg', 'fontColor', 'opacity',
					'fontFamily', 'useGlow', 'glowColor', 'glowBlur', 'timeOffset' ]
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

		if( captionConfig.plugin ){
			captionPlugin( embedPlayer, captionConfig ,  callback );
		} else {
			callback();
		}
	});
});

window.captionPlugin = function( embedPlayer, captionConfig, callback){
	// Load the Kaltura TimedText and TimedText Module:
	mw.load( [ "TimedText", "mw.KTimedText" ], function() {
		// Add captions to the player
		embedPlayer.timedText = new mw.KTimedText( embedPlayer, captionConfig ); 
		mw.log("CaptionPlugin: done registering captions, run callback");
		callback();
	});
};

})( window.mw, jQuery );
