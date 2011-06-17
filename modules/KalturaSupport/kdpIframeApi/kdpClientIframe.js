// Simple kdpClientIframe
var kdpClientIframe = function( replaceTargetId, kEmbedSettings , options ){
	// Create a Player Manager
	return this.init(replaceTargetId, kEmbedSettings , options);
};
kdpClientIframe.prototype = {
	// Stores all the registered callbacks 
	//( to avoid letting the iframe call arbitrary global js functions)
	globalCallbackRegister:{
		'jsCallbackReady': true
	},
	// Similar to jQuery.fn.kalturaIframePlayer in KalturaSupport/loader.js
	'init': function( replaceTargetId, kEmbedSettings , options ){
		var _this = this;
		
		// Update options via target size if not set
		this.width = ( options.width ) ? options.width : $j( '#' + replaceTargetId ).width();
		this.height = ( options.height ) ? options.height : $j( '#' + replaceTargetId ).height();
		this.kEmbedSettings = kEmbedSettings;
		this.targetId = replaceTargetId;
		
		// Replace the target with an iframe player:
		$j( '#' + replaceTargetId ).replaceWith( this.getIframe() );

		// Now add the player proxy
		$j( this.getIframe() ).after( 
			$j('<div />').attr( 'id', this.targetId )
		);
		this.iFrameProxy = $j('#' + this.targetId).get(0);

		// Set the iframe server
		var srcParts = mw.parseUri( mw.absoluteUrl( this.getIframeSrc() ) );
		this.iframeServer = srcParts.protocol + '://' + srcParts.authority;

		// Add exported kdp methods to iframe proxy: 
		this.addIframeKDPMethods();
		
		// Add hanldeReciveMsg binding: 
		$j.receiveMessage( function( event ){
			_this.hanldeReciveMsg( event )
		}, this.iframeServer);
				
	},
	'kdpExportedMethods': [ 'addJsListener', 'removeJsListener', 'sendNotification', 'setKDPAttribute' ],
	'addIframeKDPMethods': function(){
		var _this = this;
		// Setup local ref to iframe proxy: 
		var proxy = this.iFrameProxy
		$j.each( this.kdpExportedMethods, function( inx, method ){
			proxy[method] = function(){
				mw.log( "KdpClient proxy method : " + method);
				var args = $j.makeArray( arguments );
				// Special local register of globals in addJsListener callbacks 
				// ( to limit what javascript the iframe can call )
				if( method == 'addJsListener'){					
					if( args[1] ){
						_this.globalCallbackRegister[ args[1] ] = true;
					}
				}
				$j.postMessage(
					JSON.stringify( {
						'method' : method,
						'args' : args
					} ), 
					mw.absoluteUrl( $j( _this.iframe ).attr('src') ), 
					_this.iframe.contentWindow
				);
			}
		});
		// Evaluate needs local copy of all attributes that could be requested
		proxy.evaluate = function( objectString ){
			return _this.evaluate( objectString );
		}
	},
	'evaluate': function( objectString  ){		
		objectString = objectString.replace( /\{|\}/g, '' );
		var objectPath = objectString.split('.');
		var errorOut = function(){
			mw.log("Error: kdpClientFrame could not get property: " + objectString );
			return false;
		}
		// kaltura properties have up 3 levels deep		                       
		if( this.evaluateData[ objectPath[0] ] && ! objectPath[1] ){
			return this.evaluateData[ objectPath[0] ]
		}
		if( !this.evaluateData[ objectPath[0] ] ){
			return errorOut();
		}
		
		if( this.evaluateData[ objectPath[0] ][ objectPath[1] ] && !objectPath[2] ){
			return this.evaluateData[ objectPath[0] ][ objectPath[1] ];
		}
		if( !this.evaluateData[ objectPath[0] ][ objectPath[1] ]  )
			return errorOut();
		
		if( this.evaluateData[ objectPath[0] ][ objectPath[1] ][ objectPath[2] ] ){
			return this.evaluateData[ objectPath[0] ][ objectPath[1] ][ objectPath[2] ];
		}
		return errorOut();
	},
	/**
	 * Handle received events
	 */
	'hanldeReciveMsg': function( event ){
		var _this = this;		
		// Confirm the event is coming for the target host:
		if( event.origin != this.iframeServer){
			mw.log("kdpClientIframe:: Skip msg from host does not match iFrame player: " + event.origin + 
					' != iframe Server: ' + this.iframeServer )
			return ;
		};
		// Decode the message 
		var msgObject = JSON.parse( event.data );
		//mw.log("KdpApiClient:: hanldeReciveMsg: " + msgObject.callbackName );
				
		// Update evaluateData
		if( msgObject.evaluateData ){
			this.evaluateData =  msgObject.evaluateData;
		};
		
		// We hash global functions to avoid the iframe calling arbitrary code.
		if( msgObject.callbackName ) {
			var callbackArgs = ( msgObject.callbackArgs )? msgObject.callbackArgs : [];
			if( ! _this.globalCallbackRegister[ msgObject.callbackName ] ){
				mw.log("Error unregistered global callback from iframe");
				return ;
			}
			if( ! window[ msgObject.callbackName ] || typeof window[ msgObject.callbackName ] != 'function' ){
				mw.log("callback name does not exist: " + msgObject.callbackName);
				return ;
			}
			try{
				var args = msgObject.callbackArgs;
				// IE8 I HATE you! the following does not work! 
				// window[ msgObject.callbackName ].apply( this, msgObject.callbackArgs );				
				if( !args || args.length == 0 ){
					window[ msgObject.callbackName ]();
				} else if( args.length == 1 ){
					window[ msgObject.callbackName ]( args[0] );
				} else if( args.length == 2 ){
					window[ msgObject.callbackName ]( args[0], args[1] );
				} else if( args.length == 3 ){
					window[ msgObject.callbackName ]( args[0], args[1], args[2]  );
				} else if( args.length == 4 ){
					window[ msgObject.callbackName ]( args[0], args[1], args[2], args[3] );
				}							
			} catch( e ){
				mw.log('Error with hanldeReciveMsg::' +  msgObject.callbackName );
			}
		}
	},
	'getIframeSrc': function(){
		var iframeSrc = SCRIPT_LOADER_URL.replace( 'ResourceLoader.php', 'mwEmbedFrame.php' );
		var kalturaAttributeList = { 'uiconf_id':1, 'entry_id':1, 'wid':1, 'p':1};
		for(var attrKey in this.kEmbedSettings ){
			if( attrKey in kalturaAttributeList ){
				iframeSrc+= '/' + attrKey + '/' + encodeURIComponent( this.kEmbedSettings[attrKey] );  
			}
		}			
		// Add configuration to the hash tag:
		iframeSrc+= mw.getIframeHash( this.targetId );
		return iframeSrc;
	},
	'getIframe': function(){
		if( !this.iframe ){
			this.iframe = $j('<iframe />').attr({
				'src' : this.getIframeSrc(),
				'id' :  this.targetId + '_iframe',
				'width' : this.width,
				'height' : 	this.height
			})
			.css('border', '0px')
			.get(0)
		}
		return this.iframe;
	}
};
