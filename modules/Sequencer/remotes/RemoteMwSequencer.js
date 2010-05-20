/**
* Stop-gap for php sequencer support does some transformations 
* to normal page views to support sequences edits
* 
* Supports basic "sequencer" functionality as a javascript rewrite system.
*/

mw.addMessages( {
	"mwe-no-sequence-create" : "No sequence exists named $1, You can $2",
	"mwe-sequence-create-one" : "start a sequence"
});

RemoteMwSequencer = function( options ) {
	return this.init( options ); 
};
RemoteMwSequencer.prototype = {
	/**
	* @constructor
	* @param {Object} options RemoteMwSequencer options
	*/
	init: function( options ) {
		this.action = ( options.action )? options.action : this.action;
		this.title = ( options.title )? options.title : this.title;
		this.target = ( options.target )? options.target : this.target;
	},
	
	updateUI: function() {		
		// Check page type 
		if( this.action == 'view' ) {	
			this.showViewUI();
		}	
	},
	/*
	* Check page for sequence
	* if not present give link to "create" one. 
	*/
	showViewUI: function() {
		if( wgArticleId == 0 ) {
			$startLink = $j('<div>').append( 
				$j('<a>')
					.text( gM('mwe-sequence-create-one') )
					.attr('id', 'mwe-sequence-create')
			);
			$j( this.target ).html(
				gM("mwe-no-sequence-create", [this.title, $startLink.html() ])
			);
			$j('#mwe-sequence-create').click(function() {
				$j('body').append( '<div id="seqcontainer" style="position:absolute;top:5px;bottom:10px;left:10px;right:10px;" />' );
				mw.load( 'Sequencer', function() {
	 				$j('#seqcontainer').sequencer({
		 				'amw_conf':{
						 'enabled_providers':['wiki_commons']
					}
				})
	 			});
				
			});
		}else{
			$j( this.target ).html(
				'<playlist id="playlist" src="' +wgArticlePath.replace('$1', this.title) + '?action=raw&.xml" wikiTitleKey="' + this.title + '" ></playlist>'
			);
			$j('#playlist').embedPlayer();
			
		}
	}
	
	// Check page type 
	
	// "view" page 	
	
	// set page content to "loading"
	// get wikitext of page via api
	// grab xml
	// update page with sequence and 
	
	
	//"edit" page
	// grab textbox text, 
	// set page to loading
	// display sequence editor in "body" with -> full-screen link
};	//Setup the remote configuration
	