/**
 * Base mw.TextTrack object
 *
 * @param {Object} source Source object to extend
 * @param {Object} textProvider [Optional] The text provider interface ( to load source from api )
 */


( function( mw, $ ) {

	mw.TextTrack = function( source ) {
		return this.init( source );
	};
	mw.TextTrack.prototype = {
	
		//The load state:
		loaded: false,
	
		// Container for the captions
		// captions include "start", "end" and "content" fields
		captions: [],
	
		// The previous index of the timed text served
		// Avoids searching the entire array on time updates.
		prevIndex: 0,
	
		/**
		 * @constructor Inherits mediaSource from embedPlayer
		 * @param {source} Base source element
		 * @param {Object} Pointer to the textProvider 
		 */
		init: function( source , textProvider) {
			//	Inherits mediaSource
			for( var i in source){
				this[ i ] =  source[ i];
			}
			
			// Set default category to subtitle if unset:
			if( ! this.category ) {
				this.category = 'SUB';
			}
			//Set the textProvider if provided
			if( textProvider ) {
				this.textProvider = textProvider;
			}
			
			return this;
		},
	
		/**
		 * Function to load and parse the source text
		 * @param {Function} callback Function called once text source is loaded
		 */
		load: function( callback ) {
			var _this = this;
			// check if the captions have already been loaded:
			if( _this.loaded ){
				callback(  _this.captions );
				return ;
			} 
			 _this.loaded = true;					
	
			// Try to load src via XHR source
			if( !this.getSrc() ) {
				mw.log("Error: no source url for text track");
			}
			
			// Check if we can directly request the content: 
			if( mw.isLocalDomain() ){
				$.get( this.getSrc(), function( data ) {
					// Parse and load captions:
					_this.captions = _this.getCaptions( data );
					mw.log("mw.TimedText:: loaded from srt file: " + _this.captions.length + ' captions');
					// Update the loaded state:
					_this.loaded = true;
					if( callback ) {
						callback();
					}
				});
			}
			
			// Check if we can load by proxy ::
			if ( !mw.isLocalDomain( this.getSrc() ) && !mw.getConfig('Mw.XmlProxyUrl') ) {
				mw.log("Error: no text proxy and requesting cross domain srt location: " + this.getSrc() )
			}
		
			
			return ;
		},
	
		/**
		* Returns the text content for requested time
		*
		* @param {String} time Time in seconds
		*/
		getTimedText: function ( time ) {
			var prevCaption = this.captions[ this.prevIndex ];
	
			// Setup the startIndex:
			if( prevCaption && time >= prevCaption.start ) {
				var startIndex = this.prevIndex;
			}else{
				//If a backwards seek start searching at the start:
				var startIndex = 0;
			}
			// Start looking for the text via time, return first match:
			for( var i = startIndex ; i < this.captions.length; i++ ) {
				var caption = this.captions[ i ];
				// Don't handle captions with 0 or -1 end time:
				if( caption.end == 0 || caption.end == -1)
					continue;
	
				if( time >= caption.start &&
					time <= caption.end ) {
					this.prevIndex = i;
					//mw.log("Start cap time: " + caption.start + ' End time: ' + caption.end );
					return caption.content;
				}
			}
			//No text found in range return false:
			return false;
		},
		getCaptions: function( data ){
			// detect caption data type: 
			debugger;
			
		},

		/**
		 * srt timed text parse handle:
		 * @param {String} data Srt string to be parsed
		 */
		getCaptionsFromSrt: function ( data ){
			// Remove dos newlines
			var srt = data.replace(/\r+/g, '');
		
			// Trim white space start and end
			srt = srt.replace(/^\s+|\s+$/g, '');
		
			// Remove all html tags for security reasons
			srt = srt.replace(/<[a-zA-Z\/][^>]*>/g, '');
		
			// Get captions
			var captions = [];
			var caplist = srt.split('\n\n');
			for (var i = 0; i < caplist.length; i++) {
		 		var caption = "";
				var content, start, end, s;
				caption = caplist[i];
				s = caption.split(/\n/);
				if (s.length < 2) {
					// file format error or comment lines
					continue;
				}
				if (s[0].match(/^\d+$/) && s[1].match(/\d+:\d+:\d+/)) {
					// ignore caption number in s[0]
					// parse time string
					var m = s[1].match(/(\d+):(\d+):(\d+)(?:,(\d+))?\s*--?>\s*(\d+):(\d+):(\d+)(?:,(\d+))?/);
					if (m) {
						start =
							(parseInt(m[1], 10) * 60 * 60) +
							(parseInt(m[2], 10) * 60) +
							(parseInt(m[3], 10)) +
							(parseInt(m[4], 10) / 1000);
						end =
							(parseInt(m[5], 10) * 60 * 60) +
							(parseInt(m[6], 10) * 60) +
							(parseInt(m[7], 10)) +
							(parseInt(m[8], 10) / 1000);
					} else {
						// Unrecognized timestring
						continue;
					}
					// concatenate text lines to html text
					content = s.slice(2).join("<br>");
				} else {
					// file format error or comment lines
					continue;
				}
				captions.push({
					'start' : start,
					'end' : end,
					'content' : content
				} );
			}
		
			return captions;
		}
	};
	
} )( window.mediaWiki, window.jQuery );