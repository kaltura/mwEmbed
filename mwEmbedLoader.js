/*@cc_on'video source itext playlist'.replace(/\w+/g,function(n){document.createElement(n)})@*/

/**
* mwEmbed loader 
* For more info on mwEmbed stand alone / kaltura html5 library see: 
* http://www.kaltura.org/project/HTML5_Video_Media_JavaScript_Library
*/

var kURID = '1.1m';
// Static script loader url: 
var SCRIPT_LOADER_URL = 'http://html5.kaltura.org/jsScriptLoader.php';
SCRIPT_LOADER_URL = '../mwEmbed/jsScriptLoader.php';

// Define mw
window['mw'] = {};
kMwReadyQueue = [];
if( !mw.ready){
	mw.ready = function( fn ){
		kMwReadyQueue.push( fn );
	}
}
kMwSetConfigQueue = [];
if( !mw.setConfig ){
	mw.setConfig = function( set, value ){
		var valueQueue = {};
		if( value ) {			
			valueQueue[ set	] = value;
		} else {
			valueQueue = set;
		}
		kMwSetConfigQueue.push( valueQueue );
	}
}
// Chceck dom for kaltura embeds ( fall forward ) 
// && html5 video tag ( for fallback & html5 player interface )
function kDomReady(){	
	// If user javascript is using mw.ready add script
	if( kMwReadyQueue.length ) {
		kAddScript();
		return ;
	}
	
	// If document includes audio | video tags
	if( document.getElementsByTagName('video').length != 0
		|| document.getElementsByTagName('audio').length != 0 ) {
		kAddScript();
		return ;
	}
	
	// If document includes kaltura embed tags
	for(var i=0; i < document.getElementsByTagName('object').length; i++) {
		var embedTag = document.getElementsByTagName('object')[i];
		if( embedTag.getAttribute( 'name' ) == 'kaltura_player' ) {			
			kAddScript();
			return ;
		}
	}	
}

// Add the kaltura html5 mwEmbed script
function kAddScript(){
	var url = SCRIPT_LOADER_URL;
	
	// Add the class param
	url+= '?class=';
	
	// Add jQuery if not on the page already: 
	if( typeof window['jQuery'] == 'undefined') {
		url+='window.jQuery,';		
	}
	
	url+='mwEmbed';
	url+='&urid=' + kURID;
	url+='&uselang=en';
	
	url+='&debug=true';	
	
	// IE8 and Chrome seem to get random symbol not defined 
	// errors in conjunction witht he use of jQuery.noConflict()
	// and dynamic "onLoad" tirggered jQuery loading ( so write it out) 	
	document.write(unescape("%3Cscript src='" + url + "' type='text/javascript'%3E%3C/script%3E"));
	
	/*
	var script = document.createElement( 'script' );
	script.type = 'text/javascript';
	script.src = url;
	
	// Attach handlers ( if using script loader it issues onDone callback as well )	 		
	script.onload = script.onreadystatechange = function() {		
		if (!this.readyState || this.readyState == "loaded" || this.readyState == "complete") {
			kRunQueued();
		}
	};	
	document.getElementsByTagName('body')[0].appendChild( script );				
	*/
};	

var kHaveRunQueued = false;
function kRunQueued(){
	if( kHaveRunQueued ){
		return ;
	}
	kHaveRunQueued =  true;
	var startLength = kMwSetConfigQueue.length;
	
	while( kMwSetConfigQueue.length ){
		mw.setConfig( kMwSetConfigQueue.pop() );
		if( kMwSetConfigQueue.length == startLength ){
			// Error out ~ mwEMbed not defined? ~			
			break;
		}
	}	
	while( kMwReadyQueue.length ){
		mw.ready( kMwReadyQueue.pop() );
	}
}
 


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
	window.addEventListener( "load", mw.domReady, false );

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
