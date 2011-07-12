/* TEMP 
 * XXX MediaWikiText support goes here ( still in development ) 
 */


// Simple interface to add a transcription request
		// TODO this should probably be moved to a gadget
		getAddSubRequest: function(){
			var _this = this;
			var buttons = {};
			buttons[ gM('mwe-timedtext-request-subs') ] = function(){
				var apiUrl = _this.textProvider.apiUrl;
				var videoTitle = 'File:' + _this.embedPlayer.apiTitleKey.replace('File:|Image:', '');
				var catName = mw.getConfig( 'TimedText.NeedsTranscriptCategory' );
				var $dialog = $(this);

				var subRequestCategoryUrl = apiUrl.replace('api.php', 'index.php') +
					'?title=Category:' + catName.replace(/ /g, '_');

				var buttonOk= {};
				buttonOk[gM('mwe-ok')] =function(){
					$(this).dialog('close');
				};
				// Set the loadingSpinner:
				$( this ).loadingSpinner();
				// Turn off buttons while loading
				$dialog.dialog( 'option', 'buttons', null );

				// Check if the category does not already exist:
				mw.getJSON( apiUrl, { 'titles': videoTitle, 'prop': 'categories' }, function( data ){
					if( data && data.query && data.query.pages ){
						for( var i in data.query.pages ){							
							// we only request a single page:
							if( data.query.pages[i].categories ){
								var categories = data.query.pages[i].categories;
								for(var j =0; j < categories.length; j++){
									if( categories[j].title.indexOf( catName ) != -1 ){
										$dialog.html( gM('mwe-timedtext-request-already-done', subRequestCategoryUrl ) );
										$dialog.dialog( 'option', 'buttons', buttonOk);
										return ;
									}
								}
							}
						}
					}

					// Else category not found add to category:
					// check if the user is logged in:
					mw.getUserName( apiUrl, function( userName ){
						if( !userName ){
							$dialog.html( gM('mwe-timedtext-request-subs-fail') );
							return ;
						}
						// Get an edit token:
						mw.getToken( apiUrl, videoTitle, function( token ) {
							if( !token ){
								$dialog.html( gM('mwe-timedtext-request-subs-fail') );
								return ;
							}
							var request = {
								'action' : 'edit',
								'summary' : 'Added request for subtitles using [[Commons:MwEmbed|MwEmbed]]',
								'title' : videoTitle,
								'appendtext' : "\n[[Category:" + catName + "]]",
								'token': token
							};
							// Do the edit request:
							mw.getJSON( apiUrl, request, function(data){
								if( data.edit && data.edit.newrevid){

									$dialog.html( gM('mwe-timedtext-request-subs-done', subRequestCategoryUrl )
									);
								} else {
									$dialog.html( gM('mwe-timedtext-request-subs-fail') );
								}
								$dialog.dialog( 'option', 'buttons', buttonOk );
							});
						});
					});
				});
			};
			buttons[ gM('mwe-cancel') ] = function(){
				$(this).dialog('close');
			};
			mw.addDialog({
				'title' : gM( 'mwe-timedtext-request-subs'),
				'width' : 450,
				'content' : gM('mwe-timedtext-request-subs-desc'),
				'buttons' : buttons
			});
		},
		/**
		 * Shows the timed text edit ui
		 *
		 * @param {String} mode Mode or page to display ( to differentiate between edit vs new transcript)
		 */
		showTimedTextEditUI: function( mode ) {
			var _this = this;
			// Show a loader:
			mw.addLoaderDialog( gM( 'mwe-timedtext-loading-text-edit' ) );
			// Load the timedText edit interface
			mw.load( 'mw.TimedTextEdit', function() {
				if( ! _this.editText ) {
					_this.editText = new mw.TimedTextEdit( _this );
				}
				// Close the loader:
				mw.closeLoaderDialog();
				// Show the upload text ui: 
				_this.editText.showUI();
			});
		},


var providerId = $( this.embedPlayer ).attr('data-mwprovider') ? 
		$(  this.embedPlayer  ).attr('data-mwprovider') : 
		'local';
var apiUrl = mw.getApiProviderURL( providerId );
var apiTitleKey = 	this.embedPlayer.apiTitleKey;
if( !apiUrl || !apiTitleKey ) {
	mw.log("Error: loading source without apiProvider or apiTitleKey");
	return ;
}

//For now only support mediaWikTrack provider library
this.textProvider = new mw.MediaWikTrackProvider( {
	'providerId' : providerId,
	'apiUrl': apiUrl,
	'embedPlayer': this.embedPlayer
} );

// Get local reference to all timed text sources: ( text/xml, text/x-srt etc )
var inlineSources = this.embedPlayer.mediaElement.getSources( 'text' );

// Add all the sources to textSources
for( var i = 0 ; i < inlineSources.length ; i++ ) {
	// Check if the inline source has a text provider: 
	var textSourceProvider = $( this.embedPlayer ).attr('data-mwprovider') ? 
			$( this.embedPlayer ).attr('data-mwprovider') : 
			this.textProvider;
		
	// Make a new textSource:
	var source = new TextSource( inlineSources[i] , this.textProvider);				
	this.textSources.push( source);
}

