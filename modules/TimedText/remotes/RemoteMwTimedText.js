/**
* Stop-gap for mediaWiki php based timed text support 
*
* Does some transformations to normal wiki timed Text pages to make them look
* like the php output that we will eventually want to have 
*/
mw.addMessages( {
	"mwe-language-subtitles-for-clip": "$1 subtitles for clip: $2",
	"mwe-language-no-subtitles-for-clip": "No $1 subtitles where found for clip: $2"
});

RemoteMwTimedText = function( options ) {
	return this.init( options );
} 
mw_default_remote_text_options = [
	'action',
	'title',
	'target',
	'orgBody'
];
RemoteMwTimedText.prototype = {
	
	init: function( options ) {
		for(var i in mw_default_remote_text_options) {
			var opt = mw_default_remote_text_options[i]
			if( options[ opt ] ) {
				this[ opt ] = options[ opt ];
			}
		}
	},
	updateUI: function() {
		// Check page type 
		if( this.action == 'view' ) {	
			this.showViewUI();
		}else{
			//restore 
		}	
	},
	showViewUI: function() {
		var _this = this;
		var fileTitleKey = this.title.split('.');
		this.extension = fileTitleKey.pop();
		this.langKey = fileTitleKey.pop();
		this.fileTitleKey = fileTitleKey.join('.');			
		
		this.getTitleResource( this.fileTitleKey,  function( resource ) {
			_this.embedViewUI( resource );		
		});
	},
	embedViewUI: function( resource ) {
		var _this = this;
		// Load the player module: 
		mw.load( 'EmbedPlayer', function() {
			// Add the embed code: ( jquery wrapping of "video" fails )
			$j( _this.target ).append(
				$j( '<div class="videoLoading">').html(
				'<video id="timed-text-player-embed" '+ 		
				 'style="width:' + resource.width + 'px;height:' + resource.height + 'px;" '+			 
				 'class="kskin" ' +  //We need to centrally store this config somewhere
				 'poster="' + resource.poster + '" ' +
				 'src="' + resource.src + '" ' + 
				 'apiTitleKey="' + resource.apiTitleKey + '" >' +					 
				 '</video><br><br><br><br>'					
				)
			);				
			$j('.videoLoading').hide();
			// embed the player with the pre-selected langauge:
			_this.embedPlayerLang();
		});
	},
	/*
	* embeds a player with the current language key pre selected
	*/
	embedPlayerLang: function() {
		var _this = this;
		if( wgArticlePath ) {
			var $fileLink = $j('<div>').append(
				$j('<a>').attr({
					'href' : wgArticlePath.replace( '$1', 'File:' + _this.fileTitleKey)
				})
				.text( _this.fileTitleKey.replace('_', ' ') )
			)
		}
	
		// Rewrite the player (any video tags on the page) 
		$j('#timed-text-player-embed').embedPlayer( function() {
			//Select the timed text for the page: 
			
			//remove the loader
			$j('.loadingSpinner').remove();
			
			var player = $j('#timed-text-player-embed').get(0);
			
		
			if( !player.timedText ) {
				mw.log("Error: no timedText method on embedPlayer" );
				return ;
			}
			// Set the userLanguage:					
			player.timedText.config.userLanugage = this.langKey;
			
			// Make sure the timed text sources are loaded: 
			player.timedText.setupTextSources( function() {
				
				var source = player.timedText.getSourceByLanguage( _this.langKey );
				var pageMsgKey = 'mwe-language-subtitles-for-clip';
				if( ! source ) {
					pageMsgKey = "mwe-language-no-subtitles-for-clip"
				}
				// Add the page msg to the top 
				$j( _this.target ).prepend(
					$j('<h3>')
						.html(  
							gM(pageMsgKey, [ unescape( mw.Language.names[ _this.langKey ] ),  $fileLink.html() ] ) 
						)
				);							
				// Select the language if possible: 
				if( source ) {						
					player.timedText.selectTextSource( source );
				}					
				// Un-hide the player  
				$j('.videoLoading').show();
			} );		
		} );
	},
		
	/**
	* Gets the properties of a given title as a resource
	* @param {String} fileTitle Title of media asset to embed
	* @param {Function} callback [Optional] Function to call once asset is embedded
	*/ 
	getTitleResource: function( fileTitle, callback ) {
		var _this = this;
		// Get all the embed details: 
		var request = {
			'titles' : 'File:' + fileTitle,
			'prop' : 'imageinfo|revisions',
			'iiprop' : 'url|mime|size',
			'iiurlwidth' : mw.getConfig( 'videoSize').split('x').pop(),
			'rvprop' : 'content'
		}
		// (only works for commons right now) 
		mw.getJSON( request, function( data ) {
			// Check for "page not found" 
			if( data.query.pages['-1'] ) {
				//restore content: 
				$j(_this.target).html( _this.orgBody );
				return ;
			}
			// Check for redirect
			for ( var i in data.query.pages ) {
				var page = data.query.pages[i];
				if ( page.revisions[0]['*'] && page.revisions[0]['*'].indexOf( '#REDIRECT' ) === 0 ) {
					var re = new RegExp( /[^\[]*\[\[([^\]]*)/ );
					var pt = page.revisions[0]['*'].match( re );
					if ( pt[1] ) {
						mw.log( 'found redirect tyring: ' + pt[1] )
						_this.embedByTitle( pt[1], callback);
						return ;
					} else {
						mw.log( 'Error: addByTitle could not process redirect' );
						callback( false );
						return false;
					}
				}
				mw.log( "should process data result" );
				// Else process the result
				var resource = _this.getResource( page );			 
				callback( resource );
			}
		} );
	},
	
	/**
	* Get the embed code from response resource and sends it a callback
	*/
	getResource: function( page ) {
		return {					
				'apiTitleKey' : page.title.replace(/File:/ig, '' ),
				'link'		 : page.imageinfo[0].descriptionurl,					
				'poster'	 : page.imageinfo[0].thumburl,
				'src'		 : page.imageinfo[0].url,					
				'width' : page.imageinfo[0].width,
				'height': page.imageinfo[0].height
			};	
	}
};
