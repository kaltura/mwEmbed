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
            pause: null,
            play: null,
            toggleFullscreen: null,
            shortSeekBack: null,
            longSeekBack: null,
            shortSeekForward: null,
            longSeekForward: null,
            gotoEnd: null,
            togglePlayControls: 'Toggle Controls',
            aboutUrl: 'http://player.kaltura.com',
            about: 'About Kaltura Player',
            gotoBeginning: null,
            toggleMute: null,

        },
        externalPlugins: {},
        canSeek: false,
        menuItems: {},
        menuItemsList: [
            'volumeUp', 'volumeDown', 'toggleFullscreen',
            'gotoBegining', 'gotoEnd', 'shortSeekBack', 'longSeekBack', 'shortSeekForward',
            'longSeekForward', 'togglePlayback', 'play', 'pause', 'toggleMute', 'togglePlayControls',
            'about'
        ],
        themes: ['normal-theme','aggressive-theme','aggressive-theme-black'],
        setup: function () {
            var _this = this;
            this.setRegisteredPlugins();
            this.menu = this.initMenu(this.menuItemsList, this.externalPlugins);
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
         * @param {object|array} items list of items to be added to the menu.
         * this will ensure future support for ordering and such.
         *
         * @param {object} externalItems list of external plugins/items to be added to the menu.
         * @return {object} returns a new menu object.
         */
        initMenu: function(items, externalItems) {
            var _super = this;

            function Menu( items, externalItems) {
                this.items = {};
                this.selector = '.mwPlayerContainer';
                this.addPluginsToMenu(externalItems);
                this.setItems(items);
                this.activateMenu();
            }

            Menu.prototype = {

                selector: 'mwPlayerContainer',
                setItems: function(items) {
                    var _this = this;
                    $.each(items, function(key, value) {
                        if ( _this.isMenuItemEnabled(value) )
                        return _this.items[value] = {
                            'name': _super.getConfig(value),
                            'callback': function() {
                                _this.getCallback(value)
                            }
                        }
                    });
                    return _this;
                },
                isMenuItemEnabled: function(item) {
                    return ( !! _super.getConfig(item) )
                },
                getComponent: function() {
                    return $(this.selector);
                },
                addPluginsToMenu: function(itemsToAdd) {
                    var _this = this;
                    $.each(itemsToAdd, function(key, item) {
                        console.log(item.callback);
                        _this.items[key] = {
                            'name': item.name,
                            'callback': item.callback
                        }
                    });
                    return this;
                },
                getItems: function() {
                    var arr = [];
                    $.each(this.items, function(key, value) {
                        arr.push(key);
                    });
                    return arr;
                },
                toString: function() {
                    var arr = [];
                    var _this = this;
                    $.each(this.items, function(key, value) {
                       arr.push(_this.items[key].name);
                    });
                    return arr;
                },
                activateMenu: function() {
                    $.contextMenu({
                        selector: this.selector,
                        items: this.items
                    });
                },
                enableMenu: function() {
                    this.getComponent().contextMenu(true);
                },
                disableMenu: function() {
                    this.getComponent().contextMenu(false);
                },
                getCallback: function(action) {
                    var callBack = action + 'Callback';
                    if( typeof _super[ callBack ] === 'function' ) {
                        return _super[ callBack ]();
                    }
                }

            };
            return new Menu(items, externalItems);

        },
        openMenu: function() {
            $('.mwPlayerContainer').triggerHandler('contextMenu');
        },
        closeMenu: function() {

        },
        disableMenu: function() {
            return this.menu.disableMenu();
        },
        enableMenu: function() {
            return this.menu.enableMenu();
        },
        addStyle: function() {
            var theme = this.getConfig('theme');
            return (this.themeExists(theme)) ? $('.context-menu-item').addClass(theme) : this.log('Requested theme does not exist');

        },
        themeExists: function(theme) {
            return (this.themes.indexOf(theme) !== -1 );

        },
        setRegisteredPlugins: function() {
            var _this = this;
            $.each(this.getPlayer().plugins, function(pluginID, plugin) {
                if (plugin.getConfig('contextMenu')){
                    _this.log(pluginID + ' was added to the context menu!');
                    _this.externalPlugins[pluginID] = {
                        'name': plugin.getConfig('contextMenu'),
                        'callback': function() {
                            // Trigger event for analytics or other plugins that want to consume it.
                            _this.getPlayer().triggerHelper('contextMenu', {'plugin': pluginID});
                            plugin.isScreenVisible() ? plugin.hideScreen() : plugin.showScreen();
                        }
                    }
                }
            });
        },
        aboutCallback: function() {

            var url = this.getConfig('aboutUrl');
            window.open(url, '_blank');
        },
        volumeUpCallback: function(){
            var embedPlayer = this.getPlayer();
            var currentVolume = parseFloat(this.getPlayer().getPlayerElementVolume());
            var volumePercentChange = parseFloat(this.getConfig('volumePercentChange'));
            var newVolumeVal = (currentVolume + volumePercentChange).toFixed(2);
            if( newVolumeVal > 1 ){
                newVolumeVal = 1;
            }
            embedPlayer.setVolume( newVolumeVal, true );
        },
        togglePlayControlsCallback: function(){
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
        gotoBeginningCallback: function(){
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
        isSafeEnviornment: function () {
            return !mw.isIpad() || ( mw.isIpad() && mw.getConfig('EmbedPlayer.EnableIpadHTMLControls') !== false );
        }
    }));

} )( window.mw, window.jQuery );