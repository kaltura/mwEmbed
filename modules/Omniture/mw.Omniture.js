
 mw.Omniture = function(  embedPlayer, config ){
 	return this.init(  embedPlayer, config );
 };

 mw.Omniture.prototype = {
 	init: function(  embedPlayer, config ){
 		this.embedPlayer = embedPlayer;
 		this.confg = config;
 		this.addBindings();
 	},
 	addBindings: function(){
 		
 	}
 };