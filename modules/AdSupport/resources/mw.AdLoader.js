( function( mw, $ ) { "use strict";

mw.AdLoader = {
	/**
	 * Get ad display configuration object from a url
	 *
	 * @param {string} adUrl
	 * 		The url which contains the xml ad payload
	 * @param {function} callback
	 * 		Function called with ad payload once ad content is loaded.
	 */
	load: function( adUrl, callback ){
		var _this = this;
		mw.log('AdLoader :: load Ad: ', adUrl);

		// Make ajax request with fallback to proxy service
		new mw.ajaxProxy({
			url: adUrl,
			success: function( resultXML ) {
				_this.handleResult( resultXML, callback );
			},
			error: function( error ) {
				mw.log("Error: AdLoader failed to load:" + adUrl);
				callback({});
			}
		});
	},
	handleResult: function(data, callback ){
		var _this = this;

		// If our data is a string we need to parse it as XML
		if( typeof data === 'string' ) {
			// Clean everything before <?xml?> tag
			var xmlPosition = data.indexOf("<?xml");
			if( xmlPosition > 0 ) {
				var junk = data.substr(0,xmlPosition);
				data = data.replace(junk, '');
			}
			try{
				data = $.parseXML( data );
			} catch( error ){
				// error in parsing xml
			}
		}
		switch( _this.getAdFormat( data) ){
			case 'vast':
				// If we have lots of ad formats we could conditionally load them here:
				// 'mw.VastAdParser' is a dependency of adLoader
				mw.load( 'mw.VastAdParser', function(){
					callback(
						mw.VastAdParser.parse( data )
					);
				});
				return ;
			break;
		}
		mw.log("Error: could not parse adFormat from add content: \n" + data);
		callback( false );
	},
	/**
	 * Get ad Format
	 * @param {string}
	 * 		The xml string of the ad contents
	 * @return
	 * @type {string}
	 * 		The type of string
	 */
	getAdFormat: function( xmlObject ){
		if( xmlObject.childNodes ){
			var rootNodeName = xmlObject.childNodes[0].nodeName;
		}
		if( rootNodeName && (
				rootNodeName.toLowerCase() == 'vast' ||
				rootNodeName.toLowerCase() == 'videoadservingtemplate' )
		){
			return 'vast';
		}
		return 'unknown';
	}
};
} )( window.mw, jQuery );
