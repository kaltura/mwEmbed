/**
 * A media element corresponding to a <video> element.
 *
 * It is implemented as a collection of mediaSource objects. The media sources
 * will be initialized from the <video> element, its child <source> elements,
 * and/or the ROE file referenced by the <video> element.
 *
 * @param {element}
 *	  videoElement <video> element used for initialization.
 * @constructor
 */
( function( mw, $ ) { "use strict";

mw.MediaElement = function( element ) {
	this.init( element );
};

mw.MediaElement.prototype = {

	// The array of mediaSource elements.
	sources: null,

	// flag for ROE data being added.
	addedROEData: false,

	// Selected mediaSource element.
	selectedSource: null,
	
	// the prefered target flavor bitrate:
	preferedFlavorBR: null,

	/**
	 * Media Element constructor
	 *
	 * Sets up a mediaElement from a provided top level "video" element adds any
	 * child sources that are found
	 *
	 * @param {Element}
	 *	  videoElement Element that has src attribute or has children
	 *	  source elements
	 */
	init: function( videoElement ) {
		var _this = this;
		mw.log( "EmbedPlayer::mediaElement:init:" + videoElement.id );
		this.parentEmbedId = videoElement.id;
		this.sources = new Array();

		// Process the videoElement as a source element:
		if( videoElement ){
			if ( $( videoElement ).attr( "src" ) ) {
				_this.tryAddSource( videoElement );
			}
			// Process elements source children
			$( videoElement ).find( 'source,track' ).each( function( ) {
				_this.tryAddSource( this );
			} );
		}
	},

	/**
	 * Updates the time request for all sources that have a standard time
	 * request argument (ie &t=start_time/end_time)
	 *
	 * @param {String}
	 *	  startNpt Start time in npt format
	 * @param {String}
	 *	  endNpt End time in npt format
	 */
	updateSourceTimes: function( startNpt, endNpt ) {
		var _this = this;
		$.each( this.sources, function( inx, mediaSource ) {
			mediaSource.updateSrcTime( startNpt, endNpt );
		} );
	},

	/**
	 * Get Text tracks
	 */
	getTextTracks: function(){
		var textTracks = [];
		$.each( this.sources, function(inx, source ){
			if (  source.nodeName == 'track' || ( source.mimeType && source.mimeType.indexOf('text/') !== -1 )){
				textTracks.push( source );
			}
		});
		return textTracks;
	},
	/**
	 * Returns the array of mediaSources of this element.
	 *
	 * @param {String}
	 *	  [mimeFilter] Filter criteria for set of mediaSources to return
	 * @return {Array} mediaSource elements.
	 */
	getSources: function( mimeFilter ) {
		if ( !mimeFilter ) {
			return this.sources;
		}
		// Apply mime filter:
		var source_set = new Array();
		for ( var i = 0; i < this.sources.length ; i++ ) {
			if ( this.sources[i].mimeType &&
				 this.sources[i].mimeType.indexOf( mimeFilter ) != -1 )
			{
				source_set.push( this.sources[i] );
			}
		}
		return source_set;
	},

	/**
	 * Selects a source by id
	 *
	 * @param {String}
	 *	  sourceId Id of the source to select.
	 * @return {MediaSource} The selected mediaSource or null if not found
	 */
	getSourceById:function( sourceId ) {
		for ( var i = 0; i < this.sources.length ; i++ ) {
			if ( this.sources[i].id == sourceId ) {
				return this.sources[i];
			}
		}
		return null;
	},

	/**
	 * Selects a particular source for playback updating the "selectedSource"
	 *
	 * @param {Number}
	 *	  index Index of source element to set as selectedSource
	 */
	setSourceByIndex: function( index ) {
		mw.log( 'EmbedPlayer::mediaElement:selectSource: ' + index );
		var playableSources = this.getPlayableSources();
		var oldSrc;
		if ( this.selectedSource ) {
			oldSrc = this.selectedSource.getSrc();
		}
		for ( var i = 0; i < playableSources.length; i++ ) {
			if ( i == index ) {
				this.selectedSource = playableSources[i];
				break;
			}
		}
		if( ! oldSrc || oldSrc !=  this.selectedSource.getSrc() ){
			$( '#' + this.parentEmbedId ).trigger( 'SourceChange');
		}
	},
	/**
	 * Sets a the selected source to passed in source object
	 * @param {Object} Source
	 */
	setSource: function( source ){
		var oldSrc = this.selectedSource;
		this.selectedSource = source;
		if( !oldSrc || oldSrc.getSrc() != source.getSrc() ){
			$( '#' + this.parentEmbedId ).trigger( 'SourceChange');
		}
		return this.selectedSource;
	},


	/**
	 * Selects the default source via cookie preference, default marked, or by
	 * id order
	 */
	autoSelectSource: function() {
		mw.log( 'EmbedPlayer::mediaElement::autoSelectSource' );
		var _this = this;
		// Select the default source
		var playableSources = this.getPlayableSources();
		var flash_flag = false, ogg_flag = false;
		// null out the existing selected source to autoSelect ( in case params have changed ). 
		this.selectedSource  = null;
		// Check if there are any playableSources
		if( playableSources.length == 0 ){
			return false;
		}

		// Set via module driven preference:
		$( this ).trigger( 'onSelectSource', playableSources );

		if( _this.selectedSource ){
			mw.log('MediaElement::autoSelectSource: Set via trigger::' + _this.selectedSource.getTitle() );
			return _this.selectedSource;
		}

		// Set via marked default:
		$.each( playableSources, function( inx, source ){
			if ( source.markedDefault ) {
				mw.log( 'MediaElement::autoSelectSource: Set via marked default: ' + source.markedDefault );
				return _this.setSource( source );
			}
		});

		//this array contains mimeTypes player should prefer to select, sorted by descending order
		var typesToCheck = ['video/playreadySmooth', 'video/ism'];
		for ( var i = 0; i < typesToCheck.length; i++ ) {
			var matchingSources = this.getPlayableSources( typesToCheck[i] );
			if ( matchingSources.length ) {
				mw.log( 'MediaElement::autoSelectSource: Set prefered mimeType flavor ' + typesToCheck[i] );
				return _this.setSource( matchingSources[0] );
			}
		}

		// Set apple adaptive ( if available )
		var vndSources = this.getPlayableSources('application/vnd.apple.mpegurl');
		if( vndSources.length && mw.EmbedTypes.getMediaPlayers().getMIMETypePlayers( 'application/vnd.apple.mpegurl' ).length ){
			// Check for device flags:
			var desktopVdn, mobileVdn;
			$.each( vndSources, function( inx, source) {
				// Kaltura tags vdn sources with iphonenew
				if( source.getFlavorId() && source.getFlavorId().toLowerCase() == 'iphonenew' ){
					mobileVdn = source;
				} else {
					desktopVdn = source;
				}
			});
			// NOTE: We really should not have two VDN sources the point of vdn is to be a set of adaptive streams.
			// This work around is a result of Kaltura HLS stream tagging
			if( ( mw.isIphone() || mw.isAndroid4andUp() ) && mobileVdn ){
				_this.setSource( mobileVdn );
			} else if( desktopVdn ){
				_this.setSource( desktopVdn );
			}
		}
		if ( this.selectedSource ) {
			mw.log('MediaElement::autoSelectSource: Set via Adaptive HLS: source flavor id:' + _this.selectedSource.getFlavorId() + ' src: ' + _this.selectedSource.getSrc() );
			return this.selectedSource;
		}

		// Set via user bandwidth pref will always set source to closest bandwidth allocation while not going over  
		// uses the EmbedPlayer.UserBandwidth cookie first, or the preferedFlavorBR data
		
		if( $.cookie('EmbedPlayer.UserBandwidth') || this.preferedFlavorBR ){
			var bandwidthDelta = 999999999;
			var bandwidthTarget = $.cookie('EmbedPlayer.UserBandwidth') || this.preferedFlavorBR;
			$.each( playableSources, function(inx, source ){
				if( source.bandwidth ){
					// Check if a native source ( takes president over bandwidth selection )
					// ( we never prefer a non-native flavor ) 
					var player = mw.EmbedTypes.getMediaPlayers().defaultPlayer( source.mimeType );
					if ( !player || player.library != 'Native'	) {
						// continue
						return true;
					}

					if( Math.abs( source.bandwidth - bandwidthTarget ) < bandwidthDelta ){
						bandwidthDelta = Math.abs( source.bandwidth - bandwidthTarget );
						_this.setSource( source );
					}
				}
			});
			if ( this.selectedSource ) {
				var setTypeName = (  $.cookie('EmbedPlayer.UserBandwidth') )? 'cookie': 'preferedFlavorBR'
				mw.log('MediaElement::autoSelectSource: ' +
					'Set via bandwidth, ' + setTypeName + ' source:' +
						this.selectedSource.bandwidth + ' target: ' + bandwidthTarget );
				return this.selectedSource;
			}
		}

		// If we have at least one native source, throw out non-native sources
		// for size based source selection:
		var nativePlayableSources = [];
		$.each( playableSources, function(inx, source ){
			var mimeType = source.mimeType;
			var player = mw.EmbedTypes.getMediaPlayers().defaultPlayer( mimeType );
			if ( player && player.library == 'Native'	) {
				nativePlayableSources.push( source );
			}
		});

		// Prefer native playback ( and prefer WebM over ogg and h.264 )
		var namedSourceSet = {};
		$.each( playableSources, function(inx, source ){
			var mimeType = source.mimeType;
			var player = mw.EmbedTypes.getMediaPlayers().defaultPlayer( mimeType );
			if ( player && player.library == 'Native'	) {
				switch( player.id	){
					case 'mp3Native':
						var shortName = 'mp3';
						break;
					case 'oggNative':
						var shortName = 'ogg';
						break;
					case 'webmNative':
						var shortName = 'webm';
						break;
					case 'h264Native':
						var shortName = 'h264';
						break;
					case 'appleVdn':
						var shortName = 'appleVdn';
						break;
				}
				if( !namedSourceSet[ shortName ] ){
					namedSourceSet[ shortName ] = [];
				}
				namedSourceSet[ shortName ].push( source );
			}
		});
		
		// Check if is mobile ( and we don't have a flavor id based selection )
		// get the most compatible h.264 file
		if ( mw.isMobileDevice() && namedSourceSet[ 'h264' ] && namedSourceSet[ 'h264' ].length ){
			var minSize = 99999999;
			$.each( namedSourceSet[ 'h264' ], function( inx, source ){
				// Don't select sources of type audio, 
				// ( if an actual audio file don't use "width" as a source selection metric )
				if( parseInt( source.width ) < parseInt( minSize ) && parseInt( source.width ) != 0 ){
					minSize = source.width;
					_this.setSource( source );
				}
			})
		}
		if ( this.selectedSource ) {
			mw.log('MediaElement::autoSelectSource: mobileDevice; most compatible h.264 because of resolution:' + this.selectedSource.width );
			return this.selectedSource;
		}

		var codecPref = mw.getConfig( 'EmbedPlayer.CodecPreference');
		if( codecPref ){
			for(var i =0; i < codecPref.length; i++){
				var codec = codecPref[ i ];
				if( !  namedSourceSet[ codec ] ){
					continue;
				}
				if( namedSourceSet[ codec ].length == 1 ){
					mw.log('MediaElement::autoSelectSource: Set 1 source via EmbedPlayer.CodecPreference: ' + namedSourceSet[ codec ][0].getTitle() );
					return _this.setSource( namedSourceSet[ codec ][0] );
				} else if( namedSourceSet[ codec ].length > 1 ) {
					// select based on size:
					// Set via embed resolution closest to relative to display size
					var minSizeDelta = null;
					if( this.parentEmbedId ){
						var displayWidth = $('#' + this.parentEmbedId).width();
						$.each( namedSourceSet[ codec ], function(inx, source ){
							if( parseInt( source.width ) && displayWidth ){
								var sizeDelta =  Math.abs( source.width - displayWidth );
								//mw.log('MediaElement::autoSelectSource: size delta : ' + sizeDelta + ' for s:' + source.width );
								if( minSizeDelta == null ||  sizeDelta < minSizeDelta){
									minSizeDelta = sizeDelta;
									_this.setSource( source );
								}
							}
						});
					}
					// If we found a source via display size return:
					if ( this.selectedSource ) {
						mw.log('MediaElement::autoSelectSource: from  ' + this.selectedSource.mimeType + ' because of resolution:' + this.selectedSource.width + ' close to: ' + displayWidth );
						return this.selectedSource;
					}
					// if no size info is set just select the first source:
					if( namedSourceSet[ codec ][0] ){
						mw.log('MediaElement::autoSelectSource: first codec prefrence source');
						return _this.setSource( namedSourceSet[ codec ][0] );
					}
				}
			};
		}

		// Set h264 via native or flash fallback
		$.each( playableSources, function(inx, source ){
			var mimeType = source.mimeType;
			var player = mw.EmbedTypes.getMediaPlayers().defaultPlayer( mimeType );
			if ( mimeType == 'video/h264'
				&& player
				&& (
					player.library == 'Native'
					||
					player.library == 'Kplayer'
				)
			) {
				if( source ){
					mw.log('MediaElement::autoSelectSource: Set h264 via native or flash fallback:' + source.getTitle() );
					return _this.setSource( source );
				}
			}
		});

		if ( this.selectedSource ) {
			mw.log('MediaElement::autoSelectSource: from  ' + this.selectedSource.mimeType + ' because of resolution:' + this.selectedSource.width + ' close to: ' + displayWidth );
			return this.selectedSource;
		}

		// Else just select the first playable source
		if ( !this.selectedSource && playableSources[0] ) {
			mw.log( 'MediaElement::autoSelectSource: Set via first source: ' + playableSources[0].getTitle() + ' mime: ' + playableSources[0].getMIMEType() );
			return _this.setSource( playableSources[0] );
		}
		mw.log( 'MediaElement::autoSelectSource: no match found');
		// No Source found so no source selected
		return false;
	},

	/**
	 * check if the mime is ogg
	 */
	isOgg: function( mimeType ){
		if ( mimeType == 'video/ogg'
			|| mimeType == 'ogg/video'
			|| mimeType == 'video/annodex'
			|| mimeType == 'application/ogg'
		) {
			return true;
		}
		return false;
	},

	/**
	 * Returns the thumbnail URL for the media element.
	 *
	 * @returns {String} thumbnail URL
	 */
	getPosterSrc: function( ) {
		return this.poster;
	},

	/**
	 * Checks whether there is a stream of a specified MIME type.
	 *
	 * @param {String}
	 *	  mimeType MIME type to check.
	 * @return {Boolean} true if sources include MIME false if not.
	 */
	hasStreamOfMIMEType: function( mimeType )
	{
		for ( var i = 0; i < this.sources.length; i++ )
		{
			if ( this.sources[i].getMIMEType() == mimeType ){
				return true;
			}
		}
		return false;
	},

	/**
	 * Checks if media is a playable type
	 */
	isPlayableType: function( mimeType ) {
		//	mw.log("isPlayableType:: " + mimeType);
		if ( mw.EmbedTypes.getMediaPlayers().defaultPlayer( mimeType ) ) {
			return true;
		} else {
			return false;
		}
	},

	/**
	 * Adds a single mediaSource using the provided element if the element has a
	 * 'src' attribute.
	 *
	 * @param {Element}
	 *	  element <video>, <source> or <mediaSource> <text> element.
	 */
	tryAddSource: function( element ) {
		try {
			// Check if our source is already MediaSource
			if( element instanceof mw.MediaSource ){
				this.sources.push( element );
				return element;
			}

			//mw.log( 'mw.MediaElement::tryAddSource:' + $( element ).attr( "src" ) );
			var newSrc = $( element ).attr( 'src' );
			if ( newSrc ) {
				// Make sure an existing element with the same src does not already exist:
				for ( var i = 0; i < this.sources.length; i++ ) {
					if ( this.sources[i].src == newSrc ) {
						// Source already exists update any new attr:
						this.sources[i].updateSource( element );
						return this.sources[i];
					}
				}
			}
			// Create a new source
			var source = new mw.MediaSource( element );

			this.sources.push( source );
			// Add <track> element as child of <video> tag
			if( element.nodeName && element.nodeName.toLowerCase() === 'track'){
                // under iOS - if there are captions within the HLS stream, users should set disableTrackElement=true in the flashVars to prevent duplications
                if (!mw.isIOS() || (mw.isIOS() && !mw.getConfig('disableTrackElement'))){
                    var $vid = $( '#pid_' + this.parentEmbedId );
                    if( $vid.length ){
                        $vid.append(element);
                    }
                }
			}
			//mw.log( 'tryAddSource: added source ::' + source + 'sl:' + this.sources.length );
			return source;
		}
		catch(e){
			mw.log("Error occur in tryAddSource (ignore if we're in IE8):"+e);
		}
	},

	/**
	 * Get playable sources
	 *
	 *@pram mimeFilter {=string} (optional) Filter the playable sources set by mime filter
	 *
	 * @returns {Array} of playable media sources
	 */
	getPlayableSources: function( mimeFilter ) {
		 var playableSources = [];
		 for ( var i = 0; i < this.sources.length; i++ ) {
			 if ( this.isPlayableType( this.sources[i].mimeType )
					 &&
				( !mimeFilter || this.sources[i].mimeType.indexOf( mimeFilter) != -1  )
			){
				 playableSources.push( this.sources[i] );
			}
		 };
		 mw.log( "MediaElement::GetPlayableSources mimeFilter:" + mimeFilter + " " +
				 playableSources.length + ' sources playable out of ' +  this.sources.length );

		 return playableSources;
	}
};

} )( mediaWiki, jQuery );

