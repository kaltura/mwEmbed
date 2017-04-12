/**
 * The RaptMedia plugin integrates the RaptMedia Engine to the Kaltura Player. 
 * RaptMedia adds clickable interactive layer that accompanies your video content and can do things like:
 * cue or launch different media plays, jump to specific timecode, trigger an event on your webpage and launch a new web page or an app.
 * Learn more at http://docs.raptmedia.com/
 *
 * This plugins is only usable for raptmedia.com accounts who enabled integration with Kaltura.
 * If you don't have a RaptMedia account or need to enable the Kaltura integration, please contact support@raptmedia.com
 * 
 * This plugin is only activated when the entryId provided is a Playlist Entry with partnerData == "raptmedia;projectId".
 * This plugin also makes use of accompanying plugin RaptMediaScrubber plugin to override the default scrubber behavior to fit a Rapt Media experience.
 * With RaptMediaScrubber plugin the scrubber can interact within the context of a single RaptMedia clip instead of just the entire stitched playlist.
 * The RaptMedia plugin integrates the RaptMedia Engine to the Kaltura Player. 
 * It also makes use of accompanying plugin RaptMediaDurationLabel used to override the default player DurationLabel to behave according to the RaptMedia Sequence rather than show the overall playlist duration.
 */
(function ( mw, $ ) {
	"use strict";

	mw.PluginManager.add( 'raptMedia', mw.KBaseComponent.extend( {

		defaultConfig: {
			'raptMediaScriptUrl': 'https://cdn1.raptmedia.com/system/player/v1/engine.min.js',
			'behaviorOnEnd': 'pause' //replay | pause
		},

		setup: function(){
			this.raptMediaEngine = null;
			this.raptCleanup();
			this.addBindings();
			this.loadNewEntry();
		},

		parseRaptMediaTags: function () {
			var partnerData = this.getPlayer().evaluate('{mediaProxy.entry.partnerData}');
			if (partnerData != null && partnerData.indexOf("raptmedia") > -1) {
				var partnerDataArr = partnerData.split(';');
				this.raptMediaProjectId = partnerDataArr[1];
				return true;
			}
			return false;
		},

		loadNewEntry: function () {
			this.raptMediaPlaylistEntry = this.parseRaptMediaTags();	

			if (!this.raptMediaPlaylistEntry) {
				//this is not a rapt media entry - let the player behave normally
				this.getPlayer().sendNotification('reattachTimeUpdate');
				return;
			}
			
			//control time from this plugin (allow update the player's time label and scrubber from here)
			this.getPlayer().sendNotification('detachTimeUpdate');

			var raptMediaScriptUrl = this.getConfig( 'raptMediaScriptUrl' );
			var _this = this;
			var raptPlaylistEntries = _this.getPlayer().evaluate('{mediaProxy.entry.playlistContent}');
			this.raptPlaylistContent = raptPlaylistEntries.split(',');
			var requestsArray = Array();
			this.raptPlaylistContent.forEach(function (entryId) {
				requestsArray.push({
					'service': 'media',
					'action': 'get',
					'entryId': entryId
				});
			});
			
			_this.getKalturaClient().doRequest(requestsArray, function (data) {
				
				if (!_this.isValidApiResult(data))
					return;

				var msStartOffset = 0;
				var entry = null;
				
				for (var i = 0; i < data.length; ++i) { 
					entry = data[i];
					
					if (mw.getConfig('debug', true))
						console.log('raptMediaPlugin::[init]', entry);

					var segment = {
						discontinuity: i,
						msStartTime: msStartOffset,
						msDuration: entry.msDuration,
						width: entry.width, 
						height: entry.height,
						entryId: entry.id
					};
					_this.raptSegments[entry.id] = segment;
					_this.raptSequence.push(segment);
					msStartOffset += entry.msDuration;
				}
				
				$.ajax({ dataType: 'script', url: raptMediaScriptUrl, cache: true })
				.done(function() {
					_this.log('Loaded script successfuly: ' + raptMediaScriptUrl);
				})
				.fail(function( jqxhr, settings, exception ) {
					_this.log('Failed to load script: ' + raptMediaScriptUrl + ', ' + exception);
					// pause the video
					_this.getPlayer().layoutBuilder.displayAlert({
						keepOverlay: true,
						message: 'Error loading the RAPT Media engine. Please try to reload the page, or contact Support stating the URL of this page if the issue persists.',
						title: 'Error loading RAPT Media engine',
						noButtons: true
					});
				})
				.then(function() {
					_this.log('Then, setup the rapt engine');
					_this.getComponent();
					_this.$el.show();
					_this.setupRaptMediaPlugin();
				})
				.then(function(){
					//we can only continue with the rest of the player setup once the initial rapt segment was loaded
					//see raptMedia_newSegment below
					_this.raptMediaInitialSegmentLoad = true;
				});
			});
		},

		addBindings: function() {
			var _this = this;
            this.bind('mediaLoaded', function(event) { 
            	_this.raptCleanup();
				_this.loadNewEntry();
			});
		},

		getComponent: function () {
			
			if ( ! this.$el) {
				this.$el = $( "<div></div>" ).attr( 'id', 'raptMediaOverlay' ).addClass( this.getCssClass() );
			}

			return this.$el;
		},

		raptCleanup: function() {
			if (this.$el)
				this.$el.hide();
			this.unbind('updateLayout');
			this.unbind('monitorEvent');
			this.unbind('playerPlayEnd');
			this.unbind('seeked');
			this.unbind('playerPlayed');
			this.unbind('replayEvent');
			this.unbind('seeked.newSegment');
			this.unbind('onPlayerStateChange');
			this.unbind('playerPaused.raptEndOfSegment');
			this.unbind('mediaLoaded');
			//this.getPlayer().sendNotification('enableGui', { 'guiEnabled': true });
			this.raptMediaPlaylistEntry = false;
			this.engineCurrentSegment = null;
			this.playbackEnded = false;
			this.playlistContent = null;
			this.raptPlaylistContent = null;
			this.raptSegments = Array();
			this.raptSequence = Array();
		},

		setupRaptMediaPlugin: function () {
			
			var _this = this;

			if ( ! this.raptDelegate) {

				this.raptDelegate = {
					
					element: this.$el[0],

					load: function(media, flags) {
						if (_this.raptSequence.length == 0) return;
						_this.playbackEnded = false;
						var currentEntryId = media.sources[0].src;
						if (_this.engineCurrentSegment && currentEntryId == _this.engineCurrentSegment.entryId)
							return;
						
						if (!(currentEntryId in _this.raptSegments) || _this.raptSegments[currentEntryId] == null) {
							_this.getPlayer().layoutBuilder.displayAlert({
								keepOverlay: true,
								message: 'There was an error loading this segment of the RAPT Media experience. Please try to reload the page, or contact Support stating the URL of this page if the issue persists.',
								title: 'Error playing RAPT Media segment',
								noButtons: true
							});
						}

						_this.engineCurrentSegment = _this.raptSegments[currentEntryId];
						var __this = _this;
						if (!_this.raptMediaInitialSegmentLoad) {
							_this.bind('seeked.newSegment', function () {
								__this.unbind('seeked.newSegment');
								__this.getPlayer().play();
							});
							var segmentStartSec = parseFloat((_this.engineCurrentSegment.msStartTime / 1000).toFixed(2));
							// HLS.js shifts the timing of clips, so we try to correct for that
							_this.fixupSegment(_this.engineCurrentSegment);
							_this.getPlayer().sendNotification("doSeek", segmentStartSec);
						} else {
							// the first rapt segment was loaded, we're ready to continue
							_this.raptMediaInitialSegmentLoad = false;
							_this.log('Initial Rapt Segment was loaded, now we can continue player init');
							_this.initCompleteCallback();
						}
						_this.getPlayer().sendNotification("raptMedia_newSegment", _this.engineCurrentSegment);
						//_this.getPlayer().sendNotification('enableGui', { 'guiEnabled': true });
						_this.log('load: ' + _this.engineCurrentSegment);
					},
					
					play: function() {
						_this.getPlayer().sendNotification("doPlay");
						//_this.getPlayer().sendNotification('enableGui', { 'guiEnabled': true });
					},
					
					pause: function() {
						_this.getPlayer().sendNotification("doPause");
					},
					
					seek: function(time) {
						_this.getPlayer().sendNotification("doSeek", time);
						//_this.getPlayer().sendNotification('enableGui', { 'guiEnabled': true });
					},

					event: function(event) {
						if (event.type != 'media:timeupdate')
							_this.log('RaptMedia Engine Event: ' + event.type);
						switch (event.type) {
							case 'project:ended':
								var behaviorOnEnd = _this.getConfig( 'behaviorOnEnd' );
								if (behaviorOnEnd == 'replay') {
									_this.raptMediaEngine.replay();
								} else {
									_this.raptMediaUpdate();
									_this.getPlayer().onClipDone();
								}
								_this.getPlayer().sendNotification("raptMedia_projectEnd");
								//_this.getPlayer().sendNotification('enableGui', { 'guiEnabled': true });
								break;
						}
					},
					
					error: function(error){
						_this.log('Engine error: ' + error);
						_this.getPlayer().layoutBuilder.displayAlert({
							keepOverlay: true,
							message: 'Somthing gone bad with this RAPT Media experience :( Please try to reload the page, or contact Support stating the URL of this page if the issue persists. (' + error + ')',
							title: 'Error playing RAPT Media experience',
							noButtons: true
						});
					}
				};

				var config = _this.getConfig('raptEngine');
				this.raptMediaEngine = new Rapt.Engine(this.raptDelegate, config);
			}

			this.raptMediaEngine.load(this.raptMediaProjectId);

			this.bind('onPlayerStateChange', function(e, newState, oldState){
				_this.raptMediaResize();
			});

			this.bind('updateLayout', function(){ 
				_this.raptMediaResize(); 
			});

			this.bind('monitorEvent', function(){ 
				_this.raptMediaUpdate(); 
			});
			
			this.bind('seeked', function() { 
				_this.playbackEnded = false;
				_this.raptMediaUpdate(); 
			});

			this.bind('replayEvent', function(){
				_this.playbackEnded = false;
				_this.raptMediaEngine.replay();
				_this.raptMediaResize();
				_this.raptMediaUpdate();
			});

			this.raptMediaResize();
			this.raptMediaUpdate();

			this.log('Engine setup complete');
		},

		raptMediaUpdate: function(){
			
			if (this.engineCurrentSegment == null) 
				return;

			if (this.playbackEnded) {
				this.getPlayer().pause();
				return;	
			}

			var globalCurrentTimeMillis = parseFloat(this.getPlayer().currentTime).toFixed(3) * 1000;
			var currentTimeMillis = (globalCurrentTimeMillis - this.engineCurrentSegment.msStartTime);

			// Smallest seek that the player will honor
			var minimumSeekMillis = (mw.getConfig("EmbedPlayer.SeekTargetThreshold", 0.1) + 0.01) * 1000;

			// Detect if we're outside the bounds of the current segment and attempt to correct.
			// Safari in particular appears to regularly under shoot when seeking.
			// TODO: If we remain out of bounds of the segment
			// after several attempts to correct we should probably
			// just fail the playback instead of going into an
			// infinite loop
			if (currentTimeMillis < 0) {
				var targetMillis = this.engineCurrentSegment.msStartTime + Math.max(0, currentTimeMillis + minimumSeekMillis);
				this.log(
					'WARNING: Current time: ' + (globalCurrentTimeMillis / 1000) +
					' is before segment start: ' + (this.engineCurrentSegment.msStartTime / 1000) +
					'. Possible bad seek. Attempting to correct by seeking to: ' + (targetMillis / 1000)
				);
				this.getPlayer().sendNotification('doSeek', targetMillis / 1000);
			} else if (currentTimeMillis > this.engineCurrentSegment.msDuration) {
				var targetMillis = this.engineCurrentSegment.msStartTime + Math.min(this.engineCurrentSegment.msDuration - 10, currentTimeMillis - minimumSeekMillis);
				this.log(
					'WARNING: Current time: ' + (globalCurrentTimeMillis / 1000) +
					' is after segment end: ' + ((this.engineCurrentSegment.msStartTime + this.engineCurrentSegment.msDuration) / 1000) +
					'. Possible playback overrun. Attempting to correct by seeking to: ' + (targetMillis / 1000)
				);
				this.getPlayer().sendNotification('doSeek', targetMillis / 1000);
			}

			if (currentTimeMillis < 0) currentTimeMillis = 0;
			var currentTimeSec = parseFloat((currentTimeMillis / 1000).toFixed(3));

			var segmentDurationMillis = this.engineCurrentSegment.msDuration - 300;
			var segmentDurationSec = parseFloat((this.engineCurrentSegment.msDuration / 1000).toFixed(3));
			
			if (currentTimeMillis >= segmentDurationMillis) {
				this.playbackEnded = true;
				var _embedPlayer = this.getPlayer();
				var _this = this;
				this.bind('playerPaused.raptEndOfSegment', function () {
					_this.unbind('playerPaused.raptEndOfSegment');
					_embedPlayer.sendNotification('raptMedia_pausedDecisionPoint');
					var segmentStartOffset = parseFloat((_this.engineCurrentSegment.msStartTime / 1000).toFixed(3));
					var seekTimeEndOfSeg = segmentStartOffset + parseFloat(((_this.engineCurrentSegment.msDuration)/1000).toFixed(3));
					_embedPlayer.triggerHelper("userInitiatedSeek", seekTimeEndOfSeg);
					_embedPlayer.stopPlayAfterSeek = true;
					_embedPlayer.seek(seekTimeEndOfSeg, true);
				});
				this.getPlayer().pause();
				//this.getPlayer().sendNotification('enableGui', { 'guiEnabled': false, 'enableType': 'controls' });
			} else {
				this.playbackEnded = false;
			}

			this.log(currentTimeSec + ", " + segmentDurationSec + " , " + this.playbackEnded);
			
			this.raptMediaEngine.update({
				currentTime: (this.playbackEnded ? segmentDurationSec : currentTimeSec),
				duration: segmentDurationSec,
				ended: this.playbackEnded,
				videoWidth: this.engineCurrentSegment.width,
				videoHeight: this.engineCurrentSegment.height
			});

			this.getPlayer().sendNotification('externalTimeUpdate', currentTimeSec);
		},

		raptMediaResize: function() {
			this.$el.width(this.getPlayer().getVideoHolder().width());
			this.$el.height(this.getPlayer().getVideoHolder().height());
			this.raptMediaEngine.resize({
				width: this.getPlayer().getVideoHolder().width(),
				height: this.getPlayer().getVideoHolder().height() 
			});
		},

		fixupSegment: function(segment) {
			// Hls.js has a tendency to shift the start point of fragments around, so
			// if it's in use we try to guess the new start time of our segment by
			// looking at HLS.js's internal data structures
			// TODO: Investigate if we will ever need to adjust the duration/end-time

			var hlsjs = this.getPlayer().getPluginInstance('hlsjs');
			if (!(hlsjs && hlsjs.hls.levels)) {
				return;
			}

			this.log('hls.js detected, adjusting segment start time. Original msStartTime: ' + segment.msStartTime);
			// We don't know which quality level will be loaded so look for the
			// maximum start time across all levels
			var levels = hlsjs.hls.levels;
			for (var i = 0; i < levels.length; i++) {
				var level = levels[i];
				var fragments = level.details.fragments;

				// Look through all the fragments for the first one that has the
				// correct discontinuity sequence number
				for (var j = 0; j < fragments.length; j++) {
					var fragment = fragments[j];

					if (fragment.cc === segment.discontinuity) {
						segment.msStartTime = Math.max(segment.msStartTime, fragment.start * 1000);
						// We found the relevant fragment for this level, skip to the next quality level.
						break;
					}
				}
			}
			this.log('hls.js adjusted msStartTime: ' + segment.msStartTime);
		},

		isValidApiResult: function (data) {
			if (!data){
				this.error = true;
				this.log("API Error retrieving data");
				return false;
			} else if ( data.code && data.message ) {
				this.error = true;
				this.log("API Error code: " + data.code + ", error message: " + data.message);
				return false;
			}
			this.error = false;
			return true;
		},
		
	} ) );
} ) ( window.mw, window.jQuery );	