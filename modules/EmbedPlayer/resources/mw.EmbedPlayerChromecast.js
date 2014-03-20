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
        seeking: false,
        startOffset: 0,
        currentTime: 0,
        userSlide: false,

		setup: function( readyCallback ) {
			mw.log('EmbedPlayerChromecast:: Setup');
			var _this = this;
		},

		updatePlayhead: function (currentTime, duration) {
            this.currentTime = currentTime;
			if ( !this.seeking && !this.userSlide) {
                $(this).trigger("updatePlayHeadPercent",[ currentTime / duration ]);
                $( this ).trigger( 'timeupdate' );
			}
		},

		clipDone: function() {
            alert("clip done");
            /*
			$( this ).trigger( "onpause" );
			this.playerObject.pause();
			this.parent_onClipDone();
			//this.currentTime = this.slCurrentTime = 0;
			this.preSequenceFlag = false;*/
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
            console.log("seek "+percentage);
            this.seeking = true;
            $(this).trigger("chromecastSeek", [percentage * 100]);
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
            /*
		onUpdatePlayhead: function( playheadValue ) {
			if ( this.seeking ) {
				this.seeking = false;
			}
			//this.slCurrentTime = playheadValue;
			$( this ).trigger( 'timeupdate' );
		},
*/
		onPlayerSeekEnd: function () {
			$( this ).trigger( 'seeked' );
            this.seeking = false;
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
