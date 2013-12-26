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

        defaultSWF: 'http://79423.analytics.edgesuite.net/csma/plugin/csma.swf',

        defaultSWFHTTPS: 'https://79423.analytics.edgekey.net/csma/plugin/csma.swf',

        init: function( embedPlayer, callback ) {
            var _this = this;
            this.embedPlayer = embedPlayer;
            // Unbind any existing bindings
            this.embedPlayer.unbindHelper( _this.bindPostFix );
            this.embedPlayer.bindHelper( 'PlayerLoaded' + _this.bindPostFix, function() {
                //kplayer will use flash akamaiMediaAnalyticsPlugin
                if ( embedPlayer.selectedPlayer.library == 'Kplayer' ) {
                    _this.sendDataToKPlayer( embedPlayer );
                } else {
                    if ( typeof setAkamaiMediaAnalyticsData == 'function' ) {
                        // Akamai HTML5 JS is already loaded, don't reload
                        _this.setData( embedPlayer );
                    } else {
                        var jsSrc = _this.defaultJS;
                        if ( _this.isHttps() ) {
                            jsSrc = _this.defaultJSHTTPS;
                        }
                        kWidget.appendScriptUrl( jsSrc, function() {
                            _this.setData( embedPlayer );
                        }, window.document );
                    }
                }
            });
            var configPath = _this.getConfigPath();
            window.AKAMAI_MEDIA_ANALYTICS_CONFIG_FILE_PATH = configPath;
            if( mw.getConfig('EmbedPlayer.IsFriendlyIframe') ){
                try {
                    window.parent.AKAMAI_MEDIA_ANALYTICS_CONFIG_FILE_PATH = configPath;
                } catch (e) {

                }
            }

            //in case kplayer will be loaded, it will use the flash akamaiMediaAnalytics plugin
            //it is safe to always add these vars, only kplayer reads them
            var swfPath = _this.getConfig( 'swfPath' ) || _this.defaultSWF;
            var securedSwfPath = _this.getConfig( 'securedSwfPath' ) || _this.defaultSWFHTTPS;
            var configPath = _this.getConfig( 'configPath' ) || _this.defaultConfigPath;
            var securedConfigPath = _this.getConfig( 'securedConfigPath' ) || _this.defaultConfigPathHTTPS;
            embedPlayer.setKalturaConfig( 'kdpVars', 'akamaiMediaAnalytics', { plugin: 'true', asyncInit: 'true', secured: _this.isHttps(), configPath: configPath, securedConfigPath: securedConfigPath,
                swfPath: swfPath, securedSwfPath: securedSwfPath } );

            callback();

        },

        /**
         * builds akamai data object
         * @param embedPlayer
         * @returns {{publisherId: *, title: *, playerId: *, flavorId: string, playerVersion: *, category: *, contentLength: *, device: string}}
         */
        getAkamaiDataObject: function( embedPlayer ) {
            var flavorSrc = embedPlayer.getSource();
            var flavorURL = '';
            if ( flavorSrc ) {
                flavorURL = flavorSrc.src;
            }
            var startIndex = flavorURL.indexOf( '/flavorId/' ) + 10;
            var flavorId = flavorURL.substr( startIndex, flavorURL.indexOf( '/format/' ) - startIndex );

            var dataObject = {
                'publisherId': embedPlayer.kpartnerid,
                'title': this.getConfig( 'title' ) || embedPlayer.kentryid ,
                'playerId': this.getConfig( 'playerId' ) || embedPlayer.kuiconfid ,
                'flavorId': flavorId ,
                'playerVersion': MWEMBED_VERSION ,
                'category': this.getConfig( 'category' ) || this.getMediaTypeName() ,
                'contentLength': embedPlayer.evaluate( '{mediaProxy.entry.msDuration}' ) ,
                'device': navigator.platform
            }
            this.setDataIfExsits( 'subCategory', dataObject );
            this.setDataIfExsits( 'eventName', dataObject );

            return dataObject;
        },

        /**
         * set js akamaiData
         * @param embedPlayer
         */
        setData: function( embedPlayer ) {
            var _this = this;
            var dataObject = this.getAkamaiDataObject( embedPlayer );
            $.each(dataObject, function(key, element) {
                _this.sendAkamaiData( key, element );
            });

            this.doOnPlayerLoadReady( embedPlayer, function() {
                _this.sendAkamaiData( 'playerLoadtime', embedPlayer.evaluate( '{playerStatusProxy.loadTime}' )  );
            } );
        },
        /**
         * will call callback when player load time value is available
         * @param embedPlayer
         * @param callback
         */
        doOnPlayerLoadReady: function ( embedPlayer, callback ) {
            //if we already have load time - call it
            if (embedPlayer.evaluate( '{playerStatusProxy.loadTime}' )) {
                callback();
            }
            //else wait for widget load event
            else {
                embedPlayer.bindHelper( 'playerReady',function(){
                    // add a timeout to give the parent frame a chance to update the total load time
                    setTimeout(function(){
                        callback();
                    },0);
                });
            }
        },
        /**
         * send akamaiData to flash akamaiMediaAnalytics plugin
         * @param embedPlayer
         */
        sendDataToKPlayer: function( embedPlayer ) {
            var dataObject = this.getAkamaiDataObject( embedPlayer );
            this.doOnPlayerLoadReady( embedPlayer, function() {
                dataObject['playerLoadtime'] = embedPlayer.evaluate( '{playerStatusProxy.loadTime}' );
                embedPlayer.getPlayerElement().sendNotification( 'setMediaAnalyticsData', dataObject );
            } );
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
            if ( configPath ){
                return configPath;
            }

            return this.defaultConfigPath;
        },

        getConfig: function( attr )  {
            return this.embedPlayer.getKalturaConfig( 'akamaiMediaAnalytics', attr );
        },
        /**
         * Set akamai custom data, if the given attribute value was set
         */
        setDataIfExsits: function( attr, obj ) {
            var attrVal = this.getConfig( attr );
            if ( attrVal !== null )
                obj[ attr ] = attrVal ;
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