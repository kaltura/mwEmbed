if( console && console.log )
	console.log( 'OnPageJs 1' );
KWidget.addReadyCallback( function( playerId ){
	if( console && console.log )
		console.log( 'OnPageJs 1: ' + playerId );
});