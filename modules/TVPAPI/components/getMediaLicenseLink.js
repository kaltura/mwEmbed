(function ( mw, $ ) {
	"use strict";

	mw.PluginManager.add( 'getMediaLicenseLink', mw.KBaseProxyPlugin.extend( {

			defaultConfig: {
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
				}
			},

			isDisabled: false,

			setup: function ( embedPlayer ) {
				this.addBindings();
			},

			addBindings: function () {
				var _this = this;
				this.bind("sourceSelected", function(event, source){
					_this.getMediaLicenseLink(event, source);
				});
			},

			getMediaLicenseLink: function(event, source){
				var proxyConfig = this.getProxyConfig();
				var baseConfig = this.getConfig("baseConfig");

				function merge(base, data) {
					var combinedData = {};
					var confItem;
					for ( confItem in base ) {
						if (typeof(base[confItem]) == "object"){
							combinedData[confItem] = merge(base[confItem], data[confItem]);
						} else {
							if (data[confItem] !== undefined){
								combinedData[confItem] = data[confItem];
							}
						}
					}
					return combinedData;
				}

				var combinedData = merge(baseConfig, proxyConfig);

				combinedData["mediaFileID"] = source.id;
				combinedData["baseLink"] = source.src;

				function successHandler(res, status)
				{
					source.src = res;
				}
				function errorHandler(xmlHttpRequest, status)
				{
					//Handle error - dispatch event
					//source.src = "http://mcott2_tvinci2-s.akamaihd.net/ondemand/201401B/FR_HD_ELLA_THE_ELEPHANT_EP2_PC_SS.ism/Manifest";
				}

				$.ajax({
					url: "http://tvpapi.as.tvinci.com/V2_4/gateways/jsonpostgw.aspx?m=GetMediaLicenseLink",
					type: "POST",
					dataType: "json",
					contentType: "application/json",
					data: JSON.stringify(combinedData),
					//complete: completeHandler,
					success: successHandler,
					error: errorHandler,
					async: false
				});

				return false;
			}
		} )
	);

})( window.mw, window.jQuery );
