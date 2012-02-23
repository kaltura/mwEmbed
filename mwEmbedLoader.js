// The version of this script
var logIfInIframe = ( typeof preMwEmbedConfig != 'undefined' && preMwEmbedConfig['EmbedPlayer.IsIframeServer'] ) ? ' ( iframe ) ': '';
kWidget.log( 'Kaltura HTML5 Version: ' + KALTURA_LOADER_VERSION  +  logIfInIframe );

// Define mw ( if not already set ) 
if( !window['mw'] ) {
	window['mw'] = {};
}

window.restoreKalturaKDPCallback = function(){
	// To restore when we are not rewriting:
	if( window.KalturaKDPCallbackReady ){
		window.jsCallbackReady = window.KalturaKDPCallbackReady;
		window.KalturaKDPCallbackReady = null;
		if( window.KalturaKDPCallbackAlreadyCalled && window.KalturaKDPCallbackAlreadyCalled.length ){
			for( var i =0 ; i < window.KalturaKDPCallbackAlreadyCalled.length; i++ ){
				var playerId = window.KalturaKDPCallbackAlreadyCalled[i];
				window.jsCallbackReady( playerId );
				window.KWidget.globalJsReadyCallback( playerId );
			}
		}
		// Should have to do nothing.. kdp will call window.jsCallbackReady directly
	}
};

// Try and override the swfObject at runtime
// In case it was included before mwEmbedLoader and the embedSWF call is inline ( so we can't wait for dom ready )
kOverideJsFlashEmbed();

// Setup preMwEmbedReady queue
if( !window['preMwEmbedReady'] ){
	window.preMwEmbedReady = [];
}
// Setup preMwEmbedConfig if not set: 
if( !window['preMwEmbedConfig'] ) {
	window.preMwEmbedConfig = {};
}

if( ! mw.setConfig ){
	mw.setConfig = function( set, value ){
		var valueQueue = {};
		if( typeof value != 'undefined'  ) {
			window.preMwEmbedConfig[ set ] = value;
		} else if ( typeof set == 'object' ){
			for( var i in set ){
				window.preMwEmbedConfig[ i ] = set[i];
			}
		}
	};
}

if( ! mw.getConfig ){
	mw.getConfig = function ( key, defaultValue ){
		if( typeof window.preMwEmbedConfig[ key ] == 'undefined' ){
			if( typeof defaultValue != 'undefined' ){
				return defaultValue;
			}
			return null;
		} else {
			return window.preMwEmbedConfig[ key ];
		}
	};
}


/**
 * Url flags:
 */
// Note forceMobileHTML5 can be disabled by uiConf 
if( document.URL.indexOf('forceMobileHTML5') !== -1 ){
	mw.setConfig( 'forceMobileHTML5', true );
}

/**
 * A version comparison utility function Handles version of types
 * {Major}.{MinorN}.{Patch}
 * 
 * @param {String}
 *            minVersion Minimum version needed
 * @param {String}
 *            clientVersion Client version to be checked
 * 
 * @return true if the version is at least of minVersion false if the
 *         version is less than minVersion
 */

if( ! mw.versionIsAtLeast ){
	mw.versionIsAtLeast = function( minVersion, clientVersion ) {
		var minVersionParts = minVersion.split('.');
		var clientVersionParts = clientVersion.split('.');
		for( var i =0; i < minVersionParts.length; i++ ) {
			if( parseInt( clientVersionParts[i] ) > parseInt( minVersionParts[i] ) ) {
				return true;
			}
			if( parseInt( clientVersionParts[i] ) < parseInt( minVersionParts[i] ) ) {
				return false;
			}
		}
		// Same version:
		return true;
	};
}
// Wrap mw.ready to preMwEmbedReady values
if( !mw.ready ){
	mw.ready = function( fn ){	
		window.preMwEmbedReady.push( fn );
		kAddReadyHook(function(){
			kAddScript();
		});
	};
}


// Set iframe config if in the client page, will be passed to the iframe along with other config
if( ! mw.getConfig('EmbedPlayer.IsIframeServer') ){
	mw.setConfig('EmbedPlayer.IframeParentUrl', document.URL );
	mw.setConfig('EmbedPlayer.IframeParentTitle', document.title);
	mw.setConfig('EmbedPlayer.IframeParentReferrer', document.referrer);
}


