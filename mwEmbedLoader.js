/*@cc_on@if(@_jscript_version<9){'video audio source track'.replace(/\w+/g,function(n){document.createElement(n)})}@end@*/

/**
* Kaltura html5 library loader 
* For more info on mwEmbed / kaltura html5 library see: 
* http://www.kaltura.org/project/HTML5_Video_Media_JavaScript_Library
* 
* HTML5 Library usage is driven by html5 attributes see: 
* http://www.whatwg.org/specs/web-apps/current-work/multipage/video.html
* 
* Kaltura Configuration options are set via mw.setConfig( option, value ) or
* mw.setConfig( {json set of option value pairs } );
* 
* Some config options and their default values: ( can be set via mw.setConfig( name, value ); ) 
* 
*	// Enable analytics tracking for html5 devices
*	'Kaltura.EnableAnalytics' : true
*
*	// Base url for your api
*	'Kaltura.ServiceUrl' : 'http://www.kaltura.com'
*
*	// Path to kaltura api 
*	'Kaltura.ServiceBase' : '/api_v3/index.php?service=',
*
*	// The CDN url that hosts your assets.
*	'Kaltura.CdnUrl' : 'http://cdn.kaltura.com'
*
*	// If the html5 library should be loaded when there are video tags in the page.  
*	'Kaltura.LoadScriptForVideoTags' : true
*
*	// If the iframe should expose a javascript api emulating the video tag bindings and api
*	// lets you treat the iframe id like a video tag ie: 
*	// $j('#iframeid').get(0).play() 
*	//   and 
*	// $j('#iframeid').bind('ended', function(){ .. end playback event ... }
*	'EmbedPlayer.EnableIframeApi' : true
*/
// The version of this script
KALTURA_LOADER_VERSION = '1.4a10';
// Static script loader url: 
var SCRIPT_LOADER_URL = 'http://www.kaltura.org/apis/html5lib/mwEmbed/ResourceLoader.php';
var SCRIPT_FORCE_DEBUG = false;
var FORCE_LOAD_JQUERY = false;

// These Lines are for local testing: 
// SCRIPT_FORCE_DEBUG = true;
// SCRIPT_LOADER_URL = 'http://192.168.1.69/html5.kaltura/mwEmbed/ResourceLoader.php';

if( typeof console != 'undefined' && console.log ) {
	console.log( 'Kaltura MwEmbed Loader Version: ' + KALTURA_LOADER_VERSION );
}

// Define mw ( if not already set ) 
if( !window['mw'] ){
	window['mw'] = {};
}

// Url parameter to enable debug mode
if( document.URL.indexOf('debugKalturaPlayer=true') != -1 ){
	SCRIPT_FORCE_DEBUG = true;
}
if( document.URL.indexOf('debugKalturaForceJquery=true') != -1 ){
	FORCE_LOAD_JQUERY = true;
}

// Define the DOM ready flag
var kAlreadyRunDomReadyFlag = false;

// Try and override the swfObject at runtime
// In case it was included before mwEmbedLoader and the embedSWF call is inline ( so we can't wait for dom ready )
kOverideJsFlashEmbed();

// Setup preMwEmbedReady queue
if( !window.preMwEmbedReady ){
	window.preMwEmbedReady = [];
}
// Setup a preMwEmbedConfig var
if( ! preMwEmbedConfig ) {
	var preMwEmbedConfig = {};
}
if( ! mw.setConfig ){
	mw.setConfig = function( set, value ){
		var valueQueue = {};
		if( typeof value != 'undefined'  ) {
			preMwEmbedConfig[ set	] = value;
		} else if ( typeof set == 'object' ){
			for( var i in set ){
				preMwEmbedConfig[ i ] = set[i];
			}
		}
	};
}

if( ! mw.getConfig ){
	mw.getConfig = function ( name, defaultValue ){
		if( typeof preMwEmbedConfig[ name ] == 'undefined' ){
			if( typeof defaultValue != 'undefined' ){
				return defaultValue;
			}
			return null;
		} else {
			return preMwEmbedConfig[ name ];
		}
	};
}


// Wrap mw.ready to preMwEmbedReady values
if( !mw.ready){
	mw.ready = function( fn ){	
		window.preMwEmbedReady.push( fn );
		kAddReadyHook(function(){
			kAddScript();
		});
	};
}

