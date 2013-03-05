( function( mw, $ ) { "use strict";

mw.Peer5 = function( embedPlayer, callback ){
	return this.init( embedPlayer, callback );
};

mw.Peer5.prototype = {
	bindPostfix: '.Peer5',
	
	init: function(  embedPlayer, callback){
		var _this = this;
		this.embedPlayer = embedPlayer;
		// Load the Peer5 ad manager then setup the ads
		kWidget.appendScriptUrl( _this.getConfig('peer5libUrl'), function(){
			// bind player
			_this.bindPlayer();
			// continue player build out:
			callback();
		}, document );
	},
	bindPlayer: function(){
		// checkPlayerSourcesEvent ( add peer4 mediaStream source )
		alert('wtha');
	},
	getConfig: function( propId ){
		// return the attribute value
		return this.embedPlayer.getKalturaConfig( 'peer5', propId );
	}
}

} )( window.mw, window.jQuery );