/**
* iFrame api mapping support 
* 
* Client side ( binds a given iFrames to expose the player api ) 
*/
mw.IFramePlayerApiClient = function( iframe, playerProxy,  options ){
	return this.init( iframe , playerProxy, options);
}
mw.IFramePlayerApiClient.prototype = {
	'exportedMethods': [
	   'play',
	   'pause'
	],
	// Exported methods populated by native video/audio tag api. 
	'exportedBindings': {},
	
	// Local store of the post message ( not updated by user js )
	'_prevPlayerProxy' : {},
	
	// Stores the current playerProxy ( can be updated by user js ) 
	
	'init': function( iframe , playerProxy, options ){				
		this.iframe = iframe;
		this.playerProxy = playerProxy;
		if( !options )
			options = {};
		
		// If targetOrigin is unset, set to local domain: 
		if( !options.targetOrigin ){	
			var urlLocal = mw.parseUri( document.URL );
			this.targetOrigin = urlLocal.protocol + '://' + urlLocal.authority;
		} else {
			this.targetOrigin = options.targetOrigin;
		}	
		// Set the iframe server  		
		var srcParts = mw.parseUri( mw.absoluteUrl( $j(this.iframe).attr('src') ) );
		this.iframeServer = srcParts.protocol + '://' + srcParts.authority;
		
		// Static reference to nativeEmbed bind list ( dependency of iFramePlayerApi )
		this.exportedBindings = mw.EmbedPlayerNative.nativeEvents;		
		this.addPlayerSendApi();
		this.addPlayerReciveApi();
	},
	
	'addPlayerSendApi': function(){		
		var _this = this;
		$j.each( this.exportedMethods, function(na, method){
			_this.playerProxy[ method ] = function(){
				_this.postMessage( {
					'method' : method,
					'args' : arguments
				} );
			};
		});		
	},
	
	'addPlayerReciveApi' : function(){
		var _this = this;
		$j.receiveMessage( function( event ){
			_this.hanldeReciveMsg( event )
		});		
	},
	
	// Handle received events
	'hanldeReciveMsg' : function( event ){
		var _this = this;
		mw.log("IframePlayerApiClient:: hanldeReciveMsg ");
		// Confirm the event is coming for the target host:
		if( event.origin != this.iframeServer){
			mw.log("Skip msg from host does not match iFrame player: " + event.origin + 
					' != iframe Server: ' + this.iframeServer )
			return ;
		};	
		
		// Decode the message 
		var msgObject = JSON.parse( event.data );
				
		var playerAttributes = mw.getConfig( 'EmbedPlayer.Attributes' );
		
		// Before we update local attributes check that the object has not been updated by user js
		for( var attrName in playerAttributes ){
			if( attrName  != 'id' ){
				if( _this._prevPlayerProxy[ attrName ] !=  _this.playerProxy[ attrName ] ){
					mw.log( "IFramePlayerApiClient:: User js update:" + attrName + ' set to: ' + this.playerProxy[ attrName ] + ' != old: ' + _this._prevPlayerProxy[ attrName ]   );
					// Send the updated attribute back to the iframe: 
					_this.postMessage({
						'attrName' : attrName,
						'attrValue' : _this.playerProxy[ attrName ]
	 				});
				}
			}
		}
		
		// Update any attributes
		if( msgObject.attributes ){
			for( var i in msgObject.attributes ){
				if( i != 'id' ){
					this.playerProxy[ i ] = msgObject.attributes[i];
					this._prevPlayerProxy[i] = msgObject.attributes[i];
				}
			}
		}
		// Trigger any binding events 
		if( msgObject.triggers ){
			for( var i=0; i < msgObject.triggers.length; i++ ){
				$j( playerProxy ).trigger( msgObject.triggers[i].bindName, msgObject.triggers[i].bindArgs );  
			}		
		}		
		// @@TODO:: Allow extending modules to wrap these api events ( kaltura kdp javascript emulation ? ) 		
	},
	
	'postMessage' : function( payLoad ){
		mw.log("IFramePlayerApiClient:: postMessage(): " + payLoad );			
		$j.postMessage( JSON.stringify( payLoad ),  this.targetOrigin, this.iframe.contentWindow );
		//this.iframe.contentWindow.postMessage( JSON.stringify( methodPayload ), this.targetOrigin );
	}
};

//Add the jQuery binding
( function( $ ) {	
	$.fn.iFramePlayer = function( options ){	
		// Append '_ifp' ( iframe player ) to id of real iframe so that 'id', and 'src' attributes don't conflict
		var originalIframeId = $(this.selector).attr('id');
		var iframePlayerId = ( originalIframeId ) ? 
				originalIframeId + '_ifp' : $.data(this.selector) + '_ifp'; // here we use .data to generate a unique id
						
		// Append the div element proxy after the iframe 
		$( this.selector )
			.attr('id', iframePlayerId)
			.after(
				$('<div />')
				.attr( 'id', originalIframeId )
			);
		var playerProxy = $( '#' + originalIframeId ).get(0);
		var iframe = $('#' + iframePlayerId).get(0);
		if(!iframe){
			mw.log("Error invalide iframe request");
			return false;
		}
		if( !iframe['playerApi'] ){
			iframe['playerApi'] = new mw.IFramePlayerApiClient( iframe, playerProxy, options );		
		}
		// Return the player proxy for chaining player events / attributes
		return $j( playerProxy );
	};
} )( jQuery );