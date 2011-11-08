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
		var verticalScrollPosition = 0;
		var viewPortTag;
		
		/* Un-used for now
		var disableZoom = function() {
			viewPortTag = $('head meta[name=viewport]').get(0);
			$('head meta[name=viewport]').remove();
			$('head').prepend('<meta name="viewport" content="width=device-width, initial-scale=1.0">');
		};

		var restoreZoom = function() {
			$('head meta[name=viewport]').remove();
			$('head').prepend( viewPortTag );
		};
		*/

		var scrollToTop = function() {
			window.scroll(0, 0);
		};

		var doFullscreen = function(){
			mw.log("iframeClient:: doFullscreen()");
			// Save vertical scroll position and scroll to top
			verticalScrollPosition = (document.all ? document.scrollTop : window.pageYOffset);
			scrollToTop();
			localIframeInFullscreen = true;
			// changed to fixed from absolute in order to "disable" scrolling
			var playerCssPosition = (mw.isIpad()) ? 'absolute' : 'fixed';
			// Make the iframe fullscreen
			$( _this.iframe )
				.css({
					'z-index': mw.getConfig( 'EmbedPlayer.FullScreenZIndex' ) + 1,
					'position': playerCssPosition,
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
			// Scroll back to the previews positon
			window.scroll(0, verticalScrollPosition);
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
		
		// Bind orientation change to resize player ( if fullscreen )
		$(window).bind( 'orientationchange', function(e){
			if( localIframeInFullscreen ){
				doFullscreen();
			}
		});

		// Bind to resize event to enlarge the player size ( if fullscreen )
		$(window).bind('resize', function() {
			if( localIframeInFullscreen ){
				doFullscreen();
			}
		});
		$( this.playerProxy ).bind( 'onOpenFullScreen', doFullscreen);
		$( this.playerProxy ).bind( 'onCloseFullScreen', restoreWindowMode);
		$( this.playerProxy ).bind( 'onTouchEnd', scrollToTop);
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
			$.each( playerAttributes, function( attrName , na) {
				if( typeof msgObject.attributes[ attrName ] == 'undefined' )
					return true;
				if( attrName != 'id' && attrName != 'class' && attrName != 'style' ){
					try {
						_this.playerProxy[ attrName ] = msgObject.attributes[attrName];
						_this._prevPlayerProxy[attrName] = msgObject.attributes[attrName];
					} catch( e ) {
						mw.log("Error could not set:" + attrName );
					}
				}
			});
		}
		// Update any dataAttributes:
		var dataAttributes =  mw.getConfig( 'EmbedPlayer.DataAttributes' );
		$.each( dataAttributes, function( attrName , na ){
			if( msgObject.attributes[attrName] ){
				$( _this.playerProxy ).data( attrName,  msgObject.attributes[attrName] );
			}
		});
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
			mw.log("iFramePlayer::proxyReady");
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
