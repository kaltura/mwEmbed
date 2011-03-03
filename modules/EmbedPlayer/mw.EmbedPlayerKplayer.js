/*
 * The "kaltura player" embedPlayer interface for fallback h.264 and flv video format support
 */

// Called from the kdp.swf
function jsInterfaceReadyFunc() {
	return true;
}

mw.EmbedPlayerKplayer = {

	// Instance name:
	instanceOf : 'Kplayer',

	// List of supported features:
	supports : {
		'playHead' : true,
		'pause' : true,
		'stop' : true,
		'timeDisplay' : true,
		'volumeControl' : true,
		'overlays' : true,
		'fullscreen' : true
	},

	// Stores the current time as set from flash player
	flashCurrentTime : 0,

	/*
	 * Write the Embed html to the target
	 */
	doEmbedHTML : function() {
		var _this = this;

		mw.log("kPlayer:: embed src::" + _this.getSrc());
		var flashvars = {};
		flashvars.autoPlay = "true";
		var playerPath = mw.getMwEmbedPath() + 'modules/EmbedPlayer/binPlayers/kaltura-player';
		flashvars.entryId = mw.absoluteUrl( _this.getSrc() );

		// Use a relative url if the protocal is file://
		if (mw.parseUri(document.URL).protocol == 'file') {
			playerPath = mw.getRelativeMwEmbedPath() + 'modules/EmbedPlayer/binPlayers/kaltura-player';
			flashvars.entryId = _this.getSrc();
		}

		flashvars.debugMode = "true";
		flashvars.fileSystemMode = "true";
		flashvars.widgetId = "_7463";
		flashvars.partnerId = "7463";
		flashvars.pluginDomain = "kdp3/plugins/";
		flashvars.kml = "local";
		flashvars.kmlPath = playerPath + '/config.xml';
		flashvars.sourceType = "url";

		// flashvars.host = "www.kaltura.com";
		flashvars.externalInterfaceDisabled = 'false';
		flashvars.skinPath = playerPath + '/skin.swf';

		flashvars["full.skinPath"] = playerPath + '/LightDoodleskin.swf';

		var params = {};
		params.quality = "best";
		params.wmode = "opaque";
		params.allowfullscreen = "true";
		params.allowscriptaccess = "always";

		var attributes = {};
		attributes.id = this.pid;
		attributes.name = this.pid;

		mw.log(" KPlayer:: doEmbedHTML: about to add the pid container" );
		$j(this).html($j('<div />').attr('id', this.pid + '_container'));
		// Call swm dom loaded function:
		swfobject.callDomLoadFunctions();
		// Do the flash embedding with embedSWF
		swfobject.embedSWF(playerPath + "/kdp3.swf", this.pid + '_container',
				'100%', '100%', "10.0.0", playerPath + "/expressInstall.swf",
				flashvars, params, attributes);

		// Direct object embed
		/*
		 * $j( this ).html( '<object
		 * classid="clsid:D27CDB6E-AE6D-11cf-96B8-444553540000" width="780"
		 * height="420">'+ '<param name="movie" value="myContent.swf" />'+ '<!--[if
		 * !IE]>-->'+ '<object type="application/x-shockwave-flash"
		 * data="myContent.swf" width="780" height="420">'+ '<!--<![endif]-->'+ '<p>
		 * error with flash embed</p>' '<!--[if !IE]>-->'+ '</object>'+ '<!--<![endif]-->'+ '</object>' )
		 */

		setTimeout(function() {
			_this.postEmbedJS();
		}, 100);

		// Flash player loses its bindings once it changes sizes::
		$j(_this).bind('onOpenFullScreen', function() {
			_this.postEmbedJS();
		});
		$j(_this).bind('onCloseFullScreen', function() {
			_this.postEmbedJS();
		});
	},
	
	// The number of times we have tried to bind the player
	bindTryCount : 0,
	/**
	 * javascript run post player embedding
	 */
	postEmbedJS : function() {
		var _this = this;
		this.getPlayerElement();

		if (this.playerElement && this.playerElement.addJsListener) {
			var bindEventMap = {
				'doPause' : 'onPause',
				'doPlay' : 'onPlay',
				'durationChange' : 'onDurationChange',
				'playerPlayEnd' : 'onClipDone',
				'playerUpdatePlayhead' : 'onUpdatePlayhead',
				'bytesTotalChange' : 'onBytesTotalChange',
				'bytesDownloadedChange' : 'onBytesDownloadedChange'
			};
			
			$j.each( bindEventMap, function( bindName, localMethod ) {
				_this.bindPlayerFunction(bindName, localMethod);
			});
			bindTryCount = 0;
			// Start the monitor
			this.monitor();
		} else {
			bindTryCount++;
			// Keep trying to get the player element
			if( bindTryCount > 500 ){ // 5 seconds
				mw.log('Error:: KDP player never ready for bindings!');
				return ;
			}
			setTimeout(function() {
				_this.postEmbedJS();
			}, 10);
		}
	},

	/**
	 * Bind a Player Function,
	 * 
	 * Build a global callback to bind to "this" player instance:
	 * 
	 * @param {String}
	 *            flash binding name
	 * @param {String}
	 *            function callback name
	 */
	bindPlayerFunction : function(bindName, methodName) {
		// The kaltura kdp can only call a global function by given name
		var gKdpCallbackName = methodName + '_cb_' + this.id;

		// Create an anonymous function with local player scope
		var createGlobalCB = function(cName, embedPlayer) {
			window[ cName ] = function(data) {
				if ( embedPlayer._propagateEvents ) {
					embedPlayer[methodName](data);
				}
			};
		}(gKdpCallbackName, this);

		// Add the listener to the KDP flash player:
		this.playerElement.addJsListener(bindName, gKdpCallbackName);
	},

	/**
	 * on Pause callback from the kaltura flash player calls parent_pause to
	 * update the interface
	 */
	onPause : function() {
		this.parent_pause();
	},

	/**
	 * onPlay function callback from the kaltura flash player directly call the
	 * parent_play
	 */
	onPlay : function() {
		this.parent_play();
	},

	onDurationChange : function(data, id) {
		mw.log("KPlayer::onDurationChange: " + data.newValue);
		// update the duration:
		this.duration = data.newValue;
		$j(this).trigger('durationchange');
	},

	/**
	 * play method calls parent_play to update the interface
	 */
	play : function() {
		if (this.playerElement && this.playerElement.sendNotification) {
			this.playerElement.sendNotification('doPlay');
		}
		this.parent_play();
	},

	/**
	 * pause method calls parent_pause to update the interface
	 */
	pause : function() {
		if (this.playerElement && this.playerElement.sendNotification) {
			this.playerElement.sendNotification('doPause');
		}
		this.parent_pause();
	},
	/**
	 * switchPlaySrc switches the player source working around a few bugs in browsers
	 * 
	 * @param {string}
	 *            src Video url Source to switch to.
	 * @param {function}
	 *            switchCallback Function to call once the source has been switched
	 * @param {function}
	 *            doneCallback Function to call once the clip has completed playback
	 */
	switchPlaySrc: function( src, switchCallback, doneCallback ){
		var _this = this;
		if( !this.getPlayerElement() ) {
			// Can't switch play src if no source is present
			mw.log('Error: switchPlaySrc can not switchPlaySrc if no source is playing' );
			return ;
		}
		var gPlayerReady =  this.id + '_switchSrcReady';
		var gDoneName = this.id + '_switchSrcEnd';
		setTimeout(function(){
			mw.log("Kplayer switchPlaySrc: " + src);
			_this.getPlayerElement().sendNotification("changeMedia", {entryId:src} );
			_this.monitor();
			switchCallback( this );
			
			window[ gDoneName ] = doneCallback;
			_this.getPlayerElement().addJsListener( 'playerPlayEnd', gDoneName);
		},500);	
		// This is very fragile..it sucks we can't use 
		this.getPlayerElement().addJsListener( 'playerReady', gPlayerReady );
	},
	
	/**
	 * Issues a seek to the playerElement
	 * 
	 * @param {Float}
	 *            percentage Percentage of total stream length to seek to
	 */
	doSeek : function(percentage) {
		var _this = this;
		var seekTime = percentage * this.getDuration();
		mw.log( 'EmbedPlayerKalturaKplayer:: doSeek: ' + percentage + ' time:' + seekTime );
		if (this.supportsURLTimeEncoding()) {

			// Make sure we could not do a local seek instead:
			if (!(percentage < this.bufferedPercent
					&& this.playerElement.duration && !this.didSeekJump)) {
				// We support URLTimeEncoding call parent seek:
				this.parent_doSeek( percentage );
				return;
			}
		}

		if (this.playerElement) {		
			// Issue the seek to the flash player:
			this.playerElement.sendNotification('doSeek', seekTime);

			// Kdp is missing seek done callback
			setTimeout(function() {
				_this.seeking = false;
			}, 500);
		} else {
			// try to do a play then seek:
			this.doPlayThenSeek(percentage);
		}
		// Run the onSeeking interface update
		this.controlBuilder.onSeek();
	},

	/**
	 * Seek in a existing stream
	 * 
	 * @param {Float}
	 *            percentage Percentage of the stream to seek to between 0 and 1
	 */
	doPlayThenSeek : function(percentage) {
		mw.log('flash::doPlayThenSeek::');
		var _this = this;
		// issue the play request
		this.play();
	
		// let the player know we are seeking
		_this.seeking = true;
	
		var getPlayerCount = 0;
		var readyForSeek = function() {
			_this.getPlayerElement();
			// if we have duration then we are ready to do the seek ( flash can't
			// seek untill there is some buffer )
			if (_this.playerElement && _this.playerElement.sendNotification
					&& _this.getDuration() && _this.bufferedPercent) {
				var seekTime = percentage * _this.getDuration();
				// Issue the seek to the flash player:
				_this.playerElement.sendNotification('doSeek', seekTime);
			} else {
				// Try to get player for 20 seconds:
				if (getPlayerCount < 400) {
					setTimeout(readyForSeek, 50);
					getPlayerCount++;
				} else {
					mw.log('Error:doPlayThenSeek failed');
				}
			}
		};
		readyForSeek();
	},
	
	/**
	 * Issues a volume update to the playerElement
	 * 
	 * @param {Float}
	 *            percentage Percentage to update volume to
	 */
	setPlayerElementVolume : function(percentage) {
		if (this.playerElement && this.playerElement.sendNotification) {
			this.playerElement.sendNotification('changeVolume', percentage);
		}
	},
	
	/**
	 * function called by flash at set interval to update the playhead.
	 */
	onUpdatePlayhead : function(playheadValue) {
		mw.log('Update play head::' + playheadValue);
		this.flashCurrentTime = playheadValue;
	},
	
	/**
	 * function called by flash when the total media size changes
	 */
	onBytesTotalChange : function(data, id) {
		this.bytesTotal = data.newValue;
	},
	
	/**
	 * function called by flash applet when download bytes changes
	 */
	onBytesDownloadedChange : function(data, id) {
		mw.log('onBytesDownloadedChange');
		this.bytesLoaded = data.newValue;
		this.bufferedPercent = this.bytesLoaded / this.bytesTotal;
	
		// Fire the parent html5 action
		$j(this).trigger('progress', {
			'loaded' : this.bytesLoaded,
			'total' : this.bytesTotal
		});
	},
	
	/**
	 * Get the embed player time
	 */
	getPlayerElementTime : function() {
		// update currentTime
		return this.flashCurrentTime;
	},
	
	/**
	 * Get the embed fla object player Element
	 */
	getPlayerElement : function() {
		this.playerElement = document.getElementById(this.pid);
		return this.playerElement;
	}
};

