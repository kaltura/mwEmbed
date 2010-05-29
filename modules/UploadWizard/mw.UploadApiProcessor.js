// might be useful to raise exceptions when the api goes wrong
//  however, when everything is async, then who receives them?  
mw.UploadApiProcessor = function(doneCb, errorCb) {
	var _this = this;
	_this.doneCb = doneCb;
	_this.errorCb = errorCb;
};


mw.UploadApiProcessor.prototype = {

	warnings: [
	   'badfilename', //  was the resultant filename different from desired? If so return what we actually got in the 'badfilename' warnings
	   'filetype-unwanted-type', //  bad filetype, as determined from extenstion. content is the bad extension
	   'large-file', //  $wgUploadSizeWarning, numeric value of largest size (bytes, kb, what?)
	   'emptyfile', //  set to "true" if file was empty
	   'exists', //  set to true if file by that name  already existed
	   'duplicate', //  hash collision found
	   'duplicate-archive' //  hash collision found in archives
	],

	errors: [
		'empty-file',
		'filetype-missing',  //(missing an extension)
		'filetype-banned', // (extension banned) // also returns: { filetype => the filetype we thought it was, allowed => [ extensions ] }
		'filename-tooshort',
		'illegal-filename', // { filename => verification[filtered] }
		'overwrite', // overwrite existing file (failed?)
		'verification-error', // {details => verification-details}
		'hookaborted', // error => verificationerror }
		'unknown_error'
	],


	// NB
	// It's not clear if we can even get these errors (error_msg_key, error_onlykey) any more

	// There are many possible error messages here, so we don't load all
	// message text in advance, instead we use mw.getRemoteMsg() for some.
	//
	// This code is similar to the error handling code formerly in
	// SpecialUpload::processUpload()
	error_msg_key: {
		'2' : 'largefileserver',
		'3' : 'emptyfile',
		'4' : 'minlength1',
		'5' : 'illegalfilename'
	},	

	// NOTE:: handle these error types
	error_onlykey: {
		'1': 'BEFORE_PROCESSING',
		'6': 'PROTECTED_PAGE',
		'7': 'OVERWRITE_EXISTING_FILE',
		'8': 'FILETYPE_MISSING',
		'9': 'FILETYPE_BADTYPE',
		'10': 'VERIFICATION_ERROR',
		'11': 'UPLOAD_VERIFICATION_ERROR',
		'12': 'UPLOAD_WARNING',
		'13': 'INTERNAL_ERROR',
		'14': 'MIN_LENGTH_PARTNAME'
	},


	/**
	 * Process the result of an action=upload API request, into a useful 
	 * data structure.
	 *     upload, 
	 *     errors, 
	 *     warnings
         * Augment with error messages in the local language if possible
	 * 
	 */
	processResult: function( result ) {
		var _this = this;
		mw.log( 'processResult::' );
			
		// debugger;	
		
		var parsedResult = _this.parseResult(result);

		if ( _this.doneCb && typeof _this.doneCb == 'function' ) {
			mw.log( "call doneCb" );
			_this.doneCb( parsedResult );
			
		}
		return true;
	},


	parseResult: function( result ) {
		if ( result.upload && result.upload.imageinfo && result.upload.imageinfo.descriptionurl ) {
			result.isSuccess = true;
		} 

		return result;

	}

	
};

	
		if ( result.error || ( result.upload && result.upload.result == "Failure" ) ) {
			
			// Check a few places for the error code
			var error_code = 0;
			var errorReplaceArg = '';
			if ( result.error && result.error.code ) {
				error_code = result.error.code;
			} else if ( result.upload.code ) {
				if ( typeof result.upload.code == 'object' ) {
					if ( result.upload.code[0] ) {
						error_code = result.upload.code[0];
					}
					if ( result.upload.code['status'] ) {
						error_code = result.upload.code['status'];
						if ( result.upload.code['filtered'] ) {
							errorReplaceArg = result.upload.code['filtered'];
						}
					}
				} else {
					result.upload.code; // XXX ??
				}
			}

			var error_msg = '';
			if ( typeof result.error == 'string' ) {
				error_msg = result.error;
			}

			if ( !error_code || error_code == 'unknown-error' ) {
				if ( typeof JSON != 'undefined' ) {
					mw.log( 'Error: result: ' + JSON.stringify( result ) );
				}
				if ( result.upload.error == 'internal-error' ) {
					// Do a remote message load
					errorKey = result.upload.details[0];
					
					mw.getRemoteMsg( errorKey, function() {
						_this.ui.setPrompt( gM( 'mwe-uploaderror' ), gM( errorKey ), buttons );

					});
					return false;
				}

				_this.ui.setPrompt(
						gM('mwe-uploaderror'),
						gM('mwe-unknown-error') + '<br>' + error_msg,
						buttons );
				return false;
			}

			if ( result.error && result.error.info ) {
				_this.ui.setPrompt( gM( 'mwe-uploaderror' ), result.error.info, buttons );
				return false;
			}

			if ( typeof error_code == 'number'
				&& typeof _this.error_msg_key[error_code] == 'undefined' )
			{
				if ( result.upload.code.finalExt ) {
					_this.ui.setPrompt(
						gM( 'mwe-uploaderror' ),
						gM( 'mwe-wgfogg_warning_bad_extension', result.upload.code.finalExt ),
						buttons );
				} else {
					_this.ui.setPrompt(
						gM( 'mwe-uploaderror' ),
						gM( 'mwe-unknown-error' ) + ' : ' + error_code,
						buttons );
				}
				return false;
			}

			mw.log( 'get key: ' + _this.error_msg_key[ error_code ] )
			mw.getRemoteMsg( _this.error_msg_key[ error_code ], function() {
				_this.ui.setPrompt(
					gM( 'mwe-uploaderror' ),
					gM( _this.error_msg_key[ error_code ], errorReplaceArg ),
					buttons );
			});
			mw.log( "api.error" );
			return false;
		}


	}
	*/

