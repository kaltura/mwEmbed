/**
* Playlist loader
*/

( function( mw,  $ ) { "use strict";

// Add the jQuery hook:
$.fn.playlist = function( options, callback ){
	if ( !this ) {
		mw.log( "Error: Calling playlist with empty selector " + this );
		return ;
	}
	var _this = this;

	// Set the target
	options[ 'target' ] = this;
	// Load the mediaRss class ( if not already loaded )
	mw.load ( ['mw.EmbedPlayer', 'mw.Playlist'], function(){
		// load and display the media Rss
		_this.playlist = new mw.Playlist( options );
		_this.playlist.drawPlaylist( function(){
			if( callback ){
				callback( _this.playlist );
			}
		});
	});
};

} )( window.mw, jQuery );