/*
 * ! SWFObject v2.2 <http://code.google.com/p/swfobject/> is released under the
 * MIT License <http://www.opensource.org/licenses/mit-license.php>
 */
var swfobject=function(){var D="undefined",r="object",S="Shockwave Flash",W="ShockwaveFlash.ShockwaveFlash",q="application/x-shockwave-flash",R="SWFObjectExprInst",x="onreadystatechange",O=window,j=document,t=navigator,T=false,U=[h],o=[],N=[],I=[],l,Q,E,B,J=false,a=false,n,G,m=true,M=function(){var aa=typeof j.getElementById!=D&&typeof j.getElementsByTagName!=D&&typeof j.createElement!=D,ah=t.userAgent.toLowerCase(),Y=t.platform.toLowerCase(),ae=Y?/win/.test(Y):/win/.test(ah),ac=Y?/mac/.test(Y):/mac/.test(ah),af=/webkit/.test(ah)?parseFloat(ah.replace(/^.*webkit\/(\d+(\.\d+)?).*$/,"$1")):false,X=!+"\v1",ag=[0,0,0],ab=null;if(typeof t.plugins!=D&&typeof t.plugins[S]==r){ab=t.plugins[S].description;if(ab&&!(typeof t.mimeTypes!=D&&t.mimeTypes[q]&&!t.mimeTypes[q].enabledPlugin)){T=true;X=false;ab=ab.replace(/^.*\s+(\S+\s+\S+$)/,"$1");ag[0]=parseInt(ab.replace(/^(.*)\..*$/,"$1"),10);ag[1]=parseInt(ab.replace(/^.*\.(.*)\s.*$/,"$1"),10);ag[2]=/[a-zA-Z]/.test(ab)?parseInt(ab.replace(/^.*[a-zA-Z]+(.*)$/,"$1"),10):0}}else{if(typeof O.ActiveXObject!=D){try{var ad=new ActiveXObject(W);if(ad){ab=ad.GetVariable("$version");if(ab){X=true;ab=ab.split(" ")[1].split(",");ag=[parseInt(ab[0],10),parseInt(ab[1],10),parseInt(ab[2],10)]}}}catch(Z){}}}return{w3:aa,pv:ag,wk:af,ie:X,win:ae,mac:ac}}(),k=function(){if(!M.w3){return}if((typeof j.readyState!=D&&j.readyState=="complete")||(typeof j.readyState==D&&(j.getElementsByTagName("body")[0]||j.body))){f()}if(!J){if(typeof j.addEventListener!=D){j.addEventListener("DOMContentLoaded",f,false)}if(M.ie&&M.win){j.attachEvent(x,function(){if(j.readyState=="complete"){j.detachEvent(x,arguments.callee);f()}});if(O==top){(function(){if(J){return}try{j.documentElement.doScroll("left")}catch(X){setTimeout(arguments.callee,0);return}f()})()}}if(M.wk){(function(){if(J){return}if(!/loaded|complete/.test(j.readyState)){setTimeout(arguments.callee,0);return}f()})()}s(f)}}();function f(){if(J){return}try{var Z=j.getElementsByTagName("body")[0].appendChild(C("span"));Z.parentNode.removeChild(Z)}catch(aa){return}J=true;var X=U.length;for(var Y=0;Y<X;Y++){U[Y]()}}function K(X){if(J){X()}else{U[U.length]=X}}function s(Y){if(typeof O.addEventListener!=D){O.addEventListener("load",Y,false)}else{if(typeof j.addEventListener!=D){j.addEventListener("load",Y,false)}else{if(typeof O.attachEvent!=D){i(O,"onload",Y)}else{if(typeof O.onload=="function"){var X=O.onload;O.onload=function(){X();Y()}}else{O.onload=Y}}}}}function h(){if(T){V()}else{H()}}function V(){var X=j.getElementsByTagName("body")[0];var aa=C(r);aa.setAttribute("type",q);var Z=X.appendChild(aa);if(Z){var Y=0;(function(){if(typeof Z.GetVariable!=D){var ab=Z.GetVariable("$version");if(ab){ab=ab.split(" ")[1].split(",");M.pv=[parseInt(ab[0],10),parseInt(ab[1],10),parseInt(ab[2],10)]}}else{if(Y<10){Y++;setTimeout(arguments.callee,10);return}}X.removeChild(aa);Z=null;H()})()}else{H()}}function H(){var ag=o.length;if(ag>0){for(var af=0;af<ag;af++){var Y=o[af].id;var ab=o[af].callbackFn;var aa={success:false,id:Y};if(M.pv[0]>0){var ae=c(Y);if(ae){if(F(o[af].swfVersion)&&!(M.wk&&M.wk<312)){w(Y,true);if(ab){aa.success=true;aa.ref=z(Y);ab(aa)}}else{if(o[af].expressInstall&&A()){var ai={};ai.data=o[af].expressInstall;ai.width=ae.getAttribute("width")||"0";ai.height=ae.getAttribute("height")||"0";if(ae.getAttribute("class")){ai.styleclass=ae.getAttribute("class")}if(ae.getAttribute("align")){ai.align=ae.getAttribute("align")}var ah={};var X=ae.getElementsByTagName("param");var ac=X.length;for(var ad=0;ad<ac;ad++){if(X[ad].getAttribute("name").toLowerCase()!="movie"){ah[X[ad].getAttribute("name")]=X[ad].getAttribute("value")}}P(ai,ah,Y,ab)}else{p(ae);if(ab){ab(aa)}}}}}else{w(Y,true);if(ab){var Z=z(Y);if(Z&&typeof Z.SetVariable!=D){aa.success=true;aa.ref=Z}ab(aa)}}}}}function z(aa){var X=null;var Y=c(aa);if(Y&&Y.nodeName=="OBJECT"){if(typeof Y.SetVariable!=D){X=Y}else{var Z=Y.getElementsByTagName(r)[0];if(Z){X=Z}}}return X}function A(){return !a&&F("6.0.65")&&(M.win||M.mac)&&!(M.wk&&M.wk<312)}function P(aa,ab,X,Z){a=true;E=Z||null;B={success:false,id:X};var ae=c(X);if(ae){if(ae.nodeName=="OBJECT"){l=g(ae);Q=null}else{l=ae;Q=X}aa.id=R;if(typeof aa.width==D||(!/%$/.test(aa.width)&&parseInt(aa.width,10)<310)){aa.width="310"}if(typeof aa.height==D||(!/%$/.test(aa.height)&&parseInt(aa.height,10)<137)){aa.height="137"}j.title=j.title.slice(0,47)+" - Flash Player Installation";var ad=M.ie&&M.win?"ActiveX":"PlugIn",ac="MMredirectURL="+O.location.toString().replace(/&/g,"%26")+"&MMplayerType="+ad+"&MMdoctitle="+j.title;if(typeof ab.flashvars!=D){ab.flashvars+="&"+ac}else{ab.flashvars=ac}if(M.ie&&M.win&&ae.readyState!=4){var Y=C("div");X+="SWFObjectNew";Y.setAttribute("id",X);ae.parentNode.insertBefore(Y,ae);ae.style.display="none";(function(){if(ae.readyState==4){ae.parentNode.removeChild(ae)}else{setTimeout(arguments.callee,10)}})()}u(aa,ab,X)}}function p(Y){if(M.ie&&M.win&&Y.readyState!=4){var X=C("div");Y.parentNode.insertBefore(X,Y);X.parentNode.replaceChild(g(Y),X);Y.style.display="none";(function(){if(Y.readyState==4){Y.parentNode.removeChild(Y)}else{setTimeout(arguments.callee,10)}})()}else{Y.parentNode.replaceChild(g(Y),Y)}}function g(ab){var aa=C("div");if(M.win&&M.ie){aa.innerHTML=ab.innerHTML}else{var Y=ab.getElementsByTagName(r)[0];if(Y){var ad=Y.childNodes;if(ad){var X=ad.length;for(var Z=0;Z<X;Z++){if(!(ad[Z].nodeType==1&&ad[Z].nodeName=="PARAM")&&!(ad[Z].nodeType==8)){aa.appendChild(ad[Z].cloneNode(true))}}}}}return aa}function u(ai,ag,Y){var X,aa=c(Y);if(M.wk&&M.wk<312){return X}if(aa){if(typeof ai.id==D){ai.id=Y}if(M.ie&&M.win){var ah="";for(var ae in ai){if(ai[ae]!=Object.prototype[ae]){if(ae.toLowerCase()=="data"){ag.movie=ai[ae]}else{if(ae.toLowerCase()=="styleclass"){ah+=' class="'+ai[ae]+'"'}else{if(ae.toLowerCase()!="classid"){ah+=" "+ae+'="'+ai[ae]+'"'}}}}}var af="";for(var ad in ag){if(ag[ad]!=Object.prototype[ad]){af+='<param name="'+ad+'" value="'+ag[ad]+'" />'}}aa.outerHTML='<object classid="clsid:D27CDB6E-AE6D-11cf-96B8-444553540000"'+ah+">"+af+"</object>";N[N.length]=ai.id;X=c(ai.id)}else{var Z=C(r);Z.setAttribute("type",q);for(var ac in ai){if(ai[ac]!=Object.prototype[ac]){if(ac.toLowerCase()=="styleclass"){Z.setAttribute("class",ai[ac])}else{if(ac.toLowerCase()!="classid"){Z.setAttribute(ac,ai[ac])}}}}for(var ab in ag){if(ag[ab]!=Object.prototype[ab]&&ab.toLowerCase()!="movie"){e(Z,ab,ag[ab])}}aa.parentNode.replaceChild(Z,aa);X=Z}}return X}function e(Z,X,Y){var aa=C("param");aa.setAttribute("name",X);aa.setAttribute("value",Y);Z.appendChild(aa)}function y(Y){var X=c(Y);if(X&&X.nodeName=="OBJECT"){if(M.ie&&M.win){X.style.display="none";(function(){if(X.readyState==4){b(Y)}else{setTimeout(arguments.callee,10)}})()}else{X.parentNode.removeChild(X)}}}function b(Z){var Y=c(Z);if(Y){for(var X in Y){if(typeof Y[X]=="function"){Y[X]=null}}Y.parentNode.removeChild(Y)}}function c(Z){var X=null;try{X=j.getElementById(Z)}catch(Y){}return X}function C(X){return j.createElement(X)}function i(Z,X,Y){Z.attachEvent(X,Y);I[I.length]=[Z,X,Y]}function F(Z){var Y=M.pv,X=Z.split(".");X[0]=parseInt(X[0],10);X[1]=parseInt(X[1],10)||0;X[2]=parseInt(X[2],10)||0;return(Y[0]>X[0]||(Y[0]==X[0]&&Y[1]>X[1])||(Y[0]==X[0]&&Y[1]==X[1]&&Y[2]>=X[2]))?true:false}function v(ac,Y,ad,ab){if(M.ie&&M.mac){return}var aa=j.getElementsByTagName("head")[0];if(!aa){return}var X=(ad&&typeof ad=="string")?ad:"screen";if(ab){n=null;G=null}if(!n||G!=X){var Z=C("style");Z.setAttribute("type","text/css");Z.setAttribute("media",X);n=aa.appendChild(Z);if(M.ie&&M.win&&typeof j.styleSheets!=D&&j.styleSheets.length>0){n=j.styleSheets[j.styleSheets.length-1]}G=X}if(M.ie&&M.win){if(n&&typeof n.addRule==r){n.addRule(ac,Y)}}else{if(n&&typeof j.createTextNode!=D){n.appendChild(j.createTextNode(ac+" {"+Y+"}"))}}}function w(Z,X){if(!m){return}var Y=X?"visible":"hidden";if(J&&c(Z)){c(Z).style.visibility=Y}else{v("#"+Z,"visibility:"+Y)}}function L(Y){var Z=/[\\\"<>\.;]/;var X=Z.exec(Y)!=null;return X&&typeof encodeURIComponent!=D?encodeURIComponent(Y):Y}var d=function(){if(M.ie&&M.win){window.attachEvent("onunload",function(){var ac=I.length;for(var ab=0;ab<ac;ab++){I[ab][0].detachEvent(I[ab][1],I[ab][2])}var Z=N.length;for(var aa=0;aa<Z;aa++){y(N[aa])}for(var Y in M){M[Y]=null}M=null;for(var X in swfobject){swfobject[X]=null}swfobject=null})}}();return{registerObject:function(ab,X,aa,Z){if(M.w3&&ab&&X){var Y={};Y.id=ab;Y.swfVersion=X;Y.expressInstall=aa;Y.callbackFn=Z;o[o.length]=Y;w(ab,false)}else{if(Z){Z({success:false,id:ab})}}},getObjectById:function(X){if(M.w3){return z(X)}},embedSWF:function(ab,ah,ae,ag,Y,aa,Z,ad,af,ac){var X={success:false,id:ah};if(M.w3&&!(M.wk&&M.wk<312)&&ab&&ah&&ae&&ag&&Y){w(ah,false);K(function(){ae+="";ag+="";var aj={};if(af&&typeof af===r){for(var al in af){aj[al]=af[al]}}aj.data=ab;aj.width=ae;aj.height=ag;var am={};if(ad&&typeof ad===r){for(var ak in ad){am[ak]=ad[ak]}}if(Z&&typeof Z===r){for(var ai in Z){if(typeof am.flashvars!=D){am.flashvars+="&"+ai+"="+Z[ai]}else{am.flashvars=ai+"="+Z[ai]}}}if(F(Y)){var an=u(aj,am,ah);if(aj.id==ah){w(ah,true)}X.success=true;X.ref=an}else{if(aa&&A()){aj.data=aa;P(aj,am,ah,ac);return}else{w(ah,true)}}if(ac){ac(X)}})}else{if(ac){ac(X)}}},switchOffAutoHideShow:function(){m=false},ua:M,getFlashPlayerVersion:function(){return{major:M.pv[0],minor:M.pv[1],release:M.pv[2]}},hasFlashPlayerVersion:F,createSWF:function(Z,Y,X){if(M.w3){return u(Z,Y,X)}else{return undefined}},showExpressInstall:function(Z,aa,X,Y){if(M.w3&&A()){P(Z,aa,X,Y)}},removeSWF:function(X){if(M.w3){y(X)}},createCSS:function(aa,Z,Y,X){if(M.w3){v(aa,Z,Y,X)}},addDomLoadEvent:K,addLoadEvent:s,getQueryParamValue:function(aa){var Z=j.location.search||j.location.hash;if(Z){if(/\?/.test(Z)){Z=Z.split("?")[1]}if(aa==null){return L(Z)}var Y=Z.split("&");for(var X=0;X<Y.length;X++){if(Y[X].substring(0,Y[X].indexOf("="))==aa){return L(Y[X].substring((Y[X].indexOf("=")+1)))}}}return""},expressInstallCallback:function(){if(a){var X=c(R);if(X&&l){X.parentNode.replaceChild(l,X);if(Q){w(Q,true);if(M.ie&&M.win){l.style.display="block"}}if(E){E(B)}}a=false}}}}();
