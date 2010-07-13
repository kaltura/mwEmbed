mw.PlaylistSourceMediaRss = function( Playlist ){
	return this.init( Playlist );
}

mw.PlaylistSourceMediaRss.prototype = {
	init: function ( Playlist ){
		this.playlist = Playlist;
	}
}