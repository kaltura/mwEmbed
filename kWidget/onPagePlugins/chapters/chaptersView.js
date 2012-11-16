kWidget.addReadyCallback( function( playerId ){
	var kdp = document.getElementById( playerId );
	// Shortcut to get config:
	var gc = function( attr ){
		return kdp.evaluate('{chaptersView.' + attr + '}' );
	}
});