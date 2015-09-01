/**
 * Created by itayk on 8/18/14.
 */
( function( mw, $ ) {"use strict";

	mw.PluginManager.add( 'playServerUrls', mw.KBasePlugin.extend({

		defaultConfig: {
			enabledOn : "mobile"
		},
		setup: function(){
			mw.setConfig("LeadWithHLSOnFlash",true);
			mw.setConfig("LeadHLSOnAndroid",true);

			// Bind player
			this.addBindings();
		},
		isSafeEnviornment: function(){
			switch (this.getConfig("enabledOn")){
				case "mobile": return !!mw.isMobileDevice();
				case "never":return false;
				default :return true;
			}
		},
		addBindings: function(){
			var _this = this;
			this.bind("SourceSelected", function(event,source){
				if ( source.type === "application/vnd.apple.mpegurl" &&  source.src.toLowerCase().indexOf("playmanifest") > -1 &&
					source.src.toLowerCase().indexOf("useplayserver") === -1) {
					source.src = _this.injectParam(source.src,"uiconf/" + _this.embedPlayer.kuiconfid);
					source.src = _this.injectParam(source.src,"usePlayServer/1");
					source.src = _this.injectGetParam(source.src,"playerConfig=" + _this.getPlayerConfig());
				}
			});

		},
		injectParam:function(src,param) {
			return src.replace( /playmanifest/ig ,"playManifest/" + param );

		},
		injectGetParam:function(src,param){
			if (src.indexOf("?") > -1){
				return src + "&" + param;
			}
			return src +"?" + param;
		},
		getPlayerConfig:function(){
			var fv = this.embedPlayer.getFlashvars();
			delete fv[0];
			return JSON.stringify(fv);
		}

	}));

} )( window.mw, window.jQuery );