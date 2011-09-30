/**
* iFrame api mapping support 
* 
* Client side ( binds a given iFrames to expose the player api ) 
*/

( function( mw, $ ) {
	
mw.IFramePlayerApiClient = function( iframe, playerProxy ){
	return this.init( iframe , playerProxy );
};
mw.IFramePlayerApiClient.prototype = {
	'exportedMethods': [
		'play',
		'pause',
		'stop',
		'resizePlayer',
		'proxyAcknowledgment'
	],
	// Local store of the previous sate of player proxy
	'_prevPlayerProxy': {},
	
	// Stores the current playerProxy ( can be updated by user js )
	'init': function( iframe , playerProxy, options ){
		mw.log( "mw.IFramePlayerApiClient:: init: " + playerProxy.id );
		this.iframe = iframe;
		this.playerProxy = playerProxy;
		
		var srcParts = mw.parseUri( this.getIframeSrc() );
		this.iframeServer = srcParts.protocol + '://' + srcParts.authority;
		
		this.addPlayerSendApi();
		this.addPlayerReciveApi();
		
		this.addIframeFullscreenBinding();
	},
	/**
	 * Gets an iframe src ( uses the local domain src if the iframe has no source and is in 
	 * same domain iframe mode )
	 */
	'getIframeSrc' : function(){
		if( $( this.iframe ).attr('src') ){
			 return $( this.iframe ).attr('src')
		} else {
			return document.URL;
		}
	},
	'addPlayerSendApi': function(){
		var _this = this;		
		
		// Allow modules to extend the list of iframeExported bindings
		$( mw ).trigger( 'AddIframePlayerMethods', [ this.exportedMethods ]);
		
		$.each( this.exportedMethods, function(na, method){
			_this.playerProxy[ method ] = function(){	
				_this.postMessage( {
					'method' : method,
					'args' : $.makeArray( arguments )
				} );
			};
		});
	},
	'addPlayerReciveApi': function(){
		var _this = this;		
		$.receiveMessage( function( event ){
			_this.handleReceiveMessage( event );
		}, this.iframeServer);
	},
	'addIframeFullscreenBinding': function(){
		var _this = this;
		parentsAbsoluteList = [];
		var fullscreenMode = false;
		var orgSize = {
			'width' : $( _this.iframe ).width(),
			'height' : $( _this.iframe ).height(),
			'position' : $( _this.iframe ).css( 'position' )
		};
		
		// Add a local scope variable to register 
		// local scope fullscreen calls on orientation change
		// ( without this variable we would call fullscreen on all iframes on 
		// orientation change ) 
		var localIframeInFullscreen = false;
		
		// Bind orientation change to resize player ( if fullscreen )
		$(window).bind( 'orientationchange', function(e){
			if( localIframeInFullscreen ){
				doFullscreen();
			}
		});
		
		var doFullscreen = function(){
			mw.log("iframeClient:: doFullscreen()");
			localIframeInFullscreen = true;
			// Make the iframe fullscreen
			$( _this.iframe )
				.css({
					'z-index': mw.getConfig( 'EmbedPlayer.FullScreenZIndex' ) + 1,
					'position': 'absolute',
					'top' : 0,
					'left' : 0,
					'width' : $(window).width(),
					'height' : $(window).height()
				})
				.data(
					'isFullscreen', true
				);
			
			// Remove absolute css of the interface parents
			$( _this.iframe ).parents().each( function() {
				if( $( this ).css( 'position' ) == 'absolute' ) {
					parentsAbsoluteList.push( $( this ) );
					$( this ).css( 'position', null );
				}
			});
		};
		
		var restoreWindowMode = function(){
			localIframeInFullscreen = false;
			$( _this.iframe )
				.css( orgSize )
				.data(
					'isFullscreen', false
				);
			// restore any parent absolute pos: 
			$( parentsAbsoluteList ).each( function() {	
				$( this ).css( 'position', 'absolute' );
			} );
		};
		
		$( this.playerProxy ).bind( 'onOpenFullScreen', doFullscreen);
		$( this.playerProxy ).bind( 'onCloseFullScreen', restoreWindowMode);
	},
	/**
	 * Handle received events
	 */
	'handleReceiveMessage': function( event ){
		var _this = this;
		//mw.log('IFramePlayerApiClient::handleReceiveMessage:' + event.data );
		// Decode the message 
		var msgObject = JSON.parse( event.data );
		var playerAttributes = mw.getConfig( 'EmbedPlayer.Attributes' );
		
		// check if the message object is for "this" player
		if( msgObject.playerId !=  _this.playerProxy.id ){
			// mw.log(' handleReceiveMessage (skiped ) ' + msgObject.playerId + ' != ' + _this.playerProxy.id );
			return ;
		}
		
		// Before we update local attributes check that the object has not been updated by user js
		$.each(playerAttributes, function( inx, attrName ) {
 			if( attrName != 'id' ){
				if( _this._prevPlayerProxy[ attrName ] != _this.playerProxy[ attrName ] ){
					//mw.log( "IFramePlayerApiClient:: User js update:" + attrName + ' set to: ' + this.playerProxy[ attrName ] + ' != old: ' + _this._prevPlayerProxy[ attrName ] );
					// Send the updated attribute back to the iframe: 
					_this.postMessage({
						'attrName' : attrName,
						'attrValue' : _this.playerProxy[ attrName ]
	 				});
				}
			}
		});
		// Update any attributes
		if( msgObject.attributes ){
			$.each( msgObject.attributes, function( i, notUsed ){
				if( i != 'id' && i != 'class' && i != 'style' ){
					try {
						_this.playerProxy[ i ] = msgObject.attributes[i];
						_this._prevPlayerProxy[i] = msgObject.attributes[i];
					} catch( e ) {
						mw.log("Error could not set:" + i );
					}
				}
			});
		}
		//mw.log("handle event method name: " + msgObject.triggerName );
		
		// Trigger any binding events 
		if( typeof msgObject.triggerName != 'undefined' && msgObject.triggerArgs != 'undefined') {
			//mw.log('IFramePlayerApiClient::handleReceiveMessage: trigger: ' + msgObject.triggerName );
			$( _this.playerProxy ).trigger( msgObject.triggerName, msgObject.triggerArgs );
		}
	},
	'postMessage': function( msgObject ){
		/*mw.log( "IFramePlayerApiClient:: postMessage(): " + JSON.stringify( msgObject ) + 
				' iframe: ' +  this.iframe + ' cw:' + this.iframe.contentWindow + 
				' src: ' + mw.absoluteUrl( $( this.iframe ).attr('src')  ) );*/
		$.postMessage(
			this.stringify( msgObject ), 
			mw.absoluteUrl(  this.getIframeSrc() ), 
			this.iframe.contentWindow 
		);
	},
	// local stringify function to prevent prototype override 
	'stringify' : function stringify( obj ) {
		var t = typeof (obj);
		var _this = this;
		if (t != "object" || obj === null) {
		    // simple data type
		    if (t == "string") obj = '"' + obj + '"';
		    return String(obj);
		} else {
		    // recurse array or object
		    var n, v, json = [], arr = (obj && obj.constructor == Array);
		
		    $.each(obj, function(n, na) {
		        v = obj[n];
		        t = typeof(v);
		        if (obj.hasOwnProperty(n)) {
		            if (t == "string") v = '"' + v + '"'; else if (t == "object" && v !== null) v = _this.stringify(v);
		            json.push((arr ? "" : '"' + n + '":') + String(v));
		        }
		    });
		    return (arr ? "[" : "{") + String(json) + (arr ? "]" : "}");
		}
	}
};

//Add the jQuery binding
jQuery.fn.iFramePlayer = function( readyCallback ){
	if( ! this.selector ){
		this.selector = $( this );
	}
	// Handle each embed frame 
	$( this.selector ).each( function( inx, playerProxy ){
		mw.log( "$.iFramePlayer::" + playerProxy.id );
		
		// Setup pointer to real iframe
		var iframePlayerId = $( playerProxy ).attr('id') + '_ifp';
		
		// Allow modules to extend the 'iframe' based player
		$( mw ).trigger( 'newIframePlayerClientSide', [ playerProxy ] );
		
		// Once the proxy ready event is received from the server complete the handshake
		// and send the proxyAcknowledgment back to the iframe server
		$( playerProxy ).bind('proxyReady', function(){
			playerProxy.proxyAcknowledgment();
		});
		
		// Bind the iFrame player ready callback
		if( readyCallback ){
			$( playerProxy ).bind( 'playerReady', readyCallback );		
		};
		
		// Setup the iframe:
		var iframe = $('#' + iframePlayerId).get(0);
		if( !iframe ){
			mw.log("$.iFramePlayer:: Error invalid iFramePlayer request");
			return false;
		}
		if( !iframe['playerApi'] ){
			iframe['playerApi'] = new mw.IFramePlayerApiClient( iframe, playerProxy );
		}
	});
	// Return this ( jQuery style )
	return this;
};

} )( window.mw, window.jQuery );
