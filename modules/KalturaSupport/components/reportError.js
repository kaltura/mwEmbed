( function( mw, $ ) {"use strict";

	mw.PluginManager.add( 'reportError', mw.KBasePlugin.extend({
		kClient: null,
		didSeek: false,

		setup: function() {
			var _this = this;
			var embedPlayer = this.getPlayer();
			this.kClient = mw.kApiGetPartnerClient( embedPlayer.kwidgetid );

			this.bind( 'playerReady', function() {
				_this.didSeek = false;
			});

			this.bind( 'seeking', function() {
				_this.didSeek = true;
			});

			this.bind( 'embedPlayerError', function ( e, data ) {
				var resourceUrl = undefined;
				if ( embedPlayer.mediaElement && embedPlayer.mediaElement.selectedSource ) {
					resourceUrl = embedPlayer.mediaElement.selectedSource.getSrc();
				}

				var currentTime = $.isFunction(embedPlayer.getPlayerElement().currentTime) ?
					embedPlayer.getPlayerElement().currentTime() : embedPlayer.getPlayerElement().currentTime;

				var msgParams = [];
				msgParams[ 'pid' ] = embedPlayer.kpartnerid;
				msgParams[ 'uiconfId' ] = embedPlayer.kuiconfid;
				msgParams[ 'referrer' ] = window.kWidgetSupport.getHostPageUrl();
				msgParams[ 'didSeek' ] = _this.didSeek;
				msgParams[ 'resourceUrl' ] = resourceUrl;
				msgParams[ 'userAgent' ] = navigator.userAgent;
				msgParams[ 'playerCurrentTime' ] = currentTime;
				msgParams[ 'playerLib' ] = embedPlayer.selectedPlayer.library;
				msgParams[ 'streamerType' ] = embedPlayer.streamerType;
				//add params from data argument
				if ( data ) {
					for( var param in data){
						msgParams[ param ] = data[ param ];
					}
				}
				//translate params to errorMessage String
				var errorMessage = "";
				for( var i in msgParams ){
					errorMessage += i + ' : ' + msgParams[ i ] + " | ";
				}

				var eventRequest = { 'service' : 'stats', 'action' : 'reportError', errorCode: 'mediaError' };
				eventRequest[ 'errorMessage' ] = errorMessage;

				_this.kClient.doRequest( eventRequest );
			});
		}
	}));

} )( window.mw, window.jQuery );