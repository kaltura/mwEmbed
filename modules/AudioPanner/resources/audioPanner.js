(function (mw, $, shaka) {
    "use strict";
    var audioPanner = mw.KBasePlugin.extend({

        defaultConfig:{
            enableKeyboardShortcuts: true,
            "keyboardShortcutsMap": {
                "left": "shift+76",   //shift+L
                "right": "shift+82",  //shift+R
                "stereo": "shift+83"  //shift+S

            }
        },
        /**
         * Check is shaka is supported
         * @returns {boolean}
         */
        isSafeEnviornment: function () {
            return window.AudioContext || window.webkitAudioContext;
        },
        /**
         * Setup the shaka playback engine wrapper with supplied config options
         */
        setup: function () {
            this.addBindings();
            this.initAudioContext();
            if (this.getConfig('enableKeyboardShortcuts')) {
                this.bind('addKeyBindCallback', function (e, addKeyCallback) {
                    this.addKeyboardShortcuts(addKeyCallback);
                }.bind(this));
            }
        },
        /**
         *
         */
        addBindings: function () {
            this.bind("playerReady", this.connect.bind(this));
        },

        addKeyboardShortcuts: function (addKeyCallback) {
            var _this = this;
            // Add Shift+I for open side bar
            addKeyCallback(this.getConfig("keyboardShortcutsMap").left, function () {
                _this.panToLeft();
            });
            // Add Shift+I for open side bar
            addKeyCallback(this.getConfig("keyboardShortcutsMap").right, function () {
                _this.panToRight();
            });
            // Add Shift+I for open side bar
            addKeyCallback(this.getConfig("keyboardShortcutsMap").stereo, function () {
                _this.panToStereo();
            });
        },

        /**
         * Register the playback events and attach the playback engine to the video element
         */
        initAudioContext: function () {
            try {
                // Fix up for prefixing
                window.AudioContext = window.AudioContext||window.webkitAudioContext;
            }
            catch(e) {
                console.log(e);
                throw new Error(e);
            }
            this.context = new AudioContext();
            this.gainL = this.context.createGain();
            this.gainR = this.context.createGain();
            this.gainL.gain.value = 1;
            this.gainR.gain.value = 1;
            this.merger = this.context.createChannelMerger(2);
            this.splitter = this.context.createChannelSplitter(2);
        },
        connect: function(){
            //Gets media audio Source Node
            this.source = this.context.createMediaElementSource(this.getPlayer().getPlayerElement());
            //Connect the source to the splitter
            this.source.connect(this.splitter, 0, 0);
            //Connect splitter' outputs to each Gain Nodes
            this.splitter.connect(this.gainL, 0);
            this.splitter.connect(this.gainR, 1);

            //Connect Left and Right Nodes to the Merger Node inputs
            //Asuming stereo as initial status
            this.gainL.connect(this.merger, 0, 0);
            this.gainR.connect(this.merger, 0, 1);

            //Connect Merger output to context destination
            this.merger.connect(this.context.destination, 0, 0);
        },
        panToLeft: function(){
            this.gainR.disconnect();
            this.gainL.connect(this.merger, 0, 0);
        },
        panToRight: function(){
            this.gainL.disconnect();
            this.gainR.connect(this.merger, 0, 1);
        },
        panToStereo: function(){
            this.gainL.connect(this.merger, 0, 0);
            this.gainR.connect(this.merger, 0, 1);
        }
    });

    mw.PluginManager.add('audioPanner', audioPanner);
})
(window.mw, window.jQuery, window.shaka);