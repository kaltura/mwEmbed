/**
 * Created with JetBrains WebStorm.
 * User: elizasapir
 * Date: 9/10/13
 * Time: 5:58 PM
 * To change this template use File | Settings | File Templates.
 */

/**
 * Cordova kWidget lib
 */
(function(kWidget){ "use strict"
	if( !kWidget ){
		return ;
	}
	var init = function(){

		if ( kWidget.isAndroid() ){
			var executeCordova;
			cordova.define("cordova/plugin/NativeComponentPlugin",
				function(require, exports, module) {
					executeCordova = require("cordova/exec");
					executeCordova( null, null, "NativeComponentPlugin", "cordovaInitialized", [] );
				});
			//This is mandatory for supporting cordova plugins
			if (!window.plugins) {
				window.plugins = {};
			}
			if (!window.plugins.NativeComponentPlugin) {
				window.plugins.NativeComponentPlugin = cordova.require("cordova/plugin/NativeComponentPlugin");
			}
		}
		cordova.kWidget = {
			// This element is populated by cordova
			proxyElement: null,
			// callbacks to auth object events go here:
			embed : function( targetId, settings ){
				this.target = document.getElementById( targetId );
				this.target.style.cssText = "background-color:transparent;";
				//kWidget.getIframeRequest( targetId, settings ) - we get it encoded so we decode before encoding whole url again
				this.iframeUrl = kWidget.getIframeUrl() + '?' + decodeURIComponent(kWidget.getIframeRequest( targetId, settings ));
				this.iframeUrl += '#' + JSON.stringify( window.preMwEmbedConfig );
				this.addApi( this.target );
				this.drawPlayer( this.target );
				this.exec( "setIframeUrl", [ this.iframeUrl ] );
				var _this = this;
				window.addEventListener('orientationchange', function(){
					//when we get this event the new dimensions aren't set yet
					if ( kWidget.isAndroid() ){
						setTimeout( function() {
							_this.drawPlayer( _this.target );
						}, 250 );
					}else {
						_this.drawPlayer( _this.target );
					}
				});
			},
			addApi: function( target ){
				target.exec = this.exec;
				target.evaluate = this.evaluate;
				target.sendNotification = this.sendNotification;
				target.addJsListener = this.addJsListener;
				target.asyncEvaluate = this.asyncEvaluate;
				target.setKDPAttribute = this.setKDPAttribute;
				target.removeJsListener = this.removeJsListener;
			},
			exec: function( command, args ){
				if( args == undefined || !args ){
					args = [];
				}
				if ( kWidget.isAndroid() ){
					cordova.exec = executeCordova;
				}
				cordova.exec(null,null,"NativeComponentPlugin", command, args);
			},
			evaluate:function(){
				this.exec( "evaluate", [ '' ] );
			},
			sendNotification:function( notificationName, notificationData ){
				this.exec( "sendNotification", [ notificationName, JSON.stringify( notificationData ) ] );
			},
			addJsListener: function( notificationName, callbackName ){
				this.exec( "addJsListener", [ notificationName, callbackName ] );
			},
			removeJsListener: function( notificationName, callbackName ){
				this.exec( "removeJsListener", [ notificationName, callbackName ] );
			},
			asyncEvaluate: function( expression, callbackName ) {
				this.exec( "asyncEvaluate", [ expression, callbackName ] );
			},
			setKDPAttribute: function( host, prop, value ) {
				this.exec( "setKDPAttribute", [ host, prop, value ] );
			},
			drawPlayer: function( target ){
				// get target size + position
				var videoElementRect = target.getBoundingClientRect();
				var x = videoElementRect.left;
				var y = videoElementRect.top + document.body.scrollTop;
				var w = videoElementRect.right - videoElementRect.left;
				var h = videoElementRect.bottom - videoElementRect.top;
				this.exec( "drawVideoNativeComponent", [ x, y, w, h ] );
			}
		};
	}
	document.addEventListener( "deviceready", init, false );
})( window.kWidget );