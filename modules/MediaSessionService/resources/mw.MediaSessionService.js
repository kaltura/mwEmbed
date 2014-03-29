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
			this.updateContentSource();
		},
		/**
		 * Checks if the player supports HLS: 
		 */
		isSafeEnviornment: function(){
			return true; // mw.EmbedTypes.getMediaPlayers().defaultPlayer( 'application/vnd.apple.mpegurl');
		},
		getHlsSessionUrl: function(){
			if( this.getConfig('hlsSessionUrl') ){
				return this.getConfig('hlsSessionUrl');
			}
			// if unset return default: 
			var params = {
				'service': 'mediaSession',
				'wid': this.embedPlayer.kwidgetid,
				'uiconf_id': this.embedPlayer.kuiconfid,
				'entry_id': this.embedPlayer.kentryid, // base entry id
				'guid' : this.getConfig( 'guid' )
			};
			return mw.getMwEmbedPath() + 'services.php?' + $.param( params );
		},
		updateContentSource:function(){
			var _this = this;
			// change source to HLS
			$(this.embedPlayer.mediaElement).bind('onSelectSource', function () {
				var kAdsSource = _this.embedPlayer.mediaElement.tryAddSource(
					$('<soruce>').attr({
						'src' : _this.getHlsSessionUrl(),
						'type': 'application/vnd.apple.mpegurl'
					})
				);
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