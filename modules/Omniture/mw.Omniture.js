/**
 * Very light plugin to send Omniture beacons
 * @param embedPlayer
 * @param config
 */
( function( mw, $ ) { "use strict";

mw.Omniture = function( embedPlayer, pluginName,  callback ){
 	return this.init( embedPlayer,  pluginName, callback );
};

mw.Omniture.prototype = {
 	init: function( embedPlayer, pluginName, callback ){
		var _this = this;
		this.pluginName = pluginName;
		// Setup reference to embedPlayer
		this.embedPlayer = embedPlayer;
 		
 		if( !this.getConfig('trackingServer') ){
 			mw.log( "Error:: mw.Omniture missing tracking server" );
 		}
 		if( !this.getConfig('account') ){
 			mw.log( "Error: mw.Omniture missing account name" );
 		}
 		this.addPlayerBindings();
 		// After all bindings are setup issue the callback
  		callback();
 	},
 	getConfig: function( key ){
 		return this.embedPlayer.getKalturaConfig(this.pluginName , key );
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
		// local get config method for short hand representation.  
		var gP = function( key ){
			return this.getConfig( key );
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
 		// Dispatch the event across the iframe 
 		$( this.embedPlayer ).trigger( 'Omniture_DispatchEvent', $.makeArray( arguments ) );
 		// Send an Omniture beacon XXX we need s_code.js !
 	}
};

} )( mw, jQuery );