// Set url based config:
if( document.URL.indexOf('forceMobileHTML5') != -1 ){
	mw.setConfig( 'forceMobileHTML5', true );
}
function kDoIframeRewriteList( rewriteObjects ){
	for( var i=0; i < rewriteObjects.length; i++ ){
		var options = { 'width': rewriteObjects[i].width, 'height': rewriteObjects[i].height };
		// If we have no flash &  no html5 fallback and don't care about about player rewrite 
		if( ! kSupportsFlash() && ! kSupportsHTML5() ) {
			kDirectDownloadFallback( rewriteObjects[i].id, rewriteObjects[i].kSettings, options );
		} else {
			kalturaIframeEmbed( rewriteObjects[i].id, rewriteObjects[i].kSettings, options );
		}
	}
}

function kalturaIframeEmbed( replaceTargetId, kEmbedSettings , options ){
	if( !options )
		options = {};
	// Empty the replace target:
	var elm = document.getElementById( replaceTargetId );
	if( ! elm ){
		// No target found ( probably already done ) 
		return false;
	}
	replaceTargetId.innerHTML = '';
	
	// Don't rewrite special key kaltura_player_iframe_no_rewrite
	if( replaceTargetId == 'kaltura_player_iframe_no_rewrite' ){
		return ;
	}
	
	// Check if the iframe API is enabled in which case we have to load client code and use that 
	// to rewrite the frame
	if( mw.getConfig( 'EmbedPlayer.EnableIframeApi' ) && ( kSupportsFlash() || kSupportsHTML5() ) ){
		if( kIsHTML5FallForward() ){
			kAddScript( function(){
				// Options include 'width' and 'height'
				$j('#' + replaceTargetId ).css({
					'width': options.width + 'px',
					'height': options.height + 'px'
				});
				// Do kaltura iframe player
				$j('#' + replaceTargetId ).kalturaIframePlayer( kEmbedSettings );
			});	
		} else {
			var jsRequestSet = [];
			if( typeof window.jQuery == 'undefined' || FORCE_LOAD_JQUERY ) {
				jsRequestSet.push( ['window.jQuery'] );
			}
			jsRequestSet.push('mwEmbed',  'mw.style.mwCommon', '$j.cookie', 'mw.EmbedPlayerNative', '$j.postMessage',  'kdpClientIframe', 'JSON' );
			// Load just the files needed for flash iframe bindings	
			kLoadJsRequestSet( jsRequestSet, function(){
				var iframeRewrite = new kdpClientIframe(replaceTargetId, kEmbedSettings, options);
			});
		}			
		return ;
	}		
	// Else we can avoid loading mwEmbed all together and just rewrite the iframe 
	// ( no javascript api needed )
	
	var iframeSrc = SCRIPT_LOADER_URL.replace( 'ResourceLoader.php', 'mwEmbedFrame.php' );
	var kalturaAttributeList = ['uiconf_id', 'entry_id', 'wid', 'p', 'cache_st'];
	for(var attrKey in kEmbedSettings ){
		// Check if the attrKey is in the kalturaAttributeList:
		for( var i =0 ; i < kalturaAttributeList.length; i++){
			if( kalturaAttributeList[i] == attrKey ){
				iframeSrc += '/' + attrKey + '/' + encodeURIComponent( kEmbedSettings[attrKey] );  
			}
		}
	}
	// add the flashvars:
	iframeSrc += '?' + kFlashVarsToUrl( kEmbedSettings.flashvars );
	
	// add the forceMobileHTML5 to the iframe if present on the client: 
	if( mw.getConfig( 'forceMobileHTML5' ) ){
		iframeSrc += '&forceMobileHTML5=true';
	}
	
	var targetNode = document.getElementById( replaceTargetId );
	var parentNode = targetNode.parentNode;
	var iframe = document.createElement('iframe');
	iframe.src = iframeSrc;
	iframe.id = replaceTargetId;
	iframe.width = (options.width) ? options.width : '100%';
	iframe.height = (options.height) ? options.height : '100%';
	iframe.style.border = '0px';
	iframe.style.overflow = 'hidden';
		
	parentNode.replaceChild(iframe, targetNode );

}

