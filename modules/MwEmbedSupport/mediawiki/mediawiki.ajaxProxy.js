(function( mw, $ ) {

	// Setup ajaxProxy module
	var ajaxProxy = function( options ) {
		// Check if we have success callback
		if( ! $.isFunction( options.success ) ) {
			mw.log( "mw.ajaxProxy :: Error: missing success callback." );
			return ;
		}

		// Check for url
		if( ! options.url ) {
			mw.log( "mw.ajaxProxy :: Error: missing url to proxy." );
		}

		// Setup default vars
		var defaults = {
			error: function() {},
			proxyUrl: mw.getConfig( 'Mw.XmlProxyUrl' ),
			proxyType: 'jsonp',
			startWithProxy: false,
			timeout: mw.getConfig( 'Mw.AjaxTimeout', 10000 )
		};

		// Merge options with defaults
		this.options = $.extend({}, defaults, options);

		// Make request
		this.ajax();
	};

	ajaxProxy.prototype = {
		/*
		 * Make an ajax request, fallback to proxy service
		 */
		ajax: function( useProxy ) {
			var _this = this;
			if( _this.options.startWithProxy ) {
				_this.proxy();
				return ;
			}

			var ajaxOptions = {
				success: function( result ) {
					_this.handleResult( result );
				},
				timeout: _this.options.timeout
			};

			if( useProxy ) {
				ajaxOptions.url = _this.options.proxyUrl + encodeURIComponent( _this.options.url );
				ajaxOptions.error = function() {
					mw.log( "mw.ajaxProxy :: Error: request failed with proxy." );
					_this.options.error();
				};
			} else {
				ajaxOptions.url = _this.options.url;
				ajaxOptions.error = function( jqXHR, textStatus, errorThrown ){
					mw.log( "mw.ajaxProxy :: Error: cross domain request failed, trying with proxy" );
					_this.proxy();
				};
			}

			// make the request
			try {
				$.ajax( ajaxOptions );
			} catch ( e ){
				// do nothing
			}
		},

		/*
		 * Make proxy request
		 */
		proxy: function() {
			var _this = this;
			if ( _this.options.proxyUrl ) {
				// decide if to use ajax or jsonp
				if( _this.options.proxyType == 'jsonp' ) {
					$.ajax({
						url: _this.options.proxyUrl + '?url=' + encodeURIComponent( _this.options.url ) + '&callback=?',
						dataType: 'json',
						success:  function( result ) {
							_this.handleResult( result, true );
						},
						error: function( error ) {
							mw.log("mw.ajaxProxy :: Error: could not load:", error);
							_this.options.error();
						},
						timeout: _this.options.timeout
					});
				} else {
					_this.ajax( true );
				}
			} else {
				mw.log( "mw.ajaxProxy :: Error: please setup proxy configuration" );
				this.options.error();
			}
		},

		/*
		 * Handle request result ( parse xml )
		 */
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
					if( resultXML ){
						result = resultXML;
					}
				} catch (e){
					// not an xml result
					result = result['contents'];
				}
				_this.options.success( result );
			} else {
				_this.options.success( result );
			}
		}
	};

	// Export our module to mw global object
	mw.ajaxProxy = ajaxProxy;

})( window.mw, window.jQuery );