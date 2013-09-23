var NativeBridge = {
    callbacksCount : 1,
    callbacks : {},

    // Automatically called by native layer when a result is available
    resultForCallback : function resultForCallback(callbackId, resultArray) {
        try {
            var callback = NativeBridge.callbacks[callbackId];
            if (!callback) return;

            callback.apply(null,resultArray);
        } catch(e) {alert(e)}
    },

    // Use this in javascript to request native objective-c code
    // functionName : string (I think the name is explicit :p)
    // args : array of arguments
    // callback : function with n-arguments that is going to be called when the native code returned
    call : function call(functionName, args, callback) {

        var hasCallback = callback && typeof callback == "function";
        var callbackId = hasCallback ? NativeBridge.callbacksCount++ : 0;

        if (hasCallback)
            NativeBridge.callbacks[callbackId] = callback;

        var iframe = document.createElement("IFRAME");
        iframe.setAttribute("src", "js-frame:" + functionName + ":" + callbackId+ ":" + encodeURIComponent(JSON.stringify(args)));
        document.documentElement.appendChild(iframe);
        iframe.parentNode.removeChild(iframe);
        iframe = null;
    }
};

NativeBridge.videoPlayer = NativeBridge.videoPlayer  || {

    proxyElement: null,
    playerMethods: ['stop', 'play', 'pause', 'drawVideoNativeComponent', 'setPlayerSource', 'bindPlayerEvents', 'showNativePlayer', 'hideNativePlayer', 'toggleFullscreen'],
    registePlayer: function (proxyElement) {
        var _this = this;
        this.proxyElement = proxyElement;
        for (var i = 0; i < this.playerMethods.length; i++) {
            (function (method) {
                _this.proxyElement[method] = function (arg) {
                    _this.execute(method, arg);
                }
            })(this.playerMethods[i]);
        }
        this.proxyElement.attr = function( attributeName, attributeValue ){
            if( attributeName && attributeValue === undefined ) {
                return _this.proxyElement[ attributeName ];
            } else if( attributeName && attributeValue ){
                _this.proxyElement[attributeName] = attributeValue;
                _this.execute('setAttribute', [ attributeName, attributeValue ]);
            }
        }

        this.bindNativeEvents();
    },
    //this function should be called from IOS/Andorid
    trigger: function (eventName, eventValue) {
        "use strict";
        console.log('proxy.js --> trigger:' + eventName + ' ' + eventValue);

        if (eventValue === "(null)") {
            //set undefined
            eventValue = void(0);
        }

        if(eventValue != undefined){
            var jsEventValue = this.stringConvertion( eventValue );
        }

		$( this.proxyElement).trigger( eventName, [jsEventValue] );

        if (eventName == 'loadedmetadata'){
            this.proxyElement['duration'] = jsEventValue;
        }else if (eventName == 'timeupdate'){
            this.proxyElement['currentTime'] = jsEventValue;
        }else if (eventName == 'progress'){
            this.proxyElement['progress'] = jsEventValue;
        }else if (eventName == 'visible'){
            this.proxyElement['visible']  = jsEventValue;
        }
    },
    execute: function (command, args) {
        args = args || [];
        console.log(command);
        console.log(args);
        NativeBridge.call(command , args);
    },
    bindNativeEvents: function(){
        console.log('bindNativeEvents');
        this.proxyElement.bindPlayerEvents( [] );
    },
    log:function(message,arg){
        console.log(message,arg);
    },

    stringConvertion: function (str){
        "use strict";

        var value = parseFloat(str);

        if(isNaN(value)){
            if(value == 'true'){
                return true;
            }else if(value == 'false'){
                return false;
            }else{
                return str;
            }
        }

        return value;
    }
};

// window.setTimeout(function(){console.log('loaded');
//     if ($("#Login-username")){
//         $("#Login-username").val("eliza");
//         $("#Login-password").val("elizaeliza");
//         $("#Login-login").click();
//     }
// },1000);

$(document).ready(function(){
    var player = NativeBridge.videoPlayer;

    var kmsMenuBtn = $('#Kbtn-navbar');

    if ( kmsMenuBtn )  {
        kmsMenuBtn.on('menuOpens',function(){
            togglePlayerVisibility();
        });
    }

    var userMenuBtn = $('#mobileUserMenu');

    if ( userMenuBtn )  {
        userMenuBtn.on('userMenuClicked',function(){
            togglePlayerVisibility();
        });
    }

    var togglePlayerVisibility = function(){
//        if ( player.proxyElement.attr('visible') === 'true' ) {
//            player.proxyElement.hideNativePlayer();
//            player.proxyElement.attr('visible', 'false');
//        } else {
//            var videoElementDiv = document.getElementById( this.id );
//            var videoElementRect = videoElementDiv.getBoundingClientRect();
//
//            var x = videoElementRect.left;
//            var y = videoElementRect.top;
//            var w = videoElementRect.right - videoElementRect.left;
//            var h = videoElementRect.bottom - videoElementRect.top;
//
//            this.proxyElement.drawVideoNativeComponent( [x, y, w, h] );
//
//            player.proxyElement.showNativePlayer();
//            player.proxyElement.attr('visible', 'true');
//        }
    }
});

