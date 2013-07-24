( function( ) { "use strict";
	
	var kdp;
	var entryReady = false;

	kWidget.addReadyCallback( function ( playerId ) {
		kdp = document.getElementById ( playerId );
		setKontikiFlavorTags();

		kdp.kBind( "entryReady", function() {
			entryReady = true;
		});

	});

	function setKontikiFlavorTags () {
		if ( kdp !== undefined && gKontikiAgentData !== undefined ) {
			kdp.setKDPAttribute( "configProxy.flashvars", "flavorTags", "kontiki, mbr, web" );
		}
	}

	/////////////////////////////////////////////////////////////////////////////////////////////////////////////
	// start kontiki code
	///////////////////////////////////////////////////////////////////////////////////////////////////////////

	// Copyright (c) 2012 Kontiki, Inc. All rights reserved.
	// IMPORTANT NOTE: If using flash loader must put "<div id="kontikiAgent" >" on page that imports this file!
	// v1.1 - Add support for 'getMachineName' and 'getNodeId'

	// prevents errors when used with 3rd party and client instead of VC
	if(!window.kontiki)  window.kontiki = {};
	if(!kontiki.kui) kontiki.kui = {};

	//URLs to the various assets we'll need.	
	var AGENT_FLASH_LOADER_URL = kWidget.getPath() +'kWidget/onPagePlugins/kontiki/kontikiagentflashloader.swf';

	// global callback and agent reference needed for flash loader
	var gKontikiCallback;
	var gKontikiAgent;
	// reference to return agent data
	var gKontikiAgentData;
	// timeout if attempting to reach client fails
	var gKontikiTimeout; 

	// either client script injection or flash loader will call this
	window.agentDataResponse = function ( params ) {
		// this will point to the data returned
		// and accessed by KontikiAgent
		gKontikiAgentData = params;
	};
	
	
	// called by flash loader
	window.ASCallback = function ASCallback() {
		// cancel timeout
		clearTimeout( gKontikiTimeout ); 
		gKontikiCallback( gKontikiAgent );
	};

	var KontikiAgent = function ( params ) {
		var that = this;	
		gKontikiAgent = this; 
		
		// default HTTP host
		var http_host = "127.0.0.1";
		// default HTTP and RTMP localhost ports
		var http_port = "31013";
		var rtmp_port = "31014";
		
		// default user callback timeout is 5 seconds
		var cb_timeout = 5000;
		// reference to user callback
		var callback;
		// use flash loader to request kontiki agent data
		// for bypassing browser 'mixed content' security warning
		var flash_loader = false;
		var notInstalled = "";
			
		if ( typeof( params ) == 'undefined') {
			alert("KontikiAgent Error: No parameter object passed in");
			return;
		}
		
		if ( typeof( params ).callback == 'undefined')	{
			alert("KontikiAgent Error: Need an initialization callback function");
			return;
		} else {
			callback = params.callback;
			// callback needs global reference for flash loader
			gKontikiCallback = params.callback;
		}
		
		if ( typeof( params.http_host ) != 'undefined' ) {
			http_host = params.http_host;
		}

		if ( typeof( params.http_port ) != 'undefined' ) {
			http_port = params.http_port;
		}
		
		if ( typeof( params.rtmp_port ) != 'undefined' ) {
			rtmp_port = params.rtmp_port;
		}

		if ( typeof( params.callback_timeout ) != 'undefined' ) {
			cb_timeout = params.callback_timeout;
		}
		
		if ( typeof( params.flash_loader ) != 'undefined' ) {
			flash_loader = params.flash_loader;
		}
			
		// try to retrieve agent data file from localhost http server
		var clientUrl = "http://" + http_host + ":" + http_port + "/kontiki/kontiki/cache/RetrieveAgentData?callback=agentDataResponse";

		if ( flash_loader && ( typeof( swfobject ) != 'undefined' ))
		{	
			//add div to contain flash
			var flashDiv = document.createElement( "div" );
			flashDiv.id = "kontikiAgent";
			flashDiv.style.width = 0;
			flashDiv.style.height = 0;
			document.body.appendChild( flashDiv );

			var flashvars = { url: clientUrl };
			kWidget.outputFlashObject( "kontikiAgent", { src: AGENT_FLASH_LOADER_URL, flashvars: flashvars });
		} else {
			includeJs( clientUrl );
		}

		function includeJs ( file ) {
			// dynamically tries to load agent data from client localhost
			var html_doc = document.getElementsByTagName( 'head' )[0];
			var js = document.createElement( 'script' );
			js.setAttribute( 'type', 'text/javascript' );
			js.setAttribute( 'src', file );
			html_doc.appendChild( js );
			
			// FF and Chrome won't fire onload or state change event if unable to retrieve agent data file(i.e. client isn't running)
			// set timeout to guarantee callback will be generated 
			gKontikiTimeout = setTimeout( callback, cb_timeout );
			
			js.onreadystatechange = function() {
				// this event fires on IE even unable to retrieve agent data from client localhost
				if ( js.readyState == 'loaded' || js.readState == 'complete' ) {				
					clearTimeout( gKontikiTimeout );
					// callback is the entry point for 3rd party caller			
					callback( that );
				}
	        }
			
			js.onload = function() {
				// this event fires on FF and Chrome only when agent data file is retrieved
				clearTimeout( gKontikiTimeout );
				// callback is the entry point for 3rd party caller
				callback( that );
			}
			
			return false;
		}
		
		// build and return a query string built from name:value pairs in JSON
		function queryStr( args ) {
			var str = "";
			var first = true; 
			for ( var key in args ) {
				if ( !args.hasOwnProperty( key )) {
					continue;
				}
				
				if ( first ) {
					str += "?";
					first = false;
				} else {
					str += "&";
				}

				str += key + "=" + Base64.encode( args[key] );			
			}						
			return str;
		}	
		
		this.isInstalled = function() {
			if ( typeof( gKontikiAgentData ) !== 'undefined' ) {
				return true;
			} else {
				return false;
			}
		}
		
		this.getVersion = function() {
			if ( typeof( gKontikiAgentData ) !== 'undefined' ) {
				return gKontikiAgentData.version;
			} else {
				return notInstalled;
			}
		}

		this.getMachineName = function() {
			if ( typeof( gKontikiAgentData ) !== 'undefined' ) {
				return gKontikiAgentData.machine_name;
			} else {
				return notInstalled;
			}
		}

		this.getNodeId = function() {
			if ( typeof( gKontikiAgentData ) !== 'undefined' ) {
				return gKontikiAgentData.node_id;
			} else {
				return notInstalled;
			}
		}

		this.getHttpUrlForFile = function( urn, file,  args ) {
			if ( this.isInstalled() ) {
				return "http://" + http_host + ":" + http_port + "/stream/" + urn + "/" + ( file ? file: "content.f4v" ) + queryStr( args );
			} else {
				return notInstalled;
			}
		}
		
		this.getHttpUrl = function( urn, args ) {
			if ( this.isInstalled() ) {
				return "http://" + http_host + ":" + http_port + "/stream/" + urn + "/content.f4v" + queryStr( args );
			} else {
				return notInstalled;
			}
		}
		
		this.getHttpDsUrl = function( urn, args ) {
			if ( this.isInstalled() ) {
				return "http://" + http_host + ":" + http_port + "/stream/" + urn + "/manifest.f4m" + queryStr( args );
			} else {
				return notInstalled;
			}
		}

		this.getHttpLsUrl = function( urn, args ) {
			if ( this.isInstalled() ) {
				return "http://" + http_host + ":" + http_port + "/stream/" + urn + "/chunklist.m3u8" + queryStr( args );
			} else {
				return notInstalled;
			}
		}
		
		this.getRtmpHost = function() {
			if ( this.isInstalled() ) {
				return "rtmp://" + http_host + ":" + rtmp_port; 
			} else {
				return notInstalled;
			}
		}
		
		this.getRtmpStream = function( urn, args ) {
			if ( this.isInstalled() ) {
				return "/stream/" + urn + queryStr(args);
			} else {
				return notInstalled;
			}
		}
		
		this.getRtmpUrl = function( urn, args ) {
			if ( this.isInstalled() ) {
				return this.getRtmpHost() + this.getRtmpStream(urn, args) + queryStr(args); 
			} else {
				return notInstalled;
			}
		}
		
		this.checkMinVersion = function( minVersion ) {
			if ( typeof( gKontikiAgentData ) !== 'undefined' ) {
				var version = gKontikiAgentData.version;
				var versionTokens = version.split( "." );
				var minVersionTokens = minVersion.split( "." );
				if ( minVersionTokens.length > 0 && versionTokens.length >= minVersionTokens.length ) {
					for ( var i = 0; i < minVersionTokens.length; i++ ) {
						var minVerNum = minVersionTokens[i];
						var verNum = versionTokens[i];
						if ( parseInt( verNum ) != parseInt( minVerNum ) ) {
							return parseInt( verNum ) > parseInt( minVerNum );
						}
					}
					return true;
				}
			}
			return false;
		}
		
	};

	var Base64 = {
	    _keyStr : "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=",
	    
		encode : function ( input ) {
	        var output = "";
	        var chr1, chr2, chr3, enc1, enc2, enc3, enc4;
	        var i = 0;

	        input = Base64._utf8_encode(input);

	        while ( i < input.length ) 
			{

	            chr1 = input.charCodeAt(i++);
	            chr2 = input.charCodeAt(i++);
	            chr3 = input.charCodeAt(i++);

	            enc1 = chr1 >> 2;
	            enc2 = ((chr1 & 3) << 4) | (chr2 >> 4);
	            enc3 = ((chr2 & 15) << 2) | (chr3 >> 6);
	            enc4 = chr3 & 63;

	            if ( isNaN( chr2 ) ) 
				{
	                enc3 = enc4 = 64;
	            } 
				else if ( isNaN( chr3 )) 
				{
	                enc4 = 64;
	            }
				
	            output = output +
	            this._keyStr.charAt(enc1) + this._keyStr.charAt(enc2) +
	            this._keyStr.charAt(enc3) + this._keyStr.charAt(enc4);

	        }

	        return output;
	    },
		_utf8_encode : function (string) {
			string = string.replace( /\r\n/g,"\n" );
			var utftext = "";

			for ( var n = 0; n < string.length; n++ ) 
			{
				var c = string.charCodeAt( n );
				if ( c < 128 ) 
				{
					utftext += String.fromCharCode( c );
				}
				else if( ( c > 127 ) && ( c < 2048 ) ) 
				{
					utftext += String.fromCharCode( ( c >> 6 ) | 192 );
					utftext += String.fromCharCode( ( c & 63 ) | 128 );
				}
				else 
				{
					utftext += String.fromCharCode( ( c >> 12 ) | 224 );
					utftext += String.fromCharCode( ( ( c >> 6 ) & 63 ) | 128 );
					utftext += String.fromCharCode( ( c & 63 ) | 128 );
				}
			}

			return utftext;
		}
	}
	/////////////////////////////////////////////////////////////////////////////////////////////////////////////
	// end of kontiki code
	///////////////////////////////////////////////////////////////////////////////////////////////////////////

	function onKaReady() {	
		setKontikiFlavorTags();
		//if entryReady was already sent flavorTags won't affect.
		if ( entryReady ) {
			kWidget.log( "kontikiAgent :: KontikiAgent responded after entryReady, kontiki flavorTags weren't set" );
		}
	}

	var loadFlash = false;
	//to avoid "secure content" alerts load kontikiagentflashloader.swf
	if ( location.protocol === "https:" ) {
		loadFlash = true;
	}
	var params = { callback: onKaReady, flash_loader: loadFlash };
	window.kontikiAgent = new KontikiAgent( params );
})();