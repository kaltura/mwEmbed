
( function( mw, $ ) {
	
mw.addResourcePaths({
	"mw.FreeWheelController": "mw.FreeWheelController.js"
});
// Set the base config:
mw.setConfig({
	// The url for the ad Manager
	'FreeWheel.AdManagerUrl': 'http://adm.fwmrm.net/p/release/latest-JS/adm/prd/AdManager.js',
	
	// Controls if companions should be setup on the iframe then passing to the client page.
	// you can set this to "false" if the html5 library is on the same domain as the content page. 
	'FreeWheel.PostMessageIframeCompanions': false
});

mw.addModuleLoader( 'FreeWheel', ['AdSupport', 'mw.FreeWheelController'] );

// Check if the plugin is enabled: 
$( mw ).bind( 'newEmbedPlayerEvent', function( event, embedPlayer ){
	$( embedPlayer ).bind( 'KalturaSupport_CheckUiConf', function( event, $uiConf, callback ){
		// Check if the freewheel plugin is enabled:
		if( embedPlayer.getKalturaConfig( 'FreeWheel',  'plugin' ) ){
			mw.load( ["FreeWheel"], function(){
				mw.addFreeWheelControler( embedPlayer, callback );
			});
		} else {
			// no freewheel plugin issue callback to continue player build out
			callback();
		}
	});
});

////////////////////////////////////////////////////////
// To support companion ads across the iframe
////////////////////////////////////////////////////////
$( mw ).bind( 'AddIframePlayerMethods', function( event, exportedMethods ){
	exportedMethods.push( 'setFreeWheelAddCompanions' );
});

$( mw ).bind( 'AddIframePlayerBindings', function( event, exportedBindings){
	// If iframe bridge is enabled add hook
	exportedBindings.push( 'FreeWheel_GetAddCompanions', 'FreeWheel_UpdateCompanion' );
});

$( mw ).bind( 'newIframePlayerClientSide', function( event, playerProxy ){
	// If iframe bridge is enabled add hook
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