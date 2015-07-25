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
        canSeek: false,
        menuItemsList: [
            'volumeUp', 'volumeDown', 'toggleFullscreen',
            'gotoBegining', 'gotoEnd', 'shortSeekBack', 'longSeekBack', 'shortSeekForward',
            'longSeekForward', 'togglePlayback', 'play', 'pause', 'toggleMute', 'togglePlayControls',
            'about'
        ],
        themes: ['normal-theme','aggressive-theme','aggressive-theme-black'],
        setup: function () {
            var _this = this;
            this.menu = this.initMenu(
                this.createItemsWithCallbacks(),
                this.getConfig('theme')
            );
            this.bind('updateBufferPercent', function(){
                _this.canSeek = true;
            });
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
        initMenu: function(items, theme) {

            function Menu( items, theme ) {
                this.items = items;
                this.theme = theme;
                this.selector = '.mwPlayerContainer';
                this.activateMenu();
                this.setTheme(theme);
            }

            Menu.prototype = {

                getComponent: function() {

                    return $(this.selector);
                },
                getItems: function() {
                    var arr = [];
                    $.each(this.items, function(key) {
                        arr.push(key);
                    });
                    return arr;
                },
                toString: function() {
                    var arr = [];
                    var _this = this;
                    $.each(this.items, function(key) {
                       arr.push(_this.items[key].name);
                    });
                    return arr;
                },
                getMenu: function () {
                    var menu = {};
                    $.each( $.contextMenu.menus, function(key, obj) {
                        menu = obj ? obj : menu;
                    });
                    return menu.$menu;
                },
                activateMenu: function() {
                    $.contextMenu({
                        selector: this.selector,
                        items: this.items
                    });

                },
                enableMenu: function() {
                    return this.getComponent().contextMenu(true);
                },
                disableMenu: function() {
                    return this.getComponent().contextMenu(false);
                },
                setTheme: function(theme) {
                    return  this.getMenu().addClass(this.theme = theme);
                },
                getCurrentTheme: function() {
                    return this.theme;
                },
            };
            return new Menu( items , theme );

        },
        isMenuItemEnabled: function(item) {
            return ( !! this.getConfig(item) )
        },
        disableMenu: function() {
            return this.menu.disableMenu();
        },
        enableMenu: function() {
            return this.menu.enableMenu();
        },
        changeTheme: function(theme) {
            if (this.themeExists(theme)) {
                this.log('menu theme was changed to ' + theme);
                return this.menu.setTheme(theme);
            }
            this.log('Theme does not exist!');
        },
        themeExists: function(theme) {
            return (this.themes.indexOf(theme) !== -1 );
        },
        createItemsWithCallbacks: function() {
            var _this = this;
            var items = {};
            $.each(this.getPlayer().plugins, function(pluginID, plugin) {
                if (plugin.getConfig('contextMenu')){
                    _this.log(pluginID + ' was added to the context menu!');
                    items[pluginID] = {
                        'name': plugin.getConfig('contextMenu'),
                        'callback': function() {
                            // Trigger event for analytics or other plugins that want to consume it.
                            _this.getPlayer().triggerHelper('contextMenu', {'plugin': pluginID});
                            plugin.isScreenVisible() ? plugin.hideScreen() : plugin.showScreen();
                        }
                    }
                }
            });
            $.each(this.menuItemsList, function(key, value) {
                if ( _this.isMenuItemEnabled(value) )
                    return items[value] = {
                        'name': _this.getConfig(value),
                        'callback': function() {
                            _this.getCallback(value)
                        }
                    }
            });
            return items;
        },
        getCallback: function(action) {
            var callBack = action + 'Callback';
            if( typeof this[ callBack ] === 'function' ) {
                return this[ callBack ]();
            }
            this.log('The action:' + action + 'has no callback defined!');
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
                return this.getPlayer().seek( newCurrentTime );
            }
            newCurrentTime = currentTime + seekTime;
            if( newCurrentTime > parseFloat(this.getPlayer().getDuration()) ){
                newCurrentTime = parseFloat(this.getPlayer().getDuration());
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