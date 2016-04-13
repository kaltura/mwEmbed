(function (mw, $, kWidget) {
	"use strict";

	mw.PluginManager.add('audioSelector', mw.KBaseComponent.extend({

		defaultConfig: {
			"parent": "controlsContainer",
			"order": 61,
			"displayImportance": 'low',
			"align": "right",
			"iconClass": "icon-audio",
			"showTooltip": true,
			"labelWidthPercentage": 33,
			"defaultStream": -1, // -1 is auto
			"maxNumOfStream": 4,
			"enableKeyboardShortcuts": true,
			"keyboardShortcutsMap": {
				"nextStream": 221,   // Add ] Sign for next stream
				"prevStream": 219,   // Add [ Sigh for previous stream
				"defaultStream": 220 // Add \ Sigh for default stream
			}
		},

		isDisabled: false,
		streams: [],
		streamsReady: false,
		streamEnded: false,

		setup: function () {
			this.addBindings();
			var defaultTrack = this.getConfig('defaultStream');
			if (defaultTrack > -1) {
				this.getPlayer().audioTrack = {
					defaultTrack: this.getConfig('defaultStream')
				};
			}
		},
		destroy: function () {
			this._super();
			this.getComponent().remove();
		},
		addBindings: function () {
			var _this = this;

			this.bind('playerReady', function () {
				if (!_this.streamsReady) {
					_this.onDisable();
					_this.getPlayer().triggerHelper("updatePropertyEvent",{"plugin": _this.pluginName, "property": "sources", "items": [{'label':gM("mwe-timedtext-no-audio"),'value':gM("mwe-timedtext-no-audio")}], "selectedItem": gM("mwe-timedtext-no-audio")});
				}
			});

			this.bind( 'audioTracksReceived' ,function(e,data){
				if ( data.languages && data.languages.length > 0 ) {
					var tracks = data.languages;
					_this.streams = tracks;
					_this.setStream(_this.getDefaultStream());
					_this.getComponent().find("ul").show();
					_this.buildMenu();
					_this.streamsReady = true;
					_this.onEnable();
				}
			});

			this.bind('audioTrackIndexChanged', function (e, arg) {
				_this.externalSetStream(arg);
			});

			if (this.getConfig('enableKeyboardShortcuts')) {
				this.bind('addKeyBindCallback', function (e, addKeyCallback) {
					_this.addKeyboardShortcuts(addKeyCallback);
				});
			}

			this.embedPlayer.bindHelper("propertyChangedEvent", function(event, data){
				if ( data.plugin === _this.pluginName ){
					if ( data.property === "sources" ){
						_this.getMenu().$el.find("li a")[data.value].click();
					}
				}
			});
		},


		addKeyboardShortcuts: function (addKeyCallback) {
			var _this = this;
			// Add ] Sign for next stream
			addKeyCallback(this.getConfig("keyboardShortcutsMap").nextStream, function () {
				_this.setStream(_this.getNextStream());
			});
			// Add [ Sigh for previous stream
			addKeyCallback(this.getConfig("keyboardShortcutsMap").prevStream, function () {
				_this.setStream(_this.getPrevStream());
			});
			// Add \ Sigh for default stream
			addKeyCallback(this.getConfig("keyboardShortcutsMap" ).defaultStream, function () {
				_this.setStream(_this.getDefaultStream());
			});
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
			return this.streams[(this.getConfig('defaultStream'))];
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
			var items = [];
			$.each(this.streams, function (streamIndex, stream) {
				_this.addStreamToMenu(streamIndex, stream);
				items.push({'label':stream.label, 'value':stream.label});
			});
			var actualWidth = this.getMenu().$el.width();
			var labelWidthPercentage = parseInt(this.getConfig("labelWidthPercentage")) / 100;
			var labelWidth = this.getPlayer().getWidth() * labelWidthPercentage;
			if (actualWidth > labelWidth) {
				this.getMenu().$el.find('a').width(labelWidth);
			}
			this.getMenu().setActive({'key': 'id', 'val': this.getCurrentStreamIndex()});
			// dispatch event to be used by a master plugin if defined
			this.getPlayer().triggerHelper("updatePropertyEvent",{"plugin": this.pluginName, "property": "sources", "items": items, "selectedItem": this.getMenu().$el.find('.active a').text()});

		},
		addStreamToMenu: function (id, stream) {
			var _this = this;
			var active = (this.getCurrentStreamIndex() == id);
			var streamName = stream.label;
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
			var stream = this.streams[id.index];
			if (stream) {
				this.setStream(stream);
			} else {
				this.log("Error - invalid stream id");
			}
		},
		setStream: function (stream) {
			if (this.currentStream !== stream ) {
				this.currentStream = stream;
				this.embedPlayer.triggerHelper('switchAudioTrack', {index: stream.index});
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
				var $menu = $('<ul />').hide();
				//TODO: need icon from Shlomit!
				var $button = $('<button />')
					.addClass('btn icon-audio')
					.attr('title', gM('mwe-embedplayer-select_audio'))
					.click(function (e) {
						_this.toggleMenu();
					});
				this.setAccessibility($button, gM('mwe-embedplayer-select_audio'));
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
			this.updateTooltip(gM('mwe-embedplayer-select_audio'));
			this.getBtn().removeClass('disabled');
		},
		onDisable: function () {
			this.isDisabled = true;
			this.updateTooltip(gM('mwe-embedplayer-select_audio'));
			this.getComponent().removeClass('open');
			this.getBtn().addClass('disabled');
		}
	}));

})(window.mw, window.jQuery, kWidget);