/*
 * Used to embed HTML as a movie clip
 * for use with mv_playlist SMIL additions
 * 
 * NOTE:  will likely be depricated 
 */
var pcHtmlEmbedDefaults = {
	// default duration of 4 seconds	
	'dur':4 
}

mw.EmbedPlayerHtml = {
	
	// Instance name: 
	instanceOf: 'Html',	

	// List of supported features
	supports: {
		'playHead':true,
		'pause':true,
		'fullscreen':false,
		'timeDisplay':true,
		'volumeControl':true,

		'overlays':true,
		
		// if the object supports playlist functions
		'playlist_swap_loader':true 
	},
	
	// If the player is "ready to play"
	ready_to_play:true,
	
	// Pause time used to track player time between pauses
	pauseTime:0,
	
	// currentTime updated via internal clockStartTime var
	currentTime:0,
	
	// StartOffset support seeking into the virtual player
	startOffset:0,
	
	// The local clock used to emulate playback time
	clockStartTime: 0,
	
	/**
	*  Play function starts the v
	*/
	play: function() {
		mw.log(" parent: " + this.parent_play);		
		// call the parent
		this.parent_play();

		mw.log( 'f:play: htmlEmbedWrapper' );
		var ct = new Date();
		this.clockStartTime = ct.getTime();

		// Start up monitor:
		this.monitor();
	},
	
	/**
	* Stops the playback
	*/
	stop:function() {
		this.currentTime = 0;
		this.pause();		
	},
	
	/**
	* Preserves the pause time across for timed playback 
	*/
	pause:function() {
		mw.log( 'f:pause: htmlEmbedWrapper' );
		var ct = new Date();
		this.pauseTime = this.currentTime;
		mw.log( 'pause time: ' + this.pauseTime );
		
		window.clearInterval( this.monitorTimerId );
	},
	
	/**
	* Seeks to a given percent and updates the pauseTime
	*
	* @param {Float} perc Pecentage to seek into the virtual player
	*/
	doSeek:function( perc ) {
		this.pauseTime = perc * this.getDuration();
		this.play();
	},
	
	/** 
	* Sets the current Time 
	*
	* @param {Float} perc Pecentage to seek into the virtual player
	* @param {Function} callback Function called once time has been updated
	*/
	setCurrentTime:function( perc, callback ) {
		this.pauseTime = perc * this.getDuration();
		if( callback )
			callback();
	},
	
	/**
	* Get the embed player time
	*/
	getPlayerElementTime: function() {
		//mw.log('html:monitor: '+ this.currentTime);		
		var ct = new Date();
		var currentTime = ( ( ct.getTime() - this.clockStartTime ) / 1000 ) + this.pauseTime;		
		return currentTime;
	},
	
	/**
	* Minimal media_element emulation:
	*/	 
	media_element: {
		autoSelectSource:function() {
			return true;
		},
		selectedPlayer: {
			library : "html"
		},
		selected_source: {
			URLTimeEncoding:false
		},
		checkForTextSource:function() {
			return false;
		}
	},
	
	/**	
	* HtmlEmbed supports virtual instances without inheriting the embedPlayer 
	*/
	inheritEmbedPlayer: function() {
		return true;
	},
	
	/**
	* Render out a Thumbnail representation for use in the sequencer
	*
	* @param {Object} options Thumbnail options
	*/	
	renderTimelineThumbnail:function( options ) {
		mw.log( "HTMLembed req w, height: " + options.width + ' ' + options.height );
		// generate a scaled down version _that_ we can clone if nessisary
		// add a not vissiable container to the body:
		var do_refresh = ( typeof options['refresh'] != 'undefined' ) ? true:false;

		var thumb_render_id =   this.id + '_thumb_render_' + options.height;
		if ( $j( '#' + thumb_render_id ).length == 0  ||  do_refresh ) {
		
			// Set the font scale down percentage: (kind of arbitrary)
			var scale_perc = options.width / this.pc.pp.width;
			
			mw.log( 'scale_perc:' + options.width + ' / ' + $j( this ).width() + ' = ' + scale_perc );
			
			// Min scale font percent of 70 (overflow is hidden)
			var font_perc  = ( Math.round( scale_perc * 100 ) < 80 ) ? 80 : Math.round( scale_perc * 100 );
			var thumb_class = ( typeof options['thumb_class'] != 'undefined' ) ? options['thumb_class'] : '';
			$j( 'body' ).append( '<div id="' + thumb_render_id + '" style="display:none">' +
									'<div class="' + thumb_class + '" ' +
									'style="width:' + options.width + 'px;height:' + options.height + 'px;" >' +
											this.getThumbnailHTML( {
												'width':  options.width,
												'height': options.height
											} ) +
									'</div>' +
								'</div>'
							  );
							  
			// Scale down the fonts:
			$j( '#' + thumb_render_id + ' *' ).filter( 'span,div,p,h,h1,h2,h3,h4,h5,h6' ).css( 'font-size', font_perc + '%' )
			
			// Replace out links:
			$j( '#' + thumb_render_id + ' a' ).each( function() {
				$j( this ).replaceWith( "<span>" + $j( this ).html() + "</span>" );
			} );
			
			// Scale images that have width or height:
			$j( '#' + thumb_render_id + ' img' ).filter( '[width]' ).each( function() {
				$j( this ).attr( {
						'width': Math.round( $j( this ).attr( 'width' ) * scale_perc ),
						'height': Math.round( $j( this ).attr( 'height' ) * scale_perc )
					 }
				);
			} );
		}
		return $j( '#' + thumb_render_id ).html();
	},
	/*
	* Updates the thumb time
	* (does nothings since we display a single frame renderd html page)
	*
	* @param {Float} float_time Ignored 	
	*/
	updateThumbTime:function( float_time ) {
		return ;
	},
	
	/**
	* Get the "embed" html for the html player
	*/
	doEmbedHTML: function() {
		mw.log( 'f:html:doEmbedHTML: ' + this.id );
		// set up the css for our parent div:		 
		$j( this ).css( {
			'width':this.pc.pp.width,
			'height':this.pc.pp.height,
			'overflow':"hidden"
		} );
		// @@todo support more smil animation layout stuff: 

		// wrap output in videoPlayer_ div:
		$j( this ).html( this.getThumbnailHTML() );
	},
	
	/**
	* Get the ThumbnailHTML
	*  ThumbnailHTML is used for both the "paused and playing states of the htmlEmbed player	
	*/
	getThumbnailHTML: function( opt ) {
		var out = '';
		if ( !opt )
			opt = { };
		var height = ( opt.height ) ? opt.height:this.pc.pp.height;
		var width = ( opt.width ) ? opt.width: this.pc.pp.width;
		mw.log( '1req ' + opt.height + ' but got: ' + height );
		if ( this.pc.type == 'image/jpeg' ||  this.pc.type == 'image/png' ) {
			mw.log( 'should put src: ' + this.pc.src );
			out = '<img style="width:' + width + 'px;height:' + height + 'px" src="' + this.pc.src + '">';
		} else {
			out = this.pc.wholeText;
		}
		// mw.log('f:getThumbnailHTML: got thumb: '+out);
		return out;
	},
	updateThumbnailHTML: function(){
		$j( this ).css( 'background', '#fff');
		$j( this ).html( this.getThumbnailHTML() );
	},
	
	/**
	* re-show the Thumbnail
	*/
	showThumbnail:function() {
		mw.log( 'htmlEmbed:showThumbnail()' );
		this.getEmbedHTML();
	},
	
	/**
	* Get the media duration
	*/
	getDuration:function() {
		if( !this.duration ) {
		 	if( this.pc.dur ) {
				this.duration = this.pc.dur;
			}else if( pcHtmlEmbedDefaults.dur ) {
				this.duration = pcHtmlEmbedDefaults.dur ;
			} 
		}  
		return this.duration; 
	},
	
	/**
	* Updates the Video time 
	*
	* @param {String} start_npt Start time for update
	* @param {String} end_npt End time for update  
	*/
	updateVideoTime:function( start_npt, end_npt ) {
		// since we don't really have timeline for html elements just take the delta and set it as the duration
		this.pc.dur = mw.npt2seconds( end_ntp ) - mw.npt2seconds( start_ntp );
	},
	
	/**
	* Local implementation of swapPlayerElement
	*/
	swapPlayerElement:function() {
		this.loading_external_data = false
		this.ready_to_play = true;
		return ;
	}
};