/**
* Stores the key bindings
*/

/**
 * jQuery helper for input focus binding 
 */
( function( $ ) {
	$.fn.sequenceEditInput = function( sequenceEdit ) {
		$j(this)
			.focus( function(){
				sequenceEdit.getKeyBindings().onFocus();
			})
			.blur( function(){
				sequenceEdit.getKeyBindings().onBlur();
			})
		return this;
	}		
} )( jQuery );

mw.SequenceEditKeyBindings = function( sequenceEdit ) {
	return this.init( sequenceEdit );
};
mw.SequenceEditKeyBindings.prototype = {
	// set of key flags:
	shiftDown: false,
	ctrlDown: false,
		
	init: function( sequenceEdit ){
		this.sequenceEdit = sequenceEdit;
		this.setupKeyBindigs()		
	},
	
	bindEvent: function( eventType, callback){
		if( typeof eventType == 'object' ){
			for( var i in eventType ){
				this.bindEvent( i, eventType[i] );
			}
		}
		switch( eventType ){		
			case 'copy':
				this.copyEvent = callback;
				break;
			case 'cut':
				this.cutEvent = callback;
				break;
			case 'paste' :
				this.pasteEvent = callback;
				break;
			case 'escape' :
				this.escapeEvent = callback;
				break;
			case 'delete':
				this.deleteEvent = callback;
				break;
		}
		return this;
	},	
	onFocus: function( ){		
		this.inputFocus = true;		
	},
	onBlur: function(){
		this.inputFocus = false;
	},	
	setupKeyBindigs: function(){
		var _this = this;
		// Set up key bindings
		$j( window ).keydown( function( e ) {
			mw.log( 'SequenceEditKeyBindings::pushed down on:' + e.which );
			if ( e.which == 16 )
				_this.shiftDown = true;

			if ( e.which == 17 )
				_this.ctrlDown = true;

			if ( ( e.which == 67 && _this.ctrlDown ) && !_this.inputFocus )
				_this.copyEvent();

			if ( ( e.which == 88 && _this.ctrlDown ) && !_this.inputFocus )
				_this.cutEvent();

			// Paste cips on v + ctrl while not focused on a text area:
			if ( ( e.which == 86 && _this.ctrlDown ) && !_this.inputFocus )
				_this.pasteEvent();

		} );
		$j( window ).keyup( function( e ) {
			mw.log( 'SequenceEditKeyBindings::key up on ' + e.which );
			// User let go of "shift" turn off multi-select
			if ( e.which == 16 )
				_this.shiftDown = false;

			if ( e.which == 17 )
				_this.ctrlDown = false;

			// Escape key ( deselect )
			if ( e.which == 27 )
				_this.escapeEvent();


			// Backspace or Delete key while not focused on a text area:
			if ( ( e.which == 8 || e.which == 46 ) && !_this.inputFocus )
				_this.deleteEvent();
		} );
	}
	
}