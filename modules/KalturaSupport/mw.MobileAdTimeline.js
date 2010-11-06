/**
 * mw.MobilePlayerTimeline handles basic timelines of clips in the mobile platform
 * 
 * MobileAdTimeline is targets VAST as the display representation and its 
 * timelineTargets support the VAST display types. Future updates may 
 * handle more ad types and timeline targets. 
 * 
 * in mobile html5 ( iOS ) to switch clips you have to do some trickery 
 * because only one video tag can be active in the page: 
 * 
 * Player src changes work with the following timeline: 
 *  issuing a "src change"
 *  then issue the "load" wait a few seconds then issue the "play"
 *  once restoring the source we need to seek to parent offset position
 *  
 * 
 */

/**
 * @param {Object} embedPlayer the embedPlayer target 
 * ( creates a mobileTimeline controller on the embedPlayer target if it does not already exist ) 
 * @param {Object} timeType Stores the target string can be 'start', 'bumper', 'end', or 'overlay'->  
 * @param {Object} displayConf DisplayConf object see mw.MobilePlayerTimeline.display
 */
mw.addAdToPlayerTimeline = function( embedPlayer, timeType, displayConf ){
	mw.log("MobileAdTimeline::Add " + timeType + ' dispCof: ' + displayConf );
	if( !embedPlayer.playerTimeline ){
		embedPlayer.playerTimeline = new mw.MobileAdTimeline( embedPlayer );
	}
	embedPlayer.playerTimeline.addToTimeline( timeType, displayConf )
}

mw.MobileAdTimeline = function( embedPlayer ){
	return this.init( embedPlayer);
}

mw.MobileAdTimeline.prototype = {		
	/**
	 * Display timeline targets: ( false by default) 
	 */
	timelineTargets : {
		preroll:false,
		bumper: false, 
		overlay: false, 
		postroll: false
	},
	
	// Overlays are disabled during preroll, bumper and postroll
	overlaysEnabled: false,
	
	// Original source of embedPlayer
	originalSrc: false,
	/**
	 * @constructor
	 * @param {Object} EmbedPlayer
	 * 		The embedPlayer object
	 */
	init: function( embedPlayer ){
		this.embedPlayer = embedPlayer;
		// Bind to the "play" and "end"
		this.bindPlayer();
	},
	
	bindPlayer: function(){		
		var _this = this;		
		// Setup the original source
		_this.originalSrc = _this.embedPlayer.getSrc();		
		$j( _this.embedPlayer ).bind( 'play', function(){	
			// Disable overlays for preroll / bumper
			_this.overlaysEnabled = false;			
			
			// Chain display of preroll and then bumper: 
			_this.display( 'preroll' , function(){		
				_this.display( 'bumper', function(){
					var vid = _this.getNativePlayerElement();
					// Enable overlays ( for monitor overlay events )
					_this.overlaysEnabled = true;		
					
					// Check if the src does not match original src if 
					// so switch back and restore original bindings
					if( _this.originalSrc != vid.src ){
						_this.switchPlaySrc( _this.originalSrc, function(){
							// Restore embedPlayer native bindings: 
							_this.embedPlayer.applyMediaElementBindings();
						})
					}								
				});
			});
		});
		
		// Monitor:
		$j( _this.embedPlayer ).bind( 'monitorEvent', function(){
			if( _this.overlaysEnabled ){
				// Check time constraints for the overlay add
				
				// @@ if the ad is an insert store the current time to seek to. 
			}
		});
		
	},
	
	/**
	 * Display a given timeline target, if the timeline target affects the 
	 * core video playback bindings, it will wait until the subclip completes
	 * before issuing the "doneCallback" 
	 * 
	 * @param {string} timeTargetType
	 * 		Identify what timeline type to be displayed. Can be: preroll, bumper, overlay, postroll
	 * @param {function} doneCallback
	 * 		The callback function called once the display request has been completed
	 */
	display: function( timeTargetType, doneCallback ){		
		var _this = this;
		mw.log("MobileAdTimeline::display:" + timeTargetType + ' val:' + this.timelineTargets[ timeTargetType ] );
		// If the displayConf is empty go directly to the callback:
		if( !this.timelineTargets[ timeTargetType ] ){
			doneCallback();
			return ;
		} 
		var displayConf = this.timelineTargets[ timeTargetType ];		
		
		// Detect the display set type and trigger its display, run the callback once complete
		if( displayConf.type == 'videoSource' ){
			if( displayConf.lockUI ){
				_this.getNativePlayerElement().controls = false;
			};
			// Play the source then run the callback
			_this.switchPlaySrc( 
				displayConf.src,
				function( videoElement ){ /* switch complete callback */					
					// Run the bind call for any bindEvents in the displayConf:  
					$j.each( displayConf.bindEvents, function( inx, bindFunction ){
						if( typeof bindFunction == 'function' ){
							bindFunction( videoElement );
						}
					});
				}, 
				doneCallback
			)
			 
		}		
	},	
	/**
	 * addToTimeline adds a given display configuration to the timelineTargets
	 *  @param {string} timeType
	 *  @param {object} displayConf
	 */
	addToTimeline: function( timeType, displayConf ){
		// Validate the timeType
		if( typeof this.timelineTargets[ timeType ] != 'undefined' ){
			// only one displayConf per timeType
			this.timelineTargets[ timeType ] = displayConf;
		}		
	},

	switchPlaySrc: function( src , switchCallback, doneCallback ){
		var _this = this;
		mw.log( 'switchPlaySrc:' + src );
		var vid = this.getNativePlayerElement();
		if( vid ){
			try{				
				// Remove all native player bindings
				$j(vid).unbind();
				vid.src = src;
				setTimeout( function(){	
					vid.load();
					vid.play();
					// Wait another 100ms then bind the end event and any custom events for the switchCallback 
					setTimeout( function(){
						$j(vid).bind( 'ended', function( event ){
							doneCallback();
						})
						if( typeof switchCallback == 'function'){
							switchCallback( vid );
						}
					}, 100)
				},100 );
			} catch( e ){
				mw.log("Error: possible error in swiching source playback");
			}
		}
	},	
	/**
	 * Get a direct ref to the inDom video element
	 */
	getNativePlayerElement: function(){
		return this.embedPlayer.getPlayerElement();
	}
}