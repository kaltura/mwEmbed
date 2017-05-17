(function (mw, $) {
	"use strict";

	/*
	 Limitations:
	 - No tracking for the overlay ads
	 */
	mw.ComscoreStreamingTag = function (embedPlayer, callback) {
		this.init(embedPlayer, callback);
	};

	mw.ComscoreStreamingTag.prototype = {

        pluginVersion: "1.1.5",
		reportingPluginName: "kaltura",
		playerVersion: mw.getConfig('version'),

		bindPostfix: '.ComScoreStreamingTag',
		moduleName: 'ComScoreStreamingTag',
		unknownValue: 'unknown',

		streamSenseInstance: null, // Placeholder reference for comScore Generic plugin

		clipNumberMap: {},
		clipNumberCounter: 0,
		playerEvents: null,
		inFullScreen: false,
		currentPlayerPluginState: null, // Keep track of the comScore pluguin state
		bandwidth: 0,
		lastCuePointUpdateTime: -1,
		adCuePoints: null,
		adsPlayed: [],
		currentAd: {},
		currentBitrate: 0,
		shouldSetClip: true,
		buffering: false,
		seeking: false,
		isPlaybackIntended: false,
		hasPlaybackStarted: false,
		playing: false,
		samePositionRepeatedCount: 0,
		lastPosition: undefined,
		lastPositionDuringBuffering: undefined,
		lastPositionAfterSeeking: undefined,
		startingPosition: undefined,
		isIphone: mw.isIphone(),
		playerElement: undefined,
		// Mapping for the module settings and the StreamSense plugin
		configOptions: {
			c2: "c2",
			pageView: "pageview",
			logUrl: "logurl",
			persistentLabels: "persistentlabels",
			debug: "debug"
		},

		PlayerPluginState: function () {
			var stringMap = ["initializing", "idle", "new_clip_loaded", "playing", "paused", "ended_playing", "buffering", "seeking", "scrubbing", "ad_playing", "ad_paused", "ad_ended_playing", "destroyed"];
			return {
				INITIALIZING: 0,
				IDLE: 1,
				NEW_CLIP_LOADED: 2,
				PLAYING: 3,
				PAUSED: 4,
				ENDED_PLAYING: 5,
				BUFFERING: 6,
				SEEKING: 7,
				SCRUBBING: 8,
				AD_PLAYING: 9,
				AD_PAUSED: 10,
				AD_ENDED_PLAYING: 11,
				DESTROYED: 13,
				toString: function (eventType) {
					return stringMap[eventType];
				}
			};
		},

		init: function (embedPlayer, callback) {
			this.embedPlayer = embedPlayer;
			this.currentPlayerPluginState = this.PlayerPluginState().INITIALIZING;
			var _this = this;
			var _callback = callback;

			this.mediaElement = new mw.MediaElement(embedPlayer);

			_this.currentAd.id = "";
			_this.currentAd.type = "";
			_this.currentAd.index = 0;
			_this.currentAd.duration = 0;

			var comScoreSettings = {};
			if (_this.isSecure())
				comScoreSettings.secure = true;

			// The configuration naming used in Kaltura are different from the settings in the StreamSense plugin
			for (var key in _this.configOptions) {
				if (this.getConfig(key)) {
					comScoreSettings[_this.configOptions[key]] = this.getConfig(key)
				}
			}

			/***************************************************************************************
			 *    This is the start of the comScore Streaming Tag core API + comScore GenericPlugin. *
			 * PLEASE DO NOT CHANGE THE FOLLOWING BLOCK OF CODE.                                   *
			 ***************************************************************************************/

				// Copyright (c) 2014 comScore, Inc.
			var ns_=ns_||{};ns_.Utils=ns_.Utils||function(){return{uid:function(){var e=1;return function(){return+(new Date)+"_"+e++}}(),filter:function(e,t){var n={};for(var r in t)t.hasOwnProperty(r)&&e(t[r])&&(n[r]=t[r]);return n},extend:function(e){var t=arguments.length,n;e=e||{};for(var r=1;r<t;r++){n=arguments[r];if(!n)continue;for(var i in n)n.hasOwnProperty(i)&&(e[i]=n[i])}return e},getString:function(e,t){var n=String(e);return e==null?t||"na":n},getLong:function(e,t){var n=Number(e);return e==null||isNaN(n)?t||0:n},getInteger:function(e,t){var n=Number(e);return e==null||isNaN(n)?t||0:n},getBoolean:function(e,t){var n=String(e).toLowerCase()=="true";return e==null?t||!1:n},isNotEmpty:function(e){return typeof e!="undefined"&&e!=null&&typeof e.length!="undefined"&&e.length>0},indexOf:function(e,t){var n=-1;return this.forEach(t,function(t,i){t==e&&(n=i)}),n},forEach:function(e,t,n){try{if(typeof t=="function"){n=typeof n!="undefined"?n:null;if(typeof e["length"]!="number"||typeof e[0]=="undefined"){var r=typeof e.__proto__!="undefined";for(var i in e)e.hasOwnProperty(i)&&(!r||r&&typeof e.__proto__[i]=="undefined")&&typeof e[i]!="function"&&t.call(n,e[i],i)}else for(var s=0,o=e.length;s<o;s++)t.call(n,e[s],s)}}catch(u){}},regionMatches:function(e,t,n,r,i){if(t<0||r<0||t+i>e.length||r+i>n.length)return!1;while(--i>=0){var s=e.charAt(t++),o=n.charAt(r++);if(s!=o)return!1}return!0},size:function(e){var t=0;for(var n in e)e.hasOwnProperty(n)&&t++;return t},log:function(e,t){if(typeof t!="undefined"&&t&&typeof console!="undefined"&&console){var n=new Date,r=n.getHours()+":"+n.getMinutes()+":"+n.getSeconds();console.log(r,e)}},isTrue:function(e){return typeof e=="undefined"?!1:typeof e=="string"?(e=e.toLowerCase(),e==="true"||e==="1"||e==="on"):!!e},toString:function(e){if(typeof e=="undefined")return"undefined";if(typeof e=="string")return e;if(Object.prototype.toString.call(e)==="[object Array]")return e.join(",");if(this.size(e)>0){var t="";for(var n in e)e.hasOwnProperty(n)&&(t+=n+":"+e[n]+";");return t}return e.toString()},exists:function(e){return typeof e!="undefined"&&e!=null},firstGreaterThan0:function(){for(var e=0,t=arguments.length;e<t;e++){var n=arguments[e];if(n>0)return n}return 0},cloneObject:function(e){if(null==e||"object"!=typeof e)return e;var t=function(){function e(){}function t(t){return typeof t=="object"?(e.prototype=t,new e):t}function r(e){for(var t in e)e.hasOwnProperty(t)&&(this[t]=e[t])}function i(){this.copiedObjects=[];var e=this;this.recursiveDeepCopy=function(t){return e.deepCopy(t)},this.depth=0}function s(e,t){var n=new i;return t&&(n.maxDepth=t),n.deepCopy(e)}function o(e){return typeof window!="undefined"&&window&&window.Node?e instanceof Node:e===document?!0:typeof e.nodeType=="number"&&e.attributes&&e.childNodes&&e.cloneNode}var n=[];return r.prototype={constructor:r,canCopy:function(){return!1},create:function(e){},populate:function(e,t,n){}},i.prototype={constructor:i,maxDepth:256,cacheResult:function(e,t){this.copiedObjects.push([e,t])},getCachedResult:function(e){var t=this.copiedObjects,n=t.length;for(var r=0;r<n;r++)if(t[r][0]===e)return t[r][1];return undefined},deepCopy:function(e){if(e===null)return null;if(typeof e!="object")return e;var t=this.getCachedResult(e);if(t)return t;for(var r=0;r<n.length;r++){var i=n[r];if(i.canCopy(e))return this.applyDeepCopier(i,e)}throw new Error("Unable to clone the following object "+e)},applyDeepCopier:function(e,t){var n=e.create(t);this.cacheResult(t,n),this.depth++;if(this.depth>this.maxDepth)throw new Error("Maximum recursion depth exceeded.");return e.populate(this.recursiveDeepCopy,t,n),this.depth--,n}},s.DeepCopier=r,s.deepCopiers=n,s.register=function(e){e instanceof r||(e=new r(e)),n.unshift(e)},s.register({canCopy:function(){return!0},create:function(e){return e instanceof e.constructor?t(e.constructor.prototype):{}},populate:function(e,t,n){for(var r in t)t.hasOwnProperty(r)&&(n[r]=e(t[r]));return n}}),s.register({canCopy:function(e){return e instanceof Array},create:function(e){return new e.constructor},populate:function(e,t,n){for(var r=0;r<t.length;r++)n.push(e(t[r]));return n}}),s.register({canCopy:function(e){return e instanceof Date},create:function(e){return new Date(e)}}),s.register({canCopy:function(e){return o(e)},create:function(e){return e===document?document:e.cloneNode(!1)},populate:function(e,t,n){if(t===document)return document;if(t.childNodes&&t.childNodes.length)for(var r=0;r<t.childNodes.length;r++){var i=e(t.childNodes[r]);n.appendChild(i)}}}),{deepCopy:s}}();return t.deepCopy(e)},safeGet:function(e,t){return t=this.exists(t)?t:"",this.exists(e)?e:t},getBrowserName:function(){if(typeof navigator=="undefined"||!navigator.hasOwnProperty("userAgent")||!navigator.hasOwnProperty("appName"))return"";var e=navigator.userAgent,t=navigator.appName,n,r;return(r=e.indexOf("Opera"))!=-1||(r=e.indexOf("OPR/"))!=-1?t="Opera":(r=e.indexOf("Android"))!=-1?t="Android":(r=e.indexOf("Chrome"))!=-1?t="Chrome":(r=e.indexOf("Safari"))!=-1?t="Safari":(r=e.indexOf("Firefox"))!=-1?t="Firefox":(r=e.indexOf("IEMobile"))!=-1?t="Internet Explorer Mobile":t=="Microsoft Internet Explorer"||t=="Netscape"?t="Internet Explorer":(n=e.lastIndexOf(" ")+1)<(r=e.lastIndexOf("/"))&&(t=e.substring(n,r),t.toLowerCase()==t.toUpperCase()&&(t=navigator.appName)),t},getBrowserFullVersion:function(){if(typeof navigator=="undefined"||!navigator.hasOwnProperty("userAgent")||!navigator.hasOwnProperty("appName")||!navigator.hasOwnProperty("appVersion"))return"";var e=navigator.userAgent,t=navigator.appName,n=""+parseFloat(navigator.appVersion),r,i,s,o;return(i=e.indexOf("Opera"))!=-1?(n=e.substring(i+6),(i=e.indexOf("Version"))!=-1&&(n=e.substring(i+8))):(i=e.indexOf("OPR/"))!=-1?n=e.substring(i+4):(i=e.indexOf("Android"))!=-1?n=e.substring(i+11):(i=e.indexOf("Chrome"))!=-1?n=e.substring(i+7):(i=e.indexOf("Safari"))!=-1?(n=e.substring(i+7),(i=e.indexOf("Version"))!=-1&&(n=e.substring(i+8))):(i=e.indexOf("Firefox"))!=-1?n=e.substring(i+8):t=="Microsoft Internet Explorer"?(o=new RegExp("MSIE ([0-9]{1,}[.0-9]{0,})"),o.exec(e)!=null&&(n=parseFloat(RegExp.$1))):t=="Netscape"?(o=new RegExp("Trident/.*rv:([0-9]{1,}[.0-9]{0,})"),o.exec(e)!=null&&(n=parseFloat(RegExp.$1))):e.lastIndexOf(" ")+1<(i=e.lastIndexOf("/"))&&(n=e.substring(i+1)),n=n.toString(),(s=n.indexOf(";"))!=-1&&(n=n.substring(0,s)),(s=n.indexOf(" "))!=-1&&(n=n.substring(0,s)),(s=n.indexOf(")"))!=-1&&(n=n.substring(0,s)),r=parseInt(""+n,10),isNaN(r)&&(n=""+parseFloat(navigator.appVersion)),n},browserAcceptsLargeURLs:function(){return typeof window!="undefined"?window.ActiveXObject===null||!0:!0}}}(),ns_.StreamSense=ns_.StreamSense||function(){function l(t,n){var r=t||"",i="undefined",s=a.comScore||a.sitestat||function(t){var n="comScore=",r=f.cookie,s="",u="indexOf",l="substring",c="length",h=e.browserAcceptsLargeURLs()?v.URL_LENGTH_LIMIT:v.RESTRICTED_URL_LENGTH_LIMIT,p,d="&ns_",m="&",g,y,b,w,E=a.encodeURIComponent||escape;if(r[u](n)+1)for(b=0,y=r.split(";"),w=y[c];b<w;b++)g=y[b][u](n),g+1&&(s=m+unescape(y[b][l](g+n[c])));t+=d+"_t="+ +(new Date)+d+"c="+(f.characterSet||f.defaultCharset||"")+s,t.length>h&&t.indexOf(m)>0&&(p=t.substr(0,h-8).lastIndexOf(m),t=(t.substring(0,p)+d+"cut="+E(t.substring(p+1))).substr(0,h)),o.httpGet(t),typeof ns_p===i&&(ns_p={src:t}),ns_p.lastMeasurement=t};if(typeof n!==i){var u=[],l=a.encodeURIComponent||escape;for(var c in n)n.hasOwnProperty(c)&&u.push(l(c)+"="+l(n[c]));/[\?\&]$/.test(r)||(r+="&"),r+=u.join("&")}return s(r)}function c(t,n){var r,i=a.encodeURIComponent||escape,s=[],o=v.LABELS_ORDER,u=t.split("?"),l=u[0],c=u[1],h=c.split("&");for(var p=0,d=h.length;p<d;p++){var m=h[p].split("="),g=unescape(m[0]),y=unescape(m[1]);g&&(n[g]=y)}var b={};for(var w=0,E=o.length;w<E;w++){var S=o[w];if(n.hasOwnProperty(S)){var x=n[S];typeof x!="undefined"&&x!=null&&(b[S]=!0,s.push(i(S)+"="+i(n[S])))}}for(var T in n)if(n.hasOwnProperty(T)){if(b[T])continue;var N=n[T];typeof N!="undefined"&&N!=null&&s.push(i(T)+"="+i(n[T]))}r=l+"?"+s.join("&"),r=r+(r.indexOf("&c8=")<0?"&c8="+i(f.title):"")+(r.indexOf("&c7=")<0?"&c7="+i(f.URL):"")+(r.indexOf("&c9=")<0?"&c9="+i(f.referrer):"");var C=e.browserAcceptsLargeURLs()?v.URL_LENGTH_LIMIT:v.RESTRICTED_URL_LENGTH_LIMIT;if(r.length>C&&r.indexOf("&")>0){var k=r.substr(0,C-8).lastIndexOf("&");r=(r.substring(0,k)+"&ns_cut="+i(r.substring(k+1))).substr(0,C)}return r}var e=ns_.Utils,t=function(){var t="cs_";return function(){var n=typeof localStorage!="undefined"?localStorage:{};e.extend(this,{get:function(e){return n[t+e]},set:function(e,r){n[t+e]=r},has:function(e){return t+e in n},remove:function(e){delete n[t+e]},clear:function(){for(var e in n)n.hasOwnProperty(e)&&delete n[e]}})}}(),n=function(e,t){if(typeof Image!="undefined"){var n=new Image;n.onload=function(){t&&t(200),n=null},n.onerror=function(){t&&t(),n=null},n.src=e}},r=function(e,t){t&&typeof setTimeout!="undefined"&&setTimeout(t,0)},i=function(e,t,n){n&&typeof setTimeout!="undefined"&&setTimeout(n,0)},s=function(){return{dir:function(){return null},append:function(e,t,n){},write:function(e,t,n){},deleteFile:function(){return!1},read:function(){return null}}}(),o=function(){return{PLATFORM:"generic",httpGet:n,httpPost:i,Storage:t,IO:s,getCrossPublisherId:function(){return null},getAppName:function(){return Constants.UNKNOWN_VALUE},getAppVersion:function(){return Constants.UNKNOWN_VALUE},getVisitorId:function(){return this.getDeviceName()+ +(new Date)+~~(Math.random()*1e3)},getVisitorIdSuffix:function(){return"72"},getDeviceName:function(){return""},getPlatformVersion:function(){return""},getPlatformName:function(){return"js"},getRuntimeName:function(){return""},getRuntimeVersion:function(){return""},getResolution:function(){return""},getLanguage:function(){return""},getPackageName:function(){return""},isConnectionAvailable:function(){return!0},isCompatible:function(){return!0},autoSelect:function(){},setPlatformAPI:function(){},isCrossPublisherIdChanged:function(){return!1},setTimeout:function(e,t,n){return setTimeout(e,t,n)},clearTimeout:function(e){return clearTimeout(e)},getDeviceArchitecture:function(){return Constants.UNKNOWN_VALUE},getConnectionType:function(){return Constants.UNKNOWN_VALUE},getDeviceJailBrokenFlag:function(){return Constants.UNKNOWN_VALUE}}}(),u=typeof window!="undefined"&&typeof document!="undefined",a,f;u?(a=window,f=document):(a={},f={location:{href:""},title:"",URL:"",referrer:"",cookie:""});var e=e||{};e.filterMap=function(t,n){for(var r in t)t.hasOwnProperty(r)&&e.indexOf(r,n)==-1&&delete t[r]},e.getKeys=function(e,t){var n,r=[];for(n in e)(!t||t.test(n))&&e.hasOwnProperty(n)&&(r[r.length]=n);return r};var h=function(){var e=["play","pause","end","buffer","keep-alive","hb","custom","ad_play","ad_pause","ad_end","ad_click"];return{PLAY:0,PAUSE:1,END:2,BUFFER:3,KEEP_ALIVE:4,HEART_BEAT:5,CUSTOM:6,AD_PLAY:7,AD_PAUSE:8,AD_END:9,AD_CLICK:10,toString:function(t){return e[t]}}}(),p=function(){var e=[h.END,h.PLAY,h.PAUSE,h.BUFFER];return{IDLE:0,PLAYING:1,PAUSED:2,BUFFERING:3,toEventType:function(t){return e[t]}}}(),d={ADPLAY:h.AD_PLAY,ADPAUSE:h.AD_PAUSE,ADEND:h.AD_END,ADCLICK:h.AD_CLICK},v={STREAMSENSE_VERSION:"4.1505.18",DEFAULT_PLAYERNAME:"streamsense",DEFAULT_HEARTBEAT_INTERVAL:[{playingtime:6e4,interval:1e4},{playingtime:null,interval:6e4}],DEFAULT_KEEP_ALIVE_INTERVAL:12e5,DEFAULT_PAUSED_ON_BUFFERING_INTERVAL:500,C1_VALUE:"19",C10_VALUE:"js",NS_AP_C12M_VALUE:"1",NS_NC_VALUE:"1",PAGE_NAME_LABEL:"name",RESTRICTED_URL_LENGTH_LIMIT:2048,URL_LENGTH_LIMIT:4096,LABELS_ORDER:["c1","c2","ca2","cb2","cc2","cd2","ns_site","ca_ns_site","cb_ns_site","cc_ns_site","cd_ns_site","ns_vsite","ca_ns_vsite","cb_ns_vsite","cc_ns_vsite","cd_ns_vsite","ns_ap_an","ca_ns_ap_an","cb_ns_ap_an","cc_ns_ap_an","cd_ns_ap_an","ns_ap_pn","ns_ap_pv","c12","ca12","cb12","cc12","cd12","ns_ak","ns_ap_hw","name","ns_ap_ni","ns_ap_ec","ns_ap_ev","ns_ap_device","ns_ap_id","ns_ap_csf","ns_ap_bi","ns_ap_pfm","ns_ap_pfv","ns_ap_ver","ca_ns_ap_ver","cb_ns_ap_ver","cc_ns_ap_ver","cd_ns_ap_ver","ns_ap_sv","ns_ap_cv","ns_type","ca_ns_type","cb_ns_type","cc_ns_type","cd_ns_type","ns_radio","ns_nc","ns_ap_ui","ca_ns_ap_ui","cb_ns_ap_ui","cc_ns_ap_ui","cd_ns_ap_ui","ns_ap_gs","ns_st_sv","ns_st_pv","ns_st_it","ns_st_id","ns_st_ec","ns_st_sp","ns_st_sq","ns_st_cn","ns_st_ev","ns_st_po","ns_st_cl","ns_st_el","ns_st_pb","ns_st_hc","ns_st_mp","ca_ns_st_mp","cb_ns_st_mp","cc_ns_st_mp","cd_ns_st_mp","ns_st_mv","ca_ns_st_mv","cb_ns_st_mv","cc_ns_st_mv","cd_ns_st_mv","ns_st_pn","ns_st_tp","ns_st_pt","ns_st_pa","ns_st_ad","ns_st_li","ns_st_ci","ns_ap_jb","ns_ap_res","ns_ap_sd","ns_ap_po","ns_ap_ot","ns_ap_c12m","cs_c12u","ns_ap_install","ns_ap_updated","ns_ap_lastrun","ns_ap_cs","ns_ap_runs","ns_ap_usage","ns_ap_fg","ns_ap_ft","ns_ap_dft","ns_ap_bt","ns_ap_dbt","ns_ap_dit","ns_ap_as","ns_ap_das","ns_ap_it","ns_ap_uc","ns_ap_aus","ns_ap_daus","ns_ap_us","ns_ap_dus","ns_ap_ut","ns_ap_oc","ns_ap_uxc","ns_ap_uxs","ns_ap_lang","ns_ap_ar","ns_ap_miss","ns_ts","ns_st_ca","ns_st_cp","ns_st_er","ca_ns_st_er","cb_ns_st_er","cc_ns_st_er","cd_ns_st_er","ns_st_pe","ns_st_ui","ca_ns_st_ui","cb_ns_st_ui","cc_ns_st_ui","cd_ns_st_ui","ns_st_bc","ns_st_bt","ns_st_bp","ns_st_pc","ns_st_pp","ns_st_br","ns_st_ub","ns_st_vo","ns_st_ws","ns_st_pl","ns_st_pr","ns_st_ep","ns_st_ty","ns_st_ct","ns_st_cs","ns_st_ge","ns_st_st","ns_st_dt","ns_st_de","ns_st_pu","ns_st_cu","ns_st_fee","ns_ap_i1","ns_ap_i2","ns_ap_i3","ns_ap_i4","ns_ap_i5","ns_ap_i6","ns_ap_referrer","ns_clid","ns_campaign","ns_source","ns_mchannel","ns_linkname","ns_fee","gclid","utm_campaign","utm_source","utm_medium","utm_term","utm_content","c3","ca3","cb3","cc3","cd3","c4","ca4","cb4","cc4","cd4","c5","ca5","cb5","cc5","cd5","c6","ca6","cb6","cc6","cd6","c10","c11","c13","c14","c15","c16","c7","c8","c9","ns_ap_er"]},m=function(){return function(){function l(e,t){var n=t[e];n!=null&&(f[e]=n)}var t=this,n=0,r=0,i=0,s=0,o=0,u=0,a,f;e.extend(this,{reset:function(n){n!=null&&n.length>0?e.filterMap(f,n):f={},f.hasOwnProperty("ns_st_cl")||(f.ns_st_cl="0"),f.hasOwnProperty("ns_st_pn")||(f.ns_st_pn="1"),f.hasOwnProperty("ns_st_tp")||(f.ns_st_tp="1"),t.setPauses(0),t.setStarts(0),t.setBufferingTime(0),t.setBufferingTimestamp(-1),t.setPlaybackTime(0),t.setPlaybackTimestamp(-1)},setLabels:function(n,r){n!=null&&e.extend(f,n),t.setRegisters(f,r)},getLabels:function(){return f},setLabel:function(e,n){var r={};r[e]=n,t.setLabels(r,null)},getLabel:function(e){return f[e]},getClipId:function(){return(typeof a=="undefined"||a==null)&&t.setClipId("1"),a},setClipId:function(e){a=e},setRegisters:function(e,s){var u=e.ns_st_cn;u!=null&&(t.setClipId(u),delete e.ns_st_cn),u=e.ns_st_bt,u!=null&&(i=Number(u),delete e.ns_st_bt),l("ns_st_cl",e),l("ns_st_pn",e),l("ns_st_tp",e),l("ns_st_ub",e),l("ns_st_br",e);if(s==p.PLAYING||s==null)u=e.ns_st_sq,u!=null&&(r=Number(u),delete e.ns_st_sq);s!=p.BUFFERING&&(u=e.ns_st_pt,u!=null&&(o=Number(u),delete e.ns_st_pt));if(s==p.PAUSED||s==p.IDLE||s==null)u=e.ns_st_pc,u!=null&&(n=Number(u),delete e.ns_st_pc)},createLabels:function(i,s){var o=s||{};o.ns_st_cn=t.getClipId(),o.ns_st_bt=String(t.getBufferingTime());if(i==h.PLAY||i==null)o.ns_st_sq=String(r);if(i==h.PAUSE||i==h.END||i==h.KEEP_ALIVE||i==h.HEART_BEAT||i==null)o.ns_st_pt=String(t.getPlaybackTime()),o.ns_st_pc=String(n);return e.extend(o,t.getLabels()),o},incrementPauses:function(){n++},incrementStarts:function(){r++},getBufferingTime:function(){var e=i;return s>=0&&(e+=+(new Date)-s),e},setBufferingTime:function(e){i=e},getPlaybackTime:function(){var e=o;return u>=0&&(e+=+(new Date)-u),e},setPlaybackTime:function(e){o=e},getPlaybackTimestamp:function(){return u},setPlaybackTimestamp:function(e){u=e},getBufferingTimestamp:function(){return s},setBufferingTimestamp:function(e){s=e},getPauses:function(){return n},setPauses:function(e){n=e},getStarts:function(){return r},setStarts:function(e){r=e}}),f={},t.reset()}}(),g=function(){return function(){var t=this,n=null,r,i=0,s=0,o=0,u=0,a=0,f,l=0,c=!1;e.extend(this,{reset:function(n){n!=null&&n.length>0?e.filterMap(f,n):f={},t.setPlaylistId(+(new Date)+"_"+l),t.setBufferingTime(0),t.setPlaybackTime(0),t.setPauses(0),t.setStarts(0),t.setRebufferCount(0),c=!1},setLabels:function(n,r){n!=null&&e.extend(f,n),t.setRegisters(f,r)},getLabels:function(){return f},setLabel:function(e,n){var r={};r[e]=n,t.setLabels(r,null)},getLabel:function(e){return f[e]},getClip:function(){return n},getPlaylistId:function(){return r},setPlaylistId:function(e){r=e},setRegisters:function(e,t){var n=e.ns_st_sp;n!=null&&(i=Number(n),delete e.ns_st_sp),n=e.ns_st_bc,n!=null&&(o=Number(n),delete e.ns_st_bc),n=e.ns_st_bp,n!=null&&(u=Number(n),delete e.ns_st_bp),n=e.ns_st_id,n!=null&&(r=n,delete e.ns_st_id),t!=p.BUFFERING&&(n=e.ns_st_pa,n!=null&&(a=Number(n),delete e.ns_st_pa));if(t==p.PAUSED||t==p.IDLE||t==null)n=e.ns_st_pp,n!=null&&(s=Number(n),delete e.ns_st_pp)},createLabels:function(n,u){var a=u||{};a.ns_st_bp=String(t.getBufferingTime()),a.ns_st_sp=String(i),a.ns_st_id=String(r),o>0&&(a.ns_st_bc=String(o));if(n==h.PAUSE||n==h.END||n==h.KEEP_ALIVE||n==h.HEART_BEAT||n==null)a.ns_st_pa=String(t.getPlaybackTime()),a.ns_st_pp=String(s);if(n==h.PLAY||n==null)t.didFirstPlayOccurred()||(a.ns_st_pb="1",t.setFirstPlayOccurred(!0));return e.extend(a,t.getLabels()),a},incrementStarts:function(){i++},incrementPauses:function(){s++,n.incrementPauses()},setPlaylistCounter:function(e){l=e},incrementPlaylistCounter:function(){l++},addPlaybackTime:function(e){if(n.getPlaybackTimestamp()>=0){var r=e-n.getPlaybackTimestamp();n.setPlaybackTimestamp(-1),n.setPlaybackTime(n.getPlaybackTime()+r),t.setPlaybackTime(t.getPlaybackTime()+r)}},addBufferingTime:function(e){if(n.getBufferingTimestamp()>=0){var r=e-n.getBufferingTimestamp();n.setBufferingTimestamp(-1),n.setBufferingTime(n.getBufferingTime()+r),t.setBufferingTime(t.getBufferingTime()+r)}},getBufferingTime:function(){var e=u;return n.getBufferingTimestamp()>=0&&(e+=+(new Date)-n.getBufferingTimestamp()),e},setBufferingTime:function(e){u=e},getPlaybackTime:function(){var e=a;return n.getPlaybackTimestamp()>=0&&(e+=+(new Date)-n.getPlaybackTimestamp()),e},setPlaybackTime:function(e){a=e},getStarts:function(){return i},setStarts:function(e){i=e},getPauses:function(){return s},setPauses:function(e){s=e},getRebufferCount:function(){return o},incrementRebufferCount:function(){o++},setRebufferCount:function(e){o=e},didFirstPlayOccurred:function(){return c},setFirstPlayOccurred:function(e){c=e}}),n=new m,f={},t.reset()}}(),y=function(){var t=function(t,n,r){function q(e){var t=0;if(k!=null)for(var n=0;n<k.length;n++){var r=k[n],i=r.playingtime;if(!i||e<i){t=r.interval;break}}return t}function R(){X();var e=q(E.getClip().getPlaybackTime());if(e>0){var t=O>0?O:e;C=o.setTimeout(W,t)}O=0}function U(){X();var e=q(E.getClip().getPlaybackTime());O=e-E.getClip().getPlaybackTime()%e,C!=null&&X()}function z(){O=0,_=0,M=0}function W(){M++;var e=mt(h.HEART_BEAT,null);rt(e),O=0,R()}function X(){C!=null&&(o.clearTimeout(C),C=null)}function V(){J(),N=o.setTimeout($,L)}function $(){var e=mt(h.KEEP_ALIVE,null);rt(e),w++,V()}function J(){N!=null&&(o.clearTimeout(N),N=null)}function K(){G(),i.isPauseOnBufferingEnabled()&&at(p.PAUSED)&&(x=o.setTimeout(Q,A))}function Q(){if(P==p.PLAYING){E.incrementRebufferCount(),E.incrementPauses();var e=mt(h.PAUSE,null);rt(e),w++,P=p.PAUSED}}function G(){x!=null&&(o.clearTimeout(x),x=null)}function Y(e){return e==p.PLAYING||e==p.PAUSED}function Z(){m&&(o.clearTimeout(m),m=null)}function et(e){return e==h.PLAY?p.PLAYING:e==h.PAUSE?p.PAUSED:e==h.BUFFER?p.BUFFERING:e==h.END?p.IDLE:null}function tt(t,n,r){Z();if(r)m=o.setTimeout(function(e,t){return function(){tt(e,t)}}(t,n),r);else if(ct(t)){var i=pt(),s=f,u=lt(n),a=s>=0?u-s:0;ot(pt(),n),ut(t,n),dt(pt()),ht(t);for(var l=0,c=F.length;l<c;l++)F[l](i,t,n,a);nt(n),E.setRegisters(n,t),E.getClip().setRegisters(n,t);var h=mt(p.toEventType(t),n);e.extend(h,n),at(b)&&(rt(h),P=b,w++)}}function nt(e){var t=e.ns_st_mp;t!=null&&(H=t,delete e.ns_st_mp),t=e.ns_st_mv,t!=null&&(B=t,delete e.ns_st_mv),t=e.ns_st_ec,t!=null&&(w=Number(t),delete e.ns_st_ec)}function rt(e,t){t===undefined&&(t=!0),t&&st(e);var n=i.getPixelURL();if(S){if(!it()){var r=I.am,s=I.et,u=r.newApplicationMeasurement(S,s.HIDDEN,e,n);S.getQueue().offer(u)}}else n&&o.httpGet(c(n,e))}function it(){var e=S.getAppContext(),t=S.getSalt(),n=S.getPixelURL();return e==null||t==null||t.length==0||n==null||n.length==0}function st(t){j=mt(null),e.extend(j,t)}function ot(t,n){var r=lt(n);if(t==p.PLAYING)E.addPlaybackTime(r),U(),J();else if(t==p.BUFFERING)E.addBufferingTime(r),G();else if(t==p.IDLE){var i=e.getKeys(E.getClip().getLabels());E.getClip().reset(i)}}function ut(e,t){var n=lt(t);d=ft(t),e==p.PLAYING?(R(),V(),E.getClip().setPlaybackTimestamp(n),at(e)&&(E.getClip().incrementStarts(),E.getStarts()<1&&E.setStarts(1))):e==p.PAUSED?at(e)&&E.incrementPauses():e==p.BUFFERING?(E.getClip().setBufferingTimestamp(n),T&&K()):e==p.IDLE&&z()}function at(e){return e!=p.PAUSED&&e!=p.IDLE||P!=p.IDLE&&P!=null?e!=p.BUFFERING&&P!=e:!1}function ft(t){var n=-1;return t.hasOwnProperty("ns_st_po")&&(n=e.getInteger(t.ns_st_po)),n}function lt(e){var t=-1;return e.hasOwnProperty("ns_ts")&&(t=Number(e.ns_ts)),t}function ct(e){return e!=null&&pt()!=e}function ht(e){b=e,f=+(new Date)}function pt(){return b}function dt(e){y=e}function vt(){return y}function mt(){var t,n;arguments.length==1?(t=p.toEventType(b),n=arguments[0]):(t=arguments[0],n=arguments[1]);var r={};if(typeof document!="undefined"){var s=document;r.c7=s.URL,r.c8=s.title,r.c9=s.referrer}return n!=null&&e.extend(r,n),r.hasOwnProperty("ns_ts")||(r.ns_ts=String(+(new Date))),t!=null&&!r.hasOwnProperty("ns_st_ev")&&(r.ns_st_ev=h.toString(t)),e.extend(r,i.getLabels()),gt(t,r),E.createLabels(t,r),E.getClip().createLabels(t,r),r.hasOwnProperty("ns_st_mp")||(r.ns_st_mp=H),r.hasOwnProperty("ns_st_mv")||(r.ns_st_mv=B),r.hasOwnProperty("ns_st_ub")||(r.ns_st_ub="0"),r.hasOwnProperty("ns_st_br")||(r.ns_st_br="0"),r.hasOwnProperty("ns_st_pn")||(r.ns_st_pn="1"),r.hasOwnProperty("ns_st_tp")||(r.ns_st_tp="1"),r.hasOwnProperty("ns_st_it")||(r.ns_st_it="c"),r.ns_st_sv=v.STREAMSENSE_VERSION,r.ns_type="hidden",r}function gt(t,n){var r=n||{};r.ns_st_ec=String(w);if(!r.hasOwnProperty("ns_st_po")){var i=d,s=lt(r);if(t==h.PLAY||t==h.KEEP_ALIVE||t==h.HEART_BEAT||t==null&&b==p.PLAYING)i+=s-E.getClip().getPlaybackTimestamp();r.ns_st_po=e.getInteger(i)}return t==h.HEART_BEAT&&(r.ns_st_hc=String(M)),r}function yt(e){var t=lt(e);t<0&&(e.ns_ts=String(+(new Date)))}function bt(e,t,n){t=t||{},t.ns_st_ad=1,e>=h.AD_PLAY&&e<=h.AD_CLICK&&i.notify(e,t,n)}function wt(e,t){i.notify(h.CUSTOM,e,t)}var i=this,s=500,u,a=null,f=0,d=0,m,y,b,w=0,E=null,S,x,T=!0,N,C,k=v.DEFAULT_HEARTBEAT_INTERVAL,L=v.DEFAULT_KEEP_ALIVE_INTERVAL,A=v.DEFAULT_PAUSED_ON_BUFFERING_INTERVAL,O=0,M=0,_=0,D=!1,P,H,B,j,F,I={};r?o.setPlatformAPI(r):o.autoSelect(),e.extend(this,{reset:function(t){E.reset(t),E.setPlaylistCounter(0),E.setPlaylistId(+(new Date)+"_1"),E.getClip().reset(t),t!=null&&!t.isEmpty()?e.filterMap(u,t):u={},w=1,M=0,U(),z(),J(),G(),Z(),b=p.IDLE,y=null,f=-1,P=null,H=v.DEFAULT_PLAYERNAME,B=v.STREAMSENSE_VERSION,j=null},setPauseOnBufferingInterval:function(e){A=e},getPauseOnBufferingInterval:function(){return A},setKeepAliveInterval:function(e){L=e},getKeepAliveInterval:function(){return L},setHeartbeatIntervals:function(e){k=e},notify:function(){var t,n,r,o;n=arguments[0],arguments.length==3?(r=arguments[1],o=arguments[2]):(r={},o=arguments[1]);if(!h.toString(n))return;t=et(n);var u=e.extend({},r);yt(u),u.hasOwnProperty("ns_st_po")||(u.ns_st_po=e.getInteger(o).toString());if(n==h.PLAY||n==h.PAUSE||n==h.BUFFER||n==h.END)i.isThrottlingEnabled()&&Y(b)&&Y(t)&&(b!=p.PLAYING||t!=p.PAUSED||!!m)?tt(t,u,s):tt(t,u);else{var a=mt(n,u);e.extend(a,u),rt(a,!1),w++}},getLabels:function(){return u},getState:function(){return b},setLabels:function(e){for(var t in e)e.hasOwnProperty(t)&&i.setLabel(t,e[t])},getLabel:function(e){return u[e]},setLabel:function(e,t){t==null?delete u[e]:u[e]=t},setPixelURL:function(e){if(e==null||e.length==0)return null;var t=decodeURIComponent||unescape,n=e.indexOf("?");if(n>=0){if(n<e.length-1){var r=e.substring(n+1).split("&");for(var s=0,o=r.length;s<o;s++){var u=r[s],f=u.split("=");f.length==2?i.setLabel(f[0],t(f[1])):f.length==1&&i.setLabel(v.PAGE_NAME_LABEL,t(f[0]))}e=e.substring(0,n+1)}}else e+="?";return a=e,a},getPixelURL:function(){return a?a:typeof ns_p!="undefined"&&typeof ns_p.src=="string"?a=ns_p.src.replace(/&amp;/,"&").replace(/&ns__t=\d+/,""):typeof ns_pixelUrl=="string"?a=ns_pixelUrl.replace(/&amp;/,"&").replace(/&ns__t=\d+/,""):null},isPauseOnBufferingEnabled:function(){return T},setPauseOnBufferingEnabled:function(e){T=e},isThrottlingEnabled:function(){return D},setThrottlingEnabled:function(e){D=e},setThrottlingDelay:function(e){e&&e>0&&(s=e)},getThrottlingDelay:function(){return s},setClip:function(e,t){var n=!1;return b==p.IDLE&&(E.getClip().reset(),E.getClip().setLabels(e,null),t&&E.incrementStarts(),n=!0),n},setPlaylist:function(e){var t=!1;return b==p.IDLE&&(E.incrementPlaylistCounter(),E.reset(),E.getClip().reset(),E.setLabels(e,null),t=!0),t},importState:function(t){reset();var n=e.extend({},t);E.setRegisters(n,null),E.getClip().setRegisters(n,null),nt(n),w++},exportState:function(){return j},getVersion:function(){return v.STREAMSENSE_VERSION},addListener:function(e){F.push(e)},removeListener:function(t){F.splice(e.indexOf(t,F),1)},getClip:function(){return E.getClip()},getPlaylist:function(){return E},setHttpGet:function(e){typeof e=="function"&&(o.httpGet=e)},setHttpPost:function(e){typeof e=="function"&&(o.httpPost=e)}}),e.extend(this,{adNotify:bt,customNotify:wt,viewNotify:function(e,t){e=e||i.getPixelURL(),e&&l(e,t)}}),ns_.comScore&&(I=ns_.comScore.exports,S=I.c()),u={},w=1,b=p.IDLE,E=new g,x=null,T=!0,C=null,M=0,z(),N=null,m=null,D=!1,P=null,d=0,F=[],i.reset(),t&&i.setLabels(t),n&&i.setPixelURL(n)};return function(t){function s(e,t){return n[i]||u(e,t)}function o(){i=-1;for(var e=0;e<=r;e++)if(n.hasOwnProperty(String(e))){i=e;break}return ns_.StreamSense.activeIndex=i,i}function u(e,t){return e=e||null,t=t||null,e&&typeof e=="object"&&(t=e,e=null),n[++r]=new ns_.StreamSense(t,e),o(),n[r]}function a(){var e=!1,t=i;if(typeof arguments[0]=="number"&&isFinite(arguments[0]))t=arguments[0];else if(arguments[0]instanceof ns_.StreamSense)for(var r in n)if(n.hasOwnProperty(r)&&n[r]===arguments[0]){t=r;break}return n.hasOwnProperty(String(t))&&(e=n[t],delete n[t],e.reset(),o()),e}function f(e){return e=e||{},s().setPlaylist(e),s().getPlaylist()}function l(e,t,n){return e=e||{},typeof t=="number"&&(e.ns_st_cn=t),s().setClip(e,n),s().getClip()}function c(e,t,n){return typeof e=="undefined"?!1:(n=n||null,t=t||{},s().notify(e,t,n))}function h(e){typeof e!="undefined"&&s().setLabels(e)}function p(){return s().getLabels()}function d(e){typeof e!="undefined"&&s().getPlaylist().setLabels(e)}function v(){return s().getPlaylist().getLabels()}function m(e){typeof e!="undefined"&&s().getClip().setLabels(e)}function g(){return s().getClip().getLabels()}function y(e){return s().reset(e||{})}function b(e){return s().getPlaylist().reset(e||{})}function w(e){return s().getClip().reset(e||{})}function E(e){return e=e||{},s().viewNotify(null,e)}function S(e,t){return arguments.length>2&&(e=arguments[1],t=arguments[2]),e=e||{},typeof t=="number"&&(e.ns_st_po=t),s().customNotify(e,t)}function x(){return s().exportState()}function T(e){s().importState(e)}var n={},r=-1,i=-1;e.extend(t,{activeIndex:i,newInstance:u,"new":u,destroyInstance:a,destroy:a,newPlaylist:f,newClip:l,notify:c,setLabels:h,getLabels:p,setPlaylistLabels:d,getPlaylistLabels:v,setClipLabels:m,getClipLabels:g,resetInstance:y,resetPlaylist:b,resetClip:w,viewEvent:E,customEvent:S,exportState:x,importState:T})}(t),t}();y.AdEvents=d,y.PlayerEvents=h,y.InternalStates=p;var b=function(){var t=function(t,n,r,i,s){function z(){g=new ns_.StreamSense({ns_st_mp:n,ns_st_pv:r,ns_st_mv:i}),e.extend(o,g),e.extend(o,{notify:dt,setPlaylist:mt,setClip:vt,setLabel:gt,setLabels:yt,setClipLabel:bt,setPlaylistLabel:wt,onGetLabels:pt,labelMapping:x,release:W,log:kt,handleSettings:xt,getGenericPluginVersion:X,setBitRate:ht,setVolume:ct,setDuration:lt,setVideoSize:ft,setIsFullScreen:at,setDetectSeek:ut,setDetectPause:ot,setDetectPlay:st,setDetectEnd:it,setSmartStateDetection:rt,setPauseDetectionErrorMargin:G,setEndDetectionErrorMargin:Y,setSeekDetectionMinQuotient:Z,setPulseSamplingInterval:et,setMaximumNumberOfEntriesInHistory:tt,setMinimumNumberOfTimeUpdateEventsBeforeDetectingSeek:nt}),t&&xt(t),s.init&&s.init.call(o,null),A&&V()}function W(){s.release&&s.release.call(o),g.reset(),g=null,y=[],b=undefined,w=-1,E=a,S=-1}function X(){return u}function V(){$(),_=setInterval(J,v)}function $(){typeof _!="undefined"&&(clearInterval(_),_=undefined)}function J(){if(!A){$();return}if(B){B=!1;return}var e=s.position&&s.position.call(o,null)||0,t=g.getState(),n=!1;if(D.length===0||e!==D[D.length-1]){D[D.length]=Math.abs(e),P[P.length]=Date.now();if(D.length>1&&D[D.length-1]<D[D.length-2]){var r=D[D.length-1],i=P[P.length-1];D=[],D.length=0,P=[],P.length=0,D[0]=r,P[0]=i,N&&(n=!0)}else if(D.length<d)return;D.length>m&&(D=D.slice(1,m+1),P=P.slice(1,m+1)),N&&!n&&(n=K())}else P[P.length-1]=Date.now();switch(g.getState()){case p.BUFFERING:case p.IDLE:case p.PAUSED:if(k&&e>O&&!n&&!Q(e)){if(s.preMeasurement&&!s.preMeasurement.call(o,g.getState(),ns_.StreamSense.PlayerEvents.PLAY,M))break;M&&!H?o.notify(ns_.StreamSense.PlayerEvents.PLAY,{ns_st_ui:"seek"},e):o.notify(ns_.StreamSense.PlayerEvents.PLAY,null,D[0]),M=!1,H=!1;break}N&&n&&(M=!0);break;case p.PLAYING:if(N&&n){if(s.preMeasurement&&!s.preMeasurement.call(o,g.getState(),ns_.StreamSense.PlayerEvents.PAUSE))break;o.notify(ns_.StreamSense.PlayerEvents.PAUSE,null,O),M=!0}else if(L&&Q(e)){if(s.preMeasurement&&!s.preMeasurement.call(o,g.getState(),ns_.StreamSense.PlayerEvents.END))break;g.getClip().getLabel("ns_st_cl")&&g.getClip().getLabel("ns_st_cl")>0?o.notify(ns_.StreamSense.PlayerEvents.END,null,g.getClip().getLabel("ns_st_cl")):o.notify(ns_.StreamSense.PlayerEvents.END),M=!1}else if(C&&Math.abs(e-O)<=f){if(s.preMeasurement&&!s.preMeasurement.call(o,g.getState(),ns_.StreamSense.PlayerEvents.PAUSE))break;o.notify(ns_.StreamSense.PlayerEvents.PAUSE,null,O)}}t!==g.getState()&&(s.postMeasurement&&s.postMeasurement.call(o,g.getState()),g.getState()===p.PAUSED&&(D=[],D.length=0,P=[],P.length=0)),O=e}function K(){if(D[D.length-1]<D[D.length-2])return!0;var e=v,t=0;for(var n=0;n<D.length;n++)t=(parseFloat(t)+c[D.length-2][n]*D[n]).toFixed(5);return t=parseFloat(t),t/e>h}function Q(e){return g.getClip().getLabel("ns_st_cl")>0&&(e>g.getClip().getLabel("ns_st_cl")||Math.abs(e-g.getClip().getLabel("ns_st_cl"))<l)}function G(e){e&&(f=e)}function Y(e){e&&(l=e)}function Z(e){e&&e>1&&(h=e)}function et(e){e&&e>0&&(v=e)}function tt(e){e&&e<=13&&e>=2&&(m=e)}function nt(e){e&&e>=2&&e<=13&&(d=e)}function rt(e){A=e||!1,A?V():$()}function it(e){L=e||!1}function st(e){k=e||!1}function ot(e){C=e||!1}function ut(e){N=e||!1}function at(e){g.setLabel("ns_st_ws",e?"full":"norm")}function ft(e){g.getClip().setLabel("ns_st_cs",e?e:0)}function lt(e){g.getClip().setLabel("ns_st_cl",e&&e>=0?e:0)}function ct(e){g.setLabel("ns_st_vo",e&&e>=0&&e<=100?e:100)}function ht(e){g.setLabel("ns_st_br",e?e:0)}function pt(e){typeof e=="function"&&y.push(e)}function dt(e,t,n){if(R||U)return;t=t||{};for(var r=0,i=y.length;r<i;r++)y[r](e,t);var u=0;typeof n!="undefined"&&n!=null?u=n:u=s.position.apply(o,arguments),e===ns_.StreamSense.PlayerEvents.END&&A?(D=[],D.length=0,P=[],P.length=0,M=!1,H=!0,B=!0):e===ns_.StreamSense.PlayerEvents.PLAY&&(j=!0),g.notify(e,t,u)}function vt(t,n,r,i){j&&t&&t.ns_st_ci!==g.getClip().getLabel("ns_st_ci")&&(o.notify(ns_.StreamSense.PlayerEvents.END),j=!1);var s=r||[];Nt(e.cloneObject(s),t),Ct(e.cloneObject(s),t);var u;for(var a in t)t.hasOwnProperty(a)&&(u=a.match(/^data-(.+)/))&&(t[u[1]]=t[a],delete t[a]);return i&&i==1?e.extend(t,I):(I={},e.extend(I,t)),t&&t.hasOwnProperty("ns_st_skip")&&t.ns_st_skip?R=!0:R=!1,g.setClip(t,n)}function mt(t,n){return n&&n==1?e.extend(t,F):(F={},e.extend(F,t)),t&&t.hasOwnProperty("ns_st_skip")&&t.ns_st_skip?U=!0:U=!1,g.setPlaylist(t)}function gt(e,t,n){var r={};return r[e]=t,yt(r,n)}function yt(t,n){return n&&n==1?e.extend(t,q):e.extend(q,t),g.setLabels(t)}function bt(e,t,n){n&&n==1?!I.hasOwnProperty(e)&&!q.hasOwnProperty(e)&&o.getClip().setLabel(e,t):(I[e]=t,o.getClip().setLabel(e,t))}function wt(e,t,n){n&&n==1?!F.hasOwnProperty(e)&&!q.hasOwnProperty(e)&&o.getPlaylist().setLabel(e,t):(F[e]=t,o.getPlaylist().setLabel(e,t))}function Et(e){if(!e)return;var t=/([^=, ]+)\s*=(\s*("([^"]+?)"|[a-z0-9\._-]+)\s*\+?)+\s*/gi
				,n=e.match(t);for(var r in n)if(n.hasOwnProperty(r)){var i=n[r].split("=",2);if(i.length==2){var s=i[0].replace(/(^\s+|\s+$)/g,"");s!=""&&(x[s]=i[1])}}}function St(e){if(!e)return;var t=e.split(",");for(var n in t)if(t.hasOwnProperty(n)){var r=t[n].split("=",2);if(r.length==2){var i=r[0].replace(/(^\s+|\s+$)/g,"");i!=""&&(g.setLabel(i,r[1]),q[i]=r[1])}}}function xt(t){var n=g.getPixelURL();if(t.logurl)n=t.logurl;else if(t.c2){var r=t.secure?"https://sb":"http"+(document.location.href.charAt(4)=="s"?"s://sb":"://b");n=r+".scorecardresearch.com/p?c1=2",g.setLabel("c2",t.c2)}n&&g.setPixelURL(n);if(e.isTrue(t.pageview)){var i={};if(typeof document!="undefined"){var s=document;i.c7=s.URL,i.c8=s.title,i.c9=s.referrer}g.setLabels(i)}t.renditions,T=e.isTrue(t.debug),t.labelmapping&&Et(t.labelmapping),t.persistentlabels&&St(t.persistentlabels),t.throttling==="1"||t.throttling===!0?g.setThrottlingEnabled(!0):g.setThrottlingEnabled(!1);var o;(o=t.include)&&typeof o=="string"&&(o===a?b=a:o.length>0&&(b=o.split(","))),b!==a&&(o=t.include_prefixes)&&(o===a?b=a:(b||(b=[]),w=b.length,b.push.apply(b,o.split(","))));if(typeof b=="undefined")E=a;else{var u;(u=t.exclude)&&typeof u=="string"&&(u===a?E=a:u.length>0&&(E=u.split(","))),E!==a&&(u=t.exclude_prefixes)&&(u===a?E=a:(E||(E=[]),S=E.length,E.push.apply(E,u.split(","))))}}function Tt(e){var t={},n,r,i,s;if(E===a)return{};if(b&&b!==a){for(n=0,r=b.length;n<r;n++){var o=b[n];s=w>=0&&n>=w;for(i in e)e.hasOwnProperty(i)&&(t[i]||(t[i]=s?i.indexOf(o)===0:i==o))}for(i in t)t.hasOwnProperty(i)&&t[i]===!1&&delete e[i];t={}}if(E)for(n=0,r=E.length;n<r;n++){var u=E[n];s=S>=0&&n>=S;for(i in e)e.hasOwnProperty(i)&&(s?i.indexOf(u)===0:i==u)&&(t[i]=!0);for(i in t)t.hasOwnProperty(i)&&e.hasOwnProperty(i)&&delete e[i];t={}}return e}function Nt(t,n){var r=E===a;if(t.length>0&&t[0].map!="undefined"){var i=t[0].map;r||e.extend(n,Tt(e.cloneObject(i)));for(var s in i)if(i.hasOwnProperty(s)){var o=/^([Cc][A-Da-d]_)?ns_st_.+/,u=/^[Cc][A-Da-d]?([1-9]|1[0-9]|20)$/,f,l,c;if(f=s.match(/^data-(.+)/)){l=f[1].match(o)!=null,c=f[1].match(u)!=null;if(l||c)n[f[1]]=i[s]}else{l=s.match(o)!=null,c=s.match(u)!=null;if(l||c)n[s]=i[s]}}}}function Ct(t,n){var r=o.labelMapping;for(var i in r)if(r.hasOwnProperty(i)){var s="",u=/^"([^"]+)"$/i,a=/"([^"]+?)"|[a-z0-9\._-]+\s*/gi,f=r[i].match(a);for(var l=0;l<f.length;l++){var c=f[l].replace(/(?:^\s+|\s+$)/g,"");if(u.test(c)){var h=u.exec(c);s+=h[1]}else try{var p="",d=c.lastIndexOf(".");d>=1&&d<c.length-1&&(p=c.substring(0,d),c=c.substring(d+1,c.length));for(var v=0;v<t.length;v++){var m=t[v];if(p==m.prefix){m.map[c]&&(s+=e.toString(m.map[c]));break}}}catch(g){kt("Exception occurred while processing mapped labels")}n[i]=s}}}function kt(){if(T){var e=new Date,t=e.getDate(),n=e.getMonth()+1,r=e.getHours(),i=e.getMinutes(),s=e.getSeconds(),o=e.getFullYear()+"-"+(n<10?"0"+n:n)+"-"+(t<10?"0"+t:t)+" "+(r<10?"0"+r:r)+":"+(i<10?"0"+i:i)+":"+(s<10?"0"+s:s)+"."+e.getMilliseconds(),u=["comScore",o],a=Array.prototype.slice.call(arguments);console&&console.log(u.concat(a).toString())}}var o=this,u="2.1.5",a="_all_",f=10,l=500,c=[[-1,1],[-0.5,0,.5],[-0.3,-0.1,.1,.3],[-0.2,-0.1,0,.1,.2],[-0.14286,-0.08571,-0.02857,.02857,.08571,.14286],[-0.10714,-0.07143,-0.03571,0,.03571,.07143,.10714],[-0.08333,-0.05952,-0.03571,-0.0119,.0119,.03571,.05952,.08333],[-0.06667,-0.05,-0.03333,-0.01667,0,.01667,.03333,.05,.06667],[-0.05455,-0.04242,-0.0303,-0.01818,-0.00606,.00606,.01818,.0303,.04242,.05455],[-0.04545,-0.03636,-0.02727,-0.01818,-0.00909,0,.00909,.01818,.02727,.03636,.04545],[-0.03846,-0.03147,-0.02448,-0.01748,-0.01049,-0.0035,.0035,.01049,.01748,.02448,.03147,.03846],[-0.03297,-0.02747,-0.02198,-0.01648,-0.01099,-0.00549,0,.00549,.01099,.01648,.02198,.02747,.03297]],h=1.25,d=2,v=300,m=6,g={},y=[],b,w=-1,E,S=-1,x={},T=!1,N=!1,C=!1,k=!1,L=!1,A=!1,O=s.position&&s.position.call(o,null)||0,M=!1,_,D=[],P=[],H=!1,B=!1,j=!1,F={},I={},q={},R=!1,U=!1;z(),e.isTrue(t.pageview)&&g.viewNotify(null,g.getLabels())};return t.extractParams=function(e,t,n){var r=t.length,i,s,o={},u=e.indexOf(t),a;typeof n=="undefined"&&(n="&");if(u>=0){a=e.substr(u+r).split(n);for(i=0,s=a.length;i<s;i++){var f=a[i].split("=");f.length===2&&(o[f[0]]=decodeURIComponent(f[1]))}}return o},t}();return y.Plugin=b,y}();

			/***************************************************************************************
			 *    This is the end of the comScore Streaming Tag core API + comScore GenericPlugin.   *
			 * PLEASE DO NOT CHANGE THE PREVIOUS BLOCK OF CODE.                                    *
			 ***************************************************************************************/

			_this.streamSenseInstance = new ns_.StreamSense.Plugin(comScoreSettings, _this.reportingPluginName, _this.pluginVersion, _this.playerVersion, {
				init: function () {
					_this.playerEvents = ns_.StreamSense.PlayerEvents;
				},
				release: function () {
				},
				position: function () {
					return _this.getCurrentPosition();
				},
				preMeasurement: function () {
					return true;
				},
				postMeasurement: function () {
				}
			});
			_this.addPlayerBindings(_callback);
			// We only need to create the StreamingTag Playlist here because the player re-initialises the whole
			// plugin each time it loads a(nother) content media assets.
			_this.callStreamSensePlugin("setPlaylist", _this.getPlaylistLabels(), true);
		},

		log: function (message) {
			message += "; lp: " + this.lastPosition +
				"; sp: " + this.startingPosition +
				"; pos: " + this.embedPlayer.getPlayerElementTime() +
				"; pbi: " + (this.isPlaybackIntended ? "Y" : "N") +
				"; pbs: " + (this.hasPlaybackStarted ? "Y" : "N") +
				"; p: " + (this.playing ? "Y" : "N") +
				"; b: " + (this.buffering ? "Y" : "N") + (this.buffering ? "; lpdb: " + this.lastPositionDuringBuffering : "") +
				"; s: " + (this.seeking ? "Y" : "N") +
				"; hs: " + (this.hasSeeked ? "Y" : "N") + (this.hasSeeked ? "; lpas: " + this.lastPositionAfterSeeking : "") +
				"; iPhone: " + (this.isIphone ? "Y" : "N")
			;
			// this.streamSenseInstance.log("ComScoreStreamingTag::   " + message);
			mw.log("ComScoreStreamingTag::   " + message);
		},

		setClip: function () {
			// Clip labels only need to be set once per loaded media asset (ad or content)
			// and BEFORE the Streaming Tag is notified that the media is playing.
			if (this.shouldSetClip) {
				this.callStreamSensePlugin("setClip", this.getClipLabels(), false, [], true);
				this.shouldSetClip = false;
				this.startingPosition = undefined;
			}
		},

		onPlayheadPositionUpdate: function () {
			var position = this.embedPlayer.getPlayerElementTime();
			if (this.isPlaybackIntended) {
				if (!this.hasPlaybackStarted) {
					if (!this.seeking && typeof this.startingPosition === 'undefined') {
						this.log('Storing starting position (confirmed not seeking): ' + position);
						this.startingPosition = position;
					}
				}

				if (this.buffering) {
					if (this.playing) {
						if (typeof this.lastPositionDuringBuffering !== 'undefined' && this.lastPositionDuringBuffering === position) {
							this.samePositionRepeatedCount++;
							if (this.samePositionRepeatedCount >= 2) {
								if (this.getPlayerPluginState() != this.PlayerPluginState().BUFFERING) {
									this.log('buffering during playback @ ' + position);
								}
								this.playing = false;
								this.onBuffering();
							}
						}
					} else {
						if (this.getPlayerPluginState() != this.PlayerPluginState().BUFFERING) {
							this.log('buffering outside of playback @ ' + position);
							this.playing = false;
							this.setClip();
							this.onBuffering();
						}
					}
				} else {
					if (!(typeof this.lastPosition === 'undefined' && typeof position === 'undefined') || (typeof this.lastPosition !== 'undefined' && this.lastPosition !== position)) {
						if (this.hasSeeked) {
							if (this.lastPositionAfterSeeking !== undefined && this.lastPositionAfterSeeking != position) {
								if (!this.hasPlaybackStarted) {
									if (typeof this.startingPosition === 'undefined') {
										this.log('Storing starting position (active playback detected): ' + position);
										this.startingPosition = position;
									}
								}
								this.hasPlaybackStarted = true;
								this.log('playback active after seeking @ ' + position);
								this.playing = true;
								this.onPlaybackActive();
								this.lastPositionAfterSeeking = undefined;
							}
						} else {
							if (!this.hasPlaybackStarted) {
								if (typeof this.startingPosition === 'undefined') {
									this.log('Storing starting position (start of playback detected): ' + position);
									this.startingPosition = position;
								}
							}

							if(typeof this.lastPosition !== 'undefined' && this.lastPosition !== position) {
								this.log('Setting hasPlaybackStarted flag to true (playhead change detected: lastPosition = ' + this.lastPosition + '; position = ' + position + ')');
								this.hasPlaybackStarted = true;
							}

							if (this.hasPlaybackStarted && !this.playing) {
								this.log('playback active @ ' + position);
								this.playing = true;
								this.onPlaybackActive();
							}
						}
					} else {
						(this.getPlayerPluginState() == this.PlayerPluginState().PLAYING) && this.log('playback halted @ ' + position);
						this.playing = false;
						this.onPlaybackInactive();
					}
				}
			}
			this.lastPosition = position;
		},

		isPlaying: function () {
			return this.isPlaybackIntended
				&& this.hasPlaybackStarted
				&& this.playing
				&& !this.seeking
				&& (this.getPlayerPluginState() != this.PlayerPluginState().PLAYING)
				&& (this.getPlayerPluginState() != this.PlayerPluginState().AD_PLAYING);
		},

		onPlaybackActive: function () {
			if (this.isPlaying()) {
				this.setClip();
				var seek = this.hasSeeked;
				this.hasSeeked = false;

				if (typeof this.startingPosition === 'undefined') {
					this.callStreamSensePlugin("notify", this.playerEvents.PLAY, this.getLabels(seek), this.getCurrentPosition());
				}
				else {
					this.callStreamSensePlugin("notify", this.playerEvents.PLAY, this.getLabels(seek), this.getStartingPosition());
					this.startingPosition = undefined;
				}

				this.setPlayerPluginState(this.PlayerPluginState().PLAYING);
				this.lastPosition = this.embedPlayer.getPlayerElementTime();
			}
		},

		onPlaybackInactive: function () {
			if (this.getPlayerPluginState() == this.PlayerPluginState().PLAYING) {
				this.setPlayerPluginState(this.PlayerPluginState().PAUSED);
				this.callStreamSensePlugin("notify", this.playerEvents.PAUSE, this.getLabels(this.seeking), this.getCurrentPosition());
				this.lastPosition = this.embedPlayer.getPlayerElementTime();
			}
		},

		onBuffering: function () {
			this.callStreamSensePlugin("notify", this.playerEvents.BUFFER, {});
			this.setPlayerPluginState(this.PlayerPluginState().BUFFERING);
		},

		onSeekStart: function () {
			var currentTime = this.embedPlayer.getPlayerElementTime();
			this.log('seeking from ' + currentTime);
			this.seeking = true; // Could also use this.embedPlayer.seeking;
			this.playing = false;
			if (this.hasPlaybackStarted && this.lastPosition != currentTime) {
				this.lastPosition = currentTime;
			}
			this.lastPositionAfterSeeking = undefined;
			if (this.isPlaybackIntended && this.hasPlaybackStarted && this.getPlayerPluginState() != this.PlayerPluginState().SEEKING) {
				this.onPlaybackInactive();
				this.setPlayerPluginState(this.PlayerPluginState().SEEKING);
			}
		},

		onSeekStop: function () {
			this.lastPositionAfterSeeking = this.embedPlayer.getPlayerElementTime();
			this.log('seeking to ' + this.lastPositionAfterSeeking);
			this.seeking = false; // Could also use this.embedPlayer.seeking;
			this.hasSeeked = true;
		},

		onPlaybackEnded: function () {
			this.log('playback ended @ ' + this.embedPlayer.getPlayerElementTime());
			var seek = this.getPlayerPluginState() == this.PlayerPluginState().SEEKING;
			this.setPlayerPluginState(this.PlayerPluginState().ENDED_PLAYING);
			if (this.isPlaybackIntended) {
				this.callStreamSensePlugin("notify", this.playerEvents.END, this.getLabels(seek), this.getCurrentPosition());
			}
			this.isPlaybackIntended = false;
			this.hasPlaybackStarted = false;
			this.playing = false;
			this.startingPosition = undefined;
			this.lastPosition = undefined;
			this.lastPositionDuringBuffering = undefined;
			this.lastPositionAfterSeeking = undefined;
			this.samePositionRepeatedCount = 0;
		},

		onAdPlay: function (adId, type, index, duration) {
			if (arguments.length != 4) {
				var adMetadata = this.embedPlayer.evaluate('{sequenceProxy.activePluginMetadata}');
				if (!adMetadata) return;
				adId = adMetadata.ID;
				type = adMetadata.type.toLowerCase();
				duration = adMetadata.duration * 1000;
				index = 0; // Unknown value
			}
			if (type != 'preroll' && type != 'midroll' && type != "postroll") {
				return; // ComScore only tags prerolls, midrolls and postrolls
			}
			if (this.currentAd.id == adId) return; // If this is already in use, ignore it.

			this.currentAd.id = adId;
			this.currentAd.type = type;
			this.currentAd.index = index;
			if (this.adsPlayed.length < index + 1) {
				this.adsPlayed.push(this.currentAd);
			}
			if (this.currentAd.duration > 0) {
				this.currentAd.duration = duration;
			}
			this.setPlayerPluginState(this.PlayerPluginState().AD_PLAYING);
			this.callStreamSensePlugin("setClip", this.getClipLabels(), false, {}, true);
			this.callStreamSensePlugin("notify", this.playerEvents.PLAY, this.getLabels(), 0);
			this.shouldSetClip = true;
		},

		setPlayerPluginState: function (newState) {
			if (newState && newState !== this.currentPlayerPluginState) {
				this.log("NEW PLAYBACK STATE: " + this.PlayerPluginState().toString(newState).toUpperCase() + " @ " + this.embedPlayer.getPlayerElementTime());
				this.currentPlayerPluginState = newState;
			}
		},

		getPlayerPluginState: function () {
			return this.currentPlayerPluginState;
		},

		getConfig: function (attr) {
			return this.embedPlayer.getKalturaConfig(this.moduleName, attr);
		},

		callStreamSensePlugin: function () {
			var args = $.makeArray(arguments);
			var action = args[0];
			try {
				if (parent && parent[this.getConfig('trackEventMonitor')]) {
					var parsedArgs = args.slice();
					if (action == "notify") {
						parsedArgs[1] = ns_.StreamSense.PlayerEvents.toString(parsedArgs[1])
					}
					parent[this.getConfig('trackEventMonitor')](parsedArgs);
				}
			} catch (e) {
			}
			args.splice(0, 1);
			this.streamSenseInstance[action].apply(this, args);
		},

		addPlayerBindings: function (callback) {
			var _this = this;
			var embedPlayer = this.embedPlayer;

			// Unbind any old bindings:
			embedPlayer.unbindHelper(_this.bindPostfix);

			embedPlayer.bindHelper('SourceChange' + _this.bindPostfix, function () {
				// This entire if-statement and involved variables are a temporary fix to for seeking issues on iPhone.
				if (_this.isIphone && !_this.attachedIphoneSeekingHandlers) {
					_this.playerElement = _this.embedPlayer.getPlayerElement();
					if (typeof _this.playerElement !== "undefined") {
						_this.log("Binding to iPhone seeking events.");
						$(_this.playerElement).bind('seeking', function () {
							// report seeking
							_this.onSeekStart();
						});
						$(_this.playerElement).bind('seeked', function () {
							// report seeked
							_this.onSeekStop();
						});
						_this.attachedIphoneSeekingHandlers = true;
					}
				}
				var selectedSrc = _this.embedPlayer.mediaElement.selectedSource;
				_this.currentBitrate = selectedSrc.getBitrate() * 1024;
			});

			embedPlayer.bindHelper('bufferStartEvent' + _this.bindPostfix, function () {
                _this.log('bufferStartEvent');
				_this.buffering = true;
				_this.lastPositionDuringBuffering = embedPlayer.getPlayerElementTime();
			});

			embedPlayer.bindHelper('bufferEndEvent' + _this.bindPostfix, function () {
                _this.log('bufferEndEvent');
				_this.buffering = false;
				_this.lastPositionDuringBuffering = undefined;
				_this.samePositionRepeatedCount = 0;
			});

			embedPlayer.bindHelper('monitorEvent' + _this.bindPostfix, function () {
				_this.onPlayheadPositionUpdate();
			});

			embedPlayer.bindHelper('onChangeMedia' + _this.bindPostfix, function () {
				_this.destroy();
			});

			embedPlayer.bindHelper('onplay' + _this.bindPostfix, function () {
				_this.log('playback is intended (onplay) @ ' + embedPlayer.getPlayerElementTime());
				_this.isPlaybackIntended = true;
			});

			embedPlayer.bindHelper('onpause' + _this.bindPostfix, function (event) {
				_this.log('playback halted (onpause) @ ' + embedPlayer.getPlayerElementTime());
				// _this.isPlaybackIntended = false; // No longer needed.
				_this.playing = false;

				if ((_this.getCurrentPosition() + 500) >= _this.getDuration() && !_this.isLiveStream() && _this.getDuration() != 0)
					_this.onPlaybackEnded();
				else
					_this.onPlaybackInactive();
			});

			embedPlayer.bindHelper('doStop' + _this.bindPostfix, function (event) {
                _this.log('doStop');
				_this.onPlaybackEnded();
			});

			// embedPlayer.bindHelper( 'preSeek' + _this.bindPostfix, function(){
			// 	_this.log('preSeek @ ' + embedPlayer.getPlayerElementTime());
			// });

			embedPlayer.bindHelper('seeking' + _this.bindPostfix, function (event) {
                _this.log('seeking');
				// Using 'seeking' instead of 'seeked.started'
				_this.onSeekStart();
			});

			embedPlayer.bindHelper('seeked' + _this.bindPostfix, function (event) {
                _this.log('seeked');
				// Using 'seeking' instead of 'seeked.stopped'
				_this.onSeekStop();

                if(_this.buffering) {
                    _this.buffering = false;
                    _this.lastPositionDuringBuffering = undefined;
                    _this.samePositionRepeatedCount = 0;
                }
			});

			embedPlayer.bindHelper('onOpenFullScreen' + _this.bindPostfix, function () {
				_this.inFullScreen = true;
				_this.streamSenseInstance.setLabel("ns_st_ws", _this.isFullScreen() ? "full" : "norm", true);
			});

			embedPlayer.bindHelper('onCloseFullScreen' + _this.bindPostfix, function () {
				_this.inFullScreen = false;
				_this.streamSenseInstance.setLabel("ns_st_ws", _this.isFullScreen() ? "full" : "norm", true);
			});

			embedPlayer.bindHelper('onChangeMedia' + _this.bindPostFix, function () {
				_this.log("onChangeMedia ");
			});

			embedPlayer.bindHelper('onPlayerStateChange' + _this.bindPostFix, function (event) {
				// This code appears to never be called?
				_this.log("onPlayerStateChange " + event);
			});

			embedPlayer.bindHelper('onAdOpen' + _this.bindPostfix, function (event, adId, networkName, type, index) {
				_this.onAdPlay(adId, type, index, 0);
			});

			embedPlayer.bindHelper('AdSupport_StartAdPlayback' + _this.bindPostfix, function () {
				_this.onAdPlay();
			});

			embedPlayer.bindHelper('AdSupport_AdUpdateDuration' + _this.bindPostfix, function (event, duration) {
				_this.onAdPlay();
				_this.currentAd.duration = duration * 1000;
			});

			embedPlayer.bindHelper('AdSupport_EndAdPlayback' + _this.bindPostfix, function () {
				_this.setPlayerPluginState(_this.PlayerPluginState().AD_ENDED_PLAYING);
				_this.callStreamSensePlugin("notify", _this.playerEvents.END, _this.getLabels());
				_this.currentAd.id = "";
				_this.currentAd.type = "";
				_this.currentAd.index = 0;
				_this.currentAd.duration = 0;
			});

			embedPlayer.bindHelper('AdSupport_AdUpdateDuration' + _this.bindPostfix, function (event, duration) {
				_this.currentAd.duration = duration * 1000;
			});

			embedPlayer.bindHelper('adClick' + _this.bindPostfix, function (url) {
				// When the ad is clicked its also paused
				_this.callStreamSensePlugin("notify", _this.playerEvents.PAUSE, _this.getLabels());
				_this.callStreamSensePlugin("notify", _this.playerEvents.AD_CLICK, _this.getLabels());
			});

			// release the player
			callback();
		},

		destroy: function () {
			this.onPlaybackEnded();

			$(this.embedPlayer).unbind(this.bindPostfix);
			// This entire if-statement and involved variables are a temporary fix to for seeking issues on iPhone.
			if (this.isIphone && this.attachedIphoneSeekingHandlers) {
				$(this.playerElement).unbind('seeking');
				$(this.playerElement).unbind('seeked');
				this.attachedIphoneSeekingHandlers = false;
				this.playerElement = undefined;
			}
		},

		getLabels: function (seek) {
			//get common labels values
			this.streamSenseInstance.setLabel("ns_st_br", this.currentBitrate, true);
			this.streamSenseInstance.setLabel("ns_st_ws", this.isFullScreen() ? "full" : "norm", true);
			this.streamSenseInstance.setLabel("ns_st_vo", this.getVolume(), true);

			return seek ? {ns_st_ui: "seek"} : {};
		},

		getPlaylistLabels: function () {
			var labels = {};

			var playlist = this.getPlayList();
			if (playlist) {
				labels.ns_st_pl = playlist.name; // Playlist title set to player playlist's name.
				/*
				 // We cannot include playlist length - in number of items as well as an amount of time - because the
				 // player does not have any info about the number of ads and their length.

				 labels.ns_st_cp = playlist.length;

				 var totVidLength = 0;
				 for (var i = 0; i < playlist.items.length; i++) {
				 totVidLength += playlist.items[i].duration * 1000;
				 }
				 labels.ns_st_ca = totVidLength; // total playlist length
				 */
			} else {
				/*
				 // We cannot include playlist length as amount of time because the player does not have any info about
				 // the number of ads and their length.

				 labels.ns_st_ca = this.getDuration();
				 */
				labels.ns_st_pl = this.getMediaName(); // Playlist title set to content media title.
			}
			return labels;
		},

		getClipLabels: function () {
			var labels = {};

			if (this.getPlayerPluginState() == this.PlayerPluginState().AD_PLAYING) {
				// Currently playing advertisement media - set the clip labels accordingly.

				// Assign key clip labels.
				labels.ns_st_ci = this.currentAd.id || this.unknownValue; // Unique Media Asset ID
				labels.ns_st_cn = this.getClipNumber(labels.ns_st_ci); // Clip number in the Streaming Tag playlist.
				labels.ns_st_pn = "1"; // Current part number of the ad. Always assume part 1.
				labels.ns_st_tp = "1"; // Always assume ads have a total // Playlist title. of 1 parts.
				labels.ns_st_cl = this.currentAd.duration; // Length of the ad in milliseconds.
				labels.ns_st_cs = this.getPlayerSize(); // Content dimensions (uses player dimensions).
				labels.ns_st_ad = "1"; // Advertisement flag

				// Assign classification type labels.
				labels.ns_st_ty = this.isVideoContent() ? "video" : "audio";
				if (this.isLiveStream()) {
					labels.ns_st_li = "1";
				}
				labels.ns_st_ct = this.getMediaType(false, this.isVideoContent(), this.isLiveStream());

				// TODO: The following code will be commented out until a more suitable solution for determining ad
				// types is found or until Kaltura normalizes the behaviour of the related API accross different
				// player environment (e.g. ad types are not correctly collected in live stream environments).
				//// Update the Advertisement flag to reflect pre-roll, mid-roll, post-roll, where possible.
				//if (this.currentAd.type) { //this is a pre-roll add
				//    switch (this.currentAd.type) {
				//        case 'preroll':
				//            labels.ns_st_ad = "pre-roll";
				//            break;
				//        case 'midroll':
				//            labels.ns_st_ad = "mid-roll";
				//            break;
				//        case 'postroll':
				//            labels.ns_st_ad = "post-roll";
				//            break;
				//    }
				//}
			} else {
				// Currently playing content media - set the clip labels accordingly.

				// Assign key clip labels.
				labels.ns_st_ci = this.getEntryId(); // Unique Media Asset ID
				labels.ns_st_cn = this.getClipNumber(labels.ns_st_ci); // Clip number in the Streaming Tag playlist.
				labels.ns_st_pn = this.getPartNumber(); // Current part number of the content asset.
				labels.ns_st_tp = this.getTotalNumberOfContentParts(); // Total number of content asset parts.
				labels.ns_st_pr = this.getMediaName(); // Media title from CMS.
				labels.ns_st_ep = this.getMediaName(); // Media title from CMS.
				labels.ns_st_cu = this.getClipURL() || this.unknownValue; // Media streaming URL.
				labels.ns_st_cl = this.getDuration(); // Length of the content asset in milliseconds.
				labels.ns_st_cs = this.getPlayerSize(); // Content dimensions (uses player dimensions).

				// Assign classification type labels.
				labels.ns_st_ty = this.isVideoContent() ? "video" : "audio";
				if (this.isLiveStream()) {
					labels.ns_st_li = "1";
					labels.ns_st_cl = "0";
				}
				labels.ns_st_ct = this.getMediaType(true, this.isVideoContent(), this.isLiveStream());
			}
			var labelMapping = this.parserRawConfig('labelMapping');
			for (var attrname in labelMapping) {
				labels[attrname] = labelMapping[attrname];
			}
			return labels;
		},

		parserRawConfig: function (configName) {
			var _this = this;
			var rawConfig = this.embedPlayer.getRawKalturaConfig(this.moduleName, configName);
			if (!rawConfig) return [];
			var result = {};
			// Split and trim the spaces
			rawConfig.split(/ *, */g).forEach(function (x) {
				try {
					x = decodeURIComponent(x);
				} catch (e) {
				}
				// Create two groups, one for the label name and the second one for the label value without any "
				var re = /([^=]+)="?([^"]*)"?/g;
				var arr = re.exec(x);
				(arr.length == 3) && (result[arr[1]] = _this.evaluateString(arr[2]));
			});
			return result;
		},

		evaluateString: function (str) {
			var _this = this;
			// Match all the elements inside {}
			var re = /{[^}]+}/g;
			var result = str.replace(re, function (match, p1, p2) {
				return _this.embedPlayer.evaluate(match)
			});
			return result;
		},

		getMediaType: function (isContent, isVideo, isLive) {
			// There currently is no way to determine the number of content parts from the player API.
			// Because of that some part of this logic will not be executed.
			// We keep the logic in place in case this improves at some point.
			if (isContent) {
				if (isVideo) {
					// Media is video+audio or video-only (image-only).
					if (isLive) {
						return "vc23"; // Live means unicast/simulcast/multicast streaming.
					}
					else {
						var numberOfContentParts = this.getTotalNumberOfContentParts();
						if (numberOfContentParts == 1)
							return "vc11"; // Assuming short form if there is only 1 part.
						else if (numberOfContentParts > 1)
							return "vc12"; // Assuming long form is there is more than 1 part.
						else {
							// This can only happen when numberOfContentParts == 0, which means we don't know the number.
							return "vc00"; // Default fallback value.
						}
					}
				}
				else {
					// Media is audio-only.
					if (isLive) {
						return "ac23";
					}
					else {
						var numberOfContentParts = this.getTotalNumberOfContentParts();
						if (numberOfContentParts == 1)
							return "ac11"; // Assuming short form if there is only 1 part.
						else if (numberOfContentParts > 1)
							return "ac12"; // Assuming long form is there is more than 1 part.
						else {
							// This can only happen when numberOfContentParts == 0, which means we don't know the number.
							return "ac00"; // Default fallback value.
						}
					}
				}
			}
			else {
				// Media is ad.
				if (this.currentAd.type) {
					// There is no sub-classifaction for live streams.
					if (isLive) return "va21";

					// TODO: The following code will be commented out until a more suitable solution for determining ad
					// types is found or until Kaltura normalizes the behaviour of the related API accross different
					// player environment (e.g. ad types are not correctly collected in live stream environments).
					//// Sub classification for non-live streams.
					//switch (this.currentAd.type) {
					//    case 'preroll':
					//        return isVideo ? "va11" : "aa11";
					//        break;
					//    case 'midroll':
					//        return isVideo ? "va12" : "aa12";
					//        break;
					//    case 'postroll':
					//        return isVideo ? "va13" : "aa13";
					//        break;
					//}
					return isVideo ? "va00" : "aa00";
				}
			}
			return "vc00"; // This won't ever be reached, but this would be the default fallback value.
		},

		getPlayList: function () {
			var playlist = this.embedPlayer.evaluate("{playlistAPI.dataProvider}");
			if (playlist)
				return playlist.content[0];
			return null;
		},

		getDuration: function () {
			var duration = this.embedPlayer.evaluate("{mediaProxy.entry.duration}");
			return isNaN(duration) ? 0 : Math.max(Math.floor(duration * 1000), 0);
		},

		getVolume: function () {
			var volume = this.embedPlayer.evaluate('{video.volume}');
			return (typeof volume == "number") ? volume * 100 : 100;
		},

		getStartingPosition: function () {
			if (typeof this.startingPosition === 'undefined')
				return this.getCurrentPosition(); // Fall back to the current position.
			var startTime = this.startingPosition * 1000;
			return isNaN(startTime) ? 0 : Math.max(Math.floor(startTime), 0);
		},

		getCurrentPosition: function () {
			if (!this.embedPlayer || !this.embedPlayer.evaluate('{video.player.currentTime}') || this.isLiveStream())
				return 0;
			var currentTime = this.embedPlayer.evaluate('{video.player.currentTime}') * 1000;
			return isNaN(currentTime) ? 0 : Math.max(Math.floor(currentTime), 0);
		},

		isFullScreen: function () {
			return this.inFullScreen;
		},

		getMediaName: function () {
			return this.embedPlayer.evaluate("{mediaProxy.entry.name}") || this.unknownValue;
		},

		getClipURL: function () {
			return this.embedPlayer.evaluate("{mediaProxy.entry.downloadUrl}") || this.unknownValue;
		},

		isVideoContent: function () {
			// This function should return true if the media asset has a visual component, i.e., if it's video or image.
			// We're not using embedPlayer.isImageSource(), but rather just check if the media asset is audio or not.
			return !(this.embedPlayer.isAudio());
		},

		getPlayerSize: function () {
			return this.embedPlayer.getVideoHolder().width() + 'x' + this.embedPlayer.getVideoHolder().height();
		},

		getEntryId: function () {
			return this.embedPlayer.evaluate("{mediaProxy.entry.id}");
		},

		isLiveStream: function () {
			var streamerType = this.embedPlayer.evaluate("{mediaProxy.isLive}");
			return streamerType || false;
		},

		getPartNumber: function () {
			var currentTime = this.getCurrentPosition();
			var partNumber = 1;
			var lastStartAd = -1;
			for (var i = 0; i < this.adsPlayed.length; i++) {
				if (currentTime != 0
					&& this.adsPlayed[i].playedAt >= currentTime
					&& this.adsPlayed[i].playedAt != lastStartAd) { // If there are 2 ads together we only count one part
					partNumber++;
				}
				lastStartAd = this.adsPlayed[i].playedAt;
			}
			return partNumber;
		},

		getTotalNumberOfContentParts: function () {
			// It is not possible to retrieve all the number of ad breaks (and their cue points).
			// This means the total number of content parts is unknown, which is indicated by value 0.
			return 0;
		},

		getClipNumber: function (mediaId) {
			var cn = this.clipNumberMap[mediaId];
			if (cn) {
				return cn;
			}
			this.clipNumberCounter++;
			this.clipNumberMap[mediaId] = this.clipNumberCounter;

			mw.setConfig(this.clipNumberMapConfigKey, this.clipNumberMap);
			mw.setConfig(this.clipNumberCounterConfigKey, this.clipNumberCounter);

			return this.clipNumberCounter;
		},

		isSecure: function () {
			return mw.getConfig('Kaltura.Protocol') == 'https';
		}
	};

})(window.mw, jQuery);