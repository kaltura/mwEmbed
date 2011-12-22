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
		_this.originalSrc = embedPlayer.getSrc();
		// Clear out any old bindings
		_this.destroy();
		// Create an empty sequence proxy object ( stores information about the current sequence ) 
		embedPlayer.sequenceProxy = {};
		
		// On change media clear out any old adTimeline bindings
		embedPlayer.bindHelper( 'onChangeMedia' + _this.bindPostfix, function(){
			_this.destroy();
		});
		
		// Rest displayed slot count
		_this.displayedSlotCount = 0;
		
		// On play preSequence
		embedPlayer.bindHelper( 'preSequence' + _this.bindPostfix, function() {
			mw.log( "AdTimeline:: First Play Start / bind Ad timeline ( " );
			embedPlayer.pauseLoading();
			embedPlayer.sequenceProxy.isInSequence = true;
			// given an opportunity for ads to load for ads to load: 
			embedPlayer.triggerQueueCallback( 'AdSupport_OnPlayAdLoad',function(){
				mw.log( "AdTimeline:: AdSupport_OnPlayAdLoad ");
				// Show prerolls:
				_this.displaySlots( 'preroll', function(){
					// Show bumpers:
					_this.displaySlots( 'bumper', function(){
						// restore the original source:
						embedPlayer.switchPlaySrc( _this.originalSrc, function(){
							// turn off preSequence
							embedPlayer.sequenceProxy.isInSequence = false;
							
							// trigger the preSequenceComplete event
							embedPlayer.triggerHelper( 'preSequenceComplete' );
							
							// Avoid function stack
							setTimeout(function(){ 
								// trigger another onplay ( to match the kaltura kdp ) on play event
								// after the ad plays are compelete
								if( _this.displayedSlotCount > 0 ){
									// reset displaySlotCount: 
									 _this.displayedSlotCount=0;
									// Restore the player if we played an ad: 
									_this.restorePlayer();
									
									embedPlayer.triggerHelper( 'onplay' );
								}
								// Continue playback
								embedPlayer.play();
							},0);
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
			embedPlayer.onDoneInterfaceFlag = false;
			
			// Display post roll in setTimeout ( hack to work around end sequence issues ) 
			// should be refactored. 
			setTimeout(function(){
				// Trigger the postSequenceStart event
				// start the postSequence: 
				embedPlayer.triggerHelper( 'postSequence' );
				embedPlayer.sequenceProxy.isInSequence = true;
				_this.displaySlots( 'postroll', function(){
					// Turn off preSequence
					embedPlayer.sequenceProxy.isInSequence = false;
					// Trigger the postSequenceComplete event
					embedPlayer.triggerHelper( 'postSequenceComplete' );

					/** TODO support postroll bumper and leave behind */
					if( playedAnAdFlag ){
						embedPlayer.switchPlaySrc( _this.originalSrc, function(){
								_this.restorePlayer();
								// Restore ondone interface: 
								embedPlayer.onDoneInterfaceFlag = true;
								// Run the clipdone event:
								embedPlayer.onClipDone();
						});
					} else {
						_this.restorePlayer();
						// Restore ondone interface: 
						embedPlayer.onDoneInterfaceFlag = true;
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
		var sequenceProxy = {};
		
		// Get the sequence ad set
		_this.embedPlayer.triggerHelper( 'AdSupport_' + slotType,  [ sequenceProxy ] );
		
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
					_this.embedPlayer.triggerHelper( 'AdSupport_EndAdPlayback' );
				}
				// call with a timeout to avoid function stack
				setTimeout(function(){
					runSequeceProxyInx( seqInx );
				}, 0 );
			});
			
			// Update the interface for ads: 
			_this.updateUiForAdPlayback( slotType );
		};
		runSequeceProxyInx( seqInx );
	},
	updateUiForAdPlayback: function( slotType ){
		mw.log( "AdTimeline:: updateUiForAdPlayback " );
		var embedPlayer = this.embedPlayer;
		// Stop the native embedPlayer events so we can play the preroll and bumper
		embedPlayer.stopEventPropagation();
		// TODO read the add disable control bar to ad config and check that here. 
		embedPlayer.disablePlayControls();
		// Update the interface to play state:
		embedPlayer.playInterfaceUpdate();
		// make sure to hide the spinner
		embedPlayer.hidePlayerSpinner();
		// Set inSequence property to "true" 
		embedPlayer.sequenceProxy.isInSequence = true;
		// Trigger an ad start event once we enter an ad state
		embedPlayer.triggerHelper( 'AdSupport_StartAdPlayback', slotType );
	},
	/**
	 * Restore a player from ad state
	 * @return
	 */
	restorePlayer: function(  ){
		mw.log( "AdTimeline:: restorePlayer " );
		var embedPlayer = this.embedPlayer;
		embedPlayer.restoreEventPropagation();
		embedPlayer.enablePlayControls();
		embedPlayer.monitor();
		embedPlayer.seeking = false;
		// restore in sequence property; 
		embedPlayer.sequenceProxy.isInSequence = false;
		// trigger an event so plugins can restore their content based actions
		embedPlayer.triggerHelper( 'AdSupport_EndAdPlayback');
	}
};

} )( window.mw, jQuery );