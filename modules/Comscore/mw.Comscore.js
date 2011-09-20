/**
* Comscore plugin
* 
* Check if we are in "iframe" mode, if not fire the becon directly
* 
* if we are an iframe server pass the becon across the iframe
* 
* Comsore is fired at the start of each clip. 
*/

mw.Comscore = function( embedPlayer, callback ){
	this.init( embedPlayer, callback );
};

mw.Comscore.prototype = {

	pluginVersion: "1.0",

	prerollAdContentType: "09",
	postrollAdContentType: "10",
	midrollAdContentType: "11",
	inBannerVideoAd: "12",

	playerPlayedFired: false,
	loadedXML: false,

	cParams: {
		c1: "1",
		c2: "",
		c3: "",
		c4: "",
		c5: "",
		c6: "",
		c10: ""
	},

	init: function( embedPlayer, callback ){
		this.embedPlayer = embedPlayer;
		this.setupConfig();
		this.loadXML( callback );
	},

	setupConfig: function() {
		
		var attributes = ['cTagsMap'];

		for( var i = 2 ; i < 10; i++ ){
			if( i > 6 && i < 10) continue; // Skip 7-9
			attributes.push( 'c' + i );
			attributes.push( 'c' + i + 'attributeKey' );
			attributes.push( 'c' + i + 'attributeValue' );
			attributes.push( 'c' + i + 'Value' );
		}
		
		this.config = this.embedPlayer.getKalturaConfig( 'comscore', attributes );
	},

	loadXML: function( callback ) {
		var _this = this;
		
		var loadFromProxy = function() {
			var proxyUrl = mw.getConfig( 'Mw.XmlProxyUrl' );
			if( !proxyUrl ){
				mw.log( "Error: mw.KAds : missing kaltura proxy url ( can't load ad )");
				return ;
			}
			$.getJSON( proxyUrl + '?url=' + encodeURIComponent( _this.config.cTagsMap ) + '&callback=?', function( result ){
				if( result['http_code'] == 'ERROR' || result['http_code'] == 0 ){
					mw.log("Error: loadAdXml error with http response");
					return ;
				}
				try{
					var resultXML = $.parseXML( result['contents'] );
				} catch (e){
					mw.log("Error: Comscore could not parse:" + resultXML);
					return ;
				}
				// get the xml document:
				_this.handleXMLResult( resultXML, callback );
			});
		};

		// Load the cTagsMap if set
		if( this.config.cTagsMap ){
			mw.log('Comscore:: Retrive Comscore xml file from: ' + this.config.cTagsMap);
			// First try to directly load the xml url:
			try{
				$.ajax({
					url: _this.config.cTagsMap,
					success: function( data ) {
						_this.handleXMLResult( data, callback );
					},
					error: function( jqXHR, textStatus, errorThrown ){
						// try to load the xml with the proxy:
						loadFromProxy();
					}
				});
			} catch ( e ){
				mw.log( "Comscore:: first cross domain request failed, trying with proxy" );
			}
		} else {
			callback();
		}
	},

	addPlayerBindings: function() {
		var _this = this;
		var embedPlayer = this.embedPlayer;
		var config = this.config;
		var cParams = _this.cParams;

		// Bind to entry ready
		$( embedPlayer ).bind('KalturaSupport_EntryDataReady', function() {
			_this.playerPlayedFired = false;
			_this.createCParams();
		});

		// Bind to player played
		$( embedPlayer ).bind('onplay', function() {
			if (!_this.playerPlayedFired)
			{
				cParams["c5"] = config.c5;

				// Send beacon
				$( embedPlayer ).trigger('Comscore_Beacon', {});

				_this.playerPlayedFired = true;
			}
		});

		// Bind to ad start
		$( embedPlayer ).bind('AdSupport_AdStart', function( event, adType, adConf ) {

			switch (adType)
			{
				case SequenceContextType.PRE:
					cParams["c5"] = _this.prerollAdContentType;
				break;
				case SequenceContextType.POST:
					cParams["c5"] = _this.postrollAdContentType;
				break;
				case SequenceContextType.MID:
					cParams["c5"] = _this.midrollAdContentType;
				break;
			}

			// Send beacon
			//$( embedPlayer ).trigger('Comscore_Beacon', {});
			_this.comScoreBeacon( cParams );

		});
	},

	handleXMLResult: function( xml, callback ) {
		mw.log('Comscore:: loaded xml successfully, setup cparams & player bindings');

		// Save XML
		this.$xml = $(xml);
		this.loadedXML = true;

		// Setup Defaults CParams
		this.setupCParams();

		// Add player bindings
		this.addPlayerBindings();

		// Run callback to continue player loading
		callback();
	},

	setupCParams: function() {
		//Set up cParams object
		var config = this.config;
		var cParams = this.cParams;

		for( var i = 2 ; i < 10; i++ ){
			if( i > 6 && i < 10) continue; // Skip 7-9
			cParams['c' + i] = this.parseCAttribute('c' + i);
		}

		console.log( mw.getConfig( 'KalturaSupport.IFramePresetFlashvars' ) );
		console.log( $(this.embedPlayer).data('flashvars'));
		console.log(this.embedPlayer.$uiConf.find("#comscore"));
		console.log(config);
		console.log(cParams);
	},

	/**
	 * Parse the given C param, return the dynamic parsed value OR the uiconf written c value if there is no xml map loaded
	 * Example:
	 * xml:
	 *	<C3>
	 *		<contentOwner name="ABC" id="2546">
	 *		<contentOwner name="FOX" id="9854">
	 *	</C3>
	 * where the data exists in the metadata in 'contentOwnerName' attribute inside a 'content' object
	 * customMetadata[content][contentOwnerName] == 'FOX'
	 *
	 * in this example, the uiConf attributes would look like:
	 *
	 * <Plugin id="comscore" ... c3="defaultValue" c3attributeKey="name" c3attributeValue="id" c3Value="{Metadata.content.contentOwnerName}" ... />
	 * This configuration would look for a c3 node in the map xml, for the 1st node that has the name
	 * attribute with the same name that the entry metadata contentOwnerName, and will return the string that is written in its id
	 * If the metadata value is FOS the return value will be 9854
	 */
	parseCAttribute: function( cName ) {

		var _this = this;
		var config = this.config;
		var $xml = this.$xml;

		var returnValue = config[cName];
		
		if( _this.loadedXML && config[cName+"attributeKey"] )

			//get name of property
			var attributeKey = config[cName+"attributeKey"];
			var attributeValue = config[cName+"attributeValue"];
			var value = config[cName+"Value"];

			//if one of the strings is empty
			if ( !attributeKey || !attributeValue || !value )
				return returnValue;

			var map= {};
			$xml.find(cName).children().each(function( idx, node) {
				map[ $(node).attr( attributeKey ) ] = $(node).attr( attributeValue );
			});

			if( map[value] ) {
				return map[value];
			}

			return returnValue;
		
	},

	comScoreBeacon: function( beconObject ) {
		var _this = this;
		
		var loadUrl = (document.location.protocol == "https:" ? "https://sb." : "http://b");
		loadUrl += "scorecardresearch.com/p?";

		for (var cParam in beconObject) {
			loadUrl += cParam+"="+beconObject[cParam]+"&";
		}

		// Setup page, title and referrer
		var page, title, referrer;
		if (page && page != "") {
			loadUrl += "c7=" + page +"&";
		}

		if (title && title != "") {
			loadUrl += "c8=" + title +"&";
		}

		if (referrer && referrer != "") {
			loadUrl += "c9=" + referrer +"&";
		}

		loadUrl += "rn=" + Math.random().toString() + "&";
		loadUrl +="cv=" + _this.pluginVersion;

		console.log(loadUrl);
	}
};