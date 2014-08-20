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

	// Ad tracking flag:
	adTrackingFlag: false,

	// The click binding:
	adClickPostFix :'.adClick',

	// General postFix binding
	displayPostFix: '.displayKAd',

	adSibling: null,

	//diable ad sibling when using vpaid js
	disableSibling:false,

	clickedBumper: false,
	overrideDisplayDuration:0,

	init: function( embedPlayer ){
		var _this = this;
		this.embedPlayer = embedPlayer;

		// bind to the doPlay event triggered by the playPauseBtn component when the user resume playback from this component after clickthrough pause
		var eventName = "doPlay";

		// bind AdSupport_StartAdPlayback event since the small play/ pause button in the control bar doesn't change the state when ad is played on mobile browser
		if( !_this.isVideoSiblingEnabled() ) {
			eventName = eventName + " AdSupport_StartAdPlayback";
		}

		$(this.embedPlayer).bind(eventName, function(){
			if (mw.getConfig("enableControlsDuringAd")){
				var adPlayer = _this.getVideoElement();
				if ( adPlayer ) {
					if ( adPlayer.paused ) {
						$( embedPlayer ).trigger( "onPlayerStateChange", ["play"] ); // trigger playPauseBtn UI update
						$( embedPlayer ).trigger( "onResumeAdPlayback" );
						_this.clickedBumper = false;
						_this.disablePlayControls(); // disable player controls
						adPlayer.play();
					} else {
						$( embedPlayer ).trigger( "onPlayerStateChange", ["pause"] ); // trigger playPauseBtn UI update
						setTimeout( function () {
							adPlayer.pause();
						}, 0 );
					}
				}
			} else {
				$( embedPlayer ).trigger( "onPlayerStateChange", ["play"] ); // trigger playPauseBtn UI update
				$( embedPlayer ).trigger( "onResumeAdPlayback" );
				_this.clickedBumper = false;
				_this.disablePlayControls(); // disable player controls
			}
		});
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

		var excludedComponents = [];
		// playPauseBtn won't be disabled if enableControlsDuringAd set to true
		if ( mw.getConfig('enableControlsDuringAd') ) {
			excludedComponents = ['playPauseBtn'];
		}

		_this.embedPlayer.triggerHelper( "onDisableInterfaceComponents", [excludedComponents] );

		// Setup some configuration for done state:
		adSlot.doneFunctions = [];
		// set skip offset from config for all adds if defined 
		if( _this.embedPlayer.getKalturaConfig( 'vast', 'skipOffset' ) ){
			var i = 0;
			for( i = 0; i < adSlot.ads.length; i++ ){
				adSlot.ads[i].skipoffset =  _this.embedPlayer.getKalturaConfig( 'vast', 'skipOffset' );
			}
		}

		adSlot.playbackDone = function( hardStop ){
			mw.log("KAdPlayer:: display: adSlot.playbackDone" );
            // trigger ad complete event for tracking. Taking current time from currentTimeLabel plugin since the embedPlayer currentTime is already 0
            $(_this.embedPlayer).trigger('onAdComplete',[adSlot.ads[adSlot.adIndex].id, mw.npt2seconds($(".currentTimeLabel").text())]);
			// remove click binding if present
			var clickEventName = (mw.isTouchDevice()) ? 'touchend' : 'mouseup';
			$( _this.embedPlayer ).unbind( clickEventName + _this.adClickPostFix );
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
			if ( hardStop || !adSlot.sequencedAds || adSlot.adIndex == adSlot.ads.length ) {

				// Restore overlay if hidden:
				if( $( '#' + _this.getOverlayId() ).length ){
					$( '#' + _this.getOverlayId() ).show();
				}

				// remove the video sibling ( used for ad playback )
				_this.restoreEmbedPlayer();
				
				while( adSlot.doneFunctions.length ){
					adSlot.doneFunctions.shift()();
				}
				adSlot.currentlyDisplayed = false;
				// give time for the end event to clear
				setTimeout(function(){
					_this.embedPlayer.triggerHelper("onEnableInterfaceComponents");
					if( !hardStop && displayDoneCallback ){
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
		if ( adConf.vpaid
			&&
			( (adConf.vpaid.js && adConf.vpaid.js.src)
			||
			( mw.supportsFlash() && adConf.vpaid.flash && adConf.vpaid.flash.src )))
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
			var startTime = _this.embedPlayer.getPlayerElementTime();
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
		if ( adConf.nonLinear && adConf.nonLinear.length && adSlot.type == 'overlay' && !adConf.vpaid ) {
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
		if (_this.overrideDisplayDuration > 0 && _this.overrideDisplayDuration > displayDuration ){
			displayDuration = _this.overrideDisplayDuration;
		}
		// Stop display of overlay if video playback is no longer active
		if( typeof vid == 'undefined' || _this.embedPlayer.getPlayerElementTime() - startTime > displayDuration ){
			mw.log( "KAdPlayer::display:" + adSlot.type + " Playback done because vid does not exist or > displayDuration " + displayDuration );
			_this.overrideDisplayDuration = 0;
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
		this.addClickthroughSupport( adConf, adSlot );

		// hide any ad overlay
		$( '#' + this.getOverlayId() ).hide();
		
		// Play the ad as sibling to the current video element.
		if( _this.isVideoSiblingEnabled( targetSource ) ) {


			_this.playVideoSibling(
            targetSource,
				function( vid ) {
					_this.addAdBindings( vid, adSlot, adConf );
					$( _this.embedPlayer ).trigger( 'playing' ); // this will update the player UI to playing mode
                    // trigger ad play event
                    $(_this.embedPlayer).trigger("onAdPlay",[adConf.id]);
                    if (_this.embedPlayer.muted){
                        _this.adSibling.changeVolume(0);
                    }
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
		if ( adConf.icons && adConf.icons.length ) {
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
        // dispatch adOpen event
        $( this.embedPlayer).trigger( 'onAdOpen',[adConf.id, adConf.adSystem, adSlot.type, adSlot.adIndex] );
	},

	addClickthroughSupport:function( adConf, adSlot ){
		var _this = this;
		var embedPlayer = _this.embedPlayer;
		// Check for click binding
		if( adConf.clickThrough || adSlot.videoClickTracking ){
			// add click binding in setTimeout to avoid race condition,
			// where the click event is added to the embedPlayer stack prior to
			// the event stack being exhausted.
			var $clickTarget = (mw.isTouchDevice()) ? $(embedPlayer) : embedPlayer.getVideoHolder();
			var clickEventName = (mw.isTouchDevice()) ? 'touchend' : 'click';
			setTimeout( function(){
				$clickTarget.unbind(clickEventName + _this.adClickPostFix).bind( clickEventName + _this.adClickPostFix, function(e){
					if ( adSlot.videoClickTracking && adSlot.videoClickTracking.length > 0  ) {
						mw.log("KAdPlayer:: sendBeacon to: " + adSlot.videoClickTracking[0] );
						for (var i=0; i < adSlot.videoClickTracking.length ; i++){
							mw.sendBeaconUrl( adSlot.videoClickTracking [i]);
						}
                        //handle wrapper clickTracking
                        if(adSlot.wrapperData ){

                            adSlot.wrapperData.contents().find('ClickTracking').each(function(a,b){
                                mw.sendBeaconUrl($(b).contents().text())
						        mw.log("KAdPlayer:: sendBeacon to (wrapper): " + $(b).contents().text() );
                            })
                        }

					}
					if ( adConf.clickThrough ) {
						e.stopPropagation();
						if( _this.clickedBumper ){
							_this.getVideoElement().play();

							// This changes player state to the relevant value ( play-state )
							if( _this.isVideoSiblingEnabled() ) {
								$( _this.embedPlayer ).trigger( 'playing' );
							}

							$( embedPlayer).trigger("onPlayerStateChange",["play"]);
							$( embedPlayer).trigger("onResumeAdPlayback");
							embedPlayer.restoreComponentsHover();
							_this.disablePlayControls();
							_this.clickedBumper = false;
						} else {
							_this.clickedBumper = true;
							// Pause the player
							embedPlayer.disableComponentsHover();
							_this.getVideoElement().pause();

							// This changes player state to the relevant value ( pause-state )
							if( _this.isVideoSiblingEnabled() ) {
								$( _this.embedPlayer ).trigger( 'onPauseInterfaceUpdate' );
							}

							embedPlayer.enablePlayControls(["scrubber"]);
							$( embedPlayer).trigger("onPlayerStateChange",["pause"]);
							embedPlayer.enablePlayControls();
							//expose the URL to the
							embedPlayer.sendNotification( 'adClick', {url: adConf.clickThrough} );
							window.open( adConf.clickThrough );
						}
					}

					return false;
				});
			}, 500 );
		}
	}   ,
	disablePlayControls: function(){
		var components = [];
		if (mw.getConfig('enableControlsDuringAd')) {
			components = ['playPauseBtn'];
		}
		this.embedPlayer.disablePlayControls(components);
	},

	/**
	 * Check if we can use the video sibling method or if we should use the fallback source swap.
	 */
	isVideoSiblingEnabled: function( targetSource ){
		// if we have a target source use that to check for "image" and disable sibling video playback
		if( targetSource && targetSource.getMIMEType().indexOf('image/') != -1 ){
			return false;
		}

		if( mw.getConfig( "DisableVideoSibling") ) {
			return false;
		}

		if( mw.getConfig( "EmbedPlayer.ForceNativeComponent") ) {
			return false;
		}

		if ( this.disableSibling) {
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
		var embedPlayer = this.embedPlayer;
		if( !vid ){
			mw.log("KAdPlayer:: Error: displayVideoFile no vid to bind" );
			return ;
		}
		// update the current ad slot: 
		this.currentAdSlot = adSlot;
		// start ad tracking
		this.adTrackingFlag = true;

		// Check runtimeHelper
		if( adSlot.notice ){
			var noticeId =_this.embedPlayer.id + '_ad_notice';
			// Add the notice target:
			embedPlayer.getVideoHolder().append(
				$('<span />')
					.attr( 'id', noticeId )
					.addClass( 'ad-component ad-notice-label' )
			);
			var localNoticeCB = function(){
				if( _this.adTrackingFlag ){
					// Evaluate notice text:
					$('#' + noticeId).text(
						embedPlayer.evaluate( adSlot.notice.evalText )
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

		var clickEventName = (mw.isTouchDevice()) ? 'touchend' : 'mouseup';

		// Check for skip add button
		if( adSlot.skipBtn ){
			var skipId = embedPlayer.id + '_ad_skipBtn';
			embedPlayer.getVideoHolder().append(
				$('<span />')
					.attr('id', skipId)
					.text( adSlot.skipBtn.text )
					.addClass( 'ad-component ad-skip-btn' )
					.bind(clickEventName, function(){
						$( embedPlayer ).unbind( clickEventName + _this.adClickPostFix );
						_this.skipCurrent();
						$( embedPlayer).trigger( 'onAdSkip' );
						return false;
					})
			);
			if ( typeof adConf.skipoffset !== 'undefined' ) {
				//add offset notice message
				if( adSlot.skipNotice ){
					var skipNotice = embedPlayer.id + '_ad_skipNotice';
					embedPlayer.getVideoHolder().append(
					   $('<span />')
						.attr( 'id', skipNotice )
						.addClass( 'ad-component ad-skip-label' )
					);
						
					var localSkipNoticeCB = function(){
						if( _this.adTrackingFlag ){
							// Evaluate notice text:
							$('#' + skipNotice).text(
								embedPlayer.evaluate( adSlot.skipNotice.evalText )
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
					$('#' + embedPlayer.id + '_ad_skipBtn').hide();
				}
			}
		}
		adConf.skipOffset = skipOffsetInSecs;
		mw.log("KAdPlayer:: source updated, add tracking");
		// Always track ad progress:
		if( vid.readyState > 0 && vid.duration ) {
			_this.addAdTracking( adConf.trackingEvents, adConf  );
		} else {
			var loadMetadataCB = function() {
				if ( skipPercentage ){
					adConf.skipOffset = vid.duration * skipPercentage;
				}
				// Trigger duration event
				embedPlayer.triggerHelper('AdSupport_AdUpdateDuration', vid.duration);

				_this.addAdTracking( adConf.trackingEvents, adConf );
				$( vid ).unbind('loadedmetadata', loadMetadataCB );
			};
			if (!adConf.vpaid){
				$( vid ).bind('loadedmetadata', loadMetadataCB );
			}
		}
		
		// Support Audio controls on ads:
		$( embedPlayer ).bind('volumeChanged' + _this.trackingBindPostfix, function( e, changeValue ){
			// when using siblings we need to adjust the sibling volume on volumeChange evnet.
			if( _this.isVideoSiblingEnabled() && _this.adSibling) {
                _this.adSibling.changeVolume(changeValue);

			}
		});

        embedPlayer.bindHelper( 'doPause' + _this.trackingBindPostfix, function(){
		    if( _this.isVideoSiblingEnabled() && _this.adSibling) {
			    $( _this.embedPlayer ).trigger( 'onPauseInterfaceUpdate' ); // update player interface
                vid.pause();
		    }
        });

        embedPlayer.bindHelper( 'doPlay' + _this.trackingBindPostfix, function(){
		    if( _this.isVideoSiblingEnabled() && _this.adSibling) {
			    $( _this.embedPlayer ).trigger( 'playing' ); // update player interface
                vid.play();
		    }
        });

		if( !embedPlayer.isPersistentNativePlayer() ) {
			// Make sure we remove large play button
			$( vid ).bind('playing', function() {
				setTimeout( function() {
					embedPlayer.hideSpinner();
				}, 100);
			});
		}
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
     * Skip all ad slots if set:
     */
	stop: function(){
      if( this.currentAdSlot && ( this.currentAdSlot.adIndex < this.currentAdSlot.ads.length ) ){
            this.currentAdSlot.playbackDone( true );
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
			imgObj.html = imgObj.html.toLowerCase().replace('<img ', '<img src="' + imgObj.resourceUri + '" ');
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
	nonLinearLayoutInterval: 0,
	displayNonLinear: function( adSlot, adConf ){
		var _this = this;
		var overlayId = this.getOverlayId();
		var nonLinearConf = _this.selectFromArray( adConf.nonLinear );
		if (nonLinearConf.minSuggestedDuration){
			_this.overrideDisplayDuration = kWidget.npt2seconds( nonLinearConf.minSuggestedDuration );
			mw.log( "KAdPlayer::displayNonLinear - override duration from vast:" + _this.overrideDisplayDuration );
		}
		var sendBeacon = function(eventName){
			for(var i =0;i < adConf.trackingEvents.length; i++){
				if( eventName == adConf.trackingEvents[ i ].eventName ){
					mw.log("KAdPlayer:: sendBeacon: " + eventName + ' to: ' + adConf.trackingEvents[ i ].beaconUrl );
					mw.sendBeaconUrl( adConf.trackingEvents[ i ].beaconUrl );
				}
			}
		}
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
			'display': 'none',
			'margin-left': -(nonLinearConf.width /2 )+ 'px'
		};

		// if we didn't recieve the dimensions - wait till the ad loads and use the DIV's dimensions
		var waitForNonLinear = function(){
			if ($('#' +overlayId ).width() > 0){
				$('#' +overlayId).css('margin-left', -($('#' +overlayId ).width() /2 )+ 'px').fadeIn('fast');
			}else{
				_this.nonLinearLayoutInterval++;
				if (_this.nonLinearLayoutInterval < 20){
					setTimeout(waitForNonLinear, 50);
				}
			}
		}
		if (nonLinearConf.width === undefined){
			waitForNonLinear();
		}
		this.setImgSrc(nonLinearConf);
		// Show the overlay update its position and content
		$('#' +overlayId )
		.css( layout )
		.html( nonLinearConf.html )
		.append(
			// Add a absolute positioned close button:
			$('<span/>')
			.css({
				'top' : -14,
				'bottom' : '10px',
				'right' : -32,
				'z-index': 100,
				'position': 'absolute',
				'cursor' : 'pointer'
			})
			.addClass("btn icon-close")
			.click(function(){
				sendBeacon("close");
				$( this ).parent().fadeOut('fast');
				return true;
			})
		);
		if (nonLinearConf.width !== undefined){
			$('#' +overlayId ).fadeIn('fast');
		}
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
		sendBeacon("creativeView");
	},

	/**
	 * bindVastEvent per the VAST spec the following events are supported:
	 *
	 * start, firstQuartile, midpoint, thirdQuartile, complete
	 * pause, rewind, resume,
	 *
	 * VAST events not presently supported ( per iOS player limitations )
	 * See http://www.iab.net/guidelines/508676/digitalvideo/vsuite/vast for tracking spec
	 *
	 * mute, creativeView, unmute, fullscreen, expand, collapse,
	 * acceptInvitation, close
	 *
	 * @param {object} trackingEvents
	 * @param {object} adConf
	 */

	addAdTracking: function ( trackingEvents, adConf ){
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
			mw.log("sendBeacon:" + eventName)
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

		// On done button tapped - iPhone
		if( mw.isIphone() &&
			( mw.getConfig( "EmbedPlayer.ForceNativeComponent") == null ||
			  mw.getConfig( "EmbedPlayer.ForceNativeComponent") === "" )
			) {
			$( videoPlayer ).unbind( 'webkitendfullscreen' ).bind( 'webkitendfullscreen', function(){
				//webkitendfullscreen causes similar behviour as pause so trigger the event
				$( _this.embedPlayer ).trigger( 'onpause' );
				//Set to true so if clickthrough is enabled let clickthrough handler take care of play
				//If clickthrough is not set at all then let this event binding take care of the play sequence
				_this.clickedBumper = true;

				var $clickTarget = (mw.isTouchDevice()) ? $(_this.embedPlayer) : _this.embedPlayer.getVideoHolder();
				var clickEventName = (mw.isTouchDevice()) ? 'touchend' : 'click';
				setTimeout( function(){
					$clickTarget.bind( clickEventName + _this.adClickPostFix, function(e) {
						if (_this.clickedBumper) {
							e.stopPropagation();
							_this.getVideoElement().play();
							$( _this.embedPlayer ).trigger( "onPlayerStateChange", ["play"] );
							$( _this.embedPlayer ).trigger( "onResumeAdPlayback" );
							_this.embedPlayer.restoreComponentsHover();
							_this.disablePlayControls();
						}
						return false;
					});
				}, 100);
			});
		}

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

		$( this.embedPlayer).bind(  'onResumeAdPlayback' +_this.trackingBindPostfix , function(){
		   sendBeacon( 'resume' , true );
		});

		$( this.embedPlayer ).bind('onOpenFullScreen' + this.trackingBindPostfix , function() {
			sendBeacon( 'fullscreen' );
		});
		$( this.embedPlayer ).bind('onCloseFullScreen' + this.trackingBindPostfix, function() {
			sendBeacon( 'exitFullscreen' );
		});

		// Set up a monitor for time events:
		this.adMonitorInterval = setInterval( function(){
			if( !videoPlayer ) return ;
			// check that the video player is still available and we are still in an ad sequence:
			if( !videoPlayer || !_this.embedPlayer.sequenceProxy.isInSequence  ){
				_this.embedPlayer.adTimeline.updateSequenceProxy( 'timeRemaining', null );
				_this.embedPlayer.adTimeline.updateSequenceProxy( 'duration',  null );
				_this.embedPlayer.adTimeline.updateSequenceProxy( 'skipOffsetRemaining',  null );
				_this.getVPAIDDurtaion = null;
				clearInterval( _this.adMonitorInterval );
			}
			var time =  videoPlayer.currentTime;
			var dur = videoPlayer.duration;
			if (_this.getVPAIDDurtaion)
			{
				//we need to add time since we get the duration that left.
				dur = _this.getVPAIDDurtaion() + time;
			}

			// Update the timeRemaining sequence proxy
			_this.embedPlayer.adTimeline.updateSequenceProxy( 'timeRemaining', parseInt ( dur - time ) );
			_this.embedPlayer.adTimeline.updateSequenceProxy( 'duration',  dur );
			_this.embedPlayer.triggerHelper( 'AdSupport_AdUpdatePlayhead', time );
			_this.embedPlayer.updatePlayHead( time / dur );
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
		this.embedPlayer.hideSpinner();
		this.embedPlayer.pause();
		// include a timeout for the pause event to propagate
		setTimeout( function(){
			// make sure the embed player is "paused"
			_this.embedPlayer.pause();

			// Hide the current video:
			$(_this.getOriginalPlayerElement()).css('visibility', 'hidden'); //hide


			var vid = _this.getVideoAdSiblingElement( source );
			//Register error state and continue with player flow in case of
			$(vid ).bind('error.playVideoSibling', function(e){
				$( vid ).unbind( 'error.playVideoSibling' );
				$( vid ).trigger('ended.playVideoSibling');
			});
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
					_this.restoreEmbedPlayer();
					// call the deon callback:
					doneCallback();
				});
			}

		}, 0);
	},
	restoreEmbedPlayer: function(){
		// remove the video sibling:
		$( '#' + this.getVideoAdSiblingId() ).remove();
		$( '#' + this.getVideoAdSiblingId() + '_container' ).remove();
		this.adSibling = null;
		this.adSiblingFlashPlayer = null;
		// remove click through binding
		this.embedPlayer.getVideoHolder().unbind( this.adClickPostFix );
		// remove ad tracking binding
		this.embedPlayer.unbindHelper( this.trackingBindPostfix );
		// show the player:
		$(this.getOriginalPlayerElement()).css('visibility', 'visible');
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
	getVideoAdSiblingElement: function( source ){
		if ( !this.adSibling ) {
			var vidSibContainerId =  this.getVideoAdSiblingId() + '_container';
			var $vidSibContainer = $( '#' + vidSibContainerId );
			if( $vidSibContainer.length == 0 ) {
				// Create new container
				$vidSibContainer = $( '<div />' ).css({
					'position': 'absolute',
					'pointer-events': 'none',
					'top': 0,
					'width': '100%',
					'height': '100%',
					'background': '#000'
				})
					.attr('id', vidSibContainerId);
			}

			this.embedPlayer.getVideoHolder().append( $vidSibContainer );
			if ( source && source.getMIMEType() ) {
				var targetPlayer =  mw.EmbedTypes.getMediaPlayers().defaultPlayer( source.mimeType );
				if ( targetPlayer.library == "Kplayer" ) {
					this.adSibling = new mw.PlayerElementFlash( vidSibContainerId, this.getVideoAdSiblingId(), {autoPlay: true} );
					// TODO: DELETE THIS!
					// We need to figure out if we're using Flash player or HTML5 player
					this.embedPlayer.adSiblingFlashPlayer = true;
				} else {
					this.adSibling = new mw.PlayerElementHTML( vidSibContainerId , this.getVideoAdSiblingId() );
				}
			}
			// check z-index of native player (if set )
			//TODO drop this condition after we return dom element for playerElementFlash
			if ( this.getOriginalPlayerElement().nodeName ) {

				var zIndex = $( this.getOriginalPlayerElement() ).css('z-index');
				if( !zIndex ){
					$( this.getOriginalPlayerElement() ).css('z-index', 1 );
				}
			}
		}

		if ( this.adSibling ) {
			return this.adSibling.getElement();
		}

		return null;
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
		var environmentVars = {
			slot: _this.embedPlayer.getVideoHolder(),
			videoSlot:  _this.embedPlayer.getPlayerElement(),
			videoSlotCanAutoPlay: true
		};
		//is js vpaid or flash vpaid
		var isJs = false;

		//add the vpaid frindly iframe
		var onVPAIDLoad = function()
		{
			var finishPlaying = function()
			{
				if ( isJs ){
					_this.embedPlayer.getInterface().find('.mwEmbedPlayer').show();
				}
				$('#' + vpaidId).remove();
				_this.restoreEmbedPlayer();
				adSlot.playbackDone();
			}

			VPAIDObj.subscribe(function() {
				if ( VPAIDObj.startAd ) {
					VPAIDObj.startAd();
				}
				_this.addClickthroughSupport(adConf, adSlot);
				_this.fireImpressionBeacons( adConf );
				_this.embedPlayer.playInterfaceUpdate();
			}, 'AdLoaded');

			VPAIDObj.subscribe(function(obj) {
				// handle ad linear changes
				if (obj.AdLinear == true && !_this.embedPlayer.isPlaying()){
					_this.embedPlayer.play();
				}
				if (obj.AdLinear == false && _this.embedPlayer.isPlaying()){
					_this.embedPlayer.pause();
				}
			}, 'AdLinearChange');

			VPAIDObj.subscribe(function(){
				_this.getVPAIDDurtaion = function(){
					//TODO add this to flash vpaid
					return VPAIDObj.getAdRemainingTime();
				};
				if (isJs){
					_this.addAdBindings( environmentVars.videoSlot, adSlot, adConf );
				}else{
					// add support for volume control over KDP during Flash ad playback
					$( _this.embedPlayer ).bind('volumeChanged' + _this.trackingBindPostfix, function( e, changeValue ){
						if (typeof VPAIDObj.playerElement.sendNotification === "function"){
							VPAIDObj.playerElement.sendNotification( 'changeVolume', changeValue );
						}
					});
				}
				_this.embedPlayer.hideSpinner();
			},'AdImpression');
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

			if ( isJs ) {  //flash vpaid will call initAd itself
				VPAIDObj.initAd(_this.embedPlayer.getWidth(), _this.embedPlayer.getHeight(), 'normal', 512, creativeData, environmentVars);
			}
		}
		//add the vpaid container
		if ($('#' + vpaidId).length == 0)
		{
			_this.embedPlayer.getVideoHolder().append(
				$('<div />')
					.css({
						'position':'absolute',
						'top': '0px',
						'left':'0px' ,
						'z-index' : 2000,
						'width': '100%',
						'height': '100%'
					})
					.attr('id', vpaidId )
			);
		}
		if ( adConf.vpaid.flash && mw.EmbedTypes.getMediaPlayers().defaultPlayer( adConf.vpaid.flash.type ) ) { //flash vpaid
			var playerParams = {
				autoPlay: true,
				disableOnScreenClick: true,
				vpaid: {
					plugin: 'true',
					loadingPolicy: 'preInitialize'
				}
			};
			if ( adConf.adParameters ) {
				playerParams.vpaidAdParameters = encodeURIComponent( adConf.adParameters );
			}
			//flashvars to load vpaidPlugin.swf and to disable on screen clicks since vpaid swf will handle the clicks
			var adSibling = new mw.PlayerElementFlash( vpaidId, vpaidId+ "_obj", playerParams, null, function() {
				VPAIDObj = this.getElement();
				this.src = adConf.vpaid.flash.src;
				this.load();
				onVPAIDLoad();
			});
		} else
		//js vpaid
		if ( adConf.vpaid.js ) {
			isJs = true;
			if ( this.embedPlayer.selectedPlayer.library == 'Native'  ) {
				_this.disableSibling = true;
				//enable user clicks
				_this.embedPlayer.getInterface().find('.mwEmbedPlayer').hide();
				$('#' + vpaidId).css("width", 0);
				$('#' + vpaidId).css("height", 0);
			} else {
				var adSibling = new mw.PlayerElementHTML( vpaidId , this.getVideoAdSiblingId() );
				environmentVars.slot =  vpaidId;
				environmentVars.videoSlot = adSibling.element;
			}

			// Load the VPAID ad unit
			var vpaidFrame = document.createElement('iframe');
			vpaidFrame.style.display = 'none';
			vpaidFrame.onload = function() {
				var vpaidLoader = vpaidFrame.contentWindow.document.createElement('script');
				vpaidLoader.src = adConf.vpaid.js.src;
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

}


} )( window.mw, window.jQuery );

