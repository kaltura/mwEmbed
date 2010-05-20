/**
 * Object to attach to a file name input, to be run on its change() event
 * Largely derived from wgUploadWarningObj in old upload.js
 * Perhaps this could be a jQuery ext
 * @param options   dictionary of options 
 *		selector  required, the selector for the input to check
 * 		processResult   required, function to execute on results. accepts two args:
 *			1) filename that invoked this request -- should check if this is still current filename
 *			2) an object with the following fields
 *				isUnique: boolean
 *				img: thumbnail image src (if not unique)
 *				href: the url of the full image (if not unique)
 *				title: normalized title of file (if not unique)
 * 		spinner   required, closure to execute to show progress: accepts true to start, false to stop
 * 		apiUrl    optional url to call for api. falls back to local api url
 * 		delay     optional how long to delay after a change in ms. falls back to configured default
 *		preprocess optional: function to apply to the contents of selector before testing
 *		events 	  what events on the input trigger a check.
 */ 
mw.DestinationChecker = function( options ) {

	var _this = this;
	_this.selector = options.selector;		
	_this.spinner = options.spinner;
	_this.processResult = options.processResult;
	
	// optional overrides

	if (options.apiUrl) {
		_this.apiUrl = options.apiUrl;
	} else {
		_this.apiUrl = mw.getLocalApiUrl();
	}

	$j.each( ['preprocess', 'delay', 'events'], function( i, option ) {
		if ( options[option] ) {
			_this[option] = options[option];
		}
	} );


	// initialize!

	var check = _this.getDelayedChecker();
	
	$j.each( _this.events, function(i, eventName) {
		$j( _this.selector )[eventName]( check );
	} );

}

mw.DestinationChecker.prototype = {

	// events that the input undergoes which fire off a check
	events: [ 'change', 'keyup' ],

	// how long the input muse be "idle" before doing call (don't want to check on each key press)
	delay: 500, // ms;

	// what tracks the wait
	timeoutId: null,

	// cached results from api calls
	cachedResult: {},

	/**
	 * There is an option to preprocess the name (in order to perhaps convert it from
	 * title to path, e.g. spaces to underscores, or to add the "File:" part.) Depends on 
	 * exactly what your input field represents.
	 * In the event that the invoker doesn't supply a name preprocessor, use this identity function
	 * as default
	 *
	 * @param something
	 * @return that same thing
	 */
	preprocess: function(x) { return x },

	/**
	 * fire when the input changes value or keypress
	 * will trigger a check of the name if the field has been idle for delay ms.
	 */	
	getDelayedChecker: function() {
		var checker = this;
		return function() {
			var el = this; // but we don't use it, since we already have it in _this.selector

			// if we changed before the old timeout ran, clear that timeout.
			if ( checker.timeoutId ) {
				window.clearTimeout( checker.timeoutId );
			}

			// and start another, hoping this time we'll be idle for delay ms.	
			checker.timeoutId = window.setTimeout( 
				function() { checker.checkUnique(); },
				checker.delay 
			);
		}
	},

	/**
  	 * Get the current value of the input, with optional preprocessing
	 * @return the current input value, with optional processing
	 */
	getName: function() {
		var _this = this;
		return _this.preprocess( $j( _this.selector ).val() );
	},

	/**
	 * Async check if a filename is unique. Can be attached to a field's change() event
	 * This is a more abstract version of AddMedia/UploadHandler.js::doDestCheck
	 */
	checkUnique: function() {
		var _this = this;

		var found = false;
		var name = _this.getName();
		
		if ( _this.cachedResult[name] !== undefined ) {
			_this.processResult( _this.cachedResult[name] );
			return;
		} 

		// set the spinner to spin
		_this.spinner( true );
		
		// Setup the request -- will return thumbnail data if it finds one
		var request = {
			'titles': 'File:' + name,
			'prop':  'imageinfo',
			'iiprop': 'url|mime|size',
			'iiurlwidth': 150
		};

		// Do the destination check 
		mw.getJSON( _this.apiUrl, request, function( data ) {			
			// Remove spinner
			_this.spinner( false );
	
			// if the name's changed in the meantime, our result is useless
			if ( name != _this.getName() ) {
				return;
			}
			
			if ( !data || !data.query || !data.query.pages ) {
				// Ignore a null result
				mw.log(" No data in checkUnique result");
				return;
			}

			var result = undefined;

			if ( data.query.pages[-1] ) {
				// No conflict found; this file name is unique
				mw.log(" No pages in checkUnique result");
				result = { isUnique: true };

			} else {

				for ( var page_id in data.query.pages ) {
					if ( !data.query.pages[ page_id ].imageinfo ) {
						continue;
					}

					// Conflict found, this filename is NOT unique
					mw.log( " conflict! " );

					if ( data.query.normalized ) {
						var ntitle = data.query.normalized[0].to;
					} else {
						var ntitle = data.query.pages[ page_id ].title
					}

					var img = data.query.pages[ page_id ].imageinfo[0];

					result = {
						isUnique: false,	
						img: img,
						title: ntitle,
						href : img.descriptionurl
					};

					break;
				}
			}

			if ( result !== undefined ) {
				_this.cachedResult[name] = result;
				_this.processResult( result );
			}
		} );
	}

};


/** 
 * jQuery extension to make a field upload-checkable
 */
( function ( $ ) {
	$.fn.destinationChecked = function( options ) {
		var _this = this;
		options.selector = _this;
		new mw.DestinationChecker( options );
		return _this;
	}; 
} )( jQuery );
