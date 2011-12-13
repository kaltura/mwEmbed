/**
* iFrame kdp mapping support 
*/

( function( mw ) {
	
window.jsCallbackReady = function(){	
	serverIframe = new kdpServerIframe();
};
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
	// get player ( can be called norewrite or kaltura_playlist )
	return this.init( $j('object[name="kaltura_player_iframe_no_rewrite"]').get(0) );
};

kdpServerIframe.prototype = {
	// flag to work around strange kdp error: 
	sentConfigProxyFlag : false,
	
	// Stores the local instance names of callback functions mapped to the listen name
	listenerCallbackLookup: [],
	'init': function( kdpPlayer ){
		var _this = this;
		_this.kdpPlayer = kdpPlayer;
		this.parentUrl = mw.getConfig( 'EmbedPlayer.IframeParentUrl' );
		
		// Add receive msg handler: 
		$j.receiveMessage( function( event ) {		
			// re assign kdpPlayer inside reciveMessage scope: 
			_this.kdpPlayer = kdpPlayer;
			_this.hanldeMsg( event );
		}, this.parentUrl );
		
		// Set up the default attributes: 
		this.sendPlayerAttributes();

		this.monitorAttributeChanges();
		
		// Fire the "ready"
		_this.postMessage( {
			'callbackName' : 'jsCallbackReady'
		} );
	},
	monitorAttributeChanges: function(){
		var _this = this;	
		// Sends attributes across the iframe at a set interval ( for now 250ms / monitor rate )
		setTimeout( function(){	
			_this.sendPlayerAttributes();
			_this.monitorAttributeChanges();
		}, 250 );
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
		var lname = ( msgObject.method == 'addJsListener' )? ': ' + msgObject.args[0]:'' ;
		mw.log("kdpIframeServer hanldeMsg::" + msgObject.method + lname + ' kdp:' + this.kdpPlayer );
		
		if( msgObject.method && this.kdpPlayer[ msgObject.method ] ){
			
			// Check for special case of adding listener
			if( msgObject.method == 'addJsListener' ){	
				var listenName = msgObject.args[0];
				var localCallbackName = listenName + '_' + Math.round( Math.random()*100000000 );
				var callbackName = msgObject.args[1];
				                                                            
				// Create a global callback in this function scope: 
				window[ localCallbackName ] = function(){
					_this.postMessage( {
						'callbackName': callbackName,
						'callbackArgs': $j.makeArray( arguments )
					});
				};
				this.listenerCallbackLookup[ callbackName ] = localCallbackName;
				
				this.kdpPlayer.addJsListener( listenName, localCallbackName);
				return ;
			}
			
			// Special case for removeJsListener
			if( msgObject.method == 'removeJsListener'){
				var listenName = msgObject.args[0];
				var callbackName = msgObject.args[1];
				this.kdpPlayer.removeJsListener(msgObject.args[0], this.listenerCallbackLookup[ callbackName ]  );
				return ;
			}					

			// Tragically we can't use .apply because its calling a native object exposed method
			if( msgObject.method == 'setKDPAttribute' ){
				if( msgObject.args.length == 3 ){
					this.kdpPlayer.setKDPAttribute( msgObject.args[0], msgObject.args[1], msgObject.args[2] );
				} else if (  msgObject.args.length == 2 ){
					this.kdpPlayer.setKDPAttribute( msgObject.args[0], msgObject.args[1]);
				}
				return ;
			}
			// Any other methods send directly to kdpPlayer: 
			this.kdpPlayer[ msgObject.method ].apply( this, $j.makeArray( msgObject.args ) );
			
		} else{
			mw.log("Error: kdpIframeServer recived invalid method: " + msgObject.method  );
		}
	},
	
	/**
	 * Send all the player attributes to the host
	 */
	'sendPlayerAttributes': function(){
		var _this = this;
		_this.kdpPlayer = $j('#kaltura_player').get(0);
		// top level "evaluate" components: 
		var attrSet = ['video', 'duration', ['mediaProxy', 'entry'], 'configProxy', 'playerStatusProxy'];
		var evaluateData =  {};
		for(var i in attrSet){
			var attrName = attrSet[i];
			try{
				if( typeof attrName == 'object' ){
					if( !evaluateData[ attrName[0] ] ){
						evaluateData[ attrName[0] ] = {};
					}
					evaluateData[ attrName[0] ] [ attrName[1] ] =  _this.kdpPlayer.evaluate('{' + attrName[0] + '.' + attrName[1] + '}');
				} else {
					// XXX Very strange error being sent from flash kdp "undefined missing { on evaluate configProxy the second time!
					if( attrName != 'configProxy' || !this.sentConfigProxyFlag ){
						evaluateData[ attrName ] = _this.kdpPlayer.evaluate( "{" + attrName + "}" );
						if( attrName == 'configProxy' ){
							this.sentConfigProxyFlag = true;						
						}
					}
				}
			} catch(e){
				//mw.log( 'KdpServerIframe:: caught exception: ' + e + ', could not send all player attributes');		
			}
		};
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
