/**
 * The Smil object  
 *
 * @copyright kaltura
 * @author: Michael Dale  mdale@wikimedia.org
 * @license GPL2
 * 
 * Sequence player wraps smil into the video tag
 * 
 * It lets you controls smil timeline like you would an html5 video tag element
 *
 * It supports frame by frame rendering of "smil"
 * Its supports basic "drop frame" live playback of "smil" 
 * 
 * Extends the "embedPlayer" and represents the playlist as a single video stream
 * 
 */
 
 /* Add the hooks needed for playback */
mw.Smil = function( options ){	
	return this.init( options );
}
mw.Smil.prototype = {

	// If smil is being loaded lazy init 
	loadingSmil: null ,
	
	// Store the mw.SmilLayout object 
	layout : null,
	
	// Stores the mw.SmilBody object
	body : null,
	
	
	/** 
	* Constructor
	* @param {Object} options Set of options for the smil interface 
	*/
	init: function( options ) {

	},
	
	/** 
	* Load smil into this object from a url 
	* @parm {string} url Source url of smil XML
	* @param {function} callback Function to call once smil is loaded and ready 
	*/
	loadFromUrl: function( url , callback ) {
		var _this = this;
		mw.log( 'Smil: loadFromUrl : ' + url );
		// Set the loading flag to true: 
		this.loadingSmil = true;		
		
		// Try for direct load ( api cross domain loading is handled outside of SmilInterface
		$j.get( url, function( data ) {
			_this.loadFromString( data );
			// XXX check success or falure
			callback();
		});
	},
	
	/**
	* Set smil from xml string 
	* @param {string} SmilXmlString Xml string of smil to be processed 
	*/
	loadFromString: function ( smilXmlString ){		
		// Load the parsed string into the local "dom"
		this.$dom = $j( smilXmlString );
		
		// Clear out the layout
		this.layout = null;
		
		// Clear out the body 
		this.body = null;	
	},
	
	/**
	* Internal function to get the jQuery smil dom 
	*/
	getDom: function() {
		if( this.$dom ) {
			return this.$dom;
		}
		mw.log( "Error SMIL Dom not available " ) ;
		return ;
	},
	
	/**
	*  Get the smil html at a given time 
	* @param {object} size The target size width, height
	* @param {float} time The target time to be displayed
	*/
	getHtmlDOM: function ( size, time ){		
		if( !this.layout ){			
			this.layout = new mw.SmilLayout( this.getDom().find( 'layout' ) );
		}		
		if( !this.body ){
			this.body = new mw.SmilBody( this.getDom().find( 'body' ) );
		}
		// Get the layout DOM
		$layoutDOM = this.layout.getHtmlDOM( { 'width': size.width, 'height': size.height });
		
		mw.log( "mw.Smil :: getHtmlDOM :: " );
		// Have the body object update the layoutDOM for its given time. 		
		return this.body.updateLayout( $layoutDOM );
	}
}


  