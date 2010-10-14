
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
 */

/**
 * @param {Object} embedPlayer the embedPlayer target 
 * ( creates a mobileTimeline controller on the embedPlayer target if it does not already exist ) 
 * @param {Object} target Stores the target string can be 'start', 'bumper', 'end', or {Overlay Object}->  
 * @param {Object} 
 */
mw.addToPlayerTimeline( embedPlayer, displayTime, displaySet ){
	if( !embedPlayer.playerTimeline ){
		embedPlayer.playerTimeline = new mw.MobilePlayerTimeline();
	}
	embedPlayer.playerTimeline.addToTimeline( displayTime, displaySet )
}

mw.MobilePlayerTimeline = function( embedPlayer ){
	return this.init( embedPlayer);
}

mw.MobilePlayerTimeline.prototype = {
		
	/**
	 * Display timeline targets: ( false by default) 
	 */
	preroll:false,
	bumper: false, 
	overlay: false, 
	postroll: false, 
	
	// Overlays are disabled during preroll, bumper and postroll
	overlaysEnabled: false
	
	init: function( embedPlayer ){
		this.embedPlayer = embedPlayer;
		// bind to the "play" and "end"
		this.bindPlayer();
	},
	
	bindPlayer: function(){
		
		var _this = this;
		
		$j( _this.embedPlayer ).bind( 'play', function(){
			
			// Disable overlays for preroll / bumper
			_this.overlaysEnabled = false;			
			
			// Chain display of preroll and then bumper: 
			_this.display( _this.preroll , function(){				
				_this.display( _this.bumper, function(){
					// Enable overlays ( for monitor overlay events )
					_this.overlaysEnabled = true;					
				});
			});
		});
		
		// Monitor:
		$j( _this.embedPlayer ).bind( 'monitorEvent', function(){
			if( _this.overlaysEnabled ){
				// Check time constraints for the overlay add
			}
		});
		
	},
	
	display: function( displaySet, callback ){
		var _this = this;
		// If the displaySet is empty go directly to the callback: 
		if( !displaySet ){
			callback();
		}
		
		// Detect the display set type and trigger its display, run the callback once complete
		if( displaySet.type == 'videoSource' ){
			if( displaySet.lockUI ){
				_this.getNativePlayerElement().controls = false;
			}
			// Play the source then run the callback
			_this.switchPlaySrc( displaySet.src, callback )
			return; 
		}
		
	},
	
	addToTimeline: function( timeType, displaySet ){
		// switch on 
		
	},
	
	insertAndPlaySource: function( displaySet ){
		mw.log("NativeEmbed:: insertAndPlaySource: " + src  + ' insertAndPlayingConfig:' + this.insertAndPlayingConfig);
		
		
		// Make sure to capture the original source
		if( ! this.insertAndPlayingConfig ){
			//alert( 'setup this.insertAndPlayingConfig ');
			this.insertAndPlayingConfig = {
				'src' : embedPlayer.getSrc(),
				'time' : embedPlayer.currentTime,
				'callback' : options.callback,
				'restoreControls' : options.lockUI
			}
		}		
		// Try to directly playback the source 
		this.switchSrc( src );		
	},
	
	restoreSourcePlayback: function( ){
		var _this = this;
		mw.log( "RestoreSourcePlayback:: empty out insertAndPlayingConfig" );		
		if( !this.insertAndPlayingConfig) {
			mw.log("Error: called restored playback with empty insertAndPlayingConfig")
			return;
		}			
		this.switchSrc( this.insertAndPlayingConfig.src );		

		// Remove insert and playing config flag
		this.insertAndPlayingConfig = false;				
		
		var time = this.insertAndPlayingConfig.time;
		var callback = this.insertAndPlayingConfig.callback;
		
		// run the seek: 
		this.setCurrentTime( time ,function(){			
			if( this.insertAndPlayingConfig.restoreControls ){
				this.playerElement.controls = true;
			}			
		});
		
		//alert("insertAndPlayingConfig:: " + this.insertAndPlayingConfig);
		// Run the callback 
		if( callback ){
			callback();
		}
	},
	switchPlaySrc: function( src , callback ){
		mw.log( 'switchSrc' )
		var vid = this.getNativePlayerElement();
		if( vid ){
			try{
				vid.src = src;
				setTimeout( function(){	
					vid.load();
					vid.play();
					// wait another 100ms then bind the end event: 
					vid
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