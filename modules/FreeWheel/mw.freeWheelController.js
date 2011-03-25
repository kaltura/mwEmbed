mw.addFreeWheelControler = function( embedPlayer, $adConfig, callback ) {
	embedPlayer.freeWheelAds = new mw.freeWheelControler({ 
		'embedPlayer' : embedPlayer,
		'$adConfig' :$adConfig,
		'callback' :  callback
	});
};

mw.freeWheelControler = function( opt ){
	return this.init( opt );
};

mw.freeWheelControler.prototype = {
	init: function( opt ){
		$j.extend( this, opt);
		this.setupAds();
	},
	setupAds: function(){
		var _this = this;
		this.freewheel= new tv.freewheel.SDK.AdManager();
		this.freewheel.registerVideoDisplayBase( "videoContainer" );
		this.freewheel.setVideoAsset( "test",  this.embedPlayer.duration );
		this.freewheel.setSiteSection( "test" );
		this.freewheel.setServerURL( 'http://demo.v.fwmrm.net/ad/g/1?nw=81026&prof=81026:html5&flag=+sltp+exvt+slcb+unka+unks;' );
		this.freewheel.submitRequest( function(){ 
			_this.adsRequestComplete();
		}, 2000 );
	},
	adsRequestComplete: function(){
		var _this = this;
		mw.log("freeWheelControler::adsRequestComplete>" + this.callback);
		if( this.callback )
			this.callback();
		// Built out our internal ad playing timeline ( we can't use freewheel playSlots since it
		// takes control of things )
		
		// read the ad repsonse from teh
		$j(this.embedPlayer).bind('play', function(){
			_this.embedPlayer.stopEventPropagation();
			_this.freewheel.playSlots( tv.freewheel.SDK.TIME_POSITION_CLASS_PREROLL, this.prerollComplete );
		});
	},
	prerollComplete: function(){
		_this.embedPlayer.restoreEventPropagation();
		// restore player
		mw.log('mw.freeWheelControler:: restore original video ');
	}
};