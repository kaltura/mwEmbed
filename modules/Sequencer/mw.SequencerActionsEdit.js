/**
 * Handles dialogs for sequence actions such as 
 * 	"save sequence",
 * 	"rename", 
 * 	"publish"
 *  
 * Hooks into sequencerApiProvider to run the actual api operations  
 */

mw.SequencerActionsEdit = function( sequencer ) {
	return this.init( sequencer );
};

mw.SequencerActionsEdit.prototype = {
	init: function( sequencer ) {
		this.sequencer = sequencer; 
	},	
	selectAll: function(){
		//Select all the items in the timeline
		$target = this.sequencer.getTimeline().getTimelineContainer();
		$target.find( '.timelineClip' ).addClass( 'selectedClip' );
	}	
}