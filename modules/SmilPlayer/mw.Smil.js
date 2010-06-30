/**
 * The Smil object  
 *
 * @copyright kaltura
 * @author: Michael Dale  mdale@wikimedia.org
 * @license GPL2
 * 
 * Sequence player wraps smil into the video tag
 * 
 * Provides an html5 video tag like api to a smil document. 
 *
 * Supports frame by frame rendering of "smil"
 * Supports "drop frame" realtime playback of "smil" 
 * 
 * Extends the "embedPlayer" and represents the playlist as a single video stream
 * 
 */
 
 /* Add the hooks needed for playback */
mw.Smil = function( options ){	
	return this.init( options );
}
mw.Smil.prototype = {
	
	// Store the mw.SmilLayout object 
	layout : null,
	
	// Stores the mw.SmilBody object
	body : null,
	
	// Stores the mw.SmilBuffer object
	buffer: null,
	
	// Stores the mw.SmilAnimate object  
	animate: null, 
	
	// Stores the mw.SmilTransisions object
	transitions: null,
	
	// Stores the smil document for this object ( for relative image paths ) 
	smilUrl: null,
	
	// The abstract embeed player parent 
	embedPlayer: null,
	
	/** 
	* Constructor
	* @param {Object} embedPlayer Reference to the embedPlayer driving the smil object 
	*/
	init: function( embedPlayer ) {
		mw.log(" Smil:: init with player: " +  embedPlayer.id );
		this.embedPlayer = embedPlayer;
	},
	
	/** 
	* Load smil into this object from a url 
	* @parm {string} url Source url of smil XML
	* @param {function} callback Function to call once smil is loaded and ready 
	*/
	loadFromUrl: function( url , callback ) {
		var _this = this;
		this.smilUrl = url; 
		mw.log( 'Smil::loadFromUrl : ' + url );		
		
		// Try for direct load ( api cross domain loading is handled outside of SmilInterface
		$j.get( url, function( data ) {		 
			_this.loadFromString( data );
			// XXX check success or failure
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
		
		mw.log( "Smil::loadFromString: loaded smil dom: " + this.$dom );
		
		// Clear out the layout
		this.layout = null;
		
		// Clear out the body 
		this.body = null;
		
		// Clear out the top level duration
		this.duration = null;
		
		// Clear out the "buffer" object
		this.buffer = null;
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
	
		
	renderTime: function( time, callback ) {
		// Get the render target: 
		var $renderTarget = this.embedPlayer.getRenderTarget();
		
		// Add the core layout ( not time based )		
		$renderTarget.append( 
			this.getLayout().getHtml()
		)
		
		// Update the render target with bodyElements for the requested time
		this.getBody().renderTime( time );
				
		// Wait until buffer is ready and run the callback
	    this.getBuffer().addAssetsReadyCallback( callback );
	},
	
	/**
	* We use animateTime instead of a tight framerate loop
	* so that we can optimize with css transformations
	* 
	*/
	animateTime: function( time, timeDelta ){		
		//mw.log("Smil::animateTime: " + time + ' delta: ' + timeDelta ); 	
		this.getBody().renderTime( time, timeDelta );
	},
	
	/**
	* Get the smil buffer object
	*/
	getBuffer: function(){
		if( ! this.buffer ) {
			this.buffer = new mw.SmilBuffer( this ) ;
		}
		return this.buffer; 
	},
	
	/**
	* Get the animate object
	*/ 
	getAnimate: function(){
		if( ! this.animate ){
			this.animate = new mw.SmilAnimate( this );
		}
		return this.animate;
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
	 * Get the transitions object
	 */
	getTransitions: function(){
		if( !this.transitions ){
			this.transitions = new mw.SmilTransitions( this );
		}
		return this.transitions;
	},
	
	/** 
	 * Function called continuously to keep sync smil "in sync" 
	 * Checks buffer states... 
	 */
	syncWithTime: function( time ){
		/* .. not yet implementd ... */
		mw.log( 'smil sync: ' + time);
	},
	
	
	/**
	 * Get the duration form the smil body
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
	},
		
	/**
	 * Some Smil Utility functions
	 */
	
	/**
	* maps a smil element id to a html safe id 
	* as a decedent subname of the embedPlayer parent
	*
	* @param {Object} smilElement Element to get id for
	*/  
	getAssetId: function( smilElement ){
		if(! $j( smilElement ).attr('id') ) {
			mw.log("Error: getAssetId smilElement missing id " ) ;
			return false; 
		}
		if( ! this.embedPlayer ||  ! this.embedPlayer.id ) {
			mw.log("Error: getAssetId missing parent embedPlayer");
			return false;
		}
		return this.embedPlayer.id + '_' + $j( smilElement ).attr('id');
	},
	
	/**
	* Get an absolute path to asset based on the smil URL
	* @param {string} assetPath Path to asset to be transformed into url
	*/ 
	getAssetUrl: function( assetPath ){		
		// Context url is the smil document url: 		
		var contextUrl = mw.absoluteUrl( this.smilUrl );		
		return mw.absoluteUrl( assetPath, contextUrl );
	},
	
	/**
	 * Get the smil resource type based on nodeName and type attribute
	 */
	getRefType: function( smilElement ) {		
		if( $j( smilElement ).length == 0 ){
			mw.log('Error: Smil::getRefType on empty smilElement');
			return;
		}
		// Get the smil type
		var smilType = $j( smilElement ).get(0).nodeName.toLowerCase();	
		if( smilType == 'ref' ){
			// If the smilType is ref, check for a content type
			switch( $j( smilElement ).attr( 'type' ) ) {
				case 'text/html':
					smilType = 'cdata_html';
				break;
				case 'video/ogg':
				case 'video/h.264':
				case 'video/webm':
					smilType = 'video';
				break;
			}
		}
		return smilType;
	},
	
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
	parseTime : function( timeValue ){
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
}



  