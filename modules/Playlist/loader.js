/**
* MediaRssPlayer
*/

// Wrap in mw to not pollute global namespace
( function( mw ) {

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
		
		'Playlist.ShowScrollButtons' : true,

		// Height of the mediaRss title
		'Playlist.TitleHeight' : '20',

		// Default playlist type:
		'Playlist.DefaultType' : 'application/rss+xml',
			
		'Playlist.TitleLength' : 28,
		
		'Playlist.DescriptionLength' : 40
	} );

	// Module loader
	mw.addModuleLoader( 'Playlist', function(){
		// TODO loader should check playlist configuration and conditionally load the MobileTheme
		//, 'mw.PlaylistThemeUi', 'mw.PlaylistLayoutMobile'
		return [ "mw.Playlist", "mw.style.playlist", "mw.PlaylistHandlerMediaRss" ];
	});


} )( window.mw );

// Add the jQuery hook:
( function( $ ) {
	$.fn.playlist = function( options, callback ){
		var _this = this;
		if ( !this.selector ) {
			mw.log( "Error: Calling mediaRssPlayer with empty selector " + this.selector);
			return ;
		}
		// Set the target to loading
		$j( this.selector ).loadingSpinner();

		// Set the target
		options[ 'target' ] = _this.selector;

		// Load the mediaRss class ( if not already loaded )
		mw.load ( ['EmbedPlayer', 'Playlist'], function(){
			// load and display the media Rss
			var myPlaylist = new mw.Playlist( options );
			myPlaylist.drawPlaylist( function(){
				if( callback ){
					callback( myPlaylist );
					callback = null;
				}
			});
		});
	}
} )( jQuery );

