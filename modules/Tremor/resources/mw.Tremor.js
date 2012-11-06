( function( mw, $ ) { "use strict";

/* refrence players look like this: 
 * 
 * <video id="player" width="400" height="300" preload="none"
					 src="http://demo.tremormedia.com/~agrant/html5test.mp4"> 
		</video> 
		
		<div class="compBanner" id="content_300"></div>
		
		<script type="text/javascript">
			ACUDEO.Player({player: "player",
					banner: "content_300",
					policy: "4fd898ffb18e7",
					contentData: {
					id: "id",
					url: "http://url",
					title: "title",
					descriptionUrl: "http://descriptionurl",
					description: "description"}
					});
		</script>
 */
// Set the Tremor config:
mw.setDefaultConfig({
	// The url for the ad Manager
	// for debugging we use the following AdManager url: 'http://localhost/html5.kaltura/mwEmbed/modules/Tremor/AdManager.js'
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
		// Load the Tremor ad manager then setup the ads
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