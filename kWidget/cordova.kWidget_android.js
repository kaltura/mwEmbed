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
				executeCordova( null, null, "NativeComponentPlugin", "cordovaInitialized", [] );
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
				this.exec( "setIframeUrl", [ this.iframeUrl ] );
				var _this = this;
				window.addEventListener('orientationchange', function(){
					//when we get this event the new dimensions aren't set yet
					setTimeout( function() {
						_this.drawPlayer( _this.target );
					}, 250 );

				});
			},
			addApi: function( target ){
				target.exec = this.exec;
				target.evaluate = this.evaluate;
				target.sendNotification = this.sendNotification;
				target.addJsListener = this.addJsListener;
			},
			exec: function( command, args ){
				if( args == undefined || !args ){
					args = [];
				}
				executeCordova(null,null,"NativeComponentPlugin", command, args);
			},
			evaluate:function(){
				this.exec("evaluate", ['']);
			},
			sendNotification:function( notificationName, notificationData ){
				this.exec( "sendNotification", [ notificationName, JSON.stringify( notificationData ) ]);
			},
			addJsListener:function(){

			},
			drawPlayer:function( target ){
				// get target size + position
				var videoElementRect = target.getBoundingClientRect();

				var x = videoElementRect.left;
				var y = videoElementRect.top;
				var w = videoElementRect.right - videoElementRect.left;
				var h = videoElementRect.bottom - videoElementRect.top;
				this.exec( "drawVideoNativeComponent", [x, y, w, h] );
			}
		};
	}
	document.addEventListener("deviceready", init, false);

})( window.kWidget );