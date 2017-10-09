/**
 * The RaptMediaPlayPauseBtn adds enhances the playPauseBtn component to trigger doReplay
 * if it's currently in a replay state instead of just continue playback at the end of the playback
 *
 * See the RaptMedia plugin for more information.
 */
(function ( mw, $ ) {
	"use strict";
	mw.PluginManager.add('raptMediaPlayPauseBtn', mw.PluginManager.getClass('playPauseBtn').extend({
	} ) );
} ) ( window.mw, window.jQuery );
