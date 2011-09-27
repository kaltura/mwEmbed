// Scope everything in "mw" ( keeps the global namespace clean ) 
( function( mw, $ ) {
	
	mw.addResourcePaths({
		"mw.AdTimeline" : "mw.AdTimeline.js",
		"mw.BaseAdPlugin" : "mw.BaseAdPlugin.js",
		"mw.AdLoader" : "mw.AdLoader.js",
		"mw.VastAdParser" : "mw.VastAdParser.js"
	});
	
	mw.addModuleLoader('AdSupport', function(){
		return [ 'mw.AdTimeline', 'mw.BaseAdPlugin', 'mw.AdLoader', 'mw.VastAdParser' ];
	});
	
	// Check if a dependency of any plugin included AdSupport, if so add a adTimeline
	// AdTimeline fires player events at ad opportunities
	$( mw ).bind( 'newEmbedPlayerEvent', function( event, embedPlayer ){
		$( embedPlayer ).bind( 'KalturaSupport_DoneWithUiConf', function(){
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
			if( companionHTMLCache[companionId] ){
				$('#' + companionId ).html( companionHTMLCache[companionId] );
			}
		});
	});
} )( window.mw, jQuery );