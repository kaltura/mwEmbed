( function( mw, $ ) { "use strict";

	$( mw ).bind( 'EmbedPlayerNewPlayer', function( event, embedPlayer ){
		// setup override binding: 
		$( embedPlayer ).bind('UpdateAdsClassName', function( event, eventObject ){
			// check that the environment is supported: 
			if( mw.EmbedTypes.getMediaPlayers().defaultPlayer( 'application/vnd.apple.mpegurl') ){
				eventObject['adsClassName']= 'kAdsMediaSession';
			}
		});
	});
	
	// the base media service plugin 
	mw.PluginManager.add( 'mediaSessionService', mw.KBasePlugin.extend({
		setup: function(){
			// make sure we have a uuid: 
			if( !this.getConfig('guid') ){
				this.setConfig('guid', this.getGuid() );
			}
		},
		getGuid: function(){
			// simple random number based global unique id
			var s4 = function() {
				return Math.floor((1 + Math.random()) * 0x10000)
					.toString(16)
					.substring(1);
			};
			return s4() + s4() + '-' + s4() + '-' + s4() + '-' +
				s4() + '-' + s4() + s4() + s4();
		}
	}));
	
})( window.mw, jQuery );