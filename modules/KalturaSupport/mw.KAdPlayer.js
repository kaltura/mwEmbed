/**
* Supports the display of kaltura VAST ads. 
*/
( function( mw, $ ) {

	
mw.KAdPlayer = function( embedPlayer ) {
	// Create the KAdPlayer
	return this.init( embedPlayer );
};

mw.KAdPlayer.prototype = {

	// Ad tracking postFix: 
	trackingBindPostfix: '.AdTracking',

	// The local interval for monitoring ad playback: 
	adMonitorInterval: null,

	// Ad tracking flag:
	adTrackingFlag: false,
	
	// The click binding: 
	adClickPostFix :'.adClick',
	
	init: function( embedPlayer ){
		this.embedPlayer = embedPlayer;
	},
	
	/**
	 * Display a given adSlot
	 * once done issues the "displayDoneCallback"
	 * 
	 * @param {Object}
	 *          adSlot AdadSlot object
	 * @param {function}
	 *          displayDoneCallback The callback function called once the display
	 *          request has been completed
	 * @param {=number} 
	 * 			displayDuration optional time to display the insert useful 
	 * 			ads that don't have an inherent duration. 
	 */
	display: function( adSlot, displayDoneCallback, displayDuration ) {
		var _this = this;
		mw.log("KAdPlayer::display:" + adSlot.type + ' ads:' +  adSlot.ads.length );
		
		// Setup some configuration for done state:
		adSlot.doneFunctions = [];
		
		adSlot.playbackDone = function(){
			mw.log("KAdPlayer:: display: adSlot.playbackDone" );
			// remove click binding if present
			$( _this.embedPlayer ).unbind( 'click' + _this.adClickPostFix );
			// stop any ad tracking: 
			_this.stopAdTracking();
			
			// remove the video sibling ( used for ad playback )
			_this.restoreEmbedPlayer();
			
			// Remove notice if present: 
			$('#' + _this.embedPlayer.id + '_ad_notice' ).remove();
			// Remove skip button if present: 
			$('#' + _this.embedPlayer.id + '_ad_skipBtn' ).remove();
			
			while( adSlot.doneFunctions.length ){
				adSlot.doneFunctions.shift()();
			}
			adSlot.currentlyDisplayed = false;
			// give time for the end event to clear
			setTimeout(function(){
				if( displayDoneCallback ){
					displayDoneCallback();
				} 
			}, 0);
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

		
		// Start monitoring for display duration end ( if not supplied we depend on videoFile end )
		if( displayDuration ){
			// Monitor time for display duration display utility function
			var startTime = _this.getOriginalPlayerElement().currentTime;		
			this.monitorForDisplayDuration( adSlot, startTime, displayDuration );		
		} 
		
		// Check for videoFiles inserts:
		if ( adConf.videoFiles && adConf.videoFiles.length && adSlot.type != 'overlay' ) {
			this.displayVideoFile( adSlot, adConf );
		}

		// Check for companion ads:
		if ( adConf.companions && adConf.companions.length ) {
			this.displayCompanions(  adSlot, adConf, adSlot.type);
		}
		
		// Check for nonLinear overlays
		if ( adConf.nonLinear && adConf.nonLinear.length && adSlot.type == 'overlay' ) {
			this.displayNonLinear( adSlot, adConf );
		}		
		
		// Check if should fire any impression beacon(s) 
		if( adConf.impressions && adConf.impressions.length ){
			// Fire all the impressions
			for( var i =0; i< adConf.impressions.length; i++ ){
				mw.sendBeaconUrl( adConf.impressions[i].beaconUrl );
			}
		}
	},
	
	/**
	 * Used to monitor overlay display time
	 */
	monitorForDisplayDuration: function( adSlot, startTime, displayDuration ){
		var _this = this;
		// Local base video monitor function: 
		var vid = _this.getOriginalPlayerElement();
		// Stop display of overlay if video playback is no longer active
		if( typeof vid == 'undefined' || vid.currentTime - startTime > displayDuration ){
			mw.log( "KAdPlayer::display:" + adSlot.type + " Playback done because vid does not exist or > displayDuration " + displayDuration );
			adSlot.playbackDone();
		} else {
			setTimeout( function(){
				_this.monitorForDisplayDuration( adSlot, startTime, displayDuration );
			}, mw.getConfig( 'EmbedPlayer.MonitorRate' ) );
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
		var targetSource =  _this.embedPlayer.getCompatibleSource( adConf.videoFiles );
		if( !targetSource ){
			mw.log("KAdPlayer:: displayVideoFile> Error no adSlot video src ");
			adSlot.playbackDone();
			return ;
		}
		// Check for click binding 
		if( adConf.clickThrough ){	
			var clickedBumper = false;
			$( _this.embedPlayer ).bind( 'click' + _this.adClickPostFix, function(){
				// Show the control bar with a ( force on screen option for iframe based clicks on ads ) 
				_this.embedPlayer.controlBuilder.showControlBar( true );
				$( _this.embedPlayer ).bind( 'onplay' + _this.adClickPostFix, function(){
					$( _this.embedPlayer ).unbind( 'onplay' + _this.adClickPostFix );
					_this.embedPlayer.controlBuilder.restoreControlsHover();
				})
				// try to do a popup:
				if( ! clickedBumper ){
					clickedBumper = true;
					window.open( adConf.clickThrough );								
					return false;
				}
				return true;				
			});
		}
		// Play the ad as sibling to the current video element.
		if( _this.isVideoSiblingEnabled( targetSource ) ) {
			_this.playVideoSibling(	
				targetSource,
				function( vid ) {
					_this.addAdBindings( vid, adSlot, adConf );
				},
				function(){
					adSlot.playbackDone();
				} 
			);
		} else {
			_this.embedPlayer.switchPlaySource( 
				targetSource,
				function( vid ) {
					_this.addAdBindings( vid, adSlot, adConf );
				},
				function(){
					adSlot.playbackDone();
				}
			);
		}
	},
	/**
	 * Check if we can use the video sibling method or if we should use the fallback source swap. 
	 */
	isVideoSiblingEnabled: function( targetSource ){
		// if we have a target source use that to check for "image" and disable sibling video playback
		if( targetSource && targetSource.getMIMEType().indexOf('image/') != -1 ){
			return false;
		}
		// iPhone and IOS 5 does not play multiple videos well, use source switch
		if( mw.isIphone() || mw.isAndroid2() || ( mw.isIpad() && ! mw.isIpad3() ) ){
			return false;
		}
		return true;
	},
	addAdBindings: function( vid,  adSlot, adConf ){
		var _this = this;
		if( !vid ){
			mw.log("KAdPlayer:: Error: displayVideoFile no vid to bind" );
			return ;
		}
		// start ad tracking
		this.adTrackingFlag = true;
		mw.log("KAdPlayer:: source updated, add tracking");
		// Always track ad progress:
		if( vid.readyState > 0 ) {
			_this.addAdTracking( adConf.trackingEvents );
		} else {
			$( vid ).bind('loadedmetadata', function() {
				_this.addAdTracking( adConf.trackingEvents );
			});
		}
		var helperCss = {
			'position': 'absolute',
			'color' : '#FFF',
			'font-weight':'bold',
			'text-shadow': '1px 1px 1px #000'
		};
		// Check runtimeHelper 
		if( adSlot.notice ){
			var noticeId =_this.embedPlayer.id + '_ad_notice';
			// Add the notice target:
			_this.embedPlayer.$interface.append(
				$('<span />')
					.attr( 'id', noticeId )
					.css( helperCss )
					.css( 'font-size', '90%' )
					.css( adSlot.notice.css )
			);
			var localNoticeCB = function(){
				if( _this.adTrackingFlag ){
					var timeLeft = Math.round( vid.duration - vid.currentTime );
					if( isNaN( timeLeft ) ){
						timeLeft = '...';
					}
					// Evaluate notice text: 
					$('#' + noticeId).text(
						_this.embedPlayer.evaluate( adSlot.notice.evalText )
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
						$( _this.embedPlayer ).unbind( 'click' + _this.adClickPostFix );
						adSlot.playbackDone();
					})
			);
			// TODO move up via layout engine ( for now just the control bar )
			var bottomPos = parseInt( $('#' +skipId ).css('bottom') );
			if( !isNaN( bottomPos ) ){
				$('#' +skipId ).css('bottom', bottomPos + _this.embedPlayer.controlBuilder.getHeight() );
			}
		}
		// AD slot should include flag for progress monitoring ( for now always update playhead )
		var progressMonitor = function(){
			if( _this.adTrackingFlag ){
				_this.embedPlayer.controlBuilder.setStatus( 
						mw.seconds2npt( vid.currentTime ) + '/' + mw.seconds2npt( vid.duration ) 
				);
				_this.embedPlayer.updatePlayHead( vid.currentTime / vid.duration );
				setTimeout(progressMonitor,  mw.getConfig( 'EmbedPlayer.MonitorRate' ) )
			}
		}
		progressMonitor();
	},
	/**
	 * Display companion ads
	 * @param adSlot
	 * @param adConf
	 * @return
	 */
	displayCompanions:  function( adSlot, adConf, timeTargetType ){
		var _this = this;
		mw.log("KAdPlayer::displayCompanions: " + timeTargetType );
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
		_this.embedPlayer.triggerHelper( 'AdSupport_UpdateCompanion', [ companionObject ] );
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
				$( this ).parent().fadeOut('fast');
				return true;
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
	addAdTracking: function ( trackingEvents ){
		var _this = this;
		var videoPlayer = _this.getVideoElement();
		// unbind any existing adTimeline events
		$( videoPlayer).unbind(  _this.trackingBindPostfix );
		
		// Only send events once: 
		var sentEvents = {};
		
		// Function to dispatch a beacons:
		var sendBeacon = function( eventName, force ){
			if( sentEvents[ eventName ] && !force ){
				return ;
			} 
			sentEvents[ eventName ] = 1;
			if( trackingEvents ){
				// See if we have any beacons by that name: 
				for(var i =0;i < trackingEvents.length; i++){
					if( eventName == trackingEvents[ i ].eventName ){
						mw.log("KAdPlayer:: sendBeacon: " + eventName + ' to: ' + trackingEvents[ i ].beaconUrl );
						mw.sendBeaconUrl( trackingEvents[ i ].beaconUrl );
					}
				}
			}
		};
		
		// On end stop monitor / clear interval: 
		$( videoPlayer ).bind( 'ended' +  _this.trackingBindPostfix, function(){			
			sendBeacon( 'complete' );
			_this.stopAdTracking();
		});
		
		// On pause / resume: 
		$( videoPlayer ).bind( 'onpause' +  _this.trackingBindPostfix, function(){
			sendBeacon( 'pause', true );
		});
		
		// On resume: 
		$( videoPlayer ).bind( 'onplay' +  _this.trackingBindPostfix, function(){
			sendBeacon( 'resume', true );
		});
		
		var time = 0;
		// On seek backwards 
		$( videoPlayer ).bind( 'seek' +  _this.trackingBindPostfix, function(){
			if( videoPlayer.currentTime < time ){
				sendBeacon( 'rewind' );
			}
		});		

		// Set up a monitor for time events: 
		this.adMonitorInterval = setInterval( function(){
			// check that the video player is still available and we are still in an ad sequence:
			if( !videoPlayer || !_this.embedPlayer.sequenceProxy.isInSequence  ){
				_this.embedPlayer.adTimeline.updateSequenceProxy( 'timeRemaining', null );
				_this.embedPlayer.adTimeline.updateSequenceProxy( 'duration',  null );
				clearInterval( _this.adMonitorInterval );
			}
			time =  videoPlayer.currentTime;
			dur = videoPlayer.duration;
			
			// Update the timeRemaining sequence proxy
			_this.embedPlayer.adTimeline.updateSequenceProxy( 'timeRemaining', parseInt ( dur - time ) );
			_this.embedPlayer.adTimeline.updateSequenceProxy( 'duration',  dur );
			_this.embedPlayer.triggerHelper( 'AdSupport_AdUpdatePlayhead', time );
			
			// Check if isVideoSiblingEnabled and update the status bar 
			if( _this.isVideoSiblingEnabled() ) {
				var endTime = ( _this.embedPlayer.controlBuilder.longTimeDisp )? '/' + mw.seconds2npt( dur ) : '';
				_this.embedPlayer.controlBuilder.setStatus(
					mw.seconds2npt(	time ) + endTime
				);
				_this.embedPlayer.updatePlayHead( time / dur );
			}
			
			
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
	stopAdTracking: function(){
		var _this = this;
		this.adTrackingFlag = false;
		// stop monitor
		clearInterval( _this.adMonitorInterval );
		// clear any bindings 
		$(  _this.getVideoElement() ).unbind( _this.trackingBindPostfix );
	},
	/**
	 * Select a random element from the array and return it 
	 */
	selectFromArray: function( array ){
		return array[ Math.floor( Math.random() * array.length ) ];
	},
	playVideoSibling: function( source, playingCallback, doneCallback ){
		var _this = this;
		// Hide any loading spinner
		this.embedPlayer.hidePlayerSpinner();
		
		// include a timeout for the pause event to propagate
		setTimeout( function(){
			// make sure the embed player is "paused" 
			_this.getOriginalPlayerElement().pause();
			
			// Hide the current video:
			$( _this.getOriginalPlayerElement() ).hide();
			
			var vid = _this.getVideoAdSiblingElement();
			vid.src = source.getSrc();
			vid.load();
			vid.play();
			
			if( playingCallback ){
				playingCallback( vid );
			}
			if( doneCallback ){
				$( vid ).bind('ended', function(){
					doneCallback();
				})
			}
			
		}, 0);
	},
	restoreEmbedPlayer:function(){
		// remove the video sibling: 
		$( '#' + this.getVideoAdSiblingId() ).remove();
		// show the player: 
		$( this.getOriginalPlayerElement() ).show();
	},
	/**
	 * Get either the video sibling or the orginal player element depending on VideoSiblingEnabled
	 * or not. 
	 */
	getVideoElement:function(){
		if( this.isVideoSiblingEnabled() ) {
			return this.getVideoAdSiblingElement()
		} else {
			return this.getOriginalPlayerElement();
		}
	},
	getVideoAdSiblingElement: function(){
		var $vidSibling = $( '#' + this.getVideoAdSiblingId() );
		if( !$vidSibling.length ){			
			// check z-index of native player (if set ) 
			var zIndex = $( this.getOriginalPlayerElement() ).css('zindex');
			if( !zIndex ){
				$( this.getOriginalPlayerElement() ).css('z-index', 1 );
			}
			$vidSibling = $('<video />')
			.attr({
				'id' : this.getVideoAdSiblingId()
			})
			.css({
				'-webkit-transform-style': 'preserve-3d',
				'width' : '100%',
				'height': '100%'
			})
			$( this.embedPlayer ).append(
				$vidSibling
			);
		}
		return $vidSibling[0];
	},
	getVideoAdSiblingId: function(){
		return this.embedPlayer.pid + '_adSibling';
	},
	getOriginalPlayerElement: function(){
		return this.embedPlayer.getPlayerElement();
	}
}


} )( window.mw, window.jQuery );

	