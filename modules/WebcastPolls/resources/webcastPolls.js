(function (mw, $) {
    "use strict";

    mw.PluginManager.add('webcastPolls', mw.KBaseScreen.extend({

        defaultConfig: {
            templatePath: '../WebcastPolls/resources/webcastPolls.tmpl.html'
        },
        locale: {
            respondsLbl: gM('mwe-webc-polls-respondsLbl')
        },
        isShowingPoll : false,
        cuePointsManager : null,
        currentPollData : null,
        isScreenOpened: false,
        initializeCuePointsManager : function()
        {
            var _this = this;

            if (!_this.cuePointsManager) {
                // we need to initialize the instance
                _this.cuePointsManager = new mw.dualScreen.CuePointsManager(_this.getPlayer(), function () {
                }, "webcastPollsCuePointsManager");


                _this.cuePointsManager.onCuePointsReached = function (args) {
                    var relevantCuePoints = args.filter({
                        tags: ['select-poll-state','remove-selected-thumb','select-a-thumb'],
                        sortDesc: true
                    });
                    var mostUpdatedCuePointToHandle = relevantCuePoints.length > 0 ? relevantCuePoints[0] : null; // since we ordered the relevant cue points descending - the first cue point is the most updated

                    if (mostUpdatedCuePointToHandle) {
                        var isPollStateCuePoint = mostUpdatedCuePointToHandle.tags.indexOf("select-poll-state") > -1;

                        if (isPollStateCuePoint) {
                            _this.handlePollStateChangeCuePoint(mostUpdatedCuePointToHandle);
                        }else {
                            _this.handleRemovePollCuePoint();
                        }
                    }
                };
            }
        },
        handleRemovePollCuePoint : function()
        {
            var _this = this;

            if (_this.isShowingPoll)
            {
                _this.hideScreen();

                // TODO [es] reset poll dom to prepare to next poll
            }
        },

        handlePollStateChangeCuePoint : function(cuePoint)
        {
            var _this = this;
            var data = cuePoint.partnerData;

            if (!_this.isShowingPoll)
            {
                _this.showScreen();
            }

            if (false /* TODO [es] handle different poll then shown */)
            {

            }


        },
        setup: function () {

            // prevent pause of video while poll is being disabled
            this.setConfig('previewPlayerEnabled', true);
            this.setConfig('usePreviewPlayer', true);

            // TODO [es] check if needed
            //if (mw.isMobileDevice()) {
            //    console.log("mobile device");
            //}

            this.addBindings();

            this.initializeCuePointsManager();

        },

        addBindings: function () {
            // bind to cue point events
            var _this = this;
            var embedPlayer = this.getPlayer();

            this.bind('onpause', function () {
                // TODO [es] check if need to disable poll

            });

            this.bind('playerReady', function () {

                _this.currentPollData = {
                    question : 'How do you feel about our new site?'
                };

                //setTimeout(function () {
                //    _this.showScreen();
                //
                //    setTimeout(function () {
                //        _this.showPoll();
                //
                //    }, 3000);
                //
                //    //setTimeout(function(){
                //    //	_this.getPlayer().hideSpinner();
                //    //	_this.question="hello";
                //    //	_this.removeScreen();
                //    //	_this.showScreen();
                //    //},5000);
                //
                //    //setTimeout(function () {
                //    //    _this.hideScreen();
                //    //
                //    //}, 10000);
                //}, 1000);
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
                _this.isShowingPoll = true;
                if (screenName === "webcastPolls") {
                    _this.$webcastPoll = $('.webcastPolls');
                    _this.getScreen().then(function (screen) {
                        $("#" + embedPlayer.getPlayerElement().id).addClass("blur");
                        embedPlayer.getPlayerPoster().addClass("blur");
                    });
                }
            });

            this.bind('hideScreen',function()
            {
                _this.isShowingPoll = false;
            });

            this.bind('preHideScreen', function (event, screenName) {
                if (screenName === "webcastPolls") {
                    _this.$webcastPoll = $('.webcastPolls');

                    _this.isScreenOpened = true;
                    // restore keyboard actions
                    // TODO [es] amir - is there a situation where the keyboard binding was disabled before the screen was loaded?
                    embedPlayer.triggerHelper('onEnableKeyboardBinding');

                    // re-enable player controls
                    // TODO [es] amir - what is 'isInSequence'?
                    //if ( !embedPlayer.isInSequence() ){
                    //	_this.enablePlayerControls();
                    //}
                    _this.enablePlayerControls();

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
           // embedPlayer.disablePlayControls(["volumeControl", "scrubber", "playPauseBtn", "playlistAPI"]);
        },

        enablePlayerControls: function () {
            // embedPlayer.enablePlayControls();
        },

        getTemplateData: function () {
            return {
                'locale' : this.locale
            };
        },

        // bind to template UI events
        addScreenBindings: function () {

        },

        // called from template X button
        closeScreen: function () {
            this.removeScreen();
        },
        showLoader : function()
        {
            var _this = this;
            _this.$webcastPoll.find('[name="pollContainer"]').css({'display' : 'none'});
            _this.$webcastPoll.find('[name="loadingContainer"]').css({display: 'table'});
        },
        showPoll : function()
        {
            var _this = this;

            _this.$webcastPoll.find('[name="loadingContainer"]').css({display: 'none'});
            _this.$webcastPoll.find('[name="pollContainer"]').css({'display' : 'table'});
        }



    }));

})(window.mw, window.jQuery);
