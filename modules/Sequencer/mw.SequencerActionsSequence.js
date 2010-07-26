/**
 * Handles dialogs for sequence actions such as 
 * 	"save sequence",
 * 	"rename", 
 * 	"publish"
 *  
 * Hooks into sequencerApiProvider to run the actual api operations  
 */

mw.SequencerActionsSequence = function( sequencer ) {
	return this.init( sequencer );
};

mw.SequencerActionsSequence.prototype = {
	init: function( sequencer ) {
		this.sequencer = sequencer; 
	},	
	save: function(){
		// Check if we have an api provider defined
		if( this.sequencer.apiProvider ){
			
		}
		// No apiProvider show xml
		
	}	
}