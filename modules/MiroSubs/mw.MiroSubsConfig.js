
/** 
 * Generates a miro subs config also see:
 * http://dev.universalsubtitles.org/widget/api_demo.html
 */
mw.MiroSubsConfig = {	
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
				mw.log("Error: MiroSubsConfig user not logged in");
				callback( { 'status':'error', 'error': gM('mwe-mirosubs-not-loggedin') } );			
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
				// Convert the miroSubs to srt				
				var srtText = _this.miroSubs2Srt( miroSubs );
				_this.saveSrtText( srtText, function(status){
					if( status ){
						doneSaveCallback();
					} else {
						cancelCallback();
					}
				});				
			},
			'permalink': 'http://commons.wikimedia.org',
			// not sure if this is needed
			'login': function( ){
				 mirosubs.api.loggedIn( wgUserName );
			},	
			'embedCode' : 'some code to embed'
		};	
	},
	saveSrtText: function( srtText, calllback ){
		var _this = this;
		var timedTextTitle = 'TimedText:' + 
			this.embedPlayer.apiTitleKey +  
			'.' + this.config.languageKey + '.srt';
		
		// Try to get sources from text provider:
		var provider_id = ( this.embedPlayer.apiProvider ) ?  this.embedPlayer.apiProvider : 'local'; 
		var apiUrl = mw.getApiProviderURL( provider_id );
		
		mw.getToken( apiUrl, timedTextTitle, function( token ) {
			var request = {
				'action':'edit',
				'title': timedTextTitle,
				'summary': "Updated subtitles with [[Help:Gadget-MwEmbed/UniversalSubs|UniversalSubs]]",
				'text': srtText,
				'token': token
			};
			mw.getJSON( apiUrl, request, function(data){
				if( data.edit.result == "Success" ){
					calllback( true );
				} else {
					calllback( false );
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
		var miroSubs = [];		
		var playerTimedText = this.embedPlayer.timedText;
		playerTimedText.setupTextSources( function(){
			// NOTE the autoselected default language is a tricky issue
			// We need to add support for language selection in the config object save callback
			
			// Get the current text source captions
			playerTimedText.getCurrentSubSource( function( source ){	
				var captions = source.captions;
				_this.config.languageKey = source.srclang;
				for( var i = 0; i < captions.length ; i ++ ){
					var caption = captions[i];
					miroSubs.push({
						'subtitle_id': i,
						'text': caption.content,
						'start_time': caption.start,
						'end_time': caption.end,
						'sub_order': i
					});
				}
			});	
			callback( miroSubs );
		});			
	}
};