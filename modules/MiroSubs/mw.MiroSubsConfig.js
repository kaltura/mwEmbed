// include all module messages
mw.includeAllModuleMessages();

/**
 * Generates a miro subs config also see:
 * http://dev.universalsubtitles.org/widget/api_demo.html
 */
mw.MiroSubsConfig = {
	openDialog: function( embedPlayer, dialogReadyCallback ){
		var _this = this;
		this.getConfig( embedPlayer , function( config ){
			if( !config ){
				return ;
			}
			// xxx NOTE there are some weird async display issues
			// that only seem to be resolvable with timeouts for DOM actions
			setTimeout(function(){
				dialogReadyCallback();
			}, 100);
			// Show the dialog
			setTimeout(function(){
				_this.mirosubs = mirosubs.api.openDialog( config );
			}, 800);
		});
	},
	/**
	 * @param {Function} callback is called with two arguments 'status', 'config'
	 */
	getConfig : function( embedPlayer, callback ){
		var _this = this;

		if( _this.isConfigReady( callback ) ){
			// if config is ready stop chain
			return true;
		}

		//Set up a local pointer to the embedPlayer:
		this.embedPlayer = embedPlayer;

		// Set initial config
		this.config = this.getDefaultConfig();

		// Make sure we are logged in::
		mw.getUserName( function( userName ){
			mw.log( "MiroSubsConfig::getUserName: " + userName );
			if( !userName ){
				mw.addDialog({
					'title' : gM('mwe-mirosubs-subs-please-login'),
					'content' : gM('mwe-mirosubs-subs-please-login-desc')
				});
				callback( false );
				return false;
			} else {
				_this.config.username = userName;
				if( _this.isConfigReady( callback ) ){
					return true;
				}
			}
		});
		// Get the subtitles
		_this.getSubsInMiroFormat( function( miroSubs ){
			mw.log("MiroSubsConfig::getSubsInMiroFormat: got" + miroSubs.length + ' subs');
			// no failure for miro subs ( just an empty object )
			_this.config.subtitles = miroSubs;

			// Once everything is setup issue the callback with the miro config:
			if( _this.isConfigReady( callback ) ){
				return true;
			}
		});
	},
	// Check all async values for config ready run the callback if its ready
	isConfigReady: function( callback ){
		if( !this.config ){
			return false;
		}
		if( this.config.subtitles
			&&
			this.config.username
		){
			callback( this.config )
			return true;
		}
		return false;
	},
	getDefaultConfig: function(){
		var _this = this;
		return {
			// By default the config status is 'ok'
			'status' : 'ok',

			// Default language key 'en':
			'languageKey' : 'en',

			'closeListener': function(){
				// close event refresh page?
				// make sure any close dialog is 'closed'
				mw.closeLoaderDialog();
			},
			'videoURL' : _this.getVideoURL(),
			'save': function( miroSubs, doneSaveCallback, cancelCallback) {
				// Close down the editor
				doneSaveCallback();
				// Close the miro subs widget:
				_this.mirosubs.close();

				// Convert the miroSubs to srt
				// again strange issues with miroSubs give it time to close
				setTimeout( function(){
					var srtText = _this.miroSubs2Srt( miroSubs );
					$saveDialog = _this.getSaveDialogSummary( function( summary ){
						if( summary === false ){
							// Return to current page without saving the text
							location.reload(true);
							return ;
						}
						_this.saveSrtText( srtText, summary, function(status){
							// No real error handling right now
							// refresh page regardless of save or cancel

							if( status ){
								$saveDialog
								.dialog("option", 'title', gM('mwe-mirosubs-subs-saved') )
								.html( gM('mwe-mirosubs-thankyou-contribution') );
							} else {
								$saveDialog
								.dialog("option", 'title', gM('mwe-mirosubs-subs-saved-error') )
								.html( gM('mwe-mirosubs-subs-saved-error') );
							}
							// Either way the only button is OK and it refreshes the page:
							var button = {};
							button[ gM('mwe-ok') ] = function(){
								location.reload(true);
							};
							$saveDialog.dialog("option", "buttons", button );
						});
					});
				}, 100 );
			},
			'mediaURL': mw.getMwEmbedPath() + 'modules/MiroSubs/mirosubs/media/',
			'permalink': 'http://commons.wikimedia.org',
			// not sure if this is needed
			'login': function( ){
				 mirosubs.api.loggedIn( wgUserName );
			},
			'embedCode' : 'some code to embed'
		};
	},
	getSaveDialogSummary: function( callback ){
		// Add a dialog to get save summary
		var buttons ={};
		buttons[ gM('mwe-mirosubs-save-subs') ] = function(){
			var summary = $j('#mwe-mirosubs-save-summary').val();
			// Append link to gadget:
			summary+= ' using [[Commons:Universal_Subtitles|UniversalSubs]]';
			callback( summary );
			// set dialog to loading
			$j( this ).html( $j('<div />').append(
					gM('mwe-mirosubs-saving-subs'),
					$j('<div />')
					.loadingSpinner()
				)
			)
			.dialog( "option", "buttons", false )
			.dialog( "option", "title", gM('mwe-mirosubs-saving-subs') );
		};
		buttons[ gM('mwe-cancel') ] = function(){
			callback( false );
			$j( this ).dialog( 'close' );
		};
		// Reduce the z-index so we can put the model ontop:
		//$j('.mirosubs-modal-widget-bg,.mirosubs-modal-widget').css( 'z-index', 10 );
		var $dialog = mw.addDialog( {
			'title' : gM("mwe-mirosubs-save-summary"),
			'width' : 450,
			'content' : $j('<div />').append(
					$j('<h3 />').text( gM("mwe-mirosubs-save-summary") ),
					$j('<input/>').attr({
						'id' : 'mwe-mirosubs-save-summary',
						'size': '35'
					}).val( gM('mwe-mirosubs-save-default') )
				),
			'buttons' : buttons
		});
		return $dialog;
	},
	saveSrtText: function( srtText, summary, callback ){
		var _this = this;
		var timedTextTitle = 'TimedText:' +
			this.embedPlayer.apiTitleKey +
			'.' + this.config.languageKey + '.srt';

		// Try to get sources from text provider:
		var provider_id = ( this.embedPlayer.apiProvider ) ? this.embedPlayer.apiProvider : 'local';
		var apiUrl = mw.getApiProviderURL( provider_id );

		mw.getToken( apiUrl, timedTextTitle, function( token ) {
			var request = {
				'action':'edit',
				'title': timedTextTitle,
				'text': srtText,
				'summary': summary,
				'token': token
			};
			mw.getJSON( apiUrl, request, function(data){
				if( data.edit.result == "Success" ){
					callback( true );
				} else {
					callback( false );
				}
			});
		});
	},
	getVideoURL: function(){
		// xxx todo: grab other sources ( WebM ) if supported.
		// grab the first ogg source
		var source = this.embedPlayer.mediaElement.getSources( 'video/ogg' )[0];
		if( ! source ){
			mw.log("Error: MiroSubsConfig Could not find video/ogg source to create subtitles");
			return false;
		}
		return source.getSrc();
	},

	// Convert miroSubs to srt string
	miroSubs2Srt: function( miroSubs ){
		var srtString = '';
		for(var i =0; i < miroSubs.length ; i ++ ){
			var miroSub = miroSubs[i];
			var startStr = String( mw.seconds2npt( miroSub.start_time, true ) ).replace('.',',');
			var endStr = String( mw.seconds2npt( miroSub.end_time, true ) ).replace( '.', ',' );
			srtString += miroSub.sub_order + "\n" +
				startStr + ' --> ' + endStr + "\n" +
				miroSub.text + "\n\n";
		}
		return srtString;
	},

	// Get the existing subtitles in miro format
	getSubsInMiroFormat: function( callback ){
		var _this = this;
		var playerTimedText = this.embedPlayer.timedText;

		playerTimedText.setupTextSources( function(){
			var miroJsonSubs = [];
			// NOTE the autoselected default language is a tricky issue
			// We need to add support for language selection in the config object save callback

			// Get the current text source captions
			playerTimedText.loadCurrentSubSrouce( function( source ){
				var captions = source.captions;
				mw.log('getSubsInMiroFormat:: source sub length:' + captions.length );
				_this.config.languageKey = source.srclang;
				for( var i = 0; i < captions.length ; i ++ ){
					var caption = captions[i];
					var miroSub = {
						'subtitle_id': 'sub_' + i,
						'text': caption.content,
						'sub_order': i+1
					};
					if( caption.end == 0){
						miroSub.start_time = -1;
						miroSub.end_time = -1;
					} else {
						miroSub.start_time = caption.start;
						miroSub.end_time = caption.end;
					}
					miroJsonSubs.push( miroSub );
				}
			});
			callback( miroJsonSubs );
		});
	}
};