function kDoIframeRewriteList( rewriteObjects ){
	for( var i=0; i < rewriteObjects.length; i++ ){
		
		var settings = rewriteObjects[i].kEmbedSettings;
		settings.width = rewriteObjects[i].width;
		settings.height = rewriteObjects[i].height;
		
		// If we have no flash &  no html5 fallback and don't care about about player rewrite 
		if( ! kWidget.supportsFlash() && ! kWidget.supportsHTML5() && !mw.getConfig( 'Kaltura.ForceFlashOnDesktop' )) {
			kDirectDownloadFallback( rewriteObjects[i].id, rewriteObjects[i].kEmbedSettings );
		} else {
			kalturaIframeEmbed( rewriteObjects[i].id, rewriteObjects[i].kEmbedSettings );
		}
	}
}
function kalturaIframeEmbed( replaceTargetId, kEmbedSettings ){
	// Empty the replace target:
	var elm = document.getElementById( replaceTargetId );
	if( ! elm ){
		// No target found ( probably already done ) 
		return false;
	}
	try {
		elm.innerHTML = '';
	} catch ( e ){
		// could not clear inner html
	}
	// Don't rewrite special key kaltura_player_iframe_no_rewrite
	if( elm.getAttribute('name') == 'kaltura_player_iframe_no_rewrite' ){
		return ;
	}
	// Check if the iframe API is enabled in which case we have to load client code and use that 
	// to rewrite the frame
	var uiconf_id = kEmbedSettings.uiconf_id;
	kEmbedSettings.isHTML5 = kIsHTML5FallForward();
	// Check if we even need to rewrite the page at all
	// Evaluate per user agent rules: 
	if( uiconf_id && window.kUserAgentPlayerRules && kUserAgentPlayerRules[ uiconf_id ]){
		var playerAction = window.checkUserAgentPlayerRules( kUserAgentPlayerRules[ uiconf_id ] );
		// Default play mode, if here and really using flash remap: 
		switch( playerAction.mode ){
			case 'flash':
				if( !kIsHTML5FallForward() && elm.nodeName.toLowerCase() == 'object'){
					restoreKalturaKDPCallback();
					return ;
				}
			break;
			case 'leadWithHTML5':
				kEmbedSettings.isHTML5 = kWidget.supportsHTML5();
				break;
			case 'forceMsg':
				var msg = playerAction.val;
				// write out a message:
				if( elm && elm.parentNode ){
					var divTarget = document.createElement("div");
					divTarget.innerHTML = unescape( msg );
					elm.parentNode.replaceChild( divTarget, elm );
				}
				break;
		}
		// Clear out any kUserAgentPlayerRules
		// XXX Ugly hack to recall AddScript ( loader is in desperate need of a refactor ) 
		window.kUserAgentPlayerRules = false;
		window.kAddedScript = false;
	}
	// Check for html with api off: 
	if( kEmbedSettings.isHTML5 && !mw.getConfig( 'EmbedPlayer.EnableIframeApi') 
			|| 
		( window.jQuery && !mw.versionIsAtLeast( '1.3.2', jQuery.fn.jquery ) ) 
	){
		kWidget.log( 'Kaltura HTML5 works best with jQuery 1.3.2 or above' );
		kIframeWithoutApi( replaceTargetId, kEmbedSettings );
		return ;
	}
	
	// Check if we are dealing with an html5 player or flash player
	if( kEmbedSettings.isHTML5 ){
		kAddScript( function(){

			var width = ( kEmbedSettings.width ) ? kEmbedSettings.width :
						( elm.width ) ? elm.width :
							( elm.style.width ) ? parseInt( elm.style.width ) : 400;

			var height = ( kEmbedSettings.height ) ? kEmbedSettings.height :
						( elm.height ) ? elm.height :
							( elm.style.height ) ? parseInt( elm.style.height ) : 300;

			var sizeUnit = (typeof kEmbedSettings.width == 'string' && kEmbedSettings.width.indexOf("px") === -1) ? 'px' : '';

			var targetCss = {
				'width': width + sizeUnit,
				'height': height + sizeUnit
			};

			var additionalTargetCss = kGetAdditionalTargetCss();
			$j.extend(targetCss, additionalTargetCss);
			$j('#' + replaceTargetId ).css(targetCss);
			// Do kaltura iframe player
			$j('#' + replaceTargetId ).kalturaIframePlayer( kEmbedSettings );
		});	
	} else {
		restoreKalturaKDPCallback();
		kWidget.outputFlashObject( replaceTargetId, kEmbedSettings );
	}
}
function kIframeWithoutApi( replaceTargetId, kEmbedSettings ){
	// Else we can avoid loading mwEmbed all together and just rewrite the iframe 
	// ( no javascript api needed )
	
	var iframeSrc = SCRIPT_LOADER_URL.replace( 'ResourceLoader.php', 'mwEmbedFrame.php' );
	iframeSrc += '?' + kEmbedSettingsToUrl( kEmbedSettings );
	
	// If remote service is enabled pass along service arguments:
	if( mw.getConfig( 'Kaltura.AllowIframeRemoteService' ) && 
		(
			mw.getConfig("Kaltura.ServiceUrl").indexOf('kaltura.com') === -1 &&
			mw.getConfig("Kaltura.ServiceUrl").indexOf('kaltura.org') === -1 
		)
	){
		iframeSrc += kServiceConfigToUrl();
	}
	
	// add the forceMobileHTML5 to the iframe if present on the client: 
	if( mw.getConfig( 'forceMobileHTML5' ) ){
		iframeSrc += '&forceMobileHTML5=true';
	}
	if( mw.getConfig( '	') ){
		iframeSrc += mw.getConfig( 'debug' );
	}
	
	// Also append the script version to purge the cdn cache for iframe: 
	iframeSrc += '&urid=' + KALTURA_LOADER_VERSION;

	var targetNode = document.getElementById( replaceTargetId );
	var parentNode = targetNode.parentNode;
	var iframe = document.createElement('iframe');
	iframe.src = iframeSrc;
	iframe.id = replaceTargetId;
	iframe.width = (kEmbedSettings.width) ? kEmbedSettings.width : '100%';
	iframe.height = (kEmbedSettings.height) ? kEmbedSettings.height : '100%';
	iframe.style.border = '0px';
	iframe.style.overflow = 'hidden';
		
	parentNode.replaceChild( iframe, targetNode );

}
function kEmbedSettingsToUrl( kEmbedSettings ){
	var url ='';
	var kalturaAttributeList = ['uiconf_id', 'entry_id', 'wid', 'p', 'cache_st'];
	for(var attrKey in kEmbedSettings ){
		// Check if the attrKey is in the kalturaAttributeList:
		for( var i =0 ; i < kalturaAttributeList.length; i++){
			if( kalturaAttributeList[i] == attrKey ){
				url += '&' + attrKey + '=' + encodeURIComponent( kEmbedSettings[attrKey] );  
			}
		}
	}
	// Add the flashvars:
	url += kFlashVarsToUrl( kEmbedSettings.flashvars );
	
	return url;
}
// Fallback handling for older devices
function kDirectDownloadFallback( replaceTargetId, kEmbedSettings , options ) {

	// Empty the replace target:
	var targetNode = document.getElementById( replaceTargetId );
	if( ! targetNode ){
			kWidget.log( "Error could not find object target: " + replaceTargetId );
	}
	// remove all object children
	// use try/catch to fix ie issue
	try {
		targetNode.innerHTML = '';
	} catch (e) {
		//alert(e);
	}
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
			'/wid/' + kEmbedSettings.wid;
	
	// Also add the uiconf id to the url:
	if( kEmbedSettings.uiconf_id ){
		downloadUrl += '/uiconf_id/' + kEmbedSettings.uiconf_id;
	}
	
	if( kEmbedSettings.entry_id ) {
		downloadUrl += '/entry_id/'+ kEmbedSettings.entry_id;
	}

	var thumbSrc = mw.getKalturaThumbUrl({
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
kalturaDynamicEmbed = false;
// Test if swfObject exists, try and override its embed method to wrap html5 rewrite calls. 
function kOverideJsFlashEmbed(){
	var doEmbedSettingsWrite = function ( kEmbedSettings, replaceTargetId, widthStr, heightStr ){	
		// Add a ready event to re-write: 
		// Setup the embedPlayer attributes
		var embedPlayerAttributes = {
			'kwidgetid' : kEmbedSettings.wid,
			'kuiconfid' : kEmbedSettings.uiconf_id
		};
		kEmbedSettings.width = ( widthStr ) ? ( widthStr ) : $j('#' + replaceTargetId ).width();
		kEmbedSettings.height = ( heightStr) ? ( heightStr ) : $j('#' + replaceTargetId ).height();
		
		if( kEmbedSettings.entry_id ){
			embedPlayerAttributes.kentryid = kEmbedSettings.entry_id;				
			embedPlayerAttributes.poster = mw.getKalturaThumbUrl( {
				'width' : parseInt( kEmbedSettings.width ),
				'height' : parseInt( kEmbedSettings.height ),
				'entry_id' :  kEmbedSettings.entry_id,
				'partner_id': kEmbedSettings.p 
			});
		}
		
		if( mw.getConfig( 'Kaltura.IframeRewrite' ) ){
			kalturaIframeEmbed( replaceTargetId, kEmbedSettings );
		} else {
			mw.ready(function(){
				$('#' + replaceTargetId ).empty()
				.css({
					'width' : kEmbedSettings.width ,
					'height' : kEmbedSettings.height
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
			window.kalturaDynamicEmbed = true;
			kAddReadyHook(function(){
				var kEmbedSettings = kGetKalturaEmbedSettings( attributes.src, flashvars);
				if( ! kWidget.supportsFlash() && ! kWidget.supportsHTML5() && ! mw.getConfig( 'Kaltura.ForceFlashOnDesktop' ) ){
					kDirectDownloadFallback( targetId, kEmbedSettings, {'width':attributes.width, 'height':attributes.height} );
					return ;
				}
				if( kEmbedSettings.uiconf_id && kIsHTML5FallForward()  ){
					document.getElementById( targetId ).innerHTML = '<div id="' + attributes.id + '"></div>';
					
					doEmbedSettingsWrite( kEmbedSettings, attributes.id, attributes.width, attributes.height);
				} else {
					// if its a kaltura player embed restore kdp callback:
					if( kEmbedSettings.uiconf_id ){
						restoreKalturaKDPCallback();
					}
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
			kalturaDynamicEmbed = true;
			var _this = this;
			kAddReadyHook(function(){			
				var kEmbedSettings = kGetKalturaEmbedSettings( _this.attributes.swf, _this.params.flashVars);
		
				if( kEmbedSettings.uiconf_id && ! kWidget.supportsFlash() && ! kWidget.supportsHTML5() && ! mw.getConfig( 'Kaltura.ForceFlashOnDesktop' ) ){
					kDirectDownloadFallback( targetId, kEmbedSettings );
					return ;
				}

				if( kIsHTML5FallForward() && kEmbedSettings.uiconf_id ){
					doEmbedSettingsWrite( kEmbedSettings, targetId, _this.attributes.width, _this.attributes.height);
				} else {
					// if its a kaltura player embed restore kdp callback:
					if( kEmbedSettings.uiconf_id ){
						restoreKalturaKDPCallback();
					}
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
			kalturaDynamicEmbed = true;
			kAddReadyHook(function(){
				var kEmbedSettings = kGetKalturaEmbedSettings( swfUrlStr, flashvarsObj);


				if( kEmbedSettings.uiconf_id && ! kWidget.supportsFlash() && ! kWidget.supportsHTML5() && ! mw.getConfig( 'Kaltura.ForceFlashOnDesktop' ) ){
					kDirectDownloadFallback( targetId, kEmbedSettings, {'width' : widthStr, 'height' :  heightStr} );
					return ;
				}

				// Check if kIsHTML5FallForward
				if( kIsHTML5FallForward( ) && kEmbedSettings.uiconf_id ){ 
					doEmbedSettingsWrite( kEmbedSettings, replaceElemIdStr, widthStr,  heightStr);
				} else {
					// if its a kaltura player embed restore kdp callback:
					if( kEmbedSettings.uiconf_id ){
						restoreKalturaKDPCallback();
					}
					// Else call the original EmbedSWF with all its arguments 
					window['swfobject']['originalEmbedSWF']( swfUrlStr, replaceElemIdStr, widthStr,
							heightStr, swfVersionStr, xiSwfUrlStr, flashvarsObj, parObj, attObj, callbackFn );
				}
			});
		};
	}
}

// Check DOM for Kaltura embeds ( fall forward ) 
// && html5 video tag ( for fallback & html5 player interface )
function kCheckAddScript(){
	// Check if we already have got uiConfJs or not
	if( mw.getConfig( 'Kaltura.EnableEmbedUiConfJs' ) && 
		! mw.getConfig( 'Kaltura.UiConfJsLoaded') && ! mw.getConfig('EmbedPlayer.IsIframeServer') ){
		// We have not yet loaded uiConfJS... load it for each ui_conf id
		var playerList = kGetKalturaPlayerList();
		var baseUiConfJsUrl = SCRIPT_LOADER_URL.replace( 'ResourceLoader.php', 'services.php?service=uiconfJs');
		var requestCount = playerList.length -1;
		for( var i=0;i < playerList.length; i++){
			kAppendScriptUrl( baseUiConfJsUrl + kEmbedSettingsToUrl( playerList[i].kEmbedSettings), function(){
				requestCount--;
				if( requestCount == 0){
					kCheckAddScript();
				}
			});
		}
		mw.setConfig( 'Kaltura.UiConfJsLoaded', true );
		return ;
	}

	// Set url based config ( as long as it not disabled ) 
	if( mw.getConfig( 'disableForceMobileHTML5') ){
		mw.setConfig( 'forceMobileHTML5', false );
	}
	
	// Check if we have player rules and then issue kAddScript call
	if( window.kUserAgentPlayerRules ){
		kAddScript();
		return ;
	}

	/**
	 * If Kaltura.AllowIframeRemoteService is not enabled force in page rewrite:
	 */
	var serviceUrl = mw.getConfig('Kaltura.ServiceUrl');
	if( ! mw.getConfig( 'Kaltura.AllowIframeRemoteService' ) ) {
		if( ! serviceUrl || serviceUrl.indexOf( 'kaltura.com' ) === -1 ){
			// if not hosted on kaltura for now we can't use the iframe to load the player
			mw.setConfig( 'Kaltura.IframeRewrite', false );
			mw.setConfig( 'Kaltura.UseManifestUrls', false);
		}
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
	// for debug purpose:
	// kSupportsFlash = function() {return false}; kWidget.supportsHTML5 = function() {return false};
	if( ! kWidget.supportsFlash() && ! kWidget.supportsHTML5() && ! mw.getConfig( 'Kaltura.ForceFlashOnDesktop' ) ){
		kAddScript();
		return ;
	}
	// Restore the jsCallbackReady ( we are not rewriting )
	if( kGetKalturaPlayerList().length && window.restoreKalturaKDPCallback ){
		window.restoreKalturaKDPCallback();
	}
}
// Fallforward by default prefers flash, uses html5 only if flash is not installed or not available 
function kIsHTML5FallForward( ){
	// Check for a mobile html5 user agent:
	if ( kWidget.isIOS() || mw.getConfig( 'forceMobileHTML5' )  ){
		return true;
	}
	
	// Check for "Kaltura.LeadWithHTML5" attribute
	if( mw.getConfig( 'KalturaSupport.LeadWithHTML5' ) || mw.getConfig( 'Kaltura.LeadWithHTML5' ) ){
		return kWidget.supportsHTML5();
	}

	// Special check for Android:
	if( navigator.userAgent.indexOf('Android 2.') != -1 ){
		if( mw.getConfig( 'EmbedPlayer.UseFlashOnAndroid' ) 
		    &&
		    kWidget.supportsFlash()
		){
			// Use flash on Android if available
			return false;
		} else {
			// Android 2.x supports the video tag
			return true;
		}
	}

	// If the browser supports flash ( don't use html5 )
	if( kWidget.supportsFlash() ){
		return false;
	}
	
	// Check if the UseFlashOnDesktop flag is set and ( don't check for html5 ) 
	if( mw.getConfig( 'Kaltura.ForceFlashOnDesktop' ) ){
		return false;
	}
	
	// No flash return true if the browser supports html5 video tag with basic support for canPlayType:
	if( kWidget.supportsHTML5() ){
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

// Add the kaltura html5 mwEmbed script
var kAddedScript = false;
function kAddScript( callback ){
	if( kAddedScript ){
		if( callback )
			callback();
		return ;
	}
	kAddedScript = true;
	
	if( window.jQuery && !mw.versionIsAtLeast( '1.3.2', jQuery.fn.jquery ) ){
		mw.setConfig( 'EmbedPlayer.EnableIframeApi', false );
	}
	
	var jsRequestSet = [];
	if( typeof window.jQuery == 'undefined' ) {
		jsRequestSet.push( 'window.jQuery' );
	}
	// Check if we are using an iframe ( load only the iframe api client ) 
	if( mw.getConfig( 'Kaltura.IframeRewrite' ) && ! kPageHasAudioOrVideoTags() ) {
		if( !window.kUserAgentPlayerRules && mw.getConfig( 'EmbedPlayer.EnableIframeApi') && ( kWidget.supportsFlash() || kWidget.supportsHTML5() ) ){
			jsRequestSet.push( 'mwEmbed', 'mw.style.mwCommon', '$j.cookie', '$j.postMessage', 'mw.EmbedPlayerNative', 'mw.IFramePlayerApiClient', 'mw.KWidgetSupport', 'mw.KDPMapping', 'JSON', 'fullScreenApi' );		
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
	    // mwEmbed utilities: 
		'mw.Uri',
		'fullScreenApi',
		
		// core skin: 
		'mw.style.mwCommon',
		// embed player:
		'mw.EmbedPlayer',
		'mw.processEmbedPlayers',

		'mw.MediaElement',
		'mw.MediaPlayer',
		'mw.MediaPlayers',
		'mw.MediaSource',
		'mw.EmbedTypes',
		
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
	if( mw.getConfig('EmbedPlayer.IsIframeServer') ){
		jsRequestSet.push(
			'$j.postMessage',
			'mw.IFramePlayerApiServer'
		);
	}
	
	// Add the jquery ui skin: 
	if( ! mw.getConfig('IframeCustomjQueryUISkinCss' ) ){
		if( mw.getConfig( 'jQueryUISkin' ) ){
			jsRequestSet.push( 'mw.style.ui_' + mw.getConfig( 'jQueryUISkin' )  );
		} else {
			jsRequestSet.push( 'mw.style.ui_kdark'  );
		}
	}
	
	var objectPlayerList = kGetKalturaPlayerList();

	// Check if we are doing object rewrite ( add the kaltura library ) 
	if ( kIsHTML5FallForward() || objectPlayerList.length ){
		// Kaltura client libraries:
		jsRequestSet.push(
		  'MD5',
		  'utf8_encode',
		  'base64_encode',
		  //'base64_decode',
		  "mw.KApi",
		  'mw.KWidgetSupport',
		  'mw.KAnalytics',
		  'mw.KDPMapping',
		  'mw.KCuePoints',
		  'mw.KTimedText',
		  'mw.KLayout',
		  'mw.style.klayout',
		  'titleLayout',
		  'volumeBarLayout',
		  'playlistPlugin',
		  'controlbarLayout',
		  'faderPlugin',
		  'watermarkPlugin',
		  'adPlugin',
		  'captionPlugin',
		  'bumperPlugin',
		  'myLogo'
		);
		// Kaltura playlist support ( so small relative to client libraries that we always include it )	
		jsRequestSet.push(
		   'mw.Playlist',
		   'mw.style.playlist',
		   'mw.PlaylistHandlerMediaRss',
		   'mw.PlaylistHandlerKaltura', 
		   'mw.PlaylistHandlerKalturaRss'
		);
		// Include iScroll
		jsRequestSet.push(
			'iScroll'
		);
		
	}
	kLoadJsRequestSet( jsRequestSet, callback );
}

function kAppendCssUrl( url ){
	var head = document.getElementsByTagName("head")[0];         
	var cssNode = document.createElement('link');
	cssNode.type = 'text/css';
	cssNode.rel = 'stylesheet';
	cssNode.media = 'screen';
	cssNode.href = url;
	head.appendChild(cssNode);
}
function kAppendScriptUrl( url, callback ) {
	// If the dom is not ready yet, write our script directly
	var script = document.createElement( 'script' );
	script.type = 'text/javascript';
	script.src = url;
	// xxx fixme integrate with new callback system ( resource loader rewrite )
	if( callback ){
		// IE sucks .. issues onload callback before ready 
		// xxx could conditional the callback delay on user 
		script.onload = callback;
	}
	document.getElementsByTagName('head')[0].appendChild( script );	
}

function kLoadJsRequestSet( jsRequestSet, callback ){
	if( typeof SCRIPT_LOADER_URL == 'undefined' ){
		alert( 'Error invalid entry point');
	}
	var url = SCRIPT_LOADER_URL + '?class=';
	// Add all the requested classes
	url+= jsRequestSet.join(',') + ',';
	url+= '&urid=' + KALTURA_LOADER_VERSION;
	url+= '&uselang=en';
	if ( mw.getConfig('debug') ){
		url+= '&debug=true';
	}
	// Check for $ library
	if( typeof $ != 'undefined' && ! $.jquery ){
		window['pre$Lib'] = $;
	}
	
	// Check for special global callback for script load
	kAppendScriptUrl(url, function(){
		if( window['pre$Lib'] ){
			jQuery.noConflict();
			window['$'] = window['pre$Lib'];
		}
		if( callback ){
			callback();
		}
	});
}
function kPageHasAudioOrVideoTags(){
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
	if( kWidget.domIsReady ){
		callback();
	} else {
		kReadyHookSet.push( callback );
	}
}
function kRunMwDomReady( event ){
	// run dom ready with a 1ms timeout to prevent sync execution in browsers like chrome
	// Async call give a chance for configuration variables to be set
	kWidget.domIsReady  = true;
	while( kReadyHookSet.length ){
		kReadyHookSet.shift()();
	}
	kOverideJsFlashEmbed();
	// When in iframe, wait for endOfIframe event status. ( IE9 has issues ) 
	if( mw.getConfig('EmbedPlayer.IsIframeServer')  && event !== 'endOfIframeJs' ){
		return ;
	}
	kCheckAddScript();
}

// Check if already ready: 
if ( document.readyState === "complete" ) {
	kRunMwDomReady();
}
// Fallback function that should fire for all browsers ( only for non-iframe ) 
if( ! mw.getConfig( 'EmbedPlayer.IsIframeServer') ){
	kSiteOnLoadCall = false;
	var kDomReadyCall = function(){
		if( typeof kSiteOnLoadCall == 'function' ){
			kSiteOnLoadCall();
		}
		kRunMwDomReady();
	};
	if( window.onload && window.onload.toString() != kDomReadyCall.toString() ){
		kSiteOnLoadCall = window.onload;
	}
	window.onload = kDomReadyCall;
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
	if ( kWidget.domIsReady ) {
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
 */
function kGetKalturaPlayerList(){
	var kalturaPlayers = [];
	// Check all objects for kaltura compatible urls 
	var objectList = document.getElementsByTagName('object');
	if( !objectList.length && document.getElementById('kaltura_player') ){
		objectList = [ document.getElementById('kaltura_player') ];
	}
	// local function to attempt to add the kalturaEmbed
	var tryAddKalturaEmbed = function( url , flashvars){
		var settings = kGetKalturaEmbedSettings( url, flashvars );
		if( settings && settings.uiconf_id && settings.wid ){
			objectList[i].kEmbedSettings = settings;
			kalturaPlayers.push(  objectList[i] );
			return true;
		}
		return false;
	};
	for( var i =0; i < objectList.length; i++){
		if( ! objectList[i] ){
			continue;
		}
		var swfUrl = '';
		var flashvars = {};
		var paramTags = objectList[i].getElementsByTagName('param');
		for( var j = 0; j < paramTags.length; j++){
			var pName = paramTags[j].getAttribute('name').toLowerCase();
			var pVal = paramTags[j].getAttribute('value');
			if( pName == 'data' ||	pName == 'src' || pName == 'movie' ) {
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
function kServiceConfigToUrl(){
	var serviceVars = ['ServiceUrl', 'CdnUrl', 'ServiceBase', 'UseManifestUrls'];
	var urlParam = '';
	for( var i=0; i < serviceVars.length; i++){
		if( mw.getConfig('Kaltura.' + serviceVars[i] ) !== null ){
			urlParam += '&' + serviceVars[i] + '=' + encodeURIComponent( mw.getConfig('Kaltura.' + serviceVars[i] ) );
		}
	}
	return urlParam;
}

function kFlashVarsToUrl( flashVarsObject ){
	var params = '';
	for( var i in flashVarsObject ){
		params+= '&' + 'flashvars[' + encodeURIComponent( i ) + ']=' + encodeURIComponent( flashVarsObject[i] );
	}
	return params;
}
function kFlashVarsToString( flashVarsObject ) {
	var params = '';
	for( var i in flashVarsObject ){
		params+= '&' + '' + encodeURIComponent( i ) + '=' + encodeURIComponent( flashVarsObject[i] );
	}
	return params;
}
/**
 * Get Kaltura thumb url from entry object
 */
mw.getKalturaThumbUrl = function ( entry ){
	if( entry.width == '100%')
		entry.width = 400;
	if( entry.height == '100%')
		entry.height = 300;

	var ks = ( entry.ks ) ? '?ks=' + entry.ks : '';

	// Support widget_id based thumbs: 
	if( entry.widget_id && ! entry.partner_id ){
		entry.partner_id = entry.widget_id.substr(1);
	}
	
	return mw.getConfig('Kaltura.CdnUrl') + '/p/' + entry.partner_id + '/sp/' +
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
function kGetKalturaEmbedSettings( swfUrl, flashvars ){
	var embedSettings = {};	
	// Convert flashvars if in string format:
	if( typeof flashvars == 'string' ){
		flashvars = kFlashVars2Object( flashvars );
	}
	
	if( !flashvars ){
		flashvars= {};
	}

	var trim = function ( str ) {
		return str.replace(/^\s+|\s+$/g,"");
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
			case 'uiconf_id': case 'ui_conf_id':
				embedSettings.uiconf_id = prevUrlPart;
			break;
			case 'cache_st':
				embedSettings.cache_st = prevUrlPart;
			break;
		}
		prevUrlPart = trim( curUrlPart );
	}
	// Add in Flash vars embedSettings ( they take precedence over embed url )
	for( var key in flashvars ){
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
		if( key == 'partnerid' ||  key == 'partner_id'){
			embedSettings.wid = '_' + val;
			embedSettings.p = val;
		}
		if( key == 'referenceid' ){
			embedSettings.reference_id = val;
		}
	}

	// Always pass cache_st
	if( ! embedSettings.cache_st )
		embedSettings.cache_st = 1;
	
	return embedSettings;
}

/*
 * When using Frameset that have iframe with video tag inside, the iframe is not positioned correctly. and you can't click on the controls.
 * If order to fix that, we allow to hosting page to pass the following configuration:
 * mw.setConfig('FramesetSupport.Enabled', true); - Disable HTML controls on iPad
 * mw.setConfig('FramesetSupport.PlayerCssProperties', {}); - CSS properties object to apply to the player
 * We will use 'PlayerCssProperties' only for iOS devices running version 3-4 ( the position issue was fixed in iOS5)
 */
function kGetAdditionalTargetCss() {
	var ua = navigator.userAgent;
	if( mw.getConfig('FramesetSupport.Enabled') && kWidget.isIOS() && (ua.indexOf('OS 3') > 0 || ua.indexOf('OS 4') > 0) ) {
		return mw.getConfig('FramesetSupport.PlayerCssProperties') || {};
	}
	return {};
}
kAddReadyHook(function() {
	if( mw.getConfig('FramesetSupport.Enabled') && kWidget.isIOS() ) {
		mw.setConfig('EmbedPlayer.EnableIpadHTMLControls', false );
	}
})

window.KalturaKDPCallbackAlreadyCalled = [];

/**
 * To support kaltura kdp mapping override
 */
window.checkForKDPCallback = function(){
	var pushAlreadyCalled = function( player_id ){
		window.KalturaKDPCallbackAlreadyCalled.push( player_id );
	}
	if( window.jsCallbackReady && window.jsCallbackReady.toString() != pushAlreadyCalled.toString() 
			&&
		window.KalturaKDPCallbackReady
	){
		window.originalKDPCallbackReady = window.jsCallbackReady;
	}
	// Always update the jsCallbackReady to call pushAlreadyCalled
	if( !window.jsCallbackReady || window.jsCallbackReady.toString() != pushAlreadyCalled.toString() ){
		window.jsCallbackReady = pushAlreadyCalled;
	}
	if( !window.KalturaKDPCallbackReady ){
		window.KalturaKDPCallbackReady = function( playerId ){
			if( window.originalKDPCallbackReady ){
				window.originalKDPCallbackReady( playerId );
			}
			window.KWidget.globalJsReadyCallback( playerId );
		};
	}
};

// Include legacy support for supports html5
function kIsIOS(){
	kWidget.log('kIsIOS is deprecated. Please use kWidget.isIOS');
	return kWidget.isIOS();
}
function kSupportsHTML5(){
	kWidget.log('kSupportsHTML5 is deprecated. Please use kWidget.supportsHTML5');
	return kWidget.supportsHTML5();
}
function kGetFlashVersion(){
	kWidget.log('kGetFlashVersion is deprecated. Please use kWidget.getFlashVersion');
	return kWidget.getFlashVersion();
}
function kSupportsFlash(){
	kWidget.log('kSupportsFlash is deprecated. Please use kWidget.supportsFlash');
	return kWidget.supportsFlash();
}
function kOutputFlashObject( targetId, settings ) {
	kWidget.log('kOutputFlashObject is deprecated. Please use kWidget.outputFlashObject');
	kWidget.outputFlashObject( targetId, settings );
}
function kIsIE(){
	return /msie/i.test(navigator.userAgent) && !/opera/i.test(navigator.userAgent);
}
// Check inline and when the DOM is ready:
checkForKDPCallback();
kAddReadyHook( checkForKDPCallback );
