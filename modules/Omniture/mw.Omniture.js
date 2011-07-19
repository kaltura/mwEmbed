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
 		this.embedPlayer = embedPlayer;
 		// Check for required config: 
 		this.confg = config;
 	},
 	dispatchEvent: function( eventId, eVars, props ){
 		// dispatch the event to the log: 
 		if( mw.getConfig( 'Omniture.DispatchLog' ) ){
 			mw.getConfig( 'Omniture.DispatchLog' )( eventId, eVars, props );
 		}
 		// Send an Omniture beacon
 		
 	}
};