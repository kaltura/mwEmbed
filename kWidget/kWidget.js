/**
 * KWidget static object.
 * Will eventually host all the loader logic.  
 */
(function(){
	
// Use strict ECMAScript 5
"use strict";

// Don't re-initialize kWidget
if( window.kWidget ){
	return ;
}

var kWidget = {
		
	// Stores widgets that are ready:
	readyWidgets: {},

	// First ready callback issued
	readyCallbacks: [],

	// List of widgets that have been destroyed 
	destroyedWidgets: {},
	
	// List per Widget callback, for clean destroy
	perWidgetCallback: {},
	
	// Store the widget id ready callbacks in an array to avoid stacking on same id rewrite
	readyCallbackPerWidget: {},
	
	/**
	 * The master kWidget setup function setups up bindings for rewrites and 
	 * proxy of jsCallbackReady
	 * 
	 * MUST BE CALLED AFTER all of the mwEmbedLoader.php includes. 
	 */
	setup: function(){
		var _this = this;
		/**
		 *  Check the kWidget for environment settings and set appropriate flags
		 */
		this.checkEnvironment();

		/**
		 * Override flash methods, like swfObject, flashembed etc. 
		 * 
		 * NOTE for this override to work it your flash embed library must be included before mwEmbed
		 */
		this.overrideFlashEmbedMethods();

		/**
		 * Method call to proxy the jsCallbackReady
		 * 
		 * We try to proxy both at include time and at domReady time
		 */
		this.proxyJsCallbackready();
		this.domReady( function(){
			_this.proxyJsCallbackready();
		});

		/**
		 * Call the object tag rewrite, which will rewrite on-page object tags
		 */
		this.domReady( function(){ 
			_this.rewriteObjectTags();
		});
	},
	/**
	 * Checks the onPage environment context and sets appropriate flags.
	 */ 
	checkEnvironment: function(){

		// Note forceMobileHTML5 url flag be disabled by uiConf on the iframe side of the player
		// with: 
		if( document.URL.indexOf('forceMobileHTML5') !== -1 &&
			! mw.getConfig( 'disableForceMobileHTML5')
		){
			mw.setConfig( 'forceMobileHTML5', true );
		}
		
		var ua = navigator.userAgent;
		// Check if browser should use flash ( IE < 9 )
		var ieMatch = ua.match( /MSIE\s([0-9])/ );
		if ( ieMatch && parseInt( ieMatch[1] ) < 9 ) {
			mw.setConfig('Kaltura.ForceFlashOnDesktop', true );
		}
		
		// Blackberry does not really support html5
		if( ua.indexOf('BlackBerry') != -1 ){
			mw.setConfig( 'EmbedPlayer.DisableVideoTagSupport', true );
			mw.setConfig( 'EmbedPlayer.NotPlayableDownloadLink', true );
		}
		
		
		// Set iframe config if in the client page, will be passed to the iframe along with other config
		if( ! mw.getConfig('EmbedPlayer.IsIframeServer') ){
			mw.setConfig('EmbedPlayer.IframeParentUrl', document.URL );
			mw.setConfig('EmbedPlayer.IframeParentTitle', document.title);
			mw.setConfig('EmbedPlayer.IframeParentReferrer', document.referrer);
			
			// Fix for iOS not rendering iframe correctly when moving back/forward
			// http://stackoverflow.com/questions/7988967/problems-with-page-cache-in-ios-5-safari-when-navigating-back-unload-event-not
			if ((/iphone|ipod|ipad.*os 5/gi).test(navigator.appVersion)) {
				window.onpageshow = function(evt) {
					// If persisted then it is in the page cache, force a reload of the page.
					if ( evt.persisted ) {
						document.body.style.display = "none";
						location.reload();
					}
				};
			} 
		}
	},
	
	/**
	 * Checks for the existence of jsReadyCallback and stores it locally. 
	 * all ready calls then are wrapped by the kWidget jsCallBackready function. 
	 */
	proxiedJsCallback: null,
	waitForLibraryChecks: true,
	jsReadyCalledForIds: [],
	proxyJsCallbackready: function(){
		var _this = this;
		// Check if we have not proxy yet and we have readyCallbacks 
		if( ! this.proxiedJsCallback && 
			( window['jsCallbackReady'] || this.readyCallbacks.length )){
			// Setup a proxied ready function: 
			this.proxiedJsCallback = window['jsCallbackReady'] || true;
			// Override the actual jsCallbackReady
			window['jsCallbackReady'] = function( widgetId ){
				// check if we need to wait. 
				if( _this.waitForLibraryChecks ){
					// wait for library checks
					_this.jsReadyCalledForIds.push( widgetId );
					return ;
				}
				// else we can call the jsReadyCallback directly: 
				_this.jsCallbackReady( widgetId );
			}
		}
	},
	
	/**
	 * The kWidget proxied jsCallbackReady
	 * @param {string} widgetId The id of the widget that is ready
	 */
	jsCallbackReady: function( widgetId ){
		if( this.destroyedWidgets[ widgetId ] ){		
			// don't issue ready callbacks on destoryed widgets: 
			return ;
		}
		// Check for proxied jsReadyCallback: 
		if( typeof this.proxiedJsCallback == 'function' ){
			this.proxiedJsCallback( widgetId );
		}
		// Issue the callback for all readyCallbacks
		for( var i = 0; i < this.readyCallbacks.length; i++ ){
			this.readyCallbacks[i]( widgetId );
		}
		this.readyWidgets[ widgetId ] = true;
	},
	
	/**
	 * Function to flag player mode checks.  
	 */
	playerModeChecksDone: function(){
		// no need to wait for library checks any longer: 
		this.waitForLibraryChecks = false;
		// call any callbacks in the queue:
		for( var i=0;i < this.jsReadyCalledForIds.length; i++ ){
			var widgetId = this.jsReadyCalledForIds[i];
			this.jsCallbackReady( widgetId );
		}
		// empty out the ready callback queue
		this.jsReadyCalledForIds = [];
	},
	/**
	 * The base embed method
	 * @param targetId {String} Optional targetID string ( if not included, you must include in json) 
	 * @param settings {Object} Object of settings to be used in embedding. 
	 */
	embed: function( targetId, settings ){
		var _this = this;
		// Supports passing settings object as the first parameter
		if( typeof targetId === 'object' ) {
			settings = targetId;
			if( ! settings.targetId ) {
				this.log('Error: Missing target element Id');
			}
			targetId = settings.targetId;
		}
		/** 
		 * Embed settings checks
		 */
		if( !settings.wid ){
			this.log("Error: kWidget.embed missing wid");
			return ;
		}
		var uiconf_id = settings.uiconf_id;
		if( !uiconf_id ){
			this.log("Error: kWidget.embed missing uiconf_id");
			return ;
		}
		// Make sure the replace target exists:
		var elm = document.getElementById( targetId );
		if( ! elm ){
			this.log("Error: kWidget.embed could not find target: " + targetId );
			return false; // No target found ( probably already done )
		}
		// Don't rewrite special key kaltura_player_iframe_no_rewrite
		if( elm.getAttribute('name') == 'kaltura_player_iframe_no_rewrite' ){
			return ;
		}
		
<<<<<<< HEAD:kWidget/kWidget.js
		// Check if we are overwriting an existing ready widget:
		for( var widId in this.readyWidgets ){
			if( widId == targetId && this.readyWidgets[widId] == true){
				// Remove the ready state of widget:
				delete( this.readyWidgets[ targetId ] );
			}
		}
		
		if( settings.readyCallback ){
			var addCallback = false;
			if( !this.readyCallbackPerWidget[ targetId ] ){
				addCallback = true;
			}
			// store ready callback in perWidget array to avoid stacking callbacks for the same id.
			this.readyCallbackPerWidget[ targetId ] = settings.readyCallback;
			// Only add the ready callback if not already added for this video id:
			if( addCallback ){
				this.addReadyCallback( function( videoId ){
					if( videoId == targetId && _this.readyCallbackPerWidget[ targetId ] ){
						_this.readyCallbackPerWidget[ targetId ]( targetId );
=======
		// Unset any destroyed widget with the same id: 
		if( this.destroyedWidgets[ targetId ] ){
			delete( this.destroyedWidgets[ targetId ] );
		}
		
		if( settings.readyCallback ){
			// only add a callback if we don't already have one for this id: 
			var adCallback = ! this.perWidgetCallback[ targetId ];
			// add the per widget callback: 
			this.perWidgetCallback[ targetId ] = settings.readyCallback;
			// Only add the ready callback for the current targetId being rewritten.
			if( adCallback ){
				this.addReadyCallback( function( videoId ){
					if( _this.perWidgetCallback[ videoId ] ){
						_this.perWidgetCallback[ videoId ]( videoId );
>>>>>>> develop:kWidget.js
					}
				});
			}
		}
		
		// Be sure to jsCallbackready is proxied in dynamic embed call situations: 
		this.proxyJsCallbackready();
		
		settings.isHTML5 = this.isUiConfIdHTML5( uiconf_id )
		
		// Evaluate per user agent rules for actions
		if( uiconf_id && window.kUserAgentPlayerRules && kUserAgentPlayerRules[ uiconf_id ] ){
			var playerAction = window.checkUserAgentPlayerRules( kUserAgentPlayerRules[ uiconf_id ] );
			// Default play mode, if here and really using flash remap:
			switch( playerAction.mode ){
				case 'flash':
					if( !this.isHTML5FallForward() && elm.nodeName.toLowerCase() == 'object'){
						// do do anything if we are already trying to rewrite an object tag
						return ;
					}
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
		}

		// Check if we are dealing with an html5 player or flash player or direct download
		// TODO: We may want to always load the iframe and handle the fallback there
		//if( ! this.supportsFlash() && ! this.supportsHTML5() && ! mw.getConfig( 'Kaltura.ForceFlashOnDesktop' ) ) {
		//	this.outputDirectDownload( targetId, settings );
		//	return ;
		//}
		if( settings.isHTML5 ){
			this.outputHTML5Iframe( targetId, settings );
		} else {
			this.outputFlashObject( targetId, settings );
		}
	},

	/**
	 * Destroy a kWidget embed instance
	 * * removes the target from the dom
	 * * removes any associated  
	 * @param {Element|String} The target element or string to destroy
	 */
	destroy: function( target ){
		if( typeof target == 'string' ){
			target = document.getElementById( target );
		}
		if( ! target ){
			this.log( "Error destory called without valid target");
			return ;
		}
		var destoryId = target.getAttribute( 'id' );
		for( var id in this.readyWidgets ){
			if( id == destoryId ){
				delete( this.readyWidgets[ id ] );
			}
		}
		this.destroyedWidgets[ destoryId ] = true;
		// remove the embed objects: 
		target.parentNode.removeChild( target );
		target = null;
	},
	/**
	 * Embeds the player from a set of on page objects with kEmbedSettings properties
	 * @param {object} rewriteObjects set of in page object tags to be rewritten
	 */
	embedFromObjects: function( rewriteObjects ){
		for( var i=0; i < rewriteObjects.length; i++ ){
			
			var settings = rewriteObjects[i].kEmbedSettings;
			settings.width = rewriteObjects[i].width;
			settings.height = rewriteObjects[i].height;
			
			this.embed( rewriteObjects[i].id, rewriteObjects[i].kEmbedSettings );
		}
	},
	
	/*
	 * Extends the player object and add jsApi methods
	 * 
	 * TODO enable this API and deprecate iframe api client / server ( version 1.7 )
	 * ( presently disabled, and not called from anywhere ) 
	 */
	/*
	setupJsApi: function( playerId ) {
		
		var player = document.getElementById( playerId );
		var embedPlayer = document.getElementById( playerId + '_ifp' ).contentWindow.document.getElementById( playerId );

		player.addJsListener = function( listenerString, globalFuncName ){
			embedPlayer.addJsListener(listenerString, globalFuncName );
		}

		player.removeJsListener = function( listenerString, callbackName ) {
			embedPlayer.removeJsListener( listenerString, callbackName );
		}

		player.sendNotification = function( notificationName, notificationData ){
			embedPlayer.sendNotification( notificationName, notificationData );
		};
		player.evaluate = function( objectString ){
			return embedPlayer.evaluate( objectString );
		};
		player.setKDPAttribute = function( componentName, property, value ) {
			embedPlayer.setKDPAttribute( componentName, property, value );
		};				
	},
	*/

	/**
	 * Outputs a flash object into the page
	 * 
	 * @param {string} targetId target container for iframe
	 * @param {object} settings object used to build iframe settings
	 */
	outputFlashObject: function( targetId, settings ) {
		var elm = document.getElementById( targetId );
		if( !elm && !elm.parentNode ){
			kWidget.log( "Error embed target missing" );
			return ;
		}
		
		// Only generate a swf source if not defined. 
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
		var spanTarget = document.createElement( "span" );

		// make sure flashvars are init: 
		if( ! settings.flashvars ){
			settings.flashvars = {};
		}
		// Set our special callback flashvar: 
		if( settings.flashvars['jsCallbackReadyFunc'] ){
			kWidget.log("Error: Setting jsCallbackReadyFunc is not compatible with kWidget embed");
		}
		var flashvarValue = this.flashVarsToString( settings.flashvars );

		// we may have to borrow more from:
		// http://code.google.com/p/swfobject/source/browse/trunk/swfobject/src/swfobject.js#407
		// There seems to be issue with passing all the flashvars in playlist context.

		var defaultParamSet = {
			'allowFullScreen': 'true',
			'allowNetworking': 'all',
			'allowScriptAccess': 'always',
			'bgcolor': '#000000'
		};

		var output = '<object style="' + elm.style.cssText + '" ' + 
				'" id="' + targetId +
				'" name="' + targetId + '"';

		output += ' data="' + settings['src'] + '" type="application/x-shockwave-flash"';
		if( window.ActiveXObject ){
			output += ' classid="clsid:D27CDB6E-AE6D-11cf-96B8-444553540000"';
		}
		output += '>';

		output += '<param name="movie" value="' + settings['src'] + '" />';
		output += '<param name="flashvars" value="' + flashvarValue + '" />';
		
		// Output any custom params and let them override default params 
		if( settings['params'] ){
			for( var key in settings['params'] ) {
				if( defaultParamSet[key] ){
					defaultParamSet[key]  = settings['params'][key];
				} else {
					output += '<param name="'+ key +'" value="'+ settings['params'][key] +'" />';
				}
			}
		}
		// output the default set of params
		for ( var key in defaultParamSet ) {
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
		// XXX firefox with firebug enabled locks up the browser 
		// detect firebug: 
		if ( window.console && ( window.console.firebug || window.console.exception ) ) {
			console.log( 'Warning firebug + firefox and dynamic flash kdp embed causes lockups in firefox' + 
					', ( delaying embed )');
			this.domReady( function(){
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
	
	/**
	 * Output an html5 iframe player, once the html5 library is loaded
	 * 
	 * @param {string} targetId target container for iframe
	 * @param {object} settings object used to build iframe settings
	 */
	outputHTML5Iframe: function( targetId, settings ) {
		var widgetElm = document.getElementById( targetId );

		var iframeId = widgetElm.id + '_ifp';
		var iframeCssText =  'border:0px;' +  widgetElm.style.cssText;

		var iframe =  document.createElement("iframe");
		iframe.id = iframeId;
		iframe.name = iframeId;
		iframe.className = 'mwEmbedKalturaIframe';
		iframe.width = settings.width;
		iframe.height = settings.height;
		iframe.allowfullscreen = 'allowfullscreen';
		iframe.style.cssText = iframeCssText;
			
		// Create the iframe proxy that wraps the actual iframe
		// and will be converted into an "iframe" player via jQuery.fn.iFramePlayer call
		var iframeProxy = document.createElement("div");
		iframeProxy.id = widgetElm.id;
		iframeProxy.name = widgetElm.name;
		// copy the target element css to the iframe proxy style:
		iframeProxy.style.cssText = widgetElm.style.cssText;
		iframeProxy.appendChild( iframe );

		// Setup the iframe url
		var iframeUrl = this.getIframeUrl() + '?' +  this.getIframeRequest( widgetElm, settings );

		// Set the iframe contents via callback replace any non-alpha numeric chars
		var cbName = 'mwi_' + iframeId.replace(/[^0-9a-zA-Z]/g, '');
		if( window[ cbName ] ){
			this.log( "Error: iframe callback already defined: " + cbName );
			cbName += parseInt( Math.random()* 1000 );
		}
		window[ cbName ] = function( iframeData ){
			var newDoc = iframe.contentDocument;
			newDoc.open();
			newDoc.write( iframeData.content );
			newDoc.close();
			// Clear out this global function
			window[ cbName ] = null;
		};
		// Replace the player with the iframe:
		widgetElm.parentNode.replaceChild( iframeProxy, widgetElm );
		// Add the iframe script: 
		this.appendScriptUrl( iframeUrl + '&callback=' + cbName );
	},
	/**
	 * Build the iframe request from supplied settings:
	 */
	getIframeRequest: function( elm, settings ){
		// Get the base set of kaltura params ( entry_id, uiconf_id etc )
		var iframeRequest = this.embedSettingsToUrl( settings );
		
		// Add the player id:
		iframeRequest+= '&playerId=' + elm.id

		// Add &debug is in debug mode
		if( mw.getConfig( 'debug') ){
			iframeRequest+= '&debug=true';
		}

		// If remote service is enabled pass along service arguments:
		if( mw.getConfig( 'Kaltura.AllowIframeRemoteService' )  &&
			(
				mw.getConfig("Kaltura.ServiceUrl").indexOf('kaltura.com') === -1 &&
				mw.getConfig("Kaltura.ServiceUrl").indexOf('kaltura.org') === -1
			)
		){
			iframeRequest += kWidget.serviceConfigToUrl();
		}

		// Add no cache flag if set:
		if( mw.getConfig('Kaltura.NoApiCache') ) {
			iframeRequest+= '&nocache=true';
		}
		
		// Also append the script version to purge the cdn cache for iframe:
		iframeRequest += '&urid=' + KALTURA_LOADER_VERSION;
		return iframeRequest;
	},
	getIframeUrl: function(){
		return SCRIPT_LOADER_URL.replace( 'load.php', 'mwEmbedFrame.php' );
	},
	/**
	 * Output an iframe without api. ( should rarely be used, this dissabe on page javascript api, 
	 * as well as native fullscreen on browsers that support it.  
	 * 
	 * @param {string} replaceTargetId target container for iframe
	 * @param {object} kEmbedSettings object used to build iframe settings
	 */
	outputIframeWithoutApi: function( targetId, settings ) {
		var iframeSrc = this.getIframeUrl();
		iframeSrc += '?' + this.embedSettingsToUrl( settings );

		// If remote service is enabled pass along service arguments:
		if( mw.getConfig( 'Kaltura.AllowIframeRemoteService' ) &&
			(
				mw.getConfig("Kaltura.ServiceUrl").indexOf('kaltura.com') === -1 &&
				mw.getConfig("Kaltura.ServiceUrl").indexOf('kaltura.org') === -1
			)
		){
			iframeSrc += this.serviceConfigToUrl();
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

		var targetNode = document.getElementById( targetId );
		var parentNode = targetNode.parentNode;
		var iframe = document.createElement('iframe');
		iframe.src = iframeSrc;
		iframe.id = targetId;
		iframe.width = (settings.width) ? settings.width.replace(/px/, '' ) : '100%';
		iframe.height = (settings.height) ? settings.height.replace(/px/, '' ) : '100%';
		iframe.style.border = '0px';
		iframe.style.overflow = 'hidden';

		parentNode.replaceChild( iframe, targetNode );
	},
	
	/**
	 * Adds a ready callback to be called once the kdp or html5 player is ready
	 * @param {function} readyCallback called once a player or widget is ready on the page
	 */
	addReadyCallback: function( readyCallback ){
		// Issue the ready callback for any existing ready widgets:
		for( var widgetId in this.readyWidgets ){
			// Make sure the widget is not already ready and is still in the dom:
			if( document.getElementById( widgetId ) ){
				readyCallback( widgetId );
			}
		}
		// Add the callback to the readyCallbacks array for any other players that become ready
		this.readyCallbacks.push( readyCallback );
	},

	/**
	 * Search the DOM for Object tags and rewrite them if they should be rewritten.
	 * 
	 * rewrite rules include: 
	 * - userAgentRules -- may result in loading uiConf rewrite rules 
	 * - forceMobileHTML5 -- a url flag to force HTML5 for testing, can be dissabled on iframe side,
	 * 						per uiConf vars
	 * - ForceFlashOnDesktop -- forces flash for desktop browsers. 
	 */
	rewriteObjectTags: function() {
		// get the list of object tags to be rewritten: 
		var playerList = this.getKalutaObjectList();
		var _this = this;

		// Check if we need to load UiConf JS
		if( this.isMissingUiConfJs( playerList ) ){
			// Load uiConfJS then re call the rewriteObjectTags method: 
			this.loadUiConfJs( playerList, function(){
				_this.rewriteObjectTags();
			})
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
		/*
		 * TODO revisit support for video tag rewrites ( maybe redirect to iframe style embed )
		if( ! mw.getConfig( 'Kaltura.ForceFlashOnDesktop' )
				&&
			( mw.getConfig( 'Kaltura.LoadScriptForVideoTags' ) && this.pageHasAudioOrVideoTags()  )
		){
			loadHTML5LibAndRewriteTags();
			return ;
		}
		*/
		
		// If document includes kaltura embed tags && isMobile safari:
		if ( this.isHTML5FallForward()
				&&
			playerList.length
		) {
			// Check for Kaltura objects in the page
			this.embedFromObjects( playerList );
			return ;
		}

		// Check if no flash and no html5 and no forceFlash ( direct download link )
		if( ! this.supportsFlash() && ! this.supportsHTML5() && ! mw.getConfig( 'Kaltura.ForceFlashOnDesktop' ) ){
			this.embedFromObjects( playerList );
			return ;
		}
		this.playerModeChecksDone();
	},
	// Global instance of uiConf ids and assoicated script loaded state
	uiConfScriptLoadList: {},
	
	/**
	 * Check if any player is missing uiConf javascript: 
	 * @param {object} playerList List of players to check for missing uiConf js
	 */
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
			if( ! this.uiConfScriptLoadList[ settings.uiconf_id  ] ){
				return true;
			}
		}
		return false;
	},
	
	/** 
	 * Loads the uiConf js for a given playerList
	 * @param {object} playerList list of players to check for uiConf js
	 * @param {function} callback, called once all uiConf service calls have been made
	 */
	loadUiConfJs: function( playerList, callback ){
		var _this = this;
		// We have not yet loaded uiConfJS... load it for each ui_conf id
		var baseUiConfJsUrl = SCRIPT_LOADER_URL.replace( 'load.php', 'services.php?service=uiconfJs');
		if( !this.isMissingUiConfJs( playerList ) ){
			// called with empty request set: 
			callback();
			return ;
		}
		for( var i=0;i < playerList.length; i++){
			// Create a local scope for the current uiconf_id: 
			(function( settings ){
				if( _this.uiConfScriptLoadList[ settings.uiconf_id ] ){
					// player ui conf js is already loaded skip: 
					return ;
				}
				_this.appendScriptUrl( baseUiConfJsUrl + _this.embedSettingsToUrl( settings ), function(){
					_this.uiConfScriptLoadList[ settings.uiconf_id ] = true;
					// see if this the last uiConf missing conf js
					if( ! _this.isMissingUiConfJs( playerList ) ){
						callback();
					} else {
						// still missing uiConf for some entry assume we will load for them
					}
				});
			})( playerList[i].kEmbedSettings );
		}
	},
	
	/**
	 * Write log message to the console
	 * TODO support log levels: https://github.com/kaltura/mwEmbed/issues/80
	 */
	 log: function( msg ) {
		if( typeof console != 'undefined' && console.log ) {
			console.log( msg );
		}
	 },

	/**
	 * If the current player supports html5:
	 * @return {boolean} true or false if HTML5 video tag is supported
	 */
	supportsHTML5: function(){
		if( mw.getConfig('EmbedPlayer.DisableVideoTagSupport') ){
			return false;
		}
		var dummyvid = document.createElement( "video" );
		// IE9 is grade B HTML5 support only invoke it if forceMobileHTML5 is true, 
		// but for normal tests we categorize it as ~not~ supporting html5 video. 
		if( navigator.userAgent.indexOf( 'MSIE 9.' ) != -1 ){
			return false;
		}
		if( dummyvid.canPlayType ) {
			return true;
		}
		return false;
	},

	/**
	 * If the browser supports flash
	 * @return {boolean} true or false if flash > 10 is supported. 
	 */
	supportsFlash: function() {
		if( mw.getConfig('EmbedPlayer.DisableHTML5FlashFallback' ) ){
			return false;
		}

		var version = this.getFlashVersion().split(',').shift();
		if( version < 10 ){
			return false;
		} else {
			return true;
		}
	},
	
	/**
	 * Checks for flash version
	 * @return {string} flash version string
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
	 
	 /**
	  * Checks if a given uiconf_id is html5 or not
	  * @param {string} uiconf_id The uiconf id to check against user player agent rules 
	  */
	 isUiConfIdHTML5: function( uiconf_id ){
		 var isHTML5 = this.isHTML5FallForward();
		 
		 if( window.kUserAgentPlayerRules && kUserAgentPlayerRules[ uiconf_id ]){
			 var playerAction = window.checkUserAgentPlayerRules( kUserAgentPlayerRules[ uiconf_id ] );
			 if( playerAction.mode == 'leadWithHTML5' ){
				 isHTML5 = this.supportsHTML5();
			 }
		 }
		 
		 return isHTML5;
	 },
	 
	 /**
	  * Fallforward by default prefers flash, uses html5 only if flash is not installed or not available
	  */
	 isHTML5FallForward: function() {

		 // Check for a mobile html5 user agent:
		 if ( this.isIOS() || mw.getConfig( 'forceMobileHTML5' )  ){
			 return true;
		 }

		 // Check for "Kaltura.LeadWithHTML5" attribute
		 if( mw.getConfig( 'KalturaSupport.LeadWithHTML5' ) || mw.getConfig( 'Kaltura.LeadWithHTML5' ) ){
			 return this.supportsHTML5();
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
 	  * TODO We need to grab thumbnail path from api (baseEntry->thumbnailUrl)
	  * 		or a specialized entry point for cases where we don't have the api readably available  
	  * 	
	  * @param {object} entry Entery settings used to gennerate the api url request
	  */
	 getKalturaThumbUrl: function ( entry ){
	 	if( entry.width == '100%'){
	 		entry.width = 400;
	 	}
	 	if( entry.height == '100%'){
	 		entry.height = 300;
	 	}

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
	 		flashvars = this.flashVars2Object( flashvars );
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
	 		key = key.toLowerCase();
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
	  * Converts a flashvar string to flashvars object
	  * @param {String} flashvarsString
	  * @return {Object} flashvars object
	  */
	 flashVars2Object: function( flashvarsString ){
		var flashVarsSet = ( flashvarsString )? flashvarsString.split('&'): [];
		var flashvars = {};
		for( var i =0 ;i < flashVarsSet.length; i ++){
			var currentVar = flashVarsSet[i].split('=');
			if( currentVar[0] && currentVar[1] ){
				flashvars[ currentVar[0] ] = currentVar[1];
			}
		}
		return flashvars;
	 },
	 /**
	  * Convert flashvars to a string
	  * @param {object} flashVarsObject object to be string encoded
	  */
	 flashVarsToString: function( flashVarsObject ) {
		 var params = '';
		 for( var i in flashVarsObject ){
			 params+= '&' + '' + encodeURIComponent( i ) + '=' + encodeURIComponent( flashVarsObject[i] );
		 }
		 return params;
	 },
	 /**
	  * Converts a flashvar object into a url object string
	  * @param {object} flashVarsObject object to be url encoded
	  */
	 flashVarsToUrl: function( flashVarsObject ){
		 var params = '';
		 for( var i in flashVarsObject ){
			 params+= '&' + 'flashvars[' + encodeURIComponent( i ) + ']=' + encodeURIComponent( flashVarsObject[i] );
		 }
		 return params;
	 },
	 /**
	  * @return {boolean} true if page has audio video tags
	  */
	 pageHasAudioOrVideoTags: function (){
		 // if selector is set to false or is empty return false
		 if( mw.getConfig( 'EmbedPlayer.RewriteSelector' ) === false || 
			mw.getConfig( 'EmbedPlayer.RewriteSelector' ) == '' ){
			return false;
		 }
		 // If document includes audio or video tags
		 if( document.getElementsByTagName('video').length != 0 || 
				 document.getElementsByTagName('audio').length != 0 ) {
			 return true;
		 }
		 return false;
	},
	/**
	 * Get the list of embed objects on the page that are 'kaltura players'
	*/
	getKalutaObjectList: function(){
		var _this = this;
		var kalturaPlayerList = [];
	 	// Check all objects for kaltura compatible urls 
		var objectList = document.getElementsByTagName('object');
		if( !objectList.length && document.getElementById('kaltura_player') ){
			objectList = [ document.getElementById('kaltura_player') ];
		}
	 	// local function to attempt to add the kalturaEmbed
	 	var tryAddKalturaEmbed = function( url , flashvars){
	 		var settings = _this.getEmbedSettings( url, flashvars );
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
	 				flashvars =	this.flashVars2Object( pVal );
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
	 },
	/**
	 * Append a script to the dom:
	 * @param {string} url
	 * @param {function} callback
	 */
	appendScriptUrl: function( url, callback ) {
		var head = document.getElementsByTagName("head")[0] || document.documentElement;
		var script = document.createElement("script");
		script.src = url;

		// Handle Script loading
		var done = false;

		// Attach handlers for all browsers
		script.onload = script.onreadystatechange = function() {
			if ( !done && (!this.readyState ||
					this.readyState === "loaded" || this.readyState === "complete") ) {
				done = true; 
				if( typeof callback == 'function'){
					callback();
				}

				// Handle memory leak in IE
				script.onload = script.onreadystatechange = null;
				if ( head && script.parentNode ) {
					head.removeChild( script );
				}
			}
		};

		// Use insertBefore instead of appendChild  to circumvent an IE6 bug.
		// This arises when a base node is used (#2709 and #4378).
		head.insertBefore( script, head.firstChild );
	},
	/**
	 * Converts service configuration to url params
	 */
	serviceConfigToUrl: function(){
		var serviceVars = ['ServiceUrl', 'CdnUrl', 'ServiceBase', 'UseManifestUrls'];
		var urlParam = '';
		for( var i=0; i < serviceVars.length; i++){
			if( mw.getConfig('Kaltura.' + serviceVars[i] ) !== null ){
				urlParam += '&' + serviceVars[i] + '=' + encodeURIComponent( mw.getConfig('Kaltura.' + serviceVars[i] ) );
			}
		}
		return urlParam;
	},
	/**
	 * Converts settings to url params
	 * @param {object} settings Settings to  be convert into url params 
	 */
	embedSettingsToUrl: function( settings ){
		var url ='';
		var kalturaAttributeList = ['uiconf_id', 'entry_id', 'wid', 'p', 'cache_st'];
		for(var attrKey in settings ){
			// Check if the attrKey is in the kalturaAttributeList:
			for( var i =0 ; i < kalturaAttributeList.length; i++){
				if( kalturaAttributeList[i] == attrKey ){
					url += '&' + attrKey + '=' + encodeURIComponent( settings[attrKey] );  
				}
			}
		}
		// Add the flashvars:
		url += this.flashVarsToUrl( settings.flashvars );
		
		return url;
	},
	
	/**
	 * Overrides flash embed methods, as to optionally support HTML5 injection
	 */
	overrideFlashEmbedMethods: function(){
		var _this = this;
		var doEmbedSettingsWrite = function ( settings, replaceTargetId, widthStr, heightStr ){
			if( widthStr ) {
				settings.width = widthStr;
			}
			if( heightStr ) {
				settings.height = heightStr;
			}
			kWidget.embed( replaceTargetId, settings );
		};
		// flashobject
		if( window['flashembed'] && !window['originalFlashembed'] ){
			window['originalFlashembed'] = window['flashembed'];
			window['flashembed'] = function( targetId, attributes, flashvars ){
				// TODO test with kWidget.embed replacement.
				_this.domReady(function(){
					var kEmbedSettings = kWidget.getEmbedSettings( attributes.src, flashvars);
					kEmbedSettings.width = attributes.width;
					kEmbedSettings.height = attributes.height;
					
					if( kEmbedSettings.uiconf_id && ( kWidget.isHTML5FallForward() || ! kWidget.supportsFlash() ) ){
						document.getElementById( targetId ).innerHTML = '<div id="' + attributes.id + '"></div>';
						doEmbedSettingsWrite( kEmbedSettings, attributes.id, attributes.width, attributes.height);
					} else {
						// Use the original flash player embed:  
						originalFlashembed( targetId, attributes, flashvars );
					}
				});
			};
		}
	
		// SWFObject v 1.5 
		if( window['SWFObject']  && !window['SWFObject'].prototype['originalWrite']){
			window['SWFObject'].prototype['originalWrite'] = window['SWFObject'].prototype.write;
			window['SWFObject'].prototype['write'] = function( targetId ){
				var swfObj = this;
				// TODO test with kWidget.embed replacement.
				_this.domReady(function(){      
					var kEmbedSettings = kWidget.getEmbedSettings( swfObj.attributes.swf, swfObj.params.flashVars);
					if( kEmbedSettings.uiconf_id && ( kWidget.isHTML5FallForward() || ! kWidget.supportsFlash() ) ){
						doEmbedSettingsWrite( kEmbedSettings, targetId, swfObj.attributes.width, swfObj.attributes.height);
					} else {
						// use the original flash player embed:  
						swfObj.originalWrite( targetId );
					}
				});
			};
		}
		// SWFObject v 2.x
		if( window['swfobject'] && !window['swfobject']['originalEmbedSWF'] ){
			window['swfobject']['originalEmbedSWF'] = window['swfobject']['embedSWF'];
			// Override embedObject for our own ends
			window['swfobject']['embedSWF'] = function( swfUrlStr, replaceElemIdStr, widthStr,
					heightStr, swfVersionStr, xiSwfUrlStr, flashvarsObj, parObj, attObj, callbackFn)
			{
				// TODO test with kWidget.embed replacement.
				_this.domReady(function(){
					var kEmbedSettings = kWidget.getEmbedSettings( swfUrlStr, flashvarsObj );
					// Check if IsHTML5FallForward
					if( kEmbedSettings.uiconf_id && ( kWidget.isHTML5FallForward() || ! kWidget.supportsFlash() ) ){
						doEmbedSettingsWrite( kEmbedSettings, replaceElemIdStr, widthStr,  heightStr );
					} else {
						// Else call the original EmbedSWF with all its arguments 
						window['swfobject']['originalEmbedSWF']( swfUrlStr, replaceElemIdStr, widthStr,
								heightStr, swfVersionStr, xiSwfUrlStr, flashvarsObj, parObj, attObj, callbackFn );
					}
				});
			};
		}
	}
};

// Export to kWidget and KWidget ( official name is camel case kWidget )
window.KWidget = kWidget;
window.kWidget = kWidget;

})();
