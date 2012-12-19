( function( mw, $ ) { "use strict";

/* refrence players look like this: 
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
	'Tremor.acudeoUrl': 'http://demo.tremormedia.com/~jsoirefman/erb/compress/release/acudeo.html5.full.js'
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
			$.getScript( _this.getAdManagerUrl(), function(){
				_this.setupAds();
				callback();
			});
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
		TremorACUDEOWraper({
			player: embedPlayer.pid, //id passed here 
			banner: this.getConfig( 'banner' ), //for compandion banner div
			policy: this.getConfig( 'progId' ), //ad policy from acudeo onsole
			contentData: {
				id: embedPlayer.evaluate("{mediaProxy.entry.id}"),
				url: "http://url", // what do they want here? 
				title: embedPlayer.evaluate("{mediaProxy.entry.name}"),
				descriptionUrl: "http://descriptionurl", // does not really exist per entry. 
				description: embedPlayer.evaluate("{mediaProxy.entry.description}")
			}
		});
		embedPlayer.bindHelper('onpause', function(){
			$( embedPlayer.getPlayerElement() ).removeAttr( "controls" );
		});
		
		// bind player preSequence to trigger ACUDEO click
		embedPlayer.bindHelper( 'AdSupport_preroll' + _this.bindPostfix, function( event, sequenceProxy ){
			// Add Tremor to the sequence proxy:
			var doneWithPreroll = false;
			sequenceProxy[ _this.getSequenceIndex( 'preroll' ) ] = function( callback ){
				_this.currentAdCallback = callback;
				// no apparent api to trigger playback, and click event is async, so we need to .load
				$( _this.getAcudeoVid() )[0].load();
				// then call .click: 
				$('#click-to-play').click();
				// no API for what ad we are playing? assume preroll
				_this.currentAdSlotType = 'preroll';
				_this.startAd()

				// setup ad complete event:
				$( _this.getAcudeoVid() ).bind( 'ended' + _this.bindPostfix, function(){
					_this.stopAd()
					if( _this.currentAdSlotType == 'preroll' ){
						_this.currentAdSlotType = 'midroll';
					}
				});
				// No api for midrolls just listen for another play after preroll is done
				$( _this.getAcudeoVid() ).bind( 'play' + _this.bindPostfix, function(){
					if( _this.currentAdSlotType == 'midroll' ){
						_this.startAd();
					}
				});
			};
		})
	},
	startAd: function(){
		var _this = this;
		// Started add playback
		_this.embedPlayer.adTimeline.updateUiForAdPlayback( _this.currentAdSlotType );
		// start monitoring the ad:
		_this.monitorAd();
		// show the loading spinner until we start ad playback
		_this.embedPlayer.addPlayerSpinner();
		// remove width and height styles ( so it can inheret our videoHolder rules ) 
		_this.getAcudeoVid().style.cssText = '';
		
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
		return $( this.embedPlayer ).parent().find( 'video' ).not( '#' + this.embedPlayer.pid )[0];
	},
	monitorAd: function(){
		var _this = this;
		var embedPlayer = _this.embedPlayer
		// get the content video: 
		var vid = embedPlayer.getPlayerElement();
		// find the ad ( ACUDEO preAppends ) 
		var vidACUDEO = _this.getAcudeoVid()
		
		// apparently ACUDEO issues a .play on the target?  and blocks events?
		if( !vid.paused ){
			// ACUDEO adds controls to player :(
			$( _this.embedPlayer.getPlayerElement() ).removeAttr( 'controls' );
			vid.pause();
		}
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

function outputStatus(output)	{
	var demo_out = document.getElementById("demo_out");
	demo_out.scrollTop = demo_out.scrollHeight;
	
	console.log(output);
	demo_out.innerHTML += "<li>"+output+"</li>";
}
/*
 * Copy tremor TremorACUDEOWraper for local init
 */

function TremorACUDEOWraper(options) {
	var started = false;
	var player = document.getElementById(options.player);


	mw.log("Tremor: Acudeo HTML5 Player test \n\n");

	
	var acudeoOptions = {
		policy: options.policy,
		playerAttributes: {
			height: player.getAttribute("height").replace("px", ""),
			width: player.getAttribute("width").replace("px", "")
		},
		contentAttributes: {
			duration: player.duration
		},
		contentData: options.contentData
	};

	mw.log("Tremor: ACUDEO.init - called.");
	//acudeo init called
	ACUDEO.init(acudeoOptions, function() {
		mw.log("Tremor: ACUDEO.init executed");
		//initalizing using ad options. list ad options. post-init methods you want to run. list calls like content, contentdata
	});
		/**
		 * Policy and video content are loaded
		 */

	ACUDEO.addEventListener("AdStarted", function(info) {
		ACUDEO.mode("ad");

		mw.log("Tremor: ACUDEO.mode(\"ad\") - Acudeo Player in Ad mode.");
		mw.log("Tremor: AdStarted events recieved");
		/* listener for ad - after ad started, listen for these events... */

		var origSrc = player.getAttribute("src");

		/* listen to ended */
		mw.log("Tremor: Create event listener for ended event");
		player.addEventListener("ended", function() {
			mw.log("Tremor: ended event recieved");
			player.removeEventListener("ended", arguments.callee, false);
			ACUDEO.mode("content"); //from one common player
			
			mw.log("Tremor: ACUDEO.mode(\"content\") - Acudeo Player in content mode.");
			player.setAttribute("src", origSrc); //set content source
			player.load(); //load content from source attribute
			player.play(); //initiate playback
		}, false);


		mw.log("Tremor: Create event listener for durationchange");

		//this function is used only once. it is created then removed to capture duration variable at the end of video and update.
		player.addEventListener("durationchange", function() {
			mw.log("Tremor: Event for durationchange recieved");
			player.removeEventListener("durationchange", arguments.callee, false);
			ACUDEO.setAttribute("ad.duration", player.duration);
		}, false);
		mw.log("Tremor: Player duration time changed for Ad"); 
		
		player.setAttribute("src", info.video.url); //set source for ad video
		player.load(); //load ad content from source atrribute above

		mw.log("Tremor: Loaded ad content.");
		
		player.play(); //initiate playback of the ad
		mw.log("Tremor: Ad content is playing.");
	});

	/**
	 * Ad started
	 * Starts acudeo ad if it hasn't already
	 */
	mw.log("Tremor: Create event listener for ad/content video playback"); 
	player.addEventListener("play", function() {
		mw.log("Tremor: Play event recieved"); 
		//check started flag. if not true then assume starting ad. 
		if (!started) {
			ACUDEO.startAd(); //start ad with function will trigger the adstarted event
			mw.log("Tremor: Content video has started playing.");
			
		}

		started = true; //set started flag to true
	});

	//mw.log("Tremor: Create event listener for ad/content ended");
	player.addEventListener("ended", function() {
		if (ACUDEO.mode() == "content") {
			started = false;
			
			//mw.log("Tremor: End of video event recieved. Video is over.");
		}
	});
	
	mw.log("Tremor: Create event listener for timeupdate event"); 
	player.addEventListener("timeupdate", function(e) {
		//Uncomment the line below to view time updates in the demo
		//mw.log("Tremor: timeupdate event recieved: " + player.currentTime); 
		ACUDEO.setProgress(player.currentTime);
		
	});
}


} )( window.mw, window.jQuery );