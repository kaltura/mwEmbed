( function( mw, $ ) {"use strict";

    mw.PluginManager.add( 'contextMenu', mw.KBasePlugin.extend({

        defaultConfig: {
            showTooltip: true,
            theme: 'normal',
            shortSeekTime: 5,
            longSeekTime: 10,
            volumePercentChange: 0.1,
            volumeUp: null,
            volumeDown: null,
            pause: 'Pause',
            play: 'Play',
            openFullscreen: null,
            toggleFullscreen: null,
            shortSeekBack: null,
            longSeekBack: null,
            shortSeekForward: null,
            longSeekForward: null,
            gotoEnd: null,
            gotoBegining: null,
            toggleMute: null,

        },
        canSeek: false,
        menuItems: {},
        menuItemsNames: [
            'volumeUp', 'volumeDown','openFullscreen', 'toggleFullscreen',
            'gotoBegining', 'gotoEnd', 'shortSeekBack', 'longSeekBack', 'shortSeekForward',
            'longSeekForward', 'togglePlayback', 'play', 'pause', 'toggleMute'
        ],
        themes: ['normal','aggressive-theme','aggressive-theme-black'],
        setup: function () {
            var _this = this;
            this.buildMenu();
            this.log('menu was built')
            this.addBindings();

            this.bind('updateBufferPercent', function(){
                _this.canSeek = true;
            });
            this.log('bindings were added')
            this.enableMenu();
            this.log('menu enabled')
            this.addStyle();

        },
        enableMenu: function() {
            var _this = this;
            var embedPlayer = this.getPlayer();
            if ( ! $.isEmptyObject(this.menuItems)) {
                $.contextMenu({
                    '_this': _this,
                    selector: '#' + embedPlayer.id,
                    items: this.menuItems
                });
            }
        },
        addStyle: function() {
            var theme = this.getConfig('theme');
            return (this.themeExists(theme)) ? $('.context-menu-item').addClass(theme) : this.log('Requested theme does not exist');

        },
        themeExists: function(theme) {
            if (this.themes.indexOf(theme) !== -1 ) {
                return true
            }
            return false;
        },
        buildMenu: function() {
            var _this = this;
            $.each(this.menuItemsNames, function(index, itemName) {
                if (_this.getConfig(itemName)) {
                    if (itemName === 'play' || itemName === 'pause') {
                        return _this.menuItems['togglePlayback'] = {
                            'name': _this.getConfig('play')
                        }
                    }
                    return _this.menuItems[itemName] = {
                        'name': _this.getConfig(itemName)
                    }
                }
            })

        },
        addBindings: function () {
            var _this = this;
            $.each(this.menuItems, function(action, item){
                this.callback = function() {
                    _this.getCallback(action);
                }
            });
        },
        getCallback: function(action) {
            var callBack = action + 'Callback';
            if( typeof this[ callBack ] === 'function' ) {
                return this[ callBack ]();
            }
        },
        volumeUpCallback: function(){
            var currentVolume = parseFloat(this.getPlayer().getPlayerElementVolume());
            var volumePercentChange = parseFloat(this.getConfig('volumePercentChange'));
            var newVolumeVal = (currentVolume + volumePercentChange).toFixed(2);
            if( newVolumeVal > 1 ){
                newVolumeVal = 1;
            }
            this.getPlayer().setVolume( newVolumeVal, true );
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

            var text = ( this.getPlayer().isPlaying() ) ? this.getConfig('play') : this.getConfig('pause');
            $('#togglePlayback').html(text);
            var notificationName = ( this.getPlayer().isPlaying() ) ? 'doPause' : 'doPlay';
            this.getPlayer().sendNotification( notificationName );
            return false;
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
        isSafeEnviornment: function () {
            return !mw.isIpad() || ( mw.isIpad() && mw.getConfig('EmbedPlayer.EnableIpadHTMLControls') !== false );
        }
    }));

} )( window.mw, window.jQuery );