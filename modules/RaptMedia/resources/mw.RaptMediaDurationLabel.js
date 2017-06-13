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
			this.addBindings();
		},

		addBindings: function() {
			var _this = this;

			this.bind('raptMedia_newSegment', function(e, segment) {
				_this.segmentDuration = segment.duration;
				_this.updateUI();
			});

			this.bind('raptMedia_cleanup', function(e) {
				_this.segmentDuration = null;
				_this.updateUI();
			});
		},

		updateUI: function(duration) {
			this._super(
				Math.floor(
					this.segmentDuration ||
					duration ||
					this.currentDuration
				)
			);
		}

	} ) );
} ) ( window.mw, window.jQuery );
