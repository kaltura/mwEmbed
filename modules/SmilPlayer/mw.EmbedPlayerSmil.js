/**
* Extends EmbedPlayer to wrap smil playback in the html5 video tag abstraction. 
*/

//Get all our message text
mw.includeAllModuleMessages();

// Setup the EmbedPlayerSmil object:
mw.EmbedPlayerSmil = {

	// Instance Name
	instanceOf: 'Smil',
	
	// The jQuery target location to render smil html
	$renderTarget: null, 
	
	// Player supported feature set
	supports: {
		'playHead' : true,
		'pause' : true,
		'fullscreen' : true,
		'timeDisplay' : true,
		'volumeControl' : true,
		
		'overlays' : true
	},	
	 	
	/**
	* Put the embed player into the container
	*/
	doEmbedPlayer: function() {
		var _this = this;
		mw.log("EmbedPlayerSmil::doEmbedPlayer: " + this.id ) ;
		
		// Set "loading" spinner here) 
		 
		// Update the embed player by rending time zero: 
		this.getSmil( function( smil ){				
			mw.log("EmbedPlayer:: smil loaded " );
			// Render the first frame	
			smil.renderTime( 0, function(){
				mw.log("EmbedPlayerSmil::doEmbedPlayer:: render callback ready " ); 
			} );
		});					
	},
	
	/**
	* Return the render target for output of smil html
	*/
	getRenderTarget: function(){
		if( !this.$renderTarget ){
			if( $j('#smilCanvas_' + this.id ).length === 0  ) {
				// if no render target exist create one: 
				$j( this ).html( 	
					$j( '<div />')
					.attr('id', 'smilCanvas_' + this.id )
					.css( {
						'width' : '100%',
						'height' : '100%',
						'position' : 'relative'
					})	
				);
			}
			this.$renderTarget =  $j('#smilCanvas_' + this.id );
		}
		return this.$renderTarget;
		
	},
	
	play: function(){
		mw.log("EmbedPlayerSmil::play (not yet supported)" );
	},
	/**
	* Get the smil object. If the smil object does not exist create one with the source url:
	* @param callback 
	*/
	getSmil: function( callback ){
		if( !this.smil ) {
			// Create the Smil engine object 
			this.smil = new mw.Smil( this );
			
			// Load the smil 
			this.smil.loadFromUrl( this.getSrc(), function(){
				callback( this.smil ); 
			});
		} else { 
			callback( this.smil );
		}
	},
	
	/**
	* Get the duration of smil document. 
	*/
	getDuration: function(){		
		if( this.smil ){
			return this.smil.getDuration();
		} else {
			return this.parent_getDuration();
		}
	},
	
	/**
	* Return the virtual canvas element
	*/ 
	getPlayerElement: function(){
		// return the virtual canvas
		return $j( 'smilCanvas_' + this.id ).get(0);
	},
	
	/**
	* Update the thumbnail html
	*/
	updatePosterHTML: function() {
		// If we have a "poster" use that;		
		if(  this.poster ){
			this.parent_updatePosterHTML();
			return ;
		}
		// If no thumb could be found use the first frame of smil: 
		this.doEmbedPlayer(); 
	},

	/**
	 * Seeks to the requested time and issues a callback when ready / displayed
	 * @param {float} time Time in seconds to seek to
	 * @param {function} callback Function to be called once currentTime is loaded and displayed 
	 */
	setCurrentTime : function( time, callback ) {
		
	}
}
