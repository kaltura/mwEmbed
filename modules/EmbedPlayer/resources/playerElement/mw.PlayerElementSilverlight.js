( function( mw, $ ) {"use strict";

// Class defined in resources/class/class.js
	mw.PlayerElementSilverlight = mw.PlayerElement.extend({

		init: function(containerId , playerId , elementFlashvars, target, readyCallback ){
			var _this = this;
			this.element = this;
			this.id = playerId;
			this.targetObj = target;
			var xapPath = mw.getMwEmbedPath() + 'modules/EmbedPlayer/binPlayers/silverlight-player/Player.xap';
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
				readyCallback();
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
					background:"#000000",
					version: "4.0.60310.0" },
				{
					onError: "onError" + playerId,
					onLoad: "onLoad" + playerId },
				params
			//	context: "row4"
			);

		}
	});
} )( window.mw, jQuery );
