mw.addResourcePaths({
	"mw.Omniture": "mw.Omniture.js"
});

mw.setConfig({
	'Omniture.DispatchLog': false
});

// Omniture communicates all the dispatched events to the parent frame
$j( mw ).bind( 'AddIframePlayerBindings', function( event, exportedBindings){
	exportedBindings.push( 'Omniture_DispatchEvent' );
});