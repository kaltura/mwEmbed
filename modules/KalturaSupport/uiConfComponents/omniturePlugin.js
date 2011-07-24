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
		
		if(! pluginEnabled ){	
			// no Omniture, run callback directly
			callback();
			return ;
		}
		
		mw.load('mw.Omniture',function(){
			// Make sure all the config takes flash override values or whats in the uiconf
			var omnitureConfig = gP( ['trackingServer', 'visitorNamespace', 'account' ] );
			
			embedPlayer.omniture = new mw.Omniture( embedPlayer, omnitureConfig );
			
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
				for( var i = 1 ; i < 10; i++ ){
					var eVarId = gP( eventName + 'Evar' + i ); 
					var eVarVal = gP( eventName + 'Evar' + i + 'Value' );
					// Stop looking for more eVars if we did not find one:
					if( ! eVarId ){
						break;
					}
					var v = {};
					v[eVarId] =embedPlayer.evaluate( eVarVal );
					eVars.push( v );
				}
				// Look for up-to 10 associated Props
				for( var i = 1 ; i < 10; i++ ){
					var ePropId = gP( eventName + 'Prop' + i );
					var ePropVal = gP( eventName + 'Prop' + i + 'Value' );
					if( !ePropId )
						break;
					var v = {};
					v[ePropId] = embedPlayer.evaluate( ePropVal );
					props.push( v );
					
				}
				// Add the binding: 
				var kEventName = eventName.replace( 'Event', '');
				embedPlayer.addJsListener( kEventName, function(){
					embedPlayer.omniture.dispatchEvent( eventId, eVars, props, kEventName);
				});
			});
			// after all bindings are setup issue the callback
			callback();
		});
	});
});
