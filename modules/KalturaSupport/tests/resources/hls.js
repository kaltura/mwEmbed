( function( mw, $ ) { "use strict";
	// HLS support
	$( mw ).bind('EmbedPlayerUpdateMediaPlayers', function( event, mediaPlayers ){
		//adding the support of HLS to the kplayer
		mw.setConfig( 'EmbedPlayer.ForceKPlayer' , true );
		for (var i=0 ; i<mediaPlayers.players.length ; i++){
			if(mediaPlayers.players[i].id == "kplayer"){
				mediaPlayers.players[i].supportedTypes.push('application/vnd.apple.mpegurl')  ;
			}
		}
		//adding the kplayer as the last player in the players that can play HLS
		var defaultPlayers = mw.EmbedTypes.mediaPlayers.defaultPlayers
		defaultPlayers['application/vnd.apple.mpegurl'].push('Kplayer');
	});
} )( window.mw, window.jQuery );

alert('d');