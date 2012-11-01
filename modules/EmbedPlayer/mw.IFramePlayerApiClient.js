/**
* iFrame api mapping support 
* 
* Client side ( binds a given iFrames to expose the player api ) 
*/
( function( mw, $ ) { "use strict";

mw.IFramePlayerApiClient = function( iframe, playerProxy ){
	return this.init( iframe , playerProxy );
};
window[ 'perPlayerIdReciveApi' ] = [];

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
		
		this.addResizeBinding();
		
		// Add bind helper ( for odd jQuery javascript scope issues cases iOS ) 
		playerProxy.bindHelper = function( bindName, callback ){
			// this == playerProxy here:
			$( this ).bind( bindName, callback );
		}
	},
	/**
	 * Gets an iframe src ( uses the local domain src if the iframe has no source and is in 
	 * same domain iframe mode )
	 */
	'getIframeSrc' : function(){
		if( $( this.iframe ).attr('src') ){
			 return $( this.iframe ).attr('src')
		} else {
			return document.URL.replace(/#.*/, '');
		}
	},
	'addPlayerSendApi': function(){
		var _this = this;		
		
		// Allow modules to extend the list of iframeExported bindings
		$( mw ).trigger( 'AddIframePlayerMethods', [ this.exportedMethods ]);
		
		// Allow modules to update local variables client side before doing a asynchronous postMessage call
		var namedMethodCallbacks = {};
		$( _this.playerProxy ).trigger( 'AddIframePlayerMethodCallbacks', [ namedMethodCallbacks ]);
		
		$.each( this.exportedMethods, function( na, method ){
			_this.playerProxy[ method ] = function(){
				var doPostMessage = true;
				// Call any local named callbacks
				if( $.isFunction( namedMethodCallbacks[ method ] ) ){
					doPostMessage = namedMethodCallbacks[ method ].apply( this, $.makeArray( arguments ) );
				}
				if( doPostMessage ){
					mw.log("IframePlayerApiClient:: postMessage > " + method  + ' : ' + arguments[0] );
					_this.postMessage( {
						'method' : method,
						'args' : $.makeArray( arguments )
					} );
				}
			};
		});
	},
	'addPlayerReciveApi': function(){
		var _this = this;
		// Don't add the recive api if already defined for this player proxy id
		if( !window['perPlayerIdReciveApi'][ this.playerProxy.id ] ){
			window['perPlayerIdReciveApi'][ this.playerProxy.id ] = true;
			// Set the flag for the current global message receiver 
			$.receiveMessage( function( event ){
				_this.handleReceiveMessage( event );
			}, this.iframeServer);
		}
	},
	'addIframeFullscreenBinding': function(){
		var _this = this;
		var parentsAbsoluteList = [];
		var parentsRelativeList = [];
		var $iframe = $( _this.iframe );
		var orgSize = {
			'width' : $iframe.width(),
			'height' : $iframe.height(),
			'position' : $iframe.css( 'position' )
		};
		var orgStyle = $iframe.attr('style');
		var orginalViewPortContent =  $('meta[name="viewport"]').attr('content');
		
		// Add a local scope variable to register 
		// local scope fullscreen calls on orientation change
		// ( without this variable we would call fullscreen on all iframes on 
		// orientation change ) 
		var localIframeInFullscreen = false;
		var verticalScrollPosition = 0;
		
		var storeVerticalScroll = function(){
			verticalScrollPosition = (document.all ? document.scrollTop : window.pageYOffset);
		}
		var scrollToTop = function() {
			window.scroll(0, 0);
		};

		var doFullscreen = function(){
			localIframeInFullscreen = true;
			mw.log("IframePlayerApiClient:: doFullscreen> verticalScrollPosition:" + verticalScrollPosition);
			scrollToTop();
			// re grab the iframe: 
			$iframe = $( '#' + this.id ).find('iframe');
			// make sure the page has a zoom of 1: 
			if( !$('meta[name="viewport"]').length ){
				$('head').append( $( '<meta />' ).attr('name', 'viewport') );
			}
			$('meta[name="viewport"]').attr('content', 'initial-scale=1; maximum-scale=1; minimum-scale=1;' );
			
			// iPad 5 supports fixed position in a bad way, use absolute pos for iOS
			var playerCssPosition = ( mw.isIOS() ) ? 'absolute': 'fixed';
			// Remove absolute css of the interface parents
			$iframe.parents().each( function() {
				var $parent = $( this );
				if( $parent.css( 'position' ) == 'absolute' ) {
					parentsAbsoluteList.push( $parent );
					$parent.css( 'position', 'static' );
				}
				if( $parent.css( 'position' ) == 'relative' ) {
					parentsRelativeList.push( $parent );
					$parent.css( 'position', 'static' );
				}
			});
			
			// Don't resize bellow original size: 
			var targetSize = {
				'width' : window.innerWidth,
				'height' : window.innerHeight
			};
			/*
			 * We don't need that check anymore.
			 * On Desktop browsers we use native fullscreen so you unable to resize the window
			 * and that fixes issue on iPad when you enter the player while zoomed in.
			 * 
			if( targetSize.width < orgSize.width ){
				targetSize.width = orgSize.width;
			}
			if( targetSize.height < orgSize.height ){
				targetSize.height =  orgSize.height;
			}
			*/
			// Make the iframe fullscreen
			$iframe
				.css({
					'z-index': mw.getConfig( 'EmbedPlayer.FullScreenZIndex' ),
					'position': playerCssPosition,
					'top' : '0px',
					'left' : '0px',
					'width' : targetSize.width,
					'height' : targetSize.height,
					'margin': 0
				})
				.data(
					'isFullscreen', true
				);
		}; 
		
		var restoreWindowMode = function(){
			mw.log("IframePlayerApiClient:: restoreWindowMode> verticalScrollPosition:" + verticalScrollPosition);
			localIframeInFullscreen = false;
			
			// Restore document zoom: 
			if( orginalViewPortContent ){
				$('meta[name="viewport"]').attr('content', orginalViewPortContent );
			} else{
				// Restore user zoom: ( NOTE, there does not appear to be a way to know the 
				// initial scale, so we just restore to 1 in the absence of explicit viewport tag ) 
				// In order to restore zoom, we must set maximum-scale to a valid value
				$('meta[name="viewport"]').attr('content', 'initial-scale=1; maximum-scale=8; minimum-scale=1;' );
			}
			
			$iframe
				.css( orgSize )
				.data(
					'isFullscreen', false
				)
				.attr('style', orgStyle);
			
			// restore any parent absolute pos: 
			$( parentsAbsoluteList ).each( function() {	
				$( this ).css( 'position', 'absolute' );
			} );
			$( parentsRelativeList ).each( function() {
				$( this ).css( 'position', 'relative' );
			} );
			
			// Scroll back to the previews position
			window.scroll(0, verticalScrollPosition);
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
		
		$( this.playerProxy ).bind( 'fullScreenStoreVerticalScroll', storeVerticalScroll );
		$( this.playerProxy ).bind( 'onOpenFullScreen', doFullscreen);
		$( this.playerProxy ).bind( 'onCloseFullScreen', restoreWindowMode);
		
		// prevent scrolling when in fullscreen:
		document.ontouchmove = function( e ){
			if( localIframeInFullscreen ){
				e.preventDefault();
			}
		};
	},
	
	addResizeBinding: function(){
		var _this = this;
		/* TODO do something like this
		$( this.playerProxy ).bind( 'onresize', function(){
			$( _this.iframe ).css( newSize );
		})*/
		$( this.playerProxy ).bind( 'resizeIframeContainer', function(event, newSize){
			$( _this.iframe ).css( newSize );	
		});
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
			// mw.log(' handleReceiveMessage (skipped ) ' + msgObject.playerId + ' != ' + _this.playerProxy.id );
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
			//mw.log('IFramePlayerApiClient::handleReceiveMessage: trigger: ' + msgObject.triggerName + ' id: ' + _this.playerProxy.id );
			$( _this.playerProxy ).trigger( msgObject.triggerName, msgObject.triggerArgs );
		}
	},
	'postMessage': function( msgObject ){
		/*mw.log( "IFramePlayerApiClient:: postMessage(): " + this.stringify( msgObject ) + 
				' iframe: ' +  this.iframe + ' cw:' + this.iframe.contentWindow + 
				' src: ' + mw.absoluteUrl( $( this.iframe ).attr('src')  ) );*/
		// remove undeifned properties
		msgObject = this.removeUndefined( msgObject );
		
		$.postMessage(
			this.stringify( msgObject ), 
			mw.absoluteUrl( this.getIframeSrc() ), 
			this.iframe.contentWindow 
		);
	},
	'removeUndefined': function( obj ){
		for( var i in obj ){
			if( typeof obj[i] == 'undefined' ){
				delete obj[i];
			}
			if( typeof obj[i] == 'object' ){
				obj[i] = this.removeUndefined( obj[i] );
			}
		}
		return obj;
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
		        // skip functions
		        if( t == 'function' ){
		        	return true;
		        }
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
	// only support ONE iframe player at a time 
	var playerProxy = this[0];
	mw.log( "IframePlayerApiClient:: $.iFramePlayer::" + playerProxy.id );
	
	// Setup pointer to real iframe
	var iframePlayerId = $( playerProxy ).attr('id') + '_ifp';
	
	// Allow modules to extend the 'iframe' based player
	$( mw ).trigger( 'newIframePlayerClientSide', [ playerProxy ] );
	
	// Once the proxy ready event is received from the server complete the handshake
	// and send the proxyAcknowledgment back to the iframe server
	$( playerProxy ).bind('proxyReady', function(){
		mw.log( "IframePlayerApiClient:: iFramePlayer::proxyReady" );
		playerProxy.proxyAcknowledgment();
	});
	
	// Bind the iFrame player ready callback
	if( readyCallback ){
		$( playerProxy ).bind( 'playerReady', readyCallback );		
	};
	
	// Setup the iframe:
	var iframe = $('#' + iframePlayerId)[0];
	if( !iframe ){
		mw.log("$.iFramePlayer:: Error invalid iFramePlayer request");
		return false;
	}
	if( !iframe['playerApi'] ){
		iframe['playerApi'] = new mw.IFramePlayerApiClient( iframe, playerProxy );
	}
	
	// Return this ( jQuery style )
	return this;
};

} )( window.mw, window.jQuery );
