var cordova = cordova || {};
cordova.videoPlayer = {
    //first add div
      addDiv: function (){
          "use strict";

          var divElement = document.createElement("div");
          divElement.setAttribute('id', 'proxy');
          divElement.innerHTML = "Just Div Test";
//         parent = document.body
          document.body.appendChild(divElement);
      },

    // then register player
    //
    proxyElement: null,
//Add events here
    playerMethods: ['play', 'pause'],
    registePlayer: function (proxyElement) {
        var _this = this;
        this.proxyElement = proxyElement;
        for (var i = 0; i < this.playerMethods.length; i++) {
            (function (method) {
                _this.proxyElement[method] = function () {
                    _this.execute(method, arguments);
                }
            })(this.playerMethods[i]);
        }
    },
    //this function should be called from IOS/Andorid
    trigger: function (eventName, args) {
        "use strict";
        var jsEventName = this.getEventName(eventName);
        var event = new Event(jsEventName);
        this.proxyElement.dispatchEvent(event);

    },
    execute: function (command, args) {
        //native execute commands + array of args
    },

    playerEventsMap: {},
    fillPlayerEventsMap: function () {
        "use strict";
        this.playerEventsMap= {
            //MPMoviePlaybackState - MPMoviePlayerPlaybackStateDidChangeNotification
//           'MPMoviePlaybackStateStopped': '',
            'MPMoviePlaybackStatePlaying': 'playing',
            'MPMoviePlaybackStatePaused': 'pause',
//            'MPMoviePlaybackStateInterrupted': '',
            'MPMoviePlaybackStateSeeking': 'seeking',

            //
            'MPMovieFinishReasonPlaybackEnded': 'ended',
            'MPMovieFinishReasonPlaybackError': 'error',
//            'MPMovieFinishReasonUserExited': '',

            //MPMovieLoadState
//            'MPMovieLoadStateUnknown' :'',
            'MPMovieLoadStatePlayable': 'canplay',
//            'MPMovieLoadStatePlaythroughOK' :'',
            'MPMovieLoadStateStalled': 'stalled'
        };
    },
    getEventName: function (key) {
        "use strict";
        return this.playerEventsMap[key];
    }
} || cordova.videoPlayer;