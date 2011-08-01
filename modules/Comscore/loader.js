mw.addResourcePaths({
	"mw.Comscore": "mw.Comscore.js"
});

// Omniture communicates all the dispatched events to the parent frame
$j( mw ).bind( 'AddIframePlayerBindings', function( event, exportedBindings){
	exportedBindings.push( 'Omniture_DispatchEvent' );
});