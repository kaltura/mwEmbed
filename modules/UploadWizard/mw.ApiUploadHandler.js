/**
 * An attempt to refactor out the stuff that does API-via-iframe transport
 * In the hopes that this will eventually work for AddMediaWizard too
 */

// n.b. if there are message strings, or any assumption about HTML structure of the form.
// then we probably did it wrong

/**
 * Represents an object which configures a form to upload its files via an iframe talking to the MediaWiki API.
 * @param an UploadInterface object, which contains a .form property which points to a real HTML form in the DOM
 */
mw.ApiUploadHandler = function( upload ) {
	var _this = this;
	_this.upload = upload;

	_this.configureForm();

	// hardcoded for now
	// can also use Xhr Binary depending on config
	_this.transport = new mw.IframeTransport(
		_this.upload.ui.form, 
		function( fraction ){ _this.upload.setTransportProgress( fraction ) },
		function( result ) { _this.upload.setTransported( result ) }
	);

};

mw.ApiUploadHandler.prototype = {
	/**
	 * Configure an HTML form so that it will submit its files to our transport (an iframe)
	 * with proper params for the API
	 * @param callback
	 */
	configureForm: function() {
		var apiUrl = mw.getLocalApiUrl(); // XXX or? throw new Error( "configuration", "no API url" );
		if ( ! ( mw.getConfig( 'token' ) ) ) {
			throw new Error( "configuration", "no edit token" );	
		}

		var _this = this;
		mw.log( "configuring form for Upload API" );

		// Set the form action
		try {
			$j( _this.upload.ui.form ) 	
				.attr( 'action', apiUrl )
				.attr( 'method', 'POST' )
				.attr( 'enctype', 'multipart/form-data' );
		} catch ( e ) {
			alert( "oops, form modification didn't work in ApiUploadHandler" );
			mw.log( "IE for some reason error's out when you change the action" );
			// well, if IE fucks this up perhaps we should do something to make sure it writes correctly
			// from the outset?
		}
		
		_this.addFormInputIfMissing( 'token', mw.getConfig( 'token' ));
		_this.addFormInputIfMissing( 'action', 'upload' );
		_this.addFormInputIfMissing( 'format', 'jsonfm' );
		
		// XXX only for testing, so it stops complaining about dupes
		if ( mw.getConfig( 'debug' )) {
			_this.addFormInputIfMissing( 'ignorewarnings', '1' );
		}
	},

	/**
	 * Add a hidden input to a form  if it was not already there.
	 * @param name  the name of the input
	 * @param value the value of the input
	 */
	addFormInputIfMissing: function( name, value ) {
		var _this = this;
		var $jForm = $j( _this.upload.ui.form );
		if ( $jForm.find( "[name='" + name + "']" ).length == 0 ) {
			$jForm.append( 
				$j( '<input />' )
				.attr( { 
					'type': "hidden",
					'name' : name, 
					'value' : value 
				} )
			);
		}
	},

	/**
	 * Kick off the upload!
	 */
	start: function() {
		var _this = this;
		mw.log( "api: upload start!" );
		_this.beginTime = ( new Date() ).getTime();
		_this.upload.ui.busy();
		$j( this.upload.ui.form ).submit();
	},
};



