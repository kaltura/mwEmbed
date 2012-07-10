/**
 * DolStatistic loader 
 */
( function( mw ) { "use strict";

mw.addKalturaPlugin( ["mw.DolStatistics"], 'dolStatistics', function( embedPlayer, callback ){
	new mw.DolStatistics( embedPlayer, callback );
});


})( window.mw);