mw.ready( function(){
	console.log('test.js:: mw.ready');
});
$j( mw ).bind( 'EmbedPlayerNewPlayer', function( event, embedPlayer ){
	$j( embedPlayer ).bind( 'KalturaSupport_CheckUiConf', function( event, $uiConf, callback ){
		// Here we dump the ui conf to the console, but you can also run jQuery selections on its XML
		// like $uiConf.find('plugin#myPlugin');
		console.log( "test.js::ui conf dump::\n\n " + $uiConf.html() );
		// continue with other uiconf components
		callback();
	});
	// add a player binding for all "new embedPlayers"
	$j( embedPlayer ).bind('onplay', function(){
		// Html5 bindings are nice for inline closure context preservation:
		setTimeout(function(){
			console.log( 'test.js:: after 3 seconds play time is ' + embedPlayer.currentTime );
		},3000);
	});
	// add a binding via kaltura js api:
	embedPlayer.addJsListener( 'doPlay', 'globalPlayEvent');
});

function globalPlayEvent(){
	console.log('test.js::globalPlayEvent set via ( addJsListener ) ');
}