(function (mw) {
        "use strict";
        mw.dualScreen = mw.dualScreen || {};
        mw.dualScreen.states = [
            {
                'name': 'PiP',
                'initial': true,
                'invoke': function (context) {

                    if (context.previousState !== 'PiP') {
                        // make sure the player is setup to PiP mode
                        this.enableUserActions();
                        this.showDisplay();
                        this.disableSideBySideView();
                    }

                    if (context.targetMainDisplayType && context.currentMainDisplayType !== context.targetMainDisplayType) {
                        // make sure the right display type is setup
                        this.toggleMainDisplay();
                    }

                }
            },
            {
                'name': 'SbS',
                'invoke': function (context) {
                    if (context.previousState !== 'SbS') {
                        // make sure the player is setup to SbS mode
                        this.disableUserActions();
                        this.showDisplay();
                        this.enableSideBySideView();
                    }

                    if (context.targetMainDisplayType && context.currentMainDisplayType !== context.targetMainDisplayType) {
                        // make sure the right display type is setup
                        this.toggleSideBySideView();
                        this.toggleMainDisplay();
                    }
                }
            },
            {
                'name': 'hide',
                'invoke': function (context) {
                    if (context.previousState !== 'hide') {
                        // make sure the player is setup to single mode
                        this.disableUserActions();
                        this.disableSideBySideView();
                        this.hideDisplay();
                    }

                    if (context.targetMainDisplayType && context.currentMainDisplayType !== context.targetMainDisplayType) {
                        // make sure the right display type is setup
                        this.showDisplay();
                        this.toggleMainDisplay();
                        this.hideDisplay();
                    }
                }
            }
        ];

        mw.dualScreen.nativeAppStates = [
            {
                'name': 'PiP',
                'initial': true,
                'invoke': function (context) {
                    if (context.previousState !== 'PiP') {
                        // make sure the player is setup to PiP mode
                        this.enableUserActions();
                        this.showDisplay();

                        if (context.currentMainDisplayType !== 'video') {
                            // make sure PiP show only video stream (in native app only video is supported in PiP)
                            this.toggleMainDisplay();
                        }
                    }
                }
            },
            {
                'name': 'hide',
                'invoke': function (context) {
                    if (context.previousState !== 'hide') {
                        // make sure the player is setup to single mode
                        this.disableUserActions();
                        this.hideDisplay();
                    }

                    if (context.targetMainDisplayType && context.currentMainDisplayType !== context.targetMainDisplayType) {
                        // make sure the right display type is setup
                        this.showDisplay();
                        this.toggleMainDisplay();
                        this.hideDisplay();
                    }
                }
            }
        ];
    })(window.mw);