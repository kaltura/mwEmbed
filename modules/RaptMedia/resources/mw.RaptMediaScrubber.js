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
		getSliderConfig: function() {
			var _this = this;
			var embedPlayer = this.getPlayer();

			var config = this._super();

			var originalChange = config.change;
			config.change = function(event, ui) {
				var status = embedPlayer.evaluate('{raptMedia.status}');
				var segment = embedPlayer.evaluate('{raptMedia.currentSegment}');

				if (status !== 'enabled') {
					return originalChange(event, ui);
				}

				if (segment == null) {
					_this.log('Warning: missing segment data');
					return;
				}

				_this.updateAttr(ui);

				var seekTime = (ui.value / 1000) * segment.duration;
				if (embedPlayer.userSlide) {
					embedPlayer.userSlide = false;
					embedPlayer.seeking = true;
					embedPlayer.triggerHelper("userInitiatedSeek", seekTime);
					embedPlayer.triggerHelper("raptMedia_doSeek", seekTime);
				}
			};

			return config;
		},

		updateAttr: function(ui) {
			var perc = ui.value / 1000;
			var $slider = this.$el;
			var title = mw.seconds2npt(perc * this.getDuration());
			var totalDuration = mw.seconds2npt(this.getDuration());
			var attributes = {
				'data-title': title,
				'aria-valuetext': title + " of " + totalDuration,
				'aria-valuenow': parseInt(perc * 100) + '%'
			};
			$slider.attr(attributes);
		},

		getDuration: function(ui) {
			var player = this.getPlayer();

			if (player.evaluate('{raptMedia.status}') === 'enabled') {
				return player.evaluate('{raptMedia.currentSegment.duration}');
			} else {
				return player.getDuration();
			}
		}
	} ) );
} ) ( window.mw, window.jQuery );
