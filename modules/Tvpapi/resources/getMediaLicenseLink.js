(function (mw, $) {
	"use strict";

	mw.PluginManager.add( 'tvpapiGetMediaLicenseLink', mw.KBasePlugin.extend( {

		defaultConfig: {
			"restMethod": "GetMediaLicenseLinks",
			"restApiBaseUrl": "",
			"baseConfig": {
				"initObj": {
					"Locale": {
						LocaleLanguage: "",
						LocaleCountry: "",
						LocaleDevice: "",
						LocaleUserState: "Unknown"
					},
					Platform: "Web",
					SiteGuid: "-1",
					DomainID: "",
					UDID: "",
					"ApiUser": "",
					"ApiPass": ""
				},
				"mediaFileID": "",
				"baseLink": ""
			},
		},

		isDisabled: false,
		lastSelectedSource: "",

		setup: function ( embedPlayer ) {
			this.addBindings();
		},

		getProxyConfig: function( attr, raw ) {
			if( raw ){
				return this.embedPlayer.getRawKalturaConfig( "proxyData", attr );
			}
			return this.embedPlayer.getKalturaConfig( "proxyData", attr );
		},

		addBindings: function () {
			var _this = this;
			this.bind("SourceSelected", function(event, source){
				//Prevent dispatching request if source haven't change or it's not valid source (assetid is not valid)
				if ((source.assetid != 0) && (_this.lastSelectedSource != source.assetid)) {
					_this.lastSelectedSource = source.assetid;
					_this.getMediaLicenseLink( event, source );
				}
			});
		},

		getMediaLicenseLink: function(event, source){
			var baseUrl = this.getPlayer().getKalturaConfig( null, 'TVPAPIBaseUrl' ) || this.getConfig( "restApiBaseUrl" );
			var restMethod = this.getConfig("restMethod");
			if (baseUrl != "" && restMethod != "") {
				var url = baseUrl + restMethod;
				var proxyConfig = this.getProxyConfig();
				var baseConfig = this.getConfig( "baseConfig" );
				var _this = this;

				var merge = function( base, data ) {
					var combinedData = {};
					var confItem;
					for ( confItem in base ) {
						if ( typeof(base[confItem]) == "object" ) {
							combinedData[confItem] = merge( base[confItem], data[confItem] );
						} else {
							if ( data[confItem] !== undefined ) {
								combinedData[confItem] = data[confItem];
							}
						}
					}
					return combinedData;
				};

				var combinedData = merge( baseConfig, proxyConfig );

				combinedData["mediaFileID"] = source.assetid;
				combinedData["baseLink"] = source.src;

				var successHandler = function ( res, status ) {
					if( res == "" ) {
						_this.getPlayer().triggerHelper('tvpapiNoSubscription', [status]);
					} else {
						_this.getPlayer().triggerHelper('tvpapiSubscription', [status]);
						source.src = res;
					}
				};
				var errorHandler = function ( xmlHttpRequest, status ) {
					//TODO:Handle error - dispatch event
				};

				$.ajax( {
					url: url,
					type: "POST",
					dataType: "json",
					contentType: "application/json",
					data: JSON.stringify( combinedData ),
					//complete: completeHandler,
					success: successHandler,
					error: errorHandler,
					async: false
				} );
			}

			return false;
		}
	}));
})(window.mw, window.jQuery);
