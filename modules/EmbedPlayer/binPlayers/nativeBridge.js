( function( mw, $ ) { "use strict";
var NativeBridge = {
	callbacksCount : 1,
	callbacks : {},

	// Automatically called by native layer when a result is available
	resultForCallback : function resultForCallback(callbackId, resultArray) {
		try {
			var callback = NativeBridge.callbacks[callbackId];
			if (!callback) {
				return;
			}

			callback.apply(null,resultArray);
		} catch(e) {alert(e);}
	},

	// Use this in javascript to request native objective-c code
	// functionName : string (I think the name is explicit :p)
	// args : array of arguments
	// callback : function with n-arguments that is going to be called when the native code returned
	call : function call(functionName, args, callback) {

		var hasCallback = callback && typeof callback == "function";
		var callbackId = hasCallback ? NativeBridge.callbacksCount++ : 0;

		if (hasCallback) {
			NativeBridge.callbacks[callbackId] = callback;
		}

		var iframe = document.createElement("IFRAME");
		iframe.setAttribute("src", "js-frame:" + functionName + ":" + callbackId+ ":" + encodeURIComponent(JSON.stringify(args)));
		document.documentElement.appendChild(iframe);
		iframe.parentNode.removeChild(iframe);
		iframe = null;
	}
};

NativeBridge.videoPlayer = NativeBridge.videoPlayer  || {
	proxyElement: null,
	embedPlayer: null,
	isJsCallbackReady: false,
	bindPostfix: ".nativeBridge",
	playerMethods: [ 'stop', 'play', 'pause', 'setPlayerSource', 'bindPlayerEvents', 'showNativePlayer', 'hideNativePlayer', 'toggleFullscreen', 'notifyKPlayerEvent', 'notifyKPlayerEvaluated', 'notifyJsReady', 'showChromecastDeviceList', 'notifyLayoutReady',
		'doneFSBtnPressed', 'addNativeAirPlayButton', 'showNativeAirPlayButton', 'hideNativeAirPlayButton' ],

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
		this.notifyJsReadyFunc();
	},

	notifyJsReadyFunc: function() {
		if ( this.isJsCallbackReady && this.proxyElement ) {
			this.proxyElement.notifyJsReady( [] );
		}
	},

	registerEmbedPlayer: function( embedPlayer ) {
		this.embedPlayer = embedPlayer;
	},
	sendNotification: function( eventName, eventValue ) {
		this.embedPlayer.sendNotification( eventName, JSON.parse( eventValue ));
	},
	/**
	 *
	 * @param object
	 * @returns String rerpesantation of given object
	 */
	getObjectString: function ( object ) {
		var stringValue = object;
		if ( typeof object === "object" ) {
			stringValue =  JSON.stringify( object );
		}
		return stringValue;
	},
	addJsListener: function( eventName ){
		var _this = this;
		this.embedPlayer.addJsListener( eventName + this.bindPostfix, function( val ) {
			_this.embedPlayer.getPlayerElement().notifyKPlayerEvent( [ eventName, _this.getObjectString( val ) ] );
		});
	},
	removeJsListener: function( eventName ) {
		this.embedPlayer.removeJsListener( eventName + this.bindPostfix );
	},
	setKDPAttribute: function( host, prop, value ) {
		this.embedPlayer.setKDPAttribute( host, prop, value );
	},
	/**
	 * will evaluate given expression and send the resulted value back to native code with the given callbackName
	 * @param expression
	 * @param callbackName
	 */
	asyncEvaluate: function( expression, callbackName ) {
		var result = this.embedPlayer.evaluate( expression );
		this.embedPlayer.getPlayerElement().notifyKPlayerEvaluated( [ callbackName, this.getObjectString( result ) ]);
	},
	//this function should be called from IOS/Andorid
	trigger: function (eventName, eventValue) {
	//	mw.log('nativeBridge.js --> trigger:' + eventName + ' ' + eventValue);

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


if ( mw.getConfig('EmbedPlayer.ForceNativeComponent') === true ) {
	window["NativeBridge"] = NativeBridge;
	kWidget.addReadyCallback(  function() {
		NativeBridge.videoPlayer.isJsCallbackReady = true;
		NativeBridge.videoPlayer.notifyJsReadyFunc();
	} );
}

})( window.mw, window.jQuery );