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
 *            timeType Stores the target string can be 'preroll', 'bumper', 'overlay', 
 *            'midroll', 'postroll' 
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
( function( mw, $ ) {
	
mw.addAdTimeline = function( embedPlayer ){
	embedPlayer.adTimeline = new mw.AdTimeline( embedPlayer );
};

mw.AdTimeline = function(embedPlayer) {
	return this.init(embedPlayer);
};

mw.AdTimeline.prototype = {

	// Overlays are disabled during preroll, bumper and postroll
	adOverlaysEnabled: true,

	// Original source of embedPlayer
	originalSrc: false,

	// Flag to store if its the first time play is being called:
	firstPlay: true,
	
	bindPostfix: '.AdTimeline',

	/**
	 * @constructor
	 * @param {Object}
	 *            embedPlayer The embedPlayer object
	 */
	init: function(embedPlayer) {
		this.embedPlayer = embedPlayer;
		// Bind to the "play" and "end"
		this.bindPlayer();
	},

	bindPlayer: function() {
		var _this = this;
		var embedPlayer = this.embedPlayer;
		// Setup the original source
		_this.originalSrc = embedPlayer.getSrc();
		// Clear out any old bindings
		_this.destroy();
		// On change media clear out any old adTimeline bindings
		$( embedPlayer ).bind( 'onChangeMedia' + _this.bindPostfix, function(){
			_this.destroy();
		});
		
		$( embedPlayer ).bind( 'onplay' + _this.bindPostfix, function() {
			// Check if this is the "first play" request:
			if ( !_this.firstPlay ) {
				return ;
			}
			_this.firstPlay = false;
			
			mw.log( "AdTimeline:: First Play Start / bind Ad timeline" );

			// Disable overlays for preroll / bumper
			_this.adOverlaysEnabled = false;

			// Show prerolls:
			_this.displaySlots( 'preroll', function(){
				// Show bumpers:
				_this.displaySlots( 'bumper', function(){
					embedPlayer.switchPlaySrc( _this.originalSrc, function(){
						setTimeout(function(){ // avoid function stack
							_this.restorePlayer();
							// Continue playback
							embedPlayer.play();

							// Sometimes the player gets a pause event out of order be sure to "play" 
							setTimeout(function(){
								embedPlayer.play();
							}, 300 );
						},1);
					});
					
				});
			});
			
			// Bind the player "ended" event to play the postroll if present
			var displayedPostroll = false;
			// TODO We really need a "preend" event for thing like this. 
			// So that playlist next clip or other end bindings don't get triggered. 
			$( embedPlayer ).bind( 'ended' + _this.bindPostfix, function( event ){
				if( displayedPostroll ){
					return ;
				}
				displayedPostroll = true;
				embedPlayer.onDoneInterfaceFlag = false;
				_this.displaySlots( 'postroll', function(){
					/** TODO support postroll bumper and leave behind */
					embedPlayer.switchPlaySrc( _this.originalSrc, function(){
						_this.restorePlayer();
						// stop the playback: 
						embedPlayer.pause();
						// Restore ondone interface: 
						embedPlayer.onDoneInterfaceFlag = true;
						// run the clipdone event:
						embedPlayer.onClipDone();
					});
				});
			});
			
		});		
	},
	destroy: function(){
		var _this = this;
		// Reset firstPlay flag
		_this.firstPlay = true;
		// Unbind all adTimeline events
		$( _this.embedPlayer ).unbind( _this.bindPostfix );
	},
	/**
	 * Displays all the slots of a given set
	 * 
	 * @param slotSet
	 * @param doneCallback
	 * @return
	 */
	displaySlots: function( slotType, doneCallback ){
		var _this = this;
		var restorePlayerCallback = function(){
			_this.restorePlayer();
			doneCallback();
		};
		
		// Setup a sequence timeline set: 
		var sequenceProxy = {};
		
		// Get the sequence ad set
		$( _this.embedPlayer ).trigger( 'AdSupport_' + slotType,  [ sequenceProxy ]);
		
		// Generate a sorted key list:
		var keyList = [];
		$.each( sequenceProxy, function(k, na){
			keyList.push( k );
		});
		
		mw.log( "AdTimeline:: displaySlots: " + slotType + ' found: ' + keyList.length + ' ad callback slots' );
		
		// if don't have any ads issue the callback directly:
		if( !keyList.length ){
			doneCallback();
			return ;
		}
		
		// Update the interface for ads: 
		this.updateUiForAdPlayback();
		
		keyList.sort();
		var seqInx = 0;
		// Run each sequence key in order:
		var runSequeceProxyInx = function( seqInx ){
			var key = keyList[ seqInx ] ;
			if( !sequenceProxy[key] ){
				restorePlayerCallback();
				return ;
			}			
			// Run the sequence proxy function: 
			sequenceProxy[ key]( function(){
				// done with the current proxy call next
				seqInx++;
				// call with a timeout to avoid function stack
				setTimeout(function(){
					runSequeceProxyInx( seqInx );
				},1);
			});
		};
		runSequeceProxyInx( seqInx );
	},
	updateUiForAdPlayback: function( slotType ){
		// Stop the native embedPlayer events so we can play the preroll and bumper
		this.embedPlayer.stopEventPropagation();
		// TODO read the add disable control bar to ad config and check that here. 
		this.embedPlayer.disableSeekBar();
		// Trigger an event so plugins can get out of the way for ads:
		$( this.embedPlayer ).trigger( 'AdSupport_StartAdPlayback', slotType );
	},
	/**
	 * Restore a player from ad state
	 * @return
	 */
	restorePlayer: function( ){
		this.embedPlayer.restoreEventPropagation();
		this.embedPlayer.enableSeekBar();
		this.embedPlayer.monitor();
		this.embedPlayer.seeking = false;
		// trigger an event so plugins can restore their content based actions
		$( this.embedPlayer ).trigger( 'AdSupport_EndAdPlayback');
	},
	/**
	 * Display a given timeline target, if the timeline target affects the core
	 * video playback bindings, it will wait until the subclip completes before
	 * issuing the "displayDoneCallback"
	 * 
	 * @param {string}
	 *          adSlot AdadSlot type
	 * @param {function}
	 *          displayDoneCallback The callback function called once the display
	 *          request has been completed
	 * @param {=number} 
	 * 			displayDuration optional time to display the insert useful 
	 * 			ads that don't have an inherent duration. 
	 */
	display: function( adSlot, displayDoneCallback, displayDuration ) {
		var _this = this;
		mw.log("AdTimeline::display:" + adSlot.type + ' ads:' +  adSlot.ads.length );
		
		// Setup some configuration for done state:
		adSlot.doneFunctions = [];
		
		// Setup local pointer to displayDoneCallback
		adSlot.doneCallback = displayDoneCallback;
		
		adSlot.playbackDone = function(){
			// Remove notice if present: 
			$('#' + _this.embedPlayer.id + '_ad_notice' ).remove();
			// Remove skip button if present: 
			$('#' + _this.embedPlayer.id + '_ad_skipBtn' ).remove();
			
			while( adSlot.doneFunctions.length ){
				adSlot.doneFunctions.shift()();
			}
			adSlot.currentlyDisplayed = false;
			setTimeout(function(){
				adSlot.doneCallback();
			}, 50);
		};
		
		// If the current ad type is already being displayed don't do anything
		if( adSlot.currentlyDisplayed === true ){
			adSlot.playbackDone();
			return ;
		}
		
		// Check that there are ads to display:
		if (!adSlot.ads || adSlot.ads.length == 0 ){
			adSlot.playbackDone();
			return;
		}
		// Choose a given ad from the 
		var adConf = this.selectFromArray( adSlot.ads );
		
		// If there is no display duration and no video files, issue the callback directly )
		// ( no ads to display )
		if( !displayDuration && ( !adConf.videoFiles || adConf.videoFiles.length == 0 ) ){
			adSlot.playbackDone();
			return;
		}
		
		// Setup the currentlyDisplayed flag: 
		if( !adSlot.currentlyDisplayed ){
			adSlot.currentlyDisplayed = true;
		}

		// Monitor time for display duration display utility function
		var startTime = _this.getNativePlayerElement().currentTime;		
		var monitorForDisplayDuration = function(){
			var vid = _this.getNativePlayerElement();
			if( typeof vid == 'undefined' // stop display of overlay if video playback is no longer active 
				|| ( _this.getNativePlayerElement().currentTime - startTime) > displayDuration )
			{
				mw.log("AdTimeline::display:" + adSlot.type + " Playback done because vid does not exist or > displayDuration " + displayDuration );
				adSlot.playbackDone();
			} else {
				setTimeout( monitorForDisplayDuration, mw.getConfig( 'EmbedPlayer.MonitorRate' ) );
			}
		};
		
		// Start monitoring for display duration end ( if not supplied we depend on videoFile end )
		if( displayDuration ){
			monitorForDisplayDuration();		
		} 
		
		// Check for videoFiles inserts:
		if ( adConf.videoFiles && adConf.videoFiles.length && adSlot.type != 'overlay') {
			this.displayVideoFile( adSlot, adConf );
		}

		// Check for companion ads:
		if ( adConf.companions && adConf.companions.length ) {
			this.displayCompanions(  adSlot, adConf, adSlot.type);
		};
		
		// Check for nonLinear overlays
		if ( adConf.nonLinear && adConf.nonLinear.length && adSlot.type == 'overlay') {
			this.displayNonLinear( adSlot, adConf );
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
	 * Display a video slot
	 * @param adSlot
	 * @param adConf
	 * @return
	 */
	displayVideoFile: function( adSlot, adConf ){
		var _this = this;

		// check that we have a video to display: 
		var targetSrc =  _this.embedPlayer.getCompatibleSource( adConf.videoFiles );
		if( !targetSrc ){
			adSlot.playbackDone();
			return ;
		}
		if ( adConf.lockUI ) {
			_this.embedPlayer.disableSeekBar();
		};						
		
		// Check for click binding 
		if( adConf.clickThrough ){	
			var clickedBumper = false;
			$( _this.embedPlayer ).bind( 'click.ad', function(){
				// try to do a popup:
				if(!clickedBumper){
					clickedBumper = true;
					window.open( adConf.clickThrough );								
					return false;
				}
				return true;							
			});
		}
		// Stop event propagation: 
		_this.updateUiForAdPlayback( adSlot.type );
		
		// Play the source then run the callback
		_this.embedPlayer.switchPlaySrc( targetSrc, 
			function(vid) {
				if( !vid ){
					mw.log("AdTimeline:: Error: displayVideoFile no video in switchPlaySrc callback " );
					return ;
				}
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
				if( adSlot.notice ){
					var noticeId =_this.embedPlayer.id + '_ad_notice';
					// Add the notice target:
					_this.embedPlayer.$interface.append( 
						$('<span />')
							.attr('id', noticeId)
							.css( helperCss )
							.css('font-size', '90%')
							.css( adSlot.notice.css )
					);
					var localNoticeCB = function(){
						if( vid && $('#' + noticeId).length ){
							var timeLeft = Math.round( vid.duration - vid.currentTime );
							if( isNaN( timeLeft ) ){
								timeLeft = '...';
							}
							$('#' + noticeId).text(
								adSlot.notice.text.replace('$1', timeLeft)
							);
							setTimeout( localNoticeCB,  mw.getConfig( 'EmbedPlayer.MonitorRate' ) );
						}							
					};
					localNoticeCB();
				}
				// Check for skip add button
				if( adSlot.skipBtn ){
					var skipId = _this.embedPlayer.id + '_ad_skipBtn';
					_this.embedPlayer.$interface.append(
						$('<span />')
							.attr('id', skipId)
							.text( adSlot.skipBtn.text )
							.css( helperCss )
							.css('cursor', 'pointer')
							.css( adSlot.skipBtn.css )				
							.click(function(){
								$( _this.embedPlayer ).unbind( 'click.ad' );	
								adSlot.playbackDone();
							})
					);
					// TODO move up via layout engine ( for now just the control bar ) 
					var bottomPos = parseInt( $('#' +skipId ).css('bottom') );
					if( !isNaN( bottomPos ) ){
						$('#' +skipId ).css('bottom', bottomPos + _this.embedPlayer.controlBuilder.getHeight() );
					}
				}
				
			},
			function(){					
				// unbind any click ad bindings:
				$( _this.embedPlayer ).unbind( 'click.ad' );					
				adSlot.playbackDone();
			}
		);
	},
	/**
	 * Display companion ads
	 * @param adSlot
	 * @param adConf
	 * @return
	 */
	displayCompanions:  function( adSlot, adConf, timeTargetType ){
		var _this = this;
		mw.log("AdTimeline::displayCompanions: " + timeTargetType );
		// NOTE:: is not clear from the ui conf response if multiple
		// targets need to be supported, and how you would do that
		var companionTargets = adSlot.companionTargets;
		// Make sure we have some companion targets:
		if( ! companionTargets || !companionTargets.length ){
			return ;
		}
		// Store filledCompanion ids
		var filledCompanions = {};
		// Go though all the companions see if there are good companionTargets
		$.each( adConf.companions, function( inx, companion ){			
			// Check for matching size: 
			// TODO we should check for multiple matching size companions 
			// ( although VAST should only return one of matching type )
			$.each( companionTargets, function( cInx, companionTarget){
				if( companionTarget.width ==  companion.width && 
						companionTarget.height == companion.height )
				{			
					if( !filledCompanions[ companionTarget.elementid ]){
						_this.displayCompanion( adSlot, companionTarget, companion);
						filledCompanions[ companionTarget.elementid ] = true;
					}
				}
			});
		});
	},
	displayCompanion: function( adSlot, companionTarget, companion ){
		var _this = this;
		var originalCompanionHtml = $('#' + companionTarget.elementid ).html();
		// Display the companion if local to the page target:
		if( $( '#' + companionTarget.elementid ).length ){
			$( '#' + companionTarget.elementid ).html( companion.html );
		}
		
		// Display the companion across the iframe client
		var companionObject = {
			'elementid' : companionTarget.elementid,
			'html' : companion.html
		};
		$( _this.embedPlayer ).trigger( 'AdSupport_UpdateCompanion', [ companionObject ] );
		
	},
	/**
	 * Display a nonLinier add ( like a banner overlay )
	 * @param adSlot
	 * @param adConf
	 * @return
	 */
	displayNonLinear: function( adSlot, adConf ){
		var _this = this;
		var overlayId =  _this.embedPlayer.id + '_overlay';
		var nonLinearConf = _this.selectFromArray( adConf.nonLinear ); 
		
		// Add the overlay if not already present: 
		if( $('#' +overlayId ).length == 0 ){
			_this.embedPlayer.$interface.append(
				$('<div />')					
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
		$('#' +overlayId )
		.css( layout )
		.html( nonLinearConf.html )
		.fadeIn('fast')
		.append(
			// Add a absolute positioned close button: 
			$('<span />')
			.css({
				'top' : 0,
				'right' : 0,
				'position': 'absolute',
				'cursor' : 'pointer'
			})
			.addClass("ui-icon ui-icon-closethick")				
			.click(function(){
				$(this).parent().fadeOut('fast');
			})
		);
		
		
		// Bind control bar display hide / show
		$( _this.embedPlayer ).bind( 'onShowControlBar', function(event,  layout ){
			if( $('#' +overlayId ).length )
				$('#' +overlayId ).animate( layout, 'fast');
		});
		$( _this.embedPlayer ).bind( 'onHideControlBar', function(event, layout ){
			if( $('#' +overlayId ).length )
				$('#' +overlayId ).animate( layout, 'fast');
		});
		
		// Only display the the overlay for allocated time:
		adSlot.doneFunctions.push(function(){
			$('#' +overlayId ).fadeOut('fast');
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
		var bindPostfix = '.adTracking';
		// unbind any existing adTimeline events
		$( videoPlayer).unbind( bindPostfix );
		
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
		$( videoPlayer ).bind('ended' + bindPostfix, function(){			
			sendBeacon( 'complete' );
			// stop monitor
			clearInterval( monitorInterval );
			// clear any bindings 
			$( videoPlayer).unbind( bindPostfix);
		});
		
		// On pause / resume: 
		$( videoPlayer ).bind( 'pause' + bindPostfix, function(){
			sendBeacon( 'pause' );
		});
		
		// On resume: 
		$( videoPlayer ).bind( 'onplay' + bindPostfix, function(){
			sendBeacon( 'resume' );
		});
		
		var time = 0;
		// On seek backwards 
		$( videoPlayer ).bind( 'seek' + bindPostfix, function(){
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
				sendBeacon( 'thirdQuartile' );
			
		}, mw.getConfig('EmbedPlayer.MonitorRate') );		
	},
	/**
	 * Select a random element from the array and return it 
	 */
	selectFromArray: function( array ){
		return array[Math.floor(Math.random() * array.length)];
	},

	/**
	 * getTimelineTargets get list of timeline targets by type
	 *
	 * @param {string}
	 *            timeType
	 */
	getTimelineTargets: function( timeType ) {
		// Validate the timeType
		if (typeof this.timelineTargets[ timeType ] != 'undefined') {
			return this.timelineTargets[ timeType ];
		} else {
			return [];
		}
	},
	
	/**
	 * Get a direct ref to the inDom video element
	 */
	getNativePlayerElement : function() {
		return this.embedPlayer.getPlayerElement();
	}
};

} )( window.mw, jQuery );