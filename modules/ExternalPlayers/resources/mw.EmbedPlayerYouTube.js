/*
 * The "kaltura player" embedPlayer interface for fallback h.264 and flv video format support
 */
( function( mw, $ ) { "use strict";
var playerId;
var player; 
window['onYouTubePlayerReady'] = function( a )
{
	playerId = a;
	//$( '#' + a ).hide();
	$('#' + a.replace( 'pid_', '' ) )[0].addBindings();
	player = $( '#' + a )[0];
	player.addEventListener("onStateChange", "onPlayerStateChange");
	player.addEventListener("onPlaybackQualityChange", "onPlaybackQualityChange");
	player.setVolume(0);
},
window['onPlayerStateChange'] = function( event )
{
	$('#' + playerId.replace( 'pid_', '' ) )[0].onPlayerStateChange(event);
},
window['onPlaybackQualityChange'] = function( event )
{
},

mw.EmbedPlayerYouTube = {

	// Instance name:
	instanceOf : 'youtube',

	bindPostfix: '.YouTube',
	//current playhead time
	time : 0,
	//current entry duration
	duration : 0,
	// is in seek flag
	isInSeek : false,
	
	
	
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
	setDuration: function()
	{
		//set duration only once
		if (this.duration == 0 && this.getPlayerElement().getDuration())
		{
			this.duration = this.getPlayerElement().getDuration();
			$(this).trigger('durationchange');
		}
	},
	onPlayerStateChange : function (event)
	{
		var _this = this;
		var stateName;
		switch(event)
		{
		case -1:
			stateName = "unstarted";
		  break;
		case 0:
			stateName = "ended";
		  break;
		case 1:
			stateName = "playing";
			console.log(" >>>>>>>>>>>>>>>>>>>>>>>>>> stateName = playing");
			this.parent_play();
			// trigger the seeked event only if this is seek and not in play
			if(this.isInSeek)
			{
				$( this ).trigger( 'seeked' );
				this.isInSeek = false;
				
//              what does this means Ask Michael 
//				$( this ).trigger('progress', {
//					'loaded' : 500,
//					'total' : 2000
//				});
				
			}
		  break;
		case 2:
			stateName = "paused";
			this.parent_pause();
		  break;
		case 3:
			stateName = "buffering";
			console.log(" >>>>>>>>>>>>>>>>>>>>>>>> stateName = buffering");
		  break;
		case 5:
			stateName = "video cued";
		  break;
		}
	},
	init: function()
	{
		var _this = this;
		//iframe 
		window['onYouTubeIframeAPIReady'] = function()
		{
			_this.playerElement = new YT.Player(this.pid, 
				{
					height: '390',
					width: '640',
					videoId: 'u1zgFlCw8Aw',
					events: {
						'onReady': _this.onPlayerReady,
						'onStateChange': _this.onPlayerStateChange
					}
			});
		};
		
	},
	addBindings: function()
	{
		var _this = this;
		var myVar = setInterval(
			function(){
				_this.setDuration();
				var yt =$( '#' + playerId )[0];
				_this.onUpdatePlayhead(yt.getCurrentTime());
				
			},250);
		var yt = $( '#' + playerId )[0];
	},
	supportsVolumeControl: function(){
		// if ipad no.
		return true;
	},

	/*
	 * Write the Embed html to the target
	 */
	embedPlayerHTML : function() {
		// remove the native video tag ( not needed )
		// youtbe src is at: this.mediaElement.selectedSource.getSrc()
		if( this.supportsFlash() && true ){
			
			// embed chromeless flash
			$('.persistentNativePlayer').replaceWith(
					'<object type="application/x-shockwave-flash" id="' + this.pid + '"' +
				'AllowScriptAccess="always"' +
				'data="https://www.youtube.com/apiplayer?video_id='+ this.getYouTubeId() +'&amp;version=3&'+
				'amp;origin=https://developers.google.com&amp;enablejsapi=1&amp;playerapiid=' + this.pid + '"' +
				'width="100%" height="100%">' +
				'<param name="allowScriptAccess" value="always">' +
				'<param name="bgcolor" value="#cccccc">' +
				'</object>');
	      
		} else {
			// embed iframe ( native skin in iOS )

		}
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
	getFlashVersion: function() {
		// navigator browsers:
		if (navigator.plugins && navigator.plugins.length) {
			try {
				if(navigator.mimeTypes["application/x-shockwave-flash"].enabledPlugin){
					return (navigator.plugins["Shockwave Flash 2.0"] || navigator.plugins["Shockwave Flash"]).description.replace(/\D+/g, ",").match(/^,?(.+),?$/)[1];
				}
			} catch(e) {}
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
					} catch(e) {
						return '6,0,0';
					}
				}
			} catch(e) {}
			return new ActiveXObject('ShockwaveFlash.ShockwaveFlash').GetVariable('$version').replace(/\D+/g, ',').match(/^,?(.+),?$/)[1];
		} catch(e) {}
		return '0,0,0';
	 },
	
	/**
	 * javascript run post player embedding
	 */
	postEmbedActions : function() {
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
	},

	/**
	 * play method calls parent_play to update the interface
	 */
	play: function() {
		var _this = this;
		
		this.$hasPlayed = true;
		
//		var myVar = setInterval(function(){
//
//		
//		},250);
//		
//		function myTimer()
//		{
//			var yt = this.getPlayerElement();
//			if(yt)
//				{
//					console.log(yt.getCurrentTime())
//				}
////			document.getElementById("time1").value = ytplayer.getCurrentTime() ; 
////			document.getElementById("time2").value = ((Math.floor(ytplayer.getCurrentTime())*1000))/1000; ; 
//	}
		
		
		// unhide the object and play
		var yt = this.getPlayerElement();
		//$( yt ).show();
		yt.playVideo();
	},

	/**
	 * pause method calls parent_pause to update the interface
	 */
	pause: function() {
		var yt = this.getPlayerElement();
		yt.pauseVideo();
		this.parent_pause();
	},
	/**
	 * playerSwitchSource switches the player source working around a few bugs in browsers
	 *
	 * @param {object}
	 *            source Video Source object to switch to.
	 * @param {function}
	 *            switchCallback Function to call once the source has been switched
	 * @param {function}
	 *            doneCallback Function to call once the clip has completed playback
	 */
	playerSwitchSource: function( source, switchCallback, doneCallback ){
		
	},

	/**
	 * Issues a seek to the playerElement
	 *
	 * @param {Float}
	 *            percentage Percentage of total stream length to seek to
	 */
	seek : function(percentage) 
	{
		this.isInSeek = true;
		$( this ).trigger( 'seeking' );
		var yt = this.getPlayerElement();
		yt.seekTo( yt.getDuration() * percentage );
		this.controlBuilder.onSeek();
		
	},

	/**
	 * Issues a volume update to the playerElement
	 *
	 * @param {Float}
	 *            percentage Percentage to update volume to
	 */
	setPlayerElementVolume : function(percentage) {
//		if ( this.getPlayerElement() && this.playerElement.sendNotification ) {
//			this.playerElement.sendNotification('changeVolume', percentage);
//		}
		var yt = this.getPlayerElement();
		yt.setVolume(percentage*100);
	},

	/**
	 * function called by flash at set interval to update the playhead.
	 */
	onUpdatePlayhead : function( playheadValue ) {
		this.time = playheadValue;
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
//	onBytesDownloadedChange : function(data, id) {
//		this.bytesLoaded = data.newValue;
//		this.bufferedPercent = this.bytesLoaded / this.bytesTotal;
//
//		// Fire the parent html5 action
//		$( this ).trigger('progress', {
//			'loaded' : this.bytesLoaded,
//			'total' : this.bytesTotal
//		});
//	},

	/**
	 * Get the embed player time
	 */
	getPlayerElementTime : function() {
		// update currentTime
		return this.time;
	},

	/**
	 * Get the embed fla object player Element
	 */
	getPlayerElement : function() {
		return $('#' + this.pid)[0];
	}
};

} )( mediaWiki, jQuery );
