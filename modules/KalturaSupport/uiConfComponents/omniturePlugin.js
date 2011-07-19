/**
* Adds Omniture plugin support
* Read the fader plugin from the UIConf
* <Plugin id="fader" width="0%" height="0%" includeInLayout="false" target="{controllersVbox}" hoverTarget="{PlayerHolder}" duration="0.5"/>
*/


$j( mw ).bind( 'newEmbedPlayerEvent', function( event, embedPlayer ){
	$j( embedPlayer ).bind( 'KalturaSupport_CheckUiConf', function( event, $uiConf, callback ){
		var $omniture = $uiConf.find( "Plugin#omniture" );
		if( $omniture.length ){	
			mw.load('mw.Omniture',function(){
				// Alias the config lookup function for cleaner code: 
				var gP = function(prop){
					return kWidgetSupport.getPluginConfig($uiConf, 'omniture', prop);
				};
				
				// Make sure all the config takes flash override values or whats in the uiconf
				var omnitureConfig = gP(['trackingServer', 'visitorNamespace', 'account' ] );
				
				// Look for all the omnitureEvents ( in both places as well )
				var omnitureEvents = {
	                'videoViewEvent' : [],
					'shareEvent': [],
					'saveEvent': [],
					'openFullscreenEvent': [],
					'closefullscreenEvent': [],
					'saveEvent' : [],
					'replayEvent' : [],
					'seekEvent' : [],
					'changeMediaEvent': [],
					'gotoContributorWindowEvent': [],
					'gotoEditorWindowEvent': [],
					'playerPlayEndEvent': [],
					'mediaReadyEvent': []
				};

				embedPlayer.omniture = new mw.Omniture( omnitureConfig );
				// Get all the plugin config: 
				$j.each( omnitureEvents, function( eventName, na ){
					var eventId = gP( eventName );
					var eVars = [];
					var props = [];
					if( eventId ){
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
					}
					// Add the binding: 
					embedPlayer.addJsListener( eventName.replace( 'Event', ''), function(){
						
					});
				});
				callback();
			});
		} else {
			// no omniture, run callback directly
			callback();
		}
	});
});
