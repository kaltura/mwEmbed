(function ( mw, $ ) {
        "use strict";
        mw.dualScreen = mw.dualScreen || {};

        mw.dualScreen.displays = mw.KBasePlugin.extend({
            display: {},
            isFlashMode: false,

            setup: function(){
            },
            initDisplays: function () {
                var _this = this;
                $.each( mw.dualScreen.display.TYPE, function ( key, val ) {
                    _this[val] = new mw.dualScreen.display(_this.getPlayer(), function(){
                        this.setConfig({
                            isMain: (val === mw.dualScreen.display.TYPE.PRIMARY),
                            resizeHandlesFadeout: _this.getConfig( 'resizeHandlesFadeout' ),
                            resizable: _this.getConfig( 'resizable' ),
                            draggable: _this.getConfig( 'draggable' )
                        });
                    }, val + "Display");
                } );
                //Init main/aux members
                this.main = this.getPrimary();
                this.aux = this.getSecondary();
            },
            //Get original embedPlayer container
            getPrimary: function(){
                return this[mw.dualScreen.display.TYPE.PRIMARY];
            },
            //Get original secondScreen container
            getSecondary: function(){
                return this[mw.dualScreen.display.TYPE.SECONDARY];
            },
            //Get current embedPlayer container
            getMainDisplay: function () {
                return this.main;
            },
            //Get current secondScreen container
            getAuxDisplay: function () {
                return this.aux;
            },

            //Screen view state handlers
            toggleMainDisplay: function () {
                var _this = this;
                var curMain = this.getMainDisplay();
                var curAux = this.getAuxDisplay();

                var resizeLimits = curAux.getResizeLimits();
                this.aux.setResizeLimits(resizeLimits);
                var props = curAux.getProperties();

                var switchZindex = function(){
                    curAux.disableTransition();
                    curMain.bringToFront();
                    curAux.sendToBack();
                };
                curAux.toggleSecondary(switchZindex);
                setTimeout(function(){
                    curAux.toggleHiddenToMain();
                    curMain.toggleMain(props);
                    _this.getPlayer().triggerHelper( "dualScreenDisplaysSwitched" );
                },200);
                this.main = curAux;
                this.aux = curMain;
            },
            enableSideBySideView: function () {
                this.getMainDisplay().enableSideBySideView();
                this.getAuxDisplay().enableSideBySideView();
            },
            toggleSideBySideView: function () {
                this.getMainDisplay().toggleSideBySideView();
                this.getAuxDisplay().toggleSideBySideView();
            },
            disableSideBySideView: function () {
                this.getMainDisplay().disableSideBySideView();
                this.getAuxDisplay().disableSideBySideView();
            },
            toggleMainConfig: function () {
                var curMain = this.getMainDisplay();
                var curAux = this.getAuxDisplay();
                curMain.toggleMainConfig();
                curMain.disableMain();
                curAux.toggleMainConfig();
                curAux.enableMain();
                this.main = curMain;
                this.aux = curAux;
            },
            hideDisplay: function ( ) {
                this.getAuxDisplay().hide(this.isFlashMode);
            },
            showDisplay: function ( ) {
                this.getAuxDisplay().show(this.isFlashMode);
            },

            //Screen interaction handlers(drag/resize)
            enableUserActions: function ( ) {
                this.getAuxDisplay().enableUserActions();
            },
            disableUserActions: function ( ) {
                this.getAuxDisplay().disableUserActions();
            },

            //Screen animation controller
            enableTransitions: function () {
                this.getMainDisplay().enableTransition();
                this.getAuxDisplay().enableTransition();
            },
            disableTransitions: function () {
                this.getMainDisplay().disableTransition();
                this.getAuxDisplay().disableTransition();
            },

            setFlashMode: function (val) {
                this.isFlashMode = val;
            },

            isInitialized: function () {
                return this.getPrimary().obj && this.getSecondary().obj;
            }
        });
    }
)( window.mw, window.jQuery );