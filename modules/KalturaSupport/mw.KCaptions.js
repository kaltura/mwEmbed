/**
* Adds captions support
*/
( function( mw, $ ) {
	
mw.KCaptions = function( embedPlayer, callback ){
	this.init( embedPlayer, callback );
};
mw.KCaptions.prototype = {
	init: function( embedPlayer, callback ){
		this.embedPlayer = embedPlayer;
		this.callback = callback;

		var partner_id = embedPlayer.kwidgetid.replace('_', '');
		this.kClient = mw.kApiGetPartnerClient( partner_id );

		this.loadSources();
	},
	/**
	 * Load captions from kaltura api
	 */
	loadSources: function() {
		var _this = this;
		
		// Remove this when eagle is out
		if( mw.getConfig('Kaltura.TempCaptions') ) {
			_this.entryCaptions = mw.getConfig('Kaltura.TempCaptions');
			_this.addSources();
			_this.callback();
			return ;
		}
		// End remove

		this.kClient.doRequest( {
			'service' : 'caption_captionasset',
			'action' : 'list',
			'filter:objectType' : 'KalturaAssetFilter',
			'filter:entryIdEqual' : _this.embedPlayer.kentryid,
			'filter:statusEqual' : 2
		}, function( data ) {
			mw.log( "KCaptions:: Captions loaded: " + data.totalCount);
			if( data.totalCount > 0 ) {
				_this.entryCaptions = data.objects;
				_this.addSources();
			}
			_this.callback();
		});
	},
	/**
	 * Adds captions to our player
	 */
	addSources: function(){
		var _this = this;
		var textSources = this.entryCaptions;

		var timedText = new mw.TimedText( _this.embedPlayer );
			timedText.textSources = [];

		for( var i=0; i < textSources.length; i++ ) {
			var textSource = textSources[ i ];
			textSource.languageCode = 'en'; // TODO: Hardcoded for now, remove when new client is generated
			// Try to insert the track source:
			var textElm = document.createElement( 'track' );
			$( textElm ).attr({
				'kind'		: 'subtitles',
				'language'	: textSource.language,
				'srclang' 	: textSource.languageCode,
				'label'		: textSource.label,
				'id'		: textSource.id,
				'fileExt'	: textSource.fileExt,
				'src'		: this.getCaptionUrl(textSource.id, textSource.fileExt),
				'title'		: textSource.label
			});

			// Add the sources to the parent embedPlayer
			// ( in case other interfaces want to access them )
			var embedSource = _this.embedPlayer.mediaElement.tryAddSource( textElm );
			//$('#' + _this.embedPlayer.pid ).append(textElm);

			// Get a "textSource" object:
			timedText.textSources.push( new mw.TextSource( embedSource ) );
			timedText.enabledSources.push( new mw.TextSource( embedSource ) );
			timedText.currentLangKey = 'en';
		}

		timedText.setupTextSources( function() {
			console.log('done setting up captions');
		});
	},
	/**
	* Returns the caption serve url
	* @param {String} captionId - caption asset id
	* @param {String} type - caption asset type
	*/
	getCaptionUrl: function( captionId, type ){
		// Sample Url for Caption serve
		// http://www.kaltura.com/api_v3/index.php?service=caption_captionasset&action=serve&captionAssetId=@ID@&ks=@KS@
		var params = {
			'action': 'serve',
			'captionAssetId': captionId,
			'ks': this.kClient.ks
		};

		var baseUrl = mw.getConfig('Kaltura.ServiceUrl') + mw.getConfig('Kaltura.ServiceBase').replace('index.php', '');
		return baseUrl + 'caption_captionasset&' + $j.param( params ) + '&.' + type;
	}
	
};

mw.KCaptionsLoader = function( embedPlayer, callback ) {
	new mw.KCaptions( embedPlayer, callback );
}

} )( window.mw, jQuery );