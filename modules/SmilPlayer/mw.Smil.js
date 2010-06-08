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
		
		// Clear out the top level duration
		this.duration = null;
	},
	
	/**
	* Internal function to get the jQuery smil dom 
	*/
	getDom: function() {
		if( this.$dom ) {
			return this.$dom;
		}
		mw.log( "Error SMIL Dom not available" ) ;
		return ;
	},
	
	/**
	* Get the smil html at a given time 
	* @param {object} size The target size width, height
	* @param {float} time The target time to be displayed
	*/
	getHtmlDOM: function ( size, time ){		
		mw.log("getHtmlDOM:: " + size.width + ' time: ' + time);
		
		// Have the layout object return the layout HTML DOM					
		return this.getLayout().getHtmlDOM( size, time );
	},
	
	/**
	 * Get the smil layout object, with reference to the body 
	 */
	getLayout: function() {
		if( !this.layout ) {
			this.layout = new mw.SmilLayout( this );
		}
		return this.layout;
	},
	
	/**
	 * Get the smil body object
	 */
	getBody: function(){		
		if( !this.body ){
			this.body = new mw.SmilBody( this );
		}
		return this.body;
	},
	
	/**
	 * Get the duration form the 
	 */
	getDuration: function(){
		// return 0 while we don't have the $dom loaded
		if( !this.$dom ){
			return 0;
		}
		
		if( !this.duration ){
			this.duration = this.getBody().getDuration();
		}
		return this.duration;		
	}
}
/**
 * Some Utility functions
 */

/** 
 * Parse smil time function
 * http://www.w3.org/TR/SMIL3/smil-timing.html#Timing-ClockValueSyntax
 * 
 * Smil time has the following structure: 
 *  
 * Clock-value         ::= ( Full-clock-value | Partial-clock-value | Timecount-value )
 * Full-clock-value    ::= Hours ":" Minutes ":" Seconds ("." Fraction)?
 * Partial-clock-value ::= Minutes ":" Seconds ("." Fraction)?
 * Timecount-value     ::= Timecount ("." Fraction)? (Metric)?
 * Metric              ::= "h" | "min" | "s" | "ms"
 * Hours               ::= DIGIT+ // any positive number 
 * Minutes             ::= 2DIGIT // range from 00 to 59 
 * Seconds             ::= 2DIGIT // range from 00 to 59 
 * Fraction            ::= DIGIT+
 * Timecount           ::= DIGIT+
 * 2DIGIT              ::= DIGIT DIGIT
 * DIGIT               ::= [0-9]
 * 
 * @param {mixed} timeValue time value of smil structure
 * @ return {float} Seconds from time value 
 */
mw.SmilParseTime =  function( timeValue ){
	// If timeValue is already a number return seconds: 
	if( ! isNaN( timeValue ) ){
		return parseFloat( timeValue );
	}
	// Trim whitespace
	timeValue = $j.trim( timeValue );

	// First check for hh:mm:ss time: 
	if ( timeValue.split( ':' ).length == 3 ||  timeValue.split( ':' ).length == 2 ) {
		return mw.npt2seconds( timeValue );
	}
	
	var timeFactor = null
	// Check for metric hours
	if( timeValue.substr( -1 ) == 'h' ){
		timeFactor = 3600 ;
	}
	// Min metric
	if( timeValue.substr( -3 ) == 'min' ){
		timeFactor = 60;
	}
	// Seconds 
	if( timeValue.substr( -1 ) == 's'){
		timeFactor = 1;
	}
	// Millaseconds
	if( timeValue.substr( -2 ) == 'ms'){
		timeFactor = .001;
	}
	
	if( timeFactor){
		return parseFloat( parseFloat( timeValue ) * timeFactor );
	}
	mw.log("Error could not parse time: " + timeValue);
}


  