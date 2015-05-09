
var WidevinePlugin;
	var widevineKdp;
if (!kWidget.isMobileDevice()) {
	kWidget.addReadyCallback(function (playerId) {
		widevineKdp = document.getElementById(playerId);
		var playerType = widevineKdp.nodeName.toLowerCase();
		//if the player is KDP
		if (playerType == "object") {
			widevineKdp.kBind("entryReady", function () {
				widevine.init();
			});
		} else {
			//if Kplayer is available - tell it to load widevine swf plugin
			if (kWidget.supportsFlash()) {
				widevineKdp.setKDPAttribute('kdpVars.widevine', 'plugin', 'true');
				widevineKdp.setKDPAttribute('kdpVars.widevine', 'loadingPolicy', 'preInitialize');
				widevineKdp.setKDPAttribute('kdpVars.widevine', 'asyncInit', 'true');

				widevineKdp.kBind('entryReady', function () {
					if (widevine.isWvFlavors()) {
						widevineKdp.setKDPAttribute('kdpVars.widevine', 'isWv', 'true');
					}
					widevine.init();
				});
			}
			else {
				//hide default "no source found" alert
				widevineKdp.setKDPAttribute(null, 'disableAlerts', true);

				widevineKdp.kBind("playerReady", function () {
					var flavors = widevineKdp.evaluate("{mediaProxy.kalturaMediaFlavorArray}");
					//if we received flavors we can play them. continue.
					if (flavors && flavors.length)
						return;

					//if mobile device
					var msg = null;
					var title = null;
					if (kWidget.isMobileDevice()) {
						return;
						msg = widevineKdp.evaluate("{widevine.useSupportedDeviceMsg}") || "This video requires Adobe Flash Player, which is not supported by your device. You can watch it on devices that support Flash.";
						title = widevineKdp.evaluate("{widevine.useSupportedDeviceTitle}") || "Notification";
					} else {
						//flash is not installed - prompt to install flash
						if (navigator.mimeTypes ["application/x-shockwave-flash"] == undefined) {
							msg = widevineKdp.evaluate("{widevine.intallFlashMsg}") || "This video requires Adobe Flash Player, which is currently not available on your browser. Please <a href='http://www.adobe.com/support/flashplayer/downloads.html' target='_blank'> install Adobe Flash Player </a> to view this video.";
							title = widevineKdp.evaluate("{widevine.installFlashTitle}") || "Notification";
						} else { //else prompt to use kdp
							msg = widevineKdp.evaluate("{widevine.useKdpMsg}") || "This video requires Adobe Flash enabled player.";
							title = widevineKdp.evaluate("{widevine.useKdpTitle}") || "Notification";
						}
					}
					if (msg && title) {
						widevineKdp.sendNotification("alert", {keepOverlay: true, message: msg, title: title});
						widevineKdp.sendNotification("enableGui", {guiEnabled: false});
					}
				});
			}

		}
	});

	var widevine = function () {

		var debug = false;
		var debug_flags = "";

		// Version of plugin pointed by the installer

		var version = "5.0.0.000";
		var ie_version = "5,0,0,000";

		// Set the head end server

		var signon_url = "https://staging.shibboleth.tv/widevine/cypherpc/cgi-bin/SignOn.cgi";
		var log_url = "https://staging.shibboleth.tv/widevine/cypherpc/cgi-bin/LogEncEvent.cgi";
		var emm_url = "http://www.kaltura.com/api_v3/index.php?service=widevine_widevinedrm&action=getLicense";
		var widevineSrcPath = {
			mac: 'WidevineMediaOptimizer.dmg',
			ie: 'WidevineMediaOptimizerIE.exe',
			firefox: 'WidevineMediaOptimizer_win.xpi',
			chrome: 'WidevineMediaOptimizerChrome.exe'
		};
		// Set the portal

		var portal = "kaltura";

		function doDetect(type, value) {
			return eval('navigator.' + type + '.toLowerCase().indexOf("' + value + '") != -1');
		}


		function detectMac() {
			return doDetect("platform", "mac");
		}

		function detectWin32() {
			return doDetect("platform", "win32");
		}

		function detectIE() {
			return doDetect("userAgent", "msie");
		}

		function detectFirefox() {
			return doDetect("userAgent", "firefox");
		}

		function detectSafari() {
			return doDetect("userAgent", "safari");
		}

		function detectChrome() {
			return doDetect("userAgent", "chrome");
		}

		function detectVistaOrWindows7() {
			return doDetect("userAgent", "windows nt 6");
		}

		function getCookie(c_name) {
			if (document.cookie.length > 0) {
				var c_start = document.cookie.indexOf(c_name + "=")
				if (c_start != -1) {
					c_start = c_start + c_name.length + 1;
					c_end = document.cookie.indexOf(";", c_start);
					if (c_end == -1) c_end = document.cookie.length;
					return unescape(document.cookie.substring(c_start, c_end))
				}
			}
			return ""
		}

		function setCookie(c_name, value, expireseconds) {
			var exdate = new Date();
			exdate.setSeconds(exdate.getSeconds() + expireseconds);
			document.cookie = c_name + "=" + escape(value) +
			((expireseconds == null) ? "" : ";expires=" + exdate.toGMTString())
		}


		/////////////////////////////////////////////////////////////////////////////////
		// Start debug output section
		// Used to write debug information to the screen if debug variable is set to true.
		// Only used by test page
		/////////////////////////////////////////////////////////////////////////////////

		function writeDebugCell(name, bold) {
			if (bold) {
				return "<td><b>" + name + "</b></td>";
			} else {
				return "<td><s>" + name + "</s></td>";
			}
		}

		function writeDebugMimeArray(values) {
			var result = "";
			for (value in values) {
				if (values[value]) {
					result += "<td><table><tr><td>" + values[value].description + "</td></tr><tr><td>" + values[value].type + "</td></tr><tr><td>" + values[value].enabledPlugin + "</td></tr></table></td>";
				}
			}
			return result;
		}

		function DebugInfo() {
			var result = "";
			result += "<table border=1>";

			result += "<tr><td>Platform</td>";
			result += writeDebugCell("Macintosh", detectMac());
			result += writeDebugCell("Windows", detectWin32());
			if (detectWin32()) {
				result += writeDebugCell("Vista/Windows7", detectVistaOrWindows7());
			}
			result += "</tr>";

			result += "<tr><td>Browser</td>";
			result += writeDebugCell("IE", detectIE());
			result += writeDebugCell("Firefox", detectFirefox());
			result += writeDebugCell("Safari", detectSafari());
			result += writeDebugCell("Chrome", detectChrome());
			result += "</tr>";

			if (!detectIE()) {
				result += "<tr><td>MIME types</td>";
				result += writeDebugMimeArray(navigator.mimeTypes);
				result += "</tr>";
			}

			result += "<tr><td>Installed</td><td>";
			if (navigator.mimeTypes['application/x-widevinemediaoptimizer']) {
				var aWidevinePlugin = document.getElementById('WidevinePlugin');
				if (aWidevinePlugin) {
					result += aWidevinePlugin.GetVersion();
				} else {
					result += "MIME type exists but could not load plugin";
				}
			} else {
				result += "MIME Type Not Found";
			}
			result += "</td></tr>";

			result += "</table>";
			return result;
		}

		/////////////////////////////////////////////////////////////////////////////////
		// End debug output section
		// Used to write debug information to the screen if debug variable is set to true.
		// Only used by test page
		/////////////////////////////////////////////////////////////////////////////////


		////////////////////////////////////////////
		// AddDiv
		//
		// Adds a div to the html page
		// html: html to place in the div
		////////////////////////////////////////////
		function AddDiv(html) {
			//wv onpage plugin has already added relevant elements. no need to add again
			if (document.getElementById("wvPrompt") || document.getElementById("WidevinePlugin"))
				return;

			var div = document.createElement("div");
			div.innerHTML = html;

			var firstChild = document.body.firstChild;
			if (firstChild) {
				document.body.insertBefore(div, firstChild);
				var prompt = document.getElementById("wvPrompt");
				//if we need to show the banner - add iFrame behind it
				if (prompt) {
					//without iFrame the div is displayed behind Flash in IE & Chrome
					var iframe = document.createElement("iframe");
					iframe.id = "wvIframe";
					iframe.frameBorder = 0;
					document.body.insertBefore(iframe, div);

					var props = ['top', 'left', 'bottom', 'right', 'position'];
					for (var i in props) {
						iframe.style[props[i]] = prompt.style[props[i]];
					}

					iframe.width = prompt.offsetWidth;
					iframe.height = prompt.offsetHeight;

				}
				else {
					document.body.appendChild(div);
				}

			}
			return div;
		}


		////////////////////////////////////////////
		// EmbedText
		//
		// Returns embed or object tag for the initializing WidevineMediaOptimizer plugin
		////////////////////////////////////////////
		function EmbedText() {
			if (detectIE()) {
				if (pluginInstalledIE()) {
					return '<object id="WidevinePlugin" classid=CLSID:defa762b-ebc6-4ce2-a48c-32b232aac64d ' +
						'hidden=true style="display:none" height="0" width="0">' +
						'<param name="default_url" value="' + signon_url + '">' +
						'<param name="emm_url" value="' + emm_url + '">' +
						'<param name="log_url" value="' + log_url + '">' +
						'<param name="portal" value="' + portal + '">' +
						'<param name="user_agent" value="' + navigator.userAgent + '">' +
						'</object>';
				}
			} else {
				if (navigator.mimeTypes['application/x-widevinemediaoptimizer']) {
					setCookie("FirefoxDisabledCheck", "");
					return '<embed id="WidevinePlugin" type="application/x-widevinemediaoptimizer" default_url="' + signon_url +
						'" emm_url="' + emm_url +
						'" log_url="' + log_url +
						'" portal="' + portal +
						'" height="0" width="0' +
						'" user_agent="' + navigator.userAgent +
						'">';
				}
			}
			return showDownloadPageText();
		}

		////////////////////////////////////////////
		// getWidevineSrc
		//
		// Return the correct file we need to download
		////////////////////////////////////////////
		function getWidevineSrc() {
			var platform = null;
			if (detectMac()) {
				platform = 'mac';
			}
			else if (detectIE()) {
				platform = 'ie';
			}
			else if (detectFirefox()) {
				platform = "firefox";
			}
			else if (detectChrome()) {
				platform = "chrome";
			}
			if (platform) {
				return kWidget.getPath() + 'kWidget/onPagePlugins/widevineMediaOptimizer/resources/' + widevineSrcPath[platform];
			}
			return null;
		}

		////////////////////////////////////////////
		// showDownloadPageText
		//
		// Returns button to download page
		////////////////////////////////////////////
		function showDownloadPageText() {
			if (!widevine.isWvFlavors())
				return;

			widevineKdp.sendNotification("noWidevineBrowserPlugin");

			if (window.wvPromptDiv)
				return window.wvPromptDiv;

			//get texts and style from the player, if they were set
			var wvPromptStyle = widevineKdp.evaluate("{widevine.promptStyle}");
			var wvPromptText = widevineKdp.evaluate("{widevine.promptText}");
			var wvPromptLinkText = widevineKdp.evaluate("{widevine.promptLinkText}");
			var wvPromptInfoText = widevineKdp.evaluate("{widevine.promptInfoText}");
			var wvPromptInfoLink = widevineKdp.evaluate("{widevine.promptInfoLink}");
			var wvPromptRestartChromeAfterInstall = widevineKdp.evaluate("{widevine.PromptRestartChromeAfterInstall}") ||
				"Download of the plugin installer will start immediately. Note that you must restart your Chrome browser after running the installer";

			//workaround to overlap chrome's onpage plugins
			var zIndex = detectChrome() ? "99999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999"
				: "2147483638";

			var promptStyle = wvPromptStyle ? wvPromptStyle : "border:solid 1px #eeeeee; position:fixed; z-index:" + zIndex + "; width:100%; height:40px; color:#505050; background-color:#FDFFDB; top:0px; right:0px; left:0px; font-family:arial; font-size:12px;";
			var promptText = wvPromptText ? wvPromptText : "Widevine Video Optimizer plugin is needed for enabling video playback in this page. ";
			var promptLinkText = wvPromptLinkText ? wvPromptLinkText : "Get Video Optimizer";
			if (wvPromptInfoText && wvPromptInfoLink) {
				promptText += " " + "<a href=" + wvPromptInfoLink + " target='_blank' style='color: #009ACC;'>" + wvPromptInfoText + "</a>" + " ";
			}
			var widevineSrc = getWidevineSrc() || 'http://tools.google.com/dlpage/widevine';
			var onclickString = "";
			if (detectChrome() && !detectMac()) {
				onclickString = "if (confirm('" + wvPromptRestartChromeAfterInstall + "')){document.location.href = '" + widevineSrc + "'}return false;";
			}
			return "<div id='wvPrompt' style='" + promptStyle + "'>" +
				"<div style='margin-left: 10px; margin-top: 10px; width: 100%'>" + promptText + " <a onclick=\"" + onclickString + "\" href=" + widevineSrc + " target='_self' style='color: #009ACC;'>" + promptLinkText + "</a> " +
				" <a onclick='document.getElementById(\"wvPrompt\").style.display=\"none\";document.getElementById(\"wvIframe\").style.display=\"none\";' style='position: absolute; right: 10px; cursor: pointer'>&#10006;</a></div>" +
				"</div>"
		}

		////////////////////////////////////////////
		// pluginInstalledIE
		//
		// Returns true is the plugin is installed
		////////////////////////////////////////////
		function pluginInstalledIE() {
			try {
				var o = new ActiveXObject("npwidevinemediaoptimizer.WidevineMediaTransformerPlugin");
				o = null;
				return true;

			} catch (e) {
				return false;
			}
		}


		return {
			pluginInstalledIE: function () {
				return pluginInstalledIE();
			}
			,
			flashVersion: function () {
				return current_ver;
			}
			,
			init: function () {
				try {
					var banner = EmbedText();
					if (banner)
						AddDiv(banner);

					if (debug) {
						AddDiv(DebugInfo());
					}

				}
				catch (e) {
					alert("widevine.init exception: " + e.message);
				}
			},
			isWvFlavors: function () {
				var entryFlavors = widevineKdp.evaluate("{mediaProxy.kalturaMediaFlavorArray}");
				//either all flavors are encrypted or all are not. If the flavor is not widevine don't show wv prompt.
				if (entryFlavors && entryFlavors.length) {
					if (entryFlavors[0].objectType == "KalturaWidevineFlavorAsset" || entryFlavors[0]["data-flavorid"] == "wvm")
						return true;
				}
				return false;
			}
		};
	}();

	function WVGetURL(arg) {
		var aWidevinePlugin = document.getElementById('WidevinePlugin');
		try {
			transformedUrl = aWidevinePlugin.Translate(arg);
		}
		catch (err) {
			//return "Error calling Translate: " + err.description;
		}
		return transformedUrl;
	}

	function WVGetCommURL() {
		var aWidevinePlugin = document.getElementById('WidevinePlugin');
		try {
			return aWidevinePlugin.GetCommandChannelBaseUrl();
		} catch (err) {
			//alert("Error calling GetCommandChannelBaseUrl: " + err.description);
		}
		return "http://localhost:20001/cgi-bin/";
	}

	function WVSetPlayScale(arg) {
		var aWidevinePlugin = document.getElementById('WidevinePlugin');
		try {
			return aWidevinePlugin.SetPlayScale(arg);
		}
		catch (err) {
			//alert ("Error calling SetPlayScale: " + err.description);
		}
		return 0;
	}

	function WVGetMediaTime(arg) {
		var aWidevinePlugin = document.getElementById('WidevinePlugin');
		try {
			return aWidevinePlugin.GetMediaTime(arg);
		} catch (err) {
			//alert("Error calling GetMediaTime: " + err.description);
		}
		return 0;
	}

	function WVGetClientId() {
		var aWidevinePlugin = document.getElementById('WidevinePlugin');
		try {
			return aWidevinePlugin.getClientId();
		}
		catch (err) {
			//alert ("Error calling GetClientId: " + err.description);
		}
		return 0;
	}


	function WVSetDeviceId(arg) {
		var aWidevinePlugin = document.getElementById('WidevinePlugin');
		try {
			return aWidevinePlugin.setDeviceId(arg);
		}
		catch (err) {
			//alert ("Error calling SetDeviceId: " + err.description);
		}
		return 0;
	}

	function WVSetStreamId(arg) {
		var aWidevinePlugin = document.getElementById('WidevinePlugin');
		try {
			return aWidevinePlugin.setStreamId(arg);
		}
		catch (err) {
			//alert ("Error calling SetStreamId: " + err.description);
		}
		return 0;
	}

	function WVSetClientIp(arg) {
		var aWidevinePlugin = document.getElementById('WidevinePlugin');
		try {
			return aWidevinePlugin.setClientIp(arg);
		}
		catch (err) {
			//alert ("Error calling SetClientIp: " + err.description);
		}
		return 0;
	}

	function WVSetEmmURL(arg) {
		var aWidevinePlugin = document.getElementById('WidevinePlugin');
		try {
			return aWidevinePlugin.setEmmUrl(arg);
		}
		catch (err) {
			//alert ("Error calling SetEmmURL: " + err.description);
		}
		return 0;
	}


	function WVSetEmmAckURL(arg) {
		var aWidevinePlugin = document.getElementById('WidevinePlugin');
		try {
			return aWidevinePlugin.setEmmAckUrl(arg);
		}
		catch (err) {
			//alert ("Error calling SetEmmAckUrl: " + err.description);
		}
		return 0;
	}

	function WVSetHeartbeatUrl(arg) {
		var aWidevinePlugin = document.getElementById('WidevinePlugin');
		try {
			return aWidevinePlugin.setHeartbeatUrl(arg);
		}
		catch (err) {
			//alert ("Error calling SetHeartbeatUrl: " + err.description);
		}
		return 0;
	}


	function WVSetHeartbeatPeriod(arg) {
		var aWidevinePlugin = document.getElementById('WidevinePlugin');
		try {
			return aWidevinePlugin.setHeartbeatPeriod(arg);
		}
		catch (err) {
			//alert ("Error calling SetHeartbeatPeriod: " + err.description);
		}
		return 0;
	}


	function WVSetOptData(arg) {
		var aWidevinePlugin = document.getElementById('WidevinePlugin');
		try {
			return aWidevinePlugin.setOptData(arg);
		}
		catch (err) {
			//alert ("Error calling SetOptData: " + err.description);
		}
		return 0;
	}

	function WVSetPortal(arg) {
		var aWidevinePlugin = document.getElementById('WidevinePlugin');
		try {
			return aWidevinePlugin.setPortal(arg);
		}
		catch (err) {
			//alert ("Error calling SetPortal: " + err.description);
		}
		return 0;
	}


	function WVGetDeviceId() {
		var aWidevinePlugin = document.getElementById('WidevinePlugin');
		try {
			return aWidevinePlugin.getDeviceId();
		}
		catch (err) {
			//alert ("Error calling GetDeviceId: " + err.description);
		}
		return 0;
	}

	function WVGetStreamId() {
		var aWidevinePlugin = document.getElementById('WidevinePlugin');
		try {
			return aWidevinePlugin.getStreamId();
		}
		catch (err) {
			//alert ("Error calling GetStreamId: " + err.description);
		}
		return 0;
	}

	function WVGetClientIp() {
		var aWidevinePlugin = document.getElementById('WidevinePlugin');
		try {
			return aWidevinePlugin.getClientIp();
		}
		catch (err) {
			//alert ("Error calling GetClientIp: " + err.description);
		}
		return 0;
	}


	function WVGetEmmURL() {
		var aWidevinePlugin = document.getElementById('WidevinePlugin');
		try {
			return aWidevinePlugin.getEmmUrl();
		}
		catch (err) {
			//alert ("Error calling GetEmmURL: " + err.description);
		}
		return "";
	}


	function WVGetEmmAckURL() {
		var aWidevinePlugin = document.getElementById('WidevinePlugin');
		try {
			return aWidevinePlugin.getEmmAckUrl();
		}
		catch (err) {
			//alert ("Error calling GetEmmAckUrl: " + err.description);
		}
		return "";
	}

	function WVGetHeartbeatUrl() {
		var aWidevinePlugin = document.getElementById('WidevinePlugin');
		try {
			return aWidevinePlugin.getHeartbeatUrl();
		}
		catch (err) {
			//alert ("Error calling GetHeartbeatUrl: " + err.description);
		}
		return "";
	}


	function WVGetHeartbeatPeriod() {
		var aWidevinePlugin = document.getElementById('WidevinePlugin');
		try {
			return aWidevinePlugin.getHeartbeatPeriod();
		}
		catch (err) {
			//alert ("Error calling GetHeartbeatPeriod: " + err.description);
		}
		return "";
	}


	function WVGetOptData() {
		var aWidevinePlugin = document.getElementById('WidevinePlugin');
		try {
			return aWidevinePlugin.getOptData();
		}
		catch (err) {
			//alert ("Error calling GetOptData: " + err.description);
		}
		return "";
	}

	function WVGetPortal() {
		var aWidevinePlugin = document.getElementById('WidevinePlugin');
		try {
			return aWidevinePlugin.getPortal();
		}
		catch (err) {
			//alert ("Error calling GetPortal: " + err.description);
		}
		return "";
	}


	function WVAlert(arg) {
		alert(arg);
		return 0;
	}


	function WVPDLNew(mediaPath, pdlPath) {
		var aWidevinePlugin = document.getElementById('WidevinePlugin');
		try {
			pdl_new = aWidevinePlugin.PDL_New(mediaPath, pdlPath);
			return pdl_new;
		}
		catch (err) {
			//alert ("Error calling PDL_New: " + err.description);
		}
		return "";
	}

	function WVPDLStart(pdlPath, trackNumber, trickPlay) {
		var aWidevinePlugin = document.getElementById('WidevinePlugin');
		try {
			return aWidevinePlugin.PDL_Start(pdlPath, trackNumber, trickPlay);
		}
		catch (err) {
			//alert ("Error calling PDL_Start: " + err.description);
		}
		return "";
	}

	function WVPDLResume(pdlPath) {
		var aWidevinePlugin = document.getElementById('WidevinePlugin');
		try {
			return aWidevinePlugin.PDL_Resume(pdlPath);
		}
		catch (err) {
			//alert ("Error calling PDL_Resume: " + err.description);
		}
		return "";
	}


	function WVPDLStop(pdlPath) {
		var aWidevinePlugin = document.getElementById('WidevinePlugin');
		try {
			return aWidevinePlugin.PDL_Stop(pdlPath);
		}
		catch (err) {
			//alert ("Error calling PDL_Stop: " + err.description);
		}
		return "";
	}

	function WVPDLCancel(pdlPath) {
		var aWidevinePlugin = document.getElementById('WidevinePlugin');
		try {
			return aWidevinePlugin.PDL_Cancel(pdlPath);
		}
		catch (err) {
			//alert ("Error calling PDL_Stop: " + err.description);
		}
		return "";
	}

	function WVPDLGetProgress(pdlPath) {
		var aWidevinePlugin = document.getElementById('WidevinePlugin');
		try {
			return aWidevinePlugin.PDL_GetProgress(pdlPath);
		}
		catch (err) {
			//alert ("Error calling PDL_GetProgress: " + err.description);
		}
		return "";
	}


	function WVPDLGetTotalSize(pdlPath) {
		var aWidevinePlugin = document.getElementById('WidevinePlugin');
		try {
			return aWidevinePlugin.PDL_GetTotalSize(pdlPath);
		}
		catch (err) {
			//alert ("Error calling PDL_GetTotalSize: " + err.description);
		}
		return "";
	}

	function WVPDLFinalize(pdlPath) {
		var aWidevinePlugin = document.getElementById('WidevinePlugin');
		try {
			return aWidevinePlugin.PDL_Finalize(pdlPath);
		}
		catch (err) {
			//alert ("Error calling PDL_Finalize: " + err.description);
		}
		return "";
	}

	function WVPDLCheckHasTrickPlay(pdlPath) {
		var aWidevinePlugin = document.getElementById('WidevinePlugin');
		try {
			return aWidevinePlugin.PDL_CheckHasTrickPlay(pdlPath);
		}
		catch (err) {
			//alert ("Error calling PDL_CheckHasTrickPlay: " + err.description);
		}
		return "";
	}

	function WVPDLGetTrackBitrate(pdlPath, trackNumber) {
		var aWidevinePlugin = document.getElementById('WidevinePlugin');
		try {
			return aWidevinePlugin.PDL_GetTrackBitrate(pdlPath, trackNumber);
		}
		catch (err) {
			//alert ("Error calling PDL_GetTrackBitrate: " + err.description);
		}
		return "";
	}

	function WVPDLGetTrackCount(pdlPath) {
		var aWidevinePlugin = document.getElementById('WidevinePlugin');
		try {
			return aWidevinePlugin.PDL_GetTrackCount(pdlPath);
		}
		catch (err) {
			//alert ("Error calling PDL_GetTrackCount: " + err.description);
		}
		return "";
	}

	function WVPDLGetDownloadMap(pdlPath) {
		var aWidevinePlugin = document.getElementById('WidevinePlugin');
		try {
			return aWidevinePlugin.PDL_GetDownloadMap(pdlPath);
		}
		catch (err) {
			//alert ("Error calling PDL_GetDownloadMap: " + err.description);
		}
		return "";
	}

	function WVGetLastError() {
		var aWidevinePlugin = document.getElementById('WidevinePlugin');
		try {
			return aWidevinePlugin.GetLastError();
		}
		catch (err) {
			//alert ("Error calling GetLastError: " + err.description);
		}
		return "";
	}

	function WVRegisterAsset(assetPath, requestLicense) {
		var aWidevinePlugin = document.getElementById('WidevinePlugin');
		try {
			return aWidevinePlugin.RegisterAsset(assetPath, requestLicense);
		}
		catch (err) {
			//alert ("Error calling RegisterAsset: " + err.description);
		}
		return "";

	}


	function WVQueryAsset(assetPath) {
		var aWidevinePlugin = document.getElementById('WidevinePlugin');
		try {
			return aWidevinePlugin.QueryAsset(assetPath);
		}
		catch (err) {
			//alert ("Error calling QueryAsset: " + err.description);
		}
		return "";

	}

	function WVQueryAllAssets() {
		var aWidevinePlugin = document.getElementById('WidevinePlugin');
		try {
			return aWidevinePlugin.QueryAllAssets();
		}
		catch (err) {
			//alert ("Error calling QueryAllAssets: " + err.description);
		}
		return "";

	}


	function WVUnregisterAsset(assetPath) {
		var aWidevinePlugin = document.getElementById('WidevinePlugin');
		try {
			return aWidevinePlugin.UnregisterAsset(assetPath);
		}
		catch (err) {
			//alert ("Error calling UnregisterAsset: " + err.description);
		}
		return "";

	}

	function WVUpdateLicense(assetPath) {
		var aWidevinePlugin = document.getElementById('WidevinePlugin');
		try {
			return aWidevinePlugin.UpdateLicense(assetPath);
		}
		catch (err) {
			//alert ("Error calling UpdateAssetLicense: " + err.description);
		}
		return "";

	}

	function WVGetQueryLicenseValue(assetPath, key) {
		var licenseInfo = eval('(' + WVQueryAsset(assetPath) + ')');
		licenseInfo = eval("licenseInfo." + key);
		return licenseInfo;
	}


	function WVCancelAllDownloads() {
		var aWidevinePlugin = document.getElementById('WidevinePlugin');
		try {
			if (aWidevinePlugin) {
				var downloading_list = eval(aWidevinePlugin.PDL_QueryDownloadNames());
				for (var i = 0; i < downloading_list.length; i++) {
					WVPDLCancel(downloading_list[i]);
				}
			}
		}
		catch (err) {
			//alert ("Error calling QueryAllAssets: " + err.description);
		}
		return "";
	}


	function WVSetJSON(value) {
		var aWidevinePlugin = document.getElementById('WidevinePlugin');
		try {
			return aWidevinePlugin.setUseJSON(value);
		}
		catch (err) {
			//alert ("Error calling setUseJSON: " + err.description);
		}
		return "";

	}

	function WVSetAudioTrack(trackid) {
		var aWidevinePlugin = document.getElementById('WidevinePlugin');
		try {
			var result = aWidevinePlugin.SetAudioTrack(parseInt(trackid));
			if (!result) {
				alert('Set Audio Track Failed');
			}
			return result;
		}
		catch (err) {
			//alert ("Error calling : SetAudioTrack" + err.description);
		}
		return "";
	}

	function WVGetAudioTracks() {
		var aWidevinePlugin = document.getElementById('WidevinePlugin');
		try {
			return aWidevinePlugin.GetAudioTracks();
		}
		catch (err) {
			//alert ("Error calling : GetAudioTracks " + err.description);
		}
		return "";
	}

	function WVGetCurrentAudioTrack() {
		var aWidevinePlugin = document.getElementById('WidevinePlugin');
		try {
			return aWidevinePlugin.GetCurrentAudioTrack();
		}
		catch (err) {
			//alert ("Error calling : GetCurrentAudioTrack " + err.description);
		}
		return "";
	}

	function WVGetSubtitles() {
		var aWidevinePlugin = document.getElementById('WidevinePlugin');
		try {
			return aWidevinePlugin.GetSubtitleTracks();
		}
		catch (err) {
			//alert ("Error calling : GetSubtitleTracks " + err.description);
		}
		return "";
	}
}