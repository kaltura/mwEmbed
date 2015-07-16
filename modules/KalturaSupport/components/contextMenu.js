( function( mw, $ ) {"use strict";

    mw.PluginManager.add( 'contextMenu', mw.KBasePlugin.extend({

        defaultConfig: {
            showTooltip: true,

        },
        menuItems: {},
        setup: function () {
            this.buildMenu();
            this.addBindings();
            this.enableMenu();

        },
        enableMenu: function() {
            var embedPlayer = this.getPlayer();
            $.contextMenu({
                selector: '#' + embedPlayer.id,
                items: this.menuItems
            });
        },
        // Get all menu name and their actions from configuration in KMC Studio.
        // build menu first from the names and addBindings for each menu item with the right aciton.
        buildMenu: function() {
            return this.menuItems = this.getConfig('menuItems');

        },
        addBindings: function () {
            var _this = this;
            //get the actions from the config and add bindings to the right menu item.
            $.each(this.menuItems, function(action){
                this.callback = function(){
                    _this.getPlayer().sendNotification(action);
                }
            });
        },
        isSafeEnviornment: function () {
            return !mw.isIpad() || ( mw.isIpad() && mw.getConfig('EmbedPlayer.EnableIpadHTMLControls') !== false );
        }
    }));

} )( window.mw, window.jQuery );