/**
 * mediaSource class represents a source for a media element.
 *
 * @param {Element}
 *      element: MIME type of the source.
 * @constructor
 */

/**
 * The base source attribute checks also see:
 * http://dev.w3.org/html5/spec/Overview.html#the-source-element
 */

( function( mw, $ ) { "use strict";
mw.mergeConfig( 'EmbedPlayer.SourceAttributes', [
	// source id
	'id',

	// media url
	'src',

	// Title string for the source asset
	'title',

	// boolean if we support temporal url requests on the source media
	'URLTimeEncoding',

	// Store the node name for type identification
	'nodeName',

	/**
	 * data- attributes ( not yet standards )
	*/

	// Media has a startOffset ( used for plugins that
	// display ogg page time rather than presentation time
	'data-startoffset',

	// A hint to the duration of the media file so that duration
	// can be displayed in the player without loading the media file
	'data-durationhint',

	// Source stream qualities
	// NOTE data- is striped from the attribute as we build out the "mediaSource" object
	'data-shorttitle', // short title for stream ( useful for stream switching control bar widget)
	'data-width', // the width of the stream
	'data-height', // the height of the stream
	'data-bandwidth', // the overall bitrate of the stream in bytes
	'data-sizebytes', // the size of the stream in bytes
	'data-framerate', // the framereate of the stream
	'data-flavorid', // a source flavor id ( useful for targeting devices )
	'data-aspect', // the aspect ratio, useful for adaptive protocal urls that don't have a strict height / width
	'data-tags', //the tags of the asset
	'data-assetid', //the original flavor asset id
	// Used for download attribute on mediawiki
	'data-mwtitle',
	// used for setting the api provider for mediawiki
	'data-mwprovider',

	// Media start time
	'start',

	// Media end time
	'end',

	// If the source is the default source
	'default'
] );

mw.MediaSource = function( element ) {
	this.init( element );
};

mw.MediaSource.prototype = {
	// MIME type of the source.
	mimeType:null,

	// URI of the source.
	uri:null,

	// Title of the source.
	title: null,

	// True if the source has been marked as the default.
	markedDefault: false,

	// True if the source supports url specification of offset and duration
	URLTimeEncoding:false,

	// Start offset of the requested segment
	startOffset: 0,

	// Duration of the requested segment (0 if not known)
	duration:0,

	// source id
	id: null,

	// Start time in npt format
	startNpt: null,

	// End time in npt format
	endNpt: null,

	// Language of the file
	srclang: null,
	/**
	 * MediaSource constructor:
	 */
	init : function( element ) {
		var _this = this;
		// mw.log('EmbedPlayer::adding mediaSource: ' + element);
		this.src = $( element ).attr( 'src' );

		// Set default URLTimeEncoding if we have a time url:
		// not ideal way to discover if content is on an oggz_chop server.
		// should check some other way.
		var pUrl = new mw.Uri ( this.src );
		if ( typeof pUrl.query[ 't' ] != 'undefined' ) {
			this.URLTimeEncoding = true;
		}

		var sourceAttr = mw.getConfig( 'EmbedPlayer.SourceAttributes' );
		$.each( sourceAttr, function( inx, attr ){
			if ( $( element ).attr( attr ) ) {
				// strip data- from the attribute name
				var attrName = ( attr.indexOf('data-') === 0) ? attr.substr(5) : attr
				_this[ attrName ] = $( element ).attr( attr );
				// Convert default field to boolean
				if ( attrName == 'default' ) {
					_this[ attrName ] = $( element ).attr( attr ) == "true" ? true : false;
				}
			}
		});

		// Normalize "label" to "title" ( label is the actual spec so use that over title )
		if( this.label ){
			this.title = this.label;
		}

		// Set the content type:
		if ( $( element ).attr( 'type' ) ) {
			this.mimeType = $( element ).attr( 'type' );
		}else if ( $( element ).attr( 'content-type' ) ) {
			this.mimeType = $( element ).attr( 'content-type' );
		}else if( $( element )[0].tagName.toLowerCase() == 'audio' ){
			// If the element is an "audio" tag set audio format
			this.mimeType = 'audio/ogg';
		} else {
			this.mimeType = this.detectType( this.src );
		}

		// Conform the mime type to ogg
		if( this.mimeType == 'video/theora') {
			this.mimeType = 'video/ogg';
		}

		if( this.mimeType == 'audio/vorbis') {
			this.mimeType = 'audio/ogg';
		}

		// Conform long form "video/ogg; codecs=theora" based attributes
		// @@TODO we should support codec in the type arguments
		if( this.mimeType ){
			this.mimeType = this.mimeType.split( ';' )[0];
		}

		// Check for parent elements ( supplies categories in "track" )
		if( $( element ).parent().attr('category') ) {
			this.category = $( element ).parent().attr('category');
		}

		if( $( element ).attr( 'default' ) ){
			this.markedDefault = true;
		}

		// Get the url duration ( if applicable )
		this.getURLDuration();
	},

	/**
	 * Update Source title via Element
	 *
	 * @param {Element}
	 *      element Source element to update attributes from
	 */
	updateSource: function( element ) {
		// for now just update the title:
		if ( $( element ).attr( "title" ) ) {
			this.title = $( element ).attr( "title" );
		}
	},

	/**
	 * Updates the src time and start & end
	 *
	 * @param {String}
	 *      start_time: in NPT format
	 * @param {String}
	 *      end_time: in NPT format
	 */
	updateSrcTime: function ( startNpt, endNpt ) {
		// mw.log("f:updateSrcTime: "+ startNpt+'/'+ endNpt + ' from org: ' +
		// this.startNpt+ '/'+this.endNpt);
		// mw.log("pre uri:" + this.src);
		// if we have time we can use:
		if ( this.URLTimeEncoding ) {
			// make sure its a valid start time / end time (else set default)
			if ( !mw.npt2seconds( startNpt ) ) {
				startNpt = this.startNpt;
			}

			if ( !mw.npt2seconds( endNpt ) ) {
				endNpt = this.endNpt;
			}

			this.src = mw.replaceUrlParams( this.src, {
				't': startNpt + '/' + endNpt
			});

			// update the duration
			this.getURLDuration();
		}
	},

	/**
	 * Sets the duration and sets the end time if unset
	 *
	 * @param {Float}
	 *      duration: in seconds
	 */
	setDuration: function ( duration ) {
		this.duration = duration;
		if ( !this.endNpt ) {
			this.endNpt = mw.seconds2npt( this.startOffset + duration );
		}
	},

	/**
	 * MIME type accessor function.
	 *
	 * @return {String} the MIME type of the source.
	 */
	getMIMEType: function() {
		if( this.mimeType ) {
			return this.mimeType;
		}
		this.mimeType = this.detectType( this.src );
		return this.mimeType;
	},
	
	/**
	 * Update the local src
	 * @param {String}
	 * 		src The URL to the media asset
	 */
	setSrc: function( src ){
		this.src = src;
	},

	/**
	 * URI function.
	 *
	 * @param {Number}
	 *      serverSeekTime Int: Used to adjust the URI for url based
	 *      seeks)
	 * @return {String} the URI of the source.
	 */
	getSrc: function( serverSeekTime ) {
		if ( !serverSeekTime || !this.URLTimeEncoding ) {
			return this.src;
		}
		var endvar = '';
		if ( this.endNpt ) {
			endvar = '/' + this.endNpt;
		}
		return mw.replaceUrlParams( this.src,
			{
				't': mw.seconds2npt( serverSeekTime ) + endvar
	  		}
		);
	},
	/**
	 * Title accessor function.
	 *
	 * @return {String} Title of the source.
	 */
	getTitle : function() {
		if( this.title ){
			return this.title;
		}
		// Text tracks use "label" instead of "title"
		if( this.label ){
			return this.label;
		}

		// Return a Title based on mime type:
		switch( this.getMIMEType() ) {
			case 'video/h264' :
				return gM( 'mwe-embedplayer-video-h264' );
			break;
			case 'video/x-flv' :
				return gM( 'mwe-embedplayer-video-flv' );
			break;
			case 'video/webm' :
				return gM( 'mwe-embedplayer-video-webm');
			break;
			case 'video/ogg' :
				return gM( 'mwe-embedplayer-video-ogg' );
			break;
			case 'audio/ogg' :
				return gM( 'mwe-embedplayer-video-audio' );
			break;
			case 'audio/mpeg' :
				return gM('mwe-embedplayer-audio-mpeg');
			break;
			case 'video/3gp' :
				return gM('mwe-embedplayer-video-3gp');
			break;
			case 'video/mpeg' :
				return gM('mwe-embedplayer-video-mpeg');
			break;
			case 'video/x-msvideo' :
				return gM('mwe-embedplayer-video-msvideo' );
			break;
		}

		// Return title based on file name:
		try{
			var fileName = new mw.Uri( mw.absoluteUrl( this.getSrc() ) ).path.split('/').pop();
			if( fileName ){
				return fileName;
			}
		} catch(e){}

		// Return the mime type string if not known type.
		return this.mimeType;
	},
	/**
	 * Get a short title for the stream
	 */
	getShortTitle: function(){
		var _this =this;
		if( this.shorttitle ){
			return this.shorttitle;
		}

		var genTitle = '';

		// get height
		if( this.height ){
			if( this.heigth < 255 ){
				genTitle+= '240P ';
			} else if( this.height < 370 ){
				genTitle+= '360P ';
			} else if( this.height < 500 ){
				genTitle+= '480P ';
			} else if( this.height < 800 ){
				genTitle+= '720P ';
			} else {
				genTitle+= '1080P ';
			}
		}

		// Just use a short "long title"
		genTitle += this.getTitle().replace('video', '').replace('a.', '');
		if(genTitle.length > 20) {
			genTitle = genTitle.substring(0,17) + "...";
		}

		// add the bitrate
		if( this.getBitrate() ){
			var bits = ( Math.round( this.getBitrate() / 1024 * 10 ) / 10 ) + '';
			if( bits[0] == '0' ){
				bits = bits.substring(1);
			}
			genTitle+= ' ' + bits + 'Mbs ';
		}
		return genTitle
	},
	/**
	 *
	 * Get Duration of the media in milliseconds from the source url.
	 *
	 * Supports media_url?t=ntp_start/ntp_end url request format
	 */
	getURLDuration : function() {
		// check if we have a URLTimeEncoding:
		if ( this.URLTimeEncoding ) {
			var annoURL = new mw.Uri( this.src );
			if ( annoURL.query.t ) {
				var times = annoURL.query.t.split( '/' );
				this.startNpt = times[0];
				this.endNpt = times[1];
				this.startOffset = mw.npt2seconds( this.startNpt );
				this.duration = mw.npt2seconds( this.endNpt ) - this.startOffset;
			} else {
				// look for this info as attributes
				if ( this.startOffset ) {
					this.startNpt = mw.seconds2npt( this.startOffset );
				}
				if ( this.duration ) {
					this.endNpt = mw.seconds2npt( parseInt( this.duration ) + parseInt( this.startOffset ) );
				}
			}
		}
	},
	/**
	* Get the extension of a url
	* @param String uri
	*/
	getExt : function( uri ){
		var urlParts = new mw.Uri( uri );
		// Get the extension from the url or from the relative name:
		var ext = ( urlParts.file ) ?  /[^.]+$/.exec( urlParts.file )  :  /[^.]+$/.exec( uri );
		// remove the hash string if present
		if( !ext ) {
			return '';
		}
		ext = /[^#]*/g.exec( ext.toString() );
		return ext.toString().toLowerCase();
	},
	/**
	 * Get the flavorId if available.
	 */
	getFlavorId: function(){
		if( this.flavorid ){
			return this.flavorid;
		}
		return ;
	},

	/**
	 * Attempts to detect the type of a media file based on the URI.
	 *
	 * @param {String}
	 *      uri URI of the media file.
	 * @return {String} The guessed MIME type of the file.
	 */
	detectType: function( uri ) {
		// NOTE: if media is on the same server as the javascript
		// we can issue a HEAD request and read the mime type of the media...
		// ( this will detect media mime type independently of the url name )
		// http://www.jibbering.com/2002/4/httprequest.html
		switch( this.getExt( uri ) ) {
			case 'smil':
			case 'sml':
				return 'application/smil';
			break;
			case 'm4v':
			case 'mp4':
				return 'video/h264';
			break;
			case 'm3u8':
				return 'application/vnd.apple.mpegurl';
			break;
			case 'webm':
				return 'video/webm';
			break;
			case '3gp':
				return 'video/3gp';
			break;
			case 'srt':
				return 'text/x-srt';
			break;
			case 'flv':
				return 'video/x-flv';
			break;
			case 'ogg':
			case 'ogv':
				return 'video/ogg';
			break;
			case 'oga':
				return 'audio/ogg';
			break;
			case 'mp3':
				return 'audio/mpeg';
			break;
			case 'anx':
				return 'video/ogg';
			break;
			case 'xml':
				return 'text/xml';
			break;
			case 'avi':
				return 'video/x-msvideo';
			break;
			case 'mpg':
				return 'video/mpeg';
			break;
			case 'mpeg':
				return 'video/mpeg';
			break;
		}
		mw.log( "Error: could not detect type of media src: " + uri );
	},

	/**
	 * Bitrate is measured in kbs rather than bandwidth bytes per second
	 */
	getBitrate: function() {
		if( this.bandwidth ){
			return this.bandwidth / 1024;
		}
		return 0;
	},

	/**
	 * Get the size of the stream in bytes
	 */
	getSize: function(){
		if( this.sizebytes ){
			return this.sizebytes;
		}
		return 0;
	},

	getTags: function() {
		return this.tags;
	},

	getAssetId: function() {
		return this.assetid;
	}
};

} )( mediaWiki, jQuery );
