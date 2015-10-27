( function( mw, $ ) { "use strict";

mw.AdLoader = function( embedPlayer ) {
	// Create an AdLoader
	return this.init( embedPlayer );
};

mw.AdLoader.prototype = {

	// Vast response can return Wrapper that points to another vast
	// this varible holds the max number of redirects to follow
	maxRedirects: 5,
	currentCounter: 0,

	init: function( embedPlayer ){
		this.embedPlayer = embedPlayer;
	},

	/**
	 * Get ad display configuration object from a url
	 *
	 * @param {string} adUrl
	 * 		The url which contains the xml ad payload
	 * @param {function} callback
	 * 		Function called with ad payload once ad content is loaded.
	 * @param {boolean} wrapped
	 * 		(optional) used to increase the internal counter
	 * @param {array} wrapperData
	 * 		(optional) in case this loader is being after loading a wrapper, preserve all previous wrapper data and pass it to the
	 * 		inner ad so it can parse and send all events
	 * @param {object} ajaxOptions
	 * 		(optional) additional ajax options, e.g. withCredentials
	 */
	load: function( adUrl, callback, wrapped , wrapperData, ajaxOptions ){
		var _this = this;
		if(wrapperData == null) {
			wrapperData = [];
		}

		adUrl = _this.replaceCacheBuster(adUrl);
		
		// trip whitespace in ad urls: 
		adUrl = $.trim( adUrl );

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
			ajaxOptions: ajaxOptions,
			success: function( resultXML ) {
				_this.handleResult( resultXML, callback, wrapperData, ajaxOptions );
			},
			error: function( error ) {
				mw.log("Error: AdLoader failed to load:" + adUrl);
				callback({});
			}
		});
	},
	handleResult: function(data, callback, wrapperData, ajaxOptions ){
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
					mw.VastAdParser.parse( data, callback , wrapperData, ajaxOptions, _this );
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
		if ( xmlObject && xmlObject.childNodes ) {
			var childNodes = xmlObject.childNodes, node, nodeNameLC;

			// Loop over all child nodes searching for the first element node
			for ( var i = 0, iMax = childNodes.length; i < iMax; i++ ) {
				node = xmlObject.childNodes[i];

				// Check if the node is an element
				if ( node.nodeType === 1 ) {

					// Lower-case nodeName for string checking
					nodeNameLC = node.nodeName.toLowerCase();

					// Catch special case -
					// If the node name is XML, assume it is the XML header,
					// continue onto checking the next element
					if ( nodeNameLC === "xml" && i < iMax-1 ) {
						continue;
					}

					// Check if the node is the required vast type node
					if ( nodeNameLC === 'vast' ||
							nodeNameLC === 'videoadservingtemplate' ) {

						// Success, the first element is a Vast element
						return 'vast';
					}
					else {
						// The First Element was not a Vast Element,
						break;
					}
				}
			}
		}

		// Catch-all
		return 'unknown';
	},

	replaceCacheBuster: function( adUrl ) {
		var cacheBusters = ['[timestamp]', '[cachebuster]', '[random]', '[randnum]'];
		var timestamp = Math.round(+new Date()/1000);
		for(var i=0; i<cacheBusters.length; i++){
			adUrl = adUrl.replace(cacheBusters[i], timestamp);
		}
		return adUrl;
	}
};
} )( window.mw, jQuery );
