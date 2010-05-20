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
		if( value ) {
			var setVal = {};
			setVal[ set	] = value;
		} else {
			setVal = set;
		}
		kMwSetConfigQueue.push( setVal );
	}
}
// Add the mwEmbed script
var kAddScript = function(){
	var src = SCRIPT_LOADER_URL;
	
	// Add the class param
	src+= '?class=';
	
	// Add jQuery if not on the page already: 
	if( typeof window['jQuery'] == 'undefined') {
		src+='window.jQuery,';		
	}
	
	src+='mwEmbed';
	src+='&urid=' + kURID;
	src+='&uselang=en';
	
	src+='&debug=true';	
	
	// Unfortunately IE8 javascript system is evil
	// And it gives "Object doesn't support this property or method" 
	// on random $j calls with head.append( script ) insert so use document.write ::
	
	document.write(unescape("%3Cscript src='" + src + "' type='text/javascript'%3E%3C/script%3E"));
	kRunQueued();
		
}();

var kHaveRunQueued = false;
function kRunQueued(){
	if( kHaveRunQueued ){
		return ;
	}
	kHaveRunQueued =  true;
	while( kMwSetConfigQueue.length ){
		mw.setConfig( kMwSetConfigQueue.pop() );
	}
	while( kMwReadyQueue.length ){
		mw.ready( kMwReadyQueue.pop() );
	}
}
