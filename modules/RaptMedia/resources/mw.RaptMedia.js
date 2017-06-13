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

	var AbortError = function() {};
	var END_EPSILON = 0.375;
	var SEEK_EPSILON = 0.1;

	// Required for playback of stitched playlists on android
	mw.setConfig("Kaltura.LeadHLSOnAndroid", true);

	// Required for playback of stitched playlists on IE11 on Windows 7
	mw.setConfig("LeadWithHLSOnFlash", true);

	mw.PluginManager.add( 'raptMedia', mw.KBaseComponent.extend( {

		defaultConfig: {
			'raptMediaScriptUrl': 'https://cdn1.raptmedia.com/system/player/v1/engine.min.js'
		},

		setup: function(){
			this.initialize();
			this.addBindings();
		},

		initialize: function() {
			this.setConfig('status', 'disabled', true);

			this.setConfig('projectId', undefined, true);
			this.setConfig('currentSegment', undefined, true);
			this.setConfig('info', undefined, true);

			this.currentSegment = null;
			this.segmentEnded = false;
			this.segments = null;
		},

		addBindings: function() {
			var _this = this;

			this.bind('raptMedia_doPlay', function(event) {
				_this.execute({ type: 'player:play' });
			});

			this.bind('raptMedia_doPause', function(event) {
				_this.execute({ type: 'player:pause' });
			})

			this.bind('raptMedia_doSeek', function(event, time) {
				_this.execute({ type: 'player:seek', payload: { time: time } });
			});

			this.bind('raptMedia_doJump', function(event, locator) {
				_this.execute({ type: 'project:jump', payload: { destination: locator } });
			});

			this.bind('raptMedia_doReplay', function(event) {
				_this.execute({ type: 'project:replay' });
			});

			this.bind('raptMedia_doCommand', function(event, command) {
				_this.execute(command);
			});

			this.bind('prePlayAction', function(event, data) {
				// Block playback until engine is initialized and the project is loaded
				if (_this.getConfig('status') === 'loading') {
					_this.log('Deferring play, rapt project still loading');

					_this.whenReady(function() {
						_this.getPlayer().play();
					});

					data.allowPlayback = false;
				}

				// Block playback when the current segment has ended
				if (_this.segmentEnded) {
					data.allowPlayback = false;
					_this.seek(null, 0, false);
				}
			});

			this.bind('KalturaSupport_EntryDataReady', function(event) {
				_this.log('Checking if Entry is an Interactive Video');

				var raptProjectId = _this.readRaptProjectId();
				if (raptProjectId) {
					_this.enableRapt(raptProjectId);
				}
			});

			this.bind('onChangeMedia', function(event) {
				_this.disableRapt();
			});

			this.bind('updateLayout', function(){
				_this.resizeEngine();
			});

			this.bind('monitorEvent', function(){
				_this.updateEngine();
			});

			this.bind('onplay', function() {
				_this.updateEngine();
			});

			this.bind('onpause', function() {
				_this.updateEngine();
			});

			this.bind('seeked', function() {
				_this.updateEngine();
			});
		},

		readRaptProjectId: function() {
			var partnerData = this.getPlayer().evaluate('{mediaProxy.entry.partnerData}');
			var segments = (partnerData || "").split(';');
			return partnerData != null && segments.length >= 2 && segments[0] === 'raptmedia' && segments.slice(1).join(';');
		},

		enableRapt: function(raptProjectId) {
			var _this = this;
			this.log('Enabling interactive video functionality');

			this.setConfig('status', 'loading', true);
			this.setConfig('projectId', raptProjectId, true);

			// Prevent the last segment from incorrectly triggering ended / replay behavior
			// this.getPlayer().onDoneInterfaceFlag = false;

			$.when(
				this.loadEngine(),
				this.loadSegments(raptProjectId)
			).then(function() {
				if (raptProjectId !== _this.getConfig('projectId')) {
					return _this.reject(new AbortError);
				}

				_this.log('Loading rapt project');

				return _this.loadProject(raptProjectId);
			}).then(function() {
				if (raptProjectId !== _this.getConfig('projectId')) {
					return _this.reject(new AbortError);
				}

				if (_this.$el)
					_this.$el.show();

				_this.log('Starting rapt project');

				_this.emit('detachTimeUpdate');

				_this.setConfig('status', 'enabled', true);
				_this.emit('raptMedia_ready');
			}).then(null, function(error) {
				if (error instanceof AbortError) {
					_this.log('Aborted project load');
				} else {
					_this.log(error);
					_this.fatal('Unable to load rapt media project');
				}
			});
		},

		disableRapt: function() {
			this.log('Disabling interactive video functionality');

			var status = this.getConfig('status');
			if (status === 'disabled') {
				this.log('Already disabled');
				return;
			}

			this.initialize();

			// Re-enable ended / replay behavior
			// this.getPlayer().onDoneInterfaceFlag = true;

			this.emit('raptMedia_cleanup');
			this.getPlayer().sendNotification('reattachTimeUpdate');

			this.unbind('raptMedia_ready');

			if (this.$el)
				this.$el.hide();
		},

		// Utility Functions

		emit: function(event, data) {
			this.getPlayer().sendNotification(event, data);
		},

		fatal: function(title, message) {
			this.setConfig('status', 'error', true);
			this.getPlayer().layoutBuilder.displayAlert({
				isError: true,
				isModal: true,

				keepOverlay: true,
				noButtons: true,

				title: title || "Fatal error in Rapt Media project",
				message: message
			});
		},

		promise: function(fn) {
			var deferred = $.Deferred(function(defer) {
				try {
					fn(defer.resolve, defer.reject);
				} catch(e) {
					defer.reject(e);
				}
			});

			return deferred.promise();
		},

		reject: function(error) {
			return this.promise(function(_, reject) {
				reject(error);
			});
		},

		whenReady: function(callback) {
			const status = this.getConfig('status');

			if (status === 'enabled') {
				return callback();
			}

			if (status === 'loading') {
				return this.once('raptMedia_ready', callback);
			}

			this.log('Dropping callback. Rapt Media status: ' + status + '.');
		},

		execute: function(command) {
			var _this = this;
			this.whenReady(function() {
				_this.raptMediaEngine.execute(command);
			});
		},

		//

		play: function() {
			var _this = this;

			this.whenReady(function() {
				_this.getPlayer().sendNotification('doPlay');
			});
		},

		pause: function() {
			var _this = this;

			this.whenReady(function() {
				_this.getPlayer().sendNotification('doPause');
			});
		},

		seek: function(segment, time, stopAfterSeek) {
			var _this = this;


			this.whenReady(function() {
				if (segment == null) {
					segment = _this.currentSegment;
				} else if (_this.currentSegment !== segment) {
					_this.currentSegment = segment;

					// Clear before set to prevent default object merge behavior
					_this.setConfig('currentSegment', undefined, true);
					_this.setConfig('currentSegment', segment, true);

					_this.emit('raptMedia_newSegment', segment);
				}

				var segmentTime = Math.min(segment.duration, Math.max(0, time));
				var absoluteTime = segment.startTime + segmentTime;
				_this.segmentEnded = time > segment.duration - END_EPSILON;

				if (_this.segmentEnded) {
					stopAfterSeek = true;
				}

				if (stopAfterSeek == null && _this.getPlayer().seeking) {
					stopAfterSeek = _this.getPlayer().stopAfterSeeking;
				}

				var flags = [];
				if (_this.segmentEnded) { flags.push('ending'); }

				_this.log('Seeking -- ' +
					'absolute time: ' + absoluteTime.toFixed(3) + ', ' +
					'segment: ' + segment.id + ', ' +
					'segment time: ' + segmentTime.toFixed(3) + ', ' +
					'flags: [' + flags.join(' ') + ']'
				);

				_this.getPlayer().seek(absoluteTime, stopAfterSeek);
				_this.broadcastTime(segmentTime, segment.duration);
			});
		},

		// Initialization Support

		loadEngine: function() {
			var _this = this;
			if (this.enginePromise) { return this.enginePromise; }

			var raptMediaScriptUrl = this.getConfig( 'raptMediaScriptUrl' );
			this.log('Loading rapt media engine: ' + raptMediaScriptUrl);

			this.enginePromise = $.ajax({ dataType: 'script', url: raptMediaScriptUrl, cache: true })
				.then(function() {
					_this.log('Loaded rapt media engine successfuly: ' + raptMediaScriptUrl);
				}, function( jqxhr, settings, exception ) {
					_this.log('Failed to load script: ' + raptMediaScriptUrl + ', ' + exception);
					_this.fatal(
						'Error loading RAPT Media engine',
						'Error loading the Rapt Media engine.'
					);
				});

			return this.enginePromise;
		},

		getPlayerUncertainty: function(discontinuityIndex) {
			var position = discontinuityIndex + 1;
			var AAC_FRAME_SIZE = 1024;
			var MIN_SAMPLE_RATE = 44100;
			var MIN_FRAME_RATE = 24;

			// Segment duration is based on the duration of all video frames, however on discontinuities HLS.js appears to take the longer of the audio or video duration.
			// Audio will always be a multiple of AAC frame size (1024 samples) so we assume the maximum error of 1 AAC frame at the lowest sampling rate per discontinuity.
			return (
				// Audio length uncertainty
				((AAC_FRAME_SIZE / MIN_SAMPLE_RATE) * position) +
				// PTS vs. DTS uncertainty
				(2 / MIN_FRAME_RATE)
			);
		},

		loadSegments: function(raptProjectId) {
			var _this = this;

			var playlistContent = this.getPlayer().evaluate('{mediaProxy.entry.playlistContent}')
			var entryIds = (playlistContent || '').split(',');

			var request = {
				service: 'playlist',
				action: 'execute',
				id: this.getPlayer().evaluate('{mediaProxy.entry.id}')
			};

			_this.log('Loading video segment metadata');

			return this.promise(function(resolve, reject) {
				_this.getKalturaClient().doRequest(request, function (data) {
					if (raptProjectId !== _this.getConfig('projectId')) {
						return _this.reject(new AbortError);
					}

					if (!_this.isValidApiResult(data)) {
						_this.fatal(
							'Error loading video segment metadata',
							'Error loading the interactive video segment metadata.'
						);
						return reject();
					}

					var msStartOffset = 0;
					_this.segments = {};

					data.forEach(function(entry, i) {
						var entry = data[i];

						var msUncertainty = _this.getPlayerUncertainty(i) * 1000;

						var startTime = Math.ceil((msStartOffset + msUncertainty) / 10) / 100;
						var endTime = Math.floor((msStartOffset + entry.msDuration - msUncertainty) / 10) / 100;
						var duration = endTime - startTime;
						var uncertainty = Math.ceil(msUncertainty / 10) / 100;

						var segment = {
							id: entry.id,
							uncertainty: uncertainty,

							startTime: startTime,
							duration: duration,
							endTime: endTime,

							width: entry.width,
							height: entry.height
						};

						Object.freeze(segment);

						_this.segments[segment.id] = segment;

						msStartOffset += entry.msDuration;
					});

					_this.log('Loaded video segment metadata.');
					if (typeof console.table === 'function') {
						console.table(_this.segments);
					}

					var missing = entryIds.filter(function(entryId) {
						return !_this.segments.hasOwnProperty(entryId);
					});

					if (missing.length > 0) {
						_this.fatal(
							'Error loading video segment metadata',
							'Unable to load metadata for: ' + missing.join(', ') + '. There is likely a configuration issue'
						);

						return reject();
					}

					resolve();
				});
			});
		},

		getComponent: function () {

			if ( ! this.$el) {
				this.$el = $( "<div></div>" ).attr( 'id', 'raptMediaOverlay' ).addClass( this.getCssClass() );
			}

			return this.$el;
		},

		getDelegate: function () {
			var _this = this;

			if (this.delegate) { return this.delegate; }

			return this.delegate = {
				element: this.getComponent()[0],

				load: function(media, flags) {
					var entryId = media.sources[0].src;
					var nextSegment = _this.segments[entryId];

					if (nextSegment) {
						_this.seek(nextSegment, 0, true);
					} else {
						_this.fatal(
							'Error in RAPT playback',
							'The follow segment was not found: ' + entryId
						);
					}
				},

				play: function() {
					_this.play();
				},

				pause: function() {
					_this.pause();
				},

				seek: function(time) {
					_this.seek(null, time);
				},

				event: function(event) {
					// Clear before set to prevent default object merge behavior
					_this.setConfig('info', undefined, true);
					_this.setConfig('info', _this.raptMediaEngine.evaluate(), true);

					switch (event.type) {
						case 'project:ended':
							// TODO: Trigger end screen
							break;
					}

					_this.emit("raptMedia_event", event);
				},

				error: function(error) {
					console.error(error);
					_this.log('Error from rapt media engine: ' + error);
					_this.fatal(
						'Error in RAPT Media engine',
						'Something went wrong.'
					);
				},
			};
		},

		loadProject: function(projectId) {
			var _this = this;

			if (!this.raptMediaEngine) {
				var config = this.getConfig('raptEngine');

				this.raptMediaEngine = new Rapt.Engine(
					this.getDelegate(),
					config
				);
			}

			this.resizeEngine();

			return this.promise(function(resolve, reject) {
				_this.raptMediaEngine.load(projectId).then(resolve, reject);
			});
		},

		updateEngine: function(){
			if (this.getConfig('status') !== 'enabled') {
				return;
			}

			if (this.currentSegment == null) {
				return;
			}

			if (this.getPlayer().seeking) {
				return;
			}

			var absoluteTime = this.getPlayer().currentTime;
			var segmentTime = absoluteTime - this.currentSegment.startTime;

			var isBefore = segmentTime < 0;
			var isEnding = segmentTime > this.currentSegment.duration - END_EPSILON;
			var isAfter = segmentTime > this.currentSegment.duration;

			var flags = [];
			if (isBefore) { flags.push('before'); }
			if (isAfter) { flags.push('after');}
			if (isEnding) { flags.push('ending');}

			this.log('Update -- ' +
				'absolute time: ' + absoluteTime.toFixed(3) + ', ' +
				'segment: ' + this.currentSegment.id + ', ' +
				'segment time: ' + segmentTime.toFixed(3) + ', ' +
				'flags: [' + flags.join(' ') + ']'
			);

			if (isBefore) {
				this.seek(null, SEEK_EPSILON);
				return;
			}

			if (isAfter) {
				// TODO: Handle when HLS.js attempts to seek over a gap
				this.seek(null, this.currentSegment.duration - SEEK_EPSILON, true);
				return;
			}

			if (isEnding && !this.segmentEnded) {
				this.seek(null, this.currentSegment.duration, true);
				return;
			}

			if (!isEnding) {
				this.segmentEnded = false;
			}

			// "Hide" the fact that we pause the video a _little_ before the actual end.
			var publicTime = (this.segmentEnded ? this.currentSegment.duration : segmentTime);

			this.raptMediaEngine.update({
				currentTime: publicTime,
				duration: this.currentSegment.duration,
				paused: !this.getPlayer().isPlaying(),

				ended: this.segmentEnded,

				videoWidth: this.currentSegment.width,
				videoHeight: this.currentSegment.height
			});

			this.broadcastTime(publicTime, this.currentSegment.duration);
		},

		broadcastTime: function(currentTime, duration) {
			// Update current time label
			this.getPlayer().sendNotification('externalTimeUpdate', currentTime);

			// Update scrubber
			if (!this.getPlayer().userSlide) {
				this.getPlayer().sendNotification('externalUpdatePlayHeadPercent', currentTime / duration);
			}
		},

		resizeEngine: function() {
			var _this = this;

			this.whenReady(function() {
				_this.raptMediaEngine.resize({
					width: _this.getPlayer().getVideoHolder().width(),
					height: _this.getPlayer().getVideoHolder().height()
				});
			});
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
