/*
 * The "kaltura player" embedPlayer interface for fallback h.264 and flv video format support
 */
( function( mw, $ ) { "use strict";

mw.EmbedPlayerYouTube = {

	// Instance name:
	instanceOf : 'youtube',

	bindPostfix: '.YouTube',

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

	/*
	 * Write the Embed html to the target
	 */
	embedPlayerHTML : function() {
		// youtbe src is at: this.mediaElement.selectedSource.getSrc()
		if( this.supportsFlash() ){
			// embed chromeless flash
		} else {
			// embed iframe ( native skin in iOS )
		}
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
		
	},

	/**
	 * play method calls parent_play to update the interface
	 */
	play: function() {
		
	},

	/**
	 * pause method calls parent_pause to update the interface
	 */
	pause: function() {
		
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
	seek : function(percentage) {
		
	},

	/**
	 * Issues a volume update to the playerElement
	 *
	 * @param {Float}
	 *            percentage Percentage to update volume to
	 */
	setPlayerElementVolume : function(percentage) {
		if ( this.getPlayerElement() && this.playerElement.sendNotification ) {
			this.playerElement.sendNotification('changeVolume', percentage);
		}
	},

	/**
	 * function called by flash at set interval to update the playhead.
	 */
	onUpdatePlayhead : function( playheadValue ) {
		//mw.log('Update play head::' + playheadValue);
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
		//mw.log('onBytesDownloadedChange');
		this.bytesLoaded = data.newValue;
		this.bufferedPercent = this.bytesLoaded / this.bytesTotal;

		// Fire the parent html5 action
		$( this ).trigger('progress', {
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
		this.playerElement = document.getElementById( this.pid );
		return this.playerElement;
	}
};

} )( mediaWiki, jQuery );
