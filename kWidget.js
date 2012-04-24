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
			// once the flash object is in the page restore KDP callback
			if( settings.uiconf_id ) {
				restoreKalturaKDPCallback();
			}
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
				$.extend( targetCss, additionalTargetCss );
				$('#' + targetId ).css( targetCss );
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
		if(!options)
			options = {};

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

		var thumbSrc = kWidget.getKalturaThumbUrl({
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
	 * Search the DOM for Object tags and rewrite them if they should be rewritten.
	 * 
	 * rewrite rules include: 
	 * * userAgentRules
	 * * forceMobileHTML5 flag
	 * * 
	 */
	rewriteObjectTags: function() {
		// get the list of object tags to be rewritten: 
		var playerList = kWidget.getKalutaObjectList();
		var _this = this;

		debugger;
		// Check if we need to load UiConf JS
		if( this.isMissingUiConfJs( playerList ) ){
			// Load uiConfJS then re call the rewriteObjectTags method: 
			this.loadUiConfJs( playerList, function(){
				_this.rewriteObjectTags();
			})
			return ;
		}
		
		// Set url based config ( as long as it not disabled ) 
		// TODO move me. 
		if( mw.getConfig( 'disableForceMobileHTML5') ){
			mw.setConfig( 'forceMobileHTML5', false );
		}
		
		// Check if we have player rules and then issue kAddScript call
		if( window.kUserAgentPlayerRules ){
			kAddScript();
			return ;
		}

		/**
		 * If Kaltura.AllowIframeRemoteService is not enabled force in page rewrite:
		 */
		var serviceUrl = mw.getConfig('Kaltura.ServiceUrl');
		if( ! mw.getConfig( 'Kaltura.AllowIframeRemoteService' ) ) {
			if( ! serviceUrl || serviceUrl.indexOf( 'kaltura.com' ) === -1 ){
				// if not hosted on kaltura for now we can't use the iframe to load the player
				mw.setConfig( 'Kaltura.IframeRewrite', false );
				mw.setConfig( 'Kaltura.UseManifestUrls', false);
			}
		}

		// If user javascript is using mw.ready add script
		if( window.preMwEmbedReady.length ) {
			kAddScript();
			return ;
		}
		if( ! mw.getConfig( 'Kaltura.ForceFlashOnDesktop' )
				&&
			( mw.getConfig( 'Kaltura.LoadScriptForVideoTags' ) && kPageHasAudioOrVideoTags()  )
		){
			kAddScript();
			return ;
		}
		
		// If document includes kaltura embed tags && isMobile safari:
		if ( kWidget.isHTML5FallForward()
				&&
			playerList.length
		) {
			// Check for Kaltura objects in the page
			kAddScript();
			return ;
		}

		// Check if no flash and no html5 and no forceFlash ( direct download link )
		// for debug purpose:
		// kSupportsFlash = function() {return false}; kWidget.supportsHTML5 = function() {return false};
		if( ! kWidget.supportsFlash() && ! kWidget.supportsHTML5() && ! mw.getConfig( 'Kaltura.ForceFlashOnDesktop' ) ){
			kAddScript();
			return ;
		}
		// Restore the jsCallbackReady ( we are not rewriting )
		if( playerList.length && window.restoreKalturaKDPCallback ){
			window.restoreKalturaKDPCallback();
		}
	},
	/**
	 * Check if any player is missing uiConf javascript: 
	 */
	uiConfScriptLoadList: {},
	isMissingUiConfJs: function( playerList ){
		// Check if we need to load uiConfJs 
		if( playerList.length == 0 || 
			! mw.getConfig( 'Kaltura.EnableEmbedUiConfJs' ) || 
			mw.getConfig('EmbedPlayer.IsIframeServer') )
		{
			return false;
		}
		for( var i =0; i < playerList.length; i++ ){
			var settings = playerList[i].kEmbedSettings;
			if( !uiConfScriptLoadList[ settings.uiconf_id  ] ){
				return true;
			}
		}
		return false;
	},
	/** 
	 * Loads the uiConf js for 
	 */
	loadUiConfJs: function( playerList, callback ){
		var _this = this;
		// We have not yet loaded uiConfJS... load it for each ui_conf id
		var baseUiConfJsUrl = SCRIPT_LOADER_URL.replace( 'ResourceLoader.php', 'services.php?service=uiconfJs');
		if( !this.isMissingUiConfJs( playerList ) ){
			// called with empty request set: 
			callback();
			return ;
		}
		for( var i=0;i < playerList.length; i++){
			// Create a local scope for the current uiconf_id: 
			(function( settings ){
				if( uiConfScriptLoadList[ settings.uiconf_id ] ){
					// player ui conf js is already loaded skip: 
					return ;
				}
				kAppendScriptUrl( baseUiConfJsUrl + kEmbedSettingsToUrl( settings ), function(){
					uiConfScriptLoadList[ settings.uiconf_id ] = true;
					if( ! _this.isMissingUiConfJs( playerList ) ){
						callback();
					} else {
						// still missing uiConf for some entry assume we will load for them
					}
				});
			})( playerList[i].kEmbedSettings );
		}
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
		if( navigator.userAgent.indexOf('BlackBerry') != -1 ){
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
	 },
	 
	 /**
	  * Get Kaltura thumb url from entry object
	  */
	 getKalturaThumbUrl: function ( entry ){
	 	if( entry.width == '100%')
	 		entry.width = 400;
	 	if( entry.height == '100%')
	 		entry.height = 300;

	 	var ks = ( entry.ks ) ? '?ks=' + entry.ks : '';

	 	// Support widget_id based thumbs: 
	 	if( entry.widget_id && ! entry.partner_id ){
	 		entry.partner_id = entry.widget_id.substr(1);
	 	}
	 	
	 	return mw.getConfig('Kaltura.CdnUrl') + '/p/' + entry.partner_id + '/sp/' +
	 		entry.partner_id + '00/thumbnail/entry_id/' + entry.entry_id + '/width/' +
	 		parseInt(entry.width) + '/height/' + parseInt(entry.height) + ks;
	 },
	 
	 /**
	  * Get kaltura embed settings from a swf url and flashvars object
	  *
	  * @param {string} swfUrl
	  * 	url to kaltura platform hosted swf
	  * @param {object} flashvars
	  * 	object mapping kaltura variables, ( overrides url based variables )
	  */
	 getEmbedSettings: function( swfUrl, flashvars ){
	 	var embedSettings = {};	
	 	// Convert flashvars if in string format:
	 	if( typeof flashvars == 'string' ){
	 		flashvars = kFlashVars2Object( flashvars );
	 	}
	 	
	 	if( !flashvars ){
	 		flashvars= {};
	 	}

	 	var trim = function ( str ) {
	 		return str.replace(/^\s+|\s+$/g,"");
	 	}
	 	
	 	// Include flashvars
	 	embedSettings.flashvars = flashvars;	
	 	var dataUrlParts = swfUrl.split('/');
	 	
	 	// Search backward for key value pairs
	 	var prevUrlPart = null;
	 	while( dataUrlParts.length ){
	 		var curUrlPart =  dataUrlParts.pop();
	 		switch( curUrlPart ){
	 			case 'p':
	 				embedSettings.wid = '_' + prevUrlPart;
	 				embedSettings.p = prevUrlPart;
	 			break;
	 			case 'wid':
	 				embedSettings.wid = prevUrlPart;
	 				embedSettings.p = prevUrlPart.replace(/_/,'');
	 			break;
	 			case 'entry_id':
	 				embedSettings.entry_id = prevUrlPart;
	 			break;
	 			case 'uiconf_id': case 'ui_conf_id':
	 				embedSettings.uiconf_id = prevUrlPart;
	 			break;
	 			case 'cache_st':
	 				embedSettings.cache_st = prevUrlPart;
	 			break;
	 		}
	 		prevUrlPart = trim( curUrlPart );
	 	}
	 	// Add in Flash vars embedSettings ( they take precedence over embed url )
	 	for( var key in flashvars ){
	 		var val = flashvars[key];
	 		var key = key.toLowerCase();
	 		// Normalize to the url based settings: 
	 		if( key == 'entryid' ){
	 			embedSettings.entry_id = val;
	 		}
	 		if(  key == 'uiconfid' ){
	 			embedSettings.uiconf_id = val;
	 		}
	 		if( key == 'widgetid' || key == 'widget_id' ){
	 			embedSettings.wid = val;
	 			embedSettings.p = val.replace(/_/,'');
	 		}	
	 		if( key == 'partnerid' ||  key == 'partner_id'){
	 			embedSettings.wid = '_' + val;
	 			embedSettings.p = val;
	 		}
	 		if( key == 'referenceid' ){
	 			embedSettings.reference_id = val;
	 		}
	 	}

	 	// Always pass cache_st
	 	if( ! embedSettings.cache_st ){
	 		embedSettings.cache_st = 1;
	 	}
	 	
	 	return embedSettings;
	 },
	 
	 /**
	  * Get the list of embed objects on the page that are 'kaltura players'
	  */
	 getKalutaObjectList: function(){
	 	var kalturaPlayerList = [];
	 	// Check all objects for kaltura compatible urls 
	 	var objectList = document.getElementsByTagName('object');
	 	if( !objectList.length && document.getElementById('kaltura_player') ){
	 		objectList = [ document.getElementById('kaltura_player') ];
	 	}
	 	// local function to attempt to add the kalturaEmbed
	 	var tryAddKalturaEmbed = function( url , flashvars){
	 		var settings = kWidget.getEmbedSettings( url, flashvars );
	 		if( settings && settings.uiconf_id && settings.wid ){
	 			objectList[i].kEmbedSettings = settings;
	 			kalturaPlayerList.push(  objectList[i] );
	 			return true;
	 		}
	 		return false;
	 	};
	 	for( var i =0; i < objectList.length; i++){
	 		if( ! objectList[i] ){
	 			continue;
	 		}
	 		var swfUrl = '';
	 		var flashvars = {};
	 		var paramTags = objectList[i].getElementsByTagName('param');
	 		for( var j = 0; j < paramTags.length; j++){
	 			var pName = paramTags[j].getAttribute('name').toLowerCase();
	 			var pVal = paramTags[j].getAttribute('value');
	 			if( pName == 'data' ||	pName == 'src' || pName == 'movie' ) {
	 				swfUrl =  pVal;
	 			}
	 			if( pName == 'flashvars' ){
	 				flashvars =	kFlashVars2Object( pVal );
	 			}
	 		}

	 		if( tryAddKalturaEmbed( swfUrl, flashvars) ){
	 			continue;
	 		}

	 		// Check for object data style url: 
	 		if( objectList[i].getAttribute('data') ){
	 			if( tryAddKalturaEmbed( objectList[i].getAttribute('data'), flashvars ) ){
	 				continue;
	 			}
	 		}
	 	}
	 	return kalturaPlayerList;
	 }
};

// Export to kWidget and KWidget ( official name is camel case kWidget )
window.KWidget = kWidget;
window.kWidget = kWidget;
 
})();
