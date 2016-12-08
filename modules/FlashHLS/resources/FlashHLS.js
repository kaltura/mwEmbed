( function( mw, $ ) {"use strict";
	// Add chromecast player:
	$( mw ).bind('EmbedPlayerUpdateMediaPlayers', function( event, mediaPlayers ){
		var FlashHLSSupportedProtocols = ['application/vnd.apple.mpegurl'];
		var FlashHLSPlayer = new mw.MediaPlayer( 'FlashHLS', FlashHLSSupportedProtocols, 'FlashHLS' );
       // if (mw.isIE() && mw.getUserOS() === "Windows 7") {
            mediaPlayers.players = [];
        //}
        mediaPlayers.addPlayer( FlashHLSPlayer );
		// add 
		$.each( FlashHLSSupportedProtocols, function(inx, mimeType){
			if( mediaPlayers.defaultPlayers[ mimeType ] ){
				mediaPlayers.defaultPlayers[ mimeType ].push( 'FlashHLS' );
				return true;
			}
			mediaPlayers.defaultPlayers[ mimeType ] = ['FlashHLS'];
		});
	});

	mw.PluginManager.add( 'flashhls', mw.KBaseComponent.extend( {

		defaultConfig: {

		}

	}));
} )( window.mw, window.jQuery );