/**
* MediaRssPlayer
*/

// Wrap in mw to not pollute global namespace
( function( mw,  $ ) {

mw.addResourcePaths( {
	"mw.Playlist" : "mw.Playlist.js",
	"mw.PlaylistHandlerMediaRss" : "mw.PlaylistHandlerMediaRss.js",
	"mw.PlaylistLayoutJQueryUi" : "mw.PlaylistLayoutJQueryUi.js",	
	"mw.PlaylistLayoutMobile" : "mw.PlaylistLayoutMobile.js",
	"mw.style.playlist" : "mw.style.playlist.css"
});

// Set the default config
mw.setDefaultConfig( {
	// Playlist layout 'vertical' or 'horizontal'
	'Playlist.Layout' : 'vertical',
	
	// Skin, presently 'jqueryui' or 'jquerymobile' supported
	"Playlist.Skin" : "jqueryui",
		
	// Player aspect ratio
	'Playlist.PlayerAspect' : '4:3',

	// Width of item thubmnails
	'Playlist.ItemThumbWidth' : '60',
	
	// Max number of playlist items: 
	'Playlist.MaxClips' : '20',
	
	// Height of the mediaRss title
	'Playlist.TitleHeight' : '20',

	// Default playlist type:
	'Playlist.DefaultType' : 'application/rss+xml',
		
	'Playlist.TitleLength' : 28,
	
	'Playlist.DescriptionLength' : 60
} );

// Module loader
mw.addModuleLoader( 'Playlist', function(){
	// TODO loader should check user agent and conditionally load iScroll
	return [ "mw.Playlist", "mw.style.playlist", "mw.PlaylistHandlerMediaRss", "iScroll" ];
});


// Add the jQuery hook:
$.fn.playlist = function( options, callback ){
	if ( !this ) {
		mw.log( "Error: Calling mediaRssPlayer with empty selector " + this );
		return ;
	}
	var _this = this;
	
	// Set the target
	options[ 'target' ] = this;
	// Load the mediaRss class ( if not already loaded )
	mw.load ( ['EmbedPlayer', 'Playlist'], function(){
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

