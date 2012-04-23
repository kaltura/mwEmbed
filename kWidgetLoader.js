/**
 * KWidget static object.
 * Will eventually host all the loader logic.
 */
(function(){
	
// Use strict ECMAScript 5
"use strict";

var kWidget = {
	// Stores widgets that are ready:
	readyWidgets: {},

	// First ready callback issued
	readyCallbacks: [],

	/**
	 * The base embed method
	 * TODO move kalturaIframeEmbed to this method and have kalturaIframeEmbed call KWidget.embed :
	 */
	embed: function( targetId, settings ){
		window.checkForKDPCallback();
		// Supports passing settings object as the first parameter
		if( typeof targetId === 'object' ) {
			settings = targetId;
			if( ! settings.targetId ) {
				console.log('Error: Missing target element Id');
			}
			targetId = settings.targetId;
		}
		if( settings.readyCallback ){
			// Only add the ready callback for the current targetId being rewritten.
			this.addReadyCallback( function( videoId ){
				if( targetId == videoId ){
					settings.readyCallback( videoId );
				}
			});
		}

		// Empty the replace target:
		var elm = document.getElementById( targetId );
		if( ! elm ){
			return false; // No target found ( probably already done )
		}
		try {
			elm.innerHTML = '';
		} catch ( e ){
			// could not clear inner html
		}
		// Don't rewrite special key kaltura_player_iframe_no_rewrite
		if( elm.getAttribute('name') == 'kaltura_player_iframe_no_rewrite' ){
			return ;
		}

		var uiconf_id = settings.uiconf_id;
		settings.isHTML5 = kWidget.isHTML5FallForward();
		// Check if we even need to rewrite the page at all
		// Evaluate per user agent rules:
		if( uiconf_id && window.kUserAgentPlayerRules && kUserAgentPlayerRules[ uiconf_id ]){
			var playerAction = window.checkUserAgentPlayerRules( kUserAgentPlayerRules[ uiconf_id ] );
			// Default play mode, if here and really using flash remap:
			switch( playerAction.mode ){
				case 'flash':
					if( !kWidget.isHTML5FallForward() && elm.nodeName.toLowerCase() == 'object'){
						restoreKalturaKDPCallback();
						return ;
					}
				break;
				case 'leadWithHTML5':
					settings.isHTML5 = kWidget.supportsHTML5();
					break;
				case 'forceMsg':
					var msg = playerAction.val;
					// write out a message:
					if( elm && elm.parentNode ){
						var divTarget = document.createElement("div");
						divTarget.innerHTML = unescape( msg );
						elm.parentNode.replaceChild( divTarget, elm );
					}
					break;
			}
			// Clear out any kUserAgentPlayerRules
			// XXX Ugly hack to recall AddScript ( loader is in desperate need of a refactor )
			window.kUserAgentPlayerRules = false;
			window.kAddedScript = false;
		}

		// Check if we are dealing with an html5 player or flash player or direct download
		if( ! kWidget.supportsFlash() && ! kWidget.supportsHTML5() && ! mw.getConfig( 'Kaltura.ForceFlashOnDesktop' ) ) {
			kWidget.outputDirectDownload( targetId, settings );
			return ;
		}
		if( settings.isHTML5 ){
			kWidget.outputHTML5Iframe( targetId, settings );
			return ;
		} else {
			if( settings.uiconf_id ) {
				// We directly restore the KDP callback because a cached output of the flashObject, 
				// seems to run into too much recursion errors. 
				restoreKalturaKDPCallback();
			}			
			kWidget.outputFlashObject( targetId, settings );
			return ;
		}
	},

	/*
	 * Create flash object tag
	 */
	outputFlashObject: function( targetId, settings ) {
		var elm = document.getElementById( targetId );
		if( !elm && !elm.parentNode ){
			kWidget.log( "Error embed target missing" );
			return ;
		}
		
		// only generate a swf source if not defined. 
		if( !settings.src ){
			var swfUrl = mw.getConfig( 'Kaltura.ServiceUrl' ) + '/index.php/kwidget'+
				'/wid/' + settings.wid +
				'/uiconf_id/' + settings.uiconf_id;
		
			if( settings.entry_id ){
				swfUrl+= '/entry_id/' + settings.entry_id;
			}
			if( settings.cache_st ){
				swfUrl+= '/cache_st/' + settings.cache_st;
			}
			settings['src'] = swfUrl;
		}
		settings['id'] = elm.id;
		// update the container id: 
		elm.setAttribute( 'id', elm.id + '_container' );
		
		// Output a normal flash object tag:
		var spanTarget = document.createElement("span");
		var pId =  ( settings.id )? settings.id : elm.id
		
		// Get height/width embedSettings, attribute, style ( percentage or px ), or default 400x300
		var width = ( settings.width ) ? settings.width :
						( elm.width ) ? elm.width :
							( elm.style.width ) ? parseInt( elm.style.width ) : 400;

		var height = ( settings.height ) ? settings.height :
						( elm.height ) ? elm.height :
							( elm.style.height ) ? parseInt( elm.style.height ) : 300;

		var flashvarValue = ( settings.flashvars ) ? kFlashVarsToString( settings.flashvars ) : '&';

		// we may have to borrow more from:
		// http://code.google.com/p/swfobject/source/browse/trunk/swfobject/src/swfobject.js#407
		// There seems to be issue with passing all the flashvars in playlist context.

		var defaultParamSet = {
			'allowFullScreen': 'true',
			'allowNetworking': 'all',
			'allowScriptAccess': 'always',
			'bgcolor': '#000000'
		};

		var output = '<object width="' + width +
				'" height="' + height +
				'" style="width:' + width + 'px;height:' + height + 'px;' +
				'" id="' + targetId +
				'" name="' + targetId + '"';

		output += ' data="' + settings['src'] + '" type="application/x-shockwave-flash"';
		if( window.ActiveXObject ){
			output += ' classid="clsid:D27CDB6E-AE6D-11cf-96B8-444553540000"';
		}
		output += '>';

		output += '<param name="movie" value="' + settings['src'] + '" />';
		output += '<param name="flashvars" value="' + flashvarValue + '" />';

		for (var key in defaultParamSet) {
			if (defaultParamSet[key]) {
				output += '<param name="'+ key +'" value="'+ defaultParamSet[key] +'" />';
			}
		}
		output += "</object>";

		// Use local function to output contents to work around some browser bugs 
		var outputElemnt = function(){
			// update the target:
			elm.parentNode.replaceChild( spanTarget, elm );
			spanTarget.innerHTML = output;
		}
		// XXX IE9 about 1/2 the time on fresh loads does not fire the jsCallbackready 
		//     when you dynamically embed the flash object before dom ready.   
		// XXX firefox with firebug enabled locks up the browser 
		// For 1.7 we should see if we can avoid waiting for domReady with flashvar based callback. 
		// note this is true for either flashembed or the object insert method bellow. 
		// detect firebug: 
		if ( window.console && ( window.console.firebug || window.console.exception ) ) {
			console.log( 'Warning firebug + firefox and dynamic flash kdp embed causes lockups in firefox' + 
					', ( delaying embed )');
			kAddReadyHook( function(){
				setTimeout(function(){
					outputElemnt();
				}, 2000);
			});
		} else {
			// IE needs to wait till dom ready
			if( navigator.userAgent.indexOf("MSIE") != -1 ){
				setTimeout(function(){ // MSIE fires DOM ready early sometimes
					outputElemnt();
				},0);
			} else {
				outputElemnt();
			}
		}
		
	},

	outputHTML5Iframe: function( targetId, settings ) {
		var elm = document.getElementById( targetId );
		// Check for html with api off:
		if( ! mw.getConfig( 'EmbedPlayer.EnableIframeApi') ||
			( window.jQuery && !mw.versionIsAtLeast( '1.3.2', jQuery.fn.jquery ) )
		){
			kWidget.log( 'Kaltura HTML5 works best with jQuery 1.3.2 or above' );
			kWidget.outputIframeWithoutApi( targetId, settings );
			return ;
		} else {
			// Output HTML5 IFrame with API
			kAddScript( function(){

				var width = ( settings.width ) ? settings.width :
							$( elm ).width() ? $( elm ).width() : 400;

				var height = ( settings.height ) ? settings.height :
							$( elm ).height() ? $( elm ).height() : 300;

				var sizeUnit = (typeof width == 'string' && width.indexOf("px") === -1 && width.indexOf("%") === -1 ) ? 'px' : '';

				var targetCss = {
					'width': width + sizeUnit,
					'height': height + sizeUnit
				};

				var additionalTargetCss = kGetAdditionalTargetCss();
				$.extend(targetCss, additionalTargetCss);
				$('#' + targetId ).css(targetCss);
				// Do kaltura iframe player
				$('#' + targetId ).kalturaIframePlayer( settings );
			});
		}
	},

	outputIframeWithoutApi: function( replaceTargetId, kEmbedSettings ) {
		var iframeSrc = SCRIPT_LOADER_URL.replace( 'ResourceLoader.php', 'mwEmbedFrame.php' );
		iframeSrc += '?' + kEmbedSettingsToUrl( kEmbedSettings );

		// If remote service is enabled pass along service arguments:
		if( mw.getConfig( 'Kaltura.AllowIframeRemoteService' ) &&
			(
				mw.getConfig("Kaltura.ServiceUrl").indexOf('kaltura.com') === -1 &&
				mw.getConfig("Kaltura.ServiceUrl").indexOf('kaltura.org') === -1
			)
		){
			iframeSrc += kServiceConfigToUrl();
		}

		// add the forceMobileHTML5 to the iframe if present on the client:
		if( mw.getConfig( 'forceMobileHTML5' ) ){
			iframeSrc += '&forceMobileHTML5=true';
		}
		if( mw.getConfig('debug') ){
			iframeSrc += '&debug=true';
		}

		// Also append the script version to purge the cdn cache for iframe:
		iframeSrc += '&urid=' + KALTURA_LOADER_VERSION;

		var targetNode = document.getElementById( replaceTargetId );
		var parentNode = targetNode.parentNode;
		var iframe = document.createElement('iframe');
		iframe.src = iframeSrc;
		iframe.id = replaceTargetId;
		iframe.width = (kEmbedSettings.width) ? kEmbedSettings.width.replace(/px/, '' ) : '100%';
		iframe.height = (kEmbedSettings.height) ? kEmbedSettings.height.replace(/px/, '' ) : '100%';
		iframe.style.border = '0px';
		iframe.style.overflow = 'hidden';

		parentNode.replaceChild( iframe, targetNode );
	},

	outputDirectDownload: function( replaceTargetId, kEmbedSettings ) {

		// Empty the replace target:
		var targetNode = document.getElementById( replaceTargetId );
		if( ! targetNode ){
				kWidget.log( "Error could not find object target: " + replaceTargetId );
		}
		// remove all object children
		// use try/catch to fix ie issue
		try {
			targetNode.innerHTML = '';
		} catch (e) {
			//alert(e);
		}
		//while ( targetNode.hasChildNodes() ) {
		//   targetNode.removeChild( targetNode.lastChild );
		//}
		if( typeof options == 'undefined' ) {
			var options = {};
		}
		// look some other places for sizes:
		if( !options.width && kEmbedSettings.width )
			options.width = kEmbedSettings.width;
		if( !options.height && kEmbedSettings.height )
			options.height = kEmbedSettings.height;
		if( !options.width && targetNode.style.width )
			options.width = targetNode.style.width;
		if( !options.height && targetNode.style.height )
			options.height = targetNode.style.height;
		if( !options.height )
			options.height = 300;
		if( !options.width )
			options.width = 400;

		// TODO: Add playEventUrl for stats
		var baseUrl = SCRIPT_LOADER_URL.replace( 'ResourceLoader.php', '' );
		var downloadUrl = baseUrl + 'modules/KalturaSupport/download.php/wid/' + kEmbedSettings.wid;

		// Also add the uiconf id to the url:
		if( kEmbedSettings.uiconf_id ){
			downloadUrl += '/uiconf_id/' + kEmbedSettings.uiconf_id;
		}

		if( kEmbedSettings.entry_id ) {
			downloadUrl += '/entry_id/'+ kEmbedSettings.entry_id;
		}

		var thumbSrc = mw.getKalturaThumbUrl({
			'entry_id' : kEmbedSettings.entry_id,
			'partner_id' : kEmbedSettings.p,
			'width' : parseInt( options.width),
			'height' : parseInt( options.height)
		});
		var playButtonUrl = baseUrl + 'skins/common/images/player_big_play_button.png';
		var playButtonCss = 'background: url(\'' + playButtonUrl + '\'); width: 70px; height: 53px; position: absolute; top:50%; left:50%; margin: -26px 0 0 -35px;';
		var ddId = 'dd_' + Math.random();

		var ddHTML = '<div id="' + ddId + '" style="width: ' + options.width + ';height:' + options.height + ';position:relative">' +
				'<img style="width:100%;height:100%" src="' + thumbSrc + '" >' +
				'<a href="' + downloadUrl + '" target="_blank" style="' + playButtonCss + '"></a>' +
				 '</div>';

		var parentNode = targetNode.parentNode;
		var div = document.createElement('div');
		div.style.width = options.width + 'px';
		div.style.height = options.height + 'px';

		div.innerHTML = ddHTML;
		parentNode.replaceChild( div, targetNode );

		// if failed, try appending after the node:
		if( ! document.getElementById( ddId ) ){
			parentNode.insertBefore( div, targetNode );
		}
	},
	/**
	 * Adds a ready callback to be called once the kdp or html5 player is ready
	 */
	addReadyCallback: function( readyCallback ){
		// issue the ready callback for any existing ready widgets:
		for( var playerId in this.readyWidgets ){
			// Make sure the widget is not already ready and is still in the dom:
			if( document.getElementById( playerId ) ){
				readyCallback( playerId );
			}
		}
		// Add the callback to the readyCallbacks array for any other players that become ready
		this.readyCallbacks.push( readyCallback );
	},
	/**
	 * Takes in the global ready callback events and adds them to the readyWidgets array
	 * @param playerId
	 * @return
	 */
	globalJsReadyCallback: function( playerId ){
		// issue the callback for all readyCallbacks
		for( var i = 0; i < this.readyCallbacks.length; i++ ){
			this.readyCallbacks[i]( playerId );
		}
		this.readyWidgets[ playerId ] = true;
	},

	/*
	 * Search the DOM for Object tags and rewrite them to Iframe if needed
	 */
	rewriteObjectTags: function() {
		// TODO: needs refactor ASAP!
		kAddedScript = false;
		kCheckAddScript();
	},

	/*
	 * Write log to console
	 */
	 log: function( msg ) {
		if( typeof console != 'undefined' && console.log ) {
			console.log( msg );
		}
	 },

	/**
	 * If the current player supports html5:
	 */
	supportsHTML5: function(){
		var dummyvid = document.createElement( "video" );
		// Blackberry does not really support html5
		if( ! kWidget.isBlackBerryHTML5Support() ){
			return false;
		}
		if( dummyvid.canPlayType ) {
			return true;
		}
		return false;
	},

	/*
	 * If the browser supports flash
	 */
	supportsFlash: function() {
		var version = this.getFlashVersion().split(',').shift();
		if( version < 10 ){
			return false;
		} else {
			return true;
		}
	},
	 /*
	  * Checks for flash version
	  */
	 getFlashVersion: function() {
		// navigator browsers:
		if (navigator.plugins && navigator.plugins.length) {
			try {
				if(navigator.mimeTypes["application/x-shockwave-flash"].enabledPlugin){
					return (navigator.plugins["Shockwave Flash 2.0"] || navigator.plugins["Shockwave Flash"]).description.replace(/\D+/g, ",").match(/^,?(.+),?$/)[1];
				}
			} catch(e) {}
		}
		// IE
		try {
			try {
				if( typeof ActiveXObject != 'undefined' ){
					// avoid fp6 minor version lookup issues
					// see: http://blog.deconcept.com/2006/01/11/getvariable-setvariable-crash-internet-explorer-flash-6/
					var axo = new ActiveXObject('ShockwaveFlash.ShockwaveFlash.6');
					try {
						axo.AllowScriptAccess = 'always';
					} catch(e) {
						return '6,0,0';
					}
				}
			} catch(e) {}
			return new ActiveXObject('ShockwaveFlash.ShockwaveFlash').GetVariable('$version').replace(/\D+/g, ',').match(/^,?(.+),?$/)[1];
		} catch(e) {}
		return '0,0,0';
	 },

	 /**
	  * Checks for iOS devices
	  **/
	 isIOS: function() {
		return ( (navigator.userAgent.indexOf('iPhone') != -1) ||
		(navigator.userAgent.indexOf('iPod') != -1) ||
		(navigator.userAgent.indexOf('iPad') != -1) );
	 },
	 
	 /*
	  * Checks for BlackBerry HTML5 support (version 7+)
	  */
	 isBlackBerryHTML5Support: function() {
		var ua = navigator.userAgent;
		if( ua.indexOf("BlackBerry") != -1 && ua.indexOf("Version/") != -1 ) {
			var verPosition = ua.indexOf("Version/") + 8;
            return ( parseInt(ua.substring(verPosition, verPosition + 3)) >= 7 ) ? true : false;
		}
		return false;
	 },

	 /*
	  * Fallforward by default prefers flash, uses html5 only if flash is not installed or not available
	  */
	 isHTML5FallForward: function() {
		// Check for a mobile html5 user agent:
		if ( kWidget.isIOS() || mw.getConfig( 'forceMobileHTML5' )  ){
			return true;
		}

		// Check for "Kaltura.LeadWithHTML5" attribute
		if( mw.getConfig( 'KalturaSupport.LeadWithHTML5' ) || mw.getConfig( 'Kaltura.LeadWithHTML5' ) ){
			return kWidget.supportsHTML5();
		}

		// Special check for Android:
		if( navigator.userAgent.indexOf('Android ') != -1 ){
			if( mw.getConfig( 'EmbedPlayer.UseFlashOnAndroid' )
				&&
				kWidget.supportsFlash()
			){
				// Use flash on Android if available
				return false;
			} else {
				// Android 2.x supports the video tag
				return true;
			}
		}

		// If the browser supports flash ( don't use html5 )
		if( kWidget.supportsFlash() ){
			return false;
		}

		// Check if the UseFlashOnDesktop flag is set and ( don't check for html5 )
		if( mw.getConfig( 'Kaltura.ForceFlashOnDesktop' ) ){
			return false;
		}

		// No flash return true if the browser supports html5 video tag with basic support for canPlayType:
		if( kWidget.supportsHTML5() ){
			return true;
		}
		// if we have the iframe enabled return true ( since the iframe will output a fallback link
		// even if the client does not support html5 or flash )
		if( mw.getConfig( 'Kaltura.IframeRewrite' ) ){
			return true;
		}

		// No video tag or flash, or iframe, normal "install flash" user flow )
		return false;
	 }
};
// Export to kWidget and KWidget
window.KWidget = kWidget;
window.kWidget = kWidget;
 
})();
