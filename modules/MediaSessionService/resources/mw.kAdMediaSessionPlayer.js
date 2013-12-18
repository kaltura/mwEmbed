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
		isVideoSiblingEnabled: function(){
			// for ad content bridge always return false: 
			return false;
		},
		bindAdMediaSessionPlayer: function( adSlot, adConf ){
			var _this = this;
			var vid = this.embedPlayer.getPlayerElement();
			// handle standard ad bindings: 
			this.addAdBindings( vid, adSlot, adConf );
			// bind done at content length 
			var sequenceItem = this.getAdSequenceItemByAdId( adConf.id );
			
			// add a loading spinner until first positive time: 
			this.embedPlayer.addPlayerSpinner();
			
			// bind against vid for true video time
			var adSlotEndTime  = this.getSequenceItemEndTime( sequenceItem );
			$(vid).bind( 'timeupdate', function(){
				_this.embedPlayer.hideSpinner();
				if( vid.currentTime > adSlotEndTime ){
					// update the start offset: 
					_this.embedPlayer.startOffset = _this.getAdPlayTimeBefore( vid.currentTime );
					if( adSlot.currentlyDisplayed ){
						adSlot.playbackDone();
						_this.embedPlayer.playInterfaceUpdate();
					}
				}
			});
		},
		getCurrentTime: function(){
			// map current time 
			var trueTime = this.getVideoElement().currentTime;
			var adOffset = this.getAdPlayTimeBefore( trueTime );
			// TODO fix calculations for non-preroll
			return trueTime;
		},
		getDuration: function(){
			var seqItem = this.getCurrentSequenceItem();
			if( seqItem ){
				return seqItem['duration'];
			}
			// TODO remove this hack
			return 32;
		},
		getCurrentAdId: function(){
			if( this.currentAdSlot && this.currentAdSlot.ads  
					&& typeof this.currentAdSlot.adIndex != 'undefined' 
			){
				return this.currentAdSlot.ads[ this.currentAdSlot.adIndex ].id;
			}
			return false;
		},
		getCurrentSequenceItem: function(){
			return this.getAdSequenceItemByAdId( this.getCurrentAdId()  );
		},
		skipCurrent: function(){
			var _this = this;
			var sequenceItem = this.getCurrentSequenceItem();
			if( sequenceItem ){
				var endTime = this.getSequenceItemEndTime( sequenceItem );
				var vid = this.embedPlayer.getPlayerElement();
				// issue a seek: 
				$(vid).bind('seeked', function(){
					// now that we are on the updated time restore content state ( or play next ad ): 
					if( _this.currentAdSlot.currentlyDisplayed ){
						_this.currentAdSlot.playbackDone();
					}
				});
				vid.currentTime = endTime;
			}
		},
		getAdPlayTimeBefore: function( time ){
			// go through the sequence loop, add up all non content before we get to > time
			var adTime = 0;
			var seqTime =0;
			for( var i in this.sequence ){
				var sequenceItem = this.sequence[i];
				// always add to total sequence time: 
				seqTime+=sequenceItem['duration'];
				// add ad time if an ad segment: 
				if( sequenceItem['type'] != 'content' ){
					adTime+=sequenceItem['duration'];
				}
				// once we get to a point in the sequence > then time, 
				// return the ad content duration sum.
				if( seqTime > time ){
					return adTime;
				}
			} 
		},
		getAdSequenceItemByAdId: function( adId ){
			for( var i in this.sequence ){
				var sequenceItem = this.sequence[i];
				if( sequenceItem['vastId'] == adId ){
					return sequenceItem;
				}
			}
		},
		getSequenceItemEndTime: function( sequenceItem ){
			// TODO should calculate sequence end time
			if( sequenceItem['type'] == 'preroll' ){
				return sequenceItem['duration'];
			}
		},
		restoreEmbedPlayer: function(){
			// nothing needed ( no sibling existed ) 
		},
		/**
		 * sets the sequence object 
		 */
		setSequence: function( sequence ){
			this.sequence = sequence;
		}
	}

} )( window.mw, jQuery );
