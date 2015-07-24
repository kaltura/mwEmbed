( function( mw, $ ) {"use strict";

    mw.PluginManager.add( 'contextMenu', mw.KBaseScreen.extend({

        defaultConfig: {
            showTooltip: true,
            parent: "topBarContainer",
            templatePath: '../ContextMenu/templates/contextMenu.tmpl.html',
            theme: 'normal-theme',
            shortSeekTime: 5,
            longSeekTime: 10,
            volumePercentChange: 0.1,
            volumeUp: null,
            volumeDown: null,
            aboutUrl: 'http://player.kaltura.com',
            pause: null,
            play: null,
            openFullscreen: null,
            toggleFullscreen: null,
            shortSeekBack: null,
            longSeekBack: null,
            shortSeekForward: null,
            longSeekForward: null,
            gotoEnd: 'Go To End',
            grabEmbedCode: 'null',
            togglePlayControls: 'Toggle Controls',
            about: 'About Kaltura Player',
            gotoBegining: null,
            toggleMute: null,

        },
        externalPlugins: {},
        canSeek: false,
        menuItems: {},
        menuItemsList: [
            'volumeUp', 'volumeDown','openFullscreen', 'toggleFullscreen',
            'gotoBegining', 'gotoEnd', 'shortSeekBack', 'longSeekBack', 'shortSeekForward',
            'longSeekForward', 'togglePlayback', 'play', 'pause', 'toggleMute', 'togglePlayControls',
            'about'
        ],
        themes: ['normal-theme','aggressive-theme','aggressive-theme-black'],
        setup: function () {
            var _this = this;
            this.setRegisteredPlugins();
            var menu = this.initMenu(this.menuItemsList, this.externalPlugins);
            this.bind('updateBufferPercent', function(){
                _this.canSeek = true;
            });
            this.addStyle();

        },
        /**
         * Initialize the context menu.
         *
         *
         * the imperative mood.
         *
         * @param {object} items list of items to be added to the menu.
         * this will ensure future support for ordering and such.
         *
         * @param {object} externalItems list of external plugins/items to be added to the menu.
         * @return {string} User name
         */
        initMenu: function(items, externalItems) {
            var _this = this;
            function Menu( items, externalItems ) {
                this.items = {};
                this.addPluginsToMenu(externalItems);
                this.setItems(items);

                this.enableMenu();
            }
            Menu.prototype = {

                setItems: function(items) {
                    var that = this;
                    $.each(items, function(key, value) {
                        if ( that.isMenuItemEnabled(value) )
                        return that.items[value] = {
                            'name': _this.getConfig(value),
                            'callback': function() {
                                that.getCallback(value)
                            }
                        }
                    });
                    return that;
                },
                isMenuItemEnabled: function(item) {
                    return ( !! _this.getConfig(item) )
                },
                addPluginsToMenu: function(itemsToAdd) {
                    var that = this;
                    var embedPlayer = _this.getPlayer();
                    $.each(itemsToAdd, function(key, item) {
                        that.items[key] = {
                            'name': item,
                            'callback': function() {
                                embedPlayer.triggerHelper('contextMenu',
                                    function(object) {
                                        if (object.pluginName !== key) {
                                            return item;
                                        }
                                        object._hideAllScreens();
                                        object.toggleScreen();
                                    });
                                }
                            }
                    });
                    return that;
                },
                getItems: function() {

                },
                enableMenu: function() {
                    $.contextMenu({
                        selector: '.mwPlayerContainer',
                        items: this.items
                    });
                },
                getCallback: function(action) {
                    var callBack = action + 'Callback';
                    if( typeof _this[ callBack ] === 'function' ) {
                        return _this[ callBack ]();
                    }
                }

            };
            return new Menu(items, externalItems);
        },
        addStyle: function() {
            var theme = this.getConfig('theme');
            return (this.themeExists(theme)) ? $('.context-menu-item').addClass(theme) : this.log('Requested theme does not exist');

        },
        themeExists: function(theme) {
            return (this.themes.indexOf(theme) !== -1 );

        },
        setRegisteredPlugins: function(callback) {
            for (var pluginID in this.getPlayer().plugins){
                var plugin = this.getPlayer().plugins[pluginID];
                if (plugin.getConfig('contextMenu')){
                    this.log(pluginID + " plugin was added to the context menu");
                    this.externalPlugins[pluginID] = (plugin.getConfig('contextMenu'));
                }
            }
        },
        aboutCallback: function() {
            var url = (this.getConfig('aboutUrl'));
            window.open(url, '_blank');
        },
        volumeUpCallback: function(){
            var _this = this;
            var embedPlayer = this.getPlayer();
            var currentVolume = parseFloat(this.getPlayer().getPlayerElementVolume());
            var volumePercentChange = parseFloat(this.getConfig('volumePercentChange'));
            var newVolumeVal = (currentVolume + volumePercentChange).toFixed(2);
            if( newVolumeVal > 1 ){
                newVolumeVal = 1;
            }
            this.getPlayer().setVolume( newVolumeVal, true );
        },
        togglePlayControlsCallback: function(){
            var _this = this;
            var embedPlayer = this.getPlayer();
            return ( embedPlayer._playContorls) ? embedPlayer.disablePlayControls() : embedPlayer.enablePlayControls();
        },
        volumeDownCallback: function(){
            var currentVolume = parseFloat(this.getPlayer().getPlayerElementVolume());
            var volumePercentChange = parseFloat(this.getConfig('volumePercentChange'));
            var newVolumeVal = (currentVolume - volumePercentChange).toFixed(2);
            if( newVolumeVal < 0 ) {
                newVolumeVal = 0;
            }
            this.getPlayer().setVolume( newVolumeVal, true );
        },
        togglePlaybackCallback: function(){
            var embedPlayer = this.getPlayer();

            if ( embedPlayer._playContorls) {
                var text = ( embedPlayer.isPlaying() ) ? this.getConfig('play') : this.getConfig('pause');
                var notificationName = ( embedPlayer.isPlaying() ) ? 'doPause' : 'doPlay';
                embedPlayer.sendNotification(notificationName);
                return false;
            }
        },
        openFullscreenCallback: function(){
            if( !this.getPlayer().getInterface().hasClass('fullscreen') ){
                this.getPlayer().toggleFullscreen();
            }
        },
        closeFullscreenCallback: function(){
            if( this.getPlayer().getInterface().hasClass('fullscreen') ){
                this.getPlayer().toggleFullscreen();
            }
        },
        toggleFullscreenCallback: function(){

            this.getPlayer().toggleFullscreen();
        },
        toggleMuteCallback: function(){
            this.getPlayer().toggleMute();
        },
        seek: function( seekType, direction ){
            if( !this.canSeek ){
                return false;
            }
            var seekTimeConfig = (seekType == 'short') ? 'shortSeekTime' : 'longSeekTime';
            var seekTime = parseFloat(this.getConfig(seekTimeConfig));
            var currentTime = parseFloat(this.getPlayer().currentTime);
            var newCurrentTime = 0;
            if( direction == 'back' ){
                newCurrentTime = currentTime - seekTime;
                if( newCurrentTime < 0 ){
                    newCurrentTime = 0;
                }
            } else {
                newCurrentTime = currentTime + seekTime;
                if( newCurrentTime > parseFloat(this.getPlayer().getDuration()) ){
                    newCurrentTime = parseFloat(this.getPlayer().getDuration());
                }
            }
            this.getPlayer().seek( newCurrentTime );
        },
        shortSeekBackCallback: function(){
            this.seek( 'short', 'back' );
        },
        longSeekBackCallback: function(){
            this.seek( 'long', 'back' );
        },
        shortSeekForwardCallback: function(){
            this.seek( 'short', 'forward' );
        },
        longSeekForwardCallback: function(){
            this.seek( 'long', 'forward' );
        },
        percentageSeekCallback: function( keyCode ){
            if( !this.canSeek ) {
                return false;
            }
            var _this = this;
            var getPercentage = function(){
                var percentArr = _this.getConfig('percentageSeekKeys').split(",");
                var idx = $.inArray(keyCode.toString(), percentArr);
                return ((idx + 1) * 0.1 ).toFixed(2);
            };
            var seekTime = getPercentage() * this.getPlayer().getDuration();
            this.getPlayer().seek( seekTime );
        },
        gotoBeginingCallback: function(){
            if( !this.canSeek ) {
                return false;
            }
            this.getPlayer().seek(0);
        },
        gotoEndCallback: function(){
            if( !this.canSeek ) {
                return false;
            }
            this.getPlayer().seek(this.getPlayer().getDuration());
        },
        grabEmbedCodeCallback: function(){
            var _this = this;
            this.setConfig('shareURL', this.getKalturaShareURL());
            this.openScreen();

        },
        openScreen: function(){
            var _this = this;
            var embedPlayer = this.getPlayer();
            this.getScreen().then(function(screen) {
                _this.showScreen();
                screen.addClass('semiTransparentBkg'); // add semi-transparent background for share plugin screen only. Won't affect other screen based plugins
                _this.shareScreenOpened = true;
                // add blur effect to video and poster
                $("#" + embedPlayer.getPlayerElement().id).addClass("blur");
                embedPlayer.getPlayerPoster().addClass("blur");
            });
        },
        getKalturaShareURL: function () {
            var uiConfId = this.getConfig("shareUiconfID") ? this.getConfig("shareUiconfID") : this.getPlayer().kuiconfid;
            return mw.getConfig('Kaltura.ServiceUrl') + '/index.php/extwidget/preview' +
                '/partner_id/' + this.getPlayer().kpartnerid +
                '/uiconf_id/' + uiConfId +
                '/entry_id/' + this.getPlayer().kentryid + '/embed/dynamic';
        },
        closeScreen: function(){
            $(".embed-offset-container").hide();
            $(".embed-container>.share-copy-btn").hide();
            $(".share-offset-container").hide();
            $(".share-container>.share-copy-btn").hide();
            $(".share-offset").val("00:00");
            $(".share-alert").hide();
            $('.share-secured').attr('checked', false);
            this.enablePlayDuringScreen = false;
            this.hideScreen();
        },
        hideScreen: function(){
            this._super();
            if (this.getPlayer().getPlayerElement()) {
                $( "#" + this.getPlayer().getPlayerElement().id ).removeClass( "blur" );
                this.getPlayer().getPlayerPoster().removeClass( "blur" );
            }
        },
        isSafeEnviornment: function () {
            return !mw.isIpad() || ( mw.isIpad() && mw.getConfig('EmbedPlayer.EnableIpadHTMLControls') !== false );
        }
    }));

} )( window.mw, window.jQuery );