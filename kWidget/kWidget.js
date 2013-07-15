/**
 * KWidget library provided embed layer services to html5 and flash players, as well as client side abstraction for some kaltura services.
 */
(function(){
// Use strict ECMAScript 5
"use strict";

// Don't re-initialize kWidget
if( window.kWidget ){
	return ;
}

var kWidget = {

	//store the start time of the kwidget init
	startTime:{},

	//store the load time of the player
	loadTime:{},

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

	listenerList: {},

	// Stores per uiConf user agent rewrite rules
	userAgentPlayerRules: {},

	// flag for the already added css rule:
	alreadyAddedThumbRules: false,
	
	// For storing iframe payloads via server side include, instead of an additional request
	// stored per player id
	iframeAutoEmbedCache:{}, 
	/**
	 * The master kWidget setup function setups up bindings for rewrites and
	 * proxy of jsCallbackReady
	 *
	 * MUST BE CALLED AFTER all of the mwEmbedLoader.php includes.
	 */
	setup: function(){

		var _this = this;
		
		/**
		 * set version:
		 */
		mw.setConfig('version', MWEMBED_VERSION );
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
			// set dom ready flag 
			_this.domIsReady = true;
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
		// Check for debugKalturaPlayer in url and set debug mode to true
		if( document.URL.indexOf('debugKalturaPlayer' ) !== -1 ){
			mw.setConfig( 'debug', true );
		}

		var ua = navigator.userAgent;
		// Check if browser should use flash ( IE < 9 )
		var ieMatch = ua.match( /MSIE\s([0-9]+)/ );
		if ( (ieMatch && parseInt( ieMatch[1] ) < 9) || document.URL.indexOf('forceFlash') !== -1 ) {
			mw.setConfig('Kaltura.ForceFlashOnDesktop', true );
		}

		// Blackberry does not really support html5
		if( ua.indexOf('BlackBerry') != -1 ){
			mw.setConfig( 'EmbedPlayer.DisableVideoTagSupport', true );
			mw.setConfig( 'EmbedPlayer.NotPlayableDownloadLink', true );
		}

		// Google Nexus 7 running android 4.1 seems to have flaky inline HLS support
		// Some Android 4.0.4 devices don't support seek when loading HLS
		// TODO test more 4.1 android HLS
		if( ua.indexOf( 'Android' ) != -1 ){
			mw.setConfig('Kaltura.UseAppleAdaptive', false);
		}

		// iOS less than 5 does not play well with HLS:
		if( /(iPhone|iPod|iPad)/i.test( ua ) ){
			if(/OS [2-4]_\d(_\d)? like Mac OS X/i.test( ua )
					||
			(/CPU like Mac OS X/i.test( ua ) )
			){
				mw.setConfig('Kaltura.UseAppleAdaptive', false);
			}
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
		var jsCallbackProxy = function( widgetId ){
			// check if we need to wait.
			if( _this.waitForLibraryChecks ){
				// wait for library checks
				_this.jsReadyCalledForIds.push( widgetId );
				return ;
			}
			// else we can call the jsReadyCallback directly:
			_this.jsCallbackReady( widgetId );
		};
		
		// Always proxy js callback
		if( ! this.proxiedJsCallback ){
			// Setup a proxied ready function:
			this.proxiedJsCallback = window['jsCallbackReady'] || true;
			// Override the actual jsCallbackReady
			window['jsCallbackReady'] = jsCallbackProxy
		}
		// secondary domready call check that jsCallbackReady was not overwritten:
		if( window['jsCallbackReady'].toString() != jsCallbackProxy.toString() ){
			this.proxiedJsCallback = window['jsCallbackReady'];
			// Override the actual jsCallbackReady with proxy
			window['jsCallbackReady'] = jsCallbackProxy
		}
	},

	/**
	 * The kWidget proxied jsCallbackReady
	 * @param {string} widgetId The id of the widget that is ready
	 */
	jsCallbackReady: function( widgetId ){
		var _this = this;
		
		_this.log( "jsCallbackReady for " + widgetId );
		
		if( this.destroyedWidgets[ widgetId ] ){
			// don't issue ready callbacks on destroyed widgets:
			return ;
		}

		var player = document.getElementById( widgetId );
		if( !player ){
			this.log("Error:: jsCallbackReady called on invalid player Id:" + widgetId );
			return ;
		}		
		// extend the element with kBind kUnbind:
		this.extendJsListener( player );
		
		var kdpVersion = player.evaluate('{playerStatusProxy.kdpVersion}');
		//set the load time attribute supported in version kdp 3.7.x
		if( mw.versionIsAtLeast('v3.7.0', kdpVersion) ) {
			player.kBind( "kdpReady" , function() {
				_this.loadTime[ widgetId ] = ((new Date().getTime() - _this.startTime[ widgetId ] )  / 1000.0).toFixed(2);
				player.setKDPAttribute("playerStatusProxy","loadTime", _this.loadTime[ widgetId ] );
				_this.log( "Player (" + widgetId + "):" + _this.loadTime[ widgetId ] );
			});
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
		// Call any callbacks in the queue:
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

	 	// Check if we have flashvars object
	 	if( ! settings.flashvars ) {
	 		settings.flashvars = {};
	 	}				

		this.startTime[targetId] = new Date().getTime();
		
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
		// Empty the target ( don't keep SEO links on Page while loading iframe )
		elm.innerHTML = '';
		
		// Check for size override in kWidget embed call
		function checkSizeOveride( dim ){
			if( settings[ dim ] ){
				// check for non px value:
				if( parseInt(  settings[ dim ] ) ==  settings[ dim ] ){
					settings[ dim ] += 'px';
				}
				elm.style[ dim ] =  settings[ dim ];
			}
		}
		checkSizeOveride( 'width' );
		checkSizeOveride( 'height' );

		// Unset any destroyed widget with the same id:
		if( this.destroyedWidgets[ targetId ] ){
			delete( this.destroyedWidgets[ targetId ] );
		}

		// Check for ForceIframeEmbed flag
		if( mw.getConfig('Kaltura.ForceIframeEmbed') === true ) {
			this.outputIframeWithoutApi( targetId, settings );
			return;
		}

		if( settings.readyCallback ){
			// only add a callback if we don't already have one for this id:
			var adCallback = ! this.perWidgetCallback[ targetId ];
			// add the per widget callback:
			this.perWidgetCallback[ targetId ] = settings.readyCallback;
			// Only add the ready callback for the current targetId being rewritten.
			if( adCallback ){
				this.addReadyCallback( function( videoId ){
					if( videoId == targetId
							&&
						_this.perWidgetCallback[ videoId ] )
					{
						_this.perWidgetCallback[ videoId ]( videoId );
					}
				});
			}
		}

		// Be sure to jsCallbackready is proxied in dynamic embed call situations:
		this.proxyJsCallbackready();
		settings.isHTML5 = this.isUiConfIdHTML5( uiconf_id );
		
		/**
		 * Local scope doEmbed action, either writes out a msg, flash player
		 */
		var doEmbedAction = function(){
			// Evaluate per user agent rules for actions
			if( uiconf_id && _this.userAgentPlayerRules && _this.userAgentPlayerRules[ uiconf_id ] ){
				var playerAction = _this.checkUserAgentPlayerRules( _this.userAgentPlayerRules[ uiconf_id ] );
				// Default play mode, if here and really using flash re-map:
				switch( playerAction.mode ){
					case 'flash':
						if( elm.nodeName.toLowerCase() == 'object'){
							// do do anything if we are already trying to rewrite an object tag
							return ;
						}
					break;
					case 'leadWithHTML5':
						settings.isHTML5 = _this.supportsHTML5();
					break;
					case 'forceMsg':
						var msg = playerAction.val;
						// write out a message:
						if( elm && elm.parentNode ){
							var divTarget = document.createElement("div");
							divTarget.innerHTML = unescape( msg );
							elm.parentNode.replaceChild( divTarget, elm );
						}
						return ;
						break;
				}
			}
			// Check if we are dealing with an html5 player or flash player
			if( settings.isHTML5 ){
				_this.outputHTML5Iframe( targetId, settings );
			} else {
				_this.outputFlashObject( targetId, settings );
			}
		}

		// load any onPage scripts if needed:
		// create a player list for missing uiconf check:
		var playerList =  [ {'kEmbedSettings' : settings }];
		// Load uiConfJS then call embed action
		this.loadUiConfJs( playerList, function(){
			// check that the proxy of js callback ready is up-to-date
			_this.proxyJsCallbackready();
			doEmbedAction();
		});

	},
	addThumbCssRules: function(){
		if( this.alreadyAddedThumbRules ){
			return ;
		}
		this.alreadyAddedThumbRules = true;
		var style = document.createElement('STYLE');
		style.type = 'text/css';
		var imagePath = this.getPath() + '/modules/MwEmbedSupport/skins/common/images/';
		
		var cssText = '.kWidgetCentered {max-height: 100%; ' +
			'max-width: 100%; ' +
			'position: absolute; ' +
			'top: 0; left: 0; right: 0; bottom: 0; ' +
			'margin: auto; ' +
			'} ' + "\n" +
			'.kWidgetPlayBtn { ' +
				'cursor:pointer;' +
				'height: 53px;' +
				'width: 70px;' +
				'top: 50%; left: 50%; margin-top: -26.5px; margin-left: -35px; ' + 
				'background: url(\'' + imagePath + 'player_big_play_button.png\');' +
				'z-index: 1;' +
			'} ' + "\n" +
			'.kWidgetPlayBtn:hover{ ' +
				'background: url(\'' + imagePath + 'player_big_play_button_hover.png\');"' +
			'} ';
			if (this.isIE())
			{
				 style.styleSheet.cssText = cssText;
			}
			else
			{
				 style.innerHTML = cssText;
			}
		// Append the style
		document.getElementsByTagName('HEAD')[0].appendChild(style);
	},
	/** get the computed size of a target element */
	getComputedSize: function( elm, dim ){
		var a = navigator.userAgent;
		if( (a.indexOf("msie") != -1) && (a.indexOf("opera") == -1 ) ){
			return document.getElementById(theElt)[
					'offset' + dim[0].toUpperCase() + dim.substr(1) ];
		} else {
			return parseInt( document.defaultView.getComputedStyle(elm, "").getPropertyValue( dim ) );
		}
	},
	/**
	 * Used to do a light weight thumb embed player
	 * the widget loaded anlytics event is triggered,
	 * and a thumbReady callback is called
	 *
	 * All the other kWidget settings are invoked during playback.
	 */
	thumbEmbed: function( targetId, settings ){
		var _this = this;
		// Normalize the arguments
		if( typeof targetId === 'object' ) {
			settings = targetId;
			if( ! settings.targetId ) {
				this.log('Error: Missing target element Id');
			}
			targetId = settings.targetId;
		} else{
			settings.targetId =targetId;
		}

	 	// Check if we have flashvars object
	 	if( ! settings.flashvars ) {
	 		settings.flashvars = {};
	 	}

		// inject the centered css rule ( if not already )
		this.addThumbCssRules();

		// Add the width of the target to the settings:
		var elm = document.getElementById( targetId );
		if( !elm ){
			this.log( "Error could not find target id, for thumbEmbed" );
		}
		elm.innerHTML = '' +
			'<div style="position: relative; width: 100%; height: 100%;">' + 
			'<img class="kWidgetCentered" src="' + this.getKalturaThumbUrl( settings ) + '" >' +
			'<div class="kWidgetCentered kWidgetPlayBtn" ' +
				'id="' + targetId + '_playBtn"' +
			'></div></div>';
		// Add a click binding to do the really embed:
		var playBtn = document.getElementById( targetId + '_playBtn' );
		this.addEvent(playBtn, 'click', function(){
			// Check for the ready callback:
			if( settings.readyCallback ){
				var orgEmbedCallback = settings.readyCallback;
			}
			settings.readyCallback = function( playerId ){
				// issue a play ( since we already clicked the play button )
				var kdp = document.getElementById( playerId );
				kdp.kBind('mediaReady', function(){
					kdp.sendNotification( 'doPlay' );
				});
				if( typeof orgEmbedCallback == 'function' ){
					orgEmbedCallback( playerId );
				}
			}
			// Set a flag to capture the click event
			settings.captureClickEventForiOS = true;
			// update the settings object
			kWidget.embed( settings );
		});
		// TOOD maybe a basic basic api ( doPlay support ? )

		// thumb embed are ready as soon as they are embed:
		if( settings.thumbReadyCallback ){
			settings.thumbReadyCallback( targetId );
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
		var targetId = target.id;
		var targetCss = target.style.cssText;
		var targetClass= target.className;
		var destoryId = target.getAttribute( 'id' );
		for( var id in this.readyWidgets ){
			if( id == destoryId ){
				delete( this.readyWidgets[ id ] );
			}
		}
		this.destroyedWidgets[ destoryId ] = true;
		var newNode = document.createElement( "div" );
		newNode.style.cssText = targetCss;
		newNode.id = targetId;
		newNode.className = targetClass;
		// remove the embed objects:
		target.parentNode.replaceChild( newNode, target );
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

	/**
	 * Extends the kWidget objects with (un)binding mechanism - kBind / kUnbind
	 */
	extendJsListener: function( player ) {
		var _this = this;

		player.kBind = function( eventName, callback ) {
			// Stores the index of anonymous callbacks for generating global functions
			var callbackIndex = 0;
			var globalCBName = '';
			var _scope = this;
			// We can pass [eventName.namespace] as event name, we need it in order to remove listeners with their namespace
			if( typeof eventName == 'string' ) {
				var eventData = eventName.split('.', 2);
				var eventNamespace = ( eventData[1] ) ? eventData[1] : 'kWidget';
				eventName = eventData[0];
			}
			if( typeof callback == 'string' ){
				globalCBName = callback;
			} else if( typeof callback == 'function' ){
				// Make life easier for internal usage of the listener mapping by supporting
				// passing a callback by function ref
				var generateGlobalCBName = function(){
					globalCBName = 'kWidget_' + eventName + '_cb' + callbackIndex;
					if( window[ globalCBName ] ){
						callbackIndex++;
						generateGlobalCBName();
					}
				};
				generateGlobalCBName();
				window[ globalCBName ] = function(){
					var args = Array.prototype.slice.call(arguments, 0);
					// move kbind into a timeout to restore javascript backtrace for errors,
					// instead of having flash directly call the callback breaking backtrace
					if( mw.getConfig( 'debug') ){
						setTimeout(function(){
							callback.apply( _scope, args );
						},0);
					} else {
						// note for production we directly issue the callback
						// this enables support for sync gesture rules for enterfullscreen. 
						callback.apply( _scope, args );
					}
				};
			} else {
				kWidget.log( "Error: kWidget : bad callback type: " + callback );
				return ;
			}
			// Storing a list of namespaces. Each namespace contains a list of eventnames and respective callbacks
			if ( !_this.listenerList[ eventNamespace ] ) {
				_this.listenerList[ eventNamespace ] = {}
			}
			if ( !_this.listenerList[ eventNamespace ][ eventName ] ) {
				_this.listenerList[ eventNamespace ][ eventName ] = globalCBName;
			}
			//kWidget.log( "kWidget :: kBind :: ( " + eventName + ", " + globalCBName + " )" );
			player.addJsListener( eventName, globalCBName );
			return player;
		}

		player.kUnbind = function( eventName, callbackName ) {
			//kWidget.log( "kWidget :: kUnbind :: ( " + eventName + ", " + callbackName + " )" );
			if( typeof eventName == 'string' ) {
				var eventData = eventName.split('.', 2);
				var eventNamespace = eventData[1];
				eventName = eventData[0];
				// Remove event by namespace
				if( eventNamespace  ) {
					for ( var listenerItem in _this.listenerList[ eventNamespace ] ) {
						// Unbind the entire namespace
						if ( !eventName ) {
							player.removeJsListener( listenerItem, _this.listenerList[ eventNamespace ][ listenerItem ] );
						}
						// Only unbind the specified event within the namespace
						else {
							if ( listenerItem == eventName ) {
								player.removeJsListener( listenerItem, _this.listenerList[ eventNamespace ][ listenerItem ] );
								delete _this.listenerList[ eventNamespace ][ listenerItem ];
							}
						}
					}
					_this.listenerList[ eventNamespace ] = null;
				}
				// No namespace was given
				else {
					var isCallback = ( typeof callbackName == 'string' );
					// If a global callback name is given, then directly run removeJsListener
					if ( isCallback ) {
						player.removeJsListener( eventName, callbackName );
					}
					// If no callback was given, iterate over the list of listeners and remove all bindings per the given event name
					for ( var eventNamespace in _this.listenerList ) {
						for ( var listenerItem in _this.listenerList[ eventNamespace ] ) {
							if ( listenerItem == eventName ) {
								if ( !isCallback ) {
									player.removeJsListener( eventName, _this.listenerList[ eventNamespace ][ listenerItem ] );
								}
								delete _this.listenerList[ eventNamespace ][ listenerItem ];
							}
						}
					}
				}
			}
			return player;
		}
	},

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
		// Check if in debug mode: 
		if( mw.getConfig( 'debug', true ) ){
			settings.flashvars['debug'] = true;
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
		// output css trim:
		var output = '<object style="' + elm.style.cssText.replace(/^\s+|\s+$/g,'')  + ';display:block;" ' +
				' class="' + elm.className + '" ' +
				' id="' + targetId + '"' + 
				' name="' + targetId + '"';

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
		var _this = this;
		var widgetElm = document.getElementById( targetId );
		var iframeId = widgetElm.id + '_ifp';
		var iframeCssText =  'border:0px; max-width: 100%; max-height: 100%; ' +  widgetElm.style.cssText;

		var iframe =  document.createElement("iframe");
		iframe.id = iframeId;
		iframe.scrolling = "no";
		iframe.name = iframeId;
		iframe.className = 'mwEmbedKalturaIframe';

		iframe.allowfullscreen = 'yes';
		// copy the target element css to the iframe proxy style:
		iframe.style.cssText = iframeCssText;

		// Note we can't support inherited % styles ( so must be set on the element directly )
		// https://developer.mozilla.org/en-US/docs/DOM/window.getComputedStyle#Notes

		// Check if a percentage of container and use re-size binding
		if( settings.width == '%' || settings.height == '%' ||
				widgetElm.style.width.indexOf('%') != -1
				||
				widgetElm.style.height.indexOf('%') != -1
		) {
			// calculate size:
			var rectObject = widgetElm.getBoundingClientRect();
			iframe.style.width = rectObject.width + 'px';
			iframe.style.height = rectObject.height + 'px';
		} else {
			if( settings.width ){
				iframe.width = settings.width;
			}
			if( settings.height ){
				iframe.height = settings.height;
			}
		}

		// Create the iframe proxy that wraps the actual iframe
		// and will be converted into an "iframe" player via jQuery.fn.iFramePlayer call
		var iframeProxy = document.createElement("div");
		iframeProxy.id = widgetElm.id;
		iframeProxy.name = widgetElm.name;
		var moreClass = widgetElm.className ? ' ' +  widgetElm.className : '';
		iframeProxy.className = 'kWidgetIframeContainer' + moreClass;
		// Update the iframe proxy style per org embed widget:
		iframeProxy.style.cssText =  widgetElm.style.cssText + ';overflow: hidden';
		iframeProxy.appendChild( iframe );

		// Replace the player with the iframe:
		widgetElm.parentNode.replaceChild( iframeProxy, widgetElm );

		// Add the resize binding
		var updateIframeSize = function() {
			 // We use setTimeout to give the browser time to render the DOM changes
			setTimeout(function(){
				if( typeof iframeProxy.getBoundingClientRect == 'function' ) {
					var rectObject = iframeProxy.getBoundingClientRect();					
				} else {
					var rectObject = {
						width: iframeProxy.offsetWidth,
						height: iframeProxy.offsetHeight
					};
				}
				iframe.style.width = rectObject.width + 'px';
				iframe.style.height = rectObject.height + 'px';
			}, 0);
		}
		// see if we can hook into a standard "resizable" event
		iframeProxy.parentNode.onresize = updateIframeSize;
		// Listen to document resize ( to support RWD )
		this.addEvent( window, 'resize', updateIframeSize);
		// Also listen for device orientation changes.
		this.addEvent( window, 'orientationchange', updateIframeSize, true);
		
		// Check if we need to capture a play event ( iOS sync embed call )
		if( settings.captureClickEventForiOS && (this.isIOS() || this.isAndroid()) ){
			this.captureClickWrapedIframeUpdate( targetId, settings, iframe );
			return ;
		}
		// get the callback name:
		var cbName = this.getIframeCbName( targetId );

		// Do a normal async content inject:
		window[ cbName ] = function( iframeData ){
			var newDoc = iframe.contentWindow.document;
			newDoc.open();
			newDoc.write( iframeData.content );
			newDoc.close();
			// Clear out this global function
			window[ cbName ] = null;
			// always sync iframe size ( per any inherited css ) 
			updateIframeSize();
		};
		if( this.iframeAutoEmbedCache[ targetId ] ){
			// get the playload from local cache
			window[ cbName ]( this.iframeAutoEmbedCache[ targetId ]  );
		} else {
			// do an iframe payload request:
			_this.appendScriptUrl( this.getIframeUrl() + '?' +
				this.getIframeRequest( widgetElm, settings ) +
				'&callback=' + cbName );
		}
	},
	getIframeCbName: function( iframeId ){
		var _this = this;
		var inx = 0;
		var baseCbName = 'mwi_' + iframeId.replace(/[^0-9a-zA-Z]/g, '');
		var cbName =  baseCbName + inx;
		while( window[ cbName ] ){
			_this.log( "Warning: iframe callback already defined: " + cbName );
			inx++;
			cbName = baseCbName + inx;
		}
		return cbName;
	},
	/**
	 * Supports the iOS captured clicks iframe update,
	 *
	 * Inserts a video tag synchronously into the iframe, ( pointed to black video file )
	 * Issues play on the iframe video tag
	 * Issues async request to grab iframe data with "no video tag"
	 * Runs script blocks and allows iframe to update persistent video tag.
	 *
	 * @param {String} targetId The target id to be updated
	 * @param {Object} settings The embed Settings object
	 * @param {Element} iframeElm The target iframe element the page.
	 */
	captureClickWrapedIframeUpdate: function( targetId, settings, iframeElm ){
		var _this = this;
		var widgetElm = document.getElementById( targetId );
		var newDoc = iframeElm.contentDocument;
		newDoc.open();
		// grab a black source
		var vidSrc = location.protocol + '//www.kaltura.com/p/243342/sp/24334200/playManifest/entryId/1_vp5cng42/flavorId/1_6wf0o9n7/format/url/protocol/http/a.mp4';

		// Add the iframe skeleton with video element to the iframe
		newDoc.write( '<html>' +
			'<head></head>' +
				'<body>' +
					'<div class="mwPlayerContainer"  style="width: 100%; height: 100%">' +
						'<div class="videoHolder">' +
							'<video class="persistentNativePlayer" ' +
								'id="' + targetId + '" ' +
								'kwidgetid="' + settings.wid + '" '+
								'kentryid="' + settings.entry_id + '" ' +
								'kuiconfid="' + settings.uiconf_id + '" ' +
								//'poster="' + _this.getKalturaThumbUrl( settings ) + '" ' +
								// Only applies to iOS, and only to caputre the play event,
								// so we only include a low bitrate mp4
								'src="' + vidSrc + '" ' +
								'style="width:100%;height:100%" ' +
							'>' +
							'</video>' +
						'</div>' +
					'</div>' +
					// issue play on the silent black video ( to capture iOS gesture )
					'<script>document.getElementById(\'' + targetId + '\').play();</script>' +
					'<div id="scriptsHolder"></div>' +
				'</body>' +
			'</html>'
		);
		newDoc.close();

		// get the callback name:
		var cbName = this.getIframeCbName( targetId );
		// Else do a normal async include:
		window[ cbName ] = function( iframeParts ){
			// update the header:
			var head = iframeElm.contentDocument.getElementsByTagName("head")[0] || iframeElm.documentElement;
			head.innerHTML = iframeParts.rawHead;
			// append the scripts:
			iframeElm.contentDocument.getElementById("scriptsHolder").innerHTML = iframeParts.rawScripts;

			var nodeName = function ( elem, name ) {
				return elem.nodeName && elem.nodeName.toUpperCase() === name.toUpperCase();
			}
			// eval a script in the iframe context
			var evalScript = function ( elem ) {
				var data = ( elem.text || elem.textContent || elem.innerHTML || "" );
				var head = iframeElm.contentDocument.getElementsByTagName("head")[0] || iframeElm.documentElement;
				var script = iframeElm.contentDocument.createElement("script");
				script.type = "text/javascript";
				script.appendChild( document.createTextNode( data ) );
				head.insertBefore( script, head.firstChild );
				//head.removeChild( script );
				if ( elem.parentNode ) {
					elem.parentNode.removeChild( elem );
				}
			}

			var scripts = [];
			var headElm = head.childNodes;
			//var ret = iframeElm.contentDocument.body.childNodes;
			var ret = iframeElm.contentDocument.getElementById("scriptsHolder").childNodes;
			for ( var i = 0; ret[i]; i++ ) {
				if ( scripts && nodeName( ret[i], "script" ) && (!ret[i].type || ret[i].type.toLowerCase() === "text/javascript") ) {
					scripts.push( ret[i].parentNode ? ret[i].parentNode.removeChild( ret[i] ) : ret[i] );
				}
			}
			// eval all the raw scripts
			for( var script in scripts ){
				evalScript( scripts[ script ] );
			}
		}

		// Add the iframe script:
		_this.appendScriptUrl( this.getIframeUrl() + '?' +
			this.getIframeRequest( widgetElm, settings ) +
			'&callback=' + cbName +
			'&parts=1');
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
		// add ps if set: 
		if( mw.getConfig( 'Kaltura.KWidgetPsPath') ){
			iframeRequest+= '&pskwidgetpath=' + mw.getConfig( 'Kaltura.KWidgetPsPath');
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

		if( this.isUiConfIdHTML5(settings.uiconf_id) ) {
			iframeRequest+= '&forceMobileHTML5=true';
		}

		// Also append the script version to purge the cdn cache for iframe:
		iframeRequest += '&urid=' + MWEMBED_VERSION;
		return iframeRequest;
	},
	getIframeUrl: function(){
		var path = this.getPath();
		if( mw.getConfig('Kaltura.ForceIframeEmbed') === true ) {
			// In order to simulate iframe embed we need to use different host
			path = path.replace( 'localhost', '127.0.0.1' );
		}
		return path + 'mwEmbedFrame.php';
	},
	getPath: function(){
		return SCRIPT_LOADER_URL.replace( 'load.php', '');
	},
	/**
	 * Output an iframe without api. ( should rarely be used, this disable on page javascript api,
	 * as well as native fullscreen on browsers that support it.
	 *
	 * @param {string} replaceTargetId target container for iframe
	 * @param {object} kEmbedSettings object used to build iframe settings
	 */
	outputIframeWithoutApi: function( targetId, settings ) {
		var targetEl = document.getElementById(targetId);
		var iframeSrc = this.getIframeUrl() + '?' + this.getIframeRequest( targetEl, settings ) + '&iframeembed=true';
		var targetNode = document.getElementById( targetId );
		var parentNode = targetNode.parentNode;
		var iframe = document.createElement('iframe');
		iframe.src = iframeSrc;
		iframe.id = targetId;
		iframe.width = (settings.width) ? settings.width.replace(/px/, '' ) : '100%';
		iframe.height = (settings.height) ? settings.height.replace(/px/, '' ) : '100%';
		iframe.className = targetNode.className ? ' ' +  targetNode.className : '';
		// Update the iframe proxy style per org embed widget:
		iframe.style.cssText =  targetNode.style.cssText;
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
		// Make sure we proxy the ready callback: 
		this.proxyJsCallbackready();
	},

	/**
	 * Search the DOM for Object tags and rewrite them if they should be rewritten.
	 *
	 * rewrite rules include:
	 * - userAgentRules -- may result in loading uiConf rewrite rules
	 * - forceMobileHTML5 -- a url flag to force HTML5 for testing, can be disabled on iframe side,
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
	// Global instance of uiConf ids and associated script loaded state
	uiConfScriptLoadList: {},


	/**
	 * Stores a callback for inLoadJs ( replaced by direct callback if that is all the players we are worried about )
	 */
	// flag for done loading uiConfJs
	inLoaderUiConfJsDone: false,
	inLoaderUiConfJsCallbackSet: [],
	inLoaderUiConfJsCallback: function(){
		this.inLoaderUiConfJsDone = true;
		while( this.inLoaderUiConfJsCallbackSet.length ){
			this.inLoaderUiConfJsCallbackSet.shift()();
		}
	},
	/**
	 * Check if any player is missing uiConf javascript:
	 * @param {object} playerList List of players to check for missing uiConf js
	 */
	isMissingUiConfJs: function( playerList ){
		// Check if we are waiting for inLoader uiconf js:
		if( this.inLoaderUiConfJsDone == false ){
			return true;
		}
		// Check if we need to load uiConfJs ( for non-inLoaderUiConfJs )
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
	uiConfScriptLoadListCallbacks: {},
	/**
	 * Loads the uiConf js for a given playerList
	 * @param {object} playerList list of players to check for uiConf js
	 * @param {function} callback, called once all uiConf service calls have been made
	 */
	loadUiConfJs: function( playerList, doneCallback ){
		var _this = this;
		// Check if we cover all uiConfs via inLoaderUiConfJs
		var callback = function(){
			// check if the done flag has been set:
			if( _this.inLoaderUiConfJsDone ){
				doneCallback()
			} else {
				// replace the callback
				_this.inLoaderUiConfJsCallbackSet.push( doneCallback );
			}
			return ;
		}

		// We have not yet loaded uiConfJS... load it for each ui_conf id
		var baseUiConfJsUrl = this.getPath() + 'services.php?service=uiconfJs';
		// add ps if set: 
		if( mw.getConfig( 'Kaltura.KWidgetPsPath') ){
			baseUiConfJsUrl+= '&pskwidgetpath=' + mw.getConfig( 'Kaltura.KWidgetPsPath');
		}
		if( !this.isMissingUiConfJs( playerList ) ){
			// called with empty request set:
			callback();
			return ;
		}
		var foundPlayerMissingUiConfJs = false;
		for( var i=0;i < playerList.length; i++){
			// Create a local scope for the current uiconf_id:
			(function( settings ){
				if( _this.uiConfScriptLoadList[ settings.uiconf_id ] ){
					// player ui conf js is already loaded skip:
					return ;
				}
				foundPlayerMissingUiConfJs = true;
				// Setup uiConf callback so we don't risk out of order execution
				var cbName = 'kUiConfJs_' + i + '_' + settings.uiconf_id;
				if( ! _this.uiConfScriptLoadListCallbacks[ cbName ] ){
					_this.uiConfScriptLoadListCallbacks[ cbName ] = [ callback ];
					window[ cbName ] = function(){
						_this.uiConfScriptLoadList[ settings.uiconf_id ] = true;
						// issue all uiConfScriptLoad callbacks: 
						for( var inx in _this.uiConfScriptLoadListCallbacks[ cbName ] ){
							if( typeof _this.uiConfScriptLoadListCallbacks[ cbName ][inx] == 'function' ){
								_this.uiConfScriptLoadListCallbacks[ cbName ][inx]();
							}
						};
					};
					// add the services.php includes:
					_this.appendScriptUrl( baseUiConfJsUrl + _this.embedSettingsToUrl( settings ) + '&callback=' + cbName );
				} else {
					// add the callback
					_this.uiConfScriptLoadListCallbacks[ cbName ].push( callback );
				}
				
			})( playerList[i].kEmbedSettings );
		}
		// check if we should wait for a player to load its uiConf:
		if( !foundPlayerMissingUiConfJs ){
			callback();
			return ;
		}
	},

	/**
	 * Write log message to the console
	 * TODO support log levels: https://github.com/kaltura/mwEmbed/issues/80
	 */
	 log: function( msg ) {
		// only log if debug is active:
		if( typeof mw != 'undefined' && !mw.getConfig( 'debug') ){
			return ;
		}
		if( typeof console != 'undefined' && console.log ) {
			console.log( "kWidget: " + msg );
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
	 isIE:function(){
  		return /\bMSIE\b/.test(navigator.userAgent);
	 },
	 isAndroid: function() {
	 	return (navigator.userAgent.indexOf('Android ') != -1);
	 },
	 isWindowsDevice: function() {
	   var appVer = navigator.appVersion;
	   return  ((appVer.indexOf("Win")!=-1 && 
			(navigator.appVersion.indexOf("Phone")!=-1 || navigator.appVersion.indexOf("CE")!=-1))); 
	 },
	 /**
	  * Checks for mobile devices
	  **/
	 isMobileDevice:function() {
		 return (this.isIOS() || this.isAndroid() || this.isWindowsDevice());
	 },

	 /**
	  * Checks if a given uiconf_id is html5 or not
	  * @param {string} uiconf_id The uiconf id to check against user player agent rules
	  */
	 isUiConfIdHTML5: function( uiconf_id ){
		 var isHTML5 = this.isHTML5FallForward();
		 if( this.userAgentPlayerRules && this.userAgentPlayerRules[ uiconf_id ]){
			 var playerAction = this.checkUserAgentPlayerRules( this.userAgentPlayerRules[ uiconf_id ] );
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
		 // Only return true if the browser actually supports html5
		 if( 
		 	( mw.getConfig( 'KalturaSupport.LeadWithHTML5' ) || mw.getConfig( 'Kaltura.LeadWithHTML5' ) )
		 	&& 
		 	this.supportsHTML5()
		 ){
			 return true;
		 }

		 // Special check for Android:
		 if( this.isAndroid() ){
			 if( mw.getConfig( 'EmbedPlayer.UseFlashOnAndroid' )
					 &&
				kWidget.supportsFlash()
			){
				// Use flash on Android if available
				return false;
			 } else {
				// Some Android supports the video tag
				return true;
			}
		 }

		/**
		 * If the browser supports flash ( don't use html5 )
		 * On ModernUI IE10, Flash is integrated. However, our Flash detection on IE looks for ActiveX which is disabled, thus failing.
		 */
		if( kWidget.supportsFlash() ){
			return false;
		}

		/**
		 * Allow forcing flash on IE10
		 * Since we don't check Microsoft's CV list, we cannot say whether a domain has been whitelisted for Flash or not.
		 * Due to that, we fallback to HTML5 player on Modern UI IE10 by default
		 * Using this flag this can be overriden.
		 */
		if( mw.getConfig( 'Kaltura.ForceFlashOnIE10' ) ) {
			var ua = navigator.userAgent;
			var ie10Match = ua.match( /MSIE\s10/ );
			if ( ie10Match ) {
				return false;
			}
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
	  * 		or a specialized entry point for cases where we don't have the api is available
	  *
	  * @param {object} Entry settings used to generate the api url request
	  */
	 getKalturaThumbUrl: function ( settings ){

		var sizeParam = '';
	 	if( settings.width != '100%' && settings.width ){
	 		sizeParam+= '/width/' + parseInt( settings.width );
	 	}
	 	if( settings.height != '100%' && settings.height  ){
	 		sizeParam+= '/height/' +  parseInt( settings.height );
	 	} 
	 	// if no height or width is provided default to 480P
	 	if( !settings.height && !settings.width){
	 		sizeParam+='/height/480';
	 	}
	 
	 	var vidParams = '';
	 	if( settings.vid_sec ){
	 		vidParams += '/vid_sec/' + settings.vid_sec;
	 	}
	 	if( settings.vid_slices ){
	 		vidParams += '/vid_slices/' + settings.vid_slices;
	 	}

	 	var flashVars = {};

	 	// Add the ks if set ( flashvar overrides settings based ks )
	 	if( settings.ks ) {
	 		flashVars[ 'ks' ] = settings.ks;
	 	}
	 	if( settings.flashvars && settings.flashvars.ks ) {
	 		flashVars[ 'ks' ] = settings.flashvars.ks;
	 	}

	 	// Add referenceId if set
		if( settings.flashvars && settings.flashvars.referenceId ) {
	 		flashVars[ 'referenceId' ] = settings.flashvars.referenceId;
	 	}	 	

	 	if( settings.p && ! settings.partner_id ){
	 		settings.partner_id = settings.p;
	 	}
	 	if( ! settings.partner_id && settings.wid ){
	 		//this.log("Warning, please include partner_id in your embed settings");
	 		settings.partner_id = settings.wid.replace('_', '');
	 	}

	 	// Check for entryId
	 	var entryId = (settings.entry_id) ? '/entry_id/' + settings.entry_id : '';

	 	// Return the thumbnail.php script which will redirect to the thumbnail location
	 	return this.getPath() + 'modules/KalturaSupport/thumbnail.php' +
	 		'/p/' + settings.partner_id +
	 		'/uiconf_id/' + settings.uiconf_id +
	 		entryId + 
	 		sizeParam +
	 		vidParams + 
	 		'?' + this.flashVarsToUrl( flashVars );
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

		if( ! swfUrl ) {
			return {};
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
			 // check for object representation of plugin config:
			 if( typeof flashVarsObject[i] == 'object' ){
				 for( var j in flashVarsObject[i] ){
					 params+= '&' + '' + encodeURIComponent( i ) +
					 	'.' + encodeURIComponent( j ) +
					 	'=' + encodeURIComponent( flashVarsObject[i][j] );
				 }
			 } else {
				 params+= '&' + '' + encodeURIComponent( i ) + '=' + encodeURIComponent( flashVarsObject[i] );
			 }
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
			 var curVal = typeof flashVarsObject[i] == 'object'?
					 JSON.stringify( flashVarsObject[i] ):
					 flashVarsObject[i]
			 params+= '&' + 'flashvars[' + encodeURIComponent( i ) + ']=' +
			 	encodeURIComponent(  curVal );
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
	  * Checks if the current page has jQuery defined, else include it and issue callback
	  */
	 jQueryLoadCheck: function( callback ){
		 if( ! window.jQuery || ! mw.versionIsAtLeast( "1.7.2", window.jQuery.fn.jquery ) ){
			 // Set clientPagejQuery if already defined, 
			 if( window.jQuery ){
				 window.clientPagejQuery = window.jQuery.noConflict();
			 }
			 this.appendScriptUrl( this.getPath() + 'resources/jquery/jquery.min.js', function(){
				 // remove jQuery from window scope if client has already included older jQuery
				 window.kalturaJQuery = window.jQuery.noConflict(); 
				 // Restore client jquery to base target
				 if( window.clientPagejQuery ){
					 window.jQuery = window.$ = window.clientPagejQuery;
				 }
				 
				 // Run all on-page code with kalturaJQuery scope 
				 // ( pass twice to poupluate $, and jQuery )  
				 callback( window.kalturaJQuery, window.kalturaJQuery );
			 });
		 } else {
			 // update window.kalturaJQuery reference:
			 window.kalturaJQuery = window.jQuery;
			 callback( window.jQuery, window.jQuery);
		 }
	 },
	 // similar to jQuery.extend 
	 extend: function( obj ){
		 Array.prototype.slice.call(arguments, 1).forEach(function(source) {
			if (source) {
				for (var prop in source) {
					if (source[prop].constructor === Object) {
						if (!obj[prop] || obj[prop].constructor === Object) {
							obj[prop] = obj[prop] || {};
							extend(obj[prop], source[prop]);
						} else {
							obj[prop] = source[prop];
						}
					} else {
						obj[prop] = source[prop];
					}
				}
			}
		});
		return obj;
	},
	// similar to parm
	param: function( obj ){
		var o = '';
		var and ='';
		for( var i in obj ){
			o+= and + i + '=' + encodeURIComponent( obj[i] );
			and = '&';
		}
		return o;
	},
	 /**
	  * Append a set of urls, and issue the callback once all have been loaded
	  * @param {array} urls
	  * @param {function} callback
	  */
	 appendScriptUrls: function( urls, callback ){
		 var _this = this;
		 var loadCount = 0;
		 if( urls.length == 0 ){
			 if( callback ) callback();
			 return ;
		 }
		 for( var i = 0 ; i < urls.length; i++ ){
			(function( inx ){
				_this.appendScriptUrl(urls[inx], function(){
					loadCount++;
					if( loadCount == urls.length ){
						if( callback ) callback();
					}
				})
			})( i );
		 }
	},
	/**
	 * Append a script to the dom:
	 * @param {string} url
	 * @param {function} callback
	 * @param {object} Document to append the script on
	 */
	appendScriptUrl: function( url, callback, docContext ) {
		if( ! docContext ){
			docContext = document;
		}
		var head = docContext.getElementsByTagName("head")[0] || docContext.documentElement;
		var script = docContext.createElement("script");
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
	 * Add css to the dom
	 * @param {string} url to append to the dom
	 */
	appendCssUrl: function( url ){
		var head = document.getElementsByTagName("head")[0];
		var cssNode = document.createElement('link');
		cssNode.type = 'text/css';
		cssNode.rel = 'stylesheet';
		cssNode.media = 'screen';
		cssNode.href = url;
		head.appendChild(cssNode);
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
	 * Abstract support for adding events uses:
	 * http://ejohn.org/projects/flexible-javascript-events/
	 */
	addEvent: function( obj, type, fn, useCapture) {
		if ( obj.attachEvent ) {
			obj['e'+type+fn] = fn;
			obj[type+fn] = function(){obj['e'+type+fn]( window.event );}
			obj.attachEvent( 'on'+type, obj[type+fn] );
		} else {
			obj.addEventListener( type, fn, !!useCapture );
		}
	},
	/**
	 * Abstract support for removing events uses
	 */
	removeEvent: function( obj, type, fn ) {
		if ( obj.detachEvent ) {
			obj.detachEvent( 'on'+type, obj[type+fn] );
			obj[type+fn] = null;
		} else {
			obj.removeEventListener( type, fn, false );
		}
	},
	/** 
	 * Check if object is empty
	 */
	isEmptyObject: function( obj ) {
		var name;
		for ( name in obj ) {
			return false;
		}
		return true;
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

					if( kEmbedSettings.uiconf_id && ( kWidget.isHTML5FallForward() || ! kWidget.supportsFlash() ) ){
						document.getElementById( targetId ).innerHTML = '<div style="width:100%;height:100%" id="' + attributes.id + '"></div>';
						doEmbedSettingsWrite( kEmbedSettings, attributes.id, attributes.width, attributes.height);
					} else {
						// Use the original flash player embed:
						return originalFlashembed( targetId, attributes, flashvars );
					}
				});
			};
			// add static methods
			var flashembedStaticMethods = ['asString', 'getHTML', 'getVersion', 'isSupported'];
			for(var i=0; i < flashembedStaticMethods.length; i++ ){
				window['flashembed'][ flashembedStaticMethods[i] ] =originalFlashembed
			}
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
