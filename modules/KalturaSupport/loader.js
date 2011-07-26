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

	mw.setDefaultConfig( {
		'Kaltura.EnableAnalytics' : true,
		'Kaltura.ServiceUrl' : 'http://www.kaltura.com',
		'Kaltura.ServiceBase' : '/api_v3/index.php?service=',
		'Kaltura.CdnUrl' : 'http://cdn.kaltura.com',
		// A video file for when no suitable flavor can be found
		'Kaltura.MissingFlavorSources' : [
		    { 
		    	'src' : 'http://www.kaltura.com/p/243342/sp/24334200/playManifest/entryId/1_g18we0u3/flavorId/1_ktavj42z/format/url/protocol/http/a.mp4',
		    	'type' : 'video/h264'
		    },
		    { 
		    	'src' : 'http://www.kaltura.com/p/243342/sp/24334200/playManifest/entryId/1_g18we0u3/flavorId/1_gtm9gzz2/format/url/protocol/http/a.ogg',
		    	'type' : 'video/ogg'
		    },
		    {
		    	'src' : 'http://www.kaltura.com/p/243342/sp/24334200/playManifest/entryId/1_g18we0u3/flavorId/1_bqsosjph/format/url/protocol/http/a.webm',
		    	'type' : 'video/webm'
		    }
		 ],
		 
		 'Kaltura.BlackVideoSources' : [
		    {
		        'src' : 'http://www.kaltura.com/p/243342/sp/24334200/playManifest/entryId/1_vp5cng42/flavorId/1_oiyfyphl/format/url/protocol/http/a.webm',
		        'type' : 'video/webm'
			},
			{
				'src' : 'http://www.kaltura.com/p/243342/sp/24334200/playManifest/entryId/1_vp5cng42/flavorId/1_6yqa4nmd/format/url/protocol/http/a.ogg',
				'type' : 'video/ogg'
			},
			{
				'src' : 'http://www.kaltura.com/p/243342/sp/24334200/playManifest/entryId/1_vp5cng42/flavorId/1_6wf0o9n7/format/url/protocol/http/a.mp4',
				'type' : 'video/h264'
			}
		]
	} );
	
	// Add the kentryid and kpartnerid and kuiconfid attribute to the embed player
	mw.mergeConfig( 'EmbedPlayer.Attributes', {
		'kentryid' : null,
		'kwidgetid' : null,
		'kuiconfid' : null,
		'kalturaPlayerMetaData' : null,
		'kalturaEntryMetaData' : null
	});
	
	mw.mergeConfig( 'EmbedPlayer.SourceAttributes', [
		'data-flavorid'
	]);
	
	mw.addResourcePaths( {
		"mw.KWidgetSupport" : "mw.KWidgetSupport.js",
		"mw.KCuePoints" : "mw.KCuePoints.js",
		"mw.KTimedText" : "mw.KTimedText.js",
		"mw.KAnalytics" : "mw.KAnalytics.js",
		"mw.PlaylistHandlerKaltura"	: "mw.PlaylistHandlerKaltura.js", 
		"mw.PlaylistHandlerKalturaRss" : "mw.PlaylistHandlerKalturaRss.js",
		"mw.KDPMapping" : "mw.KDPMapping.js",
		"mw.KApi" : "mw.KApi.js",		
		"mw.KAds" : "mw.KAds.js",
		"faderPlugin" : "uiConfComponents/faderPlugin.js",
		"watermarkPlugin" :  "uiConfComponents/watermarkPlugin.js",
		"adPlugin"	: 	"uiConfComponents/adPlugin.js",
		"captionPlugin"	: 	"uiConfComponents/captionPlugin.js",
		"controlbarLayout"	: 	"uiConfComponents/controlbarLayout.js",
		"bumperPlugin"	: 	"uiConfComponents/bumperPlugin.js",
		"omniturePlugin" : "uiConfComponents/omniturePlugin.js",
		
		"kdpClientIframe" : "kdpIframeApi/kdpClientIframe.js",
		"kdpServerIFrame" : "kdpIframeApi/kdpServerIFrame.js"
	} );
	
	// Set a local variable with the request set so we can append it to embedPlayer
	var kalturaSupportRequestSet = [
		'MD5',
		"mw.KApi",
		'mw.KWidgetSupport',
		'mw.KCuePoints',
		'mw.KAnalytics',
		'mw.KDPMapping',
		'mw.KAds',
		'mw.KTimedText',
		'controlbarLayout',
		'faderPlugin',
		'watermarkPlugin',
		'adPlugin',
		'captionPlugin',
		'bumperPlugin',
		'omniturePlugin'
	];
	
	mw.addModuleLoader( 'KalturaPlaylist', function() {
		return $j.merge( kalturaSupportRequestSet,
			[
			  'mw.PlaylistHandlerKaltura', 
			  'mw.PlaylistHandlerKalturaRss'
			] );
	});
	// Check if the document has kaltura objects ( for fall forward support ) 
	$j( mw ).bind( 'LoadeRewritePlayerTags', function( event, rewriteDoneCallback ){

		var kalturaObjectPlayerList = mw.getKalturaPlayerList();
		mw.log( 'KalturaSupport found:: ' + kalturaObjectPlayerList.length + ' is mobile::' +  mw.isHTML5FallForwardNative() );
		if( ! kalturaObjectPlayerList.length ) {
			// No players to rewrite ( and don't run  window.KalturaKDPCallbackReady )
			rewriteDoneCallback();
			return ;
		}else {
		
			// Check if we are NOT rewriting tags: 
			if( !mw.isHTML5FallForwardNative() || mw.getConfig( 'Kaltura.ForceFlashOnDesktop' )) {
				restoreKalturaKDPCallback();
				rewriteDoneCallback();
				return ;
			}
			// FALLFORWARD only for fallforward native players
			// this is kind of heavy weight for loader.js 
			// maybe move most of this to kEntryId support
			if( mw.isHTML5FallForwardNative() || mw.getConfig( 'Kaltura.IframeRewrite' ) ){
				
				// setup load flags
				var loadEmbedPlayerFlag = loadPlaylistFlag = false;
				
				$j.each( kalturaObjectPlayerList, function( inx, element ){
					// don't rewrite special id
					if( $j(element).attr('name') == 'kaltura_player_iframe_no_rewrite' ){
						return true;;
					}
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
						swfSource = $j( element ).find( "param[name=data]" ).attr( 'value' );						                                      
					}
					var kEmbedSettings = mw.getKalturaEmbedSettings( swfSource, flashvars );
			
					// Check if its a playlist or a entryId
					mw.log( "Got kEmbedSettings.entryId: " + kEmbedSettings.entry_id + " uiConf: " + kEmbedSettings.uiconf_id);
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
						'kwidgetid' : kEmbedSettings.wid,
						'kuiconfid' : kEmbedSettings.uiconf_id,
						'style' : $j( element ).attr('style')
					};
					
					if( kEmbedSettings.entry_id ) {
						loadEmbedPlayerFlag = true;
						kalturaSwapObjectClass = 'mwEmbedKalturaVideoSwap';
						videoEmbedAttributes.kentryid = kEmbedSettings.entry_id;
						if( kEmbedSettings.p ){
							// if we have flashvar  we need to pass the ks to thumbnail url
							var ks = ( flashvars && flashvars.loadThumbnailWithKs ) ? flashvars.ks : false;
							var thumb_url =  mw.getKalturaThumbUrl({
								'partner_id': kEmbedSettings.p,
								'entry_id' :  kEmbedSettings.entry_id,
								'ks' : ks,
								'width' : parseInt( width ),
								'height' : parseInt( height )
							});
							$imgThumb = $j('<img />').attr({
								'src' : thumb_url
							})
							.css({
								'width' : width,
								'height' : height,
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
					
					var widthType = ( width.indexOf('%') == -1 )? 'px' : '';
					var heightType = ( height.indexOf('%') == -1 )? 'px' : '';
					
					// Replace with a mwEmbedKalturaVideoSwap
					$j( element ).replaceWith( 
						$j('<div />')
						.attr( videoEmbedAttributes )
						.css({
							'width' : width + widthType,
							'height' : height + heightType,
							'display' : 'inline-block' // more or less the <object> tag default display
						})
						.data( 'flashvars', flashvars )
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
					);
				});
				
				// Check if we are doing iFrame rewrite ( skip local library loading )
				if( mw.getConfig( 'Kaltura.IframeRewrite' ) ){
					// Issue the callback once all the in page iframes have been rewritten: 
					var iframeRewriteCount = 0;
					var doneWithIframePlayer = function(){
						iframeRewriteCount--;
						if( iframeRewriteCount == 0){
							rewriteDoneCallback();
						}
					};
					// if there were no targets to rewrite just issue the callback directly
					if( $j( '.mwEmbedKalturaVideoSwap,.mwEmbedKalturaPlaylistSwap' ).length == 0 ){
						rewriteDoneCallback();
						return ;
					}
					$j( '.mwEmbedKalturaVideoSwap,.mwEmbedKalturaPlaylistSwap' ).each( function(inx, playerTarget ) {
						var kParams = {};
						var iframeRequestMap = {
								'kwidgetid': 'wid',
								'kuiconfid': 'uiconf_id', 
								'kentryid': 'entry_id'
						};
						// Set default to playerTraget.kEmbedSettings						
						for( var tagKey in iframeRequestMap ){
							if( $j(playerTarget).attr( tagKey ) ){
								kParams[ iframeRequestMap[tagKey] ] = $j(playerTarget).attr( tagKey );
							}
						}
						if( $j( playerTarget).data( 'flashvars' ) ){
							kParams['flashvars'] = $j( playerTarget).data('flashvars');
						}

						// XXX UGLY TEMPORARY HACK ( don't use iframe for playlist ) 
						iframeRewriteCount++;
						$j( playerTarget )
							.removeClass('mwEmbedKalturaPlaylistSwap')
							.removeClass('mwEmbedKalturaVideoSwap')
							.kalturaIframePlayer( kParams, doneWithIframePlayer);
					});					
					// if there are no playlists left to process return: 
					if( $j( '.mwEmbedKalturaPlaylistSwap' ).length == 0 ){
						rewriteDoneCallback();
						return true;
					}
				}
				
				// Do loading then rewrite each tag:
				if( loadPlaylistFlag ){
					kLoadKalturaSupport = true;
					var playlistRequest = [ 'EmbedPlayer', 'Playlist', 'KalturaPlaylist' ];
					mw.load( playlistRequest, function(){
						// kalturaPlaylistObject has player loader built in: 
						$j('.mwEmbedKalturaPlaylistSwap').each( function( inx, playlistTarget ) {
							// Quick non-ui conf check for layout mode
							var layout = ( $j( playlistTarget ).width() > $j( playlistTarget ).height() ) 
											? 'horizontal' : 'vertical';
							var playlistPlayer = $j( '#' + playlistTarget.id ).playlist({
								'layout': layout,
								'titleHeight' : 0 // kaltura playlist don't include the title ontop of the video
							});
						});
						// XXX todo playlist is not really ready for api calls at this point :(
						// we need to setup a binding and ready event
						rewriteDoneCallback();
					});
				}
				if( loadEmbedPlayerFlag ){
					mw.log("KalturaLoader:: load EmbedPlayer");
					mw.load('EmbedPlayer', function(){
						// Remove the general loading spinner ( embedPlayer takes over )
						$j('.mwEmbedKalturaVideoSwap').embedPlayer( rewriteDoneCallback );
					});
				}
				// no loader, run the callback directly: 
				if( !loadPlaylistFlag && !loadEmbedPlayerFlag ){
					rewriteDoneCallback();
				}
			}
		}		
	});
	
	var kLoadKalturaSupport = false;
	
	
	$j( mw ).bind( 'LoaderEmbedPlayerUpdateRequest', function( event, playerElement, classRequest ) {
		// Check if any video tag uses the "kEmbedSettings.entryId"  
		if(  playerElement.kwidgetid || $j(playerElement).attr( 'kwidgetid' ) ){
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
	
	$j( mw ).bind("Playlist_GetSourceHandler", function( event, playlist){
		var $playlistTarget = $j( '#' + playlist.id );
		// Check if we are dealing with a kaltura player: 
		// XXX should move these properties over to data- or .data attributes 
		if( !$playlistTarget.attr('kwidgetid') ){
			return ;
		}
		
		var playlistConfig = {
			'uiconf_id' : $playlistTarget.attr('kuiconfid'),
			'widget_id' : $playlistTarget.attr('kwidgetid'),
			'flashvars' : $playlistTarget.data('flashvars')
		};		
		var kplUrl0 = playlistConfig.flashvars['playlistAPI.kpl0Url'];

		// if loading from ui-conf ( no kplUrl ) or kplUrl is from kaltura.com and a playlist_id
		if( !kplUrl0 ){
			playlist.sourceHandler = new mw.PlaylistHandlerKaltura( playlist, playlistConfig );
			return ;
		} 
		var plId =  mw.parseUri( kplUrl0 ).queryKey['playlist_id'];
		if( plId && mw.parseUri( kplUrl0 ).host.replace('www.', '') == 'kaltura.com'  ){
			playlistConfig.playlist_id = plId;
			playlist.sourceHandler = new mw.PlaylistHandlerKaltura( playlist, playlistConfig );
			return ;
		}
		// must be a media rss url:
		if( mw.isUrl( kplUrl0 ) ){
			playlist.src = kplUrl0;
			//playlist.sourceHandler = new mw.PlaylistHandlerKalturaRss( playlist, playlistConfig );
			playlist.sourceHandler = new mw.PlaylistHandlerKaltura( playlist, playlistConfig );
			return ;
		}
		mw.log("Error playlist source not found");
	});
	
	/**
	 * Get a kaltura iframe
	 * @param {object} iframeParams
	 * 	the kaltura iframe parameters 
	 * @param {function} callback
	 * 	optional function called once iframe player has been loaded
	 */
	jQuery.fn.kalturaIframePlayer = function( iframeParams, callback ) {
		$j( this ).each( function( inx, playerTarget ){
			mw.log( '$j.kalturaIframePlayer::' + $j( playerTarget ).attr('id') );
			// Establish the "server" domain via mwEmbed path: 
			var mwPathUri = mw.parseUri( mw.getMwEmbedPath() );
			
			// Local function to handle iframe rewrites: 
			var doRewriteIframe = function(){
				// Build the iframe request from supplied iframeParams: 
				var iframeRequest = '';
				for( var key in iframeParams ){
					// don't put flashvars into the post url. 
					if( key == 'flashvars' )
						continue;
					
					iframeRequest+= '/' + key + 
						'/' + encodeURIComponent( iframeParams [ key ] );
				}
				// Add the player id: 
				iframeRequest+= '/?playerId=' + $j( playerTarget ).attr('id');
				
				// Add debug flag if set: 
				if( mw.getConfig( 'debug' ) ){
					iframeRequest+= '&debug=true';
				}
				// Add the flashvars to the request:
				if( iframeParams['flashvars'] ){
					$j.each( iframeParams['flashvars'], function( key, value){
						iframeRequest += '&' + encodeURIComponent( 'flashvars[' + key + ']' ) + 
								'=' + encodeURIComponent( value );
					});
				}
				// Also append the script version to purge the cdn cache for iframe: 
				iframeRequest += '&urid=' + KALTURA_LOADER_VERSION;

				var iframeId = $j( playerTarget ).attr('id');				
				iframeRequest+= mw.getIframeHash( iframeId);
				
				var $iframe = $j('<iframe />')
				.attr({
					'id' : iframeId,
					'class' : $j( playerTarget ).attr('class' ) + ' mwEmbedKalturaIframe',					
					'src' : mw.getMwEmbedPath() + 'mwEmbedFrame.php' + iframeRequest,
					'height' : $j( playerTarget ).height(),
					'width' : $j( playerTarget ).width()
				})
				.attr( 'style', $j( playerTarget ).attr('style') ) 
				.css({
					'border': '0px'
				});
				// Replace the player with the iframe: 
				$j( playerTarget ).replaceWith( $iframe );
				
				mw.log('$j.kalturaIframePlayer::iframe in page: ' + $j( 'iframe#' + iframeId ).length );
				
				// if the server is enabled 
				if(  mw.getConfig('EmbedPlayer.EnableIframeApi') ){
					// Invoke the iframe player api system:
					var iframeEmbedPlayer = $j( '#' + iframeId ).iFramePlayer( callback );
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
		});
	};
	
	/**
	 * Get the list of embed objects on the page that are 'kaltura players' 
	 */
	mw.getKalturaPlayerList = function(){
		var kalturaPlayers = [];
		// Check all objects for kaltura compatible urls 
		var objectList = document.getElementsByTagName('object');
		var tryAddKalturaEmbed = function( url , flashvars){
			var settings = kGetKalturaEmbedSettings( url, flashvars );
			if( settings && settings.uiconf_id && settings.wid ){
				objectList[i].kSettings = settings;
				kalturaPlayers.push(  objectList[i] );
				return true;
			}
			return false;
		};
		
		for( var i =0; i < objectList.length; i++){
			var swfUrl = '';
			var flashvars = '';
			var paramTags = objectList[i].getElementsByTagName('param');
			for( var j = 0; j < paramTags.length; j++){
				if( paramTags[j].getAttribute('name') == 'data'
					||
					paramTags[j].getAttribute('name') == 'src' )
				{
					swfUrl =  paramTags[j].getAttribute('value');
				}
				if( paramTags[j].getAttribute('name') == 'flashvars' ){
					flashvars =	paramTags[j].getAttribute('value');		
				}
			}
			if( swfUrl != '' && tryAddKalturaEmbed( swfUrl, flashvars) ){
				continue;
			}
			
			// Check for object data style url: 
			if( objectList[i].getAttribute('data') ){
				if( tryAddKalturaEmbed( objectList[i].getAttribute('data'), flashvars ) )
					continue;
			}
		}
		mw.log( 'mw.getKalturaPlayerList found ' + kalturaPlayers.length + ' kalturaPlayers' );
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

		var ks = ( entry.ks ) ? '?ks=' + entry.ks : '';
		
		return kCdn + '/p/' + entry.partner_id + '/sp/' +
			entry.partner_id + '00/thumbnail/entry_id/' + entry.entry_id + '/width/' +
			parseInt(entry.width) + '/height/' + parseInt(entry.height) + ks;
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
		var embedSettings = {};
		// Convert flashvars if in string format: 
		if( typeof flashvars == 'string' ){
			var flashVarsSet = ( flashvars )? flashvars.split('&'): [];
			flashvars = {};
			for( var i =0 ;i < flashVarsSet.length; i ++){
				var currentVar = flashVarsSet[i].split('=');
				if( currentVar[0] && currentVar[1] ){
					flashvars[ flashVar[0] ] = flashVar[1];
				}
			}
		}
		if( !flashvars ){
			flashvars= {};
		}
		// Include flashvars
		embedSettings.flashvars = flashvars;
			
		var dataUrlParts = swfUrl.split('/');
		
		// Search backward for key value pairs
		var prevUrlPart = null;
		while( dataUrlParts.length ){
			var curUrlPart =  dataUrlParts.pop();
			switch( curUrlPart ){
				case 'p':
					embedSettings.wid = '_' + prevUrlPart;
					embedSettings.p = prevUrlPart;
				break;
				case 'wid':
					embedSettings.wid = prevUrlPart;
					embedSettings.p = prevUrlPart.replace(/_/,'');
				break;
				case 'entry_id':
					embedSettings.entry_id = prevUrlPart;
				break;
				case 'uiconf_id':
					embedSettings.uiconf_id = prevUrlPart;
				break;
				case 'cache_st':
					embedSettings.cacheSt = prevUrlPart;
				break;
			}
			prevUrlPart = curUrlPart;
		}
		// Add in Flash vars embedSettings ( they take precedence over embed url )
		for( var i in  flashvars){
			embedSettings[ i.toLowerCase() ] = flashvars[i];
		}
		// Normalize the entryid to url request equivalents
		if( embedSettings[ 'entryid' ] ){
			embedSettings['entry_id'] =  embedSettings['entryid'];
		}
		return embedSettings;
	};
} )( window.mw );
