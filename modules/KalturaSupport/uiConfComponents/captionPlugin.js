// Wrap in mw
// Check for new Embed Player events: 
$j( mw ).bind( 'newEmbedPlayerEvent', function( event, embedPlayer ){

	// Check for KalturaSupport uiConf
	$j( embedPlayer ).bind( 'KalturaSupport_CheckUiConf', function( event, $uiConf, callback ){
		var captionConfig = kWidgetSupport.getPluginConfig(
				embedPlayer,
				$uiConf, 
				'closedCaptions', 
				[ 'plugin', 'relativeTo', 'position', 'width', 'height', 'skin', 'bg',
				 'fontsize', 'opacity', 'fontFamily', 'type',  'ccUrl' ]
		);
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

