
( function( mw, $ ) {
	
mw.addResourcePaths({
	"mw.freeWheelController": "mw.freeWheelController.js",
	"tv.freewheel.SDK" : "freeWheelAdMannager.js"
		
});
// Set the base config:
mw.setConfig( {
	'FreeWheel.AdManagerUrl': 'http://adm.fwmrm.net/p/release/latest-JS/adm/prd/AdManager.js'
} );

mw.addModuleLoader( 'FreeWheel', [
    'mw.freeWheelController',
]);

// To support companion ads.
$( mw ).bind( 'AddIframePlayerMethods', function( event, exportedMethods ){
	exportedMethods.push( 'setFreeWheelAddCompanions' );
});

$( mw ).bind( 'AddIframePlayerBindings', function( event, exportedBindings){
	exportedBindings.push( 'FreeWheel_GetAddCompanions', 'FreeWheel_UpdateCompanion' );
});

$( mw ).bind( 'newIframePlayerClientSide', function( event, playerProxy ){
	$( playerProxy ).bind( 'FreeWheel_GetAddCompanions', function(){
		var companionSet = [];
		$('._fwph').each(function(inx, node){
			companionSet.push( {
				'id' : $( node ).attr('id'),
				'val' : $( node ).find( 'input' ).val()
			});
		});
		playerProxy.setFreeWheelAddCompanions( companionSet );
	});
	
	$( playerProxy ).bind( 'FreeWheel_UpdateCompanion', function( event, companion ){
		if( companion.id && $('#_fw_container_' + companion.id).length ){
			$('#_fw_container_' + companion.id).html( companion.content );
		}
	});
});

} )( window.mw, window.jQuery );