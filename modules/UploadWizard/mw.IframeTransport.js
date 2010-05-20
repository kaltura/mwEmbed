/**
 * Represents a "transport" for files to upload; in this case an iframe.
 * The iframe is made to be the target of a form so that the existing page does not reload, even though it's a POST.
 * @param form	an HTML form
 * @param progressCb	callback to execute when we've started. (does not do float here because iframes can't 
 *			  monitor fractional progress).
 * @param transportedCb	callback to execute when we've finished the upload
 */
mw.IframeTransport = function( form, progressCb, transportedCb ) {
	var _this = this;

	_this.form = form;
	_this.progressCb = progressCb;
	_this.transportedCb = transportedCb;

	_this.iframeId = 'f_' + ( $j( 'iframe' ).length + 1 );
	
	//IE only works if you "create element with the name" ( not jquery style )
	var iframe;
	try {
		iframe = document.createElement( '<iframe name="' + _this.iframeId + '">' );
	} catch ( ex ) {
		iframe = document.createElement( 'iframe' );
	}		

	// we configure form on load, because the first time it loads, it's blank
	// then we configure it to deal with an API submission	
	$j( iframe )
		.attr( { 'src'   : 'javascript:false;', 
		         'id'    : _this.iframeId,
		         'name'  : _this.iframeId } )
		.load( function() { _this.configureForm() } )
		.css( 'display', 'none' );

	$j( "body" ).append( iframe ); 
};

mw.IframeTransport.prototype = {
	/**
	 * Configure a form with a File Input so that it submits to the iframe
	 * Ensure callback on completion of upload
	 */
	configureForm: function() {
		mw.log( "configuring form for iframe transport" );
		var _this = this;
		// Set the form target to the iframe
		var $jForm = $j( _this.form );
		$jForm.attr( 'target', _this.iframeId );

		// attach an additional handler to the form, so, when submitted, it starts showing the progress
		// XXX this is lame .. there should be a generic way to indicate busy status...
		$jForm.submit( function() { 
			mw.log( "submitting to iframe..." );
			_this.progressCb( 1.0 );
			return true;
		} );

		// Set up the completion callback
		$j( '#' + _this.iframeId ).load( function() {
			mw.log( "received result in iframe" );
			_this.processIframeResult( $j( this ).get( 0 ) );
		} );			
	},

	/**
	 * Process the result of the form submission, returned to an iframe.
	 * This is the iframe's onload event.
	 *
	 * @param {Element} iframe iframe to extract result from 
	 */
	processIframeResult: function( iframe ) {
		var _this = this;
		var doc = iframe.contentDocument ? iframe.contentDocument : frames[iframe.id].document;
		// Fix for Opera 9.26
		if ( doc.readyState && doc.readyState != 'complete' ) {
			mw.log( "not complete" );
			return;
		}
			
		// Fix for Opera 9.64
		if ( doc.body && doc.body.innerHTML == "false" ) {
			mw.log( "no innerhtml" );
			return;
		}
		var response;
		if ( doc.XMLDocument ) {
			// The response is a document property in IE
			response = doc.XMLDocument;
		} else if ( doc.body ) {
			// Get the json string
			// XXX wait... why are we grepping it out of an HTML doc? We requested jsonfm, why?
			json = $j( doc.body ).find( 'pre' ).text();
			mw.log( 'iframe:json::' + json )
			if ( json ) {
				response = window["eval"]( "( " + json + " )" );
			} else {
				response = {};
			}
		} else {
			// Response is a xml document
			response = doc;
		}
		// Process the API result
		_this.transportedCb( response );
	}
};


