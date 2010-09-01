/**
* Sequencer Server bridges a server API with sequence actions like 'load', 'save', 'revision history' etc.   
* ( for now only mediaWiki api is supported )
* We will abstract all the method calls once we add another api backend
*/

//Wrap in mw closure
( function( mw ) {
		
	mw.SequencerServer = function( sequencer ) {
		return this.init( sequencer );
	};

	// Set up the SequencerServer prototype method object
	mw.SequencerServer.prototype = {
			
		// lazy init save token for the server config
		saveToken : null,
		
		// Api type ( always mediaWiki for now) 		
		apiType: null,
		
		// Api url ( url to query for api updates )
		apiUrl: null, 
		
		// The sequence title key for api queries 
		titleKey: null,
		
		// The Url path the the sequence page with $1 where the title should be  
		pagePathUrl: null,
		
		// Stores the most recent version of the sequence xml from the server 
		serverSmilXml: null, 
		
		// Flags if the sequence was successfully saved in this session
		sequenceSaved: false,
		
		/**
		 * init the sequencer
		 */
		init: function( sequencer ){
			this.sequencer = sequencer;
			// Set local config from sequencer options
			var serverConfig = this.sequencer.getOption( 'server' );					
				
			// NOTE this should trigger an apiHandler once we have more than one api backend
			if( serverConfig ){
				
				if( serverConfig.type )
					this.apiType = serverConfig.type;		
				
				if( serverConfig.url )
					this.apiUrl = serverConfig.url;		
				
				if( serverConfig.titleKey )
					this.titleKey = serverConfig.titleKey;
				
				if( serverConfig.pagePathUrl ){
					this.pagePathUrl = serverConfig.pagePathUrl;
				}
				
			}
			if( this.isConfigured() ){
				mw.log("Error: Sequencer server needs a full serverConfig to be initialized")
				return false;
			}
		},
		

		// Check if the server exists / is configured 
		isConfigured: function( ){
			if( !this.apiType || !this.apiUrl || !this.titleKey){
				return false;
			}
			return true;
		},
		getApiUrl: function(){
			return this.apiUrl;
		},
		/**
		 * Check if the user in the current session can save to the server
		 */
		userCanSave: function( callback ){
			this.getSaveToken( callback );
		},
		
		/**
		 * Get up to date sequence xml from the server 
		 */
		getSmilXml: function( callback ){
			var _this = this; 				
			mw.getTitleText( this.getApiUrl(), this.titleKey, function( smilXml ){
				// Cache the latest serverSmil ( for local change checks ) 
				// ( save requests automatically respond with warnings on other user updates ) 
				_this.serverSmilXml = smilXml;
				callback( smilXml );	
			})
		},		
		// Check if there have been local changes 
		hasLocalChanges: function(){
			return ( this.serverSmilXml != this.sequencer.getSmil().getXMLString() );  
		},
		// Check if the sequence was saved in this edit session
		hasSequenceBeenSavedOrPublished: function(){
			return this.sequenceSaved || this.sequencePublished
		},
		// Get a save token, if unable to do so return false 
		getSaveToken: function( callback ){
			var _this = this;
			if( this.saveToken != null ){
				callback ( this.saveToken );
				return ;	
			}
			mw.getToken( this.getApiUrl(), this.titleKey, function( saveToken ){
				_this.saveToken = saveToken;
				callback ( _this.saveToken )
			});
		},
		
		// Save the sequence		
		save: function( saveSummary, sequenceXML, callback){
			var _this = this;
			mw.log("SequenceServer::Save: " + saveSummary );
			this.getSaveToken( function( token ){
				if( !token ){
					callback( false, 'could not get edit token')
					return ;
				}
				var request = {
					'action' : 'edit',
					'summary' : saveSummary,
					'title' : _this.titleKey,
					'text' : sequenceXML,
					'token': token
				};
				mw.getJSON( _this.getApiUrl(), request, function( data ) {
					if( data.edit && data.edit.result == 'Success' ) {
						// Update the latest local variables
						_this.saveSummary = saveSummary
						_this.sequenceSaved = true;
						_this.serverSmilXml = sequenceXML;
						callback( true );
					} else {
						// xxx Should have more error handling ( conflict version save etc )
						callback( false, 'failed to save to server');
					}
				})
			})
		},
		
		/**
		 * Check if the published file is up-to-date with the saved sequence 
		 * ( higher page revision for file than sequence )
		 */
		isPublished: function( callback ){			
			var _this = this;
			var request = {
				'prop':'revisions',
				'titles' :  'File:' + this.getVideoFileName() + '|' + this.titleKey,
				'rvprop' : 'ids'
			};
			var videoPageRevision = null;
			var xmlPageRevision = null;
			mw.getJSON( _this.getApiUrl(), request, function( data ) {
				if( data.query && data.query.pages ){
					for( page_id in data.query.pages ){
						var page = data.query.pages[page_id];					
						if( page.revisions && page.revisions[0]  && page.revisions[0].revid ){
							if( page.title == _this.titleKey ){
								xmlPageRevision = page.revisions[0].revid;
							} else {
								videoPageRevision = page.revisions[0].revid;
							}
						}
					}
				}				
				if( videoPageRevision != null && xmlPageRevision != null){
					callback ( ( videoPageRevision > xmlPageRevision ) );
					return ;
				}
				callback( null );
			});
		},	
		
		/**
		 * Get a save summary and run a callback 
		 */
		getSaveSummary: function( callback ){
			var _this = this;
			if( this.saveSummary ){
				callback( this.saveSummary );
				return ;
			}			
			// Get the save summary for the latest revision
			var request = {
				'prop':'revisions',
				'titles' : _this.titleKey,
				'rvprop' : 'user|comment|timestamp'
			};			
			mw.getJSON( _this.getApiUrl(), request, function( data ) {				
				if( data.query && data.query.pages ){
					for( page_id in data.query.pages ){
						var page = data.query.pages[page_id];
						if( page.revisions && page.revisions[0] && page.revisions[0].comment ){
							callback( page.revisions[0].comment ); 
							return; 
						}
					}
				}
				callback( false );
			});
		},
		/**
		 * Get the sequence description page url
		 * @param {String} Optional Sequence title key
		 */
		getSequenceViewUrl: function( titleKey ){
			if( !titleKey )
				titleKey = this.titleKey;
			// Check that we have a pagePathUrl config: 
			if( !this.pagePathUrl ){
				return false;
			}
			return this.pagePathUrl.replace( '$1', 'Sequence:' + titleKey);
		},
		/**
		 * Get the sequencer 'edit' url
		 */
		getSequenceEditUrl: function( titleKey ){
			var viewUrl = this.getSequenceViewUrl( titleKey );
			return mw.replaceUrlParams(viewUrl, {'action':'edit'})
		},
		
		/**
		 * Get the video file name for saving the flat video asset to the server
		 * @return {String}
		 */
		getVideoFileName: function(){
			return this.titleKey.replace( ':', '-') + '.ogv';
		},
		
		// get upload settings runs the callback with the post url and request data 
		getUploadRequestConfig: function( callback ){
			var _this = this;
			mw.getToken( this.getApiUrl(), 'File:' + this.getVideoFileName(), function( saveToken ){
				// xxx Get the latest save comment 
				_this.getSaveSummary(function( saveSummary ){			
					var request = {
						'token' : saveToken,
						'action' : 'upload',
						'format': 'json',
						'filename': _this.getVideoFileName(),
						'comment': 'Published Sequence: ' + saveSummary,
						'ignorewarnings' : true
					}
					// Return the apiUrl and request
					callback( _this.getApiUrl(), request );
				});
			});
		},
		// Setter for sequencePublished
		sequencePublishUploadDone: function(){
			this.sequencePublished = true;	
		}
	}


} )( window.mw );	