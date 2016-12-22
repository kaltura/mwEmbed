/*
 * The "kaltura player" embedPlayer interface for fallback h.264 and flv video format support
 */
( function( mw, $ ) { "use strict";

	mw.EmbedPlayerFlashHLS = {
		// Instance name:
		instanceOf : 'FlashHLS',
		bindPostfix: '.ccPlayer',
		flashhlsContainerId:null,
		// List of supported features:
		supports: {
			'playHead': true,
			'pause': true,
			'stop': true,
			'sourceSwitch': true,
			'timeDisplay': true,
			'volumeControl': true,
			'overlays': true,
			'fullscreen': true
		},
		seeking: false,
		startOffset: 0,
		currentTime: 0,
		duration: 0,
		userSlide: false,
		volume: 1,
		vid: {'readyState': 1},
		receiverName: '',
		playerPlayed:false,

		setup: function( readyCallback ) {
			mw.log('EmbedPlayerFlashHLS:: Setup');
			var _this = this;
			// Check if we created the kPlayer container
			var $container = this.getPlayerContainer();
			//Hide the native video tag
			this.hideNativePoster();
			// Create the container
			this.getVideoDisplay().prepend(
				$('<div />')
					.attr('id', _this.flashhlsContainerId)
					.addClass('maximize')
			);
			var flashvars = {};
			var mwEmbedPath = mw.getMwEmbedPath();
			//replace protocol with page protocol
			if ( window.location.protocol ) {
				mwEmbedPath = window.location.protocol + mwEmbedPath.substring( mwEmbedPath.indexOf(":") + 1);
			}

			var flashhlsPath = mwEmbedPath + 'modules/FlashHLS/resources/flashlsChromeless.swf?x=2';
			window.onHLSReady = function(playerId){
				_this.playerObject = $("#" + playerId ).get(0);
				//_this.getEntryUrl().then(function (srcToPlay) {
				_this.playerObject.playerLoad(_this.mediaElement.selectedSource.src);
				readyCallback();
			//	} );
			};
			window.onState = function(newState){
				switch(newState) {
					case 'PLAYING_BUFFERING':
						_this.bufferStart();
						break;
					case 'PLAYING':
						_this.bufferEnd();
						_this.onPlay();
						break;
					case 'PAUSED':
						_this.onPause();
						break;
				}
			};
			window.onPosition = function(timeMetric){
				_this.onUpdatePlayhead(timeMetric.position );
				var duration = _this.getDuration();
				if (duration != timeMetric.duration){
					_this.onDurationChange(timeMetric.duration);
				}
			};




		//	this.getEntryUrl().then(function (srcToPlay) {
				// attributes and params:
				flashembed( _this.flashhlsContainerId,
					{
						id :				'flashhlsplayer_' + _this.pid,
						src : 				flashhlsPath,
						bgcolor :			"#000000",
						allowNetworking : 	"all",
						version :			[10,0],
						wmode : 			"transparent"
					},
					flashvars
				);
		//	});

		},
		getPlayerContainer: function () {
			if (!this.flashhlsContainerId) {
				this.flashhlsContainerId = 'flashhls' + this.id;
			}
			return $('#' + this.flashhlsContainerId);
		},
		/**
		 * Hide the native video tag
		 */
		hideNativePoster: function () {
			var videoTagObj = $($('#' + this.pid).get(0));
			if (videoTagObj) {
				videoTagObj.css('visibility', 'hidden');
			}
		},
		/**
		 * play method calls parent_play to update the interface
		 */
		play: function () {
			mw.log('EmbedPlayerKplayer::play');

			if (this.parent_play()) {
				//live might take a while to start, meanwhile disable gui

				if (!this.playerPlayed) {
					this.playerObject.playerPlay();
					this.playerPlayed = true;
				} else {
					this.playerObject.playerResume();
				}

				this.monitor();
			} else {
				mw.log("EmbedPlayerKPlayer:: parent play returned false, don't issue play on kplayer element");
			}
		},
		/**
		 * pause method calls parent_pause to update the interface
		 */
		pause: function () {
			try {
				this.playerObject.playerPause();
			} catch (e) {
				mw.log("EmbedPlayerKplayer:: doPause failed");
			}
			this.parent_pause();
		},
		/**
		 * on Pause callback from the kaltura flash player calls parent_pause to
		 * update the interface
		 */
		onPause: function () {
			this.updatePlayhead();
			$(this).trigger("onpause");
		},

		/**
		 * onPlay function callback from the kaltura flash player directly call the
		 * parent_play
		 */
		onPlay: function () {
			if (this._propagateEvents) {

				this.updatePlayhead();
				$(this).trigger("playing");
				this.getPlayerContainer().css('visibility', 'visible');
				this.hideSpinner();
				this.stopped = this.paused = false;
			}
		},
		/**
		 * function called by flash at set interval to update the playhead.
		 */
		onUpdatePlayhead: function (playheadValue) {
			if (this.seeking) {
				this.seeking = false;
			}
			this.flcurrentTime = playheadValue;
			$(this).trigger('timeupdate');
		},
		updatePlayhead: function () {
			if (this.seeking) {
				this.seeking = false;
			}
		} ,
		/**
		 * Get the embed player time
		 */
		getPlayerElementTime: function () {
			// update currentTime
			return this.flcurrentTime;
		},
		onDurationChange: function (data) {
			var dur = this.getDuration();

			if ( !this.isLive() && data > dur && mw.getConfig("EmbedPlayer.EnableURLTimeEncoding")===true ) {
				return;
			}
			// Update the duration ( only if not in url time encoding mode:
			this.setDuration(data);
			this.playerObject.duration = data.newValue;
		},
		/**
		 * Issues a seek to the playerElement
		 *
		 * @param {Float}
		 *            percentage Percentage of total stream length to seek to
		 */
		doSeek: function (seekTime) {
			this.seekStarted = true;

				this.playerObject.playerSeek(seekTime);

		},
		/**
		 * Issues a volume update to the playerElement
		 *
		 * @param {Float}
		 *            percentage Percentage to update volume to
		 */
		setPlayerElementVolume: function (percentage) {
			if (this.playerObject) {
				this.playerObject.playerVolume(percentage*100);
			}
		},
		backToLive: function () {
			this.triggerHelper('movingBackToLive');
			this.playerObject.playerSeek(this.duration);
		}

	};
} )( mediaWiki, jQuery );

