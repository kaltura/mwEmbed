( function( mw, $ ) { "use strict";

// Set the FreeWheel config:
mw.setDefaultConfig({
	// The url for the ad Manager
	// for debugging we use the following AdManager url: 'http://localhost/html5.kaltura/mwEmbed/modules/FreeWheel/AdManager.js'
	'Tremor.acudeoUrl': 'http://objects.tremormedia.com/embed/sjs/acudeo.js'
});

mw.Tremor = function( embedPlayer, callback ){
	return this.init( embedPlayer, callback );
};

mw.Tremor.prototype = {
	init: function(){
		var _this = this;
		// Inherit BaseAdPlugin
		mw.inherit( this, new mw.BaseAdPlugin( embedPlayer, callback ) );

		// unbind any existing bindings:
		_this.embedPlayer.unbindHelper( _this.bindPostfix );
		// Load the freewheel ad manager then setup the ads
		if( !window['ACUDEO'] ){
			$.getScript( _this.getAdManagerUrl(), function(){
				_this.setupAds();
				callback();
			});
		} else{
			_this.setupAds();
			callback();
		}
	},
	getAdManagerUrl: function(){
		return mw.getConfig( 'Tremor.acudeoUrl' );
	}
}

} )( window.mw, window.jQuery );