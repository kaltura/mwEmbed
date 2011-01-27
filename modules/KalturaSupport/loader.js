/**
 * kSupport module
 *  
 * Add support for kaltura api calls
 * 
 * TODO this loader is a little too large portions should be refactored into separate files
 *  this refactor can happen post resource loader
 */
// Scope everything in "mw" ( keeps the global namespace clean ) 

( function( mw ) {

	// For now just store the keys in the javascript  
	// ( need to get clarity on why this is even needed )
	mw.setDefaultConfig( {
		'Kaltura.EnableAnalytics' : true,
		'Kaltura.ServiceUrl' : 'http://www.kaltura.com',
		'Kaltura.ServiceBase' : '/api_v3/index.php?service=',
		'Kaltura.CdnUrl' : 'http://cdn.kaltura.com',
		// A video file for when no suitable flavor can be found
		'Kaltura.MissingFlavorVideoUrl' : 'http://cdn.kaltura.com/p/243342/sp/24334200/flvclipper/entry_id/1_uypqlsor/flavor/1_lljfzesm/a.mp4?novar=0'
	} );
	
	// Add the kentryid and kpartnerid and kuiconfid attribute to the embed player
	mw.mergeConfig( 'EmbedPlayer.Attributes', {
		'kentryid' : null,
		'kwidgetid' : null,
		'kuiconfid' : null,
		'kalturaPlayerMetaData' : null
	});
	
	mw.mergeConfig( 'EmbedPlayer.SourceAttributes', [
		'data-flavorid'
	]);
	
	mw.addResourcePaths( {
		"mw.KWidgetSupport" : "mw.KWidgetSupport.js",
		"mw.KAnalytics" : "mw.KAnalytics.js",
		"mw.PlaylistHandlerKaltura"	: "mw.PlaylistHandlerKaltura.js", 
		"mw.PlaylistHandlerKalturaRss" : "mw.PlaylistHandlerKalturaRss.js",
		"mw.KDPMapping" : "mw.KDPMapping.js",
		"mw.KApi" : "mw.KApi.js",		
		"mw.KAds" : "mw.KAds.js",
		"faderPlugin" : "uiConfComponents/faderPlugin.js",
		"watermarkPlugin" :  "uiConfComponents/watermarkPlugin.js",
		"adPlugin"	: 	"uiConfComponents/adPlugin.js",
		"controlbarLayout"	: 	"uiConfComponents/controlbarLayout.js",
		"bumperPlugin"	: 	"uiConfComponents/bumperPlugin.js",		
		
		"kdpClientIframe" : "kdpIframeApi/kdpClientIframe.js",
		"kdpServerIFrame" : "kdpIframeApi/kdpServerIFrame.js"		
	} );
	
	// Set a local variable with the request set so we can append it to embedPlayer
	var kalturaSupportRequestSet = [
		'MD5',
		"mw.KApi",
		'mw.KWidgetSupport',
		'mw.KAnalytics',
		'mw.KDPMapping',
		'mw.KAds',	
		'controlbarLayout',
		'faderPlugin',
		'watermarkPlugin',
		'adPlugin',
		'bumperPlugin'
	];
	
	mw.addModuleLoader( 'KalturaPlaylist', function() {
		return $j.merge( kalturaSupportRequestSet, 
			[ 
			  'mw.PlaylistHandlerKaltura', 
			  'mw.PlaylistHandlerKalturaRss'
			]);
	});

	// Check if the document has kaltura objects ( for fall forward support ) 
	$j( mw ).bind( 'LoadeRewritePlayerTags', function( event, rewriteDoneCallback ){
		// Local callback function runs KalturaKDPCallbackReady and rewriteDoneCallback
		var callback = function(){
			// TODO move KalturaKDPCallbackReady into kdp mapping 
			if( window.KalturaKDPCallbackReady )
				window.KalturaKDPCallbackReady();
			
			if( rewriteDoneCallback )
				rewriteDoneCallback();
		}
		
		var kalturaObjectPlayerList = mw.getKalturaPlayerList();
		mw.log( 'KalturaSupport found:: ' + kalturaObjectPlayerList.length + ' is mobile::' +  mw.isHTML5FallForwardNative() );
		if( !kalturaObjectPlayerList.length ) {
			// no players to rewrite (don't run  window.KalturaKDPCallbackReady )
			rewriteDoneCallback();
		}else {
			
			// Check if we are NOT rewriting tags: 
			if( !mw.isHTML5FallForwardNative() ){
				mw.restoreKalturaKDPCallback();
			}
			// FALLFORWARD only for fallforward native players
			// this is kind of heavy weight for loader.js 
			// maybe move most of this to kEntryId support
			if( mw.isHTML5FallForwardNative() || mw.getConfig( 'Kaltura.IframeRewrite' ) ){
				// setup load flags
				var loadEmbedPlayerFlag = loadPlaylistFlag = false;
				
				$j.each( kalturaObjectPlayerList, function( inx, element ){
					// Clear the kalturaSwapObjectClass
					var kalturaSwapObjectClass = '';
					// Setup the flashvars variable
					var flashvars = {};
					var flashVarsString = $j( element ).find( "param[name='flashvars']" ).val();
					// try alternate case: 
					if( !flashVarsString ){
						flashVarsString = $j( element ).find( "param[name='flashVars']" ).val();
					}
					if( flashVarsString ){
						var flashVarPairs = flashVarsString.split('&');
						for( var i =0; i < flashVarPairs.length; i++ ) {
							var parts = flashVarPairs[i].split('=');
							flashvars[ parts[0] ] = unescape( parts.slice(1).join('=') );
						}
					}
					// Get the swf source from the element: 
					var swfSource =  $j( element ).attr( 'data' );
					// try to get the source from a param if not defined in the top level embed. 
					if( !swfSource ) {
						swfSource = $j( element ).find( "param[name=data]").attr( 'value' );						                                      
					}
					var kEmbedSettings = mw.getKalturaEmbedSettings( swfSource, flashvars );

					// check if its a playlist or a entryId
					mw.log("Got kEmbedSettings.entryId: " + kEmbedSettings.entryId + " uiConf: " + kEmbedSettings.uiconfId)
					var height = $j( element ).attr('height');
					var width = $j( element ).attr('width');
					
					// Check that the id is unique per player embed instance ( else give it a vid_{inx} id: 
					var videoId = $j( element ).attr('id');
					$j('.mwEmbedKalturaVideoSwap,.mwEmbedKalturaPlaylistSwap').each(function( inx, swapElement){
						if( $j( swapElement ).attr('id') ==  videoId ){
							videoId = 'vid_' + inx;
						}
					});						
					
					var $imgThumb = '';
					var elementCss = {};
					// Setup the video embed attributes: 
					var videoEmbedAttributes = {
						'id' : videoId,
						'kwidgetid' : kEmbedSettings.widgetId,
						'kuiconfid' : kEmbedSettings.uiconfId
					}
					if( kEmbedSettings.entryId ) {
						loadEmbedPlayerFlag = true;
						kalturaSwapObjectClass = 'mwEmbedKalturaVideoSwap';
						videoEmbedAttributes.kentryid = kEmbedSettings.entryId;
						if( kEmbedSettings.partnerId ){
							var thumb_url =  mw.getKalturaThumbUrl({
								'partner_id': kEmbedSettings.partnerId,
								'entry_id' :  kEmbedSettings.entryId,
								'width' : width,
								'height' : height
							});
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
						// check if we can get the playlist id from a url in the embed code 
						// ( some version of kaltura embed code work this way)
						if( flashvars['playlistAPI.kpl0Url'] ){
							videoEmbedAttributes['kplaylistid'] = mw.parseUri( flashvars['playlistAPI.kpl0Url'] ).queryKey['playlist_id'];
							if( ! videoEmbedAttributes['kplaylistid'] ){
								videoEmbedAttributes['kplaylistid'] = flashvars['playlistAPI.kpl0Url'];
							}
						}
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
				// Check if we are doing iFrame rewrite ( skip local library loading )
				if( mw.getConfig( 'Kaltura.IframeRewrite' ) ){
					// Issue the callback once all the in page iframes have been rewritten: 
					var iframeRewriteCount = 0;
					var doneWithIframePlayer = function(){
						iframeRewriteCount--
						if( iframeRewriteCount == 0){
							callback();
						}
					}
					$j( '.mwEmbedKalturaVideoSwap,.mwEmbedKalturaPlaylistSwap' ).each( function(inx, playerTarget ) {
						var kParams = {};
						var iframeRequestMap = {
								'kwidgetid' : 'wid',
								'kuiconfid' : 'uiconf_id', 
								'kentryid' : 'entry_id',
								'kplaylistid' : 'playlist_id'
						}
						for( var tagKey in iframeRequestMap ){
							if( $j(playerTarget).attr( tagKey ) ){
								kParams[ iframeRequestMap[tagKey] ] = $j(playerTarget).attr( tagKey );
							}
						}
						iframeRewriteCount++;
						$j( playerTarget ).kalturaIframePlayer( kParams, doneWithIframePlayer);
					});
					// Don't do any other rewrites or library loading
					return true;
				}
				
				// Do loading then rewrite each tag:
				if( loadPlaylistFlag ){
					kLoadKalturaSupport = true;
					var playlistRequest = [ 'EmbedPlayer', 'Playlist', 'KalturaPlaylist' ];
					mw.load( playlistRequest, function(){
						// kalturaPlaylistObject has player loader built in: 
						$j('.mwEmbedKalturaPlaylistSwap').each( function( inx, playlistTarget ) {
							var playlistConfig = {
								'uiconf_id' : $j( playlistTarget ).attr( 'kuiconfid' ),
								'widget_id' : $j( playlistTarget ).attr( 'kwidgetid' ),
								'playlist_id':  $j( playlistTarget ).attr( 'kplaylistid' )
							};
							// Check if we have a mediaRss url as the playlistId
							if( mw.isUrl( playlistConfig.playlistid ) ) {
								var kalturaPlaylistHanlder = new mw.PlaylistHandlerKalturaRss( playlistConfig );
							} else {
								var kalturaPlaylistHanlder = new mw.PlaylistHandlerKaltura( playlistConfig );
							}
							// quick non-ui conf check for layout mode
							var layout = ( $j( playlistTarget ).width() > $j( playlistTarget ).height() ) 
											? 'horizontal' : 'vertical';
							var playlistPlayer = $j( '#' + playlistTarget.id ).playlist({
								'layout': layout,
								'sourceHandler' : kalturaPlaylistHanlder
							});
						});
					});
				}
				if( loadEmbedPlayerFlag ){
					mw.log("KalturaLoader:: load EmbedPlayer");
					mw.load('EmbedPlayer', function(){
						// Remove the general loading spinner ( embedPlayer takes over )
						$j('.mwEmbedKalturaVideoSwap').embedPlayer( callback );
					});
				}
			}
		}		
	});
	
	var kLoadKalturaSupport = false;
	
	
	// Update the player loader request with timedText if the flag has been set 
	$j( mw ).bind( 'LoaderEmbedPlayerUpdateRequest', function( event, playerElement, classRequest ) {
		// Check if any video tag uses the "kEmbedSettings.entryId"  
		if(  $j( playerElement ).attr( 'kwidgetid' ) ) {
			kLoadKalturaSupport = true;
		}
		// Add kaltura support hook
		if( kLoadKalturaSupport ) {
			for(var i =0; i < kalturaSupportRequestSet.length; i++ ){
				if( $j.inArray(kalturaSupportRequestSet[i], classRequest ) == -1 ){
					classRequest.push( kalturaSupportRequestSet[i] );
				}
			}
		}
	} );
	
	
	/**
	 * Get a kaltura iframe
	 * @param {object} iframeParams
	 * 	the kaltura iframe parameters 
	 * @param {function} callback
	 * 	optional function called once iframe player has been loaded
	 */
	jQuery.fn.kalturaIframePlayer = function( iframeParams, callback ) {
		mw.log( '$j.kalturaIframePlayer::' );
		var playerTarget = this;
		
		// Establish the "server" domain via mwEmbed path: 
		var mwPathUri = mw.parseUri( mw.getMwEmbedPath() );
		
		// Local function to handle iframe rewrites: 
		var doRewriteIframe = function(){
			
			// Build the iframe request from supplied iframeParams: 
			var iframeRequest = '';
			for( var key in iframeParams ){
				iframeRequest+= '/' + key + 
					'/' + encodeURIComponent(  iframeParams [ key ] );
			};
			
			var argSeperator ='/?';
			
			// @@todo should move these url flags into config options
			
			// Add debug flag if set: 
			if( mw.getConfig( 'debug' ) ){
				iframeRequest+= argSeperator + 'debug=true';
				argSeperator ='&';
			}
			
			iframeRequest+= mw.getKalturaIframeHash();
			
			var $iframe = $j('<iframe />')
			.attr({
				'id' : $j( playerTarget ).attr('id'),
				'class' : $j( playerTarget ).attr('class' ) + ' mwEmbedKalturaIframe',
				'src' : mw.getMwEmbedPath() + 'mwEmbedFrame.php' + iframeRequest,
				'height' : $j( playerTarget ).height(),
				'width' : $j( playerTarget ).width()
			})
			.css( 'border', '0px' );
			
			// Replace the player with the iframe: 
			$j( playerTarget ).replaceWith( $iframe );
			
			// if the server is enabled 
			if(  mw.getConfig('EmbedPlayer.EnableIframeApi') ){
				// Invoke the iframe player api system: 				
				var iframeEmbedPlayer = $j( '.mwEmbedKalturaIframe').iFramePlayer( callback );
			}			
		};
		
		// Check if the iframe API is enabled: 
		if( mw.getConfig('EmbedPlayer.EnableIframeApi') ){
			// Make sure the iFrame player client is loaded: 
			mw.load( ['mw.EmbedPlayerNative' , '$j.postMessage' , 'mw.IFramePlayerApiClient', 'mw.KDPMapping', 'JSON' ], function(){
				doRewriteIframe();											
			});
		} else {
			doRewriteIframe();			
		}
	};
	
	/**
	 * To support kaltura kdp mapping override
	 */
	var checkForKDPCallback = function(){
		if( typeof window.jsCallbackReady != 'undefined' && !window.KalturaKDPCallbackReady ){	
			window.KalturaKDPCallbackReady = window.jsCallbackReady;
			window.jsCallbackReady = function(){ };
		}
	}
	
	// Check inline and when the dom is ready:
	checkForKDPCallback()
	// Check again once the document is ready:
	$j(document).ready( checkForKDPCallback );
	
	// Restore the jsCallbackReady global ( call it if it got called in the mean time )
	mw.restoreKalturaKDPCallback = function(){
		// To restore when we are not rewriting: 
		if( window.KalturaKDPCallbackReady ){
			window.jsCallbackReady = window.KalturaKDPCallbackReady;
			if( window.KalturaKDPCallbackAlreadyCalled ){
				window.jsCallbackReady();
			}
		}
	};
	
	/**
	 * Utility loader function to grab kaltura iframe hash url
	 */
	mw.getKalturaIframeHash = function(){
		// Append the configuration and request domain to the iframe hash: 
		var iframeMwConfig =  mw.getNonDefaultConfigObject();
		// No need to pass the IframeRewrite option to the iframe:
		delete iframeMwConfig['Kaltura.IframeRewrite'];	
		
		// Add the parentUrl to the iframe config: 
		iframeMwConfig['EmbedPlayer.IframeParentUrl'] = document.URL;

		return '#' + encodeURIComponent( 
				JSON.stringify({
					'mwConfig' :iframeMwConfig
				})
		);
	}
	
	/**
	 * Get the list of embed objects on the page that are 'kaltura players' 
	 */
	mw.getKalturaPlayerList = function(){
		var kalturaPlayers = [];
		// check all objects for kaltura compatible urls 
		var objectList = document.getElementsByTagName('object');
		var tryAddKalturaEmbed = function( url ){
			var settings = mw.getKalturaEmbedSettings( url );
			if( settings && settings.uiconfId && settings.widgetId ){
				kalturaPlayers.push(  objectList[i] );
				return true
			}
			return false;
		}
		for( var i =0; i < objectList.length; i++){
			if( objectList[i].getAttribute('data') ){
				if( tryAddKalturaEmbed( objectList[i].getAttribute('data') ) )
					continue;
			}
			var paramTags = objectList[i].getElementsByTagName('param');
			for( var j = 0; j < paramTags.length; j++){
				if( paramTags[j].getAttribute('name') == 'data'
					||
					paramTags[j].getAttribute('name') == 'src' )
				{
					if( tryAddKalturaEmbed( paramTags[j].getAttribute('value') ) )
						break;
				}
			}
		}
		return kalturaPlayers;
	};
	
	/**
	 * Get kaltura thumb url from entry object
	 */
	mw.getKalturaThumbUrl = function ( entry ){
		var kCdn = ( mw.getConfig('Kaltura.CdnUrl') ) ? mw.getConfig('Kaltura.CdnUrl') : 'http://cdnakmi.kaltura.com';
		if( entry.width == '100%')
			entry.width = 400;
		if( entry.height == '100%')
			entry.height = 300;
		
		return kCdn + '/p/' + entry.partner_id + '/sp/' +
			entry.partner_id + '00/thumbnail/entry_id/' + entry.entry_id + '/width/' +
			entry.width + '/height/' + entry.height;
	};
	
	/**
	 * Get kaltura embed settings from a swf url and flashvars object
	 * 
	 * @param {string} swfUrl
	 * 	url to kaltura platform hosted swf
	 * @param {object} flashvars
	 * 	object mapping kaltura variables, ( overrides url based variables ) 
	 */
	mw.getKalturaEmbedSettings = function( swfUrl, flashvars ){
		if( !flashvars )
			flashvars= {};
		var dataUrlParts = swfUrl.split('/');
		var embedSettings = {};
		// Search backward for key value pairs
		var prevUrlPart = null;
		while( dataUrlParts.length ){
			var curUrlPart =  dataUrlParts.pop();
			switch( curUrlPart ){
				case 'p':
					embedSettings.widgetId = '_' + prevUrlPart;
					embedSettings.partnerId = prevUrlPart;
				break;
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
		// Normalize the entryid to url request equivalent:
		if( embedSettings['entryid'] ){
			embedSettings['entry_id'] =  embedSettings['entryid'];
		}
		return embedSettings;
	};
} )( window.mw );