// If there are inline sources don't check the api )  
if( this.textSources.length != 0 ){
	if( callback )
		callback();	
	return ;
}

// Load the textProvider sources
this.textProvider.loadSources( apiTitleKey, function( textSources ) {
	for( var i=0; i < textSources.length; i++ ) {
		var textSource = textSources[ i ];
		// Try to insert the track source:
		var textElm = document.createElement( 'track' );
		$( textElm ).attr({
			'category'	: 'SUB',
			'srclang' 	: textSource.srclang,
			'type'		: _this.timedTextExtMime[ textSource.extension ],
			'titleKey' 	: textSource.titleKey
		});

		// Build the url for downloading the text:
		$( textElm ).attr('src',
			_this.textProvider.apiUrl.replace('api.php', 'index.php?title=') +
			encodeURIComponent( textSource.titleKey ) + '&action=raw&ctype=text/x-srt'
		);

		// Add a title
		$( textElm ).attr('title',
			gM('mwe-timedtext-key-language', textSource.srclang, mw.Language.names[ textSource.srclang ] )
		);

		// Add the sources to the parent embedPlayer
		// ( in case other interfaces want to access them )
		var embedSource = _this.embedPlayer.mediaElement.tryAddSource( textElm );
	
		// Get a "textSource" object:
		var source = new TextSource( embedSource, _this.textProvider );
		_this.textSources.push( source );
	}








		// Try to load src via textProvider:
			if( this.textProvider && this.mwtitle) {
				this.textProvider.loadTitleKey( this.mwtitle, function( data ) {
					if( data ) {
						_this.captions = handler( data );
					}			
					mw.log("mw.TimedText:: loaded from titleKey: " + _this.captions.length + ' captions');
					// Update the loaded state:
					_this.loaded = true;
					if( callback ) {
						callback();
					}
				});
				return ;
			}
			
			





/**
	 * parse mediaWiki html srt
	 * @param {Object} data XML data string to be parsed
	 */
	function parseMwSrt( data ) {
		var captions = [ ];
		var curentCap = [];
		var parseNextAsTime = false;
		// Optimize: we could use javascript strings functions instead of jQuery XML parsing:
		$( '<div>' + data + '</div>' ).find('p').each( function() {
			var currentPtext = $(this).html();
			//mw.log( 'pText: ' + currentPtext );

			//Check if the p matches the "all in one line" match:
			var m = currentPtext
			.replace('--&gt;', '-->')
			.match(/\d+\s([\d\-]+):([\d\-]+):([\d\-]+)(?:,([\d\-]+))?\s*--?>\s*([\d\-]+):([\d\-]+):([\d\-]+)(?:,([\d\-]+))?\n?(.*)/);

			if (m) {
				var startMs = (m[4])? (parseInt(m[4], 10) / 1000):0;
				var endMs = (m[8])? (parseInt(m[8], 10) / 1000) : 0;
				captions.push({
				'start':
					(parseInt(m[1], 10) * 60 * 60) +
					(parseInt(m[2], 10) * 60) +
					(parseInt(m[3], 10)) +
					startMs ,
				'end':
					(parseInt(m[5], 10) * 60 * 60) +
					(parseInt(m[6], 10) * 60) +
					(parseInt(m[7], 10)) +
					endMs,
				'content': $.trim( m[9] )
				});
				return true;
			}
			// Else check for multi-line match:
			if( parseInt( currentPtext ) == currentPtext ) {
				if( curentCap.length != 0) {
					captions.push( curentCap );
				}
				curentCap = {
					'content': ''
				};
				return true;
			}
			//Check only for time match:
			var m = currentPtext.replace('--&gt;', '-->').match(/(\d+):(\d+):(\d+)(?:,(\d+))?\s*--?>\s*(\d+):(\d+):(\d+)(?:,(\d+))?/);
			if (m) {
				var startMs = (m[4])? (parseInt(m[4], 10) / 1000):0;
				var endMs = (m[8])? (parseInt(m[8], 10) / 1000) : 0;
				curentCap['start']=
					(parseInt(m[1], 10) * 60 * 60) +
					(parseInt(m[2], 10) * 60) +
					(parseInt(m[3], 10)) +
					startMs;
				curentCap['end']=
					(parseInt(m[5], 10) * 60 * 60) +
					(parseInt(m[6], 10) * 60) +
					(parseInt(m[7], 10)) +
					endMs;
				return true;
			}
			//Else content for the curentCap
			if( currentPtext != '<br>' ) {
				curentCap['content'] += currentPtext;
			}
		});
		//Push last subtitle:
		if( curentCap.length != 0) {
			captions.push( curentCap );
		}
		return captions;
	}










	/**
	 * MediaWikTrackProvider
	 *
	 * text provider objects let you map your player to a timed text provider
	 * can provide discovery, and contribution push back
	 */
	
	 var default_textProvider_attr = [
		'apiUrl',
		'providerId',
		'timedTextNS',
		'embedPlayer'
	];

	mw.MediaWikTrackProvider = function( options ) {
		this.init( options );
	};
	mw.MediaWikTrackProvider.prototype = {

		// The api url:
		apiUrl: null,

		// The timed text namespace
		timedTextNS: null,

		/**
		* @constructor
		* @param {Object} options Set of options for the provider
		*/
		init: function( options ) {
			for(var i in default_textProvider_attr) {
				var attr = default_textProvider_attr[ i ];
				if( options[ attr ] )
					this[ attr ] = options[ attr ];

			}
		},

		/**
		 * Loads a single text source by titleKey
		 * @param {Object} titleKey
		 */
		loadTitleKey: function( titleKey, callback ) {
			var request = {
				'action': 'parse',
				'page': titleKey
				/**
				 * For now we don't use cache helpers since the request is 
				 * going over jsonp we kill any outer cache anyway
				'smaxage' : 300,
				'maxage' : 300
				*/
			};
			mw.getJSON( this.apiUrl, request, function( data ) {
				if ( data && data.parse && data.parse.text['*'] ) {
					callback( data.parse.text['*'] );
					return;
				}
				mw.log("Error: could not load:" + titleKey);
				callback( false );
			} );
		},

		/**
		 * Loads all available source for a given apiTitleKey
		 *
		 * @param {String} apiTitleKey For mediaWiki the apiTitleKey is the "wiki title"
		 */
		loadSources: function( apiTitleKey, callback ) {
			var request = {};
			var _this = this;
			this.getSourcePages( apiTitleKey, function( sourcePages ) {
				if( ! sourcePages.query.allpages ) {
					//Check if a shared asset
					mw.log( 'no subtitle pages found');
					if( callback )
						callback();
					return ;
				}
				// We have sources put them into the player
				if( callback )
					callback( _this.getSources( sourcePages ) );
			} );
		},

		/**
		 * Get the subtitle pages
		 * @param {String} titleKey Title to get subtitles for
		 * @param {Function} callback Function to call once NS subs are grabbed
		 */
		getSourcePages: function( titleKey, callback ) {
			var _this = this;
			var request = {
				'list' : 'allpages',
				'apprefix' : unescape( titleKey ),
				'apnamespace' : this.getTimedTextNS(),
				'aplimit' : 200,
				'prop':'revisions'
				/**
				 * For now we don't use cache helpers since the request is 
				 * going over jsonp we kill any outer cache anyway
				'smaxage' : 300,
				'maxage' : 300
				*/
			};
			mw.getJSON( this.apiUrl, request, function( sourcePages ) {
				// If "timedText" is not a valid namespace try "just" with prefix:
				if ( sourcePages.error && sourcePages.error.code == 'apunknown_apnamespace' ) {
					var request = {
						'list' : 'allpages',
						'apprefix' : _this.getCanonicalTimedTextNS() + ':' + _this.embedPlayer.apiTitleKey
					};
					mw.getJSON( _this.apiUrl, request, function( sourcePages ) {
						callback( sourcePages );
					} );
				} else {
					callback( sourcePages );
				}
			} );
	 	},

	 	/**
	 	 * Get the sources from sourcePages data object ( api result )
	 	 * @param {Object} sourcePages Source page result object
	 	 */
	 	getSources: function( sourcePages ) {
			var _this = this;
			// look for text tracks:
			var foundTextTracks = false;
			var sources = [];
			for ( var i=0; i < sourcePages.query.allpages.length; i++ ) {

				var subPage = sourcePages.query.allpages[i];
				if( !subPage || !subPage.title ){
					continue;
				}
				var langKey = subPage.title.split( '.' );
				var extension = langKey.pop();
				langKey = langKey.pop();
				//NOTE: we hard code the mw-srt type
				// ( This is because mediaWiki srt files can have wiki-text and parsed as such )
				if( extension == 'srt' ) {
					extension = 'mw-srt';
				}

				if ( ! _this.isSuportedLang( langKey ) ) {
					mw.log( 'Error: langkey:' + langKey + ' not supported' );
				} else {
					sources.push( {
						'extension': extension,
						'srclang': langKey,
						'titleKey': subPage.title.replace( / /g, "_")
					} );
				}
			}
			return sources;
	 	},

	 	/**
	 	 * Return the namespace ( if not encoded on the page return default 102 )
	 	 */
	 	getTimedTextNS: function() {
	 		if( this.timedTextNS )
	 			return this.timedTextNS;
			if ( typeof wgNamespaceIds != 'undefined' && wgNamespaceIds['timedtext'] ) {
				this.timedTextNS = wgNamespaceIds['timedtext'];
			}else{
				//default value is 102 ( probably should store this elsewhere )
				this.timedTextNS = 102;
			}
			return this.timedTextNS;
	 	},

	 	/**
	 	 * Get the Canonical timed text namespace text
	 	 */
	 	getCanonicalTimedTextNS: function() {
	 		return 'TimedText';
	 	},

	 	/**
	 	 * Check if the language is supported
	 	 */
	 	isSuportedLang: function( lang_key ) {
	 		if( mw.Language.names[ lang_key ]) {
	 			return true;
	 		}
	 		return false;
	 	}
	 };


