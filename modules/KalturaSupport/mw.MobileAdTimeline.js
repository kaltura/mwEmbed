/**
 * mw.MobilePlayerTimeline handles basic timelines of clips in the mobile
 * platform
 * 
 * MobileAdTimeline is targets VAST as the display representation and its
 * timelineTargets support the VAST display types. Future updates may handle
 * more ad types and timeline targets.
 * 
 * in mobile html5 ( iOS ) to switch clips you have to do some trickery because
 * only one video tag can be active in the page:
 * 
 * Player src changes work with the following timeline: issuing a "src change"
 * then issue the "load" wait a few seconds then issue the "play" once restoring
 * the source we need to seek to parent offset position
 * 
 * 
 * @param {Object}
 *            embedPlayer the embedPlayer target ( creates a mobileTimeline
 *            controller on the embedPlayer target if it does not already exist )
 * @param {Object}
 *            timeType Stores the target string can be 'start', 'bumper', 'end',
 *            or 'overlay'->
 * @param {Object}
 *            adConf adConf object see
 *            mw.MobilePlayerTimeline.display
 */
mw.addAdToPlayerTimeline = function(embedPlayer, timeType, adConf) {
	mw.log("MobileAdTimeline::Add " + timeType + ' dispCof: ' + adConf);
	if (!embedPlayer.playerTimeline) {
		embedPlayer.playerTimeline = new mw.MobileAdTimeline(embedPlayer);
	}
	embedPlayer.playerTimeline.addToTimeline(timeType, adConf)
}

mw.MobileAdTimeline = function(embedPlayer) {
	return this.init(embedPlayer);
}

mw.MobileAdTimeline.prototype = {

	/**
	 * Display timeline targets: ( false by default)
	 */
	timelineTargets : {
		preroll : false,
		bumper : false,
		overlay : false,
		postroll : false
	},

	// Overlays are disabled during preroll, bumper and postroll
	overlaysEnabled : true,

	// Original source of embedPlayer
	originalSrc : false,

	// Flag to store if its the first time play is being called:
	firstPlay : true,

	/**
	 * @constructor
	 * @param {Object}
	 *            EmbedPlayer The embedPlayer object
	 */
	init : function(embedPlayer) {
		this.embedPlayer = embedPlayer;
		// Bind to the "play" and "end"
		this.bindPlayer();
	},

	bindPlayer : function() {
		var _this = this;
		// Setup the original source
		_this.originalSrc = _this.embedPlayer.getSrc();
		$j(_this.embedPlayer).bind('play', function() {

			// Check if this is the "first play" request:
				if (!_this.firstPlay) {
					return 

				}
				_this.firstPlay = false;
				mw.log("MobileAdTimeline:: First Play Start Ad timeline");

				// Disable overlays for preroll / bumper
				_this.overlaysEnabled = false;

				// Stop the native embedPlayer events so we can play the preroll
				// and bumper
				_this.embedPlayer.stopEventPropagation();

				// Chain display of preroll and then bumper:
				_this.display('preroll', function() {
					_this.display('bumper', function() {
						var vid = _this.getNativePlayerElement();
						// Enable overlays ( for monitor overlay events )
							_this.overlaysEnabled = true;

							// Check if the src does not match original src if
							// so switch back and restore original bindings
							if (_this.originalSrc != vid.src) {
								_this.switchPlaySrc(_this.originalSrc,
									function() {
											// Restore embedPlayer native
											// bindings:
										_this.embedPlayer
												.restoreEventPropagation();
									})
							}
						});
				});
			});
		
		// see if we have overlay ads:
		if( _this.timelineTargets['overlay'] ){
			var overlayTiming = _this.timelineTargets['overlay'];
			var lastPlayEndTime = 99999999999;
			var playedStart = false;
			// Monitor will only be triggered in core media player
			$j( _this.embedPlayer ).bind('monitorEvent', function() {
				var time = _this.embedPlayer.currentTime;
				if( ( 	( time >= overlayTiming.start && ! playedStart )
						||
						lastPlayEndTime - time > overlayTiming.frequency
					)
					&& _this.overlaysEnabled 
				){
					if( !playedStart){
						playedStart = true;
					}
					_this.overlaysEnabled = false;					
					// Display the overlay ad 
					_this.display( 'overlay' , function(){
						lastPlayEndTime = _this.embedPlayer.currentTime
						_this.overlaysEnabled = true;
					});
				}				
			});
		}
	},

	/**
	 * Display a given timeline target, if the timeline target affects the core
	 * video playback bindings, it will wait until the subclip completes before
	 * issuing the "doneCallback"
	 * 
	 * @param {string}
	 *            timeTargetType Identify what timeline type to be displayed.
	 *            Can be: preroll, bumper, overlay, postroll
	 * @param {function}
	 *            doneCallback The callback function called once the display
	 *            request has been completed
	 */
	display : function(timeTargetType, doneCallback) {
		var _this = this;
		mw.log("MobileAdTimeline::display:" + timeTargetType + ' val:'
				+ this.timelineTargets[timeTargetType]);

		// If the adConf is empty go directly to the callback:
		if ( ! this.timelineTargets[ timeTargetType ] ) {
			doneCallback();
			return;
		}
		var adConf = this.selectAd( this.timelineTargets[ timeTargetType ].ads );		
		
		// Check for videoFile inserts:
		if ( adConf.videoFile ) {
			if ( adConf.lockUI ) {
				// this actually does not work so well in iOS world:
				_this.getNativePlayerElement().controls = false;
			}
			;
			// Play the source then run the callback
			_this.switchPlaySrc(adConf.videoFile, function(videoElement) { 
				// Pass off event handling to adConf bind:
					if (typeof adConf.bindPlayerEvents == 'function') {
						adConf.bindPlayerEvents(videoElement)
					}
				}, doneCallback);
		}

		// Check for companion ads:
		if ( adConf.companions && adConf.companions.length ) {
			var companionConf = this.selectCompanion(adConf.companions);

			// NOTE:: is not clear from the ui conf response which or how or why
			// there are multiple
			// so this may not be needed:
			var ctargets = this.timelineTargets[timeTargetType].companionTargets;
			var companionTarget = ctargets[Math.floor(Math.random()
					* ctargets.length)];

			var originalCompanionHtml = $j('#' + companionTarget.elementid).html();
			
			// Display the companion:
			$j( '#' + companionTarget.elementid ).html( companionConf.$html );
		}
		
		// Check for overlays
		if ( adConf.companions && adConf.companions.length ) {
		
		// Check if should fire any impression beacon(s) 
		if( adConf.impressions && adConf.impressions.length ){
			// Fire all the impressions
			for( var i =0; i< adConf.impressions; i++ ){
				mw.sendBeaconUrl( adConf.impressions[i].beaconUrl );
			}
		}
	},
	/**
	 * Selects a companion config from the set of companions
	 * 
	 * @param {array}
	 *            companionSet
	 */
	selectCompanion : function(companionSet) {
		return companionSet[Math.floor(Math.random() * companionSet.length)];
	},
	
	/**
	 * Selects a sequence from available ad sets
	 * 
	 * @param {object}
	 *            displaySet
	 */
	selectAd : function( displaySet ) {
		return displaySet[ Math.floor( Math.random() * displaySet.length ) ];
	},

	/**
	 * addToTimeline adds a given display configuration to the timelineTargets
	 * 
	 * @param {string}
	 *            timeType
	 * @param {object}
	 *            adConf
	 */
	addToTimeline : function(timeType, adConf) {
		// Validate the timeType
		if (typeof this.timelineTargets[timeType] != 'undefined') {
			// only one adConf per timeType
			this.timelineTargets[timeType] = adConf;
		}
	},

	/**
	 * switchPlaySrc switches the player source working around a few bugs in
	 * browsers
	 * 
	 * @param {string}
	 *            src Video url Source to switch to.
	 * @param {function}
	 *            switchCallback Function to call once the source has been switched
	 * @param {function}
	 *            doneCallback Function to call once the clip has completed playback
	 */
	switchPlaySrc : function(src, switchCallback, doneCallback) {
		var _this = this;
		mw.log( 'MobileAdTimeline:: switchPlaySrc:' + src );
		var vid = this.getNativePlayerElement();
		if (vid) {
			try {
				// Remove all native player bindings
				$j(vid).unbind();
				vid.pause();
				// Local scope update source and play function to work around google chrome
				// bug
				var updateSrcAndPlay = function() {
					vid.src = src;
					// Give iOS 50ms to figure out the src got updated ( iPad OS 3.0 )
					setTimeout(function() {
						vid.load();
						vid.play();
						// Wait another 50ms then bind the end event and any custom events
						// for the switchCallback
							setTimeout(function() {
								$j(vid).bind('ended', function(event) {
									doneCallback();
								})
								if (typeof switchCallback == 'function') {
									switchCallback(vid);
								}
							}, 50);
						}, 50);
				};
				if (navigator.userAgent.toLowerCase().indexOf('chrome') != -1) {
					// Null the src and wait 50ms ( helps unload video without crashing
					// google chrome 7.x )
					vid.src = '';
					setTimeout(updateSrcAndPlay, 50);
				} else {
					updateSrcAndPlay();
				}
			} catch (e) {
				alert("Error: Error in swiching source playback");
			}
		}
	},
	/**
	 * Get a direct ref to the inDom video element
	 */
	getNativePlayerElement : function() {
		return this.embedPlayer.getPlayerElement();
	}
}