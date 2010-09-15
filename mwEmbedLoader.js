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
* Some config options and their defualt values: 
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
*/

var kURID = '1.1q';
// Static script loader url: 
var SCRIPT_LOADER_URL = 'http://www.kaltura.org/apis/html5lib/mwEmbed/ResourceLoader.php';
var SCRIPT_FORCE_DEBUG = false;
var FORCE_LOAD_JQUERY = false;

// These Lines are for local testing: 
SCRIPT_FORCE_DEBUG = true;
SCRIPT_LOADER_URL = 'http://192.168.1.101/html5.kaltura/mwEmbed/ResourceLoader.php';
//kURID = new Date().getTime();

if( typeof console != 'undefined' && console.log ) {
	console.log( 'Kaltura MwEmbed Loader Version: ' + kURID );
}

// Define mw ( if not already set ) 
if( !window['mw'] ){
	window['mw'] = {};
}

// Magic url parameter to enable debug mode
if( document.URL.indexOf('debugKalturaPlayer=true') != -1 ){
	SCRIPT_FORCE_DEBUG = true;
}
if( document.URL.indexOf('debugKalturaForceJquery=true') != -1 ){
	FORCE_LOAD_JQUERY = true
}

// Define the dom ready flag
var kAlreadyRunDomReadyFlag = false;

// Try and override the swfObject at runtime
// In case it was included before mwEmbedLoader and the embedSWF call is inline 
kOverideSwfObject();

// Setup preMwEmbedReady queue
if( !preMwEmbedReady ){
	var preMwEmbedReady = [];
}
// Wrap mw.ready to preMwEmbedReady values
if( !mw.ready){
	mw.ready = function( fn ){
		preMwEmbedReady.push( fn );
		// Check if mw.ready was called after the dom is ready:
		if( kAlreadyRunDomReadyFlag ){
			kCheckAddScript();
		}
	}
}
// Setup a preMwEmbedConfig var
if( ! preMwEmbedConfig ) {
	var preMwEmbedConfig = [];
}
if( !mw.setConfig ){
	mw.setConfig = function( set, value ){		
		var valueQueue = {};
		if( typeof value != 'undefined'  ) {			
			preMwEmbedConfig[ set	] = value;
		} else if ( typeof set == 'object' ){
			for( var i in set ){
				preMwEmbedConfig[ i ] = set[i];
			}
		}
	}
}

// Test if swfObject exists, try and override its embed method to wrap html5 rewrite calls. 
function kOverideSwfObject(){

	var doEmbedSettingsWrite = function ( kEmbedSettings, replaceTarget, widthStr, heightStr ){
		// Make sure we have kaltura script: 
		kAddScript();
		
		// Add a ready event to re-write: 
		mw.ready(function(){			
			// Setup the embedPlayer attributes
			var embedPlayerAttributes = {
					'kwidgetid' : kEmbedSettings.widgetId,
					'kuiconfid' : kEmbedSettings.uiconfId
			}					
			
			var width = ( widthStr )? parseInt( widthStr ) : $j('#' + replaceTarget ).width();
			var height = ( heightStr)? parseInt( heightStr ) : $j('#' + replaceTarget ).height();
			
			if( kEmbedSettings.entryId ){
				embedPlayerAttributes.kentryid = kEmbedSettings.entryId;
				embedPlayerAttributes.poster = 'http://cdnakmi.kaltura.com/p/' + kEmbedSettings.partnerId + '/sp/' +
				kEmbedSettings.partnerId + '00/thumbnail/entry_id/' + kEmbedSettings.entryId + '/width/' +
				height + '/height/' + width;
			}			
			$j('#' + replaceTarget ).css({
				'width' : width,
				'height' : height
			}).embedPlayer( embedPlayerAttributes );
		});
	}
	
	// SWFObject v 1.5 
	if( window['SWFObject']  && !window['SWFObject'].prototype['originalWrite']){
		window['SWFObject'].prototype['originalWrite'] = window['SWFObject'].prototype.write;
		window['SWFObject'].prototype['write'] = function( targetId ){			
			var flashVarsSet = this.params.flashVars.split('&');
			flashVars = {};
			for( var i =0 ;i < flashVarsSet.length; i ++){
				var flashVar = flashVarsSet[i].split('=');
				if( flashVar[0] &&   flashVar[1]){
					flashVars[ flashVar[0] ] = flashVar[1];
				}
			}						
			
			var kEmbedSettings = kGetKalturaEmbedSettings( this.attributes.swf, flashVars);
			if( kBrowserAgentShouldUseHTML5() && kEmbedSettings.uiconfId ){				
				doEmbedSettingsWrite( kEmbedSettings, targetId, this.attributes.width, this.attributes.height);
			} else { 
				// use the original flash player embed:  
				this.originalWrite( targetId );
			}					
		}
	}

	// SWFObject v 2.0
	if( window['swfobject'] && !window['swfobject']['embedSWF'] ){
		window['swfobject']['originalEmbedSWF'] = window['swfobject']['embedSWF'];
		// override embedObject for our own ends
		window['swfobject']['embedSWF'] = function( swfUrlStr, replaceElemIdStr, widthStr,
				heightStr, swfVersionStr, xiSwfUrlStr, flashvarsObj, parObj, attObj, callbackFn)
		{						
			var kEmbedSettings = kGetKalturaEmbedSettings( swfUrlStr, flashvarsObj);
			// Check if mobile safari: 
			
			if( kBrowserAgentShouldUseHTML5() && kEmbedSettings.uiconfId ){
				doEmbedSettingsWrite( kEmbedSettings, replaceElemIdStr, widthStr,  heightStr);
			} else {				
				// Else call the original EmbedSWF with all its arguments 
				window['swfobject']['originalEmbedSWF']( swfUrlStr, replaceElemIdStr, widthStr,
						heightStr, swfVersionStr, xiSwfUrlStr, flashvarsObj, parObj, attObj, callbackFn )
			}
		}
	}
}

