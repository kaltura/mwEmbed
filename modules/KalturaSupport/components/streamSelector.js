(function (mw, $, kWidget) {
	"use strict";

	mw.PluginManager.add('streamSelector', mw.KBaseComponent.extend({

		defaultConfig: {
			"parent": "controlsContainer",
			"order": 61,
			"displayImportance": 'low',
			"align": "right",
			"showTooltip": true,
			"hideWhenEmpty": true,
			"labelWidthPercentage": 33,
			"defaultStream": 1,
			"maxNumOfStream": 4,
			"enableKeyboardShortcuts": true,
			'smartContainer': 'qualitySettings',
			'smartContainerCloseEvent': 'onChangeStream',
			"title": gM( 'mwe-embedplayer-select_stream' ),
			"keyboardShortcutsMap": {
				"nextStream": 221,   // Add ] Sign for next stream
				"prevStream": 219,   // Add [ Sigh for previous stream
				"defaultStream": 220, // Add \ Sigh for default stream
				"openMenu": 83, // Add S Sigh for open menu
				"closeMenu": "shift+83" // Add Shift+S Sigh for close menu
			}
		},

		isDisabled: false,
		streams: [],
		streamsReady: false,
		streamEnded: false,
		streamChanging: false,

		setup: function () {
			this.addBindings();
		},
		destroy: function () {
			this._super();
			this.getComponent().remove();
		},
		addBindings: function () {
			var _this = this;
			this.bind('dualScreenLoaded', function () {
                _this.destroy();
            });

			this.bind('playerReady', function () {
				if (!_this.streamsReady) {
					_this.onDisable();
					_this.getStreams();
				}
			});

			this.bind('streamsReady', function () {
				//Indicate that the streams are ready to enable spinning animation on source switching
				_this.streamsReady = true;
				//Insert original entry to streams
				_this.streams.splice(0, 0, {
					id: _this.getPlayer().kentryid,
					data: {
						meta: _this.getPlayer().kalturaPlayerMetaData,
						contextData: _this.getPlayer().kalturaContextData
					}
				});
				//Set default stream
				if (( _this.getConfig("defaultStream") < 1) || ( _this.getConfig("defaultStream") > _this.streams.length )) {
					this.log("Error - default stream id is out of bounds, setting to 1");
					_this.setConfig("defaultStream", 1);
				}
				_this.currentStream = _this.getDefaultStream();
				//TODO: handle default stream selection???
				if (_this.getPlayer().kentryid != _this.currentStream.id) {
					_this.setStream(_this.currentStream);
					_this.setActiveMenuItem();
				}
				_this.buildMenu();
				_this.onEnable();
			});

			this.bind('sourceSwitchingEnd', function () {
				if (_this.streamsReady) {
					_this.onEnable();
				}
			});

			this.bind('sourceSwitchingStarted', function () {
				_this.onDisable();
			});

			this.bind("ended", function () {
				_this.streamEnded = true;
			});

			this.bind("onplay onChangeStreamDone", function () {
				_this.streamEnded = false;
			});

			this.bind('changeStream', function (e, arg) {
				_this.externalSetStream(arg);
			});

			this.bind('onChangeMedia', function () {
				if (!_this.streamChanging){
						_this.streams = [];
						_this.getMenu().destroy();
						_this.onDisable();
						_this.streamsReady = false;
					}
			});

			this.bind( 'onDisableInterfaceComponents', function(e, arg ){
				_this.getMenu().close();
			});

			if (this.getConfig('enableKeyboardShortcuts')) {
				this.bind('addKeyBindCallback', function (e, addKeyCallback) {
					_this.addKeyboardShortcuts(addKeyCallback);
				});
			}
		},
		getStreams: function () {
			var _this = this;
			var requestObject = [];
			requestObject.push({
				'service': 'baseEntry',
				'action': 'list',
				'filter:objectType': 'KalturaBaseEntryFilter',
				// MEDIA_CLIP
				'filter:typeEqual': 1,
				'filter:parentEntryIdEqual': this.getPlayer().kentryid
			});

			var i = 0;
			var maxNumOfStream = this.getConfig("maxNumOfStream");
			for (i; i < maxNumOfStream; i++) {
				requestObject.push({
					'service': 'flavorAsset',
					'action': 'list',
					'filter:entryIdEqual': '{1:result:objects:' + i + ':id}'
				});
			}

			// do the api request
			this.getKalturaClient().doRequest(requestObject, function (data) {
				// Validate result
				if (data && _this.isValidResult(data[0] && data[0].totalCount > 0)) {
					_this.createStreamList(data);
					if( _this.getConfig('hideWhenEmpty') == true ){
						_this.setConfig('visible', true);
					}
					_this.getBtn().show();
				} else {
					mw.log('streamSelector::Error retrieving streams, disabling component');
					if( _this.getConfig('hideWhenEmpty') == false ){
						_this.setConfig('visible', true);
					}
				}
				_this.embedPlayer.triggerHelper("updateComponentsVisibilityDone");
			});
		},
		createStreamList: function (data) {
			var _this = this;
			var subStreams = data[0].objects;
			var subStreamsData = data.slice(1);
			if (subStreams && subStreams.length > 0) {
				$.each( subStreams, function ( i, subStream ) {
					if (subStreamsData[i]) {
						_this.streams.push( {
							id: subStream.id,
							data: {
								meta: subStream,
								contextData: {
									flavorAssets: subStreamsData[i].objects
								}
							}
						} );
					}
				} );
			} else {
				mw.log('streamSelector::No streams available, disabling component');
				_this.getBtn().hide();
			}
			_this.embedPlayer.triggerHelper('streamsReady');
		},
		isValidResult: function (data) {
			// Check if we got error
			if (!data
				||
				( data.code && data.message )
				) {
				mw.log('streamSelector::Error, invalid result: ' + data.message);
				this.error = true;
				return false;
			}
			this.error = false;
			return true;
		},
		addKeyboardShortcuts: function (addKeyCallback) {
			var _this = this;
			// Add ] Sign for next stream
			addKeyCallback(this.getConfig("keyboardShortcutsMap").nextStream, function () {
				_this.setStream(_this.getNextStream());
				_this.setActiveMenuItem();
			});
			// Add [ Sigh for previous stream
			addKeyCallback(this.getConfig("keyboardShortcutsMap").prevStream, function () {
				_this.setStream(_this.getPrevStream());
				_this.setActiveMenuItem();
			});
			// Add \ Sigh for default stream
			addKeyCallback(this.getConfig("keyboardShortcutsMap" ).defaultStream, function () {
				_this.setStream(_this.getDefaultStream());
				_this.setActiveMenuItem();
			});
			if ( !_this.getPlayer().playerConfig.plugins.video360.plugin ) {
				// Add S Sigh for open menu
				addKeyCallback(this.getConfig("keyboardShortcutsMap" ).openMenu, function () {
					_this.getMenu().open();
				});
				// Add Shift+S Sigh for close menu
				addKeyCallback(this.getConfig("keyboardShortcutsMap" ).closeMenu, function () {
					_this.getMenu().close();
				});
			}
		},
		getNextStream: function () {
			if (this.streams[this.getCurrentStreamIndex() + 1]) {
				return this.streams[this.getCurrentStreamIndex() + 1];
			}
			return this.streams[this.getCurrentStreamIndex()];
		},
		getPrevStream: function () {
			if (this.streams[this.getCurrentStreamIndex() - 1]) {
				return this.streams[this.getCurrentStreamIndex() - 1];
			}
			return this.streams[this.getCurrentStreamIndex()];
		},
		getDefaultStream: function () {
			return this.streams[(this.getConfig('defaultStream') - 1)];
		},
		getCurrentStreamIndex: function () {
			var _this = this;
			var index = null;
			$.each(this.streams, function (idx, stream) {
				if (_this.currentStream == stream) {
					index = idx;
					return false;
				}
			});
			return index;
		},
		buildMenu: function () {
			var _this = this;

			// Destroy old menu
			this.getMenu().destroy();

			if (!this.streams.length) {
				this.log("Error with getting streams");
				//this.destroy();
				return;
			}

			$.each(this.streams, function (streamIndex, stream) {
				_this.addStreamToMenu(streamIndex, stream);
			});
			var actualWidth = this.getMenu().$el.width();
			var labelWidthPercentage = parseInt(this.getConfig("labelWidthPercentage")) / 100;
			var labelWidth = this.getPlayer().getWidth() * labelWidthPercentage;
			if (actualWidth > labelWidth) {
				this.getMenu().$el.find('a').width(labelWidth);
			}
			this.getMenu().setActive({'key': 'id', 'val': this.getCurrentStreamIndex()});
		},
		setActiveMenuItem: function() {
			var index = this.getCurrentStreamIndex();
			this.getMenu().setActive(index);
		},
		addStreamToMenu: function (id, stream) {
			var _this = this;
			var active = (this.getCurrentStreamIndex() == id);
			var streamName = stream.data.meta.name;
			this.getMenu().addItem({
				'label': streamName,
				'attributes': {
					'id': id
				},
				'callback': function () {
					_this.setStream(stream);
				},
				'active': active
			});
			this.getMenu().$el.find("a").addClass("truncateText");
		},
		externalSetStream: function (id) {
			var stream = this.streams[id];
			if (stream) {
				this.setStream(stream);
				this.setActiveMenuItem();
			} else {
				this.log("Error - invalid stream id");
			}
		},
		setStream: function (stream) {
			this.log("set stream");
			if (this.currentStream != stream) {
				var _this = this;
				var embedPlayer = this.getPlayer();
				this.streamChanging = true;
				embedPlayer.triggerHelper('onChangeStream', [_this.currentStream.id]);
				//Set reference to active stream
				this.currentStream = stream;
				//Get reference for current time for setting timeline after source switch
				var currentTime = embedPlayer.getPlayerElementTime();
				//Check if stream ended, and ignore current time data if so
				if (this.streamEnded) {
					currentTime = 0;
				}
				//Save current autoplay state to return it after switching
				var origAutoplay = embedPlayer.autoplay;
				//When switching stream always start playing
				embedPlayer.autoplay = true;

				//Freeze scrubber and time labels to exhibit seamless transition between streams
				if (currentTime > 0) {
					embedPlayer.triggerHelper("freezeTimeIndicators", [true]);
				}
				embedPlayer.stopEventPropagation();

				var checkPlayerSourcesFunction = function (callback) {
					//Create source data from raw data
					var sources = kWidgetSupport.getEntryIdSourcesFromPlayerData(embedPlayer.kpartnerid, stream.data);
					//handle player data mappings to embedPlayer and check for errors
					kWidgetSupport.handlePlayerData(embedPlayer, stream.data);
					//Replace sources
					embedPlayer.replaceSources(sources);

					//Update player metadata and poster/thumbnail urls
					embedPlayer.kalturaPlayerMetaData = stream.data.meta;
					//Do not show poster on switch to avoid poster flashing
					mw.setConfig('EmbedPlayer.HidePosterOnStart', true);
					embedPlayer.triggerHelper('KalturaSupport_EntryDataReady', embedPlayer.kalturaPlayerMetaData);
					//Reinit the kCuePoints service
					if( (embedPlayer.rawCuePoints && embedPlayer.rawCuePoints.length > 0)) {
						embedPlayer.kCuePoints = new mw.KCuePoints( embedPlayer );
						embedPlayer.triggerHelper('KalturaSupport_CuePointsReady', [embedPlayer.rawCuePoints]);
					}
					callback();
				};

				var changeMediaCallback = function () {
					//Return autoplay state to original
					embedPlayer.autoplay = origAutoplay;
					//If player is still not playing then start playback
					if (!embedPlayer.isPlaying()){
						embedPlayer.play();
					}
					embedPlayer.restoreEventPropagation();
					// issue a seek
					if (currentTime > 0) {
						_this.bind("seeked", function () {
							_this.unbind("seeked");
							//Unfreeze scrubber and time labels after transition between streams
							embedPlayer.triggerHelper("freezeTimeIndicators", [false]);
							//emove the black screen afteer seek has ended
							embedPlayer.removeBlackScreen();
							//Return poster to allow display of poster on clip done
							mw.setConfig('EmbedPlayer.HidePosterOnStart', false);
							_this.streamChanging = false;
							embedPlayer.triggerHelper('onChangeStreamDone', [_this.currentStream.id]);
						});
						//Add black screen before seek to avoid flashing of video
						embedPlayer.addBlackScreen();
						embedPlayer.seek(currentTime, false);
					} else {
						//Return poster to allow display of poster on clip done
						mw.setConfig('EmbedPlayer.HidePosterOnStart', false);
						embedPlayer.triggerHelper( "onPlayerStateChange", ["play"] );
						embedPlayer.triggerHelper('onChangeStreamDone', [_this.currentStream.id]);
					}
				};
				embedPlayer.changeMedia(changeMediaCallback, checkPlayerSourcesFunction, false);
			} else {
				this.log("selected stream is already the active stream");
			}
		},
		toggleMenu: function () {
			if (this.isDisabled) {
				return;
			}
			this.getMenu().toggle();
		},
		getComponent: function () {
			var _this = this;
			if (!this.$el) {
				var $menu = $('<ul />');
				//TODO: need icon from Shlomit!
				var $button = $('<button />')
					.addClass('btn icon-switchSource')
					.attr('title', gM('mwe-embedplayer-select_stream'))
					.click(function (e) {
						_this.toggleMenu();
					});
				this.setAccessibility($button, gM('mwe-embedplayer-select_stream'));
				this.$el = $('<div />')
					.addClass('dropup' + this.getCssClass())
					.append($button, $menu);
			}
			return this.$el;
		},
		getMenu: function () {
			if (!this.menu) {
				this.menu = new mw.KMenu(this.getComponent().find('ul'), {
					tabIndex: this.getBtn().attr('tabindex')
				});
			}
			return this.menu;
		},
		getBtn: function () {
			return this.getComponent().find('button');
		},
		onEnable: function () {
			this.isDisabled = false;
			this.updateTooltip(gM('mwe-embedplayer-select_stream'));
			this.getBtn().removeClass('disabled');
		},
		onDisable: function () {
			this.isDisabled = true;
			this.updateTooltip(gM('mwe-embedplayer-switch_stream'));
			this.getComponent().removeClass('open');
			this.getBtn().addClass('disabled');
		}
	}));

})(window.mw, window.jQuery, kWidget);