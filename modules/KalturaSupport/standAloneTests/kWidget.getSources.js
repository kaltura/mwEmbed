/**
 * Stand alone source grabber.
 */

if( ! window.kWidget ){
	window.kWidget = {};
}

( function( kWidget ) {
	// Setup local vars
	var wid, entryId, partnerId, callback;

	var protocol = location.protocol.substr(0, location.protocol.length-1);

	// Set the service url based on protocol type
	var serviceUrl;
	if( protocol == 'https' ){
		serviceUrl = 'https://www.kaltura.com';
	} else {
		serviceUrl = 'http://cdnbakmi.kaltura.com';
	}
	var exportedCallback;

	// Add master exported function:
	kWidget.getSources = function( settings ){
		wid = '_' + settings.partnerId;
		entryId = settings.entryId;
		partnerId = settings.partnerId;
		callback = settings.callback;
		addScript('http://cdnapi.kaltura.com/api_v3/index.php?service=multirequest&format=9&1:service=session' +
				'&1:action=startWidgetSession&1:widgetId=' + wid +
				'&2:service=flavorasset&2:action=getByEntryId&2:ks={1:result:ks}&2:entryId=' + entryId +
				'&3:service=baseEntry&3:action=get&3:ks={1:result:ks}&3:entryId=' + entryId +
				'&callback=kWidget.getSourcesCallback'
		);
	};

	// Note we use a local pre-defined callback to enable cdn cache
	kWidget.getSourcesCallback = function( result ){
		// check for response object:
		if( !result[1] || !result[0]){
			console.log( "Error no flavor result" );
			return ;
		}
		var ks = result[0]['ks'];
		var ipadAdaptiveFlavors = [];
		var iphoneAdaptiveFlavors = [];
		var deviceSources = [];

		var baseUrl = serviceUrl + '/p/' + partnerId +
				'/sp/' + partnerId + '00/playManifest';
		for( var i in result[1] ){
			var asset = result[1][i];
			// Continue if clip is not ready (2)
			if( asset.status != 2  ) {
				continue;
			}
			// Setup a source object:
			var source = {
				'data-bitrate' : asset.bitrate * 8,
				'data-width' : asset.width,
				'data-height' : asset.height
			};


			var src  = baseUrl + '/entryId/' + asset.entryId;
			// Check if Apple http streaming is enabled and the tags include applembr ( single stream HLS )
			if( asset.tags.indexOf('applembr') != -1 ) {
				src += '/format/applehttp/protocol/'+ protocol + '/a.m3u8';

				deviceSources.push({
					'data-flavorid' : 'AppleMBR',
					'type' : 'application/vnd.apple.mpegurl',
					'src' : src
				});

				continue;
			} else {
				src += '/flavorId/' + asset.id + '/format/url/protocol/' + protocol;
			}

			// add the file extension:
			if( asset.tags.toLowerCase().indexOf('ipad') != -1 ){
				source['src'] = src + '/a.mp4';
				source['data-flavorid'] = 'iPad';
				source['type'] = 'video/h264';
			}

			// Check for iPhone src
			if( asset.tags.toLowerCase().indexOf('iphone') != -1 ){
				source['src'] = src + '/a.mp4';
				source['data-flavorid'] = 'iPhone';
				source['type'] = 'video/h264';
			}

			// Check for ogg source
			if( asset.fileExt.toLowerCase() == 'ogg'
				||
				asset.fileExt.toLowerCase() == 'ogv'
				||
				asset.containerFormat.toLowerCase() == 'ogg'
			){
				source['src'] = src + '/a.ogg';
				source['data-flavorid'] = 'ogg';
				source['type'] = 'video/ogg';
			}

			// Check for webm source
			if( asset.fileExt == 'webm'
				||
				asset.tags.indexOf('webm') != -1
				|| // Kaltura transcodes give: 'matroska'
				asset.containerFormat.toLowerCase() == 'matroska'
				|| // some ingestion systems give "webm"
				asset.containerFormat.toLowerCase() == 'webm'
			){
				source['src'] = src + '/a.webm';
				source['data-flavorid'] = 'webm';
				source['type'] = 'video/webm';
			}

			// Check for 3gp source
			if( asset.fileExt == '3gp' ){
				source['src'] = src + '/a.3gp';
				source['data-flavorid'] = '3gp'
				source['type'] = 'video/3gp';
			}

			// Add the device sources
			if( source['src'] ){
				deviceSources.push( source );
			}

			// Check for adaptive compatible flavor:
			if( asset.tags.toLowerCase().indexOf('ipadnew') != -1 ){
				ipadAdaptiveFlavors.push( asset.id );
			}
			if( asset.tags.toLowerCase().indexOf('iphonenew') != -1 ){
				iphoneAdaptiveFlavors.push( asset.id );
			}

		};
		// Add the flavor list adaptive style urls ( multiple flavor HLS ):
		// Create iPad flavor for Akamai HTTP
		if( ipadAdaptiveFlavors.length != 0 ) {
			deviceSources.push({
				'data-flavorid' : 'iPadNew',
				'type' : 'application/vnd.apple.mpegurl',
				'src' : baseUrl + '/entryId/' + asset.entryId + '/flavorIds/' + ipadAdaptiveFlavors.join(',')  + '/format/applehttp/protocol/' + protocol + '/a.m3u8'
			});
		}
		// Create iPhone flavor for Akamai HTTP
		if(iphoneAdaptiveFlavors.length != 0 ) {
			deviceSources.push({
				'data-flavorid' : 'iPhoneNew',
				'type' : 'application/vnd.apple.mpegurl',
				'src' : baseUrl + '/entryId/' + asset.entryId + '/flavorIds/' + iphoneAdaptiveFlavors.join(',')  + '/format/applehttp/protocol/' + protocol + '/a.m3u8'
			});
		}

		for( var j in deviceSources ){
			// Don't add the ks ( results in expired streams )
			if( ks ) {
				//deviceSources[j]['src'] += '?ks=' + ks +'&referrer=' + base64_encode( document.URL );
			}
		}
		// callback with device sources, poster
		callback({
			'poster': result[2]['thumbnailUrl'],
			'duration': result[2]['duration'],
			'name': result[2]['name'],
			'entryId' :  result[2]['id'],
			'description': result[2]['description'],
			'sources': deviceSources
		});
	};

	function addScript( url ){
		var script = document.createElement( 'script' );
		script.type = 'text/javascript';
		script.src = url;
		document.getElementsByTagName('head')[0].appendChild( script );
	}

	function base64_encode (data) {
	    // http://kevin.vanzonneveld.net
	    // +   original by: Tyler Akins (http://rumkin.com)
	    // +   improved by: Bayron Guevara
	    // +   improved by: Thunder.m
	    // +   improved by: Kevin van Zonneveld (http://kevin.vanzonneveld.net)
	    // +   bugfixed by: Pellentesque Malesuada
	    // +   improved by: Kevin van Zonneveld (http://kevin.vanzonneveld.net)
	    // +   improved by: Rafał Kukawski (http://kukawski.pl)
	    // -    depends on: utf8_encode
	    // *     example 1: base64_encode('Kevin van Zonneveld');
	    // *     returns 1: 'S2V2aW4gdmFuIFpvbm5ldmVsZA=='
	    // mozilla has this native
	    // - but breaks in 2.0.0.12!
	    //if (typeof this.window['atob'] == 'function') {
	    //    return atob(data);
	    //}
	    var b64 = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=";
	    var o1, o2, o3, h1, h2, h3, h4, bits, i = 0,
		ac = 0,
		enc = "",
		tmp_arr = [];

	    if (!data) {
		return data;
	    }

	    data = utf8_encode(data + '');

	    do { // pack three octets into four hexets
		o1 = data.charCodeAt(i++);
		o2 = data.charCodeAt(i++);
		o3 = data.charCodeAt(i++);

		bits = o1 << 16 | o2 << 8 | o3;

		h1 = bits >> 18 & 0x3f;
		h2 = bits >> 12 & 0x3f;
		h3 = bits >> 6 & 0x3f;
		h4 = bits & 0x3f;

		// use hexets to index into b64, and append result to encoded string
		tmp_arr[ac++] = b64.charAt(h1) + b64.charAt(h2) + b64.charAt(h3) + b64.charAt(h4);
	    } while (i < data.length);

	    enc = tmp_arr.join('');

	    var r = data.length % 3;

	    return (r ? enc.slice(0, r - 3) : enc) + '==='.slice(r || 3);
	}

	function utf8_encode (argString) {
	    // http://kevin.vanzonneveld.net
	    // +   original by: Webtoolkit.info (http://www.webtoolkit.info/)
	    // +   improved by: Kevin van Zonneveld (http://kevin.vanzonneveld.net)
	    // +   improved by: sowberry
	    // +    tweaked by: Jack
	    // +   bugfixed by: Onno Marsman
	    // +   improved by: Yves Sucaet
	    // +   bugfixed by: Onno Marsman
	    // +   bugfixed by: Ulrich
	    // +   bugfixed by: Rafal Kukawski
	    // *     example 1: utf8_encode('Kevin van Zonneveld');
	    // *     returns 1: 'Kevin van Zonneveld'

	    if (argString === null || typeof argString === "undefined") {
	        return "";
	    }

	    var string = (argString + ''); // .replace(/\r\n/g, "\n").replace(/\r/g, "\n");
	    var utftext = "",
	        start, end, stringl = 0;

	    start = end = 0;
	    stringl = string.length;
	    for (var n = 0; n < stringl; n++) {
	        var c1 = string.charCodeAt(n);
	        var enc = null;

	        if (c1 < 128) {
	            end++;
	        } else if (c1 > 127 && c1 < 2048) {
	            enc = String.fromCharCode((c1 >> 6) | 192) + String.fromCharCode((c1 & 63) | 128);
	        } else {
	            enc = String.fromCharCode((c1 >> 12) | 224) + String.fromCharCode(((c1 >> 6) & 63) | 128) + String.fromCharCode((c1 & 63) | 128);
	        }
	        if (enc !== null) {
	            if (end > start) {
	                utftext += string.slice(start, end);
	            }
	            utftext += enc;
	            start = end = n + 1;
	        }
	    }

	    if (end > start) {
	        utftext += string.slice(start, stringl);
	    }

	    return utftext;
	}

} )( window.kWidget );
