
/**
* Extends EmbedPlayer to wrap smil playback in the html5 video tag abstraction. 
*/

//Get all our message text
mw.includeAllModuleMessages();

// Setup the EmbedPlayerSmil object:
mw.EmbedPlayerSmil = {

	// Instance Name
	instanceOf: 'Smil',
	
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
		// Set "loading" here:
		$j( this ).html( 	
			$j( '<div />')
			.attr('id', 'smilCanvas_' + this.id )
			.css( {
				'width' : '100%',
				'height' : '100%',
				'position' : 'relative'
			})	
		);		
		// Add a loading spinner if we don't already have one		
		/*if( $j('#loadingSpinner_' + this.id ).length ){
			$j('#smilCanvas_' + this.id ).loadingSpinner();
		}*/
		
		// Update the embed player
		this.getSmil( function( smil ){				
			// XXX might want to move this into mw.SMIL
			$j( _this ).html( 
				smil.getHtmlDOM( {
					'width': _this.getWidth(), 
					'height': _this.getHeight() 
				} )
			)
		});
		
	},
	
	getSmil: function( callback ){
		if( !this.smil ) {
			// Create the Smil engine object 
			this.smil = new mw.Smil();
			
			// Load the smil 
			this.smil.loadFromUrl( this.getSrc(), function(){
				callback( this.smil ); 
			});
		} else { 
			callback( this.smil );
		}
	},
	
	getDuration: function(){
		if( this.smil ){
			return this.smil.getDuration();
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
	* update the thumbnail html
	*/
	updateThumbnailHTML: function() {
		// If we have a "poster" use that;		
		if(  this.poster ){
			this.parent_updateThumbnailHTML();
			return ;
		}
		// If no thumb could be generated use the first frame of smil: 
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
