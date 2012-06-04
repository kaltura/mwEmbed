// Scope everything in "mw" ( keeps the global namespace clean )
( function( mw, $ ) { "use strict";

	// Add sequence proxy to the player ( so that it gets sent over the iframe )
	$ (mw ).bind( 'MwEmbedSupportReady', function(){
		mw.mergeConfig( 'EmbedPlayer.Attributes', {
			'sequenceProxy': null
		});
	});

	
	// Check if a dependency of any plugin included AdSupport, if so add a adTimeline
	// AdTimeline fires player events at ad opportunities
	// @@TODO this should be handled in the base "ad" class.
	$( mw ).bind( 'newEmbedPlayerEvent', function( event, embedPlayer ){
		embedPlayer.bindHelper( 'KalturaSupport_DoneWithUiConf', function(){
			if( mw.addAdTimeline ){
				mw.addAdTimeline ( embedPlayer );
			}
		});
	});

	// Ads have to communicate with parent iframe to support companion ads.
	$( mw ).bind( 'AddIframePlayerBindings', function( event, exportedBindings){
		// Add the updateCompanionTarget binding to bridge iframe
		exportedBindings.push( 'AdSupport_UpdateCompanion', 'AdSupport_RestoreCompanion' );
	});

	// Add the updateCompanion binding to new iframeEmbedPlayers
	$( mw ).bind( 'newIframePlayerClientSide', function( event, playerProxy ){
		var companionHTMLCache = {};
		$( playerProxy ).bind( 'AdSupport_UpdateCompanion', function( event, companionObject) {
			companionHTMLCache[ companionObject.elementid ] = $('#' + companionObject.elementid ).html();
			$('#' + companionObject.elementid ).html(
				companionObject.html
			);
		});
		$( playerProxy ).bind('AdSupport_RestoreCompanion', function( event, companionId){
			if( companionHTMLCache[ companionId ] ){
				$('#' + companionId ).html( companionHTMLCache[companionId] );
			}
		});
	});
} )( window.mw, jQuery );