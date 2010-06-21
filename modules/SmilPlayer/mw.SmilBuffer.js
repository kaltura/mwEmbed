/**
* Hanndles buffer information for the smilObject
*/

mw.SmilBuffer = function( smilObject ){
	return this.init( smilObject );
}

mw.SmilBuffer.prototype = {
	// Constructor: 
	init: function( smilObject ) {
		this.smil = smilObject;
	},
	
	/**
	* Runs a callback once the buffer time is ready.
	*/
	timeIsBuffered: function( time, callback ) {
		
		// Get active body elements
		var activeElements = this.smil.getBody().getElementsForTime( time );
		// Check load status per temporal offset 
		
		// setTimeout to call self until buffer is ready
		
		// temp ( assume ready ): 
		callback();
	}
}