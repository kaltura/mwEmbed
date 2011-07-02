/**
 * mw.MobilePlayerTimeline handles basic timelines of clips in the mobile
 * platform
 * 
 * AdTimeline is targets VAST as the display representation and its
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
 *            
 *            
 *            
 * AdConf object structure: 
 * {
 * 		// Set of ads to chose from
 * 		'ads' : [
 * 			{
 * 				'id' : { Add id}
 * 				'companions' : [
 * 					{
 * 						'id' : {Number} index of companion target 
 * 						'html' : {String} html text to set innerHTML of companion target
 * 					}
 * 				],
 * 				'duration' : {Number} duration of ad in seconds
 *
 * 				// Impression fired at start of ad display
 * 				'impressions': [
 * 					'beaconUrl' : {URL}
 * 				]
 * 
 *				// Tracking events sent for video playback
 * 				'trackingEvents' : [
 * 					beaconUrl : {URL}
 * 					eventName : {String} Event name per VAST definition of video ad playback ( start, midpoint, etc. )
 * 				]
 *				// NonLinear list of overlays
 * 				'nonLinear' : [
 * 					{
 * 						'width': {Number} width
 * 						'height': {Number} height
 * 						'html': {String} html
 * 					}
 * 				],
 * 				'clickThrough' : {URL} url to open when video is "clicked" 
 * 
 * 				'videoFiles' : {Object} of type {'src':{url to asset}, 'type': {content type of asset} } 
 * 			}
 * 		],
 *		// on screen helpers to display ad duration and skip add
 * 		'notice' : {
 * 			'text' : {String} "Ad countdown time, $1 is replaced with countdown time",
 * 			'css' : {Object} json object for css layout
 * 		}
 * 		'skipBtn' : {
 * 			'text' : {String} "Text of skip add link",
 * 			'css' : {Object} json object for css layout
 * 		}
 * 		// List of companion targets
 * 		'companionTargets' : [
 * 			{
 *	  			'elementid' : {String} id of element
 *	  			'height' : {Number} height of companion target
 *	  			'type' : {String} Companion target type ( html in mobile ) 
 *	  		}
 * 		]
 * }
 */
mw.addAdToPlayerTimeline = function( embedPlayer, timeType, adConf ) {
	mw.log("AdTimeline::Add \n\n" + timeType + ' \n\n dispCof:' + adConf + "\n\n\n");
	
	if (!embedPlayer.adTimeline) {
		embedPlayer.adTimeline = new mw.AdTimeline(embedPlayer);
	}
	embedPlayer.adTimeline.addToTimeline( timeType, adConf );
};

mw.AdTimeline = function(embedPlayer) {
	return this.init(embedPlayer);
};

