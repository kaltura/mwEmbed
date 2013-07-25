/**
 * Stand alone source grabber.
 */

if( ! window.kWidget ){
	window.kWidget = {};
}
( function( kWidget ) {
	// Add master exported function:
	kWidget.getSources = function( settings ){
		new kWidget.api( { 'wid' : '_' + settings.partnerId } )
		.doRequest([
			{
				'service': 'flavorasset',
				'action': 'getByEntryId',
				'entryId': settings.entryId
			},
			{
				'service': 'baseEntry',
				'action' : 'get',
				'entryId' : settings.entryId
			}
		], function( result ){ // API result
			// check for response object:
			if( !result[1] || !result[0]){
				console.log( "Error no flavor result" );
				return ;
			}
			var ks = result[0]['ks'];
			var ipadAdaptiveFlavors = [];
			var iphoneAdaptiveFlavors = [];
			var deviceSources = [];
			var protocol = location.protocol.substr(0, location.protocol.length-1);
			// Set the service url based on protocol type
			var serviceUrl;
			if( protocol == 'https' ){
				serviceUrl = 'https://www.kaltura.com';
			} else {
				serviceUrl = 'http://cdnbakmi.kaltura.com';
			}
	
			var baseUrl = serviceUrl + '/p/' + settings.partnerId +
					'/sp/' + settings.partnerId + '00/playManifest';
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
				if( asset.fileExt &&
					( 
						asset.fileExt.toLowerCase() == 'ogg'
						||
						asset.fileExt.toLowerCase() == 'ogv'
						||
						asset.containerFormat.toLowerCase() == 'ogg' 
					)
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
	
			// callback with device sources, poster
			if( settings.callback ){
				settings.callback({
					'poster': result[2]['thumbnailUrl'],
					'duration': result[2]['duration'],
					'name': result[2]['name'],
					'entryId' :  result[2]['id'],
					'description': result[2]['description'],
					'sources': deviceSources
				});
			}
		});
	};
} )( window.kWidget );
