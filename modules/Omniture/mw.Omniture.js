/**
 * Very light plugin to send Omniture beacons
 * @param embedPlayer
 * @param config
 */
 mw.Omniture = function( config ){
 	return this.init(  config );
 };

mw.Omniture.prototype = {
	
 	init: function( config ){
		var _this = this;
 		// Check for required config: 
 		this.config = config;
 		
 		if( !this.config.trackingServer ){
 			mw.log( "Error:: mw.Omniture missing tracking server" );
 		}
 		if( !this.config.account ){
 			mw.log( "Error: mw.Omniture missing account name" );
 		}
 	},
 	/**
 	 * 
 	 * @param {String} eventId The omniture event id
 	 * @param {Object} eVars The set of eVar name value pairs
 	 * @param {Object} props The set of omniture props
 	 * @param {=String} eventName Optional eventName for logging ( not used in the omniture beacon )
 	 * @return
 	 */
 	dispatchEvent: function( eventId, eVars, props, eventName ){
 		// dispatch the event to the log: 
 		if( mw.getConfig( 'Omniture.DispatchLog' ) ){
 			mw.getConfig( 'Omniture.DispatchLog' )( eventId, eVars, props, eventName );
 		}
 		// Send an Omniture beacon
 		
 	}
};