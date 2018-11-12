/**
 * The RaptMediaNg plugin integrates the RaptMedia Engine to the Kaltura Player.
 * RaptMedia adds clickable interactive layer that accompanies your video content and can do things like:
 * cue or launch different media plays, jump to specific timecode, trigger an event on your webpage and launch a new web page or an app.
 * This plugin also makes use of accompanying plugin RaptMediaNgScrubber plugin to override the default scrubber behavior to fit a Rapt Media experience.
 * With RaptMediaNgScrubber plugin the scrubber can interact within the context of a single RaptMedia clip instead of just the entire stitched playlist.
 * The RaptMediaNg plugin integrates the RaptMedia Engine to the Kaltura Player.
 * It also makes use of accompanying plugin RaptMediaNgDurationLabel used to override the default player DurationLabel to behave according to the RaptMedia Sequence rather than show the overall playlist duration.
 */
(function ( mw, $ ) {
	"use strict";

	var AbortError = function() {};

	mw.PluginManager.add( 'raptMediaNg', mw.KBaseComponent.extend( {

		defaultConfig: {
			parent: 'videoHolder'
		},

		setup: function(){
			this.initialize();
			this.addBindings();
		},

		initialize: function() {
			this.setConfig('status', 'disabled', true);

			this.setConfig('projectId', undefined, true);
			this.setConfig('info', undefined, true);

			this.pendingEntryId = null;
			this.targetEntryId = null;
		},

		addBindings: function() {
			var _this = this;

			this.bind('raptMediaNg_doPlay', function(event) {
				_this.execute({ type: 'player:play' });
			});

			this.bind('raptMediaNg_doPause', function(event) {
				_this.execute({ type: 'player:pause' });
			})

			this.bind('raptMediaNg_doSeek', function(event, time) {
				_this.execute({ type: 'player:seek', payload: { time: time } });
			});

			this.bind('raptMediaNg_doJump', function(event, locator) {
				_this.execute({ type: 'project:jump', payload: { destination: locator } });
			});

			this.bind('raptMediaNg_doReplay', function(event) {
				_this.execute({ type: 'project:replay' });
			});

			this.bind('raptMediaNg_doCommand', function(event, command) {
				_this.execute(command);
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
						_this.once('raptMediaNg_ready', _this.playbackCallback);
						_this.enableRapt(raptProjectId);
					} else {
						_this.playbackCallback();
					}
				}, 0);
			});

			this.bind('onChangeMedia', function(event) {
				var entryId = _this.getPlayer().kentryid;

				if (_this.isEnabled() && _this.entries && _this.entries.indexOf(entryId) === -1) {
					_this.disableRapt();
				}
			});

			this.bind('updateLayout', function(){
				_this.resizeEngine();
			});

			this.bind('monitorEvent onplay onpause ended', function(){
				_this.updateEngine();
			});

			this.bind('seeked', function() {
				// Attempt to work around mobile safari weirdness
				setTimeout(function() {
					_this.updateEngine();
				}, 0);
			});

			this.bind('Kaltura_ConfigChanged', function(event, pluginName, property, value) {
				if (_this.raptMediaNgEngine == null) { return; }
				if (pluginName === 'googleAnalytics' && property === 'urchinCode') {
					_this.raptMediaNgEngine.execute({ type: 'config:set', payload: { key: 'ga', value: value } });
				}
			});
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

			// Keep list of entries that are part of this project
			this.entries = this.getPlayer().evaluate('{mediaProxy.entry.playlistContent}').split(',');

			// Store original config so they can be restored later
			this.originalConfig = {
				onDoneInterfaceFlag: this.getPlayer().onDoneInterfaceFlag,
				shouldEndClip: this.getPlayer().shouldEndClip,

				'EmbedPlayer.ShowPosterOnStop': this.getPlayer().getFlashvars('EmbedPlayer.ShowPosterOnStop'),

				'EmbedPlayer.HidePosterOnStart': mw.getConfig('EmbedPlayer.HidePosterOnStart'),
				'EmbedPlayer.KeepPoster': mw.getConfig('EmbedPlayer.KeepPoster'),
			}

			// Attempt to prevent the last segment from incorrectly triggering ended / replay behavior
			this.getPlayer().onDoneInterfaceFlag = false;
			this.getPlayer().shouldEndClip = false;

			// Don't show the poster at the end of a node
			this.getPlayer().setFlashvars('EmbedPlayer.ShowPosterOnStop', false);

			// Keep the poster around until playback begins
			mw.setConfig('EmbedPlayer.KeepPoster', true);

			this.resolveProject(raptProjectId)
			.then(function(project) {
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

				_this.setConfig('status', 'enabled', true);
				_this.emit('raptMediaNg_ready');
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

			this.getPlayer().getInterface().removeClass('raptMediaNg_running');

			this.entries = null;

			if (this.originalConfig) {
				this.log('Restoring settings');

				this.getPlayer().onDoneInterfaceFlag = this.originalConfig.onDoneInterfaceFlag;
				this.getPlayer().shouldEndClip = this.originalConfig.shouldEndClip;
				this.getPlayer().setFlashvars('EmbedPlayer.ShowPosterOnStop', this.originalConfig['EmbedPlayer.ShowPosterOnStop']);
				mw.setConfig('EmbedPlayer.HidePosterOnStart', this.originalConfig['EmbedPlayer.HidePosterOnStart']);
				mw.setConfig('EmbedPlayer.KeepPoster', this.originalConfig['EmbedPlayer.KeepPoster']);
			}

			this.originalConfig = null;

			// Re-enable ended / replay behavior
			this.getPlayer().onDoneInterfaceFlag = true;

			this.emit('raptMediaNg_cleanup');
			this.unbind('raptMediaNg_ready');

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
			if (!this.raptMediaNgEngine || !this.isEnabled()) {
				this.log('WARNING: Rapt Media commands received before initialization is complete');
				return;
			}

			this.raptMediaNgEngine.execute(command);
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
                        		'filter:objectType': 'KalturaFileAssetFilter',
		                        'filter:entryIdEqual': _this.getPlayer().kentryid,
		                        'filter:fileAssetObjectTypeEqual': 3,
		                        'filter:objectIdEqual': projectId.replace(/^\!/, '')
					/*filter: {
						objectType: KalturaFileAssetFilter,
						fileAssetObjectTypeEqual: 3,
						objectIdEqual: projectId.replace(/^\!/, ''),
					}*/
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

		getComponent: function () {

			if ( ! this.$el) {
				this.$el = $( "<div></div>" ).attr( 'id', 'raptMediaNgOverlay' ).addClass( this.getCssClass() );
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

					_this.targetEntryId = entryId;

					function change() {
						_this.log('Changing media');
						_this.getPlayer().sendNotification('changeMedia', { entryId: entryId });
					}

					return _this.promise(function(resolve, reject) {
						if (_this.getPlayer().currentState === 'start') {
							_this.log('Project not started, deferring changeMedia');
							_this.pendingEntryId = entryId;
							resolve();
						} else if (_this.getPlayer().changeMediaStarted) {
							_this.log('Change media already in progress, waiting');
							_this.once('onChangeMediaDone', change);
							resolve();
						} else {
							change();
							_this.once('onChangeMediaDone', resolve);
						}
					});
				},

				play: function() {
					if (!_this.getPlayer().changeMediaStarted) {
						_this.getPlayer().sendNotification('doPlay');
					}
				},

				pause: function() {
					_this.getPlayer().sendNotification('doPause');
				},

				seek: function(time) {
					_this.getPlayer().sendNotification('doSeek', time);
				},

				event: function(event) {
					// Clear before set to prevent default object merge behavior
					_this.setConfig('info', undefined, true);
					_this.setConfig('info', _this.raptMediaNgEngine.evaluate(), true);

					switch (event.type) {
						case 'project:ended':
							// TODO: Trigger end screen
							break;
						case 'project:start':
							if (_this.pendingEntryId) {
								setTimeout(function() {
									_this.log('Loading pending entry:' + _this.pendingEntryId);
									_this.getPlayer().sendNotification('changeMedia', { entryId: _this.pendingEntryId });
									_this.pendingEntryId = null;
								}, 0);
							}

							// Hide poster during transitions
							mw.setConfig('EmbedPlayer.KeepPoster', false);
							mw.setConfig('EmbedPlayer.HidePosterOnStart', true);

							// Hide undesirable UI elements
							_this.getPlayer().getInterface().addClass('raptMediaNg_running');

							// Get rid of the poster
							_this.getPlayer().removePoster();
							break;
					}

					_this.emit("raptMediaNg_event", event);
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

			if (!this.raptMediaNgEngine) {
				var config = this.getConfig('raptEngine') || {};

				var ua = this.getPlayer().getKalturaConfig('googleAnalytics', 'urchinCode');
				if (ua != null) {
					config.ga = ua;
				}

				this.raptMediaNgEngine = new Rapt.Engine(
					this.getDelegate(),
					config
				);
			}

			this.resizeEngine();

			return this.promise(function(resolve, reject) {
				_this.raptMediaNgEngine.load(projectId).then(resolve, reject);
			});
		},

		updateEngine: function(){
			if (!this.isEnabled()) {
				return;
			}

			var player = this.getPlayer();

			if (!this.targetEntryId || this.pendingEntryId) {
				this.raptMediaNgEngine.update({
					paused: !player.isPlaying(),
				});
			}


			var currentEntryId = player.evaluate('{mediaProxy.entry.id}');
			if (currentEntryId !== this.targetEntryId) {
				this.log('Current media is out-of-date, skipping engine update');
				return;
			}


			if (player.seeking) {
				return;
			}

			this.raptMediaNgEngine.update({
				currentTime: player.currentTime,
				duration: player.duration,
				paused: !player.isPlaying(),

				ended: (player.duration - player.currentTime) < 0.25 && player.isStopped(),

				videoWidth: player.evaluate('{mediaProxy.entry.width}'),
				videoHeight: player.evaluate('{mediaProxy.entry.height}'),

				readyState: player.getPlayerElement().readyState,
			});
		},

		resizeEngine: function() {
			var _this = this;

			if (!this.raptMediaNgEngine) { return; }

			this.raptMediaNgEngine.resize({
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
