/**
* iFrame api mapping support 
* 
* Client side ( binds a given iFrames to expose the player api ) 
*/

( function( mw ) {
	
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
		this.iframe = iframe;
		this.playerProxy = playerProxy;
	
		// Set the iframe server
		var srcParts = mw.parseUri( mw.absoluteUrl( $j(this.iframe).attr('src') ) );
		this.iframeServer = srcParts.protocol + '://' + srcParts.authority;
		
		this.addPlayerSendApi();
		this.addPlayerReciveApi();
		
		this.addIframeFullscreenBinding();
		
	},
	'addPlayerSendApi': function(){
		var _this = this;		
		
		// Allow modules to extend the list of iframeExported bindings
		$j( mw ).trigger( 'AddIframePlayerMethods', [ this.exportedMethods ]);
		
		$j.each( this.exportedMethods, function(na, method){
			_this.playerProxy[ method ] = function(){	
				_this.postMessage( {
					'method' : method,
					'args' : $j.makeArray( arguments )
				} );
			};
		});
	},
	'addPlayerReciveApi': function(){
		var _this = this;		

		$j.receiveMessage( function( event ){
			_this.hanldeReciveMsg( event );
		}, this.iframeServer);
	},
	'addIframeFullscreenBinding': function(){
		var _this = this;
		parentsAbsoluteList = [];
		var fullscreenMode = false;
		var orgSize  = {
			'width' : $j( _this.iframe ).width(),
			'height' : $j( _this.iframe ).height(),
			'position' : null
		};
		
		// Add a local scope variable to register 
		// local scope fullscreen calls on orientation change
		// ( without this variable we would call fullscreen on all iframes on 
		// orientation change ) 
		var localIframeInFullscreen = false;
		
		// Bind orientation change to resize player ( if fullscreen )
		$j(window).bind( 'orientationchange', function(e){
			if( localIframeInFullscreen ){
				doFullscreen();
			}
		});
		
		var doFullscreen = function(){
			mw.log("iframeClient:: doFullscreen()");
			localIframeInFullscreen = true;
			// Make the iframe fullscreen
			$j( _this.iframe )
				.css({
					'z-index': mw.getConfig( 'EmbedPlayer.fullScreenZIndex' ) + 1,
					'position': 'absolute',
					'top' : 0,
					'left' : 0,
					'width' : $j(window).width(),
					'height' : $j(window).height()
				})
				.data(
					'isFullscreen', true
				);
			
			// Remove absolute css of the interface parents
			$j( _this.iframe ).parents().each( function() {
				//mw.log(' parent : ' + $j( this ).attr('id' ) + ' class: ' + $j( this ).attr('class') + ' pos: ' + $j( this ).css( 'position' ) );
				if( $j( this ).css( 'position' ) == 'absolute' ) {
					parentsAbsoluteList.push( $j( this ) );
					$j( this ).css( 'position', null );
				}
			} );
		}
		var restoreWindowMode = function(){
			localIframeInFullscreen = false;
			$j( _this.iframe )
				.css( orgSize )
				.data(
					'isFullscreen', false
				)
			// restore any parent absolute pos: 
			$j(parentsAbsoluteList).each( function() {	
				$j( this ).css( 'position', 'absolute' );
			} );
		};
		
		$j( this.playerProxy ).bind( 'onOpenFullScreen', doFullscreen);
		$j( this.playerProxy ).bind( 'onCloseFullScreen', restoreWindowMode);
		
	},
	/**
	 * Handle received events
	 */
	'hanldeReciveMsg': function( event ){
		var _this = this;
		//mw.log('IFramePlayerApiClient::hanldeReciveMsg:' + event.data );
		
		// Decode the message 
		var msgObject = JSON.parse( event.data );
		var playerAttributes = mw.getConfig( 'EmbedPlayer.Attributes' );
		
		// check if the message object is for "this" player
		if( msgObject.playerId !=  _this.playerProxy.id ){
			// mw.log(' hanldeReciveMsg (skiped ) ' + msgObject.playerId + ' != ' + _this.playerProxy.id );
			return ;
		}
		
		// Before we update local attributes check that the object has not been updated by user js
		for( var attrName in playerAttributes ){
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
		}
		
		// Update any attributes
		if( msgObject.attributes ){
			for( var i in msgObject.attributes ){
				if( i != 'id' && i != 'class' && i != 'style' ){
					try{
						this.playerProxy[ i ] = msgObject.attributes[i];
						this._prevPlayerProxy[i] = msgObject.attributes[i];
					} catch( e ){
						mw.log("Error could not set:" + i );
					}
				}
			}
		}
		//mw.log("handle event method name: " + msgObject.triggerName );
		
		// Trigger any binding events 
		if( typeof msgObject.triggerName != 'undefined' && msgObject.triggerArgs != 'undefined') {
			// mw.log('IFramePlayerApiClient::hanldeReciveMsgt: trigger: ' + msgObject.triggerName );
			$j( _this.playerProxy ).trigger( msgObject.triggerName, msgObject.triggerArgs );
		}
	},
	'postMessage': function( msgObject ){
		/*mw.log( "IFramePlayerApiClient:: postMessage(): " + JSON.stringify( msgObject ) + 
				' iframe: ' +  this.iframe + ' cw:' + this.iframe.contentWindow + 
				' src: ' + mw.absoluteUrl( $j( this.iframe ).attr('src')  ) );*/
		$j.postMessage(
			JSON.stringify( msgObject ), 
			mw.absoluteUrl( $j( this.iframe ).attr('src') ), 
			this.iframe.contentWindow 
		);
	}
};

//Add the jQuery binding
jQuery.fn.iFramePlayer = function( readyCallback ){
	if( ! this.selector ){
		this.selector = $j( this );
	}
	// Handle each embed frame 
	$j( this.selector ).each( function( inx, targetPlayer ){
		mw.log( "$.iFramePlayer::" + targetPlayer.id );
		// Append '_ifp' ( iframe player ) to id of real iframe so that 'id', and 'src' attributes don't conflict
		var playerProxyId = ( $j( targetPlayer ).attr( 'id' ) )? $j( targetPlayer ).attr( 'id' ) : Math.floor( 9999999 * Math.random() );
		var iframePlayerId = playerProxyId + '_ifp' ; 

		// Update the id and wrap with the proxy 
		$j( targetPlayer)
			.attr('id', iframePlayerId)
			.wrap(
				$j('<div />')
				.attr( 'id', playerProxyId )
			);
		
		var playerProxy = $j( '#' + playerProxyId ).get(0);
		
		// Allow modules to extend the 'iframe' based player
		$j( mw ).trigger( 'newIframePlayerClientSide', [ playerProxy ] );
		
		// Once the proxy ready event is received from the server complete the handshake
		// and send the proxyAcknowledgment back to the iframe server
		$j( playerProxy ).bind('proxyReady', function(){
			playerProxy.proxyAcknowledgment();
		});
		// Bind the iFrame player ready callback
		if( readyCallback ){
			$j( playerProxy ).bind( 'playerReady', readyCallback );		
		};
		
		// Setup the iframe:
		var iframe = $j('#' + iframePlayerId).get(0);
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

} )( window.mw );
