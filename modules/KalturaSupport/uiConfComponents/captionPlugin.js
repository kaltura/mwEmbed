// Wrap in mw
// Check for new Embed Player events: 
$j( mw ).bind( 'newEmbedPlayerEvent', function( event, embedPlayer ){

	// Check for KalturaSupport uiConf
	$j( embedPlayer ).bind( 'KalturaSupport_CheckUiConf', function( event, $uiConf, callback ){
		// Check if the kaltura caption plugin is enabled:
		var attributes = {};
		var closedCaptionsVar = $uiConf.find( 'uiVars var[key="closedCaptions.plugin"]' )[0];
		if( closedCaptionsVar ) {
			$j( closedCaptionsVar.attributes ).each( function(inx, attr) {
				attributes[attr.nodeName] = attr.nodeValue;
			});
		}

		// TODO: remove this when Eagle is out 
		var enableCaption = false;
		if( mw.getConfig('Kaltura.TempCaptions') ) {
			enableCaption = true;
		}
		// End remove

		if( (attributes.key == "closedCaptions.plugin" && attributes.value == "true") || enableCaption ) {
			captionPlugin( embedPlayer, callback );
		} else {
			callback();
		}
	});
});

var captionPlugin = function( embedPlayer, callback){
	// Load the Kaltura Captions and TimedText Module:
	mw.load( [ "TimedText", "mw.KCaptions" ], function() {
		// Add captions to the player
		mw.KCaptionsLoader( embedPlayer, function() {
			mw.log("CaptionPlugin: done registering captions, run callback");
			callback();
		});
		
	});
};

