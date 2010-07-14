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
	
	// Add the kentryid and kpartnerid and kuiconfid attribute to the embed player
	mw.setConfig( 'embedPlayerAttributes', {
		'kentryid' : null,
		'kwidgetid' : null,
		'kuiconfid' : null
	} );	
	
	mw.addResourcePaths( {
		"mw.KWidgetSupport" : "mw.KWidgetSupport.js",
		"mw.KAnalytics" : "mw.KAnalytics.js",
		"mw.PlaylistHandlerKaltura"	: "mw.PlaylistHandlerKaltura.js", 
		
		"KalturaClientBase"	: "kalturaJsClient/KalturaClientBase.js",
		"KalturaClient" : "kalturaJsClient/KalturaClient.js",
		"KalturaAccessControlService" : "kalturaJsClient/KalturaServices.js",
		"KalturaAccessControlOrderBy" : "kalturaJsClient/KalturaTypes.js",
		"KalturaAccessControl" : "kalturaJsClient/KalturaVO.js",				
		"MD5" : "kalturaJsClient/webtoolkit.md5.js"
	} );
	
	// Set a local variable with the request set so we can append it to embedPlayer
	var kalturaSupportRequestSet = [
		"mw.KWidgetSupport",		
		"KalturaClientBase",
		"KalturaClient",
		"KalturaAccessControlService",
		"KalturaAccessControlOrderBy",
		"KalturaAccessControl",
		"MD5"
	];
	
	mw.addModuleLoader( 'KalturaPlaylist', function() {
		return $j.merge( kalturaSupportRequestSet, ['mw.PlaylistHandlerKaltura']);
	});

	//Check if the document has kaltura objects ( for fall forward support ) 
	$j( mw ).bind( 'LoaderEmbedPlayerDocumentHasPlayerTags', function( event, tagCheckObject ){
	
		mw.log('KalturaSupport :: Loader.js :: LoaderEmbedPlayerDocumentHasPlayerTags');
		// Check if we have a global selector available: 
		var select =  'object[name=kaltura_player]';
		mw.log( 'KalturaSupport found:: ' + $j( select ).length + ' is mobile::' +  mw.isMobileSafari() );
		if( $j( select ).length ) {
			tagCheckObject.hasTags = true;
			
			// FALLFORWARD only for mobile safari ::
			// this is kind of heavy weight for loader.js 
			// maybe move most of this to kEntryId support
			
			if( mw.isMobileSafari() ) {
				// setup load flags
				var loadEmbedPlayerFlag = loadPlaylistFlag = false;
				$j( select ).each( function( inx, element ){	
					// clear the kalturaSwapObjectClass
					var kalturaSwapObjectClass = '';
					// Setup the flashvars variable
					var flashvars = {};
					var flashVarsString = $j( element ).find( "param[name='flashvars']" ).val();
					// try alternate case: 
					if( !flashVarsString ){
						flashVarsString = $j( element ).find( "param[name='flashVars']" ).val();
					}
					var flashVarPairs = flashVarsString.split('&');
					for( var i in flashVarPairs ) {
						var parts = flashVarPairs[i].split('=');
						flashvars[ parts[0] ] = parts[1];
					}
					
					var kEmbedSettings = mw.getKalturaEmbedSettings( $j( element ).attr('data'), flashvars );
					
					// check if its a playlist or a entryId
					mw.log("Got kEmbedSettings.entryId: " + kEmbedSettings.entryId + " uiConf: " + kEmbedSettings.uiconfId)
					
					var height = $j( element ).attr('height');
					var width = $j( element ).attr('width');					
					var videoId = 'vid' + inx;					
					var $imgThumb = '';		
					var elementCss = {};
					
					// Setup the video embed attributes: 
					var videoEmbedAttributes = {	
						'id': videoId,							
						'kwidgetid' : kEmbedSettings.widgetId,
						'kuiconfid' : kEmbedSettings.uiconfId
					}
					if( kEmbedSettings.entryId ){	
						loadEmbedPlayerFlag = true;
						kalturaSwapObjectClass = 'mwEmbedKalturaVideoSwap';
						videoEmbedAttributes.kentryid = kEmbedSettings.entryId;
						if( kEmbedSettings.partnerId ){
							var thumb_url = 'http://cdnakmi.kaltura.com/p/' + kEmbedSettings.partnerId + '/sp/' +
											kEmbedSettings.partnerId + '00/thumbnail/entry_id/' + kEmbedSettings.entryId + '/width/' +
											height + '/height/' + width;
							$imgThumb = $j('<img />').attr({
								'src' : thumb_url 
							})
							.css({
								'width' : width + 'px',
								'height' : height + 'px',
								'position' : 'absolute',
								'top' : '0px',
								'left' : '0px'								
							});							
						}
					} else {
						// Assume playlist 
						loadPlaylistFlag = true;
						kalturaSwapObjectClass = 'mwEmbedKalturaPlaylistSwap';
					}
					
					// Replace with a mwEmbedKalturaVideoSwap
					$j( element ).replaceWith( 
						$j('<div />')
						.attr( videoEmbedAttributes )
						.css( {
							'width' : width + 'px',
							'height' : height + 'px',
							'position': 'relative',
							'display' : 'block',
							'float' : 'left',
							'padding' : '3px'
						} )
						.addClass( kalturaSwapObjectClass )
						.append(
							$imgThumb, 
							$j('<div />')
							.attr('id', 'loadingSpinner_' + videoId )
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
						
				if( loadPlaylistFlag ){
					kLoadKalturaSupport = true;
					mw.load(['EmbedPlayer', 'Playlist', 'KalturaPlaylist' ], function(){
						// kalturaPlaylistObject has player loader built in: 
						$j('.mwEmbedKalturaPlaylistSwap').each(function( inx, playlistTarget ){									
							var kalturaPlaylistHanlder = new mw.PlaylistHandlerKaltura({
								'uiconfid' : $j(playlistTarget ).attr( 'kuiconfid' ),
								'widgetid' : $j(playlistTarget ).attr( 'kwidgetid' )
							});							
							var playlistPlayer = $j( '#' + playlistTarget.id ).playlist({
								'layout': 'horizontal',
								'sourceHandler' : kalturaPlaylistHanlder
							});  														
						});
					});
				}
				
				if( loadEmbedPlayerFlag ){					
					mw.load('EmbedPlayer', function(){		
						// Remove the general loading spinner ( embedPlayer takes over )						
						$j('.mwEmbedKalturaVideoSwap').embedPlayer();
					})
				}
			}
		}
	});
		
	var kLoadKalturaSupport = false;	
	//Update the player loader request with timedText if the flag has been set 
	$j( mw ).bind( 'LoaderEmbedPlayerUpdateRequest', function( event, playerElement, classRequest ) {		
		// Check if any video tag uses the "kEmbedSettings.entryId"  
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
	
	mw.getKalturaEmbedSettings = function( swfUrl, flashvars ){
		// If the url does not include kwidget or entry_id probably not a kaltura settings url:
		if( swfUrl.indexOf('kwidget') == -1 ){
			return {};
		}
		if( !flashvars )
			flashvars= {};
		
		var dataUrlParts = swfUrl.split('/');
		var embedSettings = {};		
		
		// Search backward for key value pairs 		
		var prevUrlPart = null;
		while( dataUrlParts.length ){
			var curUrlPart =  dataUrlParts.pop();
			switch( curUrlPart ){
				case 'wid':
					embedSettings.widgetId = prevUrlPart;
					embedSettings.partnerId = prevUrlPart.replace(/_/,'');
				break;
				case 'entry_id':
					embedSettings.entryId = prevUrlPart;
				break;
				case 'uiconf_id':
					embedSettings.uiconfId = prevUrlPart;
				break;
				case 'cache_st':
					embedSettings.cacheSt = prevUrlPart;
				break;
			}
			prevUrlPart = curUrlPart;
		}
		// Add in Flash vars embedSettings ( they take precedence over embed url ) 
		for( var i in  flashvars){
			embedSettings[i] = flashvars[i];
		}
		return embedSettings;
	};
		
} )( window.mw );