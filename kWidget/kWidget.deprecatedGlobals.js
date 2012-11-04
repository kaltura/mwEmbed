(function(mw, kWidget){

	kWidget.deprecatedGlobals = function(){
		// Note not all these were likely to be used externally,
		// we can more aggressively remove in a later library version.
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
				'kCheckAddScript': 'rewriteObjectTags',
				'kAddScript' : 'loadHTML5Lib',
				'kPageHasAudioOrVideoTags' : 'pageHasAudioOrVideoTags',
				'kLoadJsRequestSet' : 'loadRequestSet',
				'kOverideJsFlashEmbed' : 'overrideFlashEmbedMethods',
				'kDoIframeRewriteList' : 'embedFromObjects',
				'kEmbedSettingsToUrl' : 'embedSettingsToUrl',
				'kGetAdditionalTargetCss' : 'getAdditionalTargetCss',
				'kAppendCssUrl' : 'appendCssUrl',
				'kAppendScriptUrl' : 'appendScriptUrl',
				'kFlashVars2Object' : 'flashVars2Object',
				'kFlashVarsToUrl' : 'flashVarsToUrl',
				'kFlashVarsToString' : 'flashVarsToString',
				'kServiceConfigToUrl' : 'serviceConfigToUrl',
				'kRunMwDomReady': 'rewriteObjectTags',
				// fully deprecated ( have no purpose any more )
				'restoreKalturaKDPCallback': false
		}
		for( var gName in globalFunctionMap ){
			(function( gName ){
				window[ gName ] = function(){
					// functions that have no server any purpose
					if( globalFunctionMap[ gName] === false ){
						kWidget.log( gName + ' is deprecated. This method no longer serves any purpose.' );
						return ;
					}
					kWidget.log( gName + ' is deprecated. Please use kWidget.' + globalFunctionMap[ gName] );
					var args = Array.prototype.slice.call( arguments, 0 );
					if( typeof kWidget[ globalFunctionMap[ gName] ] != 'function' ){
						kWidget.log( "Error kWidget missing method: " + globalFunctionMap[ gName] );
						return ;
					}
					return kWidget[ globalFunctionMap[ gName ] ].apply( kWidget, args );
				}
			})( gName );
		}
	}
	// Add all the deprecated globals:
	kWidget.deprecatedGlobals();

})( window.mw, window.kWidget );