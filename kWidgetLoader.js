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
	outputFlashObject: function( targetId, settings, options ) {
		var elm = document.getElementById( targetId );
		// Output a normal flash object tag:
		if( elm && elm.parentNode ){
			var spanTarget = document.createElement("span");
			var pId =  ( settings.id )? settings.id : elm.id
			var swfUrl = mw.getConfig( 'Kaltura.ServiceUrl' ) + '/index.php/kwidget/'+
				'/wid/' + settings.wid +
				'/uiconf_id/' + settings.uiconf_id +
				'/entry_id/' + settings.entry_id;
			if( settings.cache_st ){
				swfUrl+= '/cache_st/' + settings.cache_st;
			}
			// get height/width embedSettings, attribute, style ( percentage or px ), or default 400x300
			var width = ( options.width ) ? options.width :
							( elm.width ) ? elm.width :
								( elm.style.width ) ? parseInt( elm.style.width ) : 400;

			var height = ( options.height ) ? options.height :
							( elm.height ) ? elm.height :
								( elm.style.height ) ? parseInt( elm.style.height ) : 300;

			var flashvarValue = ( settings.flashvars ) ? kFlashVarsToString( settings.flashvars ) : '&';

			spanTarget.innerHTML = '<object id="' + pId + '" ' +
				'name="' + pId + '" ' +
				'type="application/x-shockwave-flash" ' +
				'allowFullScreen="true" ' +
				'allowNetworking="all" ' +
				'allowScriptAccess="always" ' +
				'width="' + width +'" ' +
				'height="' + height + '" ' +
				'style="width:' + width + ';height:' + height + ';" ' +
				'resource="' + swfUrl + '" ' +
				'data="' + swfUrl + '" >' +
					'<param name="allowFullScreen" value="true" />' +
					'<param name="allowNetworking" value="all" />' +
					'<param name="allowScriptAccess" value="always" />' +
					'<param name="bgcolor" value="#000000" />' +
					'<param name="flashVars" value="' + flashvarValue + '" /> ' +
					'<param name="movie" value="' + swfUrl + '" />' +
			'</object>';
			elm.parentNode.replaceChild( spanTarget, elm );
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
	 }
};
// Support upper case kWidget calls
window.KWidget = window.kWidget;
