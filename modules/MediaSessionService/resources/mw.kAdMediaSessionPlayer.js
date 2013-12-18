/**
* Supports the display of kaltura VAST ads in MediaSession url, 
* where content is one continues playback
*/
( function( mw, $ ) {"use strict";


	mw.kAdMediaSessionPlayer = function( embedPlayer ) {
		// Create the KAdPlayer
		return this.init( embedPlayer );
	};
	
	mw.kAdMediaSessionPlayer.prototype = {
		init: function( embedPlayer ){
			mw.inherit( this, mw.KAdPlayer.prototype );
			this.parent_init( embedPlayer );
			return this;
		},
		/** 
		 * Check if the ad is in sequence, else falls back on non-sequenced hls. stream. 
		 */
		displayVideoFile: function( adSlot, adConf ){
			var _this = this;
			// check that this adConf is in the sequence
			if( ! this.getAdSequenceItemByAdId( adConf.id ) ){
				mw.log("kAdMediaSessionPlayer: Ad is not in sequence, trying non-stitched playback");
				// try to play the ad without sequence stitching:
				return this.parent_displayVideoFile( adSlot, adConf );
			}
			
			// Check for click binding
			this.addClickthroughSupport( adConf );

			// hide any ad overlay
			$( '#' + this.getOverlayId() ).hide();
			
			// update player to play state:
			_this.embedPlayer.playInterfaceUpdate();
			
			// play element "content / ad" ( all stitched together now )
			_this.embedPlayer.getPlayerElement().play();
			
			// set up bindings against content play: 
			_this.bindAdMediaSessionPlayer(adSlot, adConf);
			
			// display ad icons if present: 
			_this.displayAdIcons( adConf);
			
			// Fire Impression beacons 
			_this.fireImpressionBeacons( adConf );
		},
		bindAdMediaSessionPlayer: function( adSlot, adConf ){
			var vid = this.embedPlayer.getPlayerElement();
			// handle standard ad bindings: 
			_this.addAdBindings( vid, adSlot, adConf );
			// bind done at content length 
			var seqItem = this.getAdSequenceItemByAdId( adConf.id );
			
			// bind against vid for true video time
			var adSlotEndTime  = this.getSequenceItemEndTime();
			$(vid).bind( 'timeupdate', function(){
				mw.log('timeupdate: ' + vid.currentTime );
				if( vid.currentTime > adSlotEndTime ){
					adSlot.playbackDone();
				}
			});
		},
		getAdSequenceItemByAdId: function( adId ){
			for( var i in this.sequence ){
				var sequenceItem = this.sequence[i];
				if( sequenceItem['vastId'] == adId ){
					return sequenceItem;
				}
			}
		},
		getSequenceItemEndTime: function( seqItem ){
			// TODO should calculate sequence end time
			if( seqItem['type'] == 'preroll' ){
				return seqItem['duration']
			}
		},
		/**
		 * sets the sequence object 
		 */
		setSequence: function( sequence ){
			this.sequence = sequence;
		}
	}

} )( window.mw, jQuery );
