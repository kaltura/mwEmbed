mw.addFreeWheelControler = function( embedPlayer, config, callback ) {
	embedPlayer.freeWheelAds = new mw.freeWheelControler({ 
		'embedPlayer' : embedPlayer,
		'config' : config,
		'callback' :  callback
	});
};

mw.freeWheelControler = function( opt ){
	return this.init( opt );
};

mw.freeWheelControler.prototype = {
	init: function( opt ){
		var _this = this;
		$j.extend( this, opt);
		// Load the ad manager url:
		// XXX todo we should be able to read this from "adManagerUrl"
		var AdManagerUrl = mw.getConfig( 'FreeWheel.AdManagerUrl' );
		// For debuging use local copy: 
		//$j.getScript(AdManagerUrl, function(){
		mw.load('tv.freewheel.SDK', function(){
			_this.setupAds();
		});
	},
	setupAds: function(){
		var _this = this;
		this.freewheel= new tv.freewheel.SDK.AdManager();
		this.freewheel.registerVideoDisplayBase( 'videoContainer' );
		
		// @@TODO Need to confirm relatively arbitrary mapping
		this.freewheel.setVideoAsset( this.config.videoAssetId,  this.embedPlayer.duration );
		this.freewheel.setSiteSection( this.config.networkId );
		this.freewheel.setServerURL( this.config.serverUrl );
		
		// XXX strange.. FreeWheels servers respond with SVLads037 while its not defined ?
		window.SVLads037 = true;
		
		this.freewheel.submitRequest( function(){ 
			_this.adsRequestComplete();
		}, 4000 );
	},
	adsRequestComplete: function(){
		var _this = this;
		mw.log( "freeWheelControler::adsRequestComplete> " + this.callback);
		if( this.callback )
			this.callback();
		
		// Read the ad response
		$j( this.embedPlayer ).bind( 'onplay', function(){
			_this.embedPlayer.stopEventPropagation();
			_this.freewheel.playSlots( tv.freewheel.SDK.TIME_POSITION_CLASS_PREROLL, function(){
				_this.prerollComplete 
			});
		});
	},
	prerollComplete: function(){
		var _this = this;
		debugger;
		
		this.embedPlayer.restoreEventPropagation();
		// Restore player
		mw.log('freeWheelControler:: restore original video ');
	}
};