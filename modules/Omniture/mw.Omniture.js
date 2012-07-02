/**
 * Omniture plugin beacons
 * @param embedPlayer
 * @param config
 */
( function( mw, $ ) { "use strict";

// set default omniture sCode path: 
mw.setDefaultConfig('Omniture.ScodePath', mw.getMwEmbedPath() + '/modules/Omniture/s_code.js' );

mw.Omniture = function( embedPlayer, pluginName, config ){
 	return this.init( embedPlayer,  pluginName, config );
};

mw.Omniture.prototype = {
	config: null, 
 	init: function( embedPlayer, pluginName, callback ){
		var _this = this;
		// Setup reference to embedPlayer
		this.embedPlayer = embedPlayer;
		this.pluginName = pluginName;
 		
 		if( !this.getConfig().trackingServer ){
 			mw.log( "Error:: mw.Omniture missing tracking server" );
 		}
 		if( !this.getConfig().account ){
 			mw.log( "Error: mw.Omniture missing account name" );
 		}
 		this.loadOmnitureCode(function({
 			_this.addPlayerBindings();
 	 		// After all bindings are setup issue the callback
 	  		callback();
 		}));
 	},
 	getConfig: function(){
 		// Make sure all the config takes flash override values or whats in the uiconf
 		if( !this.config ){
 			this.config = this.embedPlayer.getKalturaConfig(this.pluginName, ['trackingServer', 'visitorNamespace', 'account' ] );
 		}
 		return this.config;
 	},
 	loadOmnitureCode: function(){
 		var sCodePath = this.getConfig ( 'sCodePath' ) || 
 	},
 	addPlayerBindings: function(){
 		var _this = this;
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
		var embedPlayer = this.embedPlayer;
		var gP = function( eventName ){
			return embedPlayer.getKalturaConfig( 'omniture', eventName )
		};
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
				v[eVarId] = embedPlayer.evaluate( eVarVal );
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
				_this.dispatchEvent( eventId, eVars, props, kEventName);
			});
		});
 	},
 	/**
 	 * Dispatches an event to  
 	 * 
 	 * @param {String} eventId The omniture event id
 	 * @param {Object} eVars The set of eVar name value pairs
 	 * @param {Object} props The set of omniture props
 	 * @param {=String} eventName Optional eventName for logging ( not used in the omniture beacon )
 	 * @return
 	 */
 	dispatchEvent: function( eventId, eVars, props, eventName ){
 		// Dispach the event across the iframe 
 		$( this.embedPlayer ).trigger( 'Omniture_DispatchEvent', $.makeArray( arguments ) );
 		// Send an Omniture beacon XXX we need s_code.js !
 		
 	}
};

} )( mw, jQuery );