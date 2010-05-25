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
	
	// Unfortunately IE8 javascript system is evil
	// And it gives "Object doesn't support this property or method" 
	// on random $j calls with head.append( script ) insert so use document.write ::	
	//document.write(unescape("%3Cscript src='" + url + "' type='text/javascript'%3E%3C/script%3E"));
	
	var script = document.createElement( 'script' );
	script.type = 'text/javascript';
	script.src = url;
	
	// Attach handlers ( if using script loader it issues onDone callback as well )	 		
	script.onload = script.onreadystatechange = function() {		
		if (!this.readyState || this.readyState == "loaded" || this.readyState == "complete") {
			kRunQueued();
		}
	};	
	document.getElementsByTagName('head')[0].appendChild( script );				
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
 * Simple document ready 
 */
var kAlreadyRunDomReadyFlag=0;

if (document.addEventListener) {
	document.addEventListener("DOMContentLoaded", function(){		
		kAlreadyRunDomReadyFlag=1; kDomReady();
	}, false)
} else if (document.all && !window.opera){
	document.write('<script type="text/javascript" id="contentloadtag" defer="defer" src="javascript:void(0)"><\/script>')
	var contentloadtag=document.getElementById("contentloadtag")
	contentloadtag.onreadystatechange=function(){
	  if (this.readyState=="complete"){
    	kAlreadyRunDomReadyFlag=1
    	kDomReady()
    }
  }
}

window.onload=function(){
  setTimeout(function(){
	  if ( !kAlreadyRunDomReadyFlag ) 
		  kDomReady();
  }, 0)
}
 

