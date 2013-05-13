/**
 * Caption plugin
 *
 * @dependencies
 * 		"mw.TimedText", "mw.KTimedText"
 */
( function( mw, $ ) { "use strict";

mw.addKalturaConfCheck( function( embedPlayer, callback ){
	// get the captions plugin name list from config:
	var captionPluginNames = ['closedCaptions', 'closedCaptionsUnderPlayer',
							  'closedCaptionsOverPlayer',  'closedCaptionsFlexible'];
	var captionPluginName;
	for( var i =0; i < captionPluginNames.length; i++ ){
		captionPluginName = captionPluginNames[i];

		if( embedPlayer.isPluginEnabled( captionPluginName ) ){
			mw.load(['mw.TimedText', 'mw.KTimedText'], function(){
				new mw.KTimedText( embedPlayer, captionPluginName, callback );
			})
			return ;
		}
	};
	// no caption plugin enabled continue player build out
	callback();
});


})( window.mw, jQuery );
