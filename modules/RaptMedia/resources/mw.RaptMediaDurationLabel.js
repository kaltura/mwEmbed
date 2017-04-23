/**
 * The RaptMediaDurationLabel plugin adds time label override capabilities to support RaptMedia clip context.
 * With RaptMediaDurationLabel plugin the time label can interact within the context of a single RaptMedia clip instead of just the entire stitched playlist.
 * This plugin is only activated when the entryId provided is a Playlist Entry with partnerData == "raptmedia;projectId".
 *
 * See the RaptMedia plugin for more information. 
 */
(function ( mw, $ ) {
	"use strict";
	mw.PluginManager.add('raptMediaDurationLabel', mw.PluginManager.getClass('durationLabel').extend({	
		
		setup: function () {
			this._super();
			
			var _this = this;
			this.bind('mediaLoaded', function(event) { 
				_this.setupRapt();
			});

			this.setupRapt();
		},

		setupRapt: function (){

			var partnerData = this.getPlayer().evaluate('{mediaProxy.entry.partnerData}');
			this.raptMediaPlaylistEntry = (partnerData != null && partnerData.indexOf("raptmedia") > -1);
			
			var _this = this;

			if (this.raptMediaPlaylistEntry == true) {
				this.raptCurrentSegment = null;
				this.unbind('durationChange');
				this.bind('raptMedia_newSegment', function(e, raptEngineCurrentSegment) {
					_this.raptCurrentSegment = raptEngineCurrentSegment;
					_this.updateUI( _this.raptDuration() );
				});
			} else {
				this.raptCurrentSegment = null;
				this.unbind('raptMedia_newSegment');
				this.bind( 'durationChange', function(event, duration){
					if( !_this.getPlayer().isInSequence() ) {
						_this.contentDuration = duration;
						_this.updateUI( Math.floor(duration) );
					}
				});
			}
		},

		raptDuration: function () {
			var currentDuration = this.getPlayer().getDuration();
			if (this.raptCurrentSegment != null) 
				currentDuration = this.raptCurrentSegment.msDuration / 1000;
			return currentDuration;
		},
		
	} ) );
} ) ( window.mw, window.jQuery );	