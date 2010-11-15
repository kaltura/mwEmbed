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
	
	// Flag to store if its the first time play is being called:
	firstPlay: true,
	
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
			
			// Check if this is the "first play" request:
			if( !_this.firstPlay ){
				return 
			}
			_this.firstPlay = false;
			mw.log("MobileAdTimeline:: First Play Start Ad timeline");
			
			// Disable overlays for preroll / bumper
			_this.overlaysEnabled = false;			

			//Stop the native embedPlayer events so we can play the preroll and bumper
			_this.embedPlayer.stopEventPropagation();

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
							_this.embedPlayer.restoreEventPropagation();
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
		if( displayConf.videoFile ){
			if( displayConf.lockUI ){
				// this actually does not work so well in iOS world:
				_this.getNativePlayerElement().controls = false;
			};
			// Play the source then run the callback
			_this.switchPlaySrc( 
				displayConf.videoFile,
				function( videoElement ){ /* switch complete callback */					
					// Run the bind call for any bindEvents in the displayConf:  
					/*$j.each( displayConf.bindEvents, function( inx, bindFunction ){
						if( typeof bindFunction == 'function' ){
							bindFunction( videoElement );
						}
					});
					*/
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
	/**
	 * switchPlaySrc switches the player source working around a few bugs in browsers
	 * 
	 * @param {string} src
	 * 		Video url Source to switch to. 
	 * @param {function} switchCallback
	 * 		Function to call once the source has been switched
	 * @param {function} doneCallback
	 * 		Function to call once the clip has completed playback
	 */
	switchPlaySrc: function( src , switchCallback, doneCallback ){
		var _this = this;
		mw.log( 'MobileAdTimeline:: switchPlaySrc:' + src );
		var vid = this.getNativePlayerElement();
		if( vid ){
			try{
				// Remove all native player bindings
				$j( vid ).unbind();				
				vid.pause();	
				
				// Local scope update source and play function to work around google chrome bug
				var updateSrcAndPlay = function(){
					vid.src = src;
					// Give iOS 50ms to figure out the src got updated ( iPad OS 3.0 ) 
					setTimeout( function(){
						vid.load();
						vid.play();
						// Wait another 50ms then bind the end event and any custom events for the switchCallback 
						setTimeout( function(){
							$j(vid).bind( 'ended', function( event ){			
								doneCallback();
							})
							if( typeof switchCallback == 'function'){
								switchCallback( vid );
							}
						}, 50 );
					}, 50 );
				};			
				if(  navigator.userAgent.toLowerCase().indexOf('chrome') != -1  ){
					// Null the src and wait 50ms ( helps unload video without crashing google chrome 7.x )
					vid.src = '';	
					setTimeout( updateSrcAndPlay, 100 );
				} else {
					updateSrcAndPlay();
				}				
			} catch( e ){
				mw.log("Error: Error in swiching source playback");
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