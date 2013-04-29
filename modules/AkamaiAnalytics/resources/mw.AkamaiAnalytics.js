( function( mw, $ ) {"use strict";
	mw.AkamaiMediaAnalytics = function( embedPlayer, callback ) {
		return this.init( embedPlayer, callback );
	}

	mw.AkamaiMediaAnalytics.prototype = {

		// Bind PostFix
		bindPostFix : '.akamaiMediaAnalytics',
		
		defaultConfigPath : 'http://ma193-r.analytics.edgesuite.net/config/beacon-3431.xml?beaconSentNotify=1',
		
		defaultConfigPathHTTPS : 'https://ma193-r.analytics.edgekey.net/config/beacon-3898.xml?beaconSentNotify=1',
		
		defaultJS : 'http://79423.analytics.edgesuite.net/html5/akamaihtml5-min.js',
		
		defaultJSHTTPS : 'https://79423.analytics.edgekey.net/html5/akamaihtml5-min.js',

		init: function( embedPlayer, callback ) {
			var _this = this;
			this.embedPlayer = embedPlayer;
			// Unbind any existing bindings
			this.embedPlayer.unbindHelper( _this.bindPostFix );

			var configPath = this.getConfigPath();
			window.AKAMAI_MEDIA_ANALYTICS_CONFIG_FILE_PATH = configPath;
			if( mw.getConfig('EmbedPlayer.IsFriendlyIframe') ){
				try {
					window.parent.AKAMAI_MEDIA_ANALYTICS_CONFIG_FILE_PATH = configPath;
				} catch (e) {
					
				}
			}
			
			if ( typeof setAkamaiMediaAnalyticsData == 'function' ) {
				// Akamai HTML5 JS is already loaded, don't reload
				_this.setData( embedPlayer );
				callback();
			} else {
				var jsSrc = _this.defaultJS;
				if ( this.isHttps() ) {
					jsSrc = _this.defaultJSHTTPS;
				}
				kWidget.appendScriptUrl( jsSrc, function() {
					_this.setData( embedPlayer );
					callback();
				}, window.document );
			}
        },

		setData: function( embedPlayer ) {
			var _this = this;
			var flavorSrc = embedPlayer.getSource();
			var flavorURL = '';
			if ( flavorSrc ) {
				flavorURL = flavorSrc.src;
			}
			var startIndex = flavorURL.indexOf( '/flavorId/' ) + 10;
			var flavorId = flavorURL.substr( startIndex, flavorURL.indexOf( '/format/' ) - startIndex );

			this.sendAkamaiData( 'publisherId', embedPlayer.kpartnerid );
			this.sendAkamaiData( 'title', embedPlayer.kentryid );
			this.sendAkamaiData( 'playerId', embedPlayer.kuiconfid );
			this.sendAkamaiData( 'flavorId', flavorId );
			this.sendAkamaiData( 'playerVersion', MWEMBED_VERSION );		
			this.sendAkamaiData( 'category', this.getMediaTypeName() );
			this.sendAkamaiData( 'contentLength', embedPlayer.evaluate( '{mediaProxy.entry.msDuration}' ) );
			this.sendAkamaiData( 'device', navigator.platform );

			var setPlayerLoadTime = function() {
				_this.sendAkamaiData( 'playerLoadtime', embedPlayer.evaluate( '{playerStatusProxy.loadTime}' )  );
			};

			//if we already have load time - set it
			if (embedPlayer.evaluate( '{playerStatusProxy.loadTime}' )) {
				setPlayerLoadTime();
			}
			//else wait for widget load event
			else {
				embedPlayer.bindHelper( 'playerReady',function(){
					// add a timeout to give the parent frame a chance to update the total load time
					setTimeout(function(){
						setPlayerLoadTime();
					},0);
				});
			}
		},
		sendAkamaiData: function( eventId, data ){
			// send the data with the Akamai method: 
			setAkamaiMediaAnalyticsData( eventId, data );
			// log to the trackEventMonitor if not present: 
			if ( this.getConfig( 'trackEventMonitor' ) ) {
				try{
					window.parent[ this.getConfig( 'trackEventMonitor' ) ]( eventId, data );
				} catch(e){
					// error could not log event. 
				}
			}
		},
		getConfigPath: function() {
			// Check for configuration override
			var configPath = null;
			if ( this.getConfig( 'configPath' ) ) {
				configPath = this.getConfig( 'configPath' );
			}
			// Akamai has a special https url ( does not support protocol relative urls )
			if ( this.isHttps() ) {
				// If configuration override includes https use it
				if ( configPath && ( configPath.indexOf( 'https' ) != -1 ) ) {
					return configPath;
				}
				// If configuration path is not overriden or overriden with insecure URL, use default secure location
				return this.defaultConfigPathHTTPS;
			}
			// The default config path for kaltura akami account
			return this.defaultConfigPath;
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
