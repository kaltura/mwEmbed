/**
 * kSupport module
 *  
 * Add support for kaltura api calls
 */
// Scope everything in "mw" ( keeps the global namespace clean ) 

( function( mw ) {

	// For now just store the keys in the javascript  
	// ( need to get clarity on why this is even needed )
	mw.setDefaultConfig( {
		
		'enableKalturaAnalytics' : true,
		'kalturaStatsServer' : 'http://www.kaltura.com/api_v3/index.php'
	} );
	
	// Add the kEntryId attribute to the embed player
	mw.setConfig( 'embedPlayerAttributes', {
		'kEntryId' : null
	} );
	
	mw.addClassFilePaths( {
		"mw.KEntryIdSupport" : "mw.KEntryIdSupport.js",
		"mw.kAnalytics" : "mw.kAnalytics.js",
		
		"KalturaClientBase"	: "kalturaJsClient/KalturaClientBase.js",
		"KalturaClient" : "kalturaJsClient/KalturaClient.js",
		"KalturaAccessControlService" : "kalturaJsClient/KalturaServices.js",
		"KalturaAccessControlOrderBy" : "kalturaJsClient/KalturaTypes.js",
		"KalturaAccessControl" : "kalturaJsClient/KalturaVO.js",
		"OX.AJAST" : "kalturaJsClient/ox.ajast.js",		
		"MD5" : "kalturaJsClient/webtoolkit.md5.js"
	} );
	
	// Set a local variable with the request set so we can append it to embedPlayer
	var kalturaSupportRequestSet = [
		"mw.KEntryIdSupport",
		
		"KalturaClientBase",
		"KalturaClient",
		"KalturaAccessControlService",
		"KalturaAccessControlOrderBy",
		"KalturaAccessControl",
		"OX.AJAST",
		"MD5"
	]
	
	var kLoadKalturaSupport = false;
	

	//Update the player loader request with timedText if the flag has been set 
	$j( mw ).bind( 'LoaderEmbedPlayerUpdateRequest', function( event, playerElement, classRequest ) {
		// Check if any video tag uses the "entryId"  
		if(  $j( playerElement ).attr( 'kEntryId' ) ) {
			kLoadKalturaSupport = true;
		}
		
		// Check if we have analytics globally or per playerElement enabled 
		// And add the class to the request set and set the server is per-player specified. 
		if( mw.getConfig( 'enableKalturaAnalytics' ) 
			|| $j( playerElement ).attr( 'enableKalturaAnalytics' ) ){
			kalturaSupportRequestSet.push( "mw.kAnalytics" );					
		}		
		
		// Add kaltura support hook
		if( kLoadKalturaSupport ) {			
			$j.merge( classRequest, kalturaSupportRequestSet );
		}			
	} );	
		
} )( window.mw );