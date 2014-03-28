( function( mw, $ ) { "use strict";

	$( mw ).bind( 'EmbedPlayerNewPlayer', function( event, embedPlayer ){
		// ad stitching only works with HLS: 
		if( !mw.EmbedTypes.getMediaPlayers().defaultPlayer( 'application/vnd.apple.mpegurl') ){
			mw.log("Error :: MediaSessionService : your browser / device does not supprot HLS");
			return ;
		}
		// setup override ad class ( before component build out )
		$( embedPlayer ).bind('UpdateAdsClassName', function( event, eventObject ){
			eventObject['adsClassName']= 'kAdsMediaSession';
		});
		
	});
	
	// the base media service plugin 
	mw.PluginManager.add( 'mediaSessionService', mw.KBasePlugin.extend({
		defaultConfig: {
			'socketLog': true,
			'guid': null,
			'hlsSessionUrl':null
		},
		// The Session HLS URL:
		sessionHlsUrl: null,
		setup: function(){
			// make sure we have a uuid: 
			if( !this.getConfig('guid') ){
				this.setConfig('guid', this.getGuid() );
			}
			
		},
		getSessionHlsUrl: function(){
			if( this.getConfig('hlsSessionUrl') ){
				return this.getConfig('hlsSessionUrl');
			}
			// if unset return default: 
			
		},
		updateContentSource:function(){
			var kAdsSource = embedPlayer.mediaElement.tryAddSource(
				$('<soruce>').attr({
					'src' : this.getSessionHlsUrl(),
					'type': 'application/vnd.apple.mpegurl'
				})
			);
			// change source to HLS
			$(this.embedPlayer.mediaElement).bind('onSelectSource', function () {
				// select our m3u8 source: 
				_this.embedPlayer.selectedSource = kAdsSource;
			});
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