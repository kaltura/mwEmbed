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
				var _this = this;
				window.addEventListener('orientationchange', function(){
					_this.reDrawPlayer( _this.target );
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
				cordova.exec(null,null,"NativeComponentPlugin", command, args);
			},
			evaluate:function(){
				this.exec( "evaluate", [ '' ] );
			},
			sendNotification:function( notificationName, notificationData ){
				this.exec( "sendNotification", [ notificationName, JSON.stringify( notificationData ) ] );
			},
			addJsListener: function(){
			},
			drawPlayer: function( target ){
				// get target size + position
				var videoElementDiv = target;
				var videoElementRect = videoElementDiv.getBoundingClientRect();
				var x = videoElementRect.left;
				var y = videoElementRect.top + document.body.scrollTop;
				var w = videoElementRect.right - videoElementRect.left;
				var h = videoElementRect.bottom - videoElementRect.top;
				this.exec( "drawVideoNativeComponent", [ x, y, w, h ] );
				this.exec( "setIframeUrl", [ this.iframeUrl ] );
			},
			reDrawPlayer: function( target ){
				// get target size + position
				var videoElementDiv = target;
				var videoElementRect = videoElementDiv.getBoundingClientRect();
				var x = videoElementRect.left;
				var y = videoElementRect.top + document.body.scrollTop;
				var w = videoElementRect.right - videoElementRect.left;
				var h = videoElementRect.bottom - videoElementRect.top;
				this.exec( "reDrawPlayer", [ x, y, w, h ] );
			}
		};
	}
	document.addEventListener( "deviceready", init, false );
})( window.kWidget );