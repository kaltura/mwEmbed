( function( mw, $ ) {"use strict";
	mw.AkamaiAnalytics = function( embedPlayer, callback ) {
		return this.init( embedPlayer, callback );
	}
	
	mw.AkamaiAnalytics.prototype = {
		
		// Bind PostFix
		bindPostFix : '.akamaiAnalytics',
		
		getConfig: function( attr )  {
			return this.embedPlayer.getKalturaConfig( 'akamaiAnalytics', attr );
		},

        init: function( embedPlayer, callback ) {
            var _this = this;
			this.embedPlayer = embedPlayer;
			// Unbind any existing bindings
			this.embedPlayer.unbindHelper( _this.bindPostFix );
	
			if ( _this.getConfig( 'trackEventMonitor' ) && window.parent[ _this.getConfig( 'trackEventMonitor' ) ] ) {
				this.trackEventMonitor = window.parent[ _this.getConfig( 'trackEventMonitor' ) ];
			}

			window.AKAMAI_MEDIA_ANALYTICS_CONFIG_FILE_PATH = this.getConfig( 'configPath' ) || 'http://ma193-r.analytics.edgesuite.net/config/beacon-2578.xml';
			$.getScript( 'http://79423.analytics.edgesuite.net/html5/akamaihtml5-min.js', function() {
				setAkamaiMediaAnalyticsData( 'playerName', 'testPlayer', embedPlayer.pid );
				callback();
			} );
        }
	};
})( window.mw, window.jQuery );