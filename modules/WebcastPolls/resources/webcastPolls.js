(function (mw, $) {
    "use strict";

    mw.PluginManager.add('webcastPolls', mw.KBaseScreen.extend({

        defaultConfig: {
            templatePath: '../WebcastPolls/resources/webcastPolls.tmpl.html'
        },
        locale: {
            startTimeLbl: gM('mwe-share-startTimeLbl'),
            secureEmbedLbl: gM('mwe-share-secureEmbedLbl'),
            copyLbl: gM('mwe-share-copyLbl'),
            errDuration: gM('mwe-share-errDuration'),
            errFormat: gM('mwe-share-errFormat')
        },
        question: 'amir',
        isScreenOpened: false,
        setup: function () {
            this.setConfig('previewPlayerEnabled', true);
            this.setConfig('usePreviewPlayer', true);

            if (mw.isMobileDevice()) {
                // TODO [es]
                console.log("mobile device");
            }
            this.addBindings();

        },

        addBindings: function () {
            // bind to cue point events
            var _this = this;
            var embedPlayer = this.getPlayer();

            this.bind('onpause', function () {
                debugger
            });

            this.bind('playerReady', function () {
                setTimeout(function () {
                    _this.showScreen();
                    //_this.getPlayer().addPlayerSpinner();
                    // _this.hideScreen();

                    //setTimeout(function(){
                    //	_this.getPlayer().hideSpinner();
                    //	_this.question="hello";
                    //	_this.removeScreen();
                    //	_this.showScreen();
                    //},5000);

                    setTimeout(function () {
                        _this.hideScreen();

                    }, 10000);
                }, 5000);
            });
            this.bind('preShowScreen', function (event, screenName) {

                if (screenName === "webcastPolls") {
                    _this.getScreen().then(function (screen) {
                        screen.addClass('semiTransparentBkg'); // add semi-transparent background for share plugin screen only. Won't affect other screen based plugins
                        _this.isScreenOpened = true;

                        // prevent keyboard key actions to allow typing in share screen fields
                        embedPlayer.triggerHelper('onDisableKeyboardBinding');

                        // disable all player controls except play button, scrubber and volume control
                        // TODO [es] amir - what other controls are available?
                        _this.disablePlayerControls();

                        // set responsive size
                        if (embedPlayer.getVideoHolder().width() < 400) {
                            // TODO [es]
                            //$(".share").addClass("small");
                        }
                    });
                }
            });

            this.bind('showScreen', function (event, screenName) {
                if (screenName === "webcastPolls") {
                    _this.getScreen().then(function (screen) {
                        $("#" + embedPlayer.getPlayerElement().id).addClass("blur");
                        embedPlayer.getPlayerPoster().addClass("blur");
                    });
                }
            });

            this.bind('preHideScreen', function (event, screenName) {
                if (screenName === "webcastPolls") {
                    _this.isScreenOpened = true;
                    // restore keyboard actions
                    // TODO [es] amir - is there a situation where the keyboard binding was disabled before the screen was loaded?
                    embedPlayer.triggerHelper('onEnableKeyboardBinding');

                    // re-enable player controls
                    // TODO [es] amir - what is 'isInSequence'?
                    //if ( !embedPlayer.isInSequence() ){
                    //	embedPlayer.enablePlayControls();
                    //}
                    embedPlayer.enablePlayControls();

                    // remove blur
                    if (embedPlayer.getPlayerElement()) {
                        $("#" + embedPlayer.getPlayerElement().id).removeClass("blur");
                        embedPlayer.getPlayerPoster().removeClass("blur");
                    }
                }
            });

            this.bind('onplay', function (event, data) {
                if (_this.isScreenOpened) {
                    setTimeout(function () {
                        _this.disablePlayerControls();
                    }, 200);
                }
            });

            this.bind('onpause', function (event, data) {
                // TODO [es] amir - purpose?
                if (_this.isScreenOpened) {
                    $("#" + embedPlayer.getPlayerElement().id).addClass("blur");
                    embedPlayer.getPlayerPoster().addClass("blur");
                }
            });

            this.bind('updateLayout', function (event, data) {
                if (_this.isScreenOpened) {
                    // TODO [es] amir - when 'updateLayout' is relevant?
                    //if (embedPlayer.getVideoHolder().width() < 400){
                    //	$(".share").addClass("small");
                    //}else{
                    //	$(".share").removeClass("small");
                    //}
                }
            });
        },

        disablePlayerControls: function () {
            embedPlayer.disablePlayControls(["volumeControl", "scrubber", "playPauseBtn", "playlistAPI"]);
        },

        enablePlayerControls: function () {
            embedPlayer.disablePlayControls(["volumeControl", "scrubber", "playPauseBtn", "playlistAPI"]);
        },

        getTemplateData: function () {
            return {
                'name': this.question
            };
        },

        // bind to template UI events
        addScreenBindings: function () {

        },

        // called from template X button
        closeScreen: function () {
            this.removeScreen();
        }


    }));

})(window.mw, window.jQuery);
