/**
* Comscore plugin
*
* Check if we are in "iframe" mode, if not fire the becon directly
*
* if we are an iframe server pass the becon across the iframe
*
* Comsore is fired at the start of each clip.
*/
( function( mw, $ ) { "use strict";

mw.Comscore = function( embedPlayer, callback ){
	this.init( embedPlayer, callback );
};

mw.Comscore.prototype = {

	pluginVersion: "1.1",

	prerollAdContentType: "09",
	postrollAdContentType: "10",
	midrollAdContentType: "11",
	inBannerVideoAd: "12",

	loadedXML: false,

	bindPostfix: '.Comscore',

	cParams: {
		c1: "1",
		c2: "",
		c3: "",
		c4: "",
		c5: "",
		c6: "",
		c10: ""
	},

	currentSegment: 0, // Used for C10 tag (read comments in getC10 method)

	init: function( embedPlayer, callback ){
		this.embedPlayer = embedPlayer;
		this.setupConfig();
		this.loadXML( callback );
	},

	/* setupConfig: returns plugin attributes from uiConf */
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

		// Load the cTagsMap if set
		if( this.config.cTagsMap ){
			mw.log('Comscore:: Retrive Comscore xml file from: ' + _this.config.cTagsMap);
			new mw.ajaxProxy({
				url: _this.config.cTagsMap,
				success: function( resultXML ) {
					_this.handleXMLResult( resultXML, callback );
				},
				error: function() {
					mw.log("Comscore:: Error: failed to load: " + _this.config.cTagsMap);
					_this.addPlayerBindings( callback );
				}
			});
		} else {
			this.addPlayerBindings( callback );
		}
	},

	handleXMLResult: function( xml, callback ) {
		var _this = this;
		mw.log('Comscore:: loaded xml successfully, setup cparams & player bindings');

		// Save XML
		try{
			_this.$xml = $(xml);
			_this.loadedXML = true;
		} catch( e ){
			// could not parse xml
		}
		// Add player bindings
		_this.addPlayerBindings( callback );
	},

	addPlayerBindings: function( callback ) {
		var _this = this;
		var embedPlayer = this.embedPlayer;
		var cParams = _this.cParams;

		// Unbind any old bindings:
		embedPlayer.unbindHelper( _this.bindPostfix );

		/*
		 * We need to send beacons on Content playback and Ads playback
		 *
		 * 1. Send Beacon on 'onPlay' event ( Content Beacon )
		 * 1. Send Beacon on AdStartPlayback ( Ad Beacon )
		 * 2. Send Beacon on AdEndPlayback only for Midrolls ( Resume Content Beacon )
		 * 3. If we had AdOpportunity, but didn't got AdStartPlayback, we need to send a Beacon ( Resume Content Beacon )
		 *
		 */
		var shouldSendBeacon = false;
		var sendOnSequnceEnd = false;
		var playerPlayedFired = false;

		// Setup Defaults CParams
		this.setupCParams();

		// on change media remove any existing ads:
		embedPlayer.bindHelper( 'onChangeMedia' + _this.bindPostfix, function(){
			_this.destroy();
		});

		// Bind to entry ready
		embedPlayer.bindHelper('KalturaSupport_EntryDataReady' + this.bindPostfix, function() {
			playerPlayedFired = false;
			shouldSendBeacon = false;
			sendOnSequnceEnd = false;
			_this.currentSegment = 0;
			_this.setupCParams();
		});

		// Bind to player played
		embedPlayer.bindHelper('onplay' + this.bindPostfix, function() {
			if ( !playerPlayedFired && !_this.inAd() ){
				playerPlayedFired = true;
				// Send beacon
				_this.currentSegment++;
				cParams["c5"] = _this.parseCAttribute('c5');
				mw.log('Comscore:: Send Content Start Beacon');
				_this.comScoreBeacon( cParams );
			}
		});

		// Listen to Ad opportunities of midroll type and increase the current segment counter
		embedPlayer.bindHelper('KalturaSupport_AdOpportunity' + this.bindPostfix, function( event, cuePoint ) {
			if( embedPlayer.kCuePoints.getAdSlotType( cuePoint ) === 'midroll' ) {
				_this.currentSegment++;
				// Used setTimeout because it takes few ms to set propagateEvents to false
				setTimeout( function() {
					shouldSendBeacon = true;
				}, mw.getConfig( 'EmbedPlayer.MonitorRate' ));
			}
		});

		embedPlayer.bindHelper('AdSupport_StartAdPlayback' + this.bindPostfix, function( event, adType ) {
			switch ( adType ){
				case 'preroll':
					cParams["c5"] = _this.prerollAdContentType;
				break;
				case 'postroll':
					cParams["c5"] = _this.postrollAdContentType;
				break;
				case 'midroll':
					cParams["c5"] = _this.midrollAdContentType;
					sendOnSequnceEnd = true;
				break;
			}

			// Send beacon
			mw.log('Comscore:: Send Ad Start Beacon');
			_this.comScoreBeacon( cParams );
			shouldSendBeacon = false;

		});

		embedPlayer.bindHelper('AdSupport_EndAdPlayback' + this.bindPostfix, function() {
			if( sendOnSequnceEnd ) {
				cParams["c5"] = _this.parseCAttribute('c5'); // Reset C5
				mw.log('Comscore:: Send Ad End Beacon (Resume Content)');
				_this.comScoreBeacon( cParams );
				sendOnSequnceEnd = false;
			}
		});

		embedPlayer.bindHelper('monitorEvent' + this.bindPostfix, function() {
			if( shouldSendBeacon ) {
				cParams["c5"] = _this.parseCAttribute('c5'); // Reset C5
				mw.log('Comscore:: Send Resume Content Beacon (No Ad)');
				_this.comScoreBeacon( cParams );
				shouldSendBeacon = false;
			}
		});

		// release the player
		callback();
	},

	setupCParams: function() {
		mw.log('Comscore:: Setup CParams');
		//Set up cParams object
		var cParams = this.cParams;

		for( var i = 2 ; i < 10; i++ ){
			if( i > 6 && i < 10) continue; // Skip 7-9
			cParams['c' + i] = this.parseCAttribute('c' + i);
		}

		/**
		 * For debug:
		 console.log( 'Comscore config: ', this.config);
		 console.log( 'cParams: ', cParams);
		 */
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

		if( _this.loadedXML && config[cName+"attributeKey"] ) {

			//get name of property
			var attributeKey = config[ cName + "attributeKey" ];
			var attributeValue = config[ cName + "attributeValue" ];
			var value = config[ cName + "Value" ];

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
		}

		return returnValue;

	},

	/*
	 * C10- Segment level reporting
		    Segments refer to ad breaks. The only events being for are the start of a video
			or the start of an ad. The following format should be used: â€œCurrent Segment # -Total Segments.â€�
			So if the given stream is the second segment out of four, the C10 should read â€œ2-4â€�.
			If there are no segments in the video, the tag should either be empty, or return 1-1
	 */
	getC10: function() {
		if( ! this.embedPlayer.kCuePoints ) { return "1-1"; }
		var adsCount = this.embedPlayer.kCuePoints.getCuePointsCount( 'midroll' );
		if( adsCount == 0 ){
			return "1-1";
		} else {
			return this.currentSegment + "-" + ( parseInt(adsCount) + 1);
		}
	},

	comScoreBeacon: function( beaconObject ) {
		var _this = this;

		var loadUrl = (document.location.protocol == "https:" ? "https://sb." : "http://b");
		loadUrl += "scorecardresearch.com/p?";

		// Setup C7 - Page URL Param
		if ( mw.getConfig( 'EmbedPlayer.IframeParentUrl' ) ) {
			beaconObject["c7"] = mw.getConfig( 'EmbedPlayer.IframeParentUrl' );
		}

		// Setup C8 - Page Title Param
		if ( mw.getConfig( 'EmbedPlayer.IframeParentTitle' ) ) {
			beaconObject["c8"] = mw.getConfig( 'EmbedPlayer.IframeParentTitle' );
		}

		// Setup C9 - Page Referrer Param
		if ( mw.getConfig( 'EmbedPlayer.IframeParentReferrer' ) ) {
			beaconObject["c9"] = mw.getConfig( 'EmbedPlayer.IframeParentReferrer' );
		}
		// Setup C10 - Segment Level Param
		beaconObject["c10"] = _this.getC10();

		for (var cParam in beaconObject) {
			if( beaconObject[cParam] ) {
				loadUrl += cParam + "=" + encodeURIComponent(beaconObject[cParam]) + "&";
			}
		}
		// check for trackEventMonitor
		if( this.config['trackEventMonitor'] ){
			if( parent[ this.config['trackEventMonitor'] ] ){
				 parent[ this.config['trackEventMonitor'] ]( beaconObject );
			}
		}

		loadUrl += "rn=" + Math.random().toString() + "&";
		loadUrl += "cv=" + _this.pluginVersion;

		// Load img to send the beacon
		mw.sendBeaconUrl( loadUrl );
		mw.log('Comscore:: Sent Beacon: ' + loadUrl, beaconObject);
	},
	destroy: function() {
		$( this.embedPlayer ).unbind( this.bindPostfix );
	},

	inAd: function(){
		return !! this.embedPlayer.evaluate('{sequenceProxy.isInSequence}');
	}
};

})( window.mw, jQuery);
