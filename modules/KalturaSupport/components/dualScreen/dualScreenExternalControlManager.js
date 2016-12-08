(function ( mw, $ ) {
        "use strict";
        mw.dualScreen = mw.dualScreen || {};

        mw.dualScreen.externalControlManager = mw.KBasePlugin.extend({
            /* DEVELOPER NOTICE: you should not set any property directly here (they will be shared between instances) - use the setup function instead */
            defaultConfig: {
                /* DEVELOPER NOTICE : don't use this plugin config feature since it is a detached plugin. A detached plugin cannot access the player configuration to support overrides */
            },
            setup : function()
            {
                var _this = this;

                /*
                 DEVELOPER NOTICE: you should set properties here (they will be scoped per instance)
                 */
                $.extend(_this, {
                });
            },
            destroy : function()
            {
                if (this.cuePointsManager)
                {
                    this.cuePointsManager.destroy();
                    this.cuePointsManager = null;
                }
            },
            start:function()
            {
                mw.log("dualScreen.externalControlManager.start(): start invoked");

                var _this = this;

                if ((_this.getPlayer().isLive() && mw.getConfig("EmbedPlayer.LiveCuepoints")) || _this.getPlayer().kCuePoints) {
                    mw.log("dualScreen.externalControlManager.start(): creating cue point manager to monitor media cue points");

                    // handle cue points only if either live or we have cue points loaded from the server
                    setTimeout(function()
                    {
                        if (!_this.cuePointsManager) {
                            // we need to initialize the instance
                            _this.cuePointsManager = new mw.webcast.CuePointsManager(_this.getPlayer(), function () {
                            }, "externalControlCuePointsManager");


                            _this.cuePointsManager.onCuePointsReached = function (args) {
                                var relevantCuePoints = args.filter({
                                    tags: ['player-view-mode', 'change-view-mode'],
                                    sortDesc: true
                                });
                                var mostUpdatedCuePointToHandle = relevantCuePoints.length > 0 ? relevantCuePoints[0] : null; // since we ordered the relevant cue points descending - the first cue point is the most updated

                                if (mostUpdatedCuePointToHandle) {
                                    _this.handleCuePoint(mostUpdatedCuePointToHandle);
                                } else if(args.reason === 'reconstructState'){
                                    _this.resetViewMode(); //if no relevant cue point was reached, make sure player view mode is reset to default (f.e - prevent unnecessary locked view mode state)
                                }
                            };
                        }
                    },1000);
                }
            },
            setViewById : function(viewId, lockstate)
            {
                var action, mainDisplayType;

                if (viewId)
                {
                    // NOTE: The left display is considered as the main display in the player.
                    // For example: 'video-on-left' means 'video' stream as main and 'video-on-right' means 'presentation' stream as main.
                    switch (viewId) {
                        case "sbs-parent-in-right":
                            action = "SbS";
                            mainDisplayType = mw.dualScreen.display.TYPE.SECONDARY;
                            break;
                        case "sbs-parent-in-left":
                            action = "SbS";
                            mainDisplayType = mw.dualScreen.display.TYPE.PRIMARY;
                            break;
                        case "pip-parent-in-small":
                            action = "PiP";
                            mainDisplayType = mw.dualScreen.display.TYPE.SECONDARY;
                            break;
                        case "pip-parent-in-large":
                            action = "PiP";
                            mainDisplayType = mw.dualScreen.display.TYPE.PRIMARY;
                            break;
                        case "parent-only":
                            action = "hide";
                            mainDisplayType = mw.dualScreen.display.TYPE.PRIMARY;
                            break;
                        case "no-parent":
                            action = "hide";
                            mainDisplayType = mw.dualScreen.display.TYPE.SECONDARY;
                            break
                        default:
                            break;
                    }

                    if (action) {
                        var dualScreenState = { action : action, mainDisplayType : mainDisplayType};
                        if(lockstate) {
                            this.log("dualscreenExternalControlManager.setViewById(): Changing player view mode state to '" + lockstate);
                            dualScreenState.lockState = lockstate;
                        }
                        this.log("dualscreenExternalControlManager.setViewById(): Changing player view to '" + action + "' with main display '" + mainDisplayType + "' (provided id '" + viewId + "')");
                        this.getPlayer().triggerHelper('dualScreenStateChange', dualScreenState);
                    }

                }

            },
            handleCuePoint : function(cuePoint)
            {
                var _this = this;

                var actionContent = null;

                if (cuePoint && cuePoint.cuePointType === 'codeCuePoint.Code' && (cuePoint.tags || '').indexOf('player-view-mode') !== -1 && cuePoint.code)
                {
                    actionContent = cuePoint.code;

                }else if (cuePoint && cuePoint.cuePointType === 'codeCuePoint.Code' && (cuePoint.tags || '').indexOf('change-view-mode') !== -1 && cuePoint.partnerData)
                {
                    actionContent = cuePoint.partnerData;
                }

                if (actionContent) {
                    var cuePointCode = JSON.parse(actionContent);
                    if (cuePointCode.playerViewModeId) {
                        //updating current view mode lock state
                        //the default view mode lock state is 'unlocked'
                        var viewModeLockState = cuePointCode.viewModeLockState ?
                            cuePointCode.viewModeLockState : mw.dualScreen.display.STATE.UNLOCKED;
                        _this.setViewById(cuePointCode.playerViewModeId, viewModeLockState)
                    }
                }
            },
            resetViewMode : function ()
            {
                //reset view mode lock state to unlocked
                var dualScreenState = { lockState : mw.dualScreen.display.STATE.UNLOCKED };
                this.getPlayer().triggerHelper('dualScreenStateChange', dualScreenState);
            }
        });
    }
)( window.mw, window.jQuery );