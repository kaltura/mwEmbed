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
		
		var _this = this;
		
		kWidget.appendScriptUrl("http://services.attractv.net/newtvhive/rest/asset/atvloader.js", function() {
		//kWidget.appendScriptUrl("http://www.atv.local/ATV5/Trunk/atv/js/atvloader.js", function() {
			var attr = _this.getConfig();
			ATV.init(attr.PublisherKey,"http://services.attractv.net/newtvhive/cxf",attr.BarId,"ATVBox");
		}, document);

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
				
				$("#ATVBox").click(function(e){
					// Since our overlay is all over the player we need to make it play when pressed
					var domElem = document.elementFromPoint(e.pageX, e.pageY);
					if (domElem.id === "ATVBox") {
						_this.embedPlayer.play();
					}
				 });
                
                _this.loadATV();
			});
        
        this.embedPlayer.bindHelper( 'monitorEvent' , function() {
				var currentTime = _this.embedPlayer.currentTime;
                if (ATV && ATV.Player && ATV.Player.videoTimeEvent) {
                    ATV.Player.videoTimeEvent(currentTime);   
                }
			} );
	},
    
	getConfig: function( propId ){
		// return the attribute value
		return this.embedPlayer.getKalturaConfig( 'AttracTV', propId );
	}
}

} )( window.mw, window.jQuery );