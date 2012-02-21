/**
 * KWidget static object.
 * Will eventually host all the loader logic.
 */
window.kWidget = {
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
		kalturaIframeEmbed( targetId, settings );
	},

	/*
	 * Create flash object tag
	 */
	outputFlashObject: function( targetId, settings ) {
		var elm = document.getElementById( targetId );
		// Output a normal flash object tag:
		if( elm && elm.parentNode ){
			var spanTarget = document.createElement("span");
			var pId =  ( settings.id )? settings.id : elm.id
			var swfUrl = mw.getConfig( 'Kaltura.ServiceUrl' ) + '/index.php/kwidget/'+
				'/wid/' + settings.wid +
				'/uiconf_id/' + settings.uiconf_id;
			
			if( settings.entry_id ){
				swfUrl+= '/entry_id/' + settings.entry_id;
			}
			if( settings.cache_st ){
				swfUrl+= '/cache_st/' + settings.cache_st;
			}
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
			}
			var o = '<object id="' + pId + '" ' +
				'name="' + pId + '" ';
			// output classid if in IE
			if(  window.ActiveXObject ){
				o += 'classid="clsid:D27CDB6E-AE6D-11cf-96B8-444553540000" ';
			}
			o += 'width="' + width +'" ' +
				'height="' + height + '" ' +
				'style="width:' + width + 'px;height:' + height + 'px;" ' +
				'resource="' + swfUrl + '" ' +
				'data="' + swfUrl + '" ';
			var p = '<param name="flashVars" value="' + flashvarValue + '" /> ' +
					'<param name="movie" value="' + swfUrl + '" />';
			
			for( var key in defaultParamSet ){
				var value = ( typeof settings[key] != 'undefined' ) ? settings[key]: defaultParamSet[ key ];
				o+= key + '="' + value + '" ';
				p+= '<param name="' + key + '" value="' + value + '" />';
			}
			var objectTag = o + ' > ' + p + '</object>'; 
			// update the span target: 
			elm.parentNode.replaceChild( spanTarget, elm );
			spanTarget.innerHTML = 	objectTag;	
		}
	},	
	/**
	 * Adds a ready callback to be called once the kdp or html5 player is ready
	 */
	addReadyCallback : function( readyCallback ){
		// issue the ready callback for any existing ready widgets:
		for( var wid in this.readyWidgets ){
			// Make sure the widget is not already ready
			if( document.getElementById( wid ) ){
				readyCallback( wid );
			}
		}
		// Add the callback to the readyCallbacks array for any other players that become ready
		this.readyCallbacks.push( readyCallback );
	},
	/**
	 * Takes in the global ready callback events and ads them to the
	 * readyWidgets array
	 * @param playerId
	 * @return
	 */
	globalJsReadyCallback: function( widgetId ){
		// issue the callback for all readyCallbacks
		while( this.readyCallbacks.length ){
			this.readyCallbacks.shift()( widgetId );
		}
		this.readyWidgets[ widgetId ] = true;
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
	 }
};
// Support upper case kWidget calls
window.KWidget = window.kWidget;
