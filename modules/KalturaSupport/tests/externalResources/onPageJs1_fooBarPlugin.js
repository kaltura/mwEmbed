if( console && console.log )
	console.log( 'OnPage Js: fooBar1' );
KWidget.addReadyCallback( function( playerId ){
	if( console && console.log )
		console.log( 'OnPage Js: fooBar1: player ready: ' + playerId );
});
if( document.getElementById('testPluginTarget') ){
	document.getElementById('testPluginTarget').innerHTML = '<b>update via on page js</b>';
}