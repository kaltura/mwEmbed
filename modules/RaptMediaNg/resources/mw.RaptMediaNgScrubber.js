/**
 * The RaptMediaScrubber adds scrubber override capabilities to support RaptMedia clip context.
 * With raptMediaNgScrubberPlugin the scrubber can interact within the context of a single RaptMedia clip instead of just the entire stitched playlist.
 * This plugin is only activated when the entryId provided is a Playlist Entry with partnerData == "raptmedia;projectId".
 *
 * See the RaptMedia plugin for more information.
 */
(function ( mw, $ ) {
	"use strict";
	mw.PluginManager.add('raptMediaNgScrubber', mw.PluginManager.getClass('scrubber'));
} ) ( window.mw, window.jQuery );
