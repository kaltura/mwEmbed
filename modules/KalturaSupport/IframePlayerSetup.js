(function( mw ) {
	
var playerConfig = mw.getConfig( 'KalturaSupport.PlayerConfig' );

if( kWidget.isUiConfIdHTML5( playerConfig.uiConfId ) ){
		// remove the no_rewrite flash object ( never used in rewrite )
		var obj = document.getElementById('kaltura_player_iframe_no_rewrite');
		if( obj ){
			try {
				document.getElementById( mw.getConfig( 'EmbedPlayer.IframeParentPlayerId') ).removeChild( obj );
			} catch( e ){
				// could not remove node
			}
		}
		// Load the mwEmbed resource library and add resize binding
		mw.ready(function(){
			// Try again to remove the flash player if not already removed: 
			$('#kaltura_player_iframe_no_rewrite').remove();

			var embedPlayer = $( '#' + mw.getConfig( 'EmbedPlayer.IframeParentPlayerId') )[0];
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
				var embedPlayer = $( '#' + mw.getConfig( 'EmbedPlayer.IframeParentPlayerId') )[0];						
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
	if( document.getElementById( 'videoContainer' ) ){
		try{
			var el = document.getElementById( 'videoContainer' );
			el.parentNode.removeChild(el);
		}catch(e){
			// failed to remove video container
		}
	}

	if( kWidget.supportsFlash() || mw.getConfig( 'Kaltura.ForceFlashOnDesktop' ) ){				
		// Write out the embed object
		document.write( kSettings.flashEmbedHTML );

	} else {

		// Last resort just provide an image with a link to the file
		// NOTE we need to do some platform checks to see if the device can
		// "actually" play back the file and or switch to 3gp version if nessesary.
		// also we need to see if the entryId supports direct download links
		// TODO: we should remove this fallback and create new EmbedPlayer type that will link to the optimnize flavor
		document.write( kSettings.fileLinkHTML );

		var thumbSrc = kWidget.getKalturaThumbUrl({
			'entry_id' : playerConfig.entryId,
			'partner_id' : playerConfig.partnerId,
			'height' : ( document.body.clientHeight )? document.body.clientHeight : '300',
			'width' : ( document.body.clientHeight )? document.body.clientHeight : '400'
		});
		setTimeout( function() {
			document.getElementById( 'directFileLinkThumb' ).innerHTML = '<img style="width:100%;height:100%" src="' + thumbSrc + '" >';
		}, 0);


		window.kCollectCallback = function(){ return ; }; // callback for jsonp

		document.getElementById('directFileLinkButton').onclick = function() {
			kWidget.appendScriptUrl( kSettings.playEventURL + '&callback=kCollectCallback' );
			return true;
		};
	}
}
})( window.mw );