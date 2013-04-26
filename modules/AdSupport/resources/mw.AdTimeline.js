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
 *			embedPlayer the embedPlayer target ( creates a mobileTimeline
 *			controller on the embedPlayer target if it does not already exist )
 * @param {Object}
 *			timeType Stores the target string can be 'preroll', 'bumper', 'overlay',
 *			'midroll', 'postroll'
 * @param {Object}
 *			adConf adConf object see
 *			mw.MobilePlayerTimeline.display
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
( function( mw, $ ) { "use strict";

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
	originalSource: false,

	// Flag to store if its the first time play is being called:
	firstPlay: true,

	bindPostfix: '.AdTimeline',

	currentAdSlotType: null,

	/**
	 * @constructor
	 * @param {Object}
	 *			embedPlayer The embedPlayer object
	 */
	init: function(embedPlayer) {
		this.embedPlayer = embedPlayer;
		// Bind to the "play" and "end"
		this.bindPlayer();
	},

	/**
	 * Update Sequence Proxy property
	 * @param {string}
	 * 			propName The name of the property
	 * @param {object}
	 * 			value The value for the supplied property
	 */
	updateSequenceProxy: function( propName, value ){
		this.embedPlayer.sequenceProxy[ propName ] = value;
	},
	bindPlayer: function() {
		var _this = this;
		var embedPlayer = this.embedPlayer;
		// Setup the original source
		_this.originalSource = embedPlayer.getSource();
		// Clear out any old bindings
		_this.destroy();
		// Create an empty sequence proxy object ( stores information about the current sequence )
		embedPlayer.sequenceProxy = {
			'isInSequence' : false,
			'timeRemaining' : 0,
			'duration' : 0,
			'skipOffsetRemaining': 0
		};

		// On change media clear out any old adTimeline bindings
		embedPlayer.bindHelper( 'onChangeMedia' + _this.bindPostfix, function(){
			_this.destroy();
		});

		// Rest displayed slot count
		_this.displayedSlotCount = 0;

		// On play preSequence
		embedPlayer.bindHelper( 'preSequence' + _this.bindPostfix, function() {

			// store original content duration
			var orgDuration = embedPlayer.duration;

			// Start of preSequence
			embedPlayer.triggerHelper( 'AdSupport_PreSequence');

			//Setup a playedAnAdFlag
			var playedAnAdFlag = false;
			embedPlayer.bindHelper( 'AdSupport_StartAdPlayback' +  _this.bindPostfix, function(){
				mw.log("AdTimeline:: set Played an ad flag to true");
				playedAnAdFlag = true;
			});

			mw.log( "AdTimeline:: load ads, trigger: AdSupport_OnPlayAdLoad" );
			embedPlayer.pauseLoading();

			// given an opportunity for ads to load for ads to load:
			embedPlayer.triggerQueueCallback( 'AdSupport_OnPlayAdLoad',function(){
				mw.log( "AdTimeline:: AdSupport_OnPlayAdLoad ");
				// Show prerolls:
				_this.displaySlots( 'preroll', function(){
					// Trigger ad complete for prerolls if an ad was played
					// ( and we are going to play a bumper )
					if( _this.displayedSlotCount > 0
							&&
						! $.isEmptyObject( _this.getSequenceProxy( 'bumper' ) )
					){
						_this.embedPlayer.triggerHelper( 'AdSupport_EndAdPlayback', 'preroll' );
					}
					// Show bumpers:
					_this.displaySlots( 'bumper', function(){
						// restore the original source:
						embedPlayer.switchPlaySource( _this.originalSource, function(){
							// turn off preSequence
							embedPlayer.sequenceProxy.isInSequence = false;

							// trigger the preSequenceComplete event ( always fired )
							embedPlayer.triggerHelper( 'AdSupport_PreSequenceComplete' );

							if( playedAnAdFlag  ){
								// reset displaySlotCount:
								 _this.displayedSlotCount=0;
							}
							// Restore the player only do event trigger if we played an ad
							_this.restorePlayer( null, playedAnAdFlag );
							// Restore duration:
							embedPlayer.setDuration( orgDuration );
							// Continue playback
							embedPlayer.play();
						});
					});
				});
			});
		});

		// Bind the player "ended" event to play the postroll if present
		var displayedPostroll = false;
		// TODO We really need a "preend" event for thing like this.
		// So that playlist next clip or other end bindings don't get triggered.
		embedPlayer.bindHelper( 'ended' + _this.bindPostfix, function( event ){
			if( displayedPostroll ){
				return ;
			}
			var playedAnAdFlag = false;
			embedPlayer.bindHelper( 'AdSupport_StartAdPlayback' +  _this.bindPostfix, function(){
				playedAnAdFlag = true;
			});
			displayedPostroll = true;
			mw.log( 'AdTimeline:: AdSupport_StartAdPlayback set onDoneInterfaceFlag = false' );
			embedPlayer.onDoneInterfaceFlag = false;

			// Display post roll in setTimeout ( hack to work around end sequence issues )
			// should be refactored.
			setTimeout(function(){
				// Trigger the postSequenceStart event
				// start the postSequence:
				embedPlayer.triggerHelper( 'AdSupport_PostSequence' );
				_this.displaySlots( 'postroll', function(){
					// Turn off preSequence
					embedPlayer.sequenceProxy.isInSequence = false;
					// Trigger the postSequenceComplete event
					embedPlayer.triggerHelper( 'AdSupport_PostSequenceComplete' );
					/** TODO support postroll bumper and leave behind */
					if( playedAnAdFlag ){
						embedPlayer.switchPlaySource( _this.originalSource, function( video ){
							// Make sure we pause the video
							video.pause();
							/* iPad iOS v4.3.1 ignore video pause (probably timing issue) */
							$( video ).bind('play.postSequenceComplete', function(){
								video.pause();
								$( video ).unbind( '.postSequenceComplete' );
							});
							// Restore interface
							_this.restorePlayer( 'postroll', true );
							// Restore ondone interface:
							embedPlayer.onDoneInterfaceFlag = true;
							// on clip done can't be invoked with a stop state ( TOOD clean up end sequence )
							embedPlayer.stopped = false;
							// Run the clipdone event:
							embedPlayer.onClipDone();
						});
					} else {
						// Restore ondone interface:
						embedPlayer.onDoneInterfaceFlag = true;
						// on clip done can't be invoked with a stop state ( TOOD clean up end sequence )
						embedPlayer.stopped = false;
						// run the clipdone event:
						embedPlayer.onClipDone();
					}
				});
			}, 0)
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
	 * Gets the sequence proxy for a given slot type
	 */
	getSequenceProxy: function( slotType ){
		// Setup a sequence timeline set:
		var sequenceProxy = {};
		// Get the sequence ad set
		this.embedPlayer.triggerHelper( 'AdSupport_' + slotType,  [ sequenceProxy ] );
		return sequenceProxy;
	},

	/**
	 * Displays all the slots of a given set
	 *
	 * @param slotSet
	 * 			{Object} slotSet Set of slots to be displayed.
	 * @param doneCallback
	 * 			{function} doneCallback Function called once done displaying slots
	 * @return
	 */
	displaySlots: function( slotType, doneCallback ){
		var _this = this;
		// Setup a sequence timeline set:
		var sequenceProxy = _this.getSequenceProxy( slotType );
		// Generate a sorted key list:
		var keyList = [];
		$.each( sequenceProxy, function(k, na){
			keyList.push( k );
		});

		mw.log( "AdTimeline:: displaySlots: " + slotType + ' found sequenceProxy length: ' + keyList.length );

		// if don't have any ads issue the callback directly:
		if( !keyList.length ){
			doneCallback();
			return ;
		}

		// Sort the sequence proxy key list:
		keyList.sort();
		var seqInx = 0;
		// Run each sequence key in order:
		var runSequeceProxyInx = function( seqInx ){
			// Update the "sequenceProxy" var
			_this.embedPlayer.sequenceProxy.isInSequence = true;
			var key = keyList[ seqInx ] ;
			if( !sequenceProxy[key] ){
				doneCallback();
				return ;
			}
			// Run the sequence proxy function:
			sequenceProxy[ key ]( function(){

				// Done with slot increment display slot count
				_this.displayedSlotCount++;

				// done with the current proxy call next
				seqInx++;
				// Trigger the EndAdPlayback between each ad in the sequence proxy
				// ( if we have more ads to go )
				if( sequenceProxy[ keyList[ seqInx ] ] ){
					_this.embedPlayer.triggerHelper( 'AdSupport_EndAdPlayback', _this.currentAdSlotType );
				}
				// call sequence proxy inline for ad plugins sync when doing source switch
				runSequeceProxyInx( seqInx );
			});
		};
		runSequeceProxyInx( seqInx );
	},
	updateUiForAdPlayback: function( slotType ){
		if( ! slotType ){
			mw.log("Error:: please supply an ad type, " + slotType + ' provided.');
			slotType = '';
		}
		mw.log( "AdTimeline:: updateUiForAdPlayback: slotType:" + slotType );
		var embedPlayer = this.embedPlayer;

		// Set the current slot type :
		this.currentAdSlotType = slotType;
		// Stop the native embedPlayer events so we can play the preroll and bumper
		embedPlayer.stopEventPropagation();
		// TODO read the add disable control bar to ad config and check that here.
		embedPlayer.disablePlayControls();
		// Update the interface to play state:
		embedPlayer.playInterfaceUpdate();
		// make sure to hide the spinner
		embedPlayer.hideSpinnerAndPlayBtn();
		// Set inSequence property to "true"
		embedPlayer.sequenceProxy.isInSequence = true;
		// Trigger preroll started ( Note: updateUiForAdPlayback is our only
		// indicator right now that a real ad is going to play )
		// we can refactor but preroll must come before AdSupport_StartAdPlayback  )
		mw.log( 'AdTimeline:: trigger: AdSupport_' + slotType + 'Started' );
		embedPlayer.triggerHelper( 'AdSupport_' + slotType + 'Started' );

		// Trigger an ad start event once we enter an ad state
		mw.log( 'AdTimeline:: trigger: AdSupport_StartAdPlayback' );
		embedPlayer.triggerHelper( 'AdSupport_StartAdPlayback', slotType );
	},
	/**
	 * Restore a player from ad state
	 * @return
	 */
	restorePlayer: function( slotType, playedAd ){
		if( ! this.currentAdSlotType ){
			mw.log("Error:: AdTimeline missing currentAdSlotType on player restore ( assume preroll )");
			this.currentAdSlotType = 'preroll';
		}
		if( ! slotType ){
			slotType = this.currentAdSlotType ;
		}
		mw.log( "AdTimeline:: restorePlayer " );
		var embedPlayer = this.embedPlayer;
		embedPlayer.restoreEventPropagation();
		embedPlayer.enablePlayControls();
		embedPlayer.startMonitor();
		embedPlayer.seeking = false;
		// restore in sequence property;
		embedPlayer.sequenceProxy.isInSequence = false;

		// issue the ad triggers if an ad was played.
		if( playedAd ){
			// trigger an event so plugins can restore their content based actions
			mw.log( 'AdTimeline:: trigger: AdSupport_EndAdPlayback')
			embedPlayer.triggerHelper( 'AdSupport_EndAdPlayback', this.currentAdSlotType);

			// Trigger slot event ( always after AdEnd )
			mw.log( 'AdTimeline:: trigger: AdSupport_' + slotType.replace('roll', '') + 'SequenceComplete')
			embedPlayer.triggerHelper( 'AdSupport_' + slotType.replace('roll', '') + 'SequenceComplete' );
		}
	}
};

} )( window.mw, jQuery );