// Wrap in mw
( function( mw, $ ) {

// Check for new Embed Player events: 
$( mw ).bind( 'newEmbedPlayerEvent', function( event, embedPlayer ){
	// Check for KalturaSupport uiConf
	$( embedPlayer ).bind( 'KalturaSupport_CheckUiConf', function( event, $uiConf, callback ){
		// get the captions plugin name list from config: 
		var captionPluginNames = ['closedCaptions', 'closedCaptionsUnderPlayer', 
                                  'closedCaptionsOverPlayer',  'closedCaptionsFlexible'];
		var captionPluginName;
		for( var i =0; i < captionPluginNames.length; i++ ){
			captionPluginName = captionPluginNames[i];
			if( embedPlayer.isPluginEnabled( captionPluginName ) ){
				 captionPlugin( embedPlayer, captionPluginName, callback );
				 return ;
			}
		};
		// no caption plugin enabled continue player build out 
		callback();
	});
});

window.captionPlugin = function( embedPlayer, captionPluginName, callback){
	// Load the Kaltura TimedText and TimedText Module:
	mw.load( [ "TimedText", "mw.KTimedText" ], function() {
		// Add captions to the player
		new mw.KTimedText( embedPlayer, captionPluginName, callback ); 
	});
};

})( window.mw, jQuery );
