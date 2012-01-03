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
				 'fontsize', 'opacity', 'fontFamily', 'type',  'ccUrl', 'timeOffset',
				 'hideClosedCaptions' ]
		);

		// closeCaption Under player plugin
		var underCaptionConfig = embedPlayer.getKalturaConfig(
				'closedCaptionsUnderPlayer', 
				[ 'plugin', 'width', 'height', 'fontsize', 'bg', 'fontcolor', 'opacity', 
				  'fontFamily', 'timeOffset', 'hideClosedCaptions' ]
		);

		var playerOverConfig = [ 'plugin', 'width', 'height', 'fontsize', 'bg', 'fontColor', 'opacity',
				'fontFamily', 'useGlow', 'glowColor', 'glowBlur', 'timeOffset', 
				'hideClosedCaptions' ];
		
		// CloseCaption Over player plugin
		var overCaptionConfig = embedPlayer.getKalturaConfig( 'closedCaptionsOverPlayer', playerOverConfig );
		
		// Check for alternate name for closedCaptionsOverPlayer
		if( !overCaptionConfig || ! overCaptionConfig.plugin ){
			overCaptionConfig = embedPlayer.getKalturaConfig( 'closedCaptionsFlexible', playerOverConfig );
		}

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
			// No active plugin mode
			callback();
		}
	});
});

window.captionPlugin = function( embedPlayer, captionConfig, callback){
	// Load the Kaltura TimedText and TimedText Module:
	mw.load( [ "TimedText", "mw.KTimedText" ], function() {
		// Add captions to the player
		new mw.KTimedText( embedPlayer, captionConfig ); 
		mw.log("CaptionPlugin: done registering captions, run callback");
		callback();
	});
};

})( window.mw, jQuery );
