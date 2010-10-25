/**
* iFrame api mapping support 
* 
* Client side ( binds a given iFrames to expose the player api ) 
*/

// Add the jQuery binding
( function( $ ) {	
	$.fn.iFramePlayer = function( options ){
		
		var iframe = $(this.selector).get(0);				
		var cat = new mw.IFramePlayerApiClient( iframe, options );		
	};
	
} )( jQuery );

mw.IFramePlayerApiClient = function( iframe, options ){
	return this.init( iframe , options);
}
mw.IFramePlayerApiClient.prototype = {
	exportedMethods: [
	   'play',
	   'pause'
	],
	exportedBindings: [
	   'ended'
	],
	init: function( iframe , options ){
		this.iframe = iframe;		
		if( !options.targetOrigin ){
			mw.log("Error: IFramePlayerApiClient please supply a target origin");
			return ;
		} else {
			this.targetOrigin = options.targetOrigin;
		}		
		this.addPlayerApi();
	},
	addPlayerApi: function(){
		var _this = this;
		$j.each( this.exportedMethods, function(na, method){
			_this.iframe[ method ] = function(){
				_this.postMethod( method, arguments );
			};
		});			
	},
	postMethod: function( method , args){
		mw.log("IFramePlayer:: Post method: '" + method + "' with " + args.length + " arguments");
		var methodMsg = {
			'method' : method
		};						
		this.iframe.contentWindow.postMessage( JSON.stringify( methodMsg ), this.targetOrigin );
	}
};
