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
			
			this.raptCurrentSegment = null;
		},

		addBindings: function() {

			this._super();
			
			var partnerData = this.getPlayer().evaluate('{mediaProxy.entry.partnerData}');
			this.raptMediaPlaylistEntry = (partnerData != null && partnerData.indexOf("raptmedia") > -1);

			if (this.raptMediaPlaylistEntry == true) {
				//rapt entry
				this.addBindingsRapt();
			} else {
				//regular entry
			}

			var _this = this;
			this.bind('onChangeMediaDone', function(event) { 
				_this.raptCleanup();
				_this.addBindings();
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
                _this.duration = _this.raptDuration();
			});
			this.bind('monitorEvent', function () {
				if (!_this.raptCurrentSegment) return;
				if (_this.getPlayer().userSlide) return;
				var currentTime = _this.getPlayer().currentTime - (_this.raptCurrentSegment.msStartTime / 1000);
                _this.updatePlayheadUI(currentTime / _this.raptDuration() * 1000);
			});
			this.bind('raptMedia_pausedDecisionPoint', function () {
				_this.updatePlayheadUI(1000);
			});
		},

		raptDuration: function () {
			var currentDuration = this.getPlayer().getDuration();
			if (this.raptCurrentSegment != null) 
				currentDuration = this.raptCurrentSegment.msDuration / 1000;
			return currentDuration;
		},

		getSliderConfig: function () {
			if (this.raptMediaPlaylistEntry == false) {
				return this._super();
			}

			var _this = this;
			var embedPlayer = this.getPlayer();
			var alreadyChanged = false;

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
					$(_this.getPlayer()).one('hidePlayerControls onFocusOutOfIframe', function () {
						$(document).trigger('mouseup');
					});
				},
				slide: function (event, ui) {
					_this.updateAttr(ui);
				},
				change: function (event, ui) {
					alreadyChanged = true;
					var segmentSeekTime = (ui.value / 1000) * _this.raptDuration();
					var segmentStartOffset = (_this.raptCurrentSegment != null) ? (_this.raptCurrentSegment.msStartTime / 1000) : 0;
					var seekTime = segmentSeekTime + segmentStartOffset;
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
				}
			};
		},

		updateAttr: function (ui) {
			if (this.raptMediaPlaylistEntry == false) {
				this._super(ui);
			} else {
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
			}
		},
		
	} ) );
} ) ( window.mw, window.jQuery );	