// Check dom for kaltura embeds ( fall forward ) 
// && html5 video tag ( for fallback & html5 player interface )
function kCheckAddScript(){
	// If user javascript is using mw.ready add script
	if( preMwEmbedReady.length ) {
		kAddScript();
		return ;
	}
	
	// If document includes audio or video tags
	if( document.getElementsByTagName('video').length != 0
		|| document.getElementsByTagName('audio').length != 0 ) {
		kAddScript();
		return ;
	}		
	// If document includes kaltura embed tags && isMobile safari: 
	if ( kBrowserAgentShouldUseHTML5() ) {		
		// Check for Kaltura objects in the page
		if( kGetKalturaPlayerList().length ){
			kAddScript();
		}
	}
}
function kBrowserAgentShouldUseHTML5(){	
	return (  (navigator.userAgent.indexOf('iPhone') != -1) || 
	(navigator.userAgent.indexOf('iPod') != -1) || 
	(navigator.userAgent.indexOf('iPad') != -1) ||
	(navigator.userAgent.indexOf('Android 2.') != -1) || 
	// to debug in chrome / desktop safari
	(document.URL.indexOf('forceMobileHTML5') != -1 )
	);
}

// Add the kaltura html5 mwEmbed script
var kAddedScript = false;
function kAddScript(){
	
	if( kAddedScript ){
		return ;
	}	
	kAddedScript = true;	
	var url = SCRIPT_LOADER_URL + '?class=';	
	var jsPlayerRequest = [];
	
	if( typeof window.jQuery == 'undefined' || FORCE_LOAD_JQUERY ) {
		jsPlayerRequest.push( 'window.jQuery' )
	}
	
	// Add all the classes needed for video 
	jsPlayerRequest = jsPlayerRequest.concat( [	 
	    'mwEmbed',
		// core skin: 
		'mw.style.mwCommon',	      
		'mw.style.ui_redmond',
		
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
		'mw.style.TimedText',
		
		// Player themer module
		'mw.PlayerThemer'
	]);
	url+= jsPlayerRequest.join(',');
	
	url+='&urid=' + kURID;
	url+='&uselang=en';
	
	if ( SCRIPT_FORCE_DEBUG ){
		url+='&debug=true';
	}
	
	var script = document.createElement( 'script' );
	script.type = 'text/javascript';
	script.src = url;	
	// no handlers: 			
	document.getElementsByTagName('body')[0].appendChild( script );				
};
/**
* DOM-ready setup ( similar to jQuery.ready )  
*/
function kRunMwDomReady(){	
	kAlreadyRunDomReadyFlag  = true;	
	kOverideSwfObject();
	kCheckAddScript();	
}
// Check if already ready: 
if ( document.readyState === "complete" ) {
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
	
	// A fallback to window.onload, that will always work
	window.addEventListener( "load", kRunMwDomReady, false );

// If IE event model is used
} else if ( document.attachEvent ) {
	// ensure firing before onload,
	// maybe late but safe also for iframes
	document.attachEvent("onreadystatechange", DOMContentLoaded);
	
	// A fallback to window.onload, that will always work
	window.attachEvent( "onload", kRunMwDomReady );

	// If IE and not a frame
	// continually check to see if the document is ready
	var toplevel = false;

	try {
		toplevel = window.frameElement == null;
	} catch(e) {}

	if ( document.documentElement.doScroll && toplevel ) {
		doScrollCheck();
	}
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
	var tryAddKalturaEmbed = function( url ){
		var settings = kGetKalturaEmbedSettings( url );
		if( settings && settings.uiconfId && settings.widgetId ){
			kalturaPlayers.push(  objectList[i] );
			return true;
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
}
// Copied from kalturaSupport loader mw.getKalturaEmbedSettings  
kGetKalturaEmbedSettings = function( swfUrl, flashvars ){		
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
	// Add in Flash vars embedSettings ( they take precedence over embed url ) 
	for( var i in  flashvars){
		embedSettings[i] = flashvars[i];
	}
	return embedSettings;
};