/*
 * jQuery Tools 1.2.5 - The missing UI library for the Web
 *
 * [toolbox.flashembed]
 *
 * NO COPYRIGHTS OR LICENSES. DO WHAT YOU LIKE.
 *
 * http://flowplayer.org/tools/
 *
 * File generated: Fri Oct 22 13:51:38 GMT 2010
 */
(function(){function f(a,b){if(b)for(var c in b)if(b.hasOwnProperty(c))a[c]=b[c];return a}function l(a,b){var c=[];for(var d in a)if(a.hasOwnProperty(d))c[d]=b(a[d]);return c}function m(a,b,c){if(e.isSupported(b.version))a.innerHTML=e.getHTML(b,c);else if(b.expressInstall&&e.isSupported([6,65]))a.innerHTML=e.getHTML(f(b,{src:b.expressInstall}),{MMredirectURL:location.href,MMplayerType:"PlugIn",MMdoctitle:document.title});else{if(!a.innerHTML.replace(/\s/g,"")){a.innerHTML="<h2>Flash version "+b.version+
	" or greater is required</h2><h3>"+(g[0]>0?"Your version is "+g:"You have no flash plugin installed")+"</h3>"+(a.tagName=="A"?"<p>Click here to download latest version</p>":"<p>Download latest version from <a href='"+k+"'>here</a></p>");if(a.tagName=="A")a.onclick=function(){location.href=k}}if(b.onFail){var d=b.onFail.call(this);if(typeof d=="string")a.innerHTML=d}}if(i)window[b.id]=document.getElementById(b.id);f(this,{getRoot:function(){return a},getOptions:function(){return b},getConf:function(){return c},
	getApi:function(){return a.firstChild}})}var i=document.all,k="http://www.adobe.com/go/getflashplayer",n=typeof jQuery=="function",o=/(\d+)[^\d]+(\d+)[^\d]*(\d*)/,j={width:"100%",height:"100%",id:"_"+(""+Math.random()).slice(9),allowfullscreen:true,allowscriptaccess:"always",quality:"high",version:[3,0],onFail:null,expressInstall:null,w3c:false,cachebusting:false};window.attachEvent&&window.attachEvent("onbeforeunload",function(){__flash_unloadHandler=function(){};__flash_savedUnloadHandler=function(){}});
	window.flashembed=function(a,b,c){if(typeof a=="string")a=document.getElementById(a.replace("#",""));if(a){if(typeof b=="string")b={src:b};return new m(a,f(f({},j),b),c)}};var e=f(window.flashembed,{conf:j,getVersion:function(){var a,b;try{b=navigator.plugins["Shockwave Flash"].description.slice(16)}catch(c){try{b=(a=new ActiveXObject("ShockwaveFlash.ShockwaveFlash.7"))&&a.GetVariable("$version")}catch(d){try{b=(a=new ActiveXObject("ShockwaveFlash.ShockwaveFlash.6"))&&a.GetVariable("$version")}catch(h){}}}return(b=
		o.exec(b))?[b[1],b[3]]:[0,0]},asString:function(a){if(a===null||a===undefined)return null;var b=typeof a;if(b=="object"&&a.push)b="array";switch(b){case "string":a=a.replace(new RegExp('(["\\\\])',"g"),"\\$1");a=a.replace(/^\s?(\d+\.?\d+)%/,"$1pct");return'"'+a+'"';case "array":return"["+l(a,function(d){return e.asString(d)}).join(",")+"]";case "function":return'"function()"';case "object":b=[];for(var c in a)a.hasOwnProperty(c)&&b.push('"'+c+'":'+e.asString(a[c]));return"{"+b.join(",")+"}"}return String(a).replace(/\s/g,
		" ").replace(/\'/g,'"')},getHTML:function(a,b){a=f({},a);var c='<object title="video content" role="video content" width="'+a.width+'" height="'+a.height+'" id="'+a.id+'" name="'+a.id+'"';if(a.cachebusting)a.src+=(a.src.indexOf("?")!=-1?"&":"?")+Math.random();c+=a.w3c||!i?' data="'+a.src+'" type="application/x-shockwave-flash"':' classid="clsid:D27CDB6E-AE6D-11cf-96B8-444553540000"';c+=">";if(a.w3c||i)c+='<param name="movie" value="'+a.src+'" />';a.width=a.height=a.id=a.w3c=a.src=null;a.onFail=a.version=a.expressInstall=null;for(var d in a)if(a[d])c+=
		'<param name="'+d+'" value="'+a[d]+'" />';a="";if(b){for(var h in b)if(b[h]){d=b[h];a+=h+"="+(/function|object/.test(typeof d)?e.asString(d):d)+"&"}a=a.slice(0,-1);c+='<param name="flashvars" value=\''+a+"' />"}c+="</object>";return c},isSupported:function(a){return g[0]>a[0]||g[0]==a[0]&&g[1]>=a[1]}}),g=e.getVersion();if(n){jQuery.tools=jQuery.tools||{version:"1.2.5"};jQuery.tools.flashembed={conf:j};jQuery.fn.flashembed=function(a,b){return this.each(function(){$(this).data("flashembed",flashembed(this,
		a,b))})}}})();
