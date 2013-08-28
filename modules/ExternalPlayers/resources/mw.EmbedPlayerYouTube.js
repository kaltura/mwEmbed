/*
 * The "kaltura player" embedPlayer interface for fallback h.264 and flv video format support
 * See http://www.mediawiki.org/wiki/Manual:Coding_conventions/JavaScript for formating conventions
 */
( function( mw, $ ){ "use strict";

window['mwePlayerId'];
mw.EmbedPlayerYouTube = {

	//test comment for testing pull request  

	// Instance name:
	instanceOf : 'youtube',

	bindPostfix: '.YouTube',
	//current playhead time
	time : 0,
	//current entry duration
	duration : 0,
	// A flag to store if the player has already been embed or not
	playerEmbedFlag: false,
	//Flag holdinng end state
	hasEnded: false,
	
	//the youtube entry id
	youtubeEntryId : "",
	
	//the youtube preFix
	//TODO grab from a configuration 
	youtubePreFix : "//www.youtube.com/apiplayer?video_id=",
	youtubeProtocol : "http:",
	// List of supported features:
	supports : {
		'playHead' :  (mw.getConfig('previewMode') == null) ? true : false ,
		'pause' : true,
		'stop' : true,
		'timeDisplay' : true,
		'volumeControl' : true,
		'overlays' : true,
		'fullscreen' : (mw.getConfig('previewMode') == null) ? true : false
	},
	
	init: function(){
		var _this = this;
	},
	onPlayerStateChange : function (event){
		//delegate to window function
		window['onPlayerStateChange'](event);
	},
	
	registerGlobalCallbacks: function(){
		var _this = this;
		window['onPlayerStateChange'] = function( event ){
			var _this = $('#' + window['mwePlayerId'])[0];
			// clean up
			if( event.data || event.data == 0 || event.data ){
				event = event.data;
			}
			var stateName;
			// move to other method
			switch( event ){
				case -1:
					stateName = "unstarted";

				  break;
				case 0:
				case "0":
					stateName = "ended";
					this.hasEnded = true;
				  break;
				case 1:
					// hide the player container so that youtube click through work
					$('.mwEmbedPlayer').hide();
					//hide the poster
					$(".playerPoster").hide();
					$('.blackBoxHide').hide();
					_this.play();
					stateName = "playing";
					//$(this).hide();
					// update duraiton
					_this.setDuration();
					// trigger the seeked event only if this is seek and not in play
					if(_this.seeking){
						_this.seeking = false;
						$( _this ).trigger( 'seeked' );
						// update the playhead status
						_this.updatePlayheadStatus();
					}
				  break;
				case 2:
					stateName = "paused";
					_this.parent_pause();
				  break;
				case 3:
					stateName = "buffering";
				  break;
				case 4:
					stateName = "unbuffering";
					break;
				case 5:
					stateName = "video cued";
				  break;
			}

		};
		window['hidePlayer'] = function( event ){
			$('.playerPoster').before('<div class="blackBoxHide" style="width:100%;height:100%;background:black;position:absolute;"></div>');
		}
		window['onError'] = function( event ){
			mw.log("Error! YouTubePlayer" ,2);
			//$('#loadingSpinner_kaltura_player').append('<br/>Error!');
			var errorMessage;
			if (event.data)
				event = event.data;
			switch( event ){
			case 2:
				errorMessage = "The request contains an invalid parameter value.";
				break;
			case 0:
			case 100:
				errorMessage = "The video requested was not found";
				break;
			case 101:
			case 150:
				errorMessage = "The owner of the requested video does not allow it to be played in embedded players";
				break;
			}
			//$('#loadingSpinner_kaltura_player').append('<br/>'+errorMessage);
			$(".playerPoster").hide();
			//$(".loadingSpinner_kaltura_player").hide();
			if( !window['iframePlayer'] )
				$('.mwEmbedPlayer').append('<br/><br/>'+errorMessage);
			$("#loadingSpinner_kaltura_player").hide();
			mw.log(errorMessage ,2);
		};
		//YOUTUBE IFRAME PLAYER READY (Not the Iframe - the player itself)
		window['onIframePlayerReady'] = function( event ){
			//autoplay
			$('#pid_kaltura_player').after('<div class="blackBoxHide" style="width:100%;height:100%;background:black;position:absolute;"></div>');
			window['iframePlayer'] = event.target;
			//autoplay
			if(mw.getConfig('autoPlay')){
				  _this.play();
			}else{
				  window['hidePlayer']();
			}
			
			

		};
		// YOUTUBE FLASH PLAYER READY
		window['onYouTubePlayerReady'] = function( playerIdStr ){
			$('.ui-icon-image').hide();
			$('.timed-text').hide();
			$('.ui-icon-arrowthickstop-1-s').hide();
			$('.ui-icon-flag').hide();
			$('#pid_kaltura_player').after('<div class="blackBoxHide" style="width:100%;height:100%;background:black;position:absolute;"></div>');
			var flashPlayer = $( '#' + playerIdStr )[0];
			flashPlayer.addEventListener("onStateChange", "onPlayerStateChange");
			flashPlayer.addEventListener("onError", "onError");
			//autoplay
			if(mw.getConfig('autoPlay')){
				  _this.play();
			}else{
				  window['hidePlayer']();
			}
		};
		// YOUTUBE IFRAME READY
		window['onYouTubeIframeAPIReady'] = function( playerIdStr ){
			//move to the other scope 
			$('.ui-icon-image').hide();
			$('.timed-text').hide();
			$('.ui-icon-arrowthickstop-1-s').hide();
			$('.ui-icon-flag').hide();			
			var embedPlayer = $('#' + window["pid"].replace( 'pid_', '' ) )[0];
			var playerVars;
			//basic configuration
			playerVars = {
						 controls: 0,
						 iv_load_policy:3,
						 rel: 0,
						 fs: 0,
						 wmode: 'opaque',
						 showinfo:0									  
			};
			
			if(window['KeyValueParams'])
			{
				  var kevarsArray = window['KeyValueParams'].split("&");
				  for(var i=0;i<kevarsArray.length;i++){
						 var kv = kevarsArray[i].split("=");
						 playerVars[kv[0]] = kv[1]; 
				  }
			
			}
			embedPlayer.playerElement = new YT.Player(pid, 
				  {
						 height: '100%',
						 width: '100%',
						 videoId: window["youtubeEntryId"],		  
						 playerVars: playerVars,
						 events: {
								'onReady': onIframePlayerReady,
								'onError': onError,
								'onStateChange': onPlayerStateChange
						 }
			});
		};
	},
	
	/*
	 * Write the Embed html to the target
	 */
	embedPlayerHTML : function(){
		this.registerGlobalCallbacks();
		if( this.playerEmbedFlag ){
			return ;
		}
		window['mwePlayerId'] = this.id;
		//handle fetching the youtubeId
		var metadata = this.evaluate('{mediaProxy.entryMetadata}');
		var entry = this.evaluate('{mediaProxy.entry}');
		//look for referenceId and then for custom data field YoutubeId
		if(entry.referenceId)
			this.youtubeEntryId = entry.referenceId;
		if(metadata.YoutubeId)
			this.youtubeEntryId = metadata.YoutubeId;
		
		if(this.youtubeEntryId.indexOf('http') > -1 || this.youtubeEntryId.indexOf('youtube') > -1  ){
			//found a full path - parse the entryId from it:
			var arr = this.youtubeEntryId.split("v=");
			var newEntryId = arr[1];
			if (newEntryId.indexOf("#") > -1)
				newEntryId = newEntryId.split("#")[0];
			if (newEntryId.indexOf("&") > -1)
				newEntryId = newEntryId.split("&")[0];
			this.youtubeEntryId = newEntryId;
		}
		
		this.addBindings();
			
		if(metadata.KeyValueParams){
			window['KeyValueParams'] = metadata.KeyValueParams;
		}
		window['pid'] = this.pid;
		
		if(mw.getConfig("forceYoutubeEntry"))
		{
			this.youtubeEntryId=mw.getConfig("forceYoutubeEntry");
		}
		window["youtubeEntryId"] = this.youtubeEntryId;
		
		
		this.playerEmbedFlag = true;
		this.youtubeProtocol = location.protocol;
		this.youtubePreFix = this.youtubeProtocol+this.youtubePreFix;
		
		if( this.supportsFlash() && mw.getConfig("forceIframe") != 1 ){
			// embed chromeless flash
			if(window['KeyValueParams']){
				var dataUrl = this.youtubePreFix + this.youtubeEntryId +'&amp;showinfo=0&amp;version=3&ampiv_load_policy=3&amp;' +
				'enablejsapi=1&amp;playerapiid=' + this.pid +
				"&amp&" + window['KeyValueParams'];
			}else{
				var dataUrl = this.youtubePreFix + this.youtubeEntryId +'&amp;showinfo=0&amp;version=3&ampiv_load_policy=3&amp;' +
				'enablejsapi=1&amp;playerapiid=' + this.pid ;
			}
			
			var classId = "";
			if( window.ActiveXObject ){
				classId= ' classid="clsid:D27CDB6E-AE6D-11cf-96B8-444553540000" ';
			}
			
			var embedStr = 	'<object type="application/x-shockwave-flash" '+
							'id="' + this.pid + '" ' +
							'name="' + this.pid + '" ' + classId +
							'AllowScriptAccess="always" ' +
							'data="' + dataUrl + '" ' +
							'width="100%" height="100%">' +
							'<param name="movie" value="' + dataUrl+  '">' +
							'<param name="allowScriptAccess" value="always">' +
							'<param name="wmode" value="opaque">' +
							'<param name="bgcolor" value="#000000">' +
							'</object>';
			
			$('.persistentNativePlayer').replaceWith(embedStr);
		} else {
			// embed iframe ( native skin in iOS )
			$('.persistentNativePlayer').replaceWith('<div id="'+this.pid+'"></div>');
			var tag = document.createElement('script');
			tag.src = "//www.youtube.com/iframe_api";
			var firstScriptTag = document.getElementsByTagName('script')[0];
			firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
		}
	},
	setDuration: function(){
		
		//set duration only once
		if (this.duration == 0 && this.getPlayerElement().getDuration()){
			this.duration = this.getPlayerElement().getDuration();
			$(this).trigger('durationchange');
		}
	},
	onPlayerReady : function (event){
		
	}, 
	addBindings: function(){
		var _this = this;
		mw.log("addBindings" , 5);
		this.bindHelper ('addControlBarComponent' , function(){
//			$('.ui-icon-image').hide();
//			$('.ui-icon-flag').hide();
		});
	},
	supportsVolumeControl: function(){
		// if ipad no. 
		return true;
	},
	getYouTubeId: function(){
		return this.getSrc().split('?')[1];
	},
	/**
	 * If the browser supports flash
	 * @return {boolean} true or false if flash > 10 is supported.
	 */
	supportsFlash: function(){
		if( mw.getConfig('EmbedPlayer.DisableHTML5FlashFallback' ) ){
			return false;
		}
		var version = this.getFlashVersion().split(',').shift();
		if( version < 10 ){
			return false;
		} else {
			return true;
		}
	},
	/**
	 * Checks for flash version
	 * @return {string} flash version string
	 */
	getFlashVersion: function(){
		// navigator browsers:
		if (navigator.plugins && navigator.plugins.length){
			try {
				if(navigator.mimeTypes["application/x-shockwave-flash"].enabledPlugin){
					return (navigator.plugins["Shockwave Flash 2.0"] || navigator.plugins["Shockwave Flash"]).description.replace(/\D+/g, ",").match(/^,?(.+),?$/)[1];
				}
			} catch(e){}
		}
		// IE
		try {
			try {
				if( typeof ActiveXObject != 'undefined' ){
					// avoid fp6 minor version lookup issues
					// see: http://blog.deconcept.com/2006/01/11/getvariable-setvariable-crash-internet-explorer-flash-6/
					var axo = new ActiveXObject('ShockwaveFlash.ShockwaveFlash.6');
					try {
						axo.AllowScriptAccess = 'always';
					} catch(e){
						return '6,0,0';
					}
				}
			} catch(e){}
			return new ActiveXObject('ShockwaveFlash.ShockwaveFlash').GetVariable('$version').replace(/\D+/g, ',').match(/^,?(.+),?$/)[1];
		} catch(e){}
		return '0,0,0';
	 },
	/**
	 * javascript run post player embedding
	 */
	postEmbedActions : function(){
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
	bindPlayerFunction : function(bindName, methodName){
	},

	/**
	 * play method calls parent_play to update the interface
	 */
	play: function(){
		var _this = this;
		
		if(this.hasEnded){
				//handle replay
			}
		if( this.parent_play() ){
			if(_this.getPlayerElement())
			{
				_this.getPlayerElement().playVideo();
			}
		}
		this.monitor();
	},

	/**
	 * pause method calls parent_pause to update the interface
	 */
	pause: function(){
		var yt = this.getPlayerElement();
		yt.pauseVideo();
		this.parent_pause();
	},
	/**
	 * playerSwitchSource switches the player source working around a few bugs in browsers
	 *
	 * @param {object}
	 *			source Video Source object to switch to.
	 * @param {function}
	 *			switchCallback Function to call once the source has been switched
	 * @param {function}
	 *			doneCallback Function to call once the clip has completed playback
	 */
	playerSwitchSource: function( source, switchCallback, doneCallback ){
		
	},

	/**
	 * Issues a seek to the playerElement
	 *
	 * @param {Float}
	 *			percentage Percentage of total stream length to seek to
	 */
	seek : function( percentage ){
		this.seeking = true;
		$( this ).trigger( 'seeking' );
		var yt = this.getPlayerElement();
		yt.seekTo( yt.getDuration() * percentage );
		this.layoutBuilder.onSeek();
		//TODO check if there is a cleaner way to get the playback 

		
	},

	/**
	 * Issues a volume update to the playerElement
	 *
	 * @param {Float}
	 *			percentage Percentage to update volume to
	 */
	setPlayerElementVolume : function(percentage){
//		if ( this.getPlayerElement() && this.playerElement.sendNotification ){
//			this.playerElement.sendNotification('changeVolume', percentage);
//		}
		var yt = this.getPlayerElement();
		yt.setVolume(percentage*100);
	},

	/**
	 * function called by flash at set interval to update the playhead.
	 */
	onUpdatePlayhead : function( playheadValue ){
		this.time = playheadValue;
	},

	/**
	 * function called by flash when the total media size changes
	 */
	onBytesTotalChange : function(data, id){
		this.bytesTotal = data.newValue;
	},
	/**
	 * Get the embed player time
	 */
	getPlayerElementTime : function(){
		// update currentTime
		return this.getPlayerElement().getCurrentTime();
	},

	/**
	 * Get the embed fla object player Element
	 */
	getPlayerElement : function(){
		
		//IFRAME
		if( window['iframePlayer'] )
			return  window['iframePlayer']
		//Flash
		return $('#' + this.pid)[0];
	}
};

} )( mediaWiki, jQuery );