/*
		// this doesn't seem to do anything
		// Check for warnings:
		if ( result.upload && result.upload.warnings ) {
			for ( var wtype in result.upload.warnings ) {
				var winfo = result.upload.warnings[wtype]
				switch ( wtype ) {
					case 'duplicate':
					case 'exists':
						if ( winfo[1] && winfo[1].title && winfo[1].title.mTextform ) {
							push warnings, { type: wtype, text: winfo[1].title.mTextform },
						} else {
							push warnings, { type: wtype }
						}
						break;
					case 'file-thumbnail-no':
						push warnings, { type: wtype, info: winfo }
						break;
					default:
						push warnings: { type: wtype, }
						break;
				}
			}
			
			if ( result.upload.sessionkey ) {
				_this.warnings_sessionkey = result.upload.sessionkey;
			}

		}
*/
/*
		// Check upload.error
		if ( result.upload && result.upload.error ) {
			mw.log( ' result.upload.error: ' +  result.upload.error );
			_this.ui.setPrompt(
				gM( 'mwe-uploaderror' ),
				gM( 'mwe-unknown-error' ) + '<br>',
				buttons );
			return false;
		}
*/

		/*
		// this ONLY applies to copy by URL method -- factor out? 
		if ( result.upload && result.upload.upload_session_key ) {
			// Async upload, do AJAX status polling
			_this.upload_session_key = result.upload.upload_session_key;
			_this.doAjaxUploadStatus();
			mw.log( "set upload_session_key: " + _this.upload_session_key );
			return;
		}
		*/

			/*
			var buttons = {};
			// "Return" button
			buttons[ gM( 'mwe-return-to-form' ) ] = function() {
				$j( this ).dialog( 'destroy' ).remove();
				_this.form_post_override = false;
			}
			// "Go to resource" button
			buttons[ gM('mwe-go-to-resource') ] = function() {
				window.location = url;
			};
			_this.action_done = true;
			_this.interface.setPrompt(
					gM( 'mwe-successfulupload' ),
					gM( 'mwe-upload_done', url),
					buttons );
			mw.log( 'result.upload.imageinfo::' + url );
			return true;
			*/

/*
			// Create the "ignore warning" button
			var buttons = {};
			buttons[ gM( 'mwe-ignorewarning' ) ] = function() {
				// Check if we have a stashed key:
				if ( _this.warnings_sessionkey ) {
					//set to "loading"
					$j( '#upProgressDialog' ).loadingSpinner();
					//setup request:
					var request = {
						'action': 'upload',
						'sessionkey': _this.warnings_sessionkey,
						'ignorewarnings': 1,
						'filename': $j( '#wpDestFile' ).val(),
						'token' :  _this.editToken,
						'comment' : _this.getUploadDescription()
					};
					//run the upload from stash request
					mw.getJSON(_this.api_url, request, function( data ) {
							_this.processApiResult( data );
					} );
				} else {
					mw.log( 'No session key re-sending upload' )


					//do a stashed upload
					$j( '#wpIgnoreWarning' ).attr( 'checked', true );
					$j( _this.editForm ).submit();
				}
			};
			*/


