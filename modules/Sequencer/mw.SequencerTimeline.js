
//Wrap in mw closure to avoid global leakage
( function( mw ) {
	
mw.SequencerTimeline = function( sequencer ) {
	return this.init( sequencer );
};

// Set up the mvSequencer object
mw.SequencerTimeline.prototype = {
	// Lazy init $timelineTracksContainer
	$timelineTracksContainer : null,
	
	// store a pointer to the track layout
	trackLayout: null,	
	
	//Default height width of timeline clip:
	timelineThumbSize: {
		'height': 90,
		'width' : 120
	},
	
	init: function( sequencer ){
		this.sequencer = sequencer;
	},

	getTimelineContainer: function(){
		return this.sequencer.getContainer().find('.mwseq-timeline');
	},
	
	getTracksContainer: function(){
		if( ! this.$timelineTracksContainer ){
			// getTimelineContainer 
			this.getTimelineContainer().append( 
				$j('<div />')
				.addClass('timelineTrackContainer')		
				.append( 
					$j('<div />')
					.addClass( 'ui-layout-west trackNamesContainer'),
					
					$j('<div />')
					.addClass( 'ui-layout-center clipTrackSetContainer')
				)
			)
			// Apply layout control to track name / clipTrackSet division  			
			this.$timelineTracksContainer = this.getTimelineContainer().find( '.timelineTrackContainer');
			this.trackLayout = this.$timelineTracksContainer
				.layout( {
					'applyDefaultStyles': true,		
					'west__size' : 150,
					'west__minSize' : 100,
					'west__maxSize' : 300
				} );
		}
		return this.$timelineTracksContainer;
	},
	resizeTimeline: function(){
		if( this.trackLayout ){
			this.trackLayout.resizeAll();
		}
	},
	//draw the timeline
	drawTimeline: function(){		
		// Empty the timeline container 
		this.getTimelineContainer().empty();
		
		// Get the top level sequence tracks 
		var seqTracks = this.sequencer.getSmil().getBody().getSeqElements();		
		var trackType = 'video'; 
		// for now just two tracks first is video second is audio 
		for( var trackIndex=0; trackIndex < seqTracks.length; trackIndex++){
			
			if( trackType == 'audio' ){
				mw.log("SequencerTimeline::Error only two tracks presently suppoted");
				break;
			}
			// Draw the sequence track
			this.drawSequenceTrack( trackIndex, seqTracks[ trackIndex ], trackType);
			trackType = 'audio';	
		}	
	},
	
	drawSequenceTrack: function( trackIndex, sequenceNode, trackType ){	
		var _this = this;
		mw.log(" drawSequenceTrack: Track inx: " + trackIndex + ' trackType:' + trackType );
		// Check if we already have a container for this track set		
			
		// Add a sequence track Name			
		this.getTracksContainer().find('.trackNamesContainer').append( 
			this.getTrackNameInterface( trackIndex, sequenceNode, trackType )
		)
		
		// Add Sequence clips
		this.getTracksContainer().find('.clipTrackSetContainer').append( 
			this.getTrackClipInterface( trackIndex ,sequenceNode , trackType )
		).click(function(){			
			// xxx todo catch de-select clicks in clipTrackSetContainer that are not a click in the timeline
			//_this.getTracksContainer().find('.timelineClip').removeClass( 'selectedClip' );
		})
		// Load and display all clip thumbnails 		
		this.drawTrackThumbs(  trackIndex, sequenceNode, trackType );		
	},
	
	drawTrackThumbs: function( trackIndex, sequenceNode, trackType ){
		var _this = this;
		var smil = this.sequencer.getSmil();
		
		// Get all the refs that are children of the sequenceNode with associated offsets and durations
		// for now assume all tracks start at zero:
		var startOffset = 0;
		
		// For every ref node in this sequence draw its thumb: 
		smil.getBody().getRefElementsRecurse( sequenceNode, startOffset, function( $node ){				
			// Check Buffer for when the first frame of the smilNode can be grabbed: 		
			smil.getBuffer().bufferedSeek( $node, 0, function(){
				//mw.log("getTrackClipInterface::bufferedSeek for " + smil.getAssetId( $node ));
				_this.drawClipThumb( $node , 0);
			});
		});
	},
	/**
	 * Get Track Clip Interface
	 */
	getTrackClipInterface: function( trackIndex, sequenceNode, trackType ){
		var _this = this;
		// setup a local pointer to the smil engine: 
		var smil = this.sequencer.getSmil();
		// Get all the refs that are children of the sequenceNode with associated offsets and durations
		// for now assume all tracks start at zero:
		var startOffset = 0;
		var clipTrackSetId = this.sequencer.getId() + '_clipTrackSet_' + trackIndex;			
        
		var $clipTrackSet = 
			$j('<ul />')
			.attr('id',  clipTrackSetId)
			.addClass('clipTrackSet ui-corner-all')
			// Add "sortable
			.sortable({ 
			    placeholder: "clipSortTarget timelineClip ui-corner-all",
			    opacity: 0.6,
			    cursor: 'move',
			    helper: function( event, helper ){						
					// xxxx might need some fixes for multi-track
					var $selected = _this.getTimelineContainer().find( '.selectedClip' )
					if ( $selected.length === 0 ||  $selected.length == 1) { 
						return $j( helper ); 
					} 		
					
					return $j('<ul />')
						.css({
							'width' : (_this.timelineThumbSize.width + 16) * $selected.length
						})
						.append( $selected.clone() );  
				},
			    scroll: true,
			    update: function( event, ui ) {
					// Update the html dom 
					_this.handleReorder( ui.item );									
				}
			})
		
		smil.getBody().getRefElementsRecurse( sequenceNode, startOffset, function( $node ){
			// Draw the node onto the timeline:
				
			// xxx would be good to support both "storyboard" and "timeline" view modes. 
			// for now just "storyboard"
			
			// add a clip float left box container
			$clipTrackSet.append( 
				$j('<li />')
				.attr('id',  _this.getTimelineClipId( $node ) )	
				.data( {
					'smilId': $node.attr('id'),
					'prevIndex' : $clipTrackSet.length
				})
				.addClass('timelineClip ui-corner-all')
				.loadingSpinner()				
				.click(function(){
					//Add clip to selection
					_this.handleMultiSelect( this );
				})				
			);						
		})				
		// Give the track set a width relative to the number of clips 
		$clipTrackSet.css('width', ($clipTrackSet.find( '.timelineClip' ).length + 1) * 
			( this.timelineThumbSize.width + 12 ) 
		);
		
		// Add global TrackClipInterface bindings:
		var keyBindings = this.sequencer.getKeyBindings();		 
		keyBindings.bindEvent({
			'escape': function(){
				_this.getTimelineContainer().find( '.selectedClip' ).removeClass( 'selectedClip' );
			},
			'delete': function(){
				_this.removeSelectedClips();
			}
		})
		return $clipTrackSet;
	},
	// calls the edit interface passing in the selected clip:
	editClip: function( selectedClip ){
		var smil = this.sequencer.getSmil();
		// get the smil element for the edit tool:
		var smilClip = smil.$dom.find('#' + $j( selectedClip ).data('smilId') );		
		this.sequencer.getEditTools().drawClipEditTool( smilClip );
	},
	
	/**
	 * @param {Element} selectedClip to be removed
	 */
	removeClip: function(selectedClip){
		var smil = this.sequencer.getSmil();
		// remove  clip directly 
		if( selectedClip ){
			// Remove from smil dom:
			smil.removeById( $j(selectedClip).data('smilId') );
			// Remove from timeline dom: 
			$j( selectedClip ).unbind().fadeOut(function(){ 
				$j(this).remove() 
			});			
			// Invalidate / update embedPlayer duration: 
			this.sequencer.getEmbedPlayer().getDuration( true );
		}
	},
	/**
	 * Remove selected clips and update the smil player
	 */
	removeSelectedClips: function(  ){		
		var smil = this.sequencer.getSmil();
		// modify the smil.dom and rebuild
		this.getTimelineContainer().find( '.selectedClip' ).each(function( inx, selectedClip ){
			// Remove from smil dom:
			smil.removeById( $j(selectedClip).data('smilId') );
			// Remove from timeline dom: 
			$j( selectedClip ).remove();			
		})		
		// Invalidate / update embedPlayer duration: 
		this.sequencer.getEmbedPlayer().getDuration( true );
	},
	handleReorder: function ( movedClip ){
		var _this = this;
		var smil = this.sequencer.getSmil();
		var movedIndex = null;
		
		var clipIndex = $j( movedClip ).index();
		var $movedSmileNode = smil.$dom.find( '#' + $j( movedClip ).data('smilId') );
		var $seqParent = $movedSmileNode.parent();		

		if( clipIndex ==  $seqParent.children().length ){
			$seqParent.append( $movedSmileNode.get(0) );
		} else {
			// see if the index was affected by our move position
			if( clipIndex >= $movedSmileNode.data('prevIndex') ){
				$seqParent.children().eq( clipIndex ).after( $movedSmileNode.get(0) );
			}else{
				$seqParent.children().eq( clipIndex ).before( $movedSmileNode.get(0) );
			}
		}
		// If any other clips were selected add them all after smilNode
		var $selected = _this.getTimelineContainer().find( '.selectedClip' )
		if( $selected.length > 1 ){
			// Move all the non-ordredClip items behind ordredClip
			$selected.each( function( inx, selectedClip ){
				if( $j(selectedClip).attr('id') != $j( movedClip ).attr('id') ){
					// Update html dom
					$j( movedClip ).after( $j( selectedClip ).get(0 ) );
					
					// Update the smil dom
					var $smilSelected = smil.$dom.find( '#' + $j( selectedClip ).data('smilId') );		
					$smilSelected.insertAfter( $movedSmileNode.get(0) );
				}
			});	
		}
		// Update the prevIndex for all clips
		$seqParent.children().each(function (inx, clip){
			$j( clip ).data('prevIndex', inx);
		});
		
		// Invalidate / update embedPlayer duration / clip offsets 
		_this.sequencer.getEmbedPlayer().getDuration( true );
	},
	/**
	 * Handle multiple selections based on what clips was just "cliked" 
	 */
	handleMultiSelect: function( clickClip ){
		var keyBindings = this.sequencer.getKeyBindings();
		var $target = this.getTimelineContainer();
		var smil = this.sequencer.getSmil();
		var embedPlayer = this.sequencer.getEmbedPlayer();
		
		
		// Add the selectedClip class to the clickClip
		if( $j( clickClip ).hasClass( 'selectedClip') && $target.find( '.selectedClip' ).length == 1 ){
			$j( clickClip ).removeClass( 'selectedClip' );
		}else {
			$j( clickClip ).addClass( 'selectedClip' );
		}
		
		// If not in multi select mode remove all existing selections except for clickClip
		mw.log( ' HandleMultiSelect::' + keyBindings.shiftDown + '  ctrl_down:' + keyBindings.ctrlDown );
		
		if ( ! keyBindings.shiftDown && ! keyBindings.ctrlDown ) {
			$target.find( '.selectedClip' ).each( function( inx, selectedClip ) {
				if( $j( clickClip ).attr('id') != $j( selectedClip ).attr('id') ){
					$j( selectedClip ).removeClass('selectedClip');
				}	
			} );
		}
		// Seek to the current clip time ( startOffset of current )
		var seekTime = smil.$dom.find('#' + $j( clickClip ).data('smilId') ).data( 'startOffset' )
		embedPlayer.setCurrentTime( seekTime, function(){
			mw.log("handleMultiSelect::seek done")
		});
		
		// if shift select is down select the in-between clips
		if( keyBindings.shiftDown ){
			// get the min max of current selection (within the current track)
			var maxOrder = 0;
			var minOrder = false;
			$target.find( '.timelineClip' ).each( function( inx, curClip) {	
				if( $j(curClip).hasClass('selectedClip') ){
					// Set min max
					if ( minOrder === false || inx < minOrder ){
						minOrder = inx;
					}
					if ( inx > maxOrder ){
						maxOrder = inx;
					}
				}
			} );
			// select all non-selected between max or min
			$target.find( '.timelineClip' ).each( function( inx, curClip) {	
				if( inx > minOrder && inx < maxOrder ){
					$j(curClip).addClass( 'selectedClip')
				}
			});	
		}		
	},
	
	getTimelineClipId: function( $node ){
		return this.sequencer.getSmil().getAssetId( $node ) + '_timelineClip';
	},
	
	// Draw a clip thumb into the timeline clip target
	drawClipThumb: function ( $node , relativeTime ){		
		var _this = this;
		var smil = this.sequencer.getSmil();	
		
		
		var $timelineClip = $j( '#' + _this.getTimelineClipId( $node ) );
		// Add Thumb target and remove loader
		$timelineClip.empty().append(
			$j('<div />')					
			.addClass("thumbTraget"),

			// Edit clip button: 
			$j('<div />')
			.css({
				'position' : 'absolute',
				'right' : '32px',
				'bottom' : '5px',
				'padding' : '2px',
				'cursor' : 'pointer'
			})
			.addClass( 'clipEditLink ui-state-default ui-corner-all' )
			.append( 
				$j('<span />')
				.addClass( 'ui-icon ui-icon-scissors' )
			)
			.hide()
			.buttonHover()
			.click( function(){
				_this.editClip( $timelineClip )
			}),
			
			// Remove clip button: 
			$j('<div />')
			.css({
				'position' : 'absolute',
				'right' : '5px',
				'bottom' : '5px',
				'padding' : '2px',
				'cursor' : 'pointer'
			})
			.addClass( 'clipRemoveLink ui-state-default ui-corner-all' )
			.append( 
				$j('<span />')
				.addClass( 'ui-icon ui-icon-trash' )
			)
			.hide()
			.buttonHover()
			.click( function(){					
				_this.removeClip( $timelineClip )
			})
		)
		// Add mouse over thumb "edit", "remove"  button
		.hover(
			function(){
				$timelineClip.find('.clipEditLink,.clipRemoveLink').fadeIn();
			},
			function(){
				$timelineClip.find('.clipEditLink,.clipRemoveLink').fadeOut();
			}
		)
		// remove loader
		.find('.loadingSpinner').remove();
		
		var $thumbTarget = $j( '#' + _this.getTimelineClipId( $node ) ).find('.thumbTraget');
		
		// Check for a "poster" image use that temporarily while we wait for the video to seek and draw
		if( $node.attr('poster') ){			
			var img = new Image();
			$j( img )
			.css( {
				'top': '0px',
				'position' : 'absolute',
				'opacity' : '.8',
				'left': '0px',
				'height': _this.timelineThumbSize.height
			})
			.attr( 'src', smil.getAssetUrl( $node.attr('poster') ) )
			.load( function(){
				if( $thumbTarget.children().length == 0 ){
					$thumbTarget.html(this);	
				}
			})				
		}			
		
		// Buffer the asset then render it into the layout target:
		smil.getBuffer().bufferedSeek( $node, relativeTime, function(){			
			// Add the seek, add to canvas and draw thumb request
			smil.getLayout().drawElementThumb( $thumbTarget, $node, relativeTime );
		
		})
	},
	/**
	 * Gets an sequence track control interface 
	 * 	features to add :: expand collapse, hide, mute etc. 
	 * 	for now just audio or video with icon 
	 */
	getTrackNameInterface: function( trackIndex,  sequenceNode, trackType ){				
		var $trackNameInterface = 					
			$j('<a />')
			.attr('href','#')
			.addClass( "ui-icon_link" );
		if( trackType == 'video'){
			$trackNameInterface.append( 				
				$j('<span />').addClass( 'ui-icon ui-icon-video'),
				$j('<span />').text( gM( 'mwe-sequenceedit-video-track' ) )
			)
		} else {
			$trackNameInterface.append( 				
				$j('<span />').addClass( 'ui-icon ui-icon-volume-on'),
				$j('<span />').text( gM( 'mwe-sequenceedit-audio-track' ) )
			)
		}
		// Wrap the track name in a box that matches the trackNames 
		return $j('<div />')
				.attr('id', this.sequencer.getId() + '_trackName_' + trackIndex)
				.addClass('trackNames ui-corner-all')
				.append(
					$trackNameInterface
				)
	},
	
	getSequenceTrackTitle: function( sequenceNode ){
		if( $j( sequenceNode).attr('title') ){
			return $j( sequenceNode).attr('title');
		} 
		// Else return an empty string ( for now )
		return ''
	},
	
	getSequenceTrackId: function( index, sequenceNode ){
		if( ! $j( sequenceNode ).data('id') ){
			$j( sequenceNode ).data('id', this.sequencer.getId() + '_sequenceTrack_' + index );
		}
		return  $j( sequenceNode ).data('id');		
	}
}	
	
	
} )( window.mw );	