
//Wrap in mw closure to avoid global leakage
( function( mw ) {
	
mw.SequenceEditPlayer = function( sequenceEdit ) {
	return this.init( sequenceEdit );
};

// Set up the mvSequencer object
mw.SequenceEditPlayer.prototype = {
	// The id of the sequence player	
	smilPlayerId: null, // lazy init
	
	init: function( sequenceEdit ){
		this.sequenceEdit = sequenceEdit;
	},	
	
	/**
	 * Draw a smil player to the screen.
	 */
	drawPlayer: function( callback ){
		var _this = this;
		var $playerTarget = this.sequenceEdit.getContainer().find( '.mwseq-player' );
		var smilSource =  this.sequenceEdit.getSmilSource()
		if( ! smilSource ){
			$playerTarget.append( 
				gM( 'mwe-sequenceedit-no-sequence-start-new', 
					$j('<a />').click(function(){
						alert( 'Browse for assets / start new sequence' );
					})
				)
			)
			return ;
		}			
		
		// Else add the player
		$playerTarget.html(
			$j('<video />').css(
				this.getPlayerSize()
			).attr({
				'id' : this.getSmilPlayerId()
			}).append(
				$j('<source />').attr({
					'type' : 'application/smil',
					'src' : smilSource
				})
			)
		);			
		// Draw the player ( keep the playhead for now )
		// xxx we will eventually replace the playhead with sequence 
		// based playhead interface for doing easy trims. 
		$j( '#' + this.getSmilPlayerId() ).embedPlayer({
			'overlayControls' : false
		}, function(){
			// Set the player interface to autoMargin ( need to fix css propagation in embed player) 			
			$j( '#' + _this.getSmilPlayerId() ).parent('.interface_wrap').css('margin', 'auto');
			if( callback ){
				callback();
			}
		})
	
	},
	
	previewClip: function( smilClip ){
		var _this = this;
		// Seek and play start of smilClip  
		var startOffset = $j( smilClip ).data('startOffset');
		var clipEndTime = startOffset + 
			this.sequenceEdit.getSmil().getBody().getClipDuration( smilClip );
		this.getEmbedPlayer().setCurrentTime( startOffset, function(){
			mw.log("SequenceEditPlayer::Preview clip: " + startOffset + ' to ' + clipEndTime);
			_this.getEmbedPlayer().play( clipEndTime );
		})
	},
	
	closePreivew: function(){
		// restore border
		this.sequenceEdit.getContainer().find( '.mwseq-player' )
			.css({'border': null});
	},
	
	
	resizePlayer: function(){		
		mw.log("SequenceEditPlayer:: resizePlayer: " + $j('#' + this.getSmilPlayerId() ).length );		
		this.getEmbedPlayer()
			.resizePlayer(  
				this.getPlayerSize(),
				true
			);	
	},
	
	getPlayerSize: function(){
		var size = {};
		var $playerContainer = this.sequenceEdit.getContainer().find('.mwseq-player'); 
		size.width = $playerContainer.width();			
		if( this.sequenceEdit.videoAspect ){
			var aspect = this.sequenceEdit.videoAspect.split( ':' );											
			var apectRatio = ( aspect[1] / aspect[0] );
			size.height = parseInt( size.width * ( aspect[1] / aspect[0] ) );
		} else {
			size.height = $playerContainer.width();
		}
		// Check if we exceeded the max height 
		if( size.height > $playerContainer.height() ){
			size.height = $playerContainer.height();
			size.width =  parseInt( size.height * ( aspect[0] / aspect[1] ) );
		}			
		return size;
	},
	/**
	 * get the embedplayer object instance
	 */
	getEmbedPlayer: function(){
		return $j( '#' + this.getSmilPlayerId() ).get(0);
	},
	/**
	 * Get a player id
	 */
	getSmilPlayerId: function(){
		if( !this.smilPlayerId ){				
			this.smilPlayerId = this.sequenceEdit.getId() + '_smilPlayer';
		}
		return this.smilPlayerId;
	}
}	
	
	
} )( window.mw );	