/*@cc_on@if(@_jscript_version<9){'video audio source track'.replace(/\w+/g,function(n){document.createElement(n)})}@end@*/

/**
* Kaltura html5 library loader 
* For more info on mwEmbed / kaltura html5 library see: 
* http://www.kaltura.org/project/HTML5_Video_Media_JavaScript_Library
*/

var kURID = '1.1q';
// Static script loader url: 
var SCRIPT_LOADER_URL = 'http://html5.kaltura.org/ResourceLoader.php';
var SCRIPT_FORCE_DEBUG = false;

// These Lines are for local testing: 
//SCRIPT_FORCE_DEBUG = true;
//SCRIPT_LOADER_URL = 'http://192.168.1.100/html5.kaltura/mwEmbed/ResourceLoader.php';
//kURID = new Date().getTime();

// Define mw ( if not already set ) 
if( !window['mw'] ){
	window['mw'] = {};
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
	// Check if already override
	if( window['swfobject'] && window['swfobject']['originalEmbedSWF'] ){
		return ;	
	}
	
	if( window['swfobject'] && window['swfobject']['embedSWF'] ){
		window['swfobject']['originalEmbedSWF'] = window['swfobject']['embedSWF'];
		// override embedObjec for our own ends
		window['swfobject']['embedSWF'] = function( swfUrlStr, replaceElemIdStr, widthStr,
				heightStr, swfVersionStr, xiSwfUrlStr, flashvarsObj, parObj, attObj, callbackFn)
		{						
			var kEmbedSettings = kGetKalturaEmbedSettings( swfUrlStr, flashvarsObj);
			// Check if mobile safari: 
		
			if( kBrowserAgentShouldUseHTML5() && kEmbedSettings.entryId ){
				// Make sure we have kaltura script: 
				kAddScript();
				mw.ready(function(){					
					var width = ( widthStr )? parseInt( widthStr ) : $j('#' + replaceElemIdStr ).width();
					var height = ( heightStr)? parseInt( heightStr ) : $j('#' + replaceElemIdStr ).height();				
					var poster = 'http://cdnakmi.kaltura.com/p/' + kEmbedSettings.partnerId + '/sp/' +
						kEmbedSettings.partnerId + '00/thumbnail/entry_id/' + kEmbedSettings.entryId + '/width/' +
						height + '/height/' + width;
					$j('#' + replaceElemIdStr ).css({
						'width' : width,
						'height' : height
					}).embedPlayer({
						'poster': poster,
						'kentryid': kEmbedSettings.entryId,
						'kwidgetid' : kEmbedSettings.widgetId
					});
				});
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
	
		// Check for kaltura objects in the page
		var usedIdSet = [];
		for(var i=0; i < document.getElementsByTagName('object').length; i++) {
			var embedTag = document.getElementsByTagName('object')[i];
			if( embedTag.getAttribute( 'name' ) == 'kaltura_player' ) {											
				kAddScript();
				var kId = embedTag.getAttribute( 'id' );
				if( usedIdSet[ kId ] ) {
					// Update the id ( append index )
					embedTag.setAttribute( 'id',  kId + '_' + i);
				}
				usedIdSet[ embedTag.getAttribute( 'id' ) ] = true;
			}
		}
	}
}
function kBrowserAgentShouldUseHTML5(){
	return (  (navigator.userAgent.indexOf('iPhone') != -1) || 
	(navigator.userAgent.indexOf('iPod') != -1) || 
	(navigator.userAgent.indexOf('iPad') != -1) ||
	// to debug in chrome / desktop safari
	(document.URL.indexOf('forceMobileSafari') != -1 )
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
	
	if( typeof window.jQuery == 'undefined' ) {
		url+='window.jQuery,'
	}
	// Add mwEmbed and common style sheet
	url+= 'mwEmbed';	
	
	// Add all the classes needed for video 
	var jsPlayerRequest = [	 
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
		
		// jQuery helpers
		'$j.ui',  
		'$j.fn.hoverIntent',		
		'$j.cookie', 
		'JSON',	
		'$j.ui.slider', 							
		'$j.fn.menu',
		'mw.style.jquerymenu',		
		
		// Timed Text module
		'mw.TimedText',
		'mw.style.TimedText'		
	];
	url+= ',' + jsPlayerRequest.join(',');
	
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
// Copied from kalturaSupport loader mw.getKalturaEmbedSettingsFromUrl 
kGetKalturaEmbedSettings = function( swfUrl, flashvars ){
	// If the url does not include kwidget or entry_id probably not a kaltura settings url:
	if( swfUrl.indexOf('kwidget') == -1 || swfUrl.indexOf('entry_id') == -1 ){
		return {};
	}
	if( !flashvars )
		flashvars= {};
	
	var dataUrlParts = swfUrl.split('/');
	var embedSettings = {};
	
	embedSettings.entryId =  dataUrlParts.pop();		
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
	if( widgetId ){
		embedSettings.widgetId = widgetId;
		// Also set the partner id;
		embedSettings.partnerId = widgetId.replace(/_/,'');
	}
	// Flash vars take precedence: 
	for( var i in  flashvars){
		embedSettings[i] = flashvars[i];
	}
	return embedSettings;
};
