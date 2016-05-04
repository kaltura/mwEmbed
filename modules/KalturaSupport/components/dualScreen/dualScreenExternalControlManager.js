(function ( mw, $ ) {
        "use strict";
        mw.dualScreen = mw.dualScreen || {};

        mw.dualScreen.externalControlManager = mw.KBasePlugin.extend({
            setup : function()
            {

            },
            initialize:function()
            {
                var _this = this;

                if ((_this.getPlayer().isLive() && mw.getConfig("EmbedPlayer.LiveCuepoints")) || _this.getPlayer().kCuePoints) {
                    // handle cue points only if either live or we have cue points loaded from the server
                    setTimeout(function()
                    {
                        if (!_this.cuePointsManager) {
                            // we need to initialize the instance
                            _this.cuePointsManager = new mw.dualScreen.CuePointsManager('dualScreenExternalControlManager', '', _this.getPlayer(), function (args) {
                                var relevantCuePoints = args.filter({tags: ['player-view-mode','change-view-mode'], sortDesc: true});
                                var mostUpdatedCuePointToHandle = relevantCuePoints.length > 0 ? relevantCuePoints[0] : null; // since we ordered the relevant cue points descending - the first cue point is the most updated

                                if (mostUpdatedCuePointToHandle) {
                                    _this.handleCuePoint(mostUpdatedCuePointToHandle);
                                }
                            });
                        }

                        // enable cue points manager
                        _this.cuePointsManager.enable();
                    },1000);
                }else
                {
                    // no need for cue points manager
                    if (_this.cuePointsManager) {
                        _this.cuePointsManager.disable();
                    }

                }
            },
            setViewById : function(viewId)
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
                        mw.log("dualscreenExternalControlManager.handleCuePoint(): Changing player view to '" + action + "' with main display '" + mainDisplayType + "' (provided id '" + viewId + "')");

                        this.getPlayer().triggerHelper('dualScreenStateChange', { action : action, mainDisplayType : mainDisplayType});
                    }

                }

            },
            handleCuePoint : function(cuePoint)
            {
                var _this = this;

                var actionContent = null;

                if (cuePoint && cuePoint.cuePointType === 'codeCuePoint.Code' && cuePoint.tags === 'player-view-mode' && cuePoint.code)
                {
                    actionContent = cuePoint.code;

                }else if (cuePoint && cuePoint.cuePointType === 'codeCuePoint.Code' && cuePoint.tags === 'change-view-mode' && cuePoint.partnerData)
                {
                    actionContent = cuePoint.partnerData;
                }

                if (actionContent) {
                    var cuePointCode = JSON.parse(actionContent);
                    if (cuePointCode.playerViewModeId) {
                        _this.setViewById(cuePointCode.playerViewModeId)
                    }
                }
            }
        });
    }
)( window.mw, window.jQuery );