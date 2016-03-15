(function ( mw, $ ) {
        "use strict";
        mw.dualScreen = mw.dualScreen || {};

        mw.dualScreen.externalControlManager = mw.KBasePlugin.extend({
            setup : function()
            {
                var _this = this;

                this.bind( 'KalturaSupport_CuePointsPassedDueToSeekAggregated KalturaSupport_CuePointsReachedAggregated', function ( e, args ) {

                    var relevantCuePoints = args.filter({tag : 'player-view-mode',sortDesc : true});
                    var mostUpdatedCuePointToHandle = relevantCuePoints.length> 0 ? relevantCuePoints[0] : null; // since we ordered the relevant cue points descending - the first cue point is the most updated

                    if (mostUpdatedCuePointToHandle)
                    {
                        _this.handleCuePoint(mostUpdatedCuePointToHandle);
                    }
                });
            },
            handleCuePoint : function(cuePoint)
            {
                var _this = this;
                var action, mainDisplayType;

                if (!cuePoint || cuePoint.cuePointType !== 'codeCuePoint.Code' || cuePoint.tags !== 'player-view-mode' ||
                    !cuePoint.code)
                {
                    // ignore any cue point not relevant to player view mode.
                    return;
                }

                var cuePointCode = JSON.parse(cuePoint.code);
                if (cuePointCode.playerViewModeId) {
                    // NOTE: The left display is considered as the main display in the player.
                    // For example: 'video-on-left' means 'video' stream as main and 'video-on-right' means 'presentation' stream as main.
                    switch (cuePointCode.playerViewModeId) {
                        case "side-by-side-video-on-right":
                            action = "SbS";
                            mainDisplayType = mw.dualScreen.display.TYPE.SECONDARY;
                            break;
                        case "side-by-side-video-on-left":
                            action = "SbS";
                            mainDisplayType = mw.dualScreen.display.TYPE.PRIMARY;
                            break;
                        case "video-inside-presentation":
                            action = "PiP";
                            mainDisplayType = mw.dualScreen.display.TYPE.SECONDARY;
                            break;
                        case "presentation-inside-video":
                            action = "PiP";
                            mainDisplayType = mw.dualScreen.display.TYPE.PRIMARY;
                            break;
                        case "video-only":
                            action = "hide";
                            mainDisplayType = mw.dualScreen.display.TYPE.PRIMARY;
                            break;
                        case "presentation-only":
                            action = "hide";
                            mainDisplayType = mw.dualScreen.display.TYPE.SECONDARY;
                            break;
                    }
                }

                if (action) {
                    mw.log("dualscreenExternalControlManager.handleCuePoint(): Changing player view to '" + action + "' with main display '" + mainDisplayType + "' (provided token '" + cuePointCode.playerViewModeId + "')");

                    this.getPlayer().triggerHelper('dualScreenStateChange', { action : action, mainDisplayType : mainDisplayType});
                }
            }
        });
    }
)( window.mw, window.jQuery );