mw.AdTimeline.prototype = {

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
	adOverlaysEnabled: true,

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
			
			mw.log( "AdTimeline:: First Play Start / bind Ad timeline" );

			// Disable overlays for preroll / bumper
			_this.adOverlaysEnabled = false;

			// Stop the native embedPlayer events so we can play the preroll
			// and bumper
			_this.embedPlayer.stopEventPropagation();
			
			// TODO read the add disable control bar to ad config and check that here. 
			_this.embedPlayer.disableSeekBar();
			
			var restorePlayer = function(){
				_this.embedPlayer.restoreEventPropagation();
				_this.embedPlayer.enableSeekBar();
				_this.embedPlayer.play();
			};
			

			// Chain display of preroll and then bumper:
			_this.display('preroll', function() {
				_this.display('bumper', function() {					
					var vid = _this.getNativePlayerElement();
					// Enable overlays ( for monitor overlay events )
					_this.adOverlaysEnabled = true;
					// Check if the src does not match original src if
					// so switch back and restore original bindings
					if ( _this.originalSrc != vid.src ) {
						_this.embedPlayer.switchPlaySrc(_this.originalSrc,
							function() {								
								mw.log( "AdTimeline:: restored original src:" + vid.src);
								// Restore embedPlayer native bindings 
								// async for iPhone issues
								setTimeout(function(){
									restorePlayer();
								},100);
							}
						);
					} else {
						restorePlayer();
					}
				});
			});
			
			// Bind the player "ended" event to play the postroll if present
			if( _this.timelineTargets['postroll'] ){
				var displayedPostroll = false;
				$j( _this.embedPlayer ).bind( 'ended', function(event){				
					if( displayedPostroll ){
						return ;
					}
					displayedPostroll = true;
					_this.embedPlayer.stopEventPropagation();
					mw.log('mw.AdTimeline: ended displayedPostroll');
					_this.embedPlayer.onDoneInterfaceFlag = false;
					
					// TODO read the add disable control bar to ad config and check that here. 
					_this.embedPlayer.disableSeekBar();
					_this.embedPlayer.monitor();
					_this.display( 'postroll' , function(){
						var postRollDone = function(){
							// Restore embedPlayer native bindings
							mw.log('Done with postroll ad, trigger normal ended');
							_this.embedPlayer.enableSeekBar();
							
							_this.embedPlayer.restoreEventPropagation();
							// Run stop for now. 
							_this.embedPlayer.stop();
							mw.log( " run video pause ");
							if( vid && vid.pause ){
								// Pause playback state
								vid.pause();							
								// iPhone does not catch synchronous pause
								setTimeout( function(){ if( vid && vid.pause ){ vid.pause(); } }, 100 );
							}
						};
						var vid = _this.getNativePlayerElement();
						if ( _this.originalSrc != vid.src) {							
							// Restore original source: 
							_this.embedPlayer.switchPlaySrc(_this.originalSrc, postRollDone	);
						} else {
							postRollDone();
						}
					});
				});
			}
						
			// See if we have overlay ads:
			if( _this.timelineTargets['overlay'] ){
				var overlayTiming = _this.timelineTargets['overlay'];
				var lastPlayEndTime = false;
				var playedStart = false;
				// Note there may be a better measurement of timeout
				var adDuration = overlayTiming.timeout;
				// Monitor:
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
						&& _this.adOverlaysEnabled
					){
						/*mw.log("SHOULD DISPLAY: " + time +' >= ' + overlayTiming.start + ' || ' + 
								lastPlayEndTime +' - ' + time + ' > ' + overlayTiming.frequency	);
						*/
						
						if( !playedStart){
							playedStart = true;
						}
						_this.adOverlaysEnabled = false;					
						
						// Display the overlay ad 
						_this.display( 'overlay' , function(){
							lastPlayEndTime = _this.embedPlayer.currentTime;
							_this.adOverlaysEnabled = true;
						}, adDuration);
					}
					
					//mw.log("SHOULD NOT display: adOver:" + _this.adOverlaysEnabled + ' time:' + time +' >= ' + overlayTiming.start + ' || ' + 
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
		mw.log("AdTimeline::display:" + timeTargetType );
		
		var displayTarget =  this.timelineTargets[ timeTargetType ];
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
		// Check that there are ads to display:
		if(!displayTarget.ads || displayTarget.ads.length == 0 ){
			displayDoneCallback();
			return;
		}
		var adConf = this.selectFromArray( displayTarget.ads );
		
		// If there is no display duration and no video files, issue the callback directly )
		// ( no ads to display )
		if( !displayDuration && ( !adConf.videoFiles || adConf.videoFiles.length == 0 ) ){
			displayDoneCallback();
			return;
		}
		
		// Setup the currentlyDisplayed flag: 
		if( !displayTarget.currentlyDisplayed ){
			displayTarget.currentlyDisplayed = true;
		}
		
		// Setup some configuration for done state:
		displayTarget.doneFunctions = [];
		displayTarget.playbackDone = function(){
			// Remove notice if present: 
			$j('#' + _this.embedPlayer.id + '_ad_notice' ).remove();
			// Remove skip button if present: 
			$j('#' + _this.embedPlayer.id + '_ad_skipBtn' ).remove();
			
			while( displayTarget.doneFunctions.length ){
				displayTarget.doneFunctions.shift()();
			}
			displayTarget.currentlyDisplayed = false;
			setTimeout(function(){
				displayTarget.doneCallback();
			}, 50);
		};
		
		// Setup local pointer to displayDoneCallback
		displayTarget.doneCallback = displayDoneCallback;

		// Monitor time for display duration display utility function
		var startTime = _this.getNativePlayerElement().currentTime;		
		var monitorForDisplayDuration = function(){
			var vid = _this.getNativePlayerElement();				
			if( typeof vid == 'undefined' // stop display of overlay if video playback is no longer active 
				|| ( _this.getNativePlayerElement().currentTime - startTime) > displayDuration )
			{
				mw.log("AdTimeline::display:" + timeTargetType + " Playback done because vid does not exist or > displayDuration " + displayDuration );
				displayTarget.playbackDone();
			} else {
				setTimeout( monitorForDisplayDuration, mw.getConfig( 'EmbedPlayer.MonitorRate' ) );
			}
		};
		
		// Start monitoring for display duration end ( if not supplied we depend on videoFile end )
		if( displayDuration ){
			monitorForDisplayDuration();		
		} 
		
		// Check for videoFiles inserts:
		if ( adConf.videoFiles && adConf.videoFiles.length && timeTargetType != 'overlay') {
			this.displayVideoFile( displayTarget, adConf );
		}

		// Check for companion ads:
		if ( adConf.companions && adConf.companions.length ) {
			this.displayCompanion(  displayTarget, adConf );
		};
		
		// Check for nonLinear overlays
		if ( adConf.nonLinear && adConf.nonLinear.length && timeTargetType == 'overlay') {
			this.displayNonLinear( displayTarget, adConf );
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
	 * Display a companion add
	 * @param displayTarget
	 * @param adConf
	 * @return
	 */
	displayVideoFile: function( displayTarget, adConf ){
		var _this = this;
		if ( adConf.lockUI ) {
			// TODO lock controls
			_this.getNativePlayerElement().controls = false;
		};						
		
		// Check for click binding 
		if( adConf.clickThrough ){	
			var clickedBumper = false;
			$j( _this.embedPlayer ).bind( 'click.ad', function(){
				// try to do a popup:
				if(!clickedBumper){
					clickedBumper = true;
					window.open( adConf.clickThrough );								
					return false;
				}
				return true;							
			});
		}

		// Play the source then run the callback
		_this.embedPlayer.switchPlaySrc( _this.embedPlayer.getCompatibleSource( adConf.videoFiles ), 
			function(vid) {
				mw.log("AdTimeline:: source updated, add tracking");
				// Bind all the tracking events ( currently vast based but will abstract if needed ) 
				if( adConf.trackingEvents ){
					_this.bindTrackingEvents( adConf.trackingEvents );
				}
				var helperCss = {
					'position': 'absolute',
					'color' : '#FFF',
					'font-weight':'bold',
					'text-shadow': '1px 1px 1px #000'
				};
				// Check runtimeHelper ( notices
				if( displayTarget.notice ){
					var noticeId =_this.embedPlayer.id + '_ad_notice';
					// Add the notice target:
					_this.embedPlayer.$interface.append( 
						$j('<span />')
							.attr('id', noticeId)
							.css( helperCss )
							.css('font-size', '90%')
							.css( displayTarget.notice.css )
					);
					var localNoticeCB = function(){
						if( vid && $j('#' + noticeId).length ){
							var timeLeft = Math.round( vid.duration - vid.currentTime );
							if( isNaN( timeLeft ) ){
								timeLeft = '...';
							}
							$j('#' + noticeId).text(
								displayTarget.notice.text.replace('$1', timeLeft)
							);
							setTimeout( localNoticeCB,  mw.getConfig( 'EmbedPlayer.MonitorRate' ) );
						}							
					};
					localNoticeCB();
				}
				
				// Check for skip add button
				if( displayTarget.skipBtn ){
					var skipId = _this.embedPlayer.id + '_ad_skipBtn';
					_this.embedPlayer.$interface.append(
						$j('<span />')
							.attr('id', skipId)
							.text( displayTarget.skipBtn.text )
							.css( helperCss )
							.css('cursor', 'pointer')
							.css( displayTarget.skipBtn.css )				
							.click(function(){
								$j( _this.embedPlayer ).unbind( 'click.ad' );	
								displayTarget.playbackDone();
							})
					);
					// TODO move up via layout engine ( for now just the control bar ) 
					var bottomPos = parseInt( $j('#' +skipId ).css('bottom') );
					if( !isNaN( bottomPos ) ){
						$j('#' +skipId ).css('bottom', bottomPos + _this.embedPlayer.controlBuilder.getHeight() );
					}
				}
				
			},
			function(){					
				// unbind any click ad bindings:
				$j( _this.embedPlayer ).unbind( 'click.ad' );					
				displayTarget.playbackDone();
			}
		);
	},
	/**
	 * Display a companion add
	 * @param displayTarget
	 * @param adConf
	 * @return
	 */
	displayCompanion:  function( displayTarget, adConf ){
		var _this = this;
		var companionConf = this.selectFromArray( adConf.companions );
		mw.log("AdTimeline::selectCompanion: " + companionConf.html );
		// NOTE:: is not clear from the ui conf response if multiple
		// targets need to be supported, and how you would do that
		var ctargets = this.timelineTargets[timeTargetType].companionTargets;
		var companionTarget = ctargets[ Math.floor(Math.random() * ctargets.length) ];
		
		
		if( companionTarget.elementid ){
			var originalCompanionHtml = $j('#' + companionTarget.elementid ).html();

			// Display the companion:
			$j( '#' + companionTarget.elementid ).html( companionConf.html );
			
			// Display the companion across the iframe client ( if setup );
			var companionObject = {
				'elementid' : companionTarget.elementid,
				'html' : companionConf.html
			};
			$j( _this.embedPlayer ).trigger( 'updateCompanionTarget', [ companionObject ] );
			
			// Once display is over restore the original companion html
			displayTarget.doneFunctions.push(function(){
				$j( '#' + companionTarget.elementid ).html( originalCompanionHtml );
			});
		} else {
			mw.log( "AdTimeline: possible error no elementid in companionTarget");
		}	
	},
	/**
	 * Display a nonLinier add ( like a banner overlay )
	 * @param displayTarget
	 * @param adConf
	 * @return
	 */
	displayNonLinear: function( displayTarget, adConf ){
		var _this = this;
		var overlayId =  _this.embedPlayer.id + '_overlay';
		var nonLinearConf = _this.selectFromArray( adConf.nonLinear ); 
		
		// Add the overlay if not already present: 
		if( $j('#' +overlayId ).length == 0 ){
			_this.embedPlayer.$interface.append(
				$j('<div />')					
				.css({
					'position':'absolute',
					'z-index' : 1
				})
				.attr('id', overlayId )				
			);
		}
		var layout = {
			'width' : nonLinearConf.width + 'px',
			'height' : nonLinearConf.height + 'px',
			'left' : '50%',
			'margin-left': -(nonLinearConf.width /2 )+ 'px'
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
		.html( nonLinearConf.html )
		.fadeIn('fast')
		.append(
			// Add a absolute positioned close button: 
			$j('<span />')
			.css({
				'top' : 0,
				'right' : 0,
				'position': 'absolute',
				'cursor' : 'pointer'
			})
			.addClass("ui-icon ui-icon-closethick")				
			.click(function(){
				$j(this).parent().fadeOut('fast');
			})
		);
		
		
		// Bind control bar display hide / show
		$j( _this.embedPlayer ).bind( 'onShowControlBar', function(event,  layout ){
			if( $j('#' +overlayId ).length )
				$j('#' +overlayId ).animate( layout, 'fast');
		});
		$j( _this.embedPlayer ).bind( 'onHideControlBar', function(event, layout ){
			if( $j('#' +overlayId ).length )
				$j('#' +overlayId ).animate( layout, 'fast');
		});
		
		// Only display the the overlay for allocated time:
		displayTarget.doneFunctions.push(function(){
			$j('#' +overlayId ).fadeOut('fast');
		});
		
	},
	
	/**
	 * bindVastEvent per the VAST spec the following events are supported:
	 *   
	 * start, firstQuartile, midpoint, thirdQuartile, complete
	 * pause, rewind, resume, 
	 * 
	 * VAST events not presently supported ( per iOS player limitations ) 
	 * 
	 * mute, creativeView, unmute, fullscreen, expand, collapse, 
	 * acceptInvitation, close
	 * 
	 * @param {object} trackingEvents
	 */	
	bindTrackingEvents: function ( trackingEvents ){
		var _this = this;
		var videoPlayer = _this.getNativePlayerElement();
		// Only send events once: 
		var sentEvents = {};
		
		// Function to dispatch a beacons:
		var sendBeacon = function( eventName, force ){
			if( sentEvents[ eventName ] && !force ){
				return ;
			} 
			sentEvents[ eventName ] = 1;
			// See if we have any beacons by that name: 
			for(var i =0;i < trackingEvents.length; i++){
				if( eventName == trackingEvents[ i ].eventName ){
					mw.log("kAds:: sendBeacon: " + eventName );
					mw.sendBeaconUrl( trackingEvents[ i ].beaconUrl );
				};
			};			
		};
				
		// On end stop monitor / clear interval: 
		$j( videoPlayer ).bind('ended', function(){			
			sendBeacon( 'complete' );
			clearInterval( monitorInterval );
		})
		
		// On pause / resume: 
		$j( videoPlayer ).bind( 'pause', function(){
			sendBeacon( 'pause' );
		});
		
		// On resume: 
		$j( videoPlayer ).bind( 'play', function(){
			sendBeacon( 'resume' );
		});
		
		var time = 0;
		// On seek backwards 
		$j( videoPlayer ).bind( 'seek', function(){
			if( videoPlayer.currentTime < time ){
				sendBeacon( 'rewind' );
			}
		});		

		// Set up a monitor for time events: 
		var monitorInterval = setInterval( function(){
			time =  videoPlayer.currentTime;
			dur = videoPlayer.duration;
			
			if( time > 0 )
				sendBeacon( 'start' );
				
			if( time > dur / 4 )
				sendBeacon( 'firstQuartile' );
			
			if( time > dur / 2 )
				sendBeacon( 'midpoint' );
			
			if( time > dur / 1.5 )
				sendBeacon( 'complete' );

		}, mw.getConfig('EmbedPlayer.MonitorRate') );		
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
	addToTimeline : function( timeType, adConf ) {
		// Validate the timeType
		if (typeof this.timelineTargets[ timeType ] != 'undefined') {
			// only one adConf per timeType
			this.timelineTargets[ timeType ] = adConf;
		}
	},
	
	/**
	 * Get a direct ref to the inDom video element
	 */
	getNativePlayerElement : function() {
		return this.embedPlayer.getPlayerElement();
	}
};
