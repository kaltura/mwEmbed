/**
* MediaRssPlayer 
*/

mw.addClassFilePaths( {
	"mw.MediaRss" : "mw.MediaRss.js"
});

// Add the jquery hook: 
$j.fn.mediaRssPlayer = function( options ){
	var _this = this;	
	
	// Set the target to loading
	$j( this.selector ).loadingSpinner();
	
	// Set the targer:	
	options['target'] = _this.selector;
	
	// Load the mediaRss class ( if not already loaded ) 
	mw.load ( 'mw.MediaRss', function(){	
		// load and display the media Rss
		var myMediaRss = new mw.MediaRss( options );
		myMediaRss.drawUI();		
	}); 
}