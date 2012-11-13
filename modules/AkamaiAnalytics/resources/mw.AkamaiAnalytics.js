( function( mw, $ ) {"use strict";
	mw.AkamaiMediaAnalytics = function( embedPlayer, callback ) {
		return this.init( embedPlayer, callback );
	}

	mw.AkamaiMediaAnalytics.prototype = {

		// Bind PostFix
		bindPostFix : '.akamaiMediaAnalytics',

        init: function( embedPlayer, callback ) {
            var _this = this;
			this.embedPlayer = embedPlayer;
			// Unbind any existing bindings
			this.embedPlayer.unbindHelper( _this.bindPostFix );

			if ( _this.getConfig( 'trackEventMonitor' ) && window.parent[ _this.getConfig( 'trackEventMonitor' ) ] ) {
				this.trackEventMonitor = window.parent[ _this.getConfig( 'trackEventMonitor' ) ];
			}

			window.AKAMAI_MEDIA_ANALYTICS_CONFIG_FILE_PATH = this.getConfig( 'configPath' ) || 'http://ma193-r.analytics.edgesuite.net/config/beacon-3431.xml';
			window.parent.AKAMAI_MEDIA_ANALYTICS_CONFIG_FILE_PATH = window.AKAMAI_MEDIA_ANALYTICS_CONFIG_FILE_PATH;

			if ( typeof setAkamaiMediaAnalyticsData == 'function' ) {
				// Akamai HTML5 JS is already loaded, don't reload
				_this.setData( embedPlayer );
				callback();
			}
			else {
				$.getScript( 'http://79423.analytics.edgesuite.net/html5/akamaihtml5-min.js', function() {
					_this.setData( embedPlayer );
					callback();
				} );
			}
        },

		setData: function( embedPlayer ) {
			setAkamaiMediaAnalyticsData( 'category', embedPlayer.evaluate( '{mediaProxy.entry.categories}' ) );
			setAkamaiMediaAnalyticsData( 'publisherId', embedPlayer.kpartnerid );
			setAkamaiMediaAnalyticsData( 'title', embedPlayer.evaluate( '{mediaProxy.entry.name}' ) );
			setAkamaiMediaAnalyticsData( 'entryId', embedPlayer.kentryid );
			var flavorURL = embedPlayer.getSource().src;
			var startIndex = flavorURL.indexOf( '/flavorId/' ) + 10;
			var flavorId = flavorURL.substr( startIndex, flavorURL.indexOf( '/format/' ) - startIndex );
			setAkamaiMediaAnalyticsData( 'flavorId', flavorId );
			setAkamaiMediaAnalyticsData( 'contentLength', embedPlayer.evaluate( '{mediaProxy.entry.duration}' ) );
			setAkamaiMediaAnalyticsData( 'contentType', this.getMediaTypeName() );
			setAkamaiMediaAnalyticsData( 'device', navigator.platform );
			setAkamaiMediaAnalyticsData( 'playerId', embedPlayer.kuiconfid );
		},

		getConfig: function( attr )  {
			return this.embedPlayer.getKalturaConfig( 'akamaiMediaAnalytics', attr );
		},

		/**
		 * Get a media type string
		 */
		getMediaTypeName: function() {
			switch( this.embedPlayer.evaluate( '{mediaProxy.entry.mediaType}' ) ) {
				case 2:
					return 'Image';
					break;
				case 5:
					return 'Audio';
					break;
				case 201:
					return 'Live_Stream_Flash';
					break;
				case 202:
					return 'Live_Stream_Windows_Media';
					break;
				case 203:
					return 'Live_Stream_Real_Media';
					break;
				case 204:
					return 'Live_Stream_Quicktime';
					break;
			}
			// By default return video
			return 'Video';
		}
	};
})( window.mw, window.jQuery );