// Fallback handling for older devices
function kDirectDownloadFallback( replaceTargetId, kEmbedSettings , options ) {

	// Empty the replace target:
	var targetNode = document.getElementById( replaceTargetId );
	if( ! targetNode ){
		if( console && console.log )
			console.log( "Error could not find object target: " + replaceTargetId );
	}
	// remove all object children
	targetNode.innerHTML = '';
	//while ( targetNode.hasChildNodes() ) {
	//   targetNode.removeChild( targetNode.lastChild );
	//}
	if(!options)
		options = {};

	// look some other places for sizes:
	if( !options.width && kEmbedSettings.width )
		options.width = kEmbedSettings.width;
	if( !options.height && kEmbedSettings.height )
		options.height = kEmbedSettings.height;
	if( !options.width && targetNode.style.width )
		options.width = targetNode.style.width;
	if( !options.height && targetNode.style.height )
		options.height = targetNode.style.height;
	if( !options.height )
		options.height = 300;
	if( !options.width )
		options.width = 400;	

	// TODO: Add playEventUrl for stats
	var downloadUrl = SCRIPT_LOADER_URL.replace( 'ResourceLoader.php', 'modules/KalturaSupport/download.php' ) +
			'/wid/' + kEmbedSettings.wid + '/entry_id/'+ kEmbedSettings.entry_id;
	var thumbSrc = kGetEntryThumbUrl({
		'entry_id' : kEmbedSettings.entry_id,
		'partner_id' : kEmbedSettings.p,
		'width' : parseInt( options.width),
		'height' : parseInt( options.height)
	});
	var playButtonUrl = SCRIPT_LOADER_URL.replace( 'ResourceLoader.php', 'skins/common/images/player_big_play_button.png' );
	var playButtonCss = 'background: url(\'' + playButtonUrl + '\'); width: 70px; height: 53px; position: absolute; top:50%; left:50%; margin: -26px 0 0 -35px;';
	var ddId = 'dd_' + Math.random();

	var ddHTML = '<div id="' + ddId + '" style="width: ' + options.width + ';height:' + options.height + ';position:relative">' +
			'<img style="width:100%;height:100%" src="' + thumbSrc + '" >' +
			'<a href="' + downloadUrl + '" target="_blank" style="' + playButtonCss + '"></a>' +
		     '</div>';

	var parentNode = targetNode.parentNode;
	var div = document.createElement('div');
	div.style.width = options.width + 'px';
	div.style.height = options.height + 'px';

	div.innerHTML = ddHTML;
	parentNode.replaceChild( div, targetNode );

	// if failed, try appending after the node:
	if( ! document.getElementById( ddId ) ){
		parentNode.insertBefore( div, targetNode );
	}
}

