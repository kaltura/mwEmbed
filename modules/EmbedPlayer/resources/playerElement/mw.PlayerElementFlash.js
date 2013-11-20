( function( mw, $ ) {"use strict";

// Class defined in resources/class/class.js
	mw.PlayerElementFlash = mw.PlayerElement.extend({
		jsReadyFunName: 'adJsInterfaceReadyFunc',
		playerElement: null,
		shouldLoad: false,
		currentTime: 0,
		duration: 0,
		id: null,
		readyState: 0,
		init: function( containerId , playerId ){
			var _this = this;
			this.id = playerId;

			var flashvars = {};
			flashvars.autoPlay = "true";
			flashvars.jsCallBackReadyFunc = this.jsReadyFunName;
			flashvars.externalInterfaceDisabled = "false";

			//if debug mode
			if( mw.getConfig( 'debug', true ) ){
				flashvars.debugMode = 'true';
			}

			var kdpPath = mw.getMwEmbedPath() + 'modules/EmbedPlayer/binPlayers/kaltura-player' + '/kdp3.swf';
			this.playerJsReady = false;


			window[this.jsReadyFunName] = function( playerId ){
				_this.playerElement = $('#' + playerId )[0];

				var bindEventMap = {
					'playerPaused' : 'onPause',
					'playerPlayed' : 'onPlay',
					'durationChange' : 'onDurationChange',
					'playerPlayEnd' : 'onClipDone',
					'playerUpdatePlayhead' : 'onUpdatePlayhead',
					'alert': 'onAlert'
				};

				$.each( bindEventMap, function( bindName, localMethod ) {
					_this.bindPlayerFunction(bindName, localMethod);
				});

				_this.readyState = 1;
				//in case we were asked to load src before jscallbackready
				if ( _this.shouldLoad ) {
					_this.load();
				}
			};

			// attributes and params:
			flashembed( containerId,
				{
					id :				playerId,
					src : 				kdpPath,
					bgcolor :			"#000000",
					allowNetworking : 	"all",
					version :			[10,0],
					wmode : 			"opaque"
				},
				flashvars
			);

			//Workaround: sometimes onscreen clicks didn't work without the div on top ( check Chrome on Mac for example )
			/*var clickthruDiv = document.createElement('div');
			$( clickthruDiv ).width( '100%' )
				.height('100%')
				.css ('position' , 'absolute')
				.css( 'top', 0 )
				.css( 'left', 0 )
				.appendTo( $ ('#' + $( this ).attr('id') ));   */

			this.element = this;

			return this;
		},
		play: function(){
			this.sendNotification( 'doPlay' );
		},
		pause: function(){
			this.sendNotification( 'doPause' );
		},
		seek: function( val ){
			this.sendNotification( 'doSeek', val );
		},
		load: function(){
			if ( this.playerElement ) {
				this.sendNotification('changeMedia', {'entryUrl': this.src}) ;
			} else {
				this.shouldLoad = true;
			}
		},
		changeVolume: function( volume ){
			this.sendNotification( 'changeVolume', volume );
		},
		sendNotification: function ( noteName, value ) {
			if ( this.playerElement ) {
				this.playerElement.sendNotification( noteName, value ) ;
			}
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
		 */
		bindPlayerFunction : function(bindName, methodName) {
			var _this = this;
			mw.log( 'EmbedPlayerKplayer:: bindPlayerFunction:' + bindName );
			// The kaltura kdp can only call a global function by given name
			var gKdpCallbackName = 'kdp_' + methodName + '_cb_' + this.id.replace(/[^a-zA-Z 0-9]+/g,'');

			// Create an anonymous function with local player scope
			var createGlobalCB = function(cName) {
				window[ cName ] = function(data) {
					// Track all events ( except for playerUpdatePlayhead and bytesDownloadedChange )
					if( bindName != 'playerUpdatePlayhead' && bindName != 'bytesDownloadedChange' ){
						mw.log("EmbedPlayerKplayer:: event: " + bindName);
					}
					_this[methodName](data);
				};
			}(gKdpCallbackName, this);
			// Remove the listener ( if it exists already )
			this.playerElement.removeJsListener( bindName, gKdpCallbackName );
			// Add the listener to the KDP flash player:
			this.playerElement.addJsListener( bindName, gKdpCallbackName);
		},
		onUpdatePlayhead : function ( playheadVal ) {
			this.currentTime = playheadVal;
		},
		onPause : function() {
			//TODO
		},
		onPlay : function() {
			//TODO
		},
		onDurationChange : function( data, id ) {
			this.duration = data.newValue;
			$( this ).trigger('loadedmetadata');
		},
		onClipDone : function() {
			$( this ).trigger( 'ended.playVideoSibling' );
		},
		onAlert : function ( data, id ) {
			//TODO?
		}
	});

} )( window.mw, jQuery );

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
		" ").replace(/\'/g,'"')},getHTML:function(a,b){a=f({},a);var c='<object width="'+a.width+'" height="'+a.height+'" id="'+a.id+'" name="'+a.id+'"';if(a.cachebusting)a.src+=(a.src.indexOf("?")!=-1?"&":"?")+Math.random();c+=a.w3c||!i?' data="'+a.src+'" type="application/x-shockwave-flash"':' classid="clsid:D27CDB6E-AE6D-11cf-96B8-444553540000"';c+=">";if(a.w3c||i)c+='<param name="movie" value="'+a.src+'" />';a.width=a.height=a.id=a.w3c=a.src=null;a.onFail=a.version=a.expressInstall=null;for(var d in a)if(a[d])c+=
		'<param name="'+d+'" value="'+a[d]+'" />';a="";if(b){for(var h in b)if(b[h]){d=b[h];a+=h+"="+(/function|object/.test(typeof d)?e.asString(d):d)+"&"}a=a.slice(0,-1);c+='<param name="flashvars" value=\''+a+"' />"}c+="</object>";return c},isSupported:function(a){return g[0]>a[0]||g[0]==a[0]&&g[1]>=a[1]}}),g=e.getVersion();if(n){jQuery.tools=jQuery.tools||{version:"1.2.5"};jQuery.tools.flashembed={conf:j};jQuery.fn.flashembed=function(a,b){return this.each(function(){$(this).data("flashembed",flashembed(this,
		a,b))})}}})();