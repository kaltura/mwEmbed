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
mw.addAdToPlayerTimeline = function( embedPlayer, timeType, adConf ) {
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
	timelineTargets: {
		preroll : false,
		bumper : false,
		overlay : false,
		postroll : false
	},

	// Overlays are disabled during preroll, bumper and postroll
	overlaysEnabled: true,

	// Original source of embedPlayer
	originalSrc: false,


	/**
	 * @constructor
	 * @param {Object}
	 *            EmbedPlayer The embedPlayer object
	 */
	init: function(embedPlayer) {
		this.embedPlayer = embedPlayer;
		// Bind to the "play" and "end"
		this.bindPlayer();
	},

	bindPlayer: function() {
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
					if ( _this.originalSrc != vid.src) {
						_this.embedPlayer.switchPlaySrc(_this.originalSrc,
							function() {								
								// Restore embedPlayer native
								// bindings
								_this.embedPlayer.restoreEventPropagation();
							}
						)
					}
				});
			});
			
			// Bind the player "ended" event to play the postroll if present
			if( _this.timelineTargets['postroll'] ){
				var displayedPostroll = false;
				$j( _this.embedPlayer ).bind( 'ended', function(event, onDoneActionObject){				
					if( displayedPostroll){
						return ;
					}					
					_this.embedPlayer.stopEventPropagation();
					mw.log('mw.MobileAdTimeline: ended displayedPostroll');
					onDoneActionObject.runBaseControlDone = false;
					
					_this.display( 'postroll' , function(){		
						var vid = _this.getNativePlayerElement();
						if ( _this.originalSrc != vid.src) {
							displayedPostroll = true;
							// Restore original source: 
							_this.embedPlayer.switchPlaySrc(_this.originalSrc, 
								function() {
									// Restore embedPlayer native
									// bindings
									mw.log('done with postroll ad, trigger normal ended');
									_this.embedPlayer.restoreEventPropagation();
									// just run stop for now. 
									_this.embedPlayer.stop();			
								}
							);
						};				
					});
				});
			}
			
			
			// See if we have overlay ads:
			if( _this.timelineTargets['overlay'] ){
				var overlayTiming = _this.timelineTargets['overlay'];
				var lastPlayEndTime = false;
				var playedStart = false;
				var adDuration = overlayTiming.nads;
				// Monitor will only be triggered while we are /NOT/ playback back media
				$j( _this.embedPlayer ).bind( 'monitorEvent', function() {					
					var time = _this.embedPlayer.currentTime;
					if( !lastPlayEndTime ){
						lastPlayEndTime = time;
					}
					if( ( 	
							( time >= overlayTiming.start && ! playedStart )
							||
							( time - lastPlayEndTime > overlayTiming.frequency && playedStart )
						)
						&& _this.overlaysEnabled 
					){
						//mw.log("SHOULD DISPLAY: " + time +' >= ' + overlayTiming.start + ' || ' + 
						//		lastPlayEndTime +' - ' + time + ' > ' + overlayTiming.frequency	);
						if( !playedStart){
							playedStart = true;
						}
						_this.overlaysEnabled = false;					
						// Display the overlay ad 
						_this.display( 'overlay' , function(){
							lastPlayEndTime = _this.embedPlayer.currentTime
							_this.overlaysEnabled = true;
						}, adDuration);
					}
					
					//mw.log("SHOULD NOT display: " + time +' >= ' + overlayTiming.start + ' || ' + 
					//		lastPlayEndTime +' - ' + time + ' > ' + overlayTiming.frequency	);
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
	display: function( timeTargetType, displayDoneCallback, displayDuration ) {
		var _this = this;
		mw.log("MobileAdTimeline::display:" + timeTargetType );			
		
		var displayTarget =  this.timelineTargets[ timeTargetType ] 
		
		// If the adConf is empty go directly to the callback:
		if ( ! displayTarget ) {
			displayDoneCallback();
			return;
		}

		// If the current ad type is already being displayed don't do anything
		if( displayTarget.currentlyDisplayed === true ){
			return ;
		}
		
		// If some other ad is currently displayed kill it
		for( var i in this.timelineTargets){
			if( i != timeTargetType 
				&&  this.timelineTargets[ i ].currentlyDisplayed == true ){
				this.timelineTargets[ i ].playbackDone();
			}
		}
		
		var adConf = this.selectFromArray( displayTarget.ads );		
		// setup the currentlyDisplayed flag: 
		if( !displayTarget.currentlyDisplayed ){
			displayTarget.currentlyDisplayed = true;
		}
		// Setup some configuration for done state:
		displayTarget.doneFunctions = [];
		displayTarget.playbackDone = function(){
			while( displayTarget.doneFunctions.length ){
				displayTarget.doneFunctions.shift()();
			}
			displayTarget.currentlyDisplayed = false;
			displayTarget.doneCallback();
		}
		// setup local pointer to displayDoneCallback
		displayTarget.doneCallback = displayDoneCallback;

		// Monitor time for display duration display utility function
		var startTime = _this.getNativePlayerElement().currentTime;		
		var monitorForDisplayDuration = function(){
			var vid = _this.getNativePlayerElement();				
			if( typeof vid == 'undefined' // stop display of overlay if video playback is no longer active 
				|| ( _this.getNativePlayerElement().currentTime - startTime) > displayDuration )
			{
				mw.log("MobileAdTimeline::display: Playback done because vid does not exist or > displayDuration " + displayDuration );
				displayTarget.playbackDone();
			} else {
				setTimeout( monitorForDisplayDuration, mw.getConfig( 'EmbedPlayer.MonitorRate' ) );
			}
		};
		// Start monitoring for display duration end ( if not supplied we depend on videoFile end )
		if( displayDuration ){
			monitorForDisplayDuration();
		}
		
		
		// Check for videoFile inserts:
		if ( adConf.videoFile && timeTargetType != 'overlay') {
			if ( adConf.lockUI ) {
				// TODO lock controls
				_this.getNativePlayerElement().controls = false;
			};
			// Play the source then run the callback
			_this.embedPlayer.switchPlaySrc( adConf.videoFile, function() { 
					// Pass off event handling to adConf bind:
					if (typeof adConf.bindPlayerEvents == 'function') {
						adConf.bindPlayerEvents( _this.getNativePlayerElement() );
					}
				}, 
				displayTarget.playbackDone
			);
		}
		// Check for companion ads:
		if ( adConf.companions && adConf.companions.length ) {
			var companionConf = this.selectFromArray( adConf.companions );

			// NOTE:: is not clear from the ui conf response if multiple
			// targets need to be supported, and how you would do that
			var ctargets = this.timelineTargets[timeTargetType].companionTargets;
			var companionTarget = ctargets[Math.floor(Math.random()
					* ctargets.length)];
			
			var originalCompanionHtml = $j('#' + companionTarget.elementid).html();
			
			// Display the companion:
			$j( '#' + companionTarget.elementid ).html( companionConf.$html );
			
			// Once display is over restore the original companion html
			displayTarget.doneFunctions.push(function(){
				$j( '#' + companionTarget.elementid ).html( originalCompanionHtml );
			});
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
				'left' : ( ( .5 * _this.embedPlayer.getWidth() ) - (nonLinearConf.width/2) ) + 'px'
			};			
			
			// check if the controls are visible ( @@todo need to replace this with 
			// a layout engine managed by the controlBuilder ) 
			if( _this.embedPlayer.$interface.find( '.control-bar' ).is(':visible') ){
				layout.bottom = (_this.embedPlayer.$interface.find( '.control-bar' ).height() + 10) + 'px';
			} else {
				layout.bottom = '10px';
			}
			
			// Show the overlay update its position and content
			$j('#' +overlayId )
			.css( layout )
			.html( nonLinearConf.$html )
			.fadeIn('fast')
			
			
			// Bind control bar display hide / show
			$j( _this.embedPlayer ).bind( 'onShowControlBar', function(event,  layout ){
				if( $j('#' +overlayId ).length )
					$j('#' +overlayId ).animate( layout, 'slow');
			});
			$j( _this.embedPlayer ).bind( 'onHideControlBar', function(event, layout ){
				if( $j('#' +overlayId ).length )
					$j('#' +overlayId ).animate( layout, 'slow');
			});
			
			// Only display the the overlay for allocated time:
			displayTarget.doneFunctions.push(function(){
				$j('#' +overlayId ).fadeOut('fast');
			});
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
	 * Get a direct ref to the inDom video element
	 */
	getNativePlayerElement : function() {
		return this.embedPlayer.getPlayerElement();
	}
}