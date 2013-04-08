/**
 * Base ad plugin allows plugins to inheret some the base ad plugin functionality.
 */
( function( mw, $ ) { "use strict";

mw.BaseAdPlugin = function( embedPlayer, callback){
	return this.init( embedPlayer, callback );
};

mw.BaseAdPlugin.prototype = {

	init: function( embedPlayer, callback  ){
		this.embedPlayer = embedPlayer;
		return this;
	},
	/**
	 * Gets the target index for a given sequence item
	 */
	getSequenceIndex: function( slotType ){
		var _this = this;
		if( slotType == 'preroll' && _this.getConfig('preSequence') ) {
			return _this.getConfig('preSequence');
		}
		if( slotType == 'postroll' && _this.getConfig('postSequence') ) {
			return _this.getConfig('postSequence');
		}
		// TODO WHAT DOES FLASH DO? If a plugin has preroll cuepoint what place in the sequence proxy does it take?
		// for now we just add it to slot 1.
		// What about multiple cuepoints?
		return 1;
	},
	destroy: function(){
		// Remove player bindings:
		$( this.embedPlayer ).unbind( this.bindPostfix );
	}
};

} )( window.mw, jQuery );

