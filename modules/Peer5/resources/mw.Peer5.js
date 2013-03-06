( function( mw, $ ) { "use strict";

mw.Peer5 = function( embedPlayer, callback ){
	return this.init( embedPlayer, callback );
};

mw.Peer5.prototype = {
	bindPostfix: '.Peer5',
	
	init: function(  embedPlayer, callback){
		var _this = this;
		this.embedPlayer = embedPlayer;
		// Load Peer5 
		kWidget.appendScriptUrl( _this.getConfig('peer5libUrl'), function(){
			// bind player
			_this.bindPlayer();
			// continue player build out:
			callback();
		}, document );
	},
	bindPlayer: function( event, embedPlayer ) {
		// checkPlayerSourcesEvent ( add peer5 mediaStream source )
		
		$( this.embedPlayer ).bind( 'playerReady', function( event, callback ) {
			var vid = document.querySelector('video')
			peer5.create(vid, 'http://wpc.a09f.edgecastcdn.net/80A09F/test/pilots/metacafe/1_dash.mp4', 'video/mp4; codecs="avc1.64001f,mp4a.40.2"');
			peer5.setLogLevel(2);		
			this.mediaElement.selectedSource.src = vid.src;
		});		
	},
	getConfig: function( propId ){
		// return the attribute value
		return this.embedPlayer.getKalturaConfig( 'peer5', propId );
	}
}

} )( window.mw, window.jQuery );