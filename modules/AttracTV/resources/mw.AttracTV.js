( function( mw, $ ) { "use strict";

var _this;

mw.AttracTV = function( embedPlayer, callback ){
	return this.init( embedPlayer, callback );
};

mw.AttracTV.prototype = {
	bindPostfix: '.AttracTV',
	
	init: function(  embedPlayer, callback){
		_this = this;
		this.embedPlayer = embedPlayer;
		this.bindPlayer();
		callback();
	},
	
	loadATV : function() {
		
		kWidget.appendScriptUrl("http://dev2.attractv.net/html5/atv/js/atvloader.js", function() {
			ATV.init("demo_key","http://services.attractv.net/newtvhive/cxf","33","ATVBox");
		}, document);
		
        //newScript.src = "http://www.atv.local/ATV5/Trunk/atv/js/atvloader.js";
	},
    
	bindPlayer: function(){
		
		var _this = this;
		// checkPlayerSourcesEvent ( add peer4 mediaStream source )
		
        this.embedPlayer.bindHelper( 'playerReady', function(){
				// Run the watermark plugin code
				
                _this.embedPlayer.getVideoHolder().append($('<div>')
				.attr('id', "ATVBox" )
				.css({
                    'border' : 'none',
					'position': 'absolute',
                    'z-index': 11
				}));
                
                _this.loadATV();
			});
        
        this.embedPlayer.bindHelper( 'monitorEvent' , function() {
				var currentTime = _this.embedPlayer.currentTime;
                if (ATV && ATV.Player && ATV.Player.videoTimeEvent) {
                  //  ATV.Player.videoTimeEvent(currentTime);   
                }
			} );
	},
    
	getConfig: function( propId ){
		// return the attribute value
		return this.embedPlayer.getKalturaConfig( 'AttracTV', propId );
	}
}

} )( window.mw, window.jQuery );