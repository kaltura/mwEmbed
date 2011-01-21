/**
* iFrame kdp mapping support 
*/

( function( mw ) {
	
// Also include a document ready event to check for kdp player readyness 
//( in case jsCallbackReady was fired before this scirpt is executed )
jQuery(document).ready(function(){	
	var timeoutCount = 0;
	var waitForKalturaPlayer = function(){
		if( !$j('#kaltura_player').length || !$j('#kaltura_player').get(0).addJsListener ){
			timeoutCount++;
			if( timeoutCount == 1000 ){ // 10 seconds timeout 
				mw.log("Error kaltura player never ready");
			}
			setTimeout( waitForKalturaPlayer,10);
		} else{
			serverIframe = new kdpServerIframe();
		}
	}
	waitForKalturaPlayer();
})
var addedKdpServerIframe =false;
kdpServerIframe = function(){
	// Check if we have already created the kdpServerIframe: 
	if( addedKdpServerIframe ) {
		return true; 
	}
	if( !mw.getConfig( 'EmbedPlayer.IframeParentUrl' ) ){
		mw.log("kdpServerIframe:: Error missing EmbedPlayer.IframeParentUrl");
		return ;
	}
	return this.init( $j('#kaltura_player').get(0) );
}

kdpServerIframe.prototype = {	
		
	'init': function( kdpPlayer ){
		var _this = this;
		this.kdpPlayer = kdpPlayer;
		this.parentUrl = mw.getConfig( 'EmbedPlayer.IframeParentUrl' );
		// Add receive msg handler: 
		$j.receiveMessage( function( event ) {			
			_this.hanldeMsg( event );
		}, this.parentUrl );
		
		// Set up the default attributes: 
		this.sendPlayerAttributes();
		
		// Fire the "ready"
		_this.postMessage({
			'callbackName' : 'jsCallbackReady'
		});
	},
	
	/**
	 * Handle a message 
	 * 
	 * @param {string} event
	 */
	'hanldeMsg': function( event ){		
		var _this = this;
		if( !this.eventDomainCheck( event.origin ) ){
			mw.log( 'Error: ' + event.origin + ' domain origin not allowed to send player events');
			return false;
		}		
		// Decode the message 
		var msgObject = JSON.parse( event.data );
		
		// Call a method:
		mw.log("kdpIframeServer hanldeMsg::" + msgObject.method );
		if( msgObject.method && this.kdpPlayer[ msgObject.method ] ){
			// Check for special case of adding listener
			if( msgObject.method == 'addJsListener' ){
				var listenName = msgObject.args[0];
				var localCallbackName = listenName + '_kdpcb';
				var callbackName = msgObject.args[1]
				// Create a global callback in this function scope: 
				window[ localCallbackName ] = function(){
					_this.postMessage( {
						'callbackName': callbackName,
						'callbackArgs': $j.makeArray( arguments )
					});
				};
				this.kdpPlayer.addJsListener( listenName, localCallbackName);
				return ;
			}			
			this.kdpPlayer[ msgObject.method ].apply( this.kdpPlayer, $j.makeArray( msgObject.args ) );			
		} else{
			mw.log("Error: kdpIframeServer recived invalid method: " + msgObject.method  );
		}
	},
	
	/**
	 * Send all the player attributes to the host
	 */
	'sendPlayerAttributes': function(){
		var _this = this;
		
		// top level "evaluate" components: 
		var attrSet = ['video','mediaProxy','configProxy','playerStatusProxy'];
		var evaluateData =  {};
		$j.each( attrSet, function(inx, attrName){
			evaluateData[ attrName ] = _this.kdpPlayer.evaluate('{' + attrName + '}');
		});
		//mw.log( "IframePlayerApiServer:: sendPlayerAttributes: " + JSON.stringify( attrSet ) );
		_this.postMessage( {
			'evaluateData' : evaluateData 
		} );
	},
	
	'postMessage': function( msgObj ){		
		try {
			var messageString = JSON.stringify( msgObj );
		} catch ( e ){
			mw.log("Error: could not JSON object: " + msgObj + ' ' + e);
			return ;
		}
		// By default postMessage sends the message to the parent frame:		
		$j.postMessage( 
			messageString,
			this.parentUrl,
			window.parent
		);
	},
	
	
	/**
	 * Check an origin domain against the configuration value: 'EmbedPLayer.IFramePlayer.DomainWhiteList'
	 *  Returns true if the origin domain is allowed to communicate with the embedPlayer
	 *  otherwise returns false. 
	 * 
	 * @parma {string} origin
	 * 		The origin domain to be checked
	 */
	'eventDomainCheck': function( origin ){
		if( mw.getConfig( 'EmbedPLayer.IFramePlayer.DomainWhiteList' ) ){
			// NOTE this is very similar to the apiProxy function: 
			var domainWhiteList =  mw.getConfig('EmbedPLayer.IFramePlayer.DomainWhiteList');
			if( domainWhiteList == '*' ){
				// The default very permissive state
				return true;
			}
			// @@FIXME we should also check protocol to avoid
			// http vs https
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
};

} )( window.mw );
