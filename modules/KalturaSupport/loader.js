/**
 * kSupport module
 *  
 * Add support for kaltura api calls
 * 
 * TODO this loader is a little too large portions should be refactored into separate files
 *  this refactor can happen post rl_17 resource loader support
 */
// Scope everything in "mw" ( keeps the global namespace clean ) 
( function( mw, $ ) {

	mw.setDefaultConfig( {
		'Kaltura.EnableAnalytics' : true,
		'Kaltura.ServiceUrl' : 'http://www.kaltura.com',
		'Kaltura.StatsServiceUrl' : 'http://www.kaltura.com',
		'Kaltura.ServiceBase' : '/api_v3/index.php?service=',
		'Kaltura.CdnUrl' : 'http://cdnakmi.kaltura.com',
		'Kaltura.NoApiCache' : false, // By default tell the client to cache results
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
		// helps emulate the kdp behavior of not updating currentTime until a seek is complete. 
		'kPreSeekTime': null,
		'kalturaPlayerMetaData' : null,
		'kalturaEntryMetaData' : null,
		'kalturaPlaylistData' : null,
		'kalturaExportedEvaluateObject': null,
		'rawCuePoints' : null
	});
	
	mw.mergeConfig( 'EmbedPlayer.DataAttributes', {
		'flashvars': null
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
		"mw.KAdPlayer" : "mw.KAdPlayer.js",
		"mw.KPPTWidget" : "mw.KPPTWidget.js",
		"mw.style.klayout" : "mw.style.klayout.css",
		"mw.KLayout" : "mw.KLayout.js",
		"faderPlugin" : "uiConfComponents/faderPlugin.js",
		"watermarkPlugin" :  "uiConfComponents/watermarkPlugin.js",
		"adPlugin"	: 	"uiConfComponents/adPlugin.js",
		"captionPlugin"	: 	"uiConfComponents/captionPlugin.js",		
		"bumperPlugin"	: 	"uiConfComponents/bumperPlugin.js",
		"myLogo" : "uiConfComponents/myLogo.js",

		"playlistPlugin" : "uiConfComponents/playlistPlugin.js",
		
		"controlbarLayout"	: 	"uiConfComponents/controlbarLayout.js",
		"titleLayout" : "uiConfComponents/titleLayout.js",
		"volumeBarLayout"	:	"uiConfComponents/volumeBarLayout.js",
		
		"kdpClientIframe" : "kdpPageJs/kdpClientIframe.js",
		"kdpServerIFrame" : "kdpPageJs/kdpServerIFrame.js"
	} );
	
	// Set a local variable with the request set so we can append it to embedPlayer
	var kalturaSupportRequestSet = [
		'MD5',
		'utf8_encode',
		'base64_encode',
		//'base64_decode',
		'mw.KApi',
		'mw.KWidgetSupport',
		'mw.KCuePoints',
		'mw.KAnalytics',
		'mw.KDPMapping',
		'mw.KAds',
		'mw.KAdPlayer',
		'mw.KTimedText',
		'mw.KLayout',
		'mw.style.klayout',
		'controlbarLayout',
		'titleLayout',
		'volumeBarLayout',
		'faderPlugin',
		'watermarkPlugin',
		'adPlugin',
		'captionPlugin',
		'bumperPlugin',
		'playlistPlugin'
	];
	
	mw.newEmbedPlayerCheckUiConf = function( callback ){
		$( mw ).bind( 'newEmbedPlayerEvent', function(event, embedPlayer){
			$( embedPlayer ).bind( 'KalturaSupport_CheckUiConf', function( event, $uiConf, checkUiCallback ){
				callback( embedPlayer, checkUiCallback );
			})
		} );
	};
	
	
	mw.addModuleLoader( 'KalturaPlaylist', function() {
		return $.merge( kalturaSupportRequestSet,
			[
			  'mw.PlaylistHandlerKaltura', 
			  'mw.PlaylistHandlerKalturaRss'
			] );
	});
	
	// Set binding to disable "waitForMeta" for kaltura items ( We get size and length from api)
	$( mw ).bind( 'checkPlayerWaitForMetaData', function(even, playerElement ){
		if( $( playerElement ).attr( 'uiconf_id') || $( playerElement ).attr( 'entry_id') ){
			playerElement.waitForMeta = false;
		}
	});
	
	// Check if the document has kaltura objects ( for fall forward support ) 
	$( mw ).bind( 'LoadeRewritePlayerTags', function( event, rewriteDoneCallback ){
		// if kGetKalturaPlayerList is not defined ( we are not in a kaltura env )
		if( typeof kGetKalturaPlayerList == 'undefined'){
			return ;
		}
		
		var kalturaObjectPlayerList = kGetKalturaPlayerList();
		mw.log( 'KalturaSupport found:: ' + kalturaObjectPlayerList.length + ' is mobile::' +  mw.isHTML5FallForwardNative() );
		if( ! kalturaObjectPlayerList.length ) {
			// No players to rewrite ( and don't run  window.KalturaKDPCallbackReady )
			rewriteDoneCallback();
			return ;
		}else {
		
			// Check if we are NOT rewriting tags: 
			if( !kIsHTML5FallForward() ) {
				restoreKalturaKDPCallback();
				rewriteDoneCallback();
				return ;
			}
			// FALLFORWARD only for fallforward native players
			// this is kind of heavy weight for loader.js 
			// maybe move most of this to kEntryId support
			if( mw.isHTML5FallForwardNative() || mw.getConfig( 'Kaltura.IframeRewrite' ) ){
				
				// setup load flags
				var loadEmbedPlayerFlag = loadWidgetFlag = false;
				
				$.each( kalturaObjectPlayerList, function( inx, element ){
					// don't rewrite special id
					if( $(element).attr('name') == 'kaltura_player_iframe_no_rewrite' ){
						return true;
					}
					// Clear the kalturaSwapObjectClass
					var kalturaSwapObjectClass = '';
					// Setup the flashvars variable
					var flashvars = {};
					var flashVarsString = $( element ).find( "param[name='flashvars']" ).val();
					// try alternate case: 
					if( !flashVarsString ){
						flashVarsString = $( element ).find( "param[name='flashVars']" ).val();
					}
					if( flashVarsString ){
						var flashVarPairs = flashVarsString.split('&');
						for( var i =0; i < flashVarPairs.length; i++ ) {
							var parts = flashVarPairs[i].split('=');
							if( parts[0] ) {
								flashvars[ parts[0] ] = unescape( parts.slice(1).join('=') );
							}
						}
					}
					// Get the swf source from the element: 
					var swfSource =  $( element ).attr( 'data' );
					// try to get the source from a param if not defined in the top level embed. 
					if( !swfSource ) {
						swfSource = $( element ).find( "param[name=data]" ).attr( 'value' );						                                      
					}
					var kEmbedSettings = kGetKalturaEmbedSettings( swfSource, flashvars );

					// Check if its a playlist or a entryId
					mw.log( "Got kEmbedSettings.entryId: " + kEmbedSettings.entry_id + " uiConf: " + kEmbedSettings.uiconf_id);
					if(!kEmbedSettings.uiconf_id || !kEmbedSettings.wid ) {
						mw.log( "Error: Missing uiConfId/widgetId!");
					}
					
					var height = $( element ).attr('height');
					var width = $( element ).attr('width');
					
					// Check that the id is unique per player embed instance ( else give it a vid_{inx} id: 
					var videoId = $( element ).attr('id');
					$('.mwEmbedKalturaVideoSwap,.mwEmbedKalturaWidgetSwap').each(function( inx, swapElement){
						if( $( swapElement ).attr('id') ==  videoId ){
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
						'style' : $( element ).attr('style'),
						'width' : $( element ).attr('width'),
						'heigth' : $( element ).attr('height')
					};
					
					if( kEmbedSettings.entry_id ) {
						loadEmbedPlayerFlag = true;
						kalturaSwapObjectClass = 'mwEmbedKalturaVideoSwap';
						videoEmbedAttributes.kentryid = kEmbedSettings.entry_id;
						if( kEmbedSettings.p ){
							// If we have flashvar  we need to pass the ks to thumbnail url
							var ks = ( flashvars && flashvars.loadThumbnailWithKs ) ? flashvars.ks : false;
							var thumb_url =  mw.getKalturaThumbUrl({
								'partner_id': kEmbedSettings.p,
								'entry_id' :  kEmbedSettings.entry_id,
								'ks' : ks,
								'width' : parseInt( width ),
								'height' : parseInt( height )
							});
							$imgThumb = $('<img />').attr({
								'src' : thumb_url
							})
							.css({
								'width' : width,
								'height' : height,
								//'position' : 'absolute',
								'top' : '0px',
								'left' : '0px'
							});
						}
					} else {
						// Assume widget ( can be playlist or other widgets )
						loadWidgetFlag = true;
						kalturaSwapObjectClass = 'mwEmbedKalturaWidgetSwap';
					}
					
					var widthType = ( width.indexOf('%') == -1 )? 'px' : '';
					var heightType = ( height.indexOf('%') == -1 )? 'px' : '';
					// Replace with a mwEmbedKalturaVideoSwap
					$( element ).empty().replaceWith( 
						$('<div />')
						.attr( videoEmbedAttributes )
						.css({
							'width' : width + widthType,
							'height' : height + heightType,
							'position' : 'relative',
							'display' : 'inline-block' // more or less the <object> tag default display
						})
						.data('flashvars', flashvars)
						.data('cache_st', kEmbedSettings.cache_st)
						.addClass( kalturaSwapObjectClass )
						.append(
							$imgThumb,
							$('<div />')
							.attr('id', 'loadingSpinner_' + videoId )
							.css({
								'top' : '50%',
								'left' : '50%',
								'position' : 'absolute'
							})
							.loadingSpinner()
						)
					);					
					var elm = $('#' + videoEmbedAttributes.id ).get(0);
					// Assign values to DOM object methods ( not just attributes ) 
					$.each( videoEmbedAttributes, function( attrName, attrValue ){
						// skip style attr:
						if( attrName == 'style' )
							return true;
						try {
							elm[ attrName ] = attrValue;
						} catch ( e ){
							mw.log("Error: Kaltura loader could not set: " + attrName);
						}
					});
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
					if( $( '.mwEmbedKalturaVideoSwap,.mwEmbedKalturaWidgetSwap' ).length == 0 ){
						rewriteDoneCallback();
						return ;
					}
					$( '.mwEmbedKalturaVideoSwap,.mwEmbedKalturaWidgetSwap' ).each( function(inx, playerTarget ) {
						var kParams = {};
						var iframeRequestMap = {
								'kwidgetid': 'wid',
								'kuiconfid': 'uiconf_id', 
								'kentryid': 'entry_id'
						};
						// Set default to playerTraget.kEmbedSettings						
						for( var tagKey in iframeRequestMap ){
							if( $(playerTarget).attr( tagKey ) ){
								kParams[ iframeRequestMap[tagKey] ] = $(playerTarget).attr( tagKey );
							}
						}
						if( $( playerTarget).data( 'flashvars' ) ){
							kParams['flashvars'] = $( playerTarget).data('flashvars');
						}
						// Pass along cache_st to remove cache
						if( $( playerTarget).data( 'cache_st' ) ){
							kParams['cache_st'] = $( playerTarget).data('cache_st');
						}
						
						iframeRewriteCount++;
						$( playerTarget )
							.removeClass('mwEmbedKalturaWidgetSwap')
							.removeClass('mwEmbedKalturaVideoSwap')
							.kalturaIframePlayer( kParams, doneWithIframePlayer );
					});					
					// if there are no playlists left to process return: 
					if( $( '.mwEmbedKalturaWidgetSwap' ).length == 0 ){
						rewriteDoneCallback();
						return true;
					}
				}
				
				// Do loading then rewrite each tag:
				if( loadWidgetFlag ){
					kLoadKalturaSupport = true;
					// Have kWidget Support handle the uiConf swap: 
					mw.load( [ 'mw.KAPI', 'mw.KWidgetSupport' ], function(){
						var rewriteCount = 0;
						$('.mwEmbedKalturaWidgetSwap').each( function( inx, widgetTarget ) {
							rewriteCount++;
							window.kWidgetSupport.rewriteTarget( widgetTarget, function(){
								rewriteCount--;
								if( rewriteCount == 0){
									rewriteDoneCallback();
								}
							});
						});
					});
				}
				if( loadEmbedPlayerFlag ){
					mw.log("KalturaLoader:: load EmbedPlayer");
					mw.load('EmbedPlayer', function(){
						// Remove the general loading spinner ( embedPlayer takes over )
						$('.mwEmbedKalturaVideoSwap' ).embedPlayer( rewriteDoneCallback );
					});
				}
				// no loader, run the callback directly: 
				if( !loadWidgetFlag && !loadEmbedPlayerFlag ){
					rewriteDoneCallback();
				}
			}
		}		
	});
	var kLoadKalturaSupport = false;
	$( mw ).bind( 'LoaderEmbedPlayerUpdateRequest', function( event, playerElement, classRequest ) {
		// Check if any video tag uses the "kEmbedSettings.entryId"  
		if(  playerElement.kwidgetid || $(playerElement).attr( 'kwidgetid' ) ){
			kLoadKalturaSupport = true;
		}
		// Add kaltura support hook
		if( kLoadKalturaSupport ) {
			// Pass the flashvars to the iframe
			$( playerElement ).data('flashvars', mw.getConfig('KalturaSupport.IFramePresetFlashvars'));

			for(var i =0; i < kalturaSupportRequestSet.length; i++ ){
				if( $.inArray(kalturaSupportRequestSet[i], classRequest ) == -1 ){
					classRequest.push( kalturaSupportRequestSet[i] );
				}
			}
		}
	} );
	
	$( mw ).bind("Playlist_GetSourceHandler", function( event, playlist ){
		var $playlistTarget = $( '#' + playlist.id );
		var playlistEmbed = playlist.embedPlayer;
		var kplUrl0, playlistConfig;
		// Check if we are dealing with a kaltura player: 
		if( !playlistEmbed  ){
			// XXX deprecated old rewrite method: 
			playlistConfig = {
				'uiconf_id' : $playlistTarget.attr('kuiconfid'),
				'widget_id' : $playlistTarget.attr('kwidgetid'),
				'flashvars' : $playlistTarget.data('flashvars')
			};		
			if( playlistConfig && playlistConfig['flashvars'] ){
				kplUrl0 = playlistConfig['flashvars']['playlistAPI.kpl0Url'];
			}
		} else {
			playlistConfig = {
				'uiconf_id' : playlistEmbed.kuiconfid,
				'widget_id' : playlistEmbed.kwidgetid
			};
			kplUrl0 = playlistEmbed.getKalturaConfig( 'playlistAPI', 'kpl0Url' )
		}
		// No kpl0Url, not a kaltura playlist good
		if( !kplUrl0 ){
			return ;
		} 
		var plId =  mw.parseUri( kplUrl0 ).queryKey['playlist_id'];
		
		// If the url has a partner_id and executeplaylist in its url assume its a "kaltura services playlist"
		if( plId && mw.parseUri( kplUrl0 ).queryKey['partner_id'] && kplUrl0.indexOf('executeplaylist') != -1 ){
			playlistConfig.playlist_id = plId;
			playlist.sourceHandler = new mw.PlaylistHandlerKaltura( playlist, playlistConfig );
			return ;
		}
		// must be a media rss url:
		if( mw.isUrl( kplUrl0 ) ){
			playlist.src = kplUrl0;
			playlist.sourceHandler = new mw.PlaylistHandlerKalturaRss( playlist, playlistConfig );
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
	
		$( this ).each( function( inx, playerTarget ){
			mw.log( '$.kalturaIframePlayer::' + $( playerTarget ).attr('id') );
			// Check if the iframe API is enabled: 
			if( mw.getConfig('EmbedPlayer.EnableIframeApi') ){
				// Make sure the iFrame player client is loaded: 
				mw.load( ['$j.postMessage', 'mw.EmbedPlayerNative' , 'mw.IFramePlayerApiClient', 'mw.KWidgetSupport', 'mw.KDPMapping', 'JSON' ], function(){
					doRewriteIframe( iframeParams, playerTarget );											
				});
			} else {
				doRewriteIframe( iframeParams, playerTarget );
			}
		});
		
		// Local function to handle iframe rewrites: 
		function doRewriteIframe (iframeParams,  playerTarget ){
			// Build the iframe request from supplied iframeParams: 
			var iframeRequest = '';
			for( var key in iframeParams ){
				// don't put flashvars into the post url ( will be a request param ) 
				if( key == 'flashvars' ){
					continue;
				}
				
				iframeRequest+= '/' + key + 
					'/' + encodeURIComponent( iframeParams [ key ] );
			}
			// Add the player id: 
			iframeRequest+= '/?playerId=' + $( playerTarget ).attr('id');
			
			// Add the width and height of the player
			iframeRequest+= '&iframeSize=' +  $( playerTarget ).width() + 
							'x' + $(playerTarget).height();
				
			// Add &debug is in debug mode
			if( mw.getConfig( 'debug') ){
				iframeRequest+= '&debug=true';
			}
			
			// If remote service is enabled pass along service arguments: 
			if( mw.getConfig( 'Kaltura.AllowIframeRemoteService' )  && 
				(
					mw.getConfig("Kaltura.ServiceUrl").indexOf('kaltura.com') === -1 &&
					mw.getConfig("Kaltura.ServiceUrl").indexOf('kaltura.org') === -1 
				)
			){
				iframeRequest += kServiceConfigToUrl();
			}
		
			// Add debug flag if set: 
			if( mw.getConfig( 'debug' ) ){
				iframeRequest+= '&debug=true';
			}
			// Add no cache flag if set:
			if( mw.getConfig('Kaltura.NoApiCache') ) {
				iframeRequest+= '&nocache=true';
			}
			// Add the flashvars to the request:
			if( iframeParams['flashvars'] ){
				$.each( iframeParams['flashvars'], function( key, value){
					if( key ) {
						iframeRequest += '&' + encodeURIComponent( 'flashvars[' + key + ']' ) +
							'=' + encodeURIComponent( value );
					}
				});
			}
			// Also append the script version to purge the cdn cache for iframe: 
			iframeRequest += '&urid=' + KALTURA_LOADER_VERSION;

			var baseClass = $( playerTarget ).attr('class' ) ? $( playerTarget ).attr('class' ) + ' ' : '';
			var iframeId = $( playerTarget ).attr('id') + '_ifp';
			var iframeStyle = ( $( playerTarget ).attr('style') ) ? $( playerTarget ).attr('style') : '';

			var $iframe = $('<iframe />')
				.attr({
					'id' : iframeId,
					'name' : iframeId,
					'class' : baseClass + 'mwEmbedKalturaIframe',					
					'height' : $( playerTarget ).height(),
					'width' : $( playerTarget ).width()
				})
				.attr('style', iframeStyle)
				.css({
					'border': '0px'
				});
			
			// Create the iframe proxy that wraps the actual $iframe
			// and will be converted into an "iframe" player via jQuery.fn.iFramePlayer call
			var $iframeProxy = $('<div />').attr({
				'id' : $( playerTarget ).attr('id'),
				'name' : $( playerTarget ).attr('id')
			})
			.append( $iframe );
			
			// Setup the iframe ur
			var iframeUrl = mw.getMwEmbedPath() + 'mwEmbedFrame.php' + iframeRequest;
			
			// Check if we are setting iframe src or propagating via callback:
			if( mw.getConfig('EmbedPlayer.PageDomainIframe') ){
				// Set the iframe contents via callback 
				var cbName = 'mwi_' + iframeId.replace(/[^0-9a-zA-Z]/g, '');
				if( window[ cbName ] ){
					mw.log( "Error: iframe callback already defined: " + cbName );	
					cbName += parseInt( Math.random()* 1000 );
					return ;
				}
				window[ cbName ] = function( iframeData ){
					var newDoc = $( '#' + iframeId ).get(0).contentDocument;
					newDoc.open();
					newDoc.write( iframeData.content );
					newDoc.close();
				
					// Invoke the iframe player api system:
					$iframeProxy.iFramePlayer( callback );
					
					// clear out this global function 
					window[ cbName ] = null;
				};
				// Replace the player with the iframe: 
				$( playerTarget ).replaceWith( $iframeProxy );
				$.getScript( iframeUrl + '&callback=' + cbName );
			} else {
				iframeUrl += mw.getIframeHash( iframeId );
				// update the iframe url:
				$iframe.attr( 'src', iframeUrl );
				
				// Replace the player with the iframe: 
				$( playerTarget ).replaceWith( $iframeProxy );
			
				if(  mw.getConfig('EmbedPlayer.EnableIframeApi') ){
					// Invoke the iframe player api system:
					$iframeProxy.iFramePlayer( callback );
				}
			}
		};
	};
	
	/**
	 * Get Kaltura thumb url from entry object
	 */
	mw.getKalturaThumbUrl = function ( entry ){
		if( entry.width == '100%')
			entry.width = 400;
		if( entry.height == '100%')
			entry.height = 300;

		var ks = ( entry.ks ) ? '?ks=' + entry.ks : '';
		
		return mw.getConfig('Kaltura.CdnUrl') + '/p/' + entry.partner_id + '/sp/' +
			entry.partner_id + '00/thumbnail/entry_id/' + entry.entry_id + '/width/' +
			parseInt(entry.width) + '/height/' + parseInt(entry.height) + ks;
	};
	
} )( window.mw, jQuery );
