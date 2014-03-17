/*
 * The "kaltura player" embedPlayer interface for fallback h.264 and flv video format support
 */
( function( mw, $ ) { "use strict";

	mw.EmbedPlayerChromecast = {
		// Instance name:
		instanceOf : 'Chromecast',
		bindPostfix: '.ccPlayer',
		// List of supported features:
		supports : {
			'playHead' : true,
			'pause' : true,
			'stop' : true,
			'volumeControl' : true
		},
		setup: function( readyCallback ) {
			mw.log('EmbedPlayerChromecast:: Setup');
			var _this = this;
		},

		updatePlayhead: function (currentTime, duration) {
			if ( this.seeking ) {
				this.seeking = false;
				//this.slCurrentTime = this.playerObject.currentTime;
                console.log("update playhead to"+currentTime);
			}
            $(this).trigger("updatePlayHeadPercent",[ currentTime / duration ]);
		},

		/**
		 * on Pause callback from the kaltura flash player calls parent_pause to
		 * update the interface
		 */
		onPause: function() {
			this.updatePlayhead();
			$( this ).trigger( "onpause" );
		},

		/**
		 * onPlay function callback from the kaltura flash player directly call the
		 * parent_play
		 */
		onPlay: function() {
            alert("onplay");
			this.updatePlayhead();
			$( this ).trigger( "playing" );
			this.hideSpinner();
			if ( this.seeking == true ) {
				this.onPlayerSeekEnd();
			}
			this.stopped = this.paused = false;
		},

		onClipDone: function() {
			$( this ).trigger( "onpause" );
			this.playerObject.pause();
			this.parent_onClipDone();
			//this.currentTime = this.slCurrentTime = 0;
			this.preSequenceFlag = false;
		},

		onAlert: function ( data, id ) {
			mw.log('EmbedPlayerChromecast::onAlert ' + data );
            alert("onAlert: "+data);
			/*
            var messageText = data;
			var dataParams = data.split(" ");
			if ( dataParams.length ) {
				var errorCode = dataParams[0];
				//DRM license related error has 6XXX error code
				if ( errorCode.length == 4 && errorCode.indexOf("6")==0 )  {
					messageText = gM( 'ks-NO-DRM-LICENSE' );
				}
			}

			this.layoutBuilder.displayAlert( { message: messageText, title: gM( 'ks-ERROR' ) } );*/
		},

		/**
		 * play method calls parent_play to update the interface
		 */
		play: function() {
            try {
                //this.playerObject.pause();
                $(this).trigger("chromecastPlay");
            } catch(e) {
                mw.log( "EmbedPlayerChromecast:: doPlay failed" );
            }
            this.parent_play();
            $(this).trigger("playing");
		},

		/**
		 * pause method calls parent_pause to update the interface
		 */
		pause: function() {
			try {
				//this.playerObject.pause();
                $(this).trigger("chromecastPause");
			} catch(e) {
				mw.log( "EmbedPlayerChromecast:: doPause failed" );
			}
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
            alert("playerSwitchSource");
            /*
			//we are not supposed to switch source. Ads can be played as siblings. Change media doesn't use this method.
			if( switchCallback ){
				switchCallback( this.playerObject );
			}
			setTimeout(function(){
				if( doneCallback )
					doneCallback();
			}, 100);*/
		},

		/**
		 * Issues a seek to the playerElement
		 *
		 * @param {Float}
		 *			percentage Percentage of total stream length to seek to
		 */
		seek: function(percentage) {
            alert("seek");
            /*
			var _this = this;
			var seekTime = percentage * this.getDuration();
			mw.log( 'EmbedPlayerKalturaSplayer:: seek: ' + percentage + ' time:' + seekTime );
			if (this.supportsURLTimeEncoding()) {

				// Make sure we could not do a local seek instead:
				if (!(percentage < this.bufferedPercent
					&& this.playerObject.duration && !this.didSeekJump)) {
					// We support URLTimeEncoding call parent seek:
					this.parent_seek( percentage );
					return;
				}
			}
			if ( this.playerObject.duration ) //we already loaded the movie
			{
				this.seeking = true;
				// trigger the html5 event:
				$( this ).trigger( 'seeking' );

				// Issue the seek to the flash player:
				this.playerObject.seek( seekTime );

				// Include a fallback seek timer: in case the kdp does not fire 'playerSeekEnd'
				var orgTime = this.slCurrentTime;
				this.seekInterval = setInterval( function(){
					if( _this.slCurrentTime != orgTime ){
						_this.seeking = false;
						clearInterval( _this.seekInterval );
						$( _this ).trigger( 'seeked' );
					}
				}, mw.getConfig( 'EmbedPlayer.MonitorRate' ) );
			} else if ( percentage != 0 ) {
				this.playerObject.play();
			}

			// Run the onSeeking interface update
			this.layoutBuilder.onSeek();*/
		},

		/**
		 * Issues a volume update to the playerElement
		 *
		 * @param {Float}
		 *			percentage Percentage to update volume to
		 */
		setPlayerElementVolume: function(percentage) {
            $(this).trigger("chromecastGetCurrentTime",[percentage]);
		},

		/**
		 * function called by flash at set interval to update the playhead.
		 */
		onUpdatePlayhead: function( playheadValue ) {
			if ( this.seeking ) {
				this.seeking = false;
			}
			//this.slCurrentTime = playheadValue;
			$( this ).trigger( 'timeupdate' );
		},

		onPlayerSeekEnd: function () {
			$( this ).trigger( 'seeked' );
			this.updatePlayhead();
			if( this.seekInterval  ) {
				clearInterval( this.seekInterval );
			}
		},

		onSwitchingChangeStarted: function ( data, id ) {
			$( this ).trigger( 'sourceSwitchingStarted' );
		},


		onSwitchingChangeComplete: function ( data, id ) {
			var value = JSON.parse( data );
            alert("onSwitchingChangeComplete");
            /*
			//fix a bug that old switching process finished before the user switching request and the UI was misleading
			if ( this.requestedSrcIndex!== null && value.newIndex !== this.requestedSrcIndex ) {
				return;
			}
			mw.log( 'EmbedPlayerKalturaSplayer: switchingChangeComplete: new index: ' +  value.newIndex);
			this.mediaElement.setSourceByIndex ( value.newIndex );*/
		}



		/*

		getSourceIndex: function( source ){
			var sourceIndex = null;
			$.each( this.mediaElement.getPlayableSources(), function( currentIndex, currentSource ) {
				if( source.getBitrate() == currentSource.getBitrate() ){
					sourceIndex = currentIndex;
					return false;
				}
			});
			if( sourceIndex == null ){
				mw.log( "EmbedPlayerChromecast:: Error could not find source: " + source.getSrc() );
			}
			return sourceIndex;
		},
		switchSrc: function ( source ) {
			if ( this.playerObject ) {
				var trackIndex = this.getSourceIndex( source );
				mw.log( "EmbedPlayerChromecast:: switch to track index: " + trackIndex);
				$( this ).trigger( 'sourceSwitchingStarted' );
				this.requestedSrcIndex = trackIndex;
				this.playerObject.selectTrack( trackIndex );
			}
		}*/

	}
} )( mediaWiki, jQuery );
