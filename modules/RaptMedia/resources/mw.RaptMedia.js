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
			parent: 'videoHolder'
		},

		setup: function(){
			this.initialize();
			this.addBindings();
			this.addOverrides();
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
				// Block playback when the current segment has ended
				if (_this.segmentEnded) {
					data.allowPlayback = false;
				}
			});

			this.bind('userInitiatedPlay', function() {
				if (_this.segmentEnded) {
					_this.seek(null, 0, false);
				}
			});

			this.bind('checkPlayerSourcesEvent', function(event, callback) {
				_this.playbackCallback = callback;
			});

			this.bind('KalturaSupport_EntryDataReady', function(event) {
				// KalturaSupport_EntryDataReady can be called synchronously from a
				// `checkPlayerSourcesEvent` handler if the required data is already
				// cached. In that case `_this.playbackCallback` may not be available
				// synchronously, so we force asynchronous evaluation
				setTimeout(function() {
					_this.log('Checking if Entry is an Interactive Video');

					var raptProjectId = _this.readRaptProjectId();
					if (raptProjectId) {
						_this.once('raptMedia_ready', _this.playbackCallback);
						_this.enableRapt(raptProjectId);
					} else {
						_this.playbackCallback();
					}
				}, 0);
			});

			this.bind('onChangeMedia', function(event) {
				_this.disableRapt();
			});

			this.bind('updateLayout', function(){
				_this.resizeEngine();
			});

			this.bind('monitorEvent onplay onpause', function(){
				_this.updateEngine();
			});

			this.bind('seeked', function() {
				// Attempt to work around mobile safari weirdness
				setTimeout(function() {
					_this.updateEngine();
				}, 0);
			});

			this.bind('Kaltura_ConfigChanged', function(event, pluginName, property, value) {
				if (_this.raptMediaEngine == null) { return; }
				if (pluginName === 'googleAnalytics' && property === 'urchinCode') {
					_this.raptMediaEngine.execute({ type: 'config:set', payload: { key: 'ga', value: value } });
				}
			});
		},

		addOverrides: function() {
			var _this = this;
			var player = this.getPlayer();

			this.originalSeek = player.seek;
			player.seek = function(seekTime, stopAfterSeek) {
				var args = arguments;

				if (!_this.isEnabled()) {
					return _this.originalSeek.apply(player, args);
				} else {
					return _this.seek(null, seekTime, stopAfterSeek);
				}
			}
		},

		readRaptProjectId: function() {
			var partnerData = this.getPlayer().evaluate('{mediaProxy.entry.partnerData}') || '';
			if (partnerData.toLowerCase() === 'raptmedia!') {
				return '!' + this.getPlayer().kentryid;
			}

			var segments = partnerData.split(';');
			return partnerData != null && segments.length >= 2 && segments[0] === 'raptmedia' && segments.slice(1).join(';');
		},

		enableRapt: function(raptProjectId) {
			var _this = this;
			this.log('Enabling interactive video functionality');

			this.setConfig('status', 'loading', true);
			this.setConfig('projectId', raptProjectId, true);

			// Attempt to prevent the last segment from incorrectly triggering ended / replay behavior
			this.getPlayer().onDoneInterfaceFlag = false;

			// Keep the poster around until playback begins
			mw.setConfig('EmbedPlayer.KeepPoster', true);

			$.when(
				this.resolveProject(raptProjectId),
				this.loadSegments(raptProjectId)
			).then(function(project) {
				if (raptProjectId !== _this.getConfig('projectId')) {
					return _this.reject(new AbortError);
				}

				_this.log('Loading rapt project');

				return _this.loadProject(project);
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

			mw.setConfig('EmbedPlayer.KeepPoster', false);

			// Re-enable ended / replay behavior
			this.getPlayer().onDoneInterfaceFlag = true;

			this.emit('raptMedia_cleanup');
			this.getPlayer().sendNotification('reattachTimeUpdate');

			this.unbind('raptMedia_ready');

			if (this.$el)
				this.$el.hide();
		},

		// Utility Functions

		isEnabled: function() {
			return this.getConfig('status') === 'enabled';
		},

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

		execute: function(command) {
			if (!this.raptMediaEngine || !this.isEnabled()) {
				this.log('WARNING: Rapt Media commands received before initialization is complete');
				return;
			}

			this.raptMediaEngine.execute(command);
		},

		//

		play: function() {
			if (this.segmentEnded) {
				this.seek(null, 0, false);
			} else {
				this.getPlayer().sendNotification('doPlay');
			}
		},

		pause: function() {
			this.getPlayer().sendNotification('doPause');
		},

		seek: function(segment, time, stopAfterSeek) {
			if (segment == null) {
				segment = this.currentSegment;
			} else if (this.currentSegment !== segment) {
				this.currentSegment = segment;

				// Clear before set to prevent default object merge behavior
				this.setConfig('currentSegment', undefined, true);
				this.setConfig('currentSegment', segment, true);

				this.emit('raptMedia_newSegment', segment);
			}

			var segmentTime = Math.min(segment.duration, Math.max(0, time));
			var absoluteTime = segment.startTime + segmentTime;
			this.segmentEnded = time > segment.duration - END_EPSILON;

			if (this.segmentEnded) {
				stopAfterSeek = true;
			}

			if (stopAfterSeek == null && this.getPlayer().seeking) {
				stopAfterSeek = this.getPlayer().stopAfterSeeking;
			}

			var flags = [];
			if (this.segmentEnded) { flags.push('ending'); }

			this.log('Seeking -- ' +
				'absolute time: ' + absoluteTime.toFixed(3) + ', ' +
				'segment: ' + segment.id + ', ' +
				'segment time: ' + segmentTime.toFixed(3) + ', ' +
				'flags: [' + flags.join(' ') + ']'
			);

			this.originalSeek.call(this.getPlayer(), absoluteTime, stopAfterSeek);
			this.broadcastTime(segmentTime, segment.duration);
		},

		// Initialization Support

		resolveProject: function(projectId) {
			var _this = this;

			return this.promise(function(resolve, reject) {
				if (projectId[0] !== '!') {
					return resolve(projectId);
				}

				_this.getKalturaClient().doRequest({
					service: 'fileAsset',
					action: 'list',
                    'filter:fileAssetObjectTypeEqual' : 3,
                    'filter:objectIdEqual' :   projectId.replace(/^\!/, '')
				}, function(data) {
					if (data.code) {
						return reject(Error('Unable to load graph data: ' + data.message + ' (' + data.code + ')'));
					}

					var asset;
					for(var i in data.objects) {
						if (data.objects[i].systemName === 'GRAPH_DATA') {
							asset = data.objects[i];
						}
					}

					if (!asset) {
						return reject(Error('Unable to load graph data, missing file asset'));
					}

					_this.getKalturaClient().doRequest({
						service: 'fileAsset',
						action: 'serve',
						id: asset.id,
					}, resolve);
				});
			});
		},

		getPlayerUncertainty: function(discontinuityIndex) {
			var streamerType = this.getPlayer().evaluate('{utility.streamerType}');
			var position = discontinuityIndex + 1;

			var AAC_FRAME_SIZE = 1024;
			var MIN_SAMPLE_RATE = 44100;

			var AAC_UNCERTAINTY = AAC_FRAME_SIZE / MIN_SAMPLE_RATE;

			var MIN_FRAME_RATE = 24;
			var MAX_DTS_OFFSET = 2;

			var DTS_UNCERTAINTY = MAX_DTS_OFFSET / MIN_FRAME_RATE;
			// Segment duration is based on the duration of all video frames, however on discontinuities HLS.js appears to take the longer of the audio or video duration.
			// Audio will always be a multiple of AAC frame size (1024 samples) so we assume the maximum error of 1 AAC frame at the lowest sampling rate per discontinuity.

			switch (streamerType) {
				case 'mpegdash':
					return DTS_UNCERTAINTY;
				case 'hls':
				default:
					return AAC_UNCERTAINTY * position + DTS_UNCERTAINTY;
			}
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

						var startTime = i === 0 ? 0 : Math.ceil((msStartOffset + msUncertainty) / 10) / 100;
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
					var stopAfterSeek = true;

					if (_this.getConfig('status') === 'loading') {
						stopAfterSeek = undefined;
					}

					if (nextSegment) {
						_this.seek(nextSegment, 0, stopAfterSeek);
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
						case 'project:start':
							mw.setConfig('EmbedPlayer.KeepPoster', false);
							_this.getPlayer().removePoster();
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
				var config = this.getConfig('raptEngine') || {};

				var ua = this.getPlayer().getKalturaConfig('googleAnalytics', 'urchinCode');
				if (ua != null) {
					config.ga = ua;
				}

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
			if (!this.isEnabled()) {
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

			var isBefore = segmentTime < -0.001;
			var isEnding = segmentTime > this.currentSegment.duration - END_EPSILON;
			var isAfter = segmentTime > this.currentSegment.duration + 0.001;

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

			if (!this.raptMediaEngine) { return; }

			this.raptMediaEngine.resize({
				width: _this.getPlayer().getVideoHolder().width(),
				height: _this.getPlayer().getVideoHolder().height()
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
