( function( mw, $){

mw.DoubleClick = function( options ){
	this.init( options );
};
mw.DoubleClick.prototype = {
	// local config object
	init: function( options ){
		// add in the options
		$.extend( this, options);
	}
})( window.mw, jQuery);
