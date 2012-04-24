// The version of this script
var logIfInIframe = ( typeof preMwEmbedConfig != 'undefined' && preMwEmbedConfig['EmbedPlayer.IsIframeServer'] ) ? ' ( iframe ) ': '';
kWidget.log( 'Kaltura HTML5 Version: ' + KALTURA_LOADER_VERSION  + logIfInIframe );

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
		kWidget.domReady(function(){
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
			kWidget.outputDirectDownload( rewriteObjects[i].id, rewriteObjects[i].kEmbedSettings );
		} else {
			kWidget.embed( rewriteObjects[i].id, rewriteObjects[i].kEmbedSettings );
		}
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
	var doEmbedSettingsWrite = function ( kEmbedSettings, replaceTargetId, widthStr, heightStr ){
			if( widthStr ) {
				kEmbedSettings.width = widthStr;
			}
			if( heightStr ) {
				kEmbedSettings.height = heightStr;
			}
			kWidget.embed( replaceTargetId, kEmbedSettings );
	};
	// flashobject
	if( window['flashembed'] && !window['originalFlashembed'] ){
		window['originalFlashembed'] = window['flashembed'];
		window['flashembed'] = function( targetId, attributes, flashvars ){
			kWidget.domReady(function(){
				var kEmbedSettings = kWidget.getEmbedSettings( attributes.src, flashvars);
				kEmbedSettings.width = attributes.width;
				kEmbedSettings.height = attributes.height;
				
				if( ! kWidget.supportsFlash() && ! kWidget.supportsHTML5() && ! mw.getConfig( 'Kaltura.ForceFlashOnDesktop' ) ){
					kWidget.outputDirectDownload( targetId, kEmbedSettings, {'width':attributes.width, 'height':attributes.height} );
					return ;
				}
				if( kEmbedSettings.uiconf_id && kWidget.isHTML5FallForward()  ){
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
			var _this = this;
			kWidget.domReady(function(){      
				var kEmbedSettings = kWidget.getEmbedSettings( _this.attributes.swf, _this.params.flashVars);
				if( kEmbedSettings.uiconf_id && ! kWidget.supportsFlash() && ! kWidget.supportsHTML5() && ! mw.getConfig( 'Kaltura.ForceFlashOnDesktop' ) ){
					kWidget.outputDirectDownload( targetId, kEmbedSettings );
					return ;
				}

				if( kWidget.isHTML5FallForward() && kEmbedSettings.uiconf_id ){
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
	// SWFObject v 2.x
	if( window['swfobject'] && !window['swfobject']['originalEmbedSWF'] ){
		window['swfobject']['originalEmbedSWF'] = window['swfobject']['embedSWF'];
		// Override embedObject for our own ends
		window['swfobject']['embedSWF'] = function( swfUrlStr, replaceElemIdStr, widthStr,
				heightStr, swfVersionStr, xiSwfUrlStr, flashvarsObj, parObj, attObj, callbackFn)
		{
			kWidget.domReady(function(){
				var kEmbedSettings = kWidget.getEmbedSettings( swfUrlStr, flashvarsObj );


				if( kEmbedSettings.uiconf_id && ! kWidget.supportsFlash() && ! kWidget.supportsHTML5() && ! mw.getConfig( 'Kaltura.ForceFlashOnDesktop' ) ){
					kWidget.outputDirectDownload( targetId, kEmbedSettings, {'width' : widthStr, 'height' :  heightStr} );
					return ;
				}

				// Check if IsHTML5FallForward
				if( kWidget.isHTML5FallForward() && kEmbedSettings.uiconf_id ){
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

// Add the kaltura html5 mwEmbed script
var kAddedScript = false;
var kQuenedAddScriptCallbacks = [];
function kAddScript( callback ){
	if( kAddedScript ){
		if( callback ){
			kQuenedAddScriptCallbacks.push( callback );
		}
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
			kLoadJsRequestSet( jsRequestSet, function(){
				while( kQuenedAddScriptCallbacks.length ){
					kQuenedAddScriptCallbacks.pop()();
				}
				if( callback ){
					callback();
				}
			} );
			return ;
		} else {
			kDoIframeRewriteList( kWidget.getKalutaObjectList() );
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
	
	var objectPlayerList = kWidget.getKalutaObjectList();

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
window.KalturaKDPCallbackAlreadyCalled = [];

/**
 * To support kaltura kdp mapping override
 */
window.checkForKDPCallback = function(){
	var pushAlreadyCalled = function( player_id ){
		window.KalturaKDPCallbackAlreadyCalled.push( player_id );
	}
	if( window.jsCallbackReady && window.jsCallbackReady.toString() != pushAlreadyCalled.toString() ){
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

// mw based globals that got converted to kWidget
mw.getKalturaThumbUrl = function( entry ){
	kWidget.log('mw.getKalturaThumbUrl is deprecated. Please use kWidget.getKalturaThumbUrl');
	return  kWidget.getKalturaThumbUrl( entry );
};


//Try and override the swfObject at runtime
//In case it was included before mwEmbedLoader and the embedSWF call is inline ( so we can't wait for dom ready )
kOverideJsFlashEmbed();
kWidget.domReady( kOverideJsFlashEmbed );

// Check inline and when the DOM is ready:
checkForKDPCallback();
kWidget.domReady( checkForKDPCallback );

// Rewrite object tags ( where needed ) inline and when the DOM is ready: 
kWidget.domReady( kWidget.rewriteObjectTags );

