/**
* Wraps jQuery.prettyKalturaConfig with a single object based config and support for custom
* entry, uiconf and wid ( partner )
* 
* @dependencies jQuery, jQuery.prettyKalturaConfig
*/
( function( kWidget ){ "use strict"
	
	kWidget.featureConfig = function( options ){
		// set update method in local function so we can call it any time we re-render the player
		var updateOptionsWithLocalSettings = function(){
			// Check for any kdoc-embed localStorage setting overrides
			var setKeys = ['wid', 'uiconf_id', 'entry_id'];
			$.each( setKeys, function(inx, key){
				if( options.embed && options.embed[ key] && localStorage[ 'kdoc-embed-' + key ] ){
					 options.embed[ key] = localStorage[ 'kdoc-embed-' + key ];
				}
			});
		}
		updateOptionsWithLocalSettings();
		
		// Do a special check for plugins with "ks" if we have a localStorage override. 
		if( localStorage[ 'kdoc-embed-ks' ] && options.embed && options.embed.flashvars ){
			$.each(options.embed.flashvars, function( pKey, pObj){
				if( pKey == 'ks'){
					options.embed.flashvars[ pKey ] = localStorage[ 'kdoc-embed-ks' ];
				}
				if( $.isPlainObject( pObj ) ){
					$.each( pObj, function( pluginKey, pluginValue ){
						if( pluginKey == 'ks' ){
							options.embed.flashvars[ pKey ][pluginKey] = localStorage[ 'kdoc-embed-ks' ];
						}
					})
				}
			})
		}
		
		// By convention we document the first plugin ontop ( prettyKalturaConfig initial design 
		// required passing a given pluginId. 
		var firstPluginId = null;
		$.each( options.embed.flashvars, function( pName, na ) {
			firstPluginId = pName;
			return false;
		})
		// read any url overrides from hash payload
		
		// display pretty config box:
		$('#' + options.featureConfigId ).prettyKalturaConfig(
				firstPluginId, 
				options.embed.flashvars, 
				function(fv){
					// in case the callback resulted in local settings update
					updateOptionsWithLocalSettings();
					// update flashvars:
					options.embed.flashvars = fv;
					// update player embed:
					kWidget.embed( options.embed );
				},
				true
		)
		// do the actual kWidget embed
		kWidget.embed( options.embed );
	}
	
})( window.kWidget );