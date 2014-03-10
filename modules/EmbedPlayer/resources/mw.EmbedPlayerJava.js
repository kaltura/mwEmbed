( function( mw, $ ) { "use strict";
/**
* List of domains and hosted location of cortado. Lets clients avoid the security warning
* for cross domain java applet loading.
*/
window.cortadoDomainLocations = {
		'upload.wikimedia.org' : 'http://upload.wikimedia.org/jars/cortado.jar'
};

// Set the default location for CortadoApplet
mw.setDefaultConfig( 'relativeCortadoAppletPath', mw.getEmbedPlayerPath() + '/binPlayers/cortado/cortado-ovt-stripped-0.6.0.jar' );

mw.EmbedPlayerJava = {

	// Instance name:
	instanceOf: 'Java',

	// Supported feature set of the cortado applet:
	supports: {
		'playHead' : true,
		'pause' : true,
		'stop' : true,
		'fullscreen' : false,
		'timeDisplay' : true,
		'volumeControl' : false
	},

	/**
	* Output the the embed html
	*/
	embedPlayerHTML: function () {
		var _this = this;
		mw.log( "EmbedPlayerJava:: java play url:" + this.getSrc( this.seekTimeSec ) );

		mw.log( 'EmbedPlayerJava:: Applet location: ' +  this.getAppletLocation() );
		mw.log( 'EmbedPlayerJava:: Play media: ' + this.getSrc() );


		// load directly in the page..
		// ( media must be on the same server or applet must be signed )
		var appletCode = '' +
		'<applet id="' + this.pid + '" ' +
		'code="com.fluendo.player.Cortado.class" ' +
		'width="' + parseInt( this.getWidth() ) + '" ' +
		'height="' + parseInt( this.getVideoHolder().height() ) + '"	' +
		'archive="' + mw.absoluteUrl(  this.getAppletLocation() ) + '" >'+
			'<param name="url" value="' + mw.absoluteUrl( this.getSrc() ) + '" /> ' + "\n" +
			'<param name="local" value="false"/>' +
			'<param name="keepaspect" value="true" />' +
			'<param name="video" value="true" />' +
			'<param name="showStatus" value="hide" />' +
			'<param name="audio" value="true" />' +
			'<param name="seekable" value="true" />';

		// Add the duration attribute if set:
		if( this.getDuration() ){
			appletCode += '<param name="duration" value="' + parseFloat( this.getDuration() ) + '" />' + "\n";
		}

			appletCode += '<param name="BufferSize" value="4096" />' +
				'<param name="BufferHigh" value="25">' +
				'<param name="BufferLow" value="5">' +
			'</applet>';

		$( this ).html( appletCode );

		// Start the monitor:
		_this.monitor();
	},

	/**
	* Get the applet location
	*/
	getAppletLocation: function() {
		var mediaSrc = this.getSrc();
		var appletLoc = false;
		if (
			!mw.isLocalDomain( mediaSrc )
			||
			!mw.isLocalDomain( mw.getMwEmbedPath()
			||
			mw.getConfig( 'relativeCortadoAppletPath' ) === false )
		){
			if ( window.cortadoDomainLocations[ new mw.Uri( mediaSrc ).host ] ) {
				return window.cortadoDomainLocations[ new mw.Uri( mediaSrc ).host ];
			} else {
				return 'http://theora.org/cortado.jar';
			}
		} else {
			// Get the local relative cortado applet location:
			return mw.getConfig( 'relativeCortadoAppletPath' );
		}
	},

	/**
	* Get the embed player time
	*/
	getPlayerElementTime: function() {
		this.getPlayerElement();
		var currentTime = 0;
		if ( this.playerElement ) {
				try {
					// java reads ogg media time.. so no need to add the start or seek offset:
					//mw.log(' ct: ' + this.playerElement.getPlayPosition() + ' ' + this.supportsURLTimeEncoding());
					currentTime = this.playerElement.currentTime;
					// ( java cortado has -1 time ~sometimes~ )
					/*if ( this.currentTime < 0 ) {
						mw.log( 'pp:' + this.currentTime );
						// Probably reached clip ( should fire ondone event instead )
						this.onClipDone();
					}*/
				} catch ( e ) {
					mw.log( 'EmbedPlayerJava:: Could not get time from jPlayer: ' + e );
				}
		}else{
			mw.log("EmbedPlayerJava:: Could not find playerElement " );
		}
		return currentTime;
	},

	/**
	* Seek in the ogg stream
	* ( Cortado seek does not seem to work very well )
	* @param {Float} percentage Percentage to seek into the stream
	*/
	seek: function( percentage ) {
		mw.log( 'EmbedPlayerJava :: seek: p: ' + percentage + ' : ' + this.supportsURLTimeEncoding() + ' dur: ' + this.getDuration() + ' sts:' + this.seekTimeSec );
		this.getPlayerElement();

		if ( this.supportsURLTimeEncoding() ) {
			this.parent_seek( percentage );
		} else if ( this.playerElement ) {
			// do a (generally broken) local seek:
			mw.log( "EmbedPlayerJava:: seek is not very accurate :: seek::" + ( percentage * parseFloat( this.getDuration() ) ) );
			this.playerElement.currentTime = ( percentage * parseFloat( this.getDuration() ) );
		} else {
			this.doPlayThenSeek( percentage );
		}

		// Run the onSeeking interface update
		this.layoutBuilder.onSeek();
	},

	/**
	* Issue a play request then seek to a percentage point in the stream
	* @param {Float} percentage Percentage to seek into the stream
	*/
	doPlayThenSeek: function( percentage ) {
		mw.log( 'EmbedPlayerJava:: doPlayThenSeek' );
		var _this = this;
		this.play();
		var rfsCount = 0;
		var readyForSeek = function() {
			_this.getPlayerElement();
			// if we have .jre ~in theory~ we can seek (but probably not)
			if ( _this.playerElement ) {
				_this.seek( perc );
			} else {
				// try to get player for 10 seconds:
				if ( rfsCount < 200 ) {
					setTimeout( readyForSeek, 50 );
					rfsCount++;
				} else {
					mw.log( 'EmbedPlayerJava:: Error:doPlayThenSeek failed' );
				}
			}
		};
		readyForSeek();
	},

	/**
	* Update the playerElement instance with a pointer to the embed object
	*/
	getPlayerElement: function() {
		if( !$( '#' + this.pid ).length ) {
			return false;
		};
		this.playerElement = $( '#' + this.pid ).get( 0 );
		return this.playerElement;
	},

	/**
	* Issue the doPlay request to the playerElement
	*	calls parent_play to update interface
	*/
	play: function() {
		this.getPlayerElement();
		this.parent_play();
		if ( this.playerElement ) {
			try{
				this.playerElement.play();
			}catch( e ){
				mw.log("EmbedPlayerJava::Could not issue play request");
			}
		}
	},

	/**
	* Pause playback
	* 	calls parent_pause to update interface
	*/
	pause: function() {
		this.getPlayerElement();
		// Update the interface
		this.parent_pause();
		// Call the pause function if it exists:
		if ( this.playerElement ) {
			try{
				this.playerElement.pause();
			}catch( e ){
				mw.log("EmbedPlayerJava::Could not issue pause request");
			}
		}
	}
};

} )( window.mediaWiki, window.jQuery );