// Test if swfObject exists, try and override its embed method to wrap html5 rewrite calls. 
function kOverideJsFlashEmbed(){
	var doEmbedSettingsWrite = function ( kEmbedSettings, replaceTargetId, widthStr, heightStr ){	
		// Add a ready event to re-write: 
		// Setup the embedPlayer attributes
		var embedPlayerAttributes = {
			'kwidgetid' : kEmbedSettings.wid,
			'kuiconfid' : kEmbedSettings.uiconf_id
		};
		var width = ( widthStr )? parseInt( widthStr ) : $j('#' + replaceTargetId ).width();
		var height = ( heightStr)? parseInt( heightStr ) : $j('#' + replaceTargetId ).height();
		
		if( kEmbedSettings.entry_id ){
			embedPlayerAttributes.kentryid = kEmbedSettings.entry_id;				
			embedPlayerAttributes.poster = kGetEntryThumbUrl( {
				'width' : width,
				'height' : height,
				'entry_id' :  kEmbedSettings.entry_id,
				'partner_id': kEmbedSettings.p 
			});
		}
		if( mw.getConfig( 'Kaltura.IframeRewrite' ) ){
			kalturaIframeEmbed( replaceTargetId, kEmbedSettings , { 'width': width, 'height': height } );
		} else {
			mw.ready(function(){
				$j('#' + replaceTargetId ).empty()
				.css({
					'width' : width,
					'height' : height
				})
				// Issue the embedPlayer call with embed attributes and the KDP ready callback
				.embedPlayer( embedPlayerAttributes );
			});
		}
	};
	// flashobject
	if( window['flashembed'] && !window['originalFlashembed'] ){
		window['originalFlashembed'] = window['flashembed'];
		window['flashembed'] = function( targetId, attributes, flashvars ){
			kAddReadyHook(function(){
				var kEmbedSettings = kGetKalturaEmbedSettings( attributes.src, flashvars);
				if( ! kSupportsFlash() && ! kSupportsHTML5() && ! mw.getConfig( 'Kaltura.ForceFlashOnDesktop' ) ){
					kDirectDownloadFallback( targetId, kEmbedSettings, {'width':attributes.width, 'height':attributes.height}   );
					return ;
				}
				if( kEmbedSettings.uiconf_id && kIsHTML5FallForward() && kEmbedSettings.uiconf_id ){
					doEmbedSettingsWrite( kEmbedSettings, targetId, attributes.width, attributes.height);
				} else {
					// Use the original flash player embed:  
					originalFlashembed( targetId, attributes, flashvars );
				}
			});
		};
	}
	
	// SWFObject v 1.5 
	if( window['SWFObject']  && !window['SWFObject'].prototype['originalWrite']){
		window['SWFObject'].prototype['originalWrite'] = window['SWFObject'].prototype.write;
		window['SWFObject'].prototype['write'] = function( targetId ){
			var _this = this;
			kAddReadyHook(function(){			
				var kEmbedSettings = kGetKalturaEmbedSettings( _this.attributes.swf, _this.params.flashVars);
		
				if( kEmbedSettings.uiconf_id && ! kSupportsFlash() && ! kSupportsHTML5() && ! mw.getConfig( 'Kaltura.ForceFlashOnDesktop' ) ){
					kDirectDownloadFallback( targetId, kEmbedSettings );
					return ;
				}

				if( kIsHTML5FallForward() && kEmbedSettings.uiconf_id ){
					doEmbedSettingsWrite( kEmbedSettings, targetId, _this.attributes.width, _this.attributes.height);
				} else {
					// use the original flash player embed:  
					_this.originalWrite( targetId );
				}
			});
		};
	}

	// SWFObject v 2.0
	if( window['swfobject'] && !window['swfobject']['originalEmbedSWF'] ){
		window['swfobject']['originalEmbedSWF'] = window['swfobject']['embedSWF'];
		// Override embedObject for our own ends
		window['swfobject']['embedSWF'] = function( swfUrlStr, replaceElemIdStr, widthStr,
				heightStr, swfVersionStr, xiSwfUrlStr, flashvarsObj, parObj, attObj, callbackFn)
		{
			kAddReadyHook(function(){
				var kEmbedSettings = kGetKalturaEmbedSettings( swfUrlStr, flashvarsObj);


				if( kEmbedSettings.uiconf_id && ! kSupportsFlash() && ! kSupportsHTML5() && ! mw.getConfig( 'Kaltura.ForceFlashOnDesktop' ) ){
					kDirectDownloadFallback( targetId, kEmbedSettings, {'width' : widthStr, 'height' :  heightStr} );
					return ;
				}

				// Check if kIsHTML5FallForward
				if( kIsHTML5FallForward() && kEmbedSettings.uiconf_id ){
					doEmbedSettingsWrite( kEmbedSettings, replaceElemIdStr, widthStr,  heightStr);
				} else {
					// Else call the original EmbedSWF with all its arguments 
					window['swfobject']['originalEmbedSWF']( swfUrlStr, replaceElemIdStr, widthStr,
							heightStr, swfVersionStr, xiSwfUrlStr, flashvarsObj, parObj, attObj, callbackFn );
				}
			});
		};
	}
}

function getFlashVersion(){
	// navigator browsers:
	if (navigator.plugins && navigator.plugins.length) {
		try {
			if(navigator.mimeTypes["application/x-shockwave-flash"].enabledPlugin){
				return (navigator.plugins["Shockwave Flash 2.0"] || navigator.plugins["Shockwave Flash"]).description.replace(/\D+/g, ",").match(/^,?(.+),?$/)[1];
			}
		} catch(e) {}
	}
	// IE
	try {
		try {
			if( typeof ActiveXObject != 'undefined' ){
				// avoid fp6 minor version lookup issues
				// see: http://blog.deconcept.com/2006/01/11/getvariable-setvariable-crash-internet-explorer-flash-6/
				var axo = new ActiveXObject('ShockwaveFlash.ShockwaveFlash.6');
				try { 
					axo.AllowScriptAccess = 'always'; 
				} catch(e) { 
					return '6,0,0'; 
				}
			}
		} catch(e) {}
    	return new ActiveXObject('ShockwaveFlash.ShockwaveFlash').GetVariable('$version').replace(/\D+/g, ',').match(/^,?(.+),?$/)[1];
	} catch(e) {}
	return '0,0,0';
}

