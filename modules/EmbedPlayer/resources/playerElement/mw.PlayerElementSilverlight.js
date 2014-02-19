( function( mw, $ ) {"use strict";

// Class defined in resources/class/class.js
	mw.PlayerElementSilverlight = mw.PlayerElement.extend({

		init: function(containerId , playerId , elementFlashvars, target, readyCallback ){
			var _this = this;
			this.element = this;
			this.id = playerId;
			this.targetObj = target;
			var xapPath = mw.getMwEmbedPath() + 'modules/EmbedPlayer/binPlayers/silverlight-player/Player.xap';
			//var xapPath = 'http://localhost/lightKdp/KDP3/bin-debug/Player.xap';
			window["onError" + playerId]=function(sender, args){
				var appSource = "";
				if (sender != null && sender != 0) {
					appSource = sender.getHost().Source;
				}

				var errorType = args.ErrorType;
				var iErrorCode = args.ErrorCode;

				if (errorType == "ImageError" || errorType == "MediaError") {
					return;
				}

				var errMsg = "Unhandled Error in Silverlight Application " +  appSource + "\n" ;

				errMsg += "Code: "+ iErrorCode + "    \n";
				errMsg += "Category: " + errorType + "       \n";
				errMsg += "Message: " + args.ErrorMessage + "     \n";

				if (errorType == "ParserError") {
					errMsg += "File: " + args.xamlFile + "     \n";
					errMsg += "Line: " + args.lineNumber + "     \n";
					errMsg += "Position: " + args.charPosition + "     \n";
				}
				else if (errorType == "RuntimeError") {
					if (args.lineNumber != 0) {
						errMsg += "Line: " + args.lineNumber + "     \n";
						errMsg += "Position: " +  args.charPosition + "     \n";
					}
					errMsg += "MethodName: " + args.methodName + "     \n";
				}
				mw.log("Error occur in silverlight player:" +errMsg);
			}
			window["onLoad" + playerId] = function(sender,args){
				var slCtl = sender.getHost();
				_this.playerProxy =  slCtl.Content.MediaElementJS;
				//slCtl.Content.MediaElementJS.addJsListener("playerPlayed", "playing");
				// We wrap everything in setTimeout to avoid Firefox race condition with empty cache
					_this.playerElement = _this.playerProxy;

					//if this is the target object: add event listeners
					//if a different object is the target: it should take care of its listeners (such as embedPlayerKPlayer)
					if ( !_this.targetObj ) {
						_this.targetObj = _this;

						var bindEventMap = {
							'playerPaused' : 'onPause',
							'playerPlayed' : 'onPlay',
							'durationChange' : 'onDurationChange',
							'playerPlayEnd' : 'onClipDone',
							'playerUpdatePlayhead' : 'onUpdatePlayhead',
							'playerSeekEnd': 'onPlayerSeekEnd',
							'alert': 'onAlert',
							'mute': 'onMute',
							'unmute': 'onUnMute',
							'volumeChanged': 'onVolumeChanged'
						};

						$.each( bindEventMap, function( bindName, localMethod ) {
							_this.bindPlayerFunction(bindName, localMethod);
						});
					}

					//imitate html5 video readyState
					_this.readyState = 4;
					// Run ready callback
					if( $.isFunction( readyCallback ) ){
						readyCallback.apply( _this );
					}

					//notify player is ready
					$( _this ).trigger('playerJsReady');
			}

			var params = "";
			for (var i in elementFlashvars){
				params += i +"=" + elementFlashvars[i]+",";
			}

			Silverlight.createObject(
				 xapPath,
				 $("#"+containerId).get(0),
				 playerId,
				 {
					 width:"100%",height:"100%" ,
					background:"transparent",
					 windowless:"true",
					version: "4.0.60310.0" },
				{
					onError: "onError" + playerId,
					onLoad: "onLoad" + playerId },
				params
			//	context: "row4"
			);


		},
		onUpdatePlayhead : function ( playheadVal ) {
			this.currentTime = playheadVal;
		},
		onPause : function() {
			this.paused = true;
			//TODO trigger event?
		},
		onPlay : function() {
			this.paused = false;
			$( this ).trigger( 'playing' );
		},
		onDurationChange : function( data, id ) {
			this.duration = data.newValue;
			$( this ).trigger( 'loadedmetadata' );
		},
		onClipDone : function() {
			$( this ).trigger( 'ended' );
		},
		onPlayerSeekEnd: function() {
			$( this ).trigger( 'seeked' );
		},
		onAlert : function ( data, id ) {
			//TODO?
		},
		onMute: function () {
			this.muted = true;
		},
		onUnMute: function () {
			this.muted = false;
		},
		onVolumeChanged: function ( data ) {
			this.volume = data.newVolume;
			$( this).trigger( 'volumechange' );
		},
		addJsListener: function( eventName, methodName ) {
			if ( this.playerElement ) {
				this.bindPlayerFunction( eventName, methodName );
			}
		},
		play: function(){
			this.playerProxy.playMedia();
		},
		stop:function(){
			this.playerElement.stopMedia();
		},
		pause: function(){
			this.playerProxy.pauseMedia();
		},
		seek: function( val ){
			this.playerProxy.setCurrentTime(val);
			$( this ).trigger( 'seeking' );
		},
		load: function(){
			this.playerProxy.setSrc(this.src);
			this.playerProxy.loadMedia();
		},
		changeVolume: function( volume ){
			this.playerProxy.setVolume(  volume );
		},

		/**
		 * Bind a Player Function,
		 *
		 * Build a global callback to bind to "this" player instance:
		 *
		 * @param {String}
		 *			flash binding name
		 * @param {String}
		 *			function callback name
		 *
		 *@param {object}
		 * 		target object to call the listening func from
		 */
		bindPlayerFunction : function(bindName, methodName, target) {
			var _this = this;
			mw.log( 'PlayerElementSilverlight:: bindPlayerFunction:' + bindName );
			// The kaltura kdp can only call a global function by given name
			var gKdpCallbackName = 'silverlight_' + methodName + '_cb_' + this.id.replace(/[^a-zA-Z 0-9]+/g,'');

			// Create an anonymous function with local player scope
			var createGlobalCB = function(cName) {
				window[ cName ] = function(data) {
					// Track all events ( except for playerUpdatePlayhead and bytesDownloadedChange )
					if( bindName != 'playerUpdatePlayhead' && bindName != 'bytesDownloadedChange' ){
						mw.log("PlayerElementSilverlight:: event: " + bindName);
					}
					_this.targetObj[methodName](data);
				};
			}(gKdpCallbackName, this);
			// Remove the listener ( if it exists already )
			this.playerElement.removeJsListener( bindName, gKdpCallbackName );
			// Add the listener to the Silvrtliht player:
			this.playerElement.addJsListener( bindName, gKdpCallbackName);
		}
	});
} )( window.mw, jQuery );


