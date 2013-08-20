( function( mw, $ ) {"use strict";

	mw.PluginManager.add( 'widevine', mw.KBasePlugin.extend({
		defaultConfig: {
			'useSupportedDeviceMsg': 'This video requires Adobe Flash Player, which is not supported by your device. You can watch it on devices that support Flash.',
			'useSupportedDeviceTitle': 'Notification',
			'intallFlashMsg': "This video requires Adobe Flash Player, which is currently not available on your browser. Please <a href='http://www.adobe.com/support/flashplayer/downloads.html' target='_blank'> install Adobe Flash Player </a> to view this video.",
			'installFlashTitle': 'Notification',
			'useKdpMsg': 'This video requires Adobe Flash enabled player.',
			'useKdpTitle': 'Notification',
			'promptStyle': 'border:solid 1px #eeeeee; position:fixed; z-index:" + zIndex + "; width:100%; height:40px; color:#505050; background-color:#FDFFDB; top:0px; right:0px; left:0px; font-family:arial; font-size:12px;',
			'promptText': 'Widevine Video Optimizer plugin is needed for enabling video playback in this page. ',
			'promptLinkText': 'Get Video Optimizer',
			'PromptRestartChromeAfterInstall' : 'Download of the plugin installer will start immediately. Note that you must restart your Chrome browser after running the installer'
		},
		setup: function(){
			mw.setConfig( 'EmbedPlayer.ForceKPlayer' , true );
			var _this = this;
			//add vars to load widevine KDP plugin
			if ( kWidget.supportsFlash() ) {
				this.getPlayer().setKalturaConfig('kdpVars', 'widevine', { plugin: 'true', loadingPolicy: 'preInitialize', asyncInit: 'true'});
				this.bind( 'KalturaSupport_EntryDataReady', function() {
					var isWvEntry = false;
					if ( _this.widevineObj().isWvFlavors() ) {
						isWvEntry = true;
						var flavors = _this.getPlayer().mediaElement.getPlayableSources();
						if (flavors && flavors.length && flavors[0].getTags().indexOf('widevine_mbr') != -1 ) {
							_this.getPlayer().setFlashvars( 'forceDynamicStream', 'true' );
							//hide the source selector until we receive the embedded flavors from the wvm package
							_this.getPlayer().setKDPAttribute( 'sourceSelector' , 'visible', false);
						}
					} 
					_this.getPlayer().setKalturaConfig('kdpVars', 'widevine', {isWv: isWvEntry});
				    _this.widevineObj().init();
				});
			} else {
				//hide default "no source found" alert
			     _this.getPlayer().setKalturaConfig(null, 'disableAlerts', true);
			     
			     _this.getPlayer().bind( 'playerReady', function () {
				    var flavors =  _this.getPlayer().mediaElement.getPlayableSources();
				    //if we received flavors we can play them. continue.
				    if (flavors && flavors.length)
					    return;

				    //if mobile device
				    var msg = null;
				    var title = null;
				    if ( kWidget.isMobileDevice() ) {
						 msg = _this.getConfig( 'useSupportedDeviceMsg' );
						 title = _this.getConfig( 'useSupportedDeviceTitle' );
				    } else {
					 	//flash is not installed - prompt to install flash
						if ( navigator.mimeTypes [ 'application/x-shockwave-flash' ] == undefined ) {
						     msg = _this.getConfig( 'intallFlashMsg' );
						     title = _this.getConfig( 'installFlashTitle' );
						} else { //else prompt to use kdp
						     msg = _this.getConfig( 'useKdpMsg' );
						     title = _this.getConfig( 'useKdpTitle' );
						}
				    }
				    if ( msg && title ) {
				    	_this.getPlayer().layoutBuilder.displayAlert( { keepOverlay:true, message: msg , title: title });
				    	//widevineKdp.sendNotification("enableGui", {guiEnabled: false});
				    }
			    });  
			}
		},
		widevineObj: function(){
			var _this = this;
			var debug = false;
			var debug_flags = "";
		   
			// Version of plugin pointed by the installer

			var version ="5.0.0.000";
			var ie_version ="5,0,0,000";

			// Set the head end server 

			var signon_url = "https://staging.shibboleth.tv/widevine/cypherpc/cgi-bin/SignOn.cgi";
			var log_url = "https://staging.shibboleth.tv/widevine/cypherpc/cgi-bin/LogEncEvent.cgi";
			var emm_url="http://www.kaltura.com/api_v3/index.php?service=widevine_widevinedrm&action=getLicense";
			var widevineSrcPath = {
			    mac:'WidevineMediaOptimizer.dmg',
			    ie:'WidevineMediaOptimizerIE.exe',
			    firefox:'WidevineMediaOptimizer_win.xpi',
			    chrome:'WidevineMediaOptimizerChrome.exe'
			};
			// Set the portal

			var portal = "kaltura";

			function doDetect( type, value  ) {
				return eval( 'navigator.' + type + '.toLowerCase().indexOf("' + value + '") != -1' );
			}


			function detectMac()	 { return doDetect( "platform", "mac" );}
			function detectWin32()   { return doDetect( "platform", "win32" );}
			function detectIE()	  { return doDetect( "userAgent", "msie" ); }
			function detectFirefox() { return doDetect( "userAgent", "firefox" ); }
			function detectSafari()  { return doDetect( "userAgent", "safari" ); }
			function detectChrome()  { return doDetect( "userAgent", "chrome" ); }

			function detectVistaOrWindows7()   { return doDetect( "userAgent", "windows nt 6" ); }

			function getCookie(c_name)
			{
				if (document.cookie.length>0)
					{
						var c_start=document.cookie.indexOf(c_name + "=")
							if (c_start!=-1)
								{
									c_start=c_start + c_name.length+1;
									c_end=document.cookie.indexOf(";",c_start);
									if (c_end==-1) c_end=document.cookie.length;
									return unescape(document.cookie.substring(c_start,c_end))
								}
					}
				return ""
			}

			function setCookie(c_name,value,expireseconds)
			{
				var exdate=new Date();
				exdate.setSeconds(exdate.getSeconds()+expireseconds);
				document.cookie=c_name+ "=" +escape(value)+
					((expireseconds==null) ? "" : ";expires="+exdate.toGMTString())
			}


			/////////////////////////////////////////////////////////////////////////////////
			// Start debug output section
			// Used to write debug information to the screen if debug variable is set to true.
			// Only used by test page
			/////////////////////////////////////////////////////////////////////////////////

			function writeDebugCell( name, bold ) {
				if ( bold ) {
					return "<td><b>" + name + "</b></td>";
				} else {
					return "<td><s>" + name + "</s></td>";
				}
			}
			
			function writeDebugMimeArray( values ){
				var result = "";
				for ( value in values ) {
					if ( values[value] ) {
						result += "<td><table><tr><td>" + values[value].description + "</td></tr><tr><td>"+values[value].type+"</td></tr><tr><td>"+values[value].enabledPlugin+"</td></tr></table></td>";
					}
				}
				return result;
			}
			
			function DebugInfo() {
				var result = "";
				result += "<table border=1>";
					
				result += "<tr><td>Platform</td>";
				result += writeDebugCell( "Macintosh", detectMac() );
				result += writeDebugCell( "Windows", detectWin32() );
				if ( detectWin32() ) {
					result += writeDebugCell( "Vista/Windows7", detectVistaOrWindows7() );
				}
				result += "</tr>";
					
				result += "<tr><td>Browser</td>";
				result += writeDebugCell( "IE", detectIE() );
				result += writeDebugCell( "Firefox", detectFirefox() );
				result += writeDebugCell( "Safari", detectSafari() );
				result += writeDebugCell( "Chrome", detectChrome() );
				result += "</tr>";
					
				if ( !detectIE() ) {
					result += "<tr><td>MIME types</td>";
					result += writeDebugMimeArray( navigator.mimeTypes );
					result += "</tr>";
				}

				result += "<tr><td>Installed</td><td>";
				if ( navigator.mimeTypes['application/x-widevinemediaoptimizer'] ) {
					var aWidevinePlugin = document.getElementById('WidevinePlugin');
					if ( aWidevinePlugin ) {
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
			function AddDiv( html ) {
				//wv onpage plugin has already added relevant elements. no need to add again
			    if (document.getElementById("wvPrompt") || document.getElementById("WidevinePlugin"))
				   return;
			   
				var div = document.createElement( "div" );   
				div.innerHTML = html;
				
				var firstChild = document.body.firstChild;
				if (firstChild) {
				document.body.insertBefore(div, firstChild);
				var prompt =  document.getElementById("wvPrompt");
				//if we need to show the banner - add iFrame behind it
				if (prompt) {
					//without iFrame the div is displayed behind Flash in IE & Chrome
					var iframe = document.createElement("iframe");
					iframe.id = "wvIframe";
					iframe.frameBorder = 0;
					document.body.insertBefore(iframe, div);
					
					var props = ['top', 'left', 'bottom', 'right', 'position'];
					for (var i in props)
					{
					    iframe.style[props[i]] =prompt.style[props[i]];
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
			    if ( detectIE() ) {
				    if (pluginInstalledIE()){	 
				    return '<object id="WidevinePlugin" classid=CLSID:defa762b-ebc6-4ce2-a48c-32b232aac64d ' +
									    'hidden=true style="display:none" height="0" width="0">' +
									    '<param name="default_url" value="' + signon_url + '">' +
									    '<param name="emm_url" value="' + emm_url + '">' +
									    '<param name="log_url" value="' + log_url + '">' +
									    '<param name="portal" value="' + portal + '">' +
												    '<param name="user_agent" value="' + navigator.userAgent + '">' +
									    '</object>' ;
						    }
			    } else {
					    if ( navigator.mimeTypes['application/x-widevinemediaoptimizer'] ) {
				    setCookie("FirefoxDisabledCheck", "");
						    return '<embed id="WidevinePlugin" type="application/x-widevinemediaoptimizer" default_url="' + signon_url +
								    '" emm_url="' + emm_url +
								    '" log_url="' + log_url +
								    '" portal="' + portal +
								    '" height="0" width="0' +
										    '" user_agent="' + navigator.userAgent +
								    '">' ;
					    }
			    }
			    return showDownloadPageText();
			}

		    ////////////////////////////////////////////
		    // getWidevineSrc
		    //
		    // Return the correct file we need to download
		    ////////////////////////////////////////////
		    function getWidevineSrc()
		    {
		         var platform = null;
		        if ( detectMac() ) {
		            platform = 'mac';
		        }
		        else if ( detectIE() ) {
		            platform = 'ie';
		        }
		        else if ( detectFirefox() ) {
		            platform = "firefox";
		        }
		        else if ( detectChrome() ) {
		            platform = "chrome";
		        }
		        if (platform)
		        {
		             return kWidget.getPath() + 'kWidget/onPagePlugins/widevineMediaOptimizer/resources/' + widevineSrcPath[platform];
		        }
		        return null;
		    }
		   	////////////////////////////////////////////
		    // showDownloadPageText
		    //
		    // Returns button to download page
		    ////////////////////////////////////////////
			function showDownloadPageText(){
				if ( ! isWvFlavors() )
					return;

				if (window.wvPromptDiv)
					return window.wvPromptDiv;
					
				//get texts and style from the player, if they were set
				var wvPromptStyle = _this.getConfig( 'promptStyle') ;
				var wvPromptText = _this.getConfig( 'promptText');
				var wvPromptLinkText = _this.getConfig( 'promptLinkText');
		        var wvPromptInfoText = _this.getConfig( 'promptInfoText');
		        var wvPromptInfoLink = _this.getConfig( 'promptInfoLink');
		        var wvPromptRestartChromeAfterInstall = _this.getConfig( 'Widevine.PromptRestartChromeAfterInstall'); 
		    
				//workaround to overlap chrome's onpage plugins
				var zIndex = detectChrome()? "99999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999"
				: "2147483638";
				
		        if (wvPromptInfoText && wvPromptInfoLink)
		        {
		            promptText += " " + "<a href=" + wvPromptInfoLink + " target='_blank' style='color: #009ACC;'>" + wvPromptInfoText + "</a>" +" ";
		        }
				var widevineSrc = getWidevineSrc() || 'http://tools.google.com/dlpage/widevine';
		        var onclickString = "";
				if (detectChrome() && !detectMac())
		        {
		             onclickString = "if (confirm('" + wvPromptRestartChromeAfterInstall+ "')){document.location.href = '" + widevineSrc + "'}return false;";
		        }
				return 	"<div id='wvPrompt' style='" + wvPromptStyle + "'>" +
					"<div style='margin-left: 10px; margin-top: 10px; width: 100%'>" + wvPromptText + " <a onclick=\"" + onclickString + "\" href=" + widevineSrc + " target='_self' style='color: #009ACC;'>" + wvPromptLinkText + "</a> "+
					" <a onclick='document.getElementById(\"wvPrompt\").style.display=\"none\";document.getElementById(\"wvIframe\").style.display=\"none\";' style='position: absolute; right: 10px; cursor: pointer'>&#10006;</a></div>" +
					"</div>"
			}

			////////////////////////////////////////////
			// pluginInstalledIE
			//
			// Returns true is the plugin is installed
			////////////////////////////////////////////
			function pluginInstalledIE(){
					try{
							var o = new ActiveXObject("npwidevinemediaoptimizer.WidevineMediaTransformerPlugin");
				o = null;
						   	return true;

					}catch(e){
							return false;
					}
			}

			function isWvFlavors() {
				var entryFlavors = _this.getPlayer().mediaElement.getPlayableSources();
				//either all flavors are encrypted or all are not. If the flavor is not widevine don't show wv prompt.
				if (entryFlavors && entryFlavors.length){
					if (entryFlavors[0].objectType == "KalturaWidevineFlavorAsset" || entryFlavors[0].getFlavorId() == "wvm" )
					return true;
				}
				return false;
			}


			return {
			   	pluginInstalledIE: function(){
					return pluginInstalledIE();
				}
				, 
				flashVersion:function(){
					return current_ver;
				}
				,
				init:function() {
					try {
					var banner = EmbedText();
					if (banner)
					   AddDiv( banner );

					if ( debug ) {
							AddDiv( DebugInfo() );
					}

					}
					catch(e) {
					alert("widevine.init exception: " + e.message);
					}
				},
				isWvFlavors: function() {
					return isWvFlavors();
				}
			};
		}

	}));

} )( window.mw, window.jQuery );
