// Scope everything in "mw" ( keeps the global namespace clean )
( function( mw, $ ) { "use strict";

	// Check if a dependency of any plugin included AdSupport, if so add a adTimeline
	// AdTimeline fires player events at ad opportunities
	// @@TODO this should be handled in the base "ad" class.
	$( mw ).bind( 'EmbedPlayerNewPlayer', function( event, embedPlayer ){
		embedPlayer.bindHelper( 'KalturaSupport_DoneWithUiConf', function(){
			if( mw.addAdTimeline ){
				mw.addAdTimeline ( embedPlayer );
			}
		});
		
		// Add the updateCompanion binding
		var companionHTMLCache = {};
		embedPlayer.bindHelper( 'AdSupport_UpdateCompanion', function( event, companionObject) {
			companionHTMLCache[ companionObject.elementid ] = $('#' + companionObject.elementid ).html();
			// TODO fix target to point to parent page. 
			$('#' + companionObject.elementid ).html(
				companionObject.html
			);
		});
		embedPlayer.bindHelper('AdSupport_RestoreCompanion', function( event, companionId){
			// TODO fix target to point to parent page. 
			if( companionHTMLCache[ companionId ] ){
				$('#' + companionId ).html( companionHTMLCache[companionId] );
			}
		});
	});

	
} )( window.mw, jQuery );