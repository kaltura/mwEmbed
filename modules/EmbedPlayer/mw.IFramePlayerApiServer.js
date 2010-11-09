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
// Bind apiServer to newEmbedPlayers:
$j( mw ).bind( 'newEmbedPlayerEvent', function( event, embedPlayer ) {	
	embedPlayer['iFrameServer'] = new mw.IFramePlayerApiServer( embedPlayer )
});


mw.IFramePlayerApiServer = function( embedPlayer ){
	this.init( embedPlayer );
}

mw.IFramePlayerApiServer.prototype = {	
	// Exported methods populated by native video/audio tag api. 
	'exportedBindings': {},
		
	'init': function( embedPlayer ){
		this.embedPlayer = embedPlayer;
		// Static reference to nativeEmbed bind list ( dependency of IFramePlayerApiServer )
		this.exportedBindings = mw.EmbedPlayerNative.nativeEvents;
		this.addIframeListener();
		this.addIframeSender();
	},
	
	/**
	 * Listens to requested methods and triggers their action
	 */
	'addIframeListener': function(){
		var _this = this;		
		$j.receiveMessage( function( event ) {			
			_this.hanldeMsg( event );
		}, this.parentUrl );	
	},
	
	/**
	 * Add iframe sender bindings:
	 */
	'addIframeSender': function(){		
		var _this = this;		
		// Get the parent page URL as it was passed in, for browsers that don't support
		// window.postMessage (this URL could be hard-coded).
		this.parentUrl = decodeURIComponent( document.location.hash.replace( /^#/, '' ) );
		
		// On monitor event package the attributes for cross domain delivery:
		$j( this.embedPlayer ).bind( 'monitorEvent', function(){			
			_this.sendPlayerAttributes();
		})
		// Set the initial attributes once player is "ready"
		$j( this.embedPlayer ).bind( 'playerReady', function(){
			_this.sendPlayerAttributes();
		});

		$j.each( this.exportedBindings, function( inx, bindName ){
			$j( _this.embedPlayer ).bind( bindName, function( event ){
				var argSet = {};
				mw.log("IFramePlayerApiServer::PostBind:: " + bindName );
				// @@FIXME Per event 'useful data' extraction
				// update argSet from 'event'
				_this.postMessage({
					'triggerName' : bindName,
					'triggerArgs' : argSet
				})
			});
		});
	},
	
	/**
	 * Send all the player attributes to the host
	 */
	'sendPlayerAttributes': function(){
		var _this = this;
		
		var playerAttributes = mw.getConfig( 'EmbedPlayer.Attributes' );
		var attrSet = { };
		for( var i in playerAttributes ){
			if( i != 'id' ){
				if( typeof this.embedPlayer[ i ] != 'undefined' ){
					attrSet[i] = this.embedPlayer[ i ];
				}
			}
		}
		//mw.log( "IframePlayerApiServer:: sendPlayerAttributes: " + JSON.stringify( attrSet ) );
		_this.postMessage( {
			'attributes' : attrSet 
		} )
	},
	
	'postMessage': function( msgObj ){
		try {
			var messageString = JSON.stringify( msgObj );
		} catch ( e ){
			debugger;
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
	 * Handle a message event and pass it off to the embedPlayer
	 * 
	 * @param {string} event
	 */
	'hanldeMsg': function( event ){
		//mw.log( 'IFramePlayerApiServer:: hanldeMsg ');
		// Check if the server should even be enabled 
		if( !mw.getConfig( 'EmbedPlayer.EnableIFramePlayerServer' )){
			mw.log( 'Error: EmbedPlayer.EnableIFramePlayerServer is false');
			return false;
		}
		
		if( !this.eventDomainCheck( event.origin ) ){
			mw.log( 'Error: ' + event.origin + ' domain origin not allowed to send player events');
			return false;
		}		
		// Decode the message 
		var msgObject = JSON.parse( event.data );

		// Call a method:
		if( msgObject.method && this.embedPlayer[ msgObject.method ] ){
			this.embedPlayer[ msgObject.method ].apply( this.embedPlayer, $j.makeArray( msgObject.args ) );			
		}
		// Update a attribute
		if( typeof msgObject.attrName != 'undefined' && typeof msgObject.attrValue != 'undefined' ){
			try{
				$j( this.embedPlayer ).attr( msgObject.attrName, msgObject.attrValue)
			} catch(e){
				// possible error cant set attribute msgObject.attrName
			}
		}
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
