/**
* Supports the display of kaltura VAST ads.
*/
( function( mw, $ ) {"use strict";


mw.KAdPlayer = function( embedPlayer ) {
	// Create the KAdPlayer
	return this.init( embedPlayer );
};

mw.KAdPlayer.prototype = {

	// Ad tracking postFix:
	trackingBindPostfix: '.AdTracking',

	// The local interval for monitoring ad playback:
	adMonitorInterval: null,

	// Local interval for control bar timers
	adTimersInterval: null,

	// Ad tracking flag:
	adTrackingFlag: false,

	// The click binding:
	adClickPostFix :'.adClick',

	// General postFix binding
	displayPostFix: '.displayKAd',

	init: function( embedPlayer ){
		this.embedPlayer = embedPlayer;
	},

	/**
	 * Display a given adSlot
	 * once done issues the "displayDoneCallback"
	 *
	 * @param {Object}
	 *		  adSlot AdadSlot object
	 * @param {function}
	 *		  displayDoneCallback The callback function called once the display
	 *		  request has been completed
	 * @param {=number}
	 * 			displayDuration optional time to display the insert useful
	 * 			ads that don't have an inherent duration.
	 */
	display: function( adSlot, displayDoneCallback, displayDuration ) {
		var _this = this;
		mw.log("KAdPlayer::display:" + adSlot.type + ' ads:' +  adSlot.ads.length );
		
		_this.embedPlayer.controlBuilder.removePlayerTouchBindings();

		// Setup some configuration for done state:
		adSlot.doneFunctions = [];
		// set skip offset from config for all adds if defined 
		if( _this.embedPlayer.getKalturaConfig( 'vast', 'skipOffset' ) ){
			for( var i=0; i < adSlot.ads.length; i++ ){
				adSlot.ads[i].skipoffset =  _this.embedPlayer.getKalturaConfig( 'vast', 'skipOffset' );
			}
		}

		adSlot.playbackDone = function(){
			mw.log("KAdPlayer:: display: adSlot.playbackDone" );
			// remove click binding if present
			$( _this.embedPlayer ).unbind( 'click' + _this.adClickPostFix );
			// stop any ad tracking:
			_this.stopAdTracking();
			// Remove notice if present:
			$('#' + _this.embedPlayer.id + '_ad_notice' ).remove();
			// Remove skip button if present:
			$('#' + _this.embedPlayer.id + '_ad_skipBtn' ).remove();
			//Remove skip notice if present:
			$('#' + _this.embedPlayer.id + '_ad_skipNotice' ).remove();
			//Remove icon if present
			$('#' + _this.embedPlayer.id + '_icon' ).remove();

			adSlot.adIndex++;
			//last ad in ad sequence
			if ( !adSlot.sequencedAds || adSlot.adIndex == adSlot.ads.length ) {
				// remove the ad play button ( so that it can be updated with content play button ) 
				if( _this.embedPlayer.isImagePlayScreen() ){
					_this.embedPlayer.getInterface().find( '.play-btn-large' ).remove()
				}
			
				// if a preroll rewind to start:
				if( adSlot.type == 'preroll' ){
					 _this.embedPlayer.setCurrentTime( .01);
				}

				// Restore overlay if hidden:
				if( $( '#' + _this.getOverlayId() ).length ){
					$( '#' + _this.getOverlayId() ).show();
				}

				// remove the video sibling ( used for ad playback )
				_this.restoreEmbedPlayer();
			
				_this.embedPlayer.controlBuilder.addPlayerTouchBindings();
				
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
			} else { //display next ad in sequence
			   _this.playNextAd(adSlot);
			}
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

		//only if ads have "sequence" attribute we will play a few ads in sequence
		// otherwise, select a single random ad to play
		adSlot.sequencedAds = false;
		//sort ads by "sequence" value in ascending manner
		adSlot.ads = adSlot.ads.sort ( function (a,b){
			if ( typeof a['sequence'] === 'undefined' ){
				return -1;
			}
			//if at least one ad has "sequence" attribute, we will play sequenced ads
			adSlot.sequencedAds = true;
			
			if ( typeof b['sequence'] === 'undefined' ){
				return 1;
			}
			return a.sequence - b.sequence;
		});
		
		//no sequenced ads: select a random single ad
		if ( !adSlot.sequencedAds ){
			adSlot.adIndex = Math.floor( Math.random() * adSlot.ads.length );
		} else {
			//find the ad index to start play from: first ad with "sequence" attribute
			for ( var i=0; i<adSlot.ads.length; i++ ){
				if (typeof adSlot.ads[i]['sequence'] !== 'undefined') {
					adSlot.adIndex = i;
					break;
				}
			}
		}
		adSlot.displayDuration = displayDuration;
		this.playNextAd( adSlot );
	},
	/**
	 * Plays next ad in the adSlot, according to the adIndex position
	 **/
	playNextAd: function( adSlot ) {
		//get the next ad
		var adConf = adSlot.ads[adSlot.adIndex];
		var _this = this;
		var vpaidFound = false;
		//we have vpaid object
		if (adConf.vpaid && adConf.vpaid.src)
		{
			_this.playVPAIDAd(adConf,adSlot);
			vpaidFound = true;
		}
		 // If there is no display duration and no video files, issue the callback directly )
		// ( no ads to display )
		if( !vpaidFound && !adSlot.displayDuration && ( !adConf.videoFiles || adConf.videoFiles.length == 0 ) ){
			adSlot.playbackDone();
			return;
		}

		// Setup the currentlyDisplayed flag:
		if( !adSlot.currentlyDisplayed ){
			adSlot.currentlyDisplayed = true;
		}

		// Start monitoring for display duration end ( if not supplied we depend on videoFile end )
		if( adSlot.displayDuration  ){
			// Monitor time for display duration display utility function
			var startTime = _this.getOriginalPlayerElement().currentTime;
			this.monitorForDisplayDuration( adSlot, startTime, adSlot.displayDuration );
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
	},
	fireImpressionBeacons: function( adConf ) {
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
		this.addClickthroughSupport( adConf );

		// hide any ad overlay
		$( '#' + this.getOverlayId() ).hide();
		
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
			_this.embedPlayer.playInterfaceUpdate();
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
		
		// Add icon, if exists
		if ( adConf.icons.length ) {
			//TODO: understand how to select the icon
			var icon = adConf.icons[0];
			//get offset, if set
			icon.offsetInSecs = 0;
			if ( typeof icon.offset !== 'undefined' ){
				icon.offsetInSecs = this.getTimeInSeconds( icon.offset );
			}
			 
			//get duration, if set
			icon.durationInSecs = 0;
			if ( typeof icon.duration !== 'undefined' ){
				icon.durationInSecs = this.getTimeInSeconds( icon.duration ) +  icon.offsetInSecs;
			}
			
			var iconId = _this.embedPlayer.id + '_icon';
			// Add the overlay if not already present:
			if( $('#' +iconId ).length == 0 ){
				_this.embedPlayer.getVideoHolder().append(
					$('<div />')
					.css({
						'position':'absolute',
						'bottom': '10px',
						'z-index' : 2
					})
					.attr('id', iconId )
				);
			}
			
			var layout = {
				'width' : icon.width + 'px',
				'height' : icon.height + 'px'
			};
			 
			 switch ( icon.xPosition ) {
				 case 'left':
					 layout.left = '0px';
				 break;
				 case 'right':
					 layout.right = '0px';
				 break; 
				 default:
					  layout.left = icon.xPosition + 'px';
			 }
			 
			switch ( icon.yPosition ) {
				case 'top':
					layout.top = '0px';
				break;
				case 'bottom':
					layout.bottom = '0px';
				break;
				default:
					layout.top = icon.yPosition + 'px';
			 }
			 //no source was set - set it now
			 this.setImgSrc( icon );

			// Show the icon and update its position and content
			$('#' + iconId )
			.css( layout )
			.html( icon.html );
			
			if ( icon.clickthru ) {
				$( '#' + iconId ).click(function(){
					window.open( icon.clickthru );
					mw.sendBeaconUrl( icon.clickTracking );
					return true;
				});
			}

			if ( icon.offsetInSecs ){
				$('#' + iconId ).hide();
			} else if ( icon.viewTracking ){
				mw.sendBeaconUrl( icon.viewTracking );
			}
			
			adConf.selectedIcon = icon;		
		}
		// Fire Impression
		this.fireImpressionBeacons( adConf );
	},

	addClickthroughSupport:function( adConf ){
		var _this = this;
		// Check for click binding
		if( adConf.clickThrough ){
			var clickedBumper = false;
			// add click binding in setTimeout to avoid race condition,
			// where the click event is added to the embedPlayer stack prior to
			// the event stack being exhausted.
			setTimeout( function(){
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
						 //expose the URL to the
						 _this.embedPlayer.sendNotification( 'adClick', {url: adConf.clickThrough} );
						window.open( adConf.clickThrough );
						return false;
					}
					return true;
				});
			}, 500 );
		}
	}   ,
	/**
	 * Check if we can use the video sibling method or if we should use the fallback source swap.
	 */
	isVideoSiblingEnabled: function( targetSource ){
		// if we have a target source use that to check for "image" and disable sibling video playback
		if( targetSource && targetSource.getMIMEType().indexOf('image/') != -1 ){
			return false;
		}
		// iPhone and IOS 5 does not play multiple videos well, use source switch
		if( mw.isIphone() || mw.isAndroid2() || mw.isAndroid40() || mw.isMobileChrome() 
				|| 
			( mw.isIpad() && ! mw.isIpad3() ) 
		){
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
		// update the current ad slot: 
		this.currentAdSlot = adSlot;
		// start ad tracking
		this.adTrackingFlag = true;
		
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
			_this.embedPlayer.getVideoHolder().append(
				$('<span />')
					.attr( 'id', noticeId )
					.css( helperCss )
					.css( 'font-size', '90%' )
					.css( adSlot.notice.css )
			);
			var localNoticeCB = function(){
				if( _this.adTrackingFlag ){
					// Evaluate notice text:
					$('#' + noticeId).text(
						_this.embedPlayer.evaluate( adSlot.notice.evalText )
					);
					setTimeout( localNoticeCB,  mw.getConfig( 'EmbedPlayer.MonitorRate' ) );
				}
			};
			localNoticeCB();
		}
		
		// if skipoffset is in percentage, this will hold the value
		var skipPercentage = 0;
		// holds the value of skipoffset in seconds
		var skipOffsetInSecs = 0;
		// Check for skip add button
		if( adSlot.skipBtn ){
			var skipId = _this.embedPlayer.id + '_ad_skipBtn';
			_this.embedPlayer.getVideoHolder().append(
				$('<span />')
					.attr('id', skipId)
					.text( adSlot.skipBtn.text )
					.css( helperCss )
					.css('cursor', 'pointer')
					.css( adSlot.skipBtn.css )
					.click(function(){
						$( _this.embedPlayer ).unbind( 'click' + _this.adClickPostFix );
						_this.skipCurrent();
						$( _this.embedPlayer).trigger( 'onAdSkip' );
					})
			);
			if ( typeof adConf.skipoffset !== 'undefined' ) {
				//add offset notice message
				if( adSlot.skipNotice ){
					var skipNotice = _this.embedPlayer.id + '_ad_skipNotice';
					_this.embedPlayer.getVideoHolder().append(
					   $('<span />')
						.attr( 'id', skipNotice )
						.css( helperCss )
						.css( 'font-size', '90%' )
						.css( adSlot.skipNotice.css )
					);
						
					var localSkipNoticeCB = function(){
						if( _this.adTrackingFlag ){
							// Evaluate notice text:
							$('#' + skipNotice).text(
								_this.embedPlayer.evaluate( adSlot.skipNotice.evalText )
							);
							setTimeout( localSkipNoticeCB,  mw.getConfig( 'EmbedPlayer.MonitorRate' ) );
						}
					};
					localSkipNoticeCB();
				}
				//parse HH:MM:SS or int value to seconds
				if( parseFloat( adConf.skipoffset ) == parseInt( adConf.skipoffset )
					&& 
					!isNaN( adConf.skipoffset )
				){
					//parse "int" format: 
					skipOffsetInSecs = parseInt( adConf.skipoffset )
				} else 	if ( adConf.skipoffset.indexOf(":") != -1 ) {
					skipOffsetInSecs = this.getTimeInSeconds( adConf.skipoffset );
				} else if ( adConf.skipoffset.indexOf("%") != -1 ) {
					//parse percent format to seconds
					var percent = parseInt( adConf.skipoffset.substring(0, adConf.skipoffset.indexOf("%")) ) / 100;
					if ( isNaN( vid.duration ) ) {
						skipPercentage = percent;
					} else {
						skipOffsetInSecs = vid.duration * percent;
					}
				} else {
					mw.log("KAdPlayer:: ignoring skipoffset - invalid format");
				}
				if ( skipOffsetInSecs || skipPercentage ){
					$('#' + _this.embedPlayer.id + '_ad_skipBtn').hide();
				}
			}
		}
		adConf.skipOffset = skipOffsetInSecs;
		mw.log("KAdPlayer:: source updated, add tracking");
		// Always track ad progress:
		if( vid.readyState > 0 ) {
			_this.addAdTracking( adConf.trackingEvents, adConf );
		} else {
			var loadMetadataCB = function() {
				if ( skipPercentage ){
					adConf.skipOffset = vid.duration * skipPercentage;
				}
				_this.addAdTracking( adConf.trackingEvents, adConf );
				$( vid ).unbind('loadedmetadata', loadMetadataCB );
			};
			$( vid ).bind('loadedmetadata', loadMetadataCB );
		}
		
		// Support Audio controls on ads:
		$( _this.embedPlayer ).bind('volumeChanged' + _this.trackingBindPostfix, function( e, changeValue ){
			// when using siblings we need to adjust the sibling volume on volumeChange evnet.
			if( _this.isVideoSiblingEnabled() ) {
				vid.volume = changeValue;
			}
		});

		// add a play button to resume the ad if the user exits the native player ( in cases where 
		// webkitendfullscreen capture does not work ) 
		if( _this.embedPlayer.isImagePlayScreen() ){
			 _this.embedPlayer.addLargePlayBtn();
			 // overide click method to resume ad:
			 _this.embedPlayer.getInterface().find( '.play-btn-large' ).unbind( 'click ').click( function(){
				 vid.play();
			 })
		}

		if( !_this.embedPlayer.isPersistentNativePlayer() ) {
			// Make sure we remove large play button
			$( vid ).bind('playing', function() {
				setTimeout( function() {
					_this.embedPlayer.hideSpinnerAndPlayBtn();
				}, 100);
			});
		}

		// Update the status bar
		this.adTimersInterval = setInterval(function() {
			var endTime = ( _this.embedPlayer.controlBuilder.longTimeDisp )? '/' + mw.seconds2npt( vid.duration ) : '';
			_this.embedPlayer.controlBuilder.setStatus(
				mw.seconds2npt(	vid.currentTime ) + endTime
			);
			_this.embedPlayer.updatePlayHead( vid.currentTime / vid.duration );
		}, mw.getConfig('EmbedPlayer.MonitorRate') );
	},
	/**
	 * Skip the current playing ad slot if set:  
	 */
	skipCurrent: function(){
		if( this.currentAdSlot ){
			this.currentAdSlot.playbackDone();

		}
	},
	/**
	 * @param timeString string in HH:MM:SS.mmm format
	 * returns value in seconds
	 **/
	getTimeInSeconds: function (timeString) {
		if (timeString.indexOf(":")== -1)
		return undefined;
		var result = 0;
		var timesArr = timeString.split(":");
		if (timesArr.length!=3) {
		mw.log("KAdPlayer:: ignoring offset - invalid format");
		} else {
		var multi = 1;
		//add seconds, then minutes, then hours
		for (var i = timesArr.length - 1; i>=0; i--) {
			result += parseInt(timesArr[i]) * multi;
			multi *= 60;
		}
		}
		return result;
	},
	/**
	 * Display companion ads
	 * @param adSlot
	 * @param adConf
	 * @param timeTargetType
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

		// Fire Impression
		this.fireImpressionBeacons( adConf );
	},
	displayCompanion: function( adSlot, companionTarget, companion ){
		var _this = this;
		this.setImgSrc(companion);
		// Check the local to the page target:
		if( $( '#' + companionTarget.elementid ).length ){
			$( '#' + companionTarget.elementid ).html( companion.html );
		}
		// Check the iframe parent target:
		try{
			var targetElm = window['parent'].document.getElementById( companionTarget.elementid  );
			if( targetElm ){
				targetElm.innerHTML = companion.html;
			}
		} catch( e ){
			mw.log( "Error: KAdPlayer could not access parent iframe" );
		}
	},

	/**
	 * Gets the overlay id:
	 */
	getOverlayId: function(){
		return this.embedPlayer.id + '_overlay';
	},
	/**
	 * Sets the image source in the html of the given object. Setting src for image immediately loads the resource, so it's better to
	 * add the src only when displaying the object
	 **/
	setImgSrc: function (imgObj) {
		if (imgObj.html.indexOf("src=")== -1) {
		imgObj.html = imgObj.html.replace('<img ', '<img src="' + imgObj.resourceUri + '" ');
		}
	},

	getVPAIDId:function(){
		return this.embedPlayer.id + '_vpaid';
	},

	/**
	 * Display a nonLinier add ( like a banner overlay )
	 * @param adSlot
	 * @param adConf
	 * @return
	 */
	displayNonLinear: function( adSlot, adConf ){
		var _this = this;
		var overlayId = this.getOverlayId();
		var nonLinearConf = _this.selectFromArray( adConf.nonLinear );

		// Add the overlay if not already present:
		if( $('#' +overlayId ).length == 0 ){
			_this.embedPlayer.getVideoHolder().append(
				$('<div />')
				.css({
					'position':'absolute',
					'bottom': '10px',
					'z-index' : 2
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
		this.setImgSrc(nonLinearConf);
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
				'bottom' : '10px',
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
		// remove any old bindings ( avoid stacking ) 
		$( _this.embedPlayer ).unbind( this.displayPostFix );
		
		// Bind control bar display hide / show
		$( _this.embedPlayer ).bind( 'onShowControlBar' + this.displayPostFix, function(event,  layout ){
			if( $('#' +overlayId ).length )
				$('#' +overlayId ).animate( layout, 'fast');
		});
		$( _this.embedPlayer ).bind( 'onHideControlBar' + this.displayPostFix, function(event, layout ){
			if( $('#' +overlayId ).length )
				$('#' +overlayId ).animate( layout, 'fast');
		});
		$( _this.embedPlayer ).bind( 'onChangeMedia' + this.displayPostFix, function(){
			adSlot.playbackDone();
		});

		// Only display the the overlay for allocated time:
		adSlot.doneFunctions.push(function(){
			$('#' +overlayId ).remove();
		});

		// Fire Impression
		this.fireImpressionBeacons( adConf );
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
	 * @param {object} adConf
	 */

	addAdTracking: function ( trackingEvents, adConf ){
		/*
		 creativeView: not to be confused with an impression, this event indicates that an individual creative
		 portion of the ad was viewed. An impression indicates the first frame of the ad was displayed; however
		 an ad may be composed of multiple creative, or creative that only play on some platforms and not
		 others. This event enables ad servers to track which creative are being viewed, and therefore, which
		 platforms are more common.
		 •
		 ✝
		 start: this event is used to indicate that an individual creative within the ad was loaded and playback
		 began. As with creativeView, this event is another way of tracking creative playback.
		 •
		 ✝
		 firstQuartile: the creative played for at least 25% of the total duration.
		 •
		 ✝
		 midpoint: the creative played for at least 50% of the total duration.
		 •
		 ✝
		 thirdQuartile: the creative played for at least 75% of the duration.
		 •
		 ✝
		 complete: the creative played to the end at normal speed.
		 •
		 ✝
		 mute: the user activated the mute control and muted the creative.
		 •
		 ✝
		 unmute: the user activated the mute control and unmuted the creative.
		 •
		 ✝
		 pause: the user clicked the pause control and stopped the creative.
		 •
		 ✝
		 rewind: the user activated the rewind control to access a previous point in the creative timeline.© 2012 Interactive Advertising Bureau 46 VAST_v3.0
		 •
		 ✝
		 resume: the user activated the resume control after the creative had been stopped or paused.
		 • **fullscreen: the user activated a control to extend the video player to the edges of the viewer’s
		 screen.
		 • **exitFullscreen: the user activated the control to reduce video player size to original dimensions.
		 • expand: the user activated a control to expand the creative.
		 • collapse: the user activated a control to reduce the creative to its original dimensions.
		 • acceptInvitation: the user activated a control that launched an additional portion of the creative.
		 • close: the user clicked the close button on the creative.
		 • *progress: the creative played for a duration at normal speed that is equal to or greater than the
		 value provided in an additional attribute for offset. Offset values can be time in the format
		 HH:MM:SS or HH:MM:SS.mmm or a percentage value in the format n%. Multiple progress events with
		 different values can be used to track multiple progress points in the Linear creative timeline.
		 * Metrics!introduced!in!VAST!3.0.
		 ** The!expand and!col
		 */

		var _this = this;
		var skipOffset = adConf.skipOffset;
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
			console.log("sendBeacon:" + eventName)
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


		$( this.embedPlayer ).bind( 'onToggleMute' + _this.trackingBindPostfix, function(){
			if (_this.embedPlayer.muted)
			{
				sendBeacon( 'mute' );
			}
			else
			{
				sendBeacon( 'unmute' );
			}
		});

		$( this.embedPlayer).bind(  'onAdSkip' +_this.trackingBindPostfix , function(){
		   sendBeacon( 'skip' );
		});


		$( this.embedPlayer ).bind('onOpenFullScreen' + this.trackingBindPostfix , function() {
			sendBeacon( 'fullscreen' );
		});
		$( this.embedPlayer ).bind('onCloseFullScreen' + this.trackingBindPostfix, function() {
			sendBeacon( 'exitFullscreen' );
		});

		// Set up a monitor for time events:
		this.adMonitorInterval = setInterval( function(){
			// check that the video player is still available and we are still in an ad sequence:
			if( !videoPlayer || !_this.embedPlayer.sequenceProxy.isInSequence  ){
				_this.embedPlayer.adTimeline.updateSequenceProxy( 'timeRemaining', null );
				_this.embedPlayer.adTimeline.updateSequenceProxy( 'duration',  null );
				_this.embedPlayer.adTimeline.updateSequenceProxy( 'skipOffsetRemaining',  null );
				clearInterval( _this.adMonitorInterval );
			}
			var time =  videoPlayer.currentTime;
			var dur = videoPlayer.duration;

			// Update the timeRemaining sequence proxy
			_this.embedPlayer.adTimeline.updateSequenceProxy( 'timeRemaining', parseInt ( dur - time ) );
			_this.embedPlayer.adTimeline.updateSequenceProxy( 'duration',  dur );
			_this.embedPlayer.triggerHelper( 'AdSupport_AdUpdatePlayhead', time );
			if (skipOffset) {		  
				var offsetRemaining = Math.max(Math.ceil(skipOffset - time), 0);
				_this.embedPlayer.adTimeline.updateSequenceProxy( 'skipOffsetRemaining', offsetRemaining );
				if (offsetRemaining <= 0) {
				sendBeacon( 'progress' );
				$('#' + _this.embedPlayer.id + '_ad_skipNotice' ).remove();	
				$('#' + _this.embedPlayer.id + '_ad_skipBtn' ).show();	
				}
			}
			if (adConf.selectedIcon) {
				if (adConf.selectedIcon.offsetInSecs && time >= adConf.selectedIcon.offsetInSecs){
				adConf.selectedIcon.offsetInSecs = 0;
				$('#' + _this.embedPlayer.id + '_icon' ).fadeIn('fast');
				if (adConf.selectedIcon.viewTracking)
					mw.sendBeaconUrl( adConf.selectedIcon.viewTracking );
				}
				if (adConf.selectedIcon.durationInSecs && time >= adConf.selectedIcon.durationInSecs) {
				adConf.selectedIcon.durationInSecs = 0;
				$('#' + _this.embedPlayer.id + '_icon' ).fadeOut('fast');
				}
			}


			if( time > 0 ){
				sendBeacon( 'start' );
				sendBeacon( 'creativeView' );
			}

			if( time > dur / 4 ){
				sendBeacon( 'firstQuartile' );
			}

			if( time > dur / 2 ){
				sendBeacon( 'midpoint' );
			}

			if( time > dur / 1.5 ){
				sendBeacon( 'thirdQuartile' );
			}

		}, mw.getConfig('EmbedPlayer.MonitorRate') );
	},
	stopAdTracking: function(){
		var _this = this;
		this.adTrackingFlag = false;
		// stop monitor
		clearInterval( _this.adMonitorInterval );
		clearInterval( _this.adTimersInterval );
		// clear any bindings ( on a single player ( else sibling video will be removed )
		if( ! this.isVideoSiblingEnabled() ) {
			$(  this.getOriginalPlayerElement() ).unbind( _this.trackingBindPostfix );
		}
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
		this.embedPlayer.hideSpinnerAndPlayBtn();
		this.embedPlayer.pause();
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

			// Update the main player state per ad playback:
			_this.embedPlayer.playInterfaceUpdate();

			if( $.isFunction( playingCallback ) ){
				playingCallback( vid );
			}

			if( $.isFunction( doneCallback ) ){
				$( vid ).bind('ended.playVideoSibling', function(){
					mw.log("kAdPlayer::playVideoSibling: ended");
					$( vid ).unbind( 'ended.playVideoSibling' );
					// remove the sibling video:
					$( vid ).remove();
					// call the deon callback:
					doneCallback();
				});
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
			var zIndex = $( this.getOriginalPlayerElement() ).css('z-index');
			if( !zIndex ){
				$( this.getOriginalPlayerElement() ).css('z-index', 1 );
			}

			var vidSibContainerId = this.getVideoAdSiblingId() + '_container';
			var $vidSibContainer = $( '#' + vidSibContainerId );
			if( $vidSibContainer.length == 0 ) {
				// Create new container
				$vidSibContainer = $('<div />').css({
					'position': 'absolute',
					'pointer-events': 'none',
					'top': 0,
					'width': '100%',
					'height': '100%'
				})
				.attr('id', vidSibContainerId);
				// Append to video holder
				this.embedPlayer.getVideoHolder().append(
					$vidSibContainer
				);
			}

			// Create new video tag and append to container
			$vidSibling = $('<video />')
			.attr({
				'id' : this.getVideoAdSiblingId()
			}).css({
				'-webkit-transform-style': 'preserve-3d',
				'position': 'relative',
				'width': '100%',
				'height': '100%'
			});
			$vidSibContainer.append( $vidSibling );
		}
		return $vidSibling[0];
	},
	getVideoAdSiblingId: function(){
		return this.embedPlayer.pid + '_adSibling';
	},
	getOriginalPlayerElement: function(){
		return this.embedPlayer.getPlayerElement();
	},
	playVPAIDAd: function(adConf,adSlot)
	{
		//init the vpaid
		var _this = this;
		var VPAIDObj = null;
		var vpaidId = this.getVPAIDId();
		var creativeData = {};
		var   environmentVars = {
			slot: _this.embedPlayer.getVideoHolder(),
			videoSlot:  _this.embedPlayer.getPlayerElement(),
			videoSlotCanAutoPlay: true

		};
		//add the vpaid container
		if ($('#' + vpaidId).length == 0)
		{
			_this.embedPlayer.getVideoHolder().append(
				$('<div />')
					.css({
						'position':'absolute',
						'top': '0px',
						'left':'0px' ,
						'z-index' : 2
					})
					.attr('id', vpaidId )
			);
		}

		//add the vpaid frindly iframe
		var onVPAIDLoad = function()
		{
			var finishPlaying = function()
			{
				$('#' + vpaidId).remove();
				adSlot.playbackDone();
			}

			VPAIDObj.subscribe(function() {
				VPAIDObj.startAd();
				_this.addClickthroughSupport(adConf);
				// hide any ad overlay
				$( '#' + _this.getOverlayId() ).hide();
				_this.fireImpressionBeacons( adConf );
				_this.addAdBindings( environmentVars.videoSlot, adSlot, adConf );
				_this.embedPlayer.playInterfaceUpdate();

			}, 'AdLoaded');

			VPAIDObj.subscribe(function(message) {
				finishPlaying();
			}, 'AdStopped');
			VPAIDObj.subscribe(function(message) {
				mw.log('VPAID :: AdError:' + message);
				finishPlaying();
			}, 'AdError');
			VPAIDObj.subscribe(function(message) {
				mw.log('VPAID :: AdLog:'+ message);
			}, 'AdLog');



			 VPAIDObj.initAd(_this.embedPlayer.getWidth(), _this.embedPlayer.getHeight(), 'normal', 512, creativeData, environmentVars);


		}
		// Load the VPAID ad unit
		var vpaidFrame = document.createElement('iframe');
		vpaidFrame.style.display = 'none';
		vpaidFrame.onload = function() {
			var vpaidLoader = vpaidFrame.contentWindow.document.createElement('script');
			vpaidLoader.src = adConf.vpaid.src;
			vpaidLoader.onload = function() {
				VPAIDObj = vpaidFrame.contentWindow.getVPAIDAd();
				VPAIDObj.handshakeVersion('2.0');
				onVPAIDLoad();
			};
			vpaidFrame.contentWindow.document.body.appendChild(vpaidLoader);

		 };

		$('#' + vpaidId).append($(vpaidFrame));

	}

}


} )( window.mw, window.jQuery );

