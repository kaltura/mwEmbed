/**
* MediaRssPlayer 
*/

// Wrap in mw to not pollute global namespace
( function( mw ) {

	mw.addResourcePaths( {
		"mw.MediaRss" : "mw.MediaRss.js"
	});
	
} )( window.mw );

// Add the jQuery hook: 
( function( $ ) {
	$.fn.mediaRssPlayer = function( options ){
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
		mw.load ( ['EmbedPlayer',  'mw.MediaRss'], function(){	
			// load and display the media Rss
			var myMediaRss = new mw.MediaRss( options );
			myMediaRss.drawUI();		
		}); 		
	}
} )( jQuery );

