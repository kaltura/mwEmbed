
/**
 * mw.MobilePlayerTimeline handles basic timelines of clips in the mobile platform
 * 
 * in mobile html5 ( iOS ) to switch clips you have to do some trickery 
 * because only one video tag can be active in the page: 
 * 
 * Source changes work via: 
 *  issuing a "src change"
 *  then issue the "load" wait a few seconds then issue the "play"
 *  once restoring the source we need to seek to parent offset position
 *  
 * MobileAdTimeline is targets VAST as the display representation 
 */

/**
 * @param {Object} embedPlayer the embedPlayer target 
 * ( creates a mobileTimeline controller on the embedPlayer target if it does not already exist ) 
 * @param {Object} timeType Stores the target string can be 'start', 'bumper', 'end', or 'overlay'->  
 * @param {Object} displayConf DisplayConf object see mw.MobilePlayerTimeline.display
 */
mw.addAdToPlayerTimeline = function( embedPlayer, timeType, displayConf ){
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
	
	init: function( embedPlayer ){
		this.embedPlayer = embedPlayer;
		// bind to the "play" and "end"
		this.bindPlayer();
	},
	
	bindPlayer: function(){		
		alert("bind Player");
		var _this = this;		
		// Setup the original source
		_this.originalSrc = _this.embedPlayer.getSrc();		
		$j( _this.embedPlayer ).bind( 'play', function(){	
			alert('moblie tl play');
			// Disable overlays for preroll / bumper
			_this.overlaysEnabled = false;			
			
			// Chain display of preroll and then bumper: 
			_this.display( 'preroll' , function(){				
				_this.display( 'bumper', function(){
					var vid = this.getNativePlayerElement();
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
	
	display: function( timeTargetType, doneCallback ){		
		var _this = this;
		// If the displayConf is empty go directly to the callback:
		if( !this.timelineTargets[ timeTargetType ] ){
			callback();
			return ;
		} 
		var displayConf = this.timelineTargets[ timeTargetType ];		
		
		// Detect the display set type and trigger its display, run the callback once complete
		if( displayConf.type == 'videoSource' ){
			if( displayConf.lockUI ){
				_this.getNativePlayerElement().controls = false;
			}
			// Play the source then run the callback
			_this.switchPlaySrc( 
				displayConf.src,
				function(){ /* switch complete callback */
					if(  displayConf.events ) {
						_this.bindAdEvents(  displayConf.events );
					}					
				}, 
				doneCallback 
			)
			 
		}
		if( displayConf.type == 'vast' ){
			// handle all vast features with provided 'timeTargetType' 
		}
		
	},
	bindAdEvents: function ( adEvents ){
		// Add any displayConf bindings ( like ad event inserts )
		if( adEvents ){
			for( var i =0; i < adEvents.length; i++ ){
				//@@todo add each event trigger
			}
		}
	},
	
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
				// remove all native player bindings
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
							switchCallback();
						}
					}, 100)
				},100 );
			} catch( e ){
				mw.log("Error: possible error in swiching source playback");
			}
		}
	},	
	getNativePlayerElement: function(){
		return this.embedPlayer.getPlayerElement();
	}
}