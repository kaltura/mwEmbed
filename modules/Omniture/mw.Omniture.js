/**
 * Very light plugin to send Omniture beacons
 * @param embedPlayer
 * @param config
 */
( function( mw, $){

mw.Omniture = function( embedPlayer, config ){
 	return this.init( embedPlayer,  config );
};

mw.Omniture.prototype = {
	
 	init: function( embedPlayer, config ){
		var _this = this;
		// Setup reference to embedPlayer
		this.embedPlayer = embedPlayer;
		
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
 	 * Dispatches an event to  
 	 * 
 	 * @param {String} eventId The omniture event id
 	 * @param {Object} eVars The set of eVar name value pairs
 	 * @param {Object} props The set of omniture props
 	 * @param {=String} eventName Optional eventName for logging ( not used in the omniture beacon )
 	 * @return
 	 */
 	dispatchEvent: function( eventId, eVars, props, eventName ){
 		$( this.embedPlayer ).trigger( 'Omniture_DispachEvent', $.makeArray( arguments ) );
 		// Send an Omniture beacon
 		// XXX We need Omniture beacon documentation!
 	}
};

} )( mw, jQuery );