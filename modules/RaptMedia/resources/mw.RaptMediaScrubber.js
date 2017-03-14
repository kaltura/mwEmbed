/**
 * The RaptMediaScrubber adds scrubber override capabilities to support RaptMedia clip context.
 * With raptMediaScrubberPlugin the scrubber can interact within the context of a single RaptMedia clip instead of just the entire stitched playlist.
 * This plugin is only activated when the entryId provided is a Playlist Entry with partnerData == "raptmedia;projectId".
 *
 * See the RaptMedia plugin for more information. 
 */
(function ( mw, $ ) {
	"use strict";
	mw.PluginManager.add('raptMediaScrubber', mw.PluginManager.getClass('scrubber').extend({
		
		setup: function (){
			this._super();
		},

		addBindings: function() {
			this._super();

			var _this = this;

			this.bind('mediaLoaded', function(event) { 
				_this.raptCleanup();
				var partnerData = _this.getPlayer().evaluate('{mediaProxy.entry.partnerData}');
				_this.raptMediaPlaylistEntry = (partnerData != null && partnerData.indexOf("raptmedia") > -1);

				if (_this.raptMediaPlaylistEntry == true) {
					//rapt entry
					_this.addBindingsRapt();
				} else {
					//regular entry
				}
			});
		},

		raptCleanup: function () {
			this.unbind('durationChange');
			this.unbind('monitorEvent');
			this.unbind('raptMedia_newSegment');
			this.unbind('raptMedia_pausedDecisionPoint');
			this.raptCurrentSegment = null;
			this.raptMediaPlaylistEntry = false;
		},

		addBindingsRapt: function () {
			var _this = this;
			
			this.bind('raptMedia_newSegment', function(e, raptEngineCurrentSegment) {
				_this.raptCurrentSegment = raptEngineCurrentSegment;
				_this.duration = _this.raptDuration();
			});
			this.bind('durationChange', function (event, duration) {
                if (_this.getPlayer().userSlide) return;
                _this.duration = _this.raptDuration();
			});
			this.bind('monitorEvent', function () {
				if (_this.raptMediaPlaylistEntry && _this.raptCurrentSegment && !_this.getPlayer().userSlide && !_this.sliderUpdating) {
					var currentTime = _this.getPlayer().currentTime - (_this.raptCurrentSegment.msStartTime / 1000);
	                _this.updatePlayheadUI(currentTime / _this.raptDuration() * 1000);
	            }
			});
			this.bind('raptMedia_pausedDecisionPoint', function () {
				_this.updatePlayheadUI(1000);
			});
		},

		updatePlayheadPercentUI: function (perc) {
			if (this.raptMediaPlaylistEntry) 
				return;
			this._super(perc);
		},

		raptDuration: function () {
			if (!this.raptMediaPlaylistEntry) 
				return this.getPlayer().getDuration();
			else if (this.raptCurrentSegment != null) 
				return parseFloat((this.raptCurrentSegment.msDuration / 1000).toFixed(2));
			else
				return 0;
		},

		getSliderConfig: function () {
			var _this = this;
			var embedPlayer = this.getPlayer();
			
			return {
				range: "min",
				value: 0,
				min: 0,
				max: 1000,
				// we want less than monitor rate for smoth animation
				animate: 10, //mw.getConfig('EmbedPlayer.MonitorRate') - ( mw.getConfig('EmbedPlayer.MonitorRate') / 5 ),
				start: function (event, ui) {
					embedPlayer.userSlide = true;
					// Release the mouse when player is not focused
					$(embedPlayer).one('hidePlayerControls onFocusOutOfIframe', function () {
						$(document).trigger('mouseup');
					});
				},
				slide: function (event, ui) {
					_this.updateAttr(ui);
				},
				change: function (event, ui) {
					if (!_this.raptMediaPlaylistEntry) { // regular entry:
						var seekTime = (ui.value / 1000) * embedPlayer.getDuration();
						// always update the title
						_this.updateAttr(ui);
						// Only run the onChange event if done by a user slide
						// (otherwise it runs times it should not)
						if (embedPlayer.userSlide) {
							embedPlayer.userSlide = false;
							embedPlayer.seeking = true;
							embedPlayer.triggerHelper("userInitiatedSeek", seekTime);
							embedPlayer.seek(seekTime);
						}
					} else { // raptmedia entry:
						// Only run the onChange event if done by a user slide
						// (otherwise it runs times it should not)
						if (!embedPlayer.userSlide || _this.sliderUpdating || !_this.raptCurrentSegment) return;

						var segmentSeekTime = (ui.value / 1000) * _this.raptDuration();
						var endOfSegment = _this.isEndOfCurrentSegment(segmentSeekTime);
						
						var seekDuringPlay = embedPlayer.isPlaying() && !endOfSegment;
						if (seekDuringPlay) embedPlayer.stopEventPropagation();

						_this.sliderUpdating = true;
						var segmentStartOffset = (_this.raptCurrentSegment != null) ? parseFloat((_this.raptCurrentSegment.msStartTime / 1000).toFixed(2)) : 0;
						var seekTime = segmentSeekTime + segmentStartOffset;
						//use 350ms from end of segment as saftey buffer to avoid missing the end due to misaligned frame rates or slow event propagations
						var seekTimeEndOfSeg = segmentStartOffset + parseFloat(((_this.raptCurrentSegment.msDuration-50)/1000).toFixed(2));

						_this.updateAttr(ui);

						if (endOfSegment) {
							embedPlayer.triggerHelper("userInitiatedSeek", seekTimeEndOfSeg);
							embedPlayer.stopPlayAfterSeek = true;
							embedPlayer.seek(seekTimeEndOfSeg, true);
							_this.log('user seeked to end of segment');
						} else {
							embedPlayer.triggerHelper("userInitiatedSeek", seekTime);
							embedPlayer.stopPlayAfterSeek = !seekDuringPlay;
							embedPlayer.seek(seekTime, !seekDuringPlay);
						}
						embedPlayer.userSlide = false;
						_this.sliderUpdating = false;

						var _embedPlayer = embedPlayer;
						if (!seekDuringPlay) {
							setTimeout(function () {
								_embedPlayer.triggerHelper('doPause');
							}, 0);
						} else {
							setTimeout(function () {
								_embedPlayer.restoreEventPropagation();
							}, 0);
						}
					}
				}
			};
		},

		isEndOfCurrentSegment: function (segTime) {
			var seekTimeMillis = parseFloat(segTime.toFixed(3)) * 1000;
			if (seekTimeMillis < 0) seekTimeMillis = 0;
			var segmentDurationMillis = this.raptCurrentSegment.msDuration - 550;
			var isSegmentEnd = (seekTimeMillis >= segmentDurationMillis);
			return isSegmentEnd;
		},

		updatePlayheadUI: function (val) {
			this._super(val);
		},

		updateAttr: function (ui) {
			var perc = ui.value / 1000;
			var $slider = this.$el.find('.ui-slider-handle');
			var title = mw.seconds2npt(perc * this.raptDuration());
			var attributes = {
				'data-title': title,
				'aria-valuetext': mw.seconds2npt(perc * this.raptDuration()),
				'aria-valuenow': parseInt(perc * 100) + '%'
			};
			$slider.attr(attributes);
			if (this.getConfig('accessibilityLabels')) {
				$slider.html('<span class="accessibilityLabel">' + title + '</span>');
			}
		},
		
	} ) );
} ) ( window.mw, window.jQuery );	