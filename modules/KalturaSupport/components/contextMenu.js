( function( mw, $ ) {"use strict";

    mw.PluginManager.add( 'contextMenu', mw.KBasePlugin.extend({

        defaultConfig: {
            showTooltip: true,
            "shortSeekTime": 5,
            "longSeekTime": 10,
            volumePercentChange: 0.1,
            volumeUp: null,
            volumeDown: null,
            pause: null,
            play: null,
            openFullscreen: null,
            toggleFullscreen: null,
            shortSeekBack: null,
            longSeekBack: null,
            shortSeekForward: null,
            longSeekForward: null,
            gotoEnd: null,
            gotoBegining: null,

        },
        canSeek: false,
        menuItems: {},
        menuItemsNames: [
            'volumeUp', 'volumeDown', 'pause', 'play','openFullscreen', 'toggleFullscreen',
            'gotoBegining', 'gotoEnd', 'shortSeekBack', 'longSeekBack', 'shortSeekForward',
            'longSeekForward'
        ],
        setup: function () {
            var _this = this;
            this.buildMenu();
            this.addBindings();

            this.bind('updateBufferPercent', function(){
                _this.canSeek = true;
            });
            this.enableMenu();

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
        // Get all menu name and their actions from configuration in KMC Studio.
        // build menu first from the names and addBindings for each menu item with the right aciton.
        buildMenu: function() {
            var _this = this;
            $.each(this.menuItemsNames, function(index, itemName) {
                if (_this.getConfig(itemName))
                    _this.menuItems[itemName] = {
                        'name': _this.getConfig(itemName)
                    }

            })

        },
        addBindings: function () {
            var _this = this;
            //get the actions from the config and add bindings to the right menu item.
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
            var volumePercentChange = parseFloat(0.1);
            var newVolumeVal = (currentVolume - volumePercentChange).toFixed(2);
            if( newVolumeVal < 0 ) {
                newVolumeVal = 0;
            }
            this.getPlayer().setVolume( newVolumeVal, true );
        },
        togglePlaybackCallback: function(){
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