// Scope everything in "mw" ( keeps the global namespace clean ) 
( function( mw ) {
	
	mw.addResourcePaths({
		"mw.AdTimeline" : "mw.AdTimeline.js",
		"mw.AdLoader" : "mw.AdLoader.js",
		"mw.VastAdParser" : "mw.VastAdParser.js"
	});
	
	mw.addModuleLoader('AdSupport', function(){
		return [ 'mw.MobileAdTimeline', 'mw.AdLoader', 'mw.VastAdParser' ];
	});
	
	// Ads have to communicate with parent iframe to support companion ads.
	$j( mw ).bind( 'AddIframePlayerBindings', function( event, exportedBindings){
		// Add the updateCompanionTarget binding to bridge iframe
		exportedBindings.push( 'AdSupport_UpdateCompanion', 'AdSupport_RestoreCompanion' );
	});
	
	// Add the updateCompanion binding to new iframeEmbedPlayers
	$j( mw ).bind( 'newIframePlayerClientSide', function( event, playerProxy ){
		var companionHTMLCache = {}; 
		$j( playerProxy ).bind( 'AdSupport_UpdateCompanion', function( event, companionObject) {
			companionHTMLCache[ companionObject.elementid ] = $j('#' + companionObject.elementid ).html();
			$j('#' + companionObject.elementid ).html( 
				companionObject.html
			);
		});
		$j( playerProxy ).bind('AdSupport_RestoreCompanion', function( event, companionId){
			if( companionHTMLCache[companionId] ){
				$j('#' + companionId ).html( companionHTMLCache[companionId] );
			}
		});
	});
} )( window.mw );