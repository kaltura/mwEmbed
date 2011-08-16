/**
* Adds Power Point Widget Support
*/
( function( mw, $ ) {
	
mw.KPPTWidget = function( widgetTarget, uiConf ){
	this.init(widgetTarget, uiConf);
};
mw.KPPTWidget.prototype = {
	init: function(widgetTarget, uiConf){
		$( widgetTarget ).html( 'widget goes here ');
	}
};

} )( window.mw, jQuery );