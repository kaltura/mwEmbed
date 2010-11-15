/**
* iFrame api mapping support
*
* enables player api to be accesses cross domain as
* if the video element was in page dom
*
*  native support in:
*    * Internet Explorer 8.0+
*    * Firefox 3.0+
*    * Safari 4.0+
*    * Google Chrome 1.0+
*    * Opera 9.5+
*
*  fallback iframe cross domain hack will target IE6/7
*/
// Bind ourself to newEmbedPlayers:
$j( mw ).bind( 'newEmbedPlayerEvent', function( event, embedPlayer ) {
	embedPlayer['iFrameServer'] = new mw.IFramePlayerApiServer( embedPlayer )
});


mw.IFramePlayerApiServer = function( embedPlayer ){
	this.init( embedPlayer );
}

mw.IFramePlayerApiServer.prototype = {

	init: function( embedPlayer ){
		this.embedPlayer = embedPlayer;
		this.addIframeListener();
	},

	addIframeListener: function(){
		var _this = this;
		if (window.addEventListener) {
			// For standards-compliant web browsers
			window.addEventListener("message", function(event){
				_this.hanldeMsg( event )
			}, false);
		} else {
			window.attachEvent("onmessage", function(event){
				_this.hanldeMsg( event )
			});
		}
	},
	hanldeMsg: function( event ){
		// Check if the server should even be enabled
		if( !mw.getConfig( 'EmbedPlayer.EnalbeIFramePlayerServer' )){
			return false;
		}

		if( !this.eventDomainCheck( event.origin ) ){
			mw.log( 'Error: ' + event.origin + ' domain origin not allowed to send player events');
			return false;
		}

		// Decode the message
		msgObject = JSON.parse( event.data );
		if( msgObject.method ){
			// Deal with variadic argument set:
			var argString = '';
			for( var i=0;i < msgObject.args; i++){
				argString += ', msgObject.args[i]';
			}
			eval( 'this.embedPlayer.' + msgObject.method + '(' + argString + ')' );
		}
	},
	eventDomainCheck: function( origin ){
		if( mw.getConfig( 'EmbedPLayer.IFramePlayer.DomainWhiteList' ) ){
			// NOTE this is very similar to the apiProxy function:
			var domainWhiteList = mw.getConfig('EmbedPLayer.IFramePlayer.DomainWhiteList');
			if( domainWhiteList == '*' ){
				// The default very permissive state
				return true;
			}
			// @@FIXME we should also check protocol to avoid
			// http to https escalation
			var originDomain = mw.parseUri( origin ).host;

			// Check the domains:
			for ( var i =0; i < domainWhiteList.length; i++ ) {
				whiteDomain = domainWhiteList[i];
				// Check if domain check is a RegEx:
				if( typeof whiteDomain == 'object' ){
					if( originDomain.match( whiteDomain ) ) {
						return true;
					}
				} else {
					if( originDomain == whiteDomain ){
						return true;
					}
				}
			}
		}
		// If no passing domain was found return false
		return false;
	}

}
