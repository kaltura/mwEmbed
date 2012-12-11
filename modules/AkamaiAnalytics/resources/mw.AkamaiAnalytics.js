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
			
			var configPath = this.getConfigPath();
			window.AKAMAI_MEDIA_ANALYTICS_CONFIG_FILE_PATH = configPath;
			window.parent.AKAMAI_MEDIA_ANALYTICS_CONFIG_FILE_PATH = configPath;
			
			if ( typeof setAkamaiMediaAnalyticsData == 'function' ) {
				// Akamai HTML5 JS is already loaded, don't reload
				_this.setData( embedPlayer );
				callback();
			}
			else {
				var jsSrc = 'http://79423.analytics.edgesuite.net/html5/akamaihtml5-min.js';
				if ( this.isHttps() ) {
					jsSrc = 'https://79423.analytics.edgekey.net/html5/akamaihtml5-min.js';
				}
				$.getScript( jsSrc, function() {
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
			var flavorSrc = embedPlayer.getSource();
			var flavorURL = '';
			if ( flavorSrc ) {
				flavorURL = flavorSrc.src;
			}
			var startIndex = flavorURL.indexOf( '/flavorId/' ) + 10;
			var flavorId = flavorURL.substr( startIndex, flavorURL.indexOf( '/format/' ) - startIndex );
			setAkamaiMediaAnalyticsData( 'flavorId', flavorId );
			setAkamaiMediaAnalyticsData( 'contentLength', embedPlayer.evaluate( '{mediaProxy.entry.duration}' ) );
			setAkamaiMediaAnalyticsData( 'contentType', this.getMediaTypeName() );
			setAkamaiMediaAnalyticsData( 'device', navigator.platform );
			setAkamaiMediaAnalyticsData( 'playerId', embedPlayer.kuiconfid );
		},
		
		getConfigPath: function() {
			// Check for configuration override
			if ( this.getConfig( 'configPath' ) ) {
				return this.getConfig( 'configPath' );
			}
			// Akamai has a special https url ( does not support protocol relative urls )
			if ( this.isHttps() ) {
				return 'https://ma193-r.analytics.edgekey.net/config/beacon-3898.xml?beaconSentNotify=1';
			}
			// The default config path for kaltura akami account
			return 'http://ma193-r.analytics.edgesuite.net/config/beacon-3431.xml?beaconSentNotify=1';
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
		},
		
		isHttps: function() {
			return ( document.location.protocol == 'https:' );
		}
	};
})( window.mw, window.jQuery );