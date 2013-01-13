( function( mw, $ ) { "use strict";

/* reference  players look like this: 
 * 
 * <video id="player" width="400" height="300" preload="none"
					 src="http://demo.tremormedia.com/~agrant/html5test.mp4"> 
		</video> 
		
		<div class="compBanner" id="content_300"></div>
		
		<script type="text/javascript">
			ACUDEO.Player({player: "player",
					banner: "content_300",
					policy: "4fd898ffb18e7",
					contentData: {
					id: "id",
					url: "http://url",
					title: "title",
					descriptionUrl: "http://descriptionurl",
					description: "description"}
					});
		</script>
 */
// Set the Tremor config:
mw.setDefaultConfig({
	// The url for the ad Manager
	// for debugging we use the following AdManager url: 'http://localhost/html5.kaltura/mwEmbed/modules/Tremor/AdManager.js'
	'Tremor.acudeoUrl': 'http://objects.tremormedia.com/embed/sjs/acudeo.html5.js'
});

mw.Tremor = function( embedPlayer, callback ){
	return this.init( embedPlayer, callback );
};

mw.Tremor.prototype = {
	bindPostfix: '.tremor',
	
	// The current ad slot type:
	currentAdSlotType: null,
	
	init: function(  embedPlayer, callback){
		var _this = this;
		// Inherit BaseAdPlugin
		mw.inherit( this, new mw.BaseAdPlugin( embedPlayer, callback ) );

		// unbind any existing bindings:
		_this.embedPlayer.unbindHelper( _this.bindPostfix );
		// Load the Tremor ad manager then setup the ads
		if( !window['ACUDEO'] ){
			kWidget.appendScriptUrl( _this.getAdManagerUrl(), function(){
				_this.setupAds();
				callback();
			}, document );
		} else{
			_this.setupAds();
			callback();
		}
	},
	getAdManagerUrl: function(){
		return mw.getConfig( 'Tremor.acudeoUrl' );
	},
	setupAds: function(){
		var _this = this;
		var embedPlayer = this.embedPlayer;
		
		// add a hidden banner: 
		if( this.getConfig( 'banner' ) ){
			$('<div />')
				.attr('id', this.getConfig( 'banner' ) )
				.css({
					'position':'absolute',
					'top': '0px',
					'left': '-4048px',
					'width': '300px', 
					'height': '250px'
				})
				.appendTo( 'body' )
		}
		this.setupACUDEO();
		embedPlayer.bindHelper('onpause', function(){
			$( embedPlayer.getPlayerElement() ).removeAttr( "controls" );
		});
		
		// bind player preSequence to trigger ACUDEO
		embedPlayer.bindHelper( 'AdSupport_preroll' + _this.bindPostfix, function( event, sequenceProxy ){
			// Add Tremor to the sequence proxy:
			sequenceProxy[ _this.getSequenceIndex( 'preroll' ) ] = function( callback ){
				_this.currentAdCallback = callback;
				// no API for what ad we are playing? assume preroll
				_this.currentAdSlotType = 'preroll';
				_this.startAd()
			};
		});
		// bind player postSequence to trigger ACUDEO
		embedPlayer.bindHelper( 'AdSupport_postroll' + _this.bindPostfix, function( event, sequenceProxy ){
			// Add Tremor to the sequence proxy:
			sequenceProxy[ _this.getSequenceIndex( 'postroll' ) ] = function( callback ){
				_this.currentAdCallback = callback;
				// no API for what ad we are playing? assume postroll
				_this.currentAdSlotType = 'postroll';
				_this.startAd()
			};
		})
	},
	setupACUDEO: function(){
		var _this = this,
			embedPlayer = this.embedPlayer;
		
		// setup ACUDEO options:
		var acudeoOptions = {
			policy: this.getConfig( 'progId' ), //ad policy from acudeo onsole
			banner: this.getConfig( 'banner' ),
			playerAttributes: {
				height: embedPlayer.getHeight(),
				width: embedPlayer.getWidth()
			},
			contentAttributes: {
				duration: embedPlayer.getDuration()
			},
			contentData: {
				id: embedPlayer.evaluate("{mediaProxy.entry.id}"),
				url: embedPlayer.mediaElement.autoSelectSource().getSrc(), // content source url 
				title: embedPlayer.evaluate("{mediaProxy.entry.name}"),	
				descriptionUrl: document.URL, // page url? 
				description: embedPlayer.evaluate("{mediaProxy.entry.description}")
			}
		}
		mw.log("Tremor: Setup acudeoOptions ", acudeoOptions);
		
		ACUDEO.init(acudeoOptions, function() {
			mw.log("Tremor: ACUDEO.init executed");
			// initializing using ad options. list ad options. post-init methods you want to run. list calls like content, contentdata
		});
		/**
		 * Policy and video content are loaded
		 */
		ACUDEO.addEventListener("AdStarted", function( info ) {
			var vid = embedPlayer.getPlayerElement();
			ACUDEO.mode("ad");
			mw.log("Tremor: ACUDEO.mode(\"ad\") - Acudeo Player in Ad mode.");
			mw.log("Tremor: AdStarted events recieved");
			/* listener for ad - after ad started, listen for these events... */
			var origSrc = vid.getAttribute("src");
			/*vid.load();
			vid.src =  info.video.url;
			vid.play();
			setTimeout(function(){
				vid.play();
			},1000)*/
			var source = new mw.MediaSource( $('<source>').attr('src', info.video.url )[0] );
			embedPlayer.playerSwitchSource( source , function(){ 
				mw.log(" Tremor: durationchange recieved" );
				ACUDEO.setAttribute( "ad.duration", vid.duration );
				// Tremor switched source
				mw.log( "Tremor: Play ad content:" + info.video.url );
				vid.play();
			}, function(){
				mw.log("Tremor: ended event recieved");
				ACUDEO.mode("content"); //from one common player

				vid.setAttribute("src", origSrc); //set content source
				vid.load(); //load content from source attribute
				vid.play(); //initiate playback
				
				// issue the stop ad call:
				_this.stopAd();
				
				mw.log("Tremor: ACUDEO.mode(\"content\") - Acudeo Player in content mode.");
			});
		});
	},
	startAd: function(){
		var _this = this;
		mw.log("Tremor:: startAd: " +  _this.currentAdSlotType );
		// Send ACUDEO startAd event
		ACUDEO.startAd( _this.currentAdSlotType );
		// Started add playback
		_this.embedPlayer.adTimeline.updateUiForAdPlayback( _this.currentAdSlotType );
		// start monitoring the ad:
		_this.monitorAd();
		// show the loading spinner until we start ad playback
		_this.embedPlayer.addPlayerSpinner();
		// listen for playing
		$( _this.getAcudeoVid() ).bind( 'playing' + _this.bindPostfix, function(){
			// hide spinner:
			_this.embedPlayer.hideSpinnerAndPlayBtn();
		});
		
		var adPlay = false;
		$( _this.getAcudeoVid() ).bind( 'play' + _this.bindPostfix, function(){
			adPlay = true;
			// started ad playback check for banner and send content across the iframe
			if( $('#' + _this.getConfig( 'banner' ) ).html() != '' ){
				parent.document.getElementById( _this.getConfig( 'banner' ) ).innerHTML = 
					 $('#' + _this.getConfig( 'banner' ) ).html();
			}
		});
		var timeout = this.getConfig( 'timeout' ) || 10;
		setTimeout(function(){
			if( !adPlay ){
				// ad skip
				_this.stopAd( true );
			}
		}, timeout * 1000 )
	},
	stopAd: function( adSkip ){
		var _this = this;
		mw.log("Tremor:: stopAd, was skiped? " + adSkip );
		// remove true player: 
		// stop ad monitoring:
		_this.stopAdMonitor();
		// restore player:
		_this.embedPlayer.adTimeline.restorePlayer( _this.currentAdSlotType, !adSkip );
		// ACUDEO adds controls to player :(
		$( _this.embedPlayer.getPlayerElement() ).removeAttr( 'controls' );
		// Restore the player via adSequence callback:
		if( $.isFunction( _this.currentAdCallback ) ){
			_this.currentAdCallback();
			_this.currentAdCallback = null;
		}
	},
	getAcudeoVid: function(){
		//return $( this.embedPlayer ).parent().find( 'video' ).not( '#' + this.embedPlayer.pid )[0];
		// tremor now works with shared video element:
		return this.embedPlayer.getPlayerElement();
	},
	monitorAd: function(){
		var _this = this;
		var embedPlayer = _this.embedPlayer
		// find the ad ( ACUDEO preAppends ) 
		var vidACUDEO = _this.getAcudeoVid();
		// Give ACUDEO the video play time:  
		ACUDEO.setProgress( vidACUDEO.currentTime );
		
		// add some bindings to vidACUDEO
		if( vidACUDEO.currentTime && vidACUDEO.duration ){
			embedPlayer.adTimeline.updateSequenceProxy( 'timeRemaining',  vidACUDEO.currentTime -vidACUDEO.duration  );
			embedPlayer.adTimeline.updateSequenceProxy( 'duration', vidACUDEO.duration );
			
			embedPlayer.triggerHelper( 'AdSupport_AdUpdatePlayhead', vidACUDEO.currentTime );

			// TODO player interface updates should be configurable see Mantis 14076 and 14019
			embedPlayer.controlBuilder.setStatus(
				mw.seconds2npt( vidACUDEO.currentTime ) + '/' + mw.seconds2npt( vidACUDEO.duration )
			);
			// update ad playhead
			_this.embedPlayer.updatePlayHead( vidACUDEO.currentTime / vidACUDEO.duration );
		}
		_this.embedPlayer.sequenceProxy.isInSequence = true;

		// Keep monitoring ad progress at MonitorRate as long as ad is playing:
		if( !this.adMonitorInterval ){
			this.adMonitorInterval = setInterval( function(){
				_this.monitorAd();
			}, mw.getConfig( 'EmbedPlayer.MonitorRate' ) );
		}
	},
	stopAdMonitor: function(){
		window.clearInterval( this.adMonitorInterval );
		this.adMonitorInterval = 0;
	},
	getConfig: function( propId ){
		// return the attribute value
		return this.embedPlayer.getKalturaConfig( 'tremor', propId );
	},
}

} )( window.mw, window.jQuery );