// The version of this script
var logIfInIframe = ( typeof preMwEmbedConfig != 'undefined' && preMwEmbedConfig['EmbedPlayer.IsIframeServer'] ) ? ' ( iframe ) ': '';
kWidget.log( 'Kaltura HTML5 Version: ' + KALTURA_LOADER_VERSION  + logIfInIframe );

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
		kWidget.domReady.ready(function(){
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
		kWidget.embed( rewriteObjects[i].id, rewriteObjects[i].kEmbedSettings );
	}
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

// Test if swfObject exists, try and override its embed method to wrap html5 rewrite calls. 
function kOverideJsFlashEmbed(){
	// flashobject
	if( window['flashembed'] && !window['originalFlashembed'] ){
		window['originalFlashembed'] = window['flashembed'];
		window['flashembed'] = function( targetId, attributes, flashvars ){
			kWidget.domReady.ready(function(){
				var kEmbedSettings = kGetKalturaEmbedSettings( attributes.src, flashvars);
				kEmbedSettings.width = attributes.width;
				kEmbedSettings.height = attributes.height;

				kWidget.embed( targetId, kEmbedSettings );
			});
		};
	}
	
	// SWFObject v 1.5 
	if( window['SWFObject']  && !window['SWFObject'].prototype['originalWrite']){
		window['SWFObject'].prototype['originalWrite'] = window['SWFObject'].prototype.write;
		window['SWFObject'].prototype['write'] = function( targetId ){
			var _this = this;
			kWidget.domReady.ready(function(){			
				var kEmbedSettings = kGetKalturaEmbedSettings( _this.attributes.swf, _this.params.flashVars);
				kEmbedSettings.width = _this.attributes.width;
				kEmbedSettings.height = _this.attributes.height;

				kWidget.embed( targetId, kEmbedSettings );
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
			kWidget.domReady.ready(function(){
				var kEmbedSettings = kGetKalturaEmbedSettings( swfUrlStr, flashvarsObj );
				kEmbedSettings.width = widthStr;
				kEmbedSettings.height = heightStr;

				// Check if IsHTML5FallForward
				if( kWidget.isHTML5FallForward() && kEmbedSettings.uiconf_id ){
					kWidget.embed( replaceElemIdStr, kEmbedSettings );
				} else {
					// if its a kaltura player embed restore kdp callback:
					if( kEmbedSettings.uiconf_id ){
						kWidget.restoreKDPCallback();
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
	if ( kWidget.isHTML5FallForward()
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
	if( kGetKalturaPlayerList().length ){
		kWidget.restoreKDPCallback();
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
	if ( kWidget.isHTML5FallForward() || objectPlayerList.length ){
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
		key = key.toLowerCase();
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
	if( ! embedSettings.cache_st ){
		embedSettings.cache_st = 1;
	}
	
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
kWidget.domReady.ready(function() {
	if( mw.getConfig('FramesetSupport.Enabled') && kWidget.isIOS() ) {
		mw.setConfig('EmbedPlayer.EnableIpadHTMLControls', false );
	}
})

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
function kalturaIframeEmbed( targetId, settings ){
	kWidget.log('kalturaIframeEmbed is deprecated. Please use kWidget.embed');
	kWidget.embed( targetId, settings );
}
function kOutputFlashObject( targetId, settings ) {
	kWidget.log('kOutputFlashObject is deprecated. Please use kWidget.outputFlashObject');
	kWidget.outputFlashObject( targetId, settings );
}
function kIsHTML5FallForward( ){
	kWidget.log('kIsHTML5FallForward is deprecated. Please use kWidget.isHTML5FallForward');
	return kWidget.isHTML5FallForward();
}
function kIframeWithoutApi( replaceTargetId, kEmbedSettings ){
	kWidget.log('kIframeWithoutApi is deprecated. Please use kWidget.outputIframeWithoutApi');
	return kWidget.outputIframeWithoutApi( replaceTargetId, kEmbedSettings );
}
function kDirectDownloadFallback( replaceTargetId, kEmbedSettings , options ) {
	kWidget.log('kDirectDownloadFallback is deprecated. Please use kWidget.outputDirectDownload');
	return kWidget.outputDirectDownload( replaceTargetId, kEmbedSettings , options );
}
function kIsIE(){
	return /msie/i.test(navigator.userAgent) && !/opera/i.test(navigator.userAgent);
}

// Try and override the swfObject at runtime
// In case it was included before mwEmbedLoader and the embedSWF call is inline ( so we can't wait for dom ready )
kOverideJsFlashEmbed();
kWidget.domReady.ready( kOverideJsFlashEmbed );

// Check inline and when the DOM is ready:
kWidget.checkForKDPCallback();
kWidget.domReady.ready( kWidget.checkForKDPCallback );
