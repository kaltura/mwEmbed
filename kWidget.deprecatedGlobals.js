(function(mw, kWidget){
	
	kWidget.deprecatedGlobals = function(){
		var globalFunctionMap = {
				'kIsIOS': 'isIOS',
				'kSupportsHTML5': 'supportsHTML5',
				'kGetFlashVersion': 'getFlashVersion',
				'kSupportsFlash': 'supportsFlash',
				'kalturaIframeEmbed': 'embed',
				'kOutputFlashObject': 'outputFlashObject',
				'kIsHTML5FallForward': 'isHTML5FallForward',
				'kIframeWithoutApi': 'outputIframeWithoutApi',
				'kDirectDownloadFallback': 'outputDirectDownload',
				'kGetKalturaEmbedSettings': 'getEmbedSetting',
				'kGetKalturaPlayerList': 'getKalutaObjectList',
				'kCheckAddScript': 'rewriteObjectTags'
		}
		for( var gName in globalFunctionMap ){
			window[ gName ] = function(){
				kWidget.log( gName + ' is deprecated. Please use kWidget.' + globalFunctionMap[ gName] );
				var args = Array.prototype.slice.call( arguments, 0 );
				return kWidget[ globalFunctionMap[ gName] ].apply(this, args );
			}
		}
	}
	// Add all the deprecated globals:
	kWidget.deprecatedGlobals();
	
})( window.mw, window.kWidget );