// Check DOM for Kaltura embeds ( fall forward ) 
// && html5 video tag ( for fallback & html5 player interface )
var ranKCheckAddScript = false;
function kCheckAddScript(){
	/**
	 * Hard code some defaults for users not using the kaltura SAS
	 * It kind of sucks to hard code this, But we can't deliver iframes for non SAS users atm. 
	 */
	var serviceUrl = mw.getConfig('Kaltura.ServiceUrl');
	if( ! serviceUrl || serviceUrl != 'http://www.kaltura.com' ){
		// if not hosted on kaltura for now we can't use the iframe to load the player
		mw.setConfig( 'Kaltura.IframeRewrite', false );
		mw.setConfig( 'Kaltura.UseManifestUrls', false);
	}
	// If user javascript is using mw.ready add script
	if( window.preMwEmbedReady.length ) {
		kAddScript();
		return ;
	}
	if( ! mw.getConfig( 'Kaltura.ForceFlashOnDesktop' )  
			&& 
		( mw.getConfig( 'Kaltura.LoadScriptForVideoTags' ) && kPageHasAudioOrVideoTags()  )
	){
		kAddScript();
		return ;
	}
	// If document includes kaltura embed tags && isMobile safari: 
	if ( kIsHTML5FallForward()
			&&  
		kGetKalturaPlayerList().length 
	) {
		// Check for Kaltura objects in the page
		kAddScript();
		return ;
	}

	// Check if no flash and no html5 and no forceFlash ( direct download link ) 
	if( ! kSupportsFlash() && ! kSupportsHTML5() && ! mw.getConfig( 'Kaltura.ForceFlashOnDesktop' ) ){
		kAddScript();
		return ;		
	}

	// Restore the jsCallbackReady ( we are not rewriting )
	restoreKalturaKDPCallback();	
}
// Fallforward by default prefers flash, uses html5 only if flash is not installed or not available 
function kIsHTML5FallForward(){
	// Check for a mobile html5 user agent:
	if ( (navigator.userAgent.indexOf('iPhone') != -1) || 
		(navigator.userAgent.indexOf('iPod') != -1) || 
		(navigator.userAgent.indexOf('iPad') != -1) ||
		// Force html5 for chrome / desktop safari
		( mw.getConfig( 'forceMobileHTML5' ) )
	){
		return true;
	}
	// Special check for Android:
	if( navigator.userAgent.indexOf('Android 2.') != -1 ){
		if( mw.getConfig( 'EmbedPlayer.UseFlashOnAndroid' ) 
		    &&
		    kSupportsFlash()
		){
			// Use flash on Android if available
			return false;
		} else {
			// Android 2.x supports the video tag
			return true;
		}
	}

	// If the browser supports flash ( don't use html5 )
	if( kSupportsFlash() ){
		return false;
	}
	
	// Check if the UseFlashOnDesktop flag is set and ( don't check for html5 ) 
	if( mw.getConfig( 'Kaltura.ForceFlashOnDesktop' ) ){
		return false;
	}
	
	// No flash return true if the browser supports html5 video tag with basic support for canPlayType:
	if( kSupportsHTML5() ){
		return true;
	}
	// if we have the iframe enabled return true ( since the iframe will output a fallback link
	// even if the client does not support html5 or flash )
	if( mw.getConfig( 'Kaltura.IframeRewrite' ) ){
		return true;
	}
	
	// No video tag or flash, or iframe, normal "install flash" user flow )
	return false;
}
// basic html5 support check ( note Android 2.2 and bellow fail to return anything on canPlayType
// but is part of the mobile check above. 
function kSupportsHTML5(){
	var dummyvid = document.createElement( "video" );
	// Blackberry does not really support html5 ( 
	if( navigator.userAgent.indexOf('BlackBerry') != -1 ){
		return false ;
	}
	if( dummyvid.canPlayType ) {
		return true;
	}
	return false;
}
function kSupportsFlash(){
    var version = getFlashVersion().split(',').shift();
    if( version < 10 ){
    	return false;
    } else {
    	return true;
    }
}

