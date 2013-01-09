/*
 * The "kaltura player" embedPlayer interface for fallback h.264 and flv video format support
 */
( function( mw, $ ) { "use strict";

// Called from the kdp.swf
window.jsInterfaceReadyFunc = function() {
	return true;
}

mw.EmbedPlayerKplayer = {

	// Instance name:
	instanceOf : 'youtube',

	bindPostfix: '.youTube',

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
	embedPlayerHTML : function() {
		$.getScript('//www.youtube.com/iframe_api', function(){
			
		});
	},

	// The number of times we have tried to bind the player
	bindTryCount : 0,

	/**
	 * javascript run post player embedding
	 */
	postEmbedActions : function() {
		var _this = this;
		this.getPlayerElement();
		if ( this.playerElement && this.playerElement.addJsListener ) {
			var bindEventMap = {
				'playerPaused' : 'onPause',
				'playerPlayed' : 'onPlay',
				'durationChange' : 'onDurationChange',
				'playerPlayEnd' : 'onClipDone',
				'playerUpdatePlayhead' : 'onUpdatePlayhead',
				'bytesTotalChange' : 'onBytesTotalChange',
				'bytesDownloadedChange' : 'onBytesDownloadedChange'
			};

			$.each( bindEventMap, function( bindName, localMethod ) {
				_this.bindPlayerFunction(bindName, localMethod);
			});
			this.bindTryCount = 0;
			// Start the monitor
			this.monitor();
		} else {
			this.bindTryCount++;
			// Keep trying to get the player element
			if( this.bindTryCount > 500 ){ // 5 seconds
				mw.log('Error:: KDP player never ready for bindings!');
				return ;
			}
			setTimeout(function() {
				_this.postEmbedActions();
			}, 100);
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
		mw.log( 'EmbedPlayerKplayer:: bindPlayerFunction:' + bindName );
		// The kaltura kdp can only call a global function by given name
		var gKdpCallbackName = 'kdp_' + methodName + '_cb_' + this.id.replace(/[^a-zA-Z 0-9]+/g,'');

		// Create an anonymous function with local player scope
		var createGlobalCB = function(cName, embedPlayer) {
			window[ cName ] = function(data) {
				// Track all events ( except for playerUpdatePlayhead )
				if( bindName != 'playerUpdatePlayhead' ){
					mw.log("EmbedPlayerKplayer:: event: " + bindName);
				}
				if ( embedPlayer._propagateEvents ) {
					embedPlayer[methodName](data);
				}
			};
		}(gKdpCallbackName, this);
		// Remove the listener ( if it exists already )
		this.playerElement.removeJsListener( bindName, gKdpCallbackName );
		// Add the listener to the KDP flash player:
		this.playerElement.addJsListener( bindName, gKdpCallbackName);
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
		// Update the duration ( only if not in url time encoding mode:
		if( !this.supportsURLTimeEncoding() ){
			this.duration = data.newValue;
			$(this).trigger('durationchange');
		}
	},

	/**
	 * play method calls parent_play to update the interface
	 */
	play: function() {
		if ( this.playerElement && this.playerElement.sendNotification ) {
			this.playerElement.sendNotification('doPlay');
		}
		this.parent_play();
	},

	/**
	 * pause method calls parent_pause to update the interface
	 */
	pause: function() {
		if (this.playerElement && this.playerElement.sendNotification) {
			this.playerElement.sendNotification('doPause');
		}
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
		var _this = this;
		var waitCount = 0;
		var src = source.getSrc();
		// Check if the source is already set to the target:
		if( !src || src == this.getSrc() ){
			if( switchCallback ){
				switchCallback();
			}
			setTimeout(function(){
				if( doneCallback )
					doneCallback();
			}, 100);
			return ;
		}

		var waitForJsListen = function( callback ){
			if(  _this.getPlayerElement() &&  _this.getPlayerElement().addJsListener ){
				callback();
			} else {
				// waited for 2 seconds fail
				if( waitCount > 20 ){
					mw.log( "Error: Failed to swtich player source!");
					if( switchCallback )
						switchCallback();
					if( doneCallback )
						doneCallback();
					return;
				}

				setTimeout(function(){
					waitCount++;
					waitForJsListen( callback );
				},100)
			}
		};
		// wait for jslistener to be ready:
		waitForJsListen( function(){
			var gPlayerReady = 'kdp_switch_' + _this.id + '_switchSrcReady';
			var gDoneName = 'kdp_switch_' + _this.id + '_switchSrcEnd';
			var gChangeMedia =  'kdp_switch_' + _this.id + '_changeMedia';
			window[ gPlayerReady ] = function(){
				mw.log("EmbedPlayerKplayer:: playerSwitchSource: " + src);
				// remove the binding as soon as possible ( we only want this event once )
				_this.getPlayerElement().removeJsListener( 'playerReady', gPlayerReady );

				_this.getPlayerElement().sendNotification("changeMedia", { 'entryId': src } );

				window[ gChangeMedia ] = function (){
					mw.log("EmbedPlayerKplayer:: Media changed: " + src);
					if( $.isFunction( switchCallback) ){
						switchCallback( _this );
						switchCallback = null
					}
					// restore monitor:
					_this.monitor();
				}
				// Add change media binding
				_this.getPlayerElement().removeJsListener('changeMedia', gChangeMedia);
				_this.getPlayerElement().addJsListener( 'changeMedia', gChangeMedia);

				window[ gDoneName ] = function(){
					if( $.isFunction( doneCallback ) ){
						doneCallback();
						doneCallback = null;
					}
				};
				_this.getPlayerElement().removeJsListener('playerPlayEnd', gDoneName);
				_this.getPlayerElement().addJsListener( 'playerPlayEnd', gDoneName);
			};
			// Remove then add the event:
			_this.getPlayerElement().removeJsListener( 'playerReady', gPlayerReady );
			_this.getPlayerElement().addJsListener( 'playerReady', gPlayerReady );
		});
	},

	/**
	 * Issues a seek to the playerElement
	 *
	 * @param {Float}
	 *            percentage Percentage of total stream length to seek to
	 */
	seek : function(percentage) {
		var _this = this;
		var seekTime = percentage * this.getDuration();
		mw.log( 'EmbedPlayerKalturaKplayer:: seek: ' + percentage + ' time:' + seekTime );
		if (this.supportsURLTimeEncoding()) {

			// Make sure we could not do a local seek instead:
			if (!(percentage < this.bufferedPercent
					&& this.playerElement.duration && !this.didSeekJump)) {
				// We support URLTimeEncoding call parent seek:
				this.parent_seek( percentage );
				return;
			}
		}
		// Add a seeked callback event:
		var seekedCallback = 'kdp_seek_' + this.id + '_' + new Date().getTime();
		window[ seekedCallback ] = function(){
			_this.seeking = false;
			$( this ).trigger( 'seeked' );
			if( seekInterval  ) {
				clearInterval( seekInterval );
			}
		};
		this.playerElement.addJsListener('playerSeekEnd', seekedCallback );

		if ( this.getPlayerElement() ) {
			// trigger the html5 event:
			$( this ).trigger( 'seeking' );

			// Issue the seek to the flash player:
			this.playerElement.sendNotification('doSeek', seekTime);

			// Include a fallback seek timer: in case the kdp does not fire 'playerSeekEnd'
			var orgTime = this.flashCurrentTime;
			var seekInterval = setInterval( function(){
				if( _this.flashCurrentTime != orgTime ){
					_this.seeking = false;
					clearInterval( seekInterval );
					$( this ).trigger( 'seeked' );
				}
			}, mw.getConfig( 'EmbedPlayer.MonitorRate' ) );

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
		mw.log('EmbedPlayerKplayer::doPlayThenSeek::');
		var _this = this;
		// issue the play request
		this.play();

		// let the player know we are seeking
		_this.seeking = true;
		$( this ).trigger( 'seeking' );

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
					mw.log('Error: doPlayThenSeek failed');
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
