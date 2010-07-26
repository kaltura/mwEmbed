/**
* Stop-gap for php sequencer support does some transformations 
* to normal page views to support sequences edits
* 
* Supports basic "sequencer" functionality as a javascript rewrite system.
*/

mw.addMessageKeys( [
	"mwe-sequenceedit-no-sequence-create",
	"mwe-sequenceedit-create-sequence"
]);

mw.RemoteSequencer = function( options ) {
	return this.init( options ); 
};
mw.RemoteSequencer.prototype = {
	/**
	* @constructor
	* @param {Object} options RemoteMwSequencer options
	*/
	init: function( options ) {
		this.action = ( options.action )? options.action : this.action;
		this.title = ( options.title )? options.title : this.title;
		this.target = ( options.target )? options.target : this.target;
	},
	
	drawUI: function() {		
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
		var _this = this;
		if( wgArticleId == 0 ) {
			// Update create button 
			$j('#ca-edit span').text( gM('mwe-sequenceedit-create-sequence' ));
			
			$j( this.target ).html(
				gM("mwe-sequenceedit-no-sequence-create", 
					$j('<a />').attr('href','#').click(function() {
						_this.showEditor();
					})
				)
			);
		}else{
			// Get the article source?
			
		}
	},
	showEditor: function(){
		$j('body').append( '<div id="seqcontainer" style="position:absolute;top:5px;bottom:10px;left:10px;right:10px;" />' );
		mw.load( 'Sequencer', function(){ 	 			
			$j('#seqcontainer').sequencer({
	    		'smilSource' : 'SampleEditorSequenceSmil.xml',
	    		//set the add media wizard to only include commons:   
	    		'AddMediaConf':{
	    			 'enabled_providers':[ 'wiki_commons' ],
	    			 'import_url_mode' : 'remote_link',
	    			 'default_query' : 'fish'
	    		}     		
			});
		});
	},
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
	