// Add the kaltura html5 mwEmbed script
var kAddedScript = false;
function kAddScript( callback ){
	if( kAddedScript ){
		if( callback )
			callback();
		return ;
	}
	kAddedScript = true;

	var jsRequestSet = [];
	if( typeof window.jQuery == 'undefined' || FORCE_LOAD_JQUERY ) {
		jsRequestSet.push( 'window.jQuery' );
	}
	// Check if we are using an iframe ( load only the iframe api client ) 
	if( mw.getConfig( 'Kaltura.IframeRewrite' ) && ! kPageHasAudioOrVideoTags() ) {
		if( mw.getConfig( 'EmbedPlayer.EnableIframeApi') && ( kSupportsFlash() || kSupportsHTML5() ) ){
			jsRequestSet.push( 'mwEmbed', 'mw.style.mwCommon', '$j.cookie', 'mw.EmbedPlayerNative', '$j.postMessage',  'mw.IFramePlayerApiClient', 'mw.KDPMapping', 'JSON' );		
			// Load a minimal set of modules for iframe api
			kLoadJsRequestSet( jsRequestSet, callback );
			return ;
		} else {
			kDoIframeRewriteList( kGetKalturaPlayerList() );
			// if we don't have a mw.ready function we don't need to load the script library
			if( !window.preMwEmbedReady.length ){
				return ;
			}
		}
	}
	
	// Add all the classes needed for video 
	jsRequestSet.push(
	    'mwEmbed',
		// core skin: 
		'mw.style.mwCommon',
		// embed player:
		'mw.EmbedPlayer', 
		'mw.style.EmbedPlayer',
		'mw.PlayerControlBuilder',
		// default skin: 
		'mw.PlayerSkinMvpcf',
		'mw.style.PlayerSkinMvpcf',
		// common playback methods:
		'mw.EmbedPlayerNative',
		'mw.EmbedPlayerKplayer',
		'mw.EmbedPlayerJava',
		// jQuery lib
		'$j.ui',  
		'$j.widget',
		'$j.ui.mouse',
		'$j.fn.hoverIntent',
		'$j.cookie',
		'JSON',
		'$j.ui.slider',
		'$j.fn.menu',
		'mw.style.jquerymenu',
		// Timed Text module
		'mw.TimedText',
		'mw.style.TimedText'
	);
	// If an iframe server include iframe server stuff: 
	if( mw.getConfig('EmbedPlayer.IsIframePlayer') ){
		jsRequestSet.push(
			'$j.postMessage',
			'mw.IFramePlayerApiServer'
		);
	}
	
	// Add the jquery ui skin: 
	if( mw.getConfig( 'jQueryUISkin' ) ){
		jsRequestSet.push( 'mw.style.ui_' + mw.getConfig( 'jQueryUISkin' )  );
	} else {
		jsRequestSet.push( 'mw.style.ui_kdark'  );
	}
	
	var objectPlayerList = kGetKalturaPlayerList();

	// Check if we are doing object rewrite ( add the kaltura library ) 
	if ( kIsHTML5FallForward() || objectPlayerList.length ){
		// Kaltura client libraries:
		jsRequestSet.push(
		  'MD5',
		  "mw.KApi",
		  'mw.KWidgetSupport',
		  'mw.KAnalytics', 
		  'mw.KDPMapping',
		  'mw.KAds',
		  'mw.AdTimeline', 
		  'mw.AdLoader', 
		  'mw.VastAdParser',
		  'controlbarLayout',
		  'faderPlugin',
		  'watermarkPlugin',
		  'adPlugin',
		  'bumperPlugin'
		);
		// kaltura playlist support ( so small relative to client libraries that we always include it )	
		jsRequestSet.push(
		   'mw.Playlist',
		   'mw.style.playlist',
		   'mw.PlaylistHandlerMediaRss',
		   'mw.PlaylistHandlerKaltura', 
		   'mw.PlaylistHandlerKalturaRss'
		);
	}
	kLoadJsRequestSet( jsRequestSet, callback );
}

function isIE(){
	return /msie/i.test(navigator.userAgent) && !/opera/i.test(navigator.userAgent);
}

