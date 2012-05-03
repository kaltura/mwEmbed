(function( mw, $ ) {

	// Setup ajaxProxy module
	var ajaxProxy = function( options ) {
		// Setup default error callback
		if( ! $.isFunction( options.error ) ) {
			options.error = function() {};
		}
		
		this.options = options;
		this.ajax();
	};
	
	ajaxProxy.prototype = {
	
		ajax: function( useProxy ) {
			var _this = this;
			var ajaxOptions = {
				success: function( result ) { 
						_this.handleResult( result ); 
				}
			};
			
			if( useProxy ) {
				ajaxOptions = {
					url: mw.getConfig( 'Mw.XmlProxyUrl' ) + encodeURIComponent( _this.options.url ),
					error: function() { 
						mw.log( "mw.ajaxProxy :: Error: request failed with proxy." );
						_this.options.error();
					}
				};
			} else {
				ajaxOptions = {
					url: _this.options.url,
					error: function( jqXHR, textStatus, errorThrown ){
						mw.log( "mw.ajaxProxy :: First cross domain request failed, trying with proxy" );
						_this.proxy();
					}
				};
			}
			
			// make the request
			try {
				$.ajax( ajaxOptions );
			} catch ( e ){
				// do nothing
			}
		},
		
		proxy: function() {
			var _this = this;
			var type = mw.getConfig( 'Mw.XmlProxyType' ); // Default jsonp
			if ( mw.getConfig( 'Mw.XmlProxyUrl' ) ) {
				// decide if to use ajax or jsonp
				if( type == 'jsonp' ) {
					$.getJSON( mw.getConfig( 'Mw.XmlProxyUrl' ) + '?url=' + encodeURIComponent( _this.options.url ) + '&callback=?', function( result ){
						_this.handleResult( result, true );
					});				
				} else {
					_this.ajax( true );
				}
			} else {
				mw.log( "mw.ajaxProxy :: Error: please setup proxy configuration" );
				this.options.error();
			}
		},
		
		handleResult: function( result, isJsonP ) {
			var _this = this;
			if( isJsonP ) {
				if( result['http_code'] == 'ERROR' || result['http_code'] == 0 ){
					mw.log("mw.ajaxProxy :: Error: load error with http response");
					_this.options.error();
					return ;
				}			
				try {
					var resultXML = $.parseXML( result['contents'] );
				} catch (e){
					mw.log("mw.ajaxProxy :: Error: could not parse:", resultXML);
					_this.options.error();
					return ;
				}
				_this.options.success( resultXML );
			} else { 
				_this.options.success( result );
			}
		}
	};
	
	// Export our module to mw global object
	mw.ajaxProxy = ajaxProxy;
})( window.mw, window.jQuery );