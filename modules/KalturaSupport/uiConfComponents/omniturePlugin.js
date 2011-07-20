/**
* Adds Omniture plugin support
*/
// XXX can remove once we move to new resource loader:
window.omniturePlugin = true;

$j( mw ).bind( 'newEmbedPlayerEvent', function( event, embedPlayer ){
	$j( embedPlayer ).bind( 'KalturaSupport_CheckUiConf', function( event, $uiConf, callback ){
		// Alias the config lookup function for clean code lookup of properties
		var gP = function( prop ){
			return kWidgetSupport.getPluginConfig(embedPlayer, $uiConf, 'omniture', prop);
		};
		// Check the "plugin" prop of 'omniture'
		var pluginEnabled = gP( 'plugin' );
		if( pluginEnabled ){	
			mw.load('mw.Omniture',function(){
				// Make sure all the config takes flash override values or whats in the uiconf
				var omnitureConfig = gP( ['trackingServer', 'visitorNamespace', 'account' ] );
				
				embedPlayer.omniture = new mw.Omniture( omnitureConfig );
				
				var omintureEvents = [ 
				    'videoViewEvent' ,
					'shareEvent',
					'saveEvent',
					'openFullscreenEvent',
					'closefullscreenEvent',
					'saveEvent',
					'replayEvent',
					'seekEvent',
					'changeMediaEvent',
					'gotoContributorWindowEvent',
					'gotoEditorWindowEvent',
					'playerPlayEndEvent',
					'mediaReadyEvent'
				];
				
				// Get all the plugin config for all the omniture events 
				$j.each( omintureEvents , function( inx, eventName){
					var eventId = gP( eventName );
					if( ! eventId ){						
						return true; // next
					}
					var eVars = [];
					var props = [];
					// Look for up-to 10 associated eVars
					for( var i = 0 ; i < 10; i++ ){
						var eVarId = gP( eventName + 'Evar' + i ); 
						var eVarVal = gP( eventName + 'Evar' + i + 'Value' );
						// Stop looking for more eVars if we did not find one:
						if( ! eVarId ){
							break;
						}
						eVars.push([eVarId,eVarVal]);
					}
					// Look for up-to 10 associated Props
					for( var i = 0 ; i < 10; i++ ){
						var ePropId = gP( eventName + 'Prop' + i );
						var ePropVal = gP( eventName + 'Prop' + i + 'Value' );
						if( !ePropId )
							break;
						props.push( ePropId, ePropVal);
						
					}
					// Add the binding: 
					embedPlayer.addJsListener( eventName.replace( 'Event', ''), function(){
						embedPlayer.omniture.dispatchEvent( eventId, eVars, props, eventName);
					});
				});
				// after all bindings are setup issue the callback
				callback();
			});
		} else {
			// no omniture, run callback directly
			callback();
		}
	});
});
