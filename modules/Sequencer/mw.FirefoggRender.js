/*
* Handles driving the firefogg render system 
*/

/*
* Set the jQuery bindings: 
*/ 
( function( $ ) {
	$.fn.firefoggRender = function( options, callback ) {
		options.player_target = this.selector;
		var myFogg = new mw.FirefoggRender( options );
		return myFogg;
	}		
} )( jQuery );


var default_render_options = {
	"videoQuality" : 8,
	"framerate"	: 30
}

var default_FirefoggRender_options = {
	start_time:0,
	// if we should save to disk (if false setup upload stuff below) 
	save_to_disk:true
	
}
mw.FirefoggRender = function( options ) {
	return this.init( options );
};
// Set up the mvPlaylist object
mw.FirefoggRender.prototype = {
	
	// Default empty render options: 
	renderOptions: { },
	
	// Render time
	render_time: null,
	
	// The interval time ( set via requested framerate) 
	interval: null,
	
	// Continue rendering
	continue_rendering:false,
	
	// Constructor 
	init:function( options ) {
		var _this = this;
		
		// Grab the mvFirefogg object to do basic tests
		this.myFogg = new mw.Firefogg( {
			'only_fogg':true
		});
		
		// Check for firefogg:
		if ( this.myFogg.getFirefogg() ) {
			this.enabled = true;
		} else {
			this.enabled = false;
			mw.log('Error firefogg not installed');
			return this;
		}
		
		// Setup local fogg pointer: 
		this.fogg = this.myFogg.fogg;
		
		// Setup player instance		
		this.player_target = options.player_target;		
		
		// Extend the render options with any provided details
		if( options['render_options'] )
			$j.extend(this.renderOptions, default_render_options,  options['render_options']);
		
		// If no height width provided use target DOM width/height
		if( !this.renderOptions.width && !this.renderOptions.height ) {
			this.renderOptions.width = $j(this.player_target).width();
			this.renderOptions.height = $j(this.player_target).height();
		}		
		
		// Setup the application options (with defaults) 
		for ( var i in default_FirefoggRender_options ) {
			if ( options[ i ] ) {
				this[ i ] = options[ i ];
			} else {
				this[ i ] = default_FirefoggRender_options[i];
			}
		}
		
		// Should be externally controlled		
		if ( options.target_startRender ) {
			$j( options.target_startRender ).click( function() {
				mw.log( "Start render" );
				_this.startRender();
			} )
			this.target_startRender = options.target_startRender;
		}
		// Bind stopRender target button
		if ( options.target_stopRender ) {
			$j( options.target_stopRender ).click( function() {
				_this.stopRender();
			} )
			this.target_stopRender = options.target_stopRender;
		}
		if ( options.target_timeStatus ) {
			this.target_timeStatus = options.target_timeStatus;
		}
	},
	
	// Start rendering
	startRender: function() {
		var _this = this;
		
		// Set the render time to "start_time" of the render request
		this.render_time = this.start_time;
		
		// Get the interval from renderOptions framerate
		this.interval =  1 / this.renderOptions.framerate
		
		// Set the continue rendering flag to true:
		this.continue_rendering = true;
		
		// Get the player:
		this.player = $j( this.player_target ).get( 0 );

		// Set a target file:
		mw.log( "Firefogg Render Settings:" + JSON.stringify( _this.renderOptions ) );
		this.fogg.initRender(  JSON.stringify( _this.renderOptions ), 'foggRender.ogv' );
		
		$j( this.target_timeStatus ).val( "loading player" );
			
		// add audio if we had any:
							
		// issue a load request on the player:
		this.player.load(function() {
			$j( this.target_timeStatus ).val( "player ready" );
			//now issue the save video as call
			_this.fogg.saveVideoAs();		
			_this.doNextFrame();
		});
	},
	
	/**
	* Do the next frame in the render target
	*/
	doNextFrame: function() {
		var _this = this;
		// internal function to handle updates:						
		$j( _this.target_timeStatus ).val( " on " + ( Math.round( _this.render_time * 10 ) / 10 ) + " of " +
			( Math.round( _this.player.getDuration() * 10 ) / 10 ) );
			
		_this.player.setCurrentTime( _this.render_time, function() {					
			//mw.log(	'addFrame:' + $j( _this.player_target ).attr( 'id' ) );		
			_this.fogg.addFrame( $j( _this.player_target ).attr( 'id' ) );
			_this.render_time += _this.interval;				
			if ( _this.render_time >= _this.player.getDuration() || ! _this.continue_rendering ) {
				_this.doFinalRender();
			} else {			
				_this.doNextFrame();			
			}
		} );
	},
	
	/**	
	* Stop the current render proccess on the next frame
	*/
	stopRender: function() {
		this.continue_rendering = false;
	},
	
	/**
	* Issue the call to firefogg to render out the ogg video
	*/ 
	doFinalRender: function() {
		var _this = this;
		mw.log( " do final render: " );
		$j( this.target_timeStatus ).val( "doing final render" );
		this.fogg.render();
		this.updateStatus();
	},
	
	/**
	* Update the render status
	*/
	updateStatus: function() {
		var _this = this;
		var rstatus = _this.fogg.renderstatus()
	    $j( _this.target_timeStatus ).val( rstatus );
	    if ( rstatus != 'done' && rstatus != 'rendering failed' ) {
	        setTimeout( function() {
	        	_this.updateStatus();
	        }, 100 );
	    } else {
	        $j( _this.target_startRender ).attr( "disabled", false );
	    }
	}
}