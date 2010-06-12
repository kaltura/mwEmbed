/*@cc_on@if(@_jscript_version<9){'video audio source track'.replace(/\w+/g,function(n){document.createElement(n)})}@end@*/

/**
* Kaltura html5 library loader 
* For more info on mwEmbed / kaltura html5 library see: 
* http://www.kaltura.org/project/HTML5_Video_Media_JavaScript_Library
*/

var kURID = '1.1p';
// Static script loader url: 
var SCRIPT_LOADER_URL = 'http://html5.kaltura.org/jsScriptLoader.php';
var SCRIPT_FORCE_DEBUG = false;

// These Lines are for local testing: 
//SCRIPT_FORCE_DEBUG = true;
//SCRIPT_LOADER_URL = '../mwEmbed/jsScriptLoader.php';
//kURID = new Date().getTime();


// Define mw
window['mw'] = {};

// Setup preMwEmbedReady queue
if( !preMwEmbedReady ){
	var preMwEmbedReady = [];
}
// Wrap mw.ready to preMwEmbedReady values
if( !mw.ready){
	mw.ready = function( fn ){
		preMwEmbedReady.push( fn );
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
// Check dom for kaltura embeds ( fall forward ) 
// && html5 video tag ( for fallback & html5 player interface )
kRanDomReadyFlag = false;
function kDomReady(){
	if( kRanDomReadyFlag ){
		return ;
	}
	kRanDomReadyFlag = true;
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
	if (
		(navigator.userAgent.indexOf('iPhone') != -1) || 
		(navigator.userAgent.indexOf('iPod') != -1) || 
		(navigator.userAgent.indexOf('iPad') != -1) ||
		(document.URL.indexOf('forceMobileSafari') != -1 ) // to debug in chrome / desktop safari
	) {
		
		for(var i=0; i < document.getElementsByTagName('object').length; i++) {
			var embedTag = document.getElementsByTagName('object')[i];
			if( embedTag.getAttribute( 'name' ) == 'kaltura_player' ) {											
				kAddScript();
				return ;
			}
		}
	}
}

// Add the kaltura html5 mwEmbed script
function kAddScript(){	
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
		'mw.style.jqueryUiRedmond',
		
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
var kAlreadyRunDomReadyFlag = false;
function kRunMwDomReady(){
	kAlreadyRunDomReadyFlag  = true;
	kDomReady();
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
