/**
 * Created with JetBrains WebStorm.
 */

/**
 * Cordova kWidget lib
 */
(function(kWidget){ "use strict"
	if( !kWidget ){
		return ;
	}
	var init = function(){
		var executeCordova;

		cordova.define("cordova/plugin/NativeComponentPlugin",
			function(require, exports, module) {
				executeCordova = require("cordova/exec");
			});
		//This is mandatory for supporting cordova plugins
		if (!window.plugins) {
			window.plugins = {};
		}
		if (!window.plugins.NativeComponentPlugin) {
			window.plugins.NativeComponentPlugin = cordova.require("cordova/plugin/NativeComponentPlugin");
		}

		cordova.kWidget = {

			// This element is populated by cordova
			proxyElement: null,
			// callbacks to auth object events go here:
			embed : function( targetId, settings ){
				this.target = document.getElementById( targetId );
				this.iframeUrl = kWidget.getIframeUrl() + '?' + kWidget.getIframeRequest( targetId, settings );
				this.iframeUrl += '#' + JSON.stringify( window.preMwEmbedConfig );
				this.addApi( this.target );
				this.drawPlayer( this.target );
			},
			addApi: function( target ){
				target.evaluate = this.evaluate;
				target.sendNotification = this.sendNotification;
				target.addJsListener = this.addJsListener;
				target.exec = this.exec;
			},
			exec:function(){
				executeCordova(null,null,"NativeComponentPlugin",command, args);
			},
			evaluate:function(){
				this.exec("evaluate", ['']);
			},
			sendNotification:function( notificationName, notificationData ){
				executeCordova(null,null,"NativeComponentPlugin", "sendNotification",  [ notificationName, JSON.stringify( notificationData ) ]);
			},
			addJsListener:function(){

			},
			drawPlayer:function( target ){
				// get target size + position

				var videoElementDiv = this.target;
				var videoElementRect = videoElementDiv.getBoundingClientRect();

				var x = videoElementRect.left;
				var y = videoElementRect.top;
				var w = videoElementRect.right - videoElementRect.left;
				var h = videoElementRect.bottom - videoElementRect.top;

				executeCordova( null,null,"NativeComponentPlugin","drawVideoNativeComponent", [ x, y, w, h ] );
				executeCordova( null,null,"NativeComponentPlugin","setIframeUrl", [ this.iframeUrl ] );
			}

		};
	}
	document.addEventListener("deviceready", init, false);

})( window.kWidget );