function kAppendScriptUrl( url, callback ) {
	var script = document.createElement( 'script' );
	script.type = 'text/javascript';
	script.src = url;
	// xxx fixme integrate with new callback system ( resource loader rewrite )
	if( callback ){
		// IE sucks .. issues onload callback before ready 
		// xxx could conditional the callback delay on user 
		if( isIE() ){
			script.onload = new function(){
				setTimeout(function(){
					callback();
				}, 100 );
			};
		} else {
			script.onload = callback;
		}
	}
	document.getElementsByTagName('head')[0].appendChild( script );	
}

function kLoadJsRequestSet( jsRequestSet, callback ){

	var url = SCRIPT_LOADER_URL + '?class=';
	// Add all the requested classes
	url+= jsRequestSet.join(',') + ',';
	url+= '&urid=' + KALTURA_LOADER_VERSION;
	url+= '&uselang=en';
	if ( SCRIPT_FORCE_DEBUG ){
		url+= '&debug=true';
	}

	// Check for special global callback for script load
	kAppendScriptUrl(url, callback);
}
function kPageHasAudioOrVideoTags(){
	if( !kSupportsHTML5() ){
		return false;
	}
	// if selector is set to false or is empty return false
	if( mw.getConfig( 'EmbedPlayer.RewriteSelector' ) === false || 
		mw.getConfig( 'EmbedPlayer.RewriteSelector' ) == '' ){
		return false;
	}
	// If document includes audio or video tags
	if( document.getElementsByTagName('video').length != 0
		|| document.getElementsByTagName('audio').length != 0 ) {
		return true;
	}
	return false;
}

/**
* DOM-ready setup ( similar to jQuery.ready )  
*/
var kReadyHookSet = [];
function kAddReadyHook( callback ){
	if( kAlreadyRunDomReadyFlag ){
		callback();
	} else {
		kReadyHookSet.push( callback );
	}
}
function kRunMwDomReady(){
	// run dom ready with a 1ms timeout to prevent sync execution in browsers like chrome
	// Async call give a chance for configuration variables to be set
	//window.setTimeout(function(){
		//alert('setTimeout::kRunMwDomReady');
		kAlreadyRunDomReadyFlag  = true;
		while( kReadyHookSet.length ){
			kReadyHookSet.shift()();
		}
		kOverideJsFlashEmbed();
		kCheckAddScript();
	//},100 );
}

// Check if already ready: 
if ( document.readyState === "complete" ) {
	kRunMwDomReady();
}
// fallback function that should fire for all browsers 
window.onload = function(){
	kRunMwDomReady();
}
// Cleanup functions for the document ready method
if ( document.addEventListener ) {
	DOMContentLoaded = function() {
		document.removeEventListener( "DOMContentLoaded", DOMContentLoaded, false );
		kRunMwDomReady();
	};

} else if ( document.attachEvent ) {
	DOMContentLoaded = function() {
		// Make sure body exists, at least, in case IE gets a little overzealous (ticket #5443).
		if ( document.readyState === "complete" ) {
			document.detachEvent( "onreadystatechange", DOMContentLoaded );
			kRunMwDomReady();
		}
	};
}

// Mozilla, Opera and webkit nightlies currently support this event
if ( document.addEventListener ) {
	// Use the handy event callback
	document.addEventListener( "DOMContentLoaded", DOMContentLoaded, false );
// If IE event model is used
} else if ( document.attachEvent ) {
	// ensure firing before onload,
	// maybe late but safe also for iframes
	document.attachEvent("onreadystatechange", DOMContentLoaded);
	// If IE and not a frame
	// continually check to see if the document is ready
	var toplevel = false;
	try {
		toplevel = window.frameElement == null;
	} catch(e) {
	}
	if ( document.documentElement.doScroll && toplevel ) {
		doScrollCheck();
	}
}
// A document addEventListener
if ( document.addEventListener ) {
	window.addEventListener( "load", kRunMwDomReady, false );
}
// The DOM ready check for Internet Explorer
function doScrollCheck() {
	if ( kAlreadyRunDomReadyFlag ) {
		return;
	}
	try {
		// If IE is used, use the trick by Diego Perini
		// http://javascript.nwbox.com/IEContentLoaded/
		document.documentElement.doScroll("left");
	} catch( error ) {
		setTimeout( doScrollCheck, 1 );
		return;
	}
	// and execute any waiting functions
	kRunMwDomReady();
}

/**
 * Get the list of embed objects on the page that are 'kaltura players'
 * Copied from kalturaSupport loader mw.getKalturaPlayerList  
 */
kGetKalturaPlayerList = function(){
	var kalturaPlayers = [];
	// check all objects for kaltura compatible urls 
	var objectList = document.getElementsByTagName('object');
	if( !objectList.length && document.getElementById('kaltura_player') ){
		objectList = [ document.getElementById('kaltura_player') ];
	}
	// local function to attempt to add the kalturaEmbed
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
		if( ! objectList[i] )
			continue;
		var swfUrl = '';
		var flashvars = {};
		var paramTags = objectList[i].getElementsByTagName('param');
		for( var j = 0; j < paramTags.length; j++){
			var pName = paramTags[j].getAttribute('name');
			var pVal = paramTags[j].getAttribute('value');
			if( pName == 'data' ||	pName == 'src' ) {
				swfUrl =  pVal;
			}
			if( pName == 'flashvars' ){
				flashvars =	kFlashVars2Object( pVal );
			}
		}

		if( tryAddKalturaEmbed( swfUrl, flashvars) ){
			continue;
		}

		// Check for object data style url: 
		if( objectList[i].getAttribute('data') ){
			if( tryAddKalturaEmbed( objectList[i].getAttribute('data'), flashvars ) )
				continue;
		}
	}
	return kalturaPlayers;
};

function kFlashVars2Object( flashvarsString ){
	var flashVarsSet = ( flashvarsString )? flashvarsString.split('&'): [];
	var flashvars = {};
	for( var i =0 ;i < flashVarsSet.length; i ++){
		var currentVar = flashVarsSet[i].split('=');
		if( currentVar[0] && currentVar[1] ){
			flashvars[ currentVar[0] ] = currentVar[1];
		}
	}
	return flashvars;
}

function kFlashVarsToUrl( flashVarsObject ){
	var params = '';
	for( var i in flashVarsObject ){
		params+= '&' + 'flashvars[' + encodeURIComponent( i ) + ']=' + encodeURIComponent( flashVarsObject[i] );
	}
	return params;
}

function kGetEntryThumbUrl( entry ){
	var kCdn = mw.getConfig( 'Kaltura.CdnUrl', 'http://cdnakmi.kaltura.com' ); 
	return kCdn + '/p/' + entry.partner_id + '/sp/' +
		entry.partner_id + '00/thumbnail/entry_id/' + entry.entry_id + '/width/' +
		entry.width + '/height/' + entry.height;
}
// Copied from kalturaSupport loader mw.getKalturaEmbedSettings  
function kGetKalturaEmbedSettings ( swfUrl, flashvars ){
	var embedSettings = {};	

	// Convert flashvars if in string format:
	if( typeof flashvars == 'string' ){
		flashvars = kFlashVars2Object( flashvars );
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
	for( var key in  flashvars){	
		var val = flashvars[key];
		var key = key.toLowerCase();
		// Normalize to the url based settings: 
		if( key == 'entryid' ){
			embedSettings.entry_id = val;
		}
		if(  key == 'uiconfid' ){
			embedSettings.uiconf_id = val;
		}
		if( key == 'widgetid' || key == 'widget_id' ){
			embedSettings.wid = val;
			embedSettings.p = val.replace(/_/,'');
		}	
		if( key == 'parentid' ||  key == 'parent_id'){
			embedSettings.wid = '_' + val;
			embedSettings.p = val;
		}
	}
	return embedSettings;
}

/**
 * To support kaltura kdp mapping override
 */
var checkForKDPCallback = function(){
	if( typeof window.jsCallbackReady != 'undefined' && !window.KalturaKDPCallbackReady ){
		window.KalturaKDPCallbackReady = window.jsCallbackReady;
		window.jsCallbackReady = function( player_id ){			
			window.KalturaKDPCallbackAlreadyCalled = player_id;
		};
	}
};
var restoreKalturaKDPCallback = function(){
	// To restore when we are not rewriting: 
	if( window.KalturaKDPCallbackReady ){
		window.jsCallbackReady = window.KalturaKDPCallbackReady;
		window.KalturaKDPCallbackReady = null;
		if( window.KalturaKDPCallbackAlreadyCalled ){
			window.jsCallbackReady( window.KalturaKDPCallbackAlreadyCalled );
		}
	}
};
// Check inline and when the dom is ready:
checkForKDPCallback();
kAddReadyHook( checkForKDPCallback );