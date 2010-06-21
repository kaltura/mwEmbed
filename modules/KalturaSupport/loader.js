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
	
	// Add the kentryid and kpartnerid attribute to the embed player
	mw.setConfig( 'embedPlayerAttributes', {
		'kentryid' : null,
		'kwidgetid' : null
	} );	
	
	mw.addResourcePaths( {
		"mw.KEntryIdSupport" : "mw.KEntryIdSupport.js",
		"mw.KAnalytics" : "mw.KAnalytics.js",
		"mw.KPlaylist"	: "mw.KPlaylist.js", 
		
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

	//Check if the document has kaltura objects ( for fall forward support ) 
	$j( mw ).bind( 'LoaderEmbedPlayerDocumentHasPlayerTags', function( event, tagCheckObject ){
		//mw.log('LoaderEmbedPlayerDocumentHasPlayerTags');
		// Check if we have a global selector available: 
		var select =  'object[name=kaltura_player]';
		if( $j( select ).length ) {
			tagCheckObject.hasTags = true;
						
			// FALLFORWARD only for mobile safari::
			// this is kind of hevey weight for loader.js 
			// maybe move most of this to 
			
			if( mw.isMobileSafari() ) {
				var loadEmbedPlayerFlag = false;
				$j( select ).each( function( inx, element ){
					loadEmbedPlayerFlag = true;
					var dataUrl = $j( element ).attr('data');
					var dataUrlParts = dataUrl.split('/');
					var entryId = dataUrlParts.pop();
					mw.log("Got EntryID: " + entryId + " from flash object")
					// Search backward for 'widgetId'
					var widgetId = false;					
					while( dataUrlParts.length ){
						var curUrlPart =  dataUrlParts.pop();
						if( curUrlPart == 'wid'){
							widgetId = prevUrlPart;
							break;
						}
						prevUrlPart = curUrlPart;
					}
					
					var height = $j( element ).attr('height');
					var width = $j( element ).attr('width');					
					var videoId = 'vid' + inx;
					
					var $imgThumb = '';
					if( widgetId ) {
						var partnerId = widgetId.replace(/_/,'');
						var thumb_url = 'http://cdnakmi.kaltura.com/p/' + partnerId + '/sp/' +
						partnerId + '00/thumbnail/entry_id/' + entryId + '/width/' +
						height + '/height/' + width;
						$imgThumb = $j('<img />').attr({
							'src' : thumb_url 
						})
						.css({
							'width' : width + 'px',
							'height' : height + 'px',
							'position' : 'absolute'
						});
					}		
					// Replace with a spinner
					$j( element ).replaceWith( 
						$j('<div />')
						.attr({
							'id': videoId,
							'kentryid': entryId,
							'kwidgetid' : widgetId
						})
						.css( {
							'width' : width + 'px',
							'height' : height + 'px',
							'position' : 'absolute'
						} )
						.addClass( 'safariVideoSwap')
						.append(
							$imgThumb, 
							$j('<div />')
							.css({
								'margin' : 'auto',
								'top' : '35%',
								'position' : 'relative',
								'width' : '32px',
								'height' : '32px'
							})
							.loadingSpinner()
						)
					)						
				});
				if( loadEmbedPlayerFlag ){					
					mw.load('EmbedPlayer', function(){
						// Remove the general loading spinner ( embedPlayer takes over )						
						$j('.safariVideoSwap').embedPlayer();
					})
				}
			}			
		}
	});
		
	var kLoadKalturaSupport = false;	
	//Update the player loader request with timedText if the flag has been set 
	$j( mw ).bind( 'LoaderEmbedPlayerUpdateRequest', function( event, playerElement, classRequest ) {	
		// Check if any video tag uses the "entryId"  
		if(  $j( playerElement ).attr( 'kentryid' ) ) {
			kLoadKalturaSupport = true;
		}
		
		// Check if we have analytics globally or per playerElement enabled 
		// And add the class to the request set and set the server is per-player specified. 
		if( mw.getConfig( 'enableKalturaAnalytics' ) 
			|| $j( playerElement ).attr( 'enableKalturaAnalytics' ) ){
			kalturaSupportRequestSet.push( "mw.KAnalytics" );					
		}		
		
		// Add kaltura support hook
		if( kLoadKalturaSupport ) {			
			$j.merge( classRequest, kalturaSupportRequestSet );
		}			
	} );	
		
} )( window.mw );