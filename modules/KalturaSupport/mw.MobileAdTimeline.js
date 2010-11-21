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
		// Flag to store if its the first time play is being called:
		var firstPlay = true;
		$j(_this.embedPlayer).bind('play', function() {
			// Check if this is the "first play" request:
			if (!firstPlay) {
				return 
			}
			firstPlay = false;
			
			mw.log("MobileAdTimeline:: First Play Start / bind Ad timeline");

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
			
			// see if we have overlay ads:
			if( _this.timelineTargets['overlay'] ){
				var overlayTiming = _this.timelineTargets['overlay'];
				var lastPlayEndTime = false;
				var playedStart = false;
				var adDuration = overlayTiming.nads;
				// Monitor will only be triggered while we are /NOT/ playback back media
				$j( _this.embedPlayer ).bind('monitorEvent', function() {					
					var time = _this.embedPlayer.currentTime;
					if( !lastPlayEndTime ){
						lastPlayEndTime = time;
					}
					if( ( 	( time >= overlayTiming.start && ! playedStart )
							||
							lastPlayEndTime - time > overlayTiming.frequency
						)
						&& _this.overlaysEnabled 
					){
						mw.log("SHOULD DISPLAY: " + time +' >= ' + overlayTiming.start + ' || ' + 
								lastPlayEndTime +' - ' + time + ' > ' + overlayTiming.frequency	);
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
					
					mw.log("SHOULD NOT display: " + time +' >= ' + overlayTiming.start + ' || ' + 
							lastPlayEndTime +' - ' + time + ' > ' + overlayTiming.frequency	);
				});
			}
							
		});	
	},

	/**
	 * Display a given timeline target, if the timeline target affects the core
	 * video playback bindings, it will wait until the subclip completes before
	 * issuing the "doneCallback"
	 * 
	 * @param {string}
	 *          timeTargetType Identify what timeline type to be displayed.
	 *          Can be: preroll, bumper, overlay, postroll
	 * @param {function}
	 *          doneCallback The callback function called once the display
	 *          request has been completed
	 * @param {=number} 
	 * 			displayDuration optional time to display the insert useful 
	 * 			ads that don't have an inherent duration. 
	 */
	display : function( timeTargetType, doneCallback, displayDuration ) {
		var _this = this;
		mw.log("MobileAdTimeline::display:" + timeTargetType + ' val:'
				+ this.timelineTargets[timeTargetType]);

		// If the adConf is empty go directly to the callback:
		if ( ! this.timelineTargets[ timeTargetType ] ) {
			doneCallback();
			return;
		}
		var adConf = this.selectFromArray( this.timelineTargets[ timeTargetType ].ads );		
		
		
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
			var companionConf = this.selectFromArray(adConf.companions);

			// NOTE:: is not clear from the ui conf response if multiple
			// targets need to be supported, and how you would do that
			var ctargets = this.timelineTargets[timeTargetType].companionTargets;
			var companionTarget = ctargets[Math.floor(Math.random()
					* ctargets.length)];

			var originalCompanionHtml = $j('#' + companionTarget.elementid).html();
			
			// Display the companion:
			$j( '#' + companionTarget.elementid ).html( companionConf.$html );
		}
		
		// Check for nonLinear overlays
		if ( adConf.nonLinear && adConf.nonLinear.length ) {
			var overlayId =  _this.embedPlayer.id + '_overlay';
			var nonLinearConf = _this.selectFromArray( adConf.nonLinear ); 
			
			// Add the overlay if not already present: 
			if( $j('#' +overlayId ).length == 0 ){
				_this.embedPlayer.$interface.append( 
					$j('<div />')
					.css('position', 'absolute')
					.attr('id', overlayId )
				)
			}
			var layout = {
				'width' : nonLinearConf.width + 'px',
				'height' : nonLinearConf.height + 'px',
				'bottom' : '10px',
				'left' : ( ( .5 * _this.embedPlayer.getWidth() ) - (nonLinearConf.width/2) )+ 'px'
			};					
			// Show the overlay update its position and content
			$j('#' +overlayId )
			.css(layout)
			.html( nonLinearConf.$html )
			.fadeIn('fast')
			
			// Bind control bar display hide / show
			$j( _this.embedPlayer ).bind( 'showControlBar', function( layout ){
				mw.log("BINDE EVENT showControlBar ")
				$j('#' +overlayId ).animate( layout, 'slow');
				return false;
			});
			$j( _this.embedPlayer ).bind( 'hideControlBar', function( layout ){
				mw.log("BINDE EVENT hideControlBar ")
				$j('#' +overlayId ).animate( layout, 'slow');
				return false;
			});
			
			// Monitor time for display duration:
			var startTime = _this.getNativePlayerElement().currentTime;
			var monitorForOverlayDuration = function(){
				var vid = _this.getNativePlayerElement();				
				if( !vid // stop display of overlay if video playback is no longer active 
					|| ( _this.getNativePlayerElement().currentTime - startTime) > displayDuration )
				{
					$j('#' +overlayId ).fadeOut('fast');
					doneCallback();
				} else {
					setTimeout( monitorForOverlayDuration, mw.getConfig( 'EmbedPlayer.MonitorRate' ) );
				}
			};
			monitorForOverlayDuration();

		}
		
		// Check if should fire any impression beacon(s) 
		if( adConf.impressions && adConf.impressions.length ){
			// Fire all the impressions
			for( var i =0; i< adConf.impressions; i++ ){
				mw.sendBeaconUrl( adConf.impressions[i].beaconUrl );
			}
		}
	},
	
	/**
	 * Select a random element from the array and return it 
	 */
	selectFromArray: function( array ){
		return array[Math.floor(Math.random() * array.length)];
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