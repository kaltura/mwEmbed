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
		window['kalturaDynamicEmbed']  = true; // Make sure we don't call restoreJsReadyCallback in dynamic embedding
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
					settings.readyCallback( videoId )
				}
			});
		}
		kalturaIframeEmbed( targetId, settings );
	},
	/**
	 * Adds a ready callback to be called once the kdp or html5 player is ready
	 */
	addReadyCallback : function( readyCallback ){
		// issue the ready callback for any existing ready widgets:
		for( var wid in this.readyWidgets ){
			// Make sure the widget is still in the dom before running the ready callback
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
