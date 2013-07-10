kWidget.addReadyCallback( function( playerId ){
	$('body').append( "Kaltura onPage $ version: " +  $.fn.jquery + 
			" jQuery version: " + jQuery.fn.jquery + "<br>" );
});