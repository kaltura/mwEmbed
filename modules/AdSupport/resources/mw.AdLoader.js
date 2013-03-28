( function( mw, $ ) { "use strict";

mw.AdLoader = {
	// Vast response can return Wrapper that points to another vast
	// this varible holds the max number of redirects to follow
	maxRedirects: 5,
	currentCounter: 0,
	/**
	 * Get ad display configuration object from a url
	 *
	 * @param {string} adUrl
	 * 		The url which contains the xml ad payload
	 * @param {function} callback
	 * 		Function called with ad payload once ad content is loaded.
	 * @param {boolean} wrapped
	 * 		(optional) used to increase the internal counter
	 */
	load: function( adUrl, callback, wrapped ){
		var _this = this;
		mw.log('AdLoader :: load Ad: ', adUrl);

		// Increase counter if the vast is wrapped, otherwise reset
		if( wrapped ) {
			this.currentCounter++;
		} else {
			this.currentCounter = 0;
		}

		// Stop loading of ad if the counter is bigger then max redirects
		if( this.currentCounter >= this.maxRedirects ) {
			mw.log("Error: The allowed number of redirects is " + this.maxRedirects);
			callback({});
			return ;
		}

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
					mw.VastAdParser.parse( data, callback );
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
		if(xmlObject &&  xmlObject.childNodes ){
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
