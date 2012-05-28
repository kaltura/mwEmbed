(function( mw, kWidget ) { "use strict";
	
var playerConfig = mw.getConfig( 'KalturaSupport.PlayerConfig' );
var playerId = mw.getConfig( 'EmbedPlayer.IframeParentPlayerId');

var removeElement = function( elemId ) {
	if( document.getElementById( elemId ) ){
		try{
			var el = document.getElementById( elemId );
			el.parentNode.removeChild(el);
		}catch(e){
			// failed to remove element
		}
	}
};

if( kWidget.isUiConfIdHTML5( playerConfig.uiConfId ) || !( kWidget.supportsFlash() || mw.getConfig( 'Kaltura.ForceFlashOnDesktop' )) ){
	// remove the no_rewrite flash object ( never used in rewrite )
	removeElement('kaltura_player_iframe_no_rewrite');
	// Load the mwEmbed resource library and add resize binding
	mw.ready( function(){
		// Try again to remove the flash player if not already removed: 
		$('#kaltura_player_iframe_no_rewrite').remove();

		var embedPlayer = $( '#' + playerId )[0];
		// Try to seek to the IframeSeekOffset time:
		if( mw.getConfig( 'EmbedPlayer.IframeCurrentTime' ) ){
			embedPlayer.currentTime = mw.getConfig( 'EmbedPlayer.IframeCurrentTime' );					
		}
		// Maintain play state for html5 browsers
		if( mw.getConfig('EmbedPlayer.IframeIsPlaying') ){
			embedPlayer.play();
		}
		

		function getWindowSize(){
			return {
				'width' : $( window ).width(),
				'height' : $( window ).height()
			};
		};
		function doResizePlayer(){
			var embedPlayer = $( '#' + playerId )[0];						
			embedPlayer.resizePlayer( getWindowSize() );
		};
		// Bind window resize to reize the player:
		$( window ).resize( doResizePlayer );

		// Resize the player per player on ready
		if( mw.getConfig('EmbedPlayer.IsFullscreenIframe') ){
			doResizePlayer();
		}
	});
} else {
	// Remove the video tag and output a clean "object" or file link
	// ( if javascript is off the child of the video tag so would be played,
	//  but rewriting gives us flexiblity in in selection criteria as
	// part of the javascript check kIsHTML5FallForward )
	removeElement( 'videoContainer' );

	if( kWidget.supportsFlash() || mw.getConfig( 'Kaltura.ForceFlashOnDesktop' ) ){				
		// Write out the embed object
		document.write( kSettings.flashEmbedHTML );

	} else {
		/*
		kWidget.outputDirectDownload( 'directFileLinkContainer', {
			'id': playerId,
			'partner_id': playerConfig.partnerId,
			'uiconf_id': playerConfig.uiConfId,
			'entry_id': playerConfig.entryId,
			'height' : '100%',
			'width' : '100%'
		});	
		
		window.kCollectCallback = function(){ return ; }; // callback for jsonp
		window.Kaltura = true;
		document.getElementById('directFileLinkButton').onclick = function() {
			kWidget.appendScriptUrl( kSettings.playEventURL + '&callback=kCollectCallback' );
			return true;
		};		
		
		// Trigger jsCallbackReady
		try {
			window.parent.kWidget.setupJsApi( playerId );
			window.parent.kWidget.jsCallbackReady( playerId );
		} catch ( e ) {
			// do nothing
		}
		*/
	}
}
})( window.